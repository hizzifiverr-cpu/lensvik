"use client";

import React from "react";
import { motion } from "framer-motion";

interface SectionRevealProps {
    children: React.ReactNode;
    delay?: number;
}

export function SectionReveal({ children, delay = 0 }: SectionRevealProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ 
                duration: 0.8, 
                delay, 
                ease: [0.21, 1.11, 0.81, 0.99] 
            }}
        >
            {children}
        </motion.div>
    );
}
