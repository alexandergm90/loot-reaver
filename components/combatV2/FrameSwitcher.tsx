import { CombatActor, CombatSpeed, FrameQueueItem } from '@/types/combatV2';
import React from 'react';
import { ActionCard } from './cards/ActionCard';
import { DeathCard } from './cards/DeathCard';
import { EndBattleCard } from './cards/EndBattleCard';
import { StatusCard } from './cards/StatusCard';

interface FrameSwitcherProps {
  frame: FrameQueueItem | null;
  actors: Map<string, CombatActor>;
  onComplete: () => void;
  speed: CombatSpeed;
  onCombatEnd?: (outcome: 'victory' | 'defeat', rewards: { gold: number; xp: number }) => void;
}

export function FrameSwitcher({ frame, actors, onComplete, speed, onCombatEnd }: FrameSwitcherProps) {
  // 1) Remember the last *playable* (non-round_end) frame
  const lastPlayableRef = React.useRef<FrameQueueItem | null>(null);

  React.useEffect(() => {
    if (frame && frame.type !== 'round_end') {
      lastPlayableRef.current = frame;
    }
  }, [frame]);

  // 2) Auto-advance when a round_end arrives (as you already do)
  React.useEffect(() => {
    if (frame?.type === 'round_end') {
      // Advance queue but DO NOT change what's on screen
      onComplete();
    }
  }, [frame?.type, onComplete]);

  if (!frame && !lastPlayableRef.current) {
    return null;
  }

  // 3) Decide what to show: freeze on the last playable frame during round_end
  const visualFrame: FrameQueueItem | null =
    frame?.type === 'round_end' ? lastPlayableRef.current : frame;

  if (!visualFrame) return null;

  // 4) Render based on the visual frame (keyed by id so it doesn't remount during round_end)
  switch (visualFrame.type) {
    case 'action':
      return (
        <ActionCard
          key={visualFrame.id}
          frame={visualFrame}
          actors={actors}
          onComplete={onComplete}
          speed={speed}
        />
      );

    case 'death':
      return (
        <DeathCard
          key={visualFrame.id}
          frame={visualFrame}
          actors={actors}
          onComplete={onComplete}
          speed={speed}
        />
      );

    case 'end_battle':
      return (
        <EndBattleCard
          key={visualFrame.id}
          frame={visualFrame}
          actors={actors}
          onComplete={onComplete}
          speed={speed}
          onCombatEnd={onCombatEnd}
        />
      );

    case 'status_tick':
      return (
        <StatusCard
          key={visualFrame.id}
          frame={visualFrame}
          actors={actors}
          onComplete={onComplete}
          speed={speed}
        />
      );

    default:
      return null;
  }
}
