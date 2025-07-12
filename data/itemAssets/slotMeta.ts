import {ItemSlotMeta} from "@/types";

export const itemSlotMeta: ItemSlotMeta = {
    helmet: { width: 128, height: 128, top: 0, left: 0 },
    chest: { width: 128, height: 128, top: 24, left: 0 },
    cape: { width: 128, height: 128, top: 22, left: 0 },
    glove: {
        left: { width: 128, height: 128, top: 40, left: 18 },
        right: { width: 128, height: 128, top: 40, left: 45 },
    },
    weapon: {
        left: { width: 128, height: 128, top: 38, left: 12 },
        right: { width: 128, height: 128, top: 38, left: 55 },
    },
    feet: {
        left: { width: 128, height: 128, top: 40, left: 18 },
        right: { width: 128, height: 128, top: 40, left: 45 },
    },
    weapon_twohanded: {
        center: { width: 196, height: 128, top: 36, left: 30 },
    },
    shield: {
        left: { width: 128, height: 128, top: 38, left: 12 },
    },
};
