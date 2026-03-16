import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingCart, ArrowLeft, ShieldCheck, ChevronLeft, ChevronRight, Activity, CreditCard, Leaf, Box, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-10 py-32 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-[150px] pointer-events-none"></div>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900/40 backdrop-blur-3xl p-20 rounded-[5rem] shadow-2xl border border-white/5 flex flex-col items-center max-w-2xl w-full text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]"></div>
                    <div className="bg-slate-950 w-40 h-40 rounded-[4rem] flex items-center justify-center mb-12 text-slate-800 shadow-2xl border border-white/5">
                        <ShoppingCart size={64} strokeWidth={1} />
                    </div>
                    <h2 className="text-6xl font-black text-white mb-8 tracking-tighter italic uppercase leading-none">Manifest Empty.</h2>
                    <p className="text-slate-500 mb-16 max-w-sm font-bold italic leading-relaxed text-xl uppercase tracking-widest text-xs opacity-60">The harvest cycle is active, but your procurement manifest remains unpopulated.</p>
                    <Link to="/market" className="bg-emerald-600 text-slate-950 px-20 py-8 rounded-[2.5rem] font-black hover:bg-white transition-all shadow-2xl active:scale-95 uppercase tracking-tighter italic text-2xl flex items-center gap-8 group border border-emerald-400/20">
                        Enter Marketplace <ArrowLeft size={32} className="rotate-180 group-hover:translate-x-4 transition-transform duration-500" strokeWidth={4} />
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
            className="bg-slate-950 min-h-screen pt-40 pb-32 relative overflow-hidden"
        >
            {/* Background Aesthetics */}
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-600/5 rounded-full blur-[180px] -mr-96 -mt-96 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] -ml-64 -mb-64 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-10 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-20 flex flex-col lg:flex-row lg:items-end justify-between gap-12"
                >
                    <div>
                        <div className="inline-flex items-center gap-4 bg-emerald-600 text-slate-950 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.5em] mb-6 shadow-2xl italic border border-emerald-400/20">
                             Procurement Stage
                        </div>
                        <h1 className="text-7xl lg:text-9xl font-black text-white tracking-tighter italic leading-none uppercase">
                            Your <span className="text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">Manifest.</span>
                        </h1>
                    </div>
                    <button onClick={clearCart} className="text-slate-500 font-black hover:text-red-500 text-[10px] flex items-center gap-6 uppercase tracking-[0.4em] bg-white/5 px-10 py-5 rounded-[2rem] border border-white/5 shadow-2xl transition-all active:scale-95 italic group hover:bg-red-500/10">
                        <Trash2 size={20} strokeWidth={4} className="group-hover:rotate-12 transition-transform" /> Purge Manifest
                    </button>
                </motion.div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-20 items-start">
                    {/* Items Stage */}
                    <div className="lg:col-span-8 space-y-10">
                        <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[4rem] shadow-2xl border border-white/5 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600/10"></div>
                            <ul className="divide-y divide-white/5">
                                <AnimatePresence mode="popLayout">
                                    {cart.map((item, idx) => (
                                        <motion.li 
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={item.id} 
                                            className="p-12 flex flex-col md:flex-row gap-12 hover:bg-white/5 transition-all group relative"
                                        >
                                            <div className="w-full md:w-56 aspect-square bg-slate-950 rounded-[3rem] overflow-hidden flex-shrink-0 flex items-center justify-center border-8 border-white/5 relative shadow-2xl group-hover:scale-105 transition-transform duration-1000">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[30%] group-hover:grayscale-0 opacity-80 group-hover:opacity-100" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-6">
                                                        <Box size={48} className="text-slate-800" strokeWidth={1} />
                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.6em] italic">Void</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 flex flex-col justify-between py-2">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-6">
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] bg-emerald-500/10 px-5 py-2 rounded-xl italic border border-emerald-500/20">Verified Asset</span>
                                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] bg-white/5 px-5 py-2 rounded-xl italic border border-white/5 truncate max-w-[200px]">Node: {item.vendor}</span>
                                                        </div>
                                                        <h3 className="text-5xl font-black text-white tracking-tighter italic uppercase group-hover:text-emerald-500 transition-colors leading-none">{item.name}</h3>
                                                        <div className="flex items-center gap-6 text-slate-600">
                                                            <Activity size={16} className="text-emerald-500/50" />
                                                            <p className="text-[10px] font-black uppercase tracking-[0.5em] italic leading-none">Security ID: {item.vendor_id.slice(0, 12)}...</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-slate-800 hover:text-red-500 p-8 rounded-[2.5rem] hover:bg-red-500/10 transition-all active:scale-75 border border-transparent hover:border-red-500/20"
                                                    >
                                                        <Trash2 size={32} strokeWidth={4} />
                                                    </button>
                                                </div>

                                                <div className="flex items-end justify-between mt-12 bg-slate-950/40 p-10 rounded-[3rem] border border-white/5 shadow-inner">
                                                    <div className="flex items-center bg-slate-950 border border-white/10 rounded-[2rem] p-3 shadow-2xl scale-110 ml-6">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-14 h-14 flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/5 rounded-xl transition-all disabled:opacity-5"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <ChevronLeft size={28} strokeWidth={5} />
                                                        </button>
                                                        <span className="w-20 text-center text-3xl font-black text-white italic select-none px-4">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-14 h-14 flex items-center justify-center text-slate-600 hover:text-emerald-500 hover:bg-white/5 rounded-xl transition-all"
                                                        >
                                                            <ChevronRight size={28} strokeWidth={5} />
                                                        </button>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mb-3 italic">Unit Sum</p>
                                                        <p className="text-5xl font-black text-white tracking-tighter italic leading-none">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </ul>

                            <div className="bg-slate-950 p-16 flex justify-between items-center group/footer border-t border-white/5">
                                <Link to="/market" className="text-slate-500 font-black hover:text-emerald-400 flex items-center gap-8 text-[10px] uppercase tracking-[0.6em] transition-all italic group">
                                    <ArrowLeft size={24} strokeWidth={4} className="group-hover:-translate-x-4 transition-transform duration-500" /> Resume Procurement
                                </Link>
                                <div className="flex items-center gap-6">
                                    <Activity size={14} className="text-emerald-500 animate-pulse" />
                                    <span className="text-slate-800 font-black text-[10px] tracking-[0.8em] uppercase italic">System: Synchronized</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Settlement Stage */}
                    <div className="lg:col-span-4 mt-20 lg:mt-0">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-900/40 backdrop-blur-3xl rounded-[4rem] shadow-2xl border border-white/5 p-16 sticky top-40"
                        >
                            <h2 className="text-4xl font-black text-white mb-16 tracking-tighter italic uppercase border-b border-white/5 pb-10 flex items-center justify-between">
                                Settlement <div className="w-16 h-1 bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                            </h2>

                            <div className="space-y-12 mb-20">
                                <div className="flex justify-between items-center group/fee">
                                    <span className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] group-hover/fee:text-white transition-colors italic">Gross Capital</span>
                                    <span className="font-black text-white text-3xl italic tracking-tighter leading-none">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center group/fee">
                                    <span className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] group-hover/fee:text-emerald-500 transition-colors italic leading-relaxed max-w-[150px]">Secure Protocol Fee (2%)</span>
                                    <span className="font-black text-emerald-500 text-3xl italic tracking-tighter leading-none">₹{serviceFee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center group/fee">
                                    <span className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] italic mb-1 block">Logistics Param</span>
                                    <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] bg-white/5 px-8 py-3 rounded-2xl italic border border-white/5 shadow-inner group-hover/fee:bg-white group-hover/fee:text-slate-950 transition-all">Pending Sync</span>
                                </div>
                            </div>

                            <div className="border-t-[6px] border-emerald-600 pt-16 mb-16 bg-white/5 -mx-16 px-16 py-12 relative overflow-hidden group/total">
                                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/total:opacity-100 transition-opacity duration-1000"></div>
                                <div className="flex justify-between items-end relative z-10">
                                    <div className="flex flex-col">
                                         <span className="text-slate-500 font-black uppercase tracking-[0.6em] text-[10px] mb-4 italic">Total Liability</span>
                                         <span className="bg-emerald-600 text-slate-950 text-[10px] font-black px-6 py-2 rounded-[1rem] uppercase tracking-[0.5em] w-fit italic shadow-2xl border border-emerald-400/20">Approved for Release</span>
                                    </div>
                                    <span className="text-7xl font-black text-white tracking-tighter italic leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">₹{finalTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <Link to="/checkout" className="w-full group/btn relative bg-emerald-600 text-slate-950 py-12 rounded-[4rem] font-black text-4xl hover:bg-white active:scale-[0.98] transition-all duration-700 shadow-[0_30px_70px_rgba(16,185,129,0.2)] flex items-center justify-center gap-10 italic uppercase tracking-tighter overflow-hidden border border-emerald-400/20">
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    <CreditCard size={44} strokeWidth={4} className="group-hover:rotate-12 transition-transform duration-500" /> Commit Payment
                                </Link>
                                
                                <div className="bg-slate-950/60 rounded-[3.5rem] p-12 border border-white/5 relative overflow-hidden flex flex-col gap-10 group/trust">
                                    <div className="absolute -right-16 -bottom-16 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
                                    <div className="flex items-center gap-8 relative z-10">
                                        <div className="bg-white/5 p-6 rounded-[2rem] text-emerald-500 shadow-2xl border border-white/5 group-hover/trust:rotate-12 transition-transform duration-700">
                                            <ShieldCheck size={36} strokeWidth={3} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-[10px] italic uppercase tracking-[0.5em] leading-none mb-3">Farm-Ease Secure Guard</h4>
                                            <div className="flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                                                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest italic leading-none">Deep Crypt Mesh Active</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed italic border-t border-white/5 pt-10 relative z-10 uppercase tracking-wider opacity-80">
                                        Your capital is secured within the Farm-Ease protocol. Settlement is authorized ONLY after final node authentication of asset integrity.
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
