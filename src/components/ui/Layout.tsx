import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import CommandPalette from "./CommandPalette";
import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col relative">
            <div className="mesh-bg fixed inset-0 opacity-40 pointer-events-none" />
            
            <Navbar />
            <CartDrawer />
            <CommandPalette />
            
            <main className="flex-1 relative">
                <AnimatePresence mode="wait">
                    <PageTransition key={location.pathname}>
                        {children}
                    </PageTransition>
                </AnimatePresence>
            </main>
            
            <Footer />
        </div>
    );
}
