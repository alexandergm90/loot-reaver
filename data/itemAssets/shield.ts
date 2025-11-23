import { EquipmentAssets } from '@/types';

export const shieldAssets: EquipmentAssets = {
    wooden_shield: {
        source: require('../../assets/images/items/shield/wooden_shield.png'),
        // Shield positioning - uses asset size, position from slotMeta
        male: { width: 130, height: 150, top: 0, left: 0 },
        female:{ width: 130, height: 150, top: 0, left: 0 },
    },
};
