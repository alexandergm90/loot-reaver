import { CombatResult } from '@/types/combat';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import CombatScreen from './CombatScreen';

export default function CombatDemo() {
  const [showCombat, setShowCombat] = useState(false);
  const [combatResult, setCombatResult] = useState<CombatResult | null>(null);

  const handleCombatComplete = (result: CombatResult) => {
    setCombatResult(result);
    setShowCombat(false);
  };

  const closeCombat = () => {
    setShowCombat(false);
    setCombatResult(null);
  };

  if (showCombat) {
    return (
      <CombatScreen
        dungeonId="demo-dungeon"
        level={1}
        onCombatComplete={handleCombatComplete}
        onClose={closeCombat}
      />
    );
  }

  return (
    <View className="flex-1 bg-gray-900 items-center justify-center p-4">
      <Text className="text-white text-2xl font-bold mb-6">Combat Demo</Text>
      <Text className="text-gray-300 text-center mb-8">
        This is a demo of the combat system. Press the button below to start a test battle.
      </Text>
      
      <Pressable 
        onPress={() => setShowCombat(true)}
        className="px-8 py-4 bg-red-600 rounded-xl mb-4"
      >
        <Text className="text-white text-xl font-bold">Start Demo Combat</Text>
      </Pressable>

      {combatResult && (
        <View className="bg-gray-800 p-6 rounded-xl items-center">
          <Text className="text-2xl font-bold text-white mb-4">
            {combatResult.outcome === 'victory' ? '🎉 VICTORY!' : '💀 DEFEAT!'}
          </Text>
          <Text className="text-lg text-gray-300 mb-4">
            Rounds: {combatResult.totalRounds}
          </Text>
          <Text className="text-lg text-yellow-400 mb-2">
            Gold: {combatResult.rewards.gold}
          </Text>
          <Text className="text-lg text-blue-400 mb-4">
            XP: {combatResult.rewards.xp}
          </Text>
          <Pressable 
            onPress={() => setCombatResult(null)}
            className="px-6 py-3 bg-green-600 rounded-lg"
          >
            <Text className="text-white font-bold">Close</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
