"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, ChevronRight, ChevronLeft, Check, Info,
    ShieldCheck, Eye, Monitor, Star, Zap, Layers,
    MessageCircle, Volume2, VolumeX, Upload, ImageIcon, Loader2, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import Image from "next/image";

interface LensConfiguratorProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        _id: string;
        name: string;
        price: number;
        image: string;
        images?: string[];
    };
    color?: string;
    size?: string;
}


// ─── Data ──────────────────────────────────────────────────────────────────
const MAIN_CATEGORIES = [
    {
        id: "power",
        title: "With Power",
        subtitle: "Single vision · +ve, -ve, or Cylindrical",
        tag: "Most common",
        icon: Eye,
        color: "from-primary/10 to-slate-500/10",
        iconColor: "text-primary",
        dotColor: "bg-primary",
    },
    {
        id: "zero",
        title: "Zero Power",
        subtitle: "Blue-light blocking · Perfect for screens",
        tag: "BLU Screen",
        icon: Monitor,
        color: "from-emerald-500/10 to-teal-500/10",
        iconColor: "text-emerald-600",
        dotColor: "bg-emerald-500",
    },
    {
        id: "progressive",
        title: "Progressive / Bifocals",
        subtitle: "Two powers in one lens · Near & far",
        tag: "Premium",
        icon: Layers,
        color: "from-violet-500/10 to-purple-500/10",
        iconColor: "text-violet-600",
        dotColor: "bg-violet-500",
    },
    {
        id: "frame",
        title: "Frame Only",
        subtitle: "No lenses · Fashionable or non-prescription",
        tag: null,
        icon: Zap,
        color: "from-slate-100 to-slate-50",
        iconColor: "text-slate-400",
        dotColor: "bg-slate-300",
    },
];

const LENS_OPTIONS: Record<string, any[]> = {
    power: [
        {
            name: "Standard Lens",
            price: 500,
            description: "Scratch resistant · Basic daily use",
            features: ["Scratch resistant", "Basic use"],
            badge: null,
            accent: "#64748b",
        },
        {
            name: "Antiglare",
            price: 1200,
            description: "UV 400 · Double-side coating · Anti-reflection",
            features: ["Scratch resistant", "UV 400", "Double side coating", "Antiglare"],
            badge: "★ Popular",
            accent: "var(--primary)",
            recommended: true,
        },
        {
            name: "Lensvik Blu Screen",
            price: 1500,
            description: "Screen protection · Minimise eye strain",
            features: ["Screen protection", "Minimise eyestrain", "Scratch resistant"],
            badge: "Screen",
            accent: "var(--primary)",
        },
        {
            name: "Lensvik Blu Pro",
            price: 2200,
            description: "Advanced screen protection · Hydrophilic coat",
            features: ["Advanced screen protection", "Scratch & smudge resistant", "Hydrophilic coated"],
            badge: "Pro",
            accent: "var(--primary)",
        },
        {
            name: "Smart Lens (Transition + Blu)",
            price: 2800,
            description: "Auto-darkens outdoors · Advanced screen guard",
            features: ["Scratch resistant", "Sun protection (Grey)", "Screen guard"],
            badge: "2-in-1",
            accent: "#f59e0b",
        },
    ],
    zero: [
        {
            name: "BLU Screen (Green Coat)",
            price: 1450,
            description: "Minimise eyestrain · Green reflective coating",
            features: ["Screen protection", "Minimise eyestrain", "Green coating"],
            badge: null,
            accent: "#10b981",
        },
        {
            name: "BLU Screen (Blue Coat)",
            price: 1950,
            description: "Blue reflective coating · Scratch resistant",
            features: ["Blue coating", "Screen protection", "Scratch resistant"],
            badge: "★ Popular",
            accent: "var(--primary)",
            recommended: true,
        },
        {
            name: "Twin Coat (Blue + Green)",
            price: 2950,
            description: "Silk + hydrophobic coat · Anti-fog",
            features: ["Silk coating", "Hydrophobic coating", "Anti-fog"],
            badge: "Dual",
            accent: "#8b5cf6",
        },
        {
            name: "Transition",
            price: 2650,
            description: "Auto-darkens in sunlight",
            features: ["Sun protection", "Auto-adjust", "Scratch resistant"],
            badge: "Smart",
            accent: "#f97316",
        },
    ],
    progressive: [
        {
            name: "Bifocal-D",
            price: 3200,
            description: "Concentrated reading zone · Dual vision",
            features: ["Reading zone", "Dual vision correction"],
            badge: null,
            accent: "#64748b",
        },
        {
            name: "Antiglare Bifocal (Anti+)",
            price: 4500,
            description: "Anti-reflection · Double-side coating",
            features: ["Antiglare coating", "Anti-reflection", "Double side coating"],
            badge: "★ Popular",
            accent: "var(--primary)",
            recommended: true,
        },
        {
            name: "Progressive (SC)",
            price: 3800,
            description: "Multi-distance vision · Wide field of view",
            features: ["Multi-distance", "Wide field", "Outdoor perfect"],
            badge: "Advanced",
            accent: "#6366f1",
        },
    ],
};

