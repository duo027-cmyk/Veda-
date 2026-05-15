import React from 'react';
import { motion } from 'motion/react';

export const QuantumWaveform = ({ waveform }: { waveform: number[] }) => {
  return (
    <div className="flex items-end justify-center gap-[2px] h-24 px-4 w-full">
      {waveform.map((val, i) => (
        <motion.div
           key={i}
           initial={{ height: 0 }}
           animate={{ height: `${val * 100}%` }}
           className="w-1 bg-accent/30 rounded-t-full"
           transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      ))}
    </div>
  );
};
