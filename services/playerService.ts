import storage from '@/auth/utils/storage';
import { API_BASE } from '@/constants/config';
import { CharacterDraft } from '@/store/characterStore';
import { Player } from '@/types';

export async function getPlayerCharacter() {
    const token = await storage.getItem('access_token');
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}/player/character`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to fetch player character');
    return data;
}

export async function getPlayerInventory() {
    const token = await storage.getItem('access_token');
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}/player/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to fetch inventory');
    return data;
}

export async function registerPlayerProfile({
    appearance,
    trait,
}: {
    appearance: CharacterDraft;
    trait: string;
}): Promise<Player> {
    const token = await storage.getItem('access_token');
    console.log('[registerPlayerProfile] token:', token);
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ appearance, trait }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to register character');

    return data as Player;
}
