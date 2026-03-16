import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "@/lib/firebase";
import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    ConfirmationResult
} from "firebase/auth";
import { supabase } from "@/lib/supabase";
import { Leaf, Mail, Lock, AlertCircle, Check } from "lucide-react";

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
    const [pendingRoleSelection, setPendingRoleSelection] = useState<any>(null);
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

    const syncNewUserToSupabase = async (user: any, userRole: string) => {
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

    const checkExistingOrPromptRole = async (user: any) => {
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
            await signInWithEmailAndPassword(auth, email, password);
            setSuccess(true);
            setTimeout(() => navigate("/"), 1000);
        } catch (err: any) {
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
        } catch (err: any) {
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
        } catch (err: any) {
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
        } catch (err: any) {
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
        } catch (err: any) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4 py-32">
            <div id="recaptcha-login-container" className="hidden"></div>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row-reverse">

                {/* Visual Section */}
                <div className="md:w-1/2 bg-emerald-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 -mt-16 -ml-16 w-64 h-64 bg-emerald-500 rounded-full opacity-50 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 -mb-16 -mr-16 w-64 h-64 bg-green-700 rounded-full opacity-50 blur-3xl"></div>

                    <div className="relative z-10 flex flex-col items-end text-right">
                        <Link to="/" className="flex items-center gap-2 mb-12 flex-row-reverse">
                            <div className="bg-white text-emerald-600 p-2 rounded-xl shadow-md">
                                <Leaf size={28} />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">Farm-Ease</span>
                        </Link>

                        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            Welcome Back!
                        </h2>
                        <p className="text-emerald-100 text-lg mb-8 max-w-sm">
                            Access your dashboard to manage your listings, view escrow statuses, and connect with the community.
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <div className="md:w-1/2 p-8 lg:p-12 flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Log in to your account</h3>
                        <p className="text-gray-500 text-sm">Welcome back! Please enter your details.</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 flex items-start gap-2">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                            <p className="text-red-700 text-sm overflow-hidden break-words">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-500 flex items-start gap-2">
                            <Check className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                            <p className="text-emerald-700 text-sm">Successfully authenticated! Redirecting...</p>
                        </div>
                    )}

                    {pendingRoleSelection ? (
                        <div className="space-y-6 flex-1">
                            <h4 className="font-semibold text-gray-800 border-b pb-2">Looks like you&apos;re new here!</h4>
                            <p className="text-sm text-gray-600">Please choose your role to complete your Farm-Ease profile.</p>

                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: "consumer", label: "Consumer", desc: "Buy fresh produce" },
                                    { id: "farmer", label: "Farmer", desc: "Sell your produce" },
                                    { id: "seller", label: "Agri Seller", desc: "Sell seeds & tools" }
                                ].map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setSelectedRole(r.id as "consumer" | "farmer" | "seller")}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${selectedRole === r.id
                                            ? "border-emerald-600 bg-emerald-50 shadow-sm"
                                            : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className={`font-medium block ${selectedRole === r.id ? "text-emerald-800" : "text-gray-800"}`}>{r.label}</span>
                                                <span className="text-xs text-gray-500">{r.desc}</span>
                                            </div>
                                            {selectedRole === r.id && <Check size={16} className="text-emerald-600" />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleConfirmRole}
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium p-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-70"
                            >
                                {loading ? "Completing Setup..." : "Complete Setup"}
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 space-y-5">
                            {/* Auth Method Toggle */}
                            <div className="flex p-1 bg-gray-100 rounded-lg">
                                <button
                                    onClick={() => setAuthMethod("email")}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${authMethod === "email" ? "bg-white shadow-sm text-emerald-700" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Email
                                </button>
                                <button
                                    onClick={() => { setAuthMethod("phone"); setOtpSent(false); }}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${authMethod === "phone" ? "bg-white shadow-sm text-emerald-700" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Phone Number
                                </button>
                            </div>

                            {/* Email Form */}
                            {authMethod === "email" ? (
                                <form onSubmit={handleEmailLogin} className="space-y-4 pt-2">
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-10 p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                                placeholder="Email Address"
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-10 p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                                placeholder="Password"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-4 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 mt-4"
                                    >
                                        {loading ? "Authenticating..." : "Sign In"}
                                    </button>
                                </form>
                            ) : (
                                /* Phone Form */
                                <div className="space-y-4 pt-2">
                                    {!otpSent ? (
                                        <form onSubmit={handleSendOTP} className="space-y-4">
                                            <div className="flex gap-2">
                                                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 flex items-center text-sm font-bold text-gray-500">+91</div>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="flex-1 p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                                    placeholder="9876543210"
                                                    maxLength={10}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-4 rounded-xl transition-all shadow-lg disabled:opacity-70"
                                            >
                                                {loading ? "Dispatching OTP..." : "Send OTP"}
                                            </button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                                            <input
                                                type="text"
                                                required
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-center text-2xl tracking-[0.5em] font-mono font-bold"
                                                placeholder="000000"
                                                maxLength={6}
                                            />
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-4 rounded-xl transition-all shadow-lg disabled:opacity-70"
                                            >
                                                {loading ? "Verifying..." : "Verify OTP"}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* Divider */}
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-100"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-widest">or</span>
                                </div>
                            </div>

                            {/* Google Button */}
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                type="button"
                                className="w-full flex items-center justify-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all bg-white font-bold text-gray-700 shadow-sm active:scale-[0.98]"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google Login
                            </button>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                        <p className="text-sm font-bold text-gray-400">
                            New to the field?{" "}
                            <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 underline decoration-2 underline-offset-4">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
