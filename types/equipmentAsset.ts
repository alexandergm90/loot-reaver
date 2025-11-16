export type ItemPosition = {
    width: number;
    height: number;
    top: number;
    left: number;
};

// Each item asset has gender-specific positioning
// For side items (gloves, feet), we use separate asset entries (e.g., leather_boot_left, leather_boot_right)
export type ItemAsset = {
    source: any;
    male: ItemPosition;
    female: ItemPosition;
};

export type EquipmentAssets = Record<string, ItemAsset>;
