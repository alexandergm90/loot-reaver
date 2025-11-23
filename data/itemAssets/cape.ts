import { EquipmentAssets } from '@/types';

export const capeAssets: EquipmentAssets = {
    basic_cape_front: {
        source: require('../../assets/images/items/cape/basic_cape_front.png'),
        male: { width: 130, height: 81, top: 95, left: -2 },
        female: { width: 130, height: 81, top: 95, left: -2 },
    },
    basic_cape_back: {
        source: require('../../assets/images/items/cape/basic_cape_back.png'),
        male: { width: 200, height: 280, top: 120, left: -45 },
        female: { width: 200, height: 280, top: 120, left: -45 },
    },
};
