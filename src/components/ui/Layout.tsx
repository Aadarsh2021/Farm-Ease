import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import CommandPalette from "./CommandPalette";
import AIChatbot from "../ai/AIChatbot";
import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-white flex flex-col relative text-slate-900">
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
            
            <AIChatbot />
            <Footer />
        </div>
    );
}
