import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { useI18n } from '../i18n';

interface SovereignCircuitBreakerProps {
  apiError: string | null;
  setApiError: (error: string | null) => void;
}

export const SovereignCircuitBreaker: React.FC<SovereignCircuitBreakerProps> = ({ 
  apiError, 
  setApiError 
}) => {
  const { t } = useI18n();

  return (
    <div className="pl-0 md:pl-24 h-screen w-full fixed inset-0 pointer-events-none z-[500]">
      <AnimatePresence>
        {apiError && !apiError.toLowerCase().includes('permission-denied') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 pointer-events-auto"
          >
            <div className="max-w-xl w-full p-8 md:p-12 ghibli-glass border border-red-500/30 flex flex-col gap-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-500/5 opacity-20 pointer-events-none" />
              <motion.div 
                animate={{ 
                  opacity: [0.1, 0.3, 0.1],
                  x: [0, 10, -10, 0]
                }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-10" 
              />
              
              <div className="flex items-center gap-4 text-red-400 relative z-10">
                 <ShieldAlert size={32} className="animate-pulse" />
                 <div className="flex flex-col">
                    <h2 className="text-xl md:text-2xl font-display tracking-[0.2em] uppercase">{(t.circuit_breaker_active || "CIRCUIT_BREAKER_ACTIVE").split('(')[0]?.trim()}</h2>
                    <span className="text-[8px] font-mono opacity-60 tracking-[0.4em] uppercase">{t.epistemic_discontinuity}</span>
                 </div>
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                 <p className="text-xs md:text-sm text-white/70 leading-relaxed font-serif italic border-l border-red-500/20 pl-4 py-2">
                    {(t.breaker_desc || "").split('.')[0]}. {t.detected_anomaly}:
                    <br/>
                    <span className="text-red-300/80 not-italic font-mono text-[10px] block mt-2 bg-red-500/10 p-2 rounded">
                       {apiError}
                    </span>
                 </p>
                 <p className="text-[10px] text-white/30 leading-relaxed font-mono uppercase tracking-wider">
                    {t.breaker_reason}
                 </p>
              </div>

              <div className="flex flex-col md:flex-row gap-4 relative z-10">
                 <button 
                   onClick={() => window.location.reload()}
                   className="flex-1 py-4 bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 text-red-100 text-[10px] font-mono font-bold tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-3"
                 >
                    <RefreshCw size={14} className="animate-spin-slow" />
                    {t.hard_reset_label}
                 </button>
                 <button 
                   onClick={() => setApiError(null)}
                   className="px-6 py-4 border border-white/10 hover:border-white/30 text-white/40 hover:text-white/80 text-[10px] font-mono uppercase transition-all"
                 >
                    {t.suppress_alert}
                 </button>
              </div>
              
              <div className="flex justify-between items-center text-[7px] font-mono text-white/10 mt-4 border-t border-white/5 pt-4">
                 <span>VENDOR_LINK: DEGRADED</span>
                 <span>VEDA_AA_PROTOCOL: ACTIVE</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
