import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Zap, Activity, Info, ShieldAlert } from 'lucide-react';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

interface LogEntry {
  id: string;
  type: 'PEC_WARNING' | 'SYSTEM_STAGNATION' | 'EVOLUTION' | 'RESONANCE' | 'AUDIT' | 'INFO';
  message: string;
  timestamp: number;
}

interface EpistemicLogProps {
  logs: LogEntry[];
}

export const EpistemicLog: React.FC<EpistemicLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'PEC_WARNING': return <ShieldAlert className="w-3 h-3 text-red-500" />;
      case 'SYSTEM_STAGNATION': return <Zap className="w-3 h-3 text-orange-500" />;
      case 'EVOLUTION': return <Activity className="w-3 h-3 text-cyan-400" />;
      case 'RESONANCE': return <Cpu className="w-3 h-3 text-purple-400" />;
      default: return <Info className="w-3 h-3 text-white/40" />;
    }
  };

  const getLabelColor = (type: string) => {
    switch (type) {
      case 'PEC_WARNING': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'SYSTEM_STAGNATION': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'EVOLUTION': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'RESONANCE': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cpu className="w-4 h-4 text-accent animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase text-white/60">Epistemic_Stream.log</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
           <span className="text-[8px] font-mono text-green-500/60 uppercase tracking-widest">Live_Connect</span>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        <AnimatePresence initial={false}>
          {logs.map((log, lIdx) => (
            <motion.div 
              key={`log-${log.id || lIdx}-${lIdx}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="group flex gap-3 items-start py-1.5 px-2 hover:bg-white/5 transition-colors rounded-lg border-l border-transparent hover:border-white/10"
            >
              <span className="font-mono text-[9px] text-white/20 whitespace-nowrap mt-1 leading-none">
                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 2 })}
              </span>
              
              <div className={cn(
                "px-2 py-0.5 rounded border text-[8px] font-mono font-bold tracking-widest uppercase flex-shrink-0 mt-0.5",
                getLabelColor(log.type)
              )}>
                {log.type.replace('_', ' ')}
              </div>
              
              <span className="font-mono text-[10px] text-white/80 leading-relaxed tracking-tight group-hover:text-white transition-colors">
                {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {logs.length === 0 && (
          <div className="h-full flex items-center justify-center text-[10px] font-mono text-white/10 uppercase tracking-[0.5em]">
            Waiting for Causal Input...
          </div>
        )}
      </div>
      
      <div className="px-4 py-2 border-t border-white/5 bg-black/20 text-[8px] font-mono flex justify-between">
        <div className="flex gap-4">
           <span className="text-white/20">BUFF: {logs.length}/500</span>
           <span className="text-white/20">ARCH: AGI-SC_v6.0</span>
        </div>
        <span className="text-accent/60 animate-pulse">PROBABILISTIC_REALITY_MODE</span>
      </div>
    </div>
  );
};
