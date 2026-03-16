import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Filter, Search, ShoppingCart, SlidersHorizontal, Leaf, Sprout, Tractor, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";

interface Product {
    id: string;
    name: string;
    price: number;
    unit: string;
    category: string;
    image_url: string | null;
    seller_id: string;
    stock: number;
}

export default function Market() {
    const { addToCart } = useCart();
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [priceRange, setPriceRange] = useState(10000);

    const fetchProducts = useCallback(async () => {
        setLoadingProducts(true);
        try {
            let query = supabase
                .from("products")
                .select("*")
                .lte("price", priceRange);

            if (activeTab !== "all") {
                query = query.eq("category", activeTab);
            }

            if (searchQuery.trim() !== "") {
                query = query.ilike("name", `%${searchQuery}%`);
            }

            const { data, error } = await query.order("created_at", { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoadingProducts(false);
        }
    }, [activeTab, searchQuery, priceRange]);

    useEffect(() => {
        fetchProducts();

        // Real-time subscription
        const channel = supabase
            .channel('public:products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
                console.log('Real-time update:', payload);
                fetchProducts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchProducts]);

    return (
        <div className="bg-gray-50 min-h-screen py-32 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">
                            Global <span className="text-green-600">Market</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-lg max-w-xl">
                            Elite agricultural produce directly from verified source origins.
                        </p>
                    </div>
                    <div className="flex bg-white rounded-3xl shadow-premium border border-slate-100 overflow-hidden max-w-md w-full focus-within:ring-4 focus-within:ring-green-100 transition-all">
                        <div className="px-5 py-4 text-slate-400 group-focus-within:text-green-600 transition-colors">
                            <Search size={24} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search products, seeds, tools..."
                            className="flex-1 py-4 pr-6 outline-none text-slate-900 w-full font-bold"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 p-8 sticky top-32">
                            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-50">
                                <div className="bg-green-600 p-2 rounded-xl text-white shadow-lg shadow-green-100">
                                    <SlidersHorizontal size={20} />
                                </div>
                                <h3 className="font-black text-slate-900 text-xl tracking-tight">Categories</h3>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    { id: "all", label: "All Products", icon: Filter },
                                    { id: "fresh", label: "Fresh Produce", icon: Leaf },
                                    { id: "seeds", label: "Seeds & Soil", icon: Sprout },
                                    { id: "tools", label: "Farming Tools", icon: Tractor },
                                ].map((cat) => (
                                    <li key={cat.id}>
                                        <button
                                            onClick={() => setActiveTab(cat.id)}
                                            className={`flex items-center gap-4 w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === cat.id ? 'bg-slate-900 text-white font-black shadow-xl scale-[1.02]' : 'text-slate-500 hover:bg-slate-50 font-bold'}`}
                                        >
                                            <cat.icon size={20} className={activeTab === cat.id ? "text-green-400" : "text-slate-400"} />
                                            {cat.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-10 pt-8 border-t border-slate-50">
                                <h3 className="font-black text-slate-900 mb-6 flex justify-between items-center text-lg">
                                    Price Cap
                                    <span className="text-green-600 bg-green-50 px-3 py-1 rounded-xl text-sm italic font-black tracking-widest whitespace-nowrap ml-2">₹{priceRange}</span>
                                </h3>
                                <input
                                    type="range"
                                    className="w-full accent-green-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                                    min="0"
                                    max="10000"
                                    step="100"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-4 font-black uppercase tracking-widest">
                                    <span>₹0</span>
                                    <span>₹10,000+</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="glass p-5 rounded-[2rem] border border-white/20 mb-10 flex justify-between items-center shadow-premium">
                            <p className="text-slate-500 font-bold italic">
                                {loadingProducts ? "Summoning crops..." : <><span className="font-black text-slate-900 not-italic">{products.length}</span> luxury listings verified</>}
                            </p>
                            <div className="flex items-center gap-4">
                                <select className="bg-slate-900 border-none text-white text-xs rounded-xl px-5 py-3 outline-none cursor-pointer font-black tracking-widest uppercase hover:bg-green-600 transition-colors shadow-lg">
                                    <option>Newest Arrivals</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {loadingProducts && products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border border-slate-100 shadow-premium">
                                <Loader2 size={56} className="animate-spin text-green-600 mb-6" />
                                <p className="text-slate-400 font-black tracking-widest uppercase text-sm">Synchronizing Grid...</p>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {products.map((product) => (
                                    <div key={product.id} className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 group flex flex-col relative active:scale-[0.98]">
                                        <div className="absolute top-4 left-4 z-10 translate-y-0 group-hover:-translate-y-1 transition-transform">
                                            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black rounded-xl shadow-lg border border-slate-100 uppercase tracking-widest">
                                                {product.category}
                                            </span>
                                        </div>
                                        <Link to={`/market/${product.id}`} className="block relative">
                                            <div className="aspect-[4/5] bg-slate-50 relative overflow-hidden flex items-center justify-center p-8">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out" />
                                                ) : (
                                                    <>
                                                        <div className="absolute inset-0 bg-gradient-to-tr from-green-50 to-slate-50 opacity-50"></div>
                                                        <Leaf size={64} className="text-green-200 z-10 group-hover:rotate-12 transition-transform duration-500" strokeWidth={1} />
                                                    </>
                                                )}
                                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-all duration-500" />
                                            </div>
                                        </Link>
                                        <div className="p-8 flex-1 flex flex-col">
                                            <div className="mb-6">
                                                <Link to={`/market/${product.id}`}>
                                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-green-600 transition-colors line-clamp-2 mb-2 leading-tight tracking-tight">{product.name}</h3>
                                                </Link>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Verified Provenance</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                                                <div className="flex flex-col">
                                                    <span className="text-2xl font-black text-slate-900 tracking-tighter">₹{product.price}</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">per {product.unit}</span>
                                                </div>
                                                <button
                                                    onClick={() => addToCart({
                                                        id: product.id,
                                                        name: product.name,
                                                        price: product.price,
                                                        unit: product.unit,
                                                        vendor: product.seller_id,
                                                        vendor_id: product.seller_id,
                                                        image: product.image_url || ""
                                                    })}
                                                    className="bg-slate-900 text-white hover:bg-green-600 p-4 rounded-2xl transition-all shadow-xl active:hover:scale-95 group/btn"
                                                    title="Add to Collection"
                                                >
                                                    <ShoppingCart size={22} className="group-hover/btn:rotate-12 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 p-24 text-center flex flex-col items-center shadow-premium">
                                <div className="bg-slate-50 p-10 rounded-[2.5rem] mb-8 text-slate-300">
                                    <Search size={64} strokeWidth={1} />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Product Unfound</h3>
                                <p className="text-slate-400 mb-10 max-w-sm mx-auto font-bold leading-relaxed">The fields are currently empty for this combination. Try broadening your harvest search.</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setActiveTab('all'); setPriceRange(10000); }}
                                    className="bg-slate-900 text-white font-black px-12 py-5 rounded-3xl hover:bg-green-600 shadow-2xl transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-sm"
                                >
                                    Reset Discovery
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
