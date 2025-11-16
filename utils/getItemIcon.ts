// Map of item codes to their icon images
const itemIconMap: Record<string, any> = {
    basic_sword: require('@/assets/images/items/icons/basic_sword.png'),
    basic_cape: require('@/assets/images/items/icons/basic_cape.png'),
    leather_tunic: require('@/assets/images/items/icons/leather_tunic.png'),
    leather_boot: require('@/assets/images/items/icons/leather_boot.png'),
    leather_glove: require('@/assets/images/items/icons/leather_glove.png'),
    leather_helmet: require('@/assets/images/items/icons/leather_helmet.png'),
    leather_pants: require('@/assets/images/items/icons/leather_pants.png'),
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

