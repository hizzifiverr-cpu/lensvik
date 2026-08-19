"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface PrescriptionData {
    measurements: {
        od_sph: string; od_cyl: string; od_axis: string;
        os_sph: string; os_cyl: string; os_axis: string;
        pd: string;
    };
    lensCategory: { name: string; price: number };
    lensType: { name: string; price: number };
}

export interface CartItem {
    id: string; // Unique entry ID (could be productID_prescriptionHash)
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    color?: string;
    size?: string;
    lensType?: string;
    prescription?: PrescriptionData;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity" | "id">) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("lensvik-cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        localStorage.setItem("lensvik-cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: Omit<CartItem, "quantity" | "id">) => {
        setCart((prevCart) => {
            // Generate a unique ID based on product and prescription configuration
            const prescriptionHash = product.prescription
                ? btoa(JSON.stringify(product.prescription)).substring(0, 8)
                : "none";
            const itemId = `${product.productId}_${prescriptionHash}`;

            const existingItem = prevCart.find((item) => item.id === itemId);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.id === itemId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, { ...product, id: itemId, quantity: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                cartCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
