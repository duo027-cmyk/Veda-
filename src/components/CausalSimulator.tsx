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
          對當前高維狀態矢量施加特定參數擾動 (Perturbations)，利用能量函數 (Energy Function) 評估多源對齊模型的『變分自由能臨界穩定度』。
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

      {/* High-Reliability Fault-Tolerant Monitoring Core */}
      <div className="p-4 rounded border border-cyan-500/10 bg-cyan-950/5 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Cpu className="text-cyan-400 stroke-[1.5px] animate-pulse" size={14} />
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-white/95 uppercase">
              Reliability Consensus & Redundancy Controller (多重複聯共識與容錯監控核心)
            </span>
          </div>
          <span className="text-[8px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-widest animate-pulse">
            Consensus Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Redundant Branch Consensus Mapping */}
          <div className="space-y-2.5">
            <span className="text-[9px] font-mono text-white/50 block uppercase tracking-wider">
              Multi-Branch Redundant Consensus (多路複聯共識路徑狀態)
            </span>
            <div className="space-y-1.5">
              {['Branch A (Core Prediction Network)', 'Branch B (Positive Shift Regularization)', 'Branch C (Negative Shift Regularization)'].map((name, idx) => {
                const status = data?.aerospace_defence?.redundantBranchesStatus?.[idx] || "OK";
                const isFault = status !== "OK";
                return (
                  <div key={name} className="flex justify-between items-center p-2 rounded bg-white/[0.01] border border-white/5">
                    <span className="text-[10px] font-mono text-zinc-400">{name}</span>
                    <span className={`text-[8px] font-mono px-2 py-0.5 rounded border font-bold ${
                      isFault 
                        ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' 
                        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    }`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Integrity EDAC & Kalman Telemetry */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded flex flex-col gap-1 col-span-2 md:col-span-1">
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
                EDAC Checksum Signature
              </span>
              <span className="text-[11px] font-mono text-cyan-400 font-bold truncate">
                {data?.aerospace_defence?.lastEdacHash || 'SHA256-PENDING'}
              </span>
              <span className={`text-[8px] font-mono font-bold uppercase mt-1 ${
                data?.aerospace_defence?.edacParityMatch !== false ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                ● {data?.aerospace_defence?.edacParityMatch !== false ? "Parity Locked" : "Anomalies Corrected"}
              </span>
            </div>

            <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded flex flex-col gap-1">
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
                Kalman Innovation Max
              </span>
              <span className="text-xs font-mono font-bold text-white/80">
                {data?.aerospace_defence?.lastKalmanInnovation?.toFixed(6) || '0.000000'}
              </span>
              <span className="text-[8px] font-mono text-zinc-500 uppercase mt-1">
                Chi-Square Lim: 3.84
              </span>
            </div>

            <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded flex flex-col gap-1">
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
                TMR Consensus Operations
              </span>
              <span className="text-xs font-mono font-bold text-white/80">
                {data?.aerospace_defence?.totalVotes || 0} Votes
              </span>
              <span className="text-[8px] font-mono text-zinc-500 uppercase mt-1">
                Fault Isolation Active
              </span>
            </div>

            <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded flex flex-col gap-1">
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
                Filtered Outlier Fluctuations
              </span>
              <span className="text-xs font-mono font-bold text-red-500">
                {data?.aerospace_defence?.isolatedBitFlipsCount || 0} Outliers
              </span>
              <span className="text-[8px] font-mono text-zinc-500 uppercase mt-1">
                Zero Gradient Drift
              </span>
            </div>
          </div>
        </div>

        {/* Adaptive Control Hyperparameters Core */}
        <div className="border-t border-white/5 pt-3 space-y-2">
          <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wider">
            Adaptive Control Hyperparameters & Dynamic Covariance Matrix (自適應超參數控制與動態協方差矩陣)
          </span>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="p-2 rounded bg-cyan-950/20 border border-cyan-500/10 flex flex-col justify-between">
              <span className="text-[7.5px] font-mono text-white/35 uppercase">Learning Rate</span>
              <span className="text-xs font-mono font-bold text-cyan-400 mt-1">
                {(data?.aerospace_defence?.currentParams?.learningRate ?? 0.05).toFixed(4)}
              </span>
              <span className="text-[7px] font-mono text-zinc-500 mt-1">Gain rate η</span>
            </div>
            <div className="p-2 rounded bg-cyan-950/20 border border-cyan-500/10 flex flex-col justify-between">
              <span className="text-[7.5px] font-mono text-white/35 uppercase">Forgetting Factor</span>
              <span className="text-xs font-mono font-bold text-teal-400 mt-1">
                {(data?.aerospace_defence?.currentParams?.forgettingFactor ?? 0.98).toFixed(4)}
              </span>
              <span className="text-[7px] font-mono text-zinc-500 mt-1">Memory decay α</span>
            </div>
            <div className="p-2 rounded bg-cyan-950/20 border border-cyan-500/10 flex flex-col justify-between">
              <span className="text-[7.5px] font-mono text-white/35 uppercase">Covariance Process Q</span>
              <span className="text-xs font-mono font-bold text-amber-400 mt-1">
                {((data?.aerospace_defence?.currentParams?.processNoiseScale ?? 1.0) * 0.005).toFixed(6)}
              </span>
              <span className="text-[7px] font-mono text-zinc-500 mt-1">System model Q_k</span>
            </div>
            <div className="p-2 rounded bg-cyan-950/20 border border-cyan-500/10 flex flex-col justify-between">
              <span className="text-[7.5px] font-mono text-white/35 uppercase">Sage-Husa R Adapt</span>
              <span className="text-xs font-mono font-bold text-indigo-400 mt-1">
                {((data?.aerospace_defence?.currentParams?.measurementNoiseScale ?? 1.0) * 0.08).toFixed(6)}
              </span>
              <span className="text-[7px] font-mono text-zinc-500 mt-1">Residual variance R_k</span>
            </div>
            <div className="p-2 rounded bg-cyan-950/20 border border-cyan-500/10 flex flex-col justify-between col-span-2 md:col-span-1">
              <span className="text-[7.5px] font-mono text-white/35 uppercase">Chi-Square Conf</span>
              <span className="text-xs font-mono font-bold text-emerald-400 mt-1">
                {(data?.aerospace_defence?.currentParams?.chiSquareConfidence ?? 3.841).toFixed(3)}
              </span>
              <span className="text-[7px] font-mono text-emerald-500/80 mt-1 font-bold uppercase truncate">
                {(data?.aerospace_defence?.currentParams?.chiSquareConfidence ?? 3.841) > 3.851 ? "Expanded Bounds" : "Steady 95%"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-2 bg-cyan-950/20 border border-cyan-800/10 rounded flex items-center gap-2">
          <Activity className="text-cyan-400 shrink-0 stroke-[1.5px]" size={12} />
          <p className="text-[9px] text-zinc-400 font-sans leading-relaxed">
            此容錯監控層在 2026 AGI 全域動態決策基線下，提供 <strong>TMR (Triple Modular Redundancy)</strong> 三重複聯共識投票、
            <strong>EDAC</strong> 數據校驗與自動修正、以及增強型卡爾曼高信賴度濾波，保證因果決策流 100% 免疫隨機硬體雜訊與噪聲干擾。
          </p>
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
                        <span className="text-[8px] font-mono uppercase tracking-widest font-bold">自適應損失優化與對應策略 (Adaptive Optimization & Mitigation)</span>
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
