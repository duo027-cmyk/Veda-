// 統一應用狀態管理 - 替代分散的 stores
import { create } from 'zustand';
import { BrainData } from '../types';
import { User } from 'firebase/auth';

export interface AppState {
  // ===== 認證狀態 =====
  user: User | null;
  authReady: boolean;
  isArchitect: boolean;
  
  // ===== VEDA 狀態 =====
  userData: BrainData | null;
  isLoadingVedaData: boolean;
  apiError: string | null;
  lastLog: string | null;
  isPulsing: boolean;
  
  // ===== UI 狀態 =====
  currentView: 'DIALOGUE' | 'SYNAPSE' | 'DREAM' | 'CORE' | 'KNOWLEDGE' | 'SOVEREIGN' | 'SYNTHESIS' | 'VISUAL' | 'EFFICACY' | 'CINEMA' | 'TASKS';
  selectedFragment: { id: string; type: string; label: string } | null;
  showBurstMonitor: boolean;
  theme: 'LIGHT' | 'DARK';
  
  // ===== WebSocket 連接狀態 =====
  wsConnected: boolean;
  wsReconnecting: boolean;
  
  // ===== 同步狀態 =====
  syncedMemories: Set<string>;
  syncInProgress: boolean;
  
  // ===== Actions =====
  setUser: (user: User | null) => void;
  setAuthReady: (ready: boolean) => void;
  setIsArchitect: (isArchitect: boolean) => void;
  
  setUserData: (userData: BrainData | null | ((prev: BrainData | null) => BrainData | null)) => void;
  setIsLoadingVedaData: (loading: boolean) => void;
  setApiError: (error: string | null) => void;
  setLastLog: (log: string | null) => void;
  setIsPulsing: (pulsing: boolean) => void;
  
  setCurrentView: (view: any) => void;
  setSelectedFragment: (fragment: any) => void;
  setShowBurstMonitor: (show: boolean) => void;
  setTheme: (theme: 'LIGHT' | 'DARK') => void;
  
  setWsConnected: (connected: boolean) => void;
  setWsReconnecting: (reconnecting: boolean) => void;
  
  addSyncedMemory: (id: string) => void;
  setSyncInProgress: (inProgress: boolean) => void;
  
  // 複合操作
  resetState: () => void;
  updateUserDataPartial: (partial: Partial<BrainData>) => void;
}

const initialState = {
  // Auth
  user: null,
  authReady: false,
  isArchitect: false,
  
  // Veda
  userData: null,
  isLoadingVedaData: true,
  apiError: null,
  lastLog: null,
  isPulsing: false,
  
  // UI
  currentView: 'DIALOGUE' as const,
  selectedFragment: null,
  showBurstMonitor: false,
  theme: 'DARK' as const,
  
  // WebSocket
  wsConnected: false,
  wsReconnecting: false,
  
  // Sync
  syncedMemories: new Set<string>(),
  syncInProgress: false,
};

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,
  
  // Auth actions
  setUser: (user) => set({ user }),
  setAuthReady: (ready) => set({ authReady: ready }),
  setIsArchitect: (isArchitect) => set({ isArchitect }),
  
  // Veda actions
  setUserData: (userData) => {
    if (typeof userData === 'function') {
      set((state) => ({ userData: userData(state.userData), isLoadingVedaData: false }));
    } else {
      set({ userData, isLoadingVedaData: false });
    }
  },
  setIsLoadingVedaData: (loading) => set({ isLoadingVedaData: loading }),
  setApiError: (apiError) => set({ apiError }),
  setLastLog: (lastLog) => set({ lastLog }),
  setIsPulsing: (isPulsing) => set({ isPulsing }),
  
  // UI actions
  setCurrentView: (currentView) => set({ currentView }),
  setSelectedFragment: (selectedFragment) => set({ selectedFragment }),
  setShowBurstMonitor: (showBurstMonitor) => set({ showBurstMonitor }),
  setTheme: (theme) => set({ theme }),
  
  // WebSocket actions
  setWsConnected: (wsConnected) => set({ wsConnected }),
  setWsReconnecting: (wsReconnecting) => set({ wsReconnecting }),
  
  // Sync actions
  addSyncedMemory: (id) => {
    const current = get().syncedMemories;
    set({ syncedMemories: new Set([...current, id]) });
  },
  setSyncInProgress: (inProgress) => set({ syncInProgress: inProgress }),
  
  // 複合操作
  resetState: () => set(initialState),
  
  updateUserDataPartial: (partial) => {
    set((state) => ({
      userData: state.userData ? { ...state.userData, ...partial } : null,
    }));
  },
}));
