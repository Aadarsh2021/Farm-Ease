"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, TrendingUp, Users, Wallet, CheckCircle2, ArrowRight } from "lucide-react";

export default function SellLandingPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-green-900 to-green-800 text-white pt-20 pb-32">
                <div className="absolute inset-x-0 bottom-0 h-32 bg-white" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="lg:w-2/3">
                        <span className="inline-block py-1 px-3 rounded-full bg-green-700 text-green-100 text-sm font-semibold tracking-wider mb-6">
                            FARM-EASE SELLER NETWORK
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                            Grow Your Agri-Business with Zero Risk.
                        </h1>
                        <p className="text-xl text-green-100 mb-10 max-w-2xl">
                            Join thousands of farmers and vendors selling directly to buyers. Enjoy 100% escrow payment protection and the lowest platform fees in the industry.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/signup" className="flex items-center justify-center gap-2 bg-yellow-400 text-green-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                Start Selling Today <ArrowRight size={20} />
                            </Link>
                            <Link href="#how-it-works" className="flex items-center justify-center gap-2 bg-green-800 border border-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-all">
                                How it Works
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Benefits */}
            <section className="py-20 -mt-16 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Benefit 1 */}
                        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 transform transition-transform hover:-translate-y-2">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 shadow-sm">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">100% Escrow Protection</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Say goodbye to unpaid dues and payment defaults. Buyers deposit funds into a secure escrow account before you ship. You are guaranteed payment upon delivery.
                            </p>
                        </div>

                        {/* Benefit 2 */}
                        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 transform transition-transform hover:-translate-y-2">
                            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600 shadow-sm">
                                <TrendingUp size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Flat 2% Platform Fee</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Keep more of your hard-earned profits. We charge a transparent, flat 2% fee on successful transactions. No hidden charges, no listing fees, ever.
                            </p>
                        </div>

                        {/* Benefit 3 */}
                        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 transform transition-transform hover:-translate-y-2">
                            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600 shadow-sm">
                                <Users size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Direct Buyer Access</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Cut out the middlemen. Connect directly with consumers, restaurants, and other businesses looking for your fresh produce or agricultural tools.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Who is it for? */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Choose Your Path</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Whether you grow crops or supply the tools to grow them, Farm-Ease has a dedicated dashboard built for your specific needs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Farmer Profile */}
                        <div className="bg-white rounded-3xl p-10 border border-green-100 shadow-md relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10 transition-transform group-hover:scale-125" />
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">The Farmer</h3>
                            <p className="text-gray-600 mb-6 text-lg">
                                For agriculturists and growers looking to sell fresh produce, grains, and raw materials directly to consumers or markets.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-700">
                                    <CheckCircle2 className="text-green-500 mr-3" size={20} /> List fresh harvests dynamically
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <CheckCircle2 className="text-green-500 mr-3" size={20} /> Manage regional delivery boundaries
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <CheckCircle2 className="text-green-500 mr-3" size={20} /> Guaranteed payment via Escrow
                                </li>
                            </ul>
                            <Link href="/signup" className="inline-block w-full text-center bg-green-100 text-green-800 font-bold py-3 rounded-xl hover:bg-green-200 transition-colors">
                                Register as Farmer
                            </Link>
                        </div>

                        {/* Seller / Vendor Profile */}
                        <div className="bg-white rounded-3xl p-10 border border-emerald-100 shadow-md relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 transition-transform group-hover:scale-125" />
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">The Agri-Seller</h3>
                            <p className="text-gray-600 mb-6 text-lg">
                                For businesses and manufacturers supplying farming equipment, seeds, fertilizers, and agricultural technology.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-700">
                                    <CheckCircle2 className="text-emerald-500 mr-3" size={20} /> Reach thousands of targeted farmers
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <CheckCircle2 className="text-emerald-500 mr-3" size={20} /> Bulk order management system
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <CheckCircle2 className="text-emerald-500 mr-3" size={20} /> Verified B2B transaction security
                                </li>
                            </ul>
                            <Link href="/signup" className="inline-block w-full text-center bg-emerald-100 text-emerald-800 font-bold py-3 rounded-xl hover:bg-emerald-200 transition-colors">
                                Register as Vendor
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Farm-Ease Escrow Works</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            A simple, transparent process designed to protect your hard work and ensure you always get paid.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0" />

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                            {/* Step 1 */}
                            <div className="bg-white rounded-2xl p-6 text-center border-2 border-dashed border-gray-200 hover:border-green-400 transition-colors">
                                <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-2xl mb-4 border-4 border-white shadow-md">
                                    1
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">List Products</h4>
                                <p className="text-sm text-gray-500">Create your free profile and list your inventory in minutes.</p>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-white rounded-2xl p-6 text-center border-2 border-dashed border-gray-200 hover:border-green-400 transition-colors">
                                <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-2xl mb-4 border-4 border-white shadow-md">
                                    2
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">Buyer Pays Escrow</h4>
                                <p className="text-sm text-gray-500">Buyer orders and deposits 100% of the funds securely into Farm-Ease Escrow.</p>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-white rounded-2xl p-6 text-center border-2 border-dashed border-gray-200 hover:border-green-400 transition-colors">
                                <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-2xl mb-4 border-4 border-white shadow-md">
                                    3
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">Ship the Order</h4>
                                <p className="text-sm text-gray-500">You are notified that funds are secured. You dispatch the goods.</p>
                            </div>

                            {/* Step 4 */}
                            <div className="bg-white rounded-2xl p-6 text-center border-2 border-dashed border-gray-200 hover:border-green-400 transition-colors">
                                <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-2xl mb-4 border-4 border-white shadow-md">
                                    4
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">Get Paid</h4>
                                <p className="text-sm text-gray-500">Buyer receives goods. Escrow instantly releases funds to your account.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-green-900 py-20 text-center">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Wallet className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Ready to revolutionize your agricultural sales?
                    </h2>
                    <p className="text-xl text-green-100 mb-10">
                        Join the fastest-growing network of verified farmers and suppliers today. Setup takes less than 2 minutes.
                    </p>
                    <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-green-900 px-10 py-5 rounded-full font-bold text-xl hover:bg-yellow-300 transition-all shadow-[0_0_40px_rgba(250,204,21,0.3)]">
                        Create Seller Account
                    </Link>
                </div>
            </section>
        </div>
    );
}
