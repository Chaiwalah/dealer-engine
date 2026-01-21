
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DealerEngine from './pages/DealerEngine';
import Overview from './pages/Overview';
import AICommandCenter from './components/AICommandCenter';

function App() {
  const [activeTab, setActiveTab] = useState('dealer');
  const [activeSymbol, setActiveSymbol] = useState('SOL-USD');
  const [apiStatus, setApiStatus] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isAIModalOpen, setAIModalOpen] = useState(false);

  // Check API health periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Simulating API check for demo
        setApiStatus(true);
        setLastUpdate(Date.now());
      } catch (e) {
        setApiStatus(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dealer':
        return <DealerEngine symbol={activeSymbol} />;
      case 'overview':
        return <Overview />;
      case 'markets':
      case 'exchanges':
      case 'analysis':
      case 'performance':
        return (
          <div className="flex items-center justify-center h-full text-terminal-muted font-mono">
            MODULE [{activeTab.toUpperCase()}] LOADING...
          </div>
        );
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-terminal-bg text-terminal-text font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} apiStatus={apiStatus} />
      
      <div className="flex-1 flex flex-col ml-64 h-screen">
        <Header 
          activeSymbol={activeSymbol} 
          setSymbol={setActiveSymbol} 
          lastUpdate={lastUpdate} 
          onOpenAI={() => setAIModalOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto bg-terminal-bg relative">
          {/* Grid Background Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
               style={{
                 backgroundImage: 'linear-gradient(#2A2F37 1px, transparent 1px), linear-gradient(90deg, #2A2F37 1px, transparent 1px)',
                 backgroundSize: '40px 40px'
               }}>
          </div>
          
          <div className="relative z-10 h-full">
            {renderContent()}
          </div>
        </main>
      </div>

      <AICommandCenter isOpen={isAIModalOpen} onClose={() => setAIModalOpen(false)} />
    </div>
  );
}

export default App;
