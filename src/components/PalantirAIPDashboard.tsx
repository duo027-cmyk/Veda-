import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Workflow, 
  Cpu, 
  Brain, 
  ShieldAlert, 
  Activity, 
  Minimize2, 
  Maximize2,
  Database,
  ArrowRight,
  TrendingDown,
  LineChart,
  Grid,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Hash
} from "lucide-react";
import { useI18n } from "../i18n";

interface OntologyObject {
  id: string;
  type: "AGI_ACTOR" | "SENSORY_EVENT" | "DECISION_NODE" | "COGNITIVE_AXIOM" | "LATTICE_COMPUTE";
  label: string;
  properties: Record<string, any>;
  timestamp: number;
}

interface OntologyRelation {
  id: string;
  source: string;
  target: string;
  type: "DETERMINES" | "MITIGATES" | "STABILIZES" | "FALSIFIES" | "UPGRADES";
  weight: number;
}

interface AIPDecision {
  timestamp: number;
  action: string;
  target: string;
  entropyBefore: number;
  entropyAfter: number;
  impactCoef: number;
  status: "APPROVED" | "VERIFIED" | "REJECTED";
}

interface PalantirAIPDashboardProps {
  data: any;
  onAction?: (actionName: string, params: any) => Promise<any>;
  onRefresh?: () => void;
}

