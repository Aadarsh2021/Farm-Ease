import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { ShoppingCart, ShieldCheck, Star, ArrowLeft, Activity, Leaf, MapPin, Store, Minus, Plus, Box, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ProductType = {
    id: string;
    name: string;
    price: number;
    unit: string;
    stock: number;
    category: string;
    vendor: string;
    vendor_id: string;
    image: string;
    description: string;
    location: string;
    rating: number;
    reviews: number;
};

export default function ProductDetails() {
    const { id: productId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<ProductType | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        async function fetchProduct() {
            if (!productId) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("products")
                    .select("*")
                    .eq("id", productId)
                    .single();

                if (error || !data) {
                    console.error("Error fetching product:", error);
                    setProduct(null);
                } else {
                    const formattedProduct: ProductType = {
                        id: data.id,
                        name: data.name,
                        price: data.price,
                        unit: data.unit,
                        stock: data.stock,
                        category: data.category,
                        vendor: data.seller_id.startsWith("vendor_") ? data.seller_id.replace("vendor_", "").replace("_", " ").toUpperCase() : "Verified Farmer",
                        vendor_id: data.seller_id,
                        image: data.image_url || "",
                        description: data.description || "No description provided.",
                        location: "Verified Location",
                        rating: 4.8,
                        reviews: 12
                    };
                    setProduct(formattedProduct);
                }
            } catch (err) {
                console.error("Catch error fetching product:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [productId]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            vendor: product.vendor,
            vendor_id: product.vendor_id,
            image: product.image,
            quantity: quantity,
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 pt-20">
                <div className="w-16 h-16 border-4 border-white/5 border-t-emerald-500 rounded-full animate-spin mb-8"></div>
                <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-[10px] italic">Accessing Asset Profile...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 pt-20 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="bg-white/5 p-12 rounded-[4rem] border border-white/5 shadow-2xl mb-12 backdrop-blur-3xl">
                    <Leaf size={80} className="text-slate-800" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tighter italic uppercase text-center">Asset Metadata Redacted</h1>
                <p className="text-slate-500 mb-12 text-center max-w-sm font-bold italic uppercase tracking-widest text-xs leading-relaxed opacity-60">The requested resource has been removed from the central market or has shifted location parameters.</p>
                <Link to="/market" className="bg-emerald-600 text-slate-950 px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] hover:bg-white transition-all active:scale-95 shadow-2xl italic border border-emerald-400/20">
                    Return to Marketplace
                </Link>
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

            <div className="max-w-7xl mx-auto px-10 relative z-10">

                {/* Navigation */}
                <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="mb-16"
                >
                    <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-emerald-400 transition-all text-[10px] font-black uppercase tracking-[0.5em] group italic">
                        <div className="bg-white/5 p-5 rounded-3xl border border-white/5 mr-8 group-hover:bg-emerald-600 group-hover:text-slate-950 group-hover:border-emerald-400/20 shadow-2xl transition-all duration-500 group-hover:rotate-12">
                            <ArrowLeft size={20} strokeWidth={4} />
                        </div>
                        Market Manifest / <span className="text-white ml-2 opacity-100">Asset Profile</span>
                    </button>
                </motion.div>

                <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[5rem] shadow-2xl border border-white/5 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

                        {/* Visual Asset Side */}
                        <div className="p-16 lg:p-24 flex flex-col items-center justify-center bg-slate-950/50 relative group overflow-hidden border-r border-white/5">
                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent)] pointer-events-none"></div>
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1, ease: "circOut" }}
                                className="w-full aspect-square bg-slate-950 rounded-[4rem] flex items-center justify-center relative overflow-hidden shadow-2xl border-[12px] border-white/5 group-hover:scale-[1.02] transition-transform duration-1000"
                            >
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover opacity-60 transition-opacity duration-1000 group-hover:opacity-100 grayscale-[50%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-10">
                                        <div className="bg-white/5 p-16 rounded-[4rem] shadow-2xl border border-white/5">
                                            <Box size={140} className="text-slate-800" strokeWidth={1} />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.8em] italic leading-none">Visual Void</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60"></div>
                            </motion.div>
                        </div>

                        {/* Specification Side */}
                        <div className="p-16 lg:p-24 flex flex-col bg-slate-950/20">

                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="mb-12 flex items-center justify-between"
                            >
                                <span className="px-8 py-3 bg-emerald-600 text-slate-950 text-[10px] font-black rounded-2xl uppercase tracking-[0.4em] shadow-2xl italic border border-emerald-400/20">
                                    {product.category || "General Asset"}
                                </span>
                                <div className="flex items-center gap-5 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 shadow-2xl">
                                    <div className="flex items-center text-emerald-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} className={i < Math.floor(product.rating) ? "text-emerald-500" : "text-slate-800"} strokeWidth={3} />
                                        ))}
                                    </div>
                                    <span className="text-white font-black text-sm italic">{product.rating}</span>
                                </div>
                            </motion.div>

                            <motion.h1 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-7xl lg:text-8xl font-black text-white mb-10 tracking-tighter italic uppercase leading-none"
                            >
                                {product.name}
                            </motion.h1>

                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-end gap-8 mb-16"
                            >
                                <span className="text-8xl font-black text-white tracking-tighter italic drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">₹{product.price.toLocaleString()}</span>
                                <span className="text-slate-500 font-black uppercase tracking-[0.5em] text-[12px] mb-8 italic leading-none border-l border-white/5 pl-8">Per {product.unit} Prc</span>
                            </motion.div>

                            {/* Node Metadata */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-16">
                                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white/5 rounded-[3rem] p-10 border border-white/5 flex items-center gap-8 shadow-2xl group/card hover:bg-white hover:border-white transition-all duration-700 cursor-default">
                                    <div className="bg-slate-950 p-6 rounded-[1.5rem] text-emerald-500 shadow-2xl group-hover/card:bg-slate-950 group-hover/card:text-emerald-500 transition-all duration-700 border border-white/5"><Store size={32} strokeWidth={4} /></div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] uppercase tracking-[0.5em] font-black text-slate-500 mb-2 transition-colors italic">Origin Node</p>
                                        <p className="font-black text-white text-2xl tracking-tighter italic group-hover/card:text-slate-950 truncate transition-colors uppercase leading-none">{product.vendor}</p>
                                    </div>
                                </motion.div>
                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white/5 rounded-[3rem] p-10 border border-white/5 flex items-center gap-8 shadow-2xl group/card hover:bg-emerald-600 hover:border-emerald-500 transition-all duration-700 cursor-default">
                                    <div className="bg-slate-950 p-6 rounded-[1.5rem] text-blue-500 shadow-2xl group-hover/card:bg-slate-950 group-hover/card:text-blue-500 transition-all duration-700 border border-white/5"><MapPin size={32} strokeWidth={4} /></div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] uppercase tracking-[0.5em] font-black text-slate-500 group-hover/card:text-white mb-2 transition-colors italic">Bio-Reg</p>
                                        <p className="font-black text-white text-2xl tracking-tighter italic group-hover/card:text-slate-950 transition-colors uppercase leading-none truncate">{product.location}</p>
                                    </div>
                                </motion.div>
                            </div>

                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="mb-16 border-t border-white/5 pt-16">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.8em] mb-10 flex items-center gap-8 italic leading-none">
                                    <div className="w-16 h-1 bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div> Technical Specifications
                                </h3>
                                <p className="text-slate-400 leading-relaxed font-bold italic text-2xl opacity-80 uppercase tracking-tight">
                                    {product.description}
                                </p>
                            </motion.div>

                            {/* Tactical Actions */}
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="mt-auto space-y-12">
                                <div className="flex items-center justify-between bg-white/5 rounded-[3.5rem] p-10 shadow-2xl border border-white/5 relative overflow-hidden group/stock">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-1000 rotate-45 translate-x-10 -translate-y-10"></div>
                                    <div className="flex flex-col ml-4 relative z-10">
                                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 italic">Node Magnitude</span>
                                         <span className="font-black text-white italic text-3xl uppercase tracking-tighter">{product.stock} {product.unit}S AVAILABLE</span>
                                    </div>
                                    <div className="flex items-center bg-slate-950 rounded-[2.5rem] shadow-2xl border border-white/5 p-4 relative z-10">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-slate-600 hover:text-white transition-all active:scale-75"
                                        >
                                            <Minus size={28} strokeWidth={4} />
                                        </button>
                                        <span className="w-20 text-center font-black text-white select-none text-4xl italic px-4">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-slate-600 hover:text-emerald-500 transition-all active:scale-75"
                                        >
                                            <Plus size={28} strokeWidth={4} />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="w-full bg-emerald-600 text-slate-950 font-black text-4xl py-12 rounded-[4rem] shadow-[0_30px_60px_rgba(16,185,129,0.2)] hover:bg-white active:scale-[0.98] transition-all duration-700 flex items-center justify-center gap-10 italic group uppercase tracking-tighter relative overflow-hidden border border-emerald-400/20"
                                >
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    <ShoppingCart size={48} strokeWidth={4} className="group-hover:rotate-12 transition-transform duration-500" /> Commencing Procurement
                                </button>

                                <div className="flex items-center justify-center gap-10 bg-white/5 py-10 rounded-[3.5rem] border border-white/5 shadow-2xl group/secure relative overflow-hidden">
                                     <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/secure:opacity-100 transition-opacity duration-1000"></div>
                                    <div className="bg-slate-950 p-6 rounded-3xl shadow-2xl border border-white/5 group-hover/secure:scale-110 group-hover/secure:rotate-12 transition-transform duration-700 z-10">
                                        <ShieldCheck size={36} className="text-emerald-500" strokeWidth={3} />
                                    </div>
                                    <div className="z-10">
                                        <p className="text-[10px] font-black text-white uppercase tracking-[0.6em] italic leading-none">Farm-Ease Secure Protocol</p>
                                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-2 italic flex items-center gap-3">
                                            <Activity size={10} className="text-emerald-500 animate-pulse" /> Encrypted Capital Protection Active
                                        </p>
                                    </div>
                                </div>

                            </motion.div>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
