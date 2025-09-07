import { EnemyInstance } from '@/types/enemy';
import React from 'react';
import { Text, View } from 'react-native';
import EnemyPreview from './EnemyPreview';

interface EnemyCardProps {
  enemy: EnemyInstance;
  count: number;
  showPreview?: boolean;
}

export default function EnemyCard({ enemy, count, showPreview = true }: EnemyCardProps) {
  return (
    <View className="bg-white/80 rounded-xl border-2 border-stone-900 p-3 mb-2">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-bold text-lg">{enemy.template.name}</Text>
        <Text className="text-sm text-stone-600">x{count}</Text>
      </View>
      
      {showPreview && (
        <View className="items-center mb-3">
          <EnemyPreview 
            enemy={enemy} 
            containerWidth={60} 
            containerHeight={60}
            showAnimation={true}
          />
        </View>
      )}
      
      <View className="flex-row space-x-4">
        <View className="items-center">
          <Text className="text-xs text-stone-600">HP</Text>
          <Text className="font-semibold text-red-600">{enemy.scaledHp}</Text>
        </View>
        <View className="items-center">
          <Text className="text-xs text-stone-600">ATK</Text>
          <Text className="font-semibold text-orange-600">{enemy.scaledAtk}</Text>
        </View>
        <View className="items-center">
          <Text className="text-xs text-stone-600">DEF</Text>
          <Text className="font-semibold text-blue-600">{enemy.scaledDef}</Text>
        </View>
      </View>
    </View>
  );
}
