import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X,
  RefreshCw,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { EfficacyManifold } from './components/EfficacyManifold';
import { NeuralManifold } from './components/NeuralManifold';
import { auth } from './firebase';
import { CinemaManifold } from './components/CinemaManifold';
import { vedaService } from './services/vedaService';
import { resonanceService } from './services/resonanceService';
import { StrategicWorkstation } from './components/StrategicWorkstation';
import { SovereignManagement } from './components/SovereignManagement';
import { PalantirAIPDashboard } from './components/PalantirAIPDashboard';
import { NavRail } from './components/NavRail';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { SynapseOverview } from './components/SynapseOverview';
import { CoreConfig } from './components/CoreConfig';
import { CognitiveArchitecture } from './components/CognitiveArchitecture';
import { KnowledgeVault } from './components/KnowledgeVault';
import { VedaCrystalLogo } from './components/VedaCrystalLogo';
import { HoneycombHUD } from './components/HoneycombHUD';
import { LatticeCruncher } from './components/LatticeCruncher';
import { TaskManager } from './components/TaskManager';
import { ControlPanel } from './components/ControlPanel';
import { DreamscapeView } from './components/DreamscapeView';

// --- Stores ---
import { useAuthStore } from './store/authStore';
import { useVedaStore } from './store/vedaStore';
import { useUIStore } from './store/uiStore';

import { SovereignInitialization } from './components/SovereignInitialization';
import { BurstMonitor } from './components/BurstMonitor';
import { SovereignCircuitBreaker } from './components/SovereignCircuitBreaker';

// --- Utils ---
import { cn } from './lib/utils';

import { useI18n } from './i18n';

