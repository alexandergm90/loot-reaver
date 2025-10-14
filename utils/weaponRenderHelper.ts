import { itemSlotMeta } from '@/data/itemAssets/slotMeta';
import { ItemAsset } from '@/types';

export type WeaponType = 'main' | 'off' | 'twohanded';
export type ItemType = 'weapon' | 'shield';

export interface EquippedItem extends ItemAsset {
    weaponType?: WeaponType;
    itemType?: ItemType;
}

export interface RenderInstruction {
    source: any;
    width: number;
    height: number;
    top: number;
    left: number;
}

export function getWeaponRenderInstructions(
    mainHand: EquippedItem | null,
    offHand: EquippedItem | null,
): RenderInstruction[] {
    if (mainHand?.weaponType === 'twohanded') {
        const meta = itemSlotMeta.weapon_twohanded.center;
        return [{ source: mainHand.source, ...meta }];
    }

    const instructions: RenderInstruction[] = [];

    if (mainHand?.weaponType === 'main' || mainHand?.itemType === 'weapon') {
        const meta = itemSlotMeta.weapon.right;
        // Adjust weapon position to match the moved hand pivot (15px down, 10px right)
        instructions.push({
            source: mainHand.source,
            width: meta.width,
            height: meta.height,
            top: meta.top + 10,
            left: meta.left + 5
        });
    }

    if (offHand?.itemType === 'weapon' && offHand?.weaponType !== 'twohanded') {
        const meta = itemSlotMeta.weapon.left;
        instructions.push({ source: offHand.source, ...meta });
    }

    if (offHand?.itemType === 'shield') {
        const meta = itemSlotMeta.shield.left;
        instructions.push({ source: offHand.source, ...meta });
    }

    return instructions;
}
