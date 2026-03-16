"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
    <div className="relative isolate">
      {/* Background Decor */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-green-200 to-emerald-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 sm:pt-32 sm:pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <AnimatePresence>
                {user && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 text-green-700 text-sm font-semibold mb-8 shadow-sm"
                  >
                    <User size={16} /> 
                    <span>Welcome back, <span className="text-green-900 font-bold">{user.displayName || "Farmer"}</span></span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
                Empowering <span className="text-gradient">Agriculture</span> through Innovation.
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mb-12 lg:mx-0 mx-auto">
                The ultimate digital ecosystem where modern farmers meet verified sellers. Secure escrow payments, direct connections, and premium quality guaranteed.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link href={user ? "/dashboard" : "/market"} className="group relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg overflow-hidden transition-all hover:shadow-2xl hover:bg-slate-800 active:scale-95">
                  <span className="relative z-10 flex items-center gap-3">
                    {user ? "Go to Dashboard" : "Start Shopping"} <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link href="/register" className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:border-green-600 hover:text-green-700 transition-all active:scale-95 shadow-sm">
                  Become a Seller
                </Link>
              </div>

              <div className="mt-12 flex items-center justify-center lg:justify-start gap-10 grayscale opacity-60">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-3xl font-black text-slate-900">10k+</span>
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Farmers</span>
                </div>
                <div className="h-10 w-px bg-slate-200"></div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-3xl font-black text-slate-900">500+</span>
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Verified Sellers</span>
                </div>
                <div className="h-10 w-px bg-slate-200"></div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-3xl font-black text-slate-900">100%</span>
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Secure</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mt-20 lg:mt-0 relative"
            >
              <div className="relative rounded-3xl overflow-hidden glass p-4 shadow-premium border-white/40">
                <div className="aspect-[4/3] bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                   <div className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-700 opacity-20">
                     <div className="grid grid-cols-4 gap-4 p-4 h-full w-full">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className="bg-white/40 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                     </div>
                   </div>
                   <Tractor size={120} className="text-green-600 drop-shadow-2xl z-10" strokeWidth={1} />
                   
                   <div className="absolute bottom-6 left-6 right-6 p-6 glass rounded-2xl border-white/20 shadow-xl z-20">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-600 p-3 rounded-xl text-white">
                          <ShieldCheck size={28} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Next-Gen Marketplace</p>
                          <p className="text-sm text-slate-600">Built for the modern agriculture world.</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Floating Element */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 hidden xl:block bg-white p-6 rounded-2xl shadow-premium border border-slate-100 z-30"
              >
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-emerald-500 animate-ping"></div>
                  <span className="font-bold text-slate-900">Live Escrow Protection</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-green-600 font-black uppercase tracking-[0.2em] text-sm mb-4 block"
            >
              Categories
            </motion.span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">Built for every farmer.</h2>
            <p className="text-lg text-slate-600">Whether you are looking for seeds, tools, or fresh harvest, we have the perfect category for you.</p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { title: "Fresh Produce", desc: "Organic vegetables and fruits from local fields.", icon: Leaf, color: "green" },
              { title: "Seeds & Soils", desc: "High-grade seeds and nutrient-rich organic soils.", icon: Sprout, color: "emerald" },
              { title: "Modern Tools", desc: "Heavy machinery and smart tools for bigger yields.", icon: Tractor, color: "blue" }
            ].map((cat, idx) => (
              <motion.div 
                key={idx}
                variants={fadeInUp}
                className="group p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-premium hover-lift transition-all"
              >
                <div className={`w-16 h-16 rounded-2xl bg-${cat.color}-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <cat.icon size={32} className={`text-${cat.color}-600`} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{cat.title}</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">{cat.desc}</p>
                <button className="flex items-center gap-2 font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                  Explore Now <ArrowRight size={18} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <span className="text-amber-500 font-black uppercase tracking-[0.2em] text-sm mb-4 block">Marketplace</span>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">Trending right now.</h2>
              <p className="text-lg text-slate-600">Discover top-rated products from verified sellers in our secure ecosystem.</p>
            </div>
            <Link href="/market" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-50 text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all border border-slate-200">
              View Entire Catalog <ArrowRight size={20} />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center py-32 rounded-[3.5rem] bg-slate-50 border border-slate-100">
              <Loader2 className="animate-spin text-green-500 mb-6" size={50} />
              <p className="text-slate-500 font-bold tracking-tight">Gathering the harvest...</p>
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
                  className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-premium transition-all duration-500 flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-50">
                    {product.image_url ? (
                      <Image 
                        src={product.image_url} 
                        alt={product.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-green-50 to-slate-100">
                        <Leaf size={48} className="text-green-200" strokeWidth={1} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <div className="px-3 py-1 glass rounded-full flex items-center gap-1.5 border-white/40 shadow-sm">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-black text-slate-900 uppercase">Featured</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="mb-6">
                       <div className="flex items-center gap-1 text-green-600 mb-2">
                          <CheckCircle2 size={12} />
                          <span className="text-[10px] font-black uppercase tracking-wider">Verified Listing</span>
                       </div>
                       <h3 className="text-xl font-bold text-slate-900 group-hover:text-green-600 transition-colors line-clamp-1">{product.name}</h3>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                      <div>
                        <p className="text-2xl font-black text-slate-900">₹{product.price}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">per {product.unit}</p>
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
                        className="h-14 w-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-green-600 transition-all hover:shadow-lg active:scale-95"
                      >
                        <ShoppingCart size={22} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-32 rounded-[3.5rem] border-2 border-dashed border-slate-200 bg-slate-50/50">
              <Sprout size={60} className="text-slate-300 mx-auto mb-8" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">The marketplace is waking up!</h3>
              <p className="text-slate-500 mb-10 max-w-sm mx-auto">Check back soon for fresh, high-quality listings from our certified local community.</p>
              <Link href="/market" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-green-600 transition-all shadow-xl">
                 Explore Available Listings
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[3.5rem] overflow-hidden bg-slate-900 py-24 px-12 text-center shadow-2xl">
            <div className="absolute inset-0 grayscale opacity-10 mix-blend-overlay">
               <div className="absolute inset-0 bg-green-600 animate-pulse"></div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-4xl lg:text-6xl font-black text-white mb-8">Ready to grow your business?</h2>
              <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                Join thousands of farmers and sellers who are already transforming the agriculture industry with Farm-Ease.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link href="/register" className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-extrabold text-lg hover:bg-green-50 transition-all hover:shadow-2xl active:scale-95">
                  Get Started Today
                </Link>
                <Link href="/market" className="px-10 py-5 bg-slate-800 text-white border border-slate-700 rounded-2xl font-extrabold text-lg hover:border-slate-500 transition-all active:scale-95">
                  Browse the Market
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
