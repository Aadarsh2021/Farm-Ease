import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "@/lib/firebase";
import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    ConfirmationResult,
    User
} from "firebase/auth";
import { supabase } from "@/lib/supabase";
import { Leaf, Mail, Lock, AlertCircle, Check, ArrowRight, ShieldCheck, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier | null;
    }
}

export default function Login() {
    const navigate = useNavigate();

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");

    // Flow State
    const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
    const [pendingRoleSelection, setPendingRoleSelection] = useState<User | null>(null);
    const [selectedRole, setSelectedRole] = useState<"farmer" | "seller" | "consumer">("consumer");

    // Status State
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Phone State
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [otpSent, setOtpSent] = useState(false);

    // --- SHARED: Handle Routing & Supabase Sync ---
    const handleRedirect = (userRole: string) => {
        setSuccess(true);
        setTimeout(() => {
            if (userRole === "farmer") navigate("/farmer/dashboard");
            else if (userRole === "seller") navigate("/seller/dashboard");
            else navigate("/dashboard");
        }, 1000);
    };

    const syncNewUserToSupabase = async (user: User, userRole: string) => {
        const { error: supabaseError } = await supabase
            .from("users")
            .insert([
                {
                    id: user.uid,
                    email: user.email || `${user.phoneNumber}@phone.auth`,
                    name: user.displayName || "New User",
                    role: userRole,
                    created_at: new Date().toISOString(),
                }
            ]);

        if (supabaseError && supabaseError.code !== "23505") {
            console.error("Supabase Error:", supabaseError);
            throw new Error("Failed to create user profile in database.");
        }
    };

    const checkExistingOrPromptRole = async (user: User) => {
        const { data } = await supabase.from("users").select("role").eq("id", user.uid).maybeSingle();
        if (data?.role) {
            handleRedirect(data.role);
        } else {
            setPendingRoleSelection(user);
            setLoading(false);
        }
    };

    // --- EMAIL LOGIN ---
    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const { data } = await supabase.from("users").select("role").eq("id", userCredential.user.uid).maybeSingle();
            
            if (data?.role) {
                handleRedirect(data.role);
            } else {
                handleRedirect("consumer"); // Default fallback
            }
        } catch (err: unknown) {
            console.error("Login error:", err);
            setError("Invalid email or password. Please try again.");
            setLoading(false);
        }
    };

    // --- GOOGLE LOGIN ---
    const handleGoogleLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            await checkExistingOrPromptRole(result.user);
        } catch (err: unknown) {
            console.error("Google Auth Error:", err);
            setError(err instanceof Error ? err.message : "An error occurred during Google sign in.");
            setLoading(false);
        }
    };

    // --- PHONE LOGIN ---
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-login-container", {
                size: "invisible",
            });
            const phoneNumber = phone.startsWith("+") ? phone : `+91${phone}`;
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
            setConfirmationResult(confirmation);
            setOtpSent(true);
            setLoading(false);
        } catch (err: unknown) {
            console.error("OTP Error:", err);
            setError(err instanceof Error ? err.message : "Failed to send OTP. Check phone number format.");
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
            await checkExistingOrPromptRole(result.user);
        } catch (err: unknown) {
            console.error("OTP Verification Error:", err);
            setError("Invalid OTP entered. Please try again.");
            setLoading(false);
        }
    };

    const handleConfirmRole = async () => {
        if (!pendingRoleSelection) return;
        setLoading(true);
        try {
            await syncNewUserToSupabase(pendingRoleSelection, selectedRole);
            handleRedirect(selectedRole);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 py-32 relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[150px] -mr-96 -mt-96 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -ml-64 -mb-64"></div>
            
            <div id="recaptcha-login-container" className="hidden"></div>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/50 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row-reverse relative z-10"
            >
                {/* Visual Section */}
                <div className="md:w-1/2 bg-emerald-600 p-12 text-slate-950 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]"></div>
                    
                    <div className="relative z-10 flex flex-col items-end text-right">
                        <Link to="/" className="flex items-center gap-3 mb-16 flex-row-reverse group">
                            <div className="bg-slate-950 text-emerald-400 p-3 rounded-2xl shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                                <Leaf size={32} strokeWidth={3} />
                            </div>
                            <span className="text-3xl font-black tracking-tight uppercase italic">Farm-Ease</span>
                        </Link>

                        <div className="space-y-6">
                            <h2 className="text-5xl md:text-6xl font-black leading-[0.9] italic uppercase tracking-tighter">
                                Welcome <br /> <span className="text-white">Back.</span>
                            </h2>
                            <p className="text-slate-950/70 text-lg max-w-sm font-black italic uppercase tracking-wider leading-relaxed">
                                Access the agrarian terminal to manage listings, track flux, and execute secure settlements.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 mt-12 pt-12 border-t border-slate-950/10">
                        <div className="flex items-center gap-4 bg-slate-950/5 p-6 rounded-[2rem] border border-slate-950/10 backdrop-blur-sm">
                            <Activity className="text-slate-950 animate-pulse" size={24} />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">System Core: Operational</p>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="md:w-1/2 p-12 lg:p-20 flex flex-col bg-slate-900/30">
                    <div className="mb-12">
                        <h3 className="text-4xl font-black text-white mb-3 tracking-tighter italic uppercase">Identity Check</h3>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] italic">Accessing V3.0 Central Hub</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4"
                            >
                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                                <p className="text-red-200 text-xs font-bold italic">{error}</p>
                            </motion.div>
                        )}

                        {success && (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-4"
                            >
                                <Check className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                                <p className="text-emerald-200 text-xs font-bold italic">Identity Verified. Establishing connection...</p>
                            </motion.div>
                        )}

                        {pendingRoleSelection ? (
                            <motion.div 
                                key="role-selection"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8 flex-1"
                            >
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black text-emerald-400 italic uppercase">New Entity Detected</h4>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] italic">Assign operational role to continue</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { id: "consumer", label: "Consumer", desc: "Purchase Agrarian Assets" },
                                        { id: "farmer", label: "Farmer", desc: "Execute Produce Sales" },
                                        { id: "seller", label: "Agri Seller", desc: "List Hardware & Genetics" }
                                    ].map((r) => (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => setSelectedRole(r.id as "consumer" | "farmer" | "seller")}
                                            className={`p-6 rounded-[2rem] border-2 text-left transition-all duration-500 ${selectedRole === r.id
                                                ? "border-emerald-600 bg-emerald-600/10 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                                                : "border-white/5 bg-white/5 hover:border-emerald-900/30 hover:bg-white/10"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className={`font-black uppercase italic block text-xl ${selectedRole === r.id ? "text-emerald-400" : "text-slate-300"}`}>{r.label}</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">{r.desc}</span>
                                                </div>
                                                {selectedRole === r.id && <Check size={20} className="text-emerald-600" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleConfirmRole}
                                    disabled={loading}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black p-6 rounded-[2rem] transition-all shadow-2xl flex items-center justify-center gap-4 group active:scale-95 disabled:opacity-50 text-xl italic uppercase"
                                >
                                    {loading ? "Initializing..." : <>Initialize Profile <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" /></>}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="auth-form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 space-y-8"
                            >
                                {/* Auth Method Toggle */}
                                <div className="flex p-2 bg-slate-950/50 rounded-[2rem] border border-white/5">
                                    <button
                                        onClick={() => setAuthMethod("email")}
                                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all italic ${authMethod === "email" ? "bg-emerald-600 text-slate-950 shadow-xl" : "text-slate-500 hover:text-slate-300"}`}
                                    >
                                        Digital Mail
                                    </button>
                                    <button
                                        onClick={() => { setAuthMethod("phone"); setOtpSent(false); }}
                                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all italic ${authMethod === "phone" ? "bg-emerald-600 text-slate-950 shadow-xl" : "text-slate-500 hover:text-slate-300"}`}
                                    >
                                        Comms Link
                                    </button>
                                </div>

                                {authMethod === "email" ? (
                                    <form onSubmit={handleEmailLogin} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-600 group-focus-within:text-emerald-400 transition-colors">
                                                    <Mail size={20} />
                                                </div>
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full pl-16 p-6 bg-slate-950/50 border border-white/5 rounded-[2rem] focus:ring-4 focus:ring-emerald-600/20 focus:border-emerald-600/50 outline-none transition-all text-white font-bold h-20 placeholder:text-slate-700"
                                                    placeholder="MAIL_ADDRESS@SECURE.NET"
                                                />
                                            </div>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-600 group-focus-within:text-emerald-400 transition-colors">
                                                    <Lock size={20} />
                                                </div>
                                                <input
                                                    type="password"
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full pl-16 p-6 bg-slate-950/50 border border-white/5 rounded-[2rem] focus:ring-4 focus:ring-emerald-600/20 focus:border-emerald-600/50 outline-none transition-all text-white font-bold h-20 placeholder:text-slate-700"
                                                    placeholder="CIPHER_KEY"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black p-6 rounded-[2rem] transition-all shadow-2xl flex items-center justify-center gap-4 group active:scale-95 disabled:opacity-50 text-2xl italic uppercase tracking-tighter"
                                        >
                                            {loading ? "Syncing..." : <>Authorize Access <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" /></>}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="space-y-6">
                                        {!otpSent ? (
                                            <form onSubmit={handleSendOTP} className="space-y-6">
                                                <div className="flex gap-4">
                                                    <div className="bg-slate-950/50 border border-white/5 rounded-[2rem] px-8 flex items-center text-sm font-black text-slate-500 italic">+91</div>
                                                    <input
                                                        type="tel"
                                                        required
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        className="flex-1 p-6 bg-slate-950/50 border border-white/5 rounded-[2rem] focus:ring-4 focus:ring-emerald-600/20 outline-none text-white font-black text-2xl h-20 placeholder:text-slate-700"
                                                        placeholder="9876543210"
                                                        maxLength={10}
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black p-6 rounded-[2rem] transition-all shadow-2xl disabled:opacity-50 text-xl italic uppercase"
                                                >
                                                    {loading ? "Transmitting..." : "Send OTP Packet"}
                                                </button>
                                            </form>
                                        ) : (
                                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                                <input
                                                    type="text"
                                                    required
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    className="w-full p-8 bg-slate-950/50 border border-white/5 rounded-[2.5rem] focus:ring-4 focus:ring-emerald-600/20 outline-none text-center text-4xl tracking-[0.5em] font-black text-emerald-400 placeholder:text-slate-800 h-28"
                                                    placeholder="000000"
                                                    maxLength={6}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black p-6 rounded-[2rem] transition-all shadow-2xl disabled:opacity-50 text-xl italic uppercase"
                                                >
                                                    {loading ? "Verifying..." : "Validate Token"}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                )}

                                {/* Divider */}
                                <div className="relative py-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/5"></div>
                                    </div>
                                    <div className="relative flex justify-center text-[10px]">
                                        <span className="px-6 bg-slate-900 text-slate-600 font-black uppercase tracking-[0.5em] italic">or external uplink</span>
                                    </div>
                                </div>

                                {/* External Auth */}
                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={handleGoogleLogin}
                                        disabled={loading}
                                        type="button"
                                        className="w-full flex items-center justify-center gap-6 p-6 border border-white/5 rounded-[2rem] hover:bg-white/5 transition-all bg-white/5 font-black text-slate-300 shadow-sm active:scale-95 italic uppercase group"
                                    >
                                        <svg className="h-6 w-6 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Google Uplink
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-16 pt-10 border-t border-white/5 text-center">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
                            New to the field?{" "}
                            <Link to="/signup" className="text-emerald-500 hover:text-emerald-400 underline decoration-2 underline-offset-8 ml-4">
                                Create New Entity
                            </Link>
                        </p>
                    </div>

                    <div className="mt-10 flex items-center justify-center gap-2 text-slate-700">
                        <ShieldCheck size={14} />
                        <p className="text-[9px] font-black uppercase tracking-tighter">Encrypted Biometric Verification Active</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
