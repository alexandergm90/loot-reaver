import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import IntroLoginPanel from '@/screens/IntroLoginPanel';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, SafeAreaView, Text, View } from 'react-native';
import AnimatedLogo from '@/components/ui/AnimatedLogo';
import styles from './styles/IntroScreen.styles';
import AppButton from "@/components/ui/AppButton";
import LoadingAnimation from "@/components/ui/LoadingAnimation";

const IntroScreen = () => {
    const { status, error, retry } = useAuthBootstrap();
    const [showLogin, setShowLogin] = useState(false);
    const progress = useRef(new Animated.Value(0)).current;

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [progress]);

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
        if (status === 'pending') {
            setShowLogin(false); // 🔄 Reset if retrying
            return;
        }

        const timeout = setTimeout(() => setShowLogin(true), 2000);
        return () => clearTimeout(timeout);
    }, [status]);


    return (
        <SafeAreaView style={styles.container}>
            <AnimatedLogo />
            <View style={styles.transitionContainer}>
                {status === 'error' ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>
                            {error === 'network'
                                ? 'Cannot connect to server.'
                                : 'An unexpected error occurred.'}
                        </Text>
                        <AppButton onPress={retry}>Retry</AppButton>
                    </View>
                ) : !showLogin ? (
                    <LoadingAnimation />
                ) : (
                    <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
                        <IntroLoginPanel />
                    </Animated.View>
                )}
            </View>
        </SafeAreaView>
    );
};

export default IntroScreen;
