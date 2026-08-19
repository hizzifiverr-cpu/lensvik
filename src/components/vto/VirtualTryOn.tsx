"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, RefreshCcw, X, Pause, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface VirtualTryOnProps {
    isOpen: boolean;
    onClose: () => void;
    productName?: string;
    productImage?: string;
}

// ── 1D Kalman Filter ──
class KalmanFilter {
    private x: number;
    private p: number;
    private q: number;
    private r: number;

    constructor(init: number, processNoise = 0.002, measurementNoise = 0.08) {
        this.x = init;
        this.p = 1;
        this.q = processNoise;
        this.r = measurementNoise;
    }

    update(z: number): number {
        this.p += this.q;
        const k = this.p / (this.p + this.r);
        this.x += k * (z - this.x);
        this.p *= (1 - k);
        return this.x;
    }

    reset(v: number) { this.x = v; this.p = 1; }
}

// ── Pose state for the glasses ──
interface GlassesPose {
    bridgeX: number;       // Nose bridge center X (pixels)
    bridgeY: number;       // Nose bridge center Y (pixels)
    rollAngle: number;     // Head roll in radians
    faceWidth: number;     // Zygomatic width (pixels) - primary scale reference
    yawDeg: number;        // For perspective skew
    pitchDeg: number;      // For vertical offset compensation
    leftIrisX: number;     // For precise PD alignment
    leftIrisY: number;
    rightIrisX: number;
    rightIrisY: number;
    timestamp: number;
}

