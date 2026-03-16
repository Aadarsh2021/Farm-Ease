"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Filter, Search, ShoppingCart, SlidersHorizontal, Leaf, Sprout, Tractor, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";

interface Product {
    id: string;
    name: string;
    price: number;
    unit: string;
    category: string;
    image_url: string | null;
    seller_id: string;
    stock: number;
}

export default function MarketPage() {
    const { addToCart } = useCart();
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [priceRange, setPriceRange] = useState(10000);

    const fetchProducts = useCallback(async () => {
        setLoadingProducts(true);
        try {
            let query = supabase
                .from("products")
                .select("*")
                // Relaxed stock filter for initial verification
                // .gt("stock", 0)
                .lte("price", priceRange);

            if (activeTab !== "all") {
                query = query.eq("category", activeTab);
            }

            if (searchQuery.trim() !== "") {
                query = query.ilike("name", `%${searchQuery}%`);
            }

            const { data, error } = await query.order("created_at", { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoadingProducts(false);
        }
    }, [activeTab, searchQuery, priceRange]);

    useEffect(() => {
        // Debounce search slightly for a better feel, though query is fast
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchProducts]);

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Page Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
                        <p className="text-gray-600 mt-2">Discover quality agricultural products directly from verified sellers.</p>
                    </div>
                    <div className="flex bg-white rounded-full shadow-sm border border-gray-100 overflow-hidden max-w-md w-full">
                        <div className="px-4 py-3 text-gray-400 group-focus-within:text-green-600 transition-colors">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search products, seeds, tools..."
                            className="flex-1 py-3 pr-4 outline-none text-gray-700 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                                <SlidersHorizontal size={20} className="text-green-600" />
                                <h3 className="font-semibold text-gray-900">Categories</h3>
                            </div>
                            <ul className="space-y-3">
                                {[
                                    { id: "all", label: "All Products", icon: Filter },
                                    { id: "fresh", label: "Fresh Produce", icon: Leaf },
                                    { id: "seeds", label: "Seeds & Fertilizers", icon: Sprout },
                                    { id: "tools", label: "Farming Tools", icon: Tractor },
                                ].map((cat) => (
                                    <li key={cat.id}>
                                        <button
                                            onClick={() => setActiveTab(cat.id)}
                                            className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all ${activeTab === cat.id ? 'bg-green-600 text-white font-bold shadow-md shadow-green-100' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <cat.icon size={18} /> {cat.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-4 flex justify-between">
                                    Price Range
                                    <span className="text-green-600 font-bold">₹{priceRange}</span>
                                </h3>
                                <input
                                    type="range"
                                    className="w-full accent-green-600 cursor-pointer"
                                    min="0"
                                    max="10000"
                                    step="100"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                                    <span>₹0</span>
                                    <span>₹10,000+</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
                            <p className="text-gray-500 text-sm font-medium">
                                {loadingProducts ? "Refreshing..." : <><span className="font-black text-gray-900">{products.length}</span> items found</>}
                            </p>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-400 uppercase hidden sm:inline">Sort By</span>
                                <select className="bg-gray-50 border border-gray-100 text-gray-700 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2 outline-none cursor-pointer font-medium">
                                    <option>Newest Arrivals</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {loadingProducts && products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <Loader2 size={40} className="animate-spin text-green-500 mb-4" />
                                <p className="text-gray-500 font-medium">Searching our fields...</p>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col relative">
                                        <div className="absolute top-3 left-3 z-10">
                                            <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-green-700 text-[10px] font-black rounded-lg shadow-sm border border-gray-100 uppercase tracking-tighter">
                                                {product.category}
                                            </span>
                                        </div>
                                        <Link href={`/market/${product.id}`} className="block relative">
                                            <div className="aspect-square bg-gray-50 relative overflow-hidden flex items-center justify-center">
                                                {product.image_url ? (
                                                    <Image src={product.image_url} alt={product.name} fill className="object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <>
                                                        <div className="absolute inset-0 bg-gradient-to-tr from-green-50/30 to-gray-50/30"></div>
                                                        <Leaf size={40} className="text-green-100 z-10" strokeWidth={1} />
                                                    </>
                                                )}
                                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                                            </div>
                                        </Link>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="mb-4">
                                                <Link href={`/market/${product.id}`}>
                                                    <h3 className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1 mb-1">{product.name}</h3>
                                                </Link>
                                                <p className="text-xs text-gray-400 font-medium">Verified Local Seller</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-black text-gray-900">₹{product.price}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">per {product.unit}</span>
                                                </div>
                                                <button
                                                    onClick={() => addToCart({
                                                        id: product.id,
                                                        name: product.name,
                                                        price: product.price,
                                                        unit: product.unit,
                                                        vendor: product.seller_id,
                                                        vendor_id: product.seller_id,
                                                        image: product.image_url || ""
                                                    })}
                                                    className="bg-green-50 text-green-700 hover:bg-green-600 hover:text-white p-3 rounded-xl transition-all shadow-sm active:scale-95"
                                                    title="Add to Cart"
                                                >
                                                    <ShoppingCart size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center flex flex-col items-center shadow-sm">
                                <div className="bg-gray-50 p-6 rounded-full mb-6">
                                    <Search size={48} className="text-gray-300" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">No crops found matching that</h3>
                                <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">Try adjusting your filters or search terms. Our fields are usually full of quality produce!</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setActiveTab('all'); setPriceRange(10000); }}
                                    className="bg-green-600 text-white font-bold px-10 py-3 rounded-full hover:bg-green-700 shadow-lg shadow-green-100 transition-all hover:-translate-y-0.5"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
