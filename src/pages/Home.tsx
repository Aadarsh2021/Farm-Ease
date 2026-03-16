import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Leaf, Sprout, Tractor, ShoppingCart, Loader2, Star, CheckCircle2, ShieldCheck } from "lucide-react";
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

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const rotate = useTransform(scrollY, [0, 500], [0, 15]);

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
    <div className="relative overflow-hidden">
      {/* Hero Section 3.0 */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
        {/* Parallax Decorative Elements */}
        <motion.div 
            style={{ y: y1, rotate }}
            className="absolute top-[10%] -left-[5%] w-[40vw] h-[40vw] bg-[hsl(var(--primary))] opacity-[0.03] blur-[100px] rounded-full pointer-events-none"
        />
        <motion.div 
            style={{ y: y2, rotate: -rotate }}
            className="absolute bottom-[10%] -right-[5%] w-[35vw] h-[35vw] bg-[hsl(var(--primary-light))] opacity-[0.02] blur-[80px] rounded-full pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full">
          <div className="lg:grid lg:grid-cols-2 gap-x-20 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-center lg:text-left"
            >
              <AnimatePresence mode="wait">
                {user && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--primary))] text-[10px] uppercase font-black tracking-[0.2em] mb-10 shadow-sm"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
                        <span>Terminal Active: <span className="text-[hsl(var(--foreground))]">{user.displayName || user.email?.split('@')[0]}</span></span>
                    </motion.div>
                )}
              </AnimatePresence>
              
              <h1 className="text-5xl lg:text-7xl font-black text-[hsl(var(--foreground))] leading-[0.95] tracking-[-0.04em] mb-8">
                Harvest the <br />
                <span className="text-[hsl(var(--primary))] italic">Absolute Finest.</span>
              </h1>
              
              <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed max-w-xl mb-12 lg:mx-0 mx-auto font-medium tracking-tight">
                The world's most sophisticated digital agrarian collective. Secure high-fidelity transactions, direct field-to-terminal logistics, and premium yield guaranteed by our escrow vault.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to={user ? "/dashboard" : "/market"} className="group relative px-10 py-5 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] rounded-[1.5rem] font-black text-xs uppercase tracking-widest overflow-hidden transition-all hover:bg-[hsl(var(--primary))] active:scale-95 shadow-elite hover:shadow-glow hover:shadow-primary/20">
                  <span className="relative z-10 flex items-center gap-3">
                    {user ? "Personal Dashboard" : "Access Terminal"} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link to="/signup" className="px-10 py-5 bg-transparent border-2 border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-[hsl(var(--muted))] transition-all active:scale-95">
                  Establish Presence
                </Link>
              </div>

              <div className="mt-16 flex items-center justify-center lg:justify-start gap-12">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-4xl font-black text-[hsl(var(--foreground))] tracking-tighter">12.4K+</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">Market Nodes</span>
                </div>
                <div className="h-10 w-px bg-[hsl(var(--border))] opacity-50"></div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-4xl font-black text-[hsl(var(--foreground))] tracking-tighter">100%</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">Vault Secure</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-20 lg:mt-0 relative"
            >
              <div className="relative rounded-[4rem] overflow-hidden bg-[hsl(var(--muted))] p-6 shadow-elite border border-[hsl(var(--border))] group">
                <div className="aspect-[5/4] bg-[hsl(var(--background))] rounded-[3rem] flex items-center justify-center relative overflow-hidden shadow-inner">
                   {/* Tech Grid Overlay */}
                   <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                   
                   <Tractor size={180} className="text-[hsl(var(--primary))] drop-shadow-[0_0_40px_hsla(var(--primary),0.3)] z-10 transition-transform duration-1000 group-hover:scale-105 group-hover:rotate-1" strokeWidth={0.5} />
                   
                   <div className="absolute bottom-8 left-8 right-8 p-6 glass rounded-[2.5rem] border border-[hsl(var(--border))] shadow-elite z-20">
                      <div className="flex items-center gap-5">
                        <div className="bg-[hsl(var(--foreground))] p-4 rounded-2xl text-[hsl(var(--background))] shadow-xl">
                          <CheckCircle2 size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="font-black text-[hsl(var(--foreground))] tracking-tight mb-1 text-lg">Finest-Grade Quality</p>
                          <p className="text-[9px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Verified by Global Consensus</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Status Floating Pill */}
              <motion.div 
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-4 hidden xl:flex glass px-7 py-4 rounded-3xl shadow-elite border border-[hsl(var(--border))] z-30"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--primary))]"></div>
                    <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-[hsl(var(--primary))] animate-ping"></div>
                  </div>
                  <span className="font-black text-[hsl(var(--foreground))] text-[9px] uppercase tracking-[0.2em] leading-none">Global Sync Frequency: High</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Ecosystem 3.0 */}
      <section className="py-32 relative overflow-hidden bg-[hsl(var(--background))]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))] text-[9px] font-black uppercase tracking-[0.3em] mb-6 shadow-sm border border-[hsl(var(--primary))/0.1]"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
              Verified Economic Engine
            </motion.div>
            <h2 className="text-5xl lg:text-6xl font-black text-[hsl(var(--foreground))] mb-8 tracking-[-0.03em] leading-none uppercase italic">
              Elite <span className="opacity-20">Consensus.</span>
            </h2>
            <p className="text-lg text-[hsl(var(--muted-foreground))] font-medium tracking-tight">
              A decentralized marketplace engineered for high-frequency agrarian trade. Verified provenance, zero-latency logistics, and hyper-secure escrow.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { title: "Direct Market", desc: "Eliminate middleman friction with our automated field-to-terminal smart protocols.", icon: Leaf, tag: "Live" },
              { title: "Escrow Vault", desc: "Multi-layered encryption ensures every micro-transaction is fortified and insured.", icon: ShieldCheck, tag: "Secure" },
              { title: "Global Logistics", desc: "Optimized farm-to-door network delivering peak freshness at orbital speeds.", icon: Tractor, tag: "Fast" }
            ].map((cat, idx) => (
              <motion.div 
                key={idx}
                variants={fadeInUp}
                className="group relative p-12 bg-[hsl(var(--muted))] rounded-[3rem] border border-[hsl(var(--border))] hover:bg-[hsl(var(--background))] hover:shadow-elite transition-all duration-700 hover:-translate-y-2 overflow-hidden"
              >
                {/* Accent Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--primary))] opacity-[0.03] blur-3xl pointer-events-none group-hover:opacity-[0.1] transition-opacity" />
                
                <div className="w-16 h-16 rounded-[1.5rem] bg-[hsl(var(--foreground))] text-[hsl(var(--background))] flex items-center justify-center mb-10 group-hover:bg-[hsl(var(--primary))] transition-colors shadow-elite">
                  <cat.icon size={28} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform duration-500" />
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl font-black text-[hsl(var(--foreground))] tracking-tighter">{cat.title}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))] text-[8px] font-black uppercase tracking-widest">{cat.tag}</span>
                </div>
                
                <p className="text-[hsl(var(--muted-foreground))] mb-10 leading-relaxed font-medium tracking-tight text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                    {cat.desc}
                </p>
                
                <Link to="/market" className="inline-flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors group/link">
                  Terminal Access <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Assets 3.0 */}
      <section className="py-32 bg-[hsl(var(--muted))] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-[hsl(var(--primary))] font-black uppercase tracking-[0.4em] text-[9px] mb-4 block"
              >
                Live Catalog Injection
              </motion.span>
              <h2 className="text-5xl lg:text-6xl font-black text-[hsl(var(--foreground))] mb-8 tracking-[-0.04em] leading-none uppercase italic">
                Prime <span className="text-[hsl(var(--border))]">Assets.</span>
              </h2>
              <p className="text-lg text-[hsl(var(--muted-foreground))] font-medium tracking-tight">
                Strategic inventory synchronized in real-time from our globally verified agrarian field nodes.
              </p>
            </div>
            <Link to="/market" className="group inline-flex items-center gap-4 px-10 py-5 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-[hsl(var(--primary))] transition-all shadow-elite active:scale-95 italic">
              Full Terminal Access <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center py-40 rounded-[3rem] bg-[hsl(var(--background))] border border-[hsl(var(--border))] shadow-inner">
              <div className="relative mb-10">
                <Loader2 className="animate-spin text-[hsl(var(--primary))]" size={64} strokeWidth={2} />
                <div className="absolute inset-0 blur-2xl bg-[hsl(var(--primary))] opacity-20 animate-pulse" />
              </div>
              <p className="text-[hsl(var(--muted-foreground))] font-black uppercase tracking-[0.6em] text-[9px] animate-pulse">Syncing Blockchain Manifest...</p>
            </div>
          ) : trendingProducts.length > 0 ? (
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {trendingProducts.map((product) => (
                <motion.div 
                  key={product.id}
                  variants={fadeInUp}
                  className="group bg-[hsl(var(--background))] rounded-[2.5rem] border border-[hsl(var(--border))] overflow-hidden shadow-sm hover:shadow-elite transition-all duration-700 flex flex-col hover:-translate-y-2"
                >
                  <div className="relative aspect-square overflow-hidden bg-[hsl(var(--muted))]">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-[hsl(var(--muted))] opacity-40">
                        <Leaf size={80} className="text-[hsl(var(--foreground))]" strokeWidth={0.5} />
                      </div>
                    )}
                    <div className="absolute top-6 left-6">
                      <div className="px-5 py-2.5 bg-[hsl(var(--foreground))/0.9] backdrop-blur-xl rounded-2xl flex items-center gap-3 border border-white/10 shadow-2xl">
                        <Star size={12} className="fill-[hsl(var(--primary))] text-[hsl(var(--primary))]" />
                        <span className="text-[9px] font-black text-[hsl(var(--background))] uppercase tracking-widest leading-none">Verified Tier</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="mb-8">
                       <div className="flex items-center gap-2 text-[hsl(var(--primary))] mb-3">
                          <CheckCircle2 size={12} strokeWidth={3} />
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">Quantum Verified</span>
                       </div>
                       <Link to={`/market/${product.id}`} className="block">
                        <h3 className="text-xl font-black text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-1 tracking-tighter uppercase italic">{product.name}</h3>
                       </Link>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-8 border-t border-[hsl(var(--border))] opacity-80 group-hover:opacity-100 transition-opacity">
                      <div>
                        <p className="text-2xl font-black text-[hsl(var(--foreground))] tracking-tighter leading-none mb-1">₹{product.price.toLocaleString()}</p>
                        <p className="text-[9px] font-black text-[hsl(var(--muted-foreground))] uppercase tracking-widest">/{product.unit}</p>
                      </div>
                      <button 
                        onClick={() => addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          unit: product.unit,
                          vendor: "Consensus Verified",
                          vendor_id: product.seller_id,
                          image: product.image_url || ""
                        })}
                        className="h-14 w-14 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] rounded-2xl flex items-center justify-center hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--background))] active:scale-95 group/btn shadow-elite transition-all"
                      >
                        <ShoppingCart size={22} className="group-hover/btn:rotate-12 transition-transform duration-500" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-40 rounded-[3rem] border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--background))] flex flex-col items-center">
              <div className="bg-[hsl(var(--muted))] p-12 rounded-[3rem] shadow-elite mb-10 border border-[hsl(var(--border))]">
                <Sprout size={80} className="text-[hsl(var(--border))]" strokeWidth={0.5} />
              </div>
              <h3 className="text-4xl font-black text-[hsl(var(--foreground))] mb-6 tracking-tighter italic uppercase">Terminal Idle</h3>
              <p className="text-[hsl(var(--muted-foreground))] mb-12 max-w-sm mx-auto font-bold tracking-tight opacity-70">Awaiting first asset injections from verified community nodes.</p>
              <Link to="/market" className="px-12 py-6 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[hsl(var(--primary))] transition-all shadow-elite active:scale-95 italic">
                 Initialize Terminal
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Economic Frontier CTA 3.0 */}
      <section className="py-32 px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[hsl(var(--primary))] opacity-[0.03] blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[4rem] overflow-hidden bg-[hsl(var(--foreground))] py-24 px-12 text-center shadow-elite group border border-white/5">
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 grayscale opacity-40 mix-blend-overlay group-hover:opacity-50 transition-opacity pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.02) 50%, transparent 75%)', backgroundSize: '200% 200%' }}>
               <motion.div 
                animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
               />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
            >
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-block px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/60 text-[9px] font-black uppercase tracking-[0.4em] mb-10"
              >
                Agrarian Revolution
              </motion.div>
              
              <h2 className="text-5xl lg:text-7xl font-black text-white mb-10 tracking-[-0.04em] leading-[0.9] uppercase italic">
                Forge Your <br />
                <span className="text-[hsl(var(--primary))]">Economic Legacy.</span>
              </h2>
              
              <p className="text-xl text-white/50 mb-16 max-w-3xl mx-auto font-medium tracking-tight leading-relaxed">
                Join the vanguard of the modern agrarian movement. Scalable. Transparent. Hyper-Secure. Access the ultimate digital terminal today.
              </p>
              
              <div className="flex flex-wrap justify-center gap-6">
                <Link to="/signup" className="px-12 py-6 bg-white text-[hsl(var(--foreground))] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[hsl(var(--primary))] hover:text-white transition-all active:scale-95 shadow-2xl">
                  Initialize Profile
                </Link>
                <Link to="/market" className="px-12 py-6 bg-transparent text-white border-2 border-white/10 hover:border-white/40 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95">
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
