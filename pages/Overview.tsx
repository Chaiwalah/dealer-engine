
import React, { useEffect, useState } from 'react';
import { fetchMarketTickers, fetchETFData } from '../services/api';
import { TickerData, ETFDataPoint } from '../types';

const Overview: React.FC = () => {
  const [tickers, setTickers] = useState<TickerData[]>([]);
  const [etfData, setEtfData] = useState<ETFDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [tData, eData] = await Promise.all([
        fetchMarketTickers(),
        fetchETFData()
      ]);
      setTickers(tData);
      setEtfData(eData);
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-8 text-terminal-accent font-mono animate-pulse">SYNCING GLOBAL MARKET DATA...</div>;
  }

  // Derived Data
  const btc = tickers.find(t => t.symbol === 'BTC') || { price: 0, changePercent24h: 0, volume: 0 };
  const eth = tickers.find(t => t.symbol === 'ETH') || { price: 0, changePercent24h: 0, volume: 0 };
  const sol = tickers.find(t => t.symbol === 'SOL') || { price: 0, changePercent24h: 0, volume: 0 };
  const xrp = tickers.find(t => t.symbol === 'XRP') || { price: 0, changePercent24h: 0, volume: 0 };
  const bnb = tickers.find(t => t.symbol === 'BNB') || { price: 0, changePercent24h: 0, volume: 0 };
  const doge = tickers.find(t => t.symbol === 'DOGE') || { price: 0, changePercent24h: 0, volume: 0 };

  // Heatmap Logic: Top 15 coins by volume, excluding stables roughly
  const heatmapCoins = tickers.slice(0, 16);

  // Helper to render change
  const renderChange = (chg: number) => (
    <span className={`${chg >= 0 ? 'text-terminal-green' : 'text-terminal-red'} font-mono font-bold`}>
      {chg > 0 ? '+' : ''}{chg.toFixed(2)}%
    </span>
  );

  return (
    <div className="p-6 h-full flex flex-col gap-6 max-w-[1920px] mx-auto overflow-y-auto">
      
      <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
        
        {/* Left Column: Gainers & Losers (Cards) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-terminal-text flex items-center gap-2">
            Gainers & Losers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full overflow-y-auto pr-1">
            {/* BTC Card */}
            <div className="bg-terminal-card border border-terminal-border p-4 rounded-lg flex flex-col justify-between h-32">
               <div className="flex justify-between items-start">
                 <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-[#F7931A] flex items-center justify-center text-[10px] text-black font-bold">₿</div>
                   <span className="font-bold">BTC</span>
                 </div>
                 <span className="font-mono text-lg">${btc.price.toLocaleString()}</span>
               </div>
               <div className="grid grid-cols-2 gap-x-2 text-xs mt-2">
                  <div className="flex justify-between"><span className="text-terminal-muted">24h</span> {renderChange(btc.changePercent24h)}</div>
                  <div className="flex justify-between"><span className="text-terminal-muted">1h</span> {renderChange(btc.changePercent24h / 5)}</div> {/* Sim 1h */}
               </div>
            </div>

            {/* ETH Card */}
            <div className="bg-terminal-card border border-terminal-border p-4 rounded-lg flex flex-col justify-between h-32">
               <div className="flex justify-between items-start">
                 <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-[#627EEA] flex items-center justify-center text-[10px] text-white font-bold">Ξ</div>
                   <span className="font-bold">ETH</span>
                 </div>
                 <span className="font-mono text-lg">${eth.price.toLocaleString()}</span>
               </div>
               <div className="grid grid-cols-2 gap-x-2 text-xs mt-2">
                  <div className="flex justify-between"><span className="text-terminal-muted">24h</span> {renderChange(eth.changePercent24h)}</div>
                  <div className="flex justify-between"><span className="text-terminal-muted">1h</span> {renderChange(eth.changePercent24h / 4)}</div>
               </div>
            </div>

             {/* SOL Card */}
             <div className="bg-terminal-card border border-terminal-border p-4 rounded-lg flex flex-col justify-between h-32">
               <div className="flex justify-between items-start">
                 <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-[#14F195] flex items-center justify-center text-[10px] text-black font-bold">S</div>
                   <span className="font-bold">SOL</span>
                 </div>
                 <span className="font-mono text-lg">${sol.price.toLocaleString()}</span>
               </div>
               <div className="grid grid-cols-2 gap-x-2 text-xs mt-2">
                  <div className="flex justify-between"><span className="text-terminal-muted">24h</span> {renderChange(sol.changePercent24h)}</div>
                  <div className="flex justify-between"><span className="text-terminal-muted">1h</span> {renderChange(sol.changePercent24h / 6)}</div>
               </div>
            </div>

            {/* XRP Card */}
            <div className="bg-terminal-card border border-terminal-border p-4 rounded-lg flex flex-col justify-between h-32">
               <div className="flex justify-between items-start">
                 <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] text-black font-bold">X</div>
                   <span className="font-bold">XRP</span>
                 </div>
                 <span className="font-mono text-lg">${xrp.price.toFixed(4)}</span>
               </div>
               <div className="grid grid-cols-2 gap-x-2 text-xs mt-2">
                  <div className="flex justify-between"><span className="text-terminal-muted">24h</span> {renderChange(xrp.changePercent24h)}</div>
                  <div className="flex justify-between"><span className="text-terminal-muted">1h</span> {renderChange(xrp.changePercent24h / 3)}</div>
               </div>
            </div>
            
             {/* DOGE Card */}
             <div className="bg-terminal-card border border-terminal-border p-4 rounded-lg flex flex-col justify-between h-32">
               <div className="flex justify-between items-start">
                 <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-[#BA9F33] flex items-center justify-center text-[10px] text-white font-bold">Ð</div>
                   <span className="font-bold">DOGE</span>
                 </div>
                 <span className="font-mono text-lg">${doge.price.toFixed(5)}</span>
               </div>
               <div className="grid grid-cols-2 gap-x-2 text-xs mt-2">
                  <div className="flex justify-between"><span className="text-terminal-muted">24h</span> {renderChange(doge.changePercent24h)}</div>
                  <div className="flex justify-between"><span className="text-terminal-muted">1h</span> {renderChange(doge.changePercent24h / 2)}</div>
               </div>
            </div>

            {/* BNB Card */}
            <div className="bg-terminal-card border border-terminal-border p-4 rounded-lg flex flex-col justify-between h-32">
               <div className="flex justify-between items-start">
                 <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-[#F0B90B] flex items-center justify-center text-[10px] text-black font-bold">B</div>
                   <span className="font-bold">BNB</span>
                 </div>
                 <span className="font-mono text-lg">${bnb.price.toLocaleString()}</span>
               </div>
               <div className="grid grid-cols-2 gap-x-2 text-xs mt-2">
                  <div className="flex justify-between"><span className="text-terminal-muted">24h</span> {renderChange(bnb.changePercent24h)}</div>
                  <div className="flex justify-between"><span className="text-terminal-muted">1h</span> {renderChange(bnb.changePercent24h / 4)}</div>
               </div>
            </div>

          </div>
        </div>

        {/* Right Column: Heatmap (24h) */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4">
          <div className="flex justify-between items-center">
             <h2 className="text-lg font-bold text-terminal-text">Heatmap (24 hour)</h2>
             <div className="flex gap-1 text-xs">
                <span className="px-2 py-1 bg-terminal-accent text-terminal-bg font-bold rounded">Volume</span>
                <span className="px-2 py-1 bg-terminal-card text-terminal-muted rounded border border-terminal-border">Chg%</span>
             </div>
          </div>
          
          <div className="flex-1 bg-terminal-card border border-terminal-border rounded-lg overflow-hidden relative">
             {/* CSS Grid for simple Treemap approximation */}
             <div className="grid grid-cols-4 grid-rows-4 w-full h-full gap-1 p-1">
                {/* BTC Big Block */}
                <div className={`col-span-2 row-span-2 ${btc.changePercent24h >= 0 ? 'bg-terminal-green/80' : 'bg-terminal-red/80'} text-white p-4 flex flex-col justify-center items-center hover:opacity-90 transition-opacity cursor-pointer`}>
                   <span className="text-4xl font-bold">BTC</span>
                   <span className="text-lg font-mono">${(btc.volume / 1000000000).toFixed(2)}B</span>
                   <span className="text-sm font-bold bg-black/20 px-2 rounded mt-1">{btc.changePercent24h.toFixed(2)}%</span>
                </div>

                {/* ETH Big Block */}
                <div className={`col-span-2 row-span-2 ${eth.changePercent24h >= 0 ? 'bg-terminal-green/80' : 'bg-terminal-red/80'} text-white p-4 flex flex-col justify-center items-center hover:opacity-90 transition-opacity cursor-pointer`}>
                   <span className="text-4xl font-bold">ETH</span>
                   <span className="text-lg font-mono">${(eth.volume / 1000000000).toFixed(2)}B</span>
                   <span className="text-sm font-bold bg-black/20 px-2 rounded mt-1">{eth.changePercent24h.toFixed(2)}%</span>
                </div>

                {/* SOL Block */}
                <div className={`col-span-1 row-span-2 ${sol.changePercent24h >= 0 ? 'bg-terminal-green/70' : 'bg-terminal-red/70'} text-white p-2 flex flex-col justify-center items-center`}>
                    <span className="text-xl font-bold">SOL</span>
                    <span className="text-xs">${(sol.volume / 1000000000).toFixed(2)}B</span>
                    <span className="text-xs font-bold">{sol.changePercent24h.toFixed(2)}%</span>
                </div>
                
                {/* Rest of items filling grid */}
                {heatmapCoins.slice(3, 9).map((coin, idx) => (
                  <div key={coin.symbol} className={`col-span-1 row-span-1 ${coin.changePercent24h >= 0 ? 'bg-terminal-green/60' : 'bg-terminal-red/60'} text-white p-1 flex flex-col justify-center items-center overflow-hidden`}>
                     <span className="text-sm font-bold">{coin.symbol}</span>
                     <span className="text-[10px]">{coin.changePercent24h.toFixed(2)}%</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

      </div>

      {/* Bottom Section: ETF Inflow */}
      <div className="flex-1 min-h-[300px] flex flex-col gap-4">
        <div className="flex items-center gap-4">
           <h2 className="text-lg font-bold text-terminal-text">Total Bitcoin Spot ETF Net Inflow (BTC)</h2>
           <div className="flex bg-terminal-card border border-terminal-border rounded text-xs">
              <button className="px-3 py-1 bg-terminal-border text-terminal-text">BTC</button>
              <button className="px-3 py-1 text-terminal-muted hover:text-terminal-text">USD</button>
           </div>
           <span className="text-xs text-terminal-muted">Update Time: {new Date().toISOString().split('T')[0]}</span>
        </div>
        
        <div className="bg-terminal-card border border-terminal-border rounded-lg overflow-hidden flex-1">
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-right">
               <thead className="bg-terminal-border/50 text-terminal-muted text-xs uppercase">
                 <tr>
                   <th className="px-4 py-3 text-left">Time(UTC)</th>
                   <th className="px-4 py-3">Total</th>
                   <th className="px-4 py-3">IBIT</th>
                   <th className="px-4 py-3">FBTC</th>
                   <th className="px-4 py-3">BITB</th>
                   <th className="px-4 py-3">ARKB</th>
                   <th className="px-4 py-3">BTCO</th>
                   <th className="px-4 py-3">GBTC</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-terminal-border">
                 {etfData.map((row) => (
                   <tr key={row.date} className="hover:bg-terminal-border/20 transition-colors">
                     <td className="px-4 py-3 text-left font-mono text-terminal-text">{row.date}</td>
                     <td className={`px-4 py-3 font-bold ${row.total >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>{row.total.toFixed(2)}K</td>
                     <td className={`px-4 py-3 ${row.funds.IBIT >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>{row.funds.IBIT !== 0 ? row.funds.IBIT.toFixed(2) : '0'}</td>
                     <td className={`px-4 py-3 ${row.funds.FBTC >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>{row.funds.FBTC !== 0 ? row.funds.FBTC.toFixed(2) : '0'}</td>
                     <td className={`px-4 py-3 ${row.funds.BITB >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>{row.funds.BITB !== 0 ? row.funds.BITB.toFixed(2) : '0'}</td>
                     <td className={`px-4 py-3 ${row.funds.ARKB >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>{row.funds.ARKB !== 0 ? row.funds.ARKB.toFixed(2) : '0'}</td>
                     <td className={`px-4 py-3 ${row.funds.BTCO >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>{row.funds.BTCO !== 0 ? row.funds.BTCO.toFixed(2) : '0'}</td>
                     <td className={`px-4 py-3 ${row.funds.GBTC >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>{row.funds.GBTC.toFixed(2)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>

    </div>
  );
};

export default Overview;
