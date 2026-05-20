import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BrainData } from '../types';
import { useI18n } from '../i18n';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BurstMonitorProps {
  userData: BrainData;
  showBurstMonitor: boolean;
  setShowBurstMonitor: (show: boolean) => void;
  handleAction: (action: string, params?: any) => void;
}

export const BurstMonitor: React.FC<BurstMonitorProps> = ({ 
  userData, 
  showBurstMonitor, 
  setShowBurstMonitor, 
  handleAction 
}) => {
  const { t } = useI18n();

  if (!userData?.is_bursting || !showBurstMonitor) return null;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.08, 0.03, 0.12, 0.05] }}
        transition={{ duration: 0.15, repeat: Infinity }}
        className="fixed inset-0 pointer-events-none z-[999] bg-orange-600/10 mix-blend-overlay"
      />
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="ff-panel border-orange-500/40 p-4 md:p-6 bg-black/80 backdrop-blur-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex justify-between items-center mb-6">
             <div>
                <h3 className="text-[10px] md:text-xs font-bold tracking-[0.4em] text-orange-500 uppercase ff-font">{t.burst_monitor}</h3>
                <p className="text-[7px] text-white/30 uppercase tracking-[0.2em] ff-font mt-1">{t.peak_power}</p>
             </div>
             <div className="flex items-center gap-3">
                <div className="animate-pulse bg-orange-500/20 px-3 py-1 border border-orange-500/40 hidden sm:block">
                   <span className="text-[8px] text-orange-500 font-bold ff-font">ACTIVE</span>
                </div>
                <button 
                  onClick={() => setShowBurstMonitor(false)}
                  className="p-1 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
             <div>
                <label className="text-[7px] text-white/20 tracking-widest uppercase ff-font block mb-1">Target</label>
                <div className="text-[10px] md:text-sm text-white font-mono truncate ff-font">{userData.burst_status?.target}</div>
             </div>
             <div className="text-right">
                <label className="text-[7px] text-white/20 tracking-widest uppercase ff-font block mb-1">Peak Power Output</label>
                <div className="text-lg md:text-xl text-orange-400 font-display ff-font">{(userData.burst_status?.peakPower || 0).toFixed(2)} <span className="text-[10px] opacity-40 italic">MW</span></div>
             </div>
          </div>

          <div className="space-y-2 mb-6">
             <div className="flex justify-between items-center text-[7px] text-white/40 uppercase tracking-widest ff-font">
                <span>{t.causal_entropy}</span>
                <span className={cn(
                  userData.burst_status?.entropy! > 2.0 ? "text-red-500" : "text-orange-400"
                )}>{((userData.burst_status?.entropy || 0) * 100).toFixed(1)}%</span>
             </div>
             <div className="h-1 bg-white/5 w-full overflow-hidden">
                <motion.div 
                  className="h-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((userData.burst_status?.entropy || 0) / 2.5) * 100)}%` }}
                  transition={{ type: 'spring', damping: 20 }}
                />
             </div>
          </div>
          
          <div className="flex gap-2">
             {!userData.is_user_burst && (
               <button 
                 onClick={() => handleAction('approveBurst')}
                 className="flex-1 py-2 bg-orange-500 text-black text-[9px] font-bold ff-font hover:bg-white transition-all uppercase tracking-widest"
               >
                 {t.approve_label}
               </button>
             )}
             <button 
                onClick={() => setShowBurstMonitor(false)}
                className="flex-1 py-2 bg-white/10 text-white/60 text-[9px] ff-font hover:bg-white/20 transition-all uppercase tracking-widest"
              >
                {t.hide_label}
              </button>
              <button 
                onClick={() => handleAction('deactivateBurst', { reason: 'MANUAL' })}
                className="flex-1 py-2 bg-red-900/40 border border-red-500/20 text-red-100 text-[9px] ff-font hover:bg-red-600 transition-all uppercase tracking-widest"
              >
                {t.shutdown_label}
              </button>
           </div>
          
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-[40px] pointer-events-none ff-font font-bold">
             P = E / τ
          </div>
        </motion.div>
      </div>
    </>
  );
};
