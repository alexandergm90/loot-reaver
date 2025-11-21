import { EquipmentAssets } from '@/types';

export const feetAssets: EquipmentAssets = {
    basic_feet: {
        source: require('../../assets/images/items/feet/basic_boot.png'),
        male: { width: 47, height: 64, top: 252, left: 18 },
        female: { width: 47, height: 64, top: 252, left: 18 },
    },
    leather_boot_left: {
        source: require('../../assets/images/items/feet/leather_boot_left.png'),
        male: { width: 71, height: 124, top: 360, left: -25 },
        female: { width: 47, height: 64, top: 252, left: 18 },
    },
    leather_boot_right: {
        source: require('../../assets/images/items/feet/leather_boot_right.png'),
        male: { width: 88, height: 113, top: 360, left: 55 },
        female: { width: 47, height: 64, top: 242, left: 68 },
    },
};
