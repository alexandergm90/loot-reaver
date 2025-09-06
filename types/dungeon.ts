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
