import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  ShoppingCart, 
  Package, 
  ArrowUpDown,
  CheckCircle2,
  Tag
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image_url: string;
  category?: string;
  description?: string;
  seller_id?: string;
}

const categories = [
  { id: "all", name: "All Products", icon: <Package size={18} /> },
  { id: "seeds", name: "Seed Protocols", icon: <Tag size={18} /> },
  { id: "equipment", name: "Equipment", icon: <CheckCircle2 size={18} /> },
  { id: "produce", name: "Fresh Produce", icon: <CheckCircle2 size={18} /> },
];

export default function Market() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy] = useState("newest");

  useEffect(() => {
    async function getProducts() {
      let query = supabase.from("products").select("*");
      if (activeCategory !== "all") {
        query = query.eq("category", activeCategory);
      }
      const { data } = await query;
      if (data) setProducts(data as Product[]);
      setLoading(false);
    }
    getProducts();
  }, [activeCategory]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header Area */}
      <header className="bg-white border-b pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Marketplace</h1>
              <p className="text-slate-500 mt-2">Verified tools and produce for the modern agrarian.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-12">
          {/* Sidebar Filters */}
          <aside className="space-y-8">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Categories</h3>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                      activeCategory === cat.id 
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                        : "text-slate-600 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    {cat.icon}
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-emerald-900 rounded-3xl text-white">
              <h4 className="font-bold mb-2">Smart Contracts</h4>
              <p className="text-sm text-emerald-100/70 leading-relaxed mb-4">
                Every trade is secured by our patented cryptographic architecture.
              </p>
              <div className="h-1 bg-emerald-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-emerald-400"
                  animate={{ width: ["20%", "80%", "20%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          </aside>

          {/* Main Grid */}
          <main>
            <div className="flex items-center justify-between mb-8">
               <span className="text-sm font-bold text-slate-500">
                Sorted by {sortBy} ({filteredProducts.length} items)
               </span>
               <button className="flex items-center gap-2 text-sm font-bold text-slate-900 px-4 py-2 bg-white rounded-lg border shadow-sm">
                  <ArrowUpDown size={16} /> Filter & Sort
               </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-[450px] bg-white rounded-3xl border border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map(product => (
                  <motion.div 
                    key={product.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden group hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
                  >
                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-emerald-600 text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-sm">
                          Verified
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                          {product.name}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-6">
                        {product.description || "Premium quality agrarian asset secured by patented smart contract logic."}
                      </p>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <div>
                          <p className="text-2xl font-black text-slate-900">₹{product.price}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">per {product.unit}</p>
                        </div>
                        <button 
                          onClick={() => addToCart({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            unit: product.unit,
                            vendor: "Verified Seller",
                            vendor_id: product.seller_id || "gen-1",
                            image: product.image_url || ""
                          })}
                          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-200"
                        >
                          <ShoppingCart size={18} /> Add
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {!loading && filteredProducts.length === 0 && (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No results found</h3>
                <p className="text-slate-500">Try adjusting your filters or search query.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
