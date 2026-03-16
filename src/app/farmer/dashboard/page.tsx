"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Package, Plus, Banknote, ShieldAlert, CheckCircle2, FileText, Bell, Leaf, LogOut, Home, X, ImageIcon, Loader2, Truck, User, ShieldCheck, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { supabase } from "@/lib/supabase";

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    unit: string;
    category: string;
    image_url: string | null;
}

export default function FarmerDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", stock: "", unit: "kg", category: "fresh" });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [listings, setListings] = useState<Product[]>([]);
    const [loadingListings, setLoadingListings] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [profileName, setProfileName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!loading && !user) router.push("/login");
        if (user) setProfileName(user.displayName || user.email?.split("@")[0] || "");
    }, [user, loading, router]);

    // Fetch listings from DB
    useEffect(() => {
        const fetchListings = async () => {
            if (!user) return;
            setLoadingListings(true);
            try {
                const { data, error } = await supabase
                    .from("products")
                    .select("*")
                    .eq("seller_id", user.uid)
                    .order("created_at", { ascending: false });
                if (error) throw error;
                setListings(data || []);
            } catch (err) {
                console.error("Error fetching listings:", err);
            } finally {
                setLoadingListings(false);
            }
        };
        if (user) fetchListings();
    }, [user]);

    // Fetch orders
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from("orders")
                    .select("*")
                    .eq("seller_id", user.uid)
                    .order("created_at", { ascending: false });
                if (error) throw error;
                setOrders(data || []);
            } catch (error) {
                console.error("Error fetching farmer orders:", error);
            } finally {
                setLoadingOrders(false);
            }
        };
        if (user) fetchOrders();
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/");
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleMarkShipped = async (orderId: string) => {
        const { error } = await supabase.from("orders").update({ status: "shipped" }).eq("id", orderId);
        if (!error) setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "shipped" } : o));
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);
        try {
            const { error } = await supabase.from('users').update({ full_name: profileName }).eq('id', user.uid);
            if (error) throw error;
            alert("Profile updated successfully!");
        } catch (err) {
            console.error("Error updating profile:", err);
            alert("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);

        try {
            let imageUrl: string | null = null;

            // Upload image if one was selected
            if (imageFile) {
                const fileExt = imageFile.name.split(".").pop();
                const fileName = `${user.uid}-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from("product-images")
                    .upload(fileName, imageFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from("product-images")
                    .getPublicUrl(fileName);
                imageUrl = urlData.publicUrl;
            }

            // Insert product into DB
            const { data: inserted, error: insertError } = await supabase
                .from("products")
                .insert({
                    seller_id: user.uid,
                    name: newProduct.name,
                    description: newProduct.description,
                    price: Number(newProduct.price),
                    stock: Number(newProduct.stock),
                    unit: newProduct.unit,
                    category: newProduct.category,
                    image_url: imageUrl,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            setListings(prev => [inserted, ...prev]);
            setNewProduct({ name: "", description: "", price: "", stock: "", unit: "kg", category: "fresh" });
            setImageFile(null);
            setImagePreview(null);
            setShowAddForm(false);
        } catch (err) {
            console.error("Error adding product:", err);
            alert("Failed to add product. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        </div>
    );

    const displayName = user?.displayName || user?.email?.split("@")[0] || "Farmer";
    const initials = displayName.charAt(0).toUpperCase();
    const clearedBalance = orders.filter(o => o.status === "delivered").reduce((sum, o) => sum + Number(o.amount), 0);
    const escrowHold = orders.filter(o => o.status !== "delivered" && o.escrow_held).reduce((sum, o) => sum + Number(o.amount), 0);
    const escrowCount = orders.filter(o => o.status !== "delivered" && o.escrow_held).length;

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-100 flex-col hidden md:flex">
                <div className="p-6 border-b border-gray-100">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-green-600 text-white p-1.5 rounded-lg"><Leaf size={18} /></div>
                        <span className="font-bold text-green-700 text-lg">Farmer Hub</span>
                    </Link>
                </div>
                <div className="flex-1 py-6 px-4 flex flex-col gap-1">
                    <button onClick={() => setActiveTab("overview")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === "overview" ? "bg-green-50 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                        <Home size={20} /> Dashboard
                    </button>
                    <button onClick={() => setActiveTab("listings")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === "listings" ? "bg-green-50 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                        <FileText size={20} /> My Listings
                    </button>
                    <button onClick={() => setActiveTab("orders")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === "orders" ? "bg-green-50 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                        <Package size={20} /> Orders & Escrow
                    </button>
                    <button onClick={() => setActiveTab("profile")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === "profile" ? "bg-green-50 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                        <User size={20} /> Profile
                    </button>
                    <div className="mt-auto">
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 w-full transition-colors">
                            <LogOut size={20} /> Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                    <h1 className="text-xl font-bold text-gray-900 capitalize">{activeTab === "overview" ? "Dashboard" : activeTab}</h1>
                    <div className="flex items-center gap-4">
                        <button className="text-gray-500 hover:text-green-600 relative">
                            <Bell size={20} />
                            {orders.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold">!</span>}
                        </button>
                        <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
                            <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center">{initials}</div>
                            <div className="hidden md:block">
                                <p className="font-semibold text-sm text-gray-900 leading-tight">{displayName}</p>
                                <p className="text-xs text-green-600 font-medium">Verified Farmer</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-8 space-y-8">
                    {/* Overview Tab */}
                    {(activeTab === "overview" || activeTab === "listings") && (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-green-50 p-3 rounded-xl text-green-600"><Banknote size={22} /></div>
                                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1"><CheckCircle2 size={12} /> Cleared</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-1">Available Balance</p>
                                    <h3 className="text-3xl font-black text-gray-900">₹{clearedBalance.toLocaleString()}</h3>
                                    <p className="text-xs text-green-600 mt-2 font-medium">Ready for withdrawal</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-orange-50 p-3 rounded-xl text-orange-600"><ShieldAlert size={22} /></div>
                                        <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-md">Escrow Hold</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-1">Pending Disbursement</p>
                                    <h3 className="text-3xl font-black text-gray-900">₹{escrowHold.toLocaleString()}</h3>
                                    <p className="text-xs text-orange-600 mt-2 font-medium">{escrowCount} orders awaiting confirmation</p>
                                </div>
                                <button
                                    onClick={() => { setActiveTab("listings"); setShowAddForm(true); }}
                                    className="bg-white p-6 rounded-2xl shadow-sm border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center cursor-pointer group hover:border-green-500 transition-colors"
                                >
                                    <div className="bg-gray-100 group-hover:bg-green-50 p-4 rounded-full text-gray-400 group-hover:text-green-600 transition-colors mb-3"><Plus size={28} /></div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-green-700">Add New Listing</h3>
                                    <p className="text-xs text-gray-500 mt-1">Sell fresh produce or seeds</p>
                                </button>
                            </div>

                            {/* Add Product Form */}
                            {showAddForm && (
                                <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-lg font-bold text-gray-900">New Product Listing</h2>
                                        <button onClick={() => { setShowAddForm(false); setImagePreview(null); setImageFile(null); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                                    </div>
                                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Image Upload */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full h-36 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors overflow-hidden relative"
                                            >
                                                {imagePreview ? (
                                                    <Image src={imagePreview} alt="Preview" fill className="object-cover rounded-xl" />
                                                ) : (
                                                    <>
                                                        <ImageIcon size={32} className="text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-500">Click to upload image</p>
                                                    </>
                                                )}
                                            </div>
                                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                            <input required type="text" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                                placeholder="e.g. Organic Basmati Rice" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <textarea value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none h-20"
                                                placeholder="Freshly harvested, Grade A quality..." />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                            <input required type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 text-sm" placeholder="450" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                                            <input required type="number" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 text-sm" placeholder="100" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                            <select value={newProduct.unit} onChange={e => setNewProduct(p => ({ ...p, unit: e.target.value }))}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white">
                                                <option value="kg">kg</option>
                                                <option value="bag">bag</option>
                                                <option value="pkt">packet</option>
                                                <option value="piece">piece</option>
                                                <option value="litre">litre</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                            <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white">
                                                <option value="fresh">Fresh Produce</option>
                                                <option value="seeds">Seeds &amp; Fertilizers</option>
                                                <option value="tools">Farming Tools</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 flex gap-3 pt-2">
                                            <button type="submit" disabled={submitting} className="bg-green-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-700 transition-colors shadow-md flex items-center gap-2 disabled:opacity-70">
                                                {submitting ? <><Loader2 size={16} className="animate-spin" /> Publishing...</> : "Publish Listing"}
                                            </button>
                                            <button type="button" onClick={() => { setShowAddForm(false); setImagePreview(null); setImageFile(null); }} className="bg-gray-100 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors">
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Orders + Listings Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Recent Orders */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                        <h2 className="font-bold text-gray-900">Recent Orders</h2>
                                        <span className="text-sm text-gray-500">{orders.length} total</span>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {loadingOrders && <div className="p-8 text-center text-gray-400">Loading orders...</div>}
                                        {!loadingOrders && orders.length === 0 && <div className="p-8 text-center text-gray-500">No orders received yet.</div>}
                                        {orders.map(order => (
                                            <div key={order.id} className="p-5 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="text-xs text-gray-400 font-mono">{(order.id || "").substring(0, 8).toUpperCase()} • {new Date(order.created_at).toLocaleDateString()}</span>
                                                        <h4 className="font-bold text-gray-900 text-sm mt-0.5">{order.product_name} <span className="text-gray-400 font-normal">x{order.quantity}</span></h4>
                                                    </div>
                                                    <p className="font-bold text-gray-900">₹{Number(order.amount).toLocaleString()}</p>
                                                </div>
                                                <div className="flex justify-between items-center mt-3">
                                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${order.status === "pending" ? "bg-yellow-100 text-yellow-800" : order.status === "shipped" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                                                        {order.status}
                                                    </span>
                                                    {order.status === "pending" && (
                                                        <button onClick={() => handleMarkShipped(order.id)} className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                                                            <Truck size={12} /> Mark Shipped
                                                        </button>
                                                    )}
                                                    {order.status === "delivered" && (
                                                        <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                                            <CheckCircle2 size={12} /> Payment Released
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Active Listings */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                        <h2 className="font-bold text-gray-900">My Listings</h2>
                                        <button onClick={() => setShowAddForm(true)} className="text-sm text-green-600 font-medium hover:underline flex items-center gap-1">
                                            <Plus size={14} /> Add
                                        </button>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {loadingListings && <div className="p-8 text-center text-gray-400">Loading listings...</div>}
                                        {!loadingListings && listings.length === 0 && (
                                            <div className="p-8 text-center text-gray-500">
                                                <Leaf size={32} className="mx-auto mb-3 text-gray-300" />
                                                <p>No products yet.</p>
                                                <button onClick={() => setShowAddForm(true)} className="mt-3 text-green-600 font-medium text-sm hover:underline">Add your first listing →</button>
                                            </div>
                                        )}
                                        {listings.map(product => (
                                            <div key={product.id} className="p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-green-100 overflow-hidden relative">
                                                    {product.image_url ? (
                                                        <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                                                    ) : (
                                                        <Leaf size={20} className="text-green-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-900 text-sm">{product.name}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-sm font-medium text-gray-700">₹{product.price}/{product.unit}</span>
                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${product.stock > 20 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                            {product.stock} in stock
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Orders Tab */}
                    {activeTab === "orders" && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="font-bold text-gray-900">All Orders</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {loadingOrders && <div className="p-8 text-center text-gray-400">Loading orders...</div>}
                                {!loadingOrders && orders.length === 0 && <div className="p-8 text-center text-gray-500">No orders yet.</div>}
                                {orders.map(order => (
                                    <div key={order.id} className="p-5 hover:bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-xs text-gray-400 font-mono">{(order.id || "").substring(0, 8).toUpperCase()} • {new Date(order.created_at).toLocaleDateString()}</span>
                                                <h4 className="font-bold text-gray-900 text-sm mt-0.5">{order.product_name} <span className="text-gray-400 font-normal">x{order.quantity}</span></h4>
                                            </div>
                                            <p className="font-bold text-gray-900">₹{Number(order.amount).toLocaleString()}</p>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${order.status === "pending" ? "bg-yellow-100 text-yellow-800" : order.status === "shipped" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                                                {order.status}
                                            </span>
                                            {order.status === "pending" && (
                                                <button onClick={() => handleMarkShipped(order.id)} className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                                                    <Truck size={12} /> Mark Shipped
                                                </button>
                                            )}
                                            {order.status !== "delivered" && order.escrow_held && (
                                                <span className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                                                    <ShieldAlert size={12} /> In Escrow
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "profile" && (
                        <div className="max-w-2xl">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Farmer Profile Settings</h2>

                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Full Name</label>
                                        <input
                                            type="text"
                                            value={profileName}
                                            onChange={(e) => setProfileName(e.target.value)}
                                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-bold text-gray-900 transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3">
                                        <ShieldCheck size={20} className="text-green-600" />
                                        <span className="text-sm font-bold text-green-700">Verified Seller Account</span>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        {isSaving ? "Saving..." : "Save Profile"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
