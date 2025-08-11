import { getAuthenticatedUser, loginAsGuest } from '@/auth/services/authService';
import { getOrCreatePlayerId } from '@/auth/utils/playerId';
import storage from '@/auth/utils/storage';
import { ROUTES } from '@/constants/routes';
import { usePlayerStore } from '@/store/playerStore';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import LoadingAnimation from '@/components/ui/LoadingAnimation';

const IntroLoginPanel: React.FC = () => {
    const player = usePlayerStore((s) => s.player);
    const setPlayer = usePlayerStore((s) => s.setPlayer);
    const [working, setWorking] = useState(false);

    const handleEnter = async () => {
        try {
            if (player) {
                router.replace(player.hasCharacter ? ROUTES.main.home : ROUTES.register);
                return;
            }

            setWorking(true); // show loader immediately

            const playerId = await getOrCreatePlayerId();
            await loginAsGuest(playerId);

            const user = await getAuthenticatedUser();
            if (user) {
                setPlayer(user);
                await storage.setItem('player', JSON.stringify(user));
                router.replace(user.hasCharacter ? ROUTES.main.home : ROUTES.register);
            } else {
                router.replace(ROUTES.register);
            }
        } catch (err) {
            console.error('Login error:', err);
            setWorking(false); // only if something failed
        }
    };

    return (
        <View style={styles.container}>
            {player?.hasCharacter && (
                <Text style={styles.greeting}>
                    {`Welcome, ${player.character!.title ? player.character!.title + ' ' : ''}${player.character!.name}`}
                </Text>
            )}
            {working ? (
                <LoadingAnimation message="Preparing Realm..." />
            ) : (
                <>
                    <Button title="Enter Realm" onPress={handleEnter} disabled={working} />
                    {!player && <Text style={styles.small}>Start as guest (auto-login)</Text>}
                </>
            )}
        </View>
    );
};

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

export default IntroLoginPanel;
