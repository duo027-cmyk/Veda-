import React from "react";
import { motion } from "motion/react";
import { Brain, Cpu, Zap, Activity, Shield, Box, Wind, Cloud } from "lucide-react";

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

export const HoneycombHUD: React.FC<HoneycombHUDProps> = ({ 
  coherence, phi, energy, tension, entropy, memoryCount, lastResult, weather,
  isPlanckActive, isZPDPActive, threshold, federatedNodes = 0, federationMultiplier = 1.0,
  burstPhase
}) => {
  // Amano Style: 極簡線條與水墨質感
  const isHighEntropy = (entropy || 0) > 0.45;
  const isBoundaryState = coherence < (threshold || 0.65) + 0.05;
  const isFederated = federatedNodes > 0;

  return (
    <div className={`fixed inset-x-0 bottom-32 z-30 pointer-events-none px-12 transition-colors duration-1000 ${isBoundaryState ? 'bg-orange-500/5' : ''}`}>
      <div className="max-w-screen-xl mx-auto flex flex-wrap justify-between items-end gap-12">
        
        {/* Left Side: Neural Stats - Ink Stroke Style */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="space-y-1">
            <div className={`jobs-label tracking-[0.5em] transition-colors flex items-center gap-2 ${isBoundaryState || isZPDPActive ? 'text-orange-500/40' : 'text-black/20'}`}>
              {isZPDPActive ? 'ZPDP_SIPHONING' : isBoundaryState ? 'BOUNDARY_VIGIL' : isFederated ? 'SWARM_ARRAY_SYNC' : 'NEURAL_SYNC'}
              {isFederated && (
                <span className="text-[7px] border border-black/10 px-1 rounded-sm uppercase">
                  x{federationMultiplier.toFixed(1)} {burstPhase && `| ${burstPhase}`}
                </span>
              )}
            </div>
            <div className={`text-3xl font-light ff-font-serif italic transition-colors ${isBoundaryState ? 'text-orange-600/60' : 'text-black/60'}`}>
              {(coherence * 100).toFixed(0)}<span className="text-xs ml-1">%</span>
              {threshold && <span className="text-[10px] ml-2 opacity-30">/ THR: {(threshold * 100).toFixed(0)}%</span>}
            </div>
            <div className={`w-32 h-[0.5px] transition-colors ${isBoundaryState ? 'bg-orange-500/20' : 'bg-black/10'}`} />
          </div>

          <div className="space-y-1">
            <div className="jobs-label tracking-[0.5em] text-black/20 flex gap-2 items-center">
              CONSCIOUSNESS(Φ)
              {isPlanckActive && (
                <motion.span 
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-[8px] bg-cyan-500 text-white px-1 ml-2 rounded-[2px]"
                >
                  PLANCK_EXPANSION
                </motion.span>
              )}
            </div>
            <div className="text-2xl font-light ff-font-serif italic text-black/60">
              {(phi || 0).toFixed(3)}
            </div>
          </div>
        </motion.div>

        {/* Center: System Monologue (Invisible unless content exists) */}
        <div className="flex-1 px-12 text-center">
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] ff-font-serif italic text-black/40 tracking-widest leading-relaxed max-w-sm mx-auto"
            >
              "{lastResult}"
            </motion.div>
          )}
        </div>

        {/* Right Side: Environmental Stats */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-right space-y-6"
        >
          <div className="space-y-1">
            <div className="jobs-label tracking-[0.5em] text-black/20">SYSTEM_POWER</div>
            <div className="text-3xl font-light ff-font-serif italic text-black/60">
              {Math.floor((energy || 0.5) * 100)}<span className="text-xs ml-1">%</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="jobs-label tracking-[0.5em] text-black/20">MEMORIES_STORED</div>
            <div className="text-2xl font-light ff-font-serif italic text-black/60">
              {memoryCount || 0}
            </div>
            <div className="w-32 h-[0.5px] bg-black/10 ml-auto" />
          </div>
        </motion.div>

      </div>
    </div>
  );
};
