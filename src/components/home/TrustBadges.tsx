"use client";

import { Truck, ShieldCheck, RefreshCcw, Headset, Star } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
    {
        icon: Truck,
        title: "Free Shipping",
        description: "On all orders over Rs 15,000",
        color: "text-primary",
        bg: "bg-slate-100",
    },
    {
        icon: ShieldCheck,
        title: "Secure Checkout",
        description: "100% protected payments",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
    },
    {
        icon: RefreshCcw,
        title: "Easy Returns",
        description: "30-day hassle-free policy",
        color: "text-violet-600",
        bg: "bg-violet-50",
    },
    {
        icon: Headset,
        title: "24/7 Support",
        description: "Dedicated expert help",
        color: "text-orange-500",
        bg: "bg-orange-50",
    },
    {
        icon: Star,
        title: "4.9★ Rated",
        description: "By 2,400+ happy customers",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
    },
];

export function TrustBadges() {
    return (
        <section className="py-5 md:py-8 border-y border-slate-100 bg-white overflow-hidden">
            <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6">
                {/* Mobile: horizontal scroll | Desktop: grid */}
                <div className="flex md:grid md:grid-cols-5 gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    {badges.map((badge, index) => (
                        <motion.div
                            key={badge.title}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.07 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2.5 md:gap-3 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl px-3 md:px-4 py-2.5 md:py-3 shrink-0 md:shrink min-w-[160px] md:min-w-0"
                        >
                            <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl ${badge.bg} flex items-center justify-center shrink-0`}>
                                <badge.icon className={`w-4 h-4 md:w-4.5 md:h-4.5 ${badge.color}`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] md:text-[11px] font-black uppercase tracking-wider text-slate-800 leading-tight whitespace-nowrap">{badge.title}</p>
                                <p className="text-[9px] text-slate-400 font-medium leading-tight hidden md:block">{badge.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
