// Map of item codes to their icon images
const itemIconMap: Record<string, any> = {
    basic_sword: require('@/assets/images/items/icons/basic_sword.png'),
    basic_cape: require('@/assets/images/items/icons/basic_cape.png'),
    leather_tunic: require('@/assets/images/items/icons/leather_tunic.png'),
    leather_boot: require('@/assets/images/items/icons/leather_boot.png'),
    leather_glove: require('@/assets/images/items/icons/leather_glove.png'),
    leather_helmet: require('@/assets/images/items/icons/leather_helmet.png'),
    leather_pants: require('@/assets/images/items/icons/leather_pants.png'),
    bronze_necklace: require('@/assets/images/items/icons/bronze_necklace.png'),
    dark_necklace: require('@/assets/images/items/icons/dark_necklace.png'),
    silver_green_necklace: require('@/assets/images/items/icons/silver_green_necklace.png'),
    gold_blue_necklace: require('@/assets/images/items/icons/gold_blue_necklace.png'),
    dark_ring: require('@/assets/images/items/icons/dark_ring.png'),
    gold_ruby_ring: require('@/assets/images/items/icons/gold_ruby_ring.png'),
    iron_ring: require('@/assets/images/items/icons/iron_ring.png'),
    silver_ring: require('@/assets/images/items/icons/silver_ring.png'),
    wooden_shield: require('@/assets/images/items/icons/wooden_shield.png'),
};

/**
 * Get the local icon image for an item by its code
 * @param code - The item code (e.g., 'leather_tunic', 'basic_sword')
 * @returns The icon image source, or null if not found
 */
export const getItemIcon = (code: string | undefined | null): any | null => {
    if (!code) return null;
    return itemIconMap[code] || null;
};

