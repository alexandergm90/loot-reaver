import styles from '@/app/auth/intro.styles';
import { useSession } from '@/auth/hooks/useSession';
import IntroLoginPanel from '@/components/auth/IntroLoginPanel';
import AnimatedLogo from '@/components/ui/AnimatedLogo';
import AppButton from '@/components/ui/AppButton';
import EmberField from '@/components/ui/EmberField';
import LoadingAnimation from '@/components/ui/LoadingAnimation';
import { Asset } from 'expo-asset';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const IntroScreen = () => {
    const { isLoading, error, loadSession } = useSession();
    const [showLogin, setShowLogin] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        Asset.loadAsync([
            require('@/assets/images/dark_leather.png'),
            require('@/assets/images/ui/medium_button_simple.png'),
            require('@/assets/images/ui/medium_button_hover.png'),
            require('@/assets/images/flame1.png'),
            require('@/assets/images/flame2.png'),
            require('@/assets/images/flame3.png'),
            require('@/assets/images/flame4.png'),
            require('@/assets/images/flame5.png'),
            require('@/assets/images/flame6.png'),
            require('@/assets/images/flame7.png'),
        ]);
    }, []);

    useEffect(() => {
        if (showLogin) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
    }, [fadeAnim, showLogin]);

    useEffect(() => {
        if (isLoading) {
            setShowLogin(false);
            return;
        }

        const timeout = setTimeout(() => setShowLogin(true), 2000);
        return () => clearTimeout(timeout);
    }, [isLoading]);

    return (
        <>
            <LinearGradient
                pointerEvents="none"
                colors={['transparent', 'rgba(0,0,0,0.35)']}
                locations={[0.6, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Foreground content respects safe areas */}
            <View style={[{ flex: 1 }, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <View style={styles.container}>
                    {/* Far layer (slower) */}
                    <EmberField poolSize={8} motionScale={0.8} lifetimeScale={0.9} fadeOutAt={0.6} maxRiseFraction={0.55} />
                    {/* Near layer (quicker, shorter) */}
                    <EmberField poolSize={6} motionScale={0.5} lifetimeScale={0.8} fadeOutAt={0.5} maxRiseFraction={0.45} />
                    <View style={{ marginTop: -50 }}>
                        <AnimatedLogo />
                    </View>
                    <View style={styles.transitionContainer}>
                        {error ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>
                                    {error === 'network'
                                        ? 'Cannot connect to server.'
                                        : 'An unexpected error occurred.'}
                                </Text>
                                <AppButton onPress={loadSession}>Retry</AppButton>
                            </View>
                        ) : !showLogin ? (
                            <LoadingAnimation />
                        ) : (
                            <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
                                <IntroLoginPanel />
                            </Animated.View>
                        )}
                    </View>
                </View>
            </View>
        </>
    );
};

export default IntroScreen;
