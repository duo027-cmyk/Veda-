import { useSovereignStore } from './sovereignStore';
import { useShallow } from 'zustand/react/shallow';
import { ViewMode } from '../types';

export interface UIState {
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

export const useUIStore = () => {
  return useSovereignStore(
    useShallow((state) => ({
      view: state.view,
      selectedFragment: state.selectedFragment,
      showBurstMonitor: state.showBurstMonitor,
      showControlPanel: state.showControlPanel,
      theme: state.theme,
      setView: state.setView,
      setSelectedFragment: state.setSelectedFragment,
      setShowBurstMonitor: state.setShowBurstMonitor,
      setShowControlPanel: state.setShowControlPanel,
      toggleTheme: state.toggleTheme,
      setTheme: state.setTheme,
    }))
  );
};

(useUIStore as any).getState = (): UIState => {
  const state = useSovereignStore.getState();
  return {
    view: state.view,
    selectedFragment: state.selectedFragment,
    showBurstMonitor: state.showBurstMonitor,
    showControlPanel: state.showControlPanel,
    theme: state.theme,
    setView: state.setView,
    setSelectedFragment: state.setSelectedFragment,
    setShowBurstMonitor: state.setShowBurstMonitor,
    setShowControlPanel: state.setShowControlPanel,
    toggleTheme: state.toggleTheme,
    setTheme: state.setTheme,
  };
};

(useUIStore as any).setState = (update: any) => {
  if (typeof update === 'function') {
    const current = (useUIStore as any).getState();
    const next = update(current);
    useSovereignStore.setState(next);
  } else {
    useSovereignStore.setState(update);
  }
};

(useUIStore as any).subscribe = (listener: any) => {
  return useSovereignStore.subscribe(() => {
    listener((useUIStore as any).getState());
  });
};
