import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { ShoppingCart, ShieldCheck, Star, ArrowLeft, Activity, Leaf, MapPin, Store, Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";

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
                        rating: 4.5,
                        reviews: 0
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
        alert("Added to cart!");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white pt-20">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin mb-8"></div>
                <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-[10px] italic">Accessing Asset Profile...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-20">
                <Leaf size={80} className="text-slate-200 mb-8" />
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter italic uppercase">Asset Redacted</h1>
                <p className="text-slate-400 mb-10 text-center max-w-sm font-bold italic">The requested resource has been removed from the market or has shifted location.</p>
                <Link to="/market" className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all active:scale-95 shadow-2xl">
                    Return to Marketplace
                </Link>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-slate-50 pt-40 pb-32"
        >
            <div className="max-w-7xl mx-auto px-10">

                {/* Navigation */}
                <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="mb-12"
                >
                    <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 hover:text-slate-950 transition-all text-[10px] font-black uppercase tracking-[0.4em] group">
                        <div className="bg-white p-4 rounded-3xl border border-slate-100 mr-6 group-hover:bg-slate-950 group-hover:text-white group-hover:border-slate-950 shadow-premium transition-all">
                            <ArrowLeft size={20} strokeWidth={3} />
                        </div>
                        Market Manifest / <span className="text-slate-950 ml-2">Asset Details</span>
                    </button>
                </motion.div>

                <div className="bg-white rounded-[5rem] shadow-premium border border-white overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-3 bg-slate-950"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

                        {/* Visual Asset Side */}
                        <div className="p-16 lg:p-24 flex flex-col items-center justify-center bg-slate-50 relative group overflow-hidden border-r border-slate-100">
                             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/20 to-transparent"></div>
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8 }}
                                className="w-full aspect-square bg-white rounded-[4rem] flex items-center justify-center relative overflow-hidden shadow-2xl border-[12px] border-white group-hover:scale-[1.02] transition-transform duration-700"
                            >
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-8">
                                        <div className="bg-slate-50 p-12 rounded-[3.5rem] shadow-inner">
                                            <Leaf size={140} className="text-slate-100" strokeWidth={1} />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.6em] italic">No Visual Metadata</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Specification Side */}
                        <div className="p-16 lg:p-24 flex flex-col bg-white">

                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="mb-12 flex items-center justify-between"
                            >
                                <span className="px-8 py-3 bg-slate-950 text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.4em] shadow-xl italic">
                                    {product.category || "General Asset"}
                                </span>
                                <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 shadow-inner">
                                    <div className="flex items-center text-orange-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} className={i < Math.floor(product.rating) ? "text-orange-500" : "text-slate-100"} strokeWidth={3} />
                                        ))}
                                    </div>
                                    <span className="text-slate-950 font-black text-sm italic">{product.rating}</span>
                                </div>
                            </motion.div>

                            <motion.h1 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-7xl lg:text-8xl font-black text-slate-950 mb-10 tracking-tighter italic uppercase leading-none"
                            >
                                {product.name}
                            </motion.h1>

                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-end gap-6 mb-16"
                            >
                                <span className="text-8xl font-black text-slate-950 tracking-tighter italic">₹{product.price.toLocaleString()}</span>
                                <span className="text-slate-300 font-black uppercase tracking-[0.4em] text-[12px] mb-6 italic leading-none border-l border-slate-100 pl-6">Per {product.unit} Unit</span>
                            </motion.div>

                            {/* Node Metadata */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-16">
                                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 flex items-center gap-8 shadow-inner group/card hover:bg-slate-950 transition-all duration-500 cursor-default">
                                    <div className="bg-slate-950 p-6 rounded-[1.5rem] text-white shadow-2xl group-hover/card:bg-white group-hover/card:text-slate-950 transition-all duration-500"><Store size={32} strokeWidth={3} /></div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] uppercase tracking-[0.5em] font-black text-slate-400 group-hover/card:text-slate-600 mb-2 transition-colors italic">Origin Node</p>
                                        <p className="font-black text-slate-950 text-2xl tracking-tighter italic group-hover/card:text-white truncate transition-colors uppercase leading-none">{product.vendor}</p>
                                    </div>
                                </motion.div>
                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 flex items-center gap-8 shadow-inner group/card hover:bg-emerald-600 transition-all duration-500 cursor-default">
                                    <div className="bg-slate-950 p-6 rounded-[1.5rem] text-white shadow-2xl group-hover/card:bg-white group-hover/card:text-emerald-600 transition-all duration-500"><MapPin size={32} strokeWidth={3} /></div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] uppercase tracking-[0.5em] font-black text-slate-400 group-hover/card:text-emerald-900 mb-2 transition-colors italic">Harvest Hub</p>
                                        <p className="font-black text-slate-950 text-2xl tracking-tighter italic group-hover/card:text-white transition-colors uppercase leading-none">{product.location}</p>
                                    </div>
                                </motion.div>
                            </div>

                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="mb-16 border-t border-slate-50 pt-16">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] mb-10 flex items-center gap-6 italic leading-none">
                                    <div className="w-12 h-1 bg-slate-950"></div> Technical Briefing
                                </h3>
                                <p className="text-slate-600 leading-relaxed font-bold italic text-2xl opacity-80">
                                    {product.description}
                                </p>
                            </motion.div>

                            {/* Tactical Actions */}
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="mt-auto space-y-12">
                                <div className="flex items-center justify-between bg-slate-950/5 rounded-[3rem] p-8 shadow-inner border border-white relative overflow-hidden group/stock">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-950/5 rounded-full -mr-16 -mt-16 group-hover/stock:bg-emerald-500/10 transition-colors duration-700"></div>
                                    <div className="flex flex-col ml-6 relative z-10">
                                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 italic">Stock Magnitude</span>
                                         <span className="font-black text-slate-950 italic text-3xl uppercase tracking-tighter">{product.stock} {product.unit}S REMAINING</span>
                                    </div>
                                    <div className="flex items-center bg-white rounded-[2rem] shadow-premium border border-white p-3 relative z-10">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-slate-300 hover:bg-slate-950 hover:text-white transition-all active:scale-90"
                                        >
                                            <Minus size={28} strokeWidth={4} />
                                        </button>
                                        <span className="w-20 text-center font-black text-slate-950 select-none text-4xl italic">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-slate-300 hover:bg-emerald-600 hover:text-white transition-all active:scale-90"
                                        >
                                            <Plus size={28} strokeWidth={4} />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="w-full bg-slate-950 text-white font-black text-4xl py-12 rounded-[3.5rem] shadow-2xl hover:bg-emerald-600 active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-8 italic group uppercase tracking-tighter relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    <ShoppingCart size={44} strokeWidth={3} className="group-hover:rotate-12 transition-transform" /> Commit to Procurement
                                </button>

                                <div className="flex items-center justify-center gap-8 bg-slate-50 py-8 rounded-[3rem] border border-slate-100 shadow-inner group/secure">
                                    <div className="bg-white p-5 rounded-2xl shadow-premium border border-slate-100 group-hover/secure:rotate-12 transition-transform duration-500">
                                        <ShieldCheck size={32} className="text-emerald-500" strokeWidth={3} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-950 uppercase tracking-[0.5em] italic">Farm-Ease Secure Protocol</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic flex items-center gap-2">
                                            <Activity size={10} className="animate-pulse" /> Encrypted Capital Protection Active
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
