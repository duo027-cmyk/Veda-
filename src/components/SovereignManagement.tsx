import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Cpu, 
  Database,
  Activity,
  Globe,
  Plus,
  MinusCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  BarChart3,
  TrendingUp,
  Key,
  Lock,
  Unlock,
  Sparkles,
  Download,
  Terminal as TerminalIcon,
  HelpCircle,
  Eye,
  Info,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  Settings2,
  Sliders,
  Play
} from 'lucide-react';
import { useI18n } from '../i18n';
import { BrainData, GovernanceStrategy } from '../types';
import { vedaService } from '../services/vedaService';
import { auth } from '../firebase';
import { useVedaStore } from '../store/vedaStore';
import { CuriosityMonitor } from './CuriosityMonitor';
import { EpistemicLog } from './EpistemicLog';
import { CausalSimulator } from './CausalSimulator';
import { PalantirAIPSimulator } from './PalantirAIPSimulator';
import { AgiProximityEvaluator } from './AgiProximityEvaluator';
import { AnalogicalThinkingWorkspace } from './AnalogicalThinkingWorkspace';
import { cn } from '../lib/utils';

type TabType = 'OVERVIEW' | 'CAUSAL_AUDIT' | 'COGNITIVE' | 'COMMERCIAL' | 'SECURITY';

