import React from 'react';
import { motion } from 'motion/react';

export const VedaCrystalLogo: React.FC<{ size?: number, className?: string }> = ({ size = 120, className = "" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <motion.img
        src="input_file_0.png"
        alt="VEDA Emblem"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
