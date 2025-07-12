import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {PlayerStore} from "@/types/player";

export const usePlayerStore = create<PlayerStore>()(
    persist(
        (set) => ({
            player: null,
            setPlayer: (player) => set({ player }),
            clearPlayer: () => set({ player: null }),
        }),
        {
            name: 'player-store', // key in localStorage/AsyncStorage
        }
    )
);
