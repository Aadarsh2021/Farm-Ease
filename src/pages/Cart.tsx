import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingCart, ArrowLeft, ShieldCheck, ChevronLeft, ChevronRight, Activity, CreditCard, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-10 py-32">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-20 rounded-[5rem] shadow-premium border border-slate-100 flex flex-col items-center max-w-2xl w-full text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-3 bg-slate-950"></div>
                    <div className="bg-slate-50 w-40 h-40 rounded-[3.5rem] flex items-center justify-center mb-12 text-slate-200 shadow-inner border border-white">
                        <ShoppingCart size={64} strokeWidth={1} />
                    </div>
                    <h2 className="text-5xl font-black text-slate-950 mb-8 tracking-tighter italic uppercase leading-none">Manifest Empty.</h2>
                    <p className="text-slate-400 mb-16 max-w-sm font-bold italic leading-relaxed text-xl opacity-80">The harvest cycle is active, but your procurement manifest remains unpopulated.</p>
                    <Link to="/market" className="bg-slate-950 text-white px-20 py-8 rounded-[2.5rem] font-black hover:bg-emerald-600 transition-all shadow-2xl active:scale-95 uppercase tracking-tighter italic text-2xl flex items-center gap-6 group">
                        Enter Marketplace <ArrowLeft size={32} className="rotate-180 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    const serviceFee = Math.round(cartTotal * 0.02);
    const finalTotal = cartTotal + serviceFee;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-50 min-h-screen pt-40 pb-32"
        >
            <div className="max-w-7xl mx-auto px-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-20 flex flex-col lg:flex-row lg:items-end justify-between gap-12"
                >
                    <div>
                        <div className="inline-flex items-center gap-3 bg-slate-950 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-6 shadow-xl italic">
                             Procurement Stage
                        </div>
                        <h1 className="text-7xl lg:text-8xl font-black text-slate-950 tracking-tighter italic leading-none uppercase">
                            Your <span className="text-emerald-600">Manifest.</span>
                        </h1>
                    </div>
                    <button onClick={clearCart} className="text-slate-400 font-black hover:text-red-500 text-[10px] flex items-center gap-4 uppercase tracking-[0.3em] bg-white px-8 py-4 rounded-3xl border border-slate-100 shadow-premium transition-all active:scale-95 italic">
                        <Trash2 size={18} strokeWidth={3} /> Purge Manifest
                    </button>
                </motion.div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-20 items-start">
                    {/* Items Stage */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white rounded-[4rem] shadow-premium border border-white overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-2 bg-slate-950/10"></div>
                            <ul className="divide-y divide-slate-50">
                                <AnimatePresence mode="popLayout">
                                    {cart.map((item, idx) => (
                                        <motion.li 
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={item.id} 
                                            className="p-12 flex flex-col md:flex-row gap-12 hover:bg-slate-50/50 transition-all group relative"
                                        >
                                            <div className="w-full md:w-56 aspect-square bg-white rounded-[3rem] overflow-hidden flex-shrink-0 flex items-center justify-center border-4 border-slate-50 relative shadow-2xl group-hover:scale-105 transition-transform duration-700">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-4">
                                                        <Leaf size={48} className="text-slate-100" />
                                                        <span className="text-[8px] font-black text-slate-200 uppercase tracking-widest italic">No Visual</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 flex flex-col justify-between py-2">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em] bg-emerald-50 px-4 py-1.5 rounded-xl italic border border-emerald-100/50">Verified Analysis</span>
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] bg-slate-50 px-4 py-1.5 rounded-xl italic border border-slate-100">Origin: {item.vendor}</span>
                                                        </div>
                                                        <h3 className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase group-hover:text-emerald-600 transition-colors leading-none">{item.name}</h3>
                                                        <div className="flex items-center gap-4 text-slate-400">
                                                            <Activity size={14} className="text-emerald-500" />
                                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">Security ID: {item.vendor_id.slice(0, 8)}...</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-slate-100 hover:text-red-500 p-6 rounded-[2rem] hover:bg-red-50 transition-all active:scale-90 border border-transparent hover:border-red-100"
                                                    >
                                                        <Trash2 size={28} strokeWidth={3} />
                                                    </button>
                                                </div>

                                                <div className="flex items-end justify-between mt-12 bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-50">
                                                    <div className="flex items-center bg-white border border-slate-100 rounded-[1.5rem] p-2 shadow-premium scale-110 ml-4">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-10"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <ChevronLeft size={24} strokeWidth={4} />
                                                        </button>
                                                        <span className="w-16 text-center text-2xl font-black text-slate-950 italic select-none">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-emerald-600 hover:bg-slate-50 rounded-xl transition-all"
                                                        >
                                                            <ChevronRight size={24} strokeWidth={4} />
                                                        </button>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-2 italic">Unit Sum</p>
                                                        <p className="text-4xl font-black text-slate-950 tracking-tighter italic leading-none">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </ul>

                            <div className="bg-slate-950 p-12 flex justify-between items-center group/footer">
                                <Link to="/market" className="text-white font-black hover:text-emerald-400 flex items-center gap-6 text-[10px] uppercase tracking-[0.5em] transition-all italic underline-offset-8 hover:underline decoration-2">
                                    <ArrowLeft size={24} strokeWidth={3} className="group-hover/footer:-translate-x-2 transition-transform" /> Resume Procurement
                                </Link>
                                <div className="flex items-center gap-4">
                                    <Activity size={12} className="text-emerald-500 animate-pulse" />
                                    <span className="text-white/20 font-black text-[9px] tracking-[0.6em] uppercase italic">System: Synchronized</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Settlement Stage */}
                    <div className="lg:col-span-4 mt-20 lg:mt-0">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[4rem] shadow-premium border border-white p-14 sticky top-40"
                        >
                            <h2 className="text-4xl font-black text-slate-950 mb-12 tracking-tighter italic uppercase border-b border-slate-50 pb-8 flex items-center gap-6">
                                Settlement <div className="w-12 h-1 bg-slate-950"></div>
                            </h2>

                            <div className="space-y-10 mb-16">
                                <div className="flex justify-between items-center group/fee">
                                    <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] group-hover/fee:text-slate-600 transition-colors italic">Gross Capital</span>
                                    <span className="font-black text-slate-950 text-2xl italic tracking-tighter leading-none">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center group/fee">
                                    <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] group-hover/fee:text-emerald-600 transition-colors italic">Farm-Ease Secure Allocation (2%)</span>
                                    <span className="font-black text-emerald-600 text-2xl italic tracking-tighter leading-none">₹{serviceFee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center group/fee">
                                    <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] italic mb-1 block">Logistics Estimation</span>
                                    <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] bg-slate-50 px-6 py-2.5 rounded-2xl italic border border-slate-100/50 shadow-inner group-hover/fee:bg-slate-950 group-hover/fee:text-white transition-all">Pending Sync</span>
                                </div>
                            </div>

                            <div className="border-t-[4px] border-slate-950 pt-12 mb-16 bg-slate-50/30 -mx-14 px-14 py-10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
                                <div className="flex justify-between items-end relative z-10">
                                    <div className="flex flex-col">
                                         <span className="text-slate-400 font-black uppercase tracking-[0.5em] text-[10px] mb-3 italic">Total Obligation</span>
                                         <span className="bg-emerald-600 text-white text-[9px] font-black px-4 py-1 rounded-xl uppercase tracking-[0.4em] w-fit italic shadow-lg">Cleared For Release</span>
                                    </div>
                                    <span className="text-6xl font-black text-slate-950 tracking-tighter italic leading-none">₹{finalTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <Link to="/checkout" className="w-full group/btn relative bg-slate-950 text-white py-10 rounded-[3rem] font-black text-3xl hover:bg-emerald-600 active:scale-[0.98] transition-all duration-500 shadow-2xl flex items-center justify-center gap-8 italic uppercase tracking-tighter overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    <CreditCard size={36} strokeWidth={3} className="group-hover:rotate-12 transition-transform duration-500" /> Commit Payment
                                </Link>
                                
                                <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 relative overflow-hidden flex flex-col gap-8 group/trust">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/100 opacity-50"></div>
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className="bg-white p-5 rounded-2xl text-emerald-600 shadow-premium border border-slate-50 group-hover/trust:rotate-6 transition-transform">
                                            <ShieldCheck size={32} strokeWidth={3} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-950 text-[10px] italic uppercase tracking-[0.4em] leading-none mb-2">Farm-Ease Secure Protection</h4>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest italic leading-none">Protocol Operational</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed italic border-t border-slate-200/50 pt-8 relative z-10">
                                        Your capital is held within the Farm-Ease secure clearing system. Settlement is disbursed to the node only AFTER you authenticate delivery quality.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
