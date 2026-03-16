"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingCart, ArrowLeft, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

    const handleCheckout = () => {
        // Navigate to checkout
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center max-w-lg w-full text-center">
                    <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                        <ShoppingCart size={40} className="text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-8 max-w-sm">Looks like you haven&apos;t added any products, seeds, or tools to your cart yet.</p>
                    <Link href="/market" className="bg-green-600 text-white px-8 py-3 rounded-full font-medium hover:bg-green-700 transition-all shadow-md transform hover:-translate-y-0.5">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                    <button onClick={clearCart} className="text-red-500 font-medium hover:text-red-600 text-sm flex items-center gap-1">
                        <Trash2 size={16} /> Clear Cart
                    </button>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">

                    {/* Cart Items List */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <ul className="divide-y divide-gray-100">
                                {cart.map((item) => (
                                    <li key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-gray-50 transition-colors">
                                        {/* Image Placeholder */}
                                        <div className="w-full sm:w-32 aspect-square bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
                                            <span className="text-gray-400 text-xs font-semibold">{item.image?.toUpperCase()}</span>
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{item.name}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Vendor: <span className="font-medium">{item.vendor}</span></p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>

                                            <div className="flex items-end justify-between mt-4">
                                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 text-gray-600 hover:text-green-600 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <ChevronLeft size={18} />
                                                    </button>
                                                    <span className="w-10 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 text-gray-600 hover:text-green-600 hover:bg-gray-200 rounded-md transition-colors"
                                                    >
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500">₹{item.price} / {item.unit}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="bg-gray-50 border-t border-gray-100 p-4">
                                <Link href="/market" className="text-green-600 font-medium hover:text-green-700 flex items-center gap-1 w-fit">
                                    <ArrowLeft size={16} /> Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4 mt-8 lg:mt-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cart.length} items)</span>
                                    <span className="font-medium text-gray-900">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Platform Fee (2%)</span>
                                    <span className="font-medium text-gray-900">₹{Math.round(cartTotal * 0.02).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 text-sm font-medium">Calculated at next step</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 mb-8">
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-900 font-semibold">Total Amount</span>
                                    <span className="text-2xl font-bold text-gray-900">₹{(cartTotal + Math.round(cartTotal * 0.02)).toLocaleString()}</span>
                                </div>
                            </div>

                            <Link href="/checkout" className="w-full block text-center bg-gray-900 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-colors shadow-lg shadow-green-900/20">
                                Proceed to Checkout
                            </Link>

                            <div className="mt-6 bg-green-50 rounded-xl p-4 flex items-start gap-3 border border-green-100">
                                <ShieldCheck size={24} className="text-green-600 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-green-900 text-sm">Escrow Protected Payment</h4>
                                    <p className="text-xs text-green-700 mt-1">Your payment is held securely until the items are delivered to you safely. 100% Guaranteed.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
