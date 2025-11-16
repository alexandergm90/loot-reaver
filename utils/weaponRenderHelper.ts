import { ItemAsset, ItemPosition } from '@/types';
import { getItemPosition } from './getItemAsset';

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
    gender: 'male' | 'female',
): RenderInstruction[] {
    if (mainHand?.weaponType === 'twohanded') {
        // For two-handed weapons, use the main hand position
        // TODO: Add twohanded-specific positioning to weapon assets if needed
        const pos = getItemPosition(mainHand, gender);
        if (pos) {
            return [{ source: mainHand.source, ...pos }];
        }
        // Fallback positioning if not found
        return [{ source: mainHand.source, width: 196, height: 128, top: 36, left: 30 }];
    }

    const instructions: RenderInstruction[] = [];

    if (mainHand?.weaponType === 'main' || mainHand?.itemType === 'weapon') {
        const pos = getItemPosition(mainHand, gender);
        if (pos) {
            // Adjust weapon position to match the moved hand pivot (15px down, 10px right)
            instructions.push({
                source: mainHand.source,
                width: pos.width,
                height: pos.height,
                top: pos.top + 10,
                left: pos.left + 5
            });
        }
    }

    if (offHand?.itemType === 'weapon' && offHand?.weaponType !== 'twohanded') {
        const pos = getItemPosition(offHand, gender);
        if (pos) {
            instructions.push({ source: offHand.source, ...pos });
        }
    }

    if (offHand?.itemType === 'shield') {
        const pos = getItemPosition(offHand, gender);
        if (pos) {
            instructions.push({ source: offHand.source, ...pos });
        }
    }

    return instructions;
}
