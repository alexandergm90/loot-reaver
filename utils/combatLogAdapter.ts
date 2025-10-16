import { CombatActor, CombatLogV2, FrameQueueItem } from '@/types/combatV2';

/**
 * Converts a v2-lean combat log into a flat queue of renderable frames
 * in the exact order they should be displayed
 */
export function adaptCombatLogToFrameQueue(log: CombatLogV2): {
  queue: FrameQueueItem[];
  actors: Map<string, CombatActor>;
} {
  const queue: FrameQueueItem[] = [];
  const actors = new Map<string, CombatActor>();
  
  // Build actors map
  log.actors.forEach(actor => {
    actors.set(actor.id, actor);
  });
  
  // Process each round
  log.rounds.forEach(round => {
    // Check if this round has an end_battle frame
    const hasEndBattle = round.endFrames.some(frame => frame.type === 'end_battle');
    
    // Process actions in the round
    round.actions.forEach(action => {
      action.frames.forEach((frame, frameIndex) => {
        const frameId = `${action.actionId}_frame_${frameIndex}`;
        
        // Convert hpBefore/hpAfter from results to a single hpAfter object
        const hpAfter: Record<string, number> = {};
        if (frame.type === 'action' && frame.results) {
          frame.results.forEach(result => {
            hpAfter[result.targetId] = result.hpAfter;
          });
        }
        
        queue.push({
          id: frameId,
          type: frame.type,
          actorId: action.actorId,
          targets: action.targets,
          payload: frame,
          hpAfter,
          results: frame.type === 'action' ? frame.results : undefined,
          isRoundBoundary: false,
          roundNumber: round.roundNumber,
        });
      });
    });
    
    // Process end frames
    round.endFrames.forEach((frame, frameIndex) => {
      const frameId = `round_${round.roundNumber}_end_${frameIndex}`;
      
      // Handle status ticks in round_end frames
      let hpAfter: Record<string, number> = {};
      if (frame.type === 'round_end' && frame.statusTicks) {
        frame.statusTicks.forEach(tick => {
          hpAfter[tick.targetId] = tick.hpAfter;
        });
      }
      // Map death frames to zero HP for their targets
      if (frame.type === 'death') {
        const deathTargets = (frame as any).targets as string[] | undefined;
        if (Array.isArray(deathTargets)) {
          deathTargets.forEach(tid => { hpAfter[tid] = 0; });
        }
      }
      
      queue.push({
        id: frameId,
        type: frame.type,
        actorId: '', // End frames don't have a specific actor
        targets: [],
        payload: frame,
        hpAfter,
        statusTicks: frame.type === 'round_end' ? frame.statusTicks : undefined,
        isRoundBoundary: frame.type === 'round_end',
        roundNumber: round.roundNumber,
      });
    });
  });
  
  return { queue, actors };
}

/**
 * Helper to get actor by ID with fallback
 */
export function getActorById(actors: Map<string, CombatActor>, id: string): CombatActor | null {
  return actors.get(id) || null;
}

/**
 * Helper to get all enemies
 */
export function getEnemyActors(actors: Map<string, CombatActor>): CombatActor[] {
  return Array.from(actors.values()).filter(actor => !actor.isPlayer);
}

/**
 * Helper to get player actor
 */
export function getPlayerActor(actors: Map<string, CombatActor>): CombatActor | null {
  return Array.from(actors.values()).find(actor => actor.isPlayer) || null;
}
