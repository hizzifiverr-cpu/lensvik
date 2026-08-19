"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { motion } from "framer-motion";
import { getProducts, Product } from "@/lib/api";

export default function CollectionSubPage() {
    const { slug } = useParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const allProducts = await getProducts();

                // Filtering logic based on slug
                let filtered = allProducts;
                if (slug === 'new-arrivals') {
                    filtered = allProducts.slice(-8).reverse();
                } else if (slug === 'featured') {
                    filtered = allProducts.slice(0, 8);
                } else if (slug === 'best-sellers' || slug === 'trending') {
                    filtered = [...allProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);
                }

                setProducts(filtered);
            } catch (err) {
                console.error("Failed to fetch products", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [slug]);

    const collectionName = slug ? (slug as string).split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') : "";

    return (
        <main className="min-h-screen bg-background pt-44 pb-24">
            <Navbar />
            <div className="container mx-auto px-6">
                <header className="mb-10 md:mb-16 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-8xl font-black tracking-tighter mb-2 md:mb-4 uppercase italic"
                    >
                        {collectionName}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-sm md:text-xl text-muted-foreground font-medium"
                    >
                        Explore our {collectionName.toLowerCase()} curated for visionaries.
                    </motion.p>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 }
                            }
                        }}
                        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8"
                    >
                        {products.map((product, index) => (
                            <ProductCard key={product._id} {...product} index={index} />
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-24">
                        <h3 className="text-2xl font-bold mb-4">No products found</h3>
                        <p className="text-muted-foreground">Check back soon for new additions to this collection.</p>
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
