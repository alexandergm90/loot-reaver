import React, { useEffect } from 'react';
import { Image } from 'react-native';
import Animated, {
    Easing,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

type VsBadgeProps = {
  size?: number;         // overall size in px
  tone?: 'gold' | 'silver' | 'ember';
  shadow?: number;       // 0..1 extra drop "weight"
  animated?: boolean;    // enable subtle animations
};

export default function VsBadge({ size = 120, animated = true }: VsBadgeProps) {
  // Animation values
  const scale = useSharedValue(0.9);

  // Start animations when component mounts
  useEffect(() => {
    if (animated) {
      // Pop-in animation
      scale.value = withTiming(1.0, { 
        duration: 400, 
        easing: Easing.out(Easing.back(1.2)) 
      });
    }
  }, [animated]);

  const imageStyle = {
    width: size,
    height: size,
    resizeMode: 'contain' as const,
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scale.value }] }]}>
      <Image
        source={require('@/assets/images/combat/vs.png')}
        style={imageStyle}
      />
    </Animated.View>
  );
}
