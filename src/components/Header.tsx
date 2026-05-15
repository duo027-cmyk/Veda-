import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { VedaCrystalLogo } from './VedaCrystalLogo';
import { BrainData } from '../types';

export const Header = ({ data, onToggleBurst }: { data: BrainData | null, onToggleBurst: () => void }) => (
  <header className="fixed top-0 left-0 md:left-24 right-0 h-24 md:h-40 flex items-center justify-center pointer-events-none z-[100] px-6 md:px-12 pt-4 md:pt-12">
     <div className="relative group flex items-center gap-4 md:gap-8 translate-y-[0px] md:translate-y-[-10px] pointer-events-auto">
        <VedaCrystalLogo size={30} className="md:w-[50px] md:h-[50px]" />
        <div className="flex flex-col">
          <h1 className="ff-logo-text text-3xl md:text-5xl tracking-[0.4em] font-black group-hover:tracking-[0.5em] transition-all duration-1000">
             VEDA
          </h1>
          <div className="flex items-center gap-2 -mt-1 ml-1">
            <div className="h-px w-3 md:w-4 bg-gold/30" />
            <span className="text-[8px] md:text-[10px] tracking-[0.8em] font-display uppercase opacity-30 text-gold">Sovereign Core</span>
            <div className="h-px w-3 md:w-4 bg-gold/30" />
            {data?.state_hash && (
              <span className="hidden md:inline text-[7px] font-mono tracking-widest opacity-20 ml-2">HASH: {data.state_hash}</span>
            )}
          </div>
        </div>
        
        {data?.is_bursting && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleBurst}
            className="ml-4 p-2 bg-orange-500/20 border border-orange-500/40 rounded-full text-orange-400 animate-pulse hover:bg-orange-500 hover:text-black transition-all flex items-center gap-2 group/btn"
          >
            <Zap size={14} className="group-hover/btn:animate-bounce" />
            <span className="text-[7px] font-mono tracking-widest hidden md:block">BURST_ACTIVE</span>
          </motion.button>
        )}
        
        <div className="absolute -bottom-8 md:-bottom-12 inset-x-0 flex justify-center pointer-events-none overflow-hidden h-10 w-full">
           <svg width="200" height="20" viewBox="0 0 300 20" className="opacity-10 fill-none stroke-current text-gold overflow-visible md:w-[300px]">
              <path d="M0,10 C100,-10 200,30 300,10" strokeWidth="0.5" />
           </svg>
        </div>
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-10 scale-100 md:scale-150 blur-2xl md:blur-3xl w-48 md:w-64 h-48 md:h-64 bg-accent/10 rounded-full animate-float pointer-events-none" />
     </div>
  </header>
);
