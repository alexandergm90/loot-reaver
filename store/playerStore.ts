import { create } from 'zustand';
import { PlayerStore } from '@/types/player';

export const usePlayerStore = create<PlayerStore>()((set) => ({
    player: null,
    setPlayer: (player) => set({ player }),
    clearPlayer: () => set({ player: null }),
    hasHydrated: false,
    setHasHydrated: () => set({ hasHydrated: true }),
}));
