import React from 'react';
import { NAVIGATION_ITEMS } from '../constants';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  apiStatus: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, apiStatus }) => {
  return (
    <div className="w-64 bg-terminal-card border-r border-terminal-border flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-terminal-border">
        <h1 className="text-xl font-bold text-terminal-accent flex items-center gap-2">
          <span className="text-2xl">⚡</span> 
          <span>DEALER</span>
        </h1>
        <p className="text-xs text-terminal-muted mt-1 font-mono">TERMINAL v2.4.0</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAVIGATION_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
              activeTab === item.id
                ? 'bg-terminal-border text-terminal-accent font-medium'
                : 'text-terminal-muted hover:bg-terminal-border/50 hover:text-terminal-text'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-terminal-border">
        <div className="bg-terminal-bg rounded p-3 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-terminal-muted uppercase font-bold">System Status</span>
            <span className={`h-2 w-2 rounded-full ${apiStatus ? 'bg-terminal-green animate-pulse' : 'bg-terminal-red'}`}></span>
          </div>
          <div className="text-xs font-mono text-terminal-text">
            {apiStatus ? 'ENGINE: ONLINE' : 'ENGINE: OFFLINE'}
          </div>
          <div className="text-[10px] text-terminal-muted mt-1">
            Latency: {apiStatus ? '14ms' : '---'}
          </div>
        </div>
        
        <button className="w-full bg-terminal-border hover:bg-terminal-muted/20 text-terminal-text text-xs py-2 px-3 rounded border border-terminal-border flex items-center justify-center gap-2 transition-all">
          <span>📥</span> Export CSV
        </button>
      </div>
    </div>
  );
};

export default Sidebar;