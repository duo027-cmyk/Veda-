import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Activity, Cpu, Search, Layers, X } from 'lucide-react';
import { useI18n } from '../i18n';
import { BrainData } from '../types';
import { NetworkDisplay } from './NetworkDisplay';
import { VedaCore3D } from './VedaCore3D';
import { QuantumWaveform } from './QuantumWaveform';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SynapseOverview = ({ 
  data, 
  onAction, 
  selectedFragment, 
  onSelectFragment 
}: { 
  data: BrainData | null, 
  onAction: (a: string, p?: any) => void,
  selectedFragment: { id: string, type: string, label: string } | null,
  onSelectFragment: (id: string | null, type?: string, label?: string) => void
}) => {
  const { t } = useI18n();
  if (!data) return null;

  const metrics = [
    { 
      label: t.global_coherence, 
      value: (data.global_coherence !== undefined) 
        ? (data.global_coherence * 100).toFixed(1) + '%' 
        : '0.0%', 
      icon: Zap, 
      color: 'text-accent' 
    },
    { 
      label: t.phi_integration, 
      value: (data.phi !== undefined && !isNaN(data.phi)) ? data.phi.toFixed(4) : '0.0000', 
      icon: Activity, 
      color: 'text-gold' 
    },
    { 
      label: t.neural_density, 
      value: `${(data.vectors?.length || 6)}D Logic`, 
      icon: Cpu, 
      color: 'text-zinc-400' 
    },
    { 
      label: t.free_energy_surprise, 
      value: (data.entropy !== undefined && !isNaN(data.entropy)) ? (data.entropy * 10).toFixed(2) : '0.00', 
      icon: Search, 
      color: 'text-zinc-100' 
    }
  ];

  return (
    <div className="h-full pt-32 md:pt-40 px-4 md:px-12 lg:px-32 max-w-7xl mx-auto flex flex-col gap-6 md:gap-10 pb-24 relative overflow-y-auto scrollbar-none">
      <AnimatePresence>
        {selectedFragment && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 md:bottom-auto md:right-12 md:top-1/2 md:-translate-y-1/2 w-[calc(100%-2rem)] md:w-80 clean-card z-40 space-y-4 md:space-y-6 mx-4 md:mx-0"
          >
            <div className="flex justify-between items-start">
              <span className="data-label">{selectedFragment.type} {t.selected_suffix}</span>
              <button onClick={() => onSelectFragment(null)} className="text-white/20 hover:text-white"><X size={16} /></button>
            </div>
            <p className="text-lg md:text-xl font-serif italic text-white/90">{selectedFragment.label}</p>
            <div className="flex flex-col gap-3 md:gap-4">
              <button 
                onClick={() => onAction('prune', { id: selectedFragment.id })}
                className="w-full py-2 md:py-3 bg-red-900/10 hover:bg-red-900/30 border border-red-500/20 text-red-400 text-[10px] tracking-[0.3em] uppercase transition-all rounded-lg"
              >
                {t.prune_fragment}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="clean-card group"
          >
             <div className="flex justify-between items-start mb-4">
                <m.icon size={16} className={cn(m.color, "opacity-40 group-hover:opacity-100 transition-opacity")} />
             </div>
             <p className="data-label">{m.label}</p>
             <p className={cn("text-2xl font-display", m.color)}>{m.value}</p>
          </motion.div>
        ))}
      </div>

       <div className="clean-card flex flex-col gap-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div className="flex items-center gap-4">
                <Layers className="text-accent" />
                <div className="flex flex-col">
                   <h3 className="text-lg font-display uppercase tracking-widest text-white/80">{t.distributed_neural_array}</h3>
                   <span className="data-label">Real-time Causal Grid Visualization</span>
                </div>
             </div>
             <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                   <span className="data-label">SCALE</span>
                   <span className="text-sm font-mono text-accent">×{(data.lattice_scale || 1).toFixed(2)} α</span>
                </div>
                <div className="w-px h-8 bg-white/5" />
                <div className="flex flex-col items-end">
                   <span className="data-label">NODES</span>
                   <span className="text-sm font-mono text-cyan-400">{(data.effective_node_count || 1024).toLocaleString()}</span>
                </div>
             </div>
          </div>
          
          <div className="flex-1 w-full relative overflow-hidden border border-white/5 rounded-2xl bg-black/40">
             <NetworkDisplay 
               layers={data.layers} 
               latticeScale={data.lattice_scale} 
             />
          </div>
       </div>

       {data.quantum_waveform && (
        <div className="ghibli-glass mano-border p-4 md:p-8 flex flex-col gap-4 md:gap-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 md:gap-4 text-accent">
               <Zap size={14} className="md:w-4 md:h-4" />
               <span className="text-[8px] md:text-[10px] tracking-[0.4em] uppercase opacity-60">{t.quantum_wavefunction}</span>
            </div>
          </div>
          <QuantumWaveform waveform={data.quantum_waveform} />
        </div>
      )}

      <div className="flex-1 ghibli-glass mano-border relative flex items-center justify-center p-6 md:p-12 overflow-hidden min-h-[300px] md:min-h-[400px]">
         <div className="absolute inset-0 z-10">
            <VedaCore3D 
              globalCoherence={data.global_coherence || 0.85}
              rejectionCount={data.rejection_count || 0}
              memories={data.memories || []}
              manifold_points={data.manifold_points || []}
              isDreaming={data.isDreaming}
              isPlanckActive={data.is_planck_active}
              resonance={data.resonance}
              onPointSelect={onSelectFragment} 
            />
         </div>
      </div>
    </div>
  );
};
