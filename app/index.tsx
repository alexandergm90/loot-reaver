import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import IntroLoginPanel from '@/screens/IntroLoginPanel';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, SafeAreaView, Text, View } from 'react-native';
import AnimatedLogo from '@/components/ui/AnimatedLogo';
import styles from './styles/IntroScreen.styles';

const IntroScreen = () => {
    const status = useAuthBootstrap();
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
        if (status !== 'pending') {
            const timeout = setTimeout(() => setShowLogin(true), 2000);
            return () => clearTimeout(timeout);
        }
    }, [status]);

    const width = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <SafeAreaView style={styles.container}>
            <AnimatedLogo />
            <View style={styles.transitionContainer}>
                {!showLogin && (
                    <View style={styles.loadingWrapper}>
                        <View style={styles.progressBar}>
                            <Animated.View style={[styles.progressFill, { width }]} />
                        </View>
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                )}

                {showLogin && (
                    <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
                        <IntroLoginPanel />
                    </Animated.View>
                )}
            </View>
        </SafeAreaView>
    );
};

export default IntroScreen;
