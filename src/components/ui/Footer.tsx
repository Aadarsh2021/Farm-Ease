import { Link } from "react-router-dom";
import { Leaf, Twitter, Facebook, Instagram, Shield, Smartphone, Globe, Activity, ArrowRight, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    company: [
      { name: "The Mission", path: "/about" },
      { name: "Market Live", path: "/market" },
      { name: "Node Careers", path: "/careers" },
      { name: "Neutral Press", path: "/press" },
    ],
    support: [
      { name: "Intelligence Hub", path: "/help" },
      { name: "Protocol Safety", path: "/safety" },
      { name: "Neural Guidelines", path: "/community" },
      { name: "Privacy Ledger", path: "/privacy" },
    ],
    legal: [
      { name: "Operational Terms", path: "/terms" },
      { name: "Metric Policies", path: "/cookies" },
      { name: "Patent Shield", path: "/patents" },
    ]
  };

  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-40 pb-20 relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-600/5 blur-[150px] rounded-full -ml-64 -mt-64 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-24 mb-32">
          <div className="lg:col-span-2 space-y-12">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="bg-emerald-600 text-slate-950 p-3 rounded-2xl group-hover:bg-white transition-all duration-500 shadow-2xl group-hover:rotate-12 group-hover:shadow-white/20">
                <Leaf size={24} strokeWidth={3} />
              </div>
              <span className="text-3xl font-black text-white tracking-tighter italic uppercase group-hover:text-emerald-500 transition-colors">
                Farm<span className="text-emerald-500 group-hover:text-white transition-colors duration-500">Ease</span>
              </span>
            </Link>
            <p className="text-slate-500 leading-relaxed max-w-sm font-bold italic uppercase tracking-widest text-xs opacity-80 decoration-emerald-500/20 underline underline-offset-[12px] decoration-2">
              Empowering the agrarian ecosystem through secure, autonomous, and direct cryptographic clearing protocols. Built for the future of food.
            </p>
            <div className="flex gap-6">
              {[Twitter, Facebook, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-slate-500 hover:text-emerald-500 hover:bg-white hover:border-emerald-500 transition-all duration-500 group rotate-3 hover:rotate-0">
                  <Icon size={24} strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black text-white mb-10 text-[10px] uppercase tracking-[0.6em] italic leading-none flex items-center gap-4">
               The Entity <div className="w-4 h-0.5 bg-emerald-600"></div>
            </h4>
            <ul className="space-y-6">
              {links.company.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-slate-500 hover:text-emerald-400 transition-all text-sm font-black italic uppercase tracking-widest block group flex items-center gap-4">
                     <span className="w-0 group-hover:w-4 h-0.5 bg-emerald-500 transition-all"></span> {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-white mb-10 text-[10px] uppercase tracking-[0.6em] italic leading-none flex items-center gap-4">
               Intelligence <div className="w-4 h-0.5 bg-blue-600"></div>
            </h4>
            <ul className="space-y-6">
              {links.support.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-slate-500 hover:text-blue-400 transition-all text-sm font-black italic uppercase tracking-widest block group flex items-center gap-4">
                     <span className="w-0 group-hover:w-4 h-0.5 bg-blue-500 transition-all"></span> {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/5 p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group/trust">
             <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/trust:opacity-100 transition-opacity duration-1000"></div>
            <h4 className="font-black text-white mb-10 text-[10px] uppercase tracking-[0.6em] italic leading-none relative z-10">Verification</h4>
            <ul className="space-y-8 relative z-10">
              <li className="flex items-center gap-4 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] italic border-b border-white/5 pb-4">
                <Shield size={20} strokeWidth={3} className="animate-pulse" /> Farm-Ease Secure
              </li>
              <li className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] italic group-hover/trust:text-white transition-colors">
                <Globe size={20} strokeWidth={2} /> 127 Active Zones
              </li>
              <li className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] italic group-hover/trust:text-white transition-colors">
                <Activity size={20} strokeWidth={2} className="text-emerald-500" /> System: Optimal
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="flex flex-col gap-4">
             <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] italic">
               &copy; {currentYear} Farm-Ease Autonomous / Redefining the Agrarian Economy.
             </p>
             <div className="flex items-center gap-6 opacity-40">
                <Zap size={10} className="text-emerald-500" />
                <span className="text-[8px] font-black text-white uppercase tracking-[0.4em] italic">Protocol Version 3.1.0-PREMIUM</span>
             </div>
          </div>
          <div className="flex flex-wrap justify-center gap-12">
            {links.legal.map(link => (
              <Link key={link.name} to={link.path} className="text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-[0.4em] transition-all italic border-b border-transparent hover:border-emerald-500 pb-1">{link.name}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
