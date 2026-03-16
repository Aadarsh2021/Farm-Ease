import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  Upload, 
  X, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Microscope
} from "lucide-react";
import { Link } from "react-router-dom";

interface AnalysisResult {
  status: string;
  pathogen: string;
  confidence: number;
  remedy: string;
  severity: string;
}

export default function BioScan() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate complex neural analysis
    setTimeout(() => {
      setResult({
        status: "Pathogen Detected",
        pathogen: "Leaf Rust (Puccinia triticina)",
        confidence: 98.4,
        remedy: "Apply systemic fungicide (Tebuconazole) within 48 hours for 90% recovery rate.",
        severity: "Moderate"
      });
      setIsAnalyzing(false);
    }, 3500);
  };

  const reset = () => {
    setSelectedImage(null);
    setResult(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-20 relative overflow-hidden">
      {/* Background Aesthetics */}
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-600/5 rounded-full blur-[180px] -mr-96 -mt-96 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] -ml-64 -mb-64 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black mb-10 uppercase tracking-[0.3em] border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
          >
            <Sparkles size={16} /> Quantum Accuracy Diagnostics
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter italic uppercase leading-none"
          >
            AI <span className="text-emerald-500 uppercase not-italic">Bio-Scan</span> <br /> Protocol.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto font-bold italic leading-relaxed"
          >
            Our neural nodes process high-resolution crop imagery to detect disease, nutrient deficiencies, and pest infestations with sub-field precision.
          </motion.p>
        </div>

        {/* Diagnostic Area */}
        <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/5 rounded-[4rem] p-10 lg:p-16 shadow-premium relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
          {!selectedImage ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 border-4 border-dashed border-white/5 rounded-[3rem] bg-white/5 group/upload hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-700 cursor-pointer relative overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent)] opacity-0 group-hover/upload:opacity-100 transition-opacity duration-700"></div>
              <div className="bg-slate-950 p-10 rounded-[2.5rem] mb-10 group-hover/upload:scale-110 group-hover/upload:rotate-12 group-hover/upload:shadow-2xl transition-all duration-700 relative z-10 border border-white/5">
                <Camera size={56} className="text-slate-700 group-hover/upload:text-emerald-500 transition-colors" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tighter italic uppercase relative z-10">Upload Content</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-12 text-center max-w-xs relative z-10 italic">
                Drag and drop high-res images or click to begin neural processing
              </p>
              <button 
                className="px-12 py-6 bg-emerald-600 text-slate-950 rounded-[2rem] font-black uppercase tracking-[0.2em] italic flex items-center gap-4 hover:bg-white transition-all shadow-2xl active:scale-95 relative z-10"
              >
                <Upload size={24} strokeWidth={4} /> Select Field Data
              </button>
              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*"
              />
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Image Preview */}
              <div className="relative group/preview">
                <div className="aspect-square rounded-[3rem] overflow-hidden bg-slate-950 border-8 border-white/5 shadow-2xl relative">
                  <img 
                    src={selectedImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover opacity-80 group-hover/preview:opacity-100 transition-opacity duration-700"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center">
                      <div className="text-center">
                         <div className="w-48 h-1.5 bg-white/10 rounded-full mx-auto mb-8 overflow-hidden relative">
                            <motion.div 
                              className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                              initial={{ x: "-100%" }}
                              animate={{ x: "100%" }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                         </div>
                         <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] italic animate-pulse">Scanning Bio-Signal Matrix...</p>
                      </div>
                    </div>
                  )}
                </div>
                {!isAnalyzing && !result && (
                  <button 
                    onClick={reset}
                    className="absolute -top-4 -right-4 w-14 h-14 bg-white text-slate-950 shadow-2xl rounded-[1.5rem] flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-500 hover:rotate-90"
                  >
                    <X size={28} strokeWidth={4} />
                  </button>
                )}
              </div>

              {/* Analysis Sidebar */}
              <div className="flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {!isAnalyzing && !result ? (
                    <motion.div
                      key="start"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div>
                        <h3 className="text-4xl font-black text-white mb-4 tracking-tighter italic uppercase">Identity Ready</h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em] mb-8 italic">Neural Processing Sub-Grid Online</p>
                      </div>
                      <p className="text-slate-400 font-bold italic text-lg leading-relaxed">
                        Data nodes are calibrated. Analysis will perform pathogen detection, moisture mapping, and nutrient assessment at 99.8% precision.
                      </p>
                      <button 
                        onClick={startAnalysis}
                        className="w-full py-8 bg-emerald-600 text-slate-950 rounded-[2.5rem] font-black uppercase tracking-[0.2em] italic flex items-center justify-center gap-6 hover:bg-white hover:scale-[1.02] transition-all shadow-[0_20px_50px_rgba(16,185,129,0.2)] active:scale-95 text-2xl"
                      >
                        <Zap size={28} strokeWidth={4} className="group-hover:rotate-12 transition-transform" /> Initialize Scan
                      </button>
                    </motion.div>
                  ) : isAnalyzing ? (
                    <motion.div
                      key="analyzing"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-8"
                    >
                      <div className="p-10 bg-white/5 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group/status">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                        <div className="flex items-center gap-5 mb-8">
                           <div className="bg-slate-950 p-4 rounded-2xl border border-white/5">
                              <Microscope className="text-emerald-500 animate-spin" size={28} />
                           </div>
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Protocol Status</span>
                        </div>
                        <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-8 leading-none">Establishing <br /> <span className="text-emerald-500">Neural Sync...</span></h4>
                        <div className="h-3 bg-slate-950 rounded-full overflow-hidden shadow-inner border border-white/5">
                           <motion.div 
                            className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                            animate={{ width: ["10%", "45%", "65%", "100%"] }}
                            transition={{ duration: 3.5, ease: "easeInOut" }}
                           />
                        </div>
                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] mt-6 italic">Accessing Agrarian Datasets: 1,482 Nodes Sampled</p>
                      </div>
                    </motion.div>
                  ) : (
                    result && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-8"
                    >
                      <div className="p-10 bg-slate-950/80 rounded-[4rem] border border-red-500/20 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-2 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"></div>
                        <div className="flex items-center gap-5 mb-10">
                           <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                              <AlertCircle className="text-red-500" size={32} />
                           </div>
                           <div>
                              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{result.status}</h3>
                              <p className="text-[9px] text-red-500 font-black uppercase tracking-[0.4em] mt-2 italic">Alert Protocol 04-X</p>
                           </div>
                        </div>
                        
                        <div className="space-y-6 mb-12">
                           <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Detected Host</span>
                              <span className="text-white font-black italic uppercase tracking-tight">{result.pathogen}</span>
                           </div>
                           <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Confidence</span>
                              <span className="text-emerald-500 font-black text-2xl italic tracking-tighter">{result.confidence}%</span>
                           </div>
                           <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Severity</span>
                              <span className="px-6 py-2 bg-red-500 text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest italic">{result.severity}</span>
                           </div>
                        </div>

                        <div className="p-8 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 mb-12 relative group/remedy">
                           <div className="absolute top-4 right-6 opacity-20 group-hover/remedy:opacity-100 transition-opacity">
                              <ShieldCheck size={28} className="text-emerald-500" />
                           </div>
                           <p className="text-lg text-emerald-200 leading-relaxed font-bold italic">
                              <strong className="text-white uppercase tracking-widest text-[10px] block mb-3 opacity-50">Recommended Protocol:</strong> {result.remedy}
                           </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6">
                          <Link 
                            to="/market"
                            className="flex-1 py-7 bg-emerald-600 text-slate-950 rounded-[2.2rem] font-black uppercase tracking-[0.2em] italic flex items-center justify-center gap-5 hover:bg-white transition-all shadow-2xl active:scale-95 text-xl"
                          >
                            Find Remedy <ArrowRight size={22} strokeWidth={4} />
                          </Link>
                          <button 
                            onClick={reset}
                            className="px-10 py-7 bg-white/5 text-slate-500 rounded-[2.2rem] font-black uppercase tracking-[0.2em] italic hover:bg-red-500/10 hover:text-red-500 border border-white/5 transition-all active:scale-95 text-[10px]"
                          >
                            New Scan
                          </button>
                        </div>
                      </div>
                    </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-premium group hover:-translate-y-2 transition-all duration-500">
            <ShieldCheck className="text-emerald-600 mb-6 group-hover:rotate-12 transition-transform" size={32} strokeWidth={3} />
            <h4 className="font-black text-slate-950 mb-3 uppercase tracking-tighter italic text-xl">Verified Data</h4>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest italic leading-relaxed">Analysis is backed by international agricultural research datasets.</p>
          </div>
          <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-premium group hover:-translate-y-2 transition-all duration-500">
            <Zap className="text-emerald-600 mb-6 group-hover:rotate-12 transition-transform" size={32} strokeWidth={3} />
            <h4 className="font-black text-slate-950 mb-3 uppercase tracking-tighter italic text-xl">Edge Computing</h4>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest italic leading-relaxed">Processing happens in milliseconds across our global decentralized node network.</p>
          </div>
          <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-premium group hover:-translate-y-2 transition-all duration-500">
            <Microscope className="text-emerald-600 mb-6 group-hover:rotate-12 transition-transform" size={32} strokeWidth={3} />
            <h4 className="font-black text-slate-950 mb-3 uppercase tracking-tighter italic text-xl">Spectral Analysis</h4>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest italic leading-relaxed">Detects issues invisible to the human eye using multi-spectrum simulation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
