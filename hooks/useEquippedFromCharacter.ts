import { EquipmentSlotType } from '@/types/slot';
import { useMemo } from 'react';

type CharacterItem = {
    id: string;
    slot: EquipmentSlotType;
    template?: { code?: string; name?: string; rarity?: string; baseStats?: Record<string, number> };
};

export const useEquippedFromCharacter = (character: any) => {
    const items: CharacterItem[] = (character?.items as any[]) || [];

    const equippedItems = useMemo(() => {
        const findOne = (slot: EquipmentSlotType) => items.find((i) => i.slot === slot) || null;
        const findMany = (slot: EquipmentSlotType) => items.filter((i) => i.slot === slot);
        const rings = findMany('ring');
        return {
            helmet: findOne('helmet'),
            body: findOne('chest'),
            cape: findOne('cape'),
            hands: findOne('glove'),
            mainHand: findOne('weapon'),
            offHand: findOne('shield'),
            feet: findOne('feet'),
            neck: findOne('neck'),
            legs: findOne('legs'), // Fixed: 'pants' → 'legs' to match API
            ring1: rings[0] || null,
            ring2: rings[1] || null,
        } as Record<string, CharacterItem | null>;
    }, [items]);

    const equipmentCodes = useMemo(() => {
        const eq: Record<string, string> = {};
        for (const it of items) {
            const code = it?.template?.code as string | undefined;
            const slot = it?.slot as EquipmentSlotType | undefined;
            if (!code || !slot) continue;
            switch (slot) {
                case 'chest':
                    eq.chest = code; break;
                case 'helmet':
                    eq.helmet = code; break;
                case 'cape':
                    eq.cape = code; break;
                case 'glove':
                    eq.glove_left = code; eq.glove_right = code; break;
                case 'feet':
                    eq.feet_left = code; eq.feet_right = code; break;
                case 'weapon':
                    eq.weapon_main = code; break;
                case 'shield':
                    eq.shield = code; break;
                // Note: 'neck', 'ring', 'legs' are not used in equipmentCodes for character rendering
            }
        }
        return eq;
    }, [items]);

    return { equippedItems, equipmentCodes } as const;
};


