import { useCombatState } from '@/hooks/useCombatState';
import { useFramePlayer } from '@/hooks/useFramePlayer';
import { CombatLogV2, CombatSpeed } from '@/types/combatV2';
import { CombatEffectsManager } from '@/utils/combatEffectsManager';
import { adaptCombatLogToFrameQueue, getEnemyActors, getPlayerActor } from '@/utils/combatLogAdapter';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CombatActionBar } from './CombatActionBar';
import { CombatHUD, CombatHUDRef } from './CombatHUD';
import { CombatStage } from './CombatStage';
import { FixedRoundIndicator } from './FixedRoundIndicator';
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
  const [effectsManager, setEffectsManager] = useState<CombatEffectsManager | null>(null);
  const combatHUDRef = useRef<CombatHUDRef>(null);
  
  // Combat state management - use stable frames reference
  const frames = frameQueue?.queue || [];
  const combatState = useCombatState(frames, speed);
  
  // Initialize frame queue from combat log
  useEffect(() => {
    try {
      const queue = adaptCombatLogToFrameQueue(combatLog);
      setFrameQueue(queue);
      
      // Initialize effects manager
      const manager = new CombatEffectsManager(queue.actors);
      setEffectsManager(manager);
      
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
      // Combat finished - EndBattleCard will handle the UI
      console.log('Combat finished, EndBattleCard will handle the rest');
    }
  });

  // Don't start combat until versus overlay completes
  // After that, combat should ALWAYS be visible (cards never disappear)
  // Track if combat has ever started to prevent flicker
  const [hasCombatStarted, setHasCombatStarted] = useState(false);

  // Process effects and floating text when frames change - only after combat starts
  useEffect(() => {
    if (effectsManager && framePlayer.currentFrame && hasCombatStarted && combatHUDRef.current) {
      effectsManager.applyFrameEffects(framePlayer.currentFrame);
      effectsManager.updateActorEffects(frameQueue?.actors || new Map());
      
      // Process floating text for current frame
      const frame = framePlayer.currentFrame;
      
      // Handle damage/healing from action frames
      if (frame.type === 'action' && frame.results) {
        frame.results.forEach(result => {
          if (result.amount > 0) {
            // Damage - center position
            combatHUDRef.current?.addFloatingText(result.targetId, {
              text: `-${result.amount}`,
              type: 'damage',
              amount: result.amount,
              position: 'center',
            });
          } else if (result.amount < 0) {
            // Healing - center position
            combatHUDRef.current?.addFloatingText(result.targetId, {
              text: `+${Math.abs(result.amount)}`,
              type: 'healing',
              amount: Math.abs(result.amount),
              position: 'center',
            });
          }
          
          // Handle status applied - left position
          if (result.statusApplied) {
            result.statusApplied.forEach(status => {
              const effectType = status.id === 'bleed' || status.id === 'poison' || status.id === 'weakness' ? 'debuff' : 'buff';
              combatHUDRef.current?.addFloatingText(result.targetId, {
                text: `${status.id.toUpperCase()}${status.stacks > 1 ? ` x${status.stacks}` : ''}`,
                type: effectType,
                stacks: status.stacks,
                duration: status.duration,
                position: 'left',
              });
            });
          }
        });
      }
      
      // Handle status ticks from round_end frames - right position
      if (frame.type === 'round_end' && frame.statusTicks) {
        frame.statusTicks.forEach(tick => {
          combatHUDRef.current?.addFloatingText(tick.targetId, {
            text: `-${tick.amount}`,
            type: 'status_tick',
            amount: tick.amount,
            stacks: tick.stacksBefore,
            duration: tick.durationAfter,
            position: 'right',
          });
        });
      }
    }
  }, [framePlayer.currentFrame, effectsManager, frameQueue?.actors, hasCombatStarted]);
  
  // Update hasCombatStarted when combat begins
  useEffect(() => {
    if (combatState.state === 'actionIntro' && !hasCombatStarted) {
      setHasCombatStarted(true);
    }
  }, [combatState.state, hasCombatStarted]);
  
  // Once combat starts, it should ALWAYS be visible (cards never disappear)
  const shouldStartCombat = hasCombatStarted || (combatState.state !== 'matchIntro' && combatState.state !== 'idle');

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

  const handleEffectRemove = (actorId: string, effectId: string) => {
    if (effectsManager) {
      effectsManager.removeEffect(actorId, effectId);
      effectsManager.updateActorEffects(frameQueue?.actors || new Map());
    }
  };
  
  // Update health when damage frames are processed - only after combat starts
  useEffect(() => {
    if (hasCombatStarted && framePlayer.currentFrame?.hpAfter) {
      setCurrentHealth(prev => {
        const newHealth = { ...prev };
        Object.entries(framePlayer.currentFrame!.hpAfter!).forEach(([actorId, hp]) => {
          newHealth[actorId] = hp;
        });
        return newHealth;
      });
    }
  }, [framePlayer.currentFrame, hasCombatStarted]);
  
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
        ref={combatHUDRef}
        actors={frameQueue.actors}
        playerId={player.id}
        enemyIds={enemies.map(e => e.id)}
        currentHealth={currentHealth}
        onEffectRemove={handleEffectRemove}
        showEffects={hasCombatStarted}
      />
      
      {/* Fixed round indicator - only show when combat starts */}
      {shouldStartCombat && (
        <FixedRoundIndicator round={combatState.currentRound} speed={speed} />
      )}
      
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
