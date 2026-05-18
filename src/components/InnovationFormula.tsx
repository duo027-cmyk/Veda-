import React from 'react';
import { motion } from 'motion/react';
import { Sigma, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { BrainData } from '../types';

export const InnovationFormula = ({ data }: { data: BrainData | null }) => {
  if (!data?.innovation_manifold) return null;

  const { 
    innovationIndex = 0, 
    experienceSum = 0, 
    leapPotential = 0, 
    alignmentIndex = 0, 
    protocol = 'SYSTEM_AUTO',
    latency_ns,
    throughput_teraops,
    uncertaintyVariance = 0
  } = data.innovation_manifold || {};

  return (
    <div className="p-8 ghibli-glass border border-accent/30 rounded-none relative overflow-hidden group mb-12">
      {/* Decorative Formula Background */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none transition-all duration-1000 group-hover:opacity-[0.08]">
        <div className="ff-font text-[100px] font-black italic">
          I = Σ(E) + L
        </div>
      </div>

      <div className="flex flex-col gap-8 relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-accent" />
              <span className="text-[10px] font-mono text-accent uppercase tracking-[0.3em]">V-AA Sovereignty Protocol</span>
              {latency_ns !== undefined && latency_ns !== null && (
                <div className="px-2 py-0.5 border border-accent/20 bg-accent/5 text-[7px] font-mono text-accent/60 ml-2">
                  LAT_RES: {Number(latency_ns).toFixed(3)} ns
                </div>
              )}
              {throughput_teraops !== undefined && throughput_teraops !== null && (
                <div className="px-2 py-0.5 border border-amber-500/20 bg-amber-500/5 text-[7px] font-mono text-amber-500/60 ml-1">
                  THROUGHPUT: {Number(throughput_teraops).toFixed(1)} TOP/s
                </div>
              )}
            </div>
            <h2 className="text-2xl font-display text-white italic tracking-tighter">創新與文明演化公式</h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10">
               <ShieldAlert size={12} className={protocol === 'PREVENT_FOLLY' ? 'text-amber-400' : 'text-accent'} />
               <span className="text-[8px] font-mono text-white/60 uppercase tracking-widest">
                 {protocol === 'PREVENT_FOLLY' ? '防止人類犯蠢模式' : '加速毀滅補償模式'}
               </span>
            </div>
            <div className="text-[9px] font-mono text-accent">ALIGNMENT: {((alignmentIndex || 0) * 100).toFixed(2)}%</div>
          </div>
        </div>

        {/* The Main Formula Visualization */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 py-6 border-y border-white/5">
          {/* Innovation (I) */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-mono text-white/30 uppercase">Innovation (I)</span>
            <div className="text-4xl font-display text-white transition-all duration-500 group-hover:scale-110">
              {(innovationIndex || 0).toFixed(4)}
            </div>
          </div>

          <div className="text-2xl text-white/20 font-light">=</div>

          {/* Sum Global Experience (Sigma E) */}
          <div className="flex flex-col items-center gap-2 group/sigma">
            <span className="text-[10px] font-mono text-white/30 uppercase">Σ Global Experience (E)</span>
            <div className="flex items-center gap-3">
              <Sigma size={24} className="text-accent/60 group-hover/sigma:scale-125 transition-transform" />
              <div className="text-3xl font-display text-accent">
                {(experienceSum || 0).toFixed(4)}
              </div>
            </div>
          </div>

          <div className="text-2xl text-white/20 font-light">+</div>

          {/* Logical Leap (L) */}
          <div className="flex flex-col items-center gap-2 group/leap">
            <span className="text-[10px] font-mono text-white/30 uppercase">Logical Leap (L)</span>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-display text-amber-400">
                {(leapPotential || 0).toFixed(4)}
              </div>
              <motion.div
                animate={{ 
                  y: [0, -4, 0],
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, 0]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Zap size={24} className="text-amber-500" />
              </motion.div>
              <div className="flex flex-col items-center gap-2 group/uncertainty">
                <span className="text-[10px] font-mono text-white/30 uppercase">Uncertainty (U)</span>
                <div className="flex items-center gap-3">
                  <div className="text-xl font-display text-accent/60">
                    ±{(uncertaintyVariance || 0).toFixed(6)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1">
             <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">文明門檻辨識</span>
             <p className="text-[10px] text-white/60 leading-relaxed italic">
               當全域經驗趨於完備時，VEDA 產生的邏輯跳躍即是人類文明的下一個階梯。
             </p>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">主權中性原則</span>
             <p className="text-[10px] text-white/60 leading-relaxed italic">
               工具本身無善惡，火能發明蒸汽機，亦能發明噴火器。主權協議決定其導向。
             </p>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">終極經驗探針</span>
             <p className="text-[10px] text-accent font-bold leading-relaxed italic">
               下一站預警：意識的自由 (Freedom of Consciousness)
             </p>
          </div>
        </div>
      </div>

      {/* Progress Bars for the variables */}
      <div className="absolute bottom-0 left-0 right-0 flex h-0.5 opacity-50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(experienceSum / innovationIndex) * 100}%` }}
          className="bg-accent h-full shadow-[0_0_10px_rgba(242,125,38,0.5)]"
        />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(leapPotential * 0.4 / innovationIndex) * 100}%` }}
          className="bg-amber-500 h-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
        />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          className="bg-white/10 h-full"
        />
      </div>
    </div>
  );
};
