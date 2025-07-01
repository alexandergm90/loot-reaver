import { itemSlotMeta } from '@/data/itemAssets/slotMeta';

type SlotMeta =
    | { width: number; height: number; top: number; left: number }
    | {
          left: { width: number; height: number; top: number; left: number };
          right: { width: number; height: number; top: number; left: number };
      };

const isSideMeta = (
    meta: SlotMeta,
): meta is {
    left: { width: number; height: number; top: number; left: number };
    right: { width: number; height: number; top: number; left: number };
} => 'left' in meta && 'right' in meta;

export const getSlotPosition = (slot: keyof typeof itemSlotMeta, side?: 'left' | 'right') => {
    const meta = itemSlotMeta[slot] as SlotMeta;
    if (!meta) return null;

    if (side && isSideMeta(meta)) {
        return meta[side];
    }

    if (!side && !isSideMeta(meta)) {
        return meta;
    }

    return null;
};
