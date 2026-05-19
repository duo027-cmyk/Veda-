import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
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

  private unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
    this.setState({ hasError: true, error: new Error(event.reason || 'Unhandled Promise Rejection') });
  };

  public static getDerivedStateFromError(error: Error): State {
    // If it's a transient Firebase or network error, we don't want to crash the whole UI
    const msg = error.message?.toLowerCase() || '';
    if (msg.includes('permission-denied') || msg.includes('quota') || msg.includes('offline')) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidMount() {
    // We remove the unhandledrejection global crash to prevent transient network/permission errors 
    // from triggering a full UI desync screen.
  }

  public componentWillUnmount() {
    // Clean up
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const msg = error.message?.toLowerCase() || '';
    if (msg.includes('permission-denied') || msg.includes('quota')) {
      console.warn('[VEDA_SILENT_ERROR] Suppressed UI crash for transient data error:', error);
      return; 
    }
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    console.log("[VEDA_OS] Attempting neural lattice realignment...");
    this.setState({ hasError: false, error: null });
    // For fatal errors, a full reload is often safer, but we can try just clearing state first
    if (this.state.error?.message.includes('FATAL')) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.handleReset);
      }
      
      if (this.props.fallback) {
        return this.props.fallback;
      }

      let errorMessage = 'An unexpected causal desync has occurred within the core lattice.';
      try {
        const parsedError = JSON.parse(this.state.error.message);
        if (parsedError.error) {
          errorMessage = `NEXUS_FAILURE: ${parsedError.error} (NODE: ${parsedError.path || 'UNKNOWN'})`;
        }
      } catch (e) {
        errorMessage = this.state.error.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-6 font-mono selection:bg-red-500/30">
          <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
          
          <div className="max-w-xl w-full ff-panel border-red-500/40 bg-black/60 shadow-[0_0_100px_rgba(239,68,68,0.1)] p-12 relative overflow-hidden group">
            {/* Aesthetic Glitch Accents */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            
            <motion.div 
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.1, repeat: Infinity, repeatType: 'reverse' }}
              className="flex justify-center mb-10"
            >
              <AlertTriangle className="w-16 h-16 text-red-500/80 stroke-[1.5px]" />
            </motion.div>

            <h2 className="text-2xl font-bold text-red-500 mb-2 tracking-[0.4em] uppercase text-center ff-font">
              Core Desync Detected
            </h2>
            <div className="text-[10px] text-red-500/40 text-center mb-10 tracking-[0.2em] font-mono">
              EPISTEMIC_CONTINUITY_FAILURE_0x77
            </div>

            <div className="bg-red-500/5 border-y border-red-500/10 p-6 mb-12 relative">
               <div className="absolute top-0 right-4 px-2 bg-black -translate-y-1/2 text-[8px] text-red-500/40 ff-font">
                 LOG_TRACE
               </div>
               <p className="text-red-200/60 text-xs leading-relaxed font-serif italic text-center">
                "{errorMessage}"
               </p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={this.handleReset}
                className="group relative flex items-center justify-center gap-4 px-8 py-4 bg-red-500 text-black text-[10px] font-bold tracking-[0.4em] uppercase transition-all hover:bg-white active:scale-95"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                Realignment Lattice
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all text-[8px] tracking-[0.3em] font-mono uppercase"
              >
                Force Hard Reboot
              </button>
            </div>

            <div className="mt-12 flex justify-between items-center text-[7px] text-white/10 ff-font">
               <span>LATENCY: INF</span>
               <span>STATUS: UNSTABLE</span>
               <span>NODE: VEDA-01</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