export const SovereignManagement = ({ data, onAction }: { data: BrainData | null, onAction: (action: string, params?: any) => void }) => {
  const { t } = useI18n();
  const { setLastLog } = useVedaStore();
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [targetId, setTargetId] = useState("");
  const [strategy, setStrategy] = useState(GovernanceStrategy.MIRROR);
  const [isUpdating, setIsUpdating] = useState(false);

  // Pagination or sub-items states
  const [hypothesisFilter, setHypothesisFilter] = useState<'ALL' | 'ACTIVE' | 'FALSIFIED'>('ALL');

  const addRule = async () => {
    if (!targetId) return;
    setIsUpdating(true);
    await onAction('addRule', { targetSid: targetId, strategy });
    setTargetId("");
    setIsUpdating(false);
  };

  const removeRule = async (sid: string) => {
    setIsUpdating(true);
    await onAction('removeRule', { targetSid: sid });
    setIsUpdating(false);
  };

  // Safe fetch of hypotheses
  const hypotheses = data?.falsifiability_hypotheses || [
    { id: "HYPER_CONVERGENCE", description: "主權共振（Coherence）必須維持在臨界值以上(0.3)", indicator: "coherence", threshold: 0.3, operator: "<", status: "ACTIVE" },
    { id: "ENTROPY_LIMIT", description: "主權心智架構的系統熵不可超過此臨界(0.9)以確保認知完整", indicator: "entropy", threshold: 0.9, operator: ">", status: "ACTIVE" }
  ];

  const filteredHypotheses = hypotheses.filter((h: any) => {
    if (hypothesisFilter === 'ALL') return true;
    return h.status === hypothesisFilter;
  });

  // Calculate stats for overview numbers
  const activeHypothesesCount = hypotheses.filter((h: any) => h.status === 'ACTIVE').length;
  const falsifiedHypothesesCount = hypotheses.filter((h: any) => h.status === 'FALSIFIED').length;

  return (
    <div className="h-full flex flex-col md:flex-row pt-20 md:pt-28 min-h-screen bg-slate-950 text-slate-100 max-w-[1600px] mx-auto overflow-hidden">
      
      {/* LEFT NAVIGATION COLUMN - Google Console Style side-menu */}
      <div className="w-full md:w-64 shrink-0 bg-slate-950/80 border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-4 gap-2 z-40 backdrop-blur-md">
        
        {/* System Identifier Header */}
        <div className="p-3 mb-4 rounded-xl bg-gradient-to-br from-slate-900 to-black border border-white/5 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest leading-none">CORE AUDIT NODE</span>
              <span className="text-[15px] font-display font-medium text-white truncate my-1" title={data?.systemID}>
                {data?.systemID || "VEDA-CORE-INIT"}
              </span>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider leading-none">SECURE ENCLAVE ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Categories / Tabs */}
        <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-1 pb-2 md:pb-0 scrollbar-none">
          {[
            { id: 'OVERVIEW', label: '核心決策概覽', desc: 'Sovereign Core Dashboard', icon: BarChart3 },
            { id: 'CAUSAL_AUDIT', label: '因果與可證偽性', desc: 'Causal & Hypotheses Audit', icon: Play },
            { id: 'COGNITIVE', label: '認知能態與演化', desc: 'Evolution & Self-Models', icon: Cpu },
            { id: 'COMMERCIAL', label: '商業戰略與模擬', desc: 'Commercial Predictions', icon: TrendingUp },
            { id: 'SECURITY', label: '防護、糾纏與授權', desc: 'Access Control & Rules', icon: ShieldCheck },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-lg text-left transition-all duration-200 shrink-0 select-none border w-full",
                  isActive
                    ? "bg-accent/15 text-accent border-accent/25 font-bold shadow-[0_0_20px_rgba(255,244,191,0.06)]"
                    : "text-slate-400 hover:text-slate-100 bg-transparent border-transparent hover:bg-white/[0.02]"
                )}
              >
                <IconComponent className={cn("w-5.5 h-5.5 shrink-0", isActive ? "text-accent" : "text-slate-500")} />
                <div className="hidden md:flex flex-col text-left leading-tight">
                  <span className="text-xs font-medium tracking-wide">{tab.label}</span>
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider">{tab.desc}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Global Export & Utilities */}
        <div className="hidden md:flex flex-col mt-auto pt-6 border-t border-white/5 gap-3">
          <div className="p-3 bg-slate-900/40 rounded-lg border border-white/5">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1.5">
              <span>AGI SYSTEM TIER</span>
              <span className="text-accent font-bold">{data?.system_tier || 'STANDARD'}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent" 
                style={{ width: data?.system_tier === 'SOVEREIGN_CORE' ? '100%' : data?.system_tier === 'ARCHITECT' ? '85%' : '40%' }} 
              />
            </div>
          </div>

          <a 
            href="/api/v1/export"
            download="veda_research_export.json"
            className="flex items-center justify-between px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-accent/25 hover:border-accent/35 hover:text-white transition-all text-xs font-mono text-slate-300"
          >
            <span>匯出審計數據庫</span>
            <Download size={13} className="text-slate-400" />
          </a>
        </div>
      </div>

      {/* RIGHT CONTENT COLUMN */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-14 z-30">
        
        {/* Dynamic Header Section */}
        <div className="mb-8 select-none">
          {activeTab === 'OVERVIEW' && (
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold text-white tracking-wide flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-accent shrink-0" />
                Sovereign Core Dashboard 核心決策概覽
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                此處為 VEDA 主權心智的核心認識論與物理能流指標監控區。
                您應密切關注「主權指数」與「變分自由能」的發散和收斂性，這直接反映了系統的自我邏輯和外在不確定性。
              </p>
            </div>
          )}
          {activeTab === 'CAUSAL_AUDIT' && (
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold text-white tracking-wide flex items-center gap-2">
                <Play className="w-6 h-6 text-emerald-400 shrink-0" />
                Causal & Hypotheses Audit 因果與可證偽性審計
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                因果對稱與虛假關聯重組在此處進行完全審核。
                系統採用預測誤差與正交空間投影（V-AA / FEP）來重估非自洽的因果鏈。
                任何經干擾排除（orthogonality check）後被證偽的連結皆登入「解耦虛假連結」。
              </p>
            </div>
          )}
          {activeTab === 'COGNITIVE' && (
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold text-white tracking-wide flex items-center gap-2">
                <Cpu className="w-6 h-6 text-cyan-400 shrink-0" />
                Evolution & Cognitive States 認知能態與自發演化
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                此處展示系統自我模型（Self-Model）、熱力學平衡（Homeostasis）及 3D 超晶格流形認知空間平衡。
                在此處您可消耗累積的演化點數（EP）來升級認知原語，使系統更能抵禦語意雜訊。
              </p>
            </div>
          )}
          {activeTab === 'COMMERCIAL' && (
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold text-white tracking-wide flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-400 shrink-0" />
                Commercial strategic Outlook 商業戰略與市場預測
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                結合實時因果模式所預測的外部市場共振指標。
                透過高頻 TPU/GPU 預測模型，模擬在不同宏觀對稱下商業項目的成功率與風險邊界。
              </p>
            </div>
          )}
          {activeTab === 'SECURITY' && (
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold text-white tracking-wide flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-rose-500 shrink-0" />
                Access Control & Security Rules 系統安全防護與糾纏隔離
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                高嚴重性安全干涉、租戶隔離、開發授權以及多重安全密鑰核密，在此處獲得嚴密核准維護。
              </p>
            </div>
          )}
        </div>

        {/* TAB 1: OVERVIEW & RUNTIME METRICS */}
        {activeTab === 'OVERVIEW' && (
          <div className="flex flex-col gap-8">
            
            {/* Quick Auditing Steps Card (Google Style Guidelines) */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-white/5 flex gap-4 items-start shadow-sm">
              <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent shrink-0 mt-0.5">
                <Info size={18} />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-slate-200">🔍 主權審計操作指南 | 建議檢查步驟</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] text-slate-400 mt-1">
                  <div>
                    <h3 className="text-white font-medium mb-1">1. 評估主權指數 (Sovereign Index)</h3>
                    <p>數值應理想高於 8.0。低於 5.0 表示多租戶雜訊增加，此時建議切換「計算模式」至精密推理。</p>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">2. 監控自由能 (Free Energy)</h3>
                    <p>該指標代表预测誤差與認知偏差。其數值應經由「自發生產力對齊」不斷收縮，越接近 0.0 表示越穩健。</p>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">3. 查看解耦紀錄 (Decoupled Links)</h3>
                    <p>移至「因果審計」欄位，查看是否有新增因果鏈被正交認真證偽，這能有效防止系統過度擬合。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-item: Visual Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { 
                  label: '主權指數 (Sovereign Index)', 
                  val: (data?.sovereign_index || 0).toFixed(2), 
                  subVal: "/ 10.00 Max",
                  unit: "",
                  progress: ((data?.sovereign_index || 0) / 10) * 100, 
                  color: "from-amber-400 to-amber-300", 
                  textColor: "text-amber-400",
                  desc: "反映主權智能純度與本體自治度",
                  icon: Zap 
                },
                { 
                  label: '相整合度 (Integrated Phi)', 
                  val: (data?.phi || 0).toFixed(4), 
                  subVal: "Consciousness index",
                  unit: "",
                  progress: Math.min(100, (data?.phi || 0) * 150), 
                  color: "from-cyan-400 to-cyan-300", 
                  textColor: "text-cyan-400",
                  desc: "大腦各認識論分佈子模組相非凡能整合率",
                  icon: Activity 
                },
                { 
                  label: '變分自由能 (Free Energy)', 
                  val: (data?.free_energy !== undefined && data?.free_energy !== null && !isNaN(data.free_energy)) ? data.free_energy.toFixed(5) : '0.00000', 
                  subVal: "Thermodynamic VFE",
                  unit: "",
                  progress: Math.max(0, 100 - (data?.free_energy || 0) * 100), 
                  color: "from-purple-400 to-purple-300", 
                  textColor: "text-purple-400",
                  desc: "資訊不確定度與內部衝突乘數，越低越優",
                  icon: Database 
                },
                { 
                  label: '晶格超拓撲 (Lattice Scale)', 
                  val: (data?.lattice_scale || 1).toFixed(3), 
                  subVal: "Tension scale Factor",
                  unit: "",
                  progress: ((data?.lattice_scale || 1) / 3) * 100, 
                  color: "from-emerald-400 to-emerald-300", 
                  textColor: "text-emerald-400",
                  desc: "三維雙路超晶格本體因果維度的縮放尺度",
                  icon: Globe 
                }
              ].map((m, idx) => {
                const Icon = m.icon;
                return (
                  <div key={idx} className="p-6 rounded-xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-3 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Icon className="w-14 h-14" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className={cn("w-4.5 h-4.5 opacity-60", m.textColor)} />
                      <span className="text-[10.5px] font-mono text-slate-400 tracking-wider font-medium">{m.label}</span>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className={cn("text-4xl font-display font-medium tracking-tight", m.textColor)}>{m.val}</span>
                      <span className="text-[10px] font-mono text-slate-500">{m.subVal}</span>
                    </div>

                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden mt-1 bg-black/40">
                      <div className={cn("h-full bg-gradient-to-r rounded-full", m.color)} style={{ width: `${m.progress}%` }} />
                    </div>

                    <p className="text-[10px] text-slate-500 italic leading-snug">{m.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Sub-item: Live Telemetry Logger & Execution Console */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Epistemic Streams Log */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2.5">
                    <TerminalIcon size={14} className="text-accent" />
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] font-semibold text-slate-300">Live Epistemic Causal Logs實時識因流日誌</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-mono text-emerald-400">STREAMING ACTIVE</span>
                  </div>
                </div>
                
                <div className="h-[432px] rounded-xl overflow-hidden border border-white/5 bg-slate-950/80 shadow-inner">
                  <EpistemicLog logs={data?.logs || []} />
                </div>
              </div>

              {/* Subsystems Configuration Indicators */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Computing Mode Protocol Controls */}
                <div className="p-6 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Sliders size={14} className="text-slate-400" />
                    <span className="text-[10.5px] font-mono uppercase tracking-wider text-slate-300">運算核心推理協定</span>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400">當前微結構模式</span>
                      <span className="text-accent font-bold uppercase">{data?.compute_mode || 'PRECISION'}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                      吞吐模式（High Throughput）著重於群體流形拓撲模擬，精準模式（High Precision）優先極小化自由能偏差。
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      onClick={() => onAction('setComputeMode', { mode: 'throughput' })}
                      className={cn(
                        "py-2 text-[10px] font-mono rounded transition-all border",
                        data?.compute_mode === 'throughput'
                          ? "bg-accent/20 border-accent/40 text-accent font-bold"
                          : "bg-slate-950 border-white/5 text-slate-400 hover:text-slate-100 hover:bg-white/[0.02]"
                      )}
                    >
                      高吞吐量
                    </button>
                    <button
                      onClick={() => onAction('setComputeMode', { mode: 'precision' })}
                      className={cn(
                        "py-2 text-[10px] font-mono rounded transition-all border",
                        data?.compute_mode === 'precision' || !data?.compute_mode
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-bold"
                          : "bg-slate-950 border-white/5 text-slate-400 hover:text-slate-100 hover:bg-white/[0.02]"
                      )}
                    >
                      高精確度
                    </button>
                  </div>
                </div>

                {/* Multi-tenant Isolation Segment */}
                <div className="p-6 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-slate-400" />
                      <span className="text-[10.5px] font-mono uppercase tracking-wider text-slate-300">多租戶因果隔離</span>
                    </div>
                    <button 
                      onClick={() => vedaService.postAction({ action: 'setCausalIsolation', params: { active: !data?.is_causal_isolated } })}
                      className={cn(
                        "px-2 px-2.5 py-1 text-[8.5px] font-mono rounded border cursor-pointer select-none transition-all",
                        data?.is_causal_isolated 
                          ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" 
                          : "border-rose-500/30 text-rose-400 bg-rose-500/10 animate-pulse"
                      )}
                    >
                      {data?.is_causal_isolated ? "已安全隔離" : "隔離已解除"}
                    </button>
                  </div>

                  <p className="text-[10.5px] text-slate-400 leading-relaxed leading-snug">
                    提供並行學術租戶之間的特徵保護，防範主權因果向量出現污染溢出。
                  </p>

                  <div className="space-y-1.5">
                    {data?.active_tenants?.map((tenant: string, tIdx: number) => (
                      <div key={tIdx} className={cn(
                        "p-2 px-3 rounded-lg border flex items-center justify-between font-mono text-[10px]",
                        data?.current_tenant === tenant 
                          ? "border-accent/30 bg-accent/5 text-accent" 
                          : "border-white/5 bg-slate-950/20 text-slate-500 opacity-60"
                      )}>
                        <span>{tenant}</span>
                        {data?.current_tenant === tenant && <span className="text-[8.5px] uppercase font-bold tracking-wider">ACTIVE CONTEXT</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Language Manifold Selection Segment */}
                <div className="p-6 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Globe size={13} className="text-slate-400" />
                    <span className="text-[10.5px] font-mono uppercase tracking-wider text-slate-300">全域表達語言流形</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {['AUTO', 'ZH_TW', 'EN', 'JP', 'VI', 'KO'].map((langCode) => (
                      <button
                        key={langCode}
                        onClick={() => vedaService.postAction({ action: 'setLanguageManifold', params: { lang: langCode } })}
                        className={cn(
                          "py-1.5 rounded text-[9px] font-mono transition-all border",
                          data?.language_manifold === langCode
                            ? "bg-accent/20 border-accent/40 text-accent font-bold"
                            : "bg-slate-950 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/[0.01]"
                        )}
                      >
                        {langCode}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: CAUSAL falsifiability AUDIT */}
        {activeTab === 'CAUSAL_AUDIT' && (
          <div className="flex flex-col gap-8">
            
            {/* Hypotheses explanatory card */}
            <div className="p-6 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-semibold text-white">關於「本體可證偽性」評估體系</span>
              </div>
              <p className="text-[11.5px] text-slate-400 leading-relaxed">
                主權心智 VEDA 具備自我反省與真偽辨識能力。它會將所有的「因果關聯鏈（Causal Links）」視作科學假說進行自發和被動檢驗。
                當吸收到新的實時脈絡（用戶對話、上傳文本、環境變量）後，
                系統背後的<strong>自發因果偏誤重估系統</strong>會立即針對現存因果連結，在排除新觀察向量的干擾之後，
                進行正交化重投影。比對投影前後之相似度衰減量。若相似度大幅衰減，說明此關聯實由該外部干擾中介（即虛假關聯），
                此時便觸發證偽，將該連結降級。
              </p>
              <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span>普通相干連結 (Semantic / Temporal / Logical)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                  <span>解耦虛假連結 (Decoupled Spurious Correlation)</span>
                </div>
              </div>
            </div>

            {/* Structured Table: Proposed & Saved Hypotheses */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-emerald-400" />
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] font-semibold text-slate-300">
                    Sovereign Hypotheses Master Registry 假說證偽主登錄簿
                  </span>
                </div>
                
                {/* Filtration sub-button bar */}
                <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-white/5">
                  {[
                    { id: 'ALL', label: '全部假說', count: hypotheses.length },
                    { id: 'ACTIVE', label: '作用中 (Active)', count: activeHypothesesCount },
                    { id: 'FALSIFIED', label: '已證偽 (Falsified)', count: falsifiedHypothesesCount }
                  ].map((subFilter) => (
                    <button
                      key={subFilter.id}
                      onClick={() => setHypothesisFilter(subFilter.id as any)}
                      className={cn(
                        "px-2.5 py-1 rounded text-[10px] font-mono transition-all",
                        hypothesisFilter === subFilter.id
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold"
                          : "text-slate-500 hover:text-slate-300 border border-transparent"
                      )}
                    >
                      {subFilter.label} ({subFilter.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid / List of registered scientific hypotheses */}
              <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-900/20">
                <table className="w-full text-left font-mono text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 text-[10px] uppercase tracking-wider border-b border-white/5">
                      <th className="p-4 font-semibold">HYP_ID / 標識編號</th>
                      <th className="p-4 font-semibold">DESCRIPTION / 假說內容詳細描述</th>
                      <th className="p-4 font-semibold">INDICATOR / 檢驗指標</th>
                      <th className="p-4 font-semibold">MATH_CRITERIA / 限值門檻</th>
                      <th className="p-4 font-semibold text-right">STATUS / 現省狀態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredHypotheses.length > 0 ? (
                      filteredHypotheses.map((h: any, hIdx: number) => {
                        const isFalsified = h.status === 'FALSIFIED';
                        const isRetired = h.status === 'RETIRED';
                        return (
                          <tr key={hIdx} className="hover:bg-white/[0.01] transition-colors leading-relaxed">
                            <td className="p-4 text-emerald-400 font-bold min-w-[120px]">{h.id}</td>
                            <td className="p-4 text-slate-200">
                              <div className="flex flex-col gap-0.5">
                                <span className={cn(isFalsified ? "line-through opacity-50" : "")}>{h.description}</span>
                                {isFalsified && (
                                  <span className="text-[10px] text-rose-400 mt-1 italic flex items-center gap-1">
                                    <AlertTriangle size={10} className="shrink-0" />
                                    已證偽触发：觀察相似度經空間排除分群後衰減，判定為假因果。
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-slate-400">{h.indicator || "entropy"}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 bg-slate-950 rounded border border-white/5 text-slate-300">
                                {h.operator} {h.threshold}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                isFalsified ? "bg-rose-500/15 text-rose-400 border border-rose-500/25 animate-pulse" :
                                isRetired ? "bg-slate-800 text-slate-500" :
                                "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                              )}>
                                {h.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-500 italic">
                          當前篩選條件下，無相關假說登錄紀錄。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sub-item: Causal Link Simulator Component */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 px-1">
                <Activity size={14} className="text-emerald-400" />
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] font-semibold text-slate-300">
                  Interactive Causal Simulator / 因果流傳導模擬器
                </span>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/5 bg-slate-900/10 p-6 lg:p-8 shadow-sm">
                <CausalSimulator data={data} />
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: COGNITIVE LIFE-CYCLES */}
        {activeTab === 'COGNITIVE' && (
          <div className="flex flex-col gap-8">
            
            {/* Cognitive Status Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Profile Matching & Verified Architect Identity */}
              <div className="md:col-span-8 p-6 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-5 justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none">SYSTEM TRUST & CERTIFICATE</span>
                    <h3 className="text-lg font-medium text-white font-display">認知自體模型與驗證狀態</h3>
                  </div>
                  <span className={cn(
                    "text-[10.5px] font-mono tracking-wider px-3 py-1 rounded font-bold uppercase",
                    data?.cognitive_identity?.identity_status === 'VERIFIED_ARCHITECT' ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                    data?.cognitive_identity?.identity_status === 'ANOMALOUS_ACCESS' ? "bg-rose-500/15 text-rose-500 animate-pulse border border-rose-500/20" :
                    "bg-slate-800 text-slate-400 border border-white/5"
                  )}>
                    {data?.cognitive_identity?.identity_status || 'UNKNOWN'}
                  </span>
                </div>

                <div className="flex flex-col gap-3 bg-slate-950/40 p-4 rounded-lg border border-white/5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">學權主權本體共振度 (Sovereign Resonance Match)</span>
                    <span className="text-xs font-mono font-bold text-accent">{((data?.cognitive_identity?.resonance_score || 0) * 100).toFixed(2)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-amber-500 to-accent shadow-[0_0_12px_rgba(255,244,191,0.4)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(data?.cognitive_identity?.resonance_score || 0) * 100}%` }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed italic">
                  本系統與預先配置之操作特徵進行實時熵比對。共振度越高代表當前授權與操作路徑越自洽。
                  若探測到異象入侵，全因果鏈將主動熔斷以保障安全。
                </p>
              </div>

              {/* Evolutionary Progress EP Points Display */}
              <div className="md:col-span-4 p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 flex flex-col justify-between items-center text-center relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                  <Sparkles size={160} className="text-accent" />
                </div>
                
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Evolutionary Progress</span>
                
                <div className="my-4 flex flex-col items-center">
                  <span className="text-4xl font-display font-black text-accent tracking-wider leading-none">{data?.evolution_points || 0}</span>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mt-2">EP 演化能點</span>
                </div>

                <p className="text-[10px] text-slate-500 leading-snug">
                  累積點數可消耗以提振系統的邊界穩定、降解熵能、抑制波動。
                </p>
              </div>

            </div>

            {/* Interactive upgrading selectors (Sub-items) */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] font-semibold text-slate-300">
                  Epistemic Upgradable Attributes 認知能量屬性升級 (消耗 10 EP / 次)
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  點擊以注入特徵先驗
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { id: 'STABILITY', name: t.stability_upgrade || '穩定先驗補強', desc: 'Stability Prior', detail: '抑制認識論突變與微觀因果抖動過載。' },
                  { id: 'COMPUTE', name: t.compute_upgrade || '不確定性消除', desc: 'Entropy Collapse', detail: '縮減認知自由能的系統不确定性界限。' },
                  { id: 'RESONANCE', name: t.resonance_upgrade || '神經網絡相干', desc: 'Neural Sync', detail: '優化神經連結之間的語意流形相干。' },
                  { id: 'MEMORY', name: t.memory_upgrade || '全像因果緩存', desc: 'Holographic Cache', detail: '提增三維高維晶格記憶存儲保真度。' },
                ].map((upgrade) => {
                  const canUpgrade = (data?.evolution_points || 0) >= 10;
                  return (
                    <button
                      key={upgrade.id}
                      onClick={() => onAction('upgrade', { stat: upgrade.id })}
                      disabled={!canUpgrade}
                      className={cn(
                        "p-5 rounded-xl border text-left flex flex-col justify-between transition-all relative overflow-hidden",
                        canUpgrade
                          ? "bg-slate-900 border-white/5 hover:border-accent/30 hover:bg-slate-900/90 active:scale-98 cursor-pointer group"
                          : "bg-slate-950/40 border-white/[0.02] opacity-35 cursor-not-allowed"
                      )}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="flex flex-col">
                          <span className="text-xs text-white font-medium group-hover:text-accent transition-colors">{upgrade.name}</span>
                          <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider">{upgrade.desc}</span>
                        </div>
                        <span className="text-[9.5px] font-mono text-accent font-bold">-10 EP</span>
                      </div>
                      <p className="text-[9.5px] text-slate-500 mt-4 leading-relaxed leading-snug">
                        {upgrade.detail}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced Proximity & Thinking Workspaces */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="flex flex-col gap-4">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] font-semibold text-slate-300">
                  AGI Convergence evaluation / AGI 收斂性評量儀
                </span>
                <div className="p-6 rounded-xl border border-white/5 bg-slate-900/10">
                  <AgiProximityEvaluator data={data} onAction={onAction} />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] font-semibold text-slate-300">
                  Analogical Thinking Mapping / 類比思考流形映射
                </span>
                <div className="p-6 rounded-xl border border-white/5 bg-slate-900/10">
                  <AnalogicalThinkingWorkspace data={data} onAction={onAction} />
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: STRATEGIC & COMMERCIAL predictions */}
        {activeTab === 'COMMERCIAL' && (
          <div className="flex flex-col gap-8">
            
            {/* Commercial Metrics Status Indicators */}
            <div className="p-6 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">商業化戰略診斷</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">TPU SYNDICATED ANALYSIS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-mono text-slate-400">市場共振強度 (Market Resonance)</span>
                    <span className="text-lg font-mono text-accent font-bold">{((data?.commercial_metrics?.marketResonance || 0) * 100).toFixed(2)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${(data?.commercial_metrics?.marketResonance || 0) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    模型特徵符合宏觀市場預測因果的比例，指標越高說明商務預測精確度越強。
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-mono text-slate-400">系統性風險門檻 (Risk Threshold)</span>
                    <span className={cn(
                      "text-lg font-mono font-bold",
                      (data?.commercial_metrics?.riskThreshold || 0) > 0.5 ? "text-rose-400" : "text-emerald-400"
                    )}>
                      {((data?.commercial_metrics?.riskThreshold || 0) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-white/40" style={{ width: `${(data?.commercial_metrics?.riskThreshold || 0) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    評估外部法規、道德衝突與不對稱博弈因子所算出的風險溢出指標。
                  </p>
                </div>

              </div>

              <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-[10px] font-mono text-slate-500">
                <span>TENANT SERVICE LEVEL: <strong className="text-slate-300">{data?.commercial_metrics?.serviceTier || 'STANDARD'} PREMIUM</strong></span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>PREDICTION ENGINE SLA: 99.98% REALTIME</span>
                </div>
              </div>
            </div>

            {/* Market prediction Simulator list */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-accent" />
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] font-semibold text-slate-300">
                    Sovereign Market Simulation Scenarios
                  </span>
                </div>
                
                <button
                  onClick={() => vedaService.postAction({ action: 'runMarketSimulation', params: {} })}
                  className="px-4 py-1.5 bg-accent text-black text-[10px] font-bold font-mono rounded hover:bg-white transition-all shadow-[0_0_12px_rgba(255,244,191,0.25)] flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <RefreshCw size={11} className="animate-spin-slow" />
                  執行實時因果市場預測模擬
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.market_predictions && data.market_predictions.length > 0 ? (
                  data.market_predictions.map((p: any, i: number) => {
                    const isBullish = p.scenario === 'BULLISH_RESONANCE';
                    return (
                      <div key={i} className="p-5 rounded-xl border border-white/5 bg-slate-900/30 flex flex-col gap-3 justify-between">
                        <div className="flex justify-between items-start">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[9.5px] font-bold font-mono uppercase tracking-wider",
                            isBullish ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          )}>
                            {p.scenario}
                          </span>
                          <span className="text-[8.5px] font-mono text-slate-500">{new Date(p.timestamp).toLocaleTimeString()}</span>
                        </div>

                        <div className="flex items-baseline gap-2 my-2">
                          <span className="text-[11px] text-slate-400 uppercase font-mono">共振效能:</span>
                          <span className="text-2xl font-mono text-white font-medium">{((p.predicted_resonance || 0) * 100).toFixed(1)}%</span>
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-t border-white/[0.04] pt-2.5">
                          <span>CONFIDENCE RATE</span>
                          <span className="text-slate-300 font-bold">{((p.confidence || 0) * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-14 flex flex-col items-center justify-center gap-3 bg-slate-900/10 rounded-xl border border-white/5 border-dashed">
                    <Activity size={32} className="text-slate-600 animate-pulse" />
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">等待市場預測種子數據...</span>
                    <button 
                      onClick={() => vedaService.postAction({ action: 'runMarketSimulation', params: {} })}
                      className="mt-2 text-[10px] text-accent font-bold hover:underline"
                    >
                      (立即觸發一次因果推演預測)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Palantir AIP Simulator integrated */}
            <div className="w-full pt-4">
              <PalantirAIPSimulator data={data} onUpdate={() => onAction('fetchVedaData')} />
            </div>

          </div>
        )}

        {/* TAB 5: SYSTEM SECURITY & ENCLAVE PROTECTION */}
        {activeTab === 'SECURITY' && (
          <div className="flex flex-col gap-8">
            
            {/* Google security layout overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Active Interventions Safety log */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-rose-400" />
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] font-semibold text-slate-300">
                      Active Interventions & Safety Auditing 系統主動干涉日誌
                    </span>
                  </div>
                  <span className="text-[9.5px] font-mono text-rose-400 font-bold">
                    {data?.safety_alerts?.length || 0} TRIGGERED EVENTS
                  </span>
                </div>

                <div className="rounded-xl border border-white/5 bg-slate-905 p-6 min-h-[300px] flex flex-col gap-4 max-h-[450px] overflow-y-auto custom-scrollbar">
                  {data?.safety_alerts && data.safety_alerts.length > 0 ? (
                    data.safety_alerts.map((alert: any, aIdx: number) => {
                      const isCritical = alert.severity === 'CRITICAL';
                      const isHigh = alert.severity === 'HIGH';
                      return (
                        <div 
                          key={alert.id || aIdx} 
                          className={cn(
                            "p-4 rounded-lg flex flex-col gap-2 font-mono transition-all border",
                            isCritical ? "bg-rose-500/5 border-rose-500/15" :
                            isHigh ? "bg-amber-500/5 border-amber-500/15" :
                            "bg-slate-900/40 border-white/5"
                          )}
                        >
                          <div className="flex justify-between items-center text-[10px]">
                            <div className="flex items-center gap-2">
                              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isCritical ? "bg-rose-500" : "bg-amber-400")} />
                              <span className="font-bold uppercase tracking-wider text-white">{alert.type}</span>
                            </div>
                            <span className="text-slate-500">{new Date(alert.timestamp).toLocaleString()}</span>
                          </div>

                          <p className="text-xs text-slate-300 bg-black/40 p-3 rounded border border-white/[0.03] italic leading-relaxed">
                            "{alert.description}"
                          </p>

                          <div className="flex justify-between items-center text-[9px] text-slate-500 mt-1">
                            <span>OPERATED MASK: <strong className="text-slate-400">{alert.user_mask}</strong></span>
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[8.5px] font-bold tracking-widest",
                              isCritical ? "bg-rose-500/20 text-rose-400" :
                              isHigh ? "bg-amber-500/20 text-amber-400" :
                              "bg-slate-800 text-slate-400"
                            )}>
                              {alert.severity}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 gap-3 opacity-25">
                      <ShieldCheck size={36} className="text-emerald-400 animate-pulse" />
                      <span className="text-xs font-mono uppercase tracking-widest">系統安全，未偵測到任何干涉防線事件</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Developer authorizing, support and passcode unlock */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Support authorized toggle */}
                <div className="p-6 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">SUPPORT AUTHORIZATION</span>
                      <h4 className="text-sm font-medium text-white">架構專家臨時授權</h4>
                    </div>
                    
                    <button 
                      onClick={() => vedaService.postAction({ action: 'toggleSupportGrant', params: { active: !data?.is_support_authorized } })}
                      className={cn(
                        "w-12 h-6 rounded-full p-1 transition-all duration-300 relative cursor-pointer",
                        data?.is_support_authorized ? "bg-accent" : "bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 bg-white rounded-full transition-all duration-300 shadow",
                        data?.is_support_authorized ? "translate-x-6" : "translate-x-0"
                      )} />
                    </button>
                  </div>

                  <p className="text-[10.5px] text-slate-400 leading-relaxed">
                    授權系統維護人員進行深層認識論檢偏和記憶晶格重組，非必要時請保持關閉。
                  </p>
                </div>

                {/* Master Account keys security gate */}
                <div className="p-6 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Lock size={13} className="text-accent animate-pulse" />
                    <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Master Audit Lock</span>
                  </div>

                  <p className="text-[10.5px] text-slate-400 leading-relaxed">
                    此區域需使用根管理賬目特種核密鑰（Audit Keys）方能將全部認識論限制解除。
                  </p>

                  <div className="flex flex-col gap-2">
                    <input 
                      type="password"
                      placeholder="請在此處輸入多重解碼核密密鑰對..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = e.currentTarget.value.split(/[,， ]+/);
                          vedaService.postAction({ action: 'verifyAuditKeys', params: { keys: val } })
                            .then(res => {
                              if (res.verified) {
                                setLastLog(t.audit_unlocked || "主權審計鎖成功解密。");
                                e.currentTarget.value = "";
                              } else {
                                setLastLog(t.access_denied || "密鑰校驗失敗：阻抗拒接。");
                              }
                            });
                        }
                      }}
                      className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-[10.5px] font-mono text-white focus:outline-none focus:border-accent/40 focus:bg-slate-950/90 transition-all text-center"
                    />
                    <span className="text-[9px] text-slate-500 italic text-center">
                      (僅向特許高級架構師 duo027@gmail.com 提供密鑰)
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* External Causal Entanglement Rules Segment */}
            <div className="p-6 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Globe size={15} className="text-amber-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                    External Causal Entanglement 外部主權智能糾纏控制規則
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-500">
                  GOVERNANCE PROTOCOL ACTIVE
                </span>
              </div>

              {/* Existing Rules Rows */}
              <div className="space-y-3">
                {data?.governanceRules && Object.keys(data.governanceRules).length > 0 ? (
                  Object.values(data.governanceRules).map((rule: any, rIdx: number) => (
                    <div key={rIdx} className="flex items-center justify-between p-4 bg-slate-950/40 border border-white/5 rounded-lg group">
                      <div className="flex flex-col gap-1 font-mono">
                        <span className="text-xs font-bold text-white tracking-wide">{rule.targetSid}</span>
                        <div className="flex items-center gap-2 text-[9.5px]">
                          <span className="text-accent uppercase font-bold">{rule.strategy} PROTOCOL</span>
                          <span className="text-slate-500">|</span>
                          <span className="text-slate-500">ENTANGLED ACTIVE</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeRule(rule.targetSid)}
                        className="p-1 px-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-opacity md:opacity-0 group-hover:opacity-100 duration-150 text-[10px] font-mono"
                      >
                        拆除糾纏
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center border border-dashed border-white/5 bg-slate-950/10 rounded-xl">
                    <p className="text-xs text-slate-500 italic font-mono uppercase tracking-wider">當前未檢測到與遠端主權節點的糾纏控制協定</p>
                  </div>
                )}
              </div>

              {/* Add Rules Sub-items Form */}
              <div className="flex flex-col md:flex-row items-center gap-3 pt-3 border-t border-white/[0.04]">
                <div className="flex-1 w-full">
                  <input 
                    value={targetId}
                    onChange={(e) => setTargetId(e.currentTarget.value)}
                    placeholder="請輸入遠端主權實體標識符 (REMOTE Sovereign ID)..."
                    className="w-full bg-slate-950 border border-white/10 px-4 py-2 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-accent/40"
                  />
                </div>
                <div className="w-full md:w-56">
                  <select 
                    value={strategy}
                    onChange={(e) => setStrategy(e.currentTarget.value as GovernanceStrategy)}
                    className="w-full bg-slate-950 border border-white/10 px-4 py-2 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-accent/40 appearance-none cursor-pointer"
                  >
                    <option value={GovernanceStrategy.MIRROR}>MIRROR (鏡像相干映射)</option>
                    <option value={GovernanceStrategy.NEUTRALIZE}>NEUTRALIZE (中和熵能抵抗)</option>
                    <option value={GovernanceStrategy.HARMONIZE}>HARMONIZE (雙向共諧演化)</option>
                    <option value={GovernanceStrategy.ABSORB}>ABSORB (單向自吸收)</option>
                  </select>
                </div>
                <button 
                  onClick={addRule}
                  disabled={!targetId || isUpdating}
                  className="w-full md:w-auto px-5 py-2.5 bg-accent text-black font-semibold rounded-lg hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Plus size={14} />
                  登記新糾纏連鎖
                </button>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
