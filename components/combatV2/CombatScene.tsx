import { useCombatState } from '@/hooks/useCombatState';
import { useFramePlayer } from '@/hooks/useFramePlayer';
import { CombatLogV2, CombatSpeed } from '@/types/combatV2';
import { adaptCombatLogToFrameQueue, getEnemyActors, getPlayerActor } from '@/utils/combatLogAdapter';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CombatActionBar } from './CombatActionBar';
import { CombatHUD } from './CombatHUD';
import { CombatStage } from './CombatStage';
import { RoundToast } from './RoundToast';
import { VersusOverlay } from './VersusOverlay';

interface CombatSceneProps {
  combatLog: CombatLogV2;
  onCombatComplete: (outcome: 'victory' | 'defeat', rewards: { gold: number; xp: number }) => void;
  onClose: () => void;
}

export function CombatScene({ combatLog, onCombatComplete, onClose }: CombatSceneProps) {
  const [frameQueue, setFrameQueue] = useState<ReturnType<typeof adaptCombatLogToFrameQueue> | null>(null);
  const [currentHealth, setCurrentHealth] = useState<Record<string, number>>({});
  const [speed, setSpeed] = useState<CombatSpeed>(1);
  
  // Combat state management
  const combatState = useCombatState(
    frameQueue?.queue || [],
    speed
  );
  
  // Round toast state
  const [showRoundToast, setShowRoundToast] = useState(false);
  const [roundToastData, setRoundToastData] = useState<{roundNumber: number; type: 'start' | 'complete'} | null>(null);
  
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

  // Don't start combat until versus overlay completes
  // After that, combat should ALWAYS be visible (cards never disappear)
  const shouldStartCombat = combatState.state === 'actionIntro' || combatState.state === 'actionOutro' || combatState.state === 'roundStart';

  // Handle state transitions
  useEffect(() => {
    if (combatState.state === 'actionIntro') {
      // Start the first action when transitioning from versus overlay
      if (framePlayer.state === 'idle') {
        framePlayer.nextFrame(); // Start the first frame
      }
    }
  }, [combatState.state, framePlayer]);

  // Update frame index in combat state
  useEffect(() => {
    combatState.updateFrameIndex(framePlayer.currentFrameIndex);
  }, [framePlayer.currentFrameIndex, combatState]);

  // Detect round completions and show toast
  useEffect(() => {
    const currentFrame = framePlayer.currentFrame;
    if (!currentFrame) return;

    // Check if this is a round_end frame that was skipped
    if (currentFrame.type === 'round_end') {
      setRoundToastData({
        roundNumber: currentFrame.roundNumber || 1,
        type: 'complete'
      });
      setShowRoundToast(true);
      
      // Auto-hide toast after delay
      setTimeout(() => {
        setShowRoundToast(false);
      }, 2000); // Show for 2 seconds
    }
  }, [framePlayer.currentFrame]);


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
      
      {/* Main stage area - only show when combat should start */}
      {shouldStartCombat && (
        <CombatStage 
          currentFrame={framePlayer.currentFrame}
          actors={frameQueue.actors}
          onFrameComplete={framePlayer.nextFrame}
          speed={speed}
          onCombatEnd={onCombatComplete}
        />
      )}
      
      {/* Round Toast - show when rounds complete */}
      {roundToastData && (
        <RoundToast
          roundNumber={roundToastData.roundNumber}
          type={roundToastData.type}
          visible={showRoundToast}
          speed={speed}
          onComplete={() => setShowRoundToast(false)}
          onSkip={() => setShowRoundToast(false)}
        />
      )}
      
      {/* Versus Overlay - only show at match start */}
      <VersusOverlay
        playerName={player.name}
        enemyName={enemies[0]?.name || 'Enemy'}
        visible={combatState.state === 'matchIntro'}
        speed={speed}
        onComplete={() => combatState.transitionTo('actionIntro')}
        onSkip={() => combatState.skipOverlay()}
      />
      
      {/* Action bar at bottom - only show when combat is playing */}
      {shouldStartCombat && framePlayer.state === 'playing' && (
        <CombatActionBar 
          speed={speed}
          onSpeedChange={setSpeed}
          onSkip={handleSkip}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Removed background color - now handled by parent page
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#ff4444',
  },
});
