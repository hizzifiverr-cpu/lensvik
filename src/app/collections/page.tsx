"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts, Product } from "@/lib/api";
import {
    SlidersHorizontal, X, ChevronDown, ChevronUp,
    LayoutGrid, List, Search, ArrowUpDown
} from "lucide-react";

// ─── Filter Types ────────────────────────────────────────────────────────────
const MATERIALS_OPTS = ["Plastic", "Acetate", "Mix Material", "Metal", "TR", "Titanium"] as const;
const SHAPES_OPTS = ["Cat Eye", "Wayfarer", "Square", "Aviator", "Oval", "Sports", "Rectangle", "Hexagonal", "Round", "Clubmaster"] as const;
const RIMS_OPTS = ["Full Rim", "Half Rim", "Rimless"] as const;
const SIZES_OPTS = ["Large", "Medium", "Small"] as const;
const PRICE_RANGES = [
    { label: "Under Rs 3,000", min: 0, max: 3000 },
    { label: "Rs 3,000 – 6,000", min: 3000, max: 6000 },
    { label: "Rs 6,000 – 9,000", min: 6000, max: 9000 },
    { label: "Over Rs 9,000", min: 9000, max: Infinity },
] as const;

const SORT_OPTIONS = [
    { value: "popular", label: "Most Popular" },
    { value: "low-high", label: "Price: Low → High" },
    { value: "high-low", label: "Price: High → Low" },
    { value: "newest", label: "Newest First" },
] as const;

type SortValue = typeof SORT_OPTIONS[number]["value"];

// Gender options: display label → DB value stored in product.gender
const GENDER_OPTS = [
    { label: "Men",   db: "Male"   },
    { label: "Women", db: "Female" }
] as const;

interface Filters {
    categories: string[];
    priceRange: number | null;   // index into PRICE_RANGES
    materials: string[];
    shapes: string[];
    rims: string[];
    sizes: string[];
    genders: string[];           // DB values: "Male" | "Female" | "Kids"
    onSale: boolean;
}

// ─── Small helpers ───────────────────────────────────────────────────────────
function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

function activeCount(f: Filters) {
    return f.categories.length + (f.priceRange !== null ? 1 : 0) +
        f.materials.length + f.shapes.length + f.rims.length + f.sizes.length +
        f.genders.length + (f.onSale ? 1 : 0);
}

