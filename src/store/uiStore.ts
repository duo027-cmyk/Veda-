import { create } from 'zustand';
import { ViewMode } from '../types';

interface UIState {
  view: ViewMode;
  selectedFragment: { id: string, type: string, label: string } | null;
  showBurstMonitor: boolean;
  theme: 'DARK' | 'LIGHT';
  
  setView: (view: ViewMode) => void;
  setSelectedFragment: (fragment: { id: string, type: string, label: string } | null) => void;
  setShowBurstMonitor: (show: boolean) => void;
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

export const useUIStore = create<UIState>((set) => ({
  view: 'DIALOGUE',
  selectedFragment: null,
  showBurstMonitor: false,
  theme: getInitialTheme(),
  
  setView: (view) => set({ view }),
  setSelectedFragment: (selectedFragment) => set({ selectedFragment }),
  setShowBurstMonitor: (showBurstMonitor) => set({ showBurstMonitor }),
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
