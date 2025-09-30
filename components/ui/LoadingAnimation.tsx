import LRText from '@/components/ui/LRText';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

type LoadingAnimationProps = {
    message?: string;
    image?: any; // image source
    size?: number;
};

const defaultImage = require('@/assets/images/rune-load.png');

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
    message = 'Preparing Realm...',
    image = defaultImage,
    size = 64,
}) => {
    const rotate = useSharedValue(0);

    useEffect(() => {
        rotate.value = withRepeat(
            withTiming(1, {
                duration: 600,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true,
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    rotate: `${rotate.value * 10 - 5}deg`, // -5 to +5 degrees
                },
            ],
        };
    });

    return (
        <View style={styles.wrapper}>
            <Animated.Image
                source={image}
                style={[{ width: size, height: size }, animatedStyle]}
                resizeMode="contain"
            />
            <LRText style={styles.message}>{message}</LRText>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        marginTop: 24,
    },
    message: {
        color: '#fff',
        marginTop: 8,
        fontSize: 14,
    },
});

export default LoadingAnimation;
