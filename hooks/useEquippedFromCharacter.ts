import { EquipmentSlotType } from '@/types/slot';
import { useMemo } from 'react';

type CharacterItem = {
    id: string;
    slot: EquipmentSlotType;
    equippedHand?: "left" | "right" | null;
    isTwoHanded?: boolean;
    template?: { code?: string; name?: string; rarity?: string; baseStats?: Record<string, number> };
};

export const useEquippedFromCharacter = (character: any) => {
    const items: CharacterItem[] = (character?.items as any[]) || [];

    const equippedItems = useMemo(() => {
        const findOne = (slot: EquipmentSlotType) => items.find((i) => i.slot === slot) || null;
        const findMany = (slot: EquipmentSlotType) => items.filter((i) => i.slot === slot);
        const rings = findMany('ring');
        const weapons = findMany('weapon');
        const shields = findMany('shield');
        
        // Find two-handed weapon (highest priority)
        const twoHandedWeapon = weapons.find((w) => w.isTwoHanded === true) || null;
        
        // Find left/right weapons (only if no two-handed)
        // Note: API equippedHand "left" = off-hand, "right" = main-hand
        // Mapping: leftWeapon (off-hand) → weapon_left slot, rightWeapon (main-hand) → weapon_right slot
        const leftWeapon = !twoHandedWeapon ? weapons.find((w) => w.equippedHand === 'left') || null : null;
        const rightWeapon = !twoHandedWeapon ? weapons.find((w) => w.equippedHand === 'right') || null : null;
        
        // Find shield (always left hand/off-hand)
        const shield = shields[0] || null;
        
        // Find rings by hand
        const leftRing = rings.find((r) => r.equippedHand === 'left') || null;
        const rightRing = rings.find((r) => r.equippedHand === 'right') || null;
        
        return {
            helmet: findOne('helmet'),
            body: findOne('chest'),
            cape: findOne('cape'),
            hands: findOne('glove'),
            mainHand: twoHandedWeapon || rightWeapon || leftWeapon, // Main-hand = right weapon (or two-handed, or left as fallback)
            offHand: shield, // Off-hand = shield (or could be left weapon if no shield)
            // Note: weaponLeft/weaponRight here refer to UI slot positions, not API equippedHand
            // weaponLeft (left UI slot) = main-hand weapons (API equippedHand: "right")
            // weaponRight (right UI slot) = off-hand weapons (API equippedHand: "left")
            weaponLeft: rightWeapon,  // Main-hand goes to left UI slot
            weaponRight: leftWeapon,  // Off-hand goes to right UI slot
            weaponTwoHanded: twoHandedWeapon,
            shield: shield,
            feet: findOne('feet'),
            neck: findOne('neck'),
            legs: findOne('legs'),
            ring1: leftRing || rightRing, // For backward compatibility
            ring2: leftRing && rightRing ? rightRing : null, // For backward compatibility
            ringLeft: leftRing,
            ringRight: rightRing,
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
                    // Check if two-handed first
                    if (it.isTwoHanded === true) {
                        eq.weapon_twohanded = code;
                    } else if (it.equippedHand === 'left') {
                        // API left (off-hand) maps to weapon_right slot (right UI slot)
                        eq.weapon_right = code;
                    } else if (it.equippedHand === 'right') {
                        // API right (main-hand) maps to weapon_left slot (left UI slot)
                        eq.weapon_left = code;
                    }
                    break;
                case 'shield':
                    eq.shield = code; break;
                case 'legs':
                    eq.legs = code; break;
                case 'ring':
                    if (it.equippedHand === 'left') {
                        eq.ring_left = code;
                    } else if (it.equippedHand === 'right') {
                        eq.ring_right = code;
                    }
                    break;
                // Note: 'neck' is not used in equipmentCodes for character rendering
            }
        }
        return eq;
    }, [items]);

    return { equippedItems, equipmentCodes } as const;
};


