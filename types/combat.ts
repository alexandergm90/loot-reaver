export interface CombatAction {
  attackerId: string;
  targetId: string;
  damage: number;
  actionType: 'attack' | 'heal' | 'buff' | 'debuff';
}

export interface CombatEntity {
  id: string;
  name: string;
  currentHp: number;
  maxHp: number;
  damage: number;
  isPlayer: boolean;
  code?: string; // For enemies
}

export interface CombatRound {
  roundNumber: number;
  actions: CombatAction[];
  entities: CombatEntity[];
}

export interface CombatRewards {
  gold: number;
  xp: number;
}

export interface CombatResult {
  outcome: 'victory' | 'defeat' | 'flee';
  totalRounds: number;
  rounds: CombatRound[];
  rewards: CombatRewards;
}

export interface CombatState {
  isActive: boolean;
  currentRound: number;
  isPlayerTurn: boolean;
  isAnimating: boolean;
  combatResult: CombatResult | null;
  playerEntity: CombatEntity | null;
  enemyEntities: CombatEntity[];
  currentWave: number;
  totalWaves: number;
}

export interface FloatingDamage {
  id: string;
  damage: number;
  x: number;
  y: number;
  isCritical: boolean;
  isHealing: boolean;
  timestamp: number;
}

export interface HealthBarProps {
  currentHp: number;
  maxHp: number;
  width?: number;
  height?: number;
  showText?: boolean;
  isPlayer?: boolean;
}
