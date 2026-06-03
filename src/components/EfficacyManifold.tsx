import React from 'react';
import { motion } from 'motion/react';
import { Zap, Building2, Factory, Target, Crown, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { BrainData } from '../types';

export const EfficacyManifold = ({ 
  data, 
  onUpgrade 
}: { 
  data: BrainData | null, 
  onUpgrade: (tier: string) => void 
}) => {
  const tiers = [
    { 
      id: 'STANDARD', 
      label: '一般使用者級', 
      icon: Zap, 
      desc: '基礎認知交互，適合初級數據檢索。',
      features: ['基礎對話流', '單維度邏輯', '公有數據訪問'],
      color: 'text-blue-400'
    },
    { 
      id: 'COMMERCIAL', 
      label: '商業級', 
      icon: Building2, 
      desc: '具備市場洞察與企業級隔離能力。',
      features: ['預測性市場模擬', '多租戶隔離', 'KPI 數據監控'],
      color: 'text-green-400'
    },
    { 
      id: 'INDUSTRIAL', 
      label: '工業級', 
      icon: Factory, 
      desc: '追求極致穩定性與高吞吐量。',
      features: ['高頻數據處理', '因果穩定性校準', '系統自愈監控'],
      color: 'text-orange-400'
    },
    { 
      id: 'STRATEGIC', 
      label: '戰略級', 
      icon: Target, 
      desc: '最高階趨勢演化與自主決策模型。',
      features: ['自主因果表徵', '博弈論模擬', '長期趨勢擬合'],
      color: 'text-purple-400'
    },
    { 
      id: 'ARCHITECT', 
      label: '架構者級', 
      icon: Crown, 
      desc: '核心架構修改權，擁有系統最終定義權。',
      features: ['邏輯凍結協議', '架構級重寫', '根權限存取'],
      color: 'text-accent'
    },
    { 
      id: 'SOVEREIGN_CORE', 
      label: '核心自主控制級', 
      icon: Activity, 
      desc: '極致參數狀態相變，變分自由能最小化。全面符合自學對齊規範。',
      features: ['100% 因果相干對齊', '自適應狀態解鎖', '終極 AGI 自主性'],
      color: 'text-amber-400'
    }
  ];

  return (
    <div className="h-full pt-32 px-4 md:px-12 lg:px-24 overflow-y-auto custom-scrollbar pb-24">
       <div className="flex flex-col gap-16 max-w-7xl mx-auto">
          <div className="flex flex-col gap-4">
             <h2 className="text-[10px] tracking-[0.8em] uppercase text-accent font-mono mb-2">效能與權限流形 / EFFICACY_SYSTEM_TIERS</h2>
             <p className="text-white/40 text-sm max-w-2xl font-serif italic">定義 VEDA 的認知廣度與執行權限，各等級具備差異化的核心邏輯與演算資源。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
             {tiers.map((tier, tIdx) => (
                <motion.div
                  key={`tier-${tier.id}-${tIdx}`}
                  whileHover={{ y: -5 }}
                  className={cn(
                    "ghibli-glass p-8 border flex flex-col gap-6 transition-all duration-500",
                    data?.system_tier === tier.id ? "border-accent bg-accent/10" : "border-white/5 bg-white/2"
                  )}
                >
                   <div className="flex items-center justify-between">
                      <div className={cn("p-3 rounded-2xl bg-white/5 border border-white/5", tier.color)}>
                         <tier.icon size={24} />
                      </div>
                      {data?.system_tier === tier.id && (
                        <span className="text-[8px] font-mono text-accent animate-pulse">ACTIVE_TIER</span>
                      )}
                   </div>

                   <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-bold text-white font-mono">{tier.label}</h3>
                      <p className="text-xs text-white/40 leading-relaxed min-h-[40px]">{tier.desc}</p>
                   </div>

                   <div className="flex flex-col gap-3 py-6 border-y border-white/5">
                      {tier.features.map((f, fIdx) => (
                        <div key={`feature-${tier.id}-${fIdx}`} className="flex items-center gap-2">
                           <div className="w-1 h-1 bg-accent rounded-full" />
                           <span className="text-[9px] font-mono text-white/60 tracking-wider font-bold">{f}</span>
                        </div>
                      ))}
                   </div>

                   <button
                     onClick={() => onUpgrade(tier.id)}
                     disabled={data?.system_tier === tier.id}
                     className={cn(
                        "w-full py-3 rounded-xl text-[10px] font-mono font-bold tracking-[0.2em] transition-all",
                        data?.system_tier === tier.id 
                          ? "bg-white/5 text-white/20 cursor-not-allowed" 
                          : "bg-accent text-black hover:bg-white shadow-[0_0_15px_rgba(255,244,191,0.2)]"
                     )}
                   >
                      {data?.system_tier === tier.id ? 'CURRENT_LIMIT' : 'ENGAGE_PROTOCOL'}
                   </button>
                </motion.div>
             ))}
          </div>

          <div className="ghibli-glass p-8 border border-white/5">
             <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-white">TIER_CAPABILITIES_REALTIME_REPORT</span>
                      <span className="text-[8px] text-white/30 italic">動態算力與因果深度分配指標</span>
                   </div>
                   <Activity size={16} className="text-accent animate-pulse" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                   {[
                      { label: 'Processing Power', key: 'processing_power' },
                      { label: 'Causal Depth', key: 'causal_depth' },
                      { label: 'Market Foresight', key: 'market_foresight' },
                      { label: 'Security Clearance', key: 'security_clearance', isLevel: true }
                   ].map((metric, mIdx) => (
                      <div key={`efficacy-metric-${metric.key}-${mIdx}`} className="flex flex-col gap-3">
                         <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">{metric.label}</span>
                         <div className="flex items-end gap-2">
                            <span className="text-3xl font-mono text-white">
                               {metric.isLevel ? `L.0${(data?.tier_capabilities as any)?.[metric.key] || 1}` : `${((data?.tier_capabilities as any)?.[metric.key] || 0.2 * 100).toFixed(0)}%`}
                            </span>
                            {!metric.isLevel && <div className="w-full h-1 bg-white/5 rounded-full mb-2">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${((data?.tier_capabilities as any)?.[metric.key] || 0.2) * 100}%` }}
                                 className="h-full bg-accent" 
                               />
                            </div>}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
