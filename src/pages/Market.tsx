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
        <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight mb-3 leading-none lowercase">
                            Global <span className="text-gradient">Market</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-base max-w-xl">
                            Elite agricultural produce directly from verified source origins.
                        </p>
                    </div>
                    <div className="flex bg-white rounded-2xl shadow-premium border border-slate-100 overflow-hidden max-w-md w-full focus-within:ring-4 focus-within:ring-green-100/50 transition-all">
                        <div className="px-5 py-4 text-slate-400">
                            <Search size={22} strokeWidth={2.5} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search products, seeds, tools..."
                            className="flex-1 py-4 pr-6 outline-none text-slate-950 w-full font-bold placeholder:text-slate-400 placeholder:font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-3xl shadow-premium border border-slate-100 p-5 sticky top-24">
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-50">
                                <div className="bg-slate-950 p-2.5 rounded-xl text-white shadow-lg">
                                    <SlidersHorizontal size={18} strokeWidth={2.5} />
                                </div>
                                <h3 className="font-extrabold text-slate-950 text-lg tracking-tight">Categories</h3>
                            </div>
                            <ul className="space-y-2">
                                {[
                                    { id: "all", label: "All Products", icon: Filter },
                                    { id: "fresh", label: "Fresh Produce", icon: Leaf },
                                    { id: "seeds", label: "Seeds & Soil", icon: Sprout },
                                    { id: "tools", label: "Farming Tools", icon: Tractor },
                                ].map((cat) => (
                                    <li key={cat.id}>
                                        <button
                                            onClick={() => setActiveTab(cat.id)}
                                            className={`flex items-center gap-3.5 w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 ${activeTab === cat.id ? 'bg-slate-950 text-white font-bold shadow-xl' : 'text-slate-500 hover:bg-slate-50 font-medium'}`}
                                        >
                                            <cat.icon size={18} className={activeTab === cat.id ? "text-green-400" : "text-slate-400"} />
                                            {cat.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8 pt-8 border-t border-slate-50">
                                <h3 className="font-extrabold text-slate-950 mb-4 flex justify-between items-center text-md">
                                    Price Cap
                                    <span className="text-green-600 bg-green-50 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ml-2">₹{priceRange}</span>
                                </h3>
                                <input
                                    type="range"
                                    className="w-full accent-green-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                                    min="0"
                                    max="10000"
                                    step="100"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest">
                                    <span>₹0</span>
                                    <span>₹10,000+</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="glass p-4 rounded-2xl border border-white/20 mb-8 flex justify-between items-center shadow-premium">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <div key={product.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-500 group flex flex-col relative active:scale-[0.98] hover-lift">
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-slate-950 text-[10px] font-bold rounded-lg shadow-sm border border-slate-100 uppercase tracking-widest">
                                                {product.category}
                                            </span>
                                        </div>
                                        <Link to={`/market/${product.id}`} className="block relative">
                                            <div className="aspect-[4/5] bg-slate-50 relative overflow-hidden flex items-center justify-center p-8">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out" />
                                                ) : (
                                                    <>
                                                        <Leaf size={48} className="text-slate-200 z-10 group-hover:rotate-12 transition-transform duration-500" strokeWidth={1} />
                                                    </>
                                                )}
                                            </div>
                                        </Link>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="mb-6">
                                                <Link to={`/market/${product.id}`}>
                                                    <h3 className="text-lg font-bold text-slate-950 group-hover:text-green-600 transition-colors line-clamp-2 mb-2 leading-tight tracking-tight">{product.name}</h3>
                                                </Link>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Verified Provenance</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                                                <div className="flex flex-col">
                                                    <span className="text-xl font-extrabold text-slate-950 tracking-tight">₹{product.price}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">per {product.unit}</span>
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
                                                    className="bg-slate-950 text-white hover:bg-green-600 p-3.5 rounded-xl transition-all shadow-md active:scale-95 group/btn"
                                                    title="Add to Collection"
                                                >
                                                    <ShoppingCart size={20} className="group-hover/btn:rotate-12 transition-transform" />
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
