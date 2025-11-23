import React, { useState } from 'react';
import { Dimensions, Image, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import LRText from '../ui/LRText';
import RarityGradientBackground from '../ui/RarityGradientBackground';

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
    poison: require('@/assets/images/equipment/stats_icons/poison.png'),
    strength: require('@/assets/images/equipment/stats_icons/strength.png'),
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
    const normalizedKey = key.toLowerCase();
    if (PERCENTAGE_STATS.includes(normalizedKey)) {
        // If value is already a percentage (0-100), use as is, otherwise convert from decimal
        const percentage = value > 1 ? value : Math.round(value * 100);
        return `${percentage}%`;
    }
    return value.toString();
};

type Props = {
    stats: Record<string, number> | null | undefined;
};

export const EquipmentStatsDisplay: React.FC<Props> = ({ stats }) => {
    const [showModal, setShowModal] = useState(false);
    
    // Debug: Log stats to see what we're receiving
    React.useEffect(() => {
        console.log('[EquipmentStatsDisplay] Stats received:', stats);
        console.log('[EquipmentStatsDisplay] Stats type:', typeof stats);
        console.log('[EquipmentStatsDisplay] Stats keys:', stats ? Object.keys(stats) : 'null');
    }, [stats]);
    
    // Get health and attack from derivedStats
    const health = stats?.health || stats?.Health || 0;
    const attack = stats?.attack || stats?.Attack || 0;
    
    const healthIcon = getStatIcon('health');
    const attackIcon = getStatIcon('attack');
    
    // Get all stats for the modal, sorted with health and attack first
    const allStats = Object.entries(stats || {})
        .filter(([key]) => {
            const normalizedKey = key.toLowerCase();
            return normalizedKey !== 'level' && normalizedKey !== 'power';
        })
        .map(([key, value]) => ({
            key,
            value: value as number,
            icon: getStatIcon(key),
        }))
        .sort((a, b) => {
            // Sort: health and attack first, then alphabetically
            if (a.key.toLowerCase() === 'health') return -1;
            if (b.key.toLowerCase() === 'health') return 1;
            if (a.key.toLowerCase() === 'attack') return -1;
            if (b.key.toLowerCase() === 'attack') return 1;
            return a.key.localeCompare(b.key);
        });
    
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
                
                {/* Attack */}
                {attackIcon && (
                    <View style={styles.statRow}>
                        <Image source={attackIcon} style={styles.statIcon} resizeMode="contain" />
                        <LRText weight="bold" style={styles.statValue}>{attack}</LRText>
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
                            <View style={styles.modalHeader}>
                                <LRText weight="bold" style={styles.modalTitle}>Character Stats</LRText>
                                <Pressable
                                    onPress={() => setShowModal(false)}
                                    style={styles.closeButton}
                                >
                                    <LRText style={styles.closeButtonText}>✕</LRText>
                                </Pressable>
                            </View>
                            
                            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                                <View style={styles.statsContainer}>
                                    {allStats.map((stat) => (
                                        <View key={stat.key} style={styles.modalStatRow}>
                                            {stat.icon && (
                                                <Image source={stat.icon} style={styles.modalStatIcon} resizeMode="contain" />
                                            )}
                                            <View style={styles.modalStatInfo}>
                                                <LRText weight="regular" style={styles.modalStatLabel}>
                                                    {stat.key.charAt(0).toUpperCase() + stat.key.slice(1)}
                                                </LRText>
                                                <LRText weight="bold" style={styles.modalStatValue}>
                                                    {formatStatValue(stat.key, stat.value)}
                                                </LRText>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
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
        borderWidth: 2,
        borderColor: '#1c1917',
    },
    modalBackground: {
        width: '100%',
        height: '100%',
    },
    modalBackgroundImage: {
        resizeMode: 'contain',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#1c1917',
    },
    modalTitle: {
        fontSize: 20,
        color: '#1c1917',
    },
    closeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#1c1917',
        fontWeight: 'bold',
    },
    modalScrollView: {
        maxHeight: 400,
    },
    statsContainer: {
        padding: 16,
        gap: 12,
    },
    modalStatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1c1917',
    },
    modalStatIcon: {
        width: 28,
        height: 28,
    },
    modalStatInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalStatLabel: {
        fontSize: 15,
        color: '#1c1917',
    },
    modalStatValue: {
        fontSize: 17,
        color: '#1c1917',
    },
});

