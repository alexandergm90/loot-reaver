// Frame-based combat system types

export interface CombatLogV2 {
  version: string;
  logId: string;
  tickPolicy: string;
  outcome: 'victory' | 'defeat';
  totalRounds: number;
  actors: CombatActor[];
  rounds: CombatRound[];
  rewards: {
    gold: number;
    xp: number;
  };
}

export interface CombatActor {
  id: string;
  name: string;
  isPlayer: boolean;
  maxHp: number;
  startHp: number; // Changed from hp to startHp
  statuses: Array<{
    id: string;
    stacks: number;
    duration: number;
  }>;
  code?: string; // For enemies
}

export interface CombatRound {
  roundNumber: number;
  actions: CombatAction[];
  endFrames: CombatFrame[];
}

export interface CombatAction {
  actionId: string;
  actorId: string;
  ability: string;
  element: string;
  targets: string[];
  tags: string[];
  frames: CombatFrame[];
}

// Combat frame types
export type CombatFrame = 
  | ActionFrame
  | RoundEndFrame
  | EndBattleFrame
  | StatusTickFrame
  | DeathFrame;

export interface ActionFrame {
  type: 'action';
  results: Array<{
    targetId: string;
    amount: number;
    crit: boolean;
    hpBefore: number;
    hpAfter: number;
    kill: boolean;
    statusApplied?: Array<{
      id: string;
      stacks: number;
      duration: number;
    }>;
  }>;
}

export interface RoundEndFrame {
  type: 'round_end';
  roundNumber: number;
  statusTicks?: Array<{
    status: string;
    targetId: string;
    amount: number;
    hpBefore: number;
    hpAfter: number;
    stacksBefore: number;
    durationAfter: number;
    expired: boolean;
    lethal: boolean;
  }>;
}

export interface EndBattleFrame {
  type: 'end_battle';
  outcome: 'victory' | 'defeat';
  rewards: {
    gold: number;
    xp: number;
  };
}

export interface StatusTickFrame {
  type: 'status_tick';
  status: string;
  targetId: string;
  amount: number;
  hpBefore: number;
  hpAfter: number;
  stacksBefore: number;
  durationAfter: number;
  expired: boolean;
  lethal: boolean;
}

export interface DeathFrame {
  type: 'death';
  targets: string[];
  cause: string;
}

// Processed frame queue item
export interface FrameQueueItem {
  id: string;
  type: CombatFrame['type'];
  actorId: string;
  targets: string[];
  payload: CombatFrame;
  hpAfter?: Record<string, number>;
  isRoundBoundary?: boolean;
  roundNumber?: number;
  ability?: string; // Ability name for action frames
  actionIndex?: number; // Index of the action in the combat log
  // For action frames
  results?: Array<{
    targetId: string;
    amount: number;
    crit: boolean;
    hpBefore: number;
    hpAfter: number;
    kill: boolean;
    statusApplied?: Array<{
      id: string;
      stacks: number;
      duration: number;
    }>;
  }>;
  // For status tick frames
  statusTicks?: Array<{
    status: string;
    targetId: string;
    amount: number;
    hpBefore: number;
    hpAfter: number;
    stacksBefore: number;
    durationAfter: number;
    expired: boolean;
    lethal: boolean;
  }>;
}

// Player state machine
export type CombatPlayerState = 'idle' | 'loading' | 'playing' | 'ended';

// Speed settings
export type CombatSpeed = 0 | 1 | 2 | 3;

// Frame card props
export interface FrameCardProps {
  frame: FrameQueueItem;
  actors: Map<string, CombatActor>;
  onComplete: () => void;
  speed: CombatSpeed;
  onCombatEnd?: (outcome: 'victory' | 'defeat', rewards: { gold: number; xp: number }) => void;
}

// HUD props
export interface CombatHUDProps {
  actors: Map<string, CombatActor>;
  playerId: string;
  enemyIds: string[];
  currentHealth: Record<string, number>;
}

// Stage props
export interface CombatStageProps {
  currentFrame: FrameQueueItem | null;
  actors: Map<string, CombatActor>;
  onFrameComplete: () => void;
  speed: CombatSpeed;
  onCombatEnd?: (outcome: 'victory' | 'defeat', rewards: { gold: number; xp: number }) => void;
}

// Action bar props
export interface CombatActionBarProps {
  speed: CombatSpeed;
  onSpeedChange: (speed: CombatSpeed) => void;
  onSkip: () => void;
}
