import React from "react";
import Link from "next/link";
import { Leaf, Twitter, Facebook, Instagram, ShieldCheck, Truck, Headphones } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Top features row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-50 p-3 rounded-full text-green-600">
                            <ShieldCheck size={28} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">Secure Escrow</h4>
                            <p className="text-sm text-gray-500">100% payment protection</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                            <Truck size={28} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">Direct Delivery</h4>
                            <p className="text-sm text-gray-500">Farm fresh straight to you</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-50 p-3 rounded-full text-orange-600">
                            <Headphones size={28} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">24/7 Support</h4>
                            <p className="text-sm text-gray-500">Always here to help you</p>
                        </div>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="bg-green-600 text-white p-1.5 rounded-lg">
                                <Leaf size={24} />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-emerald-500">
                                Farm-Ease
                            </span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Connecting farmers, agri-sellers, and consumers through a secure, transparent, and fair agricultural marketplace.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-green-600 transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-green-600 transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-green-600 transition-colors"><Instagram size={20} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Marketplace</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link href="/market" className="hover:text-green-600 transition-colors">All Products</Link></li>
                            <li><Link href="#" className="hover:text-green-600 transition-colors">Fresh Produce</Link></li>
                            <li><Link href="#" className="hover:text-green-600 transition-colors">Seeds & Fertilizers</Link></li>
                            <li><Link href="#" className="hover:text-green-600 transition-colors">Farming Tools</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Vendors</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link href="/sell" className="hover:text-green-600 transition-colors">Start Selling</Link></li>
                            <li><Link href="/sell" className="hover:text-green-600 transition-colors">Seller Policies</Link></li>
                            <li><Link href="/escrow" className="hover:text-green-600 transition-colors">Escrow Protection</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Legal & Support</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-green-600 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-green-600 transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-green-600 transition-colors">Contact Us</Link></li>
                            <li><Link href="#" className="hover:text-green-600 transition-colors">FAQ</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom copyright */}
                <div className="py-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 text-center md:text-left">
                    <p>© {new Date().getFullYear()} Farm-Ease. All rights reserved.</p>
                    <div className="mt-4 md:mt-0 space-x-4">
                        <span>Made with precision & security.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
