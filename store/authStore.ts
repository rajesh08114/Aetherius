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

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  
  setUser: (user) => set({ user, isAuthenticated: true }),
  
  setAccessToken: (token) => set({ accessToken: token }),
  
  logout: () => {
    const token = get().accessToken;
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    fetch('/api/v1/auth/logout', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    }).catch(console.error);
  },
  
  initAuth: async () => {
    set({ isLoading: true });
    try {
      const refreshRes = await fetch('/api/v1/auth/refresh', { method: 'POST' });
      if (!refreshRes.ok) {
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const refreshJson = await refreshRes.json();
      const accessToken = refreshJson?.data?.accessToken as string | undefined;
      if (!accessToken) {
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const meRes = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (meRes.ok) {
        const { data } = await meRes.json();
        set({ user: data.user, accessToken, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