export const PalantirAIPDashboard: React.FC<PalantirAIPDashboardProps> = ({ 
  data, 
  onAction,
  onRefresh
}) => {
  const { t } = useI18n();
  const [selectedNode, setSelectedNode] = useState<OntologyObject | null>(null);
  const [activeActionTab, setActiveActionTab] = useState<"ACTIONS" | "LOGS" | "CAUSAL_TREE">("ACTIONS");
  const [isExecutingAction, setIsExecutingAction] = useState<string | null>(null);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1.0);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [trackerHistory, setTrackerHistory] = useState<{ vfe: number; coherence: number; time: string }[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data) {
      const vfeVal = data.free_energy || 0.125;
      const cohVal = data.global_coherence || 0.55;
      const timeStr = new Date().toLocaleTimeString().split(' ')[0];
      
      setTrackerHistory(prev => {
        if (prev.length > 0 && prev[prev.length - 1].vfe === vfeVal && prev[prev.length - 1].coherence === cohVal) {
          return prev;
        }
        return [...prev, { vfe: vfeVal, coherence: cohVal, time: timeStr }].slice(-15);
      });
    }
  }, [data]);

  const ontology = data?.palantir_ontology || { objects: [], relations: [] };
  const decisionLogs: AIPDecision[] = data?.palantir_decisions || [];

  // 1. Compute node coordinates dynamically matching clean layout clustering
  useEffect(() => {
    if (!ontology.objects || ontology.objects.length === 0) return;
    
    const positions: Record<string, { x: number; y: number }> = {};
    const objects = ontology.objects as OntologyObject[];
    
    // Core node is locked in center
    const core = objects.find(o => o.type === "AGI_ACTOR");
    const width = 800;
    const height = 450;
    
    if (core) {
      positions[core.id] = { x: width / 2, y: height / 2 };
    }
    
    // Other nodes orbit or align symmetrically
    const nonCore = objects.filter(o => o.type !== "AGI_ACTOR");
    nonCore.forEach((node, index) => {
      const angle = (index / nonCore.length) * 2 * Math.PI + (Date.now() * 0.0001 * simulationSpeed);
      let radius = 160;
      
      if (node.type === "SENSORY_EVENT") radius = 110; // Threat events cluster tight
      if (node.type === "DECISION_NODE") radius = 210; // Decisions on the outer boundary
      if (node.type === "COGNITIVE_AXIOM") radius = 140; // Core axioms orbit inner
      
      const x = (width / 2) + Math.cos(angle) * radius;
      const y = (height / 2) + Math.sin(angle) * radius;
      positions[node.id] = { x, y };
    });
    
    setNodePositions(positions);
  }, [ontology.objects, simulationSpeed]);

  const triggerAIPAction = async (actionType: "ALIGN_ONTOLOGY" | "MITIGATE_SURPRISE" | "APOLLO_EDGE_CALIBRATION") => {
    if (!onAction) return;
    setIsExecutingAction(actionType);
    try {
      await onAction("executePalantirAIPAction", { actionType });
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error("[PALANTIR_AIP_EXECUTION_FAULT]", e);
    } finally {
      setIsExecutingAction(null);
    }
  };

  const getObjectColor = (type: string) => {
    switch (type) {
      case "AGI_ACTOR":
        return { bg: "bg-gold/10", border: "border-gold", text: "text-gold", glow: "shadow-gold/30" };
      case "COGNITIVE_AXIOM":
        return { bg: "bg-cyan-500/10", border: "border-cyan-400/80", text: "text-cyan-300", glow: "shadow-cyan-500/20" };
      case "SENSORY_EVENT":
        return { bg: "bg-red-500/10", border: "border-red-400/80", text: "text-red-400", glow: "shadow-red-500/20" };
      case "DECISION_NODE":
        return { bg: "bg-emerald-500/10", border: "border-emerald-400/80", text: "text-emerald-400", glow: "shadow-emerald-500/20" };
      case "LATTICE_COMPUTE":
        return { bg: "bg-purple-500/10", border: "border-purple-400/80", text: "text-purple-300", glow: "shadow-purple-500/20" };
      default:
        return { bg: "bg-silver/10", border: "border-silver", text: "text-ink", glow: "shadow-silver/10" };
    }
  };

  const getRelationColor = (relationType: string) => {
    switch (relationType) {
      case "DETERMINES":
        return "stroke-red-500/40";
      case "MITIGATES":
        return "stroke-emerald-400/40";
      case "STABILIZES":
        return "stroke-gold/40";
      case "UPGRADES":
        return "stroke-purple-400/40";
      case "FALSIFIES":
        return "stroke-red-600/50";
      default:
        return "stroke-white/10";
    }
  };

  return (
    <div id="palantir-aip-workspace" className="h-full flex flex-col xl:flex-row gap-6 p-4 md:p-6 overflow-y-auto xl:overflow-hidden select-none bg-[#090b0d] text-ink">
      
      {/* LEFT PORT: Palantir Unified AIP Platform & Ontology Viewer */}
      <div className="flex-1 flex flex-col gap-6 h-full min-h-[500px]">
        {/* Workspace Title bar */}
        <div className="flex justify-between items-center bg-[#0d0f12] border border-border-subtle px-6 py-4 rounded-xl">
          <div className="flex items-center gap-3">
            <Workflow className="text-gold w-6 h-6 animate-pulse" />
            <div>
              <h2 className="text-sans font-medium text-lg tracking-wider text-ink-bright">PALANTIR AIP ONTOLOGY GRAPH</h2>
              <p className="text-[10px] text-ink-dim tracking-[0.2em] uppercase font-mono mt-0.5">Unified Model-Driven Logic Mappings &amp; Edge Decisions</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1 bg-ink/5 border border-border-subtle rounded text-gold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>AIP_INTEGRATION: READY</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Ontology Canvas */}
        <div 
          ref={containerRef}
          className="flex-1 relative bg-[#0c0e11] border border-border-subtle rounded-xl overflow-hidden shadow-inner flex items-center justify-center min-h-[400px] group"
        >
          {/* Subtle Cyber Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#15191e_1px,transparent_1px),linear-gradient(to_bottom,#15191e_1px,transparent_1px)] bg-[size:32px_32px] opacity-25" />
          
          <div className="absolute top-4 left-4 text-[10px] font-mono text-ink-dim uppercase tracking-widest bg-black/40 px-2 py-1 rounded border border-border-subtle">
            Active Nodes: {ontology.objects?.length || 0} | Relations: {ontology.relations?.length || 0}
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button 
              onClick={() => setSimulationSpeed(prev => (prev === 0 ? 1 : 0))}
              className="px-2.5 py-1 text-[9px] font-mono border border-border-subtle rounded bg-[#0d1013] text-gold hover:bg-gold hover:text-black transition-all"
            >
              SIM_SPEED: {simulationSpeed === 0 ? "PAUSED" : "ACTIVE (1.0x)"}
            </button>
          </div>

          {/* SVG Connector Relations Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#d4af37" opacity="0.6"/>
              </marker>
            </defs>
            {ontology.relations && ontology.relations.map((rel: OntologyRelation) => {
              const start = nodePositions[rel.source];
              const end = nodePositions[rel.target];
              if (!start || !end) return null;
              
              const colorClass = getRelationColor(rel.type);
              
              return (
                <g key={rel.id}>
                  <path
                    d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                    className={`stroke-[1.5px] fill-none ${colorClass}`}
                    markerEnd="url(#arrow)"
                  />
                  {/* Subtle animated relational signals */}
                  <circle r="2.5" className="fill-gold">
                    <animateMotion
                      dur={`${3 / simulationSpeed}s`}
                      repeatCount="Infinity"
                      path={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                    />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* Interactive Mapped HTML Nodes */}
          <div className="absolute inset-0 pointer-events-none">
            {ontology.objects && ontology.objects.map((node: OntologyObject) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              
              const styles = getObjectColor(node.type);
              const isSelected = selectedNode?.id === node.id;
              
              return (
                <div
                  key={node.id}
                  style={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    transform: "translate(-50%, -50%)"
                  }}
                  className="pointer-events-auto"
                >
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    onClick={() => setSelectedNode(node)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 shadow-lg transition-all ${styles.bg} ${styles.border} ${styles.text} ${styles.glow} ${
                      isSelected ? "ring-2 ring-gold scale-105" : ""
                    }`}
                  >
                    {node.type === "AGI_ACTOR" && <Brain className="w-3.5 h-3.5" />}
                    {node.type === "COGNITIVE_AXIOM" && <Cpu className="w-3.5 h-3.5" />}
                    {node.type === "SENSORY_EVENT" && <ShieldAlert className="w-3.5 h-3.5 animate-bounce" />}
                    {node.type === "DECISION_NODE" && <Workflow className="w-3.5 h-3.5" />}
                    {node.type === "LATTICE_COMPUTE" && <Activity className="w-3.5 h-3.5" />}
                    <span>{node.label}</span>
                  </motion.button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT PORT: Mapped Properties Inspector & Palantir Action Panel */}
      <div className="w-full xl:w-[420px] flex flex-col gap-6 h-full xl:overflow-y-auto pr-1">
        
        {/* ONTOLOGY PROPERTIES INSPECTOR */}
        <div className="bg-[#0c0e11] border border-border-subtle rounded-xl overflow-hidden flex flex-col min-h-[220px]">
          <div className="px-5 py-3 border-b border-[#14161a] bg-[#0d0f12] flex justify-between items-center">
            <h3 className="text-xs font-mono text-ink-bright tracking-widest uppercase flex items-center gap-2">
              <Database className="w-4 h-4 text-gold" />
              Ontological Registry Inspector
            </h3>
            {selectedNode && (
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-[10px] font-mono text-gold hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="flex-1 p-5 font-mono text-xs text-ink-bright/80 flex flex-col justify-between">
            {selectedNode ? (
              <div className="space-y-3">
                <div className="flex justify-between border-b border-border-subtle/20 pb-1 text-gold">
                  <span>ENTITY LABEL:</span>
                  <span>{selectedNode.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>NODE TYPE:</span>
                  <span className="text-ink-bright">{selectedNode.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>REGISTRY TIMESTAMP:</span>
                  <span className="text-ink-dim">{new Date(selectedNode.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="border border-border-subtle/30 bg-black/40 rounded p-3 mt-2 text-[11px] leading-relaxed">
                  <p className="text-gold/90 font-bold mb-1 uppercase tracking-wider">Entity Mapped Properties:</p>
                  {Object.entries(selectedNode.properties || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between mt-1 border-b border-white/5 pb-0.5">
                      <span className="text-ink-dim">{key}:</span>
                      <span className="text-ink-bright font-mono">{typeof value === "object" ? JSON.stringify(value) : String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-ink-dim">
                <HelpCircle className="w-8 h-8 opacity-25 mb-2" />
                <p className="text-[11px] uppercase tracking-wider italic">Select any node on the ontology canvas to audit details and deep properties.</p>
              </div>
            )}
          </div>
        </div>

        {/* CONTROLLER & EXECUTION LOG SWITCHER */}
        <div className="bg-[#0c0e11] border border-border-subtle rounded-xl overflow-hidden flex flex-col flex-1 min-h-[350px]">
          <div className="grid grid-cols-3 border-b border-[#14161a] bg-[#0d0f12]">
            {(["ACTIONS", "LOGS", "CAUSAL_TREE"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveActionTab(tab)}
                className={`py-3.5 text-[10px] font-mono uppercase tracking-wider border-r border-[#14161a] last:border-r-0 transition-all ${
                  activeActionTab === tab 
                    ? "bg-[#090a0d] text-gold border-t-2 border-t-gold font-bold" 
                    : "text-ink-dim hover:text-ink-bright"
                }`}
              >
                {tab === "ACTIONS" && "AIP Actions"}
                {tab === "LOGS" && "Decision Logs"}
                {tab === "CAUSAL_TREE" && "Causal Tree"}
              </button>
            ))}
          </div>

          <div className="flex-1 p-5 overflow-y-auto font-mono text-xs">
            <AnimatePresence mode="wait">
              {activeActionTab === "ACTIONS" && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  <p className="text-[11px] text-ink-dim uppercase tracking-wider leading-relaxed mb-1">
                    Execute real-time Ontological mappings of the VEDA world model parameters.
                  </p>
                  
                  {/* Action CARD A */}
                  <div className="border border-border-subtle bg-black/20 rounded-lg p-3.5 hover:border-gold/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-ink-bright text-xs font-bold font-mono tracking-wide uppercase">ALIGN ONTOLOGY</h4>
                        <p className="text-[10px] text-ink-dim mt-1">Stabilizes divergent state vectors. Collapses system surprise levels.</p>
                      </div>
                      <span className="text-[10px] text-gold font-mono border border-gold/30 px-1.5 py-0.5 rounded bg-gold/5">FEP 0.72</span>
                    </div>
                    <button
                      disabled={isExecutingAction !== null}
                      onClick={() => triggerAIPAction("ALIGN_ONTOLOGY")}
                      className={`w-full mt-3.5 py-2 rounded text-[11px] uppercase tracking-widest font-mono font-bold transition-all border ${
                        isExecutingAction === "ALIGN_ONTOLOGY" 
                          ? "bg-gold/10 border-gold/40 text-gold animate-pulse cursor-wait" 
                          : "bg-gold text-black border-gold hover:bg-transparent hover:text-gold"
                      }`}
                    >
                      {isExecutingAction === "ALIGN_ONTOLOGY" ? "ALIGING MANIFOLD..." : "INITIATE ONTO_ALIGN"}
                    </button>
                  </div>

                  {/* Action CARD B */}
                  <div className="border border-border-subtle bg-black/20 rounded-lg p-3.5 hover:border-red-500/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-ink-bright text-xs font-bold font-mono tracking-wide uppercase">MITIGATE SURPRISE</h4>
                        <p className="text-[10px] text-ink-dim mt-1">Resolves persistent safety notifications and cognitive anomalies.</p>
                      </div>
                      <span className="text-[10px] text-red-400 font-mono border border-red-500/30 px-1.5 py-0.5 rounded bg-red-500/5">Surprise</span>
                    </div>
                    <button
                      disabled={isExecutingAction !== null}
                      onClick={() => triggerAIPAction("MITIGATE_SURPRISE")}
                      className={`w-full mt-3.5 py-2 rounded text-[11px] uppercase tracking-widest font-mono font-bold transition-all border ${
                        isExecutingAction === "MITIGATE_SURPRISE" 
                          ? "bg-red-500/10 border-red-500/40 text-red-400 animate-pulse cursor-wait" 
                          : "bg-red-500/80 hover:bg-transparent border-red-500 hover:text-red-400 text-black"
                      }`}
                    >
                      {isExecutingAction === "MITIGATE_SURPRISE" ? "QUENCHING ANOMALY..." : "INITIATE SURPRISE_MIT"}
                    </button>
                  </div>

                  {/* Action CARD C */}
                  <div className="border border-border-subtle bg-black/20 rounded-lg p-3.5 hover:border-cyan-400/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-ink-bright text-xs font-bold font-mono tracking-wide uppercase">APOLLO EDGE ALIGN</h4>
                        <p className="text-[10px] text-ink-dim mt-1">Synchronizes decentralized AIP nodes or variables under 100% agreement.</p>
                      </div>
                      <span className="text-[10px] text-cyan-400 font-mono border border-cyan-400/30 px-1.5 py-0.5 rounded bg-cyan-400/5">AIP v6.0</span>
                    </div>
                    <button
                      disabled={isExecutingAction !== null}
                      onClick={() => triggerAIPAction("APOLLO_EDGE_CALIBRATION")}
                      className={`w-full mt-3.5 py-2 rounded text-[11px] uppercase tracking-widest font-mono font-bold transition-all border ${
                        isExecutingAction === "APOLLO_EDGE_CALIBRATION" 
                          ? "bg-cyan-400/10 border-cyan-400/40 text-cyan-400 animate-pulse cursor-wait" 
                          : "bg-cyan-400 hover:bg-transparent border-cyan-400 hover:text-cyan-400 text-black"
                      }`}
                    >
                      {isExecutingAction === "APOLLO_EDGE_CALIBRATION" ? "CALIBRATING EDGE..." : "INITIATE EDGE_ALIGN"}
                    </button>
                  </div>
                </motion.div>
              )}

              {activeActionTab === "LOGS" && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-3"
                >
                  <p className="text-[11px] text-ink-dim uppercase tracking-wider mb-2">AIP Sovereign Execution Logs:</p>
                  
                  {decisionLogs.length > 0 ? (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                      {decisionLogs.slice().reverse().map((log, index) => {
                        const entropyChange = log.entropyBefore - log.entropyAfter;
                        const formattedTime = new Date(log.timestamp).toLocaleTimeString();
                        
                        return (
                          <div key={index} className="bg-black/30 border border-border-subtle/40 rounded p-3 space-y-1.5">
                            <div className="flex justify-between text-[11px] border-b border-border-subtle/10 pb-1">
                              <span className="text-gold font-bold">APPROVED::{log.action}</span>
                              <span className="text-ink-dim font-mono">{formattedTime}</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span>Target Node:</span>
                              <span className="text-ink-bright">{log.target}</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span>Entropy Shift:</span>
                              <span className="text-ink-bright font-mono flex items-center gap-1">
                                {log.entropyBefore.toFixed(3)}
                                <ArrowRight className="w-3 h-3 text-gold" />
                                {log.entropyAfter.toFixed(3)}
                              </span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span>Impact Coefficients:</span>
                              <span className="text-emerald-400 font-mono font-bold">{(log.impactCoef * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-ink-dim flex flex-col items-center">
                      <TrendingDown className="w-8 h-8 opacity-25 mb-2" />
                      <p className="text-[10px] uppercase tracking-widest italic">No decision actions recorded yet this session.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeActionTab === "CAUSAL_TREE" && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  <div className="border border-border-subtle bg-black/20 rounded p-4 text-[11px] leading-relaxed">
                    <p className="text-gold font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Hash className="w-4 h-4" />
                      Causal Manifolds Hierarchy
                    </p>
                    <div className="space-y-2 mt-1">
                      <p className="text-ink-dim uppercase">Primary Axis: <span className="text-ink-bright">COHERENCE_VECTOR ({data?.global_coherence?.toFixed(4)})</span></p>
                      <p className="text-ink-dim uppercase">Secondary Axis: <span className="text-ink-bright">FREE_ENERGY ({data?.free_energy || "0.0125"})</span></p>
                      <p className="text-ink-dim uppercase">Axioms Matrix: <span className="text-ink-bright">{data?.axioms?.length || 0} active constraints</span></p>
                    </div>
                  </div>
                  
                  <div className="border border-border-subtle bg-black/20 rounded p-4 text-[11px]">
                    <p className="text-gold font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <LineChart className="w-4 h-4" />
                      Active Surprise Delta Tracker
                    </p>
                    <div className="flex justify-between items-center text-xs mt-1 border-b border-white/5 pb-1">
                      <span>Total Safety Warnings:</span>
                      <span className={data?.safety_alerts?.length > 0 ? "text-red-400 font-bold" : "text-emerald-400"}>
                        {data?.safety_alerts?.length || 0} alerts
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1 border-b border-white/5 pb-1">
                      <span>V-JEPA Current Energy:</span>
                      <span className="text-gold font-mono">{data?.jepa?.currentEnergy?.toFixed(4) || "0.1250"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span>Uptime Integration:</span>
                      <span className="text-ink-bright font-mono">{(process.uptime() || 120).toFixed(0)} seconds</span>
                    </div>
                  </div>

                  <div className="border border-border-subtle bg-black/20 rounded p-4 text-[11px]">
                    <p className="text-gold font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4 text-cyan-400" />
                      Dynamic Thermodynamic Entropy (Trend-Line)
                    </p>
                    {trackerHistory.length > 1 ? (
                      <div className="space-y-2 mt-2">
                        <svg className="w-full h-24" viewBox="0 0 340 100" preserveAspectRatio="none">
                          <g opacity="0.15">
                            <line x1="0" y1="10" x2="340" y2="10" stroke="#888" strokeWidth="0.5" strokeDasharray="2,2" />
                            <line x1="0" y1="50" x2="340" y2="50" stroke="#888" strokeWidth="0.5" strokeDasharray="2,2" />
                            <line x1="0" y1="90" x2="340" y2="90" stroke="#888" strokeWidth="0.5" strokeDasharray="2,2" />
                          </g>
                          
                          {/* Coherence Vector (Gold Line) */}
                          <polyline
                            fill="none"
                            stroke="#d4af37"
                            strokeWidth="1.5"
                            points={trackerHistory.map((item, idx) => {
                              const x = (idx / (trackerHistory.length - 1)) * 340;
                              const y = 100 - (item.coherence * 80 + 10);
                              return `${x},${y}`;
                            }).join(" ")}
                          />

                          {/* Variational Free Energy (Cyan Line) */}
                          <polyline
                            fill="none"
                            stroke="#22d3ee"
                            strokeWidth="1.5"
                            points={trackerHistory.map((item, idx) => {
                              const x = (idx / (trackerHistory.length - 1)) * 340;
                              const y = 100 - (item.vfe * 80 + 10);
                              return `${x},${y}`;
                            }).join(" ")}
                          />

                          {/* Status Coordinate Indicators */}
                          {(() => {
                            const lastIdx = trackerHistory.length - 1;
                            const lastItem = trackerHistory[lastIdx];
                            const cxX = 340;
                            const cohY = 100 - (lastItem.coherence * 80 + 10);
                            const vfeY = 100 - (lastItem.vfe * 80 + 10);
                            return (
                              <g>
                                <circle cx={cxX} cy={cohY} r="3" fill="#d4af37" className="animate-pulse" />
                                <circle cx={cxX} cy={cohY} r="1.5" fill="#d4af37" />
                                <circle cx={cxX} cy={vfeY} r="3" fill="#22d3ee" className="animate-pulse" />
                                <circle cx={cxX} cy={vfeY} r="1.5" fill="#22d3ee" />
                              </g>
                            );
                          })()}
                        </svg>
                        <div className="flex justify-between items-center text-[10px] text-ink-dim font-mono pt-1">
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gold" /> Coherence: {trackerHistory[trackerHistory.length - 1].coherence.toFixed(4)}</span>
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Free Energy: {trackerHistory[trackerHistory.length - 1].vfe.toFixed(4)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-ink-dim italic text-[10px]">
                        Capturing live thermodynamic iterations...
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};
