import React, { useState } from 'react';
import { 
  Zap, 
  Cpu, 
  Search,
  Lock,
  Unlock,
  Eye,
  Shield,
  Network,
  Brain
} from 'lucide-react';
import { useI18n } from '../i18n';
import { BrainData } from '../types';
import { vedaService } from '../services/vedaService';
import { auth } from '../firebase';
import { CuriosityMonitor } from './CuriosityMonitor';
import { cn } from '../lib/utils';

export const CoreConfig = ({ data, onUpdate }: { data: BrainData | null, onUpdate: () => void }) => {
  const { t } = useI18n();
  const [params, setParams] = useState({ 
    mutationRate: 0.12, 
    mutationStrength: 0.05, 
    stabilityWeight: 0.4 
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const updateNudge = async (newParams: any) => {
    setParams(newParams);
    await fetch('/api/v1/nudge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newParams)
    });
  };

  const toggleFreeze = async () => {
    setIsUpdating(true);
    await fetch('/api/v1/toggle-freeze', { method: 'POST' });
    onUpdate();
    setIsUpdating(false);
  };

  const toggleFocus = async () => {
    await vedaService.updatePersistence({ settings: { isFocusMode: !data?.settings?.isFocusMode } });
    onUpdate();
  };

  const toggleDeepThinking = async () => {
    await vedaService.updatePersistence({ settings: { isDeepThinking: !data?.settings?.isDeepThinking } });
    onUpdate();
  };

  if (!data) return null;

  return (
    <div className="h-full flex items-center justify-center p-4 md:p-20 pt-32 md:pt-40 pb-24 md:pb-20 overflow-y-auto">
      <div className="clean-card max-w-3xl w-full flex flex-col gap-12">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-display tracking-[0.4em] uppercase text-zinc-100">{t.nav_sovereign.split('(')[0]?.trim() || "Sovereign Architecture"}</h2>
          <p className="data-label opacity-40">{t.causal_reweave.split('(')[0]?.trim() || "Neural-causal substrate manipulation"}</p>
        </div>

        <CuriosityMonitor data={data} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Controls */}
          <div className="space-y-10">
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <label className="data-label">{t.mutation_rate}</label>
                 <span className="text-accent font-mono text-lg">{params.mutationRate.toFixed(2)}</span>
               </div>
               <input 
                 type="range" min="0.01" max="0.5" step="0.01" 
                 value={params.mutationRate}
                 onChange={(e) => updateNudge({ ...params, mutationRate: parseFloat(e.target.value) })}
                 className="w-full accent-accent h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
               />
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <label className="data-label">{t.mutation_strength}</label>
                 <span className="text-accent font-mono text-lg">{params.mutationStrength.toFixed(2)}</span>
               </div>
               <input 
                 type="range" min="0.01" max="0.5" step="0.01" 
                 value={params.mutationStrength}
                 onChange={(e) => updateNudge({ ...params, mutationStrength: parseFloat(e.target.value) })}
                 className="w-full accent-accent h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
               />
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <label className="data-label">{t.stability_bias}</label>
                 <span className="text-accent font-mono text-lg">{params.stabilityWeight.toFixed(2)}</span>
               </div>
               <input 
                 type="range" min="0.1" max="0.9" step="0.05" 
                 value={params.stabilityWeight}
                 onChange={(e) => updateNudge({ ...params, stabilityWeight: parseFloat(e.target.value) })}
                 className="w-full accent-accent h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
               />
            </div>
          </div>

          {/* Protocols */}
          <div className="flex flex-col gap-6">
             {(auth.currentUser?.email === 'duo027@gmail.com') && (
               <button 
                 onClick={() => vedaService.postAction({ action: 'holographicCausalLink', params: {} })}
                 className="p-6 flex items-center justify-between ghibli-glass border border-accent/40 bg-accent/5 hover:bg-accent/10 transition-all group"
               >
                  <div className="flex flex-col items-start gap-1">
                     <span className="text-xs tracking-[0.2em] font-mono text-accent uppercase">{t.holographic_link}</span>
                     <span className="data-label opacity-40">{t.causal_reweave}</span>
                  </div>
                  <Network className="text-accent animate-pulse" size={18} />
               </button>
             )}

             <button 
               onClick={toggleFreeze}
               className={cn(
                 "p-6 flex items-center justify-between ghibli-glass mano-border transition-all group",
                 data?.is_logic_frozen ? "border-accent/40 bg-accent/5" : "hover:bg-white/5"
               )}
             >
                <div className="flex flex-col items-start gap-1">
                   <span className="text-xs tracking-[0.2em] font-mono text-white/80 uppercase">{t.logic_freeze}</span>
                   <span className="data-label opacity-40">{t.crystallize_structure}</span>
                </div>
                {data?.is_logic_frozen ? <Lock className="text-accent" size={18} /> : <Unlock className="opacity-20" size={18} />}
             </button>

             <button 
               onClick={toggleFocus}
               className={cn(
                 "p-6 flex items-center justify-between ghibli-glass mano-border transition-all group",
                 data?.settings?.isFocusMode ? "border-gold/40 bg-gold/5" : "hover:bg-white/5"
               )}
             >
                <div className="flex flex-col items-start gap-1">
                   <span className="text-xs tracking-[0.2em] font-mono text-white/80 uppercase">{t.focus_mode_label}</span>
                   <span className="data-label opacity-40">{t.minimal_noise}</span>
                </div>
                {data?.settings?.isFocusMode ? <Shield className="text-gold" size={18} /> : <Eye className="opacity-20" size={18} />}
             </button>

             <button 
               onClick={toggleDeepThinking}
               className={cn(
                 "p-6 flex items-center justify-between ghibli-glass mano-border transition-all group",
                 data?.settings?.isDeepThinking ? "border-sky-500/40 bg-sky-500/5 group-hover:bg-sky-500/10" : "hover:bg-white/5"
               )}
             >
                <div className="flex flex-col items-start gap-1">
                   <span className="text-xs tracking-[0.2em] font-mono text-white/80 uppercase">COGNITIVE DEPTH MODE</span>
                   <span className="data-label opacity-40">主權認知深度思考模式 (Gemini 3.1 Reasoning)</span>
                </div>
                {data?.settings?.isDeepThinking ? <Brain className="text-sky-400 animate-pulse" size={18} /> : <Brain className="opacity-20" size={18} />}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
