import React, { useMemo, useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Shield, Database, Trash2, Zap, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { knbService, type KnowledgeFragment } from '../services/knbService';

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
    </div>
  );
};
