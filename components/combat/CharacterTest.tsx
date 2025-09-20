import CharacterFullPreview from '@/components/character/CharacterFullPreview';
import { useEquippedFromCharacter } from '@/hooks/useEquippedFromCharacter';
import { usePlayerStore } from '@/store/playerStore';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface CharacterTestProps {
  onBack?: () => void;
}

export default function CharacterTest({ onBack }: CharacterTestProps) {
  const { player } = usePlayerStore();
  const appearance = player?.character?.appearance || null;
  const { equipmentCodes } = useEquippedFromCharacter(player?.character);

  return (
    <View className="flex-1 bg-gray-900 p-4">
      {/* Header with back button */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-white text-xl font-bold">Character Test</Text>
        {onBack && (
          <Pressable 
            onPress={onBack}
            className="px-4 py-2 bg-gray-600 rounded-lg"
          >
            <Text className="text-white font-bold">← Back</Text>
          </Pressable>
        )}
      </View>
      
      <View className="bg-gray-800 p-4 rounded-lg mb-4">
        <Text className="text-white text-sm">Debug Info:</Text>
        <Text className="text-gray-300 text-xs">Player: {player ? 'Yes' : 'No'}</Text>
        <Text className="text-gray-300 text-xs">Character: {player?.character ? 'Yes' : 'No'}</Text>
        <Text className="text-gray-300 text-xs">Appearance: {appearance ? 'Yes' : 'No'}</Text>
        {appearance && (
          <Text className="text-gray-300 text-xs">Gender: {appearance.gender}</Text>
        )}
      </View>

      <View style={{ width: 200, height: 200, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, borderColor: 'white' }}>
        <CharacterFullPreview
          appearance={appearance}
          equipment={equipmentCodes}
          containerHeight={200}
        />
      </View>
    </View>
  );
}
