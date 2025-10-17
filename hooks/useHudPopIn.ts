import { useCallback } from 'react';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export function useHudPopIn(speed = 1) {
  const t = useCallback((ms: number) => ms / Math.max(0.25, speed), [speed]);
  
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  const popIn = useCallback(() => {
    scale.value = withTiming(1.0, { 
      duration: t(180), 
      easing: Easing.out(Easing.back(1.1)) 
    });
    opacity.value = withTiming(1, { 
      duration: t(180), 
      easing: Easing.out(Easing.cubic) 
    });
  }, [t]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return { popIn, style };
}
