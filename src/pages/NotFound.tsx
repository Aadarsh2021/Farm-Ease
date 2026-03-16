import { Link } from "react-router-dom";
import { Leaf, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 pt-32">
        <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 blur-[100px] rounded-full"></div>
            <div className="bg-slate-900 border-4 border-slate-800 p-12 rounded-[4rem] text-center relative z-10 shadow-premium">
                <div className="bg-slate-950 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl border border-white/5">
                    <Leaf size={48} className="text-green-500 rotate-12" strokeWidth={3} />
                </div>
                <h1 className="text-9xl font-black text-white mb-6 italic tracking-tighter">404</h1>
                <h2 className="text-4xl font-black text-slate-300 mb-8 uppercase tracking-tighter italic leading-none">Coordinates Redacted</h2>
                <p className="text-slate-500 font-bold italic max-w-sm mx-auto mb-12 text-lg">
                    The requested data point in the agriculture ecosystem does not exist or has been shifted to a new Field Node.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link to="/" className="bg-white text-slate-950 px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-green-500 transition-all flex items-center gap-4 shadow-2xl active:scale-95">
                        <Home size={20} strokeWidth={3} /> Return to Home
                    </Link>
                    <button onClick={() => window.history.back()} className="bg-slate-800 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-slate-700 transition-all flex items-center gap-4 border border-slate-700 active:scale-95">
                        <ArrowLeft size={20} strokeWidth={3} /> Abort & Go Back
                    </button>
                </div>
            </div>
        </div>
        <p className="mt-12 text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] italic">Farm-Ease Navigation Kernel v1.0.4</p>
    </div>
  );
}
