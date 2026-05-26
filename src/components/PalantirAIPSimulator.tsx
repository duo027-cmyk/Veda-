import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  Settings, 
  Sliders, 
  Terminal, 
  Activity, 
  Zap, 
  ShieldAlert, 
  CheckCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { BrainData } from '../types';
import { vedaService } from '../services/vedaService';

interface PalantirAIPSimulatorProps {
  data: BrainData | null;
  onUpdate: () => void;
}

export const PalantirAIPSimulator: React.FC<PalantirAIPSimulatorProps> = ({ data, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'GRAPH' | 'DECISIONS' | 'AUDIT'>('GRAPH');
  const [isExecuting, setIsExecuting] = useState(false);
  const [apiOutput, setApiOutput] = useState<string | null>(null);

  const ontology = data?.palantir_ontology || { objects: [], relations: [] };
  const decisions = data?.palantir_decisions || [];

  const handleExecuteAIP = async (actionType: 'ALIGN_ONTOLOGY' | 'MITIGATE_SURPRISE' | 'APOLLO_EDGE_CALIBRATION') => {
    setIsExecuting(true);
    setApiOutput(null);
    try {
      const response = await vedaService.postAction({ action: 'executePalantirAIPAction', params: { actionType } });
      if (response && response.data) {
        setApiOutput(response.data.logMessage);
        onUpdate();
      }
    } catch (error) {
      console.error("[PALANTIR_AIP_FAULT] Execution failed", error);
      setApiOutput("[ERROR] Decoupled API action loop desynced.");
    } finally {
      setIsExecuting(false);
    }
  };

  // Node positioning logic based on SVG coordinates for the link graph
  const getNodeCoordinates = (index: number, total: number) => {
    if (total <= 1) return { x: 250, y: 150 };
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const r = 100;
    return {
      x: 250 + r * Math.cos(angle),
      y: 150 + r * Math.sin(angle)
    };
  };

  const getObjectColor = (type: string) => {
    switch (type) {
      case 'AGI_ACTOR': return 'text-accent border-accent bg-accent/10';
      case 'COGNITIVE_AXIOM': return 'text-gold border-gold bg-gold/10';
      case 'SENSORY_EVENT': return 'text-red-400 border-red-400/30 bg-red-400/5';
      case 'LATTICE_COMPUTE': return 'text-purple-400 border-purple-400 bg-purple-400/10';
      case 'DECISION_NODE': return 'text-cyan-400 border-cyan-400 bg-cyan-400/10';
      default: return 'text-zinc-400 border-zinc-700 bg-zinc-800/20';
    }
  };

  const objectsWithCoords = ontology.objects.map((obj: any, idx: number) => {
    if (obj.id === 'actor-veda-core') return { ...obj, x: 250, y: 150 };
    const otherNodes = ontology.objects.filter((o: any) => o.id !== 'actor-veda-core');
    const oIdx = otherNodes.findIndex((o: any) => o.id === obj.id);
    return { ...obj, ...getNodeCoordinates(oIdx, otherNodes.length) };
  });

  return (
    <div className="clean-card bg-zinc-950/40 p-8 flex flex-col gap-8 border border-white/5 relative overflow-hidden group">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all duration-1000">
        <Network size={200} className="text-accent stroke-[0.3px]" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-accent/10 rounded border border-accent/20">
              <Globe size={14} className="text-accent animate-pulse" />
            </span>
            <span className="data-label text-[10px] uppercase tracking-[0.4em] text-accent">Active Ontology (本體論整合)</span>
          </div>
          <h3 className="font-display font-medium text-xl tracking-tight text-zinc-100">Palantir-inspired AIP Control Room</h3>
          <p className="text-[10px] text-white/30 max-w-xl font-serif italic">
            "By mapping erratic system flows into an abstract, decoupled Ontology, standard actions execute at the semantic level directly—optimizing active inference."
          </p>
        </div>

        <div className="flex gap-1.5 border border-white/5 p-1 bg-white/2 rounded">
          {(['GRAPH', 'DECISIONS', 'AUDIT'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-[10px] font-mono tracking-widest uppercase rounded transition-all ${
                activeTab === tab 
                  ? 'bg-accent/20 text-accent font-bold border border-accent/30' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'GRAPH' ? 'Relational Graph' : tab === 'DECISIONS' ? 'AIP Operations' : 'Ontology Audit'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: RELATION GRAPH VISUALIZER */}
        {activeTab === 'GRAPH' && (
          <motion.div
            key="graph"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-8"
          >
            {/* SVG Visualizer Canvas */}
            <div className="col-span-1 lg:col-span-3 min-h-[350px] bg-black/40 border border-white/5 rounded-lg relative overflow-hidden flex flex-col">
              <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                <span className="text-[8px] font-mono tracking-widest text-green-400 uppercase">REAL-TIME SEMANTIC MAP</span>
              </div>

              <div className="flex-1 w-full flex items-center justify-center p-4">
                <svg viewBox="0 0 500 300" className="w-full max-w-[480px] h-auto z-10 overflow-visible">
                  <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Render relations (lines) */}
                  {ontology.relations.map((rel: any, rIdx: number) => {
                    const sourceNode = objectsWithCoords.find((o: any) => o.id === rel.source);
                    const targetNode = objectsWithCoords.find((o: any) => o.id === rel.target);
                    if (!sourceNode || !targetNode) return null;

                    const midX = (sourceNode.x + targetNode.x) / 2;
                    const midY = (sourceNode.y + targetNode.y) / 2;

                    return (
                      <g key={`svg-rel-${rel.id}-${rIdx}`}>
                        <line
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke="rgba(255, 255, 255, 0.08)"
                          strokeWidth={1.5}
                          className="animate-pulse"
                        />
                        <line
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke="var(--color-accent, #6366f1)"
                          strokeWidth={1}
                          strokeDasharray="4 4"
                          className="animate-dash"
                          opacity={rel.weight}
                        />
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect
                            x={-35}
                            y={-7}
                            width={70}
                            height={14}
                            rx={2}
                            fill="#0d0d0d"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth={0.5}
                          />
                          <text
                            textAnchor="middle"
                            y={3}
                            className="fill-white/40 font-mono"
                            style={{ fontSize: '6px', letterSpacing: '0.1em' }}
                          >
                            {rel.type} ({rel.weight.toFixed(2)})
                          </text>
                        </g>
                      </g>
                    );
                  })}

                  {/* Render objects (nodes) */}
                  {objectsWithCoords.map((obj: any, oIdx: number) => (
                    <g key={`svg-obj-${obj.id}-${oIdx}`} transform={`translate(${obj.x}, ${obj.y})`} className="cursor-help">
                      <circle
                        r={obj.id === 'actor-veda-core' ? 24 : 16}
                        fill="#050505"
                        stroke={obj.type === 'AGI_ACTOR' ? 'var(--color-accent, #6366f1)' : obj.type === 'COGNITIVE_AXIOM' ? '#D4AF37' : '#ef4444'}
                        strokeWidth={1.5}
                        filter={obj.id === 'actor-veda-core' ? 'url(#glow)' : ''}
                        opacity={0.9}
                      />
                      {obj.type === 'AGI_ACTOR' && <rect x={-3} y={-3} width={6} height={6} className="fill-accent rotate-45" />}
                      {obj.type === 'COGNITIVE_AXIOM' && <circle r={4} className="fill-gold" />}
                      {obj.type === 'SENSORY_EVENT' && <circle r={4} className="fill-red-400 animate-ping" />}

                      <g transform="translate(0, 32)">
                        <rect
                          x={-55}
                          y={-12}
                          width={110}
                          height={20}
                          rx={2}
                          fill="#080808"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth={0.5}
                        />
                        <text
                          textAnchor="middle"
                          fill="#ffffff"
                          className="font-mono font-bold"
                          style={{ fontSize: '7px', letterSpacing: '0.05em' }}
                          y={-2}
                        >
                          {obj.label}
                        </text>
                        <text
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.3)"
                          className="font-mono"
                          style={{ fontSize: '5px' }}
                          y={5}
                        >
                          {obj.type}
                        </text>
                      </g>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Schema Inspector details */}
            <div className="col-span-1 lg:col-span-2 flex flex-col gap-4">
              <label className="data-label text-white/30 uppercase tracking-[0.2em] text-[9px]">Ontological Objects Catalog</label>
              <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                {ontology.objects.map((obj: any, idx: number) => (
                  <div
                    key={`schema-obj-${obj.id}-${idx}`}
                    className={`p-4 border rounded flex flex-col gap-2 transition-all hover:bg-white/2 ${getObjectColor(obj.type)}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold tracking-tight">{obj.label}</span>
                      <span className="text-[7px] font-mono tracking-widest border border-current px-1.5 py-0.5 rounded-sm uppercase">
                        {obj.type.split('_')[1] || obj.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 border-t border-white/5 pt-2">
                      {Object.entries(obj.properties || {}).map(([key, val]: [string, any]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-[7px] font-mono opacity-40 uppercase">{key}</span>
                          <span className="text-[9px] font-mono text-white/80">
                            {typeof val === 'number' ? val.toFixed(4) : String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: ACTIVE SOLUTIONS OPERATOR */}
        {activeTab === 'DECISIONS' && (
          <motion.div
            key="decisions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  id: 'ALIGN_ONTOLOGY',
                  title: 'Align Dynamic Entities',
                  desc: 'Collapses unstructured sensory drifting nodes and maps them cleanly to the stable AGI Core.',
                  icon: Sliders,
                  benefit: 'Reduces overall Free Energy, increases system Coherence.'
                },
                {
                  id: 'MITIGATE_SURPRISE',
                  title: 'AIP Alert Mitigation',
                  desc: 'Quenches actively bubbling safety threats, resolving structural anomalies on the semantic layer.',
                  icon: ShieldCheck,
                  benefit: 'Discharges core safety alerts, releases logic tension.'
                },
                {
                  id: 'APOLLO_EDGE_CALIBRATION',
                  title: 'Apollo Decentralized Calibration',
                  desc: 'Aligns and anchors high dimensional vectors perfectly across all decentralized compute grids.',
                  icon: Globe,
                  benefit: 'Harmonizes state-vector differences, rewards 15 EP.'
                }
              ].map((btn, bIdx) => (
                <button
                  key={`aip-btn-${btn.id}-${bIdx}`}
                  disabled={isExecuting}
                  onClick={() => handleExecuteAIP(btn.id as any)}
                  className="p-6 clean-card hover:bg-white/5 flex flex-col gap-4 text-left transition-all border border-white/5 active:scale-95 group/btn"
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="p-3 bg-white/5 group-hover/btn:bg-accent/10 border border-white/10 group-hover/btn:border-accent/30 rounded-lg transition-all">
                      <btn.icon size={18} className="text-white/60 group-hover/btn:text-accent transition-colors" />
                    </span>
                    <ArrowRight size={14} className="text-white/10 group-hover/btn:text-accent group-hover/btn:translate-x-1 transition-all" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm text-zinc-100 font-medium group-hover/btn:text-accent transition-colors">{btn.title}</h4>
                    <p className="text-[10px] text-white/40 leading-relaxed font-serif italic mt-1">"{btn.desc}"</p>
                  </div>

                  <div className="mt-auto border-t border-white/5 pt-3 w-full flex flex-col">
                    <span className="text-[7px] font-mono opacity-30 uppercase">Expected System Outcome</span>
                    <span className="text-[9px] font-mono text-accent">{btn.benefit}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Simulated Live Console output */}
            <div className="bg-black border border-white/5 p-5 rounded-lg flex flex-col gap-3 font-mono">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[9px] text-accent font-bold tracking-widest flex items-center gap-2">
                  <Terminal size={10} />
                  PALANTIR_AIP SOLUTIONS CONSOLE_
                </span>
                {isExecuting && <span className="text-[9px] text-white/40 animate-pulse">Running action verification...</span>}
              </div>
              <div className="text-[10px] min-h-[60px] flex flex-col gap-1 text-white/70">
                {apiOutput ? (
                  <p className="text-green-400 font-bold">{apiOutput}</p>
                ) : (
                  <p className="opacity-30 italic font-serif">"Select an AIP operation above to trigger the structural state calibration loop."</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: DECISION HISTORY & ENTROPY AUDITING */}
        {activeTab === 'AUDIT' && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            <label className="data-label text-white/30 uppercase tracking-[0.2em] text-[9px]">Historical AIP Calibration Decisions</label>
            <div className="border border-white/5 rounded-lg overflow-x-auto">
              <table className="w-full text-left font-mono" style={{ minWidth: '600px' }}>
                <thead className="bg-white/2 border-b border-white/5">
                  <tr>
                    <th className="p-4 text-[9px] text-white/40 uppercase">Time</th>
                    <th className="p-4 text-[9px] text-white/40 uppercase">Semantic Operation</th>
                    <th className="p-4 text-[9px] text-white/40 uppercase">Entropy Before</th>
                    <th className="p-4 text-[9px] text-white/40 uppercase">Entropy After</th>
                    <th className="p-4 text-[9px] text-white/40 uppercase">Net Reduction</th>
                    <th className="p-4 text-[9px] text-white/40 uppercase">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {decisions.length > 0 ? (
                    decisions.map((dec: any, idx: number) => {
                      const reduction = dec.entropyBefore - dec.entropyAfter;
                      return (
                        <tr key={`dec-row-${idx}`} className="hover:bg-white/1 text-[10px]">
                          <td className="p-4 text-white/40">{new Date(dec.timestamp).toLocaleTimeString()}</td>
                          <td className="p-4 text-zinc-100 font-black">{dec.action}</td>
                          <td className="p-4 text-red-400">{dec.entropyBefore.toFixed(5)}</td>
                          <td className="p-4 text-green-400">{dec.entropyAfter.toFixed(5)}</td>
                          <td className="p-4 font-bold text-accent">-{reduction.toFixed(5)} ({((reduction / dec.entropyBefore) * 100).toFixed(1)}%)</td>
                          <td className="p-4">
                            <span className="bg-green-500/20 text-green-400 text-[8px] font-mono font-bold border border-green-500/30 px-1.5 py-0.5 rounded uppercase">
                              {dec.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-white/20 italic font-serif text-sm">
                        "No historical AIP operations registered in this session. Go to Operations to execute alignments."
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
