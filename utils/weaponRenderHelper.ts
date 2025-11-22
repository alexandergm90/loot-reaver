import { itemSlotMeta } from '@/data/itemAssets/slotMeta';
import { getItemAsset, getItemPosition } from './getItemAsset';

export interface RenderInstruction {
    source: any;
    width: number;
    height: number;
    top: number;
    left: number;
    flipHorizontal?: boolean; // Flip image horizontally for off-hand weapons
    excludeFromBounds?: boolean; // Exclude from bounding box calculation (for off-hand/shield)
}

// Note: Due to UI slot naming vs API mapping:
// - weaponLeft slot (left UI slot) receives main-hand weapons (API equippedHand: "right")
// - weaponRight slot (right UI slot) receives off-hand weapons (API equippedHand: "left")
export function getWeaponRenderInstructions(
    weaponLeft: string | undefined,  // Main-hand weapons (API equippedHand: "right", left UI slot)
    weaponRight: string | undefined,  // Off-hand weapons (API equippedHand: "left", right UI slot)
    weaponTwoHanded: string | undefined,
    shield: string | undefined,
    gender: 'male' | 'female',
): RenderInstruction[] {
    const instructions: RenderInstruction[] = [];

    // Two-handed weapons have highest priority
    if (weaponTwoHanded) {
        const asset = getItemAsset('weapon', weaponTwoHanded);
        if (asset) {
            // For two-handed weapons, use asset position (centered)
            const pos = getItemPosition(asset, gender) || itemSlotMeta.weapon_twohanded.center;
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

    // Left weapon slot (main-hand) - use asset size, slotMeta position
    // Do NOT flip main-hand weapons
    if (weaponLeft) {
        const asset = getItemAsset('weapon', weaponLeft);
        if (asset) {
            const assetPos = getItemPosition(asset, gender);
            const slotPos = itemSlotMeta.weapon.left;
            // Use asset's width/height (size), but slotMeta's position (top/left)
            instructions.push({
                source: asset.source,
                width: assetPos?.width || slotPos.width,
                height: assetPos?.height || slotPos.height,
                top: slotPos.top,
                left: slotPos.left,
                // Main-hand weapon should NOT be flipped
            });
        }
    }

    // Right weapon slot (off-hand) - use asset size, slotMeta position
    // Flip horizontally for off-hand weapons
    // Exclude from bounding box to prevent character shifting
    if (weaponRight) {
        const asset = getItemAsset('weapon', weaponRight);
        if (asset) {
            const assetPos = getItemPosition(asset, gender);
            const slotPos = itemSlotMeta.weapon.right;
            // Use asset's width/height (size), but slotMeta's position (top/left)
            instructions.push({
                source: asset.source,
                width: assetPos?.width || slotPos.width,
                height: assetPos?.height || slotPos.height,
                top: slotPos.top,
                left: slotPos.left,
                flipHorizontal: true, // Flip off-hand weapon horizontally
                excludeFromBounds: true, // Exclude off-hand from bounding box
            });
        }
    }

    // Shield (always left hand/off-hand)
    // Exclude from bounding box to prevent character shifting
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
                excludeFromBounds: true, // Exclude shield from bounding box
            });
        }
    }

    return instructions;
}
