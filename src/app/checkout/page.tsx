"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, ShieldCheck, MapPin, Phone, User, Truck, Info, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { MessageCircle } from "lucide-react";

const PAKISTANI_CITIES = [
    "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Bahawalpur", "Sargodha", "Sukkur"
];

export default function CheckoutPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        city: "",
        address: ""
    });

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
            toast.error("Please fill in all shipping details");
            return;
        }

        if (!/^((\+92)|(0092)|(0))3\d{9}$/.test(formData.phone)) {
            toast.error("Please enter a valid Pakistani phone number");
            return;
        }

        setIsProcessing(true);
        try {
            const orderPayload = {
                customerName: formData.fullName,
                customerEmail: formData.email || `${formData.phone}@lensvik.com`,
                customerPhone: formData.phone,
                shippingAddress: {
                    street: formData.address,
                    city: formData.city,
                    state: "Punjab", // Default or add field
                    zipCode: "00000",
                    country: "Pakistan"
                },
                status: 'Pending',
                paymentMethod: "COD",
                paymentStatus: "Pending",
                items: cart.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    variant: {
                        color: item.color || "N/A",
                        size: item.size || "M",
                        lensType: item.lensType || "Clear"
                    },
                    prescription: item.prescription ? {
                        measurements: item.prescription.measurements,
                        lensCategory: { name: item.prescription.lensCategory.name, price: item.prescription.lensCategory.price },
                        lensType: { name: item.prescription.lensType.name, price: item.prescription.lensType.price }
                    } : undefined
                })),
                totalAmount: cartTotal
            };

            const res = await fetch(`${window.location.origin}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
            });

            const responseData = await res.json();
            if (!res.ok) {
                const errorMessage = responseData?.error || 'Failed to place order';
                throw new Error(errorMessage);
            }

            toast.success(`Order ${responseData._id || ''} placed successfully!`);
            clearCart();
            // Redirect or show success message
        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error(error?.message || "Something went wrong. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <main className="min-h-screen bg-background pt-44">
                <Navbar />
                <div className="container mx-auto px-6 text-center py-16">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter mb-3 italic">Your cart is empty</h1>
                    <p className="text-muted-foreground mb-6 text-sm font-medium">Looks like you haven't added anything to your cart yet.</p>
                    <Link href="/collections">
                        <Button className="rounded-full h-11 px-8 font-black text-base bg-primary hover:scale-105 transition-transform italic">Start Shopping</Button>
                    </Link>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background pt-44 pb-24">
            <Navbar />
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-5xl font-black tracking-tighter italic uppercase text-slate-900">Checkout</h1>
                    <div className="w-12 md:w-20 h-1 md:h-1.5 bg-primary mt-1.5 md:mt-3 rounded-full" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start">
                    {/* LEFT: Shipping Details Form */}
                    <div className="space-y-6 md:space-y-8">
                        <section className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Truck className="w-24 h-24 text-primary" />
                            </div>

                            <h2 className="text-xl md:text-2xl font-black tracking-tight mb-5 md:mb-6 flex items-center gap-2 italic uppercase text-slate-800">
                                <MapPin className="text-primary w-5 h-5 md:w-6 md:h-6" />
                                Shipping Details
                            </h2>

                            <form className="space-y-4" onSubmit={handleCheckout}>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            required
                                            className="w-full h-11 rounded-xl bg-slate-50 border border-slate-100 pl-12 pr-6 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-sm text-slate-800"
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input
                                                type="tel"
                                                placeholder="03XX XXXXXXX"
                                                required
                                                className="w-full h-11 rounded-xl bg-slate-50 border border-slate-100 pl-12 pr-6 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-sm text-slate-800"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">City</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input
                                                list="pk-cities"
                                                placeholder="Select City"
                                                required
                                                className="w-full h-11 rounded-xl bg-slate-50 border border-slate-100 pl-12 pr-6 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-sm text-slate-800"
                                                value={formData.city}
                                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            />
                                            <datalist id="pk-cities">
                                                {PAKISTANI_CITIES.map(city => <option key={city} value={city} />)}
                                            </datalist>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Shipping Address</label>
                                    <textarea
                                        placeholder="House number, Street, Area..."
                                        required
                                        rows={3}
                                        className="w-full rounded-xl bg-slate-50 border border-slate-100 p-4 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium resize-none text-sm text-slate-800"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4">
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Payment Method</h3>
                                    <div className="p-4 rounded-xl md:rounded-2xl border-2 border-primary bg-primary/5 flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                                                <Info className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm md:text-base italic text-slate-800">Cash on Delivery (COD)</p>
                                                <p className="text-[9px] md:text-[10px] text-slate-400 font-medium">Pay when you receive your package</p>
                                            </div>
                                        </div>
                                        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                                            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-primary" />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </section>
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="space-y-6 md:space-y-8">
                        <section className="bg-slate-50 p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-100 relative">
                            <h2 className="text-xl md:text-2xl font-black tracking-tight mb-5 md:mb-6 italic uppercase text-slate-800">Order Summary</h2>

                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 mb-6 custom-scrollbar">
                                <AnimatePresence>
                                    {cart.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            className="flex gap-3 items-center p-3 bg-white rounded-2xl border border-slate-100 shadow-sm group"
                                        >
                                            <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0">
                                                <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xs font-black uppercase text-slate-800 truncate group-hover:text-primary transition-colors">{item.name}</h3>
                                                {item.prescription && (
                                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                                        <span className="text-[7px] bg-primary/10 text-primary px-1 py-0.5 rounded font-black uppercase">{item.prescription.lensCategory.name}</span>
                                                        <span className="text-[7px] bg-slate-100 text-slate-400 px-1 py-0.5 rounded font-black uppercase">{item.prescription.lensType.name}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between mt-1.5">
                                                    <p className="text-xs font-black text-primary italic">Rs {item.price.toLocaleString()}</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <Button
                                                            variant="ghost" size="icon" className="w-5 h-5 rounded-full"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </Button>
                                                        <span className="text-[11px] font-bold w-3 text-center">{item.quantity}</span>
                                                        <Button
                                                            variant="ghost" size="icon" className="w-5 h-5 rounded-full"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost" size="icon"
                                                className="text-red-400 hover:bg-red-50 rounded-full shrink-0 w-8 h-8"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-100">
                                <div className="flex justify-between text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span className="text-slate-800">Rs {cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                    <span>Shipping</span>
                                    <span className="text-emerald-500">FREE</span>
                                </div>
                                <div className="h-[1px] bg-slate-100 my-4" />
                                <div className="flex justify-between items-end">
                                    <span className="text-sm md:text-base font-black italic tracking-tighter uppercase text-slate-400">Net Total</span>
                                    <div className="text-right">
                                        <p className="text-2xl md:text-3xl font-black text-primary font-sans italic tracking-tighter">Rs {cartTotal.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mt-6 md:mt-8">
                                {/* COD Button */}
                                <Button
                                    type="submit"
                                    onClick={handleCheckout}
                                    disabled={isProcessing}
                                    className="w-full h-12 md:h-14 rounded-full font-black text-base md:text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all italic active:scale-95 group relative overflow-hidden text-white"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                    {isProcessing ? "Processing..." : "Place Order (COD)"}

                                    <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1.5 transition-transform" />
                                </Button>

                                {/* WhatsApp Order Button */}
                                <a
                                    href={`https://wa.me/923709573005?text=${encodeURIComponent(
                                        `Hello Lensvik, I want to place an order.

Name: ${formData.fullName}
Phone: ${formData.phone}
City: ${formData.city}
Address: ${formData.address}

Order Details:
${cart
                                            .map(
                                                (item) =>
                                                    `• ${item.name} x${item.quantity} - Rs ${(
                                                        item.price * item.quantity
                                                    ).toLocaleString()}`
                                            )
                                            .join("\n")}

Total: Rs ${cartTotal.toLocaleString()}`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <Button
                                        type="button"
                                        className="w-full h-12 md:h-14 rounded-full font-black text-base md:text-lg bg-green-500 hover:bg-green-600 shadow-xl shadow-green-500/20 hover:scale-[1.02] transition-all italic active:scale-95 group text-white"
                                    >
                                        <MessageCircle className="mr-2 w-5 h-5" />
                                        Order via WhatsApp
                                    </Button>
                                </a>
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-4 p-3 bg-white/50 rounded-xl border border-white/50">
                                <div className="flex items-center gap-1.5 text-[7px] md:text-[8px] uppercase font-bold tracking-widest text-slate-400">
                                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                    Authentic
                                </div>
                                <div className="w-[1px] h-3 bg-slate-100" />
                                <div className="flex items-center gap-1.5 text-[7px] md:text-[8px] uppercase font-bold tracking-widest text-slate-400">
                                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                    Returns
                                </div>
                                <div className="w-[1px] h-3 bg-slate-100" />
                                <div className="flex items-center gap-1.5 text-[7px] md:text-[8px] uppercase font-bold tracking-widest text-slate-400">
                                    <Truck className="w-3 h-3 text-emerald-500" />
                                    Fast Delivery
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
