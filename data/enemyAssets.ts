import { EnemyTemplate } from '@/types/enemy';

// Goblin Warrior enemy template
const goblinWarrior: EnemyTemplate = {
  id: 'goblin_warrior',
  name: 'Goblin Warrior',
  code: 'goblin_warrior',
  rotate: true, // Set to true for mirrored enemies
  parts: {
    body: {
      name: 'body',
      image: require('@/assets/images/enemies/goblin_warrior/body.png'),
      width: 140,
      height: 136,
      left: 0,
      top: 0,
      zIndex: 1,
    },
    head: {
      name: 'head',
      image: require('@/assets/images/enemies/goblin_warrior/head.png'),
      width: 100,
      height: 102,
      left: 25,
      top: -75,
      zIndex: 2,
    },
    hands: {
      left: {
        name: 'hand_left',
        image: require('@/assets/images/enemies/goblin_warrior/hand.png'),
        width: 39,
        height: 50,
        left: 15,
        top: 95,
        zIndex: 3,
        rotation: -20, // Slight rotation for natural look
      },
      right: {
        name: 'hand_right',
        image: require('@/assets/images/enemies/goblin_warrior/hand.png'),
        width: 39,
        height: 50,
        left: 120,
        top: 90,
        zIndex: 3,
        rotation: -30, // Slight rotation for natural look
      },
    },
    feet: {
      left: {
        name: 'foot_left',
        image: require('@/assets/images/enemies/goblin_warrior/feet.png'),
        width: 47,
        height: 51,
        left: 32,
        top: 155,
        zIndex: 2,
      },
      right: {
        name: 'foot_right',
        image: require('@/assets/images/enemies/goblin_warrior/feet.png'),
        width: 47,
        height: 51,
        left: 82,
        top: 150,
        zIndex: 2,
      },
    },
    weapon: {
      name: 'weapon',
      image: require('@/assets/images/enemies/goblin_warrior/weapon.png'),
      width: 41,
      height: 140,
      left: 152,
      top: 14,
      zIndex: 2,
      rotation: 40, // Weapon angle for dynamic look
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

// Goblin Archer enemy template (mirrored version)
const goblinArcher: EnemyTemplate = {
  id: 'goblin_archer',
  name: 'Goblin Archer',
  code: 'goblin_archer',
  rotate: true, // Mirrored enemy
  parts: {
    body: {
      name: 'body',
      image: require('@/assets/images/enemies/goblin_warrior/body.png'),
      width: 140,
      height: 136,
      left: 0,
      top: 0,
      zIndex: 1,
    },
    head: {
      name: 'head',
      image: require('@/assets/images/enemies/goblin_warrior/head.png'),
      width: 100,
      height: 102,
      left: 25,
      top: -75,
      zIndex: 2,
    },
    hands: {
      left: {
        name: 'hand_left',
        image: require('@/assets/images/enemies/goblin_warrior/hand.png'),
        width: 24,
        height: 24,
        left: 8,
        top: 32,
        zIndex: 3,
        rotation: -15,
      },
      right: {
        name: 'hand_right',
        image: require('@/assets/images/enemies/goblin_warrior/hand.png'),
        width: 24,
        height: 24,
        left: 108,
        top: 32,
        zIndex: 3,
        rotation: 15,
      },
    },
    feet: {
      left: {
        name: 'foot_left',
        image: require('@/assets/images/enemies/goblin_warrior/feet.png'),
        width: 32,
        height: 32,
        left: 20,
        top: 104,
        zIndex: 2,
      },
      right: {
        name: 'foot_right',
        image: require('@/assets/images/enemies/goblin_warrior/feet.png'),
        width: 32,
        height: 32,
        left: 88,
        top: 104,
        zIndex: 2,
      },
    },
    weapon: {
      name: 'weapon',
      image: require('@/assets/images/enemies/goblin_warrior/weapon.png'),
      width: 32,
      height: 32,
      left: 20,
      top: 20,
      zIndex: 4,
      rotation: -25, // Different weapon angle for archer
    },
  },
  animation: {
    idle: {
      duration: 2000,
      frames: 4,
    },
  },
  stats: {
    baseHp: 35,
    baseAtk: 15,
    baseDef: 0,
  },
};

// Export all enemy templates
export const enemyTemplates: Record<string, EnemyTemplate> = {
  goblin_warrior: goblinWarrior,
  goblin_archer: goblinArcher,
};

// Helper function to get enemy template by code
export const getEnemyTemplate = (code: string): EnemyTemplate | null => {
  return enemyTemplates[code] || null;
};

// Helper function to get all enemy templates
export const getAllEnemyTemplates = (): EnemyTemplate[] => {
  return Object.values(enemyTemplates);
};