// ─── Sidebar accordion section ───────────────────────────────────────────────
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-b border-slate-100 pb-4 pt-4">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center justify-between w-full mb-3"
            >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">{title}</span>
                {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Pill checkbox ───────────────────────────────────────────────────────────
function FilterPill({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
    return (
        <button
            onClick={onChange}
            className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${checked
                    ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                }`}
        >
            {label}
        </button>
    );
}

// ─── Sidebar component (used on desktop and inside mobile drawer) ─────────────
function Sidebar({ filters, setFilters, onReset }: {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    onReset: () => void;
}) {
    const count = activeCount(filters);
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-900">Filters</span>
                {count > 0 && (
                    <button onClick={onReset} className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors">
                        Clear all ({count})
                    </button>
                )}
            </div>

            {/* Gender */}
            <FilterSection title="Shop By">
                <div className="flex flex-wrap gap-2">
                    {GENDER_OPTS.map(({ label, db }) => (
                        <FilterPill
                            key={db}
                            label={label}
                            checked={filters.genders.includes(db)}
                            onChange={() => setFilters(f => ({ ...f, genders: toggle(f.genders, db) }))}
                        />
                    ))}
                 
                </div>
            </FilterSection>


            {/* Price Range */}
            <FilterSection title="Price Range">
                <div className="flex flex-col gap-2">
                    {PRICE_RANGES.map((range, i) => (
                        <label key={range.label} className="flex items-center gap-2.5 cursor-pointer group">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${filters.priceRange === i
                                    ? "border-primary bg-primary"
                                    : "border-slate-200 group-hover:border-primary/50"
                                }`}
                                onClick={() => setFilters(f => ({ ...f, priceRange: f.priceRange === i ? null : i }))}
                            >
                                {filters.priceRange === i && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <span
                                className={`text-[11px] font-semibold transition-colors ${filters.priceRange === i ? "text-slate-900 font-black" : "text-slate-500"}`}
                                onClick={() => setFilters(f => ({ ...f, priceRange: f.priceRange === i ? null : i }))}
                            >
                                {range.label}
                            </span>
                        </label>
                    ))}
                </div>
            </FilterSection>

        

            {/* Material */}
            <FilterSection title="Material">
                <div className="flex flex-wrap gap-2">
                    {MATERIALS_OPTS.map(mat => (
                        <FilterPill
                            key={mat}
                            label={mat}
                            checked={filters.materials.includes(mat)}
                            onChange={() => setFilters(f => ({ ...f, materials: toggle(f.materials, mat) }))}
                        />
                    ))}
                </div>
            </FilterSection>

            {/* Shape */}
            <FilterSection title="Shape">
                <div className="flex flex-wrap gap-2">
                    {SHAPES_OPTS.map(shape => (
                        <FilterPill
                            key={shape}
                            label={shape}
                            checked={filters.shapes.includes(shape)}
                            onChange={() => setFilters(f => ({ ...f, shapes: toggle(f.shapes, shape) }))}
                        />
                    ))}
                </div>
            </FilterSection>

            {/* Rim */}
            <FilterSection title="Rim">
                <div className="flex flex-wrap gap-2">
                    {RIMS_OPTS.map(rim => (
                        <FilterPill
                            key={rim}
                            label={rim}
                            checked={filters.rims.includes(rim)}
                            onChange={() => setFilters(f => ({ ...f, rims: toggle(f.rims, rim) }))}
                        />
                    ))}
                </div>
            </FilterSection>

            {/* Size */}
            <FilterSection title="Size">
                <div className="flex flex-wrap gap-2">
                    {SIZES_OPTS.map(size => (
                        <FilterPill
                            key={size}
                            label={size}
                            checked={filters.sizes.includes(size)}
                            onChange={() => setFilters(f => ({ ...f, sizes: toggle(f.sizes, size) }))}
                        />
                    ))}
                </div>
            </FilterSection>

      
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CollectionsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortValue>("popular");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [filters, setFilters] = useState<Filters>({
        categories: [], priceRange: null, materials: [], shapes: [], rims: [], sizes: [], genders: [], onSale: false,
    });

    const resetFilters = () => setFilters({ categories: [], priceRange: null, materials: [], shapes: [], rims: [], sizes: [], genders: [], onSale: false });

    useEffect(() => {
        getProducts().then(setProducts).catch(console.error).finally(() => setLoading(false));
    }, []);

    // ── Client-side filter + sort ──
    const processed = useCallback(() => {
        let p = [...products];

        // Search
        if (search.trim()) {
            const q = search.toLowerCase();
            p = p.filter(x => x.name.toLowerCase().includes(q) || x.category?.toLowerCase().includes(q));
        }

        // Category filter (maps to product.category)
        if (filters.categories.length) {
            p = p.filter(x => filters.categories.some(cat => x.category?.toLowerCase().includes(cat.toLowerCase())));
        }

        // Gender filter (maps to product.gender DB field)
        if (filters.genders.length) {
            p = p.filter(x => filters.genders.some(g => x.gender?.toLowerCase() === g.toLowerCase()));
        }

        // On Sale filter
        if (filters.onSale) {
            p = p.filter(x => {
                const compare = x.comparePrice ?? x.originalPrice;
                return compare && compare > x.price;
            });
        }

        // Material filter
        if (filters.materials.length) {
            p = p.filter(x => filters.materials.some(mat => x.material?.toLowerCase() === mat.toLowerCase()));
        }

        // Shape filter
        if (filters.shapes.length) {
            p = p.filter(x => filters.shapes.some(shape => x.shape?.toLowerCase() === shape.toLowerCase()));
        }

        // Rim filter
        if (filters.rims.length) {
            p = p.filter(x => filters.rims.some(rim => x.rim?.toLowerCase() === rim.toLowerCase()));
        }

        // Size filter
        if (filters.sizes.length) {
            p = p.filter(x => filters.sizes.some(size => x.size?.toLowerCase() === size.toLowerCase()));
        }

        // Price range
        if (filters.priceRange !== null) {
            const { min, max } = PRICE_RANGES[filters.priceRange];
            p = p.filter(x => x.price >= min && x.price <= max);
        }

        // Sort
        if (sort === "low-high") p.sort((a, b) => a.price - b.price);
        if (sort === "high-low") p.sort((a, b) => b.price - a.price);
        // "popular" and "newest" keep API order (could be extended with backend)

        return p;
    }, [products, search, filters, sort]);

    const filtered = processed();
    const count = activeCount(filters);

    return (
        <main className="min-h-screen bg-[#fafafa] pt-36 md:pt-44">
            <Navbar />

            <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6 pb-20 md:pb-32">

                {/* ── Page Header ── */}
                <header className="mb-6 md:mb-8">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1 block">Our Collection</span>
                        <h1 className="text-2xl md:text-4xl font-black tracking-tighter italic uppercase text-slate-900">
                            All Eyewear
                        </h1>
                    </motion.div>
                </header>

                {/* ── Toolbar ── */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    {/* Mobile filter trigger */}
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="lg:hidden flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-700 hover:border-primary/40 transition-all shadow-sm"
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Filters {count > 0 && <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] flex items-center justify-center font-black">{count}</span>}
                    </button>

                    {/* Search */}
                    <div className="relative flex-1 min-w-[160px] max-w-xs">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search frames..."
                            className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <select
                            value={sort}
                            onChange={e => setSort(e.target.value as SortValue)}
                            className="h-10 pl-9 pr-8 rounded-xl bg-white border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-700 focus:outline-none focus:border-primary/40 appearance-none cursor-pointer transition-all hover:border-slate-400"
                        >
                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Active filter chips */}
                    {filters.categories.map(c => (
                        <span key={c} onClick={() => setFilters(f => ({ ...f, categories: toggle(f.categories, c) }))} className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-primary/20 transition-all">
                            {c} <X className="w-3 h-3" />
                        </span>
                    ))}
                    {filters.materials.map(m => (
                        <span key={m} onClick={() => setFilters(f => ({ ...f, materials: toggle(f.materials, m) }))} className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-all">
                            {m} <X className="w-3 h-3" />
                        </span>
                    ))}
                    {filters.shapes.map(s => (
                        <span key={s} onClick={() => setFilters(f => ({ ...f, shapes: toggle(f.shapes, s) }))} className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-emerald-100 transition-all">
                            {s} <X className="w-3 h-3" />
                        </span>
                    ))}
                    {filters.rims.map(r => (
                        <span key={r} onClick={() => setFilters(f => ({ ...f, rims: toggle(f.rims, r) }))} className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-amber-100 transition-all">
                            {r} <X className="w-3 h-3" />
                        </span>
                    ))}
                    {filters.sizes.map(s => (
                        <span key={s} onClick={() => setFilters(f => ({ ...f, sizes: toggle(f.sizes, s) }))} className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-purple-100 transition-all">
                            {s} <X className="w-3 h-3" />
                        </span>
                    ))}

                    {/* Results count + view toggle */}
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 hidden sm:block">
                            {loading ? "Loading…" : `${filtered.length} results`}
                        </span>
                        <div className="flex rounded-xl overflow-hidden border border-slate-200">
                            <button onClick={() => setViewMode("grid")} className={`w-8 h-8 flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-slate-900 text-white" : "bg-white text-slate-400 hover:bg-slate-50"}`}>
                                <LayoutGrid className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setViewMode("list")} className={`w-8 h-8 flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-slate-900 text-white" : "bg-white text-slate-400 hover:bg-slate-50"}`}>
                                <List className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Main layout: sidebar + grid ── */}
                <div className="flex gap-6 md:gap-8 items-start">

                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-56 xl:w-64 shrink-0 sticky top-28 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                        <Sidebar filters={filters} setFilters={setFilters} onReset={resetFilters} />
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1 min-w-0">
                        {loading ? (
                            <div className={`grid gap-3 md:gap-5 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                                {[...Array(8)].map(i => (
                                    <div key={i} className="aspect-[4/5] bg-slate-100 animate-pulse rounded-2xl" />
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                    <Search className="w-6 h-6 text-slate-400" />
                                </div>
                                <h3 className="text-base font-black uppercase tracking-tight text-slate-700 mb-1">No products found</h3>
                                <p className="text-xs text-slate-400 mb-4">Try adjusting your filters or search query.</p>
                                <button onClick={resetFilters} className="h-9 px-5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest">
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <motion.div
                                initial="hidden"
                                animate="show"
                                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
                                className={`grid gap-3 md:gap-5 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"}`}
                            >
                                {filtered.map((product, i) => (
                                    <ProductCard key={product._id} {...product} index={i} />
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Mobile Filter Drawer ── */}
            <AnimatePresence>
                {drawerOpen && (
                    <>
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setDrawerOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            key="drawer"
                            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 280 }}
                            className="fixed left-0 top-0 h-full w-[80vw] max-w-xs bg-white z-50 overflow-y-auto shadow-2xl flex flex-col"
                        >
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                                <span className="text-sm font-black uppercase tracking-widest text-slate-900">Filters</span>
                                <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                    <X className="w-4 h-4 text-slate-600" />
                                </button>
                            </div>
                            <div className="px-5 pb-6 flex-1">
                                <Sidebar filters={filters} setFilters={setFilters} onReset={resetFilters} />
                            </div>
                            <div className="sticky bottom-0 px-5 py-4 border-t border-slate-100 bg-white">
                                <button
                                    onClick={() => setDrawerOpen(false)}
                                    className="w-full h-11 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
                                >
                                    Show {filtered.length} Results
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <Footer />
        </main>
    );
}
