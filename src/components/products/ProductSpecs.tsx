"use client";

import React, { useState } from "react";
import { ShieldCheck, Heart, Star, Package, RefreshCw, CheckCircle2, ChevronDown, ChevronUp, Zap, Eye, Monitor, Droplets, Sparkles, Clock, Ruler } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ProductSpecsProps {
    measurements?: {
        lensWidth?: number;
        bridgeWidth?: number;
        templeLength?: number;
        pdMin?: number;
        pdMax?: number;
        frameHeight?: number;
    };
    description?: string;
    color?: string;
    size?: string;
    material?: string;
    shape?: string;
    rim?: string;
    referenceImage?: string;
}


const TABS = [
    { id: "details",    label: "Details" },
    { id: "how-it-works", label: "How It Works" },
    { id: "faq",         label: "FAQ" },
    { id: "reviews",     label: "Reviews" },
];

const FEATURES_LIST = [
    { icon: ShieldCheck, color: "text-primary", bg: "bg-slate-50",    title: "UV400 Protection",       desc: "Blocks 100% of harmful UVA & UVB rays for all-day outdoor safety." },
    { icon: Sparkles,    color: "text-violet-600", bg: "bg-violet-50", title: "Scratch-Resistant",      desc: "Diamond hard-coat multi-layer film that survives daily wear and tear." },
    { icon: Droplets,    color: "text-emerald-600", bg: "bg-emerald-50", title: "Hydrophilic Coating", desc: "Water, oil and smudge-repellent surface — easy to wipe clean in seconds." },
    { icon: Monitor,     color: "text-primary",    bg: "bg-slate-50",    title: "Blue Light Blocking",   desc: "Filters harmful HEV blue light from screens to reduce digital eye strain." },
    { icon: Zap,         color: "text-amber-600",  bg: "bg-amber-50",  title: "Ultra-Light Frame",     desc: "Engineered from surgical-grade acetate or titanium alloy — weighs under 18g." },
    { icon: Eye,         color: "text-primary",    bg: "bg-primary/10", title: "RX Compatible",        desc: "Every frame is precision-calibrated for single vision, bifocal and progressive lenses." },
];

const HOW_IT_WORKS = [
    { step: "01", title: "Choose Your Frame",   desc: "Browse our catalog and pick the frame that matches your face shape and style. Use Virtual Try-On to see it on your face live.",   icon: Eye },
    { step: "02", title: "Select Your Lenses",  desc: "Use our Lens Configurator to choose from Standard, Antiglare, Blu-Screen, Photochromic or Progressive — we guide you every step.", icon: Monitor },
    { step: "03", title: "Enter Prescription",  desc: "Fill in your SPH, CYL, AXIS and ADD values. No prescription? Choose Zero Power lenses. Our opticians verify every order manually.", icon: ShieldCheck },
    { step: "04", title: "Fast Delivery",        desc: "Your custom eyewear is crafted, quality-tested and shipped nationwide within 2–5 business days via a tracked courier.",             icon: Clock },
];

