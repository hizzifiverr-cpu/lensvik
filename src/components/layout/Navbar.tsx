"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, Menu, X, MessageCircle, LogOut, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import { SearchIcon } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const SearchOverlay = dynamic(() => import("./SearchOverlay").then(mod => mod.SearchOverlay), {
    ssr: false
});

export function Navbar() {
    const { cartCount } = useCart();
    const { customer, logout } = useCustomer();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const menuItems = [
        { name: "Home", href: "/" },
        { name: "Shop", href: "/collections" },
        { name: "Eyeglasses", href: "/category/eyeglasses" },
        { name: "Sunglasses", href: "/category/sunglasses" },
        { name: "Lensvik Collection", href: "/collections" },
    ];

    const secondaryItems = [
        { name: "Track Order", href: "/track-order" },
        { name: "Returns", href: "/return-policy" },
    ];

    return (
        <header className="fixed top-0 w-full z-50">
            {/* Top Bar - Slimmed down */}
            <div className="bg-primary text-white py-0.5 md:py-1 px-6 hidden md:block text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-center border-b border-white/5">
                Free Shipping on All Orders Over Rs 15,000 | Code: <span className="text-white/100">LENSVIK10</span>
            </div>

            {/* Main Navbar - Condensed Single Level */}
            <nav className="glass border-b border-white/20 py-0.5 md:py-0.5">
                <div className="w-full max-w-[1400px] mx-auto px-3 md:px-8 flex items-center justify-between gap-2">
                    {/* Brand & Desktop Logo */}
                    <div className="flex items-center gap-8 md:gap-12 shrink-0">
                        <Link href="/" className="relative flex items-center">
                            <Image
                                src="/logo-1.png"
                                alt="Lensvik"
                                width={350}
                                height={200}
                                className="h-22 md:h-[122px] w-auto object-contain transition-all duration-300"
                                priority={true}
                            />
                        </Link>

                        {/* Integrated Navigation Menu (Desktop Only) */}
                        <div className="hidden lg:flex items-center gap-7">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="btn-text hover:text-primary transition-all duration-300 relative group hover:-translate-y-0.5"
                                >
                                    {item.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right-side Actions */}
                    <div className="flex items-center gap-2 md:gap-4">

                        {/* Secondary Links - Hidden on Mobile, Enhanced on Desktop */}
                        <div className="hidden xl:flex items-center gap-2 mr-4">
                            {secondaryItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="px-3 py-1.5 bg-slate-100/80 hover:bg-primary hover:text-white transition-all rounded-full text-[11px] font-black uppercase tracking-wider text-slate-900 italic"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-9 h-9 md:w-10 md:h-10 text-slate-800"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <SearchIcon className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                        </Button>

                        {customer ? (
                            <div className="hidden md:flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 max-w-[100px] truncate">
                                    Hi, {customer.name}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={logout}
                                    className="w-9 h-9 md:w-10 md:h-10 text-slate-800"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                                </Button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" className="text-slate-800 font-bold text-xs uppercase tracking-tight">
                                        <User className="w-4 h-4 mr-1.5" />
                                        Sign In
                                    </Button>
                                </Link>
                     
                            </div>
                        )}
                        <Link href="/cart">
                            <Button variant="ghost" size="icon" className="relative w-9 h-9 md:w-10 md:h-10 text-slate-800">
                                <ShoppingCart className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[8px] md:text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow-lg shadow-primary/20">
                                        {cartCount}
                                    </span>
                                )}
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden w-9 h-9 text-slate-800"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <Menu className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`lg:hidden fixed inset-0 z-50 bg-white/98 backdrop-blur-2xl transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
                <div className="flex flex-col h-full p-6 pb-12">
                    <div className="flex items-center justify-between mb-12">
                        <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                            <Image src="/logo-1.png" alt="Lensvik" width={280} height={100} className="h-28 w-auto object-contain" />
                        </Link>
                        <Button variant="ghost" size="icon" className="text-slate-900" onClick={() => setIsMenuOpen(false)}>
                            <X className="w-8 h-8" />
                        </Button>
                    </div>

                    <div className="flex flex-col gap-6 overflow-y-auto">
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-xl font-black italic uppercase tracking-tighter text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between group"
                            >
                                {item.name}
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                            </Link>
                        ))}

                        <div className="mt-8 pt-8 grid grid-cols-1 gap-3">
                            {secondaryItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="px-5 py-3 bg-slate-50 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-900 italic flex items-center justify-between group"
                                >
                                    {item.name}
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Customer Support</p>
                                <p className="text-xl font-black text-primary italic">0370 9573005</p>
                            </div>
                            <Link href="https://wa.me/923709573005" target="_blank" rel="noopener noreferrer">
                                <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-black italic uppercase tracking-widest h-12 rounded-xl">
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    WhatsApp Us
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isSearchOpen && (
                    <SearchOverlay
                        isOpen={isSearchOpen}
                        onClose={() => setIsSearchOpen(false)}
                    />
                )}
            </AnimatePresence>
        </header>
    );
}
