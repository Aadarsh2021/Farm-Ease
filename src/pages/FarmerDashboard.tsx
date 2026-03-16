import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    Package, Plus, Banknote, ShieldAlert, CheckCircle2, 
    Bell, Leaf, LogOut, Home, X, ImageIcon, Loader2, Truck, 
    User, ShieldCheck, Save, Sparkles, Activity, Layers, 
    ArrowUpRight, Clock, Box
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
    AreaChart, Area, BarChart, Bar, 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    Legend, Cell, PieChart, Pie
} from "recharts";

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

export default function FarmerDashboard() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", stock: "", unit: "kg", category: "fresh" });
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
    }, [user]);

    const fetchOrders = useCallback(async () => {
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
    }, [user]);

    // Listings Real-time
    useEffect(() => {
        if (user) {
            fetchListings();
            const channel = supabase
                .channel('public:farmer_products')
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
                .channel('public:farmer_orders')
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-6"></div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Loading Farm Access...</p>
        </div>
    );

    const displayName = user?.displayName || user?.email?.split("@")[0] || "Farmer";
    const initials = displayName.charAt(0).toUpperCase();
    const clearedBalance = orders.filter(o => o.status === "delivered").reduce((sum, o) => sum + Number(o.amount), 0);
    const paymentSecured = orders.filter(o => o.status !== "delivered" && o.payment_secured).reduce((sum, o) => sum + Number(o.amount), 0);
    const securedCount = orders.filter(o => o.status !== "delivered" && o.payment_secured).length;

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
                        <div className="w-12 h-1 bg-emerald-500 rounded-full mb-4"></div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Operations Unit</p>
                    </div>

                    {[
                        { id: "overview", label: "Harvest Overview", icon: Home, desc: "Global Performance" },
                        { id: "listings", label: "Asset Inventory", icon: Box, desc: "Market Exposure" },
                        { id: "orders", label: "Trade Registry", icon: Layers, desc: "Settlement Flow" },
                        { id: "yield", label: "Yield Engine", icon: Sparkles, desc: "Market Projection" },
                        { id: "profile", label: "Entity Profile", icon: User, desc: "Protocol Identity" },
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
                            <Home size={20} strokeWidth={3} /> Return to Grid
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-4 p-5 rounded-[2rem] text-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all font-black text-[10px] uppercase tracking-[0.3em] italic">
                            <LogOut size={20} strokeWidth={3} /> Shutdown Session
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.03),transparent)] pointer-events-none"></div>
                
                <motion.header 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/80 backdrop-blur-2xl px-12 py-8 flex justify-between items-center sticky top-0 z-20 border-b border-slate-100"
                >
                    <div className="flex items-center gap-6">
                        <div className="bg-slate-950 p-3 rounded-2xl text-white shadow-xl">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-950 capitalize tracking-tighter italic leading-none">{activeTab}</h1>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">Node Status: <span className="text-emerald-500">Active</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="hidden sm:flex flex-col items-end mr-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Cycle Progress</p>
                            <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden shadow-inner">
                                <div className="w-3/4 h-full bg-emerald-500 rounded-full"></div>
                            </div>
                        </div>
                        <button className="text-slate-300 hover:text-emerald-600 relative p-4 rounded-[1.5rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                            <Bell size={28} />
                            {orders.length > 0 && <span className="absolute top-4 right-4 bg-emerald-500 w-3 h-3 rounded-full ring-4 ring-white animate-pulse"></span>}
                        </button>
                        <div className="flex items-center gap-6 border-l border-slate-100 pl-8 ml-2">
                            <div className="text-right hidden md:block">
                                <p className="font-black text-slate-950 leading-none mb-1 text-lg">{displayName}</p>
                                <p className="text-[9px] text-emerald-600 uppercase font-black tracking-[0.3em] flex items-center justify-end gap-2 italic">Master Harvester</p>
                            </div>
                            <div className="w-16 h-16 rounded-[2rem] bg-emerald-500 text-slate-950 font-black text-3xl flex items-center justify-center shadow-2xl italic border-4 border-white rotate-3">{initials}</div>
                        </div>
                    </div>
                </motion.header>

                <main className="p-12 max-w-screen-2xl mx-auto">
                    {/* Overview Tab */}
                    {(activeTab === "overview" || activeTab === "listings") && (
                        <div className="space-y-16">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <motion.div 
                                    whileHover={{ y: -10 }}
                                    className="bg-white rounded-[3.5rem] shadow-premium p-12 group transition-all border border-slate-100 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="bg-emerald-50 p-5 rounded-2xl text-emerald-600 shadow-inner group-hover:scale-110 transition-transform"><Banknote size={32} /></div>
                                        <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-4 py-2 rounded-xl flex items-center gap-2 uppercase tracking-[0.2em] italic border border-emerald-200">
                                            Liquid Capital <ArrowUpRight size={14} />
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 block italic">Settled Balance</p>
                                    <h3 className="text-6xl font-black text-slate-950 tracking-tighter italic mb-4 leading-none">₹{clearedBalance.toLocaleString()}</h3>
                                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> All verifications passed.
                                    </p>
                                </motion.div>

                                <motion.div 
                                    whileHover={{ y: -10 }}
                                    className="bg-white rounded-[3.5rem] shadow-premium p-12 group transition-all border-2 border-slate-950 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-slate-950 group-hover:opacity-0 transition-opacity duration-700 pointer-events-none opacity-0"></div>
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="bg-slate-50 p-5 rounded-2xl text-slate-400 shadow-inner group-hover:bg-amber-100 group-hover:text-amber-600 transition-all"><ShieldCheck size={32} strokeWidth={2.5} /></div>
                                        <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-[0.2em] italic border border-amber-200">
                                            Farm-Ease Protocol
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 block italic">Secured Procurement Capital</p>
                                    <h3 className="text-6xl font-black text-slate-950 tracking-tighter italic mb-4 leading-none">₹{paymentSecured.toLocaleString()}</h3>
                                    <p className="text-[11px] font-bold text-amber-600 flex items-center gap-3 italic">
                                        <Clock size={16} /> {securedCount} Operations Pending
                                    </p>
                                </motion.div>

                                <motion.button
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { setActiveTab("listings"); setShowAddForm(true); }}
                                    className="bg-slate-950 p-12 rounded-[3.5rem] shadow-2xl flex flex-col items-center justify-center text-center cursor-pointer group hover:bg-emerald-600 transition-all duration-500 border-4 border-slate-900 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                                    <div className="bg-white/10 group-hover:bg-slate-950/20 p-8 rounded-[2.5rem] text-white shadow-2xl transition-all mb-6 border border-white/5 group-hover:rotate-90">
                                        <Plus size={48} strokeWidth={3} />
                                    </div>
                                    <h3 className="font-black text-white text-3xl tracking-tighter italic leading-none uppercase">Initialize</h3>
                                    <p className="text-[10px] font-black text-white/30 group-hover:text-white uppercase tracking-[0.3em] mt-3">Deploy New Asset Block</p>
                                </motion.button>
                            </div>

                            {/* Add Product Form */}
                            <AnimatePresence>
                                {showAddForm && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                        className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 p-16 relative overflow-hidden group/form"
                                    >
                                        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-emerald-500/5 blur-[100px] rounded-full -mr-80 -mt-80 pointer-events-none"></div>
                                        <div className="flex justify-between items-center mb-16 relative z-10">
                                            <div>
                                                <h2 className="text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">Initialization <span className="text-emerald-600">Phase.</span></h2>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-3">Ready for asset deployment to market grid</p>
                                            </div>
                                            <button onClick={() => { setShowAddForm(false); setImagePreview(null); setImageFile(null); }} className="text-slate-200 hover:text-red-500 bg-slate-50 p-6 rounded-[2rem] transition-all hover:rotate-90"><X size={32} strokeWidth={3} /></button>
                                        </div>
                                        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                                            {/* Image Upload */}
                                            <div className="md:col-span-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2 mb-4 block italic">Visual Documentation (High Res)</label>
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full h-80 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all overflow-hidden relative group"
                                                >
                                                    {imagePreview ? (
                                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-center group-hover:scale-110 transition-transform duration-500">
                                                            <div className="bg-slate-50 p-8 rounded-[2rem] mb-6 mx-auto w-fit group-hover:bg-white group-hover:shadow-2xl transition-all">
                                                                <ImageIcon size={64} className="text-slate-100 group-hover:text-emerald-500" />
                                                            </div>
                                                            <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">Capture Produce Proof</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                            </div>

                                            <div className="md:col-span-2 space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2 italic">Designation (Batch Name)</label>
                                                <input required type="text" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                                                    className="w-full border-none bg-slate-50 rounded-[2rem] px-10 py-7 outline-none focus:ring-8 focus:ring-emerald-500/5 focus:bg-white transition-all font-black text-3xl shadow-inner placeholder:text-slate-200"
                                                    placeholder="e.g. Organic Black Wheat Batch #04" />
                                            </div>
                                            <div className="md:col-span-2 space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2 italic">Technical Composition (Bio Data)</label>
                                                <textarea value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                                                    className="w-full border-none bg-slate-50 rounded-[2.5rem] px-10 py-8 outline-none focus:ring-8 focus:ring-emerald-500/5 focus:bg-white transition-all font-bold text-xl shadow-inner resize-none h-44 placeholder:text-slate-200"
                                                    placeholder="Specify moisture content, organic certifications, harvest date..." />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2 italic">Valuation (₹ / Unit)</label>
                                                <input required type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
                                                    className="w-full border-none bg-slate-50 rounded-[2rem] px-10 py-7 outline-none focus:ring-8 focus:ring-emerald-500/5 focus:bg-white transition-all font-black text-3xl shadow-inner" placeholder="₹ Value" />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2 italic">Batch Magnitude (Stock)</label>
                                                <input required type="number" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))}
                                                    className="w-full border-none bg-slate-50 rounded-[2rem] px-10 py-7 outline-none focus:ring-8 focus:ring-emerald-500/5 focus:bg-white transition-all font-black text-3xl shadow-inner" placeholder="Units Count" />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2 italic">Quantifier Scale</label>
                                                <select value={newProduct.unit} onChange={e => setNewProduct(p => ({ ...p, unit: e.target.value }))}
                                                    className="w-full border-none bg-slate-50 rounded-3xl px-10 py-7 outline-none focus:ring-8 focus:ring-emerald-500/5 focus:bg-white transition-all font-black text-xl shadow-inner appearance-none cursor-pointer">
                                                    <option value="kg">KILOGRAM (KG)</option>
                                                    <option value="bag">GUNNY BAG</option>
                                                    <option value="pkt">PACKET</option>
                                                    <option value="piece">UNIT / PIECE</option>
                                                    <option value="litre">LITRE</option>
                                                </select>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2 italic">Deployment Protocol</label>
                                                <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
                                                    className="w-full border-none bg-slate-50 rounded-3xl px-10 py-7 outline-none focus:ring-8 focus:ring-emerald-500/5 focus:bg-white transition-all font-black text-xl shadow-inner appearance-none cursor-pointer">
                                                    <option value="fresh">FRESH PRODUCE</option>
                                                    <option value="seeds">SEED & GENETICS</option>
                                                    <option value="tools">AGRI-EQUIPMENT</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2 flex gap-8 pt-12">
                                                <button type="submit" disabled={submitting} className="flex-1 bg-slate-950 text-white font-black px-16 py-8 rounded-[2.5rem] hover:bg-emerald-600 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-70 active:scale-95 text-2xl uppercase tracking-tighter italic group/btn">
                                                    {submitting ? <><Loader2 size={32} className="animate-spin" /> Deep Porting...</> : <><Sparkles size={32} className="group-hover/btn:rotate-12 transition-transform" /> Deploy Listing</>}
                                                </button>
                                                <button type="button" onClick={() => { setShowAddForm(false); setImagePreview(null); setImageFile(null); }} className="px-12 py-8 bg-slate-50 text-slate-400 font-black rounded-[2rem] hover:bg-red-50 hover:text-red-500 transition-all uppercase tracking-[0.3em] text-xs">
                                                    Abort Deployment
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Orders + Listings Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                {/* Recent Orders */}
                                <div className="bg-white rounded-[4rem] shadow-premium border border-slate-50 overflow-hidden relative group/ops">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                                    <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                                        <div>
                                            <h2 className="font-black text-slate-950 text-3xl tracking-tighter italic uppercase leading-none">Sales Pipeline</h2>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">Active Trade Streams</p>
                                        </div>
                                        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                                            <span className="text-[12px] font-black text-slate-950 italic">{orders.length} LOGS</span>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {loadingOrders && (
                                            <div className="p-32 text-center flex flex-col items-center">
                                                <div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin mb-8"></div>
                                                <p className="text-slate-200 font-black uppercase tracking-[0.5em] text-[10px]">Filtering Chain Logs...</p>
                                            </div>
                                        )}
                                        {!loadingOrders && orders.length === 0 && (
                                            <div className="p-32 text-center">
                                                <div className="bg-slate-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner border border-slate-100">
                                                    <Package size={44} className="text-slate-100" />
                                                </div>
                                                <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[10px] italic">Zero Active Trade Signals</p>
                                            </div>
                                        )}
                                        {orders.slice(0, 5).map((order, idx) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                key={order.id} 
                                                className="p-12 hover:bg-slate-50/50 transition-all group relative border-l-4 border-transparent hover:border-emerald-500"
                                            >
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="space-y-3">
                                                        <span className="text-[10px] font-black bg-slate-950 text-white px-4 py-1.5 rounded-xl uppercase italic tracking-tighter shadow-lg">XFER #{(order.id || "").substring(0, 10).toUpperCase()}</span>
                                                        <h4 className="font-black text-slate-950 text-3xl tracking-tighter italic group-hover:text-emerald-600 transition-colors uppercase leading-none">{order.product_name} <span className="text-slate-200 font-bold ml-2 italic text-2xl">× {order.quantity}</span></h4>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic">{new Date(order.created_at).toLocaleString()}</p>
                                                    </div>
                                                    <p className="font-black text-slate-950 text-4xl tracking-tighter italic">₹{Number(order.amount).toLocaleString()}</p>
                                                </div>
                                                <div className="flex justify-between items-center mt-10">
                                                    <div className="flex items-center gap-4">
                                                        <span className={`px-6 py-2 text-[10px] font-black rounded-full uppercase tracking-[0.3em] shadow-sm flex items-center gap-2 ${order.status === "pending" ? "bg-amber-100 text-amber-800" : order.status === "shipped" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"}`}>
                                                            {order.status === "pending" && <Clock size={14} />} {order.status}
                                                        </span>
                                                        {order.payment_secured && order.status !== "delivered" && (
                                                            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 uppercase tracking-widest italic shadow-sm">
                                                                <ShieldCheck size={14} /> Farm-Ease Secure Active
                                                            </div>
                                                        )}
                                                    </div>
                                                    {order.status === "pending" && (
                                                        <button onClick={() => handleMarkShipped(order.id)} className="flex items-center gap-4 text-[12px] font-black text-white bg-slate-950 px-8 py-4 rounded-[2rem] hover:bg-emerald-600 transition-all active:scale-95 shadow-2xl uppercase tracking-widest italic group-hover:shadow-emerald-500/20">
                                                            <Truck size={20} strokeWidth={3} /> Commit Logistic
                                                        </button>
                                                    )}
                                                    {order.status === "delivered" && (
                                                        <div className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-widest text-[11px] italic bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shadow-inner">
                                                            <CheckCircle2 size={20} strokeWidth={3} /> Capital Disbursed
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="p-10 bg-slate-950 text-white flex justify-center">
                                        <button onClick={() => setActiveTab("orders")} className="text-[10px] font-black uppercase tracking-[0.5em] hover:text-emerald-400 transition-colors italic">Deep Audit All Transactions →</button>
                                    </div>
                                </div>

                                {/* Active Inventory */}
                                <div className="bg-white rounded-[4rem] shadow-premium border border-slate-50 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-full h-2 bg-slate-950"></div>
                                    <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-emerald-950 text-white relative">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent)] pointer-events-none"></div>
                                        <div className="relative z-10">
                                            <h2 className="font-black text-3xl tracking-tighter italic uppercase leading-none">Catalog Core</h2>
                                            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em] mt-2 italic">Live Listing Reservoir</p>
                                        </div>
                                        <button onClick={() => setShowAddForm(true)} className="relative z-10 bg-white/10 hover:bg-white text-white hover:text-emerald-950 px-6 py-3 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-3 border border-white/20 shadow-2xl active:scale-95">
                                            <Plus size={18} strokeWidth={3} /> Inject Block
                                        </button>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {loadingListings && (
                                            <div className="p-32 text-center flex flex-col items-center">
                                                <div className="w-16 h-16 border-4 border-slate-100 border-t-slate-950 rounded-full animate-spin mb-8"></div>
                                                <p className="text-slate-200 font-black uppercase tracking-[0.5em] text-[10px]">Indexing Asset Schema...</p>
                                            </div>
                                        )}
                                        {!loadingListings && listings.length === 0 && (
                                            <div className="p-40 text-center">
                                                <div className="bg-slate-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner"><Box size={44} className="text-slate-100" /></div>
                                                <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[10px] italic">Global Reservoir Void</p>
                                            </div>
                                        )}
                                        {listings.map((product, idx) => (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={product.id} 
                                                className="p-10 flex items-center gap-10 hover:bg-slate-50 transition-all group"
                                            >
                                                <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center flex-shrink-0 border-4 border-slate-50 overflow-hidden relative shadow-2xl group-hover:scale-110 transition-all duration-700">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Leaf size={44} className="text-slate-100" />
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg uppercase tracking-widest italic border border-emerald-100">Market Protocol Active</span>
                                                    </div>
                                                    <h4 className="font-black text-slate-950 text-3xl tracking-tighter italic uppercase group-hover:text-emerald-600 transition-colors leading-none">{product.name}</h4>
                                                    <div className="flex items-center gap-8 pt-2">
                                                        <span className="text-2xl font-black text-slate-950 italic tracking-tighter leading-none">₹{product.price}<span className="text-[10px] text-slate-300 not-italic ml-2 italic tracking-widest uppercase">/ {product.unit}</span></span>
                                                        <span className={`text-[10px] font-black px-6 py-2 rounded-2xl uppercase tracking-[0.2em] shadow-sm border ${product.stock > 20 ? "bg-slate-950 text-white border-transparent" : "bg-red-50 text-red-800 border-red-100"}`}>
                                                            {product.stock} Units Reservoir
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* All Orders Tab (Extended) */}
                    <AnimatePresence mode="wait">
                        {activeTab === "orders" && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white rounded-[4rem] shadow-premium border border-slate-50 overflow-hidden relative"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                                <div className="p-16 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                    <div>
                                        <h2 className="font-black text-slate-950 text-5xl tracking-tighter italic uppercase leading-none">Master Registry</h2>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-3">Comprehensive Transaction History</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cycle Volume</p>
                                        <p className="text-3xl font-black text-slate-950 italic tracking-tighter leading-none">₹{clearedBalance.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {loadingOrders && (
                                        <div className="p-32 text-center flex flex-col items-center">
                                            <div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin mb-8"></div>
                                            <p className="text-slate-200 font-black uppercase tracking-[0.5em] text-[10px]">Accessing Secure Node...</p>
                                        </div>
                                    )}
                                    {!loadingOrders && orders.length === 0 && (
                                        <div className="p-40 text-center">
                                            <Package size={80} className="text-slate-100 mx-auto mb-10" />
                                            <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-[10px] italic leading-relaxed max-w-xs mx-auto">Protocol initialized. Waiting for inbound trade signals from the market grid.</p>
                                        </div>
                                    )}
                                    {orders.map((order, idx) => (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={order.id} 
                                            className="p-16 hover:bg-slate-50/80 transition-all group relative border-l-8 border-transparent hover:border-emerald-500"
                                        >
                                            <div className="flex flex-col xl:flex-row justify-between items-start gap-12">
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-6">
                                                        <span className="text-[10px] font-black bg-slate-950 text-white px-5 py-2 rounded-xl uppercase italic tracking-tighter shadow-xl">XLOG #{(order.id || "").substring(0, 12).toUpperCase()}</span>
                                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={14} /> {new Date(order.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <h4 className="font-black text-slate-950 text-5xl tracking-tighter italic group-hover:text-emerald-600 transition-colors uppercase leading-none">{order.product_name} <span className="text-slate-200 font-bold ml-4 italic text-4xl leading-none">× {order.quantity}</span></h4>
                                                    <div className="flex flex-wrap gap-6 pt-2">
                                                        <span className={`px-8 py-2.5 text-[10px] font-black rounded-full uppercase tracking-[0.3em] shadow-sm flex items-center gap-2 ${order.status === "pending" ? "bg-amber-100 text-amber-800" : order.status === "shipped" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"}`}>
                                                            {order.status === "pending" && <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>}
                                                            {order.status === "shipped" && <Truck size={14} />}
                                                            {order.status === "delivered" && <CheckCircle2 size={14} />}
                                                            Status: {order.status}
                                                        </span>
                                                        {order.status !== "delivered" && order.payment_secured && (
                                                            <span className="flex items-center gap-3 text-[10px] font-black text-emerald-600 bg-emerald-50 px-8 py-2.5 rounded-full border border-emerald-100 uppercase tracking-[0.2em] italic shadow-sm">
                                                                <ShieldCheck size={18} strokeWidth={3} /> Farm-Ease Secure Protocol Locked
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-left xl:text-right w-full xl:w-auto mt-6 xl:mt-0">
                                                    <p className="font-black text-slate-950 text-7xl tracking-tighter italic mb-10 leading-none">₹{Number(order.amount).toLocaleString()}</p>
                                                    {order.status === "pending" && (
                                                        <button 
                                                            onClick={() => handleMarkShipped(order.id)} 
                                                            className="w-full xl:w-auto flex items-center justify-center gap-6 text-2xl font-black text-white bg-slate-950 px-16 py-8 rounded-[3rem] hover:bg-emerald-600 transition-all active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.1)] uppercase tracking-tighter italic group/ship"
                                                        >
                                                            <Truck size={32} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" /> Execute Delivery
                                                        </button>
                                                    )}
                                                    {order.status === "delivered" && (
                                                        <div className="flex items-center xl:justify-end gap-4 text-emerald-600 font-black uppercase tracking-[0.3em] text-[12px] italic bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 shadow-inner">
                                                            <CheckCircle2 size={28} strokeWidth={3} /> Capital Disbursed to Account
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {activeTab === "yield" && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-16"
                        >
                            <div className="bg-slate-950 rounded-[5rem] p-16 text-white shadow-premium relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent)] pointer-events-none"></div>
                                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
                                    <div className="space-y-6">
                                        <h2 className="text-6xl font-black tracking-tighter italic uppercase leading-none">Yield <span className="text-emerald-500">Projection.</span></h2>
                                        <p className="text-slate-400 max-w-xl text-xl font-bold italic leading-relaxed">Advanced cryptographic forecasting for your agrarian assets. Direct node-to-market data mapping.</p>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="bg-white/5 border border-white/10 px-10 py-6 rounded-[2.5rem] text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Confidence</p>
                                            <p className="text-4xl font-black italic tracking-tighter leading-none">94.8%</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 px-10 py-6 rounded-[2.5rem] text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Alpha Node</p>
                                            <p className="text-4xl font-black italic tracking-tighter leading-none">v3.0</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                                {/* Harvest Trajectory */}
                                <div className="bg-white rounded-[4rem] shadow-premium p-16 border border-slate-50">
                                    <div className="flex justify-between items-center mb-12">
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase">Harvest Trajectory</h3>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2 italic">Historical Yield Logs</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Metric Tons</span>
                                        </div>
                                    </div>
                                    <div className="h-[400px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={[
                                                { month: 'JAN', yield: 45, projection: 45 },
                                                { month: 'FEB', yield: 52, projection: 52 },
                                                { month: 'MAR', yield: 48, projection: 48 },
                                                { month: 'APR', yield: 61, projection: 61 },
                                                { month: 'MAY', yield: 75, projection: 75 },
                                                { month: 'JUN', yield: 68, projection: 68 },
                                                { month: 'JUL', yield: null, projection: 82 },
                                                { month: 'AUG', yield: null, projection: 95 },
                                            ]}>
                                                <defs>
                                                    <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis 
                                                    dataKey="month" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} 
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} 
                                                />
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        backgroundColor: '#0f172a', 
                                                        border: 'none', 
                                                        borderRadius: '24px', 
                                                        padding: '20px',
                                                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                                                    }}
                                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}
                                                    labelStyle={{ color: '#10b981', fontWeight: 900, marginBottom: '8px' }}
                                                />
                                                <Area type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorYield)" />
                                                <Area type="monotone" dataKey="projection" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Asset Allocation */}
                                <div className="bg-white rounded-[4rem] shadow-premium p-16 border border-slate-50">
                                    <div className="flex justify-between items-center mb-12">
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase">Market Composition</h3>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2 italic">Asset Value Breakdown</p>
                                        </div>
                                    </div>
                                    <div className="h-[400px] w-full flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Fresh Produce', value: 400 },
                                                        { name: 'Seed Assets', value: 300 },
                                                        { name: 'Agri-Equipment', value: 200 },
                                                        { name: 'Organic Fertilizers', value: 100 },
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={80}
                                                    outerRadius={120}
                                                    paddingAngle={10}
                                                    dataKey="value"
                                                >
                                                    {[
                                                        '#10b981', // emerald-500
                                                        '#0f172a', // slate-950
                                                        '#334155', // slate-700
                                                        '#94a3b8', // slate-400
                                                    ].map((color, index) => (
                                                        <Cell key={`cell-${index}`} fill={color} stroke="none" />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                     contentStyle={{ 
                                                        backgroundColor: '#0f172a', 
                                                        border: 'none', 
                                                        borderRadius: '24px', 
                                                        padding: '20px'
                                                    }}
                                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}
                                                />
                                                <Legend 
                                                    verticalAlign="bottom" 
                                                    height={36}
                                                    iconType="circle"
                                                    formatter={(value) => <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">{value}</span>}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Valuation Stream */}
                                <div className="xl:col-span-2 bg-slate-950 rounded-[5rem] p-16 shadow-premium relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                                    <div className="flex justify-between items-center mb-12 relative z-10">
                                        <div>
                                            <h3 className="text-4xl font-black text-white tracking-tighter italic uppercase">Economic Flux</h3>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-3 italic">Revenue Protocol Stream</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Growth Index</p>
                                                <p className="text-xl font-black text-emerald-400 italic leading-none">+12.4%</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-[400px] w-full relative z-10">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[
                                                { period: 'WEEK 01', revenue: 12000 },
                                                { period: 'WEEK 02', revenue: 19000 },
                                                { period: 'WEEK 03', revenue: 15000 },
                                                { period: 'WEEK 04', revenue: 22000 },
                                                { period: 'WEEK 05', revenue: 30000 },
                                                { period: 'WEEK 06', revenue: 25000 },
                                                { period: 'WEEK 07', revenue: 35000 },
                                                { period: 'WEEK 08', revenue: 42000 },
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                                <XAxis 
                                                    dataKey="period" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} 
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} 
                                                />
                                                <Tooltip 
                                                    cursor={{ fill: '#ffffff05' }}
                                                    contentStyle={{ 
                                                        backgroundColor: '#fff', 
                                                        border: 'none', 
                                                        borderRadius: '24px', 
                                                        padding: '20px'
                                                    }}
                                                    itemStyle={{ color: '#0f172a', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}
                                                    labelStyle={{ color: '#10b981', fontWeight: 900, marginBottom: '8px' }}
                                                />
                                                <Bar dataKey="revenue" fill="#10b981" radius={[12, 12, 0, 0]} maxBarSize={60} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "profile" && (
                        <div className="max-w-4xl mx-auto py-10">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[5rem] shadow-2xl border border-slate-50 p-20 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-4 bg-emerald-500 shadow-lg shadow-emerald-500/20"></div>
                                <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-emerald-500/5 blur-[100px] rounded-full -mr-40 -mt-40 pointer-events-none"></div>
                                
                                <div className="flex flex-col md:flex-row items-center gap-16 mb-20 pb-16 border-b border-slate-50">
                                    <div className="w-56 h-56 rounded-[4rem] bg-emerald-500 text-slate-950 font-black text-8xl flex items-center justify-center shadow-2xl italic border-[12px] border-white rotate-3 relative hover:rotate-0 transition-transform duration-700 cursor-pointer group">
                                        {initials}
                                        <div className="absolute inset-0 bg-slate-950/20 rounded-[4rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <ImageIcon size={48} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="text-center md:text-left space-y-4">
                                        <div className="flex items-center gap-4 justify-center md:justify-start">
                                            <span className="text-[10px] font-black bg-slate-950 text-white px-5 py-2 rounded-xl uppercase tracking-[0.3em] italic shadow-lg">Authority Node Verified</span>
                                        </div>
                                        <h2 className="text-7xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{displayName}</h2>
                                        <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.6em] flex items-center justify-center md:justify-start gap-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Protocol ID: {user?.email}
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-16">
                                    <div className="space-y-6">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] flex items-center gap-4 ml-6 italic">
                                            <User size={16} /> Identity Designation
                                        </label>
                                        <input
                                            type="text"
                                            value={profileName}
                                            onChange={(e) => setProfileName(e.target.value)}
                                            className="w-full p-10 bg-slate-50 border-none rounded-[3rem] focus:ring-8 focus:ring-emerald-500/5 focus:bg-white outline-none font-black text-4xl text-slate-950 transition-all shadow-inner placeholder:text-slate-200"
                                            placeholder="Your Legal Entity Name"
                                            required
                                        />
                                    </div>

                                    <div className="p-10 bg-emerald-950 text-white rounded-[3.5rem] flex items-center gap-10 shadow-2xl relative group/shield pointer-events-none">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent)] opacity-50"></div>
                                        <div className="bg-white/10 p-8 rounded-[2.5rem] text-emerald-400 shadow-inner group-hover/shield:scale-110 transition-transform">
                                            <ShieldCheck size={56} strokeWidth={3} />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-2">Authenticated Harvester Node</h4>
                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] italic opacity-70">Security Protocol Level: ALPHA-PRIME</p>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full bg-slate-950 text-white font-black py-10 rounded-[3rem] shadow-2xl hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-6 disabled:opacity-50 active:scale-[0.98] text-3xl uppercase tracking-tighter italic group/save"
                                    >
                                        {isSaving ? <Loader2 size={40} className="animate-spin" /> : <Save size={40} strokeWidth={3} className="group-hover/save:rotate-12 transition-transform" />}
                                        {isSaving ? "Syncing Grid..." : "Commit Update"}
                                    </button>
                                </form>

                                <div className="mt-24 pt-16 border-t border-slate-100 flex items-center justify-between px-10">
                                    <div className="space-y-2">
                                        <p className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] italic leading-none flex items-center gap-3">
                                            <ShieldAlert size={14} /> Sever Connection
                                        </p>
                                        <p className="text-slate-300 font-bold text-[10px] uppercase tracking-widest italic">Terminate Hub Interface Session</p>
                                    </div>
                                    <button onClick={handleLogout} className="bg-red-50 text-red-600 px-12 py-5 font-black text-[12px] rounded-[2rem] hover:bg-red-500 hover:text-white transition-all uppercase tracking-[0.3em] shadow-sm italic active:scale-90 border border-red-100">
                                        Shutdown
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
