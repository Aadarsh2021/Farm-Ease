import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ShieldCheck, ShieldAlert, CheckCircle2, Package, LogOut, Home, User, Bell, Save, ShoppingCart } from "lucide-react";
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

interface DashboardOrder {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    items: any[];
    amount?: number;
    escrow_held?: boolean;
    product_name?: string;
    quantity?: number;
    seller_id?: string;
}

export default function Dashboard() {
    const { user, userRole, loading } = useAuth();
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
                .channel('public:orders')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'orders',
                    filter: `buyer_id=eq.${user.uid}` 
                }, () => {
                    fetchOrders();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, fetchOrders]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-6"></div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Loading Identity...</p>
        </div>
    );

    const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
    const initials = displayName.charAt(0).toUpperCase();

    const totalOrders = orders.length;
    const escrowAmount = orders.filter(o => o.status !== 'delivered' && o.escrow_held).reduce((sum, o) => sum + Number(o.amount), 0);
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.amount), 0);

    return (
        <div className="flex h-screen bg-gray-50 pt-20">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-slate-100 flex-col hidden lg:flex shadow-premium p-8">
                <div className="flex-1 space-y-2">
                    {[
                        { id: "overview", label: "Overview", icon: Home, desc: "Global Stats" },
                        { id: "orders", label: "My Orders", icon: Package, desc: "Buy History" },
                        { id: "profile", label: "Profile", icon: User, desc: "Personal Details" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full group flex items-start gap-4 p-5 rounded-[1.5rem] text-left transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-premium scale-[1.02]" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"}`}
                        >
                            <div className={`p-2 rounded-xl transition-colors ${activeTab === tab.id ? "bg-white/10" : "bg-slate-50 group-hover:bg-white"}`}>
                                <tab.icon size={22} strokeWidth={activeTab === tab.id ? 3 : 2} />
                            </div>
                            <div>
                                <p className="font-black tracking-tight">{tab.label}</p>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === tab.id ? "text-white/40" : "text-slate-300"}`}>{tab.desc}</p>
                            </div>
                        </button>
                    ))}

                    <div className="pt-8 mt-8 border-t border-slate-50 space-y-2">
                        <Link to="/market" className="flex items-center gap-4 p-5 rounded-[1.5rem] text-slate-400 hover:bg-slate-50 hover:text-green-600 transition-all font-black text-sm uppercase tracking-widest">
                            <ShoppingBag size={22} strokeWidth={3} /> Return to Market
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-4 p-5 rounded-[1.5rem] text-red-400 hover:bg-red-50 transition-all font-black text-sm uppercase tracking-widest">
                            <LogOut size={22} strokeWidth={3} /> Terminate Session
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <header className="bg-white/80 backdrop-blur-xl px-10 py-6 flex justify-between items-center sticky top-0 z-20 border-b border-slate-50">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 capitalize tracking-tighter italic">{activeTab}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-slate-300 hover:text-green-600 relative p-3 rounded-2xl hover:bg-slate-50 transition-all">
                            <Bell size={24} />
                            {orders.length > 0 && <span className="absolute top-2.5 right-2.5 bg-red-500 w-2.5 h-2.5 rounded-full ring-4 ring-white animate-pulse"></span>}
                        </button>
                        <div className="flex items-center gap-4 border-l border-slate-50 pl-6 ml-2">
                            <div className="w-14 h-14 rounded-3xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center shadow-premium italic">{initials}</div>
                            <div className="hidden xl:block">
                                <p className="font-black text-slate-900 leading-tight">{displayName}</p>
                                <p className="text-[10px] text-green-600 uppercase font-black tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>{userRole || "Consumer"}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-10 max-w-7xl">
                    {activeTab === "overview" && (
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-white rounded-[2.5rem] shadow-premium p-10 group hover:-translate-y-1 transition-all border border-slate-50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block">Legacy Volume</p>
                                    <h3 className="text-6xl font-black text-slate-900 tracking-tighter italic group-hover:text-green-600 transition-colors">{totalOrders}</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-2">Verified Purchases</p>
                                </div>
                                <div className="bg-white rounded-[2.5rem] shadow-premium p-10 group hover:-translate-y-1 transition-all border-2 border-orange-50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block">Locked Capital</p>
                                    <h3 className="text-6xl font-black text-slate-900 tracking-tighter italic group-hover:text-orange-500 transition-colors">₹{escrowAmount.toLocaleString()}</h3>
                                    <p className="text-xs font-black text-orange-500 mt-2 uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck size={14} /> Vault Protection Active</p>
                                </div>
                                <div className="bg-white rounded-[2.5rem] shadow-premium p-10 group hover:-translate-y-1 transition-all border-2 border-slate-900">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block">Total Circulation</p>
                                    <h3 className="text-6xl font-black text-slate-900 tracking-tighter italic">₹{totalSpent.toLocaleString()}</h3>
                                    <p className="text-xs font-black text-slate-400 mt-2 uppercase tracking-widest">Global Expenditure</p>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-[3rem] p-16 flex flex-col xl:flex-row items-center justify-between gap-12 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-green-500/20 transition-all duration-700"></div>
                                <div className="relative z-10 text-center xl:text-left">
                                    <h3 className="text-5xl font-black mb-4 tracking-tight leading-none italic uppercase italic">Harvest the <span className="text-green-500">Finest.</span></h3>
                                    <p className="text-slate-400 max-w-lg text-lg font-bold italic">Every micro-transaction is fortified by our legal-tech escrow vault. Eliminate middleman fraud with a single click.</p>
                                </div>
                                <Link to="/market" className="relative z-10 bg-green-500 text-slate-900 font-black px-12 py-6 rounded-[2rem] shadow-2xl hover:bg-white transition-all flex items-center gap-4 whitespace-nowrap active:scale-95 group/btn">
                                    Direct Market Access <ShoppingCart size={24} strokeWidth={3} className="group-hover/btn:rotate-12 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    )}

                    {activeTab === "orders" && (
                        <div className="bg-white rounded-[3rem] shadow-premium border border-slate-50 overflow-hidden">
                            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                <h2 className="font-black text-slate-900 text-2xl tracking-tighter italic uppercase">Transaction Manifest</h2>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Total Activity: {orders.length}</div>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {loadingOrders && (
                                    <div className="p-32 text-center flex flex-col items-center">
                                        <div className="w-16 h-16 border-4 border-slate-100 border-t-green-600 rounded-full animate-spin mb-8"></div>
                                        <p className="text-slate-300 font-black uppercase tracking-[0.5em] text-[10px]">Synchronizing Vault...</p>
                                    </div>
                                )}
                                {!loadingOrders && orders.length === 0 && (
                                    <div className="p-32 text-center">
                                        <div className="bg-slate-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-inner">
                                            <Package size={48} className="text-slate-200" />
                                        </div>
                                        <p className="text-slate-900 font-black text-xl mb-2 tracking-tight">Zero Activity Detected</p>
                                        <p className="text-slate-400 font-bold mb-10 italic">Your acquisition history is currently blank. Initialize your first trade.</p>
                                        <Link to="/market" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-green-600 transition-colors active:scale-95 inline-block">Initialize Market Search</Link>
                                    </div>
                                )}

                                {orders.map(order => {
                                    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['pending'];
                                    const orderDate = new Date(order.created_at).toLocaleDateString();
                                    return (
                                        <div key={order.id} className="p-10 hover:bg-slate-50/50 transition-all group relative">
                                            <div className="flex flex-col xl:flex-row justify-between items-start gap-8">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-lg uppercase italic tracking-tighter">Manifest #{(order.id || "").substring(0, 8).toUpperCase()}</span>
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{orderDate}</span>
                                                    </div>
                                                    <h4 className="font-black text-slate-900 text-3xl tracking-tighter italic group-hover:text-green-600 transition-colors leading-none">{order.product_name} <span className="text-slate-200 font-bold ml-2 italic tracking-normal text-2xl opacity-50">× {order.quantity}</span></h4>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2 italic"><div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div> Supplier Node: {order.seller_id}</p>
                                                </div>
                                                <div className="text-left xl:text-right w-full xl:w-auto">
                                                    <p className="font-black text-slate-900 text-5xl tracking-tighter italic mb-4">₹{Number(order.amount).toLocaleString()}</p>
                                                    <div className="flex items-center xl:justify-end">
                                                        <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${status.color}`}>
                                                            {status.icon} {status.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {order.status === "shipped" && (
                                                <div className="mt-10 pt-10 border-t border-dashed border-slate-100 flex flex-col sm:flex-row items-center gap-6">
                                                    <div className="flex-1">
                                                        <p className="text-xs font-black text-green-600 uppercase tracking-[0.2em] mb-1">Logistics Arrived</p>
                                                        <p className="text-sm font-bold text-slate-400 italic">Verify produce quality before authorizing capital release.</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleMarkDelivered(order.id)}
                                                        className="w-full sm:w-auto bg-green-500 text-slate-900 font-black px-12 py-5 rounded-[1.5rem] shadow-premium hover:shadow-2xl hover:bg-slate-900 hover:text-white active:scale-[0.98] transition-all flex items-center justify-center gap-3 italic"
                                                    >
                                                        <CheckCircle2 size={22} strokeWidth={3} /> Authorize Escrow Release
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
                        <div className="max-w-3xl">
                            <div className="bg-white rounded-[3.5rem] shadow-premium border border-slate-50 p-16 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-900 to-green-600"></div>
                                <h2 className="text-4xl font-black text-slate-900 mb-12 tracking-tight italic">Identity <span className="text-green-600">Validation.</span></h2>

                                <form onSubmit={handleUpdateProfile} className="space-y-12">
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-10 mb-12 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                            <div className="w-28 h-28 rounded-[2.5rem] bg-slate-900 text-white font-black text-4xl flex items-center justify-center shadow-premium italic border-4 border-white">
                                                {initials}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-3xl tracking-tighter italic mb-1">{displayName}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] bg-white px-3 py-1 rounded-lg border border-slate-100">{user?.email}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3 ml-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Master Alias
                                            </label>
                                            <input
                                                type="text"
                                                value={profileName}
                                                onChange={(e) => setProfileName(e.target.value)}
                                                className="w-full p-6 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-green-500 focus:bg-white outline-none font-black text-xl text-slate-900 transition-all shadow-inner"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3 ml-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Protocol Role
                                            </label>
                                            <div className="p-6 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg flex items-center justify-between shadow-2xl">
                                                <span className="text-slate-400 italic font-bold">Authenticated as</span>
                                                <span className="uppercase tracking-[0.2em] italic text-green-500">{userRole || "Consumer"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full bg-green-500 text-slate-900 font-black py-6 rounded-[2rem] shadow-premium hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-[0.98] text-xl group"
                                    >
                                        {isSaving ? <div className="w-6 h-6 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div> : <Save size={24} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />}
                                        {isSaving ? "Synchronizing..." : "Update Protocol"}
                                    </button>
                                </form>

                                <div className="mt-16 pt-16 border-t border-slate-50 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-red-600 font-black text-xs uppercase tracking-widest italic">Danger Zone</p>
                                        <p className="text-slate-300 font-bold text-[10px] uppercase tracking-tighter">Terminate master session</p>
                                    </div>
                                    <button onClick={handleLogout} className="bg-red-50 text-red-600 px-8 py-3 font-black text-[10px] rounded-xl hover:bg-red-600 hover:text-white transition-all uppercase tracking-[0.2em] shadow-sm italic">
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
