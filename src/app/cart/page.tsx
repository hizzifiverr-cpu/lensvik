"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    ShieldCheck,
    Truck,
    ArrowRight,
    Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/layout/Footer";

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

    /* ── Empty state ── */
    if (cart.length === 0) {
        return (
            <main className="min-h-screen bg-background pt-36 md:pt-44">
                <Navbar />

                <div className="container mx-auto px-4 flex flex-col items-center text-center py-24">
                    <div className="w-20 h-20 bg-primary/8 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/10">
                        <ShoppingCart className="w-8 h-8 text-primary" />
                    </div>

                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter mb-2 italic uppercase">
                        Your cart is empty
                    </h1>

                    <p className="text-sm text-slate-400 mb-8 font-medium">
                        Add some eyewear to get started.
                    </p>

                    <Link href="/collections">
                        <Button className="rounded-full h-11 px-8 font-bold text-sm bg-primary hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                            Start Shopping
                        </Button>
                    </Link>
                </div>

                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#fafafa] pt-36 md:pt-44 pb-20">
            <Navbar />

            <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6">
                {/* Page header */}
                <div className="mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase text-slate-900">
                        Shopping Cart
                    </h1>

                    <div className="mt-4 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                                {cartCount} item{cartCount !== 1 ? "s" : ""}
                            </span>

                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                                • Subtotal Rs {cartTotal.toLocaleString()}
                            </span>
                        </div>

                        <p className="text-sm text-slate-500 max-w-2xl">
                            Review the products in your cart, adjust quantities, or proceed to checkout to complete your order.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* ── LEFT: Cart Items List ── */}
                    <div className="lg:col-span-2">
                        <section className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm p-5 md:p-8">
                            <h2 className="font-black text-lg md:text-xl uppercase tracking-tight italic text-slate-900 mb-6 flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                Items in Cart
                            </h2>

                            <div className="space-y-4">
                                <AnimatePresence>
                                    {cart.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{
                                                opacity: 0,
                                                y: -10,
                                                height: 0,
                                            }}
                                            className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary/20 hover:bg-primary/2 transition-all"
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-24 h-24 md:w-32 md:h-32 relative rounded-xl overflow-hidden bg-white border border-slate-100 shrink-0">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-contain p-2"
                                                    sizes="128px"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0 pt-1">
                                                <h3 className="text-sm md:text-base font-black uppercase tracking-tight text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                                                    {item.name}
                                                </h3>

                                                {item.prescription && (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-black uppercase tracking-wide">
                                                            {
                                                                item.prescription
                                                                    .lensCategory
                                                                    .name
                                                            }
                                                        </span>

                                                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-black uppercase tracking-wide">
                                                            {
                                                                item.prescription
                                                                    .lensType
                                                                    .name
                                                            }
                                                        </span>
                                                    </div>
                                                )}

                                                {item.color && (
                                                    <p className="text-[11px] text-slate-400 font-medium mt-1.5">
                                                        Color:{" "}
                                                        <span className="text-slate-600 font-semibold">
                                                            {item.color}
                                                        </span>
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between mt-3 gap-3">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-2 py-1">
                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.id,
                                                                    item.quantity - 1
                                                                )
                                                            }
                                                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600"
                                                        >
                                                            <Minus className="w-3.5 h-3.5" />
                                                        </button>

                                                        <span className="text-xs font-black w-6 text-center text-slate-900">
                                                            {item.quantity}
                                                        </span>

                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.id,
                                                                    item.quantity + 1
                                                                )
                                                            }
                                                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-400 font-medium">
                                                            Unit Price
                                                        </p>

                                                        <p className="text-lg font-black text-primary">
                                                            Rs {item.price.toLocaleString()}
                                                        </p>

                                                        <p className="text-xs text-slate-400 mt-1">
                                                            Total: Rs {(
                                                                item.price *
                                                                item.quantity
                                                            ).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() =>
                                                    removeFromCart(item.id)
                                                }
                                                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0 mt-1"
                                                title="Remove from cart"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Continue Shopping Button */}
                            <Link href="/collections" className="block mt-6">
                                <Button
                                    variant="outline"
                                    className="w-full h-11 rounded-xl font-bold text-sm text-primary border-primary/20 hover:border-primary hover:bg-primary/5"
                                >
                                    Continue Shopping
                                </Button>
                            </Link>
                        </section>
                    </div>

                    {/* ── RIGHT: Cart Summary ── */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-40 space-y-4">
                            {/* Order Summary Card */}
                            <section className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm p-5 md:p-7">
                                <h2 className="font-black text-base md:text-lg uppercase tracking-tight italic text-slate-900 mb-4">
                                    Order Summary
                                </h2>

                                <div className="flex items-center justify-between text-sm text-slate-500 mb-5">
                                    <span>{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
                                    <span className="font-medium">Ready for checkout</span>
                                </div>

                                {/* Totals */}
                                <div className="space-y-3 pb-5 border-b border-slate-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 font-medium">
                                            Subtotal
                                        </span>

                                        <span className="font-black text-slate-900">
                                            Rs {cartTotal.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 font-medium">
                                            Shipping
                                        </span>

                                        <span className="font-black text-emerald-600">
                                            FREE
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-5 space-y-4">
                                    <div>
                                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mb-1">
                                            Total Amount
                                        </p>

                                        <p className="text-3xl md:text-4xl font-black text-primary leading-none">
                                            Rs {cartTotal.toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Checkout Button */}
                                    <Link href="/checkout" className="block">
                                        <Button className="w-full h-12 md:h-13 rounded-2xl font-black uppercase tracking-widest text-sm bg-gradient-to-r from-primary to-slate-900 hover:from-primary/90 hover:to-slate-900/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden">
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                Proceed to Checkout

                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                            </span>
                                        </Button>
                                    </Link>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}