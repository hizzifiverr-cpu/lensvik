"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const LENS_TYPES = [
    {
        id: "blue-block",
        name: "Blue-violet light",
        title: "Digital Defense",
        description: "Protect your eyes from harmful digital glare. Our Blue-Block lenses filter out violet-blue light emitted by screens, reducing eye strain and improving sleep quality.",
        image: "/images/lens 1.png",
        color: "bg-blue-500/10",
        accent: "text-blue-600",
        buttonText: "Shop Blue-Block Lenses"
    },
    {
        id: "sun",
        name: "Prescription sun",
        title: "Solar Precision",
        description: "Protect your eyes from the sun without compromising on your vision needs. Choose premium prescription sun lenses available on any frame in our collection.",
        image: "/images/lens 2.png",
        color: "bg-slate-900/10",
        accent: "text-slate-900",
        buttonText: "Shop Sun Lenses"
    },
    {
        id: "transitions",
        name: "Light Intelligent",
        title: "Transitions® Gen8™",
        description: "The perfect everyday lens. Automatically adapts to changing light conditions, darkening outdoors and returning to clear indoors for ultimate convenience.",
        image: "/images/lens 3.png",
        color: "bg-purple-500/10",
        accent: "text-purple-600",
        buttonText: "Shop Transitions"
    }
];

export function LensShowcase() {
    const [activeTab, setActiveTab] = useState(LENS_TYPES[1]);

    return (
        <section className="py-8 md:py-12 bg-[#f8f9fb] overflow-hidden">
            <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">

                    {/* Left Side: Interactive Lens Visual */}
                    <div className="w-full lg:w-1/2 relative">
                        <div className="relative aspect-square max-w-[380px] mx-auto">
                            {/* Decorative Background Elements */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                    rotate: [0, 5, 0]
                                }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-white rounded-full shadow-2xl"
                            />
                            <div className={`absolute inset-8 rounded-full ${activeTab.color} blur-3xl transition-colors duration-700`} />

                            {/* Main Lens Image */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab.id}
                                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    exit={{ opacity: 0, scale: 1.1, rotate: 10 }}
                                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                    className="absolute inset-0 flex items-center justify-center p-12 z-10"
                                >
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={activeTab.image}
                                            alt={activeTab.title}
                                            fill
                                            className="object-contain drop-shadow-2xl"
                                        />
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Floating Labels */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-xl z-20 hidden md:block"
                            >
                                <div className="flex items-center gap-2">
                                    <Sparkles className={`w-4 h-4 ${activeTab.accent}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Premium Coating</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Side: Content & Controls */}
                    <div className="w-full lg:w-1/2 space-y-8">
                        {/* Tabs Navigation */}
                        <div className="flex flex-wrap gap-4 border-b border-slate-200 pb-4">
                            {LENS_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setActiveTab(type)}
                                    className={`relative pb-4 text-xs md:text-sm font-black uppercase tracking-widest transition-all ${activeTab.id === type.id ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {type.name}
                                    {activeTab.id === type.id && (
                                        <motion.div
                                            layoutId="activeLensTab"
                                            className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Text Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${activeTab.accent}`}>{activeTab.name}</span>
                                    <h2 className="text-3xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">{activeTab.title}</h2>
                                </div>
                                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl italic">
                                    {activeTab.description}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <Button className="h-12 px-6 bg-primary text-white rounded-xl font-black uppercase italic tracking-widest group text-xs">
                                        {activeTab.buttonText}
                                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                    <Button variant="outline" className="h-12 px-6 border-2 border-slate-200 text-slate-900 rounded-xl font-black uppercase italic tracking-widest hover:bg-slate-50 text-xs">
                                        Discover All Lenses
                                    </Button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
}
