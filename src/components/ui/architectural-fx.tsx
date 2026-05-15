import React from 'react';
import { motion } from 'motion/react';

export const BorderBeam = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        animate={{
          left: ["-100%", "200%"],
          top: ["-100%", "200%"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute w-40 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[2px] opacity-20 rotate-45"
      />
    </div>
  );
};

export const RetroGrid = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
      <div className="absolute inset-0 bg-grid-pattern" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
    </div>
  );
};
