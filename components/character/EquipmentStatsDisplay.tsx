import React, { useState } from 'react';
import { Dimensions, Image, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import LRText from '../ui/LRText';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Stat icon mapping (same as ItemInfoModal)
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

// Helper to get stat icon
const getStatIcon = (statKey: string): any | null => {
    const normalizedKey = statKey.toLowerCase();
    return STAT_ICONS[normalizedKey] || null;
};

// Helper to format percentage value (converts decimal to percentage)
const formatPercentage = (value: number): string => {
    const percentage = Math.round(value * 100);
    return `${percentage}%`;
};

// Helper to format flat number (for elemental damage)
const formatFlatNumber = (value: number): string => {
    return value.toString();
};

// Helper to format crit multiplier (1.5 -> 150% or 1.5x)
const formatCritMultiplier = (value: number): string => {
    const percentage = Math.round(value * 100);
    return `${percentage}%`;
};

// Helper to format damage range
const formatDamageRange = (min: number, max: number): string => {
    return `${min}-${max}`;
};

type Props = {
    stats: Record<string, number> | null | undefined;
    level?: number;
};

export const EquipmentStatsDisplay: React.FC<Props> = ({ stats, level }) => {
    const [showModal, setShowModal] = useState(false);
    
    // Extract all stats from derivedStats
    const health = stats?.health || 0;
    const armor = stats?.armor || 0;
    const strength = stats?.strength || 0;
    const dexterity = stats?.dexterity || 0;
    const intelligence = stats?.intelligence || 0;
    const physicalDamageMin = stats?.physicalDamageMin || 0;
    const physicalDamageMax = stats?.physicalDamageMax || 0;
    const totalDamageMin = stats?.totalDamageMin || 0;
    const totalDamageMax = stats?.totalDamageMax || 0;
    const critChance = stats?.critChance || 0;
    const critMultiplier = stats?.critMultiplier || 0;
    const dodgeChance = stats?.dodgeChance || 0;
    const blockChance = stats?.blockChance || 0;
    const physicalReduction = stats?.physicalReduction || 0;
    const fireDamage = stats?.fireDamage || 0;
    const lightningDamage = stats?.lightningDamage || 0;
    const poisonDamage = stats?.poisonDamage || 0;
    const burnChance = stats?.burnChance || 0;
    const poisonChance = stats?.poisonChance || 0;
    const stunChance = stats?.stunChance || 0;
    const power = stats?.power || 0;
    
    // Calculate attack rating (using totalDamageMax as shown in reference)
    const attackRating = totalDamageMax;
    
    const healthIcon = getStatIcon('health');
    const armorIcon = getStatIcon('armor');
    
    return (
        <>
            {/* Stats Display - positioned between arch and character */}
            <View style={styles.container}>
                {/* Health */}
                {healthIcon && (
                    <View style={styles.statRow}>
                        <Image source={healthIcon} style={styles.statIcon} resizeMode="contain" />
                        <LRText weight="bold" style={styles.statValue}>{health}</LRText>
                    </View>
                )}
                
                {/* Armor */}
                {armorIcon && (
                    <View style={styles.statRow}>
                        <Image source={armorIcon} style={styles.statIcon} resizeMode="contain" />
                        <LRText weight="bold" style={styles.statValue}>{armor}</LRText>
                    </View>
                )}
                
                {/* Cog Button */}
                <Pressable
                    onPress={() => setShowModal(true)}
                    style={styles.cogButton}
                    accessibilityLabel="View all stats"
                >
                    <LRText style={styles.cogIcon}>⚙</LRText>
                </Pressable>
            </View>
            
            {/* Stats Modal - same style as ItemInfoModal */}
            <Modal
                visible={showModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowModal(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowModal(false)}
                >
                    <Pressable
                        style={styles.modalContent}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <ImageBackground
                            source={require('@/assets/images/equipment/item_modal.png')}
                            resizeMode="contain"
                            style={styles.modalBackground}
                            imageStyle={styles.modalBackgroundImage}
                        >
                            {/* Close button - positioned absolutely like ItemInfoModal */}
                            <Pressable
                                onPress={() => setShowModal(false)}
                                style={styles.closeButton}
                            >
                                <LRText weight="black" style={styles.closeButtonText}>✕</LRText>
                            </Pressable>
                            
                            <View style={styles.modalContentInner}>
                                {/* Title - centered */}
                                <View style={styles.titleContainer}>
                                    <LRText weight="black" style={styles.modalTitle}>CHARACTER STATS</LRText>
                                </View>
                                
                                {/* Core Attributes Section */}
                                <View style={styles.sectionContainer}>
                                    <View style={styles.sectionTitleContainer}>
                                        <Image
                                            source={require('@/assets/images/equipment/horizontal_delimiter.png')}
                                            resizeMode="contain"
                                            style={styles.delimiterSide}
                                        />
                                        <LRText weight="regular" style={styles.sectionTitle}>
                                            CORE ATTRIBUTES
                                        </LRText>
                                        <Image
                                            source={require('@/assets/images/equipment/horizontal_delimiter.png')}
                                            resizeMode="contain"
                                            style={styles.delimiterSide}
                                        />
                                    </View>
                                    
                                    {/* Two-column layout */}
                                    <View style={styles.columnsContainer}>
                                        {/* Column 1: Strength, Dexterity, Intelligence */}
                                        <View style={styles.column}>
                                            <View style={styles.modalStatRow}>
                                                {getStatIcon('strength') && (
                                                    <Image source={getStatIcon('strength')} style={styles.modalStatIcon} resizeMode="contain" />
                                                )}
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    STRENGTH{' '}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {strength}
                                                </LRText>
                                            </View>
                                            <View style={styles.modalStatRow}>
                                                {getStatIcon('dexterity') && (
                                                    <Image source={getStatIcon('dexterity')} style={styles.modalStatIcon} resizeMode="contain" />
                                                )}
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    DEXTERITY{' '}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {dexterity}
                                                </LRText>
                                            </View>
                                            <View style={styles.modalStatRow}>
                                                {getStatIcon('intelligence') && (
                                                    <Image source={getStatIcon('intelligence')} style={styles.modalStatIcon} resizeMode="contain" />
                                                )}
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    INTELLIGENCE{' '}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {intelligence}
                                                </LRText>
                                            </View>
                                        </View>
                                        
                                        {/* Column 2: Item Power, Level */}
                                        <View style={styles.column}>
                                            <View style={styles.modalStatRow}>
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    ITEM POWER{' '}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {power}
                                                </LRText>
                                            </View>
                                            {level !== undefined && (
                                                <View style={styles.modalStatRow}>
                                                    <LRText weight="regular" style={styles.modalStatLabel}>
                                                        LEVEL{' '}
                                                    </LRText>
                                                    <LRText weight="bold" style={styles.modalStatValue}>
                                                        {level}
                                                    </LRText>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                                
                                {/* Offense Section */}
                                <View style={styles.sectionContainer}>
                                    <View style={styles.sectionTitleContainer}>
                                        <Image
                                            source={require('@/assets/images/equipment/horizontal_delimiter.png')}
                                            resizeMode="contain"
                                            style={styles.delimiterSide}
                                        />
                                        <LRText weight="regular" style={styles.sectionTitle}>
                                            OFFENSE
                                        </LRText>
                                        <Image
                                            source={require('@/assets/images/equipment/horizontal_delimiter.png')}
                                            resizeMode="contain"
                                            style={styles.delimiterSide}
                                        />
                                    </View>
                                    
                                    {/* Two-column layout */}
                                    <View style={styles.columnsContainer}>
                                        {/* Column 1: Physical Attack, Total Attack */}
                                        <View style={styles.column}>
                                            <View style={styles.modalStatRow}>
                                                {getStatIcon('attack') && (
                                                    <Image source={getStatIcon('attack')} style={styles.modalStatIcon} resizeMode="contain" />
                                                )}
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    PHYSICAL{' '}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {formatDamageRange(physicalDamageMin, physicalDamageMax)}
                                                </LRText>
                                            </View>
                                            <View style={styles.modalStatRow}>
                                                {getStatIcon('attack') && (
                                                    <Image source={getStatIcon('attack')} style={styles.modalStatIcon} resizeMode="contain" />
                                                )}
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    TOTAL{' '}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {formatDamageRange(totalDamageMin, totalDamageMax)}
                                                </LRText>
                                            </View>
                                        </View>
                                        
                                        {/* Column 2: Crit Chance, Crit Damage */}
                                        <View style={styles.column}>
                                            <View style={styles.modalStatRow}>
                                                {getStatIcon('critical') && (
                                                    <Image source={getStatIcon('critical')} style={styles.modalStatIcon} resizeMode="contain" />
                                                )}
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    CRIT STRIKE{' '}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {formatPercentage(critChance)}
                                                </LRText>
                                            </View>
                                            <View style={styles.modalStatRow}>
                                                {getStatIcon('critical') && (
                                                    <Image source={getStatIcon('critical')} style={styles.modalStatIcon} resizeMode="contain" />
                                                )}
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    CRIT DAMAGE{' '}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {formatCritMultiplier(critMultiplier)}
                                                </LRText>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                
                                {/* Defense Section */}
                                <View style={styles.sectionContainer}>
                                    <View style={styles.sectionTitleContainer}>
                                        <Image
                                            source={require('@/assets/images/equipment/horizontal_delimiter.png')}
                                            resizeMode="contain"
                                            style={styles.delimiterSide}
                                        />
                                        <LRText weight="regular" style={styles.sectionTitle}>
                                            DEFENSE
                                        </LRText>
                                        <Image
                                            source={require('@/assets/images/equipment/horizontal_delimiter.png')}
                                            resizeMode="contain"
                                            style={styles.delimiterSide}
                                        />
                                    </View>
                                    
                                    {/* Two-column layout */}
                                    <View style={styles.columnsContainer}>
                                        {/* Column 1: Health, Armor */}
                                        <View style={styles.column}>
                                            <View style={styles.modalStatRow}>
                                                {healthIcon && (
                                                    <Image source={healthIcon} style={styles.modalStatIcon} resizeMode="contain" />
                                                )}
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    HEALTH{' '}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {health}
                                                </LRText>
                                            </View>
                                            <View style={styles.modalStatRow}>
                                                {armorIcon && (
                                                    <Image source={armorIcon} style={styles.modalStatIcon} resizeMode="contain" />
                                                )}
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    ARMOR{' '}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {armor}
                                                </LRText>
                                            </View>
                                        </View>
                                        
                                        {/* Column 2: Dodge, Block */}
                                        <View style={styles.column}>
                                            <View style={styles.modalStatRow}>
                                                {getStatIcon('dodge') && (
                                                    <Image source={getStatIcon('dodge')} style={styles.modalStatIcon} resizeMode="contain" />
                                                )}
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    DODGE{' '}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {formatPercentage(dodgeChance)}
                                                </LRText>
                                            </View>
                                            <View style={styles.modalStatRow}>
                                                {getStatIcon('block') && (
                                                    <Image source={getStatIcon('block')} style={styles.modalStatIcon} resizeMode="contain" />
                                                )}
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    BLOCK{' '}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {formatPercentage(blockChance)}
                                                </LRText>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                
                                {/* Elemental Affinity Section */}
                                <View style={styles.sectionContainer}>
                                    <View style={styles.sectionTitleContainer}>
                                        <Image
                                            source={require('@/assets/images/equipment/horizontal_delimiter.png')}
                                            resizeMode="contain"
                                            style={styles.delimiterSide}
                                        />
                                        <LRText weight="regular" style={styles.sectionTitle}>
                                            ELEMENTAL AFFINITY
                                        </LRText>
                                        <Image
                                            source={require('@/assets/images/equipment/horizontal_delimiter.png')}
                                            resizeMode="contain"
                                            style={styles.delimiterSide}
                                        />
                                    </View>
                                    
                                    {/* Two-column layout */}
                                    <View style={styles.columnsContainer}>
                                        {/* Column 1: Elemental Damage */}
                                        <View style={styles.column}>
                                            <View style={styles.modalStatRow}>
                                                {getStatIcon('fire') && (
                                                    <Image source={getStatIcon('fire')} style={styles.modalStatIconSmall} resizeMode="contain" />
                                                )}
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    FIRE DAMAGE{' '}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {formatFlatNumber(fireDamage)}
                                                </LRText>
                                            </View>
                                            <View style={styles.modalStatRow}>
                                                {getStatIcon('lightning') && (
                                                    <Image source={getStatIcon('lightning')} style={styles.modalStatIconSmall} resizeMode="contain" />
                                                )}
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    LIGHTNING DAMAGE{' '}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {formatFlatNumber(lightningDamage)}
                                                </LRText>
                                            </View>
                                            <View style={styles.modalStatRow}>
                                                {getStatIcon('poison') && (
                                                    <Image source={getStatIcon('poison')} style={styles.modalStatIconSmall} resizeMode="contain" />
                                                )}
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    POISON DAMAGE{' '}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {formatFlatNumber(poisonDamage)}
                                                </LRText>
                                            </View>
                                        </View>
                                        
                                        {/* Column 2: Elemental Chances */}
                                        <View style={styles.column}>
                                            <View style={styles.modalStatRow}>
                                                {getStatIcon('fire') && (
                                                    <Image source={getStatIcon('fire')} style={styles.modalStatIconSmall} resizeMode="contain" />
                                                )}
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    BURN CHANCE{' '}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {formatPercentage(burnChance)}
                                                </LRText>
                                            </View>
                                            <View style={styles.modalStatRow}>
                                                {getStatIcon('poison') && (
                                                    <Image source={getStatIcon('poison')} style={styles.modalStatIconSmall} resizeMode="contain" />
                                                )}
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    POISON CHANCE{' '}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {formatPercentage(poisonChance)}
                                                </LRText>
                                            </View>
                                            <View style={styles.modalStatRow}>
                                                {getStatIcon('lightning') && (
                                                    <Image source={getStatIcon('lightning')} style={styles.modalStatIconSmall} resizeMode="contain" />
                                                )}
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    STUN CHANCE{' '}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {formatPercentage(stunChance)}
                                                </LRText>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </ImageBackground>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 75, // Distance from arch border (left side)
        top: '50%',
        marginTop: -50, // Center vertically (adjust based on total height)
        alignItems: 'center',
        gap: 8,
        zIndex: 100, // High z-index to appear above character
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 7,
        paddingVertical: 5,
    },
    statIcon: {
        width: 18,
        height: 18,
    },
    statValue: {
        fontSize: 14,
        color: 'rgb(237, 220, 208)',
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    cogButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'rgb(153, 128, 110)',
        backgroundColor: 'rgba(237, 220, 208, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3, // Android shadow
    },
    cogIcon: {
        fontSize: 16,
        color: 'rgb(237, 220, 208)',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxWidth: 400,
        maxHeight: '80%',
        borderRadius: 24,
        overflow: 'hidden',
    },
    modalBackground: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    modalBackgroundImage: {
        resizeMode: 'contain',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
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
    modalContentInner: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 20,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 4,
    },
    modalTitle: {
        fontSize: 22,
        color: '#2a1a0a',
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    sectionContainer: {
        marginBottom: 8,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        marginTop: 4,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 12,
        color: '#2a1a0a',
        textAlign: 'center',
    },
    delimiterSide: {
        width: 60,
        height: 12,
        flex: 1,
    },
    columnsContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 2,
    },
    column: {
        flex: 1,
        gap: 4,
    },
    modalStatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 2,
        paddingHorizontal: 4,
        minHeight: 22,
    },
    modalStatIcon: {
        width: 20,
        height: 20,
    },
    modalStatIconSmall: {
        width: 16,
        height: 16,
    },
    modalStatInfo: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    modalStatLabel: {
        fontSize: 12,
        color: '#2a1a0a',
        opacity: 0.7,
    },
    modalStatValue: {
        fontSize: 12,
        color: '#2a1a0a',
        fontWeight: 'bold',
    },
    modalStatSubtext: {
        fontSize: 11,
        color: '#5a4a3a',
        fontStyle: 'italic',
        marginTop: 2,
    },
});

