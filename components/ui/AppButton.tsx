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
const BG_SMALL_NORMAL = require('@/assets/images/ui/small_button_simple.png');
const BG_SMALL_PRESSED = require('@/assets/images/ui/small_button_hover.png');
const BG_ROUNDED_NORMAL = require('@/assets/images/ui/rounded_button_simple.png');
const BG_ROUNDED_PRESSED = require('@/assets/images/ui/rounded_button_hover.png');

 type Props = {
    onPress: () => void;
    children: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
    enableHaptics?: boolean;
    disabled?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'square';
    variant?: 'default' | 'rounded';
    isActive?: boolean;
    optionalLabel?: string; // New prop for optional label below button
 };

const WIDTHS = { xs: 120, sm: 160, md: 220, lg: 320, square: 48 } as const;

const AppButton: React.FC<Props> = ({
    onPress,
    children,
    style,
    textStyle,
    enableHaptics = true,
    disabled = false,
    size = 'md',
    variant = 'default',
    isActive = false,
    optionalLabel,
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

    const active = isActive || glow || pressed || hovered || focused;
    
    // Layout calculations
    const isSquare = size === 'square';
    const contentWidth = isSquare ? 48 : WIDTHS[size];
    const contentHeight = isSquare ? 48 : 64;
    const contentPaddingH = isSquare ? 0 : 24;
    
    // Select background images based on size and variant
    let bgNormal, bgPressed;
    if (variant === 'rounded') {
        bgNormal = BG_ROUNDED_NORMAL;
        bgPressed = BG_ROUNDED_PRESSED;
    } else if (size === 'xs') {
        bgNormal = BG_SMALL_NORMAL;
        bgPressed = BG_SMALL_PRESSED;
    } else {
        bgNormal = BG_NORMAL;
        bgPressed = BG_PRESSED;
    }

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
                    source={active ? bgPressed : bgNormal}
                    style={[
                        styles.bg,
                        { 
                            width: contentWidth, 
                            height: contentHeight, 
                            paddingHorizontal: contentPaddingH 
                        }
                    ]}
                    imageStyle={{ resizeMode: 'stretch' }}
                >
                    {typeof children === 'string' ? (
                        <Text
                            style={[
                                styles.label,
                                size === 'xs' && styles.labelXs,
                                size === 'sm' && styles.labelSm,
                                size === 'lg' && styles.labelLg,
                                size === 'square' && styles.labelSquare,
                                disabled && styles.disabledText,
                                glow && { textShadowRadius: 5 },
                                textStyle,
                            ]}
                            numberOfLines={1}
                            adjustsFontSizeToFit={true}
                            minimumFontScale={0.8}
                        >
                            {children}
                        </Text>
                    ) : (
                        children
                    )}
                </ImageBackground>
                
                {/* Optional label below button - always reserve space if optionalLabel prop exists */}
                {optionalLabel !== undefined && (
                    <Text style={styles.optionalLabel}>
                        {optionalLabel}
                    </Text>
                )}
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
    labelXs: { fontSize: 16 },
    labelSm: { fontSize: 16 },
    labelLg: { fontSize: 24 },
    labelSquare: { fontSize: 13, letterSpacing: 0.2 },
    disabledButton: {
        opacity: 0.6,
    },
    disabledText: {
        color: '#aaa',
    },
    optionalLabel: {
        fontFamily: 'Cinzel-Regular',
        fontSize: 11,
        color: '#FFD700',
        textAlign: 'center',
        marginTop: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        minHeight: 16, // Ensure consistent height even for empty strings
    },
});
