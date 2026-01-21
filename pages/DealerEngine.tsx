
import React, { useEffect, useState, useRef } from 'react';
import { EngineState } from '../types';
import { fetchEngineState, fetchChartData } from '../services/api';
import { generateMarketNarrative } from '../services/ai';
import MetricCard from '../components/MetricCard';
import GrokGauge from '../components/GrokGauge';
import { MainChart, DeltaBarChart, FundingRateChart } from '../components/Charts';
import TradingViewWidget from '../components/TradingViewWidget';

interface DealerEngineProps {
  symbol: string;
}

type ChartView = 'PRO_CHART' | 'ENGINE_CVD' | 'COINGLASS';
type CoinglassVariant = 'LEGENDS' | 'STANDARD';

const DealerEngine: React.FC<DealerEngineProps> = ({ symbol }) => {
  const [state, setState] = useState<EngineState | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ChartView>('COINGLASS'); 
  const [cgVariant, setCgVariant] = useState<CoinglassVariant>('LEGENDS');
  const [iframeKey, setIframeKey] = useState(0); 
  
  // AI Narrative State
  const [narrative, setNarrative] = useState<string[]>([]);
  const [narrativeLoading, setNarrativeLoading] = useState(false);

  const refreshInterval = useRef<number | null>(null);

  const loadData = async () => {
    try {
      const [engineData, cData] = await Promise.all([
        fetchEngineState(symbol),
        fetchChartData(symbol)
      ]);
      setState(engineData);
      setChartData(cData);
    } catch (e) {
      console.error("Failed to load engine data", e);
    } finally {
      setLoading(false);
    }
  };

  // Manual or Initial Trigger for AI
  const refreshNarrative = async () => {
    if (!state || chartData.length === 0) return;
    setNarrativeLoading(true);
    try {
      const aiNarrative = await generateMarketNarrative(symbol, state, chartData);
      setNarrative(aiNarrative);
    } catch (e) {
      console.error("Narrative failed", e);
      setNarrative(["Error connecting to Intelligence Core."]);
    } finally {
      setNarrativeLoading(false);
    }
  };

  // Auto-refresh narrative once when state is first ready
  useEffect(() => {
    if (state && narrative.length === 0 && !narrativeLoading) {
        refreshNarrative();
    }
  }, [state?.symbol]); 

  useEffect(() => {
    setLoading(true);
    setNarrative([]); 
    loadData();

    // Safety timeout: If fetching hangs for >3s, force loading to false to show UI (even if empty)
    const safetyTimeout = setTimeout(() => {
        setLoading((l) => {
            if (l) console.warn("Forcing loading complete due to timeout.");
            return false;
        });
    }, 3000);

    refreshInterval.current = window.setInterval(loadData, 5000); 
    return () => {
      clearTimeout(safetyTimeout);
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  if (loading && !state) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-terminal-accent font-mono animate-pulse gap-4">
        <div className="text-xl">INITIALIZING DEALER ENGINE...</div>
        <div className="text-xs text-terminal-muted">CONNECTING TO EXCHANGES</div>
      </div>
    );
  }

  // Fallback if loading failed but no state
  if (!state) return (
     <div className="flex flex-col items-center justify-center h-full text-terminal-red font-mono gap-4">
        <div className="text-xl">CONNECTION FAILED</div>
        <button onClick={() => window.location.reload()} className="border border-terminal-red px-4 py-2 hover:bg-terminal-red hover:text-white">RETRY LINK</button>
     </div>
  );

  // Derived styles
  const regimeColor = state.reiScore >= 70 ? 'text-terminal-green' : state.reiScore < 40 ? 'text-terminal-red' : 'text-terminal-text';
  const cleanSymbol = symbol.replace('-', '').replace('USD', 'USDT');
  const legendsUrl = `https://legend.coinglass.com/chart?symbol=Binance_${cleanSymbol}&interval=15`;
  const standardUrl = `https://www.coinglass.com/tv/Binance_${cleanSymbol}`;
  const currentCoinglassUrl = cgVariant === 'LEGENDS' ? legendsUrl : standardUrl;
  const refreshIframe = () => setIframeKey(prev => prev + 1);

  const zScoreWidth = Math.min(Math.abs(state.mrZ) / 3 * 50, 50); 
  const zScoreColor = state.mrZ > 2 ? 'bg-terminal-red' : state.mrZ < -2 ? 'bg-terminal-green' : 'bg-terminal-accent';

  const MiniGauge = ({ val, label, alert, color }: any) => (
    <div className="flex flex-col items-center justify-center w-full">
       <div className="relative w-20 h-10 mb-1">
         <div className="absolute top-0 left-0 w-full h-full rounded-t-full border-4 border-terminal-border border-b-0"></div>
         <div 
           className="absolute top-0 left-0 w-full h-full rounded-t-full border-4 border-b-0 transition-all duration-500"
           style={{ borderColor: color, transform: `rotate(${(val/100)*180 - 180}deg)`, transformOrigin: 'bottom center', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
         ></div>
       </div>
       <div className={`text-xl font-bold font-mono`} style={{color}}>{val.toFixed(0)}</div>
       <div className="text-[10px] text-terminal-muted uppercase">{label}</div>
       {alert && <div className="text-[9px] text-terminal-accent animate-pulse mt-1 text-center leading-tight">{alert}</div>}
    </div>
  );

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 max-w-[1920px] mx-auto h-full flex flex-col">
      
      {/* 1. DEALER INTELLIGENCE HEADER (Bloomberg-style Terminal Box) */}
      <div className="bg-terminal-card border border-terminal-border rounded-sm p-1 shadow-lg shrink-0">
        <div className="bg-[#000000] border border-terminal-border/50 p-4 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-2 opacity-20 text-6xl select-none grayscale">🦅</div>
           
           <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center gap-3">
                 <div className="h-3 w-3 bg-terminal-accent animate-pulse rounded-full"></div>
                 <h2 className="text-terminal-accent font-mono font-bold tracking-widest text-sm uppercase">DEALER INTELLIGENCE // {symbol}</h2>
              </div>
              <button 
                 onClick={refreshNarrative}
                 disabled={narrativeLoading}
                 className="text-[10px] border border-terminal-border px-3 py-1 text-terminal-muted hover:text-terminal-text hover:border-terminal-text transition-all uppercase font-mono"
              >
                 {narrativeLoading ? 'COMPUTING...' : 'REFRESH THESIS'}
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
              <div className="md:col-span-3 font-mono text-sm leading-relaxed text-terminal-text/90">
                 {narrative.length === 0 ? (
                    <div className="space-y-2 opacity-50">
                       <div className="h-3 bg-terminal-border/50 w-3/4 animate-pulse"></div>
                       <div className="h-3 bg-terminal-border/50 w-1/2 animate-pulse"></div>
                    </div>
                 ) : (
                    <ul className="space-y-2">
                       {narrative.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                             <span className="text-terminal-accent">»</span>
                             <span>{item}</span>
                          </li>
                       ))}
                    </ul>
                 )}
              </div>
              <div className="md:col-span-1 border-l border-terminal-border/50 pl-6 flex flex-col justify-center gap-4">
                 <div>
                    <div className="text-[9px] text-terminal-muted uppercase tracking-widest mb-1">REGIME DETECTED</div>
                    <div className={`text-sm font-bold ${regimeColor} uppercase bg-terminal-bg/50 inline-block px-2 py-1 border border-terminal-border`}>
                       {state.regime}
                    </div>
                 </div>
                 <div>
                    <div className="text-[9px] text-terminal-muted uppercase tracking-widest mb-1">CONFIDENCE</div>
                    <div className="w-full bg-terminal-bg h-1.5 rounded-full overflow-hidden border border-terminal-border/30">
                       <div className="h-full bg-terminal-accent transition-all duration-1000" style={{width: `${state.reiScore}%`}}></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      {/* 2. MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-12 gap-4 lg:gap-6 flex-1 min-h-0">
        
        {/* LEFT: METRICS (3 Cols) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <div className="bg-terminal-card border border-terminal-border rounded p-4">
            <h2 className="text-[10px] font-bold text-terminal-muted uppercase mb-4 text-center">REI STRENGTH INDEX</h2>
            <GrokGauge score={state.reiScore} />
          </div>

          <MetricCard label="OI Momentum (24h)" value={`${state.oiMomentum > 0 ? '+' : ''}${state.oiMomentum.toFixed(1)}%`} trend={state.oiMomentum > 0 ? 'up' : 'down'} />
          
          {/* Custom Z-Score Card */}
          <div className="bg-terminal-card border border-terminal-border rounded p-3">
             <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] text-terminal-muted uppercase">Mean Rev Z (7d)</span>
                <span className={`text-lg font-mono font-bold ${Math.abs(state.mrZ) > 2 ? 'text-terminal-red' : 'text-terminal-text'}`}>{state.mrZ.toFixed(2)}</span>
             </div>
             <div className="w-full bg-terminal-bg h-2 rounded-full relative overflow-hidden border border-terminal-border/50">
               <div className="absolute left-1/2 top-0 bottom-0 w-px bg-terminal-muted z-10"></div>
               <div className={`absolute h-full ${zScoreColor} transition-all duration-500`} 
                    style={{
                      left: state.mrZ > 0 ? '50%' : undefined, 
                      right: state.mrZ < 0 ? '50%' : undefined, 
                      width: `${zScoreWidth}%`
                    }} 
               />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
             <div className="bg-terminal-card border border-terminal-border rounded p-2">
               <MiniGauge val={state.oiScore} label="OI Score" alert={state.oiAlert} color={state.oiScore > 70 ? '#F6465D' : '#0ECB81'} />
             </div>
             <div className="bg-terminal-card border border-terminal-border rounded p-2">
               <MiniGauge val={state.fundedScore} label="Funded" alert={state.fundedAlert} color={state.fundedScore > 60 ? '#F6465D' : '#F0B90B'} />
             </div>
          </div>
        </div>

        {/* MIDDLE: CHARTS (6 Cols) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 min-h-[600px]">
           <div className="flex items-center justify-between bg-terminal-card p-2 rounded border border-terminal-border shrink-0">
              <div className="flex gap-1">
                {['COINGLASS', 'PRO_CHART', 'ENGINE_CVD'].map((view) => (
                   <button 
                     key={view}
                     onClick={() => setActiveView(view as ChartView)} 
                     className={`px-3 py-1 text-[10px] font-bold rounded uppercase transition-all ${activeView === view ? 'bg-terminal-accent text-terminal-bg' : 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-border'}`}
                   >
                     {view.replace('_', ' ')}
                   </button>
                ))}
              </div>
              {activeView === 'COINGLASS' && (
                 <div className="flex items-center gap-2">
                   <button onClick={() => setCgVariant('LEGENDS')} className={`px-2 py-1 text-[9px] font-bold rounded border ${cgVariant === 'LEGENDS' ? 'border-terminal-accent text-terminal-accent' : 'border-transparent text-terminal-muted'}`}>LEGENDS</button>
                   <button onClick={() => setCgVariant('STANDARD')} className={`px-2 py-1 text-[9px] font-bold rounded border ${cgVariant === 'STANDARD' ? 'border-terminal-accent text-terminal-accent' : 'border-transparent text-terminal-muted'}`}>STD</button>
                   <button onClick={refreshIframe} className="text-terminal-muted hover:text-terminal-text px-2">↻</button>
                 </div>
              )}
           </div>

           {/* Main Chart Area */}
           <div className="flex-[3] bg-terminal-card border border-terminal-border rounded overflow-hidden relative shadow-inner min-h-[350px]">
             {activeView === 'PRO_CHART' && <TradingViewWidget symbol={symbol} data={chartData} />}
             {activeView === 'ENGINE_CVD' && (
              <div className="h-full flex flex-col p-4">
                 <div className="flex-1 min-h-0 mb-4">
                    <h3 className="text-xs font-bold text-terminal-muted uppercase mb-2">Cumulative Volume Delta</h3>
                    <MainChart data={chartData} type="cvd" />
                 </div>
                 <div className="h-1/3 min-h-0">
                    <h3 className="text-xs font-bold text-terminal-muted uppercase mb-2">Order Flow Delta</h3>
                    <DeltaBarChart data={chartData} />
                 </div>
              </div>
            )}
            {activeView === 'COINGLASS' && (
              <div className="h-full w-full relative">
                <iframe key={iframeKey} src={currentCoinglassUrl} className="w-full h-full border-none" title="Coinglass" />
              </div>
            )}
           </div>

           {/* New Funding Rate Chart Area */}
           <div className="flex-1 bg-terminal-card border border-terminal-border rounded p-3 min-h-[150px] flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xs font-bold text-terminal-muted uppercase">Funding Rate History</h3>
                <span className={`text-[10px] font-mono ${state.fundingRate >= 0 ? 'text-terminal-accent' : 'text-terminal-green'}`}>
                  Predicted: {state.projectedFunding.toFixed(4)}%
                </span>
              </div>
              <div className="flex-1 min-h-0">
                <FundingRateChart data={chartData} />
              </div>
           </div>
        </div>

        {/* RIGHT: FEED & SENTIMENT (3 Cols) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
           {state.edgeReversal && state.reversalDetails && (
              <div className="bg-terminal-accent/10 border border-terminal-accent p-3 rounded animate-pulse">
                 <div className="flex items-center gap-2 text-terminal-accent font-bold text-sm uppercase mb-1">
                    <span>⚡</span> EDGE REVERSAL
                 </div>
                 <p className="text-xs text-terminal-text/80 leading-tight">
                    Shorts trapped while funding is negative. Squeeze probability > 75%.
                 </p>
              </div>
           )}

           <div className="bg-terminal-card border border-terminal-border rounded p-4">
              <div className="flex justify-between items-center mb-3">
                 <h3 className="text-[10px] font-bold text-terminal-muted uppercase">Net Account Exposure</h3>
                 <span className={`text-xs font-bold ${state.netLongShort > 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                    {state.netLongShort > 0 ? 'LONG' : 'SHORT'} {Math.abs(state.netLongShort).toFixed(1)}%
                 </span>
              </div>
              <div className="w-full h-4 flex rounded-sm overflow-hidden bg-terminal-bg relative border border-terminal-border/50">
                 <div className="h-full bg-terminal-green/80 w-1/2"></div>
                 <div className="h-full bg-terminal-red/80 w-1/2"></div>
                 <div className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white] transition-all duration-700" 
                      style={{left: `${50 + (state.netLongShort/2)}%`}}></div>
              </div>
           </div>

           <div className="bg-terminal-card border border-terminal-border rounded flex flex-col flex-1 min-h-[250px] overflow-hidden">
             <div className="p-3 border-b border-terminal-border bg-terminal-bg/30 flex justify-between items-center">
                <span className="text-[10px] font-bold text-terminal-muted uppercase">Live Wire</span>
                <div className="h-1.5 w-1.5 rounded-full bg-terminal-green animate-pulse"></div>
             </div>
             <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
                {state.whaleAlerts.map(alert => (
                   <div key={alert.id} className="text-[10px] pl-2 border-l-2 border-terminal-accent/50 hover:bg-terminal-border/20 p-1 transition-colors">
                      <div className="font-mono text-terminal-text font-bold mb-0.5">{alert.message}</div>
                      <div className="text-terminal-muted text-[9px]">{new Date(alert.timestamp).toLocaleTimeString()}</div>
                   </div>
                ))}
                {state.news.map(news => (
                   <div key={news.id} className="text-[10px] pl-2 border-l-2 border-terminal-muted/30 p-1 hover:bg-terminal-border/20 transition-colors">
                      <div className="text-terminal-text/90 leading-tight mb-1">{news.headline}</div>
                      <div className="flex justify-between text-[9px] text-terminal-muted">
                        <span>{news.source}</span>
                        <span>{news.time}</span>
                      </div>
                   </div>
                ))}
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default DealerEngine;
