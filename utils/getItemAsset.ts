import { EquipmentAssets, ItemAsset } from '@/types';
import { itemAssets } from '@/data/itemAssets';

export const getItemAsset = (slot: keyof typeof itemAssets, slug: string): ItemAsset | null => {
    const slotAssets: EquipmentAssets | undefined = itemAssets[slot];
    if (!slotAssets) return null;
    return slotAssets[slug] ?? null;
};
