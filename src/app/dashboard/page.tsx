"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ShieldCheck, ShieldAlert, CheckCircle2, Package, LogOut, Home, User, Bell, Settings, Save, Loader2, ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { supabase } from "@/lib/supabase";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: "Payment in Escrow", color: "bg-orange-100 text-orange-800", icon: <ShieldAlert size={14} /> },
    in_escrow: { label: "Payment in Escrow", color: "bg-orange-100 text-orange-800", icon: <ShieldAlert size={14} /> },
    shipped: { label: "Shipped", color: "bg-blue-100 text-blue-800", icon: <Package size={14} /> },
    delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: <CheckCircle2 size={14} /> },
};

export default function ConsumerDashboard() {
    const { user, userRole, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [profileName, setProfileName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!loading && !user) router.push("/login");
        if (user) setProfileName(user.displayName || user.email?.split("@")[0] || "");
    }, [user, loading, router]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('buyer_id', user.uid)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setOrders(data || []);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoadingOrders(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/");
    };

    const handleMarkDelivered = async (orderId: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: 'delivered', escrow_held: false })
            .eq('id', orderId);
        if (!error) setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'delivered', escrow_held: false } : o));
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);
        try {
            // Update Supabase users table
            const { error } = await supabase
                .from('users')
                .update({ full_name: profileName })
                .eq('id', user.uid);

            if (error) throw error;
            alert("Profile updated successfully!");
        } catch (err) {
            console.error("Error updating profile:", err);
            alert("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        </div>
    );

    const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
    const initials = displayName.charAt(0).toUpperCase();

    const totalOrders = orders.length;
    const escrowAmount = orders.filter(o => o.status !== 'delivered' && o.escrow_held).reduce((sum, o) => sum + Number(o.amount), 0);
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.amount), 0);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-100 flex-col hidden md:flex">
                <div className="p-6 border-b border-gray-100">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-green-600 text-white p-1.5 rounded-lg">
                            <ShoppingBag size={18} />
                        </div>
                        <span className="font-bold text-green-700 text-lg tracking-tight">Farm-Ease</span>
                    </Link>
                </div>

                <div className="flex-1 py-6 px-4 flex flex-col gap-1">
                    {[
                        { id: "overview", label: "Overview", icon: Home },
                        { id: "orders", label: "My Orders", icon: Package },
                        { id: "profile", label: "Profile", icon: User },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === tab.id ? "bg-green-600 text-white font-bold shadow-md shadow-green-100" : "text-gray-500 hover:bg-gray-50 hover:text-green-600"}`}
                        >
                            <tab.icon size={20} /> {tab.label}
                        </button>
                    ))}

                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <Link href="/market" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-green-600 transition-colors">
                            <ShoppingBag size={20} /> Market
                        </Link>
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 w-full transition-colors mt-1 font-medium">
                            <LogOut size={20} /> Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md bg-white/80">
                    <div>
                        <h1 className="text-xl font-black text-gray-900 capitalize">{activeTab}</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{activeTab === 'overview' ? 'Welcome back' : activeTab === 'orders' ? 'Manage purchases' : 'Your identity'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-gray-400 hover:text-green-600 relative p-2 rounded-full hover:bg-gray-50 transition-colors">
                            <Bell size={20} />
                            {orders.length > 0 && <span className="absolute top-1.5 right-1.5 bg-red-500 w-2 h-2 rounded-full ring-2 ring-white"></span>}
                        </button>
                        <div className="flex items-center gap-3 border-l border-gray-100 pl-6 ml-2">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white font-black flex items-center justify-center shadow-sm">{initials}</div>
                            <div className="hidden lg:block">
                                <p className="font-bold text-sm text-gray-900 leading-tight">{displayName}</p>
                                <p className="text-[10px] text-green-600 uppercase font-black tracking-tighter">{userRole || "Consumer"}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-8 max-w-6xl">
                    {activeTab === "overview" && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Items Bought</p>
                                    <h3 className="text-4xl font-black text-gray-900">{totalOrders}</h3>
                                    <div className="h-1 w-12 bg-green-500 mt-4 rounded-full"></div>
                                </div>
                                <div className="bg-white rounded-3xl border border-orange-100 shadow-sm p-8 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">In Escrow</p>
                                    </div>
                                    <h3 className="text-4xl font-black text-gray-900">₹{escrowAmount.toLocaleString()}</h3>
                                    <p className="text-xs text-orange-600 mt-2 font-bold uppercase tracking-tighter">Securely Held</p>
                                </div>
                                <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-8 hover:shadow-md transition-shadow">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Impact</p>
                                    <h3 className="text-4xl font-black text-gray-900">₹{totalSpent.toLocaleString()}</h3>
                                    <p className="text-xs text-blue-600 mt-2 font-bold uppercase tracking-tighter">Transacted Safely</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white shadow-xl">
                                <div>
                                    <h3 className="text-3xl font-black mb-2">Support Your Local Farmers</h3>
                                    <p className="text-gray-400 max-w-md font-medium">Every purchase goes through our patented escrow system, ensuring you get exactly what you paid for.</p>
                                </div>
                                <Link href="/market" className="bg-white text-gray-900 font-black px-10 py-4 rounded-2xl shadow-lg hover:bg-green-50 transition-all flex items-center gap-2 whitespace-nowrap active:scale-95">
                                    Shop Now <ShoppingCart size={20} />
                                </Link>
                            </div>
                        </div>
                    )}

                    {activeTab === "orders" && (
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                                <h2 className="font-black text-gray-900 text-xl tracking-tight">Recent Transactions</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {loadingOrders && (
                                    <div className="p-20 text-center flex flex-col items-center">
                                        <Loader2 className="animate-spin text-green-600 mb-4" size={32} />
                                        <p className="text-gray-400 font-bold uppercase text-xs">Loading orders...</p>
                                    </div>
                                )}
                                {!loadingOrders && orders.length === 0 && (
                                    <div className="p-20 text-center">
                                        <Package size={48} className="text-gray-200 mx-auto mb-4" />
                                        <p className="text-gray-500 font-bold">No orders found yet.</p>
                                        <Link href="/market" className="text-green-600 text-sm mt-2 font-black uppercase hover:underline">Start Shopping</Link>
                                    </div>
                                )}

                                {orders.map(order => {
                                    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['pending'];
                                    const orderDate = new Date(order.created_at).toLocaleDateString();
                                    return (
                                        <div key={order.id} className="p-8 hover:bg-gray-50/50 transition-colors group">
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">ID: {(order.id || "").substring(0, 8)}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{orderDate}</span>
                                                    </div>
                                                    <h4 className="font-black text-gray-900 text-lg group-hover:text-green-700 transition-colors">{order.product_name} <span className="font-bold text-gray-400 ml-1">×{order.quantity}</span></h4>
                                                    <p className="text-xs text-gray-400 font-bold uppercase mt-1">Vendor: {order.seller_id}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-gray-900 text-2xl tracking-tighter">₹{Number(order.amount).toLocaleString()}</p>
                                                    <div className="mt-2 text-right">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${status.color}`}>
                                                            {status.icon} {status.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {order.status === "shipped" && (
                                                <div className="mt-6 pt-6 border-t border-dashed border-gray-100">
                                                    <button
                                                        onClick={() => handleMarkDelivered(order.id)}
                                                        className="w-full sm:w-auto bg-green-600 text-white font-black px-8 py-3 rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircle2 size={18} /> Confirm Receipt & Release Funds
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === "profile" && (
                        <div className="max-w-2xl">
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10">
                                <h2 className="text-2xl font-black text-gray-900 mb-8">Account Settings</h2>

                                <form onSubmit={handleUpdateProfile} className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="w-20 h-20 rounded-3xl bg-green-100 text-green-700 font-black text-3xl flex items-center justify-center shadow-inner">
                                                {initials}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 mb-1">{displayName}</p>
                                                <p className="text-xs font-bold text-gray-400 uppercase">{user?.email}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <User size={14} className="text-green-600" /> Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileName}
                                                onChange={(e) => setProfileName(e.target.value)}
                                                placeholder="Enter your full name"
                                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none font-bold text-gray-900 transition-all"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Settings size={14} className="text-blue-600" /> Account Identity
                                            </label>
                                            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-blue-700 text-sm font-bold flex items-center justify-between">
                                                Role: <span className="uppercase tracking-tighter">{userRole || "Consumer"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:bg-gray-400 active:scale-[0.98]"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </button>
                                </form>

                                <div className="mt-12 p-6 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-red-700 font-bold text-sm">Sign Out Everywhere</p>
                                        <p className="text-red-400 text-xs">Clear your session on all devices.</p>
                                    </div>
                                    <button onClick={handleLogout} className="bg-white text-red-600 px-4 py-2 font-black text-xs rounded-xl shadow-sm border border-red-100 hover:bg-red-50 transition-colors uppercase">
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
