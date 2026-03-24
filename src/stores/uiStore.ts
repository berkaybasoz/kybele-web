import { create } from 'zustand';

type UIState = {
  sidebarCollapsed: boolean;
  globalSearch: string;
  toggleSidebar: () => void;
  setGlobalSearch: (value: string) => void;
};

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  globalSearch: '',
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setGlobalSearch: (value) => set({ globalSearch: value }),
}));
