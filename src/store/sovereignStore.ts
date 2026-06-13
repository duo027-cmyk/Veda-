import { create } from 'zustand';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { ViewMode, BrainData, EvolutionStatus, MemoryFragment } from '../types';
import { vedaService } from '../services/vedaService';
import { knbService } from '../services/knbService';

// State integrity validation and defensive snapshotting systems (Strategic Chief of Staff Recovery Engine)
const LOCAL_STORAGE_SNAPSHOT_KEY = "veda-stable-state-snapshot";

export function isBrainDataValid(data: any): data is BrainData {
  if (!data || typeof data !== 'object') return false;
  try {
    if (typeof data.global_coherence !== 'number' || isNaN(data.global_coherence)) return false;
    if (typeof data.entropy !== 'number' || isNaN(data.entropy)) return false;
    if (typeof data.status !== 'string') return false;
    if (typeof data.status_code !== 'string') return false;
    if (!Array.isArray(data.vectors)) return false;
    if (!Array.isArray(data.labels)) return false;
    if (!Array.isArray(data.history)) return false;
    if (!Array.isArray(data.layers)) return false;
  } catch (err) {
    return false;
  }
  return true;
}

export function selfHealBrainData(data: any): BrainData {
  if (!data || typeof data !== 'object') {
    return {
      global_coherence: 0.85,
      entropy: 0.35,
      status: "系統預設：狀態訊號常態收斂運作中。",
      status_code: EvolutionStatus.IDLE,
      rejection_count: 0,
      msg: "系統訊號收斂中",
      version: "1.0.0",
      vectors: [0.85, 0.35, 0.12, 0.95],
      labels: ["Coherence", "Entropy", "Free Energy", "Stability"],
      history: [] as number[],
      layers: [
        { id: "L1", name: "Epistemic Input Layer", data: [[0.85, 0.12, 0.64]], coherence: 0.85 },
        { id: "L2", name: "Cognitive Resonator", data: [[0.72, 0.05, 0.88]], coherence: 0.72 },
        { id: "L3", name: "Sovereign Outflow Layer", data: [[0.95, 0.35, 0.44]], coherence: 0.95 }
      ],
      memories: [] as MemoryFragment[],
      manifold_points: [] as { id: string; x: number; y: number; z: number; label: string; type: string }[],
      collectiveStrength: 0,
      innovation_manifold: {
        innovationIndex: 0,
        experienceSum: 0,
        leapPotential: 0,
        alignmentIndex: 0,
        protocol: 'INITIALIZING',
        uncertaintyVariance: 0
      }
    };
  }

  // Create a deep copy/clone of the object to avoid mutating frozen states in strict mode
  let cloned: any;
  try {
    cloned = JSON.parse(JSON.stringify(data));
  } catch (e) {
    cloned = { ...data };
  }

  // Repair numeric fields
  if (typeof cloned.global_coherence !== 'number' || isNaN(cloned.global_coherence)) {
    cloned.global_coherence = typeof cloned.coherence === 'number' && !isNaN(cloned.coherence) ? cloned.coherence : 0.85;
  }
  if (typeof cloned.entropy !== 'number' || isNaN(cloned.entropy)) {
    cloned.entropy = 0.35;
  }

  // Repair string fields
  if (typeof cloned.status !== 'string') {
    cloned.status = cloned.msg || "系統預設：狀態訊號常態收斂運作中。";
  }
  if (typeof cloned.status_code !== 'string') {
    cloned.status_code = EvolutionStatus.IDLE;
  }
  if (typeof cloned.rejection_count !== 'number' || isNaN(cloned.rejection_count)) {
    cloned.rejection_count = 0;
  }
  if (typeof cloned.msg !== 'string') {
    cloned.msg = cloned.status || "系統狀態常態收斂中";
  }
  if (typeof cloned.version !== 'string') {
    cloned.version = "1.0.0";
  }

  // Repair arrays
  if (!Array.isArray(cloned.vectors)) {
    cloned.vectors = [0.85, 0.35, 0.12, 0.95];
  }
  if (!Array.isArray(cloned.labels)) {
    cloned.labels = ["Coherence", "Entropy", "Free Energy", "Stability"];
  }
  if (!Array.isArray(cloned.history)) {
    cloned.history = [] as number[];
  }
  if (!Array.isArray(cloned.layers)) {
    cloned.layers = [
      { id: "L1", name: "Epistemic Input Layer", data: [[0.85, 0.12, 0.64]], coherence: 0.85 },
      { id: "L2", name: "Cognitive Resonator", data: [[0.72, 0.05, 0.88]], coherence: 0.72 },
      { id: "L3", name: "Sovereign Outflow Layer", data: [[0.95, 0.35, 0.44]], coherence: 0.95 }
    ];
  }

  // Repair layers inner items
  cloned.layers = cloned.layers.map((layer: any) => {
    if (!layer || typeof layer !== 'object') {
      return { 
        id: "LYR_" + Math.random().toString(36).substring(2, 7).toUpperCase(), 
        name: "Defensive Subnetwork Segment", 
        data: [[0.5, 0.5, 0.5]],
        coherence: 0.5
      };
    }
    const layerCopy = { ...layer };
    if (typeof layerCopy.id !== 'string') {
      layerCopy.id = "LYR_" + Math.random().toString(36).substring(2, 7).toUpperCase();
    }
    if (typeof layerCopy.name !== 'string') {
      layerCopy.name = "Defensive Subnetwork Segment";
    }
    if (!Array.isArray(layerCopy.data)) {
      layerCopy.data = [[0.5, 0.5, 0.5]];
    } else if (layerCopy.data.length > 0 && !Array.isArray(layerCopy.data[0])) {
      // Heal array from 1D to 2D matrix structure
      layerCopy.data = [layerCopy.data];
    }
    if (typeof layerCopy.coherence !== 'number' || isNaN(layerCopy.coherence)) {
      layerCopy.coherence = 0.5;
    }
    return layerCopy;
  });

  return cloned as BrainData;
}

