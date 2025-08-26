export type ItemAsset = {
    source: any;
    width?: number;
    height?: number;
    top?: number;
    left?: number;
};

export type EquipmentAssets = Record<string, ItemAsset>;
