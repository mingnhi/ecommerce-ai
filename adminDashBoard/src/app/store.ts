import { create } from "zustand";

type AppState = {
  isSessionExpired: boolean;
  openSessionExpired: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  isSessionExpired: false,
  openSessionExpired: () =>
    set({ isSessionExpired: true }),
}));