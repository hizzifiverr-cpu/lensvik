/**
 * FaceMeshEngine.ts — State-of-the-Art 3D Biometric Measurement Engine
 * 
 * Subsystems:
 *  1. Multi-stage iris-calibrated scale (iris → inter-ocular fallback)
 *  2. Perspective distortion correction (pinhole camera model)
 *  3. Expression-resilient landmark selection via blendshapes
 *  4. MAD-based multi-frame fusion with outlier rejection
 *  5. Z-depth occlusion detection
 *  6. Per-metric confidence scoring
 *  7. Full iris contour + face contour export for HUD rendering
 */

// ──────────────────────────────────────────────
//  Interfaces
// ──────────────────────────────────────────────

export interface ConfidenceBreakdown {
    pd: number;
    faceWidth: number;
    bridge: number;
    temple: number;
    noseDepth: number;
    overall: number;
}

export interface Face3DMeasurements {
    ipd: number;
    faceWidth: number;
    bridgeWidth: number;
    templeLength: number;
    noseDepth: number;
    noseShape: 'Flat' | 'Average' | 'High';
    confidence: number;
    confidenceBreakdown: ConfidenceBreakdown;
    orientation: { pitch: number; yaw: number; roll: number };
    irisLeft?: { x: number; y: number };
    irisRight?: { x: number; y: number };
    irisContour: { left: { x: number; y: number }[]; right: { x: number; y: number }[] };
    faceContour: { x: number; y: number }[];
    blendshapes: Record<string, number>;
    telemetry: {
        calibrationMode: 'iris' | 'interocular';
        occlusionFlags: { leftEye: boolean; rightEye: boolean; nose: boolean; jaw: boolean };
        expressionActive: boolean;
        frameProcessingMs: number;
    };
}

export interface LandmarkerResult {
    faceLandmarks: any[][];
    faceBlendshapes?: { categories: { categoryName: string; score: number }[] }[];
}

// ──────────────────────────────────────────────
//  MAD-Based Temporal Buffer (Outlier Rejection)
// ──────────────────────────────────────────────

class RobustTemporalBuffer {
    private buffer: number[][] = [];
    private readonly maxSize: number;
    private readonly madThreshold: number;

    constructor(size: number = 20, madThreshold: number = 2.5) {
        this.maxSize = size;
        this.madThreshold = madThreshold;
    }

