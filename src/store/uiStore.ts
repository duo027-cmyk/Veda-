import { create } from 'zustand';
import { ViewMode } from '../types';

export interface UIState {
  view: ViewMode;
  selectedFragment: { id: string, type: string, label: string } | null;
  showBurstMonitor: boolean;
  showControlPanel: boolean;
  theme: 'DARK' | 'LIGHT';
  isPulsing: boolean;
  
  setView: (view: ViewMode) => void;
  setSelectedFragment: (fragment: { id: string, type: string, label: string } | null) => void;
  setShowBurstMonitor: (show: boolean) => void;
  setShowControlPanel: (show: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'DARK' | 'LIGHT') => void;
  setIsPulsing: (isPulsing: boolean) => void;
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

// Central dedicated UI-only interactive state store
export const useUIStateStore = create<UIState>((set) => ({
  view: getInitialView(),
  selectedFragment: null,
  showBurstMonitor: false,
  showControlPanel: false,
  theme: getInitialTheme(),
  isPulsing: false,

  setView: (view) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('veda-view', view);
    }
    set({ view });
  },
  setSelectedFragment: (selectedFragment) => set({ selectedFragment }),
  setShowBurstMonitor: (showBurstMonitor) => set({ showBurstMonitor }),
  setShowControlPanel: (showControlPanel) => set({ showControlPanel }),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('veda-theme', theme);
    }
    set({ theme });
  },
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'DARK' ? 'LIGHT' : 'DARK';
    if (typeof window !== 'undefined') {
      localStorage.setItem('veda-theme', nextTheme);
    }
    return { theme: nextTheme };
  }),
  setIsPulsing: (isPulsing) => set({ isPulsing }),
}));

// Legacy alias for compatibility with existing components
export const useUIStore = useUIStateStore;

(useUIStore as any).getState = (): UIState => {
  return useUIStateStore.getState();
};

(useUIStore as any).setState = (update: any) => {
  if (typeof update === 'function') {
    const current = useUIStateStore.getState();
    const next = update(current);
    useUIStateStore.setState(next);
  } else {
    useUIStateStore.setState(update);
  }
};

(useUIStore as any).subscribe = (listener: any) => {
  return useUIStateStore.subscribe(listener);
};
