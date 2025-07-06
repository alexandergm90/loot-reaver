import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://localhost:3000';

export async function loginAsGuest(playerId: string) {
    const res = await fetch(`${API_BASE}/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Guest login failed');

    await SecureStore.setItemAsync('access_token', data.access_token);
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

    await SecureStore.setItemAsync('access_token', data.access_token);
    return data.access_token;
}