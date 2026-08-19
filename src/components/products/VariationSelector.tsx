"use client";

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";

// Mapping of common eyewear colors to hex codes
const COLOR_MAP: Record<string, string> = {
    "Black": "#000000",
    "Phantom Black": "#000000",
    "Navy": "#1e293b",
    "Deep Navy": "#1e293b",
    "Gray": "#475569",
    "Gunmetal Gray": "#475569",
    "Gunmetal": "#475569",
    "Gold": "#d4af37",
    "Luxe Gold": "#d4af37",
    "Silver": "#94a3b8",
    "Silver Titanium": "#94a3b8",
    "Tortoise": "#78350f",
    "Brown": "#78350f",
    "Clear": "#f8fafc",
    "Rose Gold": "#fda4af",
    "Red": "#dc2626",
    "Blue": "#2563eb",
    "White": "#ffffff",
    "Pink": "#ec4899",
    "Purple": "#9333ea",
    "Green": "#16a34a",
    "Orange": "#ea580c",
    "Crystal": "#f1f5f9",
    "Matte Black": "#1a1a1a",
    "Matte Navy": "#172554",
    "Matte Tortoise": "#451a03",
    "Havana": "#5c3a1e",
    "Transparent": "#e2e8f0",
    "Two-Tone": "#a78bfa",
    "Gradient": "#6366f1",
    "Pearl": "#fde68a",
};

/** Generate a consistent hex color from any color name string */
function colorNameToHex(name: string): string {
    let hash = 0;
    const normalized = name.replace(/\s+/g, '').toLowerCase();
    for (let i = 0; i < normalized.length; i++) {
        hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    const s = 45 + (Math.abs(hash + 100) % 30);
    const l = 35 + (Math.abs(hash + 200) % 30);
    const hslToHex = (h: number, s: number, l: number) => {
        s /= 100; l /= 100;
        const a = s * Math.min(l, 1 - l);
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    };
    return hslToHex(h, s, l);
}

function resolveColor(colorName: string): string {
    return COLOR_MAP[colorName] || colorNameToHex(colorName);
}

interface VariationSelectorProps {
    variants?: Array<{ color?: string; size?: string }>;
    onChange: (selections: { color: string; size: string }) => void;
}

export function VariationSelector({ variants = [], onChange }: VariationSelectorProps) {
    // Extract unique colors and sizes from variants
    const availableColors = Array.from(new Set(variants.map(v => v.color).filter(Boolean))) as string[];
    const availableSizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean))) as string[];

    // Fallbacks if no variants provided
    const displayColors = availableColors.length > 0 ? availableColors : ["Phantom Black"];
    const displaySizes = availableSizes.length > 0 ? availableSizes : ["S", "M", "L"];

    const [selectedColor, setSelectedColor] = useState(displayColors[0]);
    const [selectedSize, setSelectedSize] = useState(displaySizes.includes("M") ? "M" : displaySizes[0]);

    useEffect(() => {
        onChange({ color: selectedColor, size: selectedSize });
    }, [selectedColor, selectedSize]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Color Selector */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Finish: <span className="text-slate-900">{selectedColor}</span></span>
                </div>
                <div className="flex items-center gap-3">
                    {displayColors.map((color) => (
                        <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`relative w-8 h-8 rounded-full transition-all duration-300 border border-slate-100 ${
                                selectedColor === color ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'
                            }`}
                            style={{ backgroundColor: resolveColor(color) }}
                        >
                            {selectedColor === color && (
                                <Check className={`w-3 h-3 absolute inset-0 m-auto drop-shadow-md ${
                                    ['Clear', 'White', 'Crystal', 'Transparent', 'Champagne', 'Beige', 'Silver', 'Platinum', 'Pearl', 'Khaki'].includes(color) 
                                        ? 'text-slate-900' 
                                        : 'text-white'
                                }`} />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Size: <span className="text-slate-900">{selectedSize}</span></span>
                </div>
                <div className="flex items-center gap-2">
                    {displaySizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`w-10 h-10 rounded-xl border-2 transition-all font-black text-xs ${
                                selectedSize === size ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                            }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
