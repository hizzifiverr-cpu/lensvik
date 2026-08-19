"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { SidebarFilters } from "@/components/products/SidebarFilters";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts, Product } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, SlidersHorizontal, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function CategoryPage() {
    const { slug } = useParams();
    const searchParams = useSearchParams();
    const subRoute = searchParams.get('sub');
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("popular");
    const [activeFilters, setActiveFilters] = useState({
        categories: [] as string[],
        priceRange: [0, 15000] as [number, number],
        materials: [] as string[],
        shapes: [] as string[],
        rims: [] as string[],
        sizes: [] as string[],
        gender: [] as string[]
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const filters: any = {};
                if (activeFilters.materials?.length) filters.material = activeFilters.materials;
                if (activeFilters.shapes?.length) filters.shape = activeFilters.shapes;
                if (activeFilters.rims?.length) filters.rim = activeFilters.rims;
                if (activeFilters.sizes?.length) filters.size = activeFilters.sizes;
                if (activeFilters.gender?.length) filters.gender = activeFilters.gender;

                let filtered = await getProducts('Active', 0, (slug as string).replace(/-/g, ' '), Object.keys(filters).length ? filters : undefined);

                if (subRoute && subRoute !== 'sale') {
                    const subLower = subRoute.toLowerCase();
                    filtered = filtered.filter(p => {
                        const genderLower = (p.gender || '').toLowerCase();
                        if (subLower === 'men') return genderLower === 'male' || genderLower === 'unisex';
                        if (subLower === 'women') return genderLower === 'female' || genderLower === 'unisex';
                        if (subLower === 'kids') return genderLower === 'kids';
                        if (subLower === 'transparent') return p.subcategory === 'Transparent Lenses';
                        if (subLower === 'colored') return p.subcategory === 'Colored Lenses';
                        return genderLower === subLower;
                    });
                } else if (subRoute === 'sale') {
                    filtered = filtered.filter(p => {
                        const compare = p.comparePrice ?? p.originalPrice ?? 0;
                        return compare > p.price;
                    });
                }

                setProducts(filtered);
            } catch (err) {
                console.error("Failed to fetch products", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [slug, subRoute, activeFilters]);

    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];
        result = result.filter(p => p.price <= activeFilters.priceRange[1]);
        if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
        if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
        if (sortBy === "popular") result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        return result;
    }, [products, activeFilters, sortBy]);

    const handleFilterChange = (type: string, value: any) => {
        if (type === "price") {
            setActiveFilters(prev => ({ ...prev, priceRange: [0, value] }));
        } else {
            setActiveFilters(prev => {
                const current = (prev as any)[type];
                const updated = current.includes(value) ? current.filter((v: any) => v !== value) : [...current, value];
                return { ...prev, [type]: updated };
            });
        }
    };

    const isContactLenses = (slug as string)?.toLowerCase() === 'contact-lenses';
    
    const configFilters = {
        categories: isContactLenses 
            ? ["Transparent Lenses", "Colored Lenses", "Single Vision", "Progressive"]
            : ["Single Vision", "Progressive", "Bifocal", "Zero Power"],
        priceRange: [0, 15000] as [number, number],
        materials: ["Plastic", "Acetate", "Mix Material", "Metal", "TR", "Titanium"],
        shapes: ["Cat Eye", "Wayfarer", "Square", "Aviator", "Oval", "Sports", "Rectangle", "Hexagonal", "Round", "Clubmaster"],
        rims: ["Full Rim", "Half Rim", "Rimless"],
        sizes: ["Large", "Medium", "Small"],
        gender: ["Men", "Women"]
    };

    const categoryDisplayName = slug ? (slug as string).replace(/-/g, ' ').toUpperCase() : "COLLECTION";

    return (
        <main className="min-h-screen bg-background pt-44 md:pt-56">
            <Navbar />
            <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6 pb-20 md:pb-32">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    <aside className="hidden lg:block lg:w-72 shrink-0 border-r border-slate-100 pr-8">
                        <SidebarFilters
                            filters={configFilters}
                            onFilterChange={handleFilterChange}
                            activeFilters={{ ...activeFilters, totalCount: filteredAndSortedProducts.length }}
                        />
                    </aside>

                    <div className="flex-1">
                        <header className="flex flex-col gap-6 mb-8 md:mb-12">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">{categoryDisplayName}</h1>
                                <Badge className="bg-primary/5 text-primary border-primary/10 label-tag px-3 py-1">
                                    {filteredAndSortedProducts.length} Items
                                </Badge>
                            </div>
                            <p className="text-small text-slate-500 font-medium italic">Premium {categoryDisplayName.toLowerCase()} curated for visionaries.</p>
                        </header>
                        
                        {isContactLenses && (
                            <div className="mb-8 md:mb-12">
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        onClick={() => router.push(`/category/contact-lenses?sub=transparent`)}
                                        className={`flex-1 min-w-[200px] p-6 rounded-3xl border-2 transition-all text-left hover:shadow-lg ${
                                            subRoute === 'transparent' 
                                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                                                : 'border-slate-200 bg-white hover:border-primary/30'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Eye className="w-5 h-5 text-primary" />
                                            </div>
                                            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Transparent Lenses</h3>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium ml-13">Clear vision with natural look</p>
                                    </button>
                                    <button
                                        onClick={() => router.push(`/category/contact-lenses?sub=colored`)}
                                        className={`flex-1 min-w-[200px] p-6 rounded-3xl border-2 transition-all text-left hover:shadow-lg ${
                                            subRoute === 'colored' 
                                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                                                : 'border-slate-200 bg-white hover:border-primary/30'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                <Sparkles className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Colored Lenses</h3>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium ml-13">Enhance your natural beauty</p>
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 w-full md:w-auto mb-8">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="lg" className="lg:hidden flex-1 h-12 rounded-2xl btn-text border-slate-200">
                                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                                        Filter
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                    <div className="py-6">
                                        <SidebarFilters
                                            filters={configFilters}
                                            onFilterChange={handleFilterChange}
                                            activeFilters={{ ...activeFilters, totalCount: filteredAndSortedProducts.length }}
                                        />
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full md:w-[220px] h-12 rounded-2xl btn-text bg-white border-2 border-slate-100 focus:ring-primary/10">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-slate-400" />
                                        <SelectValue placeholder="Sort By" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                                    <SelectItem value="popular" className="btn-text">Popular Items</SelectItem>
                                    <SelectItem value="price-low" className="btn-text">Price: Low to High</SelectItem>
                                    <SelectItem value="price-high" className="btn-text">Price: High to Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="aspect-[4/5] bg-slate-50 animate-pulse rounded-[2.5rem]" />
                                ))}
                            </div>
                        ) : filteredAndSortedProducts.length > 0 ? (
                            <motion.div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                                <AnimatePresence mode="popLayout">
                                    {filteredAndSortedProducts.map((product, index) => (
                                        <ProductCard key={product._id} {...product} index={index} />
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                                <h3 className="text-2xl font-black uppercase italic mb-4">No vision found</h3>
                                <p className="text-small text-slate-400 mb-8">Adjust your filters to discover more possibilities.</p>
                                <Button onClick={() => setActiveFilters({ categories: [], priceRange: [0, 15000], materials: [], shapes: [], rims: [], sizes: [], gender: [] })} variant="link" className="btn-text text-primary">Reset all filters</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold overflow-hidden ${className}`}>
            {children}
        </span>
    );
}