import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

type Props = {
    onPress: () => void;
    children: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
    enableHaptics?: boolean;
    disabled?: boolean;
};

const AppButton: React.FC<Props> = ({
    onPress,
    children,
    style,
    textStyle,
    enableHaptics = true,
    disabled = false,
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
        <Pressable onPress={handlePress} disabled={disabled}>
            <Animated.View
                style={[styles.button, animatedStyle, disabled && styles.disabledButton, style]}
            >
                {typeof children === 'string' ? (
                    <Text style={[styles.text, disabled && styles.disabledText, textStyle]}>
                        {children}
                    </Text>
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
    disabledButton: {
        opacity: 0.5,
        backgroundColor: '#444',
    },
    disabledText: {
        color: '#aaa',
    },
});
