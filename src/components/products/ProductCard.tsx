"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    size?: string;
    rating?: number;
    image?: string;
    images?: string[];
    category: string;
    index: number;
}

export function ProductCard({ _id, name, price, originalPrice, image, images, category, index }: ProductCardProps) {
    const { addToCart } = useCart();

    const isSale = originalPrice && originalPrice > price;

    // Resolve the best available image — prefer images[1] (thumbnail), fallback to images[0], then image prop, then placeholder
    const rawImage = (images && images.length > 1) ? images[1] : (images && images.length > 0 ? images[0] : (image || '/images/dfd.png'));
    const displayImage = rawImage || '/images/dfd.png';
    const isDataUri = displayImage.startsWith('data:');

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, scale: 0.95, y: 20 },
                show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
            }}
            className="group"
        >
            <div className="flex flex-col h-full bg-white transition-all duration-300">
                <Link href={`/products/${_id}`} className="relative aspect-[4/3] overflow-hidden bg-white mb-2 md:mb-4">
                    {isDataUri ? (
                        <img
                            src={displayImage}
                            alt={name}
                            className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <Image
                            src={displayImage}
                            alt={name}
                            fill
                            className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    )}
                </Link>

                <div className="flex flex-col flex-1 px-1">
                    <Link href={`/products/${_id}`} className="w-full mb-3 md:mb-4">
                        <button className="w-full border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-none h-10 md:h-12 uppercase tracking-widest text-[10px] md:text-xs font-bold transition-all duration-300">
                            Quick View
                        </button>
                    </Link>

                    <Link href={`/products/${_id}`}>
                        <h3 className="text-slate-900 hover:text-primary transition-colors line-clamp-2 leading-tight min-h-[32px] md:min-h-[44px] text-sm md:text-base font-semibold mb-1">
                            {name}
                        </h3>
                    </Link>

                    {isSale && (
                        <span className="text-red-600 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-0.5">
                            SALE
                        </span>
                    )}

                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-slate-900 font-bold text-sm md:text-base">
                            Rs.{price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {originalPrice && (
                            <span className="text-slate-400 line-through text-[11px] md:text-sm">
                                Rs.{originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
