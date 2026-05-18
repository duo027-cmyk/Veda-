import { create } from 'zustand';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthState {
  user: User | null;
  authReady: boolean;
  isArchitect: boolean;
  setUser: (user: User | null) => void;
  setAuthReady: (ready: boolean) => void;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  authReady: false,
  isArchitect: false,
  setUser: (user) => set({ 
    user, 
    isArchitect: user?.email === 'duo027@gmail.com' 
  }),
  setAuthReady: (ready) => set({ authReady: ready }),
  initialize: () => {
    const unsub = onAuthStateChanged(auth, (user) => {
      set({ 
        user, 
        authReady: true,
        isArchitect: user?.email === 'duo027@gmail.com'
      });
    });
    return unsub;
  },
}));
