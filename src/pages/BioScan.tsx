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
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold mb-6 uppercase tracking-widest"
          >
            <Sparkles size={14} /> Quantum Accuracy Diagnostics
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight"
          >
            AI <span className="text-emerald-600 font-black italic">Farm-Ease Bio-Scan</span> Protocol
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto"
          >
            Our neural nodes process high-resolution crop imagery to detect disease, nutrient deficiencies, and pest infestations with sub-field precision.
          </motion.p>
        </div>

        {/* Diagnostic Area */}
        <div className="bg-white border border-slate-100 rounded-[3.5rem] p-8 lg:p-16 shadow-premium relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600"></div>
          {!selectedImage ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white group hover:border-emerald-300 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <Camera size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Content for Analysis</h3>
              <p className="text-slate-400 text-sm mb-8 text-center max-w-xs">
                Drag and drop high-res images or click to browse. Supported formats: JPG, PNG, RAW.
              </p>
              <button 
                className="px-10 py-5 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] italic flex items-center gap-4 hover:bg-emerald-600 transition-all shadow-premium active:scale-95"
              >
                <Upload size={20} strokeWidth={3} /> Select Field Data
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
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Image Preview */}
              <div className="relative group">
                <div className="aspect-square rounded-[2rem] overflow-hidden bg-slate-200 border-4 border-white shadow-xl">
                  <img 
                    src={selectedImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center text-white">
                         <div className="w-16 h-1 w-32 bg-emerald-800 rounded-full mx-auto mb-4 overflow-hidden">
                            <motion.div 
                              className="h-full bg-emerald-400"
                              initial={{ x: "-100%" }}
                              animate={{ x: "100%" }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            />
                         </div>
                         <p className="text-xs font-bold uppercase tracking-[0.2em] font-mono">Scanning Tissue...</p>
                      </div>
                    </div>
                  )}
                </div>
                {!isAnalyzing && !result && (
                  <button 
                    onClick={reset}
                    className="absolute -top-3 -right-3 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={20} />
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
                    >
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">Neural Processing Ready</h3>
                      <p className="text-slate-500 mb-8 leading-relaxed">
                        Data nodes are calibrated. Analysis will perform pathogen detection, moisture mapping, and nutrient assessment.
                      </p>
                      <button 
                        onClick={startAnalysis}
                        className="w-full py-6 bg-emerald-600 text-slate-950 rounded-[2rem] font-black uppercase tracking-[0.2em] italic flex items-center justify-center gap-4 hover:bg-slate-950 hover:text-white transition-all shadow-premium active:scale-95"
                      >
                        <Zap size={22} strokeWidth={3} /> Initialize Diagnostic
                      </button>
                    </motion.div>
                  ) : isAnalyzing ? (
                    <motion.div
                      key="analyzing"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                           <Microscope className="text-emerald-600 animate-spin-slow" size={20} />
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Protocol status</span>
                        </div>
                        <h4 className="font-bold text-slate-900">Synchronizing Nodes...</h4>
                        <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                           <motion.div 
                            className="h-full bg-emerald-500"
                            animate={{ width: ["10%", "45%", "65%", "90%"] }}
                            transition={{ duration: 3.5, ease: "easeInOut" }}
                           />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    result && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="p-8 bg-white rounded-[2rem] border border-red-100 shadow-xl shadow-red-500/5">
                        <div className="flex items-center gap-3 mb-6">
                           <AlertCircle className="text-red-500" size={24} />
                           <h3 className="text-xl font-bold text-slate-900">{result.status}</h3>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Detected Host</span>
                              <span className="text-slate-900 font-bold">{result.pathogen}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Confidence</span>
                              <span className="text-emerald-600 font-black">{result.confidence}%</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Severity</span>
                              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg font-bold text-[10px]">{result.severity}</span>
                           </div>
                        </div>

                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-8">
                           <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                              <strong>Recommended Remedy:</strong> {result.remedy}
                           </p>
                        </div>

                        <div className="flex gap-6">
                          <Link 
                            to="/market"
                            className="flex-1 py-6 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] italic flex items-center justify-center gap-4 hover:bg-emerald-600 transition-all shadow-premium active:scale-95"
                          >
                            Find Remedy <ArrowRight size={20} strokeWidth={3} />
                          </Link>
                          <button 
                            onClick={reset}
                            className="px-10 py-6 bg-slate-50 text-slate-400 rounded-[2rem] font-black uppercase tracking-[0.2em] italic hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
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
