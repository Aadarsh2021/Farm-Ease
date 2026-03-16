import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Leaf, ShieldCheck, Sprout, Tractor, ShoppingCart, User, Loader2, Star, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
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
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .limit(8)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTrendingProducts(data || []);
      } catch (err) {
        console.error("Error fetching trending products:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchTrending();
  }, []);

  return (
    <div className="relative isolate pt-20">
      {/* Dynamic Background */}
      <div className="mesh-bg opacity-40" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 sm:pt-24 sm:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <AnimatePresence mode="wait">
                {user && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-white/40 text-green-700 text-sm font-semibold mb-8 shadow-sm"
                  >
                    <User size={16} /> 
                    <span>Welcome back, <span className="text-green-900 font-bold">{user.displayName || user.email?.split('@')[0] || "Farmer"}</span></span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-950 leading-[1.05] tracking-tight mb-8">
                Empowering <span className="text-gradient">Agriculture</span> Through Innovation.
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mb-12 lg:mx-0 mx-auto font-medium">
                The ultimate digital ecosystem where modern farmers meet verified sellers. Secure escrow payments, direct connections, and premium quality guaranteed.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to={user ? "/dashboard" : "/market"} className="group relative px-10 py-5 bg-slate-950 text-white rounded-[1.5rem] font-bold text-lg overflow-hidden transition-all hover:shadow-2xl hover:bg-green-600 active:scale-95">
                  <span className="relative z-10 flex items-center gap-4">
                    {user ? "Go to Dashboard" : "Start Shopping"} <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link to="/signup" className="px-10 py-5 bg-white border border-slate-200 text-slate-950 rounded-[1.5rem] font-bold text-lg hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                  Become a Seller
                </Link>
              </div>

              <div className="mt-16 flex items-center justify-center lg:justify-start gap-12">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-4xl font-extrabold text-slate-950 tracking-tight">10K+</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Farmers</span>
                </div>
                <div className="h-12 w-px bg-slate-200"></div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-4xl font-extrabold text-slate-950 tracking-tight">500+</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Entities</span>
                </div>
                <div className="h-12 w-px bg-slate-200"></div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-4xl font-extrabold text-slate-950 tracking-tight">100%</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Secure</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mt-20 lg:mt-0 relative"
            >
              <div className="relative rounded-[3rem] overflow-hidden bg-white/40 backdrop-blur-sm p-4 shadow-premium border border-white/60 group">
                <div className="aspect-[4/3] bg-slate-100 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 opacity-10">
                     <div className="grid grid-cols-5 gap-4 p-8 h-full w-full">
                        {[...Array(20)].map((_, i) => (
                          <div key={i} className="bg-slate-950 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.15}s` }}></div>
                        ))}
                     </div>
                   </div>
                   <Tractor size={160} className="text-green-600 drop-shadow-[0_0_30px_rgba(22,163,74,0.2)] z-10 transition-transform duration-700 group-hover:scale-105" strokeWidth={1} />
                   
                   <div className="absolute bottom-8 left-8 right-8 p-6 glass rounded-[2rem] border border-white/20 shadow-2xl z-20">
                      <div className="flex items-center gap-5">
                        <div className="bg-slate-950 p-3.5 rounded-2xl text-white shadow-xl">
                          <ShieldCheck size={28} strokeWidth={2} />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-950 tracking-tight leading-none mb-1">Escrow Protected</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End-to-End Encryption</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Floating Status Indicator */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 hidden xl:flex bg-white px-6 py-4 rounded-2xl shadow-premium border border-slate-100 z-30"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <div className="absolute inset-0 h-3 w-3 rounded-full bg-green-500 animate-ping"></div>
                  </div>
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-widest leading-none">Live Market Pulse</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-40 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-green-600 font-black uppercase tracking-[0.5em] text-[10px] mb-6 block"
            >
              System Overview
            </motion.span>
            <h2 className="text-6xl lg:text-7xl font-black text-slate-950 mb-8 tracking-tighter italic uppercase">Universal <span className="text-slate-300">Market Sync.</span></h2>
            <p className="text-xl text-slate-500 font-bold italic">Whether you are sourcing strategic genetic assets, precision tools, or prime harvest, our ecosystem ensures zero-latency access.</p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {[
              { title: "Prime Produce", desc: "Strategic bio-assets harvested from verified decentralized field nodes.", icon: Leaf, color: "green", path: "/market" },
              { title: "Soil Matrices", desc: "High-yield soil structures and genetic catalysts for optimized growth.", icon: Sprout, color: "emerald", path: "/market" },
              { title: "Precision Gear", desc: "Mechanized assets and smart harvesting systems for peak throughput.", icon: Tractor, color: "blue", path: "/market" }
            ].map((cat, idx) => (
              <motion.div 
                key={idx}
                variants={fadeInUp}
                className="group p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-premium transition-all duration-500 hover:-translate-y-2 spotlight-card"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-950 text-white flex items-center justify-center mb-8 group-hover:bg-green-600 transition-colors shadow-xl">
                  <cat.icon size={32} strokeWidth={2} className="group-hover:rotate-12 transition-transform" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-950 mb-3 tracking-tight">{cat.title}</h3>
                <p className="text-slate-500 mb-8 leading-relaxed font-medium text-sm">{cat.desc}</p>
                <Link to={cat.path} className="flex items-center gap-3 font-bold text-xs uppercase tracking-widest text-slate-950 hover:text-green-600 transition-colors">
                  Access Manifest <ArrowRight size={16} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
            <div className="max-w-2xl">
              <span className="text-amber-500 font-black uppercase tracking-[0.5em] text-[10px] mb-6 block italic">Live Market Feed</span>
              <h2 className="text-6xl lg:text-7xl font-black text-slate-950 mb-8 tracking-tighter italic uppercase leading-none">Featured <span className="text-slate-300">Catalog.</span></h2>
              <p className="text-xl text-slate-500 font-bold italic">Real-time inventory injection from our globally verified vendor network.</p>
            </div>
            <Link to="/market" className="inline-flex items-center gap-4 px-10 py-5 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-green-600 hover:text-slate-950 transition-all border-4 border-white shadow-2xl active:scale-95 italic">
              Access Full Terminal <ArrowRight size={22} strokeWidth={3} />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center py-40 rounded-[4rem] bg-slate-50 border border-slate-100 shadow-inner">
              <Loader2 className="animate-spin text-slate-950 mb-10" size={64} strokeWidth={3} />
              <p className="text-slate-300 font-black uppercase tracking-[0.6em] text-[10px] animate-pulse">Synchronizing Market Bloackchain...</p>
            </div>
          ) : trendingProducts.length > 0 ? (
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
            >
              {trendingProducts.map((product) => (
                <motion.div 
                  key={product.id}
                  variants={fadeInUp}
                  className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-premium transition-all duration-500 flex flex-col hover-lift"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-50">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-slate-50">
                        <Leaf size={64} className="text-slate-200" strokeWidth={1} />
                      </div>
                    )}
                    <div className="absolute top-6 left-6">
                      <div className="px-5 py-2 bg-slate-950/90 backdrop-blur-xl rounded-2xl flex items-center gap-3 border border-white/20 shadow-2xl">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest italic leading-none">Tier 1</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="mb-6">
                       <div className="flex items-center gap-2 text-green-600 mb-2">
                          <CheckCircle2 size={14} strokeWidth={3} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Verified Quality</span>
                       </div>
                       <Link to={`/market/${product.id}`} className="block">
                        <h3 className="text-xl font-bold text-slate-950 group-hover:text-green-600 transition-colors line-clamp-1 tracking-tight">{product.name}</h3>
                       </Link>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                      <div>
                        <p className="text-2xl font-extrabold text-slate-950 tracking-tight">₹{product.price.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/{product.unit}</p>
                      </div>
                      <button 
                        onClick={() => addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          unit: product.unit,
                          vendor: "Verified Local Seller",
                          vendor_id: product.seller_id,
                          image: product.image_url || ""
                        })}
                        className="h-12 w-12 bg-slate-950 text-white rounded-xl flex items-center justify-center hover:bg-green-600 active:scale-95 group/btn shadow-lg"
                      >
                        <ShoppingCart size={20} className="group-hover/btn:rotate-12 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-40 rounded-[4rem] border-4 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-premium mb-10">
                <Sprout size={80} className="text-slate-200" strokeWidth={1} />
              </div>
              <h3 className="text-4xl font-black text-slate-950 mb-6 tracking-tighter italic uppercase">Market Stagnation</h3>
              <p className="text-slate-400 mb-12 max-w-sm mx-auto font-bold italic leading-relaxed">System is awaiting first asset injections from the verified community nodes.</p>
              <Link to="/market" className="px-12 py-6 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-green-600 hover:text-slate-950 transition-all shadow-premium active:scale-95 italic">
                 Force Market Access
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[5rem] overflow-hidden bg-slate-950 py-32 px-12 text-center shadow-premium group">
            <div className="absolute inset-0 grayscale opacity-20 mix-blend-overlay group-hover:opacity-30 transition-opacity">
               <div className="absolute inset-0 bg-green-950 animate-pulse"></div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-6xl lg:text-7xl font-extrabold text-white mb-10 tracking-tight leading-none uppercase">Forge Your <span className="text-green-500">Legacy.</span></h2>
              <p className="text-xl text-slate-400 mb-16 max-w-3xl mx-auto font-medium opacity-90">
                Join the vanguard of the modern agrarian movement. Scalable. Transparent. Hyper-Secure.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link to="/signup" className="px-12 py-5 bg-white text-slate-950 rounded-[1.5rem] font-bold text-lg hover:bg-green-50 transition-all active:scale-95">
                  Initialize Profile
                </Link>
                <Link to="/market" className="px-12 py-5 bg-slate-900 text-white border border-slate-800 rounded-[1.5rem] font-bold text-lg hover:border-white transition-all active:scale-95">
                  Enter Ecosystem
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
