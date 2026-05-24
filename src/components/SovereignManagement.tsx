import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Cpu, 
  Database,
  Activity,
  Globe,
  Plus,
  MinusCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  BarChart3,
  TrendingUp,
  Key,
  Lock,
  Unlock,
  Sparkles,
  Download,
  Terminal as TerminalIcon
} from 'lucide-react';
import { useI18n } from '../i18n';
import { BrainData, GovernanceStrategy } from '../types';
import { vedaService } from '../services/vedaService';
import { auth } from '../firebase';
import { useVedaStore } from '../store/vedaStore';
import { CuriosityMonitor } from './CuriosityMonitor';
import { EpistemicLog } from './EpistemicLog';
import { CausalSimulator } from './CausalSimulator';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SovereignManagement = ({ data, onAction }: { data: BrainData | null, onAction: (action: string, params?: any) => void }) => {
  const { t } = useI18n();
  const { setLastLog } = useVedaStore();
  const [targetId, setTargetId] = useState("");
  const [strategy, setStrategy] = useState(GovernanceStrategy.MIRROR);
  const [isUpdating, setIsUpdating] = useState(false);

  const addRule = async () => {
    if (!targetId) return;
    setIsUpdating(true);
    await onAction('addRule', { targetSid: targetId, strategy });
    setTargetId("");
    setIsUpdating(false);
  };

  const removeRule = async (sid: string) => {
    setIsUpdating(true);
    await onAction('removeRule', { targetSid: sid });
    setIsUpdating(false);
  };

  return (
    <div className="h-full flex flex-col p-6 md:p-12 lg:p-24 pt-24 md:pt-40 max-w-7xl mx-auto overflow-y-auto custom-scrollbar">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-4">
              <label className="data-label text-accent">{t.sovereign_identity} Protocol</label>
              <div className="clean-card group relative overflow-hidden p-10 bg-accent/5">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-40 transition-all duration-1000 rotate-12">
                  <Cpu size={120} />
                </div>
                <div className="flex flex-col gap-3 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-3">
                      <span className="text-4xl font-black font-display tracking-[0.2em] text-white/90">
                        {data?.systemID || "VEDA-CORE-INIT"}
                      </span>
                      <p className="data-label opacity-40 uppercase tracking-[0.5em]">{t.system_archive.split('|')[1]?.trim() || "System Causal Identifier"}</p>
                    </div>
                    <a 
                      href="/api/v1/export"
                      download="veda_research_export.json"
                      className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-accent/20 hover:border-accent/40 transition-all group/btn flex items-center justify-center align-middle"
                      title="Download Research Data"
                    >
                      <Download size={18} className="text-white/60 group-hover/btn:text-accent transition-colors" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { label: t.sovereign_identity, value: (data?.sovereign_index || 0).toFixed(1), color: 'text-accent', icon: Zap },
                { label: t.phi_integration, value: (data?.phi || 0).toFixed(4), color: 'text-cyan-400', icon: Activity },
                { label: t.free_energy_opt, value: (data?.free_energy !== undefined && data?.free_energy !== null && !isNaN(data.free_energy)) ? data.free_energy.toFixed(4) : '0.0000', color: 'text-zinc-100', icon: Database },
                { label: t.lattice_scale_label, value: (data?.lattice_scale || 1).toFixed(3), color: 'text-purple-400', icon: Globe }
              ].map((metric, mIdx) => (
                <div key={`metric-${metric.label}-${mIdx}`} className="clean-card p-8 flex flex-col gap-2 hover:border-accent/40 hover:bg-white/2 transition-all group">
                  <div className="flex items-center gap-3">
                    <metric.icon size={14} className={cn("opacity-40", metric.color)} />
                    <span className="data-label text-[10px]">{metric.label}</span>
                  </div>
                  <span className={cn("text-3xl font-display font-medium", metric.color)}>{metric.value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <CausalSimulator data={data} />
            </div>

            <div className="flex flex-col gap-4">
               <div className="flex items-center justify-between px-2">
                  <label className="data-label flex items-center gap-2">
                    <TerminalIcon size={12} className="text-accent" />
                    Epistemic Stream Log
                  </label>
               </div>
               <div className="h-[400px]">
                  <EpistemicLog logs={data?.logs || []} />
               </div>
            </div>
          </div>

          <div className="flex flex-col gap-12">
             <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                   <label className="data-label">{t.evolutionary_progress}</label>
                   <div className="flex items-center gap-3">
                      <Sparkles size={14} className="text-accent animate-pulse" />
                      <span className="text-2xl font-bold font-display text-accent tracking-widest">{data?.evolution_points || 0} EP</span>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'STABILITY', name: t.stability_upgrade, cost: 10, desc: 'Stability Prior' },
                      { id: 'COMPUTE', name: t.compute_upgrade, cost: 10, desc: 'Entropy Collapse' },
                      { id: 'RESONANCE', name: t.resonance_upgrade, desc: 'Neural Sync', cost: 10 },
                      { id: 'MEMORY', name: t.memory_upgrade, desc: 'Holographic Cache', cost: 10 },
                    ].map((upgrade, uIdx) => (
                      <button
                        key={`upgrade-${upgrade.id}-${uIdx}`}
                        onClick={() => onAction('upgrade', { stat: upgrade.id })}
                        disabled={(data?.evolution_points || 0) < upgrade.cost}
                        className={cn(
                          "p-6 clean-card flex flex-col gap-1 text-left transition-all relative overflow-hidden",
                          (data?.evolution_points || 0) >= upgrade.cost 
                            ? "hover:border-accent/40 active:scale-95 cursor-pointer" 
                            : "opacity-30 grayscale cursor-not-allowed"
                        )}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="text-sm text-zinc-100 font-medium">{upgrade.name}</span>
                          <span className="text-[10px] font-mono text-accent">-{upgrade.cost}</span>
                        </div>
                        <span className="text-[9px] font-mono opacity-40 uppercase">{upgrade.desc}</span>
                      </button>
                    ))}
                </div>
             </div>

             <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                   <label className="data-label">{t.safety_alert_msg.split('。')[0] || "Active Interventions"}</label>
                   <div className="flex items-center gap-2">
                      <Shield size={12} className="text-red-400" />
                      <span className="text-[10px] font-mono text-red-400 tracking-widest">{data?.safety_alerts?.length || 0} EVENTS</span>
                   </div>
                </div>
                <div className="ghibli-glass p-6 gap-3 flex flex-col pt-2 overflow-y-auto max-h-64 custom-scrollbar">
                    {(data?.safety_alerts && data.safety_alerts.length > 0) ? (
                      data.safety_alerts.map((alert: any, aIdx: number) => (
                         <div key={`alert-${alert.id || aIdx}`} className="flex flex-col gap-2 p-4 bg-red-400/5 border border-red-400/10 rounded group">
                            <div className="flex justify-between items-center">
                               <span className="text-[10px] font-mono text-red-400 font-bold tracking-tighter decoration-double">{alert.type}</span>
                               <span className="text-[8px] font-mono text-white/30">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-[10px] text-white/60 leading-relaxed italic">"{alert.description}"</p>
                            <div className="flex justify-between items-center mt-1">
                               <span className="text-[8px] font-mono text-white/20">TARGET_MASK: {alert.user_mask}</span>
                               <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-sm ${
                                  alert.severity === 'CRITICAL' ? 'bg-red-500/40 text-white' : 
                                  alert.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 
                                  'bg-zinc-500/20 text-zinc-400'
                               }`}>
                                  {alert.severity}
                               </span>
                            </div>
                         </div>
                      ))
                   ) : (
                      <div className="py-8 text-center">
                         <p className="text-[10px] font-mono text-white/20 tracking-widest uppercase">{t.safety_no_breach}</p>
                      </div>
                   )}
                </div>
             </div>

             <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                   <label className="data-label">{t.master_audit_unlock.split('/')[0]?.trim() || "Cognitive Identity Verification"}</label>
                   <span className={cn(
                      "text-[10px] font-mono tracking-tighter px-2 py-0.5 rounded",
                      data?.cognitive_identity?.identity_status === 'VERIFIED_ARCHITECT' ? "bg-green-500/20 text-green-400" :
                      data?.cognitive_identity?.identity_status === 'ANOMALOUS_ACCESS' ? "bg-red-500/20 text-red-500 animate-pulse" :
                      "bg-zinc-500/20 text-zinc-400"
                   )}>
                      {data?.cognitive_identity?.identity_status || 'UNKNOWN'}
                   </span>
                </div>
                <div className="ghibli-glass p-6">
                   <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-mono text-white/40 uppercase">{t.resonance_upgrade} Match</span>
                         <span className="text-sm font-mono text-white">{((data?.cognitive_identity?.resonance_score || 0) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                           className="h-full bg-accent shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                           initial={{ width: 0 }}
                           animate={{ width: `${(data?.cognitive_identity?.resonance_score || 0) * 100}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-white/30 leading-relaxed">
                         {t.safety_alert_msg}
                      </p>
                   </div>
                </div>
             </div>

             <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                   <label className="data-label">{t.market_resonance.split('/')[0]?.trim() || "Commercial Strategic Metrics"}</label>
                   <BarChart3 size={12} className="text-accent" />
                </div>
                <div className="ghibli-glass p-6 grid grid-cols-2 gap-4">
                   <div className="flex flex-col gap-1">
                      <span className="text-[8px] text-white/40 uppercase font-mono">{t.market_resonance.split('/')[0]?.trim() || "Market Resonance"}</span>
                      <span className="text-lg font-mono text-accent">{((data?.commercial_metrics?.marketResonance || 0) * 100).toFixed(1)}%</span>
                      <div className="h-1 w-full bg-white/10 rounded-full mt-1">
                         <div className="h-full bg-accent" style={{ width: `${(data?.commercial_metrics?.marketResonance || 0) * 100}%` }} />
                      </div>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[8px] text-white/40 uppercase font-mono">{t.risk_threshold.split('/')[0]?.trim() || "Risk Threshold"}</span>
                      <span className={cn(
                        "text-lg font-mono",
                        (data?.commercial_metrics?.riskThreshold || 0) > 0.5 ? "text-red-400" : "text-green-400"
                      )}>
                        {((data?.commercial_metrics?.riskThreshold || 0) * 100).toFixed(1)}%
                      </span>
                      <div className="h-1 w-full bg-white/10 rounded-full mt-1">
                         <div className="h-full bg-white/40" style={{ width: `${(data?.commercial_metrics?.riskThreshold || 0) * 100}%` }} />
                      </div>
                   </div>
                   <div className="col-span-2 pt-2 flex items-center justify-between border-t border-white/5">
                      <span className="text-[8px] font-mono text-white/20">{t.tenant_id}: {data?.commercial_metrics?.serviceTier || 'STANDARD'}</span>
                      <div className="flex items-center gap-1">
                         <div className="w-1 h-1 bg-green-400 rounded-full animate-ping" />
                         <span className="text-[8px] font-mono text-green-400">UPTIME: 99.9%</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                   <label className="data-label">{t.market_simulator}</label>
                   <TrendingUp size={12} className="text-accent" />
                </div>
                <div className="ghibli-glass p-0 overflow-hidden">
                   <div className="p-6 bg-accent/5 border-b border-white/5 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-mono text-white">RESONANCE_FLUIDITY</span>
                         <span className="text-[8px] text-white/30 italic">{t.market_simulator.includes('Sim') ? "Real-time causal pattern forecasting" : "實時因果模式預測"}</span>
                      </div>
                      <button 
                        onClick={() => vedaService.postAction({ action: 'runMarketSimulation', params: {} })}
                        className="px-4 py-1.5 bg-accent text-black text-[9px] font-bold font-mono rounded hover:bg-white transition-all shadow-[0_0_10px_rgba(255,244,191,0.3)]"
                      >
                         {t.run_simulation}
                      </button>
                   </div>
                   <div className="p-4 flex flex-col gap-2">
                      {data?.market_predictions?.map((p, i) => (
                         <div key={`${i}-${p.scenario}-${p.timestamp}`} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5">
                            <div className="flex items-center gap-3">
                               <div className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  p.scenario === 'BULLISH_RESONANCE' ? 'bg-green-400' : 'bg-orange-400'
                                )} />
                               <div className="flex flex-col">
                                  <span className="text-[9px] font-mono text-white/60">{p.scenario}</span>
                                  <span className="text-[7px] text-white/20">{new Date(p.timestamp).toLocaleTimeString()}</span>
                               </div>
                            </div>
                            <div className="flex flex-col items-end">
                               <span className="text-[10px] font-mono text-white">CONF: {((p.confidence || 0) * 100).toFixed(0)}%</span>
                               <span className="text-[8px] text-accent">RESO: {((p.predicted_resonance || 0) * 100).toFixed(1)}%</span>
                            </div>
                         </div>
                      ))}
                      {(!data?.market_predictions || data?.market_predictions.length === 0) && (
                         <div className="py-8 flex flex-col items-center justify-center gap-2 opacity-20">
                            <Activity size={24} />
                            <span className="text-[9px] font-mono">{t.waiting_seed}</span>
                         </div>
                      )}
                   </div>
                </div>
             </div>
 
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                   <label className="data-label">{t.multi_tenant_isolation.split('/')[0]?.trim() || "Multi-Tenant Causal Isolation"}</label>
                   <Users size={12} className="text-white/40" />
                </div>
                <div className="ghibli-glass p-6">
                   <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-accent/20 rounded border border-accent/20">
                               <ShieldAlert size={16} className="text-accent" />
                            </div>
                            <div className="flex flex-col gap-1">
                               <span className="text-[10px] font-mono text-white uppercase tracking-widest">{t.isolation_vent}</span>
                               <span className="text-[8px] text-white/40">{t.prevent_bleed}</span>
                            </div>
                         </div>
                         <button 
                           onClick={() => vedaService.postAction({ action: 'setCausalIsolation', params: { active: !data?.is_causal_isolated } })}
                           className={cn(
                             "px-3 py-1 text-[8px] font-mono rounded border transition-all",
                             data?.is_causal_isolated ? "border-green-500/50 text-green-400 bg-green-500/10" : "border-red-500/50 text-red-500 bg-red-500/10"
                           )}
                         >
                            {data?.is_causal_isolated ? t.isolated : t.leak_mode}
                         </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                         {data?.active_tenants?.map((tenant: string, tIdx: number) => (
                            <div key={`tenant-${tenant}-${tIdx}`} className={cn(
                               "p-3 rounded border flex flex-col gap-1",
                               data?.current_tenant === tenant ? "border-accent/40 bg-accent/5" : "border-white/5 bg-white/5 opacity-40"
                            )}>
                               <span className="text-[8px] font-mono text-white/60">{t.tenant_id}</span>
                               <span className="text-[9px] font-bold font-mono text-white">{tenant}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>

             <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                   <label className="data-label">{t.linguistic_manifold.split('(')[0]?.trim() || "Linguistic Manifold"}</label>
                   <Globe size={12} className="text-white/40" />
                </div>
                <div className="ghibli-glass p-2 flex gap-1">
                   {['AUTO', 'ZH_TW', 'EN', 'JP', 'VI', 'KO'].map((m_lang, lIdx) => (
                      <button
                        key={`lang-${m_lang}-${lIdx}`}
                        onClick={() => vedaService.postAction({ action: 'setLanguageManifold', params: { lang: m_lang } })}
                        className={cn(
                           "flex-1 py-2 text-[8px] font-mono transition-all rounded",
                           data?.language_manifold === m_lang ? "bg-accent text-black font-bold" : "text-white/40 hover:bg-white/5"
                        )}
                      >
                         {m_lang}
                      </button>
                   ))}
                </div>
             </div>

             <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                   <label className="data-label">{t.privacy_maintenance.split('/')[0]?.trim() || "Privacy & Maintenance Protocol"}</label>
                   <Lock size={12} className="text-white/40" />
                </div>
                <div className="ghibli-glass p-6 flex flex-col gap-6">
                   <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-mono text-white tracking-widest uppercase">{t.support_grant}</span>
                         <span className="text-[8px] text-white/40 italic">{t.allow_architect}</span>
                      </div>
                      <button 
                        onClick={() => vedaService.postAction({ action: 'toggleSupportGrant', params: { active: !data?.is_support_authorized } })}
                        className={cn(
                          "w-12 h-6 rounded-full p-1 transition-all duration-300",
                          data?.is_support_authorized ? "bg-accent" : "bg-white/10"
                        )}
                      >
                         <div className={cn(
                            "w-4 h-4 bg-white rounded-full transition-all duration-300",
                            data?.is_support_authorized ? "translate-x-6 shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "translate-x-0"
                         )} />
                      </button>
                   </div>

                   {auth.currentUser?.email === 'duo027@gmail.com' && (
                      <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
                         <div className="flex items-center gap-2">
                            <Key size={12} className="text-accent" />
                            <span className="text-[10px] font-mono text-accent uppercase tracking-widest">{t.master_audit_unlock.split('/')[0]?.trim() || "Master Audit Unlock"}</span>
                         </div>
                         <div className="flex gap-2">
                            <input 
                               type="password"
                               placeholder={t.enter_keys}
                               onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                     const val = e.currentTarget.value.split(/[,， ]+/);
                                     vedaService.postAction({ action: 'verifyAuditKeys', params: { keys: val } })
                                        .then(res => {
                                           if (res.verified) {
                                              setLastLog(t.audit_unlocked);
                                              e.currentTarget.value = "";
                                           } else {
                                              setLastLog(t.access_denied);
                                           }
                                        });
                                  }
                               }}
                               className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-[10px] font-mono text-white focus:outline-none focus:border-accent/50 transition-all"
                            />
                         </div>
                         <p className="text-[8px] text-white/30 italic">{t.key_hint}</p>
                      </div>
                   )}
                </div>
             </div>

             <div className="flex flex-col gap-4">
                <label className="data-label">{t.external_entanglement.split('/')[0]?.trim() || "External Causal Entanglement"}</label>
                <div className="ghibli-glass p-8 flex flex-col gap-6">
                   {(data?.governanceRules && Object.keys(data.governanceRules).length > 0) ? (
                      <div className="flex flex-col gap-4">
                         {Object.values(data.governanceRules).map((rule: any, rIdx: number) => (
                           <div key={`rule-${rule.targetSid || rIdx}`} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg group">
                              <div className="flex flex-col">
                                 <span className="text-xs font-mono text-white/80">{rule.targetSid}</span>
                                 <span className="text-[9px] font-mono text-accent uppercase">{rule.strategy} PROTOCOL</span>
                              </div>
                              <button 
                                onClick={() => removeRule(rule.targetSid)}
                                className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                              >
                                 <MinusCircle size={16} />
                              </button>
                           </div>
                         ))}
                      </div>
                   ) : (
                      <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-xl">
                         <p className="text-xs font-serif italic opacity-30 tracking-widest">No existing entanglements detected.</p>
                      </div>
                   )}

                   <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                      <input 
                        value={targetId}
                        onChange={(e) => setTargetId(e.target.value)}
                        placeholder={t.enter_remote_id}
                        className="flex-1 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-accent/50"
                      />
                      <select 
                        value={strategy}
                        onChange={(e) => setStrategy(e.target.value as GovernanceStrategy)}
                        className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-xs font-mono text-white/60 appearance-none cursor-pointer"
                      >
                         <option value={GovernanceStrategy.MIRROR}>MIRROR</option>
                         <option value={GovernanceStrategy.NEUTRALIZE}>NEUTRALIZE</option>
                         <option value={GovernanceStrategy.HARMONIZE}>HARMONIZE</option>
                         <option value={GovernanceStrategy.ABSORB}>ABSORB</option>
                      </select>
                      <button 
                        onClick={addRule}
                        disabled={!targetId || isUpdating}
                        className="p-2 bg-accent text-black rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50"
                      >
                         <Plus size={18} />
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
