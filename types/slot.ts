export type SlotPosition = {
    width: number;
    height: number;
    top: number;
    left: number;
};

export type SidePosition = {
    left: SlotPosition;
    right: SlotPosition;
};

export type ItemSlotMeta = {
    helmet: SlotPosition;
    chest: SlotPosition;
    cape: SlotPosition;
    glove: SidePosition;
    weapon: SidePosition;
    feet: SidePosition;
    neck: SidePosition;
    ring: SidePosition;
    legs: SlotPosition;
    weapon_twohanded: {
        center: SlotPosition;
    };
    shield: {
        left: SlotPosition;
    };
};

// Equipment slot types as defined by the API
export type EquipmentSlotType = 
    | 'helmet'
    | 'chest'
    | 'glove'
    | 'feet'
    | 'weapon'
    | 'shield'
    | 'cape'
    | 'ring'
    | 'neck'
    | 'legs';

// Helper function to validate slot type
export const isValidEquipmentSlot = (slot: string): slot is EquipmentSlotType => {
    return ['helmet', 'chest', 'glove', 'feet', 'weapon', 'shield', 'cape', 'ring', 'neck', 'legs'].includes(slot);
};
