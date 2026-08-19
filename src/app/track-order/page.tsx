"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Package, MapPin, CheckCircle2, Truck, Phone, ChevronRight, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STEPS = [
    { icon: CheckCircle2, label: "Order Confirmed", desc: "Expertly crafted & quality checked", color: "text-primary", bg: "bg-slate-50", border: "border-slate-100" },
    { icon: Sparkles, label: "Processing", desc: "Your lenses are being fitted", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
    { icon: Truck, label: "In Transit", desc: "On its way to your doorstep", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { icon: MapPin, label: "Delivered", desc: "Seeing the world in clarity", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
];

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId.trim()) { toast.error("Please enter your Order ID"); return; }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.error("Order not found. Please check your Order ID or contact support.");
        }, 1800);
    };

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            {/* Hero */}
            <section className="relative pt-36 md:pt-44 pb-14 md:pb-20 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                <div className="absolute top-24 right-[-100px] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] -z-10" />

                <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6 text-center mb-10 md:mb-14">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3"
                    >
                        Real-time Shipment Tracking
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase leading-none text-slate-900 mb-3"
                    >
                        Track Your Order
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-sm md:text-base text-slate-500 font-medium max-w-md mx-auto"
                    >
                        Enter your Order ID to get an instant update on your shipment status.
                    </motion.p>
                </div>

                {/* Tracking Form */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-lg mx-auto px-4 md:px-0"
                >
                    <form
                        onSubmit={handleTrack}
                        className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-2xl shadow-slate-100/60 overflow-hidden"
                    >
                        <div className="px-6 md:px-8 pt-6 md:pt-8 pb-5 md:pb-6 space-y-4">
                            {/* Order ID */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-0.5">
                                    Order ID / Tracking Number
                                </label>
                                <div className="relative">
                                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input
                                        type="text"
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        placeholder="e.g. LV-12345678"
                                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 font-mono text-sm text-slate-800 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Email (optional) */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-0.5">
                                    Email Address <span className="text-slate-300 font-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 text-sm text-slate-800 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 md:px-8 pb-6 md:pb-8">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-slate-900 hover:from-primary/90 hover:to-slate-900/90 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] group"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Searching...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Track My Shipment
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* WhatsApp support fallback */}
                    <div className="mt-4 text-center">
                        <p className="text-[11px] text-slate-400 font-medium">
                            Can't find your order?{" "}
                            <a
                                href="https://wa.me/923709573005"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 font-black hover:underline"
                            >
                                WhatsApp us →
                            </a>
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* Delivery Journey Steps */}
            <section className="w-full max-w-screen-2xl mx-auto px-4 md:px-6 pb-24 md:pb-40">
                <div className="text-center mb-8 md:mb-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">How it works</p>
                    <h2 className="text-xl md:text-3xl font-black tracking-tighter italic uppercase text-slate-900">
                        Your Order Journey
                    </h2>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                    {STEPS.map((step, i) => (
                        <motion.div
                            key={step.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            viewport={{ once: true }}
                            className={`relative bg-white rounded-2xl border ${step.border} p-4 md:p-6 flex flex-col items-center text-center gap-3`}
                        >
                            {/* Step number */}
                            <span className="absolute top-3 left-3 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                {String(i + 1).padStart(2, "0")}
                            </span>

                            {/* Arrow connector */}
                            {i < STEPS.length - 1 && (
                                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                                    <ChevronRight className="w-5 h-5 text-slate-200" />
                                </div>
                            )}

                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${step.bg} flex items-center justify-center`}>
                                <step.icon className={`w-5 h-5 md:w-6 md:h-6 ${step.color}`} />
                            </div>
                            <div>
                                <h3 className={`text-xs md:text-sm font-black uppercase tracking-tight ${step.color} mb-1`}>
                                    {step.label}
                                </h3>
                                <p className="text-[10px] text-slate-400 font-medium leading-snug hidden md:block">
                                    {step.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Estimated time banner */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-6 md:mt-8 bg-slate-900 rounded-2xl px-6 md:px-10 py-5 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">Estimated Delivery</p>
                            <p className="text-sm md:text-base font-black text-white">2–5 Business Days · Across All Pakistan</p>
                        </div>
                    </div>
                    <a
                        href="tel:+923709573005"
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-full transition-all border border-white/10"
                    >
                        <Phone className="w-3.5 h-3.5" /> Call Support
                    </a>
                </motion.div>
            </section>

            <Footer />
        </main>
    );
}
