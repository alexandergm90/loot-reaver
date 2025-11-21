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

export async function getPlayerItem(itemId: string) {
    const token = await storage.getItem('access_token');
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}/player/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to fetch item details');
    return data;
}

export async function equipItem(itemId: string, slot?: string) {
    const token = await storage.getItem('access_token');
    if (!token) throw new Error('Not authenticated');
    const body: { itemId: string; slot?: string } = { itemId };
    if (slot) {
        body.slot = slot;
    }
    const res = await fetch(`${API_BASE}/player/equipment/equip`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to equip item');
    return data;
}

export async function unequipItem(itemId: string) {
    const token = await storage.getItem('access_token');
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}/player/equipment/unequip`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to unequip item');
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
