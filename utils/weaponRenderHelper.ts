import { ItemAsset } from '@/types';
import { itemSlotMeta } from '@/data/itemAssets/slotMeta';
import { getItemAsset } from './getItemAsset';

export interface RenderInstruction {
    source: any;
    width: number;
    height: number;
    top: number;
    left: number;
}

export function getWeaponRenderInstructions(
    weaponLeft: string | undefined,
    weaponRight: string | undefined,
    weaponTwoHanded: string | undefined,
    shield: string | undefined,
    gender: 'male' | 'female',
): RenderInstruction[] {
    const instructions: RenderInstruction[] = [];

    // Two-handed weapons have highest priority
    if (weaponTwoHanded) {
        const asset = getItemAsset('weapon', weaponTwoHanded);
        if (asset) {
            // Use slotMeta position for two-handed weapons
            const pos = itemSlotMeta.weapon_twohanded.center;
            instructions.push({
                source: asset.source,
                width: pos.width,
                height: pos.height,
                top: pos.top,
                left: pos.left,
            });
        }
        // Return early - two-handed weapons occupy both hands
        return instructions;
    }

    // Left weapon
    if (weaponLeft) {
        const asset = getItemAsset('weapon', weaponLeft);
        if (asset) {
            const pos = itemSlotMeta.weapon.left;
            instructions.push({
                source: asset.source,
                width: pos.width,
                height: pos.height,
                top: pos.top,
                left: pos.left,
            });
        }
    }

    // Right weapon
    if (weaponRight) {
        const asset = getItemAsset('weapon', weaponRight);
        if (asset) {
            const pos = itemSlotMeta.weapon.right;
            instructions.push({
                source: asset.source,
                width: pos.width,
                height: pos.height,
                top: pos.top,
                left: pos.left,
            });
        }
    }

    // Shield (always left hand)
    if (shield) {
        const asset = getItemAsset('shield', shield);
        if (asset) {
            const pos = itemSlotMeta.shield.left;
            instructions.push({
                source: asset.source,
                width: pos.width,
                height: pos.height,
                top: pos.top,
                left: pos.left,
            });
        }
    }

    return instructions;
}
