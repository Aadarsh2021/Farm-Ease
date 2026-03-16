"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, AlertTriangle, ShieldCheck, Activity, Search, RefreshCw, BarChart3, Settings, LogOut } from "lucide-react";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="flex h-screen bg-gray-50">

            {/* Sidebar Navigation */}
            <div className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex">
                <div className="p-6 border-b border-gray-800">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-green-500 text-white p-1 rounded-md">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="text-lg font-bold">Admin Portal</span>
                    </Link>
                </div>

                <div className="flex-1 py-6 flex flex-col gap-2 px-4 overflow-y-auto">
                    <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-green-600 font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                        <Activity size={20} /> Overview
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-green-600 font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                        <Users size={20} /> Users & Vendors
                    </button>
                    <button onClick={() => setActiveTab('disputes')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'disputes' ? 'bg-red-600 font-medium text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                        <div className="relative">
                            <AlertTriangle size={20} />
                            <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
                        </div>
                        Disputes
                    </button>
                    <button onClick={() => setActiveTab('analytics')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'analytics' ? 'bg-green-600 font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                        <BarChart3 size={20} /> Analytics
                    </button>

                    <button className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mt-auto text-gray-400 hover:bg-gray-800 hover:text-white`}>
                        <Settings size={20} /> Platform Settings
                    </button>
                    <button className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-red-400 hover:bg-red-900/50 hover:text-red-300`}>
                        <LogOut size={20} /> Log Out
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">

                {/* Topbar */}
                <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                    <h1 className="text-xl font-bold text-gray-900 capitalize">Platform {activeTab}</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-600 w-64 items-center">
                            <Search size={16} className="mr-2 text-gray-400" />
                            <input type="text" placeholder="Search orders, users..." className="bg-transparent outline-none w-full" />
                        </div>
                        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold">A</div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="p-8">

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Vol. Held (Escrow)</p>
                            <h3 className="text-2xl font-black text-gray-900">₹8,45,200</h3>
                            <p className="text-xs text-orange-600 mt-2 font-medium flex items-center gap-1"><RefreshCw size={12} /> 142 Active Holds</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-sm font-medium text-gray-500 mb-1">Platform Revenue</p>
                            <h3 className="text-2xl font-black text-gray-900">₹1,24,500</h3>
                            <p className="text-xs text-green-600 mt-2 font-medium">+12% this month</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-sm font-medium text-gray-500 mb-1">Active Users</p>
                            <h3 className="text-2xl font-black text-gray-900">4,204</h3>
                            <p className="text-xs text-green-600 mt-2 font-medium">842 Vendors, 3362 Consumers</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 bg-red-50/30">
                            <p className="text-sm font-medium text-red-800 mb-1">Open Disputes</p>
                            <h3 className="text-2xl font-black text-red-600">3</h3>
                            <p className="text-xs text-red-600 mt-2 font-bold cursor-pointer hover:underline">Requires Attention</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Disputes Resolution Tracker */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <AlertTriangle className="text-red-500" size={20} />
                                    Active Escalations
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {[
                                    { id: "DISP-192", order: "ORD-51422", issue: "Item damaged during transit", party1: "Rahul (Buyer)", party2: "Kisan Farms", amount: "₹4,200" },
                                    { id: "DISP-184", order: "ORD-11553", issue: "Wrong seeds delivered", party1: "Manoj (Buyer)", party2: "AgriSupply Co", amount: "₹850" }
                                ].map(dispute => (
                                    <div key={dispute.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">Unresolved</span>
                                                <h4 className="font-bold text-gray-900 text-lg">{dispute.issue}</h4>
                                                <p className="text-sm text-gray-500">Dispute ID: {dispute.id} • Order: {dispute.order}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Escrow Value Blocked</p>
                                                <p className="font-black text-red-600 text-lg">{dispute.amount}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2">
                                            <div className="text-xs font-medium text-gray-600">
                                                <b>Parties:</b> {dispute.party1} vs {dispute.party2}
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-100">Contact</button>
                                                <button className="bg-gray-900 text-white px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1"><ShieldCheck size={14} /> Resolve</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* System Health / Escrow Status */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900">Escrow System Status</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 font-medium">Gateway Health (Razorpay Route)</span>
                                        <span className="text-green-600 font-bold">100% Operational</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 font-medium">Payout Queues</span>
                                        <span className="text-green-600 font-bold">Clear (0 pending)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                <button className="w-full bg-gray-50 text-gray-700 border border-gray-200 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors text-sm flex justify-center items-center gap-2">
                                    <Settings size={16} /> Configure Gateway APIs
                                </button>
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}
