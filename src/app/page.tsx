"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, Leaf, ShieldCheck, Sprout, Tractor, ShoppingCart, User, Loader2, Star, CheckCircle2, ChevronRight, Play } from "lucide-react";
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

// --- Components ---

const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(22, 163, 74, 0.1), transparent 40%)`,
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

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

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
    <div className="relative isolate bg-white" ref={scrollRef}>
      {/* Animated Mesh Background Foundation */}
      <div className="mesh-bg opacity-30"></div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-16 items-center">
            <motion.div 
              style={{ y: heroY, opacity: heroOpacity }}
              className="text-center lg:text-left relative z-10"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border-white/50 text-green-700 text-xs font-black uppercase tracking-[0.2em] mb-10 shadow-premium"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                The Future of Agriculture
              </motion.div>
              
              <h1 className="text-6xl lg:text-[5.5rem] font-[1000] text-slate-900 leading-[0.95] tracking-[-0.04em] mb-10">
                <WordReveal text="Cultivate. Connect. Prosper." />
              </h1>
              
              <p className="text-xl lg:text-2xl text-slate-600 leading-relaxed max-w-2xl mb-12 font-medium">
                The world's most sophisticated agricultural marketplace. Real-time escrow, verified local sourcing, and a global community of modern farmers.
              </p>
              
              <div className="flex flex-wrap gap-5 justify-center lg:justify-start">
                <Link href={user ? "/dashboard" : "/market"} className="group relative px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg overflow-hidden transition-all hover:shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] hover:bg-green-600 active:scale-95">
                  <span className="relative z-10 flex items-center gap-3">
                    {user ? "View Dashboard" : "Start Exploring"} 
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link href="/register" className="group flex items-center gap-4 px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-[2rem] font-black text-lg hover:border-green-600 transition-all active:scale-95 shadow-sm">
                  <div className="p-2 bg-slate-50 group-hover:bg-green-50 rounded-xl transition-colors">
                    <Tractor size={20} className="group-hover:text-green-600 transition-colors" />
                  </div>
                  Become a Seller
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-24 lg:mt-0 relative hidden lg:block"
            >
              <div className="relative rounded-[4rem] overflow-hidden glass p-6 shadow-premium border-white/40 ring-1 ring-slate-900/5">
                <div className="aspect-[4/5] bg-slate-900 rounded-[3rem] flex items-center justify-center relative overflow-hidden group">
                   {/* Abstract Visual Pattern */}
                   <div className="absolute inset-0 opacity-40">
                      <div className="absolute top-0 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/20 via-transparent to-transparent animate-[spin_30s_linear_infinite]"></div>
                   </div>
                   
                   <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="z-20 pointer-events-none"
                   >
                     <Tractor size={180} className="text-green-500 drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]" strokeWidth={0.5} />
                   </motion.div>

                   <div className="absolute bottom-10 left-10 right-10 p-8 glass rounded-[2.5rem] border-white/20 shadow-2xl z-30">
                      <div className="flex items-center gap-6">
                        <div className="bg-green-600 h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-lg">
                          <ShieldCheck size={32} />
                        </div>
                        <div>
                          <p className="font-black text-xl text-slate-900 mb-1">Escrow Secured</p>
                          <p className="text-sm font-semibold text-slate-600">Zero-risk transactions for peace of mind.</p>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Floating Meta-Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute -top-12 -right-12 bg-white px-8 py-6 rounded-3xl shadow-premium border border-slate-100 flex items-center gap-4 z-40"
                >
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Star size={24} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Platform Rating</p>
                    <p className="text-xl font-black text-slate-900">4.9/5.0 <span className="text-slate-300 ml-1 font-bold text-sm">Score</span></p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Scroll / Grid Reveal */}
      <section className="py-40 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(22,163,74,0.3),transparent_60%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-green-500 font-extrabold uppercase tracking-[0.3em] text-sm mb-6 block"
              >
                Our Ecosystem
              </motion.span>
              <h2 className="text-6xl font-black mb-10 leading-[1] tracking-tight">Everything for the digital <span className="text-green-500 italic">agrarian.</span></h2>
              <p className="text-xl text-slate-400 mb-12 leading-relaxed font-medium">From professional seeds to heavy industrial solutions, we've curated the ultimate collection for your success.</p>
              
              <div className="flex flex-col gap-6">
                 {[
                   { name: "Global Marketplace", desc: "Access verified sellers across 50+ regions." },
                   { name: "Escrow Protection", desc: "No funds released until you verify your harvest." },
                   { name: "Logistics Network", desc: "Direct farm-to-door delivery with live tracking." }
                 ].map((item, i) => (
                   <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="flex items-center gap-5 group cursor-default"
                   >
                     <div className="h-10 w-10 rounded-full border border-slate-800 flex items-center justify-center group-hover:bg-green-500 group-hover:border-green-500 transition-all">
                        <CheckCircle2 size={18} className="text-slate-600 group-hover:text-white" />
                     </div>
                     <div>
                        <h4 className="font-bold text-lg group-hover:text-green-500 transition-colors uppercase tracking-widest text-sm">{item.name}</h4>
                        <p className="text-slate-500 text-sm font-medium">{item.desc}</p>
                     </div>
                   </motion.div>
                 ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { title: "Produce", icon: Leaf, color: "green" },
                { title: "Seeds", icon: Sprout, color: "emerald" },
                { title: "Tools", icon: Tractor, color: "blue" },
                { title: "Market", icon: ShoppingCart, color: "amber" }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? 2 : -2 }}
                  className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] flex flex-col items-center justify-center group transition-colors hover:border-green-500/50"
                >
                  <item.icon size={48} className={`text-${item.color}-500 mb-6 group-hover:scale-110 transition-transform`} strokeWidth={1} />
                  <span className="text-xl font-black tracking-widest uppercase text-sm">{item.title}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Marketplace */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
            <div className="max-w-3xl">
              <span className="text-slate-900 font-extrabold uppercase tracking-[0.3em] text-sm mb-6 block border-l-4 border-green-600 pl-4">Live Auctions</span>
              <h2 className="text-6xl font-black text-slate-900 tracking-tight leading-[1] mb-6">Trending right now.</h2>
              <p className="text-xl text-slate-500 font-medium">Premium assets being secured by our community every second.</p>
            </div>
            <Link href="/market" className="group flex items-center gap-3 px-12 py-6 bg-slate-50 text-slate-900 rounded-[2rem] font-black text-lg hover:bg-slate-900 hover:text-white transition-all border-2 border-slate-100 hover:border-slate-900">
               Marketplace <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center py-40 rounded-[4rem] bg-slate-50 border border-slate-100">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-4 border-slate-200 border-t-green-600 animate-spin"></div>
                <Leaf size={24} className="absolute inset-0 m-auto text-green-600" />
              </div>
              <p className="mt-10 text-slate-500 font-black uppercase tracking-widest text-sm">Syncing with global market...</p>
            </div>
          ) : trendingProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {trendingProducts.map((product) => (
                <SpotlightCard 
                  key={product.id}
                  className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-card hover:shadow-premium transition-all duration-700 flex flex-col"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                    {product.image_url ? (
                      <Image 
                        src={product.image_url} 
                        alt={product.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-1000" 
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-green-50 to-slate-200">
                        <Leaf size={60} className="text-green-100" strokeWidth={0.5} />
                      </div>
                    )}
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                      <div className="px-4 py-2 glass rounded-2xl flex items-center gap-2 border-white/50 shadow-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-10 flex-1 flex flex-col relative z-10">
                    <div className="mb-8">
                       <span className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2 block">Verified Origin</span>
                       <h3 className="text-2xl font-black text-slate-900 group-hover:text-green-600 transition-colors line-clamp-2 leading-tight">{product.name}</h3>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{product.price}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fixed per {product.unit}</p>
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
                        className="h-16 w-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-green-600 transition-all shadow-xl active:scale-90"
                      >
                        <ShoppingCart size={24} />
                      </button>
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-40 rounded-[4rem] border-4 border-dashed border-slate-100 bg-slate-50/30">
              <div className="bg-white h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-10 shadow-premium">
                <Sprout size={48} className="text-slate-200" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Market is syncing.</h3>
              <p className="text-slate-500 mb-12 max-w-sm mx-auto font-medium text-lg leading-relaxed">Our verified network is preparing new harvests. Join the waitlist for instant notifications.</p>
              <Link href="/market" className="inline-flex items-center gap-4 px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-green-600 transition-all shadow-2xl active:scale-95">
                 Join the Community
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* World Class CTA */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[5rem] overflow-hidden bg-slate-900 pt-32 pb-24 px-12 text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-800">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full border border-white/10 bg-white/5 text-slate-300 text-sm font-black uppercase tracking-[0.3em] mb-12">
                 Join 50,000+ Modern Farmers
              </div>
              <h2 className="text-6xl lg:text-8xl font-[1000] text-white mb-10 tracking-[-0.04em] leading-[0.9]">Start your legacy <br/><span className="text-green-500 italic">today.</span></h2>
              <p className="text-2xl text-slate-400 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
                The world is changing. Your farm should too. Experience the most trusted agriculture ecosystem ever built.
              </p>
              <div className="flex flex-wrap justify-center gap-8">
                <Link href="/signup" className="group flex items-center gap-4 px-14 py-7 bg-white text-slate-900 rounded-[2.5rem] font-black text-2xl hover:bg-green-500 hover:text-white transition-all hover:shadow-[0_20px_50px_rgba(34,197,94,0.3)] active:scale-95">
                  Join Now <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/about" className="group flex items-center gap-4 px-14 py-7 bg-slate-800/50 backdrop-blur-md text-white border border-slate-700/50 rounded-[2.5rem] font-black text-2xl hover:bg-slate-700 transition-all active:scale-95">
                  <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                    <Play size={18} fill="currentColor" />
                  </div>
                  Watch Story
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer Decoration */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
    </div>
  );
}
