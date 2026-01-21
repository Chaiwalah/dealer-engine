import React, { useState, useRef } from 'react';
import { analyzeUploadedImage } from '../services/ai';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({ isOpen, onClose }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImage(result);
        setAnalysis('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    // Strip data url prefix for API if present (though GoogleGenAI often handles it, cleaner to strip or ensure format)
    // The previous service implementation expects just base64, so we split.
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    
    const result = await analyzeUploadedImage(base64Data, "Analyze this trading chart. Identify support/resistance, candlestick patterns, and potential future direction based on technical analysis.");
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-terminal-card border border-terminal-border w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-terminal-border flex justify-between items-center bg-terminal-bg/50">
          <h2 className="text-terminal-accent font-bold flex items-center gap-2 font-mono">
            <span>👁️</span> GEMINI VISION ANALYSIS
          </h2>
          <button onClick={onClose} className="text-terminal-muted hover:text-terminal-text font-bold">✕</button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
           {!image ? (
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="border-2 border-dashed border-terminal-border rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer hover:border-terminal-accent hover:bg-terminal-border/20 transition-all group"
             >
               <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">📷</span>
               <span className="text-sm text-terminal-muted font-mono">UPLOAD CHART SCREENSHOT</span>
               <span className="text-xs text-terminal-muted/50 mt-2">Supports PNG, JPG</span>
               <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
             </div>
           ) : (
             <div className="relative group">
               <img src={image} alt="Analysis Target" className="w-full max-h-64 object-contain bg-black/20 rounded border border-terminal-border" />
               <button 
                 onClick={() => { setImage(null); setAnalysis(''); }}
                 className="absolute top-2 right-2 bg-terminal-bg/80 text-terminal-red px-3 py-1 text-xs rounded border border-terminal-red hover:bg-terminal-red hover:text-white transition-all opacity-0 group-hover:opacity-100"
               >
                 Remove
               </button>
             </div>
           )}

           {image && !analysis && !loading && (
             <button 
               onClick={handleAnalyze}
               className="w-full bg-terminal-accent text-terminal-bg font-bold py-3 rounded hover:brightness-110 flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(240,185,11,0.3)]"
             >
               <span>⚡</span> RUN NEURAL ANALYSIS
             </button>
           )}

           {loading && (
             <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="w-12 h-12 border-4 border-terminal-accent border-t-transparent rounded-full animate-spin"></div>
                <div className="text-terminal-accent font-mono animate-pulse">DECODING PATTERNS...</div>
             </div>
           )}

           {analysis && (
             <div className="bg-terminal-bg border border-terminal-border p-4 rounded text-sm text-terminal-text font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
               <div className="text-xs text-terminal-muted mb-2 uppercase border-b border-terminal-border pb-1">AI Output Stream</div>
               {analysis}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisModal;
