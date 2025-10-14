import { useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

export function useShake() {
  const shakeX = useSharedValue(0);
  const shakeY = useSharedValue(0);

  const triggerShake = (intensity: number = 4, duration: number = 200) => {
    const shakeValues = [
      intensity, -intensity, intensity * 0.7, -intensity * 0.7, 
      intensity * 0.4, -intensity * 0.4, 0
    ];
    
    const stepDuration = duration / shakeValues.length;
    
    shakeX.value = withSequence(
      ...shakeValues.map(value => withTiming(value, { duration: stepDuration }))
    );
    
    shakeY.value = withSequence(
      ...shakeValues.map(value => withTiming(value * 0.5, { duration: stepDuration }))
    );
  };

  const triggerCriticalShake = () => {
    triggerShake(8, 300);
  };

  const triggerDamageShake = () => {
    triggerShake(4, 200);
  };

  return {
    shakeX,
    shakeY,
    triggerShake,
    triggerCriticalShake,
    triggerDamageShake,
  };
}
