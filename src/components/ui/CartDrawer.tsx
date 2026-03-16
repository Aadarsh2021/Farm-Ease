import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CartDrawer() {
    const { cart, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[150]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[hsl(var(--background))] shadow-2xl z-[160] flex flex-col border-s border-[hsl(var(--border))]"
                    >
                        <div className="p-8 flex justify-between items-center border-b border-[hsl(var(--border))]">
                            <div className="flex items-center gap-3">
                                <div className="bg-[hsl(var(--primary))] text-white p-2.5 rounded-2xl shadow-glow">
                                    <ShoppingBag size={20} />
                                </div>
                                <h2 className="text-xl font-black tracking-tighter text-[hsl(var(--foreground))]">Your Collection</h2>
                            </div>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-3 rounded-2xl bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--primary))] hover:text-white transition-all shadow-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="bg-[hsl(var(--muted))] p-8 rounded-[2.5rem] mb-6 text-[hsl(var(--muted-foreground))] opacity-20">
                                        <ShoppingBag size={64} strokeWidth={1} />
                                    </div>
                                    <h3 className="text-lg font-black text-[hsl(var(--foreground))] mb-2 tracking-tight">Empty Harvest</h3>
                                    <p className="text-[hsl(var(--muted-foreground))] text-sm font-medium leading-relaxed max-w-[200px]">
                                        Your market collection is currently empty. Start sourcing strategic assets.
                                    </p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <motion.div
                                        layout
                                        key={item.id}
                                        className="flex gap-5 p-4 rounded-3xl bg-white border border-[hsl(var(--border))] shadow-premium group/item"
                                    >
                                        <div className="w-20 h-20 bg-[hsl(var(--muted))] rounded-2xl overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[hsl(var(--muted-foreground))]">
                                                    <ShoppingBag size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-sm font-bold text-[hsl(var(--foreground))] line-clamp-1">{item.name}</h4>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-[hsl(var(--muted-foreground))] hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-black text-[hsl(var(--primary))]">₹{item.price}</span>
                                                <div className="flex items-center gap-3 bg-[hsl(var(--muted))] p-1 rounded-xl">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1.5 rounded-lg hover:bg-white transition-colors"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1.5 rounded-lg hover:bg-white transition-colors"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-8 bg-white border-t border-[hsl(var(--border))] space-y-6">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Total Investment</span>
                                    <span className="text-3xl font-black text-[hsl(var(--foreground))] tracking-tighter">₹{cartTotal}</span>
                                </div>
                                <Link
                                    to="/checkout"
                                    onClick={() => setIsCartOpen(false)}
                                    className="w-full flex items-center justify-between bg-[hsl(var(--foreground))] text-[hsl(var(--background))] p-5 rounded-3xl font-black hover:bg-[hsl(var(--primary))] transition-all shadow-elite group"
                                >
                                    <span className="uppercase tracking-widest text-xs">Secure Checkout</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <p className="text-center text-[10px] text-[hsl(var(--muted-foreground))] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    <ShoppingBag size={12} />
                                    Escrow Protection Enabled
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
