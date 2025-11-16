import { itemAssets } from '@/data/itemAssets';
import { EquipmentAssets, ItemAsset, ItemPosition } from '@/types';

export const getItemAsset = (slot: keyof typeof itemAssets, slug: string): ItemAsset | null => {
    const slotAssets: EquipmentAssets | undefined = itemAssets[slot];
    if (!slotAssets) return null;
    return slotAssets[slug] ?? null;
};

/**
 * Get the positioning data for an item asset based on gender
 * @param asset - The item asset
 * @param gender - The character gender ('male' | 'female')
 * @returns The positioning data for the specified gender
 */
export const getItemPosition = (asset: ItemAsset | null, gender: 'male' | 'female'): ItemPosition | null => {
    if (!asset) return null;
    return asset[gender] ?? null;
};
