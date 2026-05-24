import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Cpu, 
  Shield, 
  ShieldCheck, 
  Activity, 
  AlertTriangle,
  Scale
} from 'lucide-react';
import { useI18n } from '../i18n';
import { BrainData } from '../types';
import { vedaService } from '../services/vedaService';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const LiteratureReview = ({ data, onToggleBurst }: { data: BrainData | null, onToggleBurst: () => void }) => {
  const { t } = useI18n();
  return (
    <div className="h-full pt-32 md:pt-40 px-4 md:px-12 lg:px-32 max-w-5xl mx-auto flex flex-col gap-12 pb-24 overflow-y-auto custom-scrollbar">
       <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-[1px] bg-accent" />
             <h2 className="text-[10px] tracking-[0.8em] uppercase text-accent font-mono">{t.live_audit}</h2>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif italic text-white leading-tight">
             {t.review_title}<br/>{t.review_subtitle}
          </h1>
          <p className="text-xs md:text-sm text-white/40 tracking-widest font-mono uppercase">
             {t.system_archive}
          </p>
       </div>

       <div className="p-8 ghibli-glass border border-accent/30 flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
             <Cpu size={120} className="text-accent" />
          </div>
          
          <div className="flex justify-between items-center relative z-10">
             <div className="flex flex-col gap-1">
                <span className="text-[9px] font-mono text-accent uppercase tracking-widest">{t.live_audit}</span>
                <h3 className="text-lg font-display text-white/90 italic tracking-wider">{t.cognitive_path}</h3>
             </div>
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => vedaService.postAction({ action: 'OPTIMIZE_COGNITION', params: {} })}
                  className="px-3 py-1 border border-accent/40 text-[8px] font-mono text-accent hover:bg-accent hover:text-black transition-all uppercase tracking-tighter"
                >
                   {t.execute_optimization}
                </button>
                <div className={`px-4 py-1 rounded-full border text-[9px] font-mono tracking-[0.2em] ${data?.audit_status === 'OPTIMAL' ? 'border-green-400/40 text-green-400 bg-green-400/5' : 'border-amber-400/40 text-amber-400 bg-amber-400/5'}`}>
                   {t.status}: {data?.audit_status || t.initializing}
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-4 p-6 bg-white/5 border border-white/5 rounded-sm">
             <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">{t.tension_nexus}</span>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   <span className="text-[10px] font-mono text-accent">{t.balancing}</span>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="flex flex-col gap-3">
                   <div className="flex justify-between items-end">
                      <label className="text-[8px] font-mono text-white/30 uppercase">{t.control_boundary}</label>
                      <span className="text-xs font-mono text-white">{(Number(data?.stability || 0) * 100).toFixed(1)}%</span>
                   </div>
                   <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(data?.stability || 0) * 100}%` }}
                        className="h-full bg-accent"
                      />
                   </div>
                </div>
                <div className="flex flex-col gap-3">
                   <div className="flex justify-between items-end border-l border-white/10 pl-12 md:pl-0">
                      <label className="text-[8px] font-mono text-white/30 uppercase">{t.autonomy_evolution}</label>
                      <span className="text-xs font-mono text-white">{(Number(data?.variational_free_energy || 0) * 150).toFixed(1)}%</span>
                   </div>
                   <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (data?.variational_free_energy || 0) * 150)}%` }}
                        className="h-full bg-pink-400/60"
                      />
                   </div>
                </div>
             </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-8 relative">
             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2 hidden md:block" />
             
             <div className="z-10 flex flex-col items-center gap-2 group">
                <motion.div 
                  animate={{ scale: [1, 1.1 + (data?.tension_index || 0) * 0.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-12 h-12 rounded-full ghibli-glass mano-border flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-black transition-all"
                >
                   <Zap size={18} />
                </motion.div>
                <div className="flex flex-col items-center">
                   <span className="text-[8px] font-mono uppercase text-white/40">V-AA Core</span>
                   <span className="text-[7px] font-mono text-accent">{(Number(data?.pipeline?.generator_output || 0) * 100).toFixed(0)}%</span>
                </div>
             </div>

             <div className="z-10 flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full ghibli-glass mano-border flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-all">
                   <Shield size={18} />
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-[8px] font-mono uppercase text-white/40">Epistemic Shield</span>
                   <span className="text-[7px] font-mono text-cyan-400">ACTIVE_v6.1</span>
                </div>
             </div>

             <button 
               onClick={() => onToggleBurst?.()}
               className="z-10 flex flex-col items-center gap-2 group cursor-pointer"
             >
                <div className="w-12 h-12 rounded-full ghibli-glass mano-border flex items-center justify-center text-orange-400 group-hover:bg-orange-400 group-hover:text-black transition-all">
                   <Zap size={18} className={cn(data?.is_bursting && "animate-pulse")} />
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-[8px] font-mono uppercase text-white/40">Sovereign Burst</span>
                   <span className={cn("text-[7px] font-mono", data?.is_bursting ? "text-orange-400" : "text-white/20")}>
                     {data?.is_bursting ? "RESONATING" : "STANDBY"}
                   </span>
                </div>
             </button>

             <div className="z-10 flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full ghibli-glass mano-border flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition-all">
                   <ShieldCheck size={18} />
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-[8px] font-mono uppercase text-white/40">Constraint</span>
                   <span className="text-[7px] font-mono text-amber-400">{(Number(data?.pipeline?.constraint_load || 0) * 100).toFixed(0)}%</span>
                </div>
             </div>

             <div className="z-10 flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full ghibli-glass mano-border flex items-center justify-center text-pink-400 group-hover:bg-pink-400 group-hover:text-black transition-all">
                   <Cpu size={18} />
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-[8px] font-mono uppercase text-white/40">Actor Model</span>
                   <span className="text-[7px] font-mono text-pink-400">{(Number(data?.pipeline?.actor_coherence || 0) * 100).toFixed(0)}%</span>
                </div>
             </div>

             <div className="z-10 flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full ghibli-glass mano-border flex items-center justify-center text-red-400 group-hover:bg-red-400 group-hover:text-black transition-all">
                   <Activity size={18} />
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-[8px] font-mono uppercase text-white/40">Trigger Sim</span>
                   <span className="text-[7px] font-mono text-red-400">{(Number(data?.pipeline?.trigger_fidelity || 0) * 100).toFixed(0)}%</span>
                </div>
             </div>

             <div className="z-10 flex flex-col items-center gap-4">
                <div className="flex flex-col items-center">
                   <span className="text-[8px] font-mono text-accent uppercase mb-1">Final Score</span>
                   <motion.div 
                     animate={{ 
                       x: (data?.failure_analysis?.logic_drift || 0) > 0.3 ? [0, -2, 2, -1, 1, 0] : 0,
                       opacity: (data?.failure_analysis?.logic_drift || 0) > 0.4 ? 0.6 : 1
                     }}
                     transition={{ repeat: Infinity, duration: 2 }}
                     className="text-4xl font-display text-white tracking-widest relative"
                   >
                     {(data?.confidence_score || 0).toFixed(1)}
                     {(data?.failure_analysis?.logic_drift || 0) > 0.3 && (
                       <div className="absolute -top-2 -right-4 text-[6px] text-red-500 font-mono animate-pulse">DRIFTING</div>
                     )}
                   </motion.div>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-4">
             <div className="flex justify-between items-center">
                <span className="text-[8px] font-mono text-white/30 uppercase">{t.audit_conclusion}</span>
                <span className={`text-[8px] font-mono px-2 py-0.5 rounded-sm ${data?.confidence_score && data.confidence_score > 90 ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>
                   COGNITIVE_MODE: {data?.confidence_score && data.confidence_score > 90 ? t.cognitive_zenith : t.cognitive_turbulent}
                </span>
             </div>
             <p className="text-xs text-white/70 leading-relaxed italic border-l border-white/10 pl-4 py-1">
                {data?.confidence_score && data.confidence_score > 85 
                 ? t.pipeline_ok
                 : t.pipeline_fail((Number(data?.failure_analysis?.logic_drift || 0) * 100).toFixed(1))}
             </p>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-8">
             <div className="p-8 ghibli-glass mano-border flex flex-col gap-6 relative group h-full">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-green-400 rounded-full" />
                   <h3 className="text-sm font-display tracking-widest text-white/90">{t.commonalities}</h3>
                </div>
                <div className="flex flex-col gap-4">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-accent font-mono uppercase">{t.comm_01_title}</span>
                      <p className="text-[11px] leading-relaxed text-white/60">{t.comm_01_desc}</p>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-accent font-mono uppercase">{t.comm_02_title}</span>
                      <p className="text-[11px] leading-relaxed text-white/60">{t.comm_02_desc}</p>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-accent font-mono uppercase">{t.comm_03_title}</span>
                      <p className="text-[11px] leading-relaxed text-white/60">{t.comm_03_desc}</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-8">
             <div className="p-8 ghibli-glass mano-border flex flex-col gap-6 relative group h-full">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-red-400 rounded-full" />
                   <h3 className="text-sm font-display tracking-widest text-white/90">{t.contradictions}</h3>
                </div>
                <div className="flex flex-col gap-4">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-red-400 font-mono uppercase">{t.chall_01_title}</span>
                      <p className="text-[11px] leading-relaxed text-white/60">{t.chall_01_desc}</p>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-red-400 font-mono uppercase">{t.chall_02_title}</span>
                      <p className="text-[11px] leading-relaxed text-white/60">{t.chall_02_desc}</p>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-red-400 font-mono uppercase">{t.chall_03_title}</span>
                      <p className="text-[11px] leading-relaxed text-white/60">{t.chall_03_desc}</p>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <div className="p-8 md:p-16 ghibli-glass border-l-2 border-accent flex flex-col gap-12">
          <div className="flex flex-col gap-4">
              <h3 className="text-xl font-serif italic text-white">{t.veda_countermeasure}</h3>
             <p className="text-xs text-white/40 leading-relaxed max-w-2xl">
                {t.veda_defense_desc}
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                   <ShieldCheck size={14} className="text-accent" />
                   <span className="text-[10px] font-mono tracking-widest text-white/80">{t.defense_01_title}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-white/50">
                   {t.defense_01_desc}
                </p>
             </div>
             <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                   <Scale size={14} className="text-cyan-400" />
                   <span className="text-[10px] font-mono tracking-widest text-white/80">{t.defense_02_title}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-white/50">
                   {t.defense_02_desc}
                </p>
             </div>
             <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                   <Zap size={14} className="text-amber-400" />
                   <span className="text-[10px] font-mono tracking-widest text-white/80">{t.defense_03_title}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-white/50">
                   {t.defense_03_desc}
                </p>
             </div>
          </div>
       </div>
    </div>
  );
};
