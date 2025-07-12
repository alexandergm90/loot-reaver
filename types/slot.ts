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
    weapon_twohanded: {
        center: SlotPosition;
    };
    shield: {
        left: SlotPosition;
    };
};