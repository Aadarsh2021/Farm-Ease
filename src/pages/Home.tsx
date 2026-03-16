import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Leaf, ShieldCheck, Sprout, Tractor, ShoppingCart, Star, CheckCircle2, ChevronRight } from "lucide-react";
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

// --- High-End Components ---

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-green-500 origin-left z-[100]"
      style={{ scaleX }}
    />
  );
};

const SectionReveal = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-500"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(22, 163, 74, 0.15), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};

const WordReveal = ({ text }: { text: string }) => {
  const words = text.split(" ");
  return (
    <div className="flex flex-wrap justify-center lg:justify-start">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: i * 0.1,
            ease: [0.2, 0.65, 0.3, 0.9],
          }}
          className="mr-[0.25em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

// --- Page Component ---

export default function Home() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

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

    // REAL-TIME SUBSCRIPTION
    const channel = supabase
      .channel('realtime_products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        console.log('Real-time update:', payload);
        if (payload.eventType === 'INSERT') {
          setTrendingProducts((prev) => [payload.new as Product, ...prev].slice(0, 8));
        } else if (payload.eventType === 'DELETE') {
          setTrendingProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setTrendingProducts((prev) => prev.map((p) => p.id === payload.new.id ? payload.new as Product : p));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="relative isolate bg-white selection:bg-green-100 selection:text-green-900" ref={scrollRef}>
      <ScrollProgress />

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-emerald-500/10 blur-[100px] rounded-full animate-pulse delay-700"></div>
        <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-slate-200/20 blur-[150px] rounded-full"></div>
      </div>

      <section className="relative min-h-[80vh] flex items-center pt-24 pb-20 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 items-center">
            <motion.div 
              style={{ y: heroY, opacity: heroOpacity }}
              className="text-center lg:text-left relative z-10"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border-white/50 text-green-700 text-[10px] font-black uppercase tracking-[0.25em] mb-8 shadow-premium"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                The Best Agriculture Platform
              </motion.div>
              
              <h1 className="text-5xl lg:text-[4.75rem] font-[1000] text-slate-900 leading-[0.98] tracking-[-0.04em] mb-8">
                <WordReveal text="Connecting Nature & Modernity." />
              </h1>
              
              <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl mb-10 font-medium opacity-90">
                Experience the world&apos;s most sophisticated digital marketplace. Real-time escrow, verified local sourcing, and a global community.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to={user ? "/dashboard" : "/market"} className="group relative px-10 py-5 bg-slate-900 text-white rounded-[1.75rem] font-black text-lg overflow-hidden transition-all hover:shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] hover:bg-green-600 active:scale-95">
                  <span className="relative z-10 flex items-center gap-2">
                    {user ? "Dashboard" : "Start Trading"} 
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link to="/register" className="group flex items-center gap-3 px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-[1.75rem] font-black text-lg hover:border-green-600 transition-all active:scale-95 shadow-sm">
                   Become a Seller
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-16 lg:mt-0 relative hidden lg:block"
            >
              <div className="relative rounded-[3.5rem] overflow-hidden glass p-4 shadow-premium border-white/40">
                <div className="aspect-[4/5] bg-slate-900 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden group">
                   <div className="absolute inset-0 opacity-40">
                      <div className="absolute top-0 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/20 via-transparent to-transparent animate-[spin_40s_linear_infinite]"></div>
                   </div>
                   
                   <motion.div
                    animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="z-20 pointer-events-none"
                   >
                     <Tractor size={150} className="text-green-500 drop-shadow-[0_25px_25px_rgba(0,0,0,0.4)]" strokeWidth={0.5} />
                   </motion.div>

                   <div className="absolute bottom-8 left-8 right-8 p-6 glass rounded-[2rem] border-white/20 shadow-2xl z-30">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-600 h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg">
                          <ShieldCheck size={24} />
                        </div>
                        <div>
                          <p className="font-black text-lg text-slate-900">Escrow Security</p>
                          <p className="text-xs font-semibold text-slate-600">Zero-risk, high-faith commerce.</p>
                        </div>
                      </div>
                   </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute -top-6 -right-6 bg-white px-6 py-4 rounded-3xl shadow-premium border border-slate-100 flex items-center gap-3 z-40"
                >
                  <Star fill="#16a34a" className="text-green-600" size={18} />
                  <span className="text-lg font-black text-slate-900 tracking-tighter">4.9/5 Score</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(22,163,74,0.3),transparent_60%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <SectionReveal className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-green-500 font-extrabold uppercase tracking-[0.3em] text-xs mb-4 block">Our Ecosystem</span>
              <h2 className="text-5xl font-black mb-8 leading-[1] tracking-tight">The ultimate <span className="text-green-500 italic">agrarian</span> hub.</h2>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed font-medium">Curated local produce, professional tools, and verified seeds—all in one place.</p>
              
              <div className="flex flex-col gap-5">
                 {[
                   { name: "Verified Network", desc: "Access the most trusted sellers globaly." },
                   { name: "Live Tracking", desc: "Monitor your shipment from source to door." },
                   { name: "Escrow Locked", desc: "Your capital is safe until receipt." }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-4 group cursor-default">
                     <div className="h-9 w-9 rounded-full border border-slate-800 flex items-center justify-center group-hover:bg-green-500 group-hover:border-green-500 transition-all">
                        <CheckCircle2 size={16} className="text-slate-600 group-hover:text-white" />
                     </div>
                     <div>
                        <h4 className="font-bold text-sm uppercase tracking-widest text-slate-200 group-hover:text-green-500 transition-colors">{item.name}</h4>
                        <p className="text-slate-500 text-xs font-medium">{item.desc}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {[
                { title: "Produce", icon: Leaf, color: "green" },
                { title: "Seeds", icon: Sprout, color: "emerald" },
                { title: "Tools", icon: Tractor, color: "blue" },
                { title: "Global", icon: ShoppingCart, color: "amber" }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -10, rotate: idx % 2 === 0 ? 1 : -1 }}
                  className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col items-center justify-center group transition-colors hover:border-green-500/40"
                >
                  <item.icon size={40} className={`text-${item.color}-500 mb-4 group-hover:scale-110 transition-transform`} strokeWidth={1} />
                  <span className="text-xs font-black tracking-widest uppercase text-slate-300">{item.title}</span>
                </motion.div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionReveal className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <span className="text-slate-900 font-extrabold uppercase tracking-[0.3em] text-xs mb-4 block border-l-3 border-green-600 pl-3">Direct Marketplace</span>
              <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-[1] mb-5">Trending Harvests.</h2>
              <p className="text-lg text-slate-500 font-medium">Verified local assets secured by our global community.</p>
            </div>
            <Link to="/market" className="group flex items-center gap-2 px-10 py-5 bg-slate-50 text-slate-900 rounded-[1.5rem] font-black text-base hover:bg-slate-900 hover:text-white transition-all border border-slate-100 hover:border-slate-900">
               Explore Gallery <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </SectionReveal>

          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-[3rem] bg-slate-50 border border-slate-100">
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="h-16 w-16 rounded-full border-3 border-slate-200 border-t-green-600"
                ></motion.div>
                <Leaf size={20} className="absolute inset-0 m-auto text-green-600" />
              </div>
              <p className="mt-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing verified source...</p>
            </div>
          ) : trendingProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <SpotlightCard 
                  key={product.id}
                  className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-card hover:shadow-premium transition-all duration-500 flex flex-col"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
                    <img 
                      src={product.image_url || "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&q=80"} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute top-5 left-5">
                      <div className="px-3 py-1.5 glass rounded-xl flex items-center gap-1.5 border-white/50 shadow-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">In Stock</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col relative z-10">
                    <div className="mb-6">
                       <span className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1 block">FARM DIRECT</span>
                       <h3 className="text-xl font-black text-slate-900 group-hover:text-green-600 transition-colors line-clamp-2 leading-tight">{product.name}</h3>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{product.price}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Per {product.unit}</p>
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
                        className="h-12 w-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-green-600 transition-all shadow-lg active:scale-90"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 rounded-[3.5rem] border-2 border-dashed border-slate-100 bg-slate-50/30">
              <Sprout size={40} className="text-slate-200 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Market is Preparing.</h3>
              <p className="text-slate-400 mb-8 max-w-xs mx-auto font-medium text-sm leading-relaxed">Our verified source is currently preparing new harvests. Please check back shortly.</p>
              <Link to="/market" className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.25rem] font-black text-sm hover:bg-green-600 transition-all shadow-xl active:scale-95">
                 Visit Marketplace
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionReveal className="relative rounded-[4rem] overflow-hidden bg-slate-950 pt-24 pb-20 px-10 text-center shadow-2xl border border-slate-900">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 grayscale"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10">
                 The Global Choice
              </div>
              <h2 className="text-5xl lg:text-7xl font-[1000] text-white mb-8 tracking-[-0.04em] leading-[0.9]">Start your legacy <br/><span className="text-green-500 italic">today.</span></h2>
              <p className="text-xl text-slate-400 mb-12 max-w-xl mx-auto font-medium leading-relaxed">
                Experience the most trusted agriculture ecosystem ever built. Professional, secure, and direct.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link to="/signup" className="group flex items-center gap-3 px-10 py-6 bg-white text-slate-900 rounded-[1.75rem] font-black text-xl hover:bg-green-500 hover:text-white transition-all active:scale-95">
                  Join Now <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/about" className="group flex items-center gap-3 px-10 py-6 bg-slate-900 text-white border border-slate-800 rounded-[1.75rem] font-black text-xl hover:bg-slate-800 transition-all active:scale-95">
                  Learn Story
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent"></div>
    </div>
  );
}
