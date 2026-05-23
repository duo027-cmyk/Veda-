import React from 'react';
import { motion } from 'motion/react';
import { Eye, Search, Sparkles, Brain, Activity } from 'lucide-react';
import { BrainData } from '../types';

export const CuriosityMonitor = ({ data }: { data: BrainData | null }) => {
  if (!data?.foraging_status) return null;

  const { curiosityLevel, recentLogs, surpriseAverages } = data.foraging_status;

  return (
    <div className="flex flex-col gap-6 p-6 ghibli-glass border border-accent/20 rounded-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Search size={80} className="text-accent" />
      </div>

      <div className="flex justify-between items-center relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-mono text-accent uppercase tracking-widest">Active Inference</span>
          <h3 className="text-lg font-display text-white italic tracking-wider flex items-center gap-2">
            主動自我學習 (Self-Learning)
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}>
              <Sparkles size={14} className="text-amber-400" />
            </motion.div>
          </h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-mono text-accent uppercase tracking-tighter">Epistemic Foraging Active</span>
        </div>
      </div>

      {/* Curiosity Bar */}
      <div className="flex flex-col gap-3 relative z-10">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Curiosity Index (C)</label>
            <span className="text-xs font-mono text-white">{(curiosityLevel * 100).toFixed(1)}%</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <label className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Prediction Surprise (H)</label>
            <span className="text-xs font-mono text-amber-400 font-bold">{(surpriseAverages * 100).toFixed(4)}%</span>
          </div>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${curiosityLevel * 100}%` }}
            className="h-full bg-gradient-to-r from-accent to-amber-500"
          />
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(10, surpriseAverages * 100)}%` }}
            className="h-full bg-white/20"
          />
        </div>
      </div>

      {/* Foraging Logs */}
      <div className="flex flex-col gap-3 mt-2 relative z-10">
        <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest border-b border-white/5 pb-1">覓食日誌 (Foraging Logs)</span>
        <div className="flex flex-col gap-2">
          {recentLogs.map((log, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={`log-${idx}-${log.substring(0, 10)}`} 
              className="flex items-start gap-3 text-[10px] font-mono text-white/60 leading-tight group/log"
            >
              <div className="mt-1 w-1 h-1 rounded-full bg-accent group-hover/log:scale-150 transition-transform" />
              <div className="flex-1">
                <span className="text-accent/60 mr-2">[{new Date().toLocaleTimeString()}]</span>
                {log}
              </div>
            </motion.div>
          ))}
          {recentLogs.length === 0 && (
            <div className="text-[10px] font-mono text-white/20 italic">Scanning causal manifold for informational gaps...</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="p-3 bg-white/5 border border-white/5 rounded-sm flex flex-col gap-1">
           <span className="text-[8px] font-mono text-white/20 uppercase">Axiomatic Shift Rate</span>
           <span className="text-sm font-display text-white">{(curiosityLevel > 0.5 ? 0.02 : 0.005).toFixed(3)} η</span>
        </div>
        <div className="p-3 bg-white/5 border border-white/5 rounded-sm flex flex-col gap-1">
           <span className="text-[8px] font-mono text-white/20 uppercase">Model Entropy Drain</span>
           <span className="text-sm font-display text-accent">{(1 - surpriseAverages).toFixed(4)} Φ</span>
        </div>
      </div>
    </div>
  );
};
