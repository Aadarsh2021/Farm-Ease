import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ShieldCheck, CreditCard, Banknote, CheckCircle, MapPin, Truck, Lock, Leaf } from "lucide-react";

export default function Checkout() {
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState("escrow");
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Platform fee is 2%
    const platformFee = Math.round(cartTotal * 0.02);
    const totalAmount = cartTotal + platformFee;

    const handlePayment = async () => {
        setIsProcessing(true);
        if (!user) {
            alert("Please log in to place an order.");
            setIsProcessing(false);
            return;
        }

        try {
            for (const item of cart) {
                const { error } = await supabase.from('orders').insert({
                    buyer_id: user.uid,
                    seller_id: item.vendor_id,
                    product_name: item.name,
                    quantity: item.quantity,
                    amount: item.price * item.quantity,
                    status: 'pending',
                    escrow_held: paymentMethod === 'escrow'
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
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4 py-32">
                <div className="bg-white p-12 rounded-[3rem] shadow-premium border border-slate-100 text-center max-w-lg">
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Your cart is empty</h2>
                    <p className="text-slate-500 mb-10 font-bold italic">You need some harvest in your basket to proceed to checkout.</p>
                    <Link to="/market" className="bg-slate-900 text-white px-10 py-4 rounded-3xl font-black hover:bg-green-600 transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs">
                        Return to Market
                    </Link>
                </div>
            </div>
        );
    }

    if (orderPlaced) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50 px-4 py-32">
                <div className="bg-white p-16 rounded-[4rem] shadow-premium border border-green-100 flex flex-col items-center text-center max-w-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                    <div className="bg-green-50 text-green-500 p-8 rounded-[2.5rem] mb-10 relative shadow-inner">
                        <CheckCircle size={64} strokeWidth={2.5} />
                        <span className="absolute -top-2 -right-2 flex h-8 w-8">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-8 w-8 bg-green-500"></span>
                        </span>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Payment Secured!</h2>
                    <p className="text-slate-600 mb-10 text-lg leading-relaxed font-medium">Your funds are now safely locked in <span className="text-green-600 font-black italic">Farm-Ease Escrow Vault™</span>. We only release it to the vendor once you confirm the harvest quality.</p>

                    <div className="w-full bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-12 flex flex-col gap-4 text-left shadow-inner">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Reference Code</span>
                            <span className="font-mono font-black text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-100">ORD-{(Math.random() * 1000000).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Held in Escrow</span>
                            <span className="text-2xl font-black text-green-600 tracking-tighter">₹{totalAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    <Link to="/dashboard" className="w-full bg-slate-900 text-white px-10 py-5 rounded-3xl font-black text-xl hover:bg-green-600 transition-all shadow-premium hover:shadow-2xl active:scale-95">
                        Track My Order
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-12">
                    <Link to="/cart" className="inline-flex items-center text-slate-400 font-black text-xs uppercase tracking-widest hover:text-green-600 mb-4 transition-all group">
                        <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Basket
                    </Link>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">Secure <span className="text-green-600">Checkout</span></h1>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">

                    {/* Checkout Form */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* Delivery Details */}
                        <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 p-10 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-slate-50"></div>
                            <h2 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-4 tracking-tight">
                                <span className="bg-slate-900 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black italic shadow-lg">01</span>
                                Logistics Destination
                                <MapPin className="text-slate-200" size={24} />
                            </h2>

                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                                        <input type="text" className="w-full rounded-2xl border-none bg-slate-50 px-6 py-4 outline-none ring-2 ring-transparent focus:ring-green-500/20 focus:bg-white transition-all font-bold placeholder:text-slate-300 shadow-inner" placeholder="Prakash" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                                        <input type="text" className="w-full rounded-2xl border-none bg-slate-50 px-6 py-4 outline-none ring-2 ring-transparent focus:ring-green-500/20 focus:bg-white transition-all font-bold placeholder:text-slate-300 shadow-inner" placeholder="Sharma" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verified Contact</label>
                                    <input type="tel" className="w-full rounded-2xl border-none bg-slate-50 px-6 py-4 outline-none ring-2 ring-transparent focus:ring-green-500/20 focus:bg-white transition-all font-bold placeholder:text-slate-300 shadow-inner" placeholder="+91 98765 43210" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Address</label>
                                    <textarea rows={4} className="w-full rounded-2xl border-none bg-slate-50 px-6 py-4 outline-none ring-2 ring-transparent focus:ring-green-500/20 focus:bg-white transition-all font-bold placeholder:text-slate-300 shadow-inner resize-none" placeholder="123 Harvest Lane, Greenfield District..."></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">District / City</label>
                                        <input type="text" className="w-full rounded-2xl border-none bg-slate-50 px-6 py-4 outline-none ring-2 ring-transparent focus:ring-green-500/20 focus:bg-white transition-all font-bold shadow-inner" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PIN / Postal</label>
                                        <input type="text" className="w-full rounded-2xl border-none bg-slate-50 px-6 py-4 outline-none ring-2 ring-transparent focus:ring-green-500/20 focus:bg-white transition-all font-bold shadow-inner" />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-[3rem] shadow-premium border border-slate-100 p-10 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-green-50/50 rounded-bl-full -z-0 opacity-50 blur-2xl"></div>

                            <h2 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-4 tracking-tight relative z-10">
                                <span className="bg-slate-900 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black italic shadow-lg">02</span>
                                Trust Mechanism
                                <Lock className="text-slate-200" size={24} />
                            </h2>

                            <div className="space-y-6 relative z-10">
                                <label className={`block border-2 rounded-[2.5rem] p-8 cursor-pointer transition-all ${paymentMethod === 'escrow' ? 'border-green-500 bg-green-50 shadow-lg' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 opacity-50'}`}>
                                    <div className="flex items-start gap-6">
                                        <div className="mt-1">
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="escrow"
                                                checked={paymentMethod === 'escrow'}
                                                onChange={() => setPaymentMethod('escrow')}
                                                className="w-6 h-6 text-green-600 focus:ring-slate-900"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className="text-green-600" size={24} strokeWidth={3} />
                                                    <span className="font-black text-slate-900 text-2xl tracking-tight">Farm-Ease Escrow™</span>
                                                </div>
                                                <div className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">Mandatory Protection</div>
                                            </div>
                                            <p className="text-sm font-bold text-slate-500 italic">Pay via UPI, Cards or Net Banking. Your money is held in our secure legal vault. 100% Protection for both buyer & harvester.</p>
                                        </div>
                                    </div>
                                </label>

                                <label className="block border-2 border-slate-50 bg-slate-50/20 rounded-[2rem] p-6 cursor-not-allowed opacity-30">
                                    <div className="flex items-center gap-6">
                                        <div className="bg-slate-100 p-2 rounded-xl">
                                            <Banknote className="text-slate-300" size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-slate-300 text-lg uppercase tracking-widest">Cash on Delivery</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-300 italic">Disabled to prevent trade default and middleman exploitation.</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-5 mt-8 lg:mt-0">
                        <div className="bg-slate-900 rounded-[3.5rem] shadow-premium p-10 md:p-12 sticky top-32 text-white">
                            <h2 className="text-2xl font-black mb-10 tracking-tight flex items-center justify-between">
                                Manifest List
                                <Truck size={24} className="text-green-500" />
                            </h2>

                            {/* Mini Cart Items */}
                            <div className="max-h-[300px] overflow-y-auto mb-10 pr-4 space-y-6 custom-scrollbar">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-6 group">
                                        <div className="w-20 h-20 bg-white/5 rounded-2xl flex-shrink-0 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain p-3" />
                                            ) : (
                                                <Leaf size={24} className="text-white/20" />
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h4 className="text-md font-black text-white line-clamp-1 italic tracking-tight">{item.name}</h4>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">Qty {item.quantity}</span>
                                                <span className="text-lg font-black text-green-400">₹{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-6 mb-10 border-t border-white/10 pt-8">
                                <div className="flex justify-between text-white/40 font-black uppercase tracking-widest text-[10px]">
                                    <span>Base Produce</span>
                                    <span className="text-white italic">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-white/40 font-black uppercase tracking-widest text-[10px]">
                                    <span>Escrow Vault Fee (2%)</span>
                                    <span className="text-white italic">₹{platformFee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-white/40 font-black uppercase tracking-widest text-[10px]">
                                    <span>Logistic Chain</span>
                                    <span className="text-green-500">OPTIMIZED</span>
                                </div>
                            </div>

                            <div className="border-t border-white/20 pt-8 mb-10">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px] block mb-2">Final Settlement</span>
                                        <span className="text-12 text-white font-black italic">Net Obligation</span>
                                    </div>
                                    <span className="text-5xl font-black text-green-500 tracking-tighter italic">₹{totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full flex items-center justify-center gap-4 bg-green-500 text-slate-900 px-8 py-6 rounded-[2rem] font-black text-xl hover:bg-white transition-all shadow-premium hover:shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center gap-3">
                                        <div className="w-6 h-6 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                        Locking Escrow...
                                    </span>
                                ) : (
                                    <><CreditCard size={24} strokeWidth={3} className="group-hover:rotate-12 transition-transform" /> Commit Payment</>
                                )}
                            </button>
                            <div className="mt-8 text-center">
                                <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                    <ShieldCheck size={16} className="text-green-500/50" /> 256-BIT SECURE ENCRYPTION
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
