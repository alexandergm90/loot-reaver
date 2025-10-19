import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

export interface FloatingTextItem {
  id: string;
  text: string;
  type: 'damage' | 'healing' | 'buff' | 'debuff' | 'status_tick';
  amount?: number;
  stacks?: number;
  duration?: number;
  position?: 'center' | 'left' | 'right';
  delay?: number; // Delay in ms before starting animation
}

interface FloatingTextProps {
  item: FloatingTextItem;
  onComplete: () => void;
  speed?: number;
}

export function FloatingText({ item, onComplete, speed = 1 }: FloatingTextProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const completedRef = useRef(false);

  // Animation timing based on speed
  const getTiming = (ms: number) => ms / Math.max(0.25, speed);

  useEffect(() => {
    if (completedRef.current) return;
    
    // Start animation with delay
    const delay = item.delay || 0;
    const duration = getTiming(2000); // 2 seconds total
    const fadeStart = getTiming(1500); // Start fading at 1.5s
    
    // Initial state
    opacity.value = 0;
    scale.value = 0.8;
    
    // Start animation after delay
    setTimeout(() => {
      if (completedRef.current) return;
      
      // Fade in and scale up
      opacity.value = withTiming(1, { duration: getTiming(200), easing: Easing.out(Easing.cubic) });
      scale.value = withSequence(
        withTiming(1.1, { duration: getTiming(100), easing: Easing.out(Easing.cubic) }),
        withTiming(1.0, { duration: getTiming(100), easing: Easing.out(Easing.cubic) })
      );
      
      // Move upward
      translateY.value = withTiming(-60, { 
        duration, 
        easing: Easing.out(Easing.cubic) 
      });
      
      // Fade out near the end
      setTimeout(() => {
        if (!completedRef.current) {
          opacity.value = withTiming(0, { 
            duration: getTiming(500), 
            easing: Easing.in(Easing.cubic) 
          });
        }
      }, fadeStart);
      
      // Complete after total duration
      setTimeout(() => {
        if (!completedRef.current) {
          completedRef.current = true;
          runOnJS(onComplete)();
        }
      }, duration);
    }, delay);
  }, [item.delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  // Get text color based on type
  const getTextColor = () => {
    switch (item.type) {
      case 'damage':
        return '#FF4444'; // Red for damage
      case 'healing':
        return '#44FF44'; // Green for healing
      case 'buff':
        return '#44AAFF'; // Blue for buffs
      case 'debuff':
        return '#FF8844'; // Orange for debuffs
      case 'status_tick':
        return '#FF6666'; // Light red for status ticks
      default:
        return '#FFFFFF';
    }
  };

  // Get text shadow color based on type
  const getShadowColor = () => {
    switch (item.type) {
      case 'damage':
        return 'rgba(255, 68, 68, 0.8)';
      case 'healing':
        return 'rgba(68, 255, 68, 0.8)';
      case 'buff':
        return 'rgba(68, 170, 255, 0.8)';
      case 'debuff':
        return 'rgba(255, 136, 68, 0.8)';
      case 'status_tick':
        return 'rgba(255, 102, 102, 0.8)';
      default:
        return 'rgba(255, 255, 255, 0.8)';
    }
  };

  return (
    <Animated.View style={[getContainerStyle(item.position), animatedStyle]}>
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
            textShadowColor: getShadowColor(),
          },
        ]}
      >
        {item.text}
      </Text>
    </Animated.View>
  );
}

const getContainerStyle = (position: 'center' | 'left' | 'right' = 'center') => {
  const baseStyle = {
    position: 'absolute' as const,
    bottom: 20,
    pointerEvents: 'none' as const,
  };

  switch (position) {
    case 'left':
      return {
        ...baseStyle,
        left: 20, // Increased margin for better spacing
        alignItems: 'flex-start' as const,
        justifyContent: 'center' as const,
      };
    case 'right':
      return {
        ...baseStyle,
        right: 20, // Increased margin for better spacing
        alignItems: 'flex-end' as const,
        justifyContent: 'center' as const,
      };
    case 'center':
    default:
      return {
        ...baseStyle,
        left: 0,
        right: 0,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      };
  }
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Cinzel-Bold',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    includeFontPadding: false,
  },
});
