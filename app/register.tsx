import { ROUTES } from '@/constants/routes';
import { registerPlayerProfile } from '@/services/playerService';
import { useCharacterStore } from '@/store/characterStore';
import { usePlayerStore } from '@/store/playerStore';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import CharacterStep from '@/components/register/CharacterStep';
import TraitStep from '@/components/register/TraitStep';
import AppButton from '@/components/ui/AppButton';

export default function RegisterScreen() {
    const [step, setStep] = useState<'character' | 'background'>('character');
    const [loading, setLoading] = useState(false);
    const { character, trait } = useCharacterStore();

    const handleNext = () => setStep('background');
    const handleBack = () => setStep('character');

    const handleRegister = async () => {
        setLoading(true);
        try {
            const player = await registerPlayerProfile({
                appearance: character,
                trait: trait || 'default',
            });
            usePlayerStore.getState().setPlayer(player);
            router.replace(ROUTES.main);
        } catch (err) {
            console.error('❌ Registration failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const isCharacterStep = step === 'character';
    return (
        <View style={styles.container}>
            {isCharacterStep ? (
                <CharacterStep />
            ) : (
                <TraitStep />
            )}

            <View style={styles.buttonRow}>
                {!isCharacterStep && (
                    <AppButton onPress={handleBack} style={styles.navButton}>
                        ⬅ Back
                    </AppButton>
                )}
                <AppButton
                    onPress={isCharacterStep ? handleNext : handleRegister}
                    style={styles.navButton}
                    disabled={loading}
                >
                    {isCharacterStep
                        ? 'Choose Trait'
                        : loading
                          ? 'Registering...'
                          : 'Enter Realm'}
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
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 22,
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    navButton: {
        width: 180,
        marginHorizontal: 6,
    },
});
