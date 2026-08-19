"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

// ── Category sections matching the mobile design ──
const EYEGLASSES = [
    { name: "Men", image: "/images/men.png", href: "/category/eyeglasses?sub=men" },
    { name: "Women", image: "/images/women eye.png", href: "/category/eyeglasses?sub=women" },
    { name: "Kids", image: "/images/kid eye.png", href: "/category/eyeglasses?sub=kids" },
    { name: "On Sale", image: "/images/on sale eye.png", href: "/category/eyeglasses?sub=sale" },
];

const SUNGLASSES = [
    { name: "Men", image: "/images/men sun.png", href: "/category/sunglasses?sub=men" },
    { name: "Women", image: "/images/women sun.png", href: "/category/sunglasses?sub=women" },
    { name: "Kids", image: "/images/kids sun.png", href: "/category/sunglasses?sub=kids" },
    { name: "On Sale", image: "/images/on sale sunglasses.png", href: "/category/sunglasses?sub=sale" },
];

const LENSVIK_COLLECTION = [
    { name: "NextGen", image: "/images/tr 2.jpg", href: "/category/nextgen" },
    { name: "Contact Lenses", image: "/images/tr3.jpg", href: "/category/contact-lenses" },
    { name: "Accessories", image: "/images/tr4.jpg", href: "/category/accessories" },
];

interface CategorySection {
    title: string;
    tag?: string;
    items: { name: string; image: string; href: string }[];
}

const SECTIONS: CategorySection[] = [
    { title: "Eyeglasses", tag: "with Power", items: EYEGLASSES },
    { title: "Sunglasses", items: SUNGLASSES },
    { title: "Lensvik Collection", tag: "NextGen, Contacts & More", items: LENSVIK_COLLECTION },
];

function CategoryCard({ item, index }: { item: { name: string; image: string; href: string }; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 100, damping: 15 }}
            viewport={{ once: true, margin: "-50px" }}
            className="flex-shrink-0 w-full md:w-auto"
        >
            <Link href={item.href} className="group block">
                <div className="relative overflow-hidden rounded-2xl md:rounded-3xl aspect-[4/5] md:aspect-[4/5] bg-muted border border-white/30 shadow-sm hover:shadow-lg transition-shadow">
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100px, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                </div>
                <p className="text-center text-xs md:text-sm font-bold mt-2 text-foreground/80 group-hover:text-primary transition-colors truncate">
                    {item.name}
                </p>
            </Link>
        </motion.div>
    );
}

function SectionBlock({ section }: { section: CategorySection }) {
    const isSpecialCollection = section.title === "Lensvik Collection";

    return (
        <div className="mb-10 md:mb-20">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6 md:mb-8">
                <h3 className="text-xl md:text-3xl font-black tracking-tighter uppercase italic text-[#1a1550] leading-none">
                    {section.title}
                </h3>
                {section.tag && (
                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest bg-primary text-white px-3 py-1 rounded-full italic">
                        {section.tag}
                    </span>
                )}
            </div>

            {isSpecialCollection ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
                    {/* Main Featured Card - NextGen */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: -20 }}
                        whileInView={{ opacity: 1, scale: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ type: "spring", stiffness: 80, damping: 20 }}
                        className="md:col-span-8 group relative overflow-hidden rounded-[2.5rem] aspect-[16/9] md:aspect-auto md:h-[450px] bg-slate-900 shadow-2xl"
                    >
                        <Link href={section.items[0].href} className="block w-full h-full">
                            <Image
                                src={section.items[0].image}
                                alt={section.items[0].name}
                                fill
                                className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />
                            <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2 block">Premium Series</span>
                                <h4 className="text-3xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4">{section.items[0].name}</h4>
                                <div className="inline-flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 group-hover:bg-primary group-hover:border-primary transition-all">
                                    Explore Collection <span>→</span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Secondary Cards Column */}
                    <div className="md:col-span-4 grid grid-cols-1 gap-4 md:gap-6">
                        {section.items.slice(1).map((item, i) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: i * 0.1, type: "spring", stiffness: 80, damping: 20 }}
                                className="group relative overflow-hidden rounded-[2rem] h-[215px] bg-slate-100 border border-slate-200 hover:border-primary/30 transition-all shadow-lg"
                            >
                                <Link href={item.href} className="block w-full h-full">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors" />
                                    <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 to-transparent">
                                        <h4 className="text-xl font-black text-white uppercase italic tracking-tight">{item.name}</h4>
                                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-1">Shop Now →</p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* Mobile: 4-column grid | Desktop: grid */}
                    <div className="grid md:hidden grid-cols-4 gap-2 md:gap-3 mb-2">
                        {section.items.map((item, i) => (
                            <CategoryCard key={item.name} item={item} index={i} />
                        ))}
                    </div>

                    <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-4 gap-6">
                        {section.items.map((item, i) => (
                            <CategoryCard key={item.name} item={item} index={i} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export function CategoryGrid() {
    return (
        <section className="py-6 md:py-10 w-full max-w-screen-2xl mx-auto px-4 md:px-6">
            {/* Desktop header */}
            <div className="hidden md:flex flex-col items-center mb-8 text-center">
                <h2 className="text-[10px] uppercase font-bold tracking-[0.3em] text-primary mb-3">Explore our world</h2>
                <h3 className="text-3xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">Shop by Category</h3>
            </div>

            {/* Render all sections */}
            {SECTIONS.map((section) => (
                <SectionBlock key={section.title} section={section} />
            ))}
        </section>
    );
}
