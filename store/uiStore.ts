import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  aiPanelOpen: boolean;
  activeMapView: boolean;
  toggleSidebar: () => void;
  setAIPanelOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  aiPanelOpen: false,
  activeMapView: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setAIPanelOpen: (open) => set({ aiPanelOpen: open })
}));
