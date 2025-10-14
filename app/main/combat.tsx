import { CombatScene } from '@/components/combatV2/CombatScene';
import FullScreenBackground from '@/components/ui/FullScreenBackground';
import { runDungeonCombat } from '@/services/combatService';
import { CombatLogV2 } from '@/types/combatV2';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

const getDungeonBackground = (dungeonCode?: string) => {
  switch (dungeonCode) {
    case 'goblin_cave':
      return require('@/assets/images/dungeons/backgrounds/goblin_cave.png');
    case 'undead_crypt':
      return require('@/assets/images/dungeons/backgrounds/undead_crypt.png');
    case 'dark_sanctuary':
      return require('@/assets/images/dungeons/backgrounds/dark_sanctuary.png');
    default:
      return require('@/assets/images/dungeons/backgrounds/goblin_cave.png'); // fallback
  }
};

export default function CombatPage() {
  const params = useLocalSearchParams<{
    dungeonId: string;
    dungeonCode?: string;
    level: string;
  }>();

  const [combatLog, setCombatLog] = useState<CombatLogV2 | null>(null);
  const [loading, setLoading] = useState(true);

  // Load combat data from API
  useEffect(() => {
    const loadCombatData = async () => {
      try {
        if (!params.dungeonId || !params.level) {
          throw new Error('Missing required parameters');
        }
        
        setLoading(true);
        
        // Call the actual combat API - it already returns v2-frames format
        const combatLog = await runDungeonCombat(params.dungeonId, parseInt(params.level)) as unknown as CombatLogV2;
        setCombatLog(combatLog);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load combat data:', error);
        Alert.alert('Error', 'Failed to start combat');
        router.replace('/main/dungeon');
      }
    };

    loadCombatData();
  }, [params.dungeonId, params.level]);

  const handleCombatComplete = (outcome: 'victory' | 'defeat', rewards: { gold: number; xp: number }) => {
    console.log('Combat completed:', { outcome, rewards });
    // TODO: Handle rewards (update player stats, etc.)
    router.replace('/main/dungeon');
  };

  const handleClose = () => {
    router.replace('/main/dungeon');
  };

  if (loading) {
    return (
      <FullScreenBackground
        backgroundImage={getDungeonBackground(params.dungeonCode)}
        backgroundColor="#1a120a"
      >
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Preparing combat...</Text>
        </View>
      </FullScreenBackground>
    );
  }

  if (!combatLog) {
    return (
      <FullScreenBackground
        backgroundImage={getDungeonBackground(params.dungeonCode)}
        backgroundColor="#1a120a"
      >
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load combat data</Text>
        </View>
      </FullScreenBackground>
    );
  }

  return (
    <FullScreenBackground
      backgroundImage={getDungeonBackground(params.dungeonCode)}
      backgroundColor="#1a120a"
    >
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <CombatScene
        combatLog={combatLog}
        onCombatComplete={handleCombatComplete}
        onClose={handleClose}
      />
    </FullScreenBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a0f0a',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a0f0a',
  },
  errorText: {
    fontSize: 18,
    color: '#ff4444',
  },
});