import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ShieldCheck, MapPin, Store, Star, Minus, Plus, ShoppingCart, Leaf, Loader2 } from "lucide-react";

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
                <Loader2 size={60} className="animate-spin text-green-600 mb-8" strokeWidth={3} />
                <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-xs italic">Harvesting Details...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-20">
                <Leaf size={80} className="text-slate-200 mb-8" />
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter italic uppercase">Asset Redacted</h1>
                <p className="text-slate-400 mb-10 text-center max-w-sm font-bold italic">The requested resource has been removed from the market or has shifted location.</p>
                <Link to="/market" className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-green-600 transition-all active:scale-95 shadow-2xl">
                    Return to Marketplace
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">

                {/* Breadcrumbs & Back */}
                <div className="mb-10">
                    <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 hover:text-green-600 transition-all text-xs font-black uppercase tracking-widest group">
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 mr-4 group-hover:bg-slate-950 group-hover:text-white group-hover:border-slate-950 shadow-sm transition-all">
                            <ArrowLeft size={20} strokeWidth={3} />
                        </div>
                        Market Manifest
                    </button>
                </div>

                <div className="bg-white rounded-[4rem] shadow-premium border border-slate-50 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

                        {/* Image Gallery Side */}
                        <div className="p-12 lg:p-20 flex flex-col items-center justify-center bg-slate-50 relative group overflow-hidden border-r border-slate-100">
                             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/10 to-transparent"></div>
                            <div className="w-full aspect-square bg-white rounded-[3rem] flex items-center justify-center mb-0 relative overflow-hidden shadow-2xl border-4 border-white transition-transform duration-700 group-hover:scale-[1.02]">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="bg-slate-50 p-10 rounded-[2.5rem] shadow-inner">
                                            <Leaf size={120} className="text-slate-100" strokeWidth={1} />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.5em]">No Visual Data</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Info Side */}
                        <div className="p-12 lg:p-20 flex flex-col bg-white">

                            <div className="mb-8 flex items-center justify-between">
                                <span className="px-6 py-2 bg-green-50 text-green-700 text-[10px] font-black rounded-full uppercase tracking-[0.3em] border border-green-100 shadow-sm italic">
                                    {product.category || "General Asset"}
                                </span>
                                <div className="flex items-center gap-3 bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100 shadow-inner">
                                    <div className="flex items-center text-orange-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} className={i < Math.floor(product.rating) ? "text-orange-500" : "text-slate-200"} strokeWidth={3} />
                                        ))}
                                    </div>
                                    <span className="text-slate-900 font-black text-xs italic">{product.rating}</span>
                                    <span className="text-slate-300 font-bold text-[10px] uppercase tracking-tighter">({product.reviews})</span>
                                </div>
                            </div>

                            <h1 className="text-6xl font-black text-slate-950 mb-6 tracking-tighter italic uppercase leading-none">{product.name}</h1>

                            <div className="flex items-end gap-4 mb-12">
                                <span className="text-7xl font-black text-slate-950 tracking-tighter italic">₹{product.price.toLocaleString()}</span>
                                <span className="text-slate-300 font-black uppercase tracking-[0.3em] text-[10px] mb-4 italic">Per {product.unit} Unit</span>
                            </div>

                            {/* Seller & Trust Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 flex items-center gap-6 shadow-inner group/card hover:bg-slate-950 transition-all duration-300">
                                    <div className="bg-slate-950 p-4 rounded-2xl text-white shadow-xl group-hover/card:bg-white group-hover/card:text-slate-950 transition-all"><Store size={28} strokeWidth={3} /></div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-400 group-hover/card:text-slate-600 mb-1 transition-colors">Origin Node</p>
                                        <p className="font-black text-slate-900 text-xl tracking-tighter italic group-hover/card:text-white truncate transition-colors uppercase">{product.vendor}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 flex items-center gap-6 shadow-inner group/card hover:bg-green-600 transition-all duration-300">
                                    <div className="bg-slate-950 p-4 rounded-2xl text-white shadow-xl group-hover/card:bg-white group-hover/card:text-green-600 transition-all"><MapPin size={28} strokeWidth={3} /></div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-400 group-hover/card:text-green-900 mb-1 transition-colors">Geo-Location</p>
                                        <p className="font-black text-slate-900 text-xl tracking-tighter italic group-hover/card:text-white transition-colors uppercase">{product.location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-12 border-t border-slate-50 pt-12">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-6 flex items-center gap-4 italic leading-none">
                                    <div className="w-8 h-1 bg-slate-100"></div> Technical Briefing
                                </h3>
                                <p className="text-slate-600 leading-relaxed font-bold italic text-lg opacity-80">
                                    {product.description}
                                </p>
                            </div>

                            {/* Action Area */}
                            <div className="mt-auto space-y-10 pt-10 border-t border-slate-50">

                                <div className="flex items-center justify-between bg-slate-50 rounded-[2rem] p-6 shadow-inner border border-slate-100">
                                    <div className="flex flex-col ml-4">
                                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Stock Reservoir</span>
                                         <span className="font-black text-slate-900 italic text-xl">{product.stock} {product.unit}S AVAILABLE</span>
                                    </div>
                                    <div className="flex items-center bg-white rounded-[1.5rem] shadow-premium border border-slate-50 p-2">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                                        >
                                            <Minus size={24} strokeWidth={3} />
                                        </button>
                                        <span className="w-16 text-center font-black text-slate-950 select-none text-2xl italic">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-300 hover:bg-green-50 hover:text-green-600 transition-all active:scale-90"
                                        >
                                            <Plus size={24} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-6">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 bg-slate-950 text-white font-black text-2xl py-8 rounded-[2.5rem] shadow-2xl hover:bg-green-600 hover:text-slate-950 active:scale-[0.98] transition-all flex items-center justify-center gap-6 italic group uppercase tracking-tighter"
                                    >
                                        <ShoppingCart size={32} strokeWidth={3} className="group-hover:rotate-12 transition-transform" /> Commit to Cart
                                    </button>
                                </div>

                                <div className="flex items-center justify-center gap-6 bg-slate-950 py-5 rounded-[2rem] border-4 border-white shadow-2xl">
                                    <ShieldCheck size={28} className="text-green-500" strokeWidth={3} />
                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.5em] italic">100% Escrow Encryption Enabled</span>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