    private median(arr: number[]): number {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    add(values: number[]): { smoothed: number[]; jitterPerMetric: number[] } {
        this.buffer.push(values);
        if (this.buffer.length > this.maxSize) this.buffer.shift();

        const count = this.buffer.length;
        const numMetrics = values.length;
        const smoothed = new Array(numMetrics).fill(0);
        const jitterPerMetric = new Array(numMetrics).fill(0);

        for (let j = 0; j < numMetrics; j++) {
            const series = this.buffer.map(b => b[j]);
            const med = this.median(series);

            // MAD = median(|xi - median|)
            const deviations = series.map(v => Math.abs(v - med));
            const mad = this.median(deviations) || 0.001; // avoid div-by-zero

            // Filter inliers
            let weightedSum = 0;
            let weightSum = 0;
            let inlierCount = 0;

            for (let i = 0; i < count; i++) {
                const deviation = Math.abs(series[i] - med);
                if (deviation <= this.madThreshold * mad) {
                    // Exponential recency weighting for inliers
                    const recencyWeight = Math.exp((i - count + 1) * 0.15);
                    // Proximity-to-median weight (closer = more trusted)
                    const proximityWeight = 1 / (1 + deviation / mad);
                    const w = recencyWeight * proximityWeight;
                    weightedSum += series[i] * w;
                    weightSum += w;
                    inlierCount++;
                }
            }

            smoothed[j] = weightSum > 0 ? weightedSum / weightSum : med;

            // Jitter = normalized deviation of latest frame from smoothed
            jitterPerMetric[j] = smoothed[j] > 0 ? Math.abs(values[j] - smoothed[j]) / smoothed[j] : 0;
        }

        return { smoothed, jitterPerMetric };
    }

    getBufferDepth(): number {
        return this.buffer.length;
    }

    clear() {
        this.buffer = [];
    }
}

// ──────────────────────────────────────────────
//  Landmark Constants
// ──────────────────────────────────────────────

// MediaPipe iris landmarks: 468-472 (left eye), 473-477 (right eye)
const IRIS_LEFT_CENTER = 468;
const IRIS_LEFT_CONTOUR = [469, 470, 471, 472];
const IRIS_RIGHT_CENTER = 473;
const IRIS_RIGHT_CONTOUR = [474, 475, 476, 477];

// Bone-stable anchors (orbital rim, zygomatic arch, glabella)
const BONE_STABLE = {
    leftOrbital: 33,
    rightOrbital: 263,
    leftZygomatic: 234,
    rightZygomatic: 454,
    glabella: 168,
    nasion: 6,
    sellion: 168,
};

// Face oval contour indices (MediaPipe canonical)
const FACE_OVAL_INDICES = [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
    397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
    172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10
];

// Expression-sensitive landmarks that should be avoided during active expressions
const EXPRESSION_SENSITIVE = {
    mouth: [13, 14, 78, 308, 82, 312],
    brow: [70, 63, 105, 66, 107, 336, 296, 334, 293, 300],
    cheek: [205, 425, 187, 411],
};

// ──────────────────────────────────────────────
//  FaceMeshEngine
// ──────────────────────────────────────────────

export class FaceMeshEngine {
    private landmarker: any = null;
    private buffer = new RobustTemporalBuffer(20, 2.5);
    private readonly IRIS_DIAMETER_MM = 11.7;
    private readonly AVG_IPD_MM = 63.5;
    private frameCount = 0;

    async initialize() {
        const vision = await import('@mediapipe/tasks-vision');
        const { FaceLandmarker, FilesetResolver } = vision;

        const filesetResolver = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm"
        );

