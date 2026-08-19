"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import dynamic from "next/dynamic";
import { getProductById, Product } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Heart, Share2, CheckCircle2, Star, Eye, ChevronRight, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import Image from "next/image";
import { LensConfigurator } from "@/components/products/LensConfigurator";
import { VariationSelector } from "@/components/products/VariationSelector";
import { ProductSpecs } from "@/components/products/ProductSpecs";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { ProductZoomModal } from "@/components/products/ProductZoomModal";

// Dynamic imports
const VirtualTryOn = dynamic(() => import("@/components/vto/VirtualTryOn").then(mod => mod.VirtualTryOn), {
    ssr: false,
    loading: () => <Skeleton className="w-full h-full rounded-3xl" />,
});


const FEATURES = [
    "Anti-Reflective Coating",
    "Ultra-Light Frame (18g)",
    "Impact Resistant",
    "100% UV400 Filter",
];

export default function ProductPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [isVTOModalOpen, setIsVTOModalOpen] = useState(false);
    const [isLensModalOpen, setIsLensModalOpen] = useState(false);
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
    const [activeThumb, setActiveThumb] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
    const [variations, setVariations] = useState({ color: "", size: "" });
    const [isWishlisted, setIsWishlisted] = useState(false);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await getProductById(id as string);
                setProduct(data);
                if (data && (data as any).images?.length > 1) {
                    setActiveThumb(1);
                }
            } catch (err) {
                console.error("Failed to fetch product", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // Resolve image list: prefer images[] array, fallback to image field
    const imageList: string[] = (product as any)?.images?.length
        ? (product as any).images
        : (product?.image ? [product.image] : ['/images/dfd.png']);
    const activeImage = imageList[activeThumb] || imageList[0] || '/images/dfd.png';
    const isDataUri = (src: string) => src?.startsWith('data:');

    useEffect(() => {
        if (searchParams.get("tryon") === "true") setIsVTOModalOpen(true);
    }, [searchParams]);

    // Keyboard navigation for image gallery
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                setActiveThumb((prev) => (prev + 1) % imageList.length);
            } else if (e.key === "ArrowLeft") {
                setActiveThumb((prev) => (prev - 1 + imageList.length) % imageList.length);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [imageList.length]);

    const handleAddToCart = () => {
        if (product) {
            addToCart({ 
                productId: product._id, 
                name: product.name, 
                price: product.price, 
                image: product.image,
                color: variations.color,
                size: variations.size,
                lensType: "Clear"
            });
            toast.success(`${product.name} added to cart!`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 md:px-6 pt-28 md:pt-36 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                    <Skeleton className="aspect-square rounded-3xl md:rounded-[3rem]" />
                    <div className="space-y-4 md:space-y-6">
                        <Skeleton className="h-10 md:h-12 w-3/4" />
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl font-bold">Product not found</p>
            </div>
        );
    }

    const isPrescriptionProduct =
        product.category.toLowerCase().includes("eyeglasses") ||
        product.category.toLowerCase().includes("prescription") ||
        product.category.toLowerCase().includes("blue light");


    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : null;

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6 pt-40 md:pt-52 pb-20 md:pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">

                    {/* ── Left: Image Gallery ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-3 md:space-y-4"
                    >
                        {/* Main Image */}
                        <div
                            className="relative aspect-square rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-white border border-slate-100 group shadow-xl shadow-slate-100/50 touch-pan-y"
                            onTouchStart={(e) => {
                                const touch = e.touches[0];
                                (e.currentTarget as HTMLElement).dataset.touchStartX = String(touch.clientX);
                                (e.currentTarget as HTMLElement).dataset.touchStartY = String(touch.clientY);
                            }}
                            onTouchMove={(e) => {
                                // Determine direction on move to prevent vertical scroll interference
                                if (!(e.currentTarget as HTMLElement).dataset.touchStartX) return;
                                const touch = e.touches[0];
                                const deltaX = Math.abs(touch.clientX - Number((e.currentTarget as HTMLElement).dataset.touchStartX));
                                const deltaY = Math.abs(touch.clientY - Number((e.currentTarget as HTMLElement).dataset.touchStartY));
                                // If horizontal swipe is more dominant than vertical, prevent scroll
                                if (deltaX > deltaY && deltaX > 10) {
                                    e.preventDefault();
                                }
                            }}
                            onTouchEnd={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                const startX = Number(el.dataset.touchStartX);
                                const startY = Number(el.dataset.touchStartY);
                                if (!startX) return;
                                const touch = e.changedTouches[0];
                                const deltaX = touch.clientX - startX;
                                const deltaY = touch.clientY - startY;
                                const threshold = 50;
                                // Only trigger if horizontal swipe is dominant
                                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
                                    if (deltaX > 0) {
                                        // Swipe right → previous image
                                        setActiveThumb((prev) => (prev - 1 + imageList.length) % imageList.length);
                                    } else {
                                        // Swipe left → next image
                                        setActiveThumb((prev) => (prev + 1) % imageList.length);
                                    }
                                }
                                delete el.dataset.touchStartX;
                                delete el.dataset.touchStartY;
                            }}
                        >
                            {product?.videoUrl && activeThumb === 0 && (
                                <video
                                    src={product.videoUrl}
                                    controls
                                    autoPlay
                                    muted
                                    loop
                                    className="w-full h-full object-contain p-6 md:p-10"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            )}
                            {product?.videoData && activeThumb === 0 && !product.videoUrl && (
                                <video
                                    src={product.videoData}
                                    controls
                                    autoPlay
                                    muted
                                    loop
                                    className="w-full h-full object-contain p-6 md:p-10"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            )}
                            {(!product.videoUrl || activeThumb > 0) && (
                                <div
                                    className="w-full h-full cursor-pointer relative"
                                    onClick={() => setIsZoomModalOpen(true)}
                                >
                                    <div className="w-full h-full">
                                        {isDataUri(activeImage) ? (
                                            <img
                                                src={activeImage}
                                                alt={product.name}
                                                className="w-full h-full object-contain p-6 md:p-10"
                                            />
                                        ) : (
                                            <Image
                                                src={activeImage}
                                                alt={product.name}
                                                fill
                                                className="object-contain p-6 md:p-10"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                                priority
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Discount badge */}
                            {discount && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full z-10">
                                    -{discount}%
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                                <button
                                    onClick={() => setIsWishlisted(!isWishlisted)}
                                    className={`w-9 h-9 md:w-10 md:h-10 rounded-full bg-white shadow-md flex items-center justify-center transition-all hover:scale-110 ${isWishlisted ? "text-red-500" : "text-slate-400"}`}
                                >
                                    <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500" : ""}`} />
                                </button>
                                <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:scale-110">
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* VTO overlay button & Zoom button */}
                            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsVTOModalOpen(true); }}
                                    className="pointer-events-auto flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md hover:bg-primary hover:text-white transition-all border border-white/50"
                                >
                                    <Eye className="w-3 h-3" /> Try On
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsZoomModalOpen(true); }}
                                    className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md hover:bg-black transition-all border border-slate-800"
                                >
                                    <ZoomIn className="w-3 h-3" /> Tap to Zoom
                                </button>
                            </div>
                        </div>

                        {/* Thumbnail Strip */}
                        {imageList.length > 1 && (
                            <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-2">
                                {imageList.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveThumb(i)}
                                        className={`w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden bg-white border-2 transition-all relative shrink-0 ${
                                            activeThumb === i ? "border-primary shadow-md shadow-primary/10" : "border-slate-100 opacity-60 hover:opacity-100"
                                        }`}
                                    >
                                        {isDataUri(img) ? (
                                            <img src={img} alt={product.name} className="w-full h-full object-contain p-2 md:p-3" />
                                        ) : (
                                            <Image
                                                src={img}
                                                alt={product.name}
                                                fill
                                                className="object-contain p-2 md:p-3"
                                                sizes="(max-width: 768px) 25vw, 100px"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* ── Right: Product Info ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col"
                    >
                        {/* Breadcrumb badge */}
                        <Badge variant="outline" className="mb-3 w-fit text-primary border-primary/20 bg-primary/5 uppercase tracking-widest text-[8px] py-0.5 px-2 font-black">
                            {isPrescriptionProduct ? "Customizable Frame" : "Premium Collection"}
                        </Badge>

                        <h1 className="text-xl md:text-3xl font-black tracking-tighter mb-3 italic uppercase leading-tight">
                            {product.name}
                        </h1>

                        {/* Rating row */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">(128 reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3 mb-5 md:mb-6">
                            <span className="text-2xl md:text-3xl font-black text-primary">
                                Rs {product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                                <span className="text-sm text-slate-400 line-through font-medium">
                                    Rs {product.originalPrice.toLocaleString()}
                                </span>
                            )}
                            {discount && (
                                <span className="text-xs font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                    Save {discount}%
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-sm md:text-base leading-relaxed text-slate-500 font-medium italic mb-5 md:mb-6">
                            {product.description || "Experimental architecture meets optical precision. Hand-assembled from surgical-grade titanium for a weightless experience that adapts to your every movement."}
                        </p>

                     
                        <VariationSelector variants={product.variants} onChange={setVariations} />

                        {/* ── CTA Buttons (Desktop only — mobile has sticky bar) ── */}
                        <div className="hidden md:flex flex-col gap-3 pt-5">
                            {isPrescriptionProduct && (
                                <Button
                                    onClick={() => setIsLensModalOpen(true)}
                                    size="lg"
                                    className="w-full h-14 rounded-2xl font-black bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 italic tracking-wide text-base group"
                                >
                                    Select Lenses
                                    <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            )}
                            <Button
                                onClick={handleAddToCart}
                                size="lg"
                                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black tracking-wide shadow-lg"
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Add to Cart
                            </Button>
                            <Button
                                onClick={() => setIsVTOModalOpen(true)}
                                size="lg"
                                variant="outline"
                                className="w-full h-12 rounded-2xl border-2 border-slate-200 hover:border-primary/30 hover:bg-primary/5 font-black tracking-wide"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Virtual Try-On
                            </Button>
                        </div>
                    </motion.div>
                </div>

                {/* Full-width sections */}
                <ProductSpecs
                    measurements={product.measurements}
                    description={product.description}
                    color={(product as any)?.variants?.find((v: any) => v.color === variations.color)?.color || (product as any)?.variants?.[0]?.color}
                    size={(product as any)?.variants?.find((v: any) => v.size === variations.size)?.size || (product as any)?.variants?.[0]?.size}
                    material={product.material}
                    shape={product.shape}
                    rim={product.rim}
                    referenceImage={(product as any).referenceImage}
                />
                <RelatedProducts currentProductId={product._id} category={product.category} />
            </div>

            {/* ── Sticky Mobile Bottom Bar ── */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-4 py-3 safe-area-pb">
                <div className="flex gap-2 items-center">
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">{product.name}</p>
                        <p className="text-base font-black text-primary leading-tight">Rs {product.price.toLocaleString()}</p>
                    </div>
                    {isPrescriptionProduct && (
                        <Button
                            onClick={() => setIsLensModalOpen(true)}
                            className="h-11 px-4 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-wide shadow-lg shadow-primary/20 shrink-0"
                        >
                            Select Lens
                        </Button>
                    )}
                    <Button
                        onClick={handleAddToCart}
                        className="h-11 px-4 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-wide shrink-0"
                    >
                        <ShoppingCart className="w-4 h-4 mr-1.5" />
                        Add
                    </Button>
                </div>
            </div>

            {/* Modals */}
            <VirtualTryOn
                isOpen={isVTOModalOpen}
                onClose={() => setIsVTOModalOpen(false)}
                productImage={(product as any)?.images?.[0] || product?.vtoImage || product?.image}
                productName={product.name}
            />
            <LensConfigurator
                isOpen={isLensModalOpen}
                onClose={() => setIsLensModalOpen(false)}
                product={product}
                color={variations.color}
                size={variations.size}
            />
            <ProductZoomModal
                isOpen={isZoomModalOpen}
                onClose={() => setIsZoomModalOpen(false)}
                images={imageList}
                initialIndex={activeThumb}
                productName={product.name}
            />

            {/* Mobile spacing for sticky bar */}
            <div className="h-24 md:hidden" />
            <Footer />
        </main>
    );
}
