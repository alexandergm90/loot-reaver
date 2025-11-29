import { equipItem, unequipItem } from '@/services/playerService';
import { getItemIcon } from '@/utils/getItemIcon';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import AppButton from './AppButton';
import LRText from './LRText';
import RarityGradientBackground from './RarityGradientBackground';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Stat icon mapping
const STAT_ICONS: Record<string, any> = {
    armor: require('@/assets/images/equipment/stats_icons/armor.png'),
    health: require('@/assets/images/equipment/stats_icons/health.png'),
    attack: require('@/assets/images/equipment/stats_icons/attack.png'),
    block: require('@/assets/images/equipment/stats_icons/block.png'),
    critical: require('@/assets/images/equipment/stats_icons/critical.png'),
    dexterity: require('@/assets/images/equipment/stats_icons/dexterity.png'),
    dodge: require('@/assets/images/equipment/stats_icons/dodge.png'),
    fire: require('@/assets/images/equipment/stats_icons/fire.png'),
    intelligence: require('@/assets/images/equipment/stats_icons/intelligence.png'),
    lighting: require('@/assets/images/equipment/stats_icons/lighting.png'),
    lightning: require('@/assets/images/equipment/stats_icons/lighting.png'),
    poison: require('@/assets/images/equipment/stats_icons/poison.png'),
    strength: require('@/assets/images/equipment/stats_icons/strength.png'),
};

// Attack type mapping
const ATTACK_TYPE_MAP: Record<string, string> = {
    slashes: 'slash',
    crushes: 'crush',
    smashes: 'smash',
};

// Stats that should display as percentages
const PERCENTAGE_STATS = ['critical', 'block', 'dodge'];

// Helper to get stat icon
const getStatIcon = (statKey: string): any | null => {
    const normalizedKey = statKey.toLowerCase();
    return STAT_ICONS[normalizedKey] || null;
};

// Helper to format stat value
const formatStatValue = (key: string, value: number): string => {
    if (PERCENTAGE_STATS.includes(key.toLowerCase())) {
        // Convert 0.01 to 1%
        const percentage = Math.round(value * 100);
        return `+${percentage}%`;
    }
    return `+${String(value)}`;
};

// Helper to process bonuses and combine minAttack/maxAttack into attack range
const processBonuses = (bonuses: any): Array<{ key: string; value: string | number; icon: any | null }> => {
    const allStats: Array<{ key: string; value: string | number; icon: any | null }> = [];
    
    if (!bonuses || typeof bonuses !== 'object') {
        return allStats;
    }
    
    // Check if both minAttack and maxAttack exist
    const minAttack = bonuses.minAttack;
    const maxAttack = bonuses.maxAttack;
    const hasAttackRange = typeof minAttack === 'number' && typeof maxAttack === 'number';
    
    Object.entries(bonuses).forEach(([key, value]) => {
        // Skip attackType (it's shown at the top for weapons)
        if (key.toLowerCase() === 'attacktype') return;
        
        // Skip minAttack and maxAttack if we're combining them
        if (hasAttackRange && (key.toLowerCase() === 'minattack' || key.toLowerCase() === 'maxattack')) {
            return;
        }
        
        const normalizedKey = key.toLowerCase();
        const icon = getStatIcon(normalizedKey);
        allStats.push({ key, value: value as number, icon });
    });
    
    // Add combined attack range at the beginning if both minAttack and maxAttack exist
    if (hasAttackRange) {
        const attackIcon = getStatIcon('attack');
        allStats.unshift({ 
            key: 'attack', 
            value: `${minAttack}-${maxAttack}`, 
            icon: attackIcon 
        });
    }
    
    return allStats;
};

type ItemDetails = {
    id: string;
    slot: string;
    rarity: string;
    equipped: boolean;
    durability: number;
    socketedRunes: any | null;
    bonuses: any | null;
    createdAt: string;
    isTwoHanded?: boolean;
    template: {
        id: string;
        code: string;
        name: string;
        slot: string;
        baseStats: Record<string, number>;
        iconUrl: string;
    };
};

type Props = {
    item: ItemDetails | any | null;
    loading?: boolean;
    onClose: () => void;
    onEquipChange?: () => void;
};