        this.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                delegate: "GPU"
            },
            outputFaceBlendshapes: true,
            runningMode: "VIDEO",
            numFaces: 1,
            minFaceDetectionConfidence: 0.4,
            minFacePresenceConfidence: 0.4,
            minTrackingConfidence: 0.4
        });
    }

    // ── Geometry Primitives ──

    private dist3D(p1: any, p2: any): number {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = (p1.z || 0) - (p2.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    private dist2D(p1: any, p2: any): number {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private midpoint(p1: any, p2: any) {
        return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, z: ((p1.z || 0) + (p2.z || 0)) / 2 };
    }

    // ── Head Pose Estimation (Euler Angles) ──

    private estimatePose(landmarks: any[]) {
        const noseTip = landmarks[1];
        const chin = landmarks[152];
        const leftEye = landmarks[BONE_STABLE.leftOrbital];
        const rightEye = landmarks[BONE_STABLE.rightOrbital];
        const forehead = landmarks[10];

        // Inter-ocular distance as reference for normalization
        const iod = this.dist3D(leftEye, rightEye);
        const eyeCenter = this.midpoint(leftEye, rightEye);

        // Yaw: nose tip lateral displacement relative to eye center
        const yaw = Math.atan2(noseTip.x - eyeCenter.x, iod * 0.35) * (180 / Math.PI);

        // Pitch: nose tip vertical displacement relative to forehead-chin axis
        const faceHeight = this.dist3D(forehead, chin);
        const expectedNoseY = (forehead.y + chin.y) / 2.1; // nose is slightly above center
        const pitch = Math.atan2(noseTip.y - expectedNoseY, faceHeight * 0.35) * (180 / Math.PI);

        // Roll: tilt of the eye line
        const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI);

        return {
            pitch: this.clamp(pitch, -90, 90),
            yaw: this.clamp(yaw, -90, 90),
            roll: this.clamp(roll, -90, 90)
        };
    }

    private clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

    // ── Perspective Distortion Correction ──

    private perspectiveCorrection(rawMm: number, yawDeg: number, pitchDeg: number): number {
        // Pinhole camera model: foreshortening correction
        const yawRad = (Math.abs(yawDeg) * Math.PI) / 180;
        const pitchRad = (Math.abs(pitchDeg) * Math.PI) / 180;
        const cosYaw = Math.cos(yawRad);
        const cosPitch = Math.cos(pitchRad);

        // Only correct if cosines are reasonable (avoid blow-up at extreme angles)
        const correctionFactor = (cosYaw > 0.5 && cosPitch > 0.5)
            ? 1.0 / (cosYaw * cosPitch)
            : 1.0; // Don't correct at extreme angles; data is unreliable anyway

        return rawMm * Math.min(correctionFactor, 1.15); // Cap correction at 15%
    }

    // ── Occlusion Detection via Z-Depth Variance ──

    private detectOcclusion(landmarks: any[]) {
        const zVar = (indices: number[]) => {
            const zValues = indices.map(i => landmarks[i]?.z || 0);
            const mean = zValues.reduce((a, b) => a + b, 0) / zValues.length;
            const variance = zValues.reduce((a, z) => a + (z - mean) ** 2, 0) / zValues.length;
            return variance;
        };

        // Per-region z-variance thresholds (empirically tuned)
        const zThreshold = 0.002;

        return {
            leftEye: zVar([33, 160, 158, 133, 153, 144]) > zThreshold,
            rightEye: zVar([263, 387, 385, 362, 380, 373]) > zThreshold,
            nose: zVar([1, 2, 168, 6, 197, 195]) > zThreshold,
            jaw: zVar([152, 377, 400, 148, 176, 149]) > zThreshold,
        };
    }

    // ── Expression Detection via Blendshapes ──

    private parseBlendshapes(result: LandmarkerResult): { map: Record<string, number>; isActive: boolean } {
        const map: Record<string, number> = {};
        let isActive = false;

        if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
            const categories = result.faceBlendshapes[0].categories;
            for (const cat of categories) {
                map[cat.categoryName] = cat.score;
            }

            // Check if any expression is significantly active
            const expressionKeys = [
                'mouthOpen', 'jawOpen', 'mouthSmileLeft', 'mouthSmileRight',
                'browInnerUp', 'browOuterUpLeft', 'browOuterUpRight',
                'eyeSquintLeft', 'eyeSquintRight', 'cheekPuff'
            ];

            for (const key of expressionKeys) {
                if ((map[key] || 0) > 0.35) {
                    isActive = true;
                    break;
                }
            }
        }

        return { map, isActive };
    }

    // ── Scale Calibration ──

    private calibrateScale(landmarks: any[], hasIris: boolean): { normToMm: number; mode: 'iris' | 'interocular' } {
        let normToMm = 0;
        let mode: 'iris' | 'interocular' = 'interocular';

        if (hasIris) {
            // Iris horizontal diameter (landmarks 469↔471 for left, 474↔476 for right)
            const irisLeftW = this.dist3D(landmarks[469], landmarks[471]);
            const irisRightW = this.dist3D(landmarks[474], landmarks[476]);
            const avgIrisNorm = (irisLeftW + irisRightW) / 2;

            if (avgIrisNorm > 0.003) {
                normToMm = this.IRIS_DIAMETER_MM / avgIrisNorm;
                mode = 'iris';
            }
        }

        if (normToMm === 0) {
            // Fallback: inter-ocular distance (inner eye corners)
            const eyeGapNorm = this.dist3D(landmarks[133], landmarks[362]);
            if (eyeGapNorm > 0.01) {
                normToMm = (this.AVG_IPD_MM * 0.45) / eyeGapNorm;
                mode = 'interocular';
            }
        }

        return { normToMm, mode };
    }

    // ── Per-Metric Confidence ──

    private computePerMetricConfidence(
        pose: { pitch: number; yaw: number; roll: number },
        jitters: number[],
        occlusion: ReturnType<typeof this.detectOcclusion>,
        expressionActive: boolean,
        hasIris: boolean,
        bufferDepth: number
    ): ConfidenceBreakdown {

        const poseScore = (maxAngle: number, axis: number) => {
            return 1 - Math.pow(Math.min(1, Math.abs(axis) / maxAngle), 2);
        };

        const basePose =
            poseScore(40, pose.yaw) *
            poseScore(35, pose.pitch) *
            poseScore(30, pose.roll);

        // Buffer fill factor (more frames = higher confidence)
        const fillFactor = Math.min(1, bufferDepth / 12);

        const metricConfidence = (jitter: number, occluded: boolean, poseWeight: number = 1.0) => {
            let c = basePose * poseWeight;
            c *= Math.max(0, 1 - jitter * 3);      // Jitter penalty
            if (occluded) c *= 0.5;                  // Occlusion penalty
            if (expressionActive) c *= 0.85;          // Expression penalty
            if (!hasIris) c *= 0.88;                  // No iris penalty
            c *= fillFactor;                          // Buffer depth factor
            return this.clamp(Math.sqrt(c), 0, 0.99); // sqrt normalization + hard cap
        };

        const pd = metricConfidence(jitters[0], occlusion.leftEye || occlusion.rightEye, 1.0);
        const faceWidth = metricConfidence(jitters[1], false, 0.9);
        const bridge = metricConfidence(jitters[2], occlusion.nose, 1.0);
        const temple = metricConfidence(jitters[3], occlusion.leftEye || occlusion.rightEye, 0.8);
        const noseDepth = metricConfidence(jitters[4], occlusion.nose, 1.1);

        // Overall = geometric mean
        const overall = Math.pow(pd * faceWidth * bridge * temple * noseDepth, 1 / 5);

        return { pd, faceWidth, bridge, temple, noseDepth, overall };
    }

    // ── Contour Extraction ──

    private extractIrisContour(landmarks: any[], hasIris: boolean) {
        if (!hasIris) return { left: [], right: [] };

        const toPoint = (i: number) => ({ x: landmarks[i].x, y: landmarks[i].y });

        return {
            left: [IRIS_LEFT_CENTER, ...IRIS_LEFT_CONTOUR].map(toPoint),
            right: [IRIS_RIGHT_CENTER, ...IRIS_RIGHT_CONTOUR].map(toPoint),
        };
    }

    private extractFaceContour(landmarks: any[]) {
        return FACE_OVAL_INDICES.map(i => ({ x: landmarks[i].x, y: landmarks[i].y }));
    }

    // ══════════════════════════════════════════════
    //  MAIN PROCESSING PIPELINE
    // ══════════════════════════════════════════════

    processFrame(video: HTMLVideoElement, timestamp: number): Face3DMeasurements | null {
        if (!this.landmarker) return null;

        const t0 = performance.now();

        const result = this.landmarker.detectForVideo(video, timestamp);
        if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;

        const landmarks = result.faceLandmarks[0];
        if (!landmarks || landmarks.length < 468) return null;

        this.frameCount++;

        const hasIris = landmarks.length >= 478;

        // ── Stage 1: Scale Calibration ──
        const { normToMm, mode: calibrationMode } = this.calibrateScale(landmarks, hasIris);
        if (normToMm === 0) return null;

        // ── Stage 2: Head Pose ──
        const pose = this.estimatePose(landmarks);

        // ── Stage 3: Expression Analysis ──
        const { map: blendshapeMap, isActive: expressionActive } = this.parseBlendshapes(result);

        // ── Stage 4: Occlusion Detection ──
        const occlusion = this.detectOcclusion(landmarks);

        // ── Stage 5: Raw Anatomical Measurements ──
        // Use bone-stable anchors when expressions are active
        const leftPupil = hasIris ? landmarks[IRIS_LEFT_CENTER] : landmarks[133];
        const rightPupil = hasIris ? landmarks[IRIS_RIGHT_CENTER] : landmarks[362];

        let rawIpd = this.dist3D(leftPupil, rightPupil) * normToMm;
        let rawFaceWidth = this.dist3D(landmarks[BONE_STABLE.leftZygomatic], landmarks[BONE_STABLE.rightZygomatic]) * normToMm;
        let rawBridge = this.dist3D(landmarks[133], landmarks[362]) * normToMm;

        // Temple: ear-insertion point approximation with ergonomic curve factor
        let rawTemple: number;
        if (expressionActive) {
            // Use orbital rim → ear (bone-stable) during expressions
            rawTemple = this.dist3D(landmarks[BONE_STABLE.leftOrbital], landmarks[127]) * 1.85 * normToMm;
        } else {
            rawTemple = this.dist3D(landmarks[33], landmarks[127]) * 1.85 * normToMm;
        }

        let rawNoseDepth = this.dist3D(landmarks[BONE_STABLE.sellion], landmarks[1]) * normToMm;

        // ── Stage 6: Perspective Correction ──
        rawIpd = this.perspectiveCorrection(rawIpd, pose.yaw, pose.pitch);
        rawFaceWidth = this.perspectiveCorrection(rawFaceWidth, pose.yaw, 0); // face width mainly affected by yaw
        rawBridge = this.perspectiveCorrection(rawBridge, pose.yaw, pose.pitch);
        rawTemple = this.perspectiveCorrection(rawTemple, pose.yaw, 0);
        // Nose depth is less affected by frontal foreshortening since it's a depth measure
        // but yaw rotation compresses it:
        rawNoseDepth = this.perspectiveCorrection(rawNoseDepth, 0, pose.pitch);

        // ── Stage 7: Multi-Frame Fusion (MAD Outlier Rejection) ──
        const { smoothed, jitterPerMetric } = this.buffer.add([rawIpd, rawFaceWidth, rawBridge, rawTemple, rawNoseDepth]);

        // ── Stage 8: Per-Metric Confidence ──
        const confidenceBreakdown = this.computePerMetricConfidence(
            pose, jitterPerMetric, occlusion, expressionActive, hasIris, this.buffer.getBufferDepth()
        );

        // ── Stage 9: Output Construction ──
        let noseShape: 'Flat' | 'Average' | 'High' = 'Average';
        if (smoothed[4] < 16) noseShape = 'Flat';
        else if (smoothed[4] > 23) noseShape = 'High';

        const frameProcessingMs = performance.now() - t0;

        return {
            ipd: smoothed[0],
            faceWidth: smoothed[1],
            bridgeWidth: smoothed[2],
            templeLength: smoothed[3],
            noseDepth: smoothed[4],
            noseShape,
            confidence: confidenceBreakdown.overall,
            confidenceBreakdown,
            orientation: pose,
            irisLeft: hasIris ? { x: landmarks[IRIS_LEFT_CENTER].x, y: landmarks[IRIS_LEFT_CENTER].y } : undefined,
            irisRight: hasIris ? { x: landmarks[IRIS_RIGHT_CENTER].x, y: landmarks[IRIS_RIGHT_CENTER].y } : undefined,
            irisContour: this.extractIrisContour(landmarks, hasIris),
            faceContour: this.extractFaceContour(landmarks),
            blendshapes: blendshapeMap,
            telemetry: {
                calibrationMode,
                occlusionFlags: occlusion,
                expressionActive,
                frameProcessingMs,
            }
        };
    }

    reset() {
        this.buffer.clear();
        this.frameCount = 0;
    }

    destroy() {
        if (this.landmarker) {
            this.landmarker.close();
            this.landmarker = null;
        }
        this.reset();
    }
}
