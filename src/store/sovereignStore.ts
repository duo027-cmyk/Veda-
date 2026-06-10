import { create } from 'zustand';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { ViewMode, BrainData } from '../types';
import { vedaService } from '../services/vedaService';
import { knbService } from '../services/knbService';

export interface SovereignState {
  // Auth state
  user: User | null;
  authReady: boolean;
  isArchitect: boolean;
  
  // UI state
  view: ViewMode;
  selectedFragment: { id: string, type: string, label: string } | null;
  showBurstMonitor: boolean;
  showControlPanel: boolean;
  theme: 'DARK' | 'LIGHT';

  // Veda state
  userData: BrainData | null;
  apiError: string | null;
  lastLog: string | null;
  isPulsing: boolean;
  isLoading: boolean;
  
  // Auth Actions
  setUser: (user: User | null) => void;
  setAuthReady: (ready: boolean) => void;
  initializeAuth: () => () => void;

  // UI Actions
  setView: (view: ViewMode) => void;
  setSelectedFragment: (fragment: { id: string, type: string, label: string } | null) => void;
  setShowBurstMonitor: (show: boolean) => void;
  setShowControlPanel: (show: boolean) => void;
  setTheme: (theme: 'DARK' | 'LIGHT') => void;
  toggleTheme: () => void;

  // Veda Actions
  setUserData: (userData: BrainData | null | ((prev: BrainData | null) => BrainData | null)) => void;
  setApiError: (error: string | null) => void;
  setLastLog: (log: string | null) => void;
  setIsPulsing: (isPulsing) => void;
  fetchVedaData: () => Promise<void>;
  handleAction: (action: string, params?: any) => Promise<void>;
}

const getInitialTheme = (): 'DARK' | 'LIGHT' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('veda-theme') as 'DARK' | 'LIGHT';
    if (saved === 'DARK' || saved === 'LIGHT') return saved;
  }
  return 'DARK';
};

const getInitialView = (): ViewMode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('veda-view') as ViewMode;
    if (saved) return saved;
  }
  return 'DIALOGUE';
};

// Module-scoped promise to deduplicate simultaneous/parallel fetch Veda data calls
let activeFetchPromise: Promise<void> | null = null;

