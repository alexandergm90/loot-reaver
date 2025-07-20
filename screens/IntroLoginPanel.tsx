import storage from '@/auth/storage';
import { continueSessionFlow } from '@/services/authService';
import { usePlayerStore } from '@/store/playerStore';
import React, { useEffect } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

const IntroLoginPanel: React.FC = () => {
    const player = usePlayerStore((state) => state.player);
    const hasHydrated = usePlayerStore((state) => state.hasHydrated);

    useEffect(() => {
        const hydrate = async () => {
            const raw = await storage.getItem('player');
            if (raw) {
                const parsed = JSON.parse(raw);
                usePlayerStore.getState().setPlayer(parsed);
            }
            usePlayerStore.getState().setHasHydrated();
        };

        hydrate();
    }, []);

    const handleEnter = async () => {
        await continueSessionFlow();
    };

    if (!hasHydrated) return null;

    return (
        <View style={styles.container}>
            {player?.hasCharacter && (
                <Text style={styles.greeting}>
                    Welcome, {player.title ?? ''} {player.username}
                </Text>
            )}
            <Button title="Enter Realm" onPress={handleEnter} />
            {!player && <Text style={styles.small}>Start as guest (auto-login)</Text>}
        </View>
    );
};

export default IntroLoginPanel;

const styles = StyleSheet.create({
    container: {
        marginTop: 32,
        alignItems: 'center',
    },
    greeting: {
        fontSize: 18,
        marginBottom: 16,
        color: '#fff',
    },
    small: {
        marginTop: 12,
        fontSize: 12,
        color: '#888',
    },
});
