import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ShieldCheck, CreditCard, Banknote, CheckCircle, MapPin, Lock, Leaf, Sparkles, ChevronRight, Activity, ShieldAlert } from "lucide-react";
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-10 py-32">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-50 p-20 rounded-[5rem] border border-slate-100 text-center max-w-2xl shadow-premium relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-3 bg-slate-950"></div>
                    <div className="w-40 h-40 bg-white rounded-[3.5rem] flex items-center justify-center mx-auto mb-12 shadow-inner border border-white">
                        <Leaf className="text-slate-100" size={80} strokeWidth={1} />
                    </div>
                    <h2 className="text-5xl font-black text-slate-950 mb-8 tracking-tighter italic uppercase leading-none">Basket Empty.</h2>
                    <p className="text-slate-400 mb-16 font-bold text-xl italic leading-relaxed opacity-80">You require an active harvest manifest to proceed to the secure settlement protocol.</p>
                    <Link to="/market" className="inline-flex bg-slate-950 text-white px-16 py-8 rounded-[2.5rem] font-black hover:bg-emerald-600 transition-all shadow-2xl active:scale-95 uppercase tracking-tighter italic text-2xl group">
                        Enter Marketplace <ArrowLeft size={32} className="ml-6 rotate-180 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (orderPlaced) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-10 py-40">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-950 p-24 rounded-[6rem] shadow-premium flex flex-col items-center text-center max-w-3xl relative overflow-hidden border border-white/10"
                >
                    <div className="absolute top-0 left-0 w-full h-4 bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]"></div>
                    <div className="bg-emerald-500/10 text-emerald-500 p-12 rounded-[4rem] mb-16 relative shadow-inner border border-emerald-500/20 group">
                        <CheckCircle size={80} strokeWidth={3} className="group-hover:scale-110 transition-transform duration-700" />
                        <span className="absolute -top-4 -right-4 flex h-10 w-10">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-10 w-10 bg-emerald-500"></span>
                        </span>
                    </div>
                    <h2 className="text-7xl font-black text-white mb-8 tracking-tighter italic uppercase leading-none">Capital <span className="text-emerald-500">Secured.</span></h2>
                    <p className="text-slate-400 mb-16 text-xl font-bold tracking-tight italic leading-relaxed max-w-xl opacity-80">Funds are now protected by the Farm-Ease Secure protocol. Settlement is locked in the secure vault and will only be released upon your authentication of delivery metrics.</p>

                    <div className="w-full bg-white/5 p-12 rounded-[4rem] border border-white/10 mb-20 flex flex-col gap-8 text-left relative overflow-hidden group/receipt">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full"></div>
                        <div className="flex justify-between items-center relative z-10">
                            <span className="text-slate-500 font-black uppercase tracking-[0.5em] text-[10px] italic">Settlement Receipt ID</span>
                            <span className="font-mono font-black text-emerald-400 bg-emerald-900/50 px-6 py-2 rounded-2xl border border-emerald-500/20 text-sm uppercase tracking-[0.3em] shadow-lg">#FE-{Math.floor(Math.random() * 900000) + 100000}</span>
                        </div>
                        <div className="flex justify-between items-end relative z-10">
                            <div>
                                <span className="text-slate-500 font-black uppercase tracking-[0.5em] text-[10px] italic mb-3 block">Capital Magnitude</span>
                                <span className="text-6xl font-black text-white tracking-tighter italic leading-none">₹{totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-2 italic">Status</span>
                                <span className="px-6 py-2 bg-emerald-500 text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] italic shadow-emerald-500/20 shadow-xl">Funds Secured</span>
                            </div>
                        </div>
                    </div>

                    <Link to="/dashboard" className="group w-full bg-white text-slate-950 px-16 py-10 rounded-[3.5rem] font-black text-3xl hover:bg-emerald-500 hover:text-white transition-all duration-500 shadow-2xl active:scale-[0.98] flex items-center justify-center gap-8 italic uppercase tracking-tighter">
                        Track Procurement Logistics <ChevronRight size={40} className="group-hover:translate-x-2 transition-transform duration-500" strokeWidth={3} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-slate-50 pt-40 pb-32"
        >
            {isStepping && <FarmEasePay amount={totalAmount} onComplete={handleSettlementComplete} />}
            
            <div className="max-w-7xl mx-auto px-10">
                <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="mb-20"
                >
                    <Link to="/cart" className="inline-flex items-center text-slate-400 font-black text-[10px] uppercase tracking-[0.5em] hover:text-slate-950 mb-10 transition-all group italic leading-none">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 mr-6 group-hover:bg-slate-950 group-hover:text-white transition-all shadow-premium">
                             <ArrowLeft size={18} strokeWidth={4} className="group-hover:-translate-x-1 transition-transform" />
                        </div>
                        Manifest / <span className="text-slate-950 ml-2">Secure Settlement</span>
                    </Link>
                    <h1 className="text-7xl lg:text-8xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                        Secure <span className="text-emerald-600">Clearing.</span>
                    </h1>
                </motion.div>

                <div className="grid lg:grid-cols-12 gap-20 items-start">
                    {/* Settlement Manifest */}
                    <div className="lg:col-span-12 space-y-20">
                        <div className="grid lg:grid-cols-2 gap-12">
                            {/* Logistics Metadata */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-16 rounded-[4.5rem] border border-white shadow-premium flex flex-col justify-between relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-950/5 blur-3xl rounded-full"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-6 mb-12 border-b border-slate-50 pb-8">
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 italic">
                                            <MapPin className="text-slate-950" size={28} strokeWidth={3} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic">Logistics Hub</span>
                                            <h4 className="text-xl font-black text-slate-950 italic uppercase tracking-tighter mt-1">Delivery Destination</h4>
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        <div className="group/input">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] mb-3 block ml-4 italic group-focus-within/input:text-slate-950 transition-colors">Manifest Principal</label>
                                            <input type="text" className="w-full bg-slate-50 rounded-3xl px-10 py-6 border border-slate-100 outline-none focus:ring-4 focus:ring-slate-950/5 focus:bg-white focus:border-slate-950/20 font-black italic text-xl uppercase tracking-tighter placeholder:text-slate-200 transition-all" placeholder="Full Name..." />
                                        </div>
                                        <div className="group/input">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] mb-3 block ml-4 italic group-focus-within/input:text-slate-950 transition-colors">Geo-Coordinates / Address</label>
                                            <textarea rows={4} className="w-full bg-slate-50 rounded-[2.5rem] px-10 py-8 border border-slate-100 outline-none focus:ring-4 focus:ring-slate-950/5 focus:bg-white focus:border-slate-950/20 font-black italic text-xl uppercase tracking-tighter placeholder:text-slate-200 transition-all resize-none" placeholder="Standard Delivery Address..."></textarea>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Payment Protocol */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-slate-950 p-16 rounded-[4.5rem] shadow-premium relative overflow-hidden text-white flex flex-col justify-between border border-white/10"
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-500/10 blur-[60px] rounded-full"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-16 border-b border-white/10 pb-10">
                                        <div className="flex items-center gap-6">
                                            <div className="bg-emerald-500 p-5 rounded-2xl shadow-xl shadow-emerald-500/20 text-slate-950 italic">
                                                <ShieldCheck size={32} strokeWidth={3} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] italic">Farm-Ease Secure Protocol Active</span>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <Activity size={12} className="text-emerald-500 animate-pulse" />
                                                    <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Settlement Ledger</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <Sparkles className="text-white/20" size={32} />
                                    </div>

                                    <div className="space-y-6 mb-16 bg-white/5 p-8 rounded-[3rem] border border-white/5">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center group/item">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                                                    <span className="text-lg font-black text-white italic uppercase tracking-tighter opacity-80 group-hover/item:opacity-100 transition-opacity">{item.name} <span className="text-slate-500 text-sm ml-2">× {item.quantity}</span></span>
                                                </div>
                                                <span className="text-xl font-black text-emerald-400 italic font-mono tabular-nums">₹{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-white p-12 rounded-[3.5rem] flex flex-col sm:flex-row items-center justify-between gap-10 shadow-2xl relative">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-950/2 blur-3xl rounded-full"></div>
                                        <div className="text-left w-full sm:w-auto">
                                            <span className="text-slate-400 font-black uppercase tracking-[0.6em] text-[10px] block mb-3 italic">Total Settlement</span>
                                            <span className="text-6xl font-black text-slate-950 tracking-tighter italic leading-none block">₹{totalAmount.toLocaleString()}</span>
                                        </div>
                                        <button
                                            onClick={handlePaymentBegin}
                                            disabled={isProcessing}
                                            className="w-full sm:w-auto bg-slate-950 text-white px-12 py-8 rounded-[2rem] font-black text-xl uppercase tracking-[0.2em] hover:bg-emerald-600 active:scale-[0.95] transition-all duration-500 shadow-xl flex items-center justify-center gap-6 italic group/btn overflow-hidden"
                                        >
                                            {isProcessing ? (
                                                <Activity className="animate-spin" size={28} />
                                            ) : (
                                                <>
                                                    <CreditCard size={28} strokeWidth={3} className="group-hover/btn:rotate-12 transition-transform" /> Commit Payment
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Security Manifest Credentials */}
                        <div className="grid md:grid-cols-3 gap-12 pt-10">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-premium flex flex-col items-center text-center group hover:bg-slate-950 transition-all duration-500">
                                <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-8 border border-slate-100 group-hover:bg-white group-hover:rotate-6 transition-all duration-500">
                                    <Lock size={32} className="text-slate-950" strokeWidth={3} />
                                </div>
                                <h4 className="text-sm font-black text-slate-950 group-hover:text-white uppercase tracking-[0.6em] mb-3 italic transition-colors">Neural Encryption</h4>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest italic leading-relaxed group-hover:text-slate-500 transition-colors">256-bit Secure Tunnel Isolation Active</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-premium flex flex-col items-center text-center group hover:bg-emerald-600 transition-all duration-500">
                                <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-8 border border-slate-100 group-hover:bg-white group-hover:-rotate-6 transition-all duration-500">
                                    <Banknote size={32} className="text-slate-950 group-hover:text-emerald-600 transition-all duration-500" strokeWidth={3} />
                                </div>
                                <h4 className="text-sm font-black text-slate-950 group-hover:text-white uppercase tracking-[0.6em] mb-3 italic transition-colors">Zero-Loss Vault</h4>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest italic leading-relaxed group-hover:text-emerald-950 transition-colors">Capital Released Post-Quality Verification</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-premium flex flex-col items-center text-center group hover:bg-slate-950 transition-all duration-500">
                                <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-8 border border-slate-100 group-hover:bg-white group-hover:rotate-6 transition-all duration-500">
                                    <ShieldAlert size={32} className="text-slate-950" strokeWidth={3} />
                                </div>
                                <h4 className="text-sm font-black text-slate-950 group-hover:text-white uppercase tracking-[0.6em] mb-3 italic transition-colors">Settlement Shield</h4>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest italic leading-relaxed group-hover:text-slate-500 transition-colors">Patented Settlement Clearing Protocol</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
