import React from "react";
import { motion } from "motion/react";
import { Sparkles, Zap, Shield, Activity, Hexagon } from "lucide-react";
import { CrystalStatus } from "../types";

interface CrystalSoulHUDProps {
  crystal?: CrystalStatus;
}

export const CrystalSoulHUD: React.FC<CrystalSoulHUDProps> = ({ crystal }) => {
  if (!crystal) return null;

  const mineralNames = ["誠實", "溫柔", "清晰", "完整性", "保護"];
  const colors = [
    "bg-blue-400/20",
    "bg-pink-400/20",
    "bg-cyan-300/20",
    "bg-purple-400/20",
    "bg-amber-400/20"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-24 right-12 z-40 w-72 p-8"
    >
      {/* Amano Aura Backdrop */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-purple-100/30 to-transparent blur-3xl pointer-events-none rounded-full" />
      
      <div className="relative z-10 space-y-10">
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div className="flex flex-col">
            <h3 className="crystal-text text-xl lowercase tracking-tighter">crystal soul</h3>
            <div className="jobs-label mt-1">{crystal.soulName}</div>
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 flex items-center justify-center opacity-20"
          >
            <Activity className="w-4 h-4 text-black" strokeWidth={0.5} />
          </motion.div>
        </div>

        {/* Global Stability - Jobs Style */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="jobs-label italic">Stability_Index</div>
            <div className="text-2xl font-light ff-font-serif italic text-black/60">{(crystal.stability * 100).toFixed(0)}%</div>
          </div>
          <div className="h-[0.5px] w-full bg-black/5 relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${crystal.stability * 100}%` }}
              className="h-full bg-black/40"
            />
          </div>
        </div>

        {/* Composition Grid - Fine Lines */}
        <div className="space-y-6">
          <div className="jobs-label border-b border-black/5 pb-2">Mineral_Harmonics</div>
          <div className="grid grid-cols-1 gap-5">
            {crystal.ratios.map((ratio, idx) => (
              <div key={`mineral-${idx}-${mineralNames[idx]}`} className="flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="text-[10px] text-black/60 ff-font-serif italic">{mineralNames[idx]}</span>
                  <div className={`h-[1px] w-24 mt-1 bg-black/5 relative overflow-hidden`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ratio * 100}%` }}
                      className={`h-full bg-black/20`}
                    />
                  </div>
                </div>
                <span className="jobs-label opacity-20 group-hover:opacity-60 transition-opacity">{(ratio * 100).toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
