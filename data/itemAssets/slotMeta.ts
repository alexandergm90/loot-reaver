import { ItemSlotMeta } from '@/types';

export const itemSlotMeta: ItemSlotMeta = {
    helmet: { width: 128, height: 128, top: 0, left: 0 },
    chest: { width: 149, height: 145, top: 90, left: -20 },
    cape: { width: 120, height: 120, top: 18, left: 4 },
    glove: {
        left: { width: 54, height: 54, top: 180, left: -20 },
        right: { width: 54, height: 54, top: 170, left: 95 },
    },
    weapon: {
        left: { width: 100, height: 70, top: 255, left: -38 },
        right: { width: 100, height: 70, top: 258, left: 7 },
    },
    feet: {
        left: { width: 47, height: 64, top: 252, left: 18 },
        right: { width: 47, height: 64, top: 242, left: 68 },
    },
    weapon_twohanded: {
        center: { width: 196, height: 128, top: 36, left: 30 },
    },
    shield: {
        left: { width: 100, height: 100, top: 180, left: 55 },
    },
    legs: { width: 149, height: 145, top: 180, left: -20 },
    // These slots exist in the API but are not rendered on the character preview
    neck: {
        left: { width: 0, height: 0, top: 0, left: 0 },
        right: { width: 0, height: 0, top: 0, left: 0 },
    },
    ring: {
        left: { width: 0, height: 0, top: 0, left: 0 },
        right: { width: 0, height: 0, top: 0, left: 0 },
    },
};
