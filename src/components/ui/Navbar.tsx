"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Menu, X, Leaf, ShoppingCart, User as UserIcon, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const { user, userRole } = useAuth();
    const { cartCount } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-green-600 text-white p-1.5 rounded-lg">
                            <Leaf size={24} />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-emerald-500">
                            Farm-Ease
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/market" className="text-gray-600 hover:text-green-600 transition-colors">Marketplace</Link>
                        <Link href="/about" className="text-gray-600 hover:text-green-600 transition-colors">About Us</Link>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/cart" className="text-gray-600 hover:text-green-600 transition-colors relative">
                                    <ShoppingCart size={22} />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>

                                <Link href={userRole === "farmer" ? "/farmer/dashboard" : userRole === "seller" ? "/seller/dashboard" : "/dashboard"} className="flex items-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors">
                                    <UserIcon size={18} />
                                    <span className="text-sm font-medium">Dashboard</span>
                                </Link>

                                <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="text-green-600 font-medium hover:text-green-700 transition-colors">
                                    Log In
                                </Link>
                                <Link href="/signup" className="bg-green-600 text-white px-5 py-2 rounded-full font-medium hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-4">
                        {user && (
                            <Link href="/cart" className="text-gray-600 relative">
                                <ShoppingCart size={22} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-600 hover:text-gray-900 focus:outline-none"
                        >
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-4">
                            <Link href="/market" className="block text-gray-700 hover:text-green-600 text-lg font-medium">Marketplace</Link>
                            <Link href="/about" className="block text-gray-700 hover:text-green-600 text-lg font-medium">About Us</Link>

                            <div className="border-t border-gray-100 pt-4">
                                {user ? (
                                    <div className="space-y-4">
                                        <Link href="/dashboard" className="flex items-center gap-3 text-gray-700 font-medium">
                                            <UserIcon size={20} className="text-gray-500" />
                                            Dashboard
                                        </Link>
                                        <button onClick={handleLogout} className="flex items-center gap-3 text-red-500 font-medium w-full text-left">
                                            <LogOut size={20} />
                                            Log Out
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <Link href="/login" className="block w-full text-center border border-green-600 text-green-600 rounded-full py-2.5 font-medium">
                                            Log In
                                        </Link>
                                        <Link href="/signup" className="block w-full text-center bg-green-600 text-white rounded-full py-2.5 font-medium shadow-md">
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
