import { useSession } from '@/auth/hooks/useSession';
import { tokenService } from '@/auth/services/tokenService';
import { ROUTES } from '@/constants/routes';
import { registerPlayerProfile } from '@/services/playerService';
import { useCharacterStore } from '@/store/characterStore';
import { usePlayerStore } from '@/store/playerStore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import CharacterStep from '@/components/register/CharacterStep';
import TraitStep from '@/components/register/TraitStep';
import AppButton from '@/components/ui/AppButton';

export default function RegisterScreen() {
    const [step, setStep] = useState<'character' | 'trait'>('character');
    const [loading, setLoading] = useState(false);
    const { character, trait } = useCharacterStore();
    const setPlayer = usePlayerStore((s) => s.setPlayer);
    const { isLoading, player } = useSession();

    useEffect(() => {
        let alive = true;
        const run = async () => {
            if (isLoading) return;

            // If player exists and already has a character, go to main
            if (player?.hasCharacter) {
                router.replace(ROUTES.main.home);
                return;
            }

            // If no player, check if a valid token exists before kicking back to intro
            const token = await tokenService.getToken();
            if (!player && !token) {
                if (!alive) return;
                router.replace(ROUTES.intro);
            }
            // else: stay on register (we are authenticated or about to be hydrated)
        };
        run();
        return () => {
            alive = false;
        };
    }, [isLoading, player]);
    const stepIndex = useSharedValue(0);

    useEffect(() => {
        stepIndex.value = withTiming(step === 'character' ? 0 : 1, { duration: 300 });
    }, [step]);

    const characterStyle = useAnimatedStyle(() => ({
        opacity: interpolate(stepIndex.value, [0, 1], [1, 0]),
        transform: [{ translateX: interpolate(stepIndex.value, [0, 1], [0, -40]) }],
        position: 'absolute',
        width: '100%',
    }));

    const traitStyle = useAnimatedStyle(() => ({
        opacity: interpolate(stepIndex.value, [0, 1], [0, 1]),
        transform: [{ translateX: interpolate(stepIndex.value, [0, 1], [40, 0]) }],
        position: 'absolute',
        width: '100%',
    }));

    const handleRegister = async () => {
        if (!trait) {
            console.error('❌ Registration failed: Trait is required.');
            return;
        }

        setLoading(true);

        try {
            const player = await registerPlayerProfile({
                appearance: character,
                trait: trait,
            });
            setPlayer(player);
            router.replace(ROUTES.main.home);
        } catch (err) {
            console.error('❌ Registration failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {step === 'character' && (
                    <Animated.View style={[characterStyle]}>
                        <CharacterStep />
                    </Animated.View>
                )}

                {step === 'trait' && (
                    <Animated.View style={[traitStyle]}>
                        <TraitStep />
                    </Animated.View>
                )}
            </View>

            <View style={styles.buttonRow}>
                {step === 'trait' && (
                    <AppButton onPress={() => setStep('character')} style={styles.navButton}>
                        ⬅ Back
                    </AppButton>
                )}
                <AppButton
                    onPress={step === 'character' ? () => setStep('trait') : handleRegister}
                    style={styles.navButton}
                    disabled={loading}
                >
                    {step === 'character'
                        ? 'Choose Trait'
                        : loading
                          ? 'Registering...'
                          : 'Begin Journey'}
                </AppButton>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111',
        padding: 20,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingBottom: 24,
        gap: 12,
    },
    navButton: {
        width: 180,
    },
});
