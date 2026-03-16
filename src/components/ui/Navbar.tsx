import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Menu, X, Leaf, ShoppingCart, User as UserIcon, LogOut, Command } from "lucide-react";
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
        { name: "Marketplace", path: "/market" },
        { name: "About Us", path: "/about" },
    ];

    return (
        <nav 
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
                scrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-b" : "bg-transparent"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-emerald-600 text-white p-2 rounded-xl group-hover:bg-emerald-700 transition-colors">
                        <Leaf size={20} />
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">
                        Farm<span className="text-emerald-600">Ease</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <div className="flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.path}
                                to={link.path} 
                                className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                                    location.pathname === link.path ? "text-emerald-600" : "text-slate-600"
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-slate-200 ml-2"></div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <button 
                                    onClick={() => setIsCartOpen(true)}
                                    aria-label={`Cart: ${cartCount} items`}
                                    className="p-2 text-slate-600 hover:text-emerald-600 transition-colors relative"
                                >
                                    <ShoppingCart size={20} />
                                    {cartCount > 0 && (
                                        <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                                            {cartCount}
                                        </span>
                                    )}
                                </button>

                                <Link 
                                    to={userRole === "farmer" ? "/farmer/dashboard" : userRole === "seller" ? "/seller/dashboard" : "/dashboard"} 
                                    className="flex items-center gap-2 pl-2 group"
                                >
                                    <div className="bg-slate-100 p-2 rounded-full group-hover:bg-emerald-50 transition-colors">
                                        <UserIcon size={18} className="text-slate-600 group-hover:text-emerald-600" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">Dashboard</span>
                                </Link>

                                <button 
                                    onClick={handleLogout}
                                    aria-label="Logout"
                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <LogOut size={18} />
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
                                    Sign In
                                </Link>
                                <Link 
                                    to="/signup" 
                                    className="bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                        
                        <button 
                            onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
                            aria-label="Command Menu"
                            className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 transition-colors border"
                            title="Command Menu (CMD+K)"
                        >
                            <Command size={16} />
                        </button>
                    </div>
                </div>

                {/* Mobile Controls */}
                <div className="md:hidden flex items-center gap-3">
                    {user && (
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="p-2 text-slate-600 relative"
                        >
                            <ShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    )}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-slate-600"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-20 left-0 right-0 bg-white border-b shadow-lg p-6 flex flex-col gap-6"
                    >
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.path}
                                    to={link.path} 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-lg font-semibold text-slate-900 border-b pb-2"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {user ? (
                            <div className="flex flex-col gap-4">
                                <Link 
                                    to="/dashboard" 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 text-lg font-semibold text-emerald-600"
                                >
                                    <UserIcon size={20} /> Dashboard
                                </Link>
                                <button 
                                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                    className="flex items-center gap-3 text-lg font-semibold text-red-500"
                                >
                                    <LogOut size={20} /> Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link 
                                    to="/login" 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full text-center py-3 border rounded-xl font-bold text-slate-600"
                                >
                                    Sign In
                                </Link>
                                <Link 
                                    to="/signup" 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full text-center py-3 bg-emerald-600 text-white rounded-xl font-bold"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
