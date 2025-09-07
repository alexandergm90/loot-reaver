import { getEnemyTemplate } from '@/data/enemyAssets';
import { Enemy } from '@/types/dungeon';
import { EnemyInstance } from '@/types/enemy';

export const createEnemyInstance = (enemy: Enemy): EnemyInstance | null => {
  const template = getEnemyTemplate(enemy.code);
  if (!template) {
    console.warn(`Enemy template not found for code: ${enemy.code}`);
    return null;
  }

  return {
    template,
    scaledHp: enemy.scaledHp,
    scaledAtk: enemy.scaledAtk,
    scaledDef: enemy.scaledDef,
    currentHp: enemy.scaledHp, // Start with full HP
  };
};

export const createEnemyInstancesFromWave = (enemies: { enemy: Enemy; count: number }[]): EnemyInstance[] => {
  const instances: EnemyInstance[] = [];
  
  enemies.forEach(({ enemy, count }) => {
    const instance = createEnemyInstance(enemy);
    if (instance) {
      // Create multiple instances based on count
      for (let i = 0; i < count; i++) {
        instances.push({ ...instance });
      }
    }
  });
  
  return instances;
};
