"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { RefreshCcw, ShieldCheck, Clock, Truck } from "lucide-react";

export default function ReturnPolicyPage() {
    const policies = [
        {
            icon: RefreshCcw,
            title: "30-Day Easy Returns",
            content: "We offer a 30-day money-back guarantee for all non-prescription eyewear. If you're not satisfied, simply return them in original condition."
        },
        {
            icon: ShieldCheck,
            title: "Quality Guarantee",
            content: "All our products undergo rigorous quality checks. If you receive a damaged or defective item, we'll replace it at no extra cost."
        },
        {
            icon: Clock,
            title: "Fast Processing",
            content: "Once we receive your return, it will be processed within 3-5 business days. Refunds will be issued to your original payment method."
        },
        {
            icon: Truck,
            title: "Prepaid Returns",
            content: "For all domestic orders, we provide a prepaid return label. International returns are subject to shipping fees."
        }
    ];

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <section className="pt-36 md:pt-44 pb-12 container mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-black tracking-tighter mb-4 text-center uppercase italic"
                    >
                        Return Policy
                    </motion.h1>
                    <p className="text-lg text-muted-foreground text-center mb-12">
                        Our goal is to ensure you see the world clearly. If it doesn't fit, we'll make it right.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                        {policies.map((policy, index) => (
                            <motion.div
                                key={policy.title}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 rounded-2xl glass border border-primary/10 hover:border-primary/30 transition-all group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                    <policy.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{policy.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {policy.content}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="bg-primary/5 p-12 rounded-[3rem] border border-primary/20">
                        <h2 className="text-2xl font-bold mb-6 tracking-tight">Important Conditions</h2>
                        <ul className="space-y-6 text-muted-foreground">
                            <li className="flex items-start gap-4">
                                <span className="w-2 h-2 rounded-full bg-primary mt-2.5 shrink-0" />
                                <span>Items must be returned in their original packaging, including the case, cleaning cloth, and any certificates of authenticity.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="w-2 h-2 rounded-full bg-primary mt-2.5 shrink-0" />
                                <span>**Prescription Lenses:** Since prescription lenses are custom-made to your specifications, we offer a 50% refund or a one-time free remake for lens-related issues within 14 days.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="w-2 h-2 rounded-full bg-primary mt-2.5 shrink-0" />
                                <span>Items showing signs of wear and tear, or accidental damage after delivery, are not eligible for return.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="w-2 h-2 rounded-full bg-primary mt-2.5 shrink-0" />
                                <span>Promotional "Free Gift" items must also be returned with the main product to receive a full refund.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