// ─── Step indicator ─────────────────────────────────────────────────────────
const STEPS = ["Category", "Lens", "Prescription", "Review"];

function StepIndicator({ current }: { current: number }) {
    return (
        <div className="flex items-center gap-0 mt-4 mb-1">
            {STEPS.map((label, i) => {
                const idx = i + 1;
                const done = idx < current;
                const active = idx === current;
                return (
                    <React.Fragment key={label}>
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 ${
                                    done
                                        ? "bg-primary text-white shadow-md shadow-primary/30"
                                        : active
                                        ? "bg-slate-900 text-white shadow-md"
                                        : "bg-slate-100 text-slate-400"
                                }`}
                            >
                                {done ? <Check className="w-3.5 h-3.5" /> : idx}
                            </div>
                            <span
                                className={`text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${
                                    active ? "text-slate-900" : done ? "text-primary" : "text-slate-300"
                                }`}
                            >
                                {label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div
                                className={`h-[2px] flex-1 mx-1 rounded-full transition-all duration-500 ${
                                    done ? "bg-primary" : "bg-slate-100"
                                }`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ─── Main component ──────────────────────────────────────────────────────────
export function LensConfigurator({ isOpen, onClose, product, color, size }: LensConfiguratorProps) {
    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedCategoryMeta, setSelectedCategoryMeta] = useState<typeof MAIN_CATEGORIES[0] | null>(null);
    const [selectedLens, setSelectedLens] = useState<any | null>(null);
    const [prescription, setPrescription] = useState({
        od_sph: "", od_cyl: "", od_axis: "", od_add: "",
        os_sph: "", os_cyl: "", os_axis: "", os_add: "",
        pd: "",
    });
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [uploadState, setUploadState] = useState<"idle" | "loading" | "done">("idle");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const { addToCart } = useCart();

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    const handleBack = () => { if (step > 1) setStep(step - 1); };

    const handleCategoryClick = (cat: typeof MAIN_CATEGORIES[0]) => {
        if (cat.id === "frame") {
            addToCart({ productId: product._id, name: product.name, price: product.price, image: product.image });
            toast.success("Frame added to cart!");
            onClose();
            return;
        }
        setSelectedCategory(cat.id);
        setSelectedCategoryMeta(cat);
        setStep(2);
    };

    const handleLensSelect = (lens: any) => {
        setSelectedLens(lens);
        setStep(3);
    };

    const handlePrescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrescription({ ...prescription, [e.target.name]: e.target.value });
    };

    const handleUrduVoiceGuide = () => {
        if (isSpeaking) {
            // Stop playback
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setIsSpeaking(false);
            return;
        }
        // Start playback
        if (!audioRef.current) {
            audioRef.current = new Audio("/eyesight.mp3");
            audioRef.current.onended = () => setIsSpeaking(false);
            audioRef.current.onerror = () => {
                setIsSpeaking(false);
                toast.error("Could not load audio guide.");
            };
        }
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
            setIsSpeaking(false);
            toast.error("Could not play audio guide.");
        });
        setIsSpeaking(true);
    };

    const handlePrescriptionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file.");
            return;
        }
        setUploadState("loading");
        try {
            // Dynamically import Tesseract.js v7 worker API
            const Tesseract = await import("tesseract.js");
            const worker = await Tesseract.createWorker("eng", 1, {
                logger: () => {}, // suppress logs
            });
            const result = await worker.recognize(file);
            await worker.terminate();
            const text = result.data.text;

            // Normalize lines: collapse spaces but keep newlines
            const normalizedLines = text.split('\n').map(line => 
                line.replace(/[^\S\r\n]+/g, " ")
                    .replace(/[|]/g, " ")
                    .replace(/O(?=\d)/g, "0")
                    .trim()
            ).filter(Boolean);

            const normalized = normalizedLines.join(" ");

            const num = "([+-]?\\d+\\.?\\d*)";
            const ws  = "[\\s:=.]+";

            const getVal = (patterns: RegExp[]): string => {
                for (const re of patterns) {
                    const m = normalized.match(re);
                    if (m) return m[1].trim().replace(/^[+]/, "+");
                }
                return "";
            };

            // ── Strategy 1: Explicit label matching (OD/OS, R/L, Right/Left) ──
            const parsed = {
                od_sph:  getVal([
                    new RegExp(`(?:OD|R\\.?E\\.?|Right|R\\b)[^\\n]{0,40}SPH${ws}${num}`, "i"),
                    new RegExp(`(?:OD|R\\.?E\\.?|Right|R\\b)[^\\n]{0,15}${num}`, "i"),
                ]),
                od_cyl:  getVal([
                    new RegExp(`(?:OD|R\\.?E\\.?|Right|R\\b)[^\\n]{0,40}CYL${ws}${num}`, "i"),
                    new RegExp(`(?:OD|R\\.?E\\.?|Right|R\\b)\\s+${num}\\s+${num}`, "i"),
                ]),
                od_axis: getVal([
                    new RegExp(`(?:OD|R\\.?E\\.?|Right|R\\b)[^\\n]{0,40}(?:AXIS|AX)${ws}(\\d+)`, "i"),
                    new RegExp(`(?:OD|R\\.?E\\.?|Right|R\\b)\\s+${num}\\s+${num}\\s+(\\d+)`, "i"),
                ]),
                od_add:  getVal([
                    new RegExp(`(?:OD|R\\.?E\\.?|Right|R\\b)[^\\n]{0,40}ADD${ws}${num}`, "i"),
                    new RegExp(`ADD[^\\n]{0,10}${num}`, "i"),
                ]),
                os_sph:  getVal([
                    new RegExp(`(?:OS|L\\.?E\\.?|Left|L\\b)[^\\n]{0,40}SPH${ws}${num}`, "i"),
                    new RegExp(`(?:OS|L\\.?E\\.?|Left|L\\b)[^\\n]{0,15}${num}`, "i"),
                ]),
                os_cyl:  getVal([
                    new RegExp(`(?:OS|L\\.?E\\.?|Left|L\\b)[^\\n]{0,40}CYL${ws}${num}`, "i"),
                    new RegExp(`(?:OS|L\\.?E\\.?|Left|L\\b)\\s+${num}\\s+${num}`, "i"),
                ]),
                os_axis: getVal([
                    new RegExp(`(?:OS|L\\.?E\\.?|Left|L\\b)[^\\n]{0,40}(?:AXIS|AX)${ws}(\\d+)`, "i"),
                    new RegExp(`(?:OS|L\\.?E\\.?|Left|L\\b)\\s+${num}\\s+${num}\\s+(\\d+)`, "i"),
                ]),
                os_add:  getVal([
                    new RegExp(`(?:OS|L\\.?E\\.?|Left|L\\b)[^\\n]{0,40}ADD${ws}${num}`, "i"),
                ]),
                pd:      getVal([
                    new RegExp(`PD${ws}(\\d+\\.?\\d*)`, "i"),
                    new RegExp(`Pupillary[\\s\\S]{0,20}(\\d{2})`, "i"),
                    new RegExp(`(?:P\\.?D\\.?|Inter-pupillary)[^\\n]{0,10}(\\d{2,3})`, "i"),
                ]),
            };

            // ── Strategy 2: Global Value Stream Parser ──
            // If explicit regex matching yielded nothing, scan the entire text stream for values
            if (!parsed.od_sph && !parsed.os_sph && !parsed.od_cyl && !parsed.os_cyl) {
                // Combine all lines
                const allWords = normalizedLines.join(" ").split(/\s+/).map(w => w.trim()).filter(Boolean);

                // Find index of first keywords related to prescription values to skip name, date etc.
                const keywords = ["sph", "cyl", "axis", "d.v", "n.v", "dv", "nv", "right", "left", "dist", "near"];
                let startIdx = allWords.findIndex(w => keywords.some(kw => w.toLowerCase().includes(kw)));
                if (startIdx === -1) startIdx = 0;

                const slicedWords = allWords.slice(startIdx);

                // Collect value tokens (numbers, dashes, degree values, plano)
                const rawTokens: string[] = [];
                for (const word of slicedWords) {
                    const cleanWord = word.replace(/°/g, "");
                    if (/^[+-]?\d+(?:\.\d+)?$/.test(cleanWord) || 
                        /^[-—–_~]+$/.test(cleanWord) || 
                        /^(?:plano|plan|pl)$/i.test(cleanWord)) {
                        rawTokens.push(cleanWord);
                    }
                }

                // Merge standalone sign indicators (e.g. if "-" and "2.0" were split)
                const mergedTokens: string[] = [];
                for (let i = 0; i < rawTokens.length; i++) {
                    const tok = rawTokens[i];
                    if (/^[-—–_~]$/.test(tok) && i + 1 < rawTokens.length && /^\d+(?:\.\d+)?$/.test(rawTokens[i + 1])) {
                        mergedTokens.push("-" + rawTokens[i + 1]);
                        i++;
                    } else {
                        mergedTokens.push(tok);
                    }
                }

                // Format Plano/dashes into blank string
                const formatVal = (v: string) => /^[-—–_~]+$/.test(v) || /plano/i.test(v) ? "" : v;

                if (mergedTokens.length >= 6) {
                    parsed.od_sph = formatVal(mergedTokens[0]);
                    parsed.od_cyl = formatVal(mergedTokens[1]);
                    parsed.od_axis = formatVal(mergedTokens[2]);
                    parsed.os_sph = formatVal(mergedTokens[3]);
                    parsed.os_cyl = formatVal(mergedTokens[4]);
                    parsed.os_axis = formatVal(mergedTokens[5]);

                    // If we have a 7th token, check if it's the PD (typically 50-80)
                    if (mergedTokens.length >= 7) {
                        const potentialPd = parseInt(mergedTokens[6], 10);
                        if (!isNaN(potentialPd) && potentialPd >= 40 && potentialPd <= 90) {
                            parsed.pd = mergedTokens[6];
                        }
                    }
                }
            }

            const anyFound = Object.values(parsed).some(v => v !== "");

            // ── Apply extracted values directly — explicit field assignment avoids type-inference issues ──
            if (anyFound) {
                setPrescription(prev => ({
                    od_sph:  parsed.od_sph  || prev.od_sph,
                    od_cyl:  parsed.od_cyl  || prev.od_cyl,
                    od_axis: parsed.od_axis || prev.od_axis,
                    od_add:  parsed.od_add  || prev.od_add,
                    os_sph:  parsed.os_sph  || prev.os_sph,
                    os_cyl:  parsed.os_cyl  || prev.os_cyl,
                    os_axis: parsed.os_axis || prev.os_axis,
                    os_add:  parsed.os_add  || prev.os_add,
                    pd:      parsed.pd      || prev.pd,
                }));
                setUploadState("done");
                toast.success("Prescription values filled! Please verify before continuing.", { duration: 5000 });
            } else {
                console.warn("Tesseract raw text (no match):\n", text.slice(0, 800));
                setUploadState("idle");
                toast.warning("Could not auto-read this image. Please enter your prescription values manually below — or take a clearer photo.", { duration: 6000 });
            }
        } catch (err) {
            console.error("OCR error:", err);
            setUploadState("idle");
            toast.error("OCR failed. Please enter prescription values manually below.");
        }
        // Reset file input so same file can be re-uploaded
        if (fileInputRef.current) fileInputRef.current.value = "";
    };




    const handleAddToCart = () => {
        const total = product.price + (selectedLens?.price || 0);
        addToCart({
            productId: product._id,
            name: `${product.name} + ${selectedLens?.name}`,
            price: total,
            image: product.image,
            color: color || "N/A",
            size: size || "M",
            lensType: selectedLens?.name || "Clear",
            prescription: {
                measurements: { ...prescription },
                lensCategory: { name: selectedCategoryMeta?.title || selectedCategory || "", price: 0 },
                lensType: { name: selectedLens?.name || "", price: selectedLens?.price || 0 },
            },
        });
        toast.success("Added to cart with prescription!");
        onClose();
    };

    if (!isOpen) return null;

    const slideVariants = {
        enter: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
        center: { opacity: 1, x: 0 },
        exit: (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 260, mass: 0.8 }}
                className="relative w-full sm:max-w-lg bg-[#fafafa] h-full flex flex-col shadow-[-30px_0_80px_rgba(0,0,0,0.12)]"
            >
                {/* ── Header ── */}
                <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-5 md:px-7 pt-5 pb-4 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {step > 1 && (
                                <button
                                    onClick={handleBack}
                                    className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full transition-colors shrink-0"
                                >
                                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                                </button>
                            )}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-0.5">
                                    Configure Your Lenses
                                </p>
                                <h2 className="text-base md:text-lg font-black uppercase tracking-tight text-slate-900 leading-none">
                                    {step === 1 && "Choose Category"}
                                    {step === 2 && "Select Lens Type"}
                                    {step === 3 && "Your Prescription"}
                                    {step === 4 && "Order Review"}
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-all shrink-0 mt-0.5"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <StepIndicator current={step} />

                    {/* Thin progress bar */}
                    <div className="h-0.5 w-full bg-slate-100 rounded-full overflow-hidden -mb-1">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary to-slate-700 rounded-full"
                            animate={{ width: `${(step / 4) * 100}%` }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                    </div>
                </div>

                {/* ── Content ── */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-5 md:px-7 py-6 pb-36">
                    <AnimatePresence mode="wait" custom={1}>

                        {/* Step 1 — Category */}
                        {step === 1 && (
                            <motion.div
                                key="s1"
                                custom={1}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="space-y-3"
                            >
                                <p className="text-xs text-slate-400 font-semibold mb-4">
                                    What type of lenses do you need?
                                </p>
                                {MAIN_CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat)}
                                            className={`w-full text-left rounded-2xl border-2 border-transparent bg-gradient-to-br ${cat.color} hover:border-slate-200 hover:shadow-md transition-all duration-300 p-4 md:p-5 flex items-center gap-4 group`}
                                        >
                                            {/* Icon bubble */}
                                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                                                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${cat.iconColor}`} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                    <span className="font-black text-slate-900 uppercase tracking-tight text-sm md:text-base">
                                                        {cat.title}
                                                    </span>
                                                    {cat.tag && (
                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-slate-600 shadow-sm`}>
                                                            {cat.tag}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium leading-snug truncate">
                                                    {cat.subtitle}
                                                </p>
                                            </div>

                                            <div className={`w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-all`}>
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </button>
                                    );
                                })}
                            </motion.div>
                        )}

                        {/* Step 2 — Lens Selection */}
                        {step === 2 && (
                            <motion.div
                                key="s2"
                                custom={1}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="space-y-3"
                            >
                                {selectedCategoryMeta && (
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r ${selectedCategoryMeta.color} mb-4`}>
                                        <div className={`w-2 h-2 rounded-full ${selectedCategoryMeta.dotColor}`} />
                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">
                                            {selectedCategoryMeta.title}
                                        </span>
                                    </div>
                                )}

                                {selectedCategory && LENS_OPTIONS[selectedCategory]?.map((lens, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleLensSelect(lens)}
                                        className={`w-full text-left rounded-2xl border-2 transition-all duration-300 group overflow-hidden ${
                                            lens.recommended
                                                ? "border-primary/25 bg-white shadow-lg shadow-primary/5"
                                                : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
                                        }`}
                                    >
                                        {lens.recommended && (
                                            <div className="bg-gradient-to-r from-primary to-slate-900 px-4 py-1.5 flex items-center gap-1.5">
                                                <Star className="w-3 h-3 fill-white text-white" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                                    Most Popular Choice
                                                </span>
                                            </div>
                                        )}

                                        <div className="p-4 md:p-5">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm md:text-base leading-tight">
                                                            {lens.name}
                                                        </h3>
                                                        {lens.badge && !lens.recommended && (
                                                            <span
                                                                className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0"
                                                            >
                                                                {lens.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 font-medium leading-snug">
                                                        {lens.description}
                                                    </p>
                                                </div>
                                                <span
                                                    className="text-base md:text-lg font-black shrink-0"
                                                    style={{ color: lens.recommended ? "var(--primary)" : "#475569" }}
                                                >
                                                    Rs {lens.price.toLocaleString()}
                                                </span>
                                            </div>

                                            {/* Feature pills */}
                                            <div className="flex flex-wrap gap-1.5">
                                                {lens.features.map((feat: string, fi: number) => (
                                                    <span
                                                        key={fi}
                                                        className="inline-flex items-center gap-1 text-[9px] md:text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100"
                                                    >
                                                        <Check className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                                                        {feat}
                                                    </span>
                                                ))}
                                                <span className="inline-flex items-center gap-1 text-[9px] md:text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-slate-900 text-white ml-auto group-hover:bg-primary transition-colors">
                                                    Select <ChevronRight className="w-2.5 h-2.5" />
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {/* Step 3 — Prescription */}
                        {step === 3 && (
                            <motion.div
                                key="s3"
                                custom={1}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                            >
                                {/* Selected lens summary chip */}
                                {selectedLens && (
                                    <div className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Selected Lens</p>
                                            <p className="text-sm font-black text-slate-900 truncate">{selectedLens.name}</p>
                                        </div>
                                        <span className="text-base font-black text-primary ml-3 shrink-0">
                                            Rs {selectedLens.price.toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                {/* Eye Panels */}
                                {[
                                    { label: "Right Eye", abbr: "OD", prefix: "od", dot: "bg-primary" },
                                    { label: "Left Eye", abbr: "OS", prefix: "os", dot: "bg-slate-300" },
                                ].map(({ label, abbr, prefix, dot }) => (
                                    <div key={prefix} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                        {/* Eye header */}
                                        <div className="px-4 py-3 flex items-center gap-2 border-b border-slate-50">
                                            <span className={`w-2.5 h-2.5 rounded-full ${dot} shrink-0`} />
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-900">{label}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">({abbr})</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-px bg-slate-100">
                                            {["sph", "cyl", "axis", "add"].map((field) => (
                                                <div key={field} className="bg-white p-3 space-y-2">
                                                    <label className="block text-[9px] font-black uppercase tracking-widest text-center text-slate-400">
                                                        {field}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name={`${prefix}_${field}`}
                                                        value={(prescription as any)[`${prefix}_${field}`]}
                                                        onChange={handlePrescriptionChange}
                                                        placeholder="0.00"
                                                        className="w-full h-10 text-center bg-slate-50 border border-slate-100 rounded-xl focus:border-primary/40 focus:ring-2 focus:ring-primary/10 font-bold text-sm text-slate-800 outline-none transition-all"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* PD */}
                                <div className="bg-white border border-slate-100 rounded-2xl px-4 py-4 flex items-center justify-between shadow-sm">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-900 mb-0.5">Pupillary Distance</p>
                                        <p className="text-[10px] text-slate-400 font-semibold">Distance between pupils (mm)</p>
                                    </div>
                                    <input
                                        type="text"
                                        name="pd"
                                        value={prescription.pd}
                                        onChange={handlePrescriptionChange}
                                        placeholder="64"
                                        className="w-20 h-11 text-center bg-slate-50 border border-slate-100 rounded-xl focus:border-primary/40 focus:ring-2 focus:ring-primary/10 font-bold text-base text-slate-800 outline-none transition-all"
                                    />
                                </div>

                                {/* ── 3 Helper Tools ── */}
                                <div className="space-y-3">

                                    {/* 1. WhatsApp Button */}
                                    <a
                                        href={`https://wa.me/923709573005?text=${encodeURIComponent(`Hi! I need help selecting lenses for: ${product.name} (Rs ${product.price.toLocaleString()}). Lens selected: ${selectedLens?.name || 'Not yet selected'}. Can you assist?`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-2xl px-4 py-3.5 transition-all group"
                                    >
                                        <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                            <MessageCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black uppercase tracking-wide text-slate-800">Need Help? Chat on WhatsApp</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Our optician will guide you through your prescription</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#25D366] transition-colors shrink-0" />
                                    </a>

                                    {/* 2. Urdu Voice Guide */}
                                    <button
                                        onClick={handleUrduVoiceGuide}
                                        className={`flex items-center gap-3 w-full border rounded-2xl px-4 py-3.5 transition-all group text-left ${
                                            isSpeaking
                                                ? "bg-primary/10 border-primary/30"
                                                : "bg-slate-50 border-slate-200 hover:border-primary/30 hover:bg-primary/5"
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                                            isSpeaking ? "bg-primary" : "bg-slate-200 group-hover:bg-primary/20"
                                        }`}>
                                            {isSpeaking
                                                ? <VolumeX className="w-5 h-5 text-white" />
                                                : <Volume2 className="w-5 h-5 text-slate-600 group-hover:text-primary" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-black uppercase tracking-wide ${
                                                isSpeaking ? "text-primary" : "text-slate-800"
                                            }`}>
                                                {isSpeaking ? "Stop Voice Guide" : "اردو آواز رہنما — Urdu Voice Guide"}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium">Press to hear prescription field explanations in Urdu</p>
                                        </div>
                                        {isSpeaking && (
                                            <div className="flex gap-0.5 items-end shrink-0">
                                                {[...Array(4)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-1 bg-primary rounded-full animate-bounce"
                                                        style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s` }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </button>

                                    {/* 3. Upload Prescription Image */}
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                                        <div className="px-4 py-3.5 flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                                                uploadState === "done" ? "bg-emerald-500" : "bg-slate-200"
                                            }`}>
                                                {uploadState === "loading"
                                                    ? <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
                                                    : uploadState === "done"
                                                    ? <Sparkles className="w-5 h-5 text-white" />
                                                    : <ImageIcon className="w-5 h-5 text-slate-600" />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black uppercase tracking-wide text-slate-800">
                                                    {uploadState === "loading" ? "Extracting prescription…" : uploadState === "done" ? "Prescription Extracted ✓" : "Upload Prescription Image"}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    {uploadState === "done" ? "Values filled — please verify before continuing" : "We'll auto-fill your prescription from the photo"}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadState === "loading"}
                                                className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-slate-900 hover:bg-primary disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-wider transition-colors shrink-0"
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                                {uploadState === "done" ? "Re-upload" : "Upload"}
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handlePrescriptionImageUpload}
                                            />
                                        </div>
                                        {uploadState === "loading" && (
                                            <div className="h-1 w-full bg-slate-100">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-primary to-slate-700"
                                                    animate={{ width: ["0%", "90%"] }}
                                                    transition={{ duration: 2.5, ease: "easeOut" }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Info banner */}
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
                                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                                        <Info className="w-4 h-4 text-primary" />
                                    </div>
                                    <p className="text-[11px] font-semibold text-primary/90 leading-relaxed">
                                        Every prescription is manually verified by our opticians before production to ensure perfect optical comfort.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4 — Review */}
                        {step === 4 && (
                            <motion.div
                                key="s4"
                                custom={1}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                {/* Dark summary card */}
                                <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-5 md:p-6 relative overflow-hidden shadow-2xl">
                                    {/* Decorative blobs */}
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-28 h-28 bg-primary/10 rounded-full blur-[40px] -ml-12 -mb-12 pointer-events-none" />

                                    {/* Product row */}
                                    <div className="flex items-center gap-4 mb-6 relative z-10">
                                        <div className="relative w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shrink-0">
                                            {product.images?.[0] ? (
                                                product.images[0].startsWith('data:') ? (
                                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-2" />
                                                ) : (
                                                    <Image src={product.images[0]} alt={product.name} fill className="object-contain p-2" />
                                                )
                                            ) : (
                                                <Image src={product.image || '/images/dfd.png'} alt={product.name} fill className="object-contain p-2" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-0.5">Frame</p>
                                            <h3 className="font-black uppercase tracking-tight leading-tight text-white text-sm md:text-base line-clamp-2">
                                                {product.name}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Line items */}
                                    <div className="space-y-3 relative z-10">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-white/50">{product.name}</span>
                                            <span className="text-sm font-black font-sans text-white/70">Rs {product.price.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-white/50 max-w-[60%] text-left leading-tight">
                                                {selectedLens?.name}
                                            </span>
                                            <span className="text-sm font-black font-sans text-white/70">Rs {selectedLens?.price.toLocaleString()}</span>
                                        </div>

                                        <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Total</span>
                                            <span className="text-2xl md:text-3xl font-black font-sans">
                                                Rs {(product.price + (selectedLens?.price || 0)).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Prescription summary */}
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: "Right Eye (OD)", prefix: "od", dot: "bg-primary" },
                                        { label: "Left Eye (OS)", prefix: "os", dot: "bg-slate-300" },
                                    ].map(({ label, prefix, dot }) => (
                                        <div key={prefix} className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-sm">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${dot}`} />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{label}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
                                                {["sph", "cyl", "axis", "add"].map((f) => (
                                                    <div key={f} className="flex items-center justify-between gap-1">
                                                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">{f}</span>
                                                        <span className="text-[10px] font-black text-slate-800 font-mono">
                                                            {(prescription as any)[`${prefix}_${f}`] || "—"}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* PD summary */}
                                <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 flex justify-between items-center shadow-sm">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pupillary Distance (PD)</span>
                                    <span className="text-sm font-black text-slate-900 font-mono">{prescription.pd || "—"} mm</span>
                                </div>

                                {/* Guarantee strip */}
                                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                                    <p className="text-[11px] font-semibold text-emerald-700">
                                        Prescription verified by our opticians before manufacturing
                                    </p>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* ── Sticky Footer CTA ── */}
                <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-100 px-5 md:px-7 py-4 md:py-5 z-30">
                    {step === 4 ? (
                        <Button
                            onClick={handleAddToCart}
                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-slate-900 hover:from-primary/90 hover:to-slate-900/90 text-white font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                        >
                            Confirm & Add to Cart — Rs {(product.price + (selectedLens?.price || 0)).toLocaleString()}
                        </Button>
                    ) : step === 3 ? (
                        <Button
                            onClick={() => setStep(4)}
                            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-sm shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                        >
                            Review Order <ChevronRight className="w-5 h-5 ml-1" />
                        </Button>
                    ) : null}

                    {/* Bottom safe area for mobile */}
                    <div className="h-safe-area-inset-bottom" />
                </div>
            </motion.div>
        </div>
    );
}
