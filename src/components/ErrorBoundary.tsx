import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  mode?: 'full' | 'inline';
  title?: string;
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
    console.error('[PROTOCOL_FAULT] logic drift caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      if (this.props.mode === 'inline') {
        return (
          <div className="p-6 md:p-8 bg-black/60 border border-red-500/20 rounded-xl ghibli-glass text-center space-y-4 max-w-lg mx-auto my-6">
            <h3 className="text-red-500 text-xs font-mono font-bold uppercase tracking-[0.3em]">
              {this.props.title || "Subsystem Logic Drift"}
            </h3>
            <p className="text-white/40 text-[9px] font-mono leading-relaxed uppercase tracking-wider">
              An unhandled exception collapsed this specific compute loop. Other workflows remain operational.
            </p>
            <div className="bg-red-500/5 p-3 rounded border border-red-500/10 text-[9px] text-red-300/80 font-mono text-left overflow-auto max-h-32 scrollbar-none">
              {this.state.error?.message || "Unknown circuit breaker signal."}
            </div>
            <button 
              onClick={this.handleReset}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-[9px] font-bold uppercase tracking-[0.2em] transition-all rounded animate-pulse"
            >
              Recover Compute Loop
            </button>
          </div>
        );
      }

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
            <div className="flex gap-2">
              <button 
                onClick={this.handleReset}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-[9px] font-bold uppercase tracking-[0.3em] transition-all"
              >
                Reset Core State
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-[9px] font-bold uppercase tracking-[0.3em] transition-all"
              >
                Full Stack Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
