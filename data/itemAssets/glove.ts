import { EquipmentAssets } from '@/types';

export const gloveAssets: EquipmentAssets = {
    basic_glove: {
        source: require('../../assets/images/items/glove/basic_glove.png'),
        male: { width: 54, height: 54, top: 180, left: -20 },
        female: { width: 54, height: 54, top: 180, left: -20 },
    },
    leather_glove_left: {
        source: require('../../assets/images/items/glove/leather_glove.png'),
        male: { width: 50, height: 66, top: 233, left: -36 },
        female: { width: 54, height: 54, top: 180, left: -20 },
    },
    leather_glove_right: {
        source: require('../../assets/images/items/glove/leather_glove.png'),
        male: { width: 50, height: 66, top: 230, left: 120 },
        female: { width: 54, height: 54, top: 170, left: 95 },
    },
};
