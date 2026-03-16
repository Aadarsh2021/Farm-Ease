"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import {
    createUserWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    ConfirmationResult
} from "firebase/auth";
import { supabase } from "@/lib/supabase";
import { Leaf, User as UserIcon, Mail, Lock, AlertCircle, ChevronRight, Check, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier | null;
    }
}

export default function SignupPage() {
    const router = useRouter();
    const { } = useAuth();

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");

    // Flow State
    const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
    const [role, setRole] = useState<"farmer" | "seller" | "consumer">("consumer");
    const [pendingRoleSelection, setPendingRoleSelection] = useState<import("firebase/auth").User | null>(null); // Stores Google/Phone user temporarily

    // Status State
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Phone OTP State
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [otpSent, setOtpSent] = useState(false);


    // --- SHARED: Sync to Supabase ---
    const syncUserToSupabase = async (user: import("firebase/auth").User, userRole: string, userName: string | null) => {
        const { error: supabaseError } = await supabase
            .from("users")
            .insert([
                {
                    id: user.uid,
                    email: user.email || `${user.phoneNumber}@phone.auth`, // Fallback for phone users without email
                    name: userName || user.displayName || "New User",
                    role: userRole,
                    created_at: new Date().toISOString(),
                }
            ]);

        if (supabaseError) {
            // Error code 23505 is unique constraint violation (user already exists)
            if (supabaseError.code !== "23505") {
                console.error("Supabase Error:", supabaseError);
                throw new Error("Failed to create user profile in database.");
            }
        }
    };

    const handleRedirect = (userRole: string) => {
        setSuccess(true);
        setTimeout(() => {
            if (userRole === "farmer") router.push("/farmer/dashboard");
            else if (userRole === "seller") router.push("/seller/dashboard");
            else router.push("/dashboard");
        }, 1000);
    };

    // --- EMAIL / PASSWORD SIGNUP ---
    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });
            await syncUserToSupabase(user, role, name);
            handleRedirect(role);

        } catch (err: unknown) {
            console.error("Email Signup error:", err);
            setError(err instanceof Error ? err.message : "An error occurred during signup.");
            setLoading(false);
        }
    };

    // --- GOOGLE SIGNUP ---
    const handleGoogleSignup = async () => {
        setError(null);
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            // Check if user already exists in Supabase
            const { data } = await supabase.from("users").select("role").eq("id", result.user.uid).single();

            if (data?.role) {
                // User already exists, just redirect them
                handleRedirect(data.role);
            } else {
                // New user - ask for role first
                setPendingRoleSelection(result.user);
                setLoading(false);
            }
        } catch (err: unknown) {
            console.error("Google Auth Error:", err);
            setError(err instanceof Error ? err.message : "An error occurred during Google sign in.");
            setLoading(false);
        }
    };

    // --- PHONE OTP SIGNUP ---
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            // Clear old verifier if exists
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
            // Create fresh verifier
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
            });
            const phoneNumber = phone.startsWith("+") ? phone : `+91${phone}`;
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
            setConfirmationResult(confirmation);
            setOtpSent(true);
            setLoading(false);
        } catch (err: unknown) {
            console.error("OTP Error:", err);
            setError(err instanceof Error ? err.message : "Failed to send OTP.");
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirmationResult) return;
        setError(null);
        setLoading(true);

        try {
            const result = await confirmationResult.confirm(otp);
            // Check if user already exists in Supabase
            const { data } = await supabase.from("users").select("role").eq("id", result.user.uid).single();

            if (data?.role) {
                handleRedirect(data.role);
            } else {
                // New user - ask for role
                setPendingRoleSelection(result.user);
                setLoading(false);
            }
        } catch (err: unknown) {
            console.error("OTP Verification Error:", err);
            setError("Invalid OTP entered.");
            setLoading(false);
        }
    };

    // --- FINALIZE SOCIAL / PHONE SIGNUP ---
    const handleConfirmRole = async () => {
        if (!pendingRoleSelection) return;
        setLoading(true);
        try {
            await syncUserToSupabase(pendingRoleSelection, role, pendingRoleSelection.displayName);
            handleRedirect(role);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div id="recaptcha-container"></div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row">

                {/* Visual Section */}
                <div className="md:w-1/2 bg-green-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-green-500 rounded-full opacity-50 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-emerald-700 rounded-full opacity-50 blur-3xl"></div>

                    <div className="relative z-10">
                        <Link href="/" className="flex items-center gap-2 mb-12">
                            <div className="bg-white text-green-600 p-2 rounded-xl shadow-md">
                                <Leaf size={28} />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">Farm-Ease</span>
                        </Link>

                        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            Join the Agricultural Marketplace
                        </h2>
                        <p className="text-green-100 text-lg mb-8">
                            Connect directly with buyers, sellers, and agricultural resources. Secure escrows and transparent transactions.
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <div className="md:w-1/2 p-8 lg:p-12 flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Create an account</h3>
                        <p className="text-gray-500 text-sm">Sign up to get started with Farm-Ease.</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 flex items-start gap-2">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                            <p className="text-red-700 text-sm overflow-hidden break-words">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 flex items-start gap-2">
                            <Check className="text-green-500 shrink-0 mt-0.5" size={18} />
                            <p className="text-green-700 text-sm">Account established! Redirecting...</p>
                        </div>
                    )}

                    {/* Pending Role Selection (Post-Google/Phone) */}
                    {pendingRoleSelection ? (
                        <div className="space-y-6 flex-1">
                            <h4 className="font-semibold text-gray-800 border-b pb-2">Complete your profile</h4>
                            <p className="text-sm text-gray-600">Please choose your role on Farm-Ease.</p>

                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: "consumer", label: "Consumer", desc: "Buy produce" },
                                    { id: "farmer", label: "Farmer", desc: "Sell produce" },
                                    { id: "seller", label: "Agri Seller", desc: "Sell tools/seeds" }
                                ].map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setRole(r.id as "consumer" | "farmer" | "seller")}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${role === r.id
                                            ? "border-green-600 bg-green-50 shadow-sm"
                                            : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`font-medium ${role === r.id ? "text-green-800" : "text-gray-800"}`}>{r.label}</span>
                                            {role === r.id && <Check size={16} className="text-green-600" />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleConfirmRole}
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium p-3.5 rounded-xl transition-all shadow-md active:scale-[0.98]"
                            >
                                {loading ? "Completing Setup..." : "Complete Setup"}
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-5">
                            {/* Auth Method Toggle */}
                            <div className="flex p-1 bg-gray-100 rounded-lg">
                                <button
                                    onClick={() => setAuthMethod("email")}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${authMethod === "email" ? "bg-white shadow-sm text-green-700" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Email
                                </button>
                                <button
                                    onClick={() => setAuthMethod("phone")}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${authMethod === "phone" ? "bg-white shadow-sm text-green-700" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Phone Number
                                </button>
                            </div>

                            {/* Standard Role Selection (Pre-Email/Phone Submit) */}
                            {!otpSent && (
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">I am a...</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: "consumer", label: "Consumer" },
                                            { id: "farmer", label: "Farmer" },
                                            { id: "seller", label: "Agri Seller" }
                                        ].map((r) => (
                                            <button
                                                key={r.id}
                                                type="button"
                                                onClick={() => setRole(r.id as "consumer" | "farmer" | "seller")}
                                                className={`py-2 px-1 text-center text-sm rounded-lg border transition-all ${role === r.id
                                                    ? "border-green-600 bg-green-50 text-green-800 font-medium"
                                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Forms */}
                            {authMethod === "email" ? (
                                <form onSubmit={handleEmailSignup} className="space-y-4 pt-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="name">Full Name</label>
                                        <input
                                            id="name"
                                            type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
                                        <input
                                            id="email"
                                            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
                                        <input
                                            id="password"
                                            type="password" required value={password} onChange={(e) => setPassword(e.target.value)} minLength={6}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <button
                                        type="submit" disabled={loading}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium p-3 rounded-lg transition-all flex items-center justify-center mt-2 disabled:opacity-70"
                                    >
                                        {loading ? "Processing..." : "Create Account via Email"}
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-4 pt-2">
                                    {!otpSent ? (
                                        <form onSubmit={handleSendOTP} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="phone">Phone Number (+91)</label>
                                                <input
                                                    id="phone"
                                                    type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                                                    placeholder="9876543210"
                                                />
                                            </div>
                                            <button
                                                type="submit" disabled={loading}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium p-3 rounded-lg transition-all flex items-center justify-center mt-2 disabled:opacity-70"
                                            >
                                                {loading ? "Sending..." : "Send OTP"}
                                            </button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="otp">Enter OTP</label>
                                                <input
                                                    id="otp"
                                                    type="text" required value={otp} onChange={(e) => setOtp(e.target.value)}
                                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm tracking-widest text-center text-lg"
                                                    placeholder="123456"
                                                    maxLength={6}
                                                />
                                            </div>
                                            <button
                                                type="submit" disabled={loading}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium p-3 rounded-lg transition-all mt-2 disabled:opacity-70"
                                            >
                                                {loading ? "Verifying..." : "Verify & Create Account"}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* Google Sign In Divider */}
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            {/* Google Auth Button */}
                            <button
                                onClick={handleGoogleSignup}
                                disabled={loading}
                                type="button"
                                className="w-full flex items-center justify-center gap-3 p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white font-medium text-gray-700 text-sm"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                        </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-gray-100 text-center text-sm">
                        <p className="text-gray-600">
                            Already have an account?{" "}
                            <Link href="/login" className="text-green-600 font-semibold hover:text-green-700 transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
