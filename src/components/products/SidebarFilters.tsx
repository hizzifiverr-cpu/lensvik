"use client";

import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface SidebarFiltersProps {
    filters: {
        categories: string[];
        priceRange: [number, number];
        materials?: string[];
        shapes?: string[];
        rims?: string[];
        sizes?: string[];
        gender?: string[];
    };
    onFilterChange: (type: string, value: any) => void;
    activeFilters: any;
}

export function SidebarFilters({ filters, onFilterChange, activeFilters }: SidebarFiltersProps) {
    return (
        <div className="w-full space-y-8 pr-4">
            <div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6 flex items-center justify-between">
                    Refine
                    <Badge variant="secondary" className="font-bold text-[10px] uppercase">{activeFilters.totalCount} Results</Badge>
                </h3>

                <Accordion type="multiple" defaultValue={["category", "price", "coating", "features"]} className="w-full">
                    <AccordionItem value="price" className="border-slate-100">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <span className="label-tag text-slate-900 group-hover:text-primary transition-colors">Price Range</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-8 pt-4 px-2">
                            <Slider
                                defaultValue={[activeFilters.priceRange[1]]}
                                max={filters.priceRange[1]}
                                step={100}
                                className="mb-6"
                                onValueChange={(val) => onFilterChange("price", val[0])}
                            />
                            <div className="flex justify-between items-center text-xs font-black italic uppercase tracking-widest text-slate-400">
                                <span>Rs 0</span>
                                <span className="text-primary bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">Under Rs {activeFilters.priceRange[1].toLocaleString()}</span>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="material" className="border-slate-100">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <span className="label-tag text-slate-900 group-hover:text-primary transition-colors">Material</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 space-y-3">
                            {filters.materials?.map((material) => (
                                <div key={material} className="flex items-center space-x-3 group cursor-pointer">
                                    <Checkbox
                                        id={material}
                                        checked={activeFilters.materials?.includes(material)}
                                        onCheckedChange={() => onFilterChange("materials", material)}
                                        className="h-5 w-5 rounded-md data-[state=checked]:bg-primary"
                                    />
                                    <label htmlFor={material} className="text-sm font-medium text-slate-600 group-hover:text-primary cursor-pointer transition-colors">
                                        {material}
                                    </label>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="shape" className="border-slate-100">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <span className="label-tag text-slate-900 group-hover:text-primary transition-colors">Shape</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 space-y-3">
                            {filters.shapes?.map((shape) => (
                                <div key={shape} className="flex items-center space-x-3 group cursor-pointer">
                                    <Checkbox
                                        id={shape}
                                        checked={activeFilters.shapes?.includes(shape)}
                                        onCheckedChange={() => onFilterChange("shapes", shape)}
                                        className="h-5 w-5 rounded-md data-[state=checked]:bg-primary"
                                    />
                                    <label htmlFor={shape} className="text-sm font-medium text-slate-600 group-hover:text-primary cursor-pointer transition-colors capitalize">
                                        {shape.replace(/_/g, ' ')}
                                    </label>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="rim" className="border-slate-100">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <span className="label-tag text-slate-900 group-hover:text-primary transition-colors">Rim</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 space-y-3">
                            {filters.rims?.map((rim) => (
                                <div key={rim} className="flex items-center space-x-3 group cursor-pointer">
                                    <Checkbox
                                        id={rim}
                                        checked={activeFilters.rims?.includes(rim)}
                                        onCheckedChange={() => onFilterChange("rims", rim)}
                                        className="h-5 w-5 rounded-md data-[state=checked]:bg-primary"
                                    />
                                    <label htmlFor={rim} className="text-sm font-medium text-slate-600 group-hover:text-primary cursor-pointer transition-colors">
                                        {rim.replace(/_/g, ' ')}
                                    </label>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="size" className="border-slate-100">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <span className="label-tag text-slate-900 group-hover:text-primary transition-colors">Size</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 space-y-3">
                            {filters.sizes?.map((size) => (
                                <div key={size} className="flex items-center space-x-3 group cursor-pointer">
                                    <Checkbox
                                        id={size}
                                        checked={activeFilters.sizes?.includes(size)}
                                        onCheckedChange={() => onFilterChange("sizes", size)}
                                        className="h-5 w-5 rounded-md data-[state=checked]:bg-primary"
                                    />
                                    <label htmlFor={size} className="text-sm font-medium text-slate-600 group-hover:text-primary cursor-pointer transition-colors capitalize">
                                        {size}
                                    </label>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>

                </Accordion>
            </div>
        </div>
    );
}
