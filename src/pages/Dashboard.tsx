import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    ShoppingBag, ShieldCheck, CheckCircle2, 
    Package, LogOut, Home, User, Bell, 
    Save, ShoppingCart, Clock, Activity, ArrowUpRight, Box, ShieldAlert,
    TrendingUp, BarChart3, PieChart as PieChartIcon, Zap, Target
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer,
    PieChart, Cell, Pie
} from 'recharts';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
    pending: { label: "Awaiting Logistics", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: <Clock size={14} /> },
    in_escrow: { label: "Farm-Ease Secure", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: <ShieldCheck size={14} /> },
    shipped: { label: "In Transit", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: <Package size={14} /> },
    delivered: { label: "Finalized", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: <CheckCircle2 size={14} /> },
    cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: <ShieldAlert size={14} /> }
};

// Mock data for Yield Projection
const YIELD_DATA = [
    { month: 'Jan', yield: 45, market: 38 },
    { month: 'Feb', yield: 52, market: 42 },
    { month: 'Mar', yield: 48, market: 45 },
    { month: 'Apr', yield: 61, market: 48 },
    { month: 'May', yield: 55, market: 52 },
    { month: 'Jun', yield: 67, market: 58 },
    { month: 'Jul', yield: 72, market: 62 },
];

const CATEGORY_DATA = [
    { name: 'Grains', value: 400 },
    { name: 'Vegetables', value: 300 },
    { name: 'Fruits', value: 300 },
    { name: 'Organic', value: 200 },
];

