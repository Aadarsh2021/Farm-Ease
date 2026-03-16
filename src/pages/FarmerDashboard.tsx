import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
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

interface Order {
    id: string;
    product_name: string;
    quantity: number;
    amount: number;
    status: string;
    created_at: string;
    escrow_held?: boolean;
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
    const escrowHold = orders.filter(o => o.status !== "delivered" && o.escrow_held).reduce((sum, o) => sum + Number(o.amount), 0);
    const escrowCount = orders.filter(o => o.status !== "delivered" && o.escrow_held).length;

    return (
        <div className="flex h-screen bg-white pt-20">
            {/* Sidebar */}
            <div className="w-80 bg-slate-900 border-r border-slate-800 flex-col hidden lg:flex shadow-2xl p-8 text-white">
                <div className="flex-1 space-y-2">
                    {[
                        { id: "overview", label: "Harvest Overview", icon: Home, desc: "Global Stats" },
                        { id: "listings", label: "My Inventory", icon: FileText, desc: "Market Listings" },
                        { id: "orders", label: "Sales & Escrow", icon: Package, desc: "Inbound Trades" },
                        { id: "profile", label: "Farm Profile", icon: User, desc: "Legal Identity" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full group flex items-start gap-4 p-5 rounded-[1.5rem] text-left transition-all ${activeTab === tab.id ? "bg-green-600 text-slate-900 shadow-xl scale-[1.02]" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                        >
                            <div className={`p-2 rounded-xl transition-colors ${activeTab === tab.id ? "bg-slate-900/10" : "bg-white/5 group-hover:bg-white/10"}`}>
                                <tab.icon size={22} strokeWidth={activeTab === tab.id ? 3 : 2} />
                            </div>
                            <div>
                                <p className="font-black tracking-tight">{tab.label}</p>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === tab.id ? "text-slate-900/50" : "text-slate-600"}`}>{tab.desc}</p>
                            </div>
                        </button>
                    ))}

                    <div className="pt-8 mt-8 border-t border-white/10 space-y-2">
                        <Link to="/" className="flex items-center gap-4 p-5 rounded-[1.5rem] text-slate-400 hover:bg-white/5 hover:text-green-400 transition-all font-black text-sm uppercase tracking-widest">
                            <Home size={22} strokeWidth={3} /> Return to Home
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-4 p-5 rounded-[1.5rem] text-red-500 hover:bg-red-500/10 transition-all font-black text-sm uppercase tracking-widest">
                            <LogOut size={22} strokeWidth={3} /> Terminate Hub
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar">
                <header className="bg-white/80 backdrop-blur-xl px-10 py-6 flex justify-between items-center sticky top-0 z-20 border-b border-slate-100">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 capitalize tracking-tighter italic">{activeTab} Hub</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-slate-300 hover:text-green-600 relative p-3 rounded-2xl hover:bg-slate-50 transition-all">
                            <Bell size={24} />
                            {orders.length > 0 && <span className="absolute top-2.5 right-2.5 bg-red-500 w-2.5 h-2.5 rounded-full ring-4 ring-white"></span>}
                        </button>
                        <div className="flex items-center gap-4 border-l border-slate-100 pl-6 ml-2">
                            <div className="w-14 h-14 rounded-3xl bg-green-600 text-slate-900 font-black text-2xl flex items-center justify-center shadow-premium italic">{initials}</div>
                            <div className="hidden xl:block">
                                <p className="font-black text-slate-900 leading-tight">{displayName}</p>
                                <p className="text-[10px] text-green-600 uppercase font-black tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Verified Harvester</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-10 max-w-7xl">
                    {/* Overview Tab */}
                    {(activeTab === "overview" || activeTab === "listings") && (
                        <div className="space-y-12">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-white rounded-[2.5rem] shadow-premium p-10 group hover:-translate-y-1 transition-all border border-slate-100">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="bg-green-50 p-4 rounded-2xl text-green-600 shadow-inner"><Banknote size={28} /></div>
                                        <span className="bg-green-100 text-green-900 text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-2 uppercase tracking-widest"><CheckCircle2 size={12} strokeWidth={3} /> Cleared Capital</span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Liquid Balance</p>
                                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter italic mb-2">₹{clearedBalance.toLocaleString()}</h3>
                                    <p className="text-xs font-black text-green-600 uppercase tracking-tighter italic">Secured & Distributed</p>
                                </div>
                                <div className="bg-white rounded-[2.5rem] shadow-premium p-10 group hover:-translate-y-1 transition-all border-2 border-orange-50">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="bg-orange-50 p-4 rounded-2xl text-orange-600 shadow-inner"><ShieldAlert size={28} /></div>
                                        <span className="bg-orange-100 text-orange-800 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest">Vault Hold</span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Escrow Retention</p>
                                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter italic mb-2">₹{escrowHold.toLocaleString()}</h3>
                                    <p className="text-xs font-black text-orange-500 uppercase tracking-tighter italic italic">{escrowCount} Pending Verifications</p>
                                </div>
                                <button
                                    onClick={() => { setActiveTab("listings"); setShowAddForm(true); }}
                                    className="bg-white p-10 rounded-[2.5rem] shadow-premium border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center cursor-pointer group hover:border-green-500 transition-all hover:bg-green-50/20 active:scale-95"
                                >
                                    <div className="bg-slate-50 group-hover:bg-green-500 group-hover:text-white p-6 rounded-[2rem] text-slate-200 group-hover:shadow-2xl transition-all mb-4"><Plus size={36} strokeWidth={3} /></div>
                                    <h3 className="font-black text-slate-900 text-xl tracking-tight">Expand Inventory</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Initialize New Batch</p>
                                </button>
                            </div>

                            {/* Add Product Form */}
                            {showAddForm && (
                                <div className="bg-white rounded-[3.5rem] shadow-2xl border border-green-200 p-12 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                                    <div className="flex justify-between items-center mb-10 relative z-10">
                                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">Batch <span className="text-green-600">Initialization</span></h2>
                                        <button onClick={() => { setShowAddForm(false); setImagePreview(null); setImageFile(null); }} className="text-slate-300 hover:text-red-500 bg-slate-50 p-3 rounded-2xl transition-all active:scale-90"><X size={24} strokeWidth={3} /></button>
                                    </div>
                                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                        {/* Image Upload */}
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Produce Visual Documentation</label>
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full h-56 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-all overflow-hidden relative group"
                                            >
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-[2.5rem]" />
                                                ) : (
                                                    <div className="text-center">
                                                        <div className="bg-slate-50 p-4 rounded-2xl mb-4 mx-auto w-fit group-hover:scale-110 transition-transform">
                                                            <ImageIcon size={40} className="text-slate-200 group-hover:text-green-500 transition-colors" />
                                                        </div>
                                                        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Capture Fresh Proof</p>
                                                    </div>
                                                )}
                                            </div>
                                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harvest Designation</label>
                                            <input required type="text" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                                                className="w-full border-none bg-slate-50 rounded-[1.5rem] px-8 py-5 outline-none focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all font-black text-xl shadow-inner placeholder:text-slate-200"
                                                placeholder="e.g. Heirloom Black Wheat" />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Composition Summary</label>
                                            <textarea value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                                                className="w-full border-none bg-slate-50 rounded-[1.5rem] px-8 py-5 outline-none focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all font-bold text-lg shadow-inner resize-none h-32 placeholder:text-slate-200"
                                                placeholder="Describe organic certifications, moisture levels, harvest date..." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Valuation (₹)</label>
                                            <input required type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
                                                className="w-full border-none bg-slate-50 rounded-[1.5rem] px-8 py-5 outline-none focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all font-black text-xl shadow-inner" placeholder="750" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch Magnitude</label>
                                            <input required type="number" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))}
                                                className="w-full border-none bg-slate-50 rounded-[1.5rem] px-8 py-5 outline-none focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all font-black text-xl shadow-inner" placeholder="500" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantifier</label>
                                            <select value={newProduct.unit} onChange={e => setNewProduct(p => ({ ...p, unit: e.target.value }))}
                                                className="w-full border-none bg-slate-50 rounded-[1.5rem] px-8 py-5 outline-none focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all font-black text-lg bg-white shadow-inner appearance-none cursor-pointer">
                                                <option value="kg">KILOGRAM (KG)</option>
                                                <option value="bag">GUNNY BAG</option>
                                                <option value="pkt">PACKET</option>
                                                <option value="piece">UNIT / PIECE</option>
                                                <option value="litre">LITRE</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Market Protocol</label>
                                            <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
                                                className="w-full border-none bg-slate-50 rounded-[1.5rem] px-8 py-5 outline-none focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all font-black text-lg bg-white shadow-inner appearance-none cursor-pointer">
                                                <option value="fresh">FRESH PRODUCE</option>
                                                <option value="seeds">SEED & GENETICS</option>
                                                <option value="tools">AGRI-EQUIPMENT</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 flex gap-4 pt-6">
                                            <button type="submit" disabled={submitting} className="flex-1 bg-green-600 text-slate-900 font-black px-12 py-6 rounded-[2rem] hover:bg-slate-900 hover:text-white transition-all shadow-premium flex items-center justify-center gap-3 disabled:opacity-70 active:scale-95 text-xl italic uppercase">
                                                {submitting ? <><Loader2 size={24} className="animate-spin" /> Committing to Block...</> : <><Plus size={24} strokeWidth={3} /> Commit Listing</>}
                                            </button>
                                            <button type="button" onClick={() => { setShowAddForm(false); setImagePreview(null); setImageFile(null); }} className="px-10 py-6 bg-slate-100 text-slate-400 font-black rounded-[2rem] hover:bg-red-50 hover:text-red-500 transition-all uppercase tracking-widest text-[10px]">
                                                Abort
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Orders + Listings Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Recent Orders */}
                                <div className="bg-white rounded-[3rem] shadow-premium border border-slate-50 overflow-hidden">
                                    <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                        <h2 className="font-black text-slate-900 text-2xl tracking-tighter italic uppercase">Sales Pipeline</h2>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-50">{orders.length} ACTIVE TRADES</span>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {loadingOrders && (
                                            <div className="p-16 text-center flex flex-col items-center">
                                                <div className="w-12 h-12 border-4 border-slate-100 border-t-green-600 rounded-full animate-spin mb-6"></div>
                                                <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[10px]">Polling Orders...</p>
                                            </div>
                                        )}
                                        {!loadingOrders && orders.length === 0 && (
                                            <div className="p-20 text-center">
                                                <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100">
                                                    <Package size={32} className="text-slate-200" />
                                                </div>
                                                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Zero Inbound Signal</p>
                                            </div>
                                        )}
                                        {orders.slice(0, 5).map(order => (
                                            <div key={order.id} className="p-10 hover:bg-slate-50/50 transition-all group relative">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="space-y-2">
                                                        <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded uppercase italic">TRD #{(order.id || "").substring(0, 8).toUpperCase()}</span>
                                                        <h4 className="font-black text-slate-900 text-xl tracking-tighter italic group-hover:text-green-600 transition-colors uppercase">{order.product_name} <span className="text-slate-300 font-bold ml-1 italic opacity-50">× {order.quantity}</span></h4>
                                                    </div>
                                                    <p className="font-black text-slate-900 text-2xl tracking-tighter italic">₹{Number(order.amount).toLocaleString()}</p>
                                                </div>
                                                <div className="flex justify-between items-center mt-6">
                                                    <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm ${order.status === "pending" ? "bg-orange-100 text-orange-800" : order.status === "shipped" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                                                        {order.status}
                                                    </span>
                                                    {order.status === "pending" && (
                                                        <button onClick={() => handleMarkShipped(order.id)} className="flex items-center gap-2 text-[10px] font-black text-white bg-slate-900 px-5 py-2.5 rounded-2xl hover:bg-green-600 transition-all active:scale-95 shadow-lg uppercase tracking-widest italic group-hover:bg-green-600">
                                                            <Truck size={14} strokeWidth={3} /> Ship Now
                                                        </button>
                                                    )}
                                                    {order.status === "delivered" && (
                                                        <span className="flex items-center gap-2 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 uppercase tracking-widest italic">
                                                            <CheckCircle2 size={14} strokeWidth={3} /> Capital Released
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Active Listings */}
                                <div className="bg-white rounded-[3rem] shadow-premium border border-slate-50 overflow-hidden">
                                    <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-green-900 text-white">
                                        <h2 className="font-black text-2xl tracking-tighter italic uppercase">Active Inventory</h2>
                                        <button onClick={() => setShowAddForm(true)} className="bg-white/10 hover:bg-white text-white hover:text-green-900 px-4 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-white/20">
                                            <Plus size={14} strokeWidth={3} /> Expand
                                        </button>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {loadingListings && (
                                            <div className="p-16 text-center flex flex-col items-center">
                                                <div className="w-12 h-12 border-4 border-slate-100 border-t-green-600 rounded-full animate-spin mb-6"></div>
                                                <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[10px]">Auditing Inventory...</p>
                                            </div>
                                        )}
                                        {!loadingListings && listings.length === 0 && (
                                            <div className="p-20 text-center">
                                                <Leaf size={48} className="mx-auto mb-6 text-slate-100" />
                                                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Silo Empty</p>
                                            </div>
                                        )}
                                        {listings.map(product => (
                                            <div key={product.id} className="p-8 flex items-center gap-6 hover:bg-slate-50 transition-all group">
                                                <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 border border-slate-100 overflow-hidden relative shadow-inner group-hover:scale-105 transition-transform">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Leaf size={32} className="text-slate-200" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-black text-slate-900 text-xl tracking-tighter italic uppercase group-hover:text-green-600 transition-colors">{product.name}</h4>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-lg font-black text-slate-900 italic">₹{product.price}<span className="text-[10px] text-slate-400 not-italic ml-1">/{product.unit}</span></span>
                                                        <span className={`text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-sm ${product.stock > 20 ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                                                            {product.stock} Units Stocked
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* All Orders Tab (Extended) */}
                    {activeTab === "orders" && (
                        <div className="bg-white rounded-[3.5rem] shadow-premium border border-slate-50 overflow-hidden">
                             <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                <h2 className="font-black text-slate-900 text-4xl tracking-tighter italic uppercase">Master Order Log</h2>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-6">
                                    <div className="flex flex-col items-end">
                                        <span className="text-slate-900 text-xl font-black italic tracking-tighter leading-none">₹{clearedBalance.toLocaleString()}</span>
                                        <span className="opacity-50 mt-1">TOTAL SALES</span>
                                    </div>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {loadingOrders && (
                                     <div className="p-32 text-center flex flex-col items-center">
                                        <div className="w-16 h-16 border-4 border-slate-100 border-t-green-600 rounded-full animate-spin mb-8"></div>
                                        <p className="text-slate-300 font-black uppercase tracking-[0.5em] text-[10px]">Deep Polling Hub...</p>
                                    </div>
                                )}
                                {!loadingOrders && orders.length === 0 && (
                                    <div className="p-40 text-center">
                                        <Package size={64} className="text-slate-100 mx-auto mb-10" />
                                        <p className="text-slate-900 font-black text-2xl tracking-tight mb-2">Zero Trade Signal</p>
                                        <p className="text-slate-400 font-bold italic">Collaborate with buyers to initialize transactions.</p>
                                    </div>
                                )}
                                {orders.map(order => (
                                    <div key={order.id} className="p-12 hover:bg-slate-50/80 transition-all group">
                                        <div className="flex flex-col xl:flex-row justify-between items-start gap-10">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-black bg-slate-900 text-white px-4 py-1 rounded-xl uppercase italic tracking-tighter">ORD #{(order.id || "").substring(0, 12).toUpperCase()}</span>
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{new Date(order.created_at).toLocaleString()}</span>
                                                </div>
                                                <h4 className="font-black text-slate-900 text-4xl tracking-tighter italic group-hover:text-green-600 transition-colors uppercase leading-none">{order.product_name} <span className="text-slate-200 font-bold ml-2 italic text-3xl opacity-50 tracking-normal">× {order.quantity}</span></h4>
                                                <div className="flex flex-wrap gap-4 mt-6">
                                                    <span className={`px-6 py-2 text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-sm ${order.status === "pending" ? "bg-orange-100 text-orange-800" : order.status === "shipped" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                                                        Current Phase: {order.status}
                                                    </span>
                                                    {order.status !== "delivered" && order.escrow_held && (
                                                        <span className="flex items-center gap-3 text-[10px] font-black text-orange-600 bg-orange-50 px-6 py-2 rounded-full border border-orange-100 uppercase tracking-widest italic shadow-sm">
                                                            <ShieldAlert size={16} strokeWidth={3} /> Escrow Vault Secured
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-left xl:text-right w-full xl:w-auto mt-4 xl:mt-0">
                                                <p className="font-black text-slate-900 text-6xl tracking-tighter italic mb-6">₹{Number(order.amount).toLocaleString()}</p>
                                                {order.status === "pending" && (
                                                    <button 
                                                        onClick={() => handleMarkShipped(order.id)} 
                                                        className="w-full xl:w-auto flex items-center justify-center gap-4 text-xl font-black text-slate-900 bg-green-500 px-12 py-6 rounded-[2rem] hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-2xl uppercase tracking-tighter italic"
                                                    >
                                                        <Truck size={28} strokeWidth={3} /> Initialize Delivery Phase
                                                    </button>
                                                )}
                                                {order.status === "delivered" && (
                                                     <div className="flex items-center xl:justify-end gap-3 text-green-600 font-black uppercase tracking-[0.2em] text-sm italic">
                                                        <div className="bg-green-100 p-2 rounded-xl"><CheckCircle2 size={24} strokeWidth={3} /></div> Capital Successfully Disbursed
                                                     </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "profile" && (
                        <div className="max-w-3xl">
                             <div className="bg-white rounded-[4rem] shadow-premium border border-slate-50 p-16 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-green-600 to-slate-900"></div>
                                <h2 className="text-4xl font-black text-slate-900 mb-12 tracking-tight italic">Harvester <span className="text-green-600">Validation.</span></h2>

                                <form onSubmit={handleUpdateProfile} className="space-y-12">
                                    <div className="space-y-10">
                                        <div className="flex items-center gap-12 mb-12 bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
                                            <div className="w-32 h-32 rounded-[2.5rem] bg-green-600 text-slate-900 font-black text-5xl flex items-center justify-center shadow-premium italic border-8 border-white">
                                                {initials}
                                            </div>
                                            <div className="space-y-2">
                                                <p className="font-black text-slate-900 text-4xl tracking-tighter italic mb-1 uppercase">{displayName}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] bg-white px-4 py-2 rounded-xl border border-slate-100 inline-block">{user?.email}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-4 ml-4">
                                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div> Legal Harvest Alias
                                            </label>
                                            <input
                                                type="text"
                                                value={profileName}
                                                onChange={(e) => setProfileName(e.target.value)}
                                                className="w-full p-8 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-green-500/10 focus:bg-white outline-none font-black text-2xl text-slate-900 transition-all shadow-inner"
                                                required
                                            />
                                        </div>

                                        <div className="p-8 bg-green-900 text-white rounded-[2rem] flex items-center gap-6 shadow-2xl relative group overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-all duration-700"></div>
                                            <div className="bg-white/10 p-4 rounded-2xl text-green-400 shadow-inner">
                                                <ShieldCheck size={36} strokeWidth={3} />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black italic tracking-tight uppercase">Verified Harvester Node</h4>
                                                <p className="text-[10px] font-bold text-green-400 uppercase tracking-[0.3em] mt-1 italic">Protocol Access Level: MAXIMUM</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full bg-slate-900 text-white font-black py-8 rounded-[2.5rem] shadow-premium hover:bg-green-600 hover:text-slate-900 transition-all flex items-center justify-center gap-6 disabled:opacity-50 active:scale-[0.98] text-2xl uppercase tracking-tighter italic group"
                                    >
                                        {isSaving ? <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={32} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />}
                                        {isSaving ? "Synchronizing Chain..." : "Update Master Record"}
                                    </button>
                                </form>

                                <div className="mt-20 pt-16 border-t border-slate-50 flex items-center justify-between px-4">
                                    <div className="space-y-1">
                                        <p className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] italic leading-none">Termination Protocol</p>
                                        <p className="text-slate-300 font-bold text-[10px] uppercase tracking-tighter">Sever hub connection</p>
                                    </div>
                                    <button onClick={handleLogout} className="bg-red-50 text-red-600 px-10 py-4 font-black text-[10px] rounded-2xl hover:bg-red-600 hover:text-white transition-all uppercase tracking-[0.3em] shadow-sm italic active:scale-90">
                                        Disconnect
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
