import { getOrCreatePlayerId } from '@/auth/playerId';
import storage from '@/auth/storage';
import { ROUTES } from '@/constants/routes';
import { usePlayerStore } from '@/store/playerStore';
import { router } from 'expo-router';
import {Player} from "@/types/player";

const API_BASE = 'http://localhost:3000';

export async function loginAsGuest(playerId: string) {
    const res = await fetch(`${API_BASE}/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Guest login failed');

    await storage.setItem('access_token', data.access_token);
    return data.access_token;
}

export async function loginToBackendWithFacebook(playerId: string, fbAccessToken: string) {
    const res = await fetch(`${API_BASE}/auth/facebook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, fbAccessToken }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Facebook login failed');

    await storage.setItem('access_token', data.access_token);
    return data.access_token;
}

export async function bootstrapAuth(): Promise<'login' | 'character' | 'game'> {
    const user = await getAuthenticatedUser();
    if (!user) return 'login';

    return user.hasCharacter ? 'game' : 'character';
}

export async function getAuthenticatedUser(): Promise<Player | null> {
    const token = await storage.getItem('access_token');
    if (!token) return null;

    const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;

    return await res.json();
}

/**
 * Handles player fetch and routing based on character status.
 * Used after guest login, social login, or restoring session.
 */
export async function continueSessionFlow() {
    const store = usePlayerStore.getState();
    let player = store.player;

    if (!player) {
        const guestId = await getOrCreatePlayerId();
        await loginAsGuest(guestId);

        const fetchedPlayer = await getAuthenticatedUser();
        if (!fetchedPlayer) throw new Error('Player is null');

        store.setPlayer(fetchedPlayer);
        player = fetchedPlayer;
    }

    if (player?.hasCharacter) {
        router.replace(ROUTES.main);
    } else {
        router.replace(ROUTES.character);
    }
}
