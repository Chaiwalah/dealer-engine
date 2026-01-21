
import React, { useState, useRef, useEffect } from 'react';
import { analyzeUploadedImage, generateVeoVideo, generateGenAIImage, createDealerChat } from '../services/ai';

interface AICommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'CHAT' | 'VISION' | 'VEO' | 'IMAGE';

const AICommandCenter: React.FC<AICommandCenterProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('CHAT');
  
  // -- VEO STATE --
  const [veoImage, setVeoImage] = useState<string | null>(null);
  const [veoPrompt, setVeoPrompt] = useState('');
  const [veoRatio, setVeoRatio] = useState<'16:9' | '9:16'>('16:9');
  const [veoResult, setVeoResult] = useState<string | null>(null);
  const [veoLoading, setVeoLoading] = useState(false);
  
  // -- IMAGE GEN STATE --
  const [imgPrompt, setImgPrompt] = useState('');
  const [imgSize, setImgSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [imgResult, setImgResult] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(false);

  // -- VISION STATE --
  const [visionImage, setVisionImage] = useState<string | null>(null);
  const [visionAnalysis, setVisionAnalysis] = useState('');
  const [visionLoading, setVisionLoading] = useState(false);
  
  // -- CHAT STATE --
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatSession = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Init Chat
  useEffect(() => {
    if (isOpen && !chatSession.current) {
        const session = createDealerChat();
        if (session) {
            chatSession.current = session;
            setMessages([{ role: 'model', text: "Dealer Interface Online. Systems nominal. What is your query?" }]);
        } else {
            setMessages([{ role: 'model', text: "⚠️ API Configuration Error: Intelligence Core Offline." }]);
        }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // -- HANDLERS --

  const handleChatSend = async () => {
    if (!chatInput.trim() || !chatSession.current) return;
    const msg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatInput('');
    setChatLoading(true);
    
    try {
        const result = await chatSession.current.sendMessage({ message: msg });
        setMessages(prev => [...prev, { role: 'model', text: result.text }]);
    } catch (e) {
        setMessages(prev => [...prev, { role: 'model', text: "Error: Neural Link unstable." }]);
    } finally {
        setChatLoading(false);
    }
  };

  const handleVeoGen = async () => {
    if (!veoImage) return;
    setVeoLoading(true);
    setVeoResult(null);
    try {
        const base64 = veoImage.split(',')[1];
        const videoUrl = await generateVeoVideo(veoPrompt, base64, veoRatio);
        setVeoResult(videoUrl);
    } catch (e) {
        alert("Veo Generation failed. Check API permissions for Video.");
    } finally {
        setVeoLoading(false);
    }
  };

  const handleImgGen = async () => {
    if (!imgPrompt) return;
    setImgLoading(true);
    setImgResult(null);
    try {
        const url = await generateGenAIImage(imgPrompt, imgSize);
        setImgResult(url);
    } catch (e) {
        alert("Image Generation failed.");
    } finally {
        setImgLoading(false);
    }
  };

  const handleVisionAnalyze = async () => {
    if (!visionImage) return;
    setVisionLoading(true);
    try {
        const base64 = visionImage.split(',')[1];
        const text = await analyzeUploadedImage(base64, "Technical Analysis of this chart.");
        setVisionAnalysis(text);
    } catch (e) {
        setVisionAnalysis("Analysis failed.");
    } finally {
        setVisionLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-terminal-card border border-terminal-border w-full max-w-5xl h-[85vh] rounded-lg shadow-2xl flex overflow-hidden">
        
        {/* SIDEBAR */}
        <div className="w-48 bg-terminal-bg border-r border-terminal-border flex flex-col p-2 gap-1">
            <div className="p-4 text-terminal-accent font-bold font-mono text-sm border-b border-terminal-border mb-2">
                COMMAND CORE
            </div>
            {[
                { id: 'CHAT', label: 'Dealer Chat', icon: '💬' },
                { id: 'VISION', label: 'Vision Analyst', icon: '👁️' },
                { id: 'VEO', label: 'Veo Studio', icon: '🎬' },
                { id: 'IMAGE', label: 'Creative Core', icon: '🎨' },
            ].map(t => (
                <button 
                    key={t.id} 
                    onClick={() => setActiveTab(t.id as Tab)}
                    className={`text-left px-4 py-3 rounded text-xs font-bold font-mono flex items-center gap-3 transition-all ${activeTab === t.id ? 'bg-terminal-accent text-terminal-bg' : 'text-terminal-muted hover:bg-terminal-border hover:text-terminal-text'}`}
                >
                    <span className="text-lg">{t.icon}</span> {t.label}
                </button>
            ))}
            <div className="mt-auto p-4">
                <button onClick={onClose} className="w-full border border-terminal-red text-terminal-red py-2 rounded text-xs hover:bg-terminal-red hover:text-white transition-colors">SHUTDOWN</button>
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 bg-[#0f1216] flex flex-col overflow-hidden">
            
            {/* --- CHAT TAB --- */}
            {activeTab === 'CHAT' && (
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded text-sm font-mono ${m.role === 'user' ? 'bg-terminal-border text-terminal-text' : 'bg-terminal-accent/10 text-terminal-accent border border-terminal-accent/30'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {chatLoading && <div className="text-terminal-muted text-xs animate-pulse p-2">DEALER IS TYPING...</div>}
                    </div>
                    <div className="p-4 border-t border-terminal-border bg-terminal-card flex gap-2">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                            placeholder="Ask the Dealer about market conditions..."
                            className="flex-1 bg-terminal-bg border border-terminal-border rounded px-4 py-2 text-terminal-text focus:outline-none focus:border-terminal-accent font-mono text-sm"
                        />
                        <button onClick={handleChatSend} className="bg-terminal-accent text-terminal-bg px-6 font-bold rounded hover:brightness-110">SEND</button>
                    </div>
                </div>
            )}

            {/* --- VISION TAB --- */}
            {activeTab === 'VISION' && (
                <div className="p-6 h-full overflow-y-auto custom-scrollbar">
                    <h2 className="text-xl text-terminal-text font-bold mb-4 font-mono">Market Vision Analysis</h2>
                    <div className="grid grid-cols-2 gap-6 h-full">
                        <div className="flex flex-col gap-4">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-terminal-border rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer hover:border-terminal-accent hover:bg-terminal-border/20 transition-all"
                            >
                                {visionImage ? (
                                    <img src={visionImage} className="max-h-full max-w-full object-contain" alt="Upload" />
                                ) : (
                                    <>
                                        <span className="text-4xl mb-2">📷</span>
                                        <span className="text-terminal-muted text-xs">UPLOAD CHART</span>
                                    </>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, setVisionImage)} />
                            </div>
                            <button 
                                onClick={handleVisionAnalyze} 
                                disabled={!visionImage || visionLoading}
                                className="w-full bg-terminal-accent text-terminal-bg py-3 font-bold rounded disabled:opacity-50"
                            >
                                {visionLoading ? 'ANALYZING...' : 'RUN DIAGNOSTICS'}
                            </button>
                        </div>
                        <div className="bg-terminal-card border border-terminal-border rounded p-4 font-mono text-sm whitespace-pre-wrap text-terminal-text/90 overflow-y-auto">
                            {visionAnalysis || <span className="text-terminal-muted opacity-50">Analysis output will appear here...</span>}
                        </div>
                    </div>
                </div>
            )}

            {/* --- VEO TAB --- */}
            {activeTab === 'VEO' && (
                <div className="p-6 h-full overflow-y-auto custom-scrollbar flex flex-col">
                    <h2 className="text-xl text-terminal-text font-bold mb-4 font-mono flex items-center gap-2">
                        <span>🎬</span> Veo Generative Studio
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            {/* Upload Area */}
                            <div>
                                <label className="text-terminal-muted text-xs uppercase block mb-2">1. Source Image</label>
                                <div className="border border-terminal-border bg-terminal-card rounded h-48 flex items-center justify-center relative overflow-hidden">
                                    {veoImage ? (
                                        <img src={veoImage} className="w-full h-full object-contain" alt="Source" />
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center">
                                            <span className="text-2xl">📥</span>
                                            <span className="text-xs text-terminal-muted mt-2">Upload PNG/JPG</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, setVeoImage)} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Controls */}
                            <div>
                                <label className="text-terminal-muted text-xs uppercase block mb-2">2. Animation Prompt</label>
                                <textarea 
                                    value={veoPrompt}
                                    onChange={(e) => setVeoPrompt(e.target.value)}
                                    placeholder="Describe how the image should move (e.g., 'The chart lines glow and pulse, camera pans right')"
                                    className="w-full h-24 bg-terminal-card border border-terminal-border rounded p-3 text-sm text-terminal-text focus:border-terminal-accent outline-none resize-none"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-terminal-muted text-xs uppercase block mb-2">Aspect Ratio</label>
                                    <div className="flex border border-terminal-border rounded overflow-hidden">
                                        <button onClick={() => setVeoRatio('16:9')} className={`flex-1 py-2 text-xs font-bold ${veoRatio === '16:9' ? 'bg-terminal-accent text-terminal-bg' : 'bg-terminal-card text-terminal-muted'}`}>16:9</button>
                                        <button onClick={() => setVeoRatio('9:16')} className={`flex-1 py-2 text-xs font-bold ${veoRatio === '9:16' ? 'bg-terminal-accent text-terminal-bg' : 'bg-terminal-card text-terminal-muted'}`}>9:16</button>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleVeoGen}
                                disabled={!veoImage || veoLoading}
                                className="w-full bg-terminal-accent text-terminal-bg py-3 font-bold rounded hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {veoLoading ? 'RENDERING PHYSICS...' : 'GENERATE VIDEO'}
                            </button>
                        </div>

                        {/* Result Area */}
                        <div className="bg-terminal-card border border-terminal-border rounded flex items-center justify-center p-4 relative min-h-[300px]">
                            {veoLoading ? (
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-terminal-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <div className="text-terminal-accent font-mono text-sm animate-pulse">GENERATING FRAMES...</div>
                                    <div className="text-terminal-muted text-xs mt-2">This may take up to 60s</div>
                                </div>
                            ) : veoResult ? (
                                <video src={veoResult} controls autoPlay loop className="max-w-full max-h-full rounded shadow-lg border border-terminal-border" />
                            ) : (
                                <div className="text-terminal-muted text-xs font-mono">VIDEO OUTPUT FEED OFFLINE</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- IMAGE GEN TAB --- */}
            {activeTab === 'IMAGE' && (
                <div className="p-6 h-full overflow-y-auto custom-scrollbar">
                    <h2 className="text-xl text-terminal-text font-bold mb-4 font-mono flex items-center gap-2">
                        <span>🎨</span> Creative Core (Nano Banana Pro)
                    </h2>
                    
                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="text-terminal-muted text-xs uppercase block mb-2">Prompt</label>
                                <input 
                                    type="text" 
                                    value={imgPrompt}
                                    onChange={(e) => setImgPrompt(e.target.value)}
                                    placeholder="A futuristic crypto trading floor on Mars, cyberpunk style..."
                                    className="w-full bg-terminal-card border border-terminal-border rounded px-4 py-3 text-terminal-text focus:border-terminal-accent outline-none font-mono text-sm"
                                />
                            </div>
                            <div className="w-32">
                                <label className="text-terminal-muted text-xs uppercase block mb-2">Resolution</label>
                                <select 
                                    value={imgSize} 
                                    onChange={(e) => setImgSize(e.target.value as any)}
                                    className="w-full bg-terminal-card border border-terminal-border rounded px-2 py-3 text-terminal-text focus:border-terminal-accent outline-none text-sm"
                                >
                                    <option value="1K">1K</option>
                                    <option value="2K">2K</option>
                                    <option value="4K">4K</option>
                                </select>
                            </div>
                            <button 
                                onClick={handleImgGen}
                                disabled={imgLoading || !imgPrompt}
                                className="bg-terminal-accent text-terminal-bg px-8 py-3 font-bold rounded hover:brightness-110 disabled:opacity-50"
                            >
                                {imgLoading ? '...' : 'CREATE'}
                            </button>
                        </div>

                        <div className="flex-1 border-2 border-dashed border-terminal-border rounded-lg min-h-[400px] flex items-center justify-center bg-[#000]">
                            {imgLoading ? (
                                <div className="text-terminal-accent font-mono animate-pulse">DIFFUSING PIXELS...</div>
                            ) : imgResult ? (
                                <img src={imgResult} alt="Generated" className="max-w-full max-h-[500px] shadow-2xl rounded" />
                            ) : (
                                <div className="text-terminal-muted text-xs">RENDER OUTPUT EMPTY</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default AICommandCenter;