export const useSovereignStore = create<SovereignState>((set, get) => ({
  // Auth state
  user: null,
  authReady: false,
  isArchitect: false,

  // UI state
  view: getInitialView(),
  selectedFragment: null,
  showBurstMonitor: false,
  showControlPanel: false,
  theme: getInitialTheme(),

  // Veda state
  userData: null,
  apiError: null,
  lastLog: null,
  isPulsing: false,
  isLoading: true,

  // Auth Actions
  setUser: (user) => {
    set({ 
      user, 
      isArchitect: user?.email === 'duo027@gmail.com' 
    });
  },
  
  setAuthReady: (ready) => set({ authReady: ready }),
  
  initializeAuth: () => {
    const unsub = onAuthStateChanged(auth, (user) => {
      set({ 
        user, 
        authReady: true,
        isArchitect: user?.email === 'duo027@gmail.com'
      });
      // Automatically pull state when Auth changes
      if (user) {
        get().fetchVedaData().catch(() => {});
      }
    });
    return unsub;
  },

  // UI Actions
  setView: (view) => {
    localStorage.setItem('veda-view', view);
    set({ view });
  },
  
  setSelectedFragment: (selectedFragment) => set({ selectedFragment }),
  
  setShowBurstMonitor: (showBurstMonitor) => set({ showBurstMonitor }),
  
  setShowControlPanel: (showControlPanel) => set({ showControlPanel }),
  
  setTheme: (theme) => {
    localStorage.setItem('veda-theme', theme);
    set({ theme });
  },
  
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'DARK' ? 'LIGHT' : 'DARK';
    localStorage.setItem('veda-theme', nextTheme);
    return { theme: nextTheme };
  }),

  // Veda Actions
  setUserData: (userData) => {
    if (typeof userData === 'function') {
      set((state) => ({ userData: userData(state.userData), isLoading: false }));
    } else {
      set({ userData, isLoading: false });
    }
  },
  
  setApiError: (apiError) => set({ apiError }),
  
  setLastLog: (lastLog) => set({ lastLog }),
  
  setIsPulsing: (isPulsing) => set({ isPulsing }),

  fetchVedaData: async () => {
    if (activeFetchPromise) {
      return activeFetchPromise;
    }

    activeFetchPromise = (async () => {
      try {
        const [d, strength, memories, graphData] = await Promise.all([
          vedaService.getData().catch(err => {
            console.warn("[VEDA_SYNC_SYSTEM] getData err (using background healing fallback):", err);
            return null;
          }),
          knbService.getCollectiveStrength().catch(err => {
            console.warn("[KNB] Strength check failed - ignoring for stability", err);
            return 0;
          }),
          vedaService.getMemories().catch(err => {
            console.warn("[VEDA_SYNC_SYSTEM] memories fetch err:", err);
            return [];
          }),
          vedaService.getGraphData().catch(err => {
            console.warn("[VEDA_SYNC_SYSTEM] graph fetch err:", err);
            return { nodes: [], links: [] };
          })
        ]);

        const currentData = get().userData;
        let safeData = null;

        // Generate deterministic 3D coordinates on Fibonacci sphere surface for elegant rendering in VedaCore3D
        let formattedManifoldPoints: any[] = [];
        if (graphData && Array.isArray(graphData.nodes)) {
          const N = graphData.nodes.length;
          formattedManifoldPoints = graphData.nodes.map((node: any, idx: number) => {
            if (N < 2) {
              return { ...node, x: 0, y: 0, z: 0 };
            }
            const offset = 2 / N;
            const increment = Math.PI * (3 - Math.sqrt(5));
            const y = ((idx * offset) - 1) + (offset / 2);
            const r = Math.sqrt(Math.max(0, 1 - y * y));
            const phi = idx * increment;
            const x = Math.cos(phi) * r;
            const z = Math.sin(phi) * r;
            
            return {
              ...node,
              x: x * 2.2,
              y: y * 2.2,
              z: z * 2.2
            };
          });
        }

        if (d) {
          safeData = {
            ...d,
            memories: memories || [],
            manifold_points: formattedManifoldPoints,
            collectiveStrength: strength,
            innovation_manifold: d.innovation_manifold || {
              innovationIndex: 0,
              experienceSum: 0,
              leapPotential: 0,
              alignmentIndex: 0,
              protocol: 'INITIALIZING',
              uncertaintyVariance: 0
            }
          };
        } else if (currentData) {
          // 自癒：重用先前成功的內存狀態
          safeData = {
            ...currentData,
            memories: memories || currentData.memories || [],
            manifold_points: formattedManifoldPoints.length > 0 ? formattedManifoldPoints : (currentData.manifold_points || []),
            collectiveStrength: strength || currentData.collectiveStrength || 0
          };
        }

        set({ 
          userData: safeData, 
          apiError: null, // 無損自癒：即使有臨時抖動也決不鎖死前台
          isLoading: false 
        });

        // Synchronize UI components based on telemetry states (Reactive Feedback Loop)
        if (safeData?.is_bursting) {
          set({ showBurstMonitor: true });
        }
      } catch (e: any) {
        console.warn("[VEDA_SYNC_SYSTEM] Extreme transient sync failure (self-healing recovery auto-engaged):", e);
        set({ apiError: null, isLoading: false }); // 拒絕向用戶展示破碎的異常
      } finally {
        activeFetchPromise = null;
      }
    })();

    return activeFetchPromise;
  },

  handleAction: async (action, params) => {
    set({ isPulsing: true });
    setTimeout(() => set({ isPulsing: false }), 800);
    
    try {
      let resultMsg = null;
      
      switch (action) {
        case 'resonance': await vedaService.triggerResonance(params); break;
        case 'synthesize': await vedaService.synthesize(); break;
        case 'distill': await vedaService.distill(); break;
        case 'activateBurst': 
          await vedaService.activateBurst(
            params?.target || "Sovereign Optimization",
            params?.intensity || 0.5,
            params?.manualApproval || false,
            params?.mode || "DEFENSIVE_COUNTER"
          );
          set({ showBurstMonitor: true });
          break;
        case 'approveBurst': await vedaService.approveBurst(); break;
        case 'deactivateBurst': 
          await vedaService.deactivateBurst(params?.reason || "MANUAL"); 
          set({ showBurstMonitor: false });
          break;
        case 'toggleSteadyState': await vedaService.toggleSteadyState(params?.active || false); break;
        case 'toggleNanosecondSync': await vedaService.toggleNanosecondSync(params?.active || false); break;
        case 'createTemporalAnchor': await vedaService.createTemporalAnchor(params?.label || "MANUAL_ANCHOR"); break;
        case 'timeTravel': await vedaService.timeTravel(params?.anchorId); break;
        case 'update_reminders': await vedaService.updatePersistence({ reminders: params.reminders }); break;
        case 'prune': await vedaService.pruneNeuralFragment(params.id); break;
        case 'imagine': await vedaService.imagine(params.prompt); break;
        case 'animate': await vedaService.animate(params.prompt); break;
        case 'synthesizeAudio': await vedaService.synthesizeAudio(params.prompt); break;
        case 'setSystemTier': await vedaService.setSystemTier(params.tier); break;
        case 'registerVisualAsset': await vedaService.postAction({ action: 'registerVisualAsset', params }); break;
        case 'learnFragment': 
          await knbService.addFragment(params.content, { type: params.type || 'DOCUMENT', source: 'USER_UPLOAD' }); 
          await vedaService.postAction({ action: 'digestKnowledge', params: { snippets: [params.content], scope: 'USER_UPLOAD' } });
          break;
        
        case 'upgrade': {
          const res = await fetch('/api/v1/upgrade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stat: params.stat })
          });
          const json = await res.json();
          if (json.success) {
            resultMsg = `系統演化已成功套用至 ${params.stat} 指標。`;
          }
          break;
        }
        case 'solidifyAnalogicalAxiom': {
          await vedaService.postAction({ action: 'solidifyAnalogicalAxiom', params });
          resultMsg = `卓越類比公理已融入律法，系統穩態相干性顯著提升。`;
          break;
        }
        case 'setComputeMode': {
          await vedaService.postAction({ action: 'setComputeMode', params: { mode: params.mode } });
          resultMsg = `主權運算模式已切換為：${params.mode === 'throughput' ? '高吞吐（High Throughput）' : '高精準（High Precision）'}。`;
          break;
        }
        case 'refreshTele': {
          resultMsg = `因果遥測流已重對位並刷新。`;
          break;
        }
      }
      
      // Atomic refresh after action directly via centralized chain
      await get().fetchVedaData();
      
      const currentData = get().userData;
      if (resultMsg) set({ lastLog: resultMsg });
      else if (currentData?.msg) set({ lastLog: currentData.msg });
      
    } catch (e) {
      console.error("Action execution fail:", e);
      set({ lastLog: "PROTOCOL_FAILURE: Connection disrupted" });
    }
  }
}));
