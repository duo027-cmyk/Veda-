import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      let errorMessage = 'An unexpected error occurred.';
      try {
        const parsedError = JSON.parse(this.state.error?.message || '');
        if (parsedError.error) {
          errorMessage = `Firebase Error: ${parsedError.error} (Operation: ${parsedError.operationType})`;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 font-mono">
          <div className="max-w-md w-full ff-panel bg-red-500/10 border border-red-500/30 p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-red-500 mb-4 tracking-widest uppercase">System Anomaly Detected</h2>
            <p className="text-red-400/70 text-sm mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={this.handleReset}
              className="flex items-center gap-3 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 transition-all mx-auto text-xs font-bold tracking-[0.2em]"
            >
              <RefreshCw className="w-4 h-4" />
              REBOOT SYSTEM
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
