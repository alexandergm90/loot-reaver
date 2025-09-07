import { EnemyTemplate } from '@/types/enemy';

// Goblin Warrior enemy template
const goblinWarrior: EnemyTemplate = {
  id: 'goblin_warrior',
  name: 'Goblin Warrior',
  code: 'goblin_warrior',
  parts: {
    body: {
      name: 'body',
      image: require('@/assets/images/enemies/goblin_warrior/body.png'),
      width: 64,
      height: 64,
      offsetX: 0,
      offsetY: 0,
      zIndex: 1,
    },
    head: {
      name: 'head',
      image: require('@/assets/images/enemies/goblin_warrior/head.png'),
      width: 32,
      height: 32,
      offsetX: 16,
      offsetY: 8,
      zIndex: 2,
    },
    hand: {
      name: 'hand',
      image: require('@/assets/images/enemies/goblin_warrior/hand.png'),
      width: 24,
      height: 24,
      offsetX: 8,
      offsetY: 32,
      zIndex: 3,
    },
    weapon: {
      name: 'weapon',
      image: require('@/assets/images/enemies/goblin_warrior/weapon.png'),
      width: 32,
      height: 32,
      offsetX: 20,
      offsetY: 20,
      zIndex: 4,
    },
  },
  animation: {
    idle: {
      duration: 2000, // 2 seconds for full idle cycle
      frames: 4, // 4 frames for idle animation
    },
  },
  stats: {
    baseHp: 50,
    baseAtk: 12,
    baseDef: 0,
  },
};

// Export all enemy templates
export const enemyTemplates: Record<string, EnemyTemplate> = {
  goblin_warrior: goblinWarrior,
};

// Helper function to get enemy template by code
export const getEnemyTemplate = (code: string): EnemyTemplate | null => {
  return enemyTemplates[code] || null;
};

// Helper function to get all enemy templates
export const getAllEnemyTemplates = (): EnemyTemplate[] => {
  return Object.values(enemyTemplates);
};
