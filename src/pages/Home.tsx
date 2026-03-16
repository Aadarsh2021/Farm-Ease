import { ArrowRight, Shield, Truck, Users, Search, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image_url: string;
  category?: string;
  description?: string;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .limit(4);
      if (data) setFeaturedProducts(data as Product[]);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const features = [
    {
      icon: <Shield className="text-emerald-600" size={32} />,
      title: "Secure Payments",
      desc: "Patented smart contract technology ensures your money is safe until delivery is confirmed."
    },
    {
      icon: <Truck className="text-emerald-600" size={32} />,
      title: "Reliable Logistics",
      desc: "Efficient farm-to-door network ensuring freshness and speed for every order."
    },
    {
      icon: <Users className="text-emerald-600" size={32} />,
      title: "Direct Connection",
      desc: "Bridging the gap between modern farmers and verified sellers with zero middlemen."
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold mb-6"
            >
              <CheckCircle2 size={16} /> Empowering India's Agricultural Economy
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8"
            >
              The Future of <span className="text-emerald-600">Farming</span> is Digital.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg lg:text-xl text-slate-600 leading-relaxed mb-10"
            >
              Farm-Ease creates a transparent, fair, and secure marketplace powered by our proprietary smart contract protection. Buy seeds, tools, and produce with absolute confidence.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link 
                to="/market" 
                className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200 active:scale-95 flex items-center gap-2"
              >
                Browse Marketplace <ArrowRight size={20} />
              </Link>
              <Link 
                to="/about" 
                className="px-8 py-4 bg-slate-50 text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all border border-slate-200"
              >
                Learn More
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-400 rounded-full blur-[120px]" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Market Access */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Featured Assets</h2>
              <p className="text-slate-600">Sourced directly from verified sellers and modern farmers.</p>
            </div>
            <Link to="/market" className="text-emerald-600 font-bold flex items-center gap-2 hover:underline">
              View all listings <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-[400px] bg-slate-100 rounded-3xl animate-pulse" />
              ))
            ) : (
              featuredProducts.map((product) => (
                <motion.div 
                  key={product.id}
                  whileHover={{ y: -5 }}
                  className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
                      {product.category || "Premium"}
                    </p>
                    <h4 className="text-lg font-bold text-slate-900 mb-4 truncate">{product.name}</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-black text-slate-900">₹{product.price}</span>
                        <span className="text-xs text-slate-400 font-medium lowercase">/{product.unit}</span>
                      </div>
                      <Link 
                        to="/market"
                        className="p-3 bg-slate-900 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                      >
                        <Search size={18} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-24 bg-emerald-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-8">Bridging the gap with secure technology.</h2>
              <div className="space-y-6">
                <div className="flex gap-4 p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-bold text-emerald-400">01</div>
                  <p className="text-emerald-50/80 leading-relaxed">
                    Farmers often receive only 30% of the value. Our platform ensures they get the full value by eliminating intermediaries.
                  </p>
                </div>
                <div className="flex gap-4 p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-bold text-emerald-400">02</div>
                  <p className="text-emerald-50/80 leading-relaxed">
                    Our patented smart contract escrow ensures payments are only released when both parties are satisfied.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h4 className="text-slate-900 font-extrabold">Smart Contract Protection</h4>
                      <p className="text-slate-500 text-sm">Status: Active & Verified</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                    <div className="h-4 bg-slate-100 rounded-full w-full" />
                    <div className="h-4 bg-slate-100 rounded-full w-1/2" />
                 </div>
                 <div className="mt-8 pt-8 border-t flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Protocol Verified</span>
                    <div className="px-4 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-bold">Encrypted</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
