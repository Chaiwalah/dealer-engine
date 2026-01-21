
import React, { useEffect, useRef, useState } from 'react';
import { ChartAlert, ChartDataPoint } from '../types';
import { calculateIndicators } from '../services/api';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewWidgetProps {
  symbol: string;
  data?: ChartDataPoint[]; // Data passed from parent for analysis
}

let tvScriptLoadingPromise: Promise<void> | null = null;

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol, data }) => {
  const onLoadScriptRef = useRef<(() => void) | null>(null);
  
  // Alert System State
  const [alerts, setAlerts] = useState<ChartAlert[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [activeAlert, setActiveAlert] = useState<string | null>(null); // For toast notification
  
  // Form State
  const [newAlertType, setNewAlertType] = useState<'PRICE' | 'RSI' | 'SUPERTREND'>('PRICE');
  const [newAlertCondition, setNewAlertCondition] = useState<'GT' | 'LT' | 'FLIP_BULL' | 'FLIP_BEAR'>('GT');
  const [newAlertValue, setNewAlertValue] = useState<string>('');

  // --- WIDGET INIT ---
  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

    return () => {
      onLoadScriptRef.current = null;
    };

    function createWidget() {
      if (document.getElementById('tradingview_widget') && 'TradingView' in window) {
        const cleanSymbol = symbol.replace('-', ''); 
        const tvSymbol = `BINANCE:${cleanSymbol}T`;

        new window.TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: "15",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0B0E11",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: "tradingview_widget",
          hide_side_toolbar: false,
          studies: [
            "STD;Supertrend",
            "STD;RSI",
            "STD;MACD"
          ],
          disabled_features: ["header_symbol_search"],
          overrides: {
            "paneProperties.background": "#0B0E11",
            "paneProperties.vertGridProperties.color": "#15191E",
            "paneProperties.horzGridProperties.color": "#15191E",
            "scalesProperties.textColor": "#848E9C",
          }
        });
      }
    }
  }, [symbol]);

  // --- ALERT MONITORING LOGIC ---
  useEffect(() => {
    if (!data || data.length === 0 || alerts.length === 0) return;

    const latest = data[data.length - 1];
    const { rsi, supertrend } = calculateIndicators(data);

    // Check alerts
    const updatedAlerts = alerts.map(alert => {
      if (alert.triggered || !alert.active) return alert;

      let trigger = false;
      
      if (alert.type === 'PRICE') {
        if (alert.condition === 'GT' && latest.price > alert.value) trigger = true;
        if (alert.condition === 'LT' && latest.price < alert.value) trigger = true;
      }
      
      if (alert.type === 'RSI') {
        if (alert.condition === 'GT' && rsi > alert.value) trigger = true;
        if (alert.condition === 'LT' && rsi < alert.value) trigger = true;
      }

      if (alert.type === 'SUPERTREND') {
         // direction 1 = Bullish, -1 = Bearish
         if (alert.condition === 'FLIP_BULL' && supertrend.direction === 1) trigger = true;
         if (alert.condition === 'FLIP_BEAR' && supertrend.direction === -1) trigger = true;
      }

      if (trigger) {
        setActiveAlert(`${alert.type} Alert Triggered!`);
        setTimeout(() => setActiveAlert(null), 5000);
        return { ...alert, triggered: true, active: false }; // Auto-disable after trigger
      }
      return alert;
    });

    // Only update state if something changed to avoid render loops
    if (JSON.stringify(updatedAlerts) !== JSON.stringify(alerts)) {
      setAlerts(updatedAlerts);
    }
  }, [data, alerts]);

  // --- HANDLERS ---
  const addAlert = () => {
    const val = parseFloat(newAlertValue);
    if ((newAlertType !== 'SUPERTREND' && isNaN(val))) return;

    const newAlert: ChartAlert = {
      id: Date.now().toString(),
      type: newAlertType,
      condition: newAlertCondition,
      value: val,
      triggered: false,
      active: true,
      createdAt: Date.now()
    };

    setAlerts([...alerts, newAlert]);
    setNewAlertValue('');
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className='relative w-full h-full rounded-lg overflow-hidden border border-terminal-border group'>
      <div id='tradingview_widget' className='h-full w-full' />
      
      {/* Alert Button */}
      <div className="absolute top-3 right-3 z-20">
        <button 
          onClick={() => setShowPanel(!showPanel)}
          className={`bg-terminal-card border border-terminal-border text-xs font-bold px-3 py-1.5 rounded flex items-center gap-2 hover:bg-terminal-border transition-colors ${showPanel ? 'text-terminal-accent border-terminal-accent' : 'text-terminal-muted'}`}
        >
          <span>🔔</span> Alerts {alerts.filter(a => a.active).length > 0 && <span className="bg-terminal-accent text-terminal-bg px-1 rounded-full text-[9px]">{alerts.filter(a => a.active).length}</span>}
        </button>
      </div>

      {/* Trigger Notification */}
      {activeAlert && (
        <div className="absolute top-12 right-1/2 translate-x-1/2 bg-terminal-red text-white px-6 py-2 rounded shadow-xl z-50 animate-bounce font-bold border border-white/20">
           🚨 {activeAlert}
        </div>
      )}

      {/* Alert Panel */}
      {showPanel && (
        <div className="absolute top-12 right-3 w-80 bg-terminal-card border border-terminal-border rounded shadow-2xl z-30 flex flex-col max-h-[400px]">
           <div className="p-3 border-b border-terminal-border bg-terminal-bg/50">
             <h4 className="text-xs font-bold text-terminal-text uppercase">Configure Alert</h4>
           </div>
           
           <div className="p-4 space-y-3">
             <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-terminal-muted block mb-1">Indicator</label>
                  <select value={newAlertType} onChange={e => setNewAlertType(e.target.value as any)} className="w-full bg-terminal-bg border border-terminal-border text-xs rounded p-1 text-terminal-text focus:border-terminal-accent outline-none">
                    <option value="PRICE">Price</option>
                    <option value="RSI">RSI (14)</option>
                    <option value="SUPERTREND">Supertrend</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-terminal-muted block mb-1">Condition</label>
                  <select value={newAlertCondition} onChange={e => setNewAlertCondition(e.target.value as any)} className="w-full bg-terminal-bg border border-terminal-border text-xs rounded p-1 text-terminal-text focus:border-terminal-accent outline-none">
                    {newAlertType === 'SUPERTREND' ? (
                      <>
                        <option value="FLIP_BULL">Flip Bullish</option>
                        <option value="FLIP_BEAR">Flip Bearish</option>
                      </>
                    ) : (
                      <>
                        <option value="GT">Greater Than {'>'}</option>
                        <option value="LT">Less Than {'<'}</option>
                      </>
                    )}
                  </select>
                </div>
             </div>

             {newAlertType !== 'SUPERTREND' && (
               <div>
                 <label className="text-[10px] text-terminal-muted block mb-1">Threshold Value</label>
                 <input 
                   type="number" 
                   value={newAlertValue}
                   onChange={e => setNewAlertValue(e.target.value)}
                   placeholder={newAlertType === 'RSI' ? "e.g. 70" : "e.g. 65000"}
                   className="w-full bg-terminal-bg border border-terminal-border text-xs rounded p-1 text-terminal-text focus:border-terminal-accent outline-none font-mono"
                 />
               </div>
             )}

             <button onClick={addAlert} className="w-full bg-terminal-accent text-terminal-bg font-bold text-xs py-2 rounded hover:brightness-110">
               + Create Alert
             </button>
           </div>

           <div className="flex-1 overflow-y-auto border-t border-terminal-border bg-terminal-bg/30">
              {alerts.length === 0 ? (
                <div className="p-4 text-center text-[10px] text-terminal-muted italic">No active alerts</div>
              ) : (
                <div className="divide-y divide-terminal-border">
                  {alerts.map(alert => (
                    <div key={alert.id} className={`p-3 flex justify-between items-center ${alert.triggered ? 'opacity-50 bg-terminal-red/10' : ''}`}>
                       <div>
                          <div className="text-xs font-bold text-terminal-text flex items-center gap-2">
                             {alert.type} 
                             <span className="text-terminal-muted font-normal text-[10px]">{alert.condition} {alert.value ? alert.value : ''}</span>
                          </div>
                          <div className="text-[9px] text-terminal-muted">{alert.triggered ? 'TRIGGERED' : 'MONITORING...'}</div>
                       </div>
                       <button onClick={() => deleteAlert(alert.id)} className="text-terminal-muted hover:text-terminal-red">✕</button>
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default TradingViewWidget;
