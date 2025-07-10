import storage from './storage';
import uuid from 'react-native-uuid';

const PLAYER_ID_KEY = 'player_id';

export async function getOrCreatePlayerId(): Promise<string> {
    console.log('🟡 getOrCreatePlayerId() called');

    try {
        let playerId = await storage.getItem(PLAYER_ID_KEY);
        console.log('📦 [DEBUG] storage.getItem:', playerId);

        if (!playerId) {
            playerId = uuid.v4() as string;
            console.log('🆕 [DEBUG] generated new playerId:', playerId);
            await storage.setItem(PLAYER_ID_KEY, playerId);
            const confirm = await storage.getItem(PLAYER_ID_KEY);
            console.log('🔁 [DEBUG] re-read after set:', confirm);
        }

        return playerId;
    } catch (err) {
        console.error('❌ getOrCreatePlayerId() error:', err);
        return 'fallback-error-id';
    }
}
