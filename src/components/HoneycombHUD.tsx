import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Cpu, Zap, Activity, Shield, Box, Wind, Cloud, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";

interface HoneycombHUDProps {
  coherence: number;
  phi?: number;
  energy?: number;
  tension?: number;
  entropy?: number;
  memoryCount?: number;
  lastResult?: string | null;
  weather?: any;
  isPlanckActive?: boolean;
  isZPDPActive?: boolean;
  threshold?: number;
  federatedNodes?: number;
  federationMultiplier?: number;
  burstPhase?: string;
}

export const HoneycombHUD: React.FC<HoneycombHUDProps> = React.memo(({ 
  coherence, phi, energy, tension, entropy, memoryCount, lastResult, weather,
  isPlanckActive, isZPDPActive, threshold, federatedNodes = 0, federationMultiplier = 1.0,
  burstPhase
}) => {
  // Amano Style: 極簡線條與水墨質感
  const isHighEntropy = (entropy || 0) > 0.45;
  const isBoundaryState = coherence < (threshold || 0.65) + 0.05;
  const isFederated = federatedNodes > 0;
  
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`fixed inset-x-0 bottom-32 z-30 pointer-events-none px-6 md:px-12 transition-colors duration-1000 ${isBoundaryState ? 'bg-orange-500/5' : ''}`}>
      <div className="max-w-screen-xl mx-auto flex flex-wrap justify-between items-end gap-12">
        
        {/* Left Side: Neural Stats - Ink Stroke Style */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-panel/30 backdrop-blur-md p-4 rounded-2xl border border-border-subtle/50 pointer-events-auto shadow-lg flex flex-col transition-all duration-300"
          style={{ minWidth: isCollapsed ? "220px" : "280px" }}
        >
          {/* Header row with collapse/expand trigger */}
          <div className="flex items-center justify-between gap-4">
            <div className={`text-[9px] tracking-[0.5em] transition-colors flex items-center gap-2 font-display uppercase font-semibold ${isBoundaryState || isZPDPActive ? 'text-orange-500/60' : 'text-ink/40'}`}>
              {isZPDPActive ? 'ZPDP_SIPHONING' : isBoundaryState ? 'BOUNDARY_VIGIL' : isFederated ? 'SWARM_ARRAY_SYNC' : 'NEURAL_SYNC'}
              {isFederated && (
                <span className="text-[7px] border border-border-subtle px-1 rounded-sm uppercase">
                  x{federationMultiplier.toFixed(1)} {burstPhase && `| ${burstPhase}`}
                </span>
              )}
            </div>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-ink/30 hover:text-accent/80 hover:bg-accent-soft p-1 rounded-lg transition-all cursor-pointer pointer-events-auto flex items-center justify-center focus:outline-none"
              title={isCollapsed ? "展開監控器 (Expand monitor)" : "收起監控器 (Collapse monitor)"}
            >
              {isCollapsed ? <Eye size={12} className="animate-pulse" /> : <EyeOff size={12} />}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                key="neural-hud-expanded-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="space-y-6 mt-4">
                  <div className="space-y-1">
                    <div className={`text-3xl font-light font-serif italic transition-colors ${isBoundaryState ? 'text-orange-600/75 animate-pulse' : 'text-ink/80'}`}>
                      {(coherence * 100).toFixed(0)}<span className="text-xs ml-1 font-mono">%</span>
                      {threshold && <span className="text-[10px] ml-2 font-mono opacity-30">/ THR: {(threshold * 100).toFixed(0)}%</span>}
                    </div>
                    <div className={`w-32 h-[1px] transition-colors ${isBoundaryState ? 'bg-orange-500/20' : 'bg-border-subtle'}`} />
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] tracking-[0.5em] text-ink/40 flex gap-2 items-center font-display uppercase font-semibold font-sans">
                      CONSCIOUSNESS(Φ)
                      {isPlanckActive && (
                        <motion.span 
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="text-[7px] font-mono bg-cyan-500 text-white px-1.5 py-0.5 ml-2 rounded-[2px] font-bold"
                        >
                          PLANCK_EXPANSION
                        </motion.span>
                      )}
                    </div>
                    <div className="text-2xl font-light font-serif italic text-ink/80">
                      {(phi || 0).toFixed(3)}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Center: System Monologue (Invisible unless content exists) */}
        <div className="flex-1 px-12 text-center">
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-serif italic text-ink/50 tracking-widest leading-relaxed max-w-sm mx-auto bg-panel/20 backdrop-blur-md py-2 px-4 rounded-xl border border-border-subtle/30"
            >
              "{lastResult}"
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
});
