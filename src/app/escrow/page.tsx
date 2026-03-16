import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, CheckCircle2, ArrowRight, Gavel, Handshake, AlertTriangle } from "lucide-react";

export default function EscrowProtectionPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-gray-900 to-green-900 text-white py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 opacity-20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 opacity-20 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <ShieldCheck size={80} strokeWidth={1} className="mx-auto mb-6 text-green-400" />
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6">
                        Farm-Ease <span className="text-green-400">Escrow</span> Protection
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
                        The safest way to buy and sell agricultural produce and equipment online.
                        Funds are held securely by a neutral third party until the transaction is complete.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/signup" className="bg-green-500 text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-green-400 transition-colors shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                            Create a Free Account
                        </Link>
                        <Link href="/market" className="bg-white/10 border border-white/20 text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-white/20 transition-colors backdrop-blur-sm">
                            Browse Marketplace
                        </Link>
                    </div>
                </div>
            </section>

            {/* What is Escrow Concept */}
            <section className="py-24 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url('https://www.transparenttextures.com/patterns/cubes.png')" }}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">What is an Escrow?</h2>
                    <p className="text-xl text-gray-600 leading-relaxed mb-12">
                        An escrow is a financial arrangement where a certified third party temporarily holds and regulates payment of the funds required for two parties involved in a given transaction. It helps make transactions more secure by keeping the payment in a secure escrow account which is only released when all of the terms of an agreement are met as overseen by the escrow company.
                    </p>
                    <div className="flex items-center justify-center gap-6 md:gap-12 flex-wrap">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4"><Lock size={32} /></div>
                            <span className="font-bold text-gray-800">100% Secure Funds</span>
                        </div>
                        <div className="hidden md:block w-16 h-1 bg-green-200 rounded-full"></div>
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4"><Handshake size={32} /></div>
                            <span className="font-bold text-gray-800">Neutral Verification</span>
                        </div>
                        <div className="hidden md:block w-16 h-1 bg-green-200 rounded-full"></div>
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4"><CheckCircle2 size={32} /></div>
                            <span className="font-bold text-gray-800">Guaranteed Delivery</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Two-Sided Benefits */}
            <section className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Buyer Protection */}
                        <div>
                            <div className="bg-blue-100 text-blue-700 font-bold px-4 py-1.5 rounded-full inline-block text-sm mb-6 uppercase tracking-wider">For Buyers</div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-6">Complete Peace of Mind</h3>
                            <p className="text-lg text-gray-600 mb-8">
                                Never worry about paying for produce or tools that never arrive or don&apos;t match the description. We hold your money safely until you receive exactly what you ordered.
                            </p>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-1 font-bold">1</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg mb-1">Fund the Escrow</h4>
                                        <p className="text-gray-600 text-sm">When you place an order, your payment is deposited into our secure escrow vault, not to the seller.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-1 font-bold">2</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg mb-1">Inspect the Goods</h4>
                                        <p className="text-gray-600 text-sm">You receive the agricultural products. You have a window to inspect the quantity and quality.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-1 font-bold">3</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg mb-1">Approve Release</h4>
                                        <p className="text-gray-600 text-sm">If everything is perfect, simply mark it as delivered. The funds are then released to the farmer/seller.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Seller Protection */}
                        <div>
                            <div className="bg-green-100 text-green-700 font-bold px-4 py-1.5 rounded-full inline-block text-sm mb-6 uppercase tracking-wider">For Farmers & Sellers</div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-6">Zero Payment Risk</h3>
                            <p className="text-lg text-gray-600 mb-8">
                                Say goodbye to unpaid invoices. Farm-Ease Escrow verifies that the buyer has the funds and holds them securely before you ever have to dispatch a single grain.
                            </p>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-1 font-bold">1</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg mb-1">Confirmation of Funds</h4>
                                        <p className="text-gray-600 text-sm">You receive an instant notification that full payment has been secured in the Farm-Ease Escrow vault.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-1 font-bold">2</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg mb-1">Ship with Confidence</h4>
                                        <p className="text-gray-600 text-sm">You dispatch the produce or equipment to the buyer securely, knowing the money is waiting for you.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-1 font-bold">3</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg mb-1">Guaranteed Payout</h4>
                                        <p className="text-gray-600 text-sm">Once the buyer accepts the delivery, the escrow funds are automatically disbursed into your bank account.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dispute Resolution */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Gavel size={56} className="mx-auto text-orange-500 mb-6" />
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Fair Dispute Resolution</h2>
                    <p className="text-lg text-gray-600 mb-10">
                        In the rare event that a buyer receives damaged goods or an item contrary to its description, the funds remain frozen in escrow. The Farm-Ease mediation team will step in to review photographic evidence and shipping logs to provide a fair, impartial ruling—protecting the ethical party instantly.
                    </p>
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-left flex gap-4 items-start">
                        <AlertTriangle className="text-orange-500 shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">No Scams Allowed</h4>
                            <p className="text-sm text-gray-700">Both buyers and sellers undergo mandatory KYC verification. Combined with Escrow, this reduces agricultural trade fraud on our platform to virtually 0%.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 bg-green-50 border-t border-green-100 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Trade with Confidence</h2>
                    <p className="text-lg text-gray-600 mb-10">Start securing your agricultural transactions today.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/market" className="bg-green-600 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-green-700 transition-colors shadow-md">
                            Browse Market
                        </Link>
                        <Link href="/sell" className="bg-white border-2 border-green-600 text-green-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-green-50 transition-colors">
                            Become a Seller
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
