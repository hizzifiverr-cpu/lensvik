"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
    Facebook, Instagram, Twitter, Mail, Phone,
    MapPin, MessageCircle, ArrowRight, CheckCircle2
} from "lucide-react";

const FOOTER_NAV = {
    Shop: [
        { name: "All Eyewear", href: "/collections" },
        { name: "Eyeglasses", href: "/category/eyeglasses" },
        { name: "Sunglasses", href: "/category/sunglasses" },
        { name: "Blue Light", href: "/category/eyeglasses" },
        { name: "NextGen Collection", href: "/category/nextgen" },
    ],
    Support: [
        { name: "Track My Order", href: "/track-order" },
        { name: "Return Policy", href: "/return-policy" },
        { name: "FAQs", href: "/faqs" },
        { name: "About Lensvik", href: "/about" },
        { name: "Contact Us", href: "/contact" },
    ],
};

const SOCIALS = [
    { icon: Facebook, href: "#", label: "Facebook", ring: "hover:bg-[#1877F2]" },
    { icon: Instagram, href: "#", label: "Instagram", ring: "hover:bg-gradient-to-tr hover:from-yellow-500 hover:via-pink-500 hover:to-purple-600" },
    { icon: Twitter, href: "#", label: "Twitter", ring: "hover:bg-[#1DA1F2]" },
    { icon: MessageCircle, href: "https://wa.me/923709573005", label: "WhatsApp", ring: "hover:bg-[#25D366]", external: true },
];

const CERTS = ["UV400 Verified", "ISO Certified", "CE Compliant"];

export function Footer() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setSubscribed(true);
        setEmail("");
    };

    return (
        <footer className="bg-primary text-white relative z-10 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />



            {/* ── Main Grid ── */}
            <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-4 md:px-6 pt-8 md:pt-10 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-8 md:mb-10">

                    {/* Brand column — spans full width on mobile */}
                    <div className="col-span-2 md:col-span-1 space-y-5">
                        <Link href="/">
                            <Image
                                src="/logo-1.png"
                                alt="Lensvik"
                                width={400}
                                height={150}
                                className="h-36 md:h-48 w-auto object-contain brightness-0 invert"
                            />
                        </Link>
                        <p className="text-sm text-white leading-relaxed font-medium max-w-[250px]">
                            Redefining eyewear with AI precision — from prescription to doorstep.
                        </p>

                        {/* Social icons */}
                        <div className="flex gap-2">
                            {SOCIALS.map(({ icon: Icon, href, label, ring, external }) => (
                                <Link
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    target={external ? "_blank" : undefined}
                                    rel={external ? "noopener noreferrer" : undefined}
                                    className={`w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-white hover:text-primary ${ring} hover:border-transparent transition-all hover:scale-110`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                </Link>
                            ))}
                        </div>

                        {/* Certs */}

                    </div>

                    {/* Nav columns */}
                    {Object.entries(FOOTER_NAV).map(([heading, links]) => (
                        <div key={heading}>
                            <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-white mb-4 md:mb-5">
                                {heading}
                            </h4>
                            <ul className="space-y-2.5 md:space-y-3">
                                {links.map(link => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-white hover:text-white/80 transition-colors font-medium leading-none"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact column */}
                    <div>
                        <h4 className="text-[9px] font-black uppercase tracking-[0.25em] text-primary mb-4 md:mb-5">
                            Contact
                        </h4>
                        <div className="space-y-3">
                            <a href="tel:+923709573005" className="flex items-start gap-2.5 group">
                                <Phone className="w-4 h-4 text-white/60 mt-0.5 shrink-0 group-hover:text-white" />
                                <span className="text-sm text-white/60 group-hover:text-white transition-colors font-medium">0370 9573005</span>
                            </a>
                            <a href="mailto:Lensvikoptics@gmail.com" className="flex items-start gap-2.5 group">
                                <Mail className="w-4 h-4 text-white/60 mt-0.5 shrink-0 group-hover:text-white" />
                                <span className="text-sm text-white/60 group-hover:text-white transition-colors font-medium break-all">Lensvikoptics@gmail.com</span>
                            </a>
                            <Link
                                href="https://wa.me/923709573005"
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-start gap-2.5 group"
                            >
                                <MessageCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                <span className="text-sm text-emerald-400/70 group-hover:text-emerald-400 transition-colors font-medium">WhatsApp Us</span>
                            </Link>
                            <div className="flex items-start gap-2.5">
                                <MapPin className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
                                <span className="text-sm text-white/40 font-medium leading-relaxed">
                                    Shop 1, Ground Floor,<br />Umar Centre, F-8 Markaz,<br />Islamabad
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Bottom Bar ── */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] text-white font-medium order-2 sm:order-1">
                        © {new Date().getFullYear()} <Link href="/lensvik-admin-x7k2" className="hover:opacity-80 transition-opacity">LENSVIK</Link> Eyewear · All rights reserved.
                    </p>

                    <div className="flex items-center gap-4 text-[10px] font-medium text-white/60 order-1 sm:order-2 uppercase tracking-widest">
                        <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <span>·</span>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
                    </div>                </div>
            </div>
        </footer>
    );
}
