import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Search, 
  Shield, 
  Trash2, 
  Share2, 
  RefreshCw, 
  Layout, 
  Network, 
  Scissors, 
  Wind, 
  Orbit, 
  Cpu 
} from 'lucide-react';
import { useI18n } from '../i18n';
import { BrainData } from '../types';
import { NeuralManifold } from './NeuralManifold';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const KnowledgeVault = ({ data }: { data: BrainData | null }) => {
  const { t } = useI18n();
  const [fragments, setFragments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [collectiveStrength, setCollectiveStrength] = useState(0);
  const [viewType, setViewType] = useState<'GRID' | 'MANIFOLD'>('GRID');

  const refresh = async () => {
    setLoading(true);
    const { knbService } = await import('../services/knbService');
    const results = searchQuery 
      ? await knbService.search(searchQuery, 20) 
      : await (knbService as any).db.fragments.reverse().toArray();
    setFragments(results);
    const strength = await knbService.getCollectiveStrength();
    setCollectiveStrength(strength);
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    const { knbService } = await import('../services/knbService');
    await knbService.syncCollectiveManifold();
    await refresh();
    setSyncing(false);
  };

  const handleShare = async (id: number) => {
    const { knbService } = await import('../services/knbService');
    await knbService.publishToCloud(id);
    await refresh();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t.purge_confirm)) return;
    const { knbService } = await import('../services/knbService');
    await knbService.removeFragment(id);
    await refresh();
  };

  useEffect(() => { refresh(); }, [searchQuery, data?.memories?.length]);

  return (
    <div className="h-full pt-32 md:pt-56 px-4 md:px-12 lg:px-32 max-w-7xl mx-auto flex flex-col gap-6 md:gap-12 pb-24 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-2 md:gap-4">
          <h2 className="text-2xl md:text-4xl font-serif italic text-white tracking-widest leading-tight">{t.nav_vault.split('(')[0]?.trim() || "Sovereign Vault"}</h2>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <p className="text-[7px] md:text-[10px] tracking-[0.4em] uppercase opacity-40">{t.semantic_manifold_label}</p>
            <div className="hidden md:block h-[1px] w-8 bg-white/10" />
            <div className="flex items-center gap-2 group cursor-help">
               <Zap size={10} className="text-accent" />
               <span className="text-[8px] md:text-[10px] tracking-[0.2em] font-mono text-accent opacity-60 group-hover:opacity-100 transition-opacity">{t.burst_monitor.split('/')[0]?.trim() || "Strength"}: {collectiveStrength}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex ghibli-glass mano-border p-1">
            <button 
              onClick={() => setViewType('GRID')}
              className={cn("p-1.5 md:p-2 transition-all", viewType === 'GRID' ? 'bg-accent text-white' : 'text-white/20 hover:text-white/60')}
            >
              <Layout size={12} className="md:w-3.5 md:h-3.5" />
            </button>
            <button 
              onClick={() => setViewType('MANIFOLD')}
              className={cn("p-1.5 md:p-2 transition-all", viewType === 'MANIFOLD' ? 'bg-accent text-white' : 'text-white/20 hover:text-white/60')}
            >
              <Network size={12} className="md:w-3.5 md:h-3.5" />
            </button>
          </div>

          <button 
            onClick={handleSync}
            disabled={syncing}
            className="flex-1 md:flex-none px-4 md:px-8 py-2 md:py-3 ghibli-glass mano-border text-[8px] md:text-[10px] tracking-[0.4em] uppercase text-accent hover:bg-white/5 transition-all flex items-center justify-center gap-2 md:gap-4"
          >
            {syncing ? <RefreshCw size={12} className="animate-spin md:w-3.5 md:h-3.5" /> : <Shield size={12} className="md:w-3.5 md:h-3.5" />}
            <span>{syncing ? t.syncing_label : t.sync_collective}</span>
          </button>
        </div>
      </div>

      {viewType === 'GRID' ? (
        <>
          <div className="relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-accent/40 group-focus-within:text-accent">
              <Search size={18} />
            </div>
            <input 
              type="text"
              placeholder={t.semantic_search_placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-none p-6 pl-16 text-[11px] tracking-[0.3em] font-mono focus:outline-none focus:border-accent/40 transition-all uppercase"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {fragments.map((f, i) => (
              <motion.div 
                key={f.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "ghibli-glass mano-border p-6 md:p-8 py-8 md:py-10 flex flex-col gap-4 md:gap-6 relative group overflow-hidden transition-all",
                  f.metadata?.source === 'COLLECTIVE' && "border-gold/20 bg-gold/5"
                )}
              >
                <div className="absolute top-0 right-0 p-3 md:p-4 opacity-10 font-mono text-[7px] md:text-[8px]">#{f.id}</div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className={cn("w-1 h-1 md:w-1.5 md:h-1.5 rounded-full", f.metadata?.source === 'COLLECTIVE' ? 'bg-accent animate-pulse' : 'bg-gold')} />
                  <span className="text-[7px] md:text-[9px] tracking-[0.4em] uppercase opacity-40">
                    [{f.metadata?.source || 'LOCAL'}]
                  </span>
                </div>
                <p className="text-xs md:text-sm leading-relaxed text-ink/80 font-serif italic line-clamp-4 md:line-clamp-none">{f.content}</p>
                
                <div className="mt-auto pt-4 md:pt-6 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[7px] md:text-[8px] font-mono text-white/20">{new Date(f.timestamp).toLocaleDateString()}</span>
                  
                  <div className="flex items-center gap-3 md:gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                      {!f.isShared && f.metadata?.source !== 'COLLECTIVE' && (
                        <button 
                          onClick={() => handleShare(f.id)}
                          className="text-[7px] md:text-[8px] tracking-[0.2em] uppercase text-accent hover:text-white transition-colors flex items-center gap-1"
                        >
                          <Share2 size={8} className="md:w-2.5 md:h-2.5" /> {t.market_resonance.includes('Reso') ? "Share" : "分享"}
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(f.id)}
                        className="text-[7px] md:text-[8px] tracking-[0.2em] uppercase text-red-500/40 hover:text-red-400 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={8} className="md:w-2.5 md:h-2.5" /> {t.purge_label}
                      </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {!loading && fragments.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-20 text-[10px] tracking-[0.5em] uppercase">{t.no_fragments}</div>
            )}
          </div>
        </>
      ) : (
        <div className="h-[600px] ghibli-glass mano-border border-white/5 overflow-hidden">
           <NeuralManifold onSync={refresh} />
        </div>
      )}
    </div>
  );
};
