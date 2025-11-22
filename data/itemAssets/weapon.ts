import { EquipmentAssets } from '@/types';

export const weaponAssets: EquipmentAssets = {
    basic_sword: {
        source: require('../../assets/images/items/weapon/basic_sword.png'),
        // For one-handed weapons: only width/height are used (position comes from slotMeta)
        // For two-handed weapons: full position (width/height/top/left) is used
        male: { width: 167, height: 50, top: 0, left: 0 },
        female: { width: 100, height: 70, top: 0, left: 0 },
    },
};
