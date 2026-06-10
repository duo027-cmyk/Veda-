import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Activity,
  Cpu,
  Link as LinkIcon,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Trophy,
} from 'lucide-react';
import { vedaService } from '../services/vedaService';

interface GraphNode {
  id: string;
  type: string;
  content: string;
  resonance: number;
  coherence: number;
  timestamp: number | string;
  feedbackScore?: number;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  strength: number;
  type: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export const KnowledgeGraph: React.FC = () => {
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const graphRef = useRef<any>(null);

  const fetchGraph = useCallback(async (isAuto = true) => {
    if (!isAuto) setIsSyncing(true);
    try {
      const graphData = await vedaService.getGraphData();
      setData(graphData);
    } catch (error) {
      console.error('Failed to fetch graph data', error);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchGraph();
    const interval = setInterval(() => fetchGraph(true), 15000);
    return () => clearInterval(interval);
  }, [fetchGraph]);

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 600);
      graphRef.current.zoom(2.5, 600);
    }
  };

  const handleFeedback = async (score: number) => {
    if (!selectedNode) return;
    try {
      await vedaService.submitFeedback(selectedNode.id, score);
      // Optimistic update
      setSelectedNode({
        ...selectedNode,
        feedbackScore: (selectedNode.feedbackScore || 0) + score,
        coherence: Math.min(1, Math.max(0, selectedNode.coherence + score * 0.1)),
      });
      fetchGraph(true);
    } catch (error) {
      console.error('Feedback failed', error);
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-950/40 rounded-2xl overflow-hidden border border-white/5 backdrop-blur-xl min-h-[500px] shadow-2xl">
      {/* Header Info */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-4 pointer-events-none">
        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 backdrop-blur-md">
          <Cpu className="w-6 h-6 text-blue-400 animate-pulse" />
        </div>
        <div>
          <h3 className="text-slate-100 font-semibold text-base tracking-tight leading-none mb-1">
            Sovereign Knowledge Lattice
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-blue-400/60 text-[10px] uppercase tracking-widest font-mono font-bold">
              Active Neural Inference Cycle v8.4
            </p>
          </div>
        </div>
      </div>

      {/* Control Overlay */}
      <div className="absolute top-6 right-6 z-10 flex gap-2">
        <button
          onClick={() => fetchGraph(false)}
          disabled={isSyncing}
          className="p-2.5 bg-slate-900/50 hover:bg-slate-800 rounded-lg border border-white/5 transition-all group"
          title="Manual Force Ingestion"
        >
          <RefreshCw className={`w-4 h-4 text-slate-400 group-hover:text-white ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="w-full h-full flex flex-col items-center justify-center min-h-[500px] gap-4">
          <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em]">Reconstructing Lattice Path...</p>
        </div>
      ) : (
        <ForceGraph2D
          ref={graphRef}
          graphData={data}
          nodeLabel={(node: any) => node.content?.substring(0, 50) + '...'}
          nodeColor={(node: any) => {
            if (node.type === 'DISTILLED_CONTEXT') return '#3b82f6';
            if (node.type === 'AXIOM') return '#f59e0b';
            return '#10b981';
          }}
          nodeRelSize={7}
          linkColor={(link: any) => {
            if (link.type === 'DECOUPLED_SPURIOUS') return 'rgba(244, 63, 94, 0.9)';
            return 'rgba(71, 85, 105, 0.3)';
          }}
          linkWidth={(link: any) => {
            if (link.type === 'DECOUPLED_SPURIOUS') return 1.5;
            return (link.strength || 0.5) * 3;
          }}
          linkDirectionalParticles={(link: any) => {
            if (link.type === 'DECOUPLED_SPURIOUS') return 0;
            return 1;
          }}
          linkDirectionalParticleSpeed={(link: any) => {
            if (link.type === 'DECOUPLED_SPURIOUS') return 0;
            return (link.strength || 0.5) * 0.01;
          }}
          linkDirectionalParticleWidth={(link: any) => {
            if (link.type === 'DECOUPLED_SPURIOUS') return 0;
            return (link.strength || 0.5) * 3;
          }}
          onNodeClick={handleNodeClick}
          backgroundColor="transparent"
          cooldownTicks={100}
        />
      )}

      {/* Node Details Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            key="node-details"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="absolute top-0 right-0 w-80 md:w-96 h-full bg-slate-900/40 border-l border-white/5 p-8 backdrop-blur-2xl z-20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-col gap-2">
                <div className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-tight bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-block w-fit">
                  {selectedNode.type}
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider font-mono">Rank: Optimized</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                aria-label="Close details"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <h4 className="text-slate-100 font-bold text-xl leading-tight mb-6 font-sans tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
              Fragment Intelligence
            </h4>

            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-3">
                  <Activity className="w-4 h-4" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Semantic Engine Output</span>
                </div>
                <div className="p-5 bg-slate-950/80 rounded-2xl border border-white/5 text-slate-300 text-sm leading-relaxed font-sans subpixel-antialiased italic relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
                  "{selectedNode.content}"
                </div>
              </div>

              {/* Enhanced Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 group hover:border-blue-500/30 transition-colors">
                  <div className="text-slate-600 text-[9px] uppercase font-mono tracking-widest mb-1.5">Resonance</div>
                  <div className="text-blue-400 font-mono text-2xl tabular-nums tracking-tighter">{(selectedNode.resonance * 100).toFixed(1)}%</div>
                  <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedNode.resonance * 100}%` }}
                      className="h-full bg-blue-500/50"
                    />
                  </div>
                </div>
                <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 group hover:border-emerald-500/30 transition-colors">
                  <div className="text-slate-600 text-[9px] uppercase font-mono tracking-widest mb-1.5">Coherence</div>
                  <div className="text-emerald-400 font-mono text-2xl tabular-nums tracking-tighter">{(selectedNode.coherence * 100).toFixed(1)}%</div>
                   <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedNode.coherence * 100}%` }}
                      className="h-full bg-emerald-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                   <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">System Feedback Loop</div>
                   <div className="text-[10px] font-mono text-blue-400/60 bg-blue-500/5 px-2 py-0.5 rounded">
                     {selectedNode.feedbackScore || 0} PTS
                   </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleFeedback(1)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all text-emerald-400 text-xs font-bold uppercase tracking-wider"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Reinforce
                  </button>
                  <button 
                    onClick={() => handleFeedback(-1)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all text-rose-400 text-xs font-bold uppercase tracking-wider"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Prune
                  </button>
                </div>
              </div>

              {/* Adjacent Causal Connections */}
              {(() => {
                const nodeLinks = data.links.filter(l => {
                  const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
                  const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
                  return sourceId === selectedNode.id || targetId === selectedNode.id;
                });
                if (nodeLinks.length === 0) return null;
                return (
                  <div className="pt-6 border-t border-white/5">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">Adjacent Causal Connections</div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {nodeLinks.map((link, idx) => {
                        const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
                        const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
                        const isSpurious = link.type === 'DECOUPLED_SPURIOUS';
                        const otherNodeId = sourceId === selectedNode.id ? targetId : sourceId;
                        const otherNode = data.nodes.find(n => n.id === otherNodeId);
                        const direction = sourceId === selectedNode.id ? "➔" : "←";
                        return (
                          <div key={idx} className="flex items-center justify-between text-[11px] font-mono py-2 px-3 bg-slate-950/40 rounded-lg border border-white/5 hover:border-white/10 transition-colors" style={{ borderLeft: isSpurious ? '2px solid rgba(244, 63, 94, 0.8)' : '2px solid rgba(16, 185, 129, 0.8)' }}>
                            <span className="truncate max-w-[140px] text-slate-300 flex items-center gap-1.5" title={otherNode?.content || otherNodeId}>
                              <span className={isSpurious ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>{direction}</span>
                              {otherNode ? otherNode.content.substring(0, 18) + '...' : otherNodeId}
                            </span>
                            {isSpurious ? (
                              <span className="text-rose-400 px-1.5 py-0.5 bg-rose-500/10 rounded border border-rose-500/20 text-[9px] font-bold uppercase tracking-wide animate-pulse">
                                SPURIOUS
                              </span>
                            ) : (
                              <span className="text-emerald-400 px-1.5 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20 text-[9px] font-bold">
                                {(link.strength || 0.5).toFixed(2)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center bg-slate-950/20 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <span className="text-[10px] font-mono uppercase tracking-tight text-slate-400">Anchor</span>
                  </div>
                  <div className="text-slate-300 text-[10px] font-mono">
                    {new Date(selectedNode.timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-950/20 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <LinkIcon className="w-4 h-4 text-slate-600" />
                    <span className="text-[10px] font-mono uppercase tracking-tight text-slate-400">Node ID Signature</span>
                  </div>
                  <div className="text-slate-600 text-[9px] font-mono truncate break-all bg-black/40 p-2.5 rounded border border-white/5 select-all">
                    {selectedNode.id}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
