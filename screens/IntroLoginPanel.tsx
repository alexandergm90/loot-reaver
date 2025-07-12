import { continueSessionFlow } from '@/services/authService';
import { usePlayerStore } from '@/store/playerStore';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

const IntroLoginPanel: React.FC = () => {
    const player = usePlayerStore((state) => state.player);
    const hasHydrated = usePlayerStore.persist.hasHydrated();

    if (!hasHydrated) return null;

    const handleEnter = async () => {
        await continueSessionFlow();
    };

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
