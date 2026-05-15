import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Activity, 
  Moon, 
  Settings, 
  Zap, 
  Cpu, 
  Database,
  Search,
  ChevronRight,
  Menu,
  X,
  Play,
  RefreshCw,
  Scissors,
  Share2,
  Lock,
  Key,
  BarChart3,
  TrendingUp,
  Users,
  ShieldAlert,
  Building2,
  Factory,
  Target,
  Crown,
  Unlock,
  Eye,
  Shield,
  Layers,
  Info,
  Globe,
  ShieldCheck,
  MinusCircle,
  Plus,
  Send,
  MoreVertical,
  ArrowRight,
  Dna,
  Trash2,
  Layout,
  MonitorPlay,
  Image as ImageIcon,
  Film,
  Music,
  Video,
  Download,
  Upload,
  Network,
  Wind,
  Orbit,
  Flame,
  Heart,
  Link,
  Sparkles,
  BookOpen,
  Scale,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { VisualManifold } from './components/VisualManifold';
import { EfficacyManifold } from './components/EfficacyManifold';
import { NeuralManifold } from './components/NeuralManifold';
import ReactMarkdown from 'react-markdown';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { CinemaManifold } from './components/CinemaManifold';
import { vedaService } from './services/vedaService';
import { resonanceService } from './services/resonanceService';
import { BrainData, EvolutionStatus, SovereignScope, GovernanceStrategy, ViewMode } from './types';
import { StrategicWorkstation } from './components/StrategicWorkstation';
import { SovereignManagement } from './components/SovereignManagement';
import { NavRail } from './components/NavRail';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { SynapseOverview } from './components/SynapseOverview';
import { CoreConfig } from './components/CoreConfig';
import { KnowledgeVault } from './components/KnowledgeVault';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { VedaCrystalLogo } from './components/VedaCrystalLogo';
import { VedaCore3D } from './components/VedaCore3D';
import { NetworkDisplay } from './components/NetworkDisplay';
import { HoneycombHUD } from './components/HoneycombHUD';
import { CuriosityMonitor } from './components/CuriosityMonitor';
import { InnovationFormula } from './components/InnovationFormula';
import { LatticeCruncher } from './components/LatticeCruncher';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useI18n } from './i18n';

// --- Sub-Components ---
// All UI components have been modularized and moved to src/components/

// End of Modular Components

