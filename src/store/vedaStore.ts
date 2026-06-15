import { useSovereignStore } from './sovereignStore';
import { useShallow } from 'zustand/react/shallow';
import { BrainData } from '../types';

export interface VedaState {
  userData: BrainData | null;
  apiError: string | null;
  lastLog: string | null;
  isLoading: boolean;
  
  setUserData: (userData: BrainData | null | ((prev: BrainData | null) => BrainData | null)) => void;
  setApiError: (error: string | null) => void;
  setLastLog: (log: string | null) => void;
  fetchVedaData: () => Promise<void>;
  handleAction: (action: string, params?: any) => Promise<void>;
}

export const useVedaStore = () => {
  return useSovereignStore(
    useShallow((state) => ({
      userData: state.userData,
      apiError: state.apiError,
      lastLog: state.lastLog,
      isLoading: state.isLoading,
      setUserData: state.setUserData,
      setApiError: state.setApiError,
      setLastLog: state.setLastLog,
      fetchVedaData: state.fetchVedaData,
      handleAction: state.handleAction,
    }))
  );
};

(useVedaStore as any).getState = (): VedaState => {
  const state = useSovereignStore.getState();
  return {
    userData: state.userData,
    apiError: state.apiError,
    lastLog: state.lastLog,
    isLoading: state.isLoading,
    setUserData: state.setUserData,
    setApiError: state.setApiError,
    setLastLog: state.setLastLog,
    fetchVedaData: state.fetchVedaData,
    handleAction: state.handleAction,
  };
};

(useVedaStore as any).setState = (update: any) => {
  if (typeof update === 'function') {
    const current = (useVedaStore as any).getState();
    const next = update(current);
    useSovereignStore.setState(next);
  } else {
    useSovereignStore.setState(update);
  }
};

(useVedaStore as any).subscribe = (listener: any) => {
  return useSovereignStore.subscribe(() => {
    listener((useVedaStore as any).getState());
  });
};
