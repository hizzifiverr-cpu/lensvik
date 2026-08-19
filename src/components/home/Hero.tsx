"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const banners = [
    {
        image: "/images/professional_product_photography_shot_of_202606201447.jpeg",
        title: "Premium Eyewear",
        subtitle: "Curated for Visionaries",
        tag: "New Collection",
        cta: "Shop Now",
        ctaHref: "/collections",
    },
    {
        image: "/images/professional_product_photography_shot_of_202606201448.jpeg",
        title: "Discover Your Style",
        subtitle: "Frames for Every Face",
        tag: "Virtual Try-On",
        cta: "Try On",
        ctaHref: "/products",
    },
    {
        image: "/images/A_landscape_website_banner_displaying_202606201449.jpeg",
        title: "See the World",
        subtitle: "In Stunning Clarity",
        tag: "Best Sellers",
        cta: "View All",
        ctaHref: "/collections",
    },
];

export function Hero() {
    const [current, setCurrent] = React.useState(0);
    const [dir, setDir] = React.useState(1);
    const touchStartX = React.useRef<number | null>(null);

    const go = React.useCallback(
        (next: number) => {
            setDir(next > current ? 1 : -1);
            setCurrent(next);
        },
        [current]
    );

    const prev = () => go((current - 1 + banners.length) % banners.length);
    const next = () => go((current + 1) % banners.length);

    // Auto-advance
    React.useEffect(() => {
        const t = setInterval(() => {
            setDir(1);
            setCurrent((c) => (c + 1) % banners.length);
        }, 5000);
        return () => clearInterval(t);
    }, []);

    // Touch swipe support
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
        touchStartX.current = null;
    };

    const banner = banners[current];

    return (
        <section
            className="relative w-full overflow-hidden bg-[#f0f1f3] mt-[85px] md:mt-[115px]"
            style={{ aspectRatio: "21/9", minHeight: "200px", maxHeight: "600px" }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {/* ── Slides ── */}
            <AnimatePresence mode="wait" initial={false} custom={dir}>
                <motion.div
                    key={current}
                    custom={dir}
                    variants={{
                        enter: (d: number) => ({ opacity: 0, x: d * 60 }),
                        center: { opacity: 1, x: 0 },
                        exit: (d: number) => ({ opacity: 0, x: d * -60 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <Image
                        src={banner.image}
                        alt={banner.title}
                        fill
                        className="object-cover object-center"
                        priority={current === 0}
                        sizes="100vw"
                    />
                    {/* Gradient overlay — stronger on mobile for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
                </motion.div>
            </AnimatePresence>

            {/* ── Text Content ── */}
            <div className="absolute inset-0 flex flex-col justify-center z-10 px-5 sm:px-8 md:px-12 lg:px-16">
                <AnimatePresence mode="wait" initial={false}>
                    {/* Title, subtitle & CTA commented out — image-only slider */}
                    {/* <motion.div
                        key={`text-${current}`}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.45 }}
                        className="max-w-[55%] sm:max-w-[50%] md:max-w-[45%]"
                    >
                        <span className="inline-block text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-white/90 mb-1.5 md:mb-3 bg-white/15 backdrop-blur-sm px-2.5 py-0.5 md:px-3 md:py-1 rounded-full border border-white/20">
                            {banner.tag}
                        </span>

                        <h1 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter text-white leading-[0.95] italic uppercase mb-0.5 md:mb-2">
                            {banner.title}
                        </h1>

                        <p className="text-[11px] sm:text-sm md:text-xl lg:text-2xl font-black tracking-tight text-white/80 italic uppercase leading-none mb-3 md:mb-6">
                            {banner.subtitle}
                        </p>

                        <Link
                            href={banner.ctaHref}
                            className="inline-flex items-center gap-1 md:gap-2 bg-white text-primary font-black uppercase text-[9px] sm:text-[10px] md:text-xs tracking-widest italic px-3 py-1.5 md:px-5 md:py-2.5 rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95"
                        >
                            {banner.cta}
                            <ArrowRight className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                        </Link>
                    </motion.div> */}
                </AnimatePresence>
            </div>

            {/* ── Prev / Next Arrows (hidden on mobile, visible md+) ── */}
            <button
                onClick={prev}
                aria-label="Previous slide"
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full items-center justify-center text-white hover:bg-white/40 transition-all"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button
                onClick={next}
                aria-label="Next slide"
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full items-center justify-center text-white hover:bg-white/40 transition-all"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            {/* ── Dot Indicators ── */}
            <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                {banners.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => go(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`rounded-full transition-all duration-300 ${
                            i === current
                                ? "w-5 h-1.5 md:w-7 md:h-2 bg-white"
                                : "w-1.5 h-1.5 md:w-2 md:h-2 bg-white/40 hover:bg-white/70"
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}
