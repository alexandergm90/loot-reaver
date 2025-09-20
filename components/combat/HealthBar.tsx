import { HealthBarProps } from '@/types/combat';
import React from 'react';
import { Text, View } from 'react-native';

export default function HealthBar({ 
  currentHp, 
  maxHp, 
  width = 100, 
  height = 12, 
  showText = true,
  isPlayer = false 
}: HealthBarProps) {
  const percentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const isLowHealth = percentage < 25;
  const isCritical = percentage < 10;

  const getHealthColor = () => {
    if (isCritical) return 'bg-red-600';
    if (isLowHealth) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getBorderColor = () => {
    if (isCritical) return 'border-red-800';
    if (isLowHealth) return 'border-yellow-700';
    return 'border-green-700';
  };

  return (
    <View className="items-center">
      {showText && (
        <Text className="text-xs font-bold text-white mb-1" style={{ textShadowColor: 'rgba(0, 0, 0, 0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>
          {Math.round(currentHp)}/{Math.round(maxHp)}
        </Text>
      )}
      <View 
        className={`border-2 ${getBorderColor()} rounded-full overflow-hidden bg-gray-800`}
        style={{ width, height }}
      >
        <View 
          className={`h-full ${getHealthColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}
