import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

const pageVariants: Variants = {
    initial: {
        opacity: 0,
        scale: 0.98,
        y: 20,
        filter: "blur(10px)",
    },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1] as any,
            staggerChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        scale: 1.02,
        y: -20,
        filter: "blur(10px)",
        transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1] as any,
        },
    },
};

interface PageTransitionProps {
    children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
        >
            {children}
        </motion.div>
    );
}
