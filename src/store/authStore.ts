import { useSovereignStore } from './sovereignStore';
import { useShallow } from 'zustand/react/shallow';
import { User } from 'firebase/auth';

export interface AuthState {
  user: User | null;
  authReady: boolean;
  isArchitect: boolean;
  setUser: (user: User | null) => void;
  setAuthReady: (ready: boolean) => void;
  initialize: () => () => void;
}

export const useAuthStore = () => {
  return useSovereignStore(
    useShallow((state) => ({
      user: state.user,
      authReady: state.authReady,
      isArchitect: state.isArchitect,
      setUser: state.setUser,
      setAuthReady: state.setAuthReady,
      initialize: state.initializeAuth,
    }))
  );
};

(useAuthStore as any).getState = (): AuthState => {
  const state = useSovereignStore.getState();
  return {
    user: state.user,
    authReady: state.authReady,
    isArchitect: state.isArchitect,
    setUser: state.setUser,
    setAuthReady: state.setAuthReady,
    initialize: state.initializeAuth,
  };
};

(useAuthStore as any).setState = (update: any) => {
  if (typeof update === 'function') {
    const current = (useAuthStore as any).getState();
    const next = update(current);
    useSovereignStore.setState(next);
  } else {
    useSovereignStore.setState(update);
  }
};

(useAuthStore as any).subscribe = (listener: any) => {
  return useSovereignStore.subscribe(() => {
    listener((useAuthStore as any).getState());
  });
};
