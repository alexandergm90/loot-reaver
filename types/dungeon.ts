export interface Dungeon {
  id: string;
  name: string;
  code: string;
  highestLevelCleared: number;
  availableLevels: number;
}

export interface DungeonResponse {
  dungeons: Dungeon[];
}

export interface Enemy {
  id: string;
  name: string;
  code: string;
  baseHp: number;
  baseAtk: number;
  scaledHp: number;
  scaledAtk: number;
  scaledDef: number;
}

export interface EnemyInWave {
  enemy: Enemy;
  count: number;
}

export interface Wave {
  enemies: EnemyInWave[];
}

export interface DropItem {
  itemId: string;
  weight: number;
}

export interface DropsJson {
  items: DropItem[];
}

export interface Rewards {
  goldMin: number;
  goldMax: number;
  xpMin: number;
  xpMax: number;
  dropsJson: DropsJson;
}

export interface DungeonDetails {
  id: string;
  name: string;
  level: number;
  waves: Wave[];
  rewards: Rewards;
  requiredItemPower: number;
}
