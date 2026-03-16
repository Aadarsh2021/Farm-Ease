import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Globe, 
  CheckCircle2, 
  Activity,
  FileCode,
  Link as LinkIcon
} from "lucide-react";

interface FarmEasePayProps {
  amount: number;
  onComplete: () => void;
}

export default function FarmEasePay({ amount, onComplete }: FarmEasePayProps) {
  const [step, setStep] = useState(0);
  const steps = [
    { name: "Initiating Payment", icon: FileCode, detail: "Generating secure transaction hash..." },
    { name: "Network Syncing", icon: Globe, detail: "Validating with Farm-Ease distribution nodes..." },
    { name: "Securing Funds", icon: Lock, detail: "Locking capital in the Farm-Ease Safe-Pay vault..." },
    { name: "Updating Ledger", icon: CheckCircle2, detail: "Finalizing immutable agrarian contract..." }
  ];

  useEffect(() => {
    if (step < steps.length) {
      const timer = setTimeout(() => {
        setStep(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setTimeout(onComplete, 1000);
    }
  }, [step, onComplete]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/60">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden border border-white/20"
      >
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="grid grid-cols-6 gap-2 rotate-12">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-12 h-12 border border-emerald-500 rounded-lg" />
              ))}
            </div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h2 className="text-white text-2xl font-black tracking-tight">Farm-Ease Smart Pay</h2>
            <p className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-[0.3em] mt-2">Protocol: v3.2 Agrarian-Lock</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-10 space-y-8">
          <div className="flex justify-between items-end border-b border-slate-100 pb-6">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Settlement Amount</span>
              <p className="text-3xl font-black text-slate-900 tracking-tighter italic">₹{amount.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Protected By</span>
              <p className="text-emerald-600 font-black text-sm italic">Safe-Pay Protocol™</p>
            </div>
          </div>

          <div className="space-y-6">
            {steps.map((s, idx) => (
              <div key={idx} className="flex items-center gap-6 relative">
                {idx < steps.length - 1 && (
                  <div className={`absolute left-4 top-10 w-0.5 h-10 ${step > idx ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                )}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-all duration-500 ${
                  step > idx ? 'bg-emerald-500 text-white' : 
                  step === idx ? 'bg-slate-900 text-white ring-4 ring-slate-100' : 
                  'bg-slate-100 text-slate-300'
                }`}>
                  <s.icon size={16} className={step === idx ? 'animate-pulse' : ''} />
                </div>
                <div className={`flex-1 transition-opacity duration-500 ${step >= idx ? 'opacity-100' : 'opacity-30'}`}>
                  <h4 className="text-sm font-black text-slate-900">{s.name}</h4>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{s.detail}</p>
                </div>
                {step === idx && (
                  <Activity size={14} className="text-emerald-500 animate-pulse" />
                )}
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-4">
            <Cpu size={24} className="text-slate-300" />
            <div className="flex-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Contract Hash</span>
              <code className="text-xs text-slate-600 font-mono break-all font-bold">
                0x{Math.random().toString(16).slice(2, 10)}...{Math.random().toString(16).slice(2, 10)}
              </code>
            </div>
            <LinkIcon size={16} className="text-slate-300" />
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-slate-50 border-t p-4 px-10 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Node Status</span>
            <div className="flex gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i < step * 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                ))}
            </div>
        </div>
      </motion.div>
    </div>
  );
}
