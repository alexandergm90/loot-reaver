export interface EnemyPart {
  name: string;
  image: any; // require() result
  width: number;
  height: number;
  left?: number;
  top?: number;
  zIndex?: number;
  rotation?: number; // rotation in degrees
}

export interface EnemyHands {
  left: EnemyPart;
  right: EnemyPart;
}

export interface EnemyFeet {
  left: EnemyPart;
  right: EnemyPart;
}

export interface EnemyTemplate {
  id: string;
  name: string;
  code: string;
  rotate?: boolean; // horizontal flip for mirrored enemies
  size?: number; // size multiplier relative to player (e.g., 0.7, 0.9, 1.2)
  parts: {
    body: EnemyPart;
    head: EnemyPart;
    hands: EnemyHands;
    feet: EnemyFeet;
    weapon: EnemyPart;
  };
  animation: {
    idle: {
      duration: number;
      frames: number;
    };
  };
  stats: {
    baseHp: number;
    baseAtk: number;
    baseDef: number;
  };
}

export interface EnemyInstance {
  template: EnemyTemplate;
  scaledHp: number;
  scaledAtk: number;
  scaledDef: number;
  currentHp: number;
}

export interface EnemyAnimation {
  isPlaying: boolean;
  currentFrame: number;
  startTime: number;
}
