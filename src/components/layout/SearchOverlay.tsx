"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X, ArrowRight, Loader2, History } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getProducts, Product } from "@/lib/api";

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch products once on open
    useEffect(() => {
        if (isOpen) {
            const fetchProducts = async () => {
                const products = await getProducts();
                setAllProducts(products);
                inputRef.current?.focus();
            };
            fetchProducts();
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
            setQuery("");
            setResults([]);
        }
    }, [isOpen]);

    // Live search logic
    useEffect(() => {
        if (query.length > 1) {
            setIsLoading(true);
            const debounce = setTimeout(() => {
                const filtered = allProducts.filter(p => 
                    p.name.toLowerCase().includes(query.toLowerCase()) ||
                    p.category.toLowerCase().includes(query.toLowerCase()) ||
                    p.gender?.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 6);
                setResults(filtered);
                setIsLoading(false);
            }, 300);
            return () => clearTimeout(debounce);
        } else {
            setResults([]);
            setIsLoading(false);
        }
    }, [query, allProducts]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            />

            {/* Search Panel */}
            <motion.div
                initial={{ y: "-100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative bg-white w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            >
                {/* Search Input Area */}
                <div className="border-b border-slate-100">
                    <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 py-6 md:py-10 flex items-center gap-6">
                        <SearchIcon className="w-6 h-6 md:w-8 md:h-8 text-slate-400 shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search frames, types, or collections..."
                            className="flex-1 bg-transparent border-none text-xl md:text-3xl font-black italic uppercase tracking-tighter outline-none placeholder:text-slate-200 text-slate-900"
                        />
                        <button 
                            onClick={onClose}
                            className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all group"
                        >
                            <X className="w-6 h-6 text-slate-400 group-hover:text-slate-900 transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                    <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 py-8 md:py-12">
                        {query.length > 0 ? (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 italic">
                                        {isLoading ? "Searching our collection..." : `Results for "${query}"`}
                                    </h3>
                                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                                </div>

                                {results.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {results.map((product) => {
                                            const productImage = product.image || product.images?.[1] || product.images?.[0] || '/images/dfd.png';
                                            const isDataUri = productImage.startsWith('data:');
                                            return (
                                            <Link 
                                                key={product._id} 
                                                href={`/products/${product._id}`}
                                                onClick={onClose}
                                                className="group bg-white p-4 rounded-3xl border border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all flex items-center gap-6"
                                            >
                                                <div className="relative w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden shrink-0">
                                                    {isDataUri ? (
                                                        <img
                                                            src={productImage}
                                                            alt={product.name}
                                                            className="w-full h-full object-contain p-2"
                                                        />
                                                    ) : (
                                                        <Image 
                                                            src={productImage} 
                                                            alt={product.name} 
                                                            fill 
                                                            className="object-contain p-2 group-hover:scale-110 transition-transform duration-500" 
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 group-hover:text-primary transition-colors leading-tight">
                                                        {product.name}
                                                    </h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase italic mt-1">{product.category}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-sm font-black italic text-primary">Rs {product.price.toLocaleString()}</span>
                                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                                                    </div>
                                                </div>
                                            </Link>
                                            );
                                        })}

                                    </div>
                                ) : !isLoading && (
                                    <div className="py-20 text-center">
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <SearchIcon className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-xl font-black uppercase italic text-slate-900">No results found</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase italic mt-2 tracking-widest">Try searching for &quot;Eyeglasses&quot; or &quot;Sunglasses&quot;</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Trending/Recent Search */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 italic flex items-center gap-2">
                                        <SearchIcon className="w-3 h-3" /> Trending Searches
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {["Classic Aviators", "Blue Blockers", "Titanium Frames", "NextGen Smart", "Reading Lenses"].map((t) => (
                                            <button 
                                                key={t}
                                                onClick={() => setQuery(t)}
                                                className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-[11px] font-black uppercase italic hover:border-primary hover:text-primary transition-all text-slate-600"
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 italic flex items-center gap-2">
                                        <History className="w-3 h-3" /> Quick Collections
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {["Eyeglasses", "Sunglasses", "NextGen", "Accessories"].map((c) => (
                                            <Link 
                                                key={c}
                                                href={`/category/${c.toLowerCase()}`}
                                                onClick={onClose}
                                                className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:border-primary/20 hover:bg-white transition-all group"
                                            >
                                                <span className="text-[11px] font-black uppercase italic text-slate-900">{c}</span>
                                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
