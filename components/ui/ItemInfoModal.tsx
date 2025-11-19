import { getItemIcon } from '@/utils/getItemIcon';
import React from 'react';
import { ActivityIndicator, Dimensions, Image, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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

type ItemDetails = {
    id: string;
    slot: string;
    rarity: string;
    equipped: boolean;
    durability: number;
    socketedRunes: any | null;
    bonuses: any | null;
    createdAt: string;
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
};

const ItemInfoModal: React.FC<Props> = ({ item, loading = false, onClose }) => {
    if (!item && !loading) return null;

    const itemCode = item?.template?.code;
    const itemIcon = getItemIcon(itemCode);
    const rarity = item?.rarity || item?.template?.rarity || 'worn';
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
                                {/* Item name - top centered */}
                                <LRText weight="black" style={styles.itemName}>
                                    {item?.template?.name || 'Unknown Item'}
                                </LRText>

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
                                        // Get attackType from baseStats
                                        const attackType = item?.template?.baseStats?.attackType || item?.template?.baseStats?.attacktype;
                                        
                                        // For weapons, show "Weapon • Slash" format (case-insensitive slot check)
                                        if (slot?.toLowerCase() === 'weapon' && attackType) {
                                            const mappedType = ATTACK_TYPE_MAP[attackType.toLowerCase()] || attackType.toLowerCase();
                                            const capitalizedType = mappedType.charAt(0).toUpperCase() + mappedType.slice(1);
                                            return `Weapon • ${capitalizedType}`;
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
                                        const allStats: Array<{ key: string; value: string | number; icon: any | null }> = [];
                                        const slot = item?.slot || item?.template?.slot;
                                        
                                        // Base Stats (excluding level, power, and attackType)
                                        if (item?.template?.baseStats) {
                                            Object.entries(item.template.baseStats).forEach(([key, value]) => {
                                                if (key === 'level' || key === 'power') return;
                                                // Don't show attackType in stats (it's shown at the top for weapons)
                                                if (key.toLowerCase() === 'attacktype') return;
                                                
                                                const normalizedKey = key.toLowerCase();
                                                const icon = getStatIcon(normalizedKey);
                                                allStats.push({ key, value: value as number, icon });
                                            });
                                        }
                                        
                                        // Bonuses from item.bonuses
                                        if (item?.bonuses && typeof item.bonuses === 'object') {
                                            Object.entries(item.bonuses).forEach(([key, value]) => {
                                                const normalizedKey = key.toLowerCase();
                                                const icon = getStatIcon(normalizedKey);
                                                allStats.push({ key: `bonus_${key}`, value: value as number, icon });
                                            });
                                        }
                                        
                                        // Left column: first 4 stats
                                        const leftStats = allStats.slice(0, 4);
                                        
                                        return leftStats.map((stat) => {
                                            const statIcon = stat.icon;
                                            const formattedValue = formatStatValue(stat.key, stat.value as number);
                                            
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
                                        const allStats: Array<{ key: string; value: string | number; icon: any | null }> = [];
                                        const slot = item?.slot || item?.template?.slot;
                                        
                                        // Base Stats (excluding level, power, and attackType)
                                        if (item?.template?.baseStats) {
                                            Object.entries(item.template.baseStats).forEach(([key, value]) => {
                                                if (key === 'level' || key === 'power') return;
                                                // Don't show attackType in stats (it's shown at the top for weapons)
                                                if (key.toLowerCase() === 'attacktype') return;
                                                
                                                const normalizedKey = key.toLowerCase();
                                                const icon = getStatIcon(normalizedKey);
                                                allStats.push({ key, value: value as number, icon });
                                            });
                                        }
                                        
                                        // Bonuses from item.bonuses
                                        if (item?.bonuses && typeof item.bonuses === 'object') {
                                            Object.entries(item.bonuses).forEach(([key, value]) => {
                                                const normalizedKey = key.toLowerCase();
                                                const icon = getStatIcon(normalizedKey);
                                                allStats.push({ key: `bonus_${key}`, value: value as number, icon });
                                            });
                                        }
                                        
                                        // Right column: stats 5-8 (or empty if less than 5)
                                        const rightStats = allStats.slice(4, 8);
                                        
                                        return rightStats.map((stat) => {
                                            const statIcon = stat.icon;
                                            const formattedValue = formatStatValue(stat.key, stat.value as number);
                                            
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
                                <AppButton
                                    size="sm"
                                    onPress={() => {
                                        // TODO: Implement equip functionality
                                        console.log('Equip item:', item?.id);
                                    }}
                                >
                                    EQUIP
                                </AppButton>
                                <View style={styles.secondaryActions}>
                                    <AppButton
                                        size="xs"
                                        onPress={() => {
                                            // TODO: Implement upgrade functionality
                                            console.log('Upgrade item:', item?.id);
                                        }}
                                    >
                                        UPGRADE
                                    </AppButton>
                                    <AppButton
                                        size="xs"
                                        onPress={() => {
                                            // TODO: Implement scrap functionality
                                            console.log('Scrap item:', item?.id);
                                        }}
                                    >
                                        SCRAP
                                    </AppButton>
                                </View>
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
        right: 24,
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
        padding: 12,
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
        paddingHorizontal: 8,
    },
    statsSideColumn: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingHorizontal: 8,
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
    },
    descriptionSection: {
        marginVertical: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(139, 115, 85, 0.1)',
        borderRadius: 4,
        width: '80%',
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
    itemName: {
        fontSize: 24,
        color: '#2a1a0a',
        marginTop: 8,
        marginBottom: 2,
        textAlign: 'center',
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
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
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(139, 115, 85, 0.1)',
        borderRadius: 4,
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
    secondaryActions: {
        flexDirection: 'row',
        gap: 6,
        justifyContent: 'center',
    },
});

export default ItemInfoModal;
