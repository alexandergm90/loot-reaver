import storage from '@/auth/utils/storage';
import { API_BASE } from '@/constants/config';
import { CombatResult } from '@/types/combat';

export async function runDungeonCombat(dungeonId: string, level: number): Promise<CombatResult> {
    const token = await storage.getItem('access_token');
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${API_BASE}/dungeons/${dungeonId}/run/${level}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to run dungeon combat');
    
    return data;
}
