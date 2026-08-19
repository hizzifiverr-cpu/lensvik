"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronUp, Search, MessageCircle, HelpCircle, Package, Eye, CreditCard, ShieldCheck } from "lucide-react";

const FAQ_DATA = [
    {
        category: "Ordering & Customization",
        icon: Eye,
        items: [
            {
                q: "How do I provide my prescription?",
                a: "Simply select your frame and use our 'Select Lenses' configurator. You can enter your SPH, CYL, AXIS, and ADD values directly from your prescription slip. If you're unsure, you can also upload a photo of your prescription after checkout.",
            },
            {
                q: "Can I use my own frame for lenses?",
                a: "Currently, we only provide lenses for frames purchased from Lensvik to ensure 100% optical accuracy and fitment quality.",
            },
            {
                q: "What types of lenses do you offer?",
                a: "We offer Standard Antiglare, Lensvik Blu Screen (Blue Light Blocking), Lensvik Blu Pro (High-End Blue Light), and Smart Transition (Photochromic) lenses in both Single Vision and Progressive options.",
            },
        ]
    },
    {
        category: "Shipping & Tracking",
        icon: Package,
        items: [
            {
                q: "How long does delivery take?",
                a: "Orders usually take 2-5 business days for delivery nationwide across Pakistan. Custom prescription lenses require 1-2 extra days for clinical verification and processing.",
            },
            {
                q: "Is shipping free?",
                a: "Yes! We offer free standard delivery nationwide for all orders above Rs 2,000.",
            },
            {
                q: "How can I track my order?",
                a: "You can track your order in real-time on our 'Track Order' page using your Order ID provided in your confirmation email or WhatsApp message.",
            },
        ]
    },
    {
        category: "Returns & Quality",
        icon: ShieldCheck,
        items: [
            {
                q: "What is your return policy?",
                a: "We offer a 30-day hassle-free return policy for unused frames. For prescription lenses, if there is a clinical error on our end, we provide a free remake guarantee.",
            },
            {
                q: "How do I know the frame will fit me?",
                a: "We highly recommend using our AI-powered Virtual Try-On (VTO) tool. It measures your face dimensions live to show you exactly how each frame will sit on your face.",
            },
            {
                q: "Do your products come with a warranty?",
                a: "Yes, all Lensvik frames come with a 2-year structural warranty against manufacturing defects.",
            },
        ]
    },
    {
        category: "Payments",
        icon: CreditCard,
        items: [
            {
                q: "What payment methods do you accept?",
                a: "We primarily offer Cash on Delivery (COD) for all orders within Pakistan. Online payment methods via bank transfer or card are currently being integrated.",
            },
            {
                q: "Are there any hidden charges?",
                a: "No. The price you see on the checkout page is the final price you pay. Taxes and delivery (for orders over Rs 2,000) are included.",
            },
        ]
    }
];

function FaqItem({ q, a }: { q: string; a: string }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-5 flex items-center justify-between text-left group gap-4"
            >
                <span className={`text-sm md:text-base font-black uppercase tracking-tight italic transition-colors ${isOpen ? "text-primary" : "text-slate-800 group-hover:text-primary"}`}>
                    {q}
                </span>
                {isOpen 
                    ? <ChevronUp className="w-5 h-5 text-primary shrink-0" /> 
                    : <ChevronDown className="w-5 h-5 text-slate-300 group-hover:text-primary shrink-0 transition-colors" />
                }
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-sm md:text-base text-slate-500 font-medium leading-relaxed italic pr-6 md:pr-12">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FaqPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <main className="min-h-screen bg-[#fafafa]">
            <Navbar />

            {/* ── Hero section ── */}
            <section className="relative pt-36 md:pt-44 pb-12 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-3"
                        >
                            Support Center
                        </motion.span>
                        <motion.h1 
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none text-slate-900 mb-8"
                        >
                            Common Inquiries
                        </motion.h1>
                        
                        {/* Search bar */}
                        <div className="relative max-w-xl mx-auto">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search your question..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 md:h-16 pl-14 pr-6 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-100/50 text-base font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FAQ Categories ── */}
            <section className="pb-32 md:pb-48 container mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto space-y-12">
                    {FAQ_DATA.map((cat, i) => (
                        <motion.div 
                            key={cat.category}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <cat.icon className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-lg md:text-xl font-black uppercase tracking-tight italic text-slate-900">{cat.category}</h2>
                            </div>
                            <div className="bg-white rounded-[2rem] border border-slate-100 px-6 md:px-8 shadow-sm">
                                {cat.items.filter(item => 
                                    item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    item.a.toLowerCase().includes(searchQuery.toLowerCase())
                                ).map((item, idx) => (
                                    <FaqItem key={idx} q={item.q} a={item.a} />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* WhatsApp CTA */}
                <div className="max-w-4xl mx-auto mt-16 p-8 rounded-[2.5rem] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <HelpCircle className="w-32 h-32" />
                    </div>
                    <div className="text-center md:text-left relative z-10">
                        <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight mb-2">Still need help?</h3>
                        <p className="text-slate-400 font-medium italic text-sm md:text-base">Our clinical consultants are available on WhatsApp for direct assistance.</p>
                    </div>
                    <a 
                        href="https://wa.me/923709573005"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-14 px-8 rounded-2xl bg-[#25D366] hover:bg-[#25D366]/90 text-white font-black italic uppercase tracking-widest text-xs shadow-xl shadow-green-500/20 transition-all flex items-center justify-center gap-3 shrink-0 uppercase tracking-widest"
                    >
                        <MessageCircle className="w-4 h-4" /> Message Us
                    </a>
                </div>
            </section>

            <Footer />
        </main>
    );
}
