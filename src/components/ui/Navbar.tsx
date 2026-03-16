"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Menu, X, Leaf, ShoppingCart, User as UserIcon, LogOut, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function Navbar() {
    const { user, userRole } = useAuth();
    const { cartCount } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Magnetic Effect Logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 20, stiffness: 300 };
    const magneticX = useSpring(mouseX, springConfig);
    const magneticY = useSpring(mouseY, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        mouseX.set((clientX - centerX) * 0.4);
        mouseY.set((clientY - centerY) * 0.4);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    // Hide on Scroll Logic
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}>
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="glass rounded-[2rem] px-8 py-3 flex justify-between items-center border-white/20 shadow-premium">
                    {/* Logo with Magnetic Effect */}
                    <motion.div
                        style={{ x: magneticX, y: magneticY }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="bg-slate-900 text-white p-2.5 rounded-2xl group-hover:bg-green-600 transition-colors shadow-lg">
                                <Leaf size={24} className="group-hover:rotate-12 transition-transform" />
                            </div>
                            <span className="text-2xl font-black text-slate-900 tracking-tight">
                                Farm<span className="text-green-600">Ease</span>
                            </span>
                        </Link>
                    </motion.div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-10 text-sm font-bold uppercase tracking-widest">
                        <Link href="/market" className="text-slate-500 hover:text-slate-900 transition-colors">Marketplace</Link>
                        <Link href="/about" className="text-slate-500 hover:text-slate-900 transition-colors">About Us</Link>

                        <div className="h-6 w-px bg-slate-200"></div>

                        {user ? (
                            <div className="flex items-center gap-6">
                                <Link href="/cart" className="text-slate-900 hover:text-green-600 transition-all relative group">
                                    <ShoppingCart size={22} />
                                    {cartCount > 0 && (
                                        <motion.span 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white"
                                        >
                                            {cartCount}
                                        </motion.span>
                                    )}
                                </Link>

                                <Link href={userRole === "farmer" ? "/farmer/dashboard" : userRole === "seller" ? "/seller/dashboard" : "/dashboard"} className="flex items-center gap-2 text-white bg-slate-900 hover:bg-green-600 px-6 py-2.5 rounded-2xl transition-all shadow-md active:scale-95">
                                    <UserIcon size={18} />
                                    <span>Dashboard</span>
                                </Link>

                                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <LogOut size={22} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-6">
                                <Link href="/login" className="text-slate-900 hover:text-green-600 transition-colors">
                                    Log In
                                </Link>
                                <Link href="/signup" className="group flex items-center gap-2 bg-slate-900 text-white px-7 py-3 rounded-2xl font-black hover:bg-green-600 transition-all shadow-xl active:scale-95">
                                    Join Community <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-6">
                        {user && (
                            <Link href="/cart" className="text-slate-900 relative">
                                <ShoppingCart size={24} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="bg-slate-100 p-2.5 rounded-xl text-slate-900 hover:bg-slate-200 transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="md:hidden fixed inset-0 z-[110] bg-white/95 backdrop-blur-xl p-8 pt-24"
                    >
                        <button 
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute top-8 right-8 bg-slate-100 p-3 rounded-2xl"
                        >
                            <X size={28} />
                        </button>

                        <div className="flex flex-col gap-10">
                            <div className="space-y-6">
                                <Link onClick={() => setIsMenuOpen(false)} href="/market" className="block text-4xl font-black text-slate-900 tracking-tight">Marketplace</Link>
                                <Link onClick={() => setIsMenuOpen(false)} href="/about" className="block text-4xl font-black text-slate-900 tracking-tight">About Us</Link>
                            </div>

                            <div className="h-px bg-slate-100 w-full"></div>

                            {user ? (
                                <div className="space-y-6">
                                    <Link onClick={() => setIsMenuOpen(false)} href="/dashboard" className="flex items-center gap-4 text-2xl font-bold text-slate-900">
                                        <div className="bg-slate-900 text-white p-3 rounded-2xl">
                                            <UserIcon size={24} />
                                        </div>
                                        Dashboard
                                    </Link>
                                    <button onClick={handleLogout} className="flex items-center gap-4 text-2xl font-bold text-red-500 w-full text-left">
                                        <div className="bg-red-50 p-3 rounded-2xl">
                                            <LogOut size={24} />
                                        </div>
                                        Log Out
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <Link onClick={() => setIsMenuOpen(false)} href="/login" className="w-full text-center border-2 border-slate-900 text-slate-900 rounded-[1.5rem] py-5 text-xl font-black">
                                        Log In
                                    </Link>
                                    <Link onClick={() => setIsMenuOpen(false)} href="/signup" className="w-full text-center bg-slate-900 text-white rounded-[1.5rem] py-5 text-xl font-black shadow-2xl">
                                        Join Now
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
