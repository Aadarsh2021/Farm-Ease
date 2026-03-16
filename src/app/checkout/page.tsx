"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ShieldCheck, CreditCard, Banknote, CheckCircle } from "lucide-react";

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState("escrow");
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Platform fee is 2%
    const platformFee = Math.round(cartTotal * 0.02);
    const totalAmount = cartTotal + platformFee;

    const handlePayment = async () => {
        setIsProcessing(true);
        if (!user) {
            alert("Please log in to place an order.");
            setIsProcessing(false);
            return;
        }

        try {
            for (const item of cart) {
                const { error } = await supabase.from('orders').insert({
                    buyer_id: user.uid,
                    seller_id: item.vendor_id,
                    product_name: item.name,
                    quantity: item.quantity,
                    amount: item.price * item.quantity,
                    status: 'pending',
                    escrow_held: paymentMethod === 'escrow'
                });
                if (error) throw error;
            }
            setIsProcessing(false);
            setOrderPlaced(true);
            clearCart();
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Failed to securely place the order. Please try again.");
            setIsProcessing(false);
        }
    };

    if (cart.length === 0 && !orderPlaced) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center max-w-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is empty</h2>
                    <p className="text-gray-500 mb-8">You need items in your cart to checkout.</p>
                    <Link href="/market" className="bg-green-600 text-white px-8 py-3 rounded-full font-medium hover:bg-green-700 transition-all">
                        Return to Market
                    </Link>
                </div>
            </div>
        );
    }

    if (orderPlaced) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-green-100 flex flex-col items-center text-center max-w-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                    <div className="bg-green-50 text-green-500 p-4 rounded-full mb-6 relative">
                        <CheckCircle size={48} />
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                        </span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Secured!</h2>
                    <p className="text-gray-600 mb-6">Your money is safely held in <span className="font-semibold text-green-700">Farm-Ease Escrow</span>. It will only be released to the vendor once you confirm delivery.</p>

                    <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8 flex flex-col gap-2 text-sm text-left">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Order ID:</span>
                            <span className="font-mono font-medium text-gray-900">ORD-{(Math.random() * 1000000).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Amount Held:</span>
                            <span className="font-bold text-gray-900">₹{totalAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    <Link href="/dashboard" className="w-full bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20">
                        Track My Order
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-8">
                    <Link href="/cart" className="inline-flex items-center text-green-600 font-medium hover:text-green-700 mb-4 transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Back to Cart
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Secure Checkout</h1>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">

                    {/* Checkout Form */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Delivery Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                                Delivery Details
                            </h2>

                            <form className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <input type="text" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" placeholder="John" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input type="text" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" placeholder="Doe" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input type="tel" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" placeholder="+91 98765 43210" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                                    <textarea rows={3} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" placeholder="123 Farm Lane, Village Agri..."></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City/District</label>
                                        <input type="text" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                                        <input type="text" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden">
                            {/* Decorative Escrow flair */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[100px] -z-0"></div>

                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 relative z-10">
                                <span className="bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                Payment Method
                            </h2>

                            <div className="space-y-4 relative z-10">
                                <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'escrow' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="escrow"
                                            checked={paymentMethod === 'escrow'}
                                            onChange={() => setPaymentMethod('escrow')}
                                            className="w-5 h-5 text-green-600 focus:ring-green-500"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                                    <ShieldCheck className="text-green-600" size={20} />
                                                    Farm-Ease Escrow
                                                </span>
                                                <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">Recommended</div>
                                            </div>
                                            <p className="text-sm text-gray-600">Pay now via UPI/Cards. Money is held securely by us until you receive the goods.</p>
                                        </div>
                                    </div>
                                </label>

                                <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-green-500 bg-gray-50' : 'border-gray-200 hover:border-gray-300 opacity-60'}`}>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="cod"
                                            disabled
                                            className="w-5 h-5 text-green-600 focus:ring-green-500"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Banknote className="text-gray-400" size={20} />
                                                <span className="font-semibold text-gray-500">Cash on Delivery</span>
                                            </div>
                                            <p className="text-sm text-gray-400">Currently unavailable for marketplace vendor items to ensure trust.</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-5 mt-8 lg:mt-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            {/* Mini Cart Items */}
                            <div className="max-h-[300px] overflow-y-auto mb-6 pr-2 space-y-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                                            <span className="text-[10px] text-gray-400 font-bold">{item.image}</span>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                                <span className="text-sm font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 mb-6 border-t border-gray-100 pt-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Escrow Platform Fee (2%)</span>
                                    <span className="font-medium text-gray-900">₹{platformFee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-8">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-gray-900 font-bold text-lg block">Total Amount</span>
                                        <span className="text-xs text-gray-500">Includes all taxes</span>
                                    </div>
                                    <span className="text-3xl font-black text-green-700">₹{totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-6 md:px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing Secure Payment...
                                    </span>
                                ) : (
                                    <><CreditCard size={20} /> Secure Pay ₹{totalAmount.toLocaleString()}</>
                                )}
                            </button>
                            <div className="mt-4 text-center">
                                <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                    <ShieldCheck size={14} /> Transactions are 256-bit encrypted and escrow protected.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
