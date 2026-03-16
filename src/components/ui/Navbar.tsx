import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Menu, X, Leaf, ShoppingCart, User as UserIcon, LogOut, Command, Activity, Zap, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const { user, userRole } = useAuth();
    const { cartCount, setIsCartOpen } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const navLinks = [
    { name: "Market", path: "/market" },
    { name: "Bio-Scan", path: "/bioscan" },
    { name: "Mission", path: "/about" },
  ];

    return (
        <nav 
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
                scrolled ? "bg-slate-950/50 backdrop-blur-3xl shadow-2xl border-b border-white/5 py-2" : "bg-transparent py-6"
            }`}
        >
            <div className="max-w-7xl mx-auto px-10 h-20 flex items-center justify-between relative">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-4 group relative">
                    <div className="bg-emerald-600 text-slate-950 p-3 rounded-2xl group-hover:bg-white transition-all duration-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:rotate-12 group-hover:shadow-white/20">
                        <Leaf size={24} strokeWidth={3} />
                    </div>
                    <span className="text-2xl font-black text-white tracking-tighter italic uppercase">
                        Farm<span className="text-emerald-500 group-hover:text-white transition-colors duration-500">Ease</span>
                    </span>
                    <div className="absolute -bottom-1 left-12 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-700"></div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-12 bg-white/5 backdrop-blur-2xl px-12 py-4 rounded-[2rem] border border-white/5 shadow-2xl">
                    <div className="flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.path}
                                to={link.path} 
                                className={`text-[10px] font-black uppercase tracking-[0.5em] transition-all hover:text-emerald-400 italic relative group/link ${
                                    location.pathname === link.path ? "text-emerald-400" : "text-slate-400"
                                }`}
                            >
                                {link.name}
                                <span className={`absolute -bottom-2 left-0 w-full h-0.5 bg-emerald-400 scale-x-0 group-hover/link:scale-x-100 transition-transform duration-500 origin-left ${location.pathname === link.path ? "scale-x-100" : ""}`}></span>
                            </Link>
                        ))}
                    </div>

                    <div className="h-8 w-px bg-white/10 mx-2"></div>

                    <div className="flex items-center gap-6">
                        {user ? (
                            <>
                                <button 
                                    onClick={() => setIsCartOpen(true)}
                                    aria-label={`Cart: ${cartCount} items`}
                                    className="p-3 text-slate-400 hover:text-emerald-400 transition-all relative group/cart"
                                >
                                    <ShoppingCart size={22} strokeWidth={3} className="group-hover/cart:rotate-12" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-emerald-600 text-slate-950 text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-slate-950 shadow-2xl italic">
                                            {cartCount}
                                        </span>
                                    )}
                                </button>

                                <Link 
                                    to={userRole === "farmer" ? "/farmer/dashboard" : userRole === "seller" ? "/seller/dashboard" : "/dashboard"} 
                                    className="flex items-center gap-4 pl-4 group/user"
                                >
                                    <div className="bg-white/5 p-3 rounded-2xl group-hover:bg-emerald-600 group-hover:text-slate-950 transition-all duration-500 border border-white/5">
                                        <UserIcon size={20} strokeWidth={3} className="text-slate-400 group-hover:text-slate-950" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 group-hover:text-white transition-colors uppercase tracking-[0.3em] italic">Node Dash</span>
                                </Link>

                                <button 
                                    onClick={handleLogout}
                                    aria-label="Logout"
                                    className="p-3 text-slate-600 hover:text-red-500 transition-all group/logout"
                                >
                                    <LogOut size={20} strokeWidth={3} className="group-hover:translate-x-1" />
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-8">
                                <Link to="/login" className="text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-[0.4em] italic leading-none border-b-2 border-transparent hover:border-emerald-500 pb-1">
                                    Sign In
                                </Link>
                                <Link 
                                    to="/signup" 
                                    className="bg-emerald-600 text-slate-950 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white transition-all shadow-2xl active:scale-95 italic border border-emerald-400/20"
                                >
                                    Deploy Hub
                                </Link>
                            </div>
                        )}
                        
                        <button 
                            onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
                            aria-label="Command Menu"
                            className="p-3 bg-slate-950 text-slate-600 rounded-2xl hover:text-emerald-400 hover:border-emerald-500/30 transition-all border border-white/5 shadow-inner"
                            title="Command Menu (CMD+K)"
                        >
                            <Command size={18} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* Mobile Controls */}
                <div className="lg:hidden flex items-center gap-6">
                    {user && (
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="p-3 text-slate-400 relative"
                        >
                            <ShoppingCart size={24} strokeWidth={3} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-emerald-600 text-slate-950 text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-slate-950">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    )}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-3 bg-white/5 rounded-2xl border border-white/5 text-emerald-500"
                    >
                        {isMenuOpen ? <X size={28} strokeWidth={4} /> : <Menu size={28} strokeWidth={4} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden absolute top-full left-0 right-0 bg-slate-950/95 backdrop-blur-3xl border-b border-white/5 overflow-hidden"
                    >
                        <div className="p-10 flex flex-col gap-8">
                            <div className="flex flex-col gap-6">
                                {navLinks.map((link) => (
                                    <Link 
                                        key={link.path}
                                        to={link.path} 
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-4xl font-black text-white italic uppercase tracking-tighter border-b border-white/5 pb-6 flex justify-between items-center group"
                                    >
                                        {link.name} <ArrowLeft size={32} className="rotate-180 opacity-20 group-hover:opacity-100 group-hover:translate-x-4 transition-all duration-500" />
                                    </Link>
                                ))}
                            </div>

                            {user ? (
                                <div className="flex flex-col gap-6 pt-6">
                                    <Link 
                                        to="/dashboard" 
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-between gap-6 text-2xl font-black text-emerald-500 italic uppercase tracking-widest bg-emerald-500/10 p-8 rounded-[2rem] border border-emerald-500/20"
                                    >
                                        <div className="flex items-center gap-6">
                                            <UserIcon size={28} strokeWidth={3} /> Operational Dash
                                        </div>
                                        <Zap size={24} className="animate-pulse" />
                                    </Link>
                                    <button 
                                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                        className="flex items-center gap-6 text-2xl font-black text-red-500 italic uppercase tracking-widest p-8 rounded-[2rem] bg-red-500/5"
                                    >
                                        <LogOut size={28} strokeWidth={3} /> Terminate Session
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6 pt-6">
                                    <Link 
                                        to="/login" 
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full text-center py-8 bg-white/5 rounded-[2.5rem] font-black text-2xl text-white uppercase italic tracking-widest border border-white/5"
                                    >
                                        Identify Entity
                                    </Link>
                                    <Link 
                                        to="/signup" 
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full text-center py-8 bg-emerald-600 text-slate-950 rounded-[2.5rem] font-black text-2xl uppercase italic tracking-widest shadow-2xl"
                                    >
                                        Deploy Hub
                                    </Link>
                                </div>
                            )}

                            <div className="flex items-center justify-center gap-4 py-8 opacity-40">
                                <Activity size={12} className="text-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.8em] italic">System Status: Optimal</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
