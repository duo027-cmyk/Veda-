import React from 'react';
import { motion } from 'motion/react';
import { Moon } from 'lucide-react';
import { BrainData } from '../types';

interface DreamscapeViewProps {
  userData: BrainData | null;
  t: any;
}

export const DreamscapeView: React.FC<DreamscapeViewProps> = ({ userData, t }) => {
  return (
    <div className="h-full flex items-center justify-center p-20" id="dreamscape-view-container">
      <div className="text-center max-w-2xl px-12 group" id="dreamscape-view-content">
        <div className="relative inline-block" id="dreamscape-moon-wrapper">
          <Moon 
            size={120} 
            className="mx-auto text-white/5 group-hover:text-accent/20 transition-all duration-[3000ms] stroke-[0.3px]" 
            id="dreamscape-moon"
          />
          {userData?.isDreaming && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-accent/10 blur-3xl rounded-full pointer-events-none"
              id="dreamscape-ambient-glow"
            />
          )}
        </div>
        <h2 className="text-hand-serif text-5xl tracking-[0.4em] uppercase mt-12 opacity-40 font-display" id="dreamscape-title">
          {userData?.isDreaming ? t.deep_consensus_dream : t.resting_state}
        </h2>
        <p className="mt-8 font-serif italic text-lg opacity-20 tracking-wide leading-relaxed px-12" id="dreamscape-description">
          {userData?.is_logic_frozen 
            ? t.system_crystallized 
            : userData?.isDreaming 
              ? t.neural_synthesizing 
              : t.neural_optimal
          }
        </p>
        
        {userData?.axioms && userData.axioms.length > 0 && (
          <div className="mt-12 text-left space-y-4 max-h-40 overflow-y-auto scrollbar-none opacity-40 hover:opacity-100 transition-opacity" id="dreamscape-axioms-list">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold/60 text-center" id="dreamscape-axioms-header">Synthesized Axioms</p>
            {userData.axioms.map((a, i) => (
              <div key={`${i}-${a.substring(0, 20)}`} className="text-xs font-serif italic border-gold/20 pl-4 py-1" id={`dreamscape-axiom-item-${i}`}>
                {a}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
