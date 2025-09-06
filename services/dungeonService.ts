import storage from '@/auth/utils/storage';
import { API_BASE } from '@/constants/config';
import { Dungeon } from '@/types';

export async function getDungeons(): Promise<Dungeon[]> {
    const token = await storage.getItem('access_token');
    if (!token) throw new Error('Not authenticated');
    
    try {
        const res = await fetch(`${API_BASE}/dungeons`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to fetch dungeons');
        
        return data;
    } catch (error) {
        // Fallback to mock data for development
        console.log('API not available, using mock data:', error);
        return [
            {
                id: "5fd14f46-d1c1-49d2-b0db-cdde616954f2",
                name: "Goblin Cave",
                code: "goblin_cave",
                highestLevelCleared: 0,
                availableLevels: 1
            },
            {
                id: "69042730-fec2-4347-9396-2dfb93dcb38b",
                name: "Orc Stronghold",
                code: "orc_stronghold",
                highestLevelCleared: 0,
                availableLevels: 1
            },
            {
                id: "91c3d355-1110-4632-9235-4fb93c71e931",
                name: "Undead Crypt",
                code: "undead_crypt",
                highestLevelCleared: 0,
                availableLevels: 1
            }
        ];
    }
}
