import { tokenService } from '@/auth/services/tokenService';
import { API_BASE } from '@/constants/config';
import { TopbarData } from '@/types';

export async function fetchTopbar(): Promise<TopbarData> {
    const token = await tokenService.getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_BASE}/topbar`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data?.message || `Failed to load top bar: ${res.status}`);
    }
    return data as TopbarData;
}


