import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, Search, SlidersHorizontal, Leaf, Sprout, Tractor, ArrowRight } from "lucide-react";
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
        {/* Elite Market Header 3.0 */}
        <div className="mb-20 flex flex-col lg:flex-row lg:items-end justify-between gap-12 relative">
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block px-4 py-1.5 rounded-full bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] text-[10px] font-black uppercase tracking-[0.3em] mb-6"
            >
              Verified Economic Exchange
            </motion.div>
            <h1 className="text-6xl lg:text-8xl font-black text-[hsl(var(--foreground))] tracking-[-0.05em] mb-4 leading-[0.8] uppercase italic">
              Global <span className="text-[hsl(var(--primary))] opacity-80">Pulse.</span>
            </h1>
            <p className="text-xl text-[hsl(var(--foreground))]/40 font-medium max-w-2xl tracking-tight leading-relaxed">
              Access the ultimate decentralized reservoir of premium agrarian assets. Every listing is cryptographically verified for source-integrity and peak quality.
            </p>
          </div>
          
          <div className="relative group max-w-md w-full">
            <div className="absolute inset-0 bg-[hsl(var(--primary))] opacity-0 group-focus-within:opacity-[0.03] blur-2xl transition-opacity" />
            <div className="relative flex items-center bg-[hsl(var(--foreground))] text-white rounded-[2rem] shadow-elite border border-white/5 p-2 transition-all duration-500 group-focus-within:scale-[1.02]">
              <div className="pl-6 pr-4 opacity-40">
                <Search size={22} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="Initialize asset search..."
                aria-label="Search assets"
                className="flex-1 py-5 pr-6 bg-transparent outline-none text-white text-base font-black placeholder:text-white/20 uppercase tracking-widest"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Filters */}
                    {/* Elite Sidebar 3.0 */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <div className="glass rounded-[2.5rem] p-8 sticky top-24 border-white/10 shadow-premium overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--primary))]/5 blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            
                            <div className="flex items-center gap-3 mb-10">
                                <div className="bg-[hsl(var(--foreground))] p-3 rounded-2xl text-white shadow-glow">
                                    <SlidersHorizontal size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="font-extrabold text-[hsl(var(--foreground))] text-xl tracking-tighter uppercase italic">Registry</h3>
                            </div>
                            
                            <div className="space-y-2 mt-2">
                                {[
                                    { id: "all", label: "Core Assets", icon: Filter },
                                    { id: "fresh", label: "Bio-Produce", icon: Leaf },
                                    { id: "seeds", label: "Seed Protocols", icon: Sprout },
                                    { id: "tools", label: "Field Hardware", icon: Tractor },
                                ].map((cat) => (
                                    <li key={cat.id} className="list-none">
                                        <button
                                            onClick={() => setActiveTab(cat.id)}
                                            aria-label={`Filter by ${cat.label}`}
                                            className={`flex items-center justify-between w-full group px-5 py-4 rounded-2xl transition-all duration-500 border relative overflow-hidden ${
                                                activeTab === cat.id 
                                                ? 'bg-[hsl(var(--foreground))] text-white border-transparent shadow-elite' 
                                                : 'text-[hsl(var(--foreground))]/50 border-transparent hover:border-[hsl(var(--foreground))]/10 hover:bg-[hsl(var(--foreground))]/5'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4 relative z-10">
                                                <cat.icon size={18} className={activeTab === cat.id ? "text-[hsl(var(--primary))]" : "opacity-50"} />
                                                <span className="font-black text-xs uppercase tracking-widest">{cat.label}</span>
                                            </div>
                                            {activeTab === cat.id && (
                                                <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_10px_hsl(var(--primary))]" />
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </div>

                            <div className="mt-12 pt-10 border-t border-[hsl(var(--foreground))]/5 relative">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-black text-[hsl(var(--foreground))]/40 text-[10px] uppercase tracking-[0.2em]">Transaction Cap</h3>
                                    <span className="text-[hsl(var(--primary))] text-xs font-black tabular-nums">₹{priceRange.toLocaleString()}</span>
                                </div>
                                
                                <div className="relative group/slider px-1">
                                    <input
                                        type="range"
                                        className="w-full accent-[hsl(var(--primary))] cursor-pointer h-1 bg-[hsl(var(--foreground))]/10 rounded-full appearance-none transition-all group-hover/slider:h-1.5"
                                        min="0"
                                        max="50000"
                                        step="500"
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(parseInt(e.target.value))}
                                    />
                                    <div className="flex justify-between text-[9px] text-[hsl(var(--foreground))]/30 mt-4 font-black uppercase tracking-widest">
                                        <span>Min</span>
                                        <span>Max Protocol</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Asset Grid 3.0 */}
                    <div className="flex-1">
                        <div className="glass p-6 rounded-[2rem] border-white/10 mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-premium">
                            <p className="text-[hsl(var(--foreground))]/50 font-black uppercase tracking-[0.2em] text-[10px] italic">
                                {loadingProducts ? "Summoning Protocol Data..." : (
                                    <>
                                        <span className="text-[hsl(var(--primary))] opacity-100 not-italic mr-2">[{products.length}]</span> 
                                        Verified Luxury Listings Online
                                    </>
                                )}
                            </p>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <select className="bg-[hsl(var(--foreground))] border-none text-white text-[10px] rounded-xl px-6 py-3.5 outline-none cursor-pointer font-black tracking-[0.2em] uppercase hover:bg-[hsl(var(--primary))] transition-all shadow-glow w-full sm:w-auto">
                                    <option>Arrival Recency</option>
                                    <option>Valuation: Low to High</option>
                                    <option>Valuation: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {loadingProducts && products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-48 bg-[hsl(var(--foreground))]/[0.02] rounded-[3rem] border border-[hsl(var(--foreground))]/5 shadow-inner">
                                <SkeletonGrid />
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {products.map((product) => (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={product.id} 
                                        className="group relative bg-white rounded-[2.5rem] shadow-premium border border-[hsl(var(--foreground))]/5 overflow-hidden transition-all duration-700 hover:shadow-elite hover:-translate-y-2 flex flex-col h-full"
                                    >
                                        {/* Status Badge */}
                                        <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                                            <span className="px-3 py-1.5 bg-[hsl(var(--foreground))] text-white text-[9px] font-black rounded-lg shadow-xl uppercase tracking-[0.2em]">
                                                {product.category}
                                            </span>
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-[hsl(var(--primary))]/10 backdrop-blur-md rounded-md border border-[hsl(var(--primary))]/20">
                                                <div className="w-1 h-1 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
                                                <span className="text-[hsl(var(--primary))] text-[8px] font-black uppercase tracking-widest">Quantum Verified</span>
                                            </div>
                                        </div>

                                        <Link to={`/market/${product.id}`} className="block relative overflow-hidden aspect-[4/5] bg-[hsl(var(--muted))]/30">
                                            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--foreground))]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                            <div className="w-full h-full p-10 flex items-center justify-center">
                                                {product.image_url ? (
                                                    <img 
                                                        src={product.image_url} 
                                                        alt={product.name} 
                                                        loading="lazy"
                                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" 
                                                    />
                                                ) : (
                                                    <Leaf size={64} className="text-[hsl(var(--foreground))]/5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000" strokeWidth={1} />
                                                )}
                                            </div>
                                            
                                            {/* Hover Action Shroud */}
                                            <div className="absolute bottom-0 inset-x-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-20">
                                                <button 
                                                    aria-label={`Acquire ${product.name}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        addToCart({
                                                            id: product.id,
                                                            name: product.name,
                                                            price: product.price,
                                                            unit: product.unit,
                                                            vendor: product.seller_id,
                                                            vendor_id: product.seller_id,
                                                            image: product.image_url || ""
                                                        });
                                                    }}
                                                    className="w-full bg-[hsl(var(--foreground))] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[hsl(var(--primary))] transition-colors shadow-2xl"
                                                >
                                                    Initialize Acquisition <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        </Link>

                                        <div className="p-8 flex-1 flex flex-col">
                                            <div className="mb-8 overflow-hidden">
                                                <Link to={`/market/${product.id}`}>
                                                    <h3 className="text-xl font-black text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-1 mb-3 uppercase italic tracking-tighter">
                                                        {product.name}
                                                    </h3>
                                                </Link>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex -space-x-2">
                                                        {[1, 2, 3].map(i => (
                                                            <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-[hsl(var(--muted))] overflow-hidden">
                                                                <div className="w-full h-full bg-[hsl(var(--primary))]/20" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <span className="text-[9px] text-[hsl(var(--foreground))]/30 font-black uppercase tracking-widest">
                                                        128+ Successful Exchanges
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-end justify-between mt-auto">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-[hsl(var(--foreground))]/30 uppercase tracking-[0.2em] mb-1">Current Valuation</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-3xl font-black text-[hsl(var(--foreground))] tracking-tighter tabular-nums">₹{product.price}</span>
                                                        <span className="text-[10px] font-bold text-[hsl(var(--foreground))]/40 uppercase italic">/ {product.unit}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col items-end">
                                                    <div className="w-12 h-1 bg-[hsl(var(--muted))] rounded-full overflow-hidden mb-2">
                                                        <div className="w-2/3 h-full bg-[hsl(var(--primary))]" />
                                                    </div>
                                                    <span className="text-[8px] font-black text-[hsl(var(--primary))] uppercase tracking-widest">High Fluidity</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[4rem] border border-[hsl(var(--foreground))]/5 p-32 text-center flex flex-col items-center shadow-premium relative overflow-hidden">
                                <div className="absolute inset-0 mesh-bg opacity-30" />
                                <div className="bg-[hsl(var(--foreground))] p-10 rounded-[2.5rem] mb-10 text-[hsl(var(--primary))] shadow-elite relative z-10">
                                    <Search size={48} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-4xl font-black text-[hsl(var(--foreground))] mb-6 tracking-tighter uppercase italic relative z-10">Protocol Null</h3>
                                <p className="text-[hsl(var(--foreground))]/40 mb-12 max-w-sm mx-auto font-medium text-lg tracking-tight relative z-10">The specified asset parameters yielded zero matches in the current registry. Initialize a wider scope scan.</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setActiveTab('all'); setPriceRange(50000); }}
                                    className="bg-[hsl(var(--foreground))] text-white font-black px-12 py-5 rounded-2xl hover:bg-[hsl(var(--primary))] shadow-elite transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-[0.2em] text-xs relative z-10"
                                >
                                    Execute Reset
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SkeletonGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-[hsl(var(--foreground))]/5 h-[400px] flex flex-col">
                    <div className="w-full aspect-[4/5] bg-[hsl(var(--muted))]/30 rounded-2xl mb-8 animate-pulse" />
                    <div className="h-4 w-3/4 bg-[hsl(var(--muted))] rounded-full mb-4 animate-pulse" />
                    <div className="h-3 w-1/2 bg-[hsl(var(--muted))] rounded-full mb-auto animate-pulse" />
                    <div className="flex justify-between items-center pt-6 border-t border-[hsl(var(--foreground))]/5">
                        <div className="h-8 w-24 bg-[hsl(var(--muted))] rounded-lg animate-pulse" />
                        <div className="w-12 h-12 bg-[hsl(var(--muted))] rounded-xl animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}
