import { usePlayerStore } from '@/store/playerStore';
import { CombatEntity as CombatEntityType } from '@/types/combat';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import CombatEntity from './CombatEntity';

// Mock combat data for testing
const mockPlayerEntity: CombatEntityType = {
  id: 'player-1',
  name: 'Test Player',
  currentHp: 80,
  maxHp: 100,
  damage: 15,
  isPlayer: true,
};

const mockEnemyEntity: CombatEntityType = {
  id: 'enemy-1',
  name: 'Goblin Warrior',
  currentHp: 60,
  maxHp: 80,
  damage: 12,
  isPlayer: false,
  code: 'goblin_warrior',
};

interface CombatTestProps {
  onBack?: () => void;
}

export default function CombatTest({ onBack }: CombatTestProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [showEnemy, setShowEnemy] = useState(false);
  const { player } = usePlayerStore();

  return (
    <View className="flex-1 bg-gray-900 p-4">
      {/* Header with back button */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-white text-2xl font-bold">Combat Test</Text>
        {onBack && (
          <Pressable 
            onPress={onBack}
            className="px-4 py-2 bg-gray-600 rounded-lg"
          >
            <Text className="text-white font-bold">← Back</Text>
          </Pressable>
        )}
      </View>
      
      {/* Debug Info */}
      <View className="bg-gray-800 p-4 rounded-lg mb-4">
        <Text className="text-white text-sm">Debug Info:</Text>
        <Text className="text-gray-300 text-xs">Player Data: {player ? 'Available' : 'None'}</Text>
        <Text className="text-gray-300 text-xs">Character: {player?.character ? 'Available' : 'None'}</Text>
        <Text className="text-gray-300 text-xs">Appearance: {player?.character?.appearance ? 'Available' : 'None'}</Text>
      </View>
      
      <View className="flex-row justify-around mb-8">
        <Pressable 
          onPress={() => setShowPlayer(!showPlayer)}
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          <Text className="text-white font-bold">Toggle Player</Text>
        </Pressable>
        
        <Pressable 
          onPress={() => setShowEnemy(!showEnemy)}
          className="px-4 py-2 bg-red-600 rounded-lg"
        >
          <Text className="text-white font-bold">Toggle Enemy</Text>
        </Pressable>
      </View>

       <View className="flex-row justify-around">
         {showPlayer && (
           <View className="items-center">
             <Text className="text-white text-lg font-bold mb-4">Player</Text>
             <CombatEntity
               entity={mockPlayerEntity}
               containerWidth={200}
               containerHeight={200}
             />
           </View>
         )}
         
         {showEnemy && (
           <View className="items-center">
             <Text className="text-white text-lg font-bold mb-4">Enemy</Text>
             <CombatEntity
               entity={mockEnemyEntity}
               containerWidth={200} // Scaled to match player size
               containerHeight={200} // Scaled to match player size
             />
           </View>
         )}
       </View>
    </View>
  );
}
