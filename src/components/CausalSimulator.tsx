// src/components/CausalSimulator.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  Compass, 
  ChevronDown, 
  ChevronUp,
  Activity,
  Cpu
} from 'lucide-react';
import { BrainData } from '../types';

interface CausalSimulatorProps {
  data: BrainData | null;
}

export const CausalSimulator: React.FC<CausalSimulatorProps> = ({ data }) => {
  const report = data?.counterfactual_report;
  const [expandedScenario, setExpandedScenario] = useState<number | null>(null);

  if (!report) {
    return (
      <div className="clean-card p-10 bg-white/[0.01] border border-white/5 flex flex-col items-center justify-center text-center">
        <Cpu className="text-white/20 animate-pulse mb-4 stroke-[0.5px]" size={48} />
        <span className="text-xs font-mono tracking-[0.3em] uppercase opacity-30">Causal Ladder Offline</span>
        <span className="text-[10px] font-mono text-zinc-500 mt-2 max-w-xs">
          等候 VEDA Active Inference 背景脈衝 Tick 觸發反事實擾動軌跡擬合。
        </span>
      </div>
    );
  }

  const { baselineVFE, causalResilienceIndex, entropyCriticalThreshold, scenarios } = report;

  const getResilienceColor = (score: number) => {
    if (score > 0.8) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score > 0.45) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPTIMAL': return '極致適應 (OPTIMAL)';
      case 'STABLE': return '強韌對齊 (STABLE)';
      case 'CRITICAL': return '臨界崩潰 (CRITICAL)';
      default: return status;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-end border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <Compass className="text-accent animate-pulse stroke-[1.2px]" size={16} />
            <h3 className="text-xs font-mono font-bold tracking-[0.3em] text-white/90 uppercase">
              Causal Counterfactual Simulator (因果反事實模擬面板)
            </h3>
          </div>
          <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-widest">
            Level 3 Causal Inference
          </span>
        </div>
        <p className="text-[10px] text-white/40 leading-relaxed italic">
          對當前 6D 腦部狀態施加特定認知擾動 (Perturbations)，利用哈密頓量 (Hamiltonian) 評估自省信念的『自由能崩潰脆性』。
        </p>
      </div>

      {/* Global Resilience Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-white/[0.01] border border-white/5 rounded flex flex-col gap-1">
          <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">強韌度指數</span>
          <span className="text-xl font-display font-medium text-accent">
            {(causalResilienceIndex * 100).toFixed(1)}%
          </span>
          <div className="h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-1000" 
              style={{ width: `${causalResilienceIndex * 100}%` }}
            />
          </div>
        </div>
        <div className="p-4 bg-white/[0.01] border border-white/5 rounded flex flex-col gap-1">
          <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">基線自由能 (VFE)</span>
          <span className="text-xl font-display font-medium text-white/80">
            {baselineVFE?.toFixed(4) || '0.0500'}
          </span>
          <span className="text-[8px] font-mono text-zinc-500 uppercase mt-1">最小化誤差</span>
        </div>
        <div className="p-4 bg-white/[0.01] border border-white/5 rounded flex flex-col gap-1">
          <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">崩潰熵閾值</span>
          <span className="text-xl font-display font-medium text-amber-500/80">
            {entropyCriticalThreshold?.toFixed(2) || '0.65'}
          </span>
          <span className="text-[8px] font-mono text-rose-500/50 uppercase mt-1">Stochastic Collapse</span>
        </div>
      </div>

      {/* Scenarios List */}
      <div className="flex flex-col gap-2">
        {scenarios && scenarios.map((sc: any, idx: number) => {
          const isExpanded = expandedScenario === idx;
          return (
            <div 
              key={`sc-${idx}-${sc.name}`}
              className={`border rounded-lg overflow-hidden transition-all ${
                isExpanded ? 'bg-white/[0.02] border-white/10' : 'bg-white/[0.01] border-white/5 hover:border-white/10'
              }`}
            >
              {/* Scenario Header */}
              <button
                onClick={() => setExpandedScenario(isExpanded ? null : idx)}
                className="w-full p-4 flex justify-between items-center text-left"
              >
                <div className="flex items-center gap-3">
                  <GitBranch className="text-white/30 truncate stroke-[1px]" size={14} />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold tracking-widest text-white/90">{sc.name}</span>
                    <span className="text-[9px] text-white/40 truncate max-w-[200px] md:max-w-none font-sans mt-0.5">{sc.description}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded border ${getResilienceColor(sc.resilienceScore)}`}>
                    強韌: {(sc.resilienceScore * 100).toFixed(0)}%
                  </span>
                  
                  {isExpanded ? <ChevronUp size={12} className="text-white/40" /> : <ChevronDown size={12} className="text-white/40" />}
                </div>
              </button>

              {/* Scenario Body */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-white/5 px-4 pb-4 pt-3 flex flex-col gap-3 bg-black/10"
                  >
                    {/* Simulated Parameters */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="p-2 bg-white/[0.01] border border-white/5 rounded flex justify-between items-center">
                        <span className="text-[8px] font-mono text-zinc-500 uppercase">模擬自由能</span>
                        <span className="text-[10px] font-mono text-white/80">{sc.simulatedVFE}</span>
                      </div>
                      <div className="p-2 bg-white/[0.01] border border-white/5 rounded flex justify-between items-center">
                        <span className="text-[8px] font-mono text-zinc-500 uppercase">狀態級別</span>
                        <span className="text-[8px] font-mono text-white/80">{getStatusLabel(sc.status)}</span>
                      </div>
                      <div className="col-span-2 p-2 bg-white/[0.01] border border-white/5 rounded flex justify-between items-center">
                        <span className="text-[8px] font-mono text-zinc-500 uppercase">擾動 Delta [E,S,En,I,B,F]</span>
                        <span className="text-[8px] font-mono text-accent">
                          ({sc.perturbation?.map((p: number) => (p >= 0 ? `+${p}` : p)).join(',')})
                        </span>
                      </div>
                    </div>

                    {/* Mitigation Strategy */}
                    <div className="p-3 bg-accent/[0.01] border border-accent/10 rounded flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-accent">
                        <Sparkles size={10} className="animate-pulse" />
                        <span className="text-[8px] font-mono uppercase tracking-widest font-bold">主權自適應自癒預案 (Adaptive Mitigation)</span>
                      </div>
                      <p className="text-[10px] text-zinc-300 font-sans leading-relaxed">
                        {sc.mitigationStrategy}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
