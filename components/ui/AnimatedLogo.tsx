import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

const AnimatedLogo = () => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const reducedMotion = useReducedMotion();

    useEffect(() => {
        // Fade + scale in
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start(() => {
            // After initial entry, begin subtle pulsing (respects reduce motion)
            if (!reducedMotion) {
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(pulseAnim, {
                            toValue: 1.02,
                            duration: 1200,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(pulseAnim, {
                            toValue: 1,
                            duration: 1200,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ]),
                ).start();
            }
        });
    }, [reducedMotion]);

    return (
        <Animated.Image
            source={require('@/assets/images/logo.png')}
            style={[
                styles.logo,
                {
                    transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
                    opacity: opacityAnim,
                },
            ]}
            resizeMode="contain"
        />
    );
};

const styles = StyleSheet.create({
    logo: {
        width: 220,
        height: 220,
        marginBottom: 40,
    },
});

export default AnimatedLogo;
