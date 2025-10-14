import { CombatActor, CombatSpeed, FrameQueueItem } from '@/types/combatV2';
import React from 'react';
import { ActionCard } from './cards/ActionCard';
import { DeathCard } from './cards/DeathCard';
import { EndBattleCard } from './cards/EndBattleCard';
import { EndRoundCard } from './cards/EndRoundCard';
import { StatusCard } from './cards/StatusCard';

interface FrameSwitcherProps {
  frame: FrameQueueItem | null;
  actors: Map<string, CombatActor>;
  onComplete: () => void;
  speed: CombatSpeed;
  onCombatEnd?: (outcome: 'victory' | 'defeat', rewards: { gold: number; xp: number }) => void;
}

export function FrameSwitcher({ frame, actors, onComplete, speed, onCombatEnd }: FrameSwitcherProps) {
  if (!frame) {
    return null;
  }
  
  // Only mount one card at a time for performance
  switch (frame.type) {
    case 'action':
      return <ActionCard frame={frame} actors={actors} onComplete={onComplete} speed={speed} />;
      
    case 'round_end':
      return <EndRoundCard frame={frame} actors={actors} onComplete={onComplete} speed={speed} />;
      
    case 'death':
      return <DeathCard frame={frame} actors={actors} onComplete={onComplete} speed={speed} />;
      
    case 'end_battle':
      return <EndBattleCard frame={frame} actors={actors} onComplete={onComplete} speed={speed} onCombatEnd={onCombatEnd} />;
      
    case 'status_tick':
      return <StatusCard frame={frame} actors={actors} onComplete={onComplete} speed={speed} />;
      
    default:
      console.warn('Unknown frame type:', frame.type, 'Frame data:', JSON.stringify(frame, null, 2));
      return null;
  }
}
