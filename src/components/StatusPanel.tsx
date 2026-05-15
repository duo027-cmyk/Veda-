import React from 'react';
import { Activity, Shield, Zap, Database } from 'lucide-react';
import { motion } from 'motion/react';

interface StatusPanelProps {
  coherence: number;
  entropy: number;
  lastResult: number | string | null;
  crystalCount: number;
  activeNodes?: number;
  statusText?: string;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ coherence, entropy, lastResult, crystalCount, activeNodes = 0, statusText }) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Dynamic Status Text Bar */}
      <div className="h-6 bg-black/40 border-l-2 border-cyan-500/50 flex items-center px-4 overflow-hidden relative">
         <div className="absolute inset-y-0 left-0 w-1 bg-cyan-500 animate-pulse" />
         <motion.span 
           key={statusText}
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="text-[9px] font-mono text-cyan-400/80 uppercase tracking-widest whitespace-nowrap"
         >
           {statusText || 'VEDA Sovereign Core >> STANDBY'}
         </motion.span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatusCard 
          icon={<Activity className="w-4 h-4 text-cyan-400" />}
          label="相干度 / COHERENCE"
          value={`${coherence.toFixed(2)}%`}
          color="text-cyan-400"
          delay={0}
        />
      <StatusCard 
        icon={<Shield className="w-4 h-4 text-blue-400" />}
        label="熵值 / ENTROPY"
        value={entropy.toFixed(5)}
        color="text-blue-400"
        delay={0.1}
      />
      <StatusCard 
        icon={<Zap className="w-4 h-4 text-yellow-400" />}
        label="聯合節點 / NODES"
        value={activeNodes.toString()}
        color="text-yellow-400"
        delay={0.2}
      />
      <StatusCard 
        icon={<Database className="w-4 h-4 text-purple-400" />}
        label="知識晶體 / CRYSTALS"
        value={crystalCount.toString()}
        color="text-purple-400"
        delay={0.3}
      />
      <StatusCard 
        icon={<Activity className="w-4 h-4 text-emerald-400" />}
        label="矩陣狀態 / MATRIX"
        value={coherence > 80 ? 'OPTIMAL' : 'SYNCING'}
        color="text-emerald-400"
        delay={0.4}
      />
    </div>
    </div>
  );
};

const StatusCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string; delay: number }> = ({ icon, label, value, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="ff-panel p-4 flex flex-col gap-2 backdrop-blur-xl border border-white/10 group hover:border-white/30 transition-colors"
  >
    <div className="flex items-center gap-2 text-[10px] ff-font text-white/50 uppercase tracking-widest group-hover:text-white/80 transition-colors">
      {icon}
      {label}
    </div>
    <div className={`text-2xl ff-font font-black ${color} tracking-tighter drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
      {value}
    </div>
    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
  </motion.div>
);
