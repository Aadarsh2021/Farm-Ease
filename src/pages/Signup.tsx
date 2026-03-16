import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "@/lib/firebase";
import {
    createUserWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    ConfirmationResult,
    User
} from "firebase/auth";
import { supabase } from "@/lib/supabase";
import { 
    Leaf, User as UserIcon, Mail, Lock, 
    AlertCircle, Check, ArrowRight, ShieldCheck, 
    Activity, Smartphone, Globe, Shield 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier | null;
    }
}

export default function Signup() {
    const navigate = useNavigate();

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");

    // Flow State
    const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
    const [role, setRole] = useState<"farmer" | "seller" | "consumer">("consumer");
    const [pendingRoleSelection, setPendingRoleSelection] = useState<User | null>(null);

    // Status State
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Phone OTP State
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [otpSent, setOtpSent] = useState(false);

    // --- SHARED: Sync to Supabase ---
    const syncUserToSupabase = async (user: User, userRole: string, userName: string | null) => {
        const { error: supabaseError } = await supabase
            .from("users")
            .insert([
                {
                    id: user.uid,
                    email: user.email || `${user.phoneNumber}@phone.auth`,
                    name: userName || user.displayName || "New User",
                    role: userRole,
                    created_at: new Date().toISOString(),
                }
            ]);

        if (supabaseError) {
            if (supabaseError.code !== "23505") {
                console.error("Supabase Error:", supabaseError);
                throw new Error("Failed to create user profile in database.");
            }
        }
    };

    const handleRedirect = (userRole: string) => {
        setSuccess(true);
        setTimeout(() => {
            if (userRole === "farmer") navigate("/farmer/dashboard");
            else if (userRole === "seller") navigate("/seller/dashboard");
            else navigate("/dashboard");
        }, 1500);
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
            const error = err as Error;
            console.error("Email Signup error:", error);
            setError(error.message || "An error occurred during signup.");
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
            const { data } = await supabase.from("users").select("role").eq("id", result.user.uid).single();

            if (data?.role) {
                handleRedirect(data.role);
            } else {
                setPendingRoleSelection(result.user);
                setLoading(false);
            }
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Google Auth Error:", error);
            setError(error.message || "An error occurred during Google sign in.");
            setLoading(false);
        }
    };

    // --- PHONE OTP SIGNUP ---
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
            });
            const phoneNumber = phone.startsWith("+") ? phone : `+91${phone}`;
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
            setConfirmationResult(confirmation);
            setOtpSent(true);
            setLoading(false);
        } catch (err: unknown) {
            const error = err as Error;
            console.error("OTP Error:", error);
            setError(error.message || "Failed to send OTP.");
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
            const { data } = await supabase.from("users").select("role").eq("id", result.user.uid).single();

            if (data?.role) {
                handleRedirect(data.role);
            } else {
                setPendingRoleSelection(result.user);
                setLoading(false);
            }
        } catch (err: unknown) {
            console.error("OTP Verification Error:", err);
            setError("Invalid OTP entered.");
            setLoading(false);
        }
    };

    const handleConfirmRole = async () => {
        if (!pendingRoleSelection) return;
        setLoading(true);
        try {
            await syncUserToSupabase(pendingRoleSelection, role, pendingRoleSelection.displayName);
            handleRedirect(role);
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || "An error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden pt-32 pb-20">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none"></div>
            
            <div id="recaptcha-container"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-6xl flex flex-col lg:flex-row bg-slate-900/50 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden relative z-10"
            >
                {/* Visual Section - Left Side on Large screens */}
                <div className="lg:w-2/5 bg-slate-900 p-12 lg:p-16 text-white flex flex-col justify-between border-r border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <div className="relative z-10">
                        <Link to="/" className="flex items-center gap-4 mb-20 group">
                            <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <Leaf size={32} strokeWidth={3} />
                            </div>
                            <span className="text-3xl font-black tracking-tighter italic uppercase group-hover:text-emerald-400 transition-colors">Farm-Ease</span>
                        </Link>

                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-8"
                        >
                            <h2 className="text-6xl lg:text-7xl font-black leading-[0.9] italic uppercase tracking-tighter">
                                Start Your <br />
                                <span className="text-emerald-500 underline decoration-white/10 decoration-8 underline-offset-8">Journey.</span>
                            </h2>
                            <p className="text-xl text-slate-400 font-bold italic leading-relaxed max-w-sm">
                                Join the premier agricultural ecosystem where technology meets the ground. Direct trade, secure payments, and AI-driven insights.
                            </p>
                        </motion.div>
                    </div>

                    <div className="relative z-10 mt-20">
                        <div className="space-y-6">
                            {[
                                { icon: Shield, text: "Automated Trust Protocols" },
                                { icon: Globe, text: "Global Market Reach" },
                                { icon: Activity, text: "Real-time Yield Analysis" }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                    className="flex items-center gap-4 text-emerald-400 font-black text-sm uppercase tracking-widest italic"
                                >
                                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                        <item.icon size={18} strokeWidth={3} />
                                    </div>
                                    {item.text}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="lg:w-3/5 p-8 lg:p-20 flex flex-col relative">
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-1 w-12 bg-emerald-500 rounded-full"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Network Registration</span>
                        </div>
                        <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Initialize Identity</h3>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-start gap-4"
                            >
                                <AlertCircle className="text-red-500 shrink-0" size={24} />
                                <p className="text-red-200 text-sm font-bold italic overflow-hidden break-words">{error}</p>
                            </motion.div>
                        )}

                        {success && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-start gap-4"
                            >
                                <Check className="text-emerald-500 shrink-0" size={24} />
                                <p className="text-emerald-200 text-sm font-bold italic">Node established! Redirecting to Terminal...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {pendingRoleSelection ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8 flex-1"
                        >
                            <div className="space-y-2">
                                <h4 className="text-2xl font-black text-white italic tracking-tight uppercase">Define Operational Role</h4>
                                <p className="text-sm font-bold text-slate-500 italic uppercase tracking-wider">Configure your profile classification</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 mt-6">
                                {[
                                    { id: "consumer", label: "Market Consumer", desc: "Purchase premium produce", icon: ShieldCheck },
                                    { id: "farmer", label: "Field Producer", desc: "Direct farmer listing", icon: Leaf },
                                    { id: "seller", label: "Enterprise Vendor", desc: "Resource distribution", icon: Smartphone }
                                ].map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setRole(r.id as "consumer" | "farmer" | "seller")}
                                        className={`group p-8 rounded-[2rem] border transition-all duration-500 text-left relative overflow-hidden ${role === r.id
                                            ? "border-emerald-500/50 bg-emerald-500 text-slate-950 shadow-[0_20px_40px_rgba(16,185,129,0.2)]"
                                            : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2 relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className={`p-4 rounded-2xl transition-all duration-500 ${role === r.id ? "bg-slate-950/10 rotate-12" : "bg-white/5 group-hover:rotate-12"}`}>
                                                    <r.icon size={24} strokeWidth={3} />
                                                </div>
                                                <div>
                                                    <span className="text-xl font-black italic uppercase tracking-tight block leading-none">{r.label}</span>
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 block ${role === r.id ? "text-slate-950/40" : "text-slate-600"}`}>{r.desc}</span>
                                                </div>
                                            </div>
                                            {role === r.id && <Check size={24} strokeWidth={4} className="text-slate-950 mr-4" />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleConfirmRole}
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-white text-slate-950 font-black py-8 rounded-full transition-all shadow-premium active:scale-[0.98] text-2xl uppercase tracking-tighter italic flex items-center justify-center gap-4 mt-12 group disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-8 h-8 border-4 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>Finalize Configuration <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" /></>
                                )}
                            </button>
                        </motion.div>
                    ) : (
                        <div className="flex-1">
                            {/* Auth Method Toggle */}
                            <div className="flex p-2 bg-white/5 rounded-[2rem] mb-12 border border-white/5">
                                <button
                                    onClick={() => { setAuthMethod("email"); setError(null); }}
                                    className={`flex-1 py-4 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest rounded-3xl transition-all duration-500 italic ${authMethod === "email" ? "bg-emerald-600 text-slate-950 shadow-xl" : "text-slate-400 hover:text-white"}`}
                                >
                                    <Mail size={16} /> Email-ID
                                </button>
                                <button
                                    onClick={() => { setAuthMethod("phone"); setError(null); }}
                                    className={`flex-1 py-4 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest rounded-3xl transition-all duration-500 italic ${authMethod === "phone" ? "bg-emerald-600 text-slate-950 shadow-xl" : "text-slate-400 hover:text-white"}`}
                                >
                                    <Smartphone size={16} /> Phone Node
                                </button>
                            </div>

                            {/* Standard Role Selection */}
                            {!otpSent && (
                                <div className="space-y-4 mb-10">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-4 flex items-center gap-2">
                                        <Activity size={10} className="text-emerald-500" /> Identity Classification
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: "consumer", label: "Consumer" },
                                            { id: "farmer", label: "Farmer" },
                                            { id: "seller", label: "Seller" }
                                        ].map((r) => (
                                            <button
                                                key={r.id}
                                                type="button"
                                                onClick={() => setRole(r.id as "consumer" | "farmer" | "seller")}
                                                className={`py-4 px-2 text-center text-xs font-black rounded-2xl border transition-all duration-500 uppercase tracking-widest italic ${role === r.id
                                                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                                                    : "border-white/5 bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300"
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
                                <form onSubmit={handleEmailSignup} className="space-y-6 pt-2">
                                    <div className="space-y-6">
                                        <div className="relative group/field">
                                            <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none text-slate-500 transition-colors group-focus-within/field:text-emerald-500">
                                                <UserIcon size={20} strokeWidth={3} />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-20 p-8 bg-white/5 border border-white/5 rounded-[2.5rem] focus:ring-4 focus:ring-emerald-600/10 focus:bg-white/10 focus:border-emerald-500/30 outline-none text-white font-bold transition-all shadow-inner placeholder:text-slate-600"
                                                placeholder="Full Legal Name"
                                            />
                                        </div>
                                        <div className="relative group/field">
                                            <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none text-slate-500 transition-colors group-focus-within/field:text-emerald-500">
                                                <Mail size={20} strokeWidth={3} />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-20 p-8 bg-white/5 border border-white/5 rounded-[2.5rem] focus:ring-4 focus:ring-emerald-600/10 focus:bg-white/10 focus:border-emerald-500/30 outline-none text-white font-bold transition-all shadow-inner placeholder:text-slate-600"
                                                placeholder="Nexus Email Address"
                                            />
                                        </div>
                                        <div className="relative group/field">
                                            <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none text-slate-500 transition-colors group-focus-within/field:text-emerald-500">
                                                <Lock size={20} strokeWidth={3} />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-20 p-8 bg-white/5 border border-white/5 rounded-[2.5rem] focus:ring-4 focus:ring-emerald-600/10 focus:bg-white/10 focus:border-emerald-500/30 outline-none text-white font-bold transition-all shadow-inner placeholder:text-slate-600"
                                                placeholder="Encrypted Access Key"
                                                minLength={6}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-emerald-600 hover:bg-white text-slate-950 font-black py-8 rounded-full transition-all shadow-[0_20px_40px_rgba(16,185,129,0.2)] active:scale-[0.98] disabled:opacity-70 mt-4 text-2xl italic uppercase tracking-tighter flex items-center justify-center gap-6 group"
                                    >
                                        {loading ? <div className="w-8 h-8 border-4 border-slate-950 border-t-transparent rounded-full animate-spin"></div> : <>Generate Profile <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" /></>}
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-6 pt-2">
                                    {!otpSent ? (
                                        <form onSubmit={handleSendOTP} className="space-y-8">
                                            <div className="flex gap-4">
                                                <div className="bg-white/10 border border-white/10 rounded-[2rem] px-8 flex items-center text-sm font-black text-emerald-400 italic font-mono shadow-xl">+91</div>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="flex-1 p-8 bg-white/5 border border-white/5 rounded-[2.5rem] focus:ring-4 focus:ring-emerald-600/10 focus:bg-white/10 focus:border-emerald-500/30 outline-none text-white font-black text-2xl tracking-widest placeholder:text-slate-700"
                                                    placeholder="9876543210"
                                                    maxLength={10}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-emerald-600 hover:bg-white text-slate-950 font-black py-8 rounded-full transition-all shadow-premium disabled:opacity-70 text-2xl italic uppercase tracking-tighter flex items-center justify-center gap-6 group"
                                            >
                                                {loading ? <div className="w-8 h-8 border-4 border-slate-950 border-t-transparent rounded-full animate-spin"></div> : <>Transmit Token <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" /></>}
                                            </button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleVerifyOTP} className="space-y-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-4">Verification Sequence</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    className="w-full p-8 bg-white/10 border border-emerald-500/30 rounded-[2.5rem] focus:ring-8 focus:ring-emerald-600/5 outline-none text-center text-5xl tracking-[0.5em] font-black italic text-emerald-400"
                                                    placeholder="000000"
                                                    maxLength={6}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-emerald-600 hover:bg-white text-slate-950 font-black py-8 rounded-full transition-all shadow-premium disabled:opacity-70 text-2xl italic uppercase tracking-tighter flex items-center justify-center gap-6 group"
                                            >
                                                {loading ? <div className="w-8 h-8 border-4 border-slate-950 border-t-transparent rounded-full animate-spin"></div> : <>Verify Network <Check size={24} strokeWidth={4} /></>}
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => { setOtpSent(false); setOtp(""); }}
                                                className="w-full text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.3em] transition-colors italic"
                                            >
                                                Re-transmit to different node?
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* Divider */}
                            <div className="relative py-12 flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/5"></div>
                                </div>
                                <div className="relative flex justify-center text-[10px]">
                                    <span className="px-8 bg-slate-900 text-slate-600 font-black uppercase tracking-[1em] italic">Universal Node Access</span>
                                </div>
                            </div>

                            {/* Google Auth Button */}
                            <button
                                onClick={handleGoogleSignup}
                                disabled={loading}
                                type="button"
                                className="w-full flex items-center justify-center gap-6 p-8 bg-white/5 border border-white/5 rounded-full hover:bg-white hover:text-slate-950 transition-all duration-500 font-black text-slate-400 group active:scale-[0.98] shadow-sm uppercase tracking-tighter text-xl italic"
                            >
                                <svg className="h-6 w-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Authenticate with Google
                            </button>
                        </div>
                    )}

                    <div className="mt-12 pt-8 border-t border-white/5 text-center">
                        <p className="text-sm font-black text-slate-500 italic uppercase tracking-wider">
                            Active Node already?{" "}
                            <Link to="/login" className="text-emerald-500 hover:text-white transition-colors underline decoration-2 underline-offset-8 decoration-emerald-500/20">
                                Access Secure Login
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