export const saveStableSnapshot = (data: BrainData) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_SNAPSHOT_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("[STATE_RECOVERY] Failed to persist stable snapshot to local storage:", e);
    }
  }
};

export const loadStableSnapshot = (): BrainData | null => {
  if (typeof window !== 'undefined') {
    try {
      const serialized = localStorage.getItem(LOCAL_STORAGE_SNAPSHOT_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        // We selfHeal parsed data here to make sure it's 100% compliant
        const healed = selfHealBrainData(parsed);
        console.log("[STATE_RECOVERY] Valid stable state snapshot retrieved and self-healed from localStorage.");
        return healed;
      }
    } catch (e) {
      console.warn("[STATE_RECOVERY] Failed to parse snapshot from local storage:", e);
    }
  }
  return null;
};

export interface SovereignState {
  // Auth state
  user: User | null;
  authReady: boolean;
  isArchitect: boolean;
  isSandboxExplorer: boolean;
  
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
  toggleSandboxExplorer: () => void;

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

  // Workspaces state
  activeWorkspace: { id: string, name: string };
  workspaces: Array<{ id: string, name: string }>;
  setActiveWorkspace: (id: string) => void;
  addWorkspace: (name: string) => void;
  deleteWorkspace: (id: string) => void;
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

const getInitialWorkspaces = (): Array<{ id: string, name: string }> => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('veda-workspaces');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
  }
  return [
    { id: 'default', name: 'Global Matrix' },
    { id: 'financial_analyst', name: 'Strategic Financial Workspace' },
    { id: 'deep_research', name: 'Cognitive Research Core' }
  ];
};

const getInitialActiveWorkspace = (workspaces: Array<{ id: string, name: string }>): { id: string, name: string } => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('veda-active-workspace-id');
    const found = workspaces.find(w => w.id === saved);
    if (found) return found;
  }
  return workspaces[0];
};

// Module-scoped promise to deduplicate simultaneous/parallel fetch Veda data calls
let activeFetchPromise: Promise<void> | null = null;

