"use client";

import React, { useState } from "react";
import { Star, Quote, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const REVIEWS = [
    {
        name: "Hammad Haroon",
        role: "Creative Director",
        content: "Best eyewear purchase I've ever made. The blue-block lenses actually work, and the frame is incredibly lightweight. The VTO made the choice so easy.",
        rating: 5,
        location: "Islamabad, F7",
        initials: "HH",
        color: "bg-primary",
    },
    {
        name: "Sanya Khan",
        role: "Tech Consultant",
        content: "I was skeptical about buying prescription glasses online. Lensvik's step-by-step configurator was so smooth. Received my glasses in 3 days — perfect fit!",
        rating: 5,
        location: "Lahore, DHA",
        initials: "SK",
        color: "bg-violet-600",
    },
    {
        name: "Hira Khan",
        role: "Professional Gamer",
        content: "The Lensvik Blu Pro lenses are a game changer for long sessions. No more headaches after hours of screen time. Every detail screams premium quality.",
        rating: 5,
        location: "Karachi, Clifton",
        initials: "HK",
        color: "bg-emerald-600",
    },
];

function ReviewCard({ review }: { review: typeof REVIEWS[0] }) {
    return (
        <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/80 flex flex-col p-6 md:p-8 relative overflow-hidden h-full">
            {/* Decorative quote */}
            <div className="absolute top-5 right-5 md:top-7 md:right-7 text-slate-100">
                <Quote className="w-10 h-10 md:w-12 md:h-12" />
            </div>

            {/* Stars */}
            <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                ))}
            </div>

            {/* Review body */}
            <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed italic mb-6 flex-1 relative z-10">
                "{review.content}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 mt-auto">
                <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full ${review.color} flex items-center justify-center font-black text-white text-sm shrink-0`}>
                    {review.initials}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-black uppercase tracking-tight italic text-slate-900 text-sm">{review.name}</h4>
                        <span className="inline-flex items-center gap-0.5 text-[8px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tight border border-green-100">
                            <CheckCircle className="w-2.5 h-2.5" /> Verified
                        </span>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5 truncate">
                        {review.role} · {review.location}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function Testimonials() {
    const [active, setActive] = useState(0);

    const prev = () => setActive((a) => (a - 1 + REVIEWS.length) % REVIEWS.length);
    const next = () => setActive((a) => (a + 1) % REVIEWS.length);

    return (
        <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-24 overflow-hidden">
            <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-14 gap-4">
                    <div>
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 block"
                        >
                            Voices of Vision
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-6xl font-black tracking-tighter uppercase italic leading-none text-slate-900"
                        >
                            Client Perspectives
                        </motion.h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Aggregate score */}
                        <div className="text-right">
                            <div className="flex items-center gap-0.5 justify-end mb-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-[10px] font-black italic uppercase tracking-widest text-slate-400">
                                4.9 / 5 · 2,400+ Reviews
                            </p>
                        </div>

                        {/* Desktop prev/next */}
                        <div className="hidden md:flex gap-2">
                            <button onClick={prev} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={next} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Desktop: grid */}
                <div className="hidden md:grid md:grid-cols-3 gap-6 md:gap-8">
                    {REVIEWS.map((review, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <ReviewCard review={review} />
                        </motion.div>
                    ))}
                </div>

                {/* Mobile: single-card carousel */}
                <div className="md:hidden relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ReviewCard review={REVIEWS[active]} />
                        </motion.div>
                    </AnimatePresence>

                    {/* Mobile nav dots */}
                    <div className="flex items-center justify-center gap-2 mt-5">
                        {REVIEWS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActive(i)}
                                className={`rounded-full transition-all duration-300 ${
                                    i === active ? "w-6 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-slate-200"
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
