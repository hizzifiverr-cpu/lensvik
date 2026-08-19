"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/products/ProductCard";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface ProductStripProps {
    title: string;
    subtitle?: string;
    products: any[];
    viewAllHref: string;
    lightBg?: boolean;
    loading?: boolean;
    scrollable?: boolean;
}

export function ProductStrip({ title, subtitle, products, viewAllHref, lightBg = false, loading = false, scrollable = false }: ProductStripProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' 
                ? scrollLeft - clientWidth * 0.8 
                : scrollLeft + clientWidth * 0.8;
            
            scrollRef.current.scrollTo({
                left: scrollTo,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className={`py-12 md:py-20 ${lightBg ? 'bg-primary/5' : 'bg-background'}`}>
            <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
                    <div>
                        <h2 className="text-3xl md:text-6xl font-black tracking-tighter mb-2 md:mb-3 uppercase italic leading-none">{title}</h2>
                        {subtitle && <p className="text-sm md:text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed italic">{subtitle}</p>}
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {scrollable && (
                            <div className="hidden md:flex items-center gap-2 mr-6">
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="w-12 h-12 rounded-full border-slate-200 hover:bg-primary hover:text-white transition-all"
                                    onClick={() => scroll('left')}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="w-12 h-12 rounded-full border-slate-200 hover:bg-primary hover:text-white transition-all"
                                    onClick={() => scroll('right')}
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </div>
                        )}
                        <Link href={viewAllHref} className="flex items-center gap-2 text-xs md:text-sm font-black uppercase tracking-[0.2em] text-primary hover:gap-6 transition-all group shrink-0 italic">
                            View All <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="aspect-square rounded-[2rem] w-full" />
                                <Skeleton className="h-6 w-2/3" />
                                <Skeleton className="h-4 w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        ref={scrollRef}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                        className={scrollable 
                            ? "flex gap-4 md:gap-8 overflow-x-auto pb-10 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 md:-mx-8 md:px-8" 
                            : "grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
                        }
                    >
                        {products.map((product, index) => (
                            <div key={product._id || product.id} className={scrollable ? "min-w-[280px] md:min-w-[380px] snap-start" : ""}>
                                <ProductCard {...product} index={index} />
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
}
