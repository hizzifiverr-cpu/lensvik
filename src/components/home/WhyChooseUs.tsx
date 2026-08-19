"use client";

import React from "react";
import { ShieldCheck, Sparkles, Droplets, Monitor, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const FEATURES = [
    {
        icon: ShieldCheck,
        title: "UV Protection",
        label: "Blocks 100% UVA/UVB",
        description: "Industrial-grade UV400 filters integrated into every lens set for all-day protection.",
        gradient: "from-slate-800 to-slate-950",
        lightBg: "bg-slate-100",
        iconColor: "text-primary",
    },
    {
        icon: Sparkles,
        title: "Scratch Resistant",
        label: "Diamond Hard-Coat",
        description: "Multi-layer protective coating that withstands daily wear and tear effortlessly.",
        gradient: "from-violet-500 to-purple-600",
        lightBg: "bg-violet-50",
        iconColor: "text-violet-600",
    },
    {
        icon: Droplets,
        title: "Hydrophilic Coating",
        label: "Water & Oil Repellent",
        description: "Fog-resistant and easy-to-clean surfaces for a consistently crystal clear view.",
        gradient: "from-emerald-500 to-teal-600",
        lightBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
    },
    {
        icon: Monitor,
        title: "Screen Protection",
        label: "Blu-Block Technology",
        description: "Filters harmful blue light to reduce discomfort and eyestrain from all digital devices.",
        gradient: "from-orange-500 to-amber-600",
        lightBg: "bg-amber-50",
        iconColor: "text-amber-600",
    },
];

const CERTS = ["FDA Approved", "ISO Certified", "CE Compliant", "ANSI Z80.3"];

export function WhyChooseUs() {
    return (
        <section className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
            <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="text-center mb-12 md:mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3"
                    >
                        Superior Engineering
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-slate-900 mb-4"
                    >
                        Why Choose Lensvik?
                    </motion.h2>
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        viewport={{ once: true }}
                        className="h-1 w-16 bg-gradient-to-r from-primary to-slate-700 mx-auto rounded-full"
                    />
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
                    {FEATURES.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            viewport={{ once: true }}
                            className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-100 hover:border-transparent hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 overflow-hidden"
                        >
                            {/* Hover gradient overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 rounded-2xl md:rounded-3xl`} />

                            {/* Icon */}
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${feature.lightBg} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                <feature.icon className={`w-6 h-6 md:w-7 md:h-7 ${feature.iconColor}`} />
                            </div>

                            <p className={`text-[9px] font-black uppercase tracking-widest ${feature.iconColor} mb-2`}>
                                {feature.label}
                            </p>
                            <h3 className="text-base md:text-lg font-black uppercase italic tracking-tight text-slate-900 mb-2 md:mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-xs md:text-sm font-medium text-slate-500 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom strip: certs + CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900 rounded-2xl md:rounded-3xl px-6 md:px-10 py-6 md:py-8"
                >
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8">
                        {CERTS.map((cert) => (
                            <div key={cert} className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{cert}</span>
                            </div>
                        ))}
                    </div>
                    <Link
                        href="/collections"
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-primary hover:bg-primary/90 px-5 py-2.5 rounded-full transition-all hover:scale-105 shrink-0"
                    >
                        Shop All Lenses <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
