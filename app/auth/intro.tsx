import { useSession } from '@/auth/hooks/useSession';
import IntroLoginPanel from '@/components/auth/IntroLoginPanel';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import AnimatedLogo from '@/components/ui/AnimatedLogo';
import styles from '@/app/auth/intro.styles';
import AppButton from "@/components/ui/AppButton";
import LoadingAnimation from "@/components/ui/LoadingAnimation";

const IntroScreen = () => {
    const { isLoading, error, loadSession } = useSession();
    const [showLogin, setShowLogin] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

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
        <View style={styles.container}>
            <AnimatedLogo />
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
    );
};

export default IntroScreen;