export function VirtualTryOn({ isOpen, onClose, productName = 'Glasses', productImage }: VirtualTryOnProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const backBufferRef = useRef<HTMLCanvasElement | null>(null);
    const glassesImageRef = useRef<HTMLImageElement | null>(null);
    const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('Initializing...');
    const [fps, setFps] = useState(0);

    const streamRef = useRef<MediaStream | null>(null);
    const faceLandmarkerRef = useRef<any>(null);
    const animationRef = useRef<number>(0);

    // Kalman filters for each pose parameter
    const filtersRef = useRef<{
        bridgeX: KalmanFilter;
        bridgeY: KalmanFilter;
        roll: KalmanFilter;
        faceWidth: KalmanFilter;
        yaw: KalmanFilter;
        pitch: KalmanFilter;
        lIrisX: KalmanFilter; lIrisY: KalmanFilter;
        rIrisX: KalmanFilter; rIrisY: KalmanFilter;
    } | null>(null);

    const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now() });
    const lastPoseRef = useRef<GlassesPose | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;

        // Initialize Kalman filters
        filtersRef.current = {
            bridgeX: new KalmanFilter(0, 0.003, 0.06),
            bridgeY: new KalmanFilter(0, 0.003, 0.06),
            roll: new KalmanFilter(0, 0.005, 0.02),
            faceWidth: new KalmanFilter(0, 0.002, 0.08),
            yaw: new KalmanFilter(0, 0.001, 0.05),
            pitch: new KalmanFilter(0, 0.001, 0.05),
            lIrisX: new KalmanFilter(0, 0.003, 0.06),
            lIrisY: new KalmanFilter(0, 0.003, 0.06),
            rIrisX: new KalmanFilter(0, 0.003, 0.06),
            rIrisY: new KalmanFilter(0, 0.003, 0.06),
        };

        const init = async () => {
            try {
                // Step 1: Load and process glasses image
                setLoadingStatus('Loading glasses...');
                if (productImage) {
                    try {
                        const isExternal = productImage.startsWith('http');
                        const imgSrc = isExternal
                            ? `/api/image-proxy?url=${encodeURIComponent(productImage)}`
                            : productImage;

                        const response = await fetch(imgSrc);
                        const blob = await response.blob();
                        const blobUrl = URL.createObjectURL(blob);

                        const img = new Image();
                        await new Promise<void>((resolve) => {
                            img.onload = () => {
                                glassesImageRef.current = img;

                                const tempCanvas = document.createElement('canvas');
                                tempCanvas.width = img.naturalWidth;
                                tempCanvas.height = img.naturalHeight;
                                const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

                                if (tempCtx) {
                                    tempCtx.drawImage(img, 0, 0);
                                    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                                    const data = imageData.data;
                                    const w = tempCanvas.width;
                                    const h = tempCanvas.height;

                                    // ── PASS 1: Strict flood-fill from edges ──────────────────────────────
                                    // Only removes near-PURE-WHITE pixels (threshold=245).
                                    // This is strict enough that grey/silver frame rims (≈200 RGB)
                                    // will NEVER be classified as background, so the flood-fill
                                    // cannot cross the top rim of light-coloured frames.

                                    const STRICT_BG = 245;
                                    const visited = new Uint8Array(w * h);

                                    const isStrictBackground = (byteIdx: number) => {
                                        const r = data[byteIdx], g = data[byteIdx + 1], b = data[byteIdx + 2];
                                        const max = Math.max(r, g, b);
                                        const min = Math.min(r, g, b);
                                        const sat = max === 0 ? 0 : (max - min) / max;
                                        // Near-pure-white AND essentially unsaturated
                                        return max > STRICT_BG && sat < 0.12;
                                    };

                                    const queue: number[] = [];
                                    for (let x = 0; x < w; x++) {
                                        const topPx = x;
                                        if (!visited[topPx] && isStrictBackground(topPx * 4)) { visited[topPx] = 1; queue.push(topPx); }
                                        const botPx = (h - 1) * w + x;
                                        if (!visited[botPx] && isStrictBackground(botPx * 4)) { visited[botPx] = 1; queue.push(botPx); }
                                    }
                                    for (let y = 0; y < h; y++) {
                                        const leftPx = y * w;
                                        if (!visited[leftPx] && isStrictBackground(leftPx * 4)) { visited[leftPx] = 1; queue.push(leftPx); }
                                        const rightPx = y * w + (w - 1);
                                        if (!visited[rightPx] && isStrictBackground(rightPx * 4)) { visited[rightPx] = 1; queue.push(rightPx); }
                                    }

                                    while (queue.length > 0) {
                                        const p = queue.pop()!;
                                        data[p * 4 + 3] = 0;
                                        const px = p % w, py = Math.floor(p / w);
                                        for (const [nx, ny] of [[px+1,py],[px-1,py],[px,py+1],[px,py-1]] as [number,number][]) {
                                            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                                                const nIdx = ny * w + nx;
                                                if (!visited[nIdx] && isStrictBackground(nIdx * 4)) {
                                                    visited[nIdx] = 1;
                                                    queue.push(nIdx);
                                                }
                                            }
                                        }
                                    }

                                    // ── PASS 2: Fringe-only cleanup ───────────────────────────────────────
                                    // After the strict fill there may be leftover anti-aliasing pixels
                                    // at the border of the frame (near-white but not pure white).
                                    // We remove a pixel only if it is light-ish AND has 3+ transparent
                                    // neighbours — meaning it is a true edge fringe, not a frame element.
                                    // A frame pixel that is surrounded by other frame pixels will never
                                    // have 3 transparent neighbours, so it is always preserved.

                                    const FRINGE_THRESHOLD = 230;
                                    for (let y = 1; y < h - 1; y++) {
                                        for (let x = 1; x < w - 1; x++) {
                                            const idx = y * w + x;
                                            if (data[idx * 4 + 3] === 0) continue; // already gone

                                            const r = data[idx * 4], g = data[idx * 4 + 1], b = data[idx * 4 + 2];
                                            const max = Math.max(r, g, b);
                                            const min = Math.min(r, g, b);
                                            const sat = max === 0 ? 0 : (max - min) / max;

                                            if (max > FRINGE_THRESHOLD && sat < 0.20) {
                                                // Count how many of the 4 cardinal neighbours are transparent
                                                let transparent = 0;
                                                if (data[((y-1)*w+x  )*4+3] === 0) transparent++;
                                                if (data[((y+1)*w+x  )*4+3] === 0) transparent++;
                                                if (data[(y*w+(x-1)  )*4+3] === 0) transparent++;
                                                if (data[(y*w+(x+1)  )*4+3] === 0) transparent++;
                                                // Only remove if surrounded on 3+ sides — true fringe
                                                if (transparent >= 3) data[idx * 4 + 3] = 0;
                                            }
                                        }
                                    }

                                    // ── Trim narrow side slivers ──────────────────────────────────────────
                                    const severWidth = Math.floor(w * 0.025);
                                    for (let y = 0; y < h; y++) {
                                        for (let x = 0; x < severWidth; x++) {
                                            data[(y * w + x) * 4 + 3] = 0;
                                            data[(y * w + (w - 1 - x)) * 4 + 3] = 0;
                                        }
                                    }

                                    // ── PASS 3: Remove enclosed lens-interior white ────────────────────────
                                    // The flood-fill from the outside cannot cross the closed frame boundary,
                                    // so the pure-white area inside each lens still appears solid white.
                                    // Fix: global scan — remove any remaining opaque pixel that is
                                    // near-pure-white (> 245 brightness, < 8% saturation).
                                    // Product-photo backgrounds are essentially RGB(255,255,255).
                                    // Real frame material — even silver or white frames — has genuine
                                    // surface texture and slight colour variation, so its pixels will
                                    // not all exceed 245 uniformly. This makes the removal safe.
                                    for (let i = 0; i < w * h; i++) {
                                        if (data[i * 4 + 3] === 0) continue; // already transparent
                                        const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
                                        const max = Math.max(r, g, b);
                                        const min = Math.min(r, g, b);
                                        const sat = max === 0 ? 0 : (max - min) / max;
                                        if (max > 245 && sat < 0.08) {
                                            data[i * 4 + 3] = 0;
                                        }
                                    }

                                    tempCtx.putImageData(imageData, 0, 0);
                                    processedCanvasRef.current = tempCanvas;
                                }
                                resolve();
                            };
                            img.onerror = () => resolve();
                            img.src = blobUrl;
                        });
                    } catch (imgErr) {
                        console.error('Image fetch failed:', imgErr);
                    }
                }

                // Step 2: Camera
                setLoadingStatus('Requesting camera...');
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user', frameRate: { ideal: 60, min: 30 } }
                });

                if (!isMounted) { stream.getTracks().forEach(t => t.stop()); return; }
                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await new Promise<void>((resolve) => {
                        if (videoRef.current) {
                            videoRef.current.onloadedmetadata = () => {
                                videoRef.current?.play();
                                resolve();
                            };
                        }
                    });
                }

                // Step 3: MediaPipe
                setLoadingStatus('Initializing AI tracking...');
                const vision = await import('@mediapipe/tasks-vision');
                const { FaceLandmarker, FilesetResolver } = vision;

                const filesetResolver = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm"
                );

                try {
                    faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
                        baseOptions: {
                            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                            delegate: "GPU"
                        },
                        outputFaceBlendshapes: false,
                        runningMode: "VIDEO",
                        numFaces: 1,
                        minFaceDetectionConfidence: 0.5,
                        minFacePresenceConfidence: 0.5,
                        minTrackingConfidence: 0.5
                    });
                } catch {
                    faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
                        baseOptions: {
                            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                            delegate: "CPU"
                        },
                        outputFaceBlendshapes: false,
                        runningMode: "VIDEO",
                        numFaces: 1
                    });
                }

                // Create back buffer
                if (canvasRef.current && videoRef.current) {
                    const vw = videoRef.current.videoWidth || 1280;
                    const vh = videoRef.current.videoHeight || 720;
                    canvasRef.current.width = vw;
                    canvasRef.current.height = vh;
                    backBufferRef.current = document.createElement('canvas');
                    backBufferRef.current.width = vw;
                    backBufferRef.current.height = vh;
                }

                if (isMounted) {
                    setIsLoaded(true);
                    startDetection();
                }

            } catch (err: any) {
                console.error('VTO init error:', err);
                if (isMounted) setError(err.message || 'Failed to initialize.');
            }
        };

        const startDetection = () => {
            const faceLandmarker = faceLandmarkerRef.current;
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const backBuffer = backBufferRef.current;
            if (!video || !canvas || !backBuffer || !faceLandmarker) return;

            const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
            const backCtx = backBuffer.getContext('2d', { alpha: false });
            if (!ctx || !backCtx) return;

            let lastVideoTime = -1;
            let failCount = 0;
            const MAX_FAIL = 15;

            const renderLoop = () => {
                if (!isMounted) return;

                const now = performance.now();

                // FPS
                fpsCounterRef.current.frames++;
                if (now - fpsCounterRef.current.lastTime >= 1000) {
                    setFps(fpsCounterRef.current.frames);
                    fpsCounterRef.current.frames = 0;
                    fpsCounterRef.current.lastTime = now;
                }

                if (isPaused) {
                    animationRef.current = requestAnimationFrame(renderLoop);
                    return;
                }

                // Draw mirrored video
                backCtx.save();
                backCtx.scale(-1, 1);
                backCtx.drawImage(video, -backBuffer.width, 0, backBuffer.width, backBuffer.height);
                backCtx.restore();

                let pose: GlassesPose | null = null;

                if (video.currentTime !== lastVideoTime) {
                    lastVideoTime = video.currentTime;

                    try {
                        const results = faceLandmarker.detectForVideo(video, now);

                        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                            setIsTracking(true);
                            failCount = 0;

                            const lm = results.faceLandmarks[0];
                            const W = backBuffer.width;
                            const H = backBuffer.height;

                            // Mirror helper
                            const px = (idx: number) => (1 - lm[idx].x) * W;
                            const py = (idx: number) => lm[idx].y * H;

                            // ── Iris landmarks ──
                            const hasIris = lm.length >= 478;
                            const lIrisRawX = hasIris ? px(468) : px(133);
                            const lIrisRawY = hasIris ? py(468) : py(133);
                            const rIrisRawX = hasIris ? px(473) : px(362);
                            const rIrisRawY = hasIris ? py(473) : py(362);

                            // Iris midpoint X = horizontal center between eyes
                            const irisMidX = (lIrisRawX + rIrisRawX) / 2;

                            // Upper eyelid landmarks (159=left, 386=right)
                            // This is where the top rim of glasses should align
                            const upperLidY = (py(159) + py(386)) / 2;
                            // Iris midpoint Y
                            const irisMidY = (lIrisRawY + rIrisRawY) / 2;

                            // ── Anchor ──
                            // X: centered between irises
                            // Y: midpoint between upper eyelid and iris center
                            //    (frame top at eyelash, lenses centered on eyes)
                            const anchorRawX = irisMidX;
                            const anchorRawY = (upperLidY + irisMidY) / 2;

                            // ── Face width for scale (zygomatic arch: 234 ↔ 454) ──
                            const faceWidthRaw = Math.sqrt(
                                (px(454) - px(234)) ** 2 + (py(454) - py(234)) ** 2
                            );

                            // ── Roll angle from eye outer corners ──
                            const leftEyeOuter = { x: px(33), y: py(33) };
                            const rightEyeOuter = { x: px(263), y: py(263) };
                            const rollRaw = Math.atan2(
                                rightEyeOuter.y - leftEyeOuter.y,
                                rightEyeOuter.x - leftEyeOuter.x
                            );

                            // ── Yaw estimation ──
                            const noseTip = { x: px(1), y: py(1) };
                            const eyeCenter = { x: (px(33) + px(263)) / 2, y: (py(33) + py(263)) / 2 };
                            const iod = Math.sqrt((px(33) - px(263)) ** 2 + (py(33) - py(263)) ** 2);
                            const yawRaw = Math.atan2(noseTip.x - eyeCenter.x, iod * 0.35) * (180 / Math.PI);

                            // ── Pitch estimation ──
                            const forehead = { x: px(10), y: py(10) };
                            const chin = { x: px(152), y: py(152) };
                            const faceH = Math.sqrt((forehead.x - chin.x) ** 2 + (forehead.y - chin.y) ** 2);
                            const expectedNoseY = (forehead.y + chin.y) / 2.1;
                            const pitchRaw = Math.atan2(noseTip.y - expectedNoseY, faceH * 0.35) * (180 / Math.PI);

                            // ── Apply Kalman filtering ──
                            const f = filtersRef.current!;
                            pose = {
                                bridgeX: f.bridgeX.update(anchorRawX),
                                bridgeY: f.bridgeY.update(anchorRawY),
                                rollAngle: f.roll.update(rollRaw),
                                faceWidth: f.faceWidth.update(faceWidthRaw),
                                yawDeg: f.yaw.update(yawRaw),
                                pitchDeg: f.pitch.update(pitchRaw),
                                leftIrisX: f.lIrisX.update(lIrisRawX),
                                leftIrisY: f.lIrisY.update(lIrisRawY),
                                rightIrisX: f.rIrisX.update(rIrisRawX),
                                rightIrisY: f.rIrisY.update(rIrisRawY),
                                timestamp: now,
                            };

                            lastPoseRef.current = pose;
                        } else {
                            failCount++;
                            if (failCount > MAX_FAIL) setIsTracking(false);
                            pose = lastPoseRef.current;
                        }
                    } catch {
                        failCount++;
                        pose = lastPoseRef.current;
                    }
                } else {
                    pose = lastPoseRef.current;
                }

                // ── Render Glasses ──
                if (pose) {
                    const drawSource = processedCanvasRef.current || glassesImageRef.current;

                    if (drawSource && (drawSource instanceof HTMLCanvasElement ||
                        (drawSource instanceof HTMLImageElement && drawSource.naturalWidth > 0))) {

                        const srcW = drawSource instanceof HTMLCanvasElement ? drawSource.width : drawSource.naturalWidth;
                        const srcH = drawSource instanceof HTMLCanvasElement ? drawSource.height : drawSource.naturalHeight;
                        const aspectRatio = srcH / srcW;

                        // Scale: glasses width ~105% of face width
                        const glassesW = pose.faceWidth * 1.05;
                        const glassesH = glassesW * aspectRatio;

                        backCtx.save();
                        backCtx.translate(pose.bridgeX, pose.bridgeY);
                        backCtx.rotate(pose.rollAngle + Math.PI);

                        // Shadow
                        backCtx.shadowColor = 'rgba(0, 0, 0, 0.2)';
                        backCtx.shadowBlur = 8;
                        backCtx.shadowOffsetY = 3;
                        backCtx.shadowOffsetX = pose.yawDeg * 0.2;

                        backCtx.drawImage(
                            drawSource,
                            -glassesW / 2,
                            -glassesH / 2,
                            glassesW,
                            glassesH
                        );

                        backCtx.restore();
                    }
                }

                // Blit back buffer to front
                ctx.drawImage(backBuffer, 0, 0);

                animationRef.current = requestAnimationFrame(renderLoop);
            };

            renderLoop();
        };

        init();

        return () => {
            isMounted = false;
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }
            if (faceLandmarkerRef.current) {
                faceLandmarkerRef.current.close();
                faceLandmarkerRef.current = null;
            }
            setIsLoaded(false);
            setIsTracking(false);
        };
    }, [isOpen, isPaused, productImage]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[900px] w-full h-[100dvh] sm:h-auto max-w-none sm:rounded-2xl p-0 overflow-hidden bg-black border-none flex flex-col">
                <DialogTitle className="sr-only">Virtual Try-On - {productName}</DialogTitle>
                <DialogDescription className="sr-only">
                    Virtually try on {productName} using your camera with state-of-the-art AI tracking.
                </DialogDescription>

                <div className="relative flex-1 w-full bg-black overflow-hidden sm:min-h-[500px]">
                    {!isLoaded && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-30">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                            <p className="text-sm md:text-lg font-bold text-white uppercase tracking-widest">{loadingStatus}</p>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-30 p-4 md:p-8 text-center">
                            <Camera className="w-10 h-10 md:w-12 md:h-12 text-red-500 mb-4" />
                            <h3 className="text-lg md:text-xl font-bold text-white mb-2">Camera Error</h3>
                            <p className="text-zinc-400 mb-6 text-xs md:text-sm">{error}</p>
                            <Button onClick={() => window.location.reload()} variant="outline" className="text-white border-white/20">
                                <RefreshCcw className="w-4 h-4 mr-2" /> Retry
                            </Button>
                        </div>
                    )}

                    <video ref={videoRef} className="hidden" playsInline muted />

                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {isLoaded && (
                        <>
                            {/* Disclaimer Overlay */}
                            <div className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2 z-40 w-[85%] max-w-md">
                                <div className="bg-black/40 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl text-center">
                                    <p className="text-[10px] md:text-xs text-white/90 font-medium tracking-tight leading-relaxed">
                                        <span className="text-primary font-bold mr-1">NOTE:</span>
                                        This feature is for trial purposes only and does not represent the actual size.
                                    </p>
                                </div>
                            </div>

                            <div className="absolute top-4 left-4 z-40">
                                <div className="flex items-center gap-1.5 md:gap-3 bg-black/70 backdrop-blur-md px-3 py-2 rounded-full border border-white/10">
                                    <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 animate-pulse'}`} />
                                    <span className="text-[10px] md:text-[11px] font-bold text-white uppercase tracking-wider">
                                        {isPaused ? 'Paused' : isTracking ? 'AI Tracking' : 'Scanning...'}
                                    </span>
                                    <span className="hidden md:inline text-[9px] text-zinc-400 ml-2">{fps} FPS</span>
                                </div>
                            </div>

                            <div className="absolute bottom-10 md:bottom-8 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 z-40">
                                <Button
                                    onClick={() => setIsPaused(p => !p)}
                                    className="bg-black/70 text-white hover:bg-white/10 backdrop-blur-md rounded-full h-14 w-14 md:h-12 md:w-12 border border-white/10 shadow-2xl"
                                >
                                    {isPaused ? <Play className="w-6 h-6 md:w-5 md:h-5" /> : <Pause className="w-6 h-6 md:w-5 md:h-5" />}
                                </Button>
                            </div>

                            {productImage && (
                                <div className="hidden md:block absolute top-4 right-16 z-40">
                                    <div className="bg-black/70 backdrop-blur-md p-2 rounded-xl border border-white/10">
                                        <img
                                            src={productImage}
                                            alt={productName}
                                            className="w-16 h-10 object-contain brightness-110"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <Button
                        onClick={onClose}
                        size="icon"
                        variant="ghost"
                        className="absolute top-4 right-4 z-40 bg-black/70 text-white hover:bg-white/10 backdrop-blur-md rounded-full w-12 h-12 md:w-10 md:h-10 border border-white/10 shadow-xl"
                    >
                        <X className="w-6 h-6 md:w-5 md:h-5" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
