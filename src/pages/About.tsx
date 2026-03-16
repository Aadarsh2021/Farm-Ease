import { Link } from "react-router-dom";
import { ShieldCheck, Users, ArrowRight, Sprout, Tractor, HeartHandshake, Sparkles, Globe, Zap, Target, Layers } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
    return (
        <div className="bg-slate-950 min-h-screen">
            {/* Hero Section - V3 Clean Premium */}
            <section className="relative pt-48 pb-40 overflow-hidden">
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-600/10 blur-[180px] rounded-full -mr-96 -mt-96 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] -ml-64 -mb-64 pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto px-10 relative z-10 text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-4 bg-emerald-600/10 text-emerald-400 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.5em] mb-12 border border-emerald-500/20 shadow-2xl italic"
                    >
                        <Sparkles size={16} /> The Agrarian Mission Protocol
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-8xl md:text-[10rem] font-black text-white mb-10 leading-[0.85] tracking-tighter italic uppercase"
                    >
                        Redefining the <br />
                        <span className="text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">Harvest Economy.</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl md:text-3xl text-slate-500 max-w-4xl mx-auto leading-relaxed font-bold italic uppercase tracking-tight opacity-80"
                    >
                        Farm-Ease bridges the gap between traditional agriculture and modern finance — creating a transparent, autonomous, and secure marketplace powered by the Farm-Ease Secure protocol.
                    </motion.p>
                </div>
            </section>

            {/* Problem Space - High Contrast */}
            <section className="py-40 bg-slate-900/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/[0.01] pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                    <div>
                        <h2 className="text-6xl font-black text-white mb-16 tracking-tighter italic uppercase flex items-center gap-8">
                             Market Inefficiency <div className="w-20 h-2 bg-emerald-600"></div>
                        </h2>
                        <div className="space-y-16">
                            {[
                                { title: "Middleman Erosion", desc: "Farmers receive only 30–40% of the final consumer value due to predatory intermediate layers and legacy logistics." },
                                { title: "Settlement Vulnerability", desc: "Zero security in rural trade leads to constant capital fraud and systemic transactional mistrust." },
                                { title: "Fragmented Logistics", desc: "Premium produce struggles to reach high-value urban nodes due to broken supply chain infrastructure." },
                            ].map((point, i) => (
                                <div key={i} className="group relative">
                                    <div className="flex items-center gap-6 mb-4">
                                        <span className="text-emerald-500 font-black text-sm italic tracking-widest opacity-40">0{i + 1} //</span>
                                        <h4 className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase italic tracking-tighter leading-none">{point.title}</h4>
                                    </div>
                                    <p className="text-slate-500 font-bold leading-relaxed ml-12 italic text-xl uppercase tracking-tight opacity-70 group-hover:opacity-100 transition-opacity">{point.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-950 rounded-[5rem] p-20 relative overflow-hidden shadow-2xl border border-white/5 group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[120px] rounded-full group-hover:bg-blue-500/10 transition-colors duration-1000"></div>
                        <h3 className="text-4xl font-black text-white mb-16 tracking-tighter italic uppercase flex items-center justify-between">
                            Secure Protocol <div className="w-12 h-1 bg-white/20"></div>
                        </h3>
                        <div className="space-y-10">
                            {[
                                { icon: <Globe size={24} />, title: "Autonomous Trust", desc: "Bypassing middlemen to connect harvesters directly with the primary consumer node." },
                                { icon: <ShieldCheck size={24} />, title: "Capital Guard", desc: "Settlement is locked in secure clearing and only released upon asset verification." },
                                { icon: <Zap size={24} />, title: "Instant Liquidity", desc: "Zero-latency payment distribution once the delivery manifest is authenticated." },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-8 bg-white/5 backdrop-blur-3xl rounded-[3rem] p-8 border border-white/5 hover:bg-white/10 transition-all duration-500 group/card">
                                    <div className="bg-slate-950 p-6 rounded-3xl text-emerald-500 shadow-2xl border border-white/5 group-hover/card:rotate-12 transition-transform duration-500">{item.icon}</div>
                                    <div>
                                        <h4 className="font-black text-white uppercase italic text-xl tracking-tighter mb-2">{item.title}</h4>
                                        <p className="text-slate-500 text-sm font-bold leading-relaxed italic uppercase tracking-wider">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works - Premium Cards */}
            <section className="py-40 relative">
                <div className="max-w-7xl mx-auto px-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-7xl font-black text-white mb-8 tracking-tighter italic uppercase leading-none">Market <span className="text-emerald-500">Dynamics.</span></h2>
                            <p className="text-slate-500 font-bold italic uppercase tracking-[0.4em] text-xs">A streamlined protocol for autonomous agricultural exchange.</p>
                        </div>
                        <Target className="text-emerald-500/10 group-hover:rotate-45 transition-transform duration-1000" size={120} strokeWidth={1} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { step: "01", icon: <Tractor size={40} />, title: "Asset Deployment", desc: "Farmers list verified produce batches with transparent pricing and bio-origin data." },
                            { step: "02", icon: <Layers size={40} />, title: "Secure Commitment", desc: "Buyer capital is committed to the Farm-Ease clearing system via the global network." },
                            { step: "03", icon: <HeartHandshake size={40} />, title: "Verified Release", desc: "Upon delivery authentication, capital is instantly disbursed to the harvester node." },
                        ].map((item) => (
                            <div key={item.step} className="bg-slate-900/40 backdrop-blur-3xl rounded-[4rem] p-16 border border-white/5 shadow-2xl hover:scale-[1.02] transition-all duration-700 group relative overflow-hidden hover:bg-white group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
                                <div className="text-8xl font-black text-white/5 absolute -bottom-4 -right-4 leading-none italic uppercase tracking-tighter group-hover:text-slate-950/10 transition-colors">{item.step}</div>
                                <div className="bg-slate-950 p-6 rounded-[2rem] w-fit mb-12 text-emerald-500 group-hover:bg-slate-950 transition-all shadow-2xl border border-white/5 group-hover:rotate-12 duration-500">
                                    {item.icon}
                                </div>
                                <h3 className="text-3xl font-black text-white mb-6 tracking-tighter italic uppercase group-hover:text-slate-950 transition-colors leading-none">{item.title}</h3>
                                <p className="text-slate-500 font-bold text-lg leading-relaxed italic uppercase tracking-tight group-hover:text-slate-800 transition-colors opacity-80 group-hover:opacity-100">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ecosystem - Horizontal High-Density */}
            <section className="py-40 bg-slate-900/20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-10">
                    <div className="text-center mb-32">
                        <h2 className="text-7xl font-black text-white mb-6 tracking-tighter italic uppercase leading-none">The Participant Network</h2>
                        <div className="w-32 h-2 bg-emerald-600 mx-auto rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
                        {[
                            { icon: <Tractor size={48} />, title: "Harvesters", color: "text-emerald-500", desc: "Verified producers accessing global liquidity and fair market value for every asset batch." },
                            { icon: <Sprout size={48} />, title: "Agri-Nodes", color: "text-blue-500", desc: "Certified vendors supply precision tech, bio-scan equipment, and generic assets to the network." },
                            { icon: <Users size={48} />, title: "Aggregators", color: "text-emerald-400", desc: "Direct-to-consumer access nodes with authenticated quality and payment protection." },
                        ].map((item) => (
                            <div key={item.title} className="text-center group">
                                <div className={`inline-flex p-10 rounded-[3rem] mb-12 bg-slate-950 border border-white/5 shadow-2xl group-hover:scale-110 transition-transform duration-700 ${item.color}`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-4xl font-black text-white mb-6 tracking-tighter italic uppercase group-hover:text-emerald-500 transition-colors duration-500">{item.title}</h3>
                                <p className="text-slate-500 font-bold leading-relaxed italic text-lg px-8 uppercase tracking-widest text-[10px] opacity-70 group-hover:opacity-100 transition-opacity">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA - V3 Impact */}
            <section className="relative mx-10 md:mx-20 mb-40 overflow-hidden rounded-[5rem] group shadow-2xl border border-white/5">
                <div className="absolute inset-0 bg-slate-950"></div>
                <div className="absolute top-0 right-0 w-[80%] h-full bg-emerald-600/10 blur-[150px] rounded-full -mr-32 -mt-32 transition-opacity group-hover:opacity-100 duration-1000 opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-[60%] h-full bg-blue-600/5 blur-[150px] rounded-full -ml-32 -mb-32 transition-opacity group-hover:opacity-100 duration-1000 opacity-40"></div>
                
                <div className="max-w-5xl mx-auto text-center px-10 py-40 relative z-10">
                    <h2 className="text-7xl md:text-9xl font-black text-white mb-12 tracking-tighter italic leading-[0.85] uppercase">
                        Join the <span className="text-emerald-500 drop-shadow-[0_0_40px_rgba(16,185,129,0.3)]">Autonomous</span> <br /> 
                        Agrarian Economy.
                    </h2>
                    <p className="text-slate-400 text-2xl mb-20 max-w-2xl mx-auto font-bold italic uppercase tracking-widest text-xs opacity-80 leading-relaxed">
                        Whether you're a harvester, node seller, or aggregator — the Farm-Ease protocol is ready for deployment. Join the future of food today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-10 justify-center items-center">
                        <Link to="/signup" className="min-w-[280px] bg-emerald-600 text-slate-950 font-black px-12 py-8 rounded-[2.5rem] hover:bg-white transition-all shadow-2xl flex items-center justify-center gap-6 text-2xl italic uppercase active:scale-95 group/btn border border-emerald-400/20">
                            Initialize Hub <ArrowRight size={32} className="group-hover/btn:translate-x-4 transition-transform duration-500" strokeWidth={4} />
                        </Link>
                        <Link to="/market" className="min-w-[280px] text-white border-8 border-white/5 font-black px-12 py-8 rounded-[2.5rem] hover:bg-white/5 transition-all flex items-center justify-center gap-6 text-2xl italic uppercase active:scale-95 hover:border-white/10 duration-500">
                            Market Manifest
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