export default function App() {
  const { t } = useI18n();
  
  // Stores
  const { authReady, isArchitect, initialize: initAuth } = useAuthStore();
  const { 
    userData, 
    apiError, 
    lastLog, 
    isPulsing, 
    fetchVedaData, 
    handleAction, 
    setApiError,
    setUserData
  } = useVedaStore();
  const { 
    view, 
    setView, 
    selectedFragment, 
    setSelectedFragment, 
    showBurstMonitor, 
    setShowBurstMonitor,
    showControlPanel,
    setShowControlPanel,
    theme
  } = useUIStore();

  // --- Theme Management ---
  useEffect(() => {
    if (theme === 'LIGHT') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  // --- Neural Continuity Management ---
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/healthz');
        const text = await res.text();
        console.log(`[VEDA_CONNECTIVITY] Root Health Check: ${text}`);
      } catch (e) {
        console.error(`[VEDA_CONNECTIVITY] Root Health Check FAILED:`, e);
      }
    };
    checkHealth();

    const unsub = initAuth();
    return () => unsub();
  }, [initAuth]);

  // --- Distributed Compute Handler ---
  useEffect(() => {
    const handleComputeTask = (data: any) => {
      if (data.type === 'COMPUTE_TASK' && data.task) {
        processTask(data.task);
      } else if (data.type === 'COMPUTE_TASK_BATCH' && data.tasks) {
        data.tasks.forEach(processTask);
      }
    };

    const processTask = (task: any) => {
      let simState = [...(task.state || task.initialState)];
      const noise = task.noise || 0.05;
      for (let i = 0; i < (task.steps || 5); i++) {
        simState = simState.map(v => Math.max(0, Math.min(1, v + (Math.random() - 0.5) * noise)));
      }
      const result = {
        finalCoh: simState.reduce((a, b) => a + b, 0) / simState.length,
        predictions: [simState]
      };
      resonanceService.sendComputeResult(task.id, result);
    };

    const removeComputeListener = resonanceService.addListener(handleComputeTask);
    return () => removeComputeListener();
  }, []);

  // --- Sovereign State Synchronization (Aerospace-Grade Adaptive Sync Engine) ---
  useEffect(() => {
    let fallbackTimer: NodeJS.Timeout | null = null;
    let wsConnected = false;
    let currentPollingDelay = 15000; // Start with a safe 15s when disconnected

    const performSync = async () => {
      // Do not query when tab is in the background to conserve mobile power and cellular data
      if (document.hidden) return;
      try {
        await fetchVedaData();
        // Reset delay on successful state retrieval
        currentPollingDelay = 15000;
      } catch (err) {
        console.warn("[VEDA_SYNC] Passive background sync error, adaptive throttle backoff active:", err);
        // Exponential backoff capped at 60s
        currentPollingDelay = Math.min(60000, currentPollingDelay * 1.5);
      }
      triggerNextTimer();
    };

    const triggerNextTimer = () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      // If WebSocket is active, bypass periodic fetching entirely (zero idle polling traffic)
      if (wsConnected) return;
      
      fallbackTimer = setTimeout(performSync, currentPollingDelay);
    };

    // 1. Initial State Retrieval
    fetchVedaData();

    // 2. Establish Real-time Logic Link (WebSocket)
    vedaService.setupWebSocket((realtimeData) => {
      setUserData((prev: any) => {
        // Deep merge logic for partial updates
        if (!prev) return realtimeData;
        return { 
          ...prev, 
          ...realtimeData,
          // Special handling for nested objects if needed
          burst_status: realtimeData.burst_status ? { ...prev.burst_status, ...realtimeData.burst_status } : prev.burst_status
        };
      });
    });

    // 3. Bind WebSocket Connection observer for context-aware throttling
    const unsubscribeConnection = vedaService.registerConnectionListener((state) => {
      const previouslyConnected = wsConnected;
      wsConnected = state === 'CONNECTED';
      
      console.log(`[VEDA_SYNC_CONTROL] Connection state transition: ${state}. Polling loop: ${wsConnected ? 'SUSPENDED' : 'ACTIVE_WITH_BACKOFF'}`);
      
      // Re-evaluate timers if connection status has flipped
      if (!wsConnected || previouslyConnected !== wsConnected) {
        triggerNextTimer();
      }
    });

    // 4. Reactive Visibility Engine: Sync immediately when user switches focus back to the page
    let lastVisibilityFetched = 0;
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastVisibilityFetched > 3000) {
          lastVisibilityFetched = now;
          console.log("[VEDA_SYNC_CONTROL] Tab visibility restored. Forcing trajectory alignment.");
          fetchVedaData();
          triggerNextTimer();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    const handleSelfCorrected = () => {
      fetchVedaData();
    };
    window.addEventListener('veda_intent_self_corrected', handleSelfCorrected);

    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      unsubscribeConnection();
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      window.removeEventListener('veda_intent_self_corrected', handleSelfCorrected);
    };
  }, [fetchVedaData, setUserData]);

  // --- Proactive Lifecycle Engine ---
  const userDataRef = useRef(userData);
  const syncedMemoriesRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  useEffect(() => {
    const checkReminders = () => {
      const currentData = userDataRef.current;
      if (!currentData?.reminders) return;
      
      const now = Date.now();
      const dueReminders = currentData.reminders.filter(r => 
        !r.completed && 
        new Date(r.time).getTime() <= now && 
        new Date(r.time).getTime() > now - 60000 
      );

      if (dueReminders.length > 0) {
        window.dispatchEvent(new CustomEvent('veda_proactive_reminder', { 
          detail: { tasks: dueReminders.map(r => r.task) } 
        }));
        
        const updatedReminders = currentData.reminders.map(r => 
          dueReminders.some(dr => dr.id === r.id) ? { ...r, completed: true } : r
        );
        handleAction('update_reminders', { reminders: updatedReminders });
      }
    };

    const reminderInterval = setInterval(checkReminders, 30000);
    return () => clearInterval(reminderInterval);
  }, [handleAction]);

  useEffect(() => {
    const syncServerMemories = async () => {
      if (!userData?.memories || userData.memories.length === 0) return;
      
      const newMemories = userData.memories.filter(m => !syncedMemoriesRef.current.has(m.id));
      if (newMemories.length === 0) return;

      try {
        const { knbService } = await import('./services/knbService');
        
        // Content validity check
        const validNewMemories = newMemories.filter(m => m.content && m.content.length <= 50000);
        if (validNewMemories.length === 0) {
          newMemories.forEach(m => syncedMemoriesRef.current.add(m.id));
          return;
        }

        // Fast batch-check existence in local DB
        const existingList = await knbService.db.fragments.where('content').anyOf(validNewMemories.map(m => m.content)).toArray();
        const existingContents = new Set(existingList.map(f => f.content));

        const memoriesToInsert = validNewMemories.filter(m => !existingContents.has(m.content));

        if (memoriesToInsert.length > 0) {
          console.log(`[SYNC] Bulk integrating ${memoriesToInsert.length} server memories.`);
          await knbService.addFragmentsBatch(memoriesToInsert.map(m => ({
            content: m.content,
            metadata: {
              type: m.type || 'SYNTHESIZED',
              source: 'VEDA_BRAIN',
              resonance: m.resonance,
              id: m.id
            }
          })));
        }

        // Mark all as processed
        newMemories.forEach(m => syncedMemoriesRef.current.add(m.id));
      } catch (e) {
        console.error("[SYNC_FAULT] Memory integration interrupted:", e);
      }
    };
    
    // Add a small delay to prevent blocking the initial mount
    const timer = setTimeout(syncServerMemories, 3000);
    return () => clearTimeout(timer);
  }, [userData?.memories]);

  useEffect(() => {
    if (userData && !userData.is_bursting) {
      setShowBurstMonitor(false);
    }
  }, [userData?.is_bursting, setShowBurstMonitor]);

  return (
    <div className="relative min-h-screen bg-bg selection:bg-accent/40 overflow-hidden">
      
      {/* Background Watercolor Layer */}
      <div className="fixed inset-[-10%] pointer-events-none z-0 overflow-hidden opacity-80">
        <div className="watercolor-surface absolute inset-0" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03]" />
      </div>

      <NavRail />
      <Header />

      {/* Responsive Consolidated Sub-Tabs Console */}
      {userData && (() => {
        const getActiveHub = (v: any) => {
          if (['DIALOGUE', 'DREAM', 'TASKS'].includes(v)) return 'DIALOGUE';
          if (['SYNAPSE', 'KNOWLEDGE'].includes(v)) return 'SYNAPSE';
          if (['SOVEREIGN', 'PALANTIR_AIP', 'SYNTHESIS'].includes(v)) return 'SOVEREIGN';
          return 'CORE';
        };
        const activeHub = getActiveHub(view);
        const subTabsConfig = {
          DIALOGUE: [
            { id: 'DIALOGUE', label: t.nav_dialogue },
            { id: 'DREAM', label: t.nav_dreamscape },
            { id: 'TASKS', label: t.nav_tasks }
          ],
          SYNAPSE: [
            { id: 'SYNAPSE', label: t.nav_synapse },
            { id: 'KNOWLEDGE', label: t.nav_vault }
          ],
          SOVEREIGN: [
            { id: 'SOVEREIGN', label: t.nav_sovereign },
            { id: 'PALANTIR_AIP', label: t.nav_palantir_aip },
            { id: 'SYNTHESIS', label: t.nav_synthesis }
          ],
          CORE: [
            { id: 'CORE', label: t.nav_core_config },
            { id: 'ARCHITECTURE', label: t.nav_architecture },
            { id: 'EFFICACY', label: t.nav_tiers },
            { id: 'CINEMA', label: t.nav_cinema }
          ]
        };
        const activeSubTabs = (subTabsConfig as any)[activeHub] || [];
        return (
          <div className="absolute md:fixed top-24 md:top-10 left-0 md:left-32 right-0 md:right-auto z-[101] flex justify-center md:justify-start px-4 md:px-0 pointer-events-auto">
            <div className="flex gap-1 bg-black/65 border border-white/5 rounded-full ghibli-glass p-1 shadow-2xl">
              {activeSubTabs.map((tab: any) => {
                const isActive = view === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setView(tab.id as any)}
                    className={`px-3.5 md:px-[18px] py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-display uppercase tracking-[0.2em] transition-all duration-300 ${
                      isActive
                        ? 'bg-accent/20 text-accent border border-accent/20 font-bold scale-100 shadow-md'
                        : 'text-ink/40 hover:text-ink hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {!userData && !apiError && <SovereignInitialization />}

      {/* Global Overload Filter for Sovereign Burst */}
      {userData && (
        <BurstMonitor 
          userData={userData} 
          showBurstMonitor={showBurstMonitor} 
          setShowBurstMonitor={setShowBurstMonitor} 
          handleAction={handleAction} 
        />
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

      <SovereignCircuitBreaker apiError={apiError} setApiError={setApiError} />

      <main className="pl-0 md:pl-24 h-screen relative z-30 transition-all duration-500">
        <AnimatePresence mode="wait">
          {!userData && !apiError ? (
             <motion.div key="loader" className="h-full flex items-center justify-center">
               <Loader2 className="w-8 h-8 text-accent animate-spin opacity-20" />
             </motion.div>
          ) : (
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 10, filter: 'blur(15px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -10, filter: 'blur(15px)' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            {view === 'DIALOGUE' && <ChatInterface />}
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
              <DreamscapeView userData={userData} t={t} />
            )}
            {view === 'KNOWLEDGE' && <KnowledgeVault data={userData} />}
            {view === 'SYNTHESIS' && <StrategicWorkstation data={userData} onRefresh={() => fetchVedaData()} />}
            {view === 'TASKS' && <TaskManager />}
            {view === 'PALANTIR_AIP' && <PalantirAIPDashboard data={userData} onAction={handleAction} onRefresh={() => fetchVedaData()} />}
          {view === 'SOVEREIGN' && <SovereignManagement data={userData} onAction={handleAction} />}
            {view === 'CINEMA' && userData && (
              <CinemaManifold 
                data={userData} 
                onUpdate={() => fetchVedaData()} 
              />
            )}
            {view === 'ARCHITECTURE' && <CognitiveArchitecture />}
            {view === 'EFFICACY' && <EfficacyManifold data={userData} onUpgrade={(tier) => handleAction('setSystemTier', { tier })} />}
            {view === 'CORE' && (
               <CoreConfig data={userData} onUpdate={() => fetchVedaData()} />
            )}
          </motion.div>
          )}
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

      <ControlPanel 
        data={userData}
        intent={userData?.settings?.vector_intent || [0.5, 0.5, 0.5, 0.5, 0.5, 0.5]}
        loading={isPulsing}
        logs={userData?.logs || []}
        showControls={showControlPanel}
        memories={userData?.memories || []}
        onComputeModeChange={async (mode) => {
          await handleAction('setComputeMode', { mode });
          await fetchVedaData();
        }}
        onIntentChange={async (idx, val) => {
          const newIntent = [...(userData?.settings?.vector_intent || [0.5, 0.5, 0.5, 0.5, 0.5, 0.5])];
          newIntent[idx] = val;
          await vedaService.updatePersistence({ settings: { vector_intent: newIntent } });
          await fetchVedaData();
        }}
        onResetIntent={async () => {
          await vedaService.updatePersistence({ settings: { vector_intent: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5] } });
          await fetchVedaData();
        }}
        onEvolve={async () => {
          await handleAction('evolve');
          await fetchVedaData();
        }}
        onSynthesize={async () => {
          await handleAction('synthesize');
          await fetchVedaData();
        }}
        onDistill={async () => {
          await handleAction('distill');
          await fetchVedaData();
        }}
        onDream={async () => {
          await handleAction('dream');
          await fetchVedaData();
        }}
        isDreaming={userData?.isDreaming}
        onToggleNetwork={async () => {
          await handleAction('toggleNetwork');
          await fetchVedaData();
        }}
        onToggleNetworkDisplay={async () => {
          await handleAction('toggleNetworkDisplay');
          await fetchVedaData();
        }}
        showNetworkDisplay={userData?.settings?.showNetworkDisplay}
        onClose={() => setShowControlPanel(false)}
        axioms={userData?.axioms || []}
      />

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
