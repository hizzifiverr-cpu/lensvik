"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <section className="pt-36 md:pt-44 pb-20 md:pb-32 container mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-black tracking-tighter mb-10 md:mb-16 text-center uppercase italic"
                    >
                        Our Story
                    </motion.h1>

                    <div className="aspect-video rounded-2xl overflow-hidden mb-12 shadow-xl relative">
                        <Image
                            src="/images/WhatsApp-Image-2025-11-22-at-3.17.43-PM-1.jpeg"
                            alt="Lensvik Team"
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 1024px"
                        />
                        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
                    </div>

                    <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-8">
                        <p className="text-xl text-foreground font-medium italic border-l-4 border-primary pl-4">
                            "Vision is not just seeing; it's experiencing the world with clarity and confidence."
                        </p>
                        <p>
                            Founded in 2024, LENSVIK was born out of a simple problem: the uncertainty of buying eyewear online. We saw a gap between high-end fashion and functional accuracy. How can you be sure a frame fits your unique face shape? How can you trust the measurements without walking into a physical clinic?
                        </p>
                        <p>
                            Our team of optometrists, AI engineers, and designers came together to build something revolutionary. Using MediaPipe face tracking and biometric analysis, we've developed a Virtual Try-On (VTO) experience that doesn't just "filter" glasses onto your face—it measures your pupillary distance and face width with sub-millimeter precision.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-12">
                            <div className="bg-primary text-white p-12 rounded-[2rem] shadow-xl">
                                <h3 className="text-2xl font-bold mb-3 text-white">Our Mission</h3>
                                <p className="opacity-90">To democratize premium eyewear by combining state-of-the-art AI technology with timeless design, ensuring every customer finds their perfect fit from the comfort of their home.</p>
                            </div>
                            <div className="bg-white border border-border p-12 rounded-[2rem] shadow-xl">
                                <h3 className="text-2xl font-bold mb-3 text-primary">Our Values</h3>
                                <ul className="space-y-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                    <li className="flex items-center gap-3"><span className="w-2 h-2 bg-primary rounded-full" /> Precision Engineering</li>
                                    <li className="flex items-center gap-3"><span className="w-2 h-2 bg-primary rounded-full" /> Transparent Quality</li>
                                    <li className="flex items-center gap-3"><span className="w-2 h-2 bg-primary rounded-full" /> Customer First Vision</li>
                                    <li className="flex items-center gap-3"><span className="w-2 h-2 bg-primary rounded-full" /> Fashion & Function</li>
                                </ul>
                            </div>
                        </div>

                        <p>
                            Today, LENSVIK is more than just an eyewear store. We are a technology hub dedicated to the future of retail. Every frame in our collection is handpicked for its durability and aesthetic appeal, and then mapped digitally to ensure perfect VTO compatibility.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
