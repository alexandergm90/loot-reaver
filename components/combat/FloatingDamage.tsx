import { FloatingDamage as FloatingDamageType } from '@/types/combat';
import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';

interface FloatingDamageProps {
  damage: FloatingDamageType;
  onComplete: (id: string) => void;
}

export default function FloatingDamage({ damage, onComplete }: FloatingDamageProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Start animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -50,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete(damage.id);
    });
  }, []);

  const getDamageColor = () => {
    if (damage.isHealing) return 'text-green-400';
    if (damage.isCritical) return 'text-yellow-300';
    return 'text-red-400';
  };

  const getDamageText = () => {
    if (damage.isHealing) return `+${damage.damage}`;
    if (damage.isCritical) return `CRIT! ${damage.damage}`;
    return damage.damage.toString();
  };

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: damage.x,
        top: damage.y,
        opacity: fadeAnim,
        transform: [
          { translateY },
          { scale: scaleAnim },
        ],
      }}
    >
      <Text 
        className={`text-lg font-bold ${getDamageColor()} text-center`}
        style={{
          textShadowColor: 'rgba(0, 0, 0, 0.8)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        }}
      >
        {getDamageText()}
      </Text>
    </Animated.View>
  );
}
