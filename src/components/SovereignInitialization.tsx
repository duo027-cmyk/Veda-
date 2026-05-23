import React from 'react';
import { motion } from 'motion/react';
import { VedaCrystalLogo } from './VedaCrystalLogo';

export const SovereignInitialization: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[200] bg-bg flex flex-col items-center justify-center gap-12">
       <VedaCrystalLogo size={100} className="animate-pulse" />
       <div className="text-center space-y-4">
          <h2 className="text-[12px] tracking-[0.8em] uppercase text-white/40">Initializing Sovereign Core</h2>
          <div className="flex gap-2 justify-center">
             {[0, 1, 2].map(i => (
                <motion.div 
                  key={`dot-${i}`}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                  className="w-1.5 h-1.5 bg-accent rounded-full"
                />
             ))}
          </div>
       </div>
    </div>
  );
};
