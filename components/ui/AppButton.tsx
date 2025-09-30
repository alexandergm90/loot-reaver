import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

const BG_NORMAL = require('@/assets/images/ui/medium_button_simple.png');
const BG_PRESSED = require('@/assets/images/ui/medium_button_hover.png');

 type Props = {
    onPress: () => void;
    children: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
    enableHaptics?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
 };

const WIDTHS = { sm: 160, md: 220, lg: 320 } as const;

const AppButton: React.FC<Props> = ({
    onPress,
    children,
    style,
    textStyle,
    enableHaptics = true,
    disabled = false,
    size = 'md',
}) => {
    const isPressed = useSharedValue(false);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [pressed, setPressed] = useState(false);
    const [glow, setGlow] = useState(false);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withTiming(isPressed.value ? 0.98 : 1, { duration: 100 }) }],
    }));

    const handlePressIn = () => {
        isPressed.value = true;
        setPressed(true);
        setGlow(true);
        setTimeout(() => setGlow(false), 120);
    };
    const handlePressOut = () => {
        isPressed.value = false;
        setPressed(false);
    };

    const handlePress = () => {
        if (enableHaptics) Haptics.selectionAsync();
        onPress();
    };

    const active = glow || pressed || hovered || focused;

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            onHoverIn={() => setHovered(true)}
            onHoverOut={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel="Enter Realm"
        >
            <Animated.View style={[styles.container, animatedStyle, disabled && styles.disabledButton, style]}>
                <ImageBackground
                    source={active ? BG_PRESSED : BG_NORMAL}
                    style={[styles.bg, { width: WIDTHS[size] }]}
                    imageStyle={{ resizeMode: 'stretch' }}
                >
                    {typeof children === 'string' ? (
                        <Text
                            style={[
                                styles.label,
                                size === 'sm' && styles.labelSm,
                                size === 'lg' && styles.labelLg,
                                disabled && styles.disabledText,
                                glow && { textShadowRadius: 5 },
                                textStyle,
                            ]}
                        >
                            {children}
                        </Text>
                    ) : (
                        children
                    )}
                </ImageBackground>
            </Animated.View>
        </Pressable>
    );
};

export default AppButton;

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
    },
    bg: {
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    label: {
        fontFamily: 'Cinzel_900Black',
        fontSize: 20,
        letterSpacing: 0.5,
        color: '#f5d9a6',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.85)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 3,
    },
    labelSm: { fontSize: 16 },
    labelLg: { fontSize: 24 },
    disabledButton: {
        opacity: 0.6,
    },
    disabledText: {
        color: '#aaa',
    },
});
