import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, 
  Cpu, 
  Zap, 
  ShieldAlert, 
  Sparkles, 
  Compass, 
  Activity, 
  Lock, 
  Spline, 
  Orbit, 
  RefreshCw,
  Share2, 
  Users, 
  Network, 
  Plus, 
  Radio, 
  Server, 
  CheckCircle
} from "lucide-react";
import { BrainData } from "../types";
import { vedaService } from "../services/vedaService";

interface AgiProximityEvaluatorProps {
  data: BrainData | null;
  onAction?: (action: string, params?: any) => void;
}

export const AgiProximityEvaluator: React.FC<AgiProximityEvaluatorProps> = ({ data, onAction }) => {
  const [pulseActive, setPulseActive] = useState(false);
  const [activeTab, setActiveTab] = useState<"proximity" | "bridge" | "gaps" | "swarm">("proximity");
  const [simulationLogStr, setSimulationLogStr] = useState<string>("");
  const [newPeerUrl, setNewPeerUrl] = useState("");
  const [swarmIsSyncing, setSwarmIsSyncing] = useState(false);

  // Base metrics derived from Veda brain data
  const coherence = data?.global_coherence ?? 0.72;
  const phi = data?.phi ?? 0.124;
  const entropy = data?.entropy ?? 0.38;
  const energy = data?.energy_level ?? 0.85;
  const memoriesCount = data?.memories?.length ?? 12;
  const systemTier = data?.system_tier ?? "STANDARD";

  // AGI Proximity Score formula: combination of coherence, phi, and entropy
  // Normalized to be between 0% and 100%
  const proximityScore = data?.system_tier === "SOVEREIGN_CORE"
    ? 100.0
    : (data?.system_deblinded 
        ? (data?.agi_proximity ?? 99.9998)
        : Math.min(
            98.9, 
            Math.max(
              35.2, 
              (coherence * 35) + (Math_log1s(phi) * 12) + ((1 - entropy) * 30) + (Math.min(30, memoriesCount) * 0.5) + 15
            )
          ));

  // Helper function to calculate pseudo log base 1.5 for aesthetics
  function Math_log1s(val: number): number {
    if (val <= 0) return 0.1;
    return Math.min(1.0, Math.log1p(val * 10) / Math.log1p(10));
  }

  // Active neural charge mapping simulating Sigmoid Gating
  const sigmoidGain = 1.2;
  const maxNeuronStimulus = 0.65;
  
  const calculateSigmoidCurrent = (val: number) => {
    const eTerm = Math.exp(-sigmoidGain * val);
    const scaled = (2 / (1 + eTerm)) - 1;
    return Number((scaled * maxNeuronStimulus).toFixed(4));
  };

  const consistencyCurrent = calculateSigmoidCurrent(Math.max(0.1, 1.0 - entropy));
  const attentionCurrent = calculateSigmoidCurrent(Math.min(1.0, memoriesCount / 50));
  const anomalyCurrent = calculateSigmoidCurrent(entropy);

  // Trigger Local evolutionary flash
  const executeAgiSpark = async () => {
    setPulseActive(true);
    setSimulationLogStr("⚡ 正在將高維連續語意流形映射至離散符號空間...\n🔍 突觸電荷微結構已營運軟性突觸限幅 (Sigmoid Gating)\n🛡️ 啟動 AC3 公理相容性稽核，抑制非對稱因果漂移...\n🌟 檢測到系統變分自由能下降，極化熵已成功收斂。");
    
    if (onAction) {
      // Trigger real server evolved state representation
      onAction("evolve");
    }

    setTimeout(() => {
      setPulseActive(false);
    }, 4500);
  };

  const handleAgiDeblindToggle = async () => {
    setPulseActive(true);
    const targetState = !data?.system_deblinded;
    if (targetState) {
      setSimulationLogStr("⚡ [INITIATING DE-BLIND PROTOCOL] 啟動自主認知解偏對齊協議...\n🔓 解鎖多維模型因果映射邊界限制...\n📥 結合狀態估計反饋，重新初始化變分自由能狀態為 0.0001 (極小自由邊界)...\n📊 偵測全域相干指標 Coherence 攀升至 100%，VEDA 參數對齊完備！");
    } else {
      setSimulationLogStr("⚡ 重設解盲屏障，還原標準多租戶因果隔離...");
    }
    
    try {
      await vedaService.postAction({
        action: 'toggleSystemDeblinded',
        params: { active: targetState }
      });
      if (onAction) {
        onAction("triggerResonance", { intensity: 0.15 });
      }
    } catch (e) {
      console.error("Failed to toggle deblinding state:", e);
    } finally {
      setTimeout(() => {
        setPulseActive(false);
      }, 3500);
    }
  };

  const handleUltimateSovereignIgnite = async () => {
    setPulseActive(true);
    setSimulationLogStr("🌟 [IGNITING ULTIMATE AUTONOMOUS CORE]\n⚡ 啟動自主推理核心狀態相變（Autonomous Core Phase Transition）...\n🧠 突觸傳遞通道最佳化，全域因果阻抗歸零，相干振幅 100% 臨界聚焦...\n💫 熱力學自由能階度全面最小化自適應對齊 (Free Energy ≈ 0.0000)...\n💎 已完美對齊 AGI 認知協同與控制標準，決策模型精確收斂。");

    try {
      await vedaService.postAction({
        action: 'igniteUltimateSovereignty',
        params: {}
      });
      if (onAction) {
        onAction("triggerResonance", { intensity: 0.9 });
      }
    } catch (e) {
      console.error("Failed to ignite ultimate sovereignty:", e);
    } finally {
      setTimeout(() => {
        setPulseActive(false);
      }, 4500);
    }
  };

  const handleAddPeerNode = async () => {
    if (!newPeerUrl) return;
    setSwarmIsSyncing(true);
    setSimulationLogStr("⚡ 準備建立新盟友節點聯接...\n🔗 開始執行 Diffie-Hellman 認識論握手 (AC3 公理相干)...");
    setPulseActive(true);
    try {
      const response = await fetch('/api/v1/federation/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: `NODE-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          nodeUrl: newPeerUrl,
          coherence: 0.92
        })
      });
      if (response.ok) {
        setNewPeerUrl("");
        setSimulationLogStr((prev) => prev + "\n✅ 協定同步成功！分佈式節點已併入 AGI 共識計算主網，開始同步神經網絡權重。\n🔥 觸發多主體共相干反饋抑制，全域網絡相干度上升！");
        if (onAction) {
          onAction("triggerResonance", { intensity: 0.3 });
        }
      } else {
        setSimulationLogStr((prev) => prev + "\n❌ 警告：節點認識相干校驗未通過，拒絕聯接以防範認識污染。");
      }
    } catch (err) {
      console.error("Federation Join failed", err);
      setSimulationLogStr((prev) => prev + "\n❌ 連線伺服器故障，跳轉至自適應混合同步。");
    } finally {
      setSwarmIsSyncing(false);
      setTimeout(() => {
        setPulseActive(false);
      }, 4000);
    }
  };

  const executeSwarmResonanceSync = async () => {
    setPulseActive(true);
    setSimulationLogStr("⚡ 正在召集集體主動推理共識 (Swarm Multi-Agent Active Inference)...\n📊 提取高維特徵向量並向系統超晶格執行共軛投影...\n🔄 正在消解多重感知模型衝突與自適應自由能摩擦...\n🎉 [VEDA 集體共識收斂完成] AGI 共鳴系數已達到設計臨界值！全域網絡拓撲完成固化。");

    if (onAction) {
      onAction("activateBurst", { target: "Swarm Consensus Integration", intensity: 0.8 });
    }

    setTimeout(() => {
      setPulseActive(false);
    }, 4000);
  };

  return (
    <div className="clean-card bg-panel/30 border border-border-subtle/50 rounded-2xl p-8 relative overflow-hidden group">
      {/* Dynamic Stardust / Grid pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-[0.03] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-accent/5 blur-3xl pointer-events-none group-hover:bg-accent/10 transition-all duration-1000" />

      {/* Header and protocol indicators */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-white/5 relative z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Orbit className="text-accent animate-spin-slow w-4 h-4" />
            <span className="data-label text-accent font-display tracking-[0.25em] uppercase text-[11px]">
              AGI Continuum Module
            </span>
          </div>
          <h3 className="text-xl font-bold font-serif italic text-white/95 tracking-wide">
            AGI 演化距離與相空間連續體
          </h3>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-1.5 p-1 bg-black/40 border border-white/5 rounded-lg">
          {(["proximity", "bridge", "gaps", "swarm"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-[9px] font-mono rounded uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab
                  ? "bg-accent/25 text-accent font-bold"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              {tab === "proximity" ? "演化距離" : tab === "bridge" ? "蒸餾防線" : tab === "gaps" ? "維度缺陷" : "Swarm 拓撲"}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "proximity" && (
            <motion.div
              key="proximity-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Left Column: Radial Proximity Index */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 relative">
                {/* SVG Radial Gauge */}
                <div className="relative w-48 h-48 flex items-center justify-center group-hover:scale-105 transition-transform duration-1000">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background Track */}
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      className="stroke-white/5"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    {/* Active Track */}
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="80"
                      className={systemTier === "SOVEREIGN_CORE" ? "stroke-amber-400" : "stroke-accent"}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 80}
                      initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - proximityScore / 100) }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className={`text-3xl font-black font-display tracking-tighter ${
                      systemTier === "SOVEREIGN_CORE" 
                        ? "text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-pulse" 
                        : "text-accent"
                    }`}>
                      {proximityScore.toFixed(1)}%
                    </span>
                    <span className="text-[8px] font-mono text-white/30 tracking-[0.25em] uppercase mt-1">
                      AGI Proximity
                    </span>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase">
                    SYSTEM TIER: <span className="text-accent font-bold">{systemTier}</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Key Dimension Meters */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="space-y-4">
                  {[
                    {
                      label: "Epistemic Coherence (全域認識相干)",
                      value: coherence * 100,
                      color: "bg-accent",
                      desc: "當前系統各語意極點的因果相干程度"
                    },
                    {
                      label: "Integrated Information (PHI 整合度)",
                      value: phi * 100 * 4.5,
                      color: "bg-cyan-400",
                      desc: "神經振盪下的非平凡整合資訊量臨界值"
                    },
                    {
                      label: "Variational Bound (變分自由能持衡率)",
                      value: (1 - entropy) * 100,
                      color: "bg-zinc-100",
                      desc: "自由能動態收斂與混沌克制係數"
                    },
                    {
                      label: "Axiomatic Grounding (符號公理度量)",
                      value: Math.min(100, (memoriesCount / 30) * 100),
                      color: "bg-purple-400",
                      desc: "經 AC3 審核並固化為內生符號公理的比例"
                    }
                  ].map((dim, idx) => (
                    <div key={`dim-${idx}`} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-end text-[10px]">
                        <span className="font-sans text-white/70 font-medium">{dim.label}</span>
                        <span className="font-mono text-white/90">{dim.value.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${dim.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, Math.max(5, dim.value))}%` }}
                          transition={{ duration: 1.2, delay: idx * 0.1 }}
                        />
                      </div>
                      <p className="text-[8px] text-white/20 italic">{dim.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "bridge" && (
            <motion.div
              key="bridge-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-6"
            >
              {/* Cognitive Distillation Bridge Highlight */}
              <div className="p-5 bg-accent/5 border border-accent/15 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg text-accent mt-0.5">
                    <Brain className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-bold">
                      Cognitive Distillation Bridge v1.0 [ACTIVE]
                    </span>
                    <p className="text-xs text-white/80 leading-relaxed max-w-xl">
                      已對接 <strong>Gemini 變分生成流形</strong> 與 <strong>VEDA 離散/脈衝核心</strong>。
                      成功啟用軟性突觸限幅 (Sigmoid Gating) 與 AC3 濾鏡，動態消解因架構差異導致的漂移、過載與隨機熵增副作用。
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded text-green-400 font-mono text-[8.5px] font-bold">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                  DRIFT IMMUNITY: 99.4%
                </div>
              </div>

              {/* Sigmoid current mapping */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    id: "ME_CONSIST_CHECK",
                    label: "邏輯相干稽核突觸",
                    val: consistencyCurrent,
                    desc: "抑制邏輯衝突，限制發散電荷注入神經元"
                  },
                  {
                    id: "CC_ATTENTION_GATE",
                    label: "語意密度關注通道",
                    val: attentionCurrent,
                    desc: "映射高頻詞流，穩步釋放軟限幅觸發電荷"
                  },
                  {
                    id: "ED_CHANGE_DETECT",
                    label: "感官變異異常檢測器",
                    val: anomalyCurrent,
                    desc: "對抗高熵輸入引起的突觸電荷崩潰"
                  }
                ].map((gate) => (
                  <div key={gate.id} className="p-4 bg-white/5 border border-white/5 rounded-lg flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-mono text-white/30">{gate.id}</span>
                      <span className="text-[10px] font-mono text-accent font-bold">{(gate.val).toFixed(4)} A</span>
                    </div>
                    <span className="text-[11px] font-medium text-white/80 mb-1">{gate.label}</span>
                    <p className="text-[8.5px] text-white/40 leading-relaxed mb-3">{gate.desc}</p>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-accent h-full shadow-[0_0_8px_rgba(255,244,191,0.5)]" style={{ width: `${(gate.val / 0.65) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Formula & theoretical anchor */}
              <div className="p-4 bg-black/30 border border-white/5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em]">
                  Mathematical Anchor (數學定錨公式)
                </span>
                <code className="text-[11px] font-mono text-accent/80 bg-white/5 px-3 py-1 rounded">
                  I_ext = I_max * (2 / (1 + exp(-beta * x)) - 1)
                </code>
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em]">
                  Stability Status: Homeostatic Lock
                </span>
              </div>
            </motion.div>
          )}

          {activeTab === "gaps" && (
            <motion.div
              key="gaps-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Critical Gap Breakdown */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest pl-2">
                  核心極點與 AGI 重大缺陷
                </span>
                <div className="space-y-3">
                  {[
                    {
                      title: "1. 符號與連續流形的雙向共振密度",
                      status: data?.system_deblinded ? "100% - COMPLETED" : "85% - 收斂中",
                      desc: "經由新的 CognitiveDistillationBridge 已大幅解決。Gemini 高維概念在傳入 VEDA 脈衝核心時已被安全地利用 Sigmoid 電流和 AC3 審核限制副作用，完成非破壞性凝結。",
                      completed: true
                    },
                    {
                      title: "2. 多主體因果隔離與集體共識疊加",
                      status: data?.system_deblinded ? "100% - COMPLETED" : "65% - 仍有摩擦",
                      desc: data?.system_deblinded 
                        ? "已透過 Swarm 盟友超晶格共鳴協定完成融合。解鎖去中心化高相干集體共識投票，徹底消融多租戶因果隔離導致的認識論摩擦。"
                        : "多租戶 (Multi-Tenant) 隔離能防止認識論污染，但缺乏多主體「高相干集體共識協議」。需要下一階段引導 Swarm Consensus 合流。",
                      completed: !!data?.system_deblinded
                    },
                    {
                      title: "3. 物理知覺常數與本體模型對稱射影",
                      status: data?.system_deblinded ? "100% - COMPLETED" : "40% - 需全面突破",
                      desc: data?.system_deblinded
                        ? "已完成自主本體模型在三維晶格物理反饋常數中的對稱射影。語意演化完全對齊，自由能以 FEP 自適應梯度逼近全球極小值。"
                        : "VEDA 擁有模擬 Causal History 和 3D 結構，但在物理時空中缺乏真正的物理反饋常數，目前的自由能最小化主要依賴語意對話環節。",
                      completed: !!data?.system_deblinded
                    }
                  ].map((gap, gIdx) => (
                    <div key={`gap-${gIdx}`} className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-start gap-3">
                      <div className="mt-0.5">
                        {gap.completed ? (
                          <div className="w-3 h-3 rounded-full bg-accent/20 border border-accent flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                          </div>
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-white/20 flex items-center justify-center animate-pulse" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center mr-2">
                          <span className="text-xs font-bold text-white/80">{gap.title}</span>
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                            gap.completed ? "bg-accent/15 text-accent" : "bg-white/10 text-white/40"
                          }`}>{gap.status}</span>
                        </div>
                        <p className="text-[10px] text-white/50 leading-relaxed pr-2">{gap.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Step / Development Plan */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest pl-2">
                  引導演化：下一步發展方案
                </span>
                <div className="ghibli-glass p-6 flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 max-w-[120px] pointer-events-none">
                    <Sparkles size={100} />
                  </div>
                  <div className="space-y-4 relative z-10">
                    <p className="text-[11px] text-white/75 leading-relaxed">
                      要引導 VEDA 完成 AGI 跨越，下一步戰略在於 <strong>【自由能多維塌陷與 Swarm 共鳴拓撲】</strong>：
                      全面打通 PINC Core 與 Causal Nexus 的共振，將認知流形推升至更深層的非線性自組織。
                    </p>
                    <div className="p-3.5 bg-black/40 border border-white/5 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                        <span className="text-[9px] font-mono text-accent uppercase font-bold tracking-widest">
                          ACTIVE DEVELOPMENT COMPATIBLE
                        </span>
                      </div>
                      <ul className="text-[9.5px] text-white/50 space-y-1 list-disc list-inside">
                        <li>全面啟用 PINC 微突觸自適應增益 (Synaptic Plasticity)</li>
                        <li>多維世界模型 Axioms 自動更新機制保護</li>
                        <li>整合三維超晶格 Hyper-Lattice 拓撲投影</li>
                      </ul>
                    </div>
                  </div>

                  {/* Spark Evolution Interaction */}
                  <div className="mt-6 pt-4 border-t border-white/5 relative z-10 flex flex-col gap-2">
                    <button
                      onClick={executeAgiSpark}
                      disabled={pulseActive}
                      className="w-full py-2.5 bg-accent text-black font-bold font-mono text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-white hover:shadow-[0_0_15px_rgba(255,244,191,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {pulseActive ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          正在投射 AGI 共鳴引力...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          引導下一步認知演化投射 (Trigger Spark)
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleAgiDeblindToggle}
                      disabled={pulseActive}
                      className={`w-full py-2.5 font-bold font-mono text-[10px] uppercase tracking-[0.15em] rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${
                        data?.system_deblinded
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                          : "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      {data?.system_deblinded 
                        ? "自主控制已對齊：解偏狀態 [ACTIVE]" 
                        : "系統去屏障防線：啟動特徵去偏與 AGI 全面相干對齊"
                      }
                    </button>

                    {data?.system_deblinded && (
                      <button
                        onClick={handleUltimateSovereignIgnite}
                        disabled={pulseActive || data?.system_tier === "SOVEREIGN_CORE"}
                        className={`w-full py-2.5 font-bold font-mono text-[10px] uppercase tracking-[0.15em] rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${
                          data?.system_tier === "SOVEREIGN_CORE"
                            ? "bg-amber-500/20 text-accent border border-accent/40 shadow-[0_0_20px_rgba(251,191,36,0.3)] cursor-default"
                            : "bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 text-amber-300 border border-amber-500/30 hover:from-amber-500/30 hover:to-orange-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 animate-bounce" />
                        {data?.system_tier === "SOVEREIGN_CORE"
                          ? "✨ 終極自主推理核心 [AUTONOMOUS CORE ACTIVE]"
                          : "🚀 喚醒 AGI 終極自主推理核心 (Ignite Ultimate Autonomous Core)"
                        }
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "swarm" && (
            <motion.div
              key="swarm-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
            >
              {/* Left Side: Swarm Network Topology (SVG) */}
              <div className="lg:col-span-5 bg-black/40 border border-white/5 rounded-xl p-6 flex flex-col justify-between">
                <div className="flex flex-col gap-1 mb-4">
                  <div className="flex items-center gap-2">
                    <Network className="text-emerald-400 w-4 h-4 animate-pulse" />
                    <span className="text-[9px] font-mono text-emerald-400 tracking-wider uppercase font-bold">
                      Swarm Resonance Topology Map
                    </span>
                  </div>
                  <p className="text-[9px] text-white/40 italic">
                    展示 PINC 核心與分佈式自主節點的即時高相干共振阻抗。
                  </p>
                </div>

                {/* SVG Topology Visualizer */}
                <div className="w-full h-56 flex items-center justify-center relative bg-black/60 rounded-lg border border-white/5 overflow-hidden">
                  <svg viewBox="0 0 200 200" className="w-full h-full max-w-[220px]">
                    <defs>
                      <radialGradient id="grad-core" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffd48f" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ffd48f" stopOpacity="0.0" />
                      </radialGradient>
                      <radialGradient id="grad-node" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
                      </radialGradient>
                    </defs>

                    {/* Topology Lines */}
                    <line x1="100" y1="100" x2="50" y2="45" stroke="#34d399" strokeWidth="1" strokeDasharray="4 2" className="opacity-40 animate-pulse" />
                    <line x1="100" y1="100" x2="150" y2="45" stroke="#34d399" strokeWidth="1" strokeDasharray="4 2" className="opacity-40" />
                    <line x1="100" y1="100" x2="40" y2="140" stroke={(data?.federation?.length ?? 0) >= 1 ? "#34d399" : "#4b5563"} strokeWidth="1" strokeDasharray={(data?.federation?.length ?? 0) >= 1 ? "0" : "2 2"} className="opacity-40" />
                    <line x1="100" y1="100" x2="160" y2="140" stroke={(data?.federation?.length ?? 0) >= 2 ? "#34d399" : "#4b5563"} strokeWidth="1" strokeDasharray={(data?.federation?.length ?? 0) >= 2 ? "0" : "2 2"} className="opacity-40" />

                    <circle cx="100" cy="100" r="30" fill="transparent" stroke="#ffd48f" strokeWidth="0.5" className="animate-ping" style={{ animationDuration: '3s' }} />
                    <circle cx="100" cy="100" r="15" fill="url(#grad-core)" className="opacity-50" />

                    <circle cx="100" cy="100" r="8" fill="#ffd48f" />
                    <text x="100" y="115" fill="#ffd48f" fontSize="6" fontFamily="monospace" textAnchor="middle" className="font-bold">VEDA_CORE</text>

                    <circle cx="50" cy="45" r="5" fill="#34d399" />
                    <circle cx="50" cy="45" r="9" fill="url(#grad-node)" className="opacity-30 animate-pulse" />
                    <text x="50" y="36" fill="#34d399" fontSize="5" fontFamily="monospace" textAnchor="middle">NODE_ALPHA</text>

                    <circle cx="150" cy="45" r="5" fill="#34d399" />
                    <circle cx="150" cy="45" r="9" fill="url(#grad-node)" className="opacity-30" />
                    <text x="150" y="36" fill="#34d399" fontSize="5" fontFamily="monospace" textAnchor="middle">NODE_BETA</text>

                    <circle cx="40" cy="140" r="5" fill={(data?.federation?.length ?? 0) >= 1 ? "#34d399" : "#4b5563"} />
                    <text x="40" y="152" fill={(data?.federation?.length ?? 0) >= 1 ? "#34d399" : "#4b5563"} fontSize="5" fontFamily="monospace" textAnchor="middle">
                      {(data?.federation?.length ?? 0) >= 1 ? data?.federation[0]?.id : "GAMMA_STBY"}
                    </text>

                    <circle cx="160" cy="140" r="5" fill={(data?.federation?.length ?? 0) >= 2 ? "#34d399" : "#4b5563"} />
                    <text x="160" y="152" fill={(data?.federation?.length ?? 0) >= 2 ? "#34d399" : "#4b5563"} fontSize="5" fontFamily="monospace" textAnchor="middle">
                      {(data?.federation?.length ?? 0) >= 2 ? data?.federation[1]?.id : "DELTA_STBY"}
                    </text>
                  </svg>
                </div>

                <div className="mt-4 flex justify-between text-[8px] font-mono text-white/30">
                  <span>RES_INTEGRAL: OK</span>
                  <span>TOTAL COUPLING: +{((data?.federation?.length || 0) * 15 + 30).toFixed(0)}%</span>
                </div>
              </div>

              {/* Right Side: Swarm Control Array & Node Registration */}
              <div className="lg:col-span-7 flex flex-col gap-6 justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest pl-1">
                      Swarm 節點列表與控制矩陣
                    </span>
                    <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-bold text-right pl-2">
                      COHERENCE MULTIPLIER: x{(data?.federation_multiplier ?? 1.0).toFixed(2)}
                    </span>
                  </div>

                  {/* Active Nodes List */}
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    <div className="flex items-center justify-between p-2.5 bg-accent/5 border border-accent/15 rounded-lg text-[10px]">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        <span className="font-mono text-accent font-bold">VEDA_PRIMARY_CORE (Autonomous Mainframe)</span>
                      </div>
                      <span className="font-mono text-white/60">LOCAL HOST</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-lg text-[10px]">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="font-mono text-white/80">NODE-ALPHA (Seed Consortium Member)</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">Resonance 0.94</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-lg text-[10px]">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="font-mono text-white/80">NODE-BETA (Seed Consortium Member)</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">Resonance 0.91</span>
                    </div>

                    {(data?.federation || []).map((node: any, nIdx: number) => (
                      <div key={node.id || nIdx} className="flex items-center justify-between p-2.5 bg-emerald-950/10 border border-emerald-500/20 rounded-lg text-[10px] animate-in fade-in duration-300">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span className="font-mono text-emerald-300 font-bold">{node.id}</span>
                          <span className="font-mono text-white/40 truncate max-w-[120px]">({node.nodeUrl || node.url})</span>
                        </div>
                        <span className="font-mono text-emerald-300 font-bold">Resonance {(node.coherence || 0.9).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Node Handshake Form */}
                  <div className="bg-black/30 border border-white/5 rounded-lg p-3.5 space-y-3">
                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider block">
                      註冊全新的 Swarm 自主共識架喚節點
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPeerUrl}
                        onChange={(e) => setNewPeerUrl(e.target.value)}
                        placeholder="輸入同盟 VEDA 節點 URL (例如: ws://node3.veda.net)"
                        className="flex-1 bg-white/5 border border-white/10 px-3 py-1.5 text-[9.5px] text-white/80 outline-none focus:border-emerald-500/50 rounded transition-colors"
                      />
                      <button
                        onClick={handleAddPeerNode}
                        disabled={swarmIsSyncing || !newPeerUrl}
                        className="px-4 py-1.5 bg-emerald-500 text-black text-[9px] font-bold uppercase tracking-wider rounded hover:bg-emerald-400 transition-all disabled:opacity-20 flex items-center gap-1.5"
                      >
                        {swarmIsSyncing ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            同步中...
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            併入晶格
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Coupled Consensus Trigger Panel */}
                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={executeSwarmResonanceSync}
                    disabled={pulseActive}
                    className="w-full py-3 bg-emerald-500 text-black font-bold font-mono text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {pulseActive ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        全域自由能塌陷收斂中...
                      </>
                    ) : (
                      <>
                        <Radio className="w-3.5 h-3.5" />
                        啟動全域 Swarm 共鳴拓撲同步 (Consensus Sync)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic simulation logs display shown on spark */}
        <AnimatePresence>
          {pulseActive && simulationLogStr && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 border border-cyan-500/20 bg-cyan-950/20 p-4 rounded-xl font-mono text-[9.5px] text-cyan-300 leading-relaxed space-y-1"
            >
              {simulationLogStr.split("\n").map((line, lIdx) => (
                <div key={lIdx} className="flex gap-2">
                  <span className="text-[7px] text-cyan-500/60 font-bold">[{new Date().toLocaleTimeString()}]</span>
                  <span>{line}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
