import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ShieldCheck, CreditCard, Banknote, CheckCircle, MapPin, Lock, Sparkles, ChevronRight, Activity, ShieldAlert, Box } from "lucide-react";
import { motion } from "framer-motion";
import FarmEasePay from "@/components/payments/FarmEasePay";

export default function Checkout() {
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [isStepping, setIsStepping] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Platform fee is 2%
    const platformFee = Math.round(cartTotal * 0.02);
    const totalAmount = cartTotal + platformFee;

    const handlePaymentBegin = () => {
        if (!user) {
            alert("Please log in to place an order.");
            return;
        }
        setIsStepping(true);
    };

    const handleSettlementComplete = async () => {
        setIsStepping(false);
        setIsProcessing(true);

        try {
            for (const item of cart) {
                const { error } = await supabase.from('orders').insert({
                    buyer_id: user?.uid,
                    seller_id: item.vendor_id,
                    product_name: item.name,
                    quantity: item.quantity,
                    amount: item.price * item.quantity,
                    status: 'pending',
                    safe_pay_locked: true
                });
                if (error) throw error;
            }
            setIsProcessing(false);
            setOrderPlaced(true);
            clearCart();
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Failed to securely place the order. Please try again.");
            setIsProcessing(false);
        }
    };

    if (cart.length === 0 && !orderPlaced) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-10 py-32 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-[150px] pointer-events-none"></div>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900/40 backdrop-blur-3xl p-20 rounded-[5rem] border border-white/5 text-center max-w-2xl shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]"></div>
                    <div className="w-40 h-40 bg-slate-950 rounded-[4rem] flex items-center justify-center mx-auto mb-12 shadow-2xl border border-white/5">
                        <Box className="text-slate-800" size={80} strokeWidth={1} />
                    </div>
                    <h2 className="text-6xl font-black text-white mb-8 tracking-tighter italic uppercase leading-none">Manifest Null.</h2>
                    <p className="text-slate-500 mb-16 font-bold text-xl italic leading-relaxed opacity-60 uppercase tracking-widest text-xs">You require an active harvest manifest to proceed to the secure settlement protocol.</p>
                    <Link to="/market" className="inline-flex bg-emerald-600 text-slate-950 px-16 py-8 rounded-[2.5rem] font-black hover:bg-white transition-all shadow-2xl active:scale-95 uppercase tracking-tighter italic text-2xl group border border-emerald-400/20">
                        Enter Marketplace <ArrowLeft size={32} className="ml-8 rotate-180 group-hover:translate-x-4 transition-transform duration-500" strokeWidth={4} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (orderPlaced) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-10 py-40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-600/10 rounded-full blur-[180px] -mr-96 -mt-96 pointer-events-none"></div>
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/40 backdrop-blur-3xl p-24 rounded-[6rem] shadow-2xl flex flex-col items-center text-center max-w-3xl relative overflow-hidden border border-white/5"
                >
                    <div className="absolute top-0 left-0 w-full h-3 bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)]"></div>
                    <div className="bg-emerald-500/10 text-emerald-500 p-12 rounded-[4rem] mb-16 relative shadow-2xl border border-emerald-500/20 group">
                        <CheckCircle size={80} strokeWidth={4} className="group-hover:scale-110 transition-transform duration-700" />
                        <span className="absolute -top-4 -right-4 flex h-10 w-10">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-10 w-10 bg-emerald-500"></span>
                        </span>
                    </div>
                    <h2 className="text-7xl lg:text-8xl font-black text-white mb-10 tracking-tighter italic uppercase leading-none">Capital <span className="text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">Secured.</span></h2>
                    <p className="text-slate-500 mb-16 text-xl font-bold tracking-tight italic leading-relaxed max-w-xl opacity-80 uppercase text-xs tracking-[0.2em]">Funds are now protected by the Farm-Ease Secure protocol. Capital is held in the secure clearing system and will only be released upon your final authentication of delivery integrity.</p>

                    <div className="w-full bg-slate-950 p-16 rounded-[4.5rem] border border-white/5 mb-20 flex flex-col gap-10 text-left relative overflow-hidden group/receipt shadow-2xl">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full"></div>
                        <div className="flex justify-between items-center relative z-10">
                            <span className="text-slate-500 font-black uppercase tracking-[0.5em] text-[10px] italic">Settlement Receipt ID</span>
                            <span className="font-mono font-black text-emerald-400 bg-emerald-950 px-8 py-3 rounded-2xl border border-white/5 text-sm uppercase tracking-[0.4em] shadow-2xl italic">#FE-{Math.floor(Math.random() * 900000) + 100000}</span>
                        </div>
                        <div className="flex justify-between items-end relative z-10 border-t border-white/5 pt-10">
                            <div>
                                <span className="text-slate-500 font-black uppercase tracking-[0.5em] text-[10px] italic mb-4 block">Capital Magnitude</span>
                                <span className="text-7xl font-black text-white tracking-tighter italic leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">₹{totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] mb-3 italic">Status</span>
                                <span className="px-8 py-3 bg-emerald-600 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] italic shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-400/20">Secured</span>
                            </div>
                        </div>
                    </div>

                    <Link to="/dashboard" className="group w-full bg-emerald-600 text-slate-950 px-16 py-12 rounded-[4rem] font-black text-4xl hover:bg-white transition-all duration-700 shadow-2xl active:scale-[0.98] flex items-center justify-center gap-10 italic uppercase tracking-tighter border border-emerald-400/20">
                        Track Logistics <ChevronRight size={48} className="group-hover:translate-x-4 transition-transform duration-500" strokeWidth={4} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-slate-950 pt-40 pb-32 relative overflow-hidden"
        >
            {/* Background Aesthetics */}
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-600/5 rounded-full blur-[180px] -mr-96 -mt-96 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] -ml-64 -mb-64 pointer-events-none"></div>

            {isStepping && <FarmEasePay amount={totalAmount} onComplete={handleSettlementComplete} />}
            
            <div className="max-w-7xl mx-auto px-10 relative z-10">
                <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="mb-20"
                >
                    <Link to="/cart" className="inline-flex items-center text-slate-500 font-black text-[10px] uppercase tracking-[0.6em] hover:text-emerald-400 mb-12 transition-all group italic leading-none">
                        <div className="bg-white/5 p-5 rounded-3xl border border-white/5 mr-8 group-hover:bg-emerald-600 group-hover:text-slate-950 transition-all shadow-2xl group-hover:rotate-12 duration-500">
                             <ArrowLeft size={18} strokeWidth={5} className="group-hover:-translate-x-2 transition-transform duration-500" />
                        </div>
                        Manifest / <span className="text-white ml-2 opacity-100 italic">Secure Settlement</span>
                    </Link>
                    <h1 className="text-7xl lg:text-9xl font-black text-white tracking-tighter italic uppercase leading-none">
                        Secure <span className="text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">Clearing.</span>
                    </h1>
                </motion.div>

                <div className="grid lg:grid-cols-12 gap-16 items-start">
                    {/* Settlement Manifest */}
                    <div className="lg:col-span-12 space-y-20">
                        <div className="grid lg:grid-cols-2 gap-16">
                            {/* Logistics Metadata */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-900/40 backdrop-blur-3xl p-16 rounded-[4.5rem] border border-white/5 shadow-2xl flex flex-col justify-between relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-3xl rounded-full"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-8 mb-16 border-b border-white/5 pb-10">
                                        <div className="bg-slate-950 p-6 rounded-[2rem] border border-white/5 italic text-emerald-500 shadow-2xl">
                                            <MapPin size={32} strokeWidth={4} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] italic">Logistics Hub</span>
                                            <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mt-2">Delivery Destination</h4>
                                        </div>
                                    </div>
                                    <div className="space-y-12">
                                        <div className="group/input">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] mb-4 block ml-6 italic group-focus-within/input:text-emerald-400 transition-colors">Manifest Principal</label>
                                            <input type="text" className="w-full bg-slate-950/80 rounded-[2.5rem] px-12 py-8 border border-white/5 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 font-black italic text-2xl uppercase tracking-tighter placeholder:text-slate-800 text-white transition-all shadow-inner" placeholder="Principal Name..." />
                                        </div>
                                        <div className="group/input">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] mb-4 block ml-6 italic group-focus-within/input:text-emerald-400 transition-colors">Geo-Coordinates / Address</label>
                                            <textarea rows={4} className="w-full bg-slate-950/80 rounded-[3rem] px-12 py-10 border border-white/5 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 font-black italic text-2xl uppercase tracking-tighter placeholder:text-slate-800 text-white transition-all resize-none shadow-inner" placeholder="Standard Delivery Address..."></textarea>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Payment Protocol */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-slate-950 p-16 rounded-[4.5rem] shadow-2xl relative overflow-hidden text-white flex flex-col justify-between border border-white/10"
                            >
                                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-16 border-b border-white/10 pb-10">
                                        <div className="flex items-center gap-8">
                                            <div className="bg-emerald-600 p-6 rounded-[2rem] shadow-[0_0_30px_rgba(16,185,129,0.3)] text-slate-950 italic border border-emerald-400/20">
                                                <ShieldCheck size={36} strokeWidth={4} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.6em] italic">Secure clearing active</span>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <Activity size={14} className="text-emerald-500 animate-pulse" />
                                                    <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Settlement Ledger</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <Sparkles className="text-white/10" size={40} />
                                    </div>

                                    <div className="space-y-8 mb-16 bg-white/5 p-12 rounded-[3.5rem] border border-white/5 shadow-inner">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center group/item">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500/30 group-hover/item:bg-emerald-500 transition-colors"></div>
                                                    <span className="text-2xl font-black text-white italic uppercase tracking-tighter opacity-80 group-hover/item:opacity-100 transition-opacity">{item.name} <span className="text-slate-600 text-sm ml-4 uppercase tracking-[0.2em] italic">× {item.quantity}</span></span>
                                                </div>
                                                <span className="text-2xl font-black text-emerald-400 italic font-mono tabular-nums leading-none">₹{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-white p-16 rounded-[4.5rem] flex flex-col sm:flex-row items-center justify-between gap-12 shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative group/total overflow-hidden">
                                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/total:opacity-100 transition-opacity duration-1000"></div>
                                        <div className="text-left w-full sm:w-auto z-10">
                                            <span className="text-slate-500 font-black uppercase tracking-[0.8em] text-[10px] block mb-4 italic leading-none">Total Settlement</span>
                                            <span className="text-7xl font-black text-slate-950 tracking-tighter italic leading-none block">₹{totalAmount.toLocaleString()}</span>
                                        </div>
                                        <button
                                            onClick={handlePaymentBegin}
                                            disabled={isProcessing}
                                            className="w-full sm:w-auto bg-slate-950 text-white px-16 py-10 rounded-[2.5rem] font-black text-2xl uppercase tracking-[0.3em] hover:bg-emerald-600 active:scale-[0.95] transition-all duration-700 shadow-2xl flex items-center justify-center gap-8 italic group/btn relative overflow-hidden z-10"
                                        >
                                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                                            {isProcessing ? (
                                                <Activity className="animate-spin" size={32} />
                                            ) : (
                                                <>
                                                    <CreditCard size={32} strokeWidth={4} className="group-hover/btn:rotate-12 transition-transform duration-500" /> Commit Payment
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Security Manifest Credentials */}
                        <div className="grid md:grid-cols-3 gap-12 pt-8">
                            {[
                                { icon: Lock, title: "Neural Encryption", desc: "Standard Protocol Isolation Active", color: "emerald" },
                                { icon: Banknote, title: "Clearing Guard", desc: "Disbursement Post-Quality Verification", color: "blue" },
                                { icon: ShieldAlert, title: "Capital Shield", desc: "Patented Settlement Protection", color: "emerald" }
                            ].map((item, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    transition={{ delay: 0.3 + (idx * 0.1) }} 
                                    className="bg-slate-900/40 backdrop-blur-3xl p-14 rounded-[4rem] border border-white/5 shadow-2xl flex flex-col items-center text-center group hover:bg-white transition-all duration-700 cursor-default"
                                >
                                    <div className="w-24 h-24 rounded-[2.5rem] bg-slate-950 flex items-center justify-center mb-10 border border-white/5 group-hover:bg-slate-950 group-hover:rotate-12 transition-all duration-700 shadow-2xl">
                                        <item.icon size={40} className={`text-${item.color}-500 group-hover:text-${item.color}-500/50 transition-colors`} strokeWidth={3} />
                                    </div>
                                    <h4 className="text-lg font-black text-white group-hover:text-slate-950 uppercase tracking-[0.6em] mb-4 italic transition-colors leading-none">{item.title}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] italic leading-relaxed group-hover:text-slate-800 transition-colors uppercase">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
