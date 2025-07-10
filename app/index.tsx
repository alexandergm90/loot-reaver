import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import React, { useEffect } from 'react';
import { Animated, Easing, Image, SafeAreaView, Text, View } from 'react-native';
import { router } from 'expo-router';
import styles from './styles/IntroScreen.styles';

const IntroScreen = () => {
    const status = useAuthBootstrap();
    const progress = new Animated.Value(0);

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
            const timeout = setTimeout(() => {
                /*if (status === 'login') router.replace('/login');*/
                if (status === 'character') router.replace('/character');
                if (status === 'game') router.replace('/main');
            }, 2000);
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
            <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFill, { width }]} />
            </View>
            <Text style={styles.loadingText}>
                {status === 'pending' ? 'Loading...' : 'Entering realm...'}
            </Text>
        </SafeAreaView>
    );
};

export default IntroScreen;