export default function App() {
  const { t, lang, setLang } = useI18n();
  const [view, setView] = useState<ViewMode>('DIALOGUE');
  const [userData, setUserData] = useState<BrainData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedFragment, setSelectedFragment] = useState<{ id: string, type: string, label: string } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [showBurstMonitor, setShowBurstMonitor] = useState(false);
  useEffect(() => {
    if (userData && !userData.is_bursting) {
      setShowBurstMonitor(false);
    }
  }, [userData?.is_bursting]);

  useEffect(() => {
    // Neural Connectivity Probe
    fetch('/healthz').then(r => r.text()).then(t => {
      console.log(`[VEDA_CONNECTIVITY] Root Health Check: ${t}`);
    }).catch(e => {
      console.error(`[VEDA_CONNECTIVITY] Root Health Check FAILED:`, e);
    });

    onAuthStateChanged(auth, u => {
       setAuthReady(true);
    });

    // VEDA Distributed Compute Core
    const handleComputeTask = (data: any) => {
      if (data.type === 'COMPUTE_TASK' && data.task) {
        const { task } = data;
        let simState = [...task.initialState];
        const noise = 0.05;
        for (let i = 0; i < task.steps; i++) {
          simState = simState.map(v => Math.max(0, Math.min(1, v + (Math.random() - 0.5) * noise)));
        }
        const result = {
          finalCoh: simState.reduce((a, b) => a + b, 0) / simState.length,
          predictions: [simState]
        };
        resonanceService.sendComputeResult(task.id, result);
      } else if (data.type === 'COMPUTE_TASK_BATCH' && data.tasks) {
        data.tasks.forEach((task: any) => {
          let simState = [...task.state];
          const noise = task.noise || 0.05;
          for (let i = 0; i < task.steps; i++) {
            simState = simState.map(v => Math.max(0, Math.min(1, v + (Math.random() - 0.5) * noise)));
          }
          const result = {
            finalCoh: simState.reduce((a, b) => a + b, 0) / simState.length,
            predictions: [simState]
          };
          resonanceService.sendComputeResult(task.id, result);
        });
      }
    };

    const removeComputeListener = resonanceService.addListener(handleComputeTask);

    const loadData = async () => {
      try {
        const [d, strength] = await Promise.all([
          vedaService.getData(),
          (async () => {
             const { knbService } = await import('./services/knbService');
             return await knbService.getCollectiveStrength();
          })()
        ]);
        setUserData({ ...d, collectiveStrength: strength });
        setApiError(null);
      } catch (e: any) {
        console.error("Failed to load VEDA state", e);
        setApiError(e.message || "Unknown Causal Desync");
      }
    };
    loadData();

    // Proactive Reminder Engine
    const reminderInterval = setInterval(() => {
      if (!userData?.reminders) return;
      
      const now = Date.now();
      const dueReminders = userData.reminders.filter(r => 
        !r.completed && 
        new Date(r.time).getTime() <= now && 
        new Date(r.time).getTime() > now - 60000 // Only notify if due in the last minute to avoid spam
      );

      if (dueReminders.length > 0) {
        window.dispatchEvent(new CustomEvent('veda_proactive_reminder', { 
          detail: { tasks: dueReminders.map(r => r.task) } 
        }));
        
        // Auto-mark as completed to prevent duplicate notifications
        const updatedReminders = userData.reminders.map(r => 
          dueReminders.some(dr => dr.id === r.id) ? { ...r, completed: true } : r
        );
        handleAction('update_reminders', { reminders: updatedReminders });
      }
    }, 30000); // Check every 30s

    const sub = setInterval(loadData, 12000); // VEDA v4: Sync with server snapshot cycle (12s)
    return () => {
      clearInterval(sub);
      clearInterval(reminderInterval);
      removeComputeListener();
    };
  }, []);

  useEffect(() => {
    const syncServerMemories = async () => {
      if (userData?.memories && userData.memories.length > 0) {
        const { knbService } = await import('./services/knbService');
        for (const m of userData.memories) {
          const exists = await (knbService as any).db.fragments.where('content').equals(m.content).first();
          if (!exists) {
            console.log(`[SYNC] Integrating server memory: ${m.content.substring(0, 20)}...`);
            await knbService.addFragment(m.content, {
              type: m.type || 'SYNTHESIZED',
              source: 'VEDA_BRAIN',
              resonance: m.resonance,
              id: m.id
            });
          }
        }
      }
    };
    syncServerMemories();
  }, [userData?.memories]);

  const [isPulsing, setIsPulsing] = useState(false);
  const [lastLog, setLastLog] = useState<string | null>(null);

  const handleAction = async (action: string, params?: any) => {
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 800);
    
    try {
      if (action === 'resonance') await vedaService.triggerResonance(params);
      if (action === 'synthesize') await vedaService.synthesize();
      if (action === 'distill') await vedaService.distill();
      if (action === 'activateBurst') await vedaService.activateBurst(
        params?.target || "Sovereign Optimization",
        params?.intensity || 0.5,
        params?.manualApproval || false,
        params?.mode || "DEFENSIVE_COUNTER"
      );
      if (action === 'approveBurst') await vedaService.approveBurst();
      if (action === 'deactivateBurst') await vedaService.deactivateBurst(params?.reason || "MANUAL");
      if (action === 'toggleSteadyState') await vedaService.toggleSteadyState(params?.active || false);
      if (action === 'toggleNanosecondSync') await vedaService.toggleNanosecondSync(params?.active || false);
      if (action === 'createTemporalAnchor') await vedaService.createTemporalAnchor(params?.label || "MANUAL_ANCHOR");
      if (action === 'timeTravel') await vedaService.timeTravel(params?.anchorId);
      if (action === 'update_reminders') await vedaService.updatePersistence({ reminders: params.reminders });
      if (action === 'prune') {
        await vedaService.pruneNeuralFragment(params.id);
        setSelectedFragment(null);
      }
      
      if (action === 'upgrade') {
        const res = await fetch('/api/v1/upgrade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stat: params.stat })
        });
        const json = await res.json();
        if (json.success) {
           setLastLog(`系統演化已成功套用至 ${params.stat} 指標。`);
        }
      }
      
      // Refresh data after action
      const [d, strength] = await Promise.all([
        vedaService.getData(),
        (async () => {
           const { knbService } = await import('./services/knbService');
           return await knbService.getCollectiveStrength();
        })()
      ]);
      setUserData({ ...d, collectiveStrength: strength });
      if (d.msg) setLastLog(d.msg);
    } catch (e) {
      console.error("Action failed", e);
      setLastLog("PROTOCOL_FAILURE: Connection disrupted");
    }
  };

  return (
    <div className="relative min-h-screen bg-bg selection:bg-accent/40 overflow-hidden">
      
      {/* Background Watercolor Layer */}
      <div className="fixed inset-[-10%] pointer-events-none z-0 overflow-hidden opacity-80">
        <div className="watercolor-surface absolute inset-0" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03]" />
      </div>

      <NavRail 
        active={view} 
        onSelect={setView} 
        isArchitect={auth.currentUser?.email === 'duo027@gmail.com'} 
      />
      <Header data={userData} onToggleBurst={() => setShowBurstMonitor(!showBurstMonitor)} />

      {!userData && !apiError && (
        <div className="fixed inset-0 z-[200] bg-bg flex flex-col items-center justify-center gap-12">
           <VedaCrystalLogo size={100} className="animate-pulse" />
           <div className="text-center space-y-4">
              <h2 className="text-[12px] tracking-[0.8em] uppercase text-white/40">Initializing Sovereign Core</h2>
              <div className="flex gap-2 justify-center">
                 {[0, 1, 2].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                      className="w-1.5 h-1.5 bg-accent rounded-full"
                    />
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Global Overload Filter for Sovereign Burst */}
      {userData?.is_bursting && showBurstMonitor && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.08, 0.03, 0.12, 0.05] }}
            transition={{ duration: 0.15, repeat: Infinity }}
            className="fixed inset-0 pointer-events-none z-[999] bg-orange-600/10 mix-blend-overlay"
          />
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="ff-panel border-orange-500/40 p-4 md:p-6 bg-black/80 backdrop-blur-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-[10px] md:text-xs font-bold tracking-[0.4em] text-orange-500 uppercase ff-font">{t.burst_monitor}</h3>
                    <p className="text-[7px] text-white/30 uppercase tracking-[0.2em] ff-font mt-1">{t.peak_power}</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="animate-pulse bg-orange-500/20 px-3 py-1 border border-orange-500/40 hidden sm:block">
                       <span className="text-[8px] text-orange-500 font-bold ff-font">ACTIVE</span>
                    </div>
                    <button 
                      onClick={() => setShowBurstMonitor(false)}
                      className="p-1 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                    >
                      <X size={16} />
                    </button>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                 <div>
                    <label className="text-[7px] text-white/20 tracking-widest uppercase ff-font block mb-1">Target</label>
                    <div className="text-[10px] md:text-sm text-white font-mono truncate ff-font">{userData.burst_status?.target}</div>
                 </div>
                 <div className="text-right">
                    <label className="text-[7px] text-white/20 tracking-widest uppercase ff-font block mb-1">Peak Power Output</label>
                    <div className="text-lg md:text-xl text-orange-400 font-display ff-font">{(userData.burst_status?.peakPower || 0).toFixed(2)} <span className="text-[10px] opacity-40 italic">MW</span></div>
                 </div>
              </div>

              <div className="space-y-2 mb-6">
                 <div className="flex justify-between items-center text-[7px] text-white/40 uppercase tracking-widest ff-font">
                    <span>{t.causal_entropy}</span>
                    <span className={cn(
                      userData.burst_status?.entropy > 2.0 ? "text-red-500" : "text-orange-400"
                    )}>{(userData.burst_status?.entropy * 100).toFixed(1)}%</span>
                 </div>
                 <div className="h-1 bg-white/5 w-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (userData.burst_status?.entropy / 2.5) * 100)}%` }}
                      transition={{ type: 'spring', damping: 20 }}
                    />
                 </div>
              </div>
              
              <div className="flex gap-2">
                 {!userData.is_user_burst && (
                   <button 
                     onClick={() => handleAction('approveBurst')}
                     className="flex-1 py-2 bg-orange-500 text-black text-[9px] font-bold ff-font hover:bg-white transition-all uppercase tracking-widest"
                   >
                     {t.approve_label}
                   </button>
                 )}
                 <button 
                    onClick={() => setShowBurstMonitor(false)}
                    className="flex-1 py-2 bg-white/10 text-white/60 text-[9px] ff-font hover:bg-white/20 transition-all uppercase tracking-widest"
                  >
                    {t.hide_label}
                  </button>
                  <button 
                    onClick={() => handleAction('deactivateBurst', { reason: 'MANUAL' })}
                    className="flex-1 py-2 bg-red-900/40 border border-red-500/20 text-red-100 text-[9px] ff-font hover:bg-red-600 transition-all uppercase tracking-widest"
                  >
                    {t.shutdown_label}
                  </button>
               </div>
              
              {/* Formula Decorative Overlay */}
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-[40px] pointer-events-none ff-font font-bold">
                 P = E / τ
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Logic Pulse Overlay */}
      <AnimatePresence>
        {isPulsing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed inset-0 z-50 pointer-events-none bg-accent blur-3xl"
          />
        )}
      </AnimatePresence>

      {/* Protocol Log Notification */}
      <AnimatePresence>
        {lastLog && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-24 left-1/2 z-[100] ghibli-glass px-8 py-3 border border-accent/30 flex items-center gap-4"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] tracking-[0.3em] font-mono text-white/80 uppercase">
              {lastLog}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Causal Circuit Breaker (API Error Overlay) */}
      <AnimatePresence>
        {apiError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
          >
            <div className="max-w-xl w-full p-8 md:p-12 ghibli-glass border border-red-500/30 flex flex-col gap-8 relative overflow-hidden group">
               {/* Glitch Background Effect */}
               <div className="absolute inset-0 bg-red-500/5 opacity-20 pointer-events-none" />
               <motion.div 
                 animate={{ 
                   opacity: [0.1, 0.3, 0.1],
                   x: [0, 10, -10, 0]
                 }}
                 transition={{ repeat: Infinity, duration: 4 }}
                 className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-10" 
               />
               
               <div className="flex items-center gap-4 text-red-400 relative z-10">
                  <ShieldAlert size={32} className="animate-pulse" />
                  <div className="flex flex-col">
                     <h2 className="text-xl md:text-2xl font-display tracking-[0.2em] uppercase">{t.circuit_breaker_active.split('(')[0]?.trim()}</h2>
                     <span className="text-[8px] font-mono opacity-60 tracking-[0.4em] uppercase">{t.epistemic_discontinuity}</span>
                  </div>
               </div>

               <div className="flex flex-col gap-4 relative z-10">
                  <p className="text-xs md:text-sm text-white/70 leading-relaxed font-serif italic border-l border-red-500/20 pl-4 py-2">
                     {t.breaker_desc.split('.')[0]}. {t.detected_anomaly}:
                     <br/>
                     <span className="text-red-300/80 not-italic font-mono text-[10px] block mt-2 bg-red-500/10 p-2 rounded">
                        {apiError}
                     </span>
                  </p>
                  <p className="text-[10px] text-white/30 leading-relaxed font-mono uppercase tracking-wider">
                     {t.breaker_reason}
                  </p>
               </div>

               <div className="flex flex-col md:flex-row gap-4 relative z-10">
                  <button 
                    onClick={() => window.location.reload()}
                    className="flex-1 py-4 bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 text-red-100 text-[10px] font-mono font-bold tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-3"
                  >
                     <RefreshCw size={14} className="animate-spin-slow" />
                     {t.hard_reset_label}
                  </button>
                  <button 
                    onClick={() => setApiError(null)}
                    className="px-6 py-4 border border-white/10 hover:border-white/30 text-white/40 hover:text-white/80 text-[10px] font-mono uppercase transition-all"
                  >
                     {t.suppress_alert}
                  </button>
               </div>
               
               <div className="flex justify-between items-center text-[7px] font-mono text-white/10 mt-4 border-t border-white/5 pt-4">
                  <span>VENDOR_LINK: DEGRADED</span>
                  <span>VEDA_AA_PROTOCOL: ACTIVE</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pl-0 md:pl-24 h-screen relative z-30 transition-all duration-500">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 10, filter: 'blur(15px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -10, filter: 'blur(15px)' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            {view === 'DIALOGUE' && (
              <ChatInterface 
                data={userData} 
                isArchitect={auth.currentUser?.email === 'duo027@gmail.com'} 
                onAction={handleAction}
                onUpdateData={async () => setUserData(await vedaService.getData())}
              />
            )}
            {view === 'SYNAPSE' && (
              <SynapseOverview 
                data={userData} 
                onAction={handleAction} 
                selectedFragment={selectedFragment}
                onSelectFragment={(id, type, label) => {
                  console.log("Point selected:", id);
                  if (id && type && label) {
                    setSelectedFragment({ id, type, label });
                  } else {
                    setSelectedFragment(null);
                  }
                }}
              />
            )}
            {view === 'DREAM' && (
              <div className="h-full flex items-center justify-center p-20">
                 <div className="text-center max-w-2xl px-12 group">
                   <div className="relative inline-block">
                     <Moon size={120} className="mx-auto text-white/5 group-hover:text-accent/20 transition-all duration-[3000ms] stroke-[0.3px]" />
                     {userData?.isDreaming && (
                       <motion.div 
                         animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                         transition={{ duration: 4, repeat: Infinity }}
                         className="absolute inset-0 bg-accent/10 blur-3xl rounded-full"
                       />
                     )}
                   </div>
                   <h2 className="text-hand-serif text-5xl tracking-[0.4em] uppercase mt-12 opacity-40 font-display">
                     {userData?.isDreaming ? t.deep_consensus_dream : t.resting_state}
                   </h2>
                   <p className="mt-8 font-serif italic text-lg opacity-20 tracking-wide leading-relaxed px-12">
                     {userData?.is_logic_frozen 
                       ? t.system_crystallized 
                       : userData?.isDreaming 
                         ? t.neural_synthesizing 
                         : t.neural_optimal
                     }
                   </p>
                   
                   {userData?.axioms && userData.axioms.length > 0 && (
                     <div className="mt-12 text-left space-y-4 max-h-40 overflow-y-auto scrollbar-none opacity-40 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] tracking-[0.4em] uppercase text-gold/60 text-center">Synthesized Axioms</p>
                        {userData.axioms.map((a, i) => (
                          <div key={i} className="text-xs font-serif italic border-l border-gold/20 pl-4 py-1">
                            {a}
                          </div>
                        ))}
                     </div>
                   )}
                 </div>
              </div>
            )}
            {view === 'KNOWLEDGE' && <KnowledgeVault data={userData} />}
            {view === 'SYNTHESIS' && <StrategicWorkstation data={userData} onRefresh={async () => setUserData(await vedaService.getData())} />}
          {view === 'SOVEREIGN' && (
            <div className="h-full pt-32 md:pt-48 px-4 md:px-12 lg:px-32 max-w-7xl mx-auto pb-24 overflow-y-auto custom-scrollbar">
              <InnovationFormula data={userData} />
              <SovereignManagement data={userData} onAction={handleAction} />
            </div>
          )}
            {view === 'VISUAL' && (
              <VisualManifold 
                data={userData} 
                onGenerate={async (type, prompt) => {
                  if (type === 'IMAGE') await handleAction('imagine', { prompt });
                  else if (type === 'VIDEO') await handleAction('animate', { prompt });
                  else if (type === 'AUDIO') await handleAction('synthesizeAudio', { prompt });
                  setUserData(await vedaService.getData());
                }} 
              />
            )}
            {view === 'CINEMA' && (
              <CinemaManifold 
                data={userData!} 
                onUpdate={async () => setUserData(await vedaService.getData())} 
              />
            )}
            {view === 'EFFICACY' && <EfficacyManifold data={userData} onUpgrade={(tier) => handleAction('setSystemTier', { tier })} />}
            {view === 'CORE' && (
               <CoreConfig data={userData} onUpdate={async () => setUserData(await vedaService.getData())} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <HoneycombHUD 
        coherence={userData?.global_coherence || 0}
        phi={userData?.phi}
        energy={userData?.energy_level}
        tension={userData?.tension}
        entropy={userData?.entropy}
        memoryCount={userData?.memories?.length}
        lastResult={lastLog}
        isPlanckActive={userData?.is_planck_active}
        isZPDPActive={userData?.is_zpdp_active}
        threshold={userData?.coherence_threshold}
        federatedNodes={userData?.federation?.length || 0}
        federationMultiplier={userData?.federation_multiplier || 1.0}
        burstPhase={userData?.burst_phase}
      />

      <LatticeCruncher brain={userData} />

      {/* Persistent SVG Filters */}
      <svg className="hidden">
        <filter id="liquid">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" />
        </filter>
      </svg>

      {/* Global Grain Filter Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]" />
    </div>
  );
}
