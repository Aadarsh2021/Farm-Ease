import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    Package, Plus, Banknote, CheckCircle2, 
    Bell, Leaf, LogOut, Home, X, ImageIcon, Loader2, Truck, 
    User, ShieldCheck, Save, Sparkles, Activity, Layers, 
    ArrowUpRight, Clock, Box
} from "lucide-react";
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin mb-8"></div>
            <p className="text-slate-300 font-black uppercase tracking-[0.5em] text-[10px]">Accessing Vendor Terminal...</p>
        </div>
    );

    const displayName = user?.displayName || user?.email?.split("@")[0] || "Seller";
    const initials = displayName.charAt(0).toUpperCase();
    const clearedBalance = orders.filter(o => o.status === "delivered").reduce((sum, o) => sum + Number(o.amount), 0);
    const securedAmount = orders.filter(o => o.status !== "delivered" && o.payment_secured).reduce((sum, o) => sum + Number(o.amount), 0);
    const activeSecuredCount = orders.filter(o => o.status !== "delivered" && o.payment_secured).length;

    return (
        <div className="flex h-screen bg-slate-950 pt-20 overflow-hidden">
            {/* Sidebar */}
            <motion.div 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-80 bg-slate-900 border-r border-slate-800 flex-col hidden lg:flex shadow-2xl p-8 text-white relative z-30"
            >
                <div className="flex-1 space-y-3">
                    <div className="px-5 mb-8">
                        <div className="w-12 h-1 bg-emerald-500 rounded-full mb-4 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Vendor Hub Unit</p>
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
                            className={`w-full group flex items-start gap-4 p-5 rounded-[2rem] text-left transition-all duration-500 ${activeTab === tab.id ? "bg-emerald-600 text-slate-950 shadow-[0_20px_40px_rgba(16,185,129,0.2)] scale-[1.05]" : "text-slate-500 hover:bg-white/5 hover:text-white"}`}
                        >
                            <div className={`p-3 rounded-2xl transition-all duration-500 ${activeTab === tab.id ? "bg-slate-950/10 rotate-12" : "bg-white/5 group-hover:rotate-12 group-hover:bg-white/10"}`}>
                                <tab.icon size={22} strokeWidth={activeTab === tab.id ? 3 : 2} />
                            </div>
                            <div>
                                <p className="font-black tracking-tight italic uppercase">{tab.label}</p>
                                <p className={`text-[9px] font-black uppercase tracking-widest ${activeTab === tab.id ? "text-slate-950/40" : "text-slate-600"}`}>{tab.desc}</p>
                            </div>
                        </button>
                    ))}

                    <div className="pt-10 mt-10 border-t border-white/5 space-y-3">
                        <Link to="/" className="flex items-center gap-4 p-5 rounded-[2rem] text-slate-500 hover:bg-white/5 hover:text-emerald-400 transition-all font-black text-[10px] uppercase tracking-[0.3em] italic">
                            <Home size={20} strokeWidth={3} /> Return to Home
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-4 p-5 rounded-[2rem] text-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all font-black text-[10px] uppercase tracking-[0.3em] italic">
                            <LogOut size={20} strokeWidth={3} /> Logout
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar relative">
                <header className="bg-white/80 backdrop-blur-xl px-12 py-8 flex justify-between items-center sticky top-0 z-40 border-b border-slate-100/50">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                        <h1 className="text-4xl font-black text-slate-950 capitalize tracking-tighter italic leading-none">{activeTab}</h1>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2 italic">Central Control Grid</p>
                    </motion.div>
                    
                    <div className="flex items-center gap-8">
                        <button className="text-slate-300 hover:text-slate-950 relative p-4 rounded-full hover:bg-slate-100 transition-all duration-300 group">
                            <Bell size={24} className="group-hover:rotate-12 transition-transform" />
                            {orders.length > 0 && <span className="absolute top-4 right-4 bg-emerald-600 w-2.5 h-2.5 rounded-full ring-4 ring-white shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse"></span>}
                        </button>
                        
                        <div className="flex items-center gap-6 bg-slate-50 p-3 pr-8 rounded-[2rem] border border-slate-100 shadow-inner group cursor-pointer hover:bg-white transition-all duration-500">
                            <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white font-black text-2xl flex items-center justify-center shadow-xl italic border-4 border-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">{initials}</div>
                            <div className="hidden xl:block">
                                <p className="font-black text-slate-950 text-sm leading-tight uppercase italic">{displayName}</p>
                                <p className="text-[9px] text-emerald-600 uppercase font-black tracking-[0.2em] flex items-center gap-2 mt-1">
                                    <Activity size={10} className="animate-pulse" /> Asset Master Verified
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
                                    <div className="bg-white rounded-[4rem] shadow-premium p-12 group hover:-translate-y-2 transition-all duration-500 border border-white relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="bg-slate-50 p-6 rounded-[2rem] text-slate-950 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                                                <Banknote size={36} />
                                            </div>
                                            <span className="bg-slate-950 text-white text-[10px] font-black px-5 py-2.5 rounded-2xl uppercase tracking-widest shadow-xl italic">Liquid Capital</span>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 block italic">Available for Withdrawal</p>
                                        <h3 className="text-7xl font-black text-slate-950 tracking-tighter italic mb-4">₹{clearedBalance.toLocaleString()}</h3>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-3 italic bg-emerald-50 w-fit px-5 py-2 rounded-xl border border-emerald-100">
                                            <CheckCircle2 size={16} /> Ready for Settlement
                                        </p>
                                    </div>

                                    <div className="bg-white rounded-[4rem] shadow-premium p-12 group hover:-translate-y-2 transition-all duration-500 border border-white relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="bg-blue-50 p-6 rounded-[2rem] text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                                <ShieldCheck size={36} />
                                            </div>
                                            <span className="bg-emerald-600 text-white text-[10px] font-black px-5 py-2.5 rounded-2xl uppercase tracking-widest shadow-xl italic">Farm-Ease Secure</span>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 block italic">Pending Settlements</p>
                                        <h3 className="text-7xl font-black text-slate-950 tracking-tighter italic mb-4">₹{securedAmount.toLocaleString()}</h3>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic bg-emerald-50 w-fit px-5 py-2 rounded-xl border border-emerald-100">
                                            {activeSecuredCount} Active Transactions
                                        </p>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => { setActiveTab("listings"); setShowAddForm(true); }}
                                        className="bg-slate-950 rounded-[4rem] p-12 text-white shadow-2xl flex flex-col items-center justify-center text-center group relative overflow-hidden border-4 border-slate-900"
                                    >
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent)] group-hover:opacity-100 opacity-0 transition-opacity"></div>
                                        <div className="bg-white/10 group-hover:bg-blue-600 group-hover:text-white p-8 rounded-[2.5rem] transition-all duration-500 mb-8 border border-white/5 shadow-2xl">
                                            <Plus size={56} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
                                        </div>
                                        <h3 className="font-black text-3xl tracking-tighter italic uppercase">Add Product</h3>
                                        <p className="text-[10px] font-black text-white/30 group-hover:text-white/60 uppercase tracking-[0.4em] mt-3 italic">List New Inventory</p>
                                    </motion.button>
                                </div>

                                <AnimatePresence>
                                    {showAddForm && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                            className="bg-white rounded-[5rem] shadow-premium border border-slate-100 p-20 relative overflow-hidden group/form"
                                        >
                                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full -mr-64 -mt-64 blur-[120px]"></div>
                                            <div className="flex justify-between items-center mb-20 relative z-10">
                                                <div>
                                                    <h2 className="text-6xl font-black text-slate-950 tracking-tighter italic">Add <span className="text-slate-300">New Product.</span></h2>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] mt-3">Product Listing v3.0</p>
                                                </div>
                                                <button onClick={() => { setShowAddForm(false); setImagePreview(null); setImageFile(null); }} className="text-slate-300 hover:text-red-500 bg-slate-50 p-6 rounded-[2rem] transition-all duration-500 hover:rotate-90"><X size={40} strokeWidth={3} /></button>
                                            </div>
                                            
                                            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                                                <div className="md:col-span-2 space-y-6">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] ml-4 italic">Visual Verification Matrix</label>
                                                    <div onClick={() => fileInputRef.current?.click()} className="w-full h-96 border-4 border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center justify-center cursor-pointer hover:border-blue-600 hover:bg-blue-50/30 transition-all duration-700 overflow-hidden relative group/upload">
                                                        {imagePreview ? (
                                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-[4rem]" />
                                                        ) : (
                                                            <div className="text-center">
                                                                <div className="bg-slate-50 p-10 rounded-[2.5rem] mb-8 group-hover/upload:scale-110 group-hover/upload:bg-white group-hover/upload:shadow-2xl transition-all duration-700 mx-auto w-fit">
                                                                    <ImageIcon size={64} className="text-slate-200 group-hover/upload:text-blue-600 transition-colors" />
                                                                </div>
                                                                <p className="font-black text-slate-400 uppercase tracking-[0.4em] text-xs">Upload Product Image</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                                </div>

                                                <div className="md:col-span-2 space-y-6">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] ml-4 italic">Designation (Asset Name)</label>
                                                    <input required type="text" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                                                        className="w-full border-none bg-slate-50 rounded-[2.5rem] px-12 py-9 outline-none focus:ring-[12px] focus:ring-blue-600/5 focus:bg-white transition-all font-black text-4xl shadow-inner placeholder:text-slate-200 h-24"
                                                        placeholder="e.g. Precision Hybrid Seeding Unit" />
                                                </div>

                                                <div className="md:col-span-2 space-y-6">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] ml-4 italic">Technical Compendium (Data)</label>
                                                    <textarea value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                                                        className="w-full border-none bg-slate-50 rounded-[3rem] px-12 py-10 outline-none focus:ring-[12px] focus:ring-blue-600/5 focus:bg-white transition-all font-bold text-2xl shadow-inner resize-none h-56 placeholder:text-slate-200"
                                                        placeholder="Detailed performance spec, certifications, maintenance protocol..." />
                                                </div>

                                                <div className="space-y-6">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] ml-4 italic">Valuation (₹ / Unit)</label>
                                                    <input required type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
                                                        className="w-full border-none bg-slate-50 rounded-[2.5rem] px-12 py-9 outline-none focus:ring-[12px] focus:ring-blue-600/5 focus:bg-white transition-all font-black text-4xl shadow-inner h-24" />
                                                </div>

                                                <div className="space-y-6">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] ml-4 italic">Stock Magnitude</label>
                                                    <input required type="number" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))}
                                                        className="w-full border-none bg-slate-50 rounded-[2.5rem] px-12 py-9 outline-none focus:ring-[12px] focus:ring-blue-600/5 focus:bg-white transition-all font-black text-4xl shadow-inner h-24" />
                                                </div>

                                                <div className="space-y-6">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] ml-4 italic">Quantifier Scale</label>
                                                    <select value={newProduct.unit} onChange={e => setNewProduct(p => ({ ...p, unit: e.target.value }))}
                                                        className="w-full border-none bg-slate-50 rounded-[2.5rem] px-12 py-9 outline-none focus:ring-[12px] focus:ring-blue-600/5 focus:bg-white transition-all font-black text-2xl shadow-inner appearance-none cursor-pointer h-24">
                                                        <option value="unit">INDIVIDUAL / PIECE</option>
                                                        <option value="kg">KILOGRAM (KG)</option>
                                                        <option value="bag">MASTER CONTAINER</option>
                                                        <option value="pk">RETAIL PACKET</option>
                                                    </select>
                                                </div>

                                                <div className="space-y-6">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] ml-4 italic">Asset Domain</label>
                                                    <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
                                                        className="w-full border-none bg-slate-50 rounded-[2.5rem] px-12 py-9 outline-none focus:ring-[12px] focus:ring-blue-600/5 focus:bg-white transition-all font-black text-2xl shadow-inner appearance-none cursor-pointer h-24">
                                                        <option value="tools">AGRI-MACHINERY</option>
                                                        <option value="seeds">GENETIC FOUNDATION</option>
                                                        <option value="fresh">PRIMARY PRODUCE</option>
                                                    </select>
                                                </div>

                                                <div className="md:col-span-2 flex gap-10 pt-12">
                                                    <button type="submit" disabled={submitting} className="flex-1 bg-slate-950 text-white font-black px-16 py-10 rounded-[3rem] hover:bg-blue-600 transition-all shadow-2xl flex items-center justify-center gap-6 disabled:opacity-70 active:scale-95 text-3xl uppercase tracking-tighter italic group/btn">
                                                        {submitting ? <><Loader2 size={40} className="animate-spin" /> Adding...</> : <><Sparkles size={40} className="group-hover/btn:rotate-12 transition-transform" /> List Product</>}
                                                    </button>
                                                    <button type="button" onClick={() => { setShowAddForm(false); setImagePreview(null); setImageFile(null); }} className="px-16 py-10 bg-slate-50 text-slate-400 font-black rounded-[3rem] hover:bg-red-50 hover:text-red-500 transition-all uppercase tracking-[0.4em] text-xs">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Data Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                    {/* Recent Activity */}
                                    <div className="bg-white rounded-[4rem] shadow-premium border border-slate-50 overflow-hidden relative group/ops">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-slate-950"></div>
                                        <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                            <div>
                                                <h2 className="font-black text-slate-950 text-3xl tracking-tighter italic uppercase leading-none">Trade Streams</h2>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em] mt-2 italic">Active Logistics Pulse</p>
                                            </div>
                                            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
                                                <span className="text-[12px] font-black text-slate-950 italic">{orders.length} LOGS ACTIVE</span>
                                            </div>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {loadingOrders && (
                                                <div className="p-32 text-center flex flex-col items-center">
                                                    <div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin mb-8"></div>
                                                    <p className="text-slate-200 font-black uppercase tracking-[0.5em] text-[10px]">Syncing Trade Ledger...</p>
                                                </div>
                                            )}
                                            {!loadingOrders && orders.length === 0 && (
                                                <div className="p-32 text-center">
                                                    <div className="bg-slate-50 w-28 h-28 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-inner border border-slate-100">
                                                        <Package size={56} className="text-slate-100" />
                                                    </div>
                                                    <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[10px] italic">No Active Transaction Flow</p>
                                                </div>
                                            )}
                                            {orders.slice(0, 5).map((order, idx) => (
                                                <motion.div 
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    key={order.id} 
                                                    className="p-12 hover:bg-slate-50 transition-all group relative border-l-4 border-transparent hover:border-blue-600"
                                                >
                                                    <div className="flex justify-between items-start mb-8">
                                                        <div className="space-y-4">
                                                            <span className="text-[10px] font-black bg-slate-950 text-white px-5 py-2 rounded-2xl uppercase italic tracking-tighter shadow-xl">XFER #{(order.id || "").substring(0, 10).toUpperCase()}</span>
                                                            <h4 className="font-black text-slate-950 text-4xl tracking-tighter italic group-hover:text-blue-600 transition-colors uppercase leading-none">{order.product_name} <span className="text-slate-200 font-bold ml-3 italic text-3xl">× {order.quantity}</span></h4>
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] italic">{new Date(order.created_at).toLocaleString()}</p>
                                                        </div>
                                                        <p className="font-black text-slate-950 text-5xl tracking-tighter italic">₹{Number(order.amount).toLocaleString()}</p>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-12">
                                                        <div className="flex items-center gap-6">
                                                            <span className={`px-8 py-3 text-[10px] font-black rounded-full uppercase tracking-[0.4em] shadow-sm flex items-center gap-3 ${order.status === "pending" ? "bg-amber-100 text-amber-800" : order.status === "shipped" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"}`}>
                                                                {order.status === "pending" && <Clock size={16} />} {order.status}
                                                            </span>
                                                            {order.payment_secured && order.status !== "delivered" && (
                                                                <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 uppercase tracking-widest italic shadow-sm">
                                                                    <ShieldCheck size={18} /> Farm-Ease Secured
                                                                </div>
                                                            )}
                                                        </div>
                                                        {order.status === "pending" && (
                                                            <button onClick={() => handleMarkShipped(order.id)} className="flex items-center gap-6 text-[12px] font-black text-white bg-slate-950 px-12 py-5 rounded-[2.5rem] hover:bg-blue-600 transition-all active:scale-95 shadow-2xl uppercase tracking-widest italic group-hover:shadow-blue-500/30">
                                                                <Truck size={24} strokeWidth={3} /> Commit Logistic
                                                            </button>
                                                        )}
                                                        {order.status === "delivered" && (
                                                            <div className="flex items-center gap-4 text-emerald-600 font-black uppercase tracking-widest text-[12px] italic bg-emerald-50 px-8 py-4 rounded-3xl border border-emerald-100 shadow-inner">
                                                                <CheckCircle2 size={24} strokeWidth={3} /> Capital Disbursed
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <div className="p-12 bg-slate-950 text-white flex justify-center">
                                            <button onClick={() => setActiveTab("orders")} className="text-[10px] font-black uppercase tracking-[0.6em] hover:text-emerald-400 transition-colors italic">Deep Audit Transactions Vector →</button>
                                        </div>
                                    </div>

                                    {/* Asset Portfolio */}
                                    <div className="bg-white rounded-[4rem] shadow-premium border border-slate-50 overflow-hidden relative group/asset">
                                        <div className="absolute top-0 right-0 w-full h-2 bg-blue-600"></div>
                                        <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-blue-950 text-white relative">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.2),transparent)] pointer-events-none"></div>
                                            <div>
                                                <h2 className="font-black text-3xl tracking-tighter italic uppercase leading-none">Asset Repository</h2>
                                                <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.5em] mt-2 italic">Product Grid Topology</p>
                                            </div>
                                            <button onClick={() => setShowAddForm(true)} className="bg-white/10 hover:bg-white hover:text-slate-950 px-8 py-3.5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center gap-3 backdrop-blur-md italic shadow-2xl">
                                                <Plus size={18} strokeWidth={3} /> Inject New Asset
                                            </button>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {loadingListings && (
                                                <div className="p-32 text-center flex flex-col items-center">
                                                    <div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin mb-8"></div>
                                                    <p className="text-slate-200 font-black uppercase tracking-[0.5em] text-[10px]">Indexing Catalog Data...</p>
                                                </div>
                                            )}
                                            {!loadingListings && listings.length === 0 && (
                                                <div className="p-32 text-center">
                                                    <div className="bg-slate-50 w-28 h-28 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-inner border border-slate-100">
                                                        <Leaf size={56} className="text-slate-100" />
                                                    </div>
                                                    <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[10px] italic">Global Inventory Void</p>
                                                </div>
                                            )}
                                            {listings.slice(0, 5).map((product, idx) => (
                                                <motion.div 
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    key={product.id} 
                                                    className="p-12 flex items-center gap-10 hover:bg-slate-50 transition-all group/item relative overflow-hidden"
                                                >
                                                    <div className="w-32 h-32 bg-slate-950 rounded-[3rem] flex items-center justify-center flex-shrink-0 border-4 border-white shadow-2xl overflow-hidden relative group-hover/item:scale-105 transition-all duration-700">
                                                        {product.image_url ? (
                                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-1000" />
                                                        ) : (
                                                            <Box size={44} className="text-white/20" />
                                                        )}
                                                        <div className="absolute inset-0 bg-slate-950/20 group-hover/item:bg-transparent transition-colors"></div>
                                                    </div>
                                                    <div className="flex-1 space-y-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-black text-slate-950 text-3xl tracking-tighter italic uppercase group-hover/item:text-emerald-600 transition-colors leading-none mb-2">{product.name}</h4>
                                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] italic">Category: {product.category}</p>
                                                            </div>
                                                            <span className="text-4xl font-black text-slate-950 italic">₹{product.price.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                            <span className={`px-6 py-2 text-[10px] font-black rounded-xl uppercase tracking-widest shadow-sm flex items-center gap-3 ${product.stock > 5 ? "bg-slate-950 text-white" : "bg-red-900 text-red-100"}`}>
                                                                <Layers size={14} /> {product.stock} {product.unit}(s) available
                                                            </span>
                                                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest italic underline underline-offset-4 cursor-pointer hover:text-emerald-800 transition-colors">Edit Asset Spec</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <div className="p-12 bg-slate-50 flex justify-center border-t border-slate-100">
                                            <button onClick={() => setActiveTab("listings")} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] hover:text-slate-950 transition-colors italic group/all flex items-center gap-4"> Access Holistic Asset Grid <ArrowUpRight size={18} className="group-hover/all:translate-x-1 group-hover/all:-translate-y-1 transition-transform" /> </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "orders" && (
                            <motion.div 
                                key="orders"
                                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: -20 }}
                                className="bg-white rounded-[4rem] shadow-premium border border-slate-50 overflow-hidden"
                            >
                                <div className="p-16 border-b border-slate-100 flex justify-between items-center bg-slate-950 text-white">
                                    <h2 className="font-black text-5xl tracking-tighter italic uppercase">Sales Registry</h2>
                                    <div className="text-right">
                                        <p className="text-4xl font-black italic tracking-tighter leading-none mb-1">₹{clearedBalance.toLocaleString()}</p>
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Total Revenue</p>
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {loadingOrders && <div className="p-40 text-center flex flex-col items-center"><div className="w-16 h-16 border-4 border-slate-100 border-t-slate-950 rounded-full animate-spin mb-10"></div><p className="text-slate-200 font-black uppercase tracking-[0.5em] text-xs">Syncing Ledger...</p></div>}
                                    {!loadingOrders && orders.length === 0 && <div className="p-48 text-center"><Package size={80} className="text-slate-50 mx-auto mb-12 opacity-50" /><p className="text-slate-950 font-black text-3xl tracking-tight italic">No Sales Record</p></div>}
                                    {orders.map(order => (
                                        <div key={order.id} className="p-16 hover:bg-slate-50/80 transition-all group">
                                            <div className="flex flex-col xl:flex-row justify-between items-start gap-12">
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-6">
                                                        <span className="text-[10px] font-black bg-slate-950 text-white px-5 py-2 rounded-2xl uppercase italic tracking-[0.2em] shadow-2xl">TXN #{(order.id || "").substring(0, 14).toUpperCase()}</span>
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">{new Date(order.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <h4 className="font-black text-slate-950 text-5xl tracking-tighter italic group-hover:text-blue-600 transition-colors uppercase leading-none">{order.product_name} <span className="text-slate-100 font-bold ml-4 italic text-4xl opacity-50 tracking-normal">× {order.quantity}</span></h4>
                                                    <div className="flex flex-wrap gap-6 mt-10">
                                                        <span className={`px-8 py-3 text-[10px] font-black rounded-2xl uppercase tracking-[0.4em] shadow-lg border border-white/10 ${order.status === "pending" ? "bg-orange-950 text-orange-200" : order.status === "shipped" ? "bg-blue-900 text-blue-200" : "bg-green-900 text-green-200"}`}>STATUS: {order.status.toUpperCase()}</span>
                                                    </div>
                                                </div>
                                                <div className="text-left xl:text-right w-full xl:w-auto mt-6 xl:mt-0">
                                                    <p className="font-black text-slate-950 text-7xl tracking-tighter italic mb-10">₹{Number(order.amount).toLocaleString()}</p>
                                                    {order.status === "pending" && (
                                                        <button onClick={() => handleMarkShipped(order.id)} className="w-full xl:w-auto flex items-center justify-center gap-6 text-2xl font-black text-white bg-slate-950 px-16 py-8 rounded-[2.5rem] hover:bg-emerald-600 transition-all active:scale-95 shadow-premium uppercase tracking-tighter italic"><Truck size={36} strokeWidth={3} /> Ship Product</button>
                                                    )}
                                                    {order.status === "delivered" && <div className="flex items-center xl:justify-end gap-4 text-green-600 font-black uppercase tracking-[0.4em] text-lg italic"><div className="bg-green-100 p-3 rounded-[1.5rem] border border-green-200 shadow-inner flex items-center justify-center"><CheckCircle2 size={32} strokeWidth={3} /></div> Payment Disbursed</div>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
    
                        {activeTab === "profile" && (
                            <motion.div 
                                key="profile"
                                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: -20 }}
                                className="max-w-3xl"
                            >
                                 <div className="bg-white rounded-[4rem] shadow-premium border border-slate-50 p-20 relative overflow-hidden group/profile">
                                    <div className="absolute top-0 left-0 w-full h-4 bg-slate-950"></div>
                                    <h2 className="text-5xl font-black text-slate-950 mb-16 tracking-tight italic">Seller <span className="text-slate-300">Identity.</span></h2>
    
                                    <form onSubmit={handleUpdateProfile} className="space-y-16">
                                        <div className="space-y-12">
                                            <div className="flex items-center gap-16 mb-16 bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100 shadow-inner group-hover/profile:bg-white transition-colors duration-700">
                                                <div className="w-40 h-40 rounded-[3rem] bg-slate-950 text-white font-black text-6xl flex items-center justify-center shadow-2xl italic border-[10px] border-white group-hover/profile:rotate-2 transition-transform duration-700">
                                                    {initials}
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="font-black text-slate-950 text-5xl tracking-tighter italic uppercase leading-none">{displayName}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] bg-white px-6 py-3 rounded-2xl border border-slate-100 inline-block shadow-sm">{user?.email}</p>
                                                </div>
                                            </div>
    
                                            <div className="space-y-5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] flex items-center gap-6 ml-6">
                                                    <div className="w-3 h-3 rounded-full bg-slate-950 shadow-[0_0_15px_rgba(0,0,0,0.1)]"></div> Full Name / Farm Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileName}
                                                    onChange={(e) => setProfileName(e.target.value)}
                                                    className="w-full p-10 bg-slate-50 border-none rounded-[2.5rem] focus:ring-8 focus:ring-slate-950/5 focus:bg-white outline-none font-black text-3xl text-slate-950 transition-all shadow-inner"
                                                    required
                                                />
                                            </div>
    
                                            <div className="p-10 bg-slate-950 text-white rounded-[2.5rem] flex items-center gap-10 shadow-2xl relative overflow-hidden group">
                                                <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full -mb-24 -mr-24 blur-3xl"></div>
                                                 <div className="bg-white/10 p-6 rounded-[1.5rem] text-emerald-400 shadow-inner border border-white/5">
                                                    <ShieldCheck size={44} strokeWidth={3} />
                                                </div>
                                                <div>
                                                    <h4 className="text-2xl font-black italic tracking-tight uppercase mb-1">Farm-Ease Trust Badge</h4>
                                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] italic">Status: Verified Seller</p>
                                                </div>
                                            </div>
                                        </div>
    
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="w-full bg-slate-950 text-white font-black py-10 rounded-[3rem] shadow-premium hover:bg-emerald-600 transition-all flex items-center justify-center gap-8 disabled:opacity-50 active:scale-[0.98] text-3xl uppercase tracking-tighter italic group"
                                        >
                                            {isSaving ? <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={40} strokeWidth={3} className="group-hover:scale-110 transition-transform" />}
                                            {isSaving ? "Updating Profile..." : "Save Profile"}
                                        </button>
                                    </form>
    
                                    <div className="mt-24 pt-20 border-t border-slate-50 flex items-center justify-between px-6">
                                        <div className="space-y-2">
                                            <p className="text-slate-950 font-black text-xs uppercase tracking-[0.6em] italic leading-none">Account Security</p>
                                            <p className="text-slate-300 font-bold text-[10px] uppercase tracking-tighter italic">Manage your account access and sessions</p>
                                        </div>
                                        <button onClick={handleLogout} className="bg-slate-50 text-slate-950 px-12 py-5 font-black text-xs rounded-2x hover:bg-slate-950 hover:text-white transition-all uppercase tracking-[0.4em] shadow-sm italic active:scale-90 border border-slate-100">
                                            Logout
                                        </button>
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
