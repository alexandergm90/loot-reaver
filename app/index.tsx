import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, SafeAreaView, Text, View } from 'react-native';
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import { router } from 'expo-router';
import styles from './styles/IntroScreen.styles';
import IntroLoginPanel from '@/screens/IntroLoginPanel';
import {ROUTES} from "@/constants/routes";

const IntroScreen = () => {
    const status = useAuthBootstrap();
    const [showLogin, setShowLogin] = useState(false);
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, []);

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
            <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
            {showLogin ? (
                <IntroLoginPanel />
            ) : (
                <>
                    <View style={styles.progressBar}>
                        <Animated.View style={[styles.progressFill, { width }]} />
                    </View>
                    <Text style={styles.loadingText}>
                        {status === 'pending' ? 'Loading...' : 'Entering realm...'}
                    </Text>
                </>
            )}
        </SafeAreaView>
    );
};

export default IntroScreen;
