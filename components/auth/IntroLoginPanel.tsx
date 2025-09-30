import { getAuthenticatedUser, loginAsGuest } from '@/auth/services/authService';
import { tokenService } from '@/auth/services/tokenService';
import { getOrCreatePlayerId } from '@/auth/utils/playerId';
import storage from '@/auth/utils/storage';
import AppButton from '@/components/ui/AppButton';
import LoadingAnimation from '@/components/ui/LoadingAnimation';
import LRText from '@/components/ui/LRText';
import { ROUTES } from '@/constants/routes';
import { usePlayerStore } from '@/store/playerStore';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

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
            const savedToken = await tokenService.getToken();
            console.log('[IntroLoginPanel] token after guest:', savedToken);

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
                <View style={styles.greetingContainer}>
                    <LRText weight="regular" style={styles.greeting}>
                        {`WELCOME, ${player.character!.title ? player.character!.title.toUpperCase() + ' ' : ''}${player.character!.name.toUpperCase()}`}
                    </LRText>
                </View>
            )}
            {working ? (
                <LoadingAnimation message="Preparing Realm..." />
            ) : (
                <>
                    <AppButton onPress={handleEnter} disabled={working}>
                        Enter Realm
                    </AppButton>
                    {!player && <LRText style={styles.small}>Start as guest (auto-login)</LRText>}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 32,
        alignItems: 'center',
        width: '100%',
    },
    greetingContainer: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 8,
    },
    greeting: {
        fontSize: 18,
        lineHeight: 22,
        color: '#ead7b4',
        textAlign: 'center',
        maxWidth: '86%',
        letterSpacing: 0.3,
        textShadowColor: 'rgba(0,0,0,0.85)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    small: {
        marginTop: 12,
        fontSize: 12,
        color: '#888',
    },
});

export default IntroLoginPanel;
