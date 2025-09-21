import { enemyTemplates } from '@/data/enemyAssets';
import { runDungeonCombat } from '@/services/combatService';
import { CombatResult, CombatState, FloatingDamage as FloatingDamageType } from '@/types/combat';
import React, { useCallback, useState } from 'react';
import { Alert, Dimensions, Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CombatEntity from './CombatEntity';
import FloatingDamage from './FloatingDamage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Helper function to get dungeon layout image
const getDungeonLayoutImage = (dungeonCode: string) => {
  switch (dungeonCode) {
    case 'goblin_cave':
      return require('@/assets/images/dungeons/layouts/goblin_cave.png');
    case 'undead_crypt':
      return require('@/assets/images/dungeons/layouts/undead_crypt.png');
    case 'dark_sanctuary':
      return require('@/assets/images/dungeons/layouts/dark_sanctuary.png');
    default:
      return require('@/assets/images/dungeons/layouts/goblin_cave.png');
  }
};

// Helper function to get enemy size based on enemy template
const getEnemySize = (enemyCode: string) => {
  const baseSize = 200; // Player size
  
  // Get enemy template by code
  const enemyTemplate = enemyTemplates[enemyCode];
  
  // Use size from template if available
  if (enemyTemplate?.size) {
    return Math.round(baseSize * enemyTemplate.size);
  }
  
  // Fallback to default size
  return Math.round(baseSize * 1.0); // Same size as player
};

interface CombatScreenProps {
  dungeonId: string;
  dungeonCode?: string; // Add dungeon code prop
  level: number;
  onCombatComplete: (result: CombatResult) => void;
  onClose: () => void;
}

export default function CombatScreen({ 
  dungeonId, 
  dungeonCode = 'goblin_cave', // Default fallback
  level, 
  onCombatComplete, 
  onClose 
}: CombatScreenProps) {
  const insets = useSafeAreaInsets();
  const [combatState, setCombatState] = useState<CombatState>({
    isActive: false,
    currentRound: 0,
    isPlayerTurn: false,
    isAnimating: false,
    combatResult: null,
    playerEntity: null,
    enemyEntities: [],
    currentWave: 1,
    totalWaves: 1,
  });

  const [floatingDamages, setFloatingDamages] = useState<FloatingDamageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attackingEntity, setAttackingEntity] = useState<string | null>(null);
  const [damagedEntity, setDamagedEntity] = useState<string | null>(null);

  const startCombat = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await runDungeonCombat(dungeonId, level);
      
      setCombatState(prev => ({
        ...prev,
        isActive: true,
        combatResult: result,
        currentRound: 0,
        playerEntity: result.rounds[0]?.entities.find(e => e.isPlayer) || null,
        enemyEntities: result.rounds[0]?.entities.filter(e => !e.isPlayer) || [],
        totalWaves: result.rounds.length,
      }));

      // Start the combat animation sequence
      playCombatSequence(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start combat');
    } finally {
      setIsLoading(false);
    }
  }, [dungeonId, level]);

  const playCombatSequence = useCallback(async (result: CombatResult) => {
    for (let roundIndex = 0; roundIndex < result.rounds.length; roundIndex++) {
      const round = result.rounds[roundIndex];
      
      setCombatState(prev => ({
        ...prev,
        currentRound: roundIndex + 1,
        playerEntity: round.entities.find(e => e.isPlayer) || prev.playerEntity,
        enemyEntities: round.entities.filter(e => !e.isPlayer),
        isAnimating: true,
      }));

      // Process each action in the round
      for (const action of round.actions) {
        // Set attacking entity
        setAttackingEntity(action.attackerId);
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Attack animation delay
        
        // Set damaged entity and show floating damage
        setDamagedEntity(action.targetId);
        const targetEntity = round.entities.find(e => e.id === action.targetId);
        if (targetEntity) {
          addFloatingDamage({
            id: `${action.attackerId}-${action.targetId}-${Date.now()}`,
            damage: action.damage,
            x: targetEntity.isPlayer ? screenWidth * 0.25 : screenWidth * 0.75,
            y: screenHeight * 0.3,
            isCritical: action.damage > 15, // Simple critical detection
            isHealing: action.actionType === 'heal',
            timestamp: Date.now(),
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Damage animation delay
        
        // Clear animation states
        setAttackingEntity(null);
        setDamagedEntity(null);
      }

      // Wait a bit before next round
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Combat finished
    setCombatState(prev => ({
      ...prev,
      isActive: false,
      isAnimating: false,
    }));
  }, [onCombatComplete]);

  const addFloatingDamage = useCallback((damage: FloatingDamageType) => {
    setFloatingDamages(prev => [...prev, damage]);
  }, []);

  const removeFloatingDamage = useCallback((id: string) => {
    setFloatingDamages(prev => prev.filter(d => d.id !== id));
  }, []);

  const handleCloseCombat = useCallback(() => {
    Alert.alert(
      'Forfeit Combat',
      'Are you sure you want to forfeit this combat? You will lose all rewards and progress.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Forfeit',
          style: 'destructive',
          onPress: onClose,
        },
      ]
    );
  }, [onClose]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-xl font-bold">Starting Combat...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-4">
        <Text className="text-red-400 text-lg font-bold mb-4">Error: {error}</Text>
        <Pressable 
          onPress={startCombat}
          className="px-6 py-3 bg-blue-500 rounded-lg"
        >
          <Text className="text-white font-bold">Retry</Text>
        </Pressable>
        <Pressable 
          onPress={onClose}
          className="px-6 py-3 bg-gray-500 rounded-lg mt-2"
        >
          <Text className="text-white font-bold">Close</Text>
        </Pressable>
      </View>
    );
  }

  if (!combatState.isActive && !combatState.combatResult) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-4">
        <Text className="text-white text-2xl font-bold mb-6">Ready for Combat</Text>
        <Text className="text-gray-300 text-lg mb-8 text-center">
          Level {level} - Dungeon {dungeonId}
        </Text>
        <Pressable 
          onPress={startCombat}
          className="px-8 py-4 bg-red-600 rounded-xl"
        >
          <Text className="text-white text-xl font-bold">Start Battle</Text>
        </Pressable>
        <Pressable 
          onPress={onClose}
          className="px-8 py-4 bg-gray-600 rounded-xl mt-4"
        >
          <Text className="text-white text-xl font-bold">Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Combat Header */}
      <View 
        className="bg-gray-800 p-4 flex-row justify-between items-center"
        style={{ paddingTop: insets.top + 16 }}
      >
        <Text className="text-white text-lg font-bold">
          Round {combatState.currentRound} / {combatState.totalWaves}
        </Text>
        <Text className="text-gray-300">
          {combatState.isAnimating ? 'Fighting...' : 'Waiting...'}
        </Text>
        <Pressable onPress={handleCloseCombat} className="p-2">
          <Text className="text-white text-lg">✕</Text>
        </Pressable>
      </View>

      {/* Combat Arena with Dungeon Layout Background */}
      <View className="flex-1 relative">
        {/* Dungeon Layout Background */}
        <View className="absolute inset-0 items-center justify-center">
          <Image
            source={getDungeonLayoutImage(dungeonCode)}
            style={{
              width: '100%',
              height: '100%',
              opacity: 0.6,
            }}
            resizeMode="contain"
          />
        </View>

        {/* Combat Entities */}
        <View className="flex-1 flex-row items-center px-4 relative z-10">
          {/* Player Side */}
          <View className="items-center flex-1">
            {combatState.playerEntity && (
              <CombatEntity
                entity={combatState.playerEntity}
                containerWidth={200}
                containerHeight={200}
                isAnimating={combatState.isAnimating}
                isAttacking={attackingEntity === combatState.playerEntity.id}
                isTakingDamage={damagedEntity === combatState.playerEntity.id}
              />
            )}
          </View>

          {/* Enemy Side */}
          <View className="items-center flex-1">
            {combatState.enemyEntities.map((enemy, index) => {
              const enemySize = getEnemySize(enemy.code || 'default');
              return (
                <View key={enemy.id} className="mb-4">
                  <CombatEntity
                    entity={enemy}
                    containerWidth={enemySize}
                    containerHeight={enemySize}
                    isAnimating={combatState.isAnimating}
                    isAttacking={attackingEntity === enemy.id}
                    isTakingDamage={damagedEntity === enemy.id}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Floating Damage Numbers */}
      {floatingDamages.map(damage => (
        <FloatingDamage
          key={damage.id}
          damage={damage}
          onComplete={removeFloatingDamage}
        />
      ))}

      {/* Combat Status */}
      {combatState.combatResult && !combatState.isActive && (
        <View 
          className="absolute inset-0 bg-black/80 items-center justify-center"
          style={{ zIndex: 9999 }}
        >
          <View className="bg-gray-800 p-8 rounded-xl items-center">
            <Text className="text-3xl font-bold text-white mb-4">
              {combatState.combatResult.outcome === 'victory' ? 'VICTORY!' : 'DEFEAT!'}
            </Text>
            <Text className="text-lg text-gray-300 mb-4">
              Rounds: {combatState.combatResult.totalRounds}
            </Text>
            <Text className="text-lg text-yellow-400 mb-2">
              Gold: {combatState.combatResult.rewards.gold}
            </Text>
            <Text className="text-lg text-blue-400 mb-6">
              XP: {combatState.combatResult.rewards.xp}
            </Text>
            <Pressable 
              onPress={() => onCombatComplete(combatState.combatResult!)}
              className="px-6 py-3 bg-green-600 rounded-lg"
            >
              <Text className="text-white font-bold">Continue</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