const ItemInfoModal: React.FC<Props> = ({ item, loading = false, onClose, onEquipChange }) => {
    if (!item && !loading) return null;

    const [equipLoading, setEquipLoading] = useState(false);
    const [selectedHand, setSelectedHand] = useState<'left' | 'right' | null>(null);
    const [titleIsTwoLines, setTitleIsTwoLines] = useState(false);
    const itemCode = item?.template?.code;
    const itemIcon = getItemIcon(itemCode);
    const rarity = item?.rarity || item?.template?.rarity || 'worn';
    const isEquipped = item?.equipped === true;
    const slot = item?.slot || item?.template?.slot || '';
    const isWeapon = slot?.toLowerCase() === 'weapon';
    const isRing = slot?.toLowerCase() === 'ring';
    const isShield = slot?.toLowerCase() === 'shield';
    const isTwoHanded = item?.template?.isTwoHanded === true;
    
    // Show hand selection for weapons (if not two-handed) and rings
    const showHandSelection = !isEquipped && (isWeapon || isRing) && !isTwoHanded;

    const handleEquipUnequip = async (hand?: 'left' | 'right') => {
        if (!item?.id) return;
        
        // For weapons and rings, require hand selection (unless two-handed)
        if (!isEquipped && (isWeapon || isRing) && !isTwoHanded && !hand) {
            Alert.alert('Select Hand', 'Please select which hand to equip this item to.');
            return;
        }
        
        setEquipLoading(true);
        try {
            if (isEquipped) {
                await unequipItem(item.id);
            } else {
                // Determine slot parameter
                let slotParam: string | undefined = undefined;
                if (isWeapon && !isTwoHanded && hand) {
                    slotParam = hand;
                } else if (isRing && hand) {
                    slotParam = hand;
                } else if (isShield) {
                    slotParam = 'left'; // Shield defaults to left
                }
                // For two-handed weapons, slot is ignored by API
                
                await equipItem(item.id, slotParam);
            }
            
            // Notify parent to refresh data
            if (onEquipChange) {
                onEquipChange();
            }
            
            // Close the modal after successful operation
            onClose();
        } catch (error: any) {
            Alert.alert(
                'Error',
                error?.message || `Failed to ${isEquipped ? 'unequip' : 'equip'} item`
            );
        } finally {
            setEquipLoading(false);
        }
    };
    const rarityColorMap: Record<string, string> = {
        worn: '#a0a0a0', // gray
        superior: '#90ee90', // light green
        enchanted: '#3b6ad6', // blue
        heroic: '#9b3bd6', // purple
        relic: '#daa520', // darkish yellow (dark goldenrod)
        celestial: '#00bfff', // light blue/azure
    };

    return (
        <Modal visible={!!item || loading} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <ImageBackground
                    source={require('@/assets/images/equipment/item_modal.png')}
                    resizeMode="contain"
                    style={styles.modalContainer}
                    imageStyle={styles.modalBackground}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#d4a574" />
                        </View>
                    ) : (
                        <View style={styles.modalContent}>
                            {/* Close button - inside top-right */}
                            <Pressable onPress={onClose} style={styles.closeButton}>
                                <LRText weight="black" style={styles.closeButtonText}>✕</LRText>
                            </Pressable>

                            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                                {/* Item name - top centered with fixed height container */}
                                <View style={[styles.itemNameContainer, titleIsTwoLines ? styles.itemNameContainerTwoLines : styles.itemNameContainerOneLine]}>
                                    <LRText 
                                        weight="black" 
                                        style={styles.itemName} 
                                        numberOfLines={2} 
                                        ellipsizeMode="tail"
                                        onTextLayout={(e) => {
                                            const lines = e.nativeEvent.lines.length;
                                            setTitleIsTwoLines(lines > 1);
                                        }}
                                    >
                                        {item?.template?.name || 'Unknown Item'}
                                    </LRText>
                                </View>

                            {/* Rarity - below title, centered */}
                            <LRText
                                weight="bold"
                                style={[
                                    styles.rarity,
                                    { color: rarityColorMap[rarity?.toLowerCase()] || rarityColorMap.worn },
                                ]}
                            >
                                {rarity ? rarity.toUpperCase() : 'WORN'}
                            </LRText>

                            {/* Level, Slot, Power - below rarity */}
                            <View style={styles.infoRow}>
                                <LRText weight="regular" style={styles.infoText}>
                                    Level {item?.template?.baseStats?.level || '1'}
                                </LRText>
                                <LRText weight="regular" style={styles.infoText}>
                                    {(() => {
                                        const slot = item?.slot || item?.template?.slot || 'Unknown';
                                        
                                        // For weapons, show "Two Handed Weapon • Slash" or "One Handed Weapon • Slash"
                                        if (slot?.toLowerCase() === 'weapon') {
                                            const isTwoHandedWeapon = item?.template?.isTwoHanded === true;
                                            const handedness = isTwoHandedWeapon ? 'Two Handed Weapon' : 'One Handed Weapon';
                                            
                                            // Get attackType from baseStats
                                            const attackType = item?.template?.baseStats?.attackType || item?.template?.baseStats?.attacktype;
                                            if (attackType) {
                                                const mappedType = ATTACK_TYPE_MAP[attackType.toLowerCase()] || attackType.toLowerCase();
                                                const capitalizedType = mappedType.charAt(0).toUpperCase() + mappedType.slice(1);
                                                return `${handedness} • ${capitalizedType}`;
                                            }
                                            return handedness;
                                        }
                                        return slot;
                                    })()}
                                </LRText>
                                <LRText weight="regular" style={styles.infoText}>
                                    Power: {item?.template?.baseStats?.power || '0'}
                                </LRText>
                            </View>

                            {/* Delimiter dot above image */}
                            <View style={styles.delimiterContainer}>
                                <Image
                                    source={require('@/assets/images/equipment/horizontal_delimiter_dot.png')}
                                    resizeMode="contain"
                                    style={styles.delimiterDot}
                                />
                            </View>

                            {/* Item icon with stats on sides */}
                            <View style={styles.itemWithStatsContainer}>
                                {/* Left stats column */}
                                <View style={styles.statsSideColumn}>
                                    {(() => {
                                        const allStats = processBonuses(item?.bonuses);
                                        
                                        // Left column: first 4 stats
                                        const leftStats = allStats.slice(0, 4);
                                        
                                        // Return empty view if no stats to maintain layout
                                        if (leftStats.length === 0) {
                                            return <View key="empty-left" style={{ minHeight: 20 }} />;
                                        }
                                        
                                        return leftStats.map((stat) => {
                                            const statIcon = stat.icon;
                                            // For attack range (string value), display as-is; otherwise format normally
                                            const formattedValue = typeof stat.value === 'string' 
                                                ? stat.value 
                                                : formatStatValue(stat.key, stat.value as number);
                                            
                                            return (
                                                <View key={stat.key} style={styles.statRowSide}>
                                                    {statIcon ? (
                                                        <Image source={statIcon} style={styles.statIcon} resizeMode="contain" />
                                                    ) : (
                                                        <View style={styles.statIcon} />
                                                    )}
                                                    <LRText weight="bold" style={styles.statValue}>
                                                        {formattedValue}
                                                    </LRText>
                                                </View>
                                            );
                                        });
                                    })()}
                                </View>

                                {/* Large item image in center with paper border */}
                                {itemIcon && (
                                    <View style={styles.largeImageContainer}>
                                        <ImageBackground
                                            source={require('@/assets/images/equipment/paper_slot.png')}
                                            resizeMode="stretch"
                                            style={styles.paperBorder}
                                        >
                                            <RarityGradientBackground
                                                rarity={rarity}
                                                style={styles.largeImageWrapper}
                                            >
                                                <Image
                                                    source={itemIcon}
                                                    style={styles.largeImage}
                                                    resizeMode="contain"
                                                />
                                            </RarityGradientBackground>
                                        </ImageBackground>
                                    </View>
                                )}

                                {/* Right stats column */}
                                <View style={styles.statsSideColumn}>
                                    {(() => {
                                        const allStats = processBonuses(item?.bonuses);
                                        
                                        // Right column: stats 5-8 (or empty if less than 5)
                                        const rightStats = allStats.slice(4, 8);
                                        
                                        // Return empty view if no stats to maintain layout
                                        if (rightStats.length === 0) {
                                            return <View key="empty-right" style={{ minHeight: 20 }} />;
                                        }
                                        
                                        return rightStats.map((stat) => {
                                            const statIcon = stat.icon;
                                            // For attack range (string value), display as-is; otherwise format normally
                                            const formattedValue = typeof stat.value === 'string' 
                                                ? stat.value 
                                                : formatStatValue(stat.key, stat.value as number);
                                            
                                            return (
                                                <View key={stat.key} style={styles.statRowSide}>
                                                    {statIcon ? (
                                                        <Image source={statIcon} style={styles.statIcon} resizeMode="contain" />
                                                    ) : (
                                                        <View style={styles.statIcon} />
                                                    )}
                                                    <LRText weight="bold" style={styles.statValue}>
                                                        {formattedValue}
                                                    </LRText>
                                                </View>
                                            );
                                        });
                                    })()}
                                </View>
                            </View>

                            {/* Delimiter dot below image */}
                            <View style={styles.delimiterContainer}>
                                <Image
                                    source={require('@/assets/images/equipment/horizontal_delimiter_dot.png')}
                                    resizeMode="contain"
                                    style={styles.delimiterDot}
                                />
                            </View>

                            {/* Item Description */}
                            <View style={styles.descriptionSection}>
                                <LRText weight="regular" style={styles.descriptionText}>
                                    {item?.template?.description || 'A well-crafted item with mysterious properties.'}
                                </LRText>
                            </View>

                            {/* Delimiter below stats */}
                            <View style={styles.delimiterContainer}>
                                <Image
                                    source={require('@/assets/images/equipment/horizontal_delimiter.png')}
                                    resizeMode="contain"
                                    style={styles.delimiter}
                                />
                            </View>

                            {/* Flavor text (if available) */}
                            {item?.template?.description && (
                                <View style={styles.flavorSection}>
                                    <LRText weight="regular" style={styles.flavorText}>
                                        {item.template.description}
                                    </LRText>
                                </View>
                            )}

                            {/* Action Buttons */}
                            <View style={styles.actionsSection}>
                                {/* Hand Selection for Weapons and Rings - always rendered but invisible for other items */}
                                <View style={[styles.handSelectionContainer, !showHandSelection && styles.handSelectionHidden]}>
                                    <LRText weight="bold" style={styles.handSelectionLabel}>
                                        Select Hand:
                                    </LRText>
                                    <View style={styles.handSelectionButtons}>
                                        <Pressable
                                            onPress={() => showHandSelection && setSelectedHand('left')}
                                            disabled={!showHandSelection}
                                            style={[
                                                styles.handButton,
                                                selectedHand === 'left' && styles.handButtonSelected
                                            ]}
                                        >
                                            <LRText weight="bold" style={[
                                                styles.handButtonText,
                                                selectedHand === 'left' && styles.handButtonTextSelected
                                            ]}>
                                                {isWeapon ? 'OFF HAND' : 'LEFT'}
                                            </LRText>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => showHandSelection && setSelectedHand('right')}
                                            disabled={!showHandSelection}
                                            style={[
                                                styles.handButton,
                                                selectedHand === 'right' && styles.handButtonSelected
                                            ]}
                                        >
                                            <LRText weight="bold" style={[
                                                styles.handButtonText,
                                                selectedHand === 'right' && styles.handButtonTextSelected
                                            ]}>
                                                {isWeapon ? 'MAIN HAND' : 'RIGHT'}
                                            </LRText>
                                        </Pressable>
                                    </View>
                                </View>
                                
                                <AppButton
                                    size="sm"
                                    onPress={() => handleEquipUnequip(selectedHand || undefined)}
                                    disabled={equipLoading || (showHandSelection && !selectedHand)}
                                >
                                    {equipLoading ? '...' : isEquipped ? 'UNEQUIP' : 'EQUIP'}
                                </AppButton>
                            </View>
                            </ScrollView>
                        </View>
                    )}
                </ImageBackground>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    modalContainer: {
        width: Math.min(SCREEN_WIDTH * 0.9, 400),
        minHeight: 400,
        maxHeight: SCREEN_HEIGHT * 0.9,
        alignSelf: 'center',
    },
    modalBackground: {
        width: '100%',
        height: '100%',
    },
    modalContent: {
        flex: 1,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 24,
        right: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    closeButtonText: {
        color: '#d4a574',
        fontSize: 18,
        lineHeight: 20,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingTop: 12,
        alignItems: 'center',
        paddingBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 4,
        marginBottom: 8,
        width: '100%',
    },
    infoText: {
        fontSize: 12,
        color: '#1a0f05', // ~15% darker than #2a1a0a
    },
    delimiterContainer: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 6,
    },
    delimiterDot: {
        width: '80%',
        height: 20,
    },
    delimiter: {
        width: '80%',
        height: 20,
    },
    itemWithStatsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 3,
        width: '100%',
        minHeight: 100,
    },
    statsSideColumn: {
        width: '25%', // Fixed width percentage to ensure equal columns
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    statRowSide: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
        width: '100%',
        minHeight: 20,
    },
    statIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    statValue: {
        fontSize: 12,
        color: '#1a0f05',
        fontWeight: 'bold',
        minWidth: 40,
        textAlign: 'left',
    },
    largeImageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 100,
        height: 100,
        marginHorizontal: 8,
        flexShrink: 0, // Prevent image container from shrinking
    },
    descriptionSection: {
        marginVertical: 2,
        paddingVertical: 2,
        backgroundColor: 'rgba(139, 115, 85, 0.1)',
        borderRadius: 4,
        width: '100%',
    },
    descriptionText: {
        fontSize: 11,
        color: '#5a4a3a',
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 16,
    },
    paperBorder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    largeImageWrapper: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
    },
    largeImage: {
        width: '100%',
        height: '100%',
    },
    itemNameContainer: {
        width: '100%',
        height: 56, // Fixed height to accommodate 2 lines (24px font + 28px line height)
        marginBottom: 2,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemNameContainerOneLine: {
        marginTop: 8, // Less margin when title is on 1 line
    },
    itemNameContainerTwoLines: {
        marginTop: 16, // More margin when title is on 2 lines
    },
    itemName: {
        fontSize: 24,
        color: '#2a1a0a',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 4,
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        lineHeight: 28, // Line height for 2-line text
    },
    rarity: {
        fontSize: 16,
        marginBottom: 6,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    statsSection: {
        marginVertical: 4,
        width: '100%',
        alignItems: 'center',
    },
    statsTwoColumn: {
        flexDirection: 'row',
        width: '80%',
    },
    statsColumn: {
        flex: 1,
        paddingHorizontal: 4,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 2,
    },
    statLabel: {
        fontSize: 13,
        color: '#2a1a0a',
    },
    bonusesSection: {
        marginVertical: 8,
        paddingHorizontal: 8,
    },
    bonusText: {
        fontSize: 12,
        color: '#2a1a0a',
        marginVertical: 2,
    },
    flavorSection: {
        marginVertical: 4,
        paddingVertical: 4,
        backgroundColor: 'rgba(139, 115, 85, 0.1)',
        borderRadius: 4,
        width: '100%',
    },
    flavorText: {
        fontSize: 11,
        color: '#5a4a3a',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    actionsSection: {
        marginVertical: 8,
        gap: 6,
        width: '100%',
        alignItems: 'center',
    },
    handSelectionContainer: {
        marginBottom: 12,
        alignItems: 'center',
        width: '100%',
    },
    handSelectionHidden: {
        opacity: 0,
        pointerEvents: 'none',
    },
    handSelectionLabel: {
        fontSize: 12,
        color: '#2a1a0a',
        marginBottom: 8,
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    handSelectionButtons: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
    },
    handButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#8b5a3c',
        backgroundColor: 'rgba(139, 90, 60, 0.2)',
        minWidth: 80,
        alignItems: 'center',
    },
    handButtonSelected: {
        backgroundColor: '#8b5a3c',
        borderColor: '#6b4530',
    },
    handButtonText: {
        fontSize: 12,
        color: '#5a4a3a',
    },
    handButtonTextSelected: {
        color: '#ffffff',
    },
});

export default ItemInfoModal;
