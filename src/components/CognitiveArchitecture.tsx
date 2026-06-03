import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, 
  Volume2, 
  FileText, 
  Database, 
  Network, 
  Play, 
  Cpu, 
  HelpCircle, 
  Sparkles,
  GitMerge, 
  RefreshCw, 
  AlertTriangle, 
  Shield, 
  Zap,
  Bookmark,
  Activity,
  Layers,
  CheckCircle,
  TrendingUp,
  Brain,
  Sliders,
  Terminal as TermIcon
} from 'lucide-react';
import { useI18n } from '../i18n';
import { useVedaStore } from '../store/vedaStore';
import { cn } from '../lib/utils';

interface SubsystemDetail {
  id: string;
  title: string;
  enTitle: string;
  concept: string;
  theory: string;
  metrics: string[];
  vedaValue: string | number;
  status: 'ONLINE' | 'STANDBY' | 'PULSING';
}

export const CognitiveArchitecture: React.FC = () => {
  const { t } = useI18n();
  const { userData, handleAction, isPulsing } = useVedaStore();
  const [selectedModule, setSelectedModule] = useState<SubsystemDetail | null>(null);
  const [currentLoopStep, setCurrentLoopStep] = useState<number>(-1);
  const [isLoopRunning, setIsLoopRunning] = useState<boolean>(false);
  const [cognitiveLogs, setCognitiveLogs] = useState<string[]>([]);
  const [clockSpeed, setClockSpeed] = useState<number>(1.2); // Hz

  // Simulated Cognitive Core Logs
  const addLog = (msg: string) => {
    const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
    setCognitiveLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 7)]);
  };

  useEffect(() => {
    addLog("Persistent Cognitive State Architecture v6.8-Decoupled initialized.");
    addLog("Metacognitive monitoring online. Free Energy optimization set to active model.");
  }, []);

  // Run architectural step-by-step cognitive loop simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoopRunning) {
      interval = setInterval(() => {
        setCurrentLoopStep(prev => {
          const next = (prev + 1) % 8;
          
          // Trigger logs based on the step
          switch (next) {
            case 0:
              addLog("語義解析/LANGUAGE: 語言層解析完備，對齊非結構化語意特徵編碼。");
              break;
            case 1:
              addLog("因果計算/CAUSAL: 因果引擎進行干預 do(X) 推演與長程反事實概率擬合。");
              break;
            case 2:
              addLog("狀態預測/WORLD_MODEL: 世界模型更新持久性拓撲狀態，修正對象實體快照。");
              break;
            case 3:
              addLog("記憶沉澱/EXPERIENCE_DB: 經驗資料庫修復自檢，情節語義與長期概念完成歸類沉澱。");
              break;
            case 4:
              addLog("空間感知/VISUAL: 視覺模組特徵讀取完成，多模態信息映射至全局語意對齊流形。");
              break;
            case 5:
              addLog("路徑規劃/PLANNER: 任務規劃器進行多步決策樹搜索，前向預演最高能效輸出。");
              break;
            case 6:
              addLog("安全調用/TOOL_SYSTEM: 工具系統安全隔離執行外部 API 與腳本，排除副作用。");
              break;
            case 7:
              addLog("同盟共識/API_INTERFACE: API介面完成實時 WebSocket 握手，發送多租戶共識通訊。");
              break;
          }
          return next;
        });
      }, 1500 / clockSpeed);
    } else {
      setCurrentLoopStep(-1);
    }
    return () => clearInterval(interval);
  }, [isLoopRunning, clockSpeed]);

  const triggerActiveInference = () => {
    addLog("MANUAL PROBE: Initiating deliberate neuromorphic sync...");
    handleAction('evolve');
    addLog("SYSTEM TENSION NODAL RESET: Active Inference cycle resolved with complete structural symmetry.");
  };

  // Theoretical content mapped to standard image specifications
  const subsystems: Record<string, SubsystemDetail> = {
    language_layer: {
      id: 'language_layer',
      title: '語言層 (Language Layer)',
      enTitle: 'Semantic Expression & Token Processor',
      concept: '負責高精度的文本語義、意圖對齊與解析。充當系統和外部（如用戶輸入）的語意交互媒介，將非結構化對話與輸入指令解讀成確定性的認知特徵。',
      theory: 'Translates unstructured language tokens into high-dimensional semantic spaces conforming to the global state priors.',
      metrics: ['Precision Index: 99.8%', 'Vocab Matrix Depth: 1536-dim', 'Parsing Delay: < 45ms'],
      vedaValue: '99.8%',
      status: 'ONLINE'
    },
    causal_engine: {
      id: 'causal_engine',
      title: '因果引擎 (Causal Engine)',
      enTitle: 'Structural Causal & Counterfactual Model',
      concept: '計算多维變量間概率依存和因果流形。不依賴任意黑盒特徵對應，使用結構方程組演繹計量干預（Interventions）及反事實情節。',
      theory: 'Pearl-Sovereign Structural Causal Engine (SCM). Evaluates active interventions do(X) for riskless path estimation.',
      metrics: ['Causal Weights: ' + (userData?.phi || 13.8) + ' Phi', 'Graph Trace Depth: 5-ply', 'Hypothesis Coherence: High'],
      vedaValue: userData?.phi || 13.8,
      status: 'ONLINE'
    },
    world_model: {
      id: 'world_model',
      title: '世界模型 (World Model)',
      enTitle: 'Persistent State Topology & Prior Predictor',
      concept: '持久性維持的全域世界狀態模型。而非逐次低效率生成，通過多维對象實體關係、拓撲路徑等物理客觀約束，對事件發展提供前瞻性預測基線。',
      theory: 'Decoupled Environment Representation: Maintains consistent spatial and behavioral schemas independently from input noise.',
      metrics: ['Global Coherence: ' + (userData?.global_coherence || 0.88), 'State Snapshots: 24 active', 'Entropy Level: ' + ((userData?.entropy || 0.12) * 100).toFixed(1) + '%'],
      vedaValue: userData?.global_coherence || 0.88,
      status: 'ONLINE'
    },
    experience_database: {
      id: 'experience_database',
      title: '經驗資料庫 (Experience Database)',
      enTitle: 'Episodic Trace Consolidation',
      concept: '大宗歷史經驗與事件碎片的沉澱體系。具備高效的情節記憶序列、抽象概念性語義記憶沉澱與修復，支持低耗能下的快速歷史检索。',
      theory: 'Cognitive State Persistence: Hippocampal-inspired memory consolidation transforms episodic events into lifelong concept schemas.',
      metrics: ['Stored Traces: ' + (userData?.memories?.length || 18) + ' nodes', 'Federated Ratio: ' + (userData?.federation_multiplier || '1.14x'), 'Database Integrity: Stable'],
      vedaValue: userData?.memories?.length || 18,
      status: 'ONLINE'
    },
    visual_module: {
      id: 'visual_module',
      title: '視覺模組 (Visual Module)',
      enTitle: 'Multimodal Spatial Perception',
      concept: '高頻圖像特徵與空間信息提取管線。捕捉外部圖片、符號表達和多模態輸入的深層特徵，並與語言層語義空間進行跨模態映射對齊。',
      theory: 'Multimodal Gated Embeddings: Maps visual frames directly into structural state categories with zero-lag focus.',
      metrics: ['Image Resolution: SVG/Vector', 'Feature Tokens: 1024-tokens', 'Embedding Coherence: 98.4%'],
      vedaValue: '98.4%',
      status: 'ONLINE'
    },
    task_planner: {
      id: 'task_planner',
      title: '任務規劃器 (Task Planner)',
      enTitle: 'Trajectory & Execution Agenda Monitor',
      concept: '管理和調度任務執行優先權。精算注意力與緩衝配額，藉由多步推理前向預演模擬，在保障安全隔離的前提下預測最高收益的路徑。',
      theory: 'Active Path Planning: Utilizes tree-search and chain-of-thought planning to draft deterministic action trajectories.',
      metrics: ['Planning Logic Depth: 100 max', 'Active Queue: ' + (userData?.reminders?.length || 0) + ' items', 'Tension Index: ' + (userData?.tension || 0.32)],
      vedaValue: userData?.tension || 0.32,
      status: 'STANDBY'
    },
    tool_system: {
      id: 'tool_system',
      title: '工具系統 (Tool System)',
      enTitle: 'Sandboxed Schema & External Extensibility',
      concept: '連接並執行外部實體操作的管線。動態調用系統自研工具與第三方 API 接口，嚴格隔離副作用，確保對外部指令進行高能效執行。',
      theory: 'Sandboxed Execution Gating: Provides modular tool registries and environment safety containment boundaries.',
      metrics: ['Available Tools: 8 core', 'Sandbox Containment: Safe', 'Execution Efficiency: ' + (userData?.energy_level || 94) + '%'],
      vedaValue: (userData?.energy_level || 94) + '%',
      status: 'ONLINE'
    },
    api_interface: {
      id: 'api_interface',
      title: 'API 介面 (API Interface)',
      enTitle: 'Distributed Gateway & Consensus Hook',
      concept: '分佈式節點對接與實時端點通信介面。保障與其他同盟節點（Federated Nodes）及其它分布式系統的實時共識交互、安全認證與高頻推送。',
      theory: 'Deterministic Socket & Webhook Protocol: Secures distributed state handshakes against random payload drift.',
      metrics: ['Handshake Nodes: ' + (userData?.federation?.length || 0) + ' active', 'Protocol Version: v6.0-Decoupled', 'Gating Control: Active'],
      vedaValue: 'SECURE',
      status: 'ONLINE'
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 overflow-y-auto no-scrollbar relative z-10 selection:bg-accent/30 text-ink">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent animate-pulse" />
            <span className="text-[10px] tracking-[0.4em] text-accent uppercase font-mono">Cognitive Blueprint / 認知藍圖</span>
          </div>
          <h1 className="text-3xl font-display tracking-tight text-white mt-1">
            統一認知核心架構 <span className="text-lg font-mono font-light text-white/50">(Persistent Cognitive State Architecture)</span>
          </h1>
          <p className="text-xs text-ink/70 mt-2 font-serif max-w-4xl italic">
            "世界狀態持續存在，事件驅動更新，因果演化，按需啟動，最小必要計算。"
          </p>
        </div>

        {/* Top Control Nodes */}
        <div className="flex flex-wrap gap-2">
          {/* Loop Control */}
          <button
            onClick={() => setIsLoopRunning(!isLoopRunning)}
            className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-all duration-300 flex items-center gap-2 border ${
              isLoopRunning 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                : 'bg-white/5 border-white/10 text-ink/70 hover:bg-white/10 hover:text-ink'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isLoopRunning ? 'animate-spin' : ''}`} />
            {isLoopRunning ? "Pause Cognitive Loop" : "Simulate Cognitive Loop"}
          </button>

          {/* Active Inference Step */}
          <button
            onClick={triggerActiveInference}
            className="px-4 py-2 bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent rounded-lg text-xs font-mono tracking-wider uppercase transition-all duration-300 flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            <Zap className="w-3.5 h-3.5 text-accent" />
            Trigger Active Inference
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      {(() => {
        const cardConfigs = [
          { key: 'language_layer', color: 'border-blue-500/10 hover:border-blue-500/35 bg-blue-950/5', textColor: 'text-blue-400', icon: FileText, num: 'VEDA_01' },
          { key: 'causal_engine', color: 'border-emerald-500/10 hover:border-emerald-500/35 bg-emerald-950/5', textColor: 'text-emerald-400', icon: Network, num: 'VEDA_02' },
          { key: 'world_model', color: 'border-violet-500/10 hover:border-violet-500/35 bg-violet-950/5', textColor: 'text-violet-400', icon: Layers, num: 'VEDA_03' },
          { key: 'experience_database', color: 'border-sky-500/10 hover:border-sky-500/35 bg-sky-950/5', textColor: 'text-sky-400', icon: Database, num: 'VEDA_04' },
          { key: 'visual_module', color: 'border-rose-500/10 hover:border-rose-500/35 bg-rose-950/5', textColor: 'text-rose-400', icon: Eye, num: 'VEDA_05' },
          { key: 'task_planner', color: 'border-amber-500/10 hover:border-amber-500/35 bg-amber-950/5', textColor: 'text-amber-400', icon: Sliders, num: 'VEDA_06' },
          { key: 'tool_system', color: 'border-teal-500/10 hover:border-teal-500/35 bg-teal-950/5', textColor: 'text-teal-400', icon: Cpu, num: 'VEDA_07' },
          { key: 'api_interface', color: 'border-cyan-500/10 hover:border-cyan-500/35 bg-cyan-950/5', textColor: 'text-cyan-400', icon: GitMerge, num: 'VEDA_08' }
        ];

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 select-none">
            {cardConfigs.map((cfg, index) => {
              const mod = subsystems[cfg.key];
              if (!mod) return null;
              const IconComp = cfg.icon;
              const isSelected = selectedModule?.id === mod.id;
              const stepActive = currentLoopStep === index;

              return (
                <motion.div
                  key={cfg.key}
                  onClick={() => setSelectedModule(mod)}
                  className={cn(
                    "border rounded-xl p-5 cursor-pointer transition-all duration-300 relative group overflow-hidden flex flex-col justify-between min-h-[220px]",
                    cfg.color,
                    isSelected ? "border-accent bg-accent/5 ring-1 ring-accent/25" : "border-white/5",
                    stepActive ? "border-accent bg-accent/10 shadow-[0_0_25px_rgba(50,205,50,0.1)]" : ""
                  )}
                  whileHover={{ y: -3 }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] group-hover:bg-white/[0.03] blur-2xl transition-all pointer-events-none" />
                  
                  {stepActive && (
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-accent animate-pulse" />
                  )}

                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className={cn("p-2 rounded-lg bg-white/5 border border-white/5", cfg.textColor)}>
                        <IconComp className={cn("w-4.5 h-4.5", stepActive ? "animate-pulse" : "")} />
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 bg-black/45 text-white/40 border border-white/5 rounded-full">
                        {cfg.num}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
                      {mod.title}
                      {stepActive && <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />}
                    </h3>
                    <h4 className="text-[9px] font-mono text-white/30 truncate mt-0.5 mb-3">{mod.enTitle}</h4>
                    <p className="text-[11px] text-ink/65 leading-relaxed font-serif italic line-clamp-3">
                      {mod.concept}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] font-mono">
                    <span className="text-white/40">VALUE: <span className={cfg.textColor}>{mod.vedaValue}</span></span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[8px]",
                      mod.status === 'ONLINE' ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                    )}>
                      {mod.status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        );
      })()}

      {/* Subsystem Details Overlay / Info Drawer */}
      <AnimatePresence>
        {selectedModule && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 border border-white/10 bg-black/40 rounded-xl p-5 relative overflow-hidden"
          >
            <div className="absolute top-2 right-2">
              <button 
                onClick={() => setSelectedModule(null)}
                className="p-1 px-2.5 rounded bg-white/5 border border-white/10 text-xs font-mono text-ink/60 hover:text-ink hover:bg-white/10 transition-all"
              >
                CLOSE [X]
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-accent">
                  <Cpu className="w-4.5 h-4.5" />
                  <span className="text-[9px] uppercase font-mono tracking-widest">Selected Core Module</span>
                </div>
                <h3 className="text-xl font-display text-white mt-1">{selectedModule.title}</h3>
                <h4 className="text-xs font-mono text-accent/85">{selectedModule.enTitle}</h4>
                
                <p className="text-xs text-ink/80 mt-4 leading-relaxed font-serif italic border-l border-white/10 pl-3">
                  {selectedModule.concept}
                </p>

                <p className="text-[10px] text-ink/50 mt-4 font-mono">
                  <span className="text-accent/60">Agi Protocol Mapping:</span> {selectedModule.theory}
                </p>
              </div>

              <div className="w-full md:w-80 bg-white/5 border border-white/5 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="text-[9px] font-mono tracking-widest text-ink/50 uppercase border-b border-white/5 pb-1">Virtual Metrics / 模組動態指標</div>
                  <div className="mt-2.5 space-y-1.5">
                    {selectedModule.metrics.map((m, idx) => (
                      <div key={idx} className="text-xs font-mono text-white/90 bg-white/5 px-2 py-1 rounded">
                        {m}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-accent">
                  <span>LAYER_ID: {selectedModule.id.toUpperCase()}</span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 rounded animate-pulse">ONLINE</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Loop Flow (1 to 8 Steps Diagram) */}
      <div className="border border-white/5 bg-black/25 rounded-2xl p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            <h3 className="text-xs uppercase font-mono tracking-wider text-white">整體運行流程 / Continuous Epistemic Loop</h3>
          </div>
          <span className="text-[8px] font-mono text-ink/40">Continuous Realtime Execution Cascade Loop</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {[
            { id: 0, label: "1. 感知輸入", desc: "Perceive" },
            { id: 1, label: "2. 更新候選生成", desc: "Candidates" },
            { id: 2, label: "3. 事件檢測", desc: "Event Detect" },
            { id: 3, label: "4. 局部狀態更新", desc: "Local Sync" },
            { id: 4, label: "5. 推理與模擬", desc: "Reason & Sim" },
            { id: 5, label: "6. 決策與輸出", desc: "Dispatch" },
            { id: 6, label: "7. 結果回饋", desc: "Integrated" },
            { id: 7, label: "8. 持續循環 (∞)", desc: "Recursion" }
          ].map((s) => {
            const isActive = currentLoopStep === s.id;
            return (
              <div 
                key={s.id} 
                className={`p-3 rounded-lg border transition-all duration-300 text-center flex flex-col justify-center ${
                  isActive 
                    ? 'bg-accent/20 border-accent text-accent scale-102 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                    : 'bg-white/5 border-white/10 text-ink/70'
                }`}
              >
                <div className="text-[10px] font-bold truncate">{s.label}</div>
                <div className="text-[8px] font-mono text-ink/50 mt-0.5 uppercase truncate">{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal logs for local cognitive architecture activity */}
      <div className="border border-white/5 bg-black/45 rounded-2xl p-4 flex flex-col h-48">
        <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-ink/60">
            <TermIcon className="w-3.5 h-3.5 text-accent" />
            <span>VEDA Metacognitive Log Trace (AGI v6.0 Decoupled Pipeline)</span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono">
            <span>CLOCK: <span className="text-accent">{clockSpeed.toFixed(1)} Hz</span></span>
            <input 
              type="range" 
              min="0.5" 
              max="4.0" 
              step="0.1" 
              value={clockSpeed}
              onChange={(e) => setClockSpeed(parseFloat(e.target.value))}
              className="accent-accent w-20 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex-1 font-mono text-[10px] space-y-1 text-emerald-400/90 overflow-y-auto no-scrollbar">
          {cognitiveLogs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-ink/40 select-none">&gt;&gt;</span>
              <span className="flex-1 truncate">{log}</span>
            </div>
          ))}
          {cognitiveLogs.length === 0 && (
            <div className="text-ink/30 italic">No activity logged in current clock session.</div>
          )}
        </div>
      </div>

    </div>
  );
};
