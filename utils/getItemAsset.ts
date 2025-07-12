import { itemAssets } from '@/data/itemAssets';
import { EquipmentAssets, ItemAsset } from '@/types';

export const getItemAsset = (slot: keyof typeof itemAssets, slug: string): ItemAsset | null => {
    const slotAssets: EquipmentAssets | undefined = itemAssets[slot];
    if (!slotAssets) return null;
    return slotAssets[slug] ?? null;
};
