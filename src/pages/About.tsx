import { Link } from "react-router-dom";
import { Leaf, ShieldCheck, Users, ArrowRight, Sprout, Tractor, HeartHandshake } from "lucide-react";

export default function About() {
    return (
        <div className="bg-white py-20">
            {/* Hero */}
            <section className="bg-gradient-to-b from-green-50 to-white pt-20 pb-24 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                        <Leaf size={16} /> Our Mission
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
                        Empowering India&apos;s{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">
                            Agricultural Economy
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Farm-Ease bridges the gap between farmers, agri-sellers, and consumers — creating a transparent, fair, and secure marketplace powered by escrow protection.
                    </p>
                </div>
            </section>

            {/* Problem → Solution */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">The Problem We&apos;re Solving</h2>
                        <div className="space-y-4">
                            {[
                                "Farmers receive only 30–40% of the final consumer price due to middlemen.",
                                "No payment protection leads to fraud and trust issues in rural trade.",
                                "Fragmented markets make it hard for consumers to access fresh, locally grown produce.",
                                "Agri-sellers lack a verified channel to reach genuine buyers.",
                            ].map((point, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">{i + 1}</div>
                                    <p className="text-gray-600 leading-relaxed">{point}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8">
                        <h3 className="text-2xl font-bold text-green-900 mb-6">Our Solution</h3>
                        <div className="space-y-4">
                            {[
                                { icon: <ShieldCheck size={20} />, title: "Escrow Payments", desc: "Money is held safely and only released when the buyer confirms delivery." },
                                { icon: <Users size={20} />, title: "Direct Marketplace", desc: "No middlemen — farmers set prices, consumers pay fair rates." },
                                { icon: <Sprout size={20} />, title: "Verified Sellers", desc: "All vendors are KYC-verified to ensure trust and accountability." },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm">
                                    <div className="text-green-600 mt-0.5">{item.icon}</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                                        <p className="text-sm text-gray-600 mt-0.5">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">How Farm-Ease Works</h2>
                        <p className="text-gray-600 max-w-xl mx-auto">Simple steps to a secure agricultural transaction.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: "01", icon: <Tractor size={36} strokeWidth={1.5} />, title: "Seller Lists Produce", desc: "Farmers and agri-sellers create their verified product listings with price and quantity." },
                            { step: "02", icon: <ShieldCheck size={36} strokeWidth={1.5} />, title: "Buyer Pays via Escrow", desc: "Consumers browse and pay securely. Funds are held in Farm-Ease's escrow vault." },
                            { step: "03", icon: <HeartHandshake size={36} strokeWidth={1.5} />, title: "Confirm & Release", desc: "After delivery is confirmed by the buyer, payment is instantly released to the seller." },
                        ].map((item) => (
                            <div key={item.step} className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                <div className="text-6xl font-black text-green-100 absolute top-4 right-6 leading-none">{item.step}</div>
                                <div className="text-green-600 mb-5 relative z-10">{item.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Who We Serve */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Built For Everyone in the Chain</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <Tractor size={40} strokeWidth={1.5} />, title: "Farmers", color: "text-green-600 bg-green-50", desc: "List your produce at fair prices and get paid securely after delivery. No more middlemen eating your margins." },
                            { icon: <Sprout size={40} strokeWidth={1.5} />, title: "Agri-Sellers", color: "text-emerald-600 bg-emerald-50", desc: "Reach thousands of verified farmers looking for quality seeds, fertilizers, and farming equipment." },
                            { icon: <Users size={40} strokeWidth={1.5} />, title: "Consumers", color: "text-blue-600 bg-blue-50", desc: "Buy fresh produce directly from verified farms with complete payment protection and doorstep delivery." },
                        ].map((item) => (
                            <div key={item.title} className="bg-gray-50 rounded-3xl p-8 border border-gray-100 text-center">
                                <div className={`inline-flex p-4 rounded-2xl mb-6 ${item.color}`}>{item.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-500 rounded-[3rem] mx-4 sm:mx-8 mb-20 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                
                <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to Join Farm-Ease?</h2>
                    <p className="text-green-100 text-lg mb-12 max-w-xl mx-auto font-medium">Whether you're a farmer, seller, or consumer — there's a place for you on our platform.</p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/signup" className="bg-white text-green-700 font-black px-12 py-5 rounded-3xl hover:bg-green-50 transition-all shadow-2xl flex items-center justify-center gap-3 group active:scale-95">
                            Get Started Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/market" className="text-white border-2 border-white/40 font-black px-12 py-5 rounded-3xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-95">
                            Browse Marketplace
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
