import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Plus, Banknote, ShieldAlert, CheckCircle2, FileText, Bell, Leaf, LogOut, Home, X, ImageIcon, Loader2, Truck, User, Save, ShieldCheck } from "lucide-react";
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
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-6"></div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Accessing Vendor Terminal...</p>
        </div>
    );

    const displayName = user?.displayName || user?.email?.split("@")[0] || "Vendor";
    const initials = displayName.charAt(0).toUpperCase();
    const clearedBalance = orders.filter(o => o.status === "delivered").reduce((sum, o) => sum + Number(o.amount), 0);
    const escrowHold = orders.filter(o => o.status !== "delivered" && o.escrow_held).reduce((sum, o) => sum + Number(o.amount), 0);
    const escrowCount = orders.filter(o => o.status !== "delivered" && o.escrow_held).length;

    return (
        <div className="flex h-screen bg-slate-950 pt-20">
            {/* Sidebar */}
            <div className="w-80 bg-slate-900 border-r border-slate-800 flex-col hidden lg:flex p-8">
                <div className="flex-1 space-y-2">
                    {[
                        { id: "overview", label: "Global Ops", icon: Home, desc: "Command Center" },
                        { id: "listings", label: "Asset Catalog", icon: FileText, desc: "Market Exposure" },
                        { id: "orders", label: "Trade Registry", icon: Package, desc: "Escrow Status" },
                        { id: "profile", label: "Entity Profile", icon: User, desc: "Master Identity" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full group flex items-start gap-4 p-5 rounded-[1.5rem] text-left transition-all ${activeTab === tab.id ? "bg-white text-slate-950 shadow-2xl scale-[1.02]" : "text-slate-500 hover:bg-white/5 hover:text-white"}`}
                        >
                            <div className={`p-2 rounded-xl transition-colors ${activeTab === tab.id ? "bg-slate-950/10" : "bg-white/5 group-hover:bg-white/10"}`}>
                                <tab.icon size={22} strokeWidth={activeTab === tab.id ? 3 : 2} />
                            </div>
                            <div>
                                <p className="font-black tracking-tight">{tab.label}</p>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === tab.id ? "text-slate-900/50" : "text-slate-700"}`}>{tab.desc}</p>
                            </div>
                        </button>
                    ))}

                    <div className="pt-8 mt-8 border-t border-white/5 space-y-2">
                        <Link to="/" className="flex items-center gap-4 p-5 rounded-[1.5rem] text-slate-500 hover:bg-white/5 hover:text-white transition-all font-black text-sm uppercase tracking-widest">
                            <Home size={22} strokeWidth={3} /> Return to Home
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-4 p-5 rounded-[1.5rem] text-red-900/50 hover:bg-red-950 hover:text-red-500 transition-all font-black text-sm uppercase tracking-widest">
                            <LogOut size={22} strokeWidth={3} /> Shutdown Session
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar">
                <header className="bg-white/90 backdrop-blur-2xl px-12 py-8 flex justify-between items-center sticky top-0 z-20 border-b border-slate-100">
                    <div>
                        <h1 className="text-4xl font-black text-slate-950 capitalize tracking-tighter italic leading-none">{activeTab}</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="text-slate-300 hover:text-slate-950 relative p-4 rounded-3xl hover:bg-slate-50 transition-all">
                            <Bell size={28} />
                            {orders.length > 0 && <span className="absolute top-3.5 right-3.5 bg-blue-600 w-3 h-3 rounded-full ring-4 ring-white animate-pulse"></span>}
                        </button>
                        <div className="flex items-center gap-6 border-l border-slate-100 pl-8 ml-2">
                            <div className="w-16 h-16 rounded-[2rem] bg-slate-950 text-white font-black text-3xl flex items-center justify-center shadow-2xl italic border-4 border-white">{initials}</div>
                            <div className="hidden xl:block">
                                <p className="font-black text-slate-950 text-lg leading-tight">{displayName}</p>
                                <p className="text-[10px] text-blue-600 uppercase font-black tracking-[0.3em] flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div> Verified Vendor</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-12 max-w-7xl">
                    {(activeTab === "overview" || activeTab === "listings") && (
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <div className="bg-white rounded-[3rem] shadow-premium p-12 group hover:-translate-y-2 transition-all border border-slate-100">
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="bg-slate-50 p-5 rounded-[1.5rem] text-slate-950 shadow-inner group-hover:bg-slate-950 group-hover:text-white transition-all"><Banknote size={32} /></div>
                                        <span className="bg-slate-950 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-xl">Liquid Assets</span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 block">Available Disbursement</p>
                                    <h3 className="text-6xl font-black text-slate-950 tracking-tighter italic mb-4">₹{clearedBalance.toLocaleString()}</h3>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic"><CheckCircle2 size={14} /> Ready for Wire Transfer</p>
                                </div>
                                <div className="bg-white rounded-[3rem] shadow-premium p-12 group hover:-translate-y-2 transition-all border-2 border-blue-50">
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="bg-blue-50 p-5 rounded-[1.5rem] text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all"><ShieldAlert size={32} /></div>
                                        <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-xl">Escrow Lock</span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 block">Locked Circulation</p>
                                    <h3 className="text-6xl font-black text-slate-950 tracking-tighter italic mb-4">₹{escrowHold.toLocaleString()}</h3>
                                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest italic">{escrowCount} Trades in Validation</p>
                                </div>
                                <button
                                    onClick={() => { setActiveTab("listings"); setShowAddForm(true); }}
                                    className="bg-slate-950 p-12 rounded-[3rem] text-white shadow-2xl flex flex-col items-center justify-center text-center cursor-pointer group hover:bg-white hover:text-slate-950 hover:shadow-premium transition-all active:scale-95 border-4 border-slate-900"
                                >
                                    <div className="bg-white/10 group-hover:bg-slate-950 group-hover:text-white p-6 rounded-[2rem] transition-all mb-6 border border-white/5"><Plus size={44} strokeWidth={3} /></div>
                                    <h3 className="font-black text-2xl tracking-tighter italic uppercase">Deploy New Asset</h3>
                                    <p className="text-[10px] font-black text-white/30 group-hover:text-slate-400 uppercase tracking-[0.3em] mt-2">Initialize Product Block</p>
                                </button>
                            </div>

                            {showAddForm && (
                                <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 p-16 relative overflow-hidden group/form">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-slate-950 rounded-full -mr-48 -mt-48 blur-3xl opacity-5 group-hover/form:opacity-10 transition-opacity duration-1000"></div>
                                    <div className="flex justify-between items-center mb-16 relative z-10">
                                        <h2 className="text-5xl font-black text-slate-950 tracking-tighter italic">Asset <span className="text-slate-400">Deployment.</span></h2>
                                        <button onClick={() => { setShowAddForm(false); setImagePreview(null); setImageFile(null); }} className="text-slate-300 hover:text-slate-950 bg-slate-50 p-4 rounded-[1.5rem] transition-all"><X size={32} strokeWidth={3} /></button>
                                    </div>
                                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                                        <div className="md:col-span-2 space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2">Visual Documentation</label>
                                            <div onClick={() => fileInputRef.current?.click()} className="w-full h-80 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:border-slate-950 hover:bg-slate-50 transition-all overflow-hidden relative group">
                                                {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-[3rem]" /> : <><div className="bg-slate-50 p-6 rounded-[1.5rem] mb-6 group-hover:scale-110 transition-transform"><ImageIcon size={56} className="text-slate-200 group-hover:text-slate-950 transition-colors" /></div><p className="font-black text-slate-400 uppercase tracking-widest text-sm">Upload High-Res Schematic</p></>}
                                            </div>
                                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </div>
                                        <div className="md:col-span-2 space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2">Asset Paradigm Name</label>
                                            <input required type="text" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} className="w-full border-none bg-slate-50 rounded-[2rem] px-10 py-7 outline-none focus:ring-8 focus:ring-slate-950/5 focus:bg-white transition-all font-black text-3xl shadow-inner placeholder:text-slate-200" placeholder="e.g. Precision Harvesting Matrix v2" />
                                        </div>
                                        <div className="md:col-span-2 space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2">Technical Specifications</label>
                                            <textarea value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} className="w-full border-none bg-slate-50 rounded-[2rem] px-10 py-7 outline-none focus:ring-8 focus:ring-slate-950/5 focus:bg-white transition-all font-bold text-xl shadow-inner resize-none h-44 placeholder:text-slate-200" placeholder="Break down performance metrics, compatibility, and certifications..." />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2">Unit Value (₹)</label>
                                            <input required type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} className="w-full border-none bg-slate-50 rounded-[2rem] px-10 py-7 outline-none focus:ring-8 focus:ring-slate-950/5 focus:bg-white transition-all font-black text-3xl shadow-inner" placeholder="12500" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2">Inventory Volume</label>
                                            <input required type="number" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))} className="w-full border-none bg-slate-50 rounded-[2rem] px-10 py-7 outline-none focus:ring-8 focus:ring-slate-950/5 focus:bg-white transition-all font-black text-3xl shadow-inner" placeholder="15" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2">Metric Quantifier</label>
                                            <select value={newProduct.unit} onChange={e => setNewProduct(p => ({ ...p, unit: e.target.value }))} className="w-full border-none bg-slate-50 rounded-[2rem] px-10 py-7 outline-none focus:ring-8 focus:ring-slate-950/5 focus:bg-white transition-all font-black text-xl shadow-inner appearance-none cursor-pointer">
                                                <option value="unit">INDIVIDUAL UNIT</option>
                                                <option value="kg">KILOGRAM (KG)</option>
                                                <option value="bag">MASTER BAG</option>
                                                <option value="litre">LITRE</option>
                                                <option value="pkt">PACKET</option>
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2">Sector Category</label>
                                            <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} className="w-full border-none bg-slate-50 rounded-[2rem] px-10 py-7 outline-none focus:ring-8 focus:ring-slate-950/5 focus:bg-white transition-all font-black text-xl shadow-inner appearance-none cursor-pointer">
                                                <option value="tools">AGRI-MACHINERY</option>
                                                <option value="seeds">GENETIC ASSETS</option>
                                                <option value="fresh">PRIME PRODUCE</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 flex gap-6 pt-10">
                                            <button type="submit" disabled={submitting} className="flex-1 bg-slate-950 text-white font-black px-16 py-8 rounded-[2.5rem] hover:bg-blue-600 transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-70 active:scale-[0.98] text-2xl uppercase tracking-tighter italic group">
                                                {submitting ? <><Loader2 size={32} className="animate-spin" /> Deep Porting...</> : <><Plus size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> Deploy Listing</>}
                                            </button>
                                            <button type="button" onClick={() => { setShowAddForm(false); setImagePreview(null); setImageFile(null); }} className="px-12 py-8 bg-slate-50 text-slate-400 font-black rounded-[2.5rem] hover:bg-red-50 hover:text-red-500 transition-all uppercase tracking-[0.3em] text-xs">Abort Operation</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="bg-white rounded-[3.5rem] shadow-premium border border-slate-50 overflow-hidden">
                                    <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-slate-950 text-white">
                                        <h2 className="font-black text-2xl tracking-tighter italic uppercase">Transaction Interface</h2>
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] bg-white/5 px-4 py-2 rounded-xl border border-white/10">{orders.length} LOGS FOUND</span>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {loadingOrders && <div className="p-20 text-center"><div className="w-12 h-12 border-4 border-slate-100 border-t-slate-950 rounded-full animate-spin mx-auto mb-6"></div><p className="text-slate-300 font-black uppercase tracking-[0.4em] text-[10px]">Filtering Chain Logs...</p></div>}
                                        {!loadingOrders && orders.length === 0 && <div className="p-24 text-center"><Package size={48} className="text-slate-100 mx-auto mb-8" /><p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Inbound Trade Silence</p></div>}
                                        {orders.slice(0, 6).map(order => (
                                            <div key={order.id} className="p-12 hover:bg-slate-50/50 transition-all group relative">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="space-y-3">
                                                        <span className="text-[10px] font-black bg-slate-950 text-white px-4 py-1.5 rounded-xl uppercase italic tracking-tighter shadow-lg">XFER #{(order.id || "").substring(0, 10).toUpperCase()}</span>
                                                        <h4 className="font-black text-slate-950 text-2xl tracking-tighter italic group-hover:text-blue-600 transition-colors uppercase leading-none">{order.product_name} <span className="text-slate-200 font-bold ml-2 italic text-xl">× {order.quantity}</span></h4>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic">{new Date(order.created_at).toLocaleString()}</p>
                                                    </div>
                                                    <p className="font-black text-slate-950 text-4xl tracking-tighter italic">₹{Number(order.amount).toLocaleString()}</p>
                                                </div>
                                                <div className="flex justify-between items-center mt-10">
                                                    <span className={`px-6 py-2 text-[10px] font-black rounded-full uppercase tracking-[0.3em] shadow-sm ${order.status === "pending" ? "bg-orange-900 text-orange-100" : order.status === "shipped" ? "bg-blue-900 text-blue-100" : "bg-green-900 text-green-100"}`}>{order.status}</span>
                                                    {order.status === "pending" && (
                                                        <button onClick={() => handleMarkShipped(order.id)} className="flex items-center gap-3 text-[10px] font-black text-white bg-slate-950 px-8 py-3.5 rounded-[1.5rem] hover:bg-blue-600 transition-all active:scale-95 shadow-2xl uppercase tracking-widest italic group-hover:shadow-blue-500/20"><Truck size={18} strokeWidth={3} /> Commit Logistic</button>
                                                    )}
                                                    {order.status === "delivered" && <div className="flex items-center gap-3 text-green-600 font-black uppercase tracking-widest text-[10px] italic bg-green-50 px-5 py-2.5 rounded-2xl border border-green-100"><CheckCircle2 size={16} strokeWidth={3} /> Capital Disbursed</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-[3.5rem] shadow-premium border border-slate-50 overflow-hidden">
                                     <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                        <h2 className="font-black text-slate-900 text-2xl tracking-tighter italic uppercase">Asset Portfolio</h2>
                                        <button onClick={() => setShowAddForm(true)} className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] hover:text-slate-950 flex items-center gap-3 transition-colors bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm"><Plus size={16} strokeWidth={3} /> Add Global Asset</button>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {loadingListings && <div className="p-20 text-center"><div className="w-12 h-12 border-4 border-slate-100 border-t-slate-950 rounded-full animate-spin mx-auto mb-6"></div><p className="text-slate-300 font-black uppercase tracking-[0.4em] text-[10px]">Indexing Catalog...</p></div>}
                                        {!loadingListings && listings.length === 0 && (
                                            <div className="p-24 text-center">
                                                <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner"><Leaf size={48} className="text-slate-100" /></div>
                                                <p className="text-slate-950 font-black text-xl tracking-tight mb-2">Inventory Void Detected</p>
                                                <button onClick={() => setShowAddForm(true)} className="mt-4 text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] hover:underline underline-offset-8 italic">Initialize First Asset Injection →</button>
                                            </div>
                                        )}
                                        {listings.map(product => (
                                            <div key={product.id} className="p-10 flex items-center gap-8 hover:bg-slate-50 transition-all group">
                                                <div className="w-24 h-24 bg-slate-950 rounded-[2rem] flex items-center justify-center flex-shrink-0 border-4 border-white overflow-hidden relative shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                                    {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <Leaf size={40} className="text-white/20" />}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <h4 className="font-black text-slate-950 text-2xl tracking-tighter italic uppercase group-hover:text-blue-600 transition-colors">{product.name}</h4>
                                                    <div className="flex items-center gap-6">
                                                        <span className="text-xl font-black text-slate-950 italic">₹{product.price}<span className="text-[10px] text-slate-300 not-italic ml-2 uppercase font-mono">/{product.unit}</span></span>
                                                        <span className={`text-[10px] font-black px-5 py-1.5 rounded-xl uppercase tracking-widest shadow-sm ${product.stock > 10 ? "bg-slate-950 text-white" : "bg-red-900 text-red-100"}`}>{product.stock} Units Reservoir</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "orders" && (
                         <div className="bg-white rounded-[4rem] shadow-premium border border-slate-50 overflow-hidden">
                            <div className="p-16 border-b border-slate-100 flex justify-between items-center bg-slate-950 text-white">
                                <h2 className="font-black text-5xl tracking-tighter italic uppercase">Trade Archive</h2>
                                <div className="text-right">
                                    <p className="text-4xl font-black italic tracking-tighter leading-none mb-1">₹{clearedBalance.toLocaleString()}</p>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Aggregated Revenue</p>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {loadingOrders && <div className="p-40 text-center flex flex-col items-center"><div className="w-16 h-16 border-4 border-slate-100 border-t-slate-950 rounded-full animate-spin mb-10"></div><p className="text-slate-200 font-black uppercase tracking-[0.5em] text-xs">Accessing Offline Ledger...</p></div>}
                                {!loadingOrders && orders.length === 0 && <div className="p-48 text-center"><Package size={80} className="text-slate-50 mx-auto mb-12 opacity-50" /><p className="text-slate-950 font-black text-3xl tracking-tight italic">Zero Trade Velocity</p></div>}
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
                                                    <span className={`px-8 py-3 text-[10px] font-black rounded-2xl uppercase tracking-[0.4em] shadow-lg border border-white/10 ${order.status === "pending" ? "bg-orange-950 text-orange-200" : order.status === "shipped" ? "bg-blue-900 text-blue-200" : "bg-green-900 text-green-200"}`}>PHASE: {order.status}</span>
                                                </div>
                                            </div>
                                            <div className="text-left xl:text-right w-full xl:w-auto mt-6 xl:mt-0">
                                                <p className="font-black text-slate-950 text-7xl tracking-tighter italic mb-10">₹{Number(order.amount).toLocaleString()}</p>
                                                {order.status === "pending" && (
                                                    <button onClick={() => handleMarkShipped(order.id)} className="w-full xl:w-auto flex items-center justify-center gap-6 text-2xl font-black text-white bg-slate-950 px-16 py-8 rounded-[2.5rem] hover:bg-blue-600 transition-all active:scale-95 shadow-premium uppercase tracking-tighter italic"><Truck size={36} strokeWidth={3} /> Execute Logistic Phase</button>
                                                )}
                                                {order.status === "delivered" && <div className="flex items-center xl:justify-end gap-4 text-green-600 font-black uppercase tracking-[0.4em] text-lg italic"><div className="bg-green-100 p-3 rounded-[1.5rem] border border-green-200 shadow-inner flex items-center justify-center"><CheckCircle2 size={32} strokeWidth={3} /></div> Settlement Complete</div>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "profile" && (
                        <div className="max-w-3xl">
                             <div className="bg-white rounded-[4rem] shadow-premium border border-slate-50 p-20 relative overflow-hidden group/profile">
                                <div className="absolute top-0 left-0 w-full h-4 bg-slate-950"></div>
                                <h2 className="text-5xl font-black text-slate-950 mb-16 tracking-tight italic">Entity <span className="text-slate-300">Validation.</span></h2>

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
                                                <div className="w-3 h-3 rounded-full bg-slate-950 shadow-[0_0_15px_rgba(0,0,0,0.1)]"></div> Corporate Master Designation
                                            </label>
                                            <input
                                                type="text"
                                                value={profileName}
                                                onChange={(e) => setProfileName(e.target.value)}
                                                className="w-full p-10 bg-slate-50 border-none rounded-[2.5rem] focus:ring-8 focus:ring-slate-950/5 focus:bg-white outline-none font-black text-3xl text-slate-950 transition-all shadow-inner font-mono"
                                                required
                                            />
                                        </div>

                                        <div className="p-10 bg-slate-950 text-white rounded-[2.5rem] flex items-center gap-10 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full -mb-24 -mr-24 blur-3xl"></div>
                                            <div className="bg-white/10 p-6 rounded-[1.5rem] text-blue-400 shadow-inner border border-white/5">
                                                <ShieldCheck size={44} strokeWidth={3} />
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black italic tracking-tight uppercase mb-1">Prime Business Protocol</h4>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] italic">Level: Verified Tier-1 Participant</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full bg-slate-950 text-white font-black py-10 rounded-[3rem] shadow-premium hover:bg-blue-600 transition-all flex items-center justify-center gap-8 disabled:opacity-50 active:scale-[0.98] text-3xl uppercase tracking-tighter italic group"
                                    >
                                        {isSaving ? <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={40} strokeWidth={3} className="group-hover:scale-110 transition-transform" />}
                                        {isSaving ? "Synchronizing Data..." : "Update Master Schema"}
                                    </button>
                                </form>

                                <div className="mt-24 pt-20 border-t border-slate-50 flex items-center justify-between px-6">
                                    <div className="space-y-2">
                                        <p className="text-slate-950 font-black text-xs uppercase tracking-[0.6em] italic leading-none">Global Session Termination</p>
                                        <p className="text-slate-300 font-bold text-[10px] uppercase tracking-tighter italic">Disconnect from decentralized marketplace hub</p>
                                    </div>
                                    <button onClick={handleLogout} className="bg-slate-50 text-slate-950 px-12 py-5 font-black text-xs rounded-2x; hover:bg-slate-950 hover:text-white transition-all uppercase tracking-[0.4em] shadow-sm italic active:scale-90 border border-slate-100">
                                        Logoff
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
