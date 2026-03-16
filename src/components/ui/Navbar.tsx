import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Menu, X, Leaf, ShoppingCart, User as UserIcon, LogOut, ChevronRight, Command } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";

export default function Navbar() {
    const { user, userRole } = useAuth();
    const { cartCount, setIsCartOpen } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const { scrollY } = useScroll();
    const navHeight = useTransform(scrollY, [0, 100], ["5.5rem", "4.5rem"]);
    const navPadding = useTransform(scrollY, [0, 100], ["1.5rem", "0.75rem"]);
    const navBgOpacity = useTransform(scrollY, [0, 100], [0.6, 0.85]);
    const navBorderOpacity = useTransform(scrollY, [0, 100], [0.2, 0.1]);

    // Magnetic Effect Logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 25, stiffness: 400 };
    const magneticX = useSpring(mouseX, springConfig);
    const magneticY = useSpring(mouseY, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        mouseX.set((clientX - centerX) * 0.35);
        mouseY.set((clientY - centerY) * 0.35);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <motion.nav 
            style={{ height: navHeight }}
            className="fixed top-0 left-0 right-0 z-[100] flex items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
            <div className="max-w-7xl mx-auto w-full px-6">
                <motion.div 
                    style={{ 
                        paddingTop: navPadding, 
                        paddingBottom: navPadding,
                        backgroundColor: `hsla(var(--background), ${navBgOpacity.get()})`,
                        borderColor: `hsla(var(--border), ${navBorderOpacity.get()})`
                    }}
                    className="glass rounded-[2rem] px-8 flex justify-between items-center shadow-elite group/nav"
                >
                    {/* Logo with Magnetic Effect */}
                    <motion.div
                        style={{ x: magneticX, y: magneticY }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="relative z-10"
                    >
                        <Link to="/" className="flex items-center gap-3 group/logo">
                            <div className="bg-[hsl(var(--primary))] text-white p-2.5 rounded-2xl group-hover/logo:bg-[hsl(var(--primary-light))] transition-colors shadow-glow shadow-primary/20">
                                <Leaf size={22} className="group-hover/logo:rotate-12 transition-transform duration-500" />
                            </div>
                            <span className="text-xl font-black text-[hsl(var(--foreground))] tracking-tighter">
                                Farm<span className="text-[hsl(var(--primary-light))]">Ease</span>
                            </span>
                        </Link>
                    </motion.div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-10">
                        <div className="flex items-center space-x-8 text-[11px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                            <Link to="/market" className="hover:text-[hsl(var(--foreground))] transition-colors relative group">
                                Marketplace
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[hsl(var(--primary))] transition-all group-hover:w-full" />
                            </Link>
                            <Link to="/about" className="hover:text-[hsl(var(--foreground))] transition-colors relative group">
                                About Us
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[hsl(var(--primary))] transition-all group-hover:w-full" />
                            </Link>
                        </div>

                        <div className="h-4 w-px bg-[hsl(var(--border))]"></div>

                        {user ? (
                            <div className="flex items-center gap-5">
                                <button 
                                    onClick={() => setIsCartOpen(true)}
                                    aria-label={`Open side cart, ${cartCount} items`}
                                    className="text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-all relative group/cart"
                                >
                                    <ShoppingCart size={20} className="group-hover/cart:scale-110 transition-transform" />
                                    {cartCount > 0 && (
                                        <motion.span 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-2 -right-2 bg-[hsl(var(--primary))] text-white text-[9px] font-black rounded-full h-4.5 w-4.5 flex items-center justify-center shadow-primary/30 shadow-lg"
                                        >
                                            {cartCount}
                                        </motion.span>
                                    )}
                                </button>

                                <Link to={userRole === "farmer" ? "/farmer/dashboard" : userRole === "seller" ? "/seller/dashboard" : "/dashboard"} className="flex items-center gap-2 group/btn">
                                    <span className="text-[10px] font-black text-[hsl(var(--foreground))] uppercase tracking-widest group-hover/btn:text-[hsl(var(--primary))] transition-colors">Dashboard</span>
                                    <div className="bg-[hsl(var(--foreground))] text-[hsl(var(--background))] p-2 rounded-xl group-hover/btn:bg-[hsl(var(--primary))] transition-all shadow-premium active:scale-95">
                                        <UserIcon size={16} />
                                    </div>
                                </Link>

                                <button 
                                    onClick={handleLogout} 
                                    aria-label="Disconnect terminal session"
                                    className="text-[hsl(var(--muted-foreground))] hover:text-red-500 transition-colors ml-2"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-6">
                                <Link to="/login" className="text-[11px] font-black text-[hsl(var(--foreground))] uppercase tracking-widest hover:text-[hsl(var(--primary))] transition-colors">
                                    Sign In
                                </Link>
                                <Link to="/signup" className="group flex items-center gap-3 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] px-6 py-2.5 rounded-2xl font-black hover:bg-[hsl(var(--primary))] transition-all shadow-elite active:scale-95">
                                    <span className="text-[11px] uppercase tracking-widest">Join Elite</span> 
                                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        )}
                        
                        <button 
                            onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
                            aria-label="Open Command Menu (CMD+K)"
                            className="p-2 ml-2 bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] rounded-xl hover:bg-[hsl(var(--primary))] hover:text-white transition-all shadow-sm" 
                            title="Command Menu (CMD+K)"
                        >
                            <Command size={18} />
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-4">
                        {user && (
                            <button 
                                onClick={() => setIsCartOpen(true)}
                                className="text-[hsl(var(--foreground))] relative"
                            >
                                <ShoppingCart size={22} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-[hsl(var(--primary))] text-white text-[9px] font-black rounded-full h-4.5 w-4.5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        )}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                            className="bg-[hsl(var(--muted))] p-2.5 rounded-2xl text-[hsl(var(--foreground))] hover:bg-[hsl(var(--primary))] hover:text-white transition-all"
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="md:hidden fixed inset-0 z-[110] bg-[hsl(var(--background))] p-8"
                    >
                        <div className="flex justify-between items-center mb-16">
                            <span className="text-xl font-black tracking-tighter">Menu</span>
                            <button 
                                onClick={() => setIsMenuOpen(false)}
                                className="bg-[hsl(var(--muted))] p-4 rounded-3xl"
                            >
                                <X size={28} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-8">
                            <div className="space-y-4">
                                <Link onClick={() => setIsMenuOpen(false)} to="/market" className="block text-5xl font-black text-[hsl(var(--foreground))] tracking-tighter hover:text-[hsl(var(--primary))] transition-colors">Market</Link>
                                <Link onClick={() => setIsMenuOpen(false)} to="/about" className="block text-5xl font-black text-[hsl(var(--foreground))] tracking-tighter hover:text-[hsl(var(--primary))] transition-colors">About</Link>
                            </div>

                            <div className="h-px bg-[hsl(var(--border))] w-full my-4"></div>

                            {user ? (
                                <div className="space-y-6">
                                    <Link onClick={() => setIsMenuOpen(false)} to="/dashboard" className="flex items-center gap-5 text-2xl font-bold">
                                        <div className="bg-[hsl(var(--primary))] text-white p-4 rounded-[1.5rem] shadow-glow shadow-primary/40">
                                            <UserIcon size={32} />
                                        </div>
                                        Personal Terminal
                                    </Link>
                                    <button onClick={handleLogout} className="flex items-center gap-5 text-2xl font-bold text-red-500 w-full text-left">
                                        <div className="bg-red-50 p-4 rounded-[1.5rem]">
                                            <LogOut size={32} />
                                        </div>
                                        Disconnect
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <Link onClick={() => setIsMenuOpen(false)} to="/login" className="w-full text-center border-2 border-[hsl(var(--foreground))] text-[hsl(var(--foreground))] rounded-3xl py-6 text-xl font-black">
                                        Sign In
                                    </Link>
                                    <Link onClick={() => setIsMenuOpen(false)} to="/signup" className="w-full text-center bg-[hsl(var(--foreground))] text-[hsl(var(--background))] rounded-3xl py-6 text-xl font-black shadow-elite">
                                        Join Today
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
