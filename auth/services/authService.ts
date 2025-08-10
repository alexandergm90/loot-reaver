import { tokenService } from '@/auth/services/tokenService';
import { API_BASE } from '@/constants/config';
import { Player } from '@/types';

export async function loginAsGuest(playerId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data?.message || `Guest login failed: ${res.status}`);
    }

    await tokenService.setToken(data);
}

export async function loginWithFacebook(playerId: string, fbAccessToken: string): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/facebook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, fbAccessToken }),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Facebook login failed');
    }

    await tokenService.setToken(data);
}

export async function getAuthenticatedUser(): Promise<Player | null> {
    const token = await tokenService.getToken();
    if (!token) return null;

    try {
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                await tokenService.clearToken();
            }
            return null;
        }

        return await res.json();
    } catch (err) {
        console.error('[getAuthenticatedUser] Network error:', err);
        throw new Error('network');
    }
}