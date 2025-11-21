import { EquipmentAssets } from '@/types';

export const chestAssets: EquipmentAssets = {
    basic_chest: {
        source: require('../../assets/images/items/chest/basic_shirt.png'),
        male: { width: 149, height: 145, top: 90, left: -20 },
        female: { width: 149, height: 145, top: 90, left: -20 },
    },
    leather_tunic: {
        source: require('../../assets/images/items/chest/leather_tunic.png'),
        male: { width: 130, height: 154, top: 98, left: -4 },
        female: { width: 149, height: 145, top: 90, left: -20 },
    },
};
