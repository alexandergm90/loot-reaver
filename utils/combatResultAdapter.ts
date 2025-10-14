import { CombatResult } from '@/types/combat';
import { CombatActor, CombatFrame, CombatLogV2 } from '@/types/combatV2';

/**
 * Converts the old CombatResult format to the new v2-frames CombatLogV2 format
 */
export function adaptCombatResultToV2(combatResult: CombatResult): CombatLogV2 {
  // Debug: Log the actual structure we received
  console.log('🔍 CombatResult structure:', JSON.stringify(combatResult, null, 2));
  
  // Validate the structure
  if (!combatResult) {
    throw new Error('CombatResult is null or undefined');
  }
  
  if (!combatResult.rounds) {
    throw new Error('CombatResult.rounds is missing');
  }
  
  if (!Array.isArray(combatResult.rounds)) {
    throw new Error('CombatResult.rounds is not an array');
  }
  
  // Convert entities to actors
  const actors: CombatActor[] = [];
  const entityMap = new Map<string, CombatActor>();
  
  // Process all entities from all rounds to build the actor list
  combatResult.rounds.forEach(round => {
    round.entities.forEach(entity => {
      if (!entityMap.has(entity.id)) {
        const actor: CombatActor = {
          id: entity.id,
          name: entity.name,
          isPlayer: entity.isPlayer,
          maxHp: entity.maxHp,
          hp: entity.currentHp,
          code: entity.code,
        };
        actors.push(actor);
        entityMap.set(entity.id, actor);
      }
    });
  });
  
  // Convert rounds to v2 format
  const rounds = combatResult.rounds.map((round, roundIndex) => {
    const actions = round.actions.map(action => {
      // Convert action to v2 frames
      const frames: CombatFrame[] = [];
      
      // Attack frame
      frames.push({
        type: 'attack',
      });
      
      // Damage frame
      frames.push({
        type: 'damage',
        amount: action.damage,
        crit: action.crit,
        hpBefore: { [action.targetId]: action.targetHpBefore },
        hpAfter: { [action.targetId]: action.targetHpAfter },
        kill: action.kill,
      });
      
      // Status frames (if any)
      if (action.statusApplied && action.statusApplied.length > 0) {
        action.statusApplied.forEach(status => {
          frames.push({
            type: 'status_apply',
            targetId: action.targetId,
            status: {
              id: status.id || 'unknown',
              stacks: status.stacks || 1,
              duration: status.duration || 1,
            },
          });
        });
      }
      
      // Death frame (if kill)
      if (action.kill) {
        frames.push({
          type: 'death',
          targets: [action.targetId],
          cause: action.ability,
        });
      }
      
      return {
        actionId: action.actionId,
        actorId: action.attackerId,
        ability: action.ability,
        element: 'physical', // Default to physical, could be enhanced
        targets: [action.targetId],
        tags: action.tags || [],
        frames,
      };
    });
    
    // End frames for the round
    const endFrames: CombatFrame[] = [
      {
        type: 'end_round',
        roundNumber: round.roundNumber,
      },
    ];
    
    return {
      roundNumber: round.roundNumber,
      actions,
      endFrames,
    };
  });
  
  // Add end battle frame to the last round
  if (rounds.length > 0) {
    const lastRound = rounds[rounds.length - 1];
    lastRound.endFrames.push({
      type: 'end_battle',
      outcome: combatResult.outcome === 'flee' ? 'defeat' : combatResult.outcome,
      rewards: combatResult.rewards,
    });
  }
  
  return {
    version: 'v2-frames',
    logId: `run_${Date.now()}`,
    tickPolicy: 'end_of_round',
    outcome: combatResult.outcome === 'flee' ? 'defeat' : combatResult.outcome,
    totalRounds: combatResult.totalRounds,
    actors,
    rounds,
    rewards: combatResult.rewards,
  };
}