export const useSovereignStore = create<SovereignState>((set, get) => ({
  // Workspaces state
  activeWorkspace: getInitialActiveWorkspace(getInitialWorkspaces()),
  workspaces: getInitialWorkspaces(),

  // Auth state
  user: null,
  authReady: false,
  isArchitect: false,
  isSandboxExplorer: false,

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
      isArchitect: (user?.email === 'duo027@gmail.com') || get().isSandboxExplorer
    });
  },
  
  setAuthReady: (ready) => set({ authReady: ready }),
  
  initializeAuth: () => {
    const unsub = onAuthStateChanged(auth, (user) => {
      set({ 
        user, 
        authReady: true,
        isArchitect: (user?.email === 'duo027@gmail.com') || get().isSandboxExplorer
      });
      // Automatically pull state when Auth changes
      if (user) {
        get().fetchVedaData().catch(() => {});
      }
    });
    return unsub;
  },

  toggleSandboxExplorer: () => {
    const nextVal = !get().isSandboxExplorer;
    const isOwner = get().user?.email === 'duo027@gmail.com';
    set({
      isSandboxExplorer: nextVal,
      isArchitect: isOwner || nextVal
    });
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
      set((state) => {
        const rawNext = userData(state.userData);
        const nextData = rawNext ? selfHealBrainData(rawNext) : null;
        if (nextData) {
          saveStableSnapshot(nextData);
        }
        return { userData: nextData, apiError: null, isLoading: false };
      });
    } else {
      const nextData = userData ? selfHealBrainData(userData) : null;
      if (nextData) {
        saveStableSnapshot(nextData);
      }
      set({ userData: nextData, apiError: null, isLoading: false });
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
        let safeData: BrainData | null = null;

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

        if (safeData) {
          const healed = selfHealBrainData(safeData);
          saveStableSnapshot(healed);
          set({ 
            userData: healed, 
            apiError: null, // Robust: never locks the screen
            isLoading: false 
          });
          safeData = healed;
        } else {
          const recovered = loadStableSnapshot() || (currentData ? selfHealBrainData(currentData) : null) || selfHealBrainData(null);
          set({
            userData: recovered,
            apiError: null,
            isLoading: false
          });
          safeData = recovered;
        }

        // Synchronize UI components based on telemetry states (Reactive Feedback Loop)
        if (safeData?.is_bursting) {
          set({ showBurstMonitor: true });
        }
      } catch (e: any) {
        console.warn("[VEDA_SYNC_SYSTEM] Extreme transient sync failure (self-healing recovery auto-engaged):", e);
        const recovered = loadStableSnapshot() || (get().userData ? selfHealBrainData(get().userData) : null) || selfHealBrainData(null);
        set({ 
          userData: recovered,
          apiError: null, // Keep UI running smoothly under any network failures
          isLoading: false 
        }); // 拒絕向用戶展示破碎的異常
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
  },

  setActiveWorkspace: (id) => {
    const ws = get().workspaces.find(w => w.id === id);
    if (ws) {
      localStorage.setItem('veda-active-workspace-id', id);
      set({ activeWorkspace: ws, userData: null, isLoading: true });
      vedaService.switchWorkspace();
      get().fetchVedaData().catch(() => {});
    }
  },

  addWorkspace: (name) => {
    const id = `ws_${Math.random().toString(36).substring(2, 9)}`;
    const newWs = { id, name };
    const updated = [...get().workspaces, newWs];
    localStorage.setItem('veda-workspaces', JSON.stringify(updated));
    set({ workspaces: updated });
    get().setActiveWorkspace(id);
  },

  deleteWorkspace: (id) => {
    if (id === 'default') return;
    const filtered = get().workspaces.filter(w => w.id !== id);
    localStorage.setItem('veda-workspaces', JSON.stringify(filtered));
    set({ workspaces: filtered });
    if (get().activeWorkspace.id === id) {
      get().setActiveWorkspace('default');
    }
  }
}));
