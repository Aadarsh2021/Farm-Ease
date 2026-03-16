"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, ShieldCheck, MapPin, Store, Star, Minus, Plus, ShoppingCart, Leaf } from "lucide-react";

export type ProductType = {
    id: string;
    name: string;
    price: number;
    unit: string;
    stock: number;
    category: string;
    vendor: string;
    vendor_id: string;
    image: string;
    description: string;
    location: string;
    rating: number;
    reviews: number;
};

export default function ProductDetailClient({ product }: { product: ProductType | null }) {
    const router = useRouter();
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);

    if (!product) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
                <Leaf size={48} className="text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
                <p className="text-gray-500 mb-6 text-center max-w-sm">The product you are looking for might have been removed or the link is incorrect.</p>
                <Link href="/market" className="bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 transition-colors">
                    Return to Marketplace
                </Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            vendor: product.vendor,
            vendor_id: product.vendor_id,
            image: product.image,
            quantity: quantity,
        });

        // Small notification if we had one, for now alert is fine
        alert("Added to cart!");
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumbs & Back */}
                <div className="mb-6">
                    <button onClick={() => router.back()} className="flex items-center text-gray-400 hover:text-green-700 transition-colors text-sm font-medium group">
                        <div className="bg-white p-1.5 rounded-lg border border-gray-200 mr-2 group-hover:border-green-200 group-hover:bg-green-50">
                            <ArrowLeft size={16} />
                        </div>
                        Back to Marketplace
                    </button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 lg:gap-8">

                        {/* Image Gallery Side */}
                        <div className="p-8 lg:p-12 md:border-r border-gray-100 flex flex-col items-center justify-center bg-gray-50/50">
                            <div className="w-full aspect-square bg-white rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden group shadow-inner border border-gray-100">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-tr from-green-50 to-gray-50"></div>
                                        <Leaf size={100} className="text-green-100 z-10" strokeWidth={1} />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Product Info Side */}
                        <div className="p-8 lg:p-12 flex flex-col">

                            <div className="mb-2 flex items-center justify-between">
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wider">
                                    {product.category || "General"}
                                </span>
                                <div className="flex items-center text-yellow-500">
                                    <Star size={18} fill="currentColor" />
                                    <span className="ml-1.5 text-gray-700 font-bold text-sm">{product.rating}</span>
                                    <span className="ml-1 text-gray-400 text-xs">({product.reviews} reviews)</span>
                                </div>
                            </div>

                            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>

                            <div className="flex items-end gap-3 mb-6">
                                <span className="text-4xl font-black text-green-700">₹{product.price}</span>
                                <span className="text-gray-500 font-medium mb-1 capitalize">/ {product.unit}</span>
                            </div>

                            {/* Seller & Trust Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                                    <div className="bg-green-100 p-2.5 rounded-xl text-green-700"><Store size={20} /></div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">Seller</p>
                                        <p className="font-bold text-gray-900 truncate">{product.vendor}</p>
                                    </div>
                                </div>
                                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-50 flex items-center gap-3">
                                    <div className="bg-blue-100 p-2.5 rounded-xl text-blue-700"><MapPin size={20} /></div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">Region</p>
                                        <p className="font-bold text-gray-800">{product.location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8 border-t border-gray-50 pt-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    Description
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                    {product.description}
                                </p>
                            </div>

                            {/* Action Area */}
                            <div className="mt-auto space-y-6 pt-6 border-t border-gray-50">

                                <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-3">
                                    <span className="font-bold text-gray-700 ml-2">Available Stock: {product.stock} {product.unit}s</span>
                                    <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="w-10 text-center font-black text-gray-900 select-none text-lg">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-green-600 transition-colors"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 bg-green-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-green-200 hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                    >
                                        <ShoppingCart size={22} /> Add to Cart
                                    </button>
                                </div>

                                <div className="flex items-center justify-center gap-3 bg-blue-50 py-3 rounded-xl border border-blue-100">
                                    <ShieldCheck size={18} className="text-blue-600" />
                                    <span className="text-xs font-bold text-blue-700">100% Escrow Protection Enabled</span>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
