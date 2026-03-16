import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    ShoppingBag, ShieldCheck, CheckCircle2, 
    Package, LogOut, Home, User, Bell, 
    Save, ShoppingCart, Clock, Activity, ArrowUpRight, Box, ShieldAlert
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
    pending: { label: "Awaiting Logistics", color: "bg-amber-100 text-amber-800", icon: <Clock size={14} /> },
    in_escrow: { label: "Farm-Ease Secure", color: "bg-emerald-100 text-emerald-800", icon: <ShieldCheck size={14} /> },
    shipped: { label: "In Transit", color: "bg-emerald-100 text-emerald-800", icon: <Package size={14} /> },
    delivered: { label: "Finalized", color: "bg-emerald-100 text-emerald-800", icon: <CheckCircle2 size={14} /> },
    cancelled: { label: "Cancelled", color: "bg-red-500 text-red-900", icon: <ShieldAlert size={14} /> }
};

interface DashboardOrder {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;

    amount?: number;
    payment_secured?: boolean;
    product_name?: string;
    quantity?: number;
    seller_id?: string;
}

export default function Dashboard() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [orders, setOrders] = useState<DashboardOrder[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [profileName, setProfileName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!loading && !user) navigate("/login");
        if (user) setProfileName(user.displayName || user.email?.split("@")[0] || "");
    }, [user, loading, navigate]);

    const fetchOrders = useCallback(async () => {
        if (!user) return;
        setLoadingOrders(true);
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
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchOrders();
            const channel = supabase
                .channel('public:buyer_orders')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'orders',
                    filter: `buyer_id=eq.${user.uid}` 
                }, () => fetchOrders())
                .subscribe();
            return () => { supabase.removeChannel(channel); };
        }
    }, [user, fetchOrders]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    const handleMarkDelivered = async (orderId: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: 'delivered', payment_secured: false })
            .eq('id', orderId);
        if (!error) setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'delivered', payment_secured: false } : o));
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

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin mb-8"></div>
            <p className="text-slate-300 font-black uppercase tracking-[0.5em] text-[10px]">Accessing Buyer Terminal...</p>
        </div>
    );

    const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
    const initials = displayName.charAt(0).toUpperCase();

    const totalOrders = orders.length;
    const securedAmount = orders.filter(o => o.status !== 'delivered' && o.payment_secured).reduce((sum, o) => sum + Number(o.amount), 0);
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.amount), 0);

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
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Buyer Account Node</p>
                    </div>

                    {[
                        { id: "overview", label: "My Activity", icon: Home, desc: "Order Summary" },
                        { id: "orders", label: "Purchase History", icon: Package, desc: "Track Orders" },
                        { id: "profile", label: "Account Info", icon: User, desc: "Personal Profile" },
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
                        <Link to="/market" className="flex items-center gap-4 p-5 rounded-[2rem] text-slate-500 hover:bg-white/5 hover:text-emerald-400 transition-all font-black text-[10px] uppercase tracking-[0.3em] italic">
                            <ShoppingBag size={20} strokeWidth={3} /> Return to Market
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
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2 italic">Buyer Command Center</p>
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
                                    <Activity size={10} className="animate-pulse" /> Verified Buyer
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-12 max-w-[1600px] mx-auto pb-32">
                    <AnimatePresence mode="wait">
                        {activeTab === "overview" && (
                            <motion.div 
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-16"
                            >
                                {/* Stats Matrix */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    <div className="bg-white rounded-[4rem] shadow-premium p-12 group hover:-translate-y-2 transition-all duration-500 border border-white relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-slate-950"></div>
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="bg-slate-50 p-6 rounded-[2rem] text-slate-950 shadow-inner group-hover:bg-slate-950 group-hover:text-white transition-all duration-500">
                                                <Package size={36} />
                                            </div>
                                            <span className="bg-slate-950 text-white text-[10px] font-black px-5 py-2.5 rounded-2xl uppercase tracking-widest shadow-xl italic">Total Orders</span>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 block italic">Verified Purchases</p>
                                        <h3 className="text-7xl font-black text-slate-950 tracking-tighter italic mb-4">{totalOrders}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic bg-slate-50 w-fit px-5 py-2 rounded-xl border border-slate-100">
                                            Platform Participant
                                        </p>
                                    </div>

                                    <div className="bg-white rounded-[4rem] shadow-premium p-12 group hover:-translate-y-2 transition-all duration-500 border border-white relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600"></div>
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="bg-emerald-50 p-6 rounded-[2rem] text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                                                <ShieldCheck size={36} />
                                            </div>
                                            <span className="bg-emerald-600 text-white text-[10px] font-black px-5 py-2.5 rounded-2xl uppercase tracking-widest shadow-xl italic">Farm-Ease Secure</span>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 block italic">Currently Safeguarded</p>
                                        <h3 className="text-7xl font-black text-slate-950 tracking-tighter italic mb-4">₹{securedAmount.toLocaleString()}</h3>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic bg-emerald-50 w-fit px-5 py-2 rounded-xl border border-emerald-100">
                                            Protected Capital
                                        </p>
                                    </div>

                                    <div className="bg-white rounded-[4rem] shadow-premium p-12 group hover:-translate-y-2 transition-all duration-500 border border-white relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="bg-emerald-50 p-6 rounded-[2rem] text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                                                <ArrowUpRight size={36} />
                                            </div>
                                            <span className="bg-emerald-600 text-white text-[10px] font-black px-5 py-2.5 rounded-2xl uppercase tracking-widest shadow-xl italic">Total Invested</span>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 block italic">Cumulative Expenditure</p>
                                        <h3 className="text-7xl font-black text-slate-950 tracking-tighter italic mb-4">₹{totalSpent.toLocaleString()}</h3>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic bg-emerald-50 w-fit px-5 py-2 rounded-xl border border-emerald-100">
                                            Global Spend
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-[5rem] p-20 flex flex-col xl:flex-row items-center justify-between gap-16 text-white shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full -mr-64 -mt-64 blur-[120px] group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                                    <div className="relative z-10 text-center xl:text-left space-y-6">
                                        <h3 className="text-7xl font-black tracking-tight leading-none italic uppercase italic">Secure <span className="text-emerald-500">Harvest.</span></h3>
                                        <p className="text-slate-400 max-w-2xl text-2xl font-bold italic leading-relaxed">Experience a direct link to the finest agricultural produce, protected by the Farm-Ease secure transaction system.</p>
                                    </div>
                                    <Link to="/market" className="relative z-10 bg-emerald-500 text-slate-950 font-black px-16 py-10 rounded-[3rem] shadow-2xl hover:bg-white transition-all flex items-center gap-6 whitespace-nowrap active:scale-95 group/btn text-3xl italic uppercase tracking-tighter">
                                        Explore Market <ShoppingCart size={40} strokeWidth={3} className="group-hover/btn:rotate-12 transition-transform" />
                                    </Link>
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
                                    <h2 className="font-black text-5xl tracking-tighter italic uppercase">Transaction Manifest</h2>
                                    <div className="text-right">
                                        <p className="text-4xl font-black italic tracking-tighter leading-none mb-1">{orders.length}</p>
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Total Activity Logs</p>
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {loadingOrders && <div className="p-40 text-center flex flex-col items-center"><div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin mb-10"></div><p className="text-slate-200 font-black uppercase tracking-[0.5em] text-xs">Accessing Vault Ledger...</p></div>}
                                    {!loadingOrders && orders.length === 0 && (
                                        <div className="p-48 text-center">
                                            <div className="bg-slate-50 w-28 h-28 rounded-[3rem] flex items-center justify-center mx-auto mb-12 shadow-inner border border-slate-100">
                                                <Box size={56} className="text-slate-200" />
                                            </div>
                                            <p className="text-slate-950 font-black text-3xl tracking-tight italic mb-4">Zero Trade Activity</p>
                                            <Link to="/market" className="bg-slate-950 text-white px-12 py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-colors active:scale-95 inline-block italic shadow-2xl">Initialize Market Search</Link>
                                        </div>
                                    )}
                                    {orders.map(order => {
                                        const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['pending'];
                                        return (
                                            <div key={order.id} className="p-16 hover:bg-slate-50/80 transition-all group">
                                                <div className="flex flex-col xl:flex-row justify-between items-start gap-12">
                                                    <div className="space-y-6">
                                                        <div className="flex items-center gap-6">
                                                            <span className="text-[10px] font-black bg-slate-950 text-white px-5 py-2 rounded-2xl uppercase italic tracking-[0.2em] shadow-2xl">TXN #{(order.id || "").substring(0, 14).toUpperCase()}</span>
                                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">{new Date(order.created_at).toLocaleString()}</span>
                                                        </div>
                                                        <h4 className="font-black text-slate-950 text-5xl tracking-tighter italic group-hover:text-emerald-600 transition-colors uppercase leading-none">{order.product_name} <span className="text-slate-100 font-bold ml-4 italic text-4xl opacity-50 tracking-normal">× {order.quantity}</span></h4>
                                                        <div className="flex flex-wrap gap-6 mt-10">
                                                            <span className={`px-8 py-3 text-[10px] font-black rounded-2xl uppercase tracking-[0.4em] shadow-lg border border-white/10 ${status.color}`}>STATUS: {status.label.toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-left xl:text-right w-full xl:w-auto mt-6 xl:mt-0">
                                                        <p className="font-black text-slate-950 text-7xl tracking-tighter italic mb-10">₹{Number(order.amount).toLocaleString()}</p>
                                                        {order.status === "shipped" && (
                                                            <button 
                                                                onClick={() => handleMarkDelivered(order.id)} 
                                                                className="w-full xl:w-auto flex items-center justify-center gap-6 text-2xl font-black text-white bg-slate-950 px-16 py-8 rounded-[2.5rem] hover:bg-emerald-600 transition-all active:scale-95 shadow-premium uppercase tracking-tighter italic"
                                                            >
                                                                <CheckCircle2 size={36} strokeWidth={3} /> Confirm Delivery & Release
                                                            </button>
                                                        )}
                                                        {order.status === "delivered" && <div className="flex items-center xl:justify-end gap-4 text-emerald-600 font-black uppercase tracking-[0.4em] text-lg italic"><div className="bg-emerald-100 p-3 rounded-[1.5rem] border border-emerald-200 shadow-inner flex items-center justify-center"><CheckCircle2 size={32} strokeWidth={3} /></div> Trade Finalized</div>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
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
                                    <div className="absolute top-0 left-0 w-full h-4 bg-emerald-600"></div>
                                    <h2 className="text-5xl font-black text-slate-950 mb-16 tracking-tight italic">Buyer <span className="text-slate-300">Identity.</span></h2>

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
                                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]"></div> Full Legal Designation
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileName}
                                                    onChange={(e) => setProfileName(e.target.value)}
                                                    className="w-full p-10 bg-slate-50 border-none rounded-[2.5rem] focus:ring-8 focus:ring-emerald-600/5 focus:bg-white outline-none font-black text-3xl text-slate-950 transition-all shadow-inner"
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
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] italic">Level: Verified Buyer Asset</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="w-full bg-emerald-600 text-slate-950 font-black py-10 rounded-[3rem] shadow-premium hover:bg-slate-950 hover:text-white transition-all flex items-center justify-center gap-8 disabled:opacity-50 active:scale-[0.98] text-3xl uppercase tracking-tighter italic group"
                                        >
                                            {isSaving ? <div className="w-10 h-10 border-4 border-slate-950 border-t-transparent rounded-full animate-spin"></div> : <Save size={40} strokeWidth={3} className="group-hover:scale-110 transition-transform" />}
                                            {isSaving ? "Updating Profile..." : "Save Profile"}
                                        </button>
                                    </form>

                                    <div className="mt-24 pt-20 border-t border-slate-50 flex items-center justify-between px-6">
                                        <div className="space-y-2">
                                            <p className="text-slate-950 font-black text-xs uppercase tracking-[0.6em] italic leading-none">Security Protocol</p>
                                            <p className="text-slate-300 font-bold text-[10px] uppercase tracking-tighter italic">Manage your active authentication session</p>
                                        </div>
                                        <button onClick={handleLogout} className="bg-slate-50 text-slate-950 px-12 py-5 font-black text-xs rounded-2xl hover:bg-slate-950 hover:text-white transition-all uppercase tracking-[0.4em] shadow-sm italic active:scale-90 border border-slate-100">
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

