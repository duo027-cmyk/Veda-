import { create } from 'zustand';
import { ViewMode } from '../types';

interface UIState {
  view: ViewMode;
  selectedFragment: { id: string, type: string, label: string } | null;
  showBurstMonitor: boolean;
  showControlPanel: boolean;
  theme: 'DARK' | 'LIGHT';
  
  setView: (view: ViewMode) => void;
  setSelectedFragment: (fragment: { id: string, type: string, label: string } | null) => void;
  setShowBurstMonitor: (show: boolean) => void;
  setShowControlPanel: (show: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'DARK' | 'LIGHT') => void;
}

const getInitialTheme = (): 'DARK' | 'LIGHT' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('veda-theme') as 'DARK' | 'LIGHT';
    if (saved) return saved;
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'LIGHT';
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

export const useUIStore = create<UIState>((set) => ({
  view: getInitialView(),
  selectedFragment: null,
  showBurstMonitor: false,
  showControlPanel: false,
  theme: getInitialTheme(),
  
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
}));