const FAQ_LIST = [
    {
        q: "Can I use my doctor's prescription directly?",
        a: "Yes. Simply enter the values from your prescription slip (SPH, CYL, AXIS, ADD, PD) into our Lens Configurator. Our opticians double-check every prescription before production.",
    },
    {
        q: "How accurate is the Virtual Try-On?",
        a: "Our VTO uses your device's front camera and face-detection AI to overlay the frame in real-time at scale. It's best used in good lighting for maximum accuracy.",
    },
    {
        q: "What if the frame doesn't fit me?",
        a: "We offer a 30-day hassle-free return policy on unused frames. If there's a prescription issue, we'll re-make the lenses free of charge within our quality guarantee window.",
    },
    {
        q: "How long does delivery take?",
        a: "Standard delivery across Pakistan takes 2–5 business days from the day your order is confirmed. You'll receive a tracking number via WhatsApp or SMS.",
    },
    {
        q: "Do you offer anti-reflective and blue-light lenses?",
        a: "Absolutely. We carry Antiglare, Lensvik Blu Screen, Lensvik Blu Pro, and Smart Transition lenses. You can configure your choice directly on the product page.",
    },
    {
        q: "Is Cash on Delivery available everywhere in Pakistan?",
        a: "Yes — we ship COD to all major cities and many smaller towns nationwide. Online payment options are coming soon.",
    },
];

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            >
                <span className="text-sm font-black text-slate-800 uppercase tracking-tight leading-snug pr-2">{q}</span>
                {open
                    ? <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <p className="px-5 pb-4 text-sm text-slate-500 font-medium leading-relaxed border-t border-slate-50 pt-3">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function ProductSpecs({ measurements, description, color, size: frameSize, material, shape, rim, referenceImage }: ProductSpecsProps) {
    const [activeTab, setActiveTab] = useState("details");
    const isDataUri = (src?: string) => src?.startsWith('data:');

    return (
        <div className="mt-10 md:mt-16">
            {/* ── Tab Navigation (horizontally scrollable on mobile) ── */}
            <div className="flex gap-0 border-b border-slate-100 overflow-x-auto no-scrollbar mb-7 md:mb-10">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative shrink-0 pb-3 px-4 md:px-6 text-xs md:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                            activeTab === tab.id ? "text-primary" : "text-slate-400 hover:text-slate-700"
                        }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div layoutId="tab-line" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ── */}
            <div className="min-h-[260px]">
                <AnimatePresence mode="wait">

                    {/* DETAILS */}
                    {activeTab === "details" && (
                        <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                <div className="md:col-span-2 space-y-5">
                                    <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Ruler className="w-4 h-4 text-primary" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Product Details</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {frameSize && (
                                                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Size</span>
                                                    <span className="text-xs font-bold text-slate-800">{frameSize}</span>
                                                </div>
                                            )}
                                            {color && (
                                                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Color</span>
                                                    <span className="text-xs font-bold text-slate-800">{color}</span>
                                                </div>
                                            )}
                                            {material && (
                                                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Material</span>
                                                    <span className="text-xs font-bold text-slate-800">{material}</span>
                                                </div>
                                            )}
                                            {shape && (
                                                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Shape</span>
                                                    <span className="text-xs font-bold text-slate-800 uppercase">{shape}</span>
                                                </div>
                                            )}
                                            {rim && (
                                                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Rim</span>
                                                    <span className="text-xs font-bold text-slate-800">{rim}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-primary" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Reference</h4>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-slate-100">
                                        {referenceImage ? (
                                            isDataUri(referenceImage) ? (
                                                <img
                                                    src={referenceImage}
                                                    alt="Frame dimensions reference"
                                                    className="w-full h-auto object-contain max-h-[300px]"
                                                />
                                            ) : (
                                                <Image
                                                    src={referenceImage}
                                                    alt="Frame dimensions reference"
                                                    width={400}
                                                    height={300}
                                                    className="w-full h-auto object-contain max-h-[300px]"
                                                />
                                            )
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <Ruler className="w-8 h-8 text-slate-200 mb-2" />
                                                <p className="text-[10px] text-slate-400 font-medium">No reference image uploaded</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* HOW IT WORKS */}
                    {activeTab === "how-it-works" && (
                        <motion.div key="how" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {HOW_IT_WORKS.map((step, i) => (
                                    <div key={i} className="relative bg-white border border-slate-100 rounded-2xl p-5 md:p-6 hover:shadow-lg hover:border-primary/20 transition-all group">
                                        {/* Step number */}
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3 block">{step.step}</span>
                                        {/* Connector line */}
                                        {i < HOW_IT_WORKS.length - 1 && (
                                            <div className="hidden lg:block absolute top-10 right-0 w-4 h-0.5 bg-slate-100 translate-x-full" />
                                        )}
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                                            <step.icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 mb-2">{step.title}</h3>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 bg-gradient-to-r from-primary/5 to-slate-900/5 border border-primary/10 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                    <span className="font-black text-slate-900">Every prescription is verified by our in-house opticians</span> before your lenses go into production — guaranteeing optical accuracy and comfort.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* FAQ */}
                    {activeTab === "faq" && (
                        <motion.div key="faq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="space-y-2 max-w-3xl">
                                {FAQ_LIST.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
                            </div>
                            <div className="mt-6 bg-slate-900 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center gap-4 justify-between max-w-3xl">
                                <p className="text-sm font-medium text-white/70">Still have a question?</p>
                                <a
                                    href="https://wa.me/923709573005"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-black uppercase tracking-widest text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-full transition-all shrink-0"
                                >
                                    WhatsApp Us →
                                </a>
                            </div>
                        </motion.div>
                    )}

                    {/* REVIEWS */}
                    {activeTab === "reviews" && (
                        <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-black italic tracking-tight">4.9</span>
                                    <div>
                                        <div className="flex text-yellow-400 mb-0.5">
                                            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">48 verified reviews</p>
                                    </div>
                                </div>
                                <button className="h-10 px-6 bg-slate-900 text-white rounded-xl font-black italic uppercase tracking-widest text-xs hover:bg-black transition-all w-fit">
                                    Write A Review
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { name: "Sarah Ahmed", text: "Far superior quality to anything I've owned before. Extremely lightweight and fits like a dream.", ago: "2 weeks ago" },
                                    { name: "Ali Raza", text: "The Blu Pro lenses are incredible — no more eye fatigue after long work sessions. Highly recommended!", ago: "1 month ago" },
                                ].map((r, i) => (
                                    <div key={i} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-current" />)}
                                            </div>
                                            <span className="text-[9px] font-black uppercase text-slate-300">{r.ago}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 font-medium italic leading-relaxed mb-4">"{r.text}"</p>
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-[10px]">
                                                {r.name.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-tight text-slate-700">
                                                {r.name} <span className="text-emerald-500">· Verified</span>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
