import { EquipmentSlotType, isValidEquipmentSlot } from '@/types/slot';
import { getItemIcon } from '@/utils/getItemIcon';
import React from 'react';
import { Image, ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import RarityGradientBackground from './RarityGradientBackground';

type Props = {
    label: string;
    item?: any | null;
    slotType?: EquipmentSlotType; // Preferred: use slot type from API
    onPress?: (i: any) => void;
    fallback?: string;
};

// Map slot types to placeholder icon paths
const getPlaceholderIcon = (slotType: EquipmentSlotType): any => {
    const iconMap: Record<EquipmentSlotType, any> = {
        helmet: require('@/assets/images/equipment/placeholder_icons/helmet.png'),
        chest: require('@/assets/images/equipment/placeholder_icons/chest.png'),
        glove: require('@/assets/images/equipment/placeholder_icons/glove.png'),
        feet: require('@/assets/images/equipment/placeholder_icons/feet.png'),
        weapon: require('@/assets/images/equipment/placeholder_icons/weapon.png'),
        shield: require('@/assets/images/equipment/placeholder_icons/shield.png'),
        cape: require('@/assets/images/equipment/placeholder_icons/cape.png'),
        ring: require('@/assets/images/equipment/placeholder_icons/ring.png'),
        neck: require('@/assets/images/equipment/placeholder_icons/neck.png'),
        legs: require('@/assets/images/equipment/placeholder_icons/legs.png'),
    };
    return iconMap[slotType] || iconMap.chest;
};

const SlotChip: React.FC<Props> = ({ label, item, slotType, onPress, fallback }) => {
    const clickable = !!item;
    const Comp: any = clickable ? Pressable : View;
    
    // Determine slot type: prefer prop, then item.slot, then fallback to label matching
    const resolvedSlotType: EquipmentSlotType = (() => {
        if (slotType && isValidEquipmentSlot(slotType)) {
            return slotType;
        }
        if (item?.slot && isValidEquipmentSlot(item.slot)) {
            return item.slot as EquipmentSlotType;
        }
        // Fallback: try to infer from label (for backwards compatibility)
        const labelLower = label.toLowerCase();
        if (labelLower.includes('helmet')) return 'helmet';
        if (labelLower.includes('cape')) return 'cape';
        if (labelLower.includes('chest') || labelLower.includes('body')) return 'chest';
        if (labelLower.includes('neck')) return 'neck';
        if (labelLower.includes('glove') || (labelLower.includes('hand') && !labelLower.includes('main') && !labelLower.includes('off'))) return 'glove';
        if (labelLower.includes('ring')) return 'ring';
        if (labelLower.includes('leg') || labelLower.includes('pant')) return 'legs';
        if (labelLower.includes('feet') || labelLower.includes('boot')) return 'feet';
        if (labelLower.includes('main hand') || labelLower.includes('weapon')) return 'weapon';
        if (labelLower.includes('off hand') || labelLower.includes('shield')) return 'shield';
        return 'chest'; // Default fallback
    })();
    
    const placeholderIcon = getPlaceholderIcon(resolvedSlotType);
    const hasItem = !!item;
    const itemCode = item?.template?.code;
    const itemIcon = getItemIcon(itemCode);
    const rarity = item?.rarity || item?.template?.rarity || 'worn';
    
    return (
        <Comp onPress={clickable ? () => onPress && onPress(item) : undefined} style={styles.container}>
            <ImageBackground
                source={require('@/assets/images/equipment/equipment_slot.png')}
                resizeMode="contain"
                style={styles.background}
            >
                {hasItem ? (
                    // Show item with rarity background when equipped
                    <RarityGradientBackground
                        rarity={rarity}
                        style={styles.content}
                    >
                        {itemIcon ? (
                            <Image 
                                source={itemIcon} 
                                style={styles.icon}
                                resizeMode="contain"
                            />
                        ) : null}
                    </RarityGradientBackground>
                ) : (
                    // Show placeholder icon when empty
                    <View style={styles.content}>
                        <Image 
                            source={placeholderIcon} 
                            style={styles.icon}
                            resizeMode="contain"
                        />
                    </View>
                )}
            </ImageBackground>
        </Comp>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 60,
        height: 60,
    },
    background: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        padding: 8,
    },
    icon: {
        width: '100%',
        height: '100%',
    },
});

export default SlotChip;


