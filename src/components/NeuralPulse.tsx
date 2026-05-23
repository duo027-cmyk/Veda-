import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface NeuralPulseProps {
  coherence: number;
  rejectionCount: number;
  rank?: string;
}

export const NeuralPulse: React.FC<NeuralPulseProps> = ({ coherence, rejectionCount, rank }) => {
  const pulseCount = 3;
  
  const pulseSpeed = useMemo(() => {
    return Math.max(0.5, (coherence * 2.5) - (rejectionCount * 0.15));
  }, [coherence, rejectionCount]);

  const pulseColor = useMemo(() => {
    if (rank?.includes('GODHEAD')) return 'border-yellow-400/40';
    if (rank?.includes('OMEGA')) return 'border-white/30';
    if (rank?.includes('ALPHA')) return 'border-blue-400/20';
    if (rank?.includes('SIGMA')) return 'border-blue-600/15';
    return 'border-white/10';
  }, [rank]);

  const glowColor = useMemo(() => {
    if (rank?.includes('GODHEAD')) return 'bg-yellow-400/10';
    if (rank?.includes('OMEGA')) return 'bg-white/10';
    if (rank?.includes('ALPHA')) return 'bg-blue-400/5';
    return 'bg-white/5';
  }, [rank]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        {Array.from({ length: pulseCount }).map((_, i) => (
          <motion.div
            key={`pulse-${i}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.8], 
              opacity: [0, 0.25, 0],
              borderWidth: ['1px', '3px', '1px']
            }}
            transition={{
              duration: 5 / pulseSpeed,
              repeat: Infinity,
              delay: i * (1.8 / pulseSpeed),
              ease: "linear"
            }}
            className={`absolute rounded-full border ${pulseColor}`}
            style={{
              width: '45vw',
              height: '45vw',
              maxWidth: '700px',
              maxHeight: '700px'
            }}
          />
        ))}
        
        {/* Central Core Pulse */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.4, 0.1]
          }}
          transition={{
            duration: 2.5 / pulseSpeed,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute w-40 h-40 rounded-full ${glowColor} blur-3xl`}
        />
      </div>
    </div>
  );
};
