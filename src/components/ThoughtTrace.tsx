import React from 'react';
import { motion } from 'motion/react';
import { useI18n } from '../i18n';

export const ThoughtTrace = ({ trace }: { trace: { step: string; axiom?: string; coherence?: number }[] }) => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-4 mt-6 border-l border-accent/20 pl-6 py-2">
      {trace.map((item, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.2 }}
          className="flex flex-col gap-1"
        >
          <div className="flex items-center gap-3">
             <div className="w-1 h-1 rounded-full bg-accent/40" />
             <span className="text-[9px] tracking-[0.2em] font-display uppercase text-accent/60">{item.step}</span>
             {item.coherence && (
               <span className="text-[8px] font-mono text-white/10">[{item.coherence.toFixed(3)}]</span>
             )}
          </div>
          {item.axiom && (
            <p className="text-[10px] font-serif italic text-gold/40 pl-4 leading-relaxed">
              {t.call_axiom}: {item.axiom}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
};
