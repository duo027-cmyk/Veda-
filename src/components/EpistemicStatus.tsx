import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { vedaService } from '../services/vedaService';

export const EpistemicStatus = () => {
  const [status, setStatus] = useState<'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'SYNCING'>('HEALTHY');
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    const check = async () => {
      setStatus('SYNCING');
      try {
        const health = await vedaService.checkHealth();
        setStatus(health.status as any);
        setLatency(health.latency);
      } catch (e) {
        setStatus('OFFLINE');
      }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1 group cursor-help p-4">
      <AnimatePresence mode="wait">
        {status === 'HEALTHY' && (
          <motion.div 
            key="healthy"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-emerald-400/60 group-hover:text-emerald-400 transition-colors"
          >
            <Wifi size={14} />
          </motion.div>
        )}
        {status === 'SYNCING' && (
          <motion.div 
            key="syncing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-accent group-hover:text-accent-bright"
          >
            <RefreshCw size={14} className="animate-spin-slow" />
          </motion.div>
        )}
        {(status === 'DEGRADED' || status === 'OFFLINE') && (
          <motion.div 
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-amber-400 group-hover:text-amber-300"
          >
            <WifiOff size={14} />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="text-[7px] font-mono tracking-widest opacity-30 group-hover:opacity-100 transition-all uppercase">
        {status === 'HEALTHY' ? `${latency.toFixed(0)}ms` : status}
      </span>
    </div>
  );
};
