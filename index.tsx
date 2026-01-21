import React, { Component, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Safety check for root
const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = "CRITICAL: ROOT ELEMENT MISSING";
  throw new Error("Could not find root element to mount to");
}

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("React Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0E11] text-[#F6465D] p-8 font-mono">
          <div className="border border-[#2A2F37] bg-[#15191E] p-6 rounded-lg max-w-2xl w-full shadow-2xl">
            <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>⚠️</span> RENDER FAILURE
            </h1>
            <div className="bg-black/30 p-4 rounded border border-[#2A2F37] overflow-auto max-h-64 mb-4">
              <pre className="text-xs whitespace-pre-wrap">{this.state.error?.toString()}</pre>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-[#F0B90B] text-black font-bold rounded hover:brightness-110 text-sm"
            >
              REBOOT TERMINAL
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (e) {
  console.error("Mount Error:", e);
  rootElement.innerHTML = `<div style="color:red; padding:20px;">Mount Error: ${e instanceof Error ? e.message : String(e)}</div>`;
}