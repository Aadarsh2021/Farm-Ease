import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Plus, Banknote, CheckCircle2, Bell, Leaf, LogOut, Home, X, ImageIcon, Loader2, Truck, User, ShieldCheck, Save, Sparkles, Activity, Layers, ArrowUpRight, Box } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    unit: string;
    category: string;
    image_url: string | null;
}

interface Order {
    id: string;
    product_name: string;
    quantity: number;
    amount: number;
    status: string;
    created_at: string;
    payment_secured?: boolean;
    buyer_email?: string;
}

export default function SellerDashboard() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", stock: "", unit: "unit", category: "tools" });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [listings, setListings] = useState<Product[]>([]);
    const [loadingListings, setLoadingListings] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [profileName, setProfileName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!loading && !user) navigate("/login");
        if (user) setProfileName(user.displayName || user.email?.split("@")[0] || "");
    }, [user, loading, navigate]);

    const fetchListings = useCallback(async () => {
        if (!user) return;
        setLoadingListings(true);
        try {
            const { data, error } = await supabase.from("products").select("*").eq("seller_id", user.uid).order("created_at", { ascending: false });
            if (error) throw error;
            setListings(data || []);
        } catch (err) {
            console.error("Error fetching listings:", err);
        } finally {
            setLoadingListings(false);
        }
    }, [user]);

    const fetchOrders = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase.from("orders").select("*").eq("seller_id", user.uid).order("created_at", { ascending: false });
            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error("Error fetching vendor orders:", error);
        } finally {
            setLoadingOrders(false);
        }
    }, [user]);

    // Listings Real-time
    useEffect(() => {
        if (user) {
            fetchListings();
            const channel = supabase
                .channel('public:seller_products')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'products',
                    filter: `seller_id=eq.${user.uid}` 
                }, () => fetchListings())
                .subscribe();
            return () => { supabase.removeChannel(channel); };
        }
    }, [user, fetchListings]);

    // Orders Real-time
    useEffect(() => {
        if (user) {
            fetchOrders();
            const channel = supabase
                .channel('public:seller_orders')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'orders',
                    filter: `seller_id=eq.${user.uid}` 
                }, () => fetchOrders())
                .subscribe();
            return () => { supabase.removeChannel(channel); };
        }
    }, [user, fetchOrders]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
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
            if (imageFile) {
                const fileExt = imageFile.name.split(".").pop();
                const fileName = `${user.uid}-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, imageFile, { upsert: true });
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
                imageUrl = urlData.publicUrl;
            }
            const { data: inserted, error: insertError } = await supabase
                .from("products")
                .insert({ seller_id: user.uid, name: newProduct.name, description: newProduct.description, price: Number(newProduct.price), stock: Number(newProduct.stock), unit: newProduct.unit, category: newProduct.category, image_url: imageUrl })
                .select().single();
            if (insertError) throw insertError;
            setListings(prev => [inserted, ...prev]);
            setNewProduct({ name: "", description: "", price: "", stock: "", unit: "unit", category: "tools" });
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
            <div className="w-16 h-16 border-4 border-white/5 border-t-emerald-500 rounded-full animate-spin mb-8"></div>
            <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-[10px]">Accessing Vendor Terminal...</p>
        </div>
    );

    const displayName = user?.displayName || user?.email?.split("@")[0] || "Seller";
    const initials = displayName.charAt(0).toUpperCase();
    const clearedBalance = orders.filter(o => o.status === "delivered").reduce((sum, o) => sum + Number(o.amount), 0);
    const securedAmount = orders.filter(o => o.status !== "delivered" && o.payment_secured).reduce((sum, o) => sum + Number(o.amount), 0);
    const activeSecuredCount = orders.filter(o => o.status !== "delivered" && o.payment_secured).length;

    return (
        <div className="flex h-screen bg-slate-950 pt-20 overflow-hidden relative">
            {/* Background Aesthetics */}
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-600/5 rounded-full blur-[180px] -mr-96 -mt-96 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] -ml-64 -mb-64 pointer-events-none"></div>

            {/* Sidebar */}
            <motion.div 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-80 bg-slate-900/50 backdrop-blur-3xl border-r border-white/5 flex-col hidden lg:flex shadow-2xl p-8 text-white relative z-30"
            >
                <div className="flex-1 space-y-3">
                    <div className="px-5 mb-10">
                        <div className="w-12 h-1 bg-emerald-500 rounded-full mb-4 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Vendor Hub Unit</p>
                    </div>

                    {[
                        { id: "overview", label: "Overview", icon: Home, desc: "Dashboard Summary" },
                        { id: "listings", label: "My Products", icon: Box, desc: "Manage Inventory" },
                        { id: "orders", label: "Sales & Orders", icon: Layers, desc: "Track Shipment" },
                        { id: "profile", label: "Seller Profile", icon: User, desc: "Account Settings" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full group flex items-start gap-5 p-5 rounded-[2.5rem] text-left transition-all duration-500 border border-transparent ${activeTab === tab.id ? "bg-emerald-600 text-slate-950 shadow-[0_20px_40px_rgba(16,185,129,0.2)] scale-[1.02] border-emerald-400/20" : "text-slate-500 hover:bg-white/5 hover:text-white hover:border-white/5"}`}
                        >
                            <div className={`p-3.5 rounded-2xl transition-all duration-500 ${activeTab === tab.id ? "bg-slate-950/10 rotate-12" : "bg-white/5 group-hover:rotate-12 group-hover:bg-white/10"}`}>
                                <tab.icon size={22} strokeWidth={activeTab === tab.id ? 4 : 2} />
                            </div>
                            <div>
                                <p className="font-black tracking-tight italic uppercase leading-none mb-1.5">{tab.label}</p>
                                <p className={`text-[9px] font-black uppercase tracking-widest leading-none ${activeTab === tab.id ? "text-slate-950/50" : "text-slate-600"}`}>{tab.desc}</p>
                            </div>
                        </button>
                    ))}

                    <div className="pt-10 mt-10 border-t border-white/10 space-y-3">
                        <Link to="/" className="flex items-center gap-5 p-5 rounded-[2rem] text-slate-500 hover:bg-white/5 hover:text-emerald-400 transition-all font-black text-[10px] uppercase tracking-[0.3em] italic group">
                            <Home size={20} strokeWidth={3} className="group-hover:-translate-y-0.5 transition-transform" /> Return to Home
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-5 p-5 rounded-[2rem] text-red-500/40 hover:bg-red-500/10 hover:text-red-500 transition-all font-black text-[10px] uppercase tracking-[0.3em] italic group">
                            <LogOut size={20} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" /> Logout
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-slate-950 custom-scrollbar relative z-10">
                <header className="bg-slate-950/80 backdrop-blur-2xl px-12 py-10 flex justify-between items-center sticky top-0 z-40 border-b border-white/5">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                        <h1 className="text-4xl lg:text-5xl font-black text-white capitalize tracking-tighter italic leading-none">{activeTab}</h1>
                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.5em] mt-3 italic flex items-center gap-3">
                           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span> Central Logic Hub
                        </p>
                    </motion.div>
                    
                    <div className="flex items-center gap-10">
                        <button className="text-slate-500 hover:text-white relative p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-300 group">
                            <Bell size={24} className="group-hover:rotate-12 transition-transform" />
                            {orders.length > 0 && <span className="absolute top-3 right-3 bg-emerald-500 w-3 h-3 rounded-full ring-4 ring-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse"></span>}
                        </button>
                        
                        <div className="flex items-center gap-6 bg-white/5 p-2.5 pr-8 rounded-[2.5rem] border border-white/5 shadow-2xl group cursor-pointer hover:bg-white/10 transition-all duration-500">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-2xl italic border-4 border-slate-950 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">{initials}</div>
                            <div className="hidden xl:block">
                                <p className="font-black text-white text-sm leading-tight uppercase italic">{displayName}</p>
                                <p className="text-[9px] text-emerald-500/60 uppercase font-black tracking-[0.2em] flex items-center gap-2 mt-1.5 italic">
                                    <Activity size={10} className="animate-pulse" /> Verified Master
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-12 max-w-[1600px] mx-auto pb-32">
                    <AnimatePresence mode="wait">
                        {(activeTab === "overview" || activeTab === "listings") && (
                            <motion.div 
                                key="overview-listings"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-16"
                            >
                                {/* Stats Matrix */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    <div className="bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] shadow-2xl p-12 group hover:-translate-y-2 transition-all duration-500 border border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="bg-slate-950 p-6 rounded-[2rem] text-emerald-500 shadow-2xl group-hover:bg-emerald-600 group-hover:text-slate-950 transition-all duration-500 border border-white/5">
                                                <Banknote size={36} />
                                            </div>
                                            <span className="bg-slate-950 text-emerald-500 text-[10px] font-black px-5 py-2.5 rounded-2xl uppercase tracking-widest shadow-xl italic border border-white/10">Liquid Capital</span>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 block italic">Available for Withdrawal</p>
                                        <h3 className="text-7xl font-black text-white tracking-tighter italic mb-4">₹{clearedBalance.toLocaleString()}</h3>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3 italic bg-emerald-500/10 w-fit px-5 py-2 rounded-xl border border-emerald-500/20">
                                            <CheckCircle2 size={16} /> Settlement Ready
                                        </p>
                                    </div>

                                    <div className="bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] shadow-2xl p-12 group hover:-translate-y-2 transition-all duration-500 border border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]"></div>
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="bg-slate-950 p-6 rounded-[2rem] text-blue-500 shadow-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 border border-white/5">
                                                <ShieldCheck size={36} />
                                            </div>
                                            <span className="bg-emerald-600 text-slate-950 text-[10px] font-black px-5 py-2.5 rounded-2xl uppercase tracking-widest shadow-xl italic">Farm-Ease Secure</span>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 block italic">Pending Settlements</p>
                                        <h3 className="text-7xl font-black text-white tracking-tighter italic mb-4">₹{securedAmount.toLocaleString()}</h3>
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic bg-blue-500/10 w-fit px-5 py-2 rounded-xl border border-blue-500/20">
                                            {activeSecuredCount} Active Transactions
                                        </p>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => { setActiveTab("listings"); setShowAddForm(true); }}
                                        className="bg-emerald-600 rounded-[4rem] p-12 text-slate-950 shadow-2xl flex flex-col items-center justify-center text-center group relative overflow-hidden border-4 border-emerald-500/20"
                                    >
                                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                        <div className="bg-slate-950 text-emerald-500 p-8 rounded-[2.5rem] transition-all duration-500 mb-8 border border-white/10 shadow-2xl group-hover:rotate-6 group-hover:scale-110">
                                            <Plus size={56} strokeWidth={4} className="group-hover:rotate-90 transition-transform duration-700" />
                                        </div>
                                        <h3 className="font-black text-3xl tracking-tighter italic uppercase leading-none">Add Product</h3>
                                        <p className="text-[10px] font-black text-slate-950/40 uppercase tracking-[0.4em] mt-3 italic">List New Inventory</p>
                                    </motion.button>
                                </div>

                                <AnimatePresence>
                                    {showAddForm && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                            className="bg-slate-900/80 backdrop-blur-3xl rounded-[5rem] shadow-2xl border border-white/5 p-20 relative overflow-hidden group/form"
                                        >
                                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full -mr-64 -mt-64 blur-[120px]"></div>
                                            <div className="flex justify-between items-center mb-20 relative z-10">
                                                <div>
                                                    <h2 className="text-6xl font-black text-white tracking-tighter italic uppercase">Inject <span className="text-emerald-500">Asset.</span></h2>
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em] mt-3 italic">Product Listing Interface v3.0</p>
                                                </div>
                                                <button onClick={() => { setShowAddForm(false); setImagePreview(null); setImageFile(null); }} className="text-slate-500 hover:text-red-500 bg-white/5 p-6 rounded-[2rem] transition-all duration-500 hover:rotate-90 border border-white/5"><X size={40} strokeWidth={3} /></button>
                                            </div>
                                            
                                            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                                                <div className="md:col-span-2 space-y-6">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] ml-4 italic">Visual Verification Hub</label>
                                                    <div onClick={() => fileInputRef.current?.click()} className="w-full h-96 border-4 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-white/5 transition-all duration-700 overflow-hidden relative group/upload">
                                                        {imagePreview ? (
                                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-[4rem] opacity-80" />
                                                        ) : (
                                                            <div className="text-center">
                                                                <div className="bg-slate-950 p-10 rounded-[2.5rem] mb-8 group-hover/upload:scale-110 group-hover/upload:bg-emerald-600 group-hover/upload:text-slate-950 transition-all duration-700 mx-auto w-fit shadow-2xl border border-white/5">
                                                                    <ImageIcon size={64} className="text-slate-700 group-hover/upload:text-inherit transition-colors" />
                                                                </div>
                                                                <p className="font-black text-slate-500 uppercase tracking-[0.4em] text-xs italic">Upload Asset Img</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                                </div>

                                                <div className="md:col-span-2 space-y-6">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] ml-4 italic">Asset Designation</label>
                                                    <input required type="text" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                                                        className="w-full border-none bg-slate-950 rounded-[2.5rem] px-12 py-9 outline-none focus:ring-[12px] focus:ring-emerald-500/5 transition-all font-black text-4xl text-white shadow-2xl placeholder:text-slate-800 h-24 italic"
                                                        placeholder="Precision Hybrid Seeding..." />
                                                </div>

                                                <div className="md:col-span-2 space-y-6">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] ml-4 italic">Technical Compendium</label>
                                                    <textarea value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                                                        className="w-full border-none bg-slate-950 rounded-[3rem] px-12 py-10 outline-none focus:ring-[12px] focus:ring-emerald-500/5 transition-all font-bold text-2xl text-white shadow-2xl resize-none h-56 placeholder:text-slate-800 italic"
                                                        placeholder="Detailed performance spec, certifications..." />
                                                </div>

                                                <div className="space-y-6">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] ml-4 italic">Valuation (₹)</label>
                                                    <input required type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
                                                        className="w-full border-none bg-slate-950 rounded-[2.5rem] px-12 py-9 outline-none focus:ring-[12px] focus:ring-emerald-500/5 transition-all font-black text-4xl text-white shadow-2xl h-24 italic" />
                                                </div>

                                                <div className="space-y-6">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] ml-4 italic">Inventory Magnitude</label>
                                                    <input required type="number" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))}
                                                        className="w-full border-none bg-slate-950 rounded-[2.5rem] px-12 py-9 outline-none focus:ring-[12px] focus:ring-emerald-500/5 transition-all font-black text-4xl text-white shadow-2xl h-24 italic" />
                                                </div>

                                                <div className="md:col-span-2 flex gap-10 pt-12">
                                                    <button type="submit" disabled={submitting} className="flex-1 bg-emerald-600 text-slate-950 font-black px-16 py-10 rounded-[3rem] hover:bg-white transition-all shadow-2xl flex items-center justify-center gap-6 disabled:opacity-70 active:scale-95 text-3xl uppercase tracking-tighter italic group/btn border border-emerald-400/20">
                                                        {submitting ? <><Loader2 size={40} className="animate-spin" /> Indexing...</> : <><Sparkles size={40} className="group-hover/btn:rotate-12 transition-transform" /> List Asset</>}
                                                    </button>
                                                    <button type="button" onClick={() => { setShowAddForm(false); setImagePreview(null); setImageFile(null); }} className="px-16 py-10 bg-white/5 text-slate-500 font-black rounded-[3rem] hover:bg-red-500/10 hover:text-red-500 transition-all uppercase tracking-[0.4em] text-xs italic border border-white/5">
                                                        Abort
                                                    </button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Data Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                    {/* Recent Activity */}
                                    <div className="bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden relative group/ops">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-white/10"></div>
                                        <div className="p-12 border-b border-white/5 flex justify-between items-center bg-white/5">
                                            <div>
                                                <h2 className="font-black text-white text-3xl tracking-tighter italic uppercase leading-none">Trade Streams</h2>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em] mt-3 italic leading-none">Active Logistics Pulse</p>
                                            </div>
                                            <div className="bg-slate-950 px-6 py-3 rounded-2xl border border-white/5 shadow-2xl">
                                                <span className="text-[10px] font-black text-emerald-500 italic tracking-widest uppercase">{orders.length} LOGS ACTIVE</span>
                                            </div>
                                        </div>
                                        <div className="divide-y divide-white/5">
                                            {loadingOrders && (
                                                <div className="p-32 text-center flex flex-col items-center">
                                                    <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-8" />
                                                    <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-[10px] italic">Syncing Trade Ledger...</p>
                                                </div>
                                            )}
                                            {!loadingOrders && orders.length === 0 && (
                                                <div className="p-32 text-center">
                                                    <div className="bg-slate-950 w-28 h-28 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-2xl border border-white/5">
                                                        <Package size={56} className="text-slate-800" />
                                                    </div>
                                                    <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px] italic">No Active Transaction Flow</p>
                                                </div>
                                            )}
                                            {orders.slice(0, 5).map((order, idx) => (
                                                <motion.div 
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    key={order.id} 
                                                    className="p-12 hover:bg-white/5 transition-all group relative border-l-4 border-transparent hover:border-emerald-500"
                                                >
                                                    <div className="flex justify-between items-start mb-8">
                                                        <div className="space-y-4">
                                                            <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-5 py-2 rounded-2xl uppercase italic tracking-tighter shadow-2xl">XFER #{(order.id || "").substring(0, 10).toUpperCase()}</span>
                                                            <h4 className="font-black text-white text-4xl tracking-tighter italic group-hover:text-emerald-500 transition-colors uppercase leading-none">{order.product_name} <span className="text-slate-700 font-bold ml-3 italic text-3xl">× {order.quantity}</span></h4>
                                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] italic">{new Date(order.created_at).toLocaleString()}</p>
                                                        </div>
                                                        <p className="font-black text-white text-5xl tracking-tighter italic leading-none">₹{Number(order.amount).toLocaleString()}</p>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-12">
                                                        <div className="flex items-center gap-6">
                                                            <span className={`px-8 py-3 text-[10px] font-black rounded-full uppercase tracking-[0.4em] shadow-2xl flex items-center gap-3 border ${order.status === "pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : order.status === "shipped" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        {order.status === "pending" && (
                                                            <button onClick={() => handleMarkShipped(order.id)} className="flex items-center gap-6 text-[12px] font-black text-slate-950 bg-emerald-600 px-12 py-5 rounded-[2.5rem] hover:bg-white transition-all active:scale-95 shadow-2xl uppercase tracking-widest italic">
                                                                <Truck size={24} strokeWidth={4} /> Commit Logistic
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <div className="p-12 bg-white/5 text-white flex justify-center">
                                            <button onClick={() => setActiveTab("orders")} className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-500 hover:text-emerald-500 transition-colors italic">Deep Audit Transactions Vector →</button>
                                        </div>
                                    </div>

                                    {/* Asset Portfolio */}
                                    <div className="bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden relative group/asset">
                                        <div className="absolute top-0 right-0 w-full h-2 bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
                                        <div className="p-12 border-b border-white/5 flex justify-between items-center bg-slate-950 text-white relative">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent)] pointer-events-none"></div>
                                            <div>
                                                <h2 className="font-black text-3xl tracking-tighter italic uppercase leading-none">Asset Repository</h2>
                                                <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-[0.5em] mt-3 italic leading-none">Product Grid Topology</p>
                                            </div>
                                            <button onClick={() => setShowAddForm(true)} className="bg-emerald-600 hover:bg-white text-slate-950 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center gap-3 italic shadow-2xl">
                                                <Plus size={18} strokeWidth={4} /> Inject Asset
                                            </button>
                                        </div>
                                        <div className="divide-y divide-white/5">
                                            {loadingListings && (
                                                <div className="p-32 text-center flex flex-col items-center">
                                                    <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-8" />
                                                    <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-[10px] italic">Indexing Catalog Data...</p>
                                                </div>
                                            )}
                                            {!loadingListings && listings.length === 0 && (
                                                <div className="p-32 text-center">
                                                    <div className="bg-slate-950 w-28 h-28 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-2xl border border-white/5">
                                                        <Leaf size={56} className="text-slate-800" />
                                                    </div>
                                                    <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px] italic">Global Inventory Void</p>
                                                </div>
                                            )}
                                            {listings.slice(0, 5).map((product, idx) => (
                                                <motion.div 
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    key={product.id} 
                                                    className="p-12 flex items-center gap-10 hover:bg-white/5 transition-all group/item relative overflow-hidden"
                                                >
                                                    <div className="w-32 h-32 bg-slate-950 rounded-[3rem] flex items-center justify-center flex-shrink-0 border-4 border-white/5 shadow-2xl overflow-hidden relative group-hover/item:scale-105 transition-all duration-700">
                                                        {product.image_url ? (
                                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover opacity-60 group-hover/item:opacity-100 group-hover/item:scale-110 transition-all duration-1000" />
                                                        ) : (
                                                            <Box size={44} className="text-slate-800" />
                                                        )}
                                                        <div className="absolute inset-0 bg-slate-950/20 group-hover/item:bg-transparent transition-colors"></div>
                                                    </div>
                                                    <div className="flex-1 space-y-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-black text-white text-3xl tracking-tighter italic uppercase group-hover/item:text-emerald-500 transition-colors leading-none mb-3">{product.name}</h4>
                                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] italic">Category: {product.category}</p>
                                                            </div>
                                                            <span className="text-4xl font-black text-white italic tracking-tighter">₹{product.price.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                            <span className={`px-6 py-2 text-[10px] font-black rounded-xl uppercase tracking-widest shadow-xl flex items-center gap-3 border ${product.stock > 5 ? "bg-white/5 text-slate-400 border-white/5" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                                                                <Layers size={14} /> {product.stock} {product.unit}(s) available
                                                            </span>
                                                            <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest italic underline underline-offset-8 cursor-pointer hover:text-emerald-400 transition-colors">Edit Asset Spec</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <div className="p-12 bg-white/5 flex justify-center border-t border-white/5">
                                            <button onClick={() => setActiveTab("listings")} className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] hover:text-white transition-colors italic group/all flex items-center gap-4"> Access Holistic Asset Grid <ArrowUpRight size={18} className="group-hover/all:translate-x-1 group-hover/all:-translate-y-1 transition-transform" /> </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "orders" && (
                            <motion.div 
                                key="orders"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-12"
                            >
                                <div className="bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden">
                                    <div className="p-12 border-b border-white/5 bg-slate-950 flex justify-between items-center">
                                        <div>
                                            <h2 className="font-black text-white text-4xl tracking-tighter italic uppercase leading-none">Order Vector Control</h2>
                                            <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-[0.5em] mt-3 italic">Holistic Transaction Ledger</p>
                                        </div>
                                        <div className="bg-white/5 px-8 py-4 rounded-2xl border border-white/5 shadow-2xl">
                                            <span className="text-[12px] font-black text-white italic tracking-widest uppercase">REAL-TIME SYNC ACTIVE</span>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {orders.length === 0 ? (
                                            <div className="p-40 text-center">
                                                <div className="bg-slate-950 w-32 h-32 rounded-[3.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl border border-white/5">
                                                    <Box size={64} className="text-slate-800" />
                                                </div>
                                                <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[12px] italic">No Logistics Data Detected</p>
                                            </div>
                                        ) : (
                                            orders.map((order, idx) => (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    key={order.id} 
                                                    className="p-12 hover:bg-white/5 transition-all group border-l-8 border-transparent hover:border-emerald-500"
                                                >
                                                    <div className="flex flex-col lg:flex-row justify-between gap-12">
                                                        <div className="flex-1 space-y-8">
                                                            <div className="flex items-center gap-6">
                                                                <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-6 py-2.5 rounded-2xl uppercase italic tracking-tighter shadow-2xl">TXN #{(order.id || "").substring(0, 12).toUpperCase()}</span>
                                                                <span className={`px-6 py-2.5 text-[10px] font-black rounded-2xl uppercase tracking-widest shadow-xl flex items-center gap-3 border ${order.status === "pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : order.status === "shipped" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-white text-5xl tracking-tighter italic uppercase group-hover:text-emerald-500 transition-colors leading-none mb-4">{order.product_name}</h4>
                                                                <div className="flex items-center gap-10 mt-6 overflow-x-auto pb-4 no-scrollbar">
                                                                    <div className="bg-slate-950 px-8 py-4 rounded-[2rem] border border-white/5 shadow-2xl flex-shrink-0">
                                                                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1 shadow-sm italic">Quantity</p>
                                                                        <p className="text-2xl font-black text-white italic">{order.quantity} Units</p>
                                                                    </div>
                                                                    <div className="bg-slate-950 px-8 py-4 rounded-[2rem] border border-white/5 shadow-2xl flex-shrink-0">
                                                                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1 italic">Buyer Identity</p>
                                                                        <p className="text-xl font-black text-white italic truncate max-w-[200px]">{order.buyer_email}</p>
                                                                    </div>
                                                                    <div className="bg-slate-950 px-8 py-4 rounded-[2rem] border border-white/5 shadow-2xl flex-shrink-0">
                                                                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1 italic">Timestamp</p>
                                                                        <p className="text-xl font-black text-white italic">{new Date(order.created_at).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex flex-col items-end justify-between min-w-[300px]">
                                                            <div className="text-right">
                                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-2 italic">Total Receivable</p>
                                                                <p className="text-6xl font-black text-white italic tracking-tighter">₹{Number(order.amount).toLocaleString()}</p>
                                                            </div>
                                                            
                                                            <div className="space-y-4 w-full mt-10">
                                                                {order.status === "pending" ? (
                                                                    <button onClick={() => handleMarkShipped(order.id)} className="w-full flex items-center justify-center gap-4 text-[12px] font-black text-slate-950 bg-emerald-600 px-10 py-5 rounded-[2.5rem] hover:bg-white transition-all active:scale-95 shadow-2xl uppercase tracking-widest italic translate-y-2 group-hover:translate-y-0 opacity-90 group-hover:opacity-100">
                                                                        <Truck size={24} strokeWidth={4} /> Dispatch shipment
                                                                    </button>
                                                                ) : order.status === "shipped" ? (
                                                                    <div className="w-full bg-blue-500/10 text-blue-500 px-10 py-5 rounded-[2.5rem] text-[12px] font-black uppercase tracking-widest italic flex items-center justify-center gap-4 border border-blue-500/20 shadow-inner">
                                                                        <Activity size={24} className="animate-pulse" /> Asset in transit
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-4 text-emerald-500 font-black uppercase tracking-widest text-[12px] italic bg-emerald-500/10 px-8 py-5 rounded-[2.5rem] border border-emerald-500/20 shadow-inner justify-center">
                                                                        <CheckCircle2 size={24} strokeWidth={4} /> Capital Disbursed
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "profile" && (
                            <motion.div 
                                key="profile"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="max-w-4xl mx-auto"
                            >
                                <div className="bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden">
                                    <div className="h-64 bg-slate-950 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.2),transparent)]"></div>
                                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                                        <div className="absolute top-10 right-10 flex gap-4">
                                            <div className="bg-emerald-600/20 backdrop-blur-xl border border-emerald-500/30 px-6 py-2 rounded-2xl text-[10px] font-black text-emerald-500 uppercase tracking-widest italic shadow-2xl">Verified Seller Node</div>
                                        </div>
                                    </div>
                                    
                                    <div className="px-16 pb-16 relative">
                                        <div className="flex flex-col md:flex-row gap-12 items-end -mt-20 mb-12">
                                            <div className="w-44 h-44 rounded-[3.5rem] bg-emerald-600 border-[10px] border-slate-950 shadow-2xl flex items-center justify-center text-slate-950 text-6xl font-black italic relative group">
                                                {initials}
                                                <div className="absolute inset-0 rounded-[3.5rem] bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                            </div>
                                            <div className="flex-1 space-y-3 pb-4">
                                                <h2 className="text-6xl font-black text-white tracking-tighter italic uppercase underline underline-offset-[12px] decoration-emerald-500/30">{displayName}</h2>
                                                <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[12px] italic flex items-center gap-3">
                                                    <Activity size={16} className="text-emerald-500" /> Authorized Merchant Identity
                                                </p>
                                            </div>
                                            <button className="bg-white/5 hover:bg-white text-slate-500 hover:text-slate-950 px-10 py-4 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest transition-all italic border border-white/10 shadow-2xl">Configure Identity</button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16">
                                            <div className="bg-slate-950/50 p-10 rounded-[3rem] border border-white/5 shadow-2xl space-y-8 group hover:bg-slate-900 transition-colors">
                                                <div className="flex items-center gap-6 mb-4">
                                                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20 shadow-xl group-hover:rotate-6 transition-transform">
                                                        <User size={32} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-white text-2xl tracking-tighter italic uppercase leading-none">Authentication</h4>
                                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1.5 italic">Metadata Link</p>
                                                    </div>
                                                </div>
                                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-6 ml-6 italic">
                                                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div> Logic Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={profileName}
                                                            onChange={(e) => setProfileName(e.target.value)}
                                                            className="w-full p-8 bg-slate-950 border-white/5 border rounded-[2.5rem] focus:ring-8 focus:ring-emerald-500/5 focus:bg-slate-900 outline-none font-black text-2xl text-white transition-all shadow-inner italic"
                                                            required
                                                        />
                                                    </div>
                                                    <button type="submit" disabled={isSaving} className="w-full bg-emerald-600 text-slate-950 font-black py-6 rounded-[2rem] hover:bg-white transition-all shadow-2xl uppercase tracking-widest italic flex items-center justify-center gap-4 border border-emerald-400/20">
                                                        {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} Commit Changes
                                                    </button>
                                                </form>
                                            </div>

                                            <div className="bg-slate-950/50 p-10 rounded-[3rem] border border-white/5 shadow-2xl space-y-8 group hover:bg-slate-900 transition-colors">
                                                <div className="flex items-center gap-6 mb-4">
                                                    <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20 shadow-xl group-hover:rotate-6 transition-transform">
                                                        <Activity size={32} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-white text-2xl tracking-tighter italic uppercase leading-none">Metrics Overview</h4>
                                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1.5 italic">Performance Vector</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 shadow-2xl text-center">
                                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-2 italic">Products</p>
                                                        <p className="text-5xl font-black text-white italic">{listings.length}</p>
                                                    </div>
                                                    <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 shadow-2xl text-center">
                                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-2 italic">Success Rate</p>
                                                        <p className="text-5xl font-black text-emerald-500 italic">100%</p>
                                                    </div>
                                                </div>
                                                <div className="pt-6">
                                                    <div className="p-6 bg-slate-950 text-white rounded-3xl flex items-center gap-6 shadow-2xl border border-white/5 relative overflow-hidden group/badge">
                                                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mb-12 -mr-12 blur-2xl"></div>
                                                        <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-500 border border-emerald-500/20 shadow-xl">
                                                            <ShieldCheck size={32} strokeWidth={3} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-black italic tracking-tight uppercase leading-none mb-2">Trust Badge</h4>
                                                            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest italic">Node: Verified Merchant</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-24 pt-20 border-t border-white/5 flex items-center justify-between px-6">
                                            <div className="space-y-2">
                                                <p className="text-white font-black text-xs uppercase tracking-[0.6em] italic leading-none">Account Terminal</p>
                                                <p className="text-slate-600 font-bold text-[10px] uppercase tracking-tighter italic">Manage active session & access nodes</p>
                                            </div>
                                            <button onClick={handleLogout} className="bg-white/5 text-slate-500 px-12 py-5 font-black text-xs rounded-2xl hover:bg-red-500/10 hover:text-red-500 transition-all uppercase tracking-[0.4em] shadow-2xl italic active:scale-95 border border-white/5">
                                                Terminate Session
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
