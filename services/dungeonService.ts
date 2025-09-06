import storage from '@/auth/utils/storage';
import { API_BASE } from '@/constants/config';
import { Dungeon, DungeonDetails } from '@/types';

export async function getDungeons(): Promise<Dungeon[]> {
    const token = await storage.getItem('access_token');
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${API_BASE}/dungeons`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to fetch dungeons');
    
    return data;
}

export async function getDungeonDetails(dungeonId: string, level: number): Promise<DungeonDetails> {
    const token = await storage.getItem('access_token');
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${API_BASE}/dungeons/${dungeonId}/details?level=${level}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to fetch dungeon details');
    
    return data;
}
