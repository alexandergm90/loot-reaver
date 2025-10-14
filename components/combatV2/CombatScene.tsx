import { useFramePlayer } from '@/hooks/useFramePlayer';
import { CombatLogV2 } from '@/types/combatV2';
import { adaptCombatLogToFrameQueue, getEnemyActors, getPlayerActor } from '@/utils/combatLogAdapter';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CombatActionBar } from './CombatActionBar';
import { CombatHUD } from './CombatHUD';
import { CombatStage } from './CombatStage';

interface CombatSceneProps {
  combatLog: CombatLogV2;
  onCombatComplete: (outcome: 'victory' | 'defeat', rewards: { gold: number; xp: number }) => void;
  onClose: () => void;
}

export function CombatScene({ combatLog, onCombatComplete, onClose }: CombatSceneProps) {
  const [frameQueue, setFrameQueue] = useState<ReturnType<typeof adaptCombatLogToFrameQueue> | null>(null);
  const [currentHealth, setCurrentHealth] = useState<Record<string, number>>({});
  
  // Initialize frame queue from combat log
  useEffect(() => {
    try {
      const queue = adaptCombatLogToFrameQueue(combatLog);
      setFrameQueue(queue);
      
      // Initialize health tracking with starting HP
      const healthObject: Record<string, number> = {};
      queue.actors.forEach((actor, id) => {
        healthObject[id] = actor.startHp;
      });
      setCurrentHealth(healthObject);
    } catch (error) {
      console.error('Failed to adapt combat log:', error);
      Alert.alert('Error', 'Failed to load combat data');
      onClose();
    }
  }, [combatLog]);
  
  const framePlayer = useFramePlayer({
    queue: frameQueue?.queue || [],
    onComplete: () => {
      // Combat finished
      const outcome = combatLog.outcome;
      const rewards = combatLog.rewards;
      onCombatComplete(outcome, rewards);
    }
  });

  // Handle skip - update HP to final values
  const handleSkip = () => {
    if (!frameQueue) return;
    
    // Try to find final HP values from the combat log
    let finalHpData: Record<string, number> = {};
    
    // Start with initial HP values
    frameQueue.actors.forEach((actor, id) => {
      finalHpData[id] = actor.startHp;
    });
    
    // Apply all HP changes from all frames
    frameQueue.queue.forEach((frame) => {
      if (frame.hpAfter) {
        Object.entries(frame.hpAfter).forEach(([actorId, hp]) => {
          finalHpData[actorId] = hp;
        });
      }
    });
    
    // If we have a victory, ensure defeated enemies have 0 HP
    if (combatLog.outcome === 'victory') {
      frameQueue.actors.forEach((actor, id) => {
        if (!actor.isPlayer) {
          // Check if this enemy was killed in any frame
          const wasKilled = frameQueue.queue.some(frame => 
            frame.results?.some(result => 
              result.targetId === id && result.kill === true
            )
          );
          if (wasKilled) {
            finalHpData[id] = 0;
          }
        }
      });
    }
    
    // Update health to final values
    setCurrentHealth(finalHpData);
    
    // Call the original skip function
    framePlayer.skipToEnd();
  };
  
  // Update health when damage frames are processed
  useEffect(() => {
    if (framePlayer.currentFrame?.hpAfter) {
      setCurrentHealth(prev => {
        const newHealth = { ...prev };
        Object.entries(framePlayer.currentFrame!.hpAfter!).forEach(([actorId, hp]) => {
          newHealth[actorId] = hp;
        });
        return newHealth;
      });
    }
  }, [framePlayer.currentFrame]);
  
  // Debug: Log when combat state changes
  useEffect(() => {
    if (framePlayer.state === 'ended') {
      console.log('🎮 Final health state:', currentHealth);
    }
  }, [framePlayer.state, currentHealth]);
  
  if (!frameQueue) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading combat...</Text>
      </View>
    );
  }
  
  const player = getPlayerActor(frameQueue.actors);
  const enemies = getEnemyActors(frameQueue.actors);
  
  if (!player || enemies.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid combat data</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* HUD at top */}
      <CombatHUD 
        actors={frameQueue.actors}
        playerId={player.id}
        enemyIds={enemies.map(e => e.id)}
        currentHealth={currentHealth}
      />
      
      {/* Main stage area */}
      <CombatStage 
        currentFrame={framePlayer.currentFrame}
        actors={frameQueue.actors}
        onFrameComplete={framePlayer.nextFrame}
        speed={framePlayer.speed}
        onCombatEnd={onCombatComplete}
      />
      
      {/* Action bar at bottom - only show when combat is playing */}
      {framePlayer.state === 'playing' && (
        <CombatActionBar 
          speed={framePlayer.speed}
          onSpeedChange={framePlayer.setSpeed}
          onSkip={handleSkip}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0f0a', // Dark brown background
  },
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
