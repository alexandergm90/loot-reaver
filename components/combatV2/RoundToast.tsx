import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface RoundToastProps {
  roundNumber: number;
  type: 'start' | 'complete';
  visible: boolean;
  speed: number;
  onComplete: () => void;
  onSkip?: () => void;
}

export function RoundToast({
  roundNumber,
  type,
  visible,
  speed,
  onComplete,
  onSkip
}: RoundToastProps) {
  const t = (ms: number) => ms / Math.max(0.25, speed);

  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(-8);

  useEffect(() => {
    if (visible) {
      // Reset values
      opacity.value = 0;
      scale.value = 0.9;
      translateY.value = -8;

      // Entrance animation (140-160ms)
      opacity.value = withTiming(1, { duration: t(160), easing: Easing.out(Easing.cubic) });
      scale.value = withTiming(1.0, { duration: t(160), easing: Easing.out(Easing.back(1.1)) });
      translateY.value = withTiming(0, { duration: t(160), easing: Easing.out(Easing.cubic) });

      // Hold phase (700-900ms)
      setTimeout(() => {
        // Exit animation (120ms)
        opacity.value = withTiming(0, { duration: t(120), easing: Easing.in(Easing.cubic) });
        scale.value = withTiming(0.9, { duration: t(120), easing: Easing.in(Easing.cubic) });
        translateY.value = withTiming(-8, { duration: t(120), easing: Easing.in(Easing.cubic) });

        // Complete after exit
        setTimeout(() => {
          onComplete();
        }, t(120));
      }, t(800));

      // Haptics
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [visible, speed]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  if (!visible) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={onSkip}
    >
      <Animated.View style={[styles.toast, animatedStyle]}>
        {/* Parchment background */}
        <Image
          source={require('@/assets/images/parchment_texture_orange.png')}
          style={styles.parchmentBackground}
          resizeMode="cover"
        />
        
        <Text style={styles.text}>
          Round {roundNumber} • {type === 'start' ? 'Start' : 'Complete'}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const TOAST_WIDTH = Math.min(screenWidth * 0.5, 240);
const TOAST_HEIGHT = 36;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120, // Between HUDs
    left: (screenWidth - TOAST_WIDTH) / 2,
    zIndex: 200,
    elevation: 200,
  },
  toast: {
    width: TOAST_WIDTH,
    height: TOAST_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  parchmentBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  text: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#3a2a18', // Deep brown
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
