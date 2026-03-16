import { Link } from "react-router-dom";
import { Leaf, Twitter, Facebook, Instagram, ShieldCheck, Truck, Headphones, ChevronRight, Mail, Phone } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-white pt-24 pb-12 mt-auto overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-500/10 blur-[120px] rounded-full"></div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* Top Features / Trust Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-20 border-b border-slate-900">
                    <div className="flex items-start gap-6 group">
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-[1.5rem] text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all shadow-xl">
                            <ShieldCheck size={32} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h4 className="font-black text-xl mb-2 tracking-tight">Escrow Secured</h4>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">Advanced encryption and payment protection for every agrarian trade.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-6 group">
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-[1.5rem] text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-xl">
                            <Truck size={32} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h4 className="font-black text-xl mb-2 tracking-tight">Farm Logistics</h4>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">Direct farm-to-door network ensuring peak freshness and speed.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-6 group">
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-[1.5rem] text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-xl">
                            <Headphones size={32} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h4 className="font-black text-xl mb-2 tracking-tight">Expert Support</h4>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">Multilingual dedicated support for farmers and global agri-sellers.</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="py-24 grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-4">
                        <Link to="/" className="flex items-center gap-3 mb-8 group">
                            <div className="bg-green-600 text-white p-2 rounded-xl shadow-lg shadow-green-600/20">
                                <Leaf size={28} />
                            </div>
                            <span className="text-3xl font-black tracking-tighter">
                                Farm<span className="text-green-500">Ease</span>
                            </span>
                        </Link>
                        <p className="text-slate-400 font-medium leading-relaxed mb-10 max-w-sm">
                            The world&apos;s premier digital ecosystem for modern agriculture. Connecting the source directly to the future.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Facebook, Instagram].map((Icon, idx) => (
                                <a key={idx} href="#" className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-green-600 hover:text-white hover:-translate-y-1 transition-all shadow-lg">
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-200 mb-8">Marketplace</h4>
                            <ul className="space-y-4">
                                {["All Products", "Fresh Produce", "Agri-Tools", "Seeds & Soil"].map((link) => (
                                    <li key={link}>
                                        <Link to="/market" className="text-slate-400 hover:text-green-500 font-bold transition-all flex items-center gap-2 group">
                                            <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-green-500" />
                                            {link}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-200 mb-8">Platform</h4>
                            <ul className="space-y-4">
                                {["Start Selling", "Escrow Safety", "Seller Policy", "Analytics"].map((link) => (
                                    <li key={link}>
                                        <Link to="#" className="text-slate-400 hover:text-green-500 font-bold transition-all flex items-center gap-2 group">
                                            <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-green-500" />
                                            {link}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-200 mb-8">Get in Touch</h4>
                            <ul className="space-y-6">
                                <li className="flex items-center gap-4 text-slate-400">
                                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-green-500">
                                        <Mail size={18} />
                                    </div>
                                    <span className="font-bold text-sm">support@farm-ease.com</span>
                                </li>
                                <li className="flex items-center gap-4 text-slate-400">
                                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-blue-500">
                                        <Phone size={18} />
                                    </div>
                                    <span className="font-bold text-sm">+1 (800) AGRI-HELP</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-8">
                    <p className="text-slate-500 font-bold text-sm italic">
                        © {new Date().getFullYear()} Farm-Ease Global Corp. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-[12px] font-black uppercase tracking-widest text-slate-400">
                        <Link to="#" className="hover:text-green-500 transition-colors">Privacy</Link>
                        <Link to="#" className="hover:text-green-500 transition-colors">Terms</Link>
                        <Link to="#" className="hover:text-green-500 transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
