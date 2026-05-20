import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[PROTOCOL_FAULT] Unhandled logic drift:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-6 ghibli-glass p-8 border border-red-500/20">
            <h1 className="text-red-500 text-xl font-bold uppercase tracking-[0.4em]">Protocol Defect</h1>
            <p className="text-white/40 text-[10px] font-mono leading-relaxed uppercase tracking-wider">
              The neural manifold has collapsed due to an unhandled exception. Sovereign continuity is currently suspended.
            </p>
            <div className="bg-red-500/10 p-4 border border-red-500/10 text-[9px] text-red-300/80 font-mono text-left overflow-auto max-h-40 scrollbar-none">
              {this.state.error?.message}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-[9px] font-bold uppercase tracking-[0.3em] transition-all"
            >
              Attempt Logic Re-anchoring
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
