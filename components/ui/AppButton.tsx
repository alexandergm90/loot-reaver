import React from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle , Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

type Props = {
    onPress: () => void;
    children: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
    enableHaptics?: boolean;
};

const AppButton: React.FC<Props> = ({
                                        onPress,
                                        children,
                                        style,
                                        textStyle,
                                        enableHaptics = true,
                                    }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
        if (enableHaptics) Haptics.selectionAsync();
        scale.value = withTiming(0.9, { duration: 50, easing: Easing.out(Easing.ease) }, () => {
            scale.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.ease) });
        });
        onPress();
    };

    return (
        <Pressable onPress={handlePress}>
            <Animated.View style={[styles.button, animatedStyle, style]}>
                {typeof children === 'string' ? (
                    <Text style={[styles.text, textStyle]}>{children}</Text>
                ) : (
                    children
                )}
            </Animated.View>
        </Pressable>
    );
};

export default AppButton;

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#222',
        padding: 6,
        borderRadius: 4,
        marginHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 32,
        minHeight: 32,
    },
    text: {
        color: '#fff',
        fontSize: 16,
    },
});