const COLORS = ['#10b981', '#059669', '#047857', '#065f46'];

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
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
            <div className="w-16 h-16 border-4 border-white/5 border-t-emerald-600 rounded-full animate-spin mb-8"></div>
            <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-[10px]">Accessing Buyer Terminal...</p>
        </div>
    );

    const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
    const initials = displayName.charAt(0).toUpperCase();

    const totalOrders = orders.length;
    const securedAmount = orders.filter(o => o.status !== 'delivered' && o.payment_secured).reduce((sum, o) => sum + Number(o.amount || 0), 0);
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);

    return (
        <div className="flex h-screen bg-slate-950 pt-20 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px] -mr-96 -mt-96 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[120px] -ml-48 -mb-48 pointer-events-none"></div>

            {/* Sidebar */}
            <motion.div 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-80 bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 flex-col hidden lg:flex shadow-2xl p-8 text-white relative z-30"
            >
                <div className="flex-1 space-y-4">
                    <div className="px-5 mb-10">
                        <div className="w-12 h-1 bg-emerald-500 rounded-full mb-4 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Buyer Command Node</p>
                    </div>

                    {[
                        { id: "overview", label: "My Activity", icon: Home, desc: "Order Summary" },
                        { id: "projections", label: "Yield Engine", icon: TrendingUp, desc: "Market Analytics" },
                        { id: "orders", label: "Trade History", icon: Package, desc: "Transaction Log" },
                        { id: "profile", label: "Core Profile", icon: User, desc: "Identity Config" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full group flex items-start gap-4 p-5 rounded-[2rem] text-left transition-all duration-500 ${activeTab === tab.id ? "bg-emerald-600 text-slate-950 shadow-[0_20px_40px_rgba(16,185,129,0.2)] scale-[1.05]" : "text-slate-500 hover:bg-white/5 hover:text-white"}`}
                        >
                            <div className={`p-3 rounded-2xl transition-all duration-500 ${activeTab === tab.id ? "bg-slate-950/10 rotate-12" : "bg-white/5 group-hover:rotate-12 group-hover:bg-emerald-500/10 group-hover:text-emerald-400"}`}>
                                <tab.icon size={22} strokeWidth={activeTab === tab.id ? 3 : 2} />
                            </div>
                            <div>
                                <p className="font-black tracking-tight italic uppercase leading-none">{tab.label}</p>
                                <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${activeTab === tab.id ? "text-slate-950/40" : "text-slate-600 group-hover:text-slate-400"}`}>{tab.desc}</p>
                            </div>
                        </button>
                    ))}

                    <div className="pt-10 mt-10 border-t border-white/5 space-y-3">
                        <Link to="/market" className="flex items-center gap-4 p-5 rounded-[2rem] text-slate-500 hover:bg-white/5 hover:text-emerald-400 transition-all font-black text-[10px] uppercase tracking-[0.3em] italic group">
                            <ShoppingBag size={20} strokeWidth={3} className="group-hover:scale-110 transition-transform" /> Return to Market
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-4 p-5 rounded-[2rem] text-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all font-black text-[10px] uppercase tracking-[0.3em] italic group">
                            <LogOut size={20} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" /> Terminate Session
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-6 lg:px-12">
                <header className="px-6 py-12 flex justify-between items-center sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="h-1 w-8 bg-emerald-500 rounded-full"></div>
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] italic leading-none">Buyer Control Center</span>
                        </div>
                        <h1 className="text-5xl font-black text-white capitalize tracking-tighter italic leading-none uppercase">{activeTab === 'projections' ? 'Yield Engine' : activeTab}</h1>
                    </motion.div>
                    
                    <div className="flex items-center gap-8">
                        <button className="text-slate-500 hover:text-white relative p-4 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 group">
                            <Bell size={24} className="group-hover:rotate-12 transition-transform" />
                            {orders.length > 0 && <span className="absolute top-4 right-4 bg-emerald-600 w-2.5 h-2.5 rounded-full ring-4 ring-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse"></span>}
                        </button>
                        
                        <div className="flex items-center gap-6 bg-white/5 p-2 pr-8 rounded-[2rem] border border-white/5 shadow-inner group cursor-pointer hover:bg-white/10 transition-all duration-500">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-xl italic border-2 border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">{initials}</div>
                            <div className="hidden xl:block">
                                <p className="font-black text-white text-sm leading-tight uppercase italic">{displayName}</p>
                                <p className="text-[9px] text-emerald-500 uppercase font-black tracking-[0.2em] flex items-center gap-2 mt-1">
                                    <Activity size={10} className="animate-pulse" /> Platform Active
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-6 lg:p-12 max-w-[1600px] mx-auto pb-32">
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[
                                        { label: "Active Nodes", val: totalOrders, sub: "Purchase Volume", icon: Package, color: "emerald", border: "white/5" },
                                        { label: "Secured Capital", val: `₹${securedAmount.toLocaleString()}`, sub: "In Escrow Protocol", icon: ShieldCheck, color: "emerald", border: "emerald-500/20" },
                                        { label: "Global Spend", val: `₹${totalSpent.toLocaleString()}`, sub: "Cumulative Flow", icon: ArrowUpRight, color: "emerald", border: "white/5" }
                                    ].map((stat, i) => (
                                        <div key={i} className={`bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] p-10 group hover:-translate-y-2 transition-all duration-500 border border-${stat.border} relative overflow-hidden shadow-2xl`}>
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="bg-white/5 p-5 rounded-3xl text-emerald-500 shadow-inner group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-500">
                                                    <stat.icon size={32} strokeWidth={3} />
                                                </div>
                                                <span className="bg-white/5 text-slate-500 text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest italic group-hover:text-emerald-400">Telemetry 0{i+1}</span>
                                            </div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 block italic">{stat.sub}</p>
                                            <h3 className="text-6xl font-black text-white tracking-tighter italic leading-none">{stat.val}</h3>
                                            <div className="mt-6 flex items-center gap-2">
                                                <div className="h-1 w-8 bg-emerald-500/20 rounded-full overflow-hidden">
                                                    <div className="h-full w-2/3 bg-emerald-500"></div>
                                                </div>
                                                <p className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest italic">{stat.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Banner/Call to Action */}
                                <div className="bg-slate-900/80 backdrop-blur-3xl rounded-[4rem] p-16 flex flex-col xl:flex-row items-center justify-between gap-16 border border-white/5 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:bg-emerald-500/10 transition-all duration-700"></div>
                                    <div className="relative z-10 text-center xl:text-left space-y-6 flex-1">
                                        <div className="flex items-center justify-center xl:justify-start gap-4 mb-2">
                                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                                <ShieldCheck size={24} strokeWidth={3} />
                                            </div>
                                            <span className="text-xs font-black text-emerald-500/50 uppercase tracking-[0.4em]">Protocol Active</span>
                                        </div>
                                        <h3 className="text-6xl font-black text-white tracking-tight leading-none italic uppercase">Secure <span className="text-emerald-500 underline decoration-white/5 underline-offset-8">Harvest.</span></h3>
                                        <p className="text-slate-400 max-w-2xl text-xl font-bold italic leading-relaxed">Experience a direct link to premium agricultural yields, protected by Farm-Ease Secure settlement protocol.</p>
                                    </div>
                                    <Link to="/market" className="relative z-10 bg-emerald-600 text-slate-950 font-black px-12 py-8 rounded-[2rem] shadow-premium hover:bg-white transition-all flex items-center gap-6 group/btn text-2xl italic uppercase tracking-tighter active:scale-95">
                                        Scan Marketplace <ShoppingCart size={32} strokeWidth={3} className="group-hover/btn:rotate-12 transition-transform" />
                                    </Link>
                                </div>

                                {/* Quick Charts Preview */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-slate-900/40 backdrop-blur-xl rounded-[3rem] p-10 border border-white/5 space-y-8">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="text-2xl font-black text-white italic uppercase tracking-tight">Active Pulse</h4>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Transaction Velocity</p>
                                            </div>
                                            <BarChart3 className="text-emerald-500" size={32} />
                                        </div>
                                        <div className="h-64 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={YIELD_DATA}>
                                                    <defs>
                                                        <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}
                                                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                                    />
                                                    <Area type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/40 backdrop-blur-xl rounded-[3rem] p-10 border border-white/5 space-y-8">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="text-2xl font-black text-white italic uppercase tracking-tight">Asset Split</h4>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Portfolio Allocation</p>
                                            </div>
                                            <PieChartIcon className="text-emerald-500" size={32} />
                                        </div>
                                        <div className="h-64 w-full flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={CATEGORY_DATA}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {CATEGORY_DATA.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "projections" && (
                            <motion.div 
                                key="projections"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-12"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] p-12 border border-white/5 shadow-2xl">
                                        <div className="flex justify-between items-center mb-12">
                                            <div>
                                                <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">Yield Projection Engine</h3>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-2 italic">Predictive Market Analytics</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl text-emerald-500 text-[10px] font-black uppercase italic border border-emerald-500/20">
                                                    <Zap size={14} /> Low Volatility
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="h-[400px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={YIELD_DATA}>
                                                    <defs>
                                                        <linearGradient id="colorYieldMain" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                        </linearGradient>
                                                        <linearGradient id="colorMarket" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#475569" stopOpacity={0.2}/>
                                                            <stop offset="95%" stopColor="#475569" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                                    <XAxis 
                                                        dataKey="month" 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900, textAnchor: 'middle' }}
                                                        dy={20}
                                                    />
                                                    <YAxis 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                                                    />
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '20px' }}
                                                        itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', fontStyle: 'italic' }}
                                                    />
                                                    <Area type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorYieldMain)" name="Projected Yield" />
                                                    <Area type="monotone" dataKey="market" stroke="#475569" strokeWidth={3} fillOpacity={1} fill="url(#colorMarket)" name="Market Avg" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/5 shadow-2xl">
                                            <h4 className="text-xl font-black text-white italic uppercase mb-8">System Analysis</h4>
                                            <div className="space-y-6">
                                                {[
                                                    { label: "Yield Efficiency", val: "84%", color: "text-emerald-500" },
                                                    { label: "Risk Coefficient", val: "0.24", color: "text-emerald-400" },
                                                    { label: "Growth Potential", val: "+12.4%", color: "text-white" }
                                                ].map((metric, i) => (
                                                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{metric.label}</span>
                                                        <span className={`text-xl font-black italic ${metric.color}`}>{metric.val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-emerald-600 rounded-[3rem] p-10 shadow-premium relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                            <Target className="text-slate-950/20 absolute bottom-4 right-4" size={120} strokeWidth={4} />
                                            <div className="relative z-10 space-y-4">
                                                <p className="text-slate-950/60 font-black text-[10px] uppercase tracking-[0.4em] italic leading-none">Intelligence Feed</p>
                                                <h4 className="text-3xl font-black text-slate-950 italic uppercase leading-tight">Optimized <br />Sourcing.</h4>
                                                <p className="text-slate-950/80 text-xs font-bold italic leading-relaxed">System scan suggests focusing on Grain imports for Q3 based on current yield trajectories.</p>
                                            </div>
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
                                className="bg-slate-900/40 backdrop-blur-3xl rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden"
                            >
                                <div className="p-16 border-b border-white/5 flex justify-between items-center bg-transparent">
                                    <h2 className="font-black text-5xl tracking-tighter italic uppercase text-white">Trade Manifest</h2>
                                    <div className="text-right">
                                        <p className="text-4xl font-black italic tracking-tighter leading-none mb-1 text-emerald-500">{orders.length}</p>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Total Activity Nodes</p>
                                    </div>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {loadingOrders && <div className="p-40 text-center flex flex-col items-center"><div className="w-16 h-16 border-4 border-white/5 border-t-emerald-600 rounded-full animate-spin mb-10"></div><p className="text-slate-500 font-black uppercase tracking-[0.5em] text-xs">Accessing Vault Ledger...</p></div>}
                                    {!loadingOrders && orders.length === 0 && (
                                        <div className="p-48 text-center">
                                            <div className="bg-white/5 w-28 h-28 rounded-[3rem] flex items-center justify-center mx-auto mb-12 border border-white/5 shadow-inner">
                                                <Box size={56} className="text-slate-700" />
                                            </div>
                                            <p className="text-white font-black text-3xl tracking-tight italic mb-8 uppercase">Zero Network Activity</p>
                                            <Link to="/market" className="bg-emerald-600 text-slate-950 px-12 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-white transition-all active:scale-95 inline-block italic shadow-2xl">Initialize Marketplace Search</Link>
                                        </div>
                                    )}
                                    {orders.map(order => {
                                        const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['pending'];
                                        return (
                                            <div key={order.id} className="p-16 hover:bg-white/5 transition-all group relative overflow-hidden">
                                                <div className="flex flex-col xl:flex-row justify-between items-start gap-12 relative z-10">
                                                    <div className="space-y-6">
                                                        <div className="flex items-center gap-6">
                                                            <span className="text-[9px] font-black bg-emerald-600 text-slate-950 px-4 py-2 rounded-xl uppercase italic tracking-widest shadow-xl">TXN: #{(order.id || "").substring(0, 12).toUpperCase()}</span>
                                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] italic">{new Date(order.created_at).toLocaleString()}</span>
                                                        </div>
                                                        <h4 className="font-black text-white text-5xl tracking-tighter italic group-hover:text-emerald-400 transition-colors uppercase leading-none">{order.product_name} <span className="text-slate-700 font-bold ml-4 italic text-4xl tracking-normal opacity-50">× {order.quantity}</span></h4>
                                                        <div className="flex flex-wrap gap-4 mt-10">
                                                            <span className={`px-6 py-2 text-[9px] font-black rounded-xl uppercase tracking-[0.3em] shadow-lg border ${status.color}`}>STATUS: {status.label.toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-left xl:text-right w-full xl:w-auto mt-6 xl:mt-0">
                                                        <p className="font-black text-white text-7xl tracking-tighter italic mb-10 leading-none group-hover:scale-110 transition-transform origin-right">₹{Number(order.amount).toLocaleString()}</p>
                                                        {order.status === "shipped" && (
                                                            <button 
                                                                onClick={() => handleMarkDelivered(order.id)} 
                                                                className="w-full xl:w-auto flex items-center justify-center gap-6 text-xl font-black text-slate-950 bg-emerald-600 px-12 py-6 rounded-full hover:bg-white transition-all active:scale-95 shadow-premium uppercase tracking-tighter italic"
                                                            >
                                                                <CheckCircle2 size={28} strokeWidth={3} /> Finalize Settlement
                                                            </button>
                                                        )}
                                                        {order.status === "delivered" && (
                                                            <div className="flex items-center xl:justify-end gap-4 text-emerald-500 font-black uppercase tracking-[0.4em] text-sm italic">
                                                                <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 shadow-inner flex items-center justify-center">
                                                                    <ShieldCheck size={24} strokeWidth={3} />
                                                                </div> 
                                                                Ledger Finalized
                                                            </div>
                                                        )}
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
                                className="max-w-4xl"
                            >
                                 <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[4rem] shadow-2xl border border-white/5 p-16 lg:p-20 relative overflow-hidden group/profile">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600"></div>
                                    <div className="mb-16">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="h-1 w-8 bg-emerald-500 rounded-full"></div>
                                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] italic leading-none">Identity Configuration</span>
                                        </div>
                                        <h2 className="text-5xl font-black text-white tracking-tight italic uppercase">Buyer <span className="text-slate-700">Node Profile.</span></h2>
                                    </div>

                                    <form onSubmit={handleUpdateProfile} className="space-y-16">
                                        <div className="space-y-12">
                                            <div className="flex flex-col md:flex-row items-center gap-12 mb-16 bg-white/5 p-12 rounded-[3.5rem] border border-white/5 shadow-inner group-hover/profile:bg-white/10 transition-all duration-700">
                                                <div className="w-44 h-44 rounded-3xl bg-emerald-600 text-slate-950 font-black text-7xl flex items-center justify-center shadow-2xl italic border-8 border-slate-950 group-hover/profile:rotate-2 transition-transform duration-700">
                                                    {initials}
                                                </div>
                                                <div className="space-y-4 text-center md:text-left flex-1">
                                                    <p className="font-black text-white text-5xl tracking-tighter italic uppercase leading-none">{displayName}</p>
                                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.6em] bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20 inline-block shadow-sm italic">{user?.email}</p>
                                                    <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-4 py-2 bg-white/5 rounded-xl border border-white/5">Buyer Verified</span>
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-4 py-2 bg-white/5 rounded-xl border border-white/5">Tier: Enterprise</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-6 ml-6">
                                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div> Full Identity Designation
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileName}
                                                    onChange={(e) => setProfileName(e.target.value)}
                                                    className="w-full p-10 bg-white/5 border border-white/5 rounded-full focus:ring-8 focus:ring-emerald-600/5 focus:bg-white/10 outline-none font-black text-3xl text-white transition-all shadow-inner placeholder:text-slate-800 italic uppercase tracking-tighter"
                                                    required
                                                />
                                            </div>

                                            <div className="p-10 bg-slate-950 rounded-[3rem] flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden group border border-white/5">
                                                <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mb-32 -mr-32 blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700"></div>
                                                <div className="bg-white/5 p-8 rounded-3xl text-emerald-400 shadow-inner border border-white/5">
                                                    <ShieldCheck size={48} strokeWidth={3} />
                                                </div>
                                                <div className="space-y-2 text-center md:text-left">
                                                    <h4 className="text-2xl font-black italic tracking-tight uppercase text-white mb-1">Farm-Ease Secure Protection</h4>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] italic">Status: Fully Encrypted Session</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="w-full bg-emerald-600 text-slate-950 font-black py-10 rounded-full shadow-premium hover:bg-white transition-all flex items-center justify-center gap-8 disabled:opacity-50 active:scale-[0.98] text-3xl uppercase tracking-tighter italic group"
                                        >
                                            {isSaving ? <div className="w-10 h-10 border-4 border-slate-950 border-t-transparent rounded-full animate-spin"></div> : <Save size={40} strokeWidth={3} className="group-hover:scale-110 transition-transform" />}
                                            {isSaving ? "Syncing..." : "Update Identity"}
                                        </button>
                                    </form>

                                    <div className="mt-20 pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 px-6">
                                        <div className="space-y-2 text-center md:text-left">
                                            <p className="text-slate-400 font-black text-xs uppercase tracking-[0.5em] italic">Security Protocol</p>
                                            <p className="text-slate-600 font-bold text-[10px] uppercase tracking-tighter italic">Manage active node authentication</p>
                                        </div>
                                        <button onClick={handleLogout} className="bg-white/5 text-red-500/60 px-12 py-5 font-black text-xs rounded-full hover:bg-red-500/10 hover:text-red-500 transition-all uppercase tracking-[0.4em] shadow-sm italic active:scale-95 border border-white/5">
                                            Terminate Profile Access
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
