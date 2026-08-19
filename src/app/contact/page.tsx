"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-background pt-36 md:pt-44">
            <Navbar />

            <section className="pt-36 md:pt-44 pb-20 md:pb-32 container mx-auto px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16 md:mb-24">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl md:text-5xl font-black tracking-tighter mb-4 italic uppercase"
                        >
                            Get in Touch
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground max-w-2xl mx-auto font-medium"
                        >
                            Whether you have a question about our frames, need help with your prescription, or just want to say hello, we're here to help.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Contact Info Cards */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <a href="tel:03709573005" className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-primary/20 transition-all group">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Phone className="w-6 h-6 text-primary" />
                                    </div>
                                    <h4 className="font-black italic uppercase text-sm mb-1">Call Us</h4>
                                    <p className="text-slate-600 font-bold">0370 9573005</p>
                                </a>

                                <a href="https://wa.me/923709573005" target="_blank" rel="noopener noreferrer" className="p-6 bg-green-50 rounded-[2rem] border border-green-100 hover:border-green-500/20 transition-all group">
                                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <MessageCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h4 className="font-black italic uppercase text-sm mb-1 text-green-700">WhatsApp</h4>
                                    <p className="text-green-600 font-bold">Message Now</p>
                                </a>
                            </div>

                            <a href="mailto:Lensvikoptics@gmail.com" className="block p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-primary/20 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Mail className="w-7 h-7 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-black italic uppercase text-sm mb-1">Email Address</h4>
                                        <p className="text-slate-600 font-bold">Lensvikoptics@gmail.com</p>
                                    </div>
                                </div>
                            </a>

                            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mt-1">
                                        <MapPin className="w-7 h-7 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-black italic uppercase text-sm mb-1">Visit Our Store</h4>
                                        <p className="text-slate-600 font-bold leading-relaxed">
                                            Shop 1, Ground Floor, Umar Centre,<br />F-8 Markaz, Islamabad
                                        </p>
                                        <div className="mt-4 inline-flex items-center gap-2 text-primary font-black text-xs uppercase italic tracking-widest">
                                            Open Mon - Sat: 11AM - 9PM
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50"
                        >
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-6">Send us a Message</h3>
                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                        <input type="text" placeholder="John Doe" className="w-full h-12 px-6 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                        <input type="email" placeholder="john@example.com" className="w-full h-12 px-6 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                                    <input type="text" placeholder="How can we help?" className="w-full h-12 px-6 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Message</label>
                                    <textarea placeholder="Write your message here..." rows={4} className="w-full px-6 py-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none" />
                                </div>
                                <Button className="w-full h-14 bg-primary text-white rounded-xl font-black italic uppercase tracking-widest group">
                                    <Send className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
                                    Send Message
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
