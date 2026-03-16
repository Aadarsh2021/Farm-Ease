import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingCart, ArrowLeft, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

    if (cart.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4 py-32">
                <div className="bg-white p-12 rounded-[3.5rem] shadow-premium border border-slate-100 flex flex-col items-center max-w-lg w-full text-center">
                    <div className="bg-green-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 text-green-500 shadow-inner">
                        <ShoppingCart size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Your cart is empty</h2>
                    <p className="text-slate-500 mb-10 max-w-sm font-bold leading-relaxed italic">The harvest is plentiful, but your basket remains light. Begin your collection.</p>
                    <Link to="/market" className="bg-slate-900 text-white px-12 py-5 rounded-3xl font-black hover:bg-green-600 transition-all shadow-2xl active:scale-95 uppercase tracking-widest text-sm">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 flex items-center justify-between">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">Shopping <span className="text-green-600">Cart</span></h1>
                    <button onClick={clearCart} className="text-red-500 font-black hover:text-red-600 text-xs flex items-center gap-2 uppercase tracking-widest bg-red-50 px-4 py-2 rounded-xl transition-colors hover:bg-red-100">
                        <Trash2 size={16} /> Discard All
                    </button>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">
                            <ul className="divide-y divide-slate-50">
                                {cart.map((item) => (
                                    <li key={item.id} className="p-8 flex flex-col sm:flex-row gap-8 hover:bg-slate-50/50 transition-colors group">
                                        {/* Image Placeholder */}
                                        <div className="w-full sm:w-40 aspect-square bg-slate-50 rounded-[2rem] overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100 relative group-hover:scale-[1.02] transition-transform">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain p-4" />
                                            ) : (
                                                <ShoppingCart size={32} className="text-slate-200" />
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div className="max-w-[80%]">
                                                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-green-600 transition-colors tracking-tight leading-tight">{item.name}</h3>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Origin: {item.vendor}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-slate-300 hover:text-red-500 p-2.5 rounded-xl hover:bg-red-50 transition-all active:scale-90"
                                                >
                                                    <Trash2 size={22} />
                                                </button>
                                            </div>

                                            <div className="flex items-end justify-between mt-8">
                                                <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-20"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <ChevronLeft size={20} strokeWidth={3} />
                                                    </button>
                                                    <span className="w-12 text-center text-lg font-black text-slate-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-slate-50 rounded-xl transition-all"
                                                    >
                                                        <ChevronRight size={20} strokeWidth={3} />
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">₹{item.price} / {item.unit}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="bg-slate-900 p-8">
                                <Link to="/market" className="text-white font-black hover:text-green-400 flex items-center gap-3 w-fit text-sm uppercase tracking-widest transition-colors group/link">
                                    <ArrowLeft size={18} className="group-hover/link:-translate-x-1 transition-transform" /> Back to Fields
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4 mt-8 lg:mt-0">
                        <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 p-10 sticky top-32">
                            <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Harvest Summary</h2>

                            <div className="space-y-6 mb-8">
                                <div className="flex justify-between text-slate-500 font-bold">
                                    <span>Produce Subtotal</span>
                                    <span className="font-black text-slate-900 italic">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-500 font-bold">
                                    <span>Escrow Service Fee (2%)</span>
                                    <span className="font-black text-slate-900 italic">₹{Math.round(cartTotal * 0.02).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-500 font-bold">
                                    <span>Logistics</span>
                                    <span className="text-green-600 text-xs font-black uppercase tracking-widest bg-green-50 px-3 py-1 rounded-lg">Pending Calc</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-50 pt-8 mb-10">
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Final Obligation</span>
                                    <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{(cartTotal + Math.round(cartTotal * 0.02)).toLocaleString()}</span>
                                </div>
                            </div>

                            <Link to="/checkout" className="w-full block text-center bg-slate-900 text-white px-8 py-5 rounded-3xl font-black text-lg hover:bg-green-600 transition-all shadow-premium hover:shadow-2xl active:scale-95">
                                Finalize Order
                            </Link>

                            <div className="mt-8 bg-green-50/50 rounded-[2rem] p-6 flex flex-col gap-4 border border-green-100/50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-xl text-green-600 shadow-sm border border-green-100">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <h4 className="font-black text-green-900 text-sm italic uppercase tracking-widest">Escrow Vault™ Protection</h4>
                                </div>
                                <p className="text-xs text-green-700/70 font-bold leading-relaxed">Your payment is held in our secure legal vault. Funds only transition to the harvester AFTER you verify the quality of delivery.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
