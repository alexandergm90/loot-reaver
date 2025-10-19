import { createEffect } from '@/data/effects';
import { CombatActor, FrameQueueItem } from '@/types/combatV2';

/**
 * Manages effects for all actors during combat using authoritative API data
 */
export class CombatEffectsManager {
  private actorEffects = new Map<string, any[]>(); // actorId -> effects array

  constructor(actors: Map<string, CombatActor>) {
    // Initialize empty effects for all actors
    actors.forEach((actor, actorId) => {
      this.actorEffects.set(actorId, []);
    });
  }

  /**
   * Apply effects from a frame to the appropriate actors
   * Now uses authoritative API data instead of client-side generation
   */
  applyFrameEffects(frame: FrameQueueItem): void {
    // Handle status applied from action frames
    if (frame.type === 'action' && frame.results) {
      frame.results.forEach(result => {
        if (result.statusApplied) {
          result.statusApplied.forEach(status => {
            const effect = createEffect(status.id, status.stacks, status.duration);
            if (effect) {
              const currentEffects = this.actorEffects.get(result.targetId) || [];
              // Add or update the effect
              const existingIndex = currentEffects.findIndex(e => e.id === effect.id);
              if (existingIndex >= 0) {
                // Update existing effect with new stacks and duration
                currentEffects[existingIndex] = {
                  ...effect,
                  stacks: currentEffects[existingIndex].stacks + effect.stacks,
                  duration: Math.max(currentEffects[existingIndex].duration, effect.duration),
                };
              } else {
                // Add new effect
                currentEffects.push(effect);
              }
              this.actorEffects.set(result.targetId, currentEffects);
            }
          });
        }
      });
    }

    // Handle status ticks from round_end frames (authoritative API data)
    if (frame.type === 'round_end' && frame.statusTicks) {
      frame.statusTicks.forEach(tick => {
        const currentEffects = this.actorEffects.get(tick.targetId) || [];
        const effectIndex = currentEffects.findIndex(e => e.id === tick.status);
        
        if (effectIndex >= 0) {
          // Update existing effect with new duration
          currentEffects[effectIndex] = {
            ...currentEffects[effectIndex],
            duration: tick.durationAfter,
            stacks: tick.stacksBefore, // Use stacksBefore from API
          };
          
          // Remove effect if it expired
          if (tick.expired) {
            currentEffects.splice(effectIndex, 1);
          }
        }
        
        this.actorEffects.set(tick.targetId, currentEffects);
      });
    }
  }

  /**
   * Get current effects for an actor
   */
  getActorEffects(actorId: string): any[] {
    return this.actorEffects.get(actorId) || [];
  }

  /**
   * Update actor effects in the actors map
   */
  updateActorEffects(actors: Map<string, CombatActor>): void {
    actors.forEach((actor, actorId) => {
      actor.effects = this.getActorEffects(actorId);
    });
  }

  /**
   * Remove a specific effect from an actor
   */
  removeEffect(actorId: string, effectId: string): void {
    const currentEffects = this.actorEffects.get(actorId) || [];
    const updatedEffects = currentEffects.filter(effect => effect.id !== effectId);
    this.actorEffects.set(actorId, updatedEffects);
  }
}
