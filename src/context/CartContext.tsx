"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type CartItem = {
    id: string;
    name: string;
    price: number;
    unit: string;
    quantity: number;
    vendor: string;
    vendor_id: string;
    image: string;
};

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType>({
    cart: [],
    addToCart: () => { },
    removeFromCart: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
    cartTotal: 0,
    cartCount: 0,
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Load from LocalStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("farm_ease_cart");
        if (savedCart) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Sync to LocalStorage
    useEffect(() => {
        localStorage.setItem("farm_ease_cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: Omit<CartItem, "quantity"> & { quantity?: number }) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            const quantityToAdd = product.quantity || 1;

            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
                );
            }
            return [...prev, { ...product, quantity: quantityToAdd }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return;
        setCart((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}
        >
            {children}
        </CartContext.Provider>
    );
};
