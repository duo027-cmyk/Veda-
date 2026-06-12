import React, { useMemo, useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Shield, Database, Trash2, Zap, X, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { knbService, type KnowledgeFragment } from '../services/knbService';
import { localGradientBuffer } from '../services/localGradientBuffer';

interface ManifoldNode {
  id: string;
  content: string;
  val: number;
  metadata?: any;
  timestamp: number;
  isShared?: boolean;
  fragmentId: number;
}

interface Link {
  source: string;
  target: string;
}

export const NeuralManifold = ({ onSync }: { onSync?: () => void }) => {
  const [fragments, setFragments] = useState<KnowledgeFragment[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const fgRef = useRef<any>(null);
  const [tick, setTick] = useState(0);

  const [gradientStats, setGradientStats] = useState({
    gradientNorm: 0.052,
    alignedEntropy: 0.18,
    intensity: 0.5,
  });

  // Smooth trig animation oscillation
  useEffect(() => {
    let animId = requestAnimationFrame(function anim() {
      setTick(t => (t + 1) % 100000);
      animId = requestAnimationFrame(anim);
    });
    return () => cancelAnimationFrame(animId);
  }, []);

  // Sync real-time weights and gradient parameters from localGradientBuffer
  useEffect(() => {
    const updateStats = async () => {
      const stats = await localGradientBuffer.calculateOptimizationVector();
      setGradientStats(stats);
      
      // Dynamic D3 physics adjustment based on live weight gradient tuning
      if (fgRef.current) {
        const fg = fgRef.current;
        fg.d3Force('charge')?.strength(-35 - stats.intensity * 45);
        fg.d3Force('link')?.distance(35 + stats.alignedEntropy * 55);
        fg.d3ReheatSimulation();
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, []);

  const load = async () => {
    setLoading(true);
    await knbService.init();
    // Fetch all for the graph
    const all = await (knbService as any).db.fragments.toArray();
    setFragments(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const data = useMemo(() => {
    const nodes: ManifoldNode[] = fragments.map(f => ({
      id: f.id!.toString(),
      content: f.content,
      val: f.metadata?.relevance ? f.metadata.relevance * 5 : 5,
      metadata: f.metadata,
      timestamp: f.timestamp,
      isShared: f.isShared,
      fragmentId: f.id!
    }));

    const links: Link[] = [];
    // 1. Explicit Causal Links
    nodes.forEach(node => {
      const fragment = fragments.find(f => f.id!.toString() === node.id);
      if (fragment?.causalLinks) {
        fragment.causalLinks.forEach(targetId => {
          if (nodes.some(n => n.id === targetId)) {
            links.push({ source: node.id, target: targetId });
          }
        });
      }
    });

    // 2. Semantic Similarity Links (Fallback / Reinforcement)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].metadata?.type === nodes[j].metadata?.type && nodes[i].metadata?.type !== 'UNCATEGORIZED') {
           links.push({ source: nodes[i].id, target: nodes[j].id });
        }
      }
    }
    return { nodes, links };
  }, [fragments]);

  const selectedFragment = fragments.find(f => f.id === selectedId);

  return (
    <div className="relative w-full h-full bg-bg overflow-hidden">
      <div className="absolute top-12 left-12 z-50 flex flex-col gap-2">
         <h3 className="text-2xl font-serif italic text-white tracking-widest uppercase">Neural Manifold</h3>
         <p className="text-[10px] tracking-[0.4em] uppercase text-accent/60">Multidimensional Logic Mapping</p>
      </div>

      <div className="absolute top-12 right-12 z-50 flex flex-col gap-4">
         <button 
           onClick={load}
           className="w-12 h-12 ghibli-glass mano-border flex items-center justify-center text-accent hover:text-white transition-all shadow-[0_0_20px_rgba(242,125,38,0.2)]"
         >
           <Zap size={18} className={loading ? "animate-spin" : ""} />
         </button>
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeLabel="content"
        nodeColor={(node: any) => node.metadata?.source === 'COLLECTIVE' ? '#F27D26' : '#FFFFFF'}
        linkColor={() => 'rgba(255,255,255,0.05)'}
        backgroundColor="transparent"
        nodeRelSize={2}
        onNodeClick={(node: any) => setSelectedId(parseInt(node.id))}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.content.substring(0, 15) + (node.content.length > 15 ? '...' : '');
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px "JetBrains Mono"`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

          // Dynamic pulsing aura reflecting real-time weights/gradients adjustment
          const pulseRadius = 5 + Math.sin(tick * 0.05 + parseFloat(node.id || '0')) * (gradientStats.intensity * 6);
          ctx.beginPath();
          ctx.arc(node.x, node.y, pulseRadius, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.metadata?.source === 'COLLECTIVE' 
            ? `rgba(242, 125, 38, ${0.05 + gradientStats.intensity * 0.12})` 
            : `rgba(139, 92, 246, ${0.04 + gradientStats.intensity * 0.1})`; // standard accent purple or orange
          ctx.fill();

          ctx.fillStyle = node.metadata?.source === 'COLLECTIVE' ? 'rgba(242, 125, 38, 0.1)' : 'rgba(255, 255, 255, 0.05)';
          ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = node.metadata?.source === 'COLLECTIVE' ? '#F27D26' : 'rgba(255,255,255,0.4)';
          ctx.fillText(label, node.x, node.y);

          // Node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, 1.5, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.metadata?.source === 'COLLECTIVE' ? '#F27D26' : '#FFFFFF';
          ctx.fill();
        }}
      />

      <AnimatePresence>
        {selectedFragment && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute top-32 right-12 w-80 ghibli-glass mano-border p-8 z-[60] flex flex-col gap-6 backdrop-blur-3xl"
          >
            <div className="flex justify-between items-start">
               <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", selectedFragment.metadata?.source === 'COLLECTIVE' ? 'bg-accent animate-pulse' : 'bg-gold')} />
                  <span className="text-[10px] tracking-[0.4em] uppercase opacity-40">[{selectedFragment.metadata?.source || 'LOCAL'}]</span>
               </div>
               <button onClick={() => setSelectedId(null)} className="opacity-20 hover:opacity-100 text-white transition-all">
                 <X size={14} />
               </button>
            </div>

            <p className="text-sm leading-relaxed text-ink/80 font-serif italic">
               "{selectedFragment.content}"
            </p>

            <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
               <div className="flex justify-between text-[8px] font-mono opacity-40 uppercase tracking-widest">
                  <span>Timestamp</span>
                  <span>{new Date(selectedFragment.timestamp).toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-[8px] font-mono opacity-40 uppercase tracking-widest">
                  <span>Type</span>
                  <span>{selectedFragment.metadata?.type || 'OBSERVATION'}</span>
               </div>
            </div>

            <div className="flex gap-4">
               {!selectedFragment.isShared && selectedFragment.metadata?.source !== 'COLLECTIVE' && (
                 <button 
                   onClick={async () => {
                     await knbService.publishToCloud(selectedFragment.id!);
                     load();
                     if (onSync) onSync();
                   }}
                   className="flex-1 py-3 ghibli-glass mano-border text-[9px] tracking-[0.4em] uppercase text-accent hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2"
                 >
                   <Share2 size={12} /> Share
                 </button>
               )}
               {(selectedFragment.isShared || selectedFragment.metadata?.source === 'COLLECTIVE') && (
                 <div className="flex-1 py-3 ghibli-glass mano-border text-[9px] tracking-[0.4em] uppercase text-gold/60 flex items-center justify-center gap-2">
                    <Shield size={12} /> Synchronized
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Weight & Gradient HUD */}
      <div className="absolute bottom-12 left-12 z-50 flex flex-col gap-4 max-w-sm pointer-events-auto">
        <div className="ghibli-glass mano-border p-6 rounded-2xl flex flex-col gap-4 backdrop-blur-3xl shadow-lg border border-white/5 bg-panel/90 text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent animate-pulse" />
              <span className="text-[10px] tracking-[0.25em] font-mono uppercase text-ink font-bold">
                Local Gradient Telemetry
              </span>
            </div>
            <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest animate-pulse">
              Active Align
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-wider mb-1">Gradient Norm</span>
              <span className="text-xs font-mono text-white font-semibold">
                {gradientStats.gradientNorm.toFixed(6)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-wider mb-1">Aligned Entropy</span>
              <span className="text-xs font-mono text-accent font-semibold">
                {gradientStats.alignedEntropy.toFixed(4)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-wider mb-1">Backprop Force</span>
              <span className="text-xs font-mono text-gold font-semibold">
                {(gradientStats.intensity * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Sparkline track bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[8px] font-mono text-white/30 uppercase tracking-widest">
              <span>Hyper-lattice tension</span>
              <span>{(gradientStats.gradientNorm * 1000).toFixed(1)} N/rad</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-accent h-full shadow-[0_0_8px_rgba(139,92,246,0.6)] transition-all duration-300"
                style={{ width: `${Math.min(100, (gradientStats.gradientNorm / 0.15) * 100)}%` }}
              />
            </div>
          </div>

          <p className="text-[9.5px] leading-relaxed font-sans text-white/40 mt-1">
            Gradients calculated locally overlay browser cadence inputs (typing/delay vectors) directly onto standard d3 vector coordinates, achieving homeostatic self-correction.
          </p>

          <div className="flex gap-2.5 mt-1 pt-3 border-t border-white/5">
            <button
               onClick={async () => {
                 // Trigger cognitive bursts to watch physical vibration
                 await localGradientBuffer.recordPattern("TYPING_SPEED", Math.random() * 250 + 150);
                 await localGradientBuffer.recordPattern("DECISION_LATENCY", Math.random() * 1100 + 400);
                 const stats = await localGradientBuffer.calculateOptimizationVector();
                 setGradientStats(stats);
                 // Fire physical spike
                 if (fgRef.current) {
                   fgRef.current.d3Force('charge')?.strength(-120);
                   fgRef.current.d3Force('link')?.distance(90);
                   fgRef.current.d3ReheatSimulation();
                 }
               }}
               className="flex-1 py-2 rounded-xl border border-accent/20 bg-accent-soft text-[9px] tracking-[0.2em] uppercase text-accent hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap size={11} className="animate-bounce" /> Stimulate
            </button>
            <button
               onClick={async () => {
                 await localGradientBuffer.purgeOldPatterns();
                 const stats = await localGradientBuffer.calculateOptimizationVector();
                 setGradientStats(stats);
               }}
               className="py-2 px-3 rounded-xl border border-white/5 bg-transparent text-[9px] tracking-[0.2em] uppercase text-white/30 hover:text-white/80 hover:border-white/20 transition-all flex items-center justify-center cursor-pointer font-mono"
               title="Reset pattern memory buffer"
            >
              PURGE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
