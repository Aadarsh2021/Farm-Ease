import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Farm-Ease | World-Class Agricultural Marketplace",
  description: "Experience the future of agriculture. Secure escrow payments, verified local sourcing, and a global community of modern farmers in one premium ecosystem.",
  keywords: ["agriculture", "marketplace", "farming", "escrow", "safe trade", "farm produce", "agri-tech"],
  authors: [{ name: "Farm-Ease Team" }],
  openGraph: {
    title: "Farm-Ease | World-Class Agricultural Marketplace",
    description: "The most sophisticated digital ecosystem for modern agriculture.",
    url: "https://farm-ease.vercel.app",
    siteName: "Farm-Ease",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Farm-Ease Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Farm-Ease | Agricultural Marketplace",
    description: "Secure, direct, and premium agriculture trade.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased bg-white text-slate-900 min-h-screen flex flex-col font-sans selection:bg-green-100 selection:text-green-900`}
      >
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
