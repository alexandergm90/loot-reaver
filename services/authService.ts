import storage from '@/auth/storage';

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
    const token = await storage.getItem('access_token');
    if (!token) return 'login';

    const res = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
        await storage.deleteItem('access_token');
        return 'login';
    }

    const data = await res.json();
    if (!res.ok || !data) return 'login';

    return data.hasCharacter ? 'game' : 'character';
}