import { Link } from "react-router-dom";
import { Leaf, Twitter, Facebook, Instagram, ShieldCheck, Truck, Headphones, Globe, Terminal } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
    return (
        <footer className="bg-[hsl(var(--foreground))] text-[hsl(var(--background))] pt-32 pb-12 mt-auto overflow-hidden relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-[hsl(var(--primary))] opacity-[0.02] blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[40vw] h-[40vw] bg-[hsl(var(--primary-light))] opacity-[0.015] blur-[100px] rounded-full pointer-events-none" />
            
            {/* Tech Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* Top Features / Trust Manifest */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20 border-b border-white/5">
                    {[
                        { title: "Protocol Secure", desc: "Multi-layered encryption for every micro-transaction.", icon: ShieldCheck, color: "primary" },
                        { title: "Neural Logistics", desc: "Farm-to-terminal network with peak orbital precision.", icon: Truck, color: "blue" },
                        { title: "Global Intel", desc: "Expert multilingual support for decentralized trade.", icon: Headphones, color: "amber" }
                    ].map((feature, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-6 group"
                        >
                            <div className="bg-white/5 border border-white/10 p-5 rounded-3xl text-white group-hover:bg-[hsl(var(--primary))] transition-all duration-500 shadow-elite group-hover:shadow-glow group-hover:shadow-primary/20">
                                <feature.icon size={28} strokeWidth={2} />
                            </div>
                            <div>
                                <h4 className="font-black text-xl mb-1 tracking-tighter uppercase italic">{feature.title}</h4>
                                <p className="text-white/40 text-xs font-medium leading-relaxed tracking-tight group-hover:text-white/60 transition-colors">{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="py-24 grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Brand Manifest Section */}
                    <div className="lg:col-span-4">
                        <Link to="/" className="flex items-center gap-4 mb-10 group">
                            <div className="bg-[hsl(var(--primary))] text-[hsl(var(--foreground))] p-3 rounded-2xl shadow-elite group-hover:rotate-6 transition-transform">
                                <Leaf size={24} strokeWidth={2.5} />
                            </div>
                            <span className="text-3xl font-black tracking-[-0.05em] uppercase italic">
                                Farm<span className="text-[hsl(var(--primary))] opacity-80">Ease</span>
                            </span>
                        </Link>
                        <p className="text-white/40 text-sm font-medium leading-relaxed mb-10 max-w-sm tracking-tight">
                            The world&apos;s most sophisticated digital agrarian collective. Synchronizing the source directly with the future of decentralized trade.
                        </p>
                        
                        {/* Social Pulse Indicators */}
                        <div className="flex gap-4">
                            {[Twitter, Facebook, Instagram, Globe].map((Icon, idx) => (
                                <a key={idx} href="#" className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--foreground))] hover:-translate-y-1.5 transition-all duration-500 shadow-elite border border-white/5 hover:border-white/20">
                                    <Icon size={20} strokeWidth={2} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Technical Links Sections */}
                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12 lg:pl-12">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[hsl(var(--primary))] mb-10 opacity-80">Ecosystem Manifest</h4>
                            <ul className="space-y-4">
                                {["All Assets", "Bio-Produce", "Precision Tools", "Genetic Assets"].map((link) => (
                                    <li key={link}>
                                        <Link to="/market" className="text-white/40 hover:text-[hsl(var(--primary))] font-black transition-all flex items-center gap-3 group text-[11px] uppercase tracking-widest italic">
                                            <div className="w-1.5 h-px bg-[hsl(var(--primary))] opacity-0 group-hover:opacity-100 group-hover:w-3 transition-all" />
                                            {link}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[hsl(var(--primary))] mb-10 opacity-80">Terminal Access</h4>
                            <ul className="space-y-4">
                                {["Initialize Seller", "Escrow Protocols", "Consensus Policy", "Market Intel"].map((link) => (
                                    <li key={link}>
                                        <Link to="#" className="text-white/40 hover:text-[hsl(var(--primary))] font-black transition-all flex items-center gap-3 group text-[11px] uppercase tracking-widest italic">
                                            <div className="w-1.5 h-px bg-[hsl(var(--primary))] opacity-0 group-hover:opacity-100 group-hover:w-3 transition-all" />
                                            {link}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[hsl(var(--primary))] mb-10 opacity-80">Network Relay</h4>
                            <ul className="space-y-6">
                                <li className="flex items-center gap-5 group cursor-pointer">
                                    <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary))] group-hover:text-[hsl(var(--foreground))] transition-all">
                                        <Terminal size={18} strokeWidth={2.5} />
                                    </div>
                                    <span className="font-black text-[10px] tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">SYSLOG.SECURE</span>
                                </li>
                                <li className="flex items-center gap-5 group cursor-pointer">
                                    <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-blue-400 group-hover:bg-blue-400 group-hover:text-[hsl(var(--foreground))] transition-all">
                                        <Globe size={18} strokeWidth={2.5} />
                                    </div>
                                    <span className="font-black text-[10px] tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">GLOBAL.HUB</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom System Manifest Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-6">
                        <p className="text-white/20 font-black text-[9px] uppercase tracking-[0.3em] italic">
                            © {new Date().getFullYear()} Farm-Ease Global Nexus. V2.0_ELITE
                        </p>
                        <div className="h-4 w-px bg-white/10 hidden md:block" />
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-1 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
                            <span className="text-[9px] font-black text-[hsl(var(--primary))] uppercase tracking-widest opacity-80">All Systems Operational</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">
                        <Link to="#" className="hover:text-[hsl(var(--primary))] transition-colors">Neural_Privacy</Link>
                        <Link to="#" className="hover:text-[hsl(var(--primary))] transition-colors">Usage_License</Link>
                        <Link to="#" className="hover:text-[hsl(var(--primary))] transition-colors">Protocol_Docs</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
