export interface EnemyPart {
  name: string;
  image: any; // require() result
  width: number;
  height: number;
  offsetX?: number;
  offsetY?: number;
  zIndex?: number;
}

export interface EnemyTemplate {
  id: string;
  name: string;
  code: string;
  parts: {
    body: EnemyPart;
    head: EnemyPart;
    hand: EnemyPart;
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
