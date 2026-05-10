import { create } from 'zustand';
import { User } from '@/types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  
  setUser: (user) => set({ user, isAuthenticated: true }),
  
  setAccessToken: (token) => set({ accessToken: token }),
  
  logout: () => {
    set({ user: null, accessToken: null, isAuthenticated: false });
    // In a real app, also call /api/v1/auth/logout
    fetch('/api/v1/auth/logout', { method: 'POST' }).catch(console.error);
  },
  
  initAuth: async () => {
    try {
      const res = await fetch('/api/v1/auth/me');
      if (res.ok) {
        const { data } = await res.json();
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
