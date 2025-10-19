import { Effect } from '@/types/combatV2';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { PlaceholderIcon } from './PlaceholderIcon';

interface EffectIconProps {
  effect: Effect;
  size?: number;
  onRemove?: () => void;
}

// Color tokens for consistent theming
const COLORS = {
  goldText: '#F3D77A',      // names/values
  hpGreen: '#38b16a',        // fill
  chip: 'rgba(255,120,40,.65)', // damage trail
  healGlow: 'rgba(76, 175, 80, .25)', // track bg pulse
  blockBlue: '#6aa7ff',      // shield/absorb
  damageRed: '#8B0000',      // damage text
  parchmentBrown: '#3a2a18', // card text
  darkBrown: '#2a1d0d',      // secondary text
  buffGlow: 'rgba(76, 175, 80, 0.3)', // buff glow
  debuffGlow: 'rgba(220, 38, 38, 0.3)', // debuff glow
};

export function EffectIcon({ effect, size = 28, onRemove }: EffectIconProps) {
  const scaleAnim = useSharedValue(1);
  const opacityAnim = useSharedValue(1);
  const pulseAnim = useSharedValue(0);

  // Entrance animation
  useEffect(() => {
    scaleAnim.value = 0.8;
    scaleAnim.value = withTiming(1, { 
      duration: 200, 
      easing: Easing.out(Easing.back(1.2)) 
    });
  }, [effect.id]);

  // Pulse animation for stack changes
  useEffect(() => {
    pulseAnim.value = withSequence(
      withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 150, easing: Easing.in(Easing.cubic) })
    );
  }, [effect.stacks]);

  // Fade out animation when effect expires
  useEffect(() => {
    if (effect.duration === 0 && onRemove) {
      opacityAnim.value = withTiming(0, { duration: 300 });
      scaleAnim.value = withTiming(0.8, { duration: 300 });
      setTimeout(onRemove, 300);
    }
  }, [effect.duration, onRemove]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: opacityAnim.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseAnim.value * 0.4,
    transform: [{ scale: 1 + pulseAnim.value * 0.1 }],
  }));

  const glowColor = effect.type === 'buff' ? COLORS.buffGlow : COLORS.debuffGlow;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Glow background for pulse effect */}
      <Animated.View
        style={[
          styles.glowBackground,
          {
            width: size,
            height: size,
            backgroundColor: glowColor,
          },
          pulseStyle,
        ]}
      />
      
      {/* Main icon */}
      <Animated.View style={[styles.iconWrapper, animatedStyle]}>
        {/* Render icon - either image or placeholder */}
        {typeof effect.icon === 'string' ? (
          <PlaceholderIcon
            name={effect.name}
            type={effect.type}
            size={size}
          />
        ) : (
          <Image
            source={effect.icon}
            style={[styles.icon, { width: size, height: size }]}
            resizeMode="contain"
          />
        )}
        
        {/* Stack count - only show if stacks >= 2 */}
        {effect.stacks >= 2 && (
          <View style={styles.stackContainer}>
            <Text style={styles.stackText}>{effect.stacks}×</Text>
          </View>
        )}
        
        {/* Duration - only show if duration > 0 */}
        {effect.duration > 0 && (
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>{effect.duration}</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBackground: {
    position: 'absolute',
    borderRadius: 14,
    opacity: 0,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    borderRadius: 14,
  },
  stackContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 8,
    paddingHorizontal: 2,
    paddingVertical: 1,
    minWidth: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackText: {
    fontFamily: 'Cinzel-Bold',
    fontWeight: '700',
    fontSize: 9,
    color: COLORS.goldText,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  durationContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 1,
    minWidth: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationText: {
    fontFamily: 'Cinzel-Bold',
    fontWeight: '700',
    fontSize: 8,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
