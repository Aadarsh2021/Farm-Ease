import { Link } from "react-router-dom";
import { Leaf, Twitter, Facebook, Instagram, Shield, Smartphone, Globe } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    company: [
      { name: "About Us", path: "/about" },
      { name: "Marketplace", path: "/market" },
      { name: "Careers", path: "/careers" },
      { name: "Press", path: "/press" },
    ],
    support: [
      { name: "Help Center", path: "/help" },
      { name: "Safety Hub", path: "/safety" },
      { name: "Community Guidelines", path: "/community" },
      { name: "Privacy Policy", path: "/privacy" },
    ],
    legal: [
      { name: "Terms of Service", path: "/terms" },
      { name: "Cookie Policy", path: "/cookies" },
      { name: "Patent Disclosure", path: "/patents" },
    ]
  };

  return (
    <footer className="bg-white border-t pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="bg-emerald-600 text-white p-2 rounded-xl">
                <Leaf size={20} />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">FarmEase</span>
            </Link>
            <p className="text-slate-500 leading-relaxed mb-8 max-w-sm">
              Empowering the agricultural ecosystem through secure, transparent, and direct cryptographic trade protocols.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-slate-50 border rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-50 border rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-50 border rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 font-mono text-xs uppercase tracking-[0.2em]">Company</h4>
            <ul className="space-y-4">
              {links.company.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-slate-500 hover:text-emerald-600 transition-colors text-sm font-medium">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 font-mono text-xs uppercase tracking-[0.2em]">Support</h4>
            <ul className="space-y-4">
              {links.support.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-slate-500 hover:text-emerald-600 transition-colors text-sm font-medium">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 font-mono text-xs uppercase tracking-[0.2em]">Trust</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                <Shield size={16} /> Smart Escrow
              </li>
              <li className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                <Globe size={16} /> Global Reach
              </li>
              <li className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                <Smartphone size={16} /> Mobile First
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-sm font-medium">
            &copy; {currentYear} Farm-Ease. All rights reserved.
          </p>
          <div className="flex gap-8">
            {links.legal.map(link => (
              <Link key={link.name} to={link.path} className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest">{link.name}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
