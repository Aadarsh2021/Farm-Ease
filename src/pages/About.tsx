import { Link } from "react-router-dom";
import { ShieldCheck, Users, ArrowRight, Sprout, Tractor, HeartHandshake, Sparkles, Globe, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
    return (
        <div className="bg-white">
            {/* Hero Section - V3 Clean Premium */}
            <section className="relative pt-40 pb-32 overflow-hidden bg-slate-50">
                <div className="absolute top-0 right-0 w-[50%] h-full bg-emerald-500/5 blur-[120px] rounded-full -mr-64 -mt-32"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-emerald-100/50 text-emerald-700 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 border border-emerald-200"
                    >
                        <Sparkles size={14} /> The Agrarian Mission
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black text-slate-950 mb-8 leading-[0.9] tracking-tighter italic"
                    >
                        Redefining the <br />
                        <span className="text-emerald-600">Harvest Economy.</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-bold italic opacity-80"
                    >
                        Farm-Ease bridges the gap between traditional agriculture and modern finance — creating a transparent, fair, and secure marketplace powered by the Farm-Ease Secure protocol.
                    </motion.p>
                </div>
            </section>

            {/* Problem Space - High Contrast */}
            <section className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div>
                        <h2 className="text-4xl font-black text-slate-950 mb-10 tracking-tighter italic uppercase underline decoration-emerald-500 decoration-4 underline-offset-8">The Economic Gap</h2>
                        <div className="space-y-10">
                            {[
                                { title: "Middleman Erosion", desc: "Farmers receive only 30–40% of the final consumer price due to predatory intermediate layers." },
                                { title: "Payment Vulnerability", desc: "Zero security in rural trade leads to constant fraud and systemic mistrust." },
                                { title: "Fragmented Access", desc: "Premium produce struggles to reach high-value urban demand due to broken logistics." },
                            ].map((point, i) => (
                                <div key={i} className="group">
                                    <div className="flex items-center gap-4 mb-2">
                                        <span className="text-emerald-600 font-black text-xs font-mono">0{i + 1} //</span>
                                        <h4 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase italic">{point.title}</h4>
                                    </div>
                                    <p className="text-slate-400 font-bold leading-relaxed ml-10 italic">{point.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-950 rounded-[4rem] p-16 relative overflow-hidden shadow-premium">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
                        <h3 className="text-3xl font-black text-white mb-10 tracking-tighter italic italic uppercase">The Farm-Ease Secure Protocol</h3>
                        <div className="space-y-6">
                            {[
                                { icon: <Globe size={20} />, title: "Decentralized Trust", desc: "Bypassing middlemen to connect harvesters directly with the consumer node." },
                                { icon: <ShieldCheck size={20} />, title: "Farm-Ease Secure Protocol", desc: "Capital is locked in secure vaults and only released upon delivery verification." },
                                { icon: <Zap size={20} />, title: "Instant Settlement", desc: "Zero-latency payment distribution once delivery is authenticated." },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-6 bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                                    <div className="text-emerald-400 mt-1">{item.icon}</div>
                                    <div>
                                        <h4 className="font-black text-white uppercase italic text-sm">{item.title}</h4>
                                        <p className="text-slate-400 text-xs font-bold leading-relaxed mt-1 italic">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works - Premium Cards */}
            <section className="py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-20">
                        <div className="max-w-xl">
                            <h2 className="text-5xl font-black text-slate-950 mb-6 tracking-tighter italic uppercase">Market Dynamics</h2>
                            <p className="text-slate-500 font-bold italic">A streamlined protocol for secure agricultural exchange.</p>
                        </div>
                        <Target className="text-emerald-500/20" size={80} strokeWidth={1} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { step: "01", icon: <Tractor size={32} />, title: "Asset Deployment", desc: "Farmers list verified produce batches with transparent pricing and origin data." },
                            { step: "02", icon: <ShieldCheck size={32} />, title: "Secure Commitment", desc: "Buyer capital is committed to the Farm-Ease Secure vault via the distribution network." },
                            { step: "03", icon: <HeartHandshake size={32} />, title: "Verified Release", desc: "Upon delivery confirmation, capital is instantly disbursed to the harvester." },
                        ].map((item) => (
                            <div key={item.step} className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-premium hover:scale-[1.02] transition-all group">
                                <div className="text-6xl font-black text-slate-50 absolute top-8 right-10 leading-none group-hover:text-emerald-50 transition-colors italic">{item.step}</div>
                                <div className="bg-slate-50 p-5 rounded-2xl w-fit mb-10 text-slate-900 group-hover:bg-slate-950 group-hover:text-white transition-all shadow-inner">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-black text-slate-950 mb-4 tracking-tighter italic uppercase">{item.title}</h3>
                                <p className="text-slate-400 font-bold text-sm leading-relaxed italic">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ecosystem - Horizontal High-Density */}
            <section className="py-32 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl font-black text-slate-950 mb-4 tracking-tighter italic uppercase leading-none">The Participant Network</h2>
                        <div className="w-24 h-2 bg-emerald-500 mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        {[
                            { icon: <Tractor size={40} />, title: "Harvesters", color: "text-emerald-600 bg-emerald-50", desc: "Verified farmers accessing global liquidity and fair market value for every batch." },
                            { icon: <Sprout size={40} />, title: "Agri-Nodes", color: "text-slate-950 bg-slate-50", desc: "Certified vendors supply precision equipment and genetic assets to the network." },
                            { icon: <Users size={40} />, title: "Aggregators", color: "text-emerald-800 bg-emerald-100/50", desc: "Direct-to-consumer access with authenticated quality and payment safeguards." },
                        ].map((item) => (
                            <div key={item.title} className="text-center group">
                                <div className={`inline-flex p-8 rounded-[2.5rem] mb-10 ${item.color} shadow-inner group-hover:scale-110 transition-transform`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-3xl font-black text-slate-950 mb-4 tracking-tighter italic uppercase">{item.title}</h3>
                                <p className="text-slate-400 font-bold leading-relaxed italic text-sm px-6">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA - V3 Impact */}
            <section className="relative mx-6 md:mx-12 mb-32 overflow-hidden rounded-[4rem] group">
                <div className="absolute inset-0 bg-slate-950"></div>
                <div className="absolute top-0 right-0 w-[60%] h-full bg-emerald-600/20 blur-[150px] rounded-full -mr-32 -mt-32 transition-opacity group-hover:opacity-60 duration-1000"></div>
                
                <div className="max-w-4xl mx-auto text-center px-10 py-32 relative z-10">
                    <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tighter italic leading-[0.9]">
                        Join the <span className="text-emerald-500">Autonomous</span> <br /> 
                        Agrarian Economy.
                    </h2>
                    <p className="text-emerald-100/60 text-xl mb-16 max-w-xl mx-auto font-bold italic">
                        Whether you're a harvester, node seller, or aggregator — the Farm-Ease protocol is ready for deployment.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                        <Link to="/signup" className="min-w-[240px] bg-white text-slate-950 font-black px-12 py-6 rounded-3xl hover:bg-emerald-500 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-4 text-xl italic uppercase active:scale-95 group/btn">
                            Initialize Hub <ArrowRight size={24} className="group-hover/btn:translate-x-2 transition-transform" />
                        </Link>
                        <Link to="/market" className="min-w-[240px] text-white border-4 border-white/10 font-black px-12 py-6 rounded-3xl hover:bg-white/5 transition-all flex items-center justify-center gap-4 text-xl italic uppercase active:scale-95 border-opacity-20 hover:border-opacity-40">
                            Market Manifest
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
