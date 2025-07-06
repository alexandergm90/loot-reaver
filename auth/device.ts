import storage from './storage';
import { v4 as uuidv4 } from 'uuid';

const PLAYER_ID_KEY = 'player_id';

export async function getOrCreatePlayerId(): Promise<string> {
    let playerId = await storage.getItem(PLAYER_ID_KEY);

    if (!playerId) {
        playerId = uuidv4();
        await storage.setItem(PLAYER_ID_KEY, playerId);
    }

    return playerId;
}