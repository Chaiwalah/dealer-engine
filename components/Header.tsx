
import React from 'react';
import { SYMBOLS, TIMEFRAMES } from '../constants';

interface HeaderProps {
  activeSymbol: string;
  setSymbol: (sym: string) => void;
  lastUpdate: number;
  onOpenAI: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeSymbol, setSymbol, lastUpdate, onOpenAI }) => {
  return (
    <header className="h-16 bg-terminal-bg border-b border-terminal-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <select 
            value={activeSymbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="appearance-none bg-terminal-card border border-terminal-border text-terminal-accent font-mono font-bold py-2 pl-4 pr-10 rounded focus:outline-none focus:border-terminal-accent cursor-pointer text-lg hover:bg-terminal-border/50 transition-colors"
          >
            {SYMBOLS.map(sym => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-terminal-muted">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>

        <div className="flex bg-terminal-card rounded p-1 border border-terminal-border">
          {TIMEFRAMES.map(tf => (
            <button key={tf} className="px-3 py-1 text-xs font-medium text-terminal-muted hover:text-terminal-text hover:bg-terminal-border rounded transition-colors first:text-terminal-accent">
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-terminal-muted uppercase">Last Update</span>
          <span className="text-xs font-mono text-terminal-text">
            {new Date(lastUpdate).toLocaleTimeString()}
          </span>
        </div>
        
        <div className="h-8 w-px bg-terminal-border mx-2"></div>

        <button 
          onClick={onOpenAI}
          className="bg-terminal-accent text-terminal-bg font-bold px-4 py-2 rounded text-sm hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_0_10px_rgba(240,185,11,0.2)]"
        >
          <span>🦅</span> AI COMMAND
        </button>
      </div>
    </header>
  );
};

export default Header;
