import AppButton from '@/components/ui/AppButton';
import LRText from '@/components/ui/LRText';
import RarityGradientBackground from '@/components/ui/RarityGradientBackground';
import SlotChip from '@/components/ui/SlotChip';
import { breakItem, getBreakReward, getUpgradeCost, getUpgradeStats, upgradeItem } from '@/services/forgeService';
import { getPlayerInventory } from '@/services/playerService';
import { getItemIcon } from '@/utils/getItemIcon';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    ImageBackground,
    Pressable,
    ScrollView,
    useWindowDimensions,
    View
} from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

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
    lightning: require('@/assets/images/equipment/stats_icons/lightning.png'),
    poison: require('@/assets/images/equipment/stats_icons/poison.png'),
    strength: require('@/assets/images/equipment/stats_icons/strength.png'),
};

const PERCENTAGE_STATS = ['critical', 'block', 'dodge'];

// Helper to get stat icon
const getStatIcon = (statKey: string): any | null => {
    const normalizedKey = statKey.toLowerCase();
    return STAT_ICONS[normalizedKey] || null;
};

// Helper to format currency (same as TopBar)
const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
};

// Helper to process bonuses (extracted from ItemInfoModal logic)
const processBonuses = (bonuses: any): Array<{ key: string; value: string | number; icon: any | null }> => {
    const allStats: Array<{ key: string; value: string | number; icon: any | null }> = [];
    
    if (!bonuses || typeof bonuses !== 'object') {
        return allStats;
    }
    
    const isNestedStructure = bonuses.primary || bonuses.attributes || bonuses.elementPower || bonuses.spells || bonuses.special;
    
    if (isNestedStructure) {
        const primary = bonuses.primary || {};
        const attributes = bonuses.attributes || {};
        const elementPower = bonuses.elementPower || {};
        const special = bonuses.special || {};
        
        const minAttack = primary.minAttack;
        const maxAttack = primary.maxAttack;
        const hasAttackRange = typeof minAttack === 'number' && typeof maxAttack === 'number';
        
        if (hasAttackRange) {
            const attackIcon = getStatIcon('attack');
            allStats.unshift({ 
                key: 'attack', 
                value: `${minAttack}-${maxAttack}`, 
                icon: attackIcon 
            });
        }
        
        if (typeof primary.armor === 'number' && primary.armor !== 0) {
            const icon = getStatIcon('armor');
            allStats.push({ key: 'armor', value: primary.armor, icon });
        }
        if (typeof primary.health === 'number' && primary.health !== 0) {
            const icon = getStatIcon('health');
            allStats.push({ key: 'health', value: primary.health, icon });
        }
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (typeof value === 'number' && value !== 0) {
                const normalizedKey = key.toLowerCase();
                const icon = getStatIcon(normalizedKey);
                allStats.push({ key, value: value as number, icon });
            }
        });
        
        Object.entries(elementPower).forEach(([key, value]) => {
            if (typeof value === 'number' && value !== 0) {
                const normalizedKey = key.toLowerCase();
                const icon = getStatIcon(normalizedKey);
                allStats.push({ key, value: value as number, icon });
            }
        });
        
        const specialMapping: Record<string, string> = {
            critChance: 'critical',
            dodgeChance: 'dodge',
            blockChance: 'block',
        };
        
        Object.entries(special).forEach(([key, value]) => {
            if (typeof value === 'number' && value !== 0) {
                const mappedKey = specialMapping[key] || key;
                const icon = getStatIcon(mappedKey.toLowerCase());
                allStats.push({ key: mappedKey, value: value as number, icon });
            }
        });
    } else {
        const minAttack = bonuses.minAttack;
        const maxAttack = bonuses.maxAttack;
        const hasAttackRange = typeof minAttack === 'number' && typeof maxAttack === 'number';
        
        Object.entries(bonuses).forEach(([key, value]) => {
            if (key.toLowerCase() === 'attacktype') return;
            if (hasAttackRange && (key.toLowerCase() === 'minattack' || key.toLowerCase() === 'maxattack')) {
                return;
            }
            
            if (typeof value === 'number' && value !== 0) {
                const normalizedKey = key.toLowerCase();
                const icon = getStatIcon(normalizedKey);
                allStats.push({ key, value: value as number, icon });
            }
        });
        
        if (hasAttackRange) {
            const attackIcon = getStatIcon('attack');
            allStats.unshift({ 
                key: 'attack', 
                value: `${minAttack}-${maxAttack}`, 
                icon: attackIcon 
            });
        }
    }
    
    return allStats;
};

// Helper to format stat value
const formatStatValue = (key: string, value: number | string): string => {
    if (typeof value === 'string') return value;
    if (PERCENTAGE_STATS.includes(key.toLowerCase())) {
        const percentage = Math.round(value * 100);
        return `${percentage}%`;
    }
    return value.toString();
};

type InventoryItem = {
    id: string;
    slot: string;
    rarity: string;
    durability: number;
    template: {
        id: string;
        code: string;
        name: string;
        slot: string;
        baseStats?: Record<string, number>;
        iconUrl?: string;
        description?: string;
    };
};

const HEADER_HEIGHT = 50;
const ITEM_ROW_HEIGHT = 80;
const COLLAPSED_HEIGHT = HEADER_HEIGHT + ITEM_ROW_HEIGHT;
const MAX_GAME_WIDTH = 430;
const MAX_GAME_WIDTH_LARGE = 500;
const REF_WIDTH = 390;
const REF_HEIGHT = 844;

const INVENTORY_SPRING_CONFIG = {
    damping: 15,
    stiffness: 180,
    mass: 1.5,
};

export default function ForgeScreen() {
    const { width, height: windowHeight } = useWindowDimensions();
    const isShortScreen = windowHeight < 750;
    const isLargeScreen = width > 800;
    
    const maxWidth = isLargeScreen ? MAX_GAME_WIDTH_LARGE : MAX_GAME_WIDTH;
    const contentWidth = Math.min(width, maxWidth);
    
    const scaleX = contentWidth / REF_WIDTH;
    const scaleY = windowHeight / REF_HEIGHT;
    const rawScale = Math.min(scaleX, scaleY);
    const maxScale = 1.3;
    const forgeScale = isShortScreen 
        ? Math.max(scaleX, scaleY) * 0.95
        : Math.min(rawScale, maxScale);

    const [inventory, setInventory] = useState<InventoryItem[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [upgradeStats, setUpgradeStats] = useState<any | null>(null);
    const [upgradeCost, setUpgradeCost] = useState<number | null>(null);
    const [breakReward, setBreakReward] = useState<number | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showFullList, setShowFullList] = useState(false);
    const [headerHeight, setHeaderHeight] = useState<number>(HEADER_HEIGHT);
    const [bottomBorderHeight, setBottomBorderHeight] = useState<number>(0);
    const [actionLoading, setActionLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const inventoryHeight = useSharedValue(COLLAPSED_HEIGHT);

    // Refresh inventory
    const refreshInventory = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const invData = await getPlayerInventory();
            setInventory(invData);
        } catch (e: any) {
            setError(e?.message || 'Failed to load inventory');
        } finally {
            setLoading(false);
        }
    }, []);

    // Load initial inventory
    useEffect(() => {
        refreshInventory();
    }, []);

    // When item is selected, fetch upgrade stats and costs
    useEffect(() => {
        if (!selectedItem?.id) {
            setUpgradeStats(null);
            setUpgradeCost(null);
            setBreakReward(null);
            return;
        }

        let mounted = true;
        const fetchStats = async () => {
            setLoadingStats(true);
            try {
                const [stats, cost, reward] = await Promise.all([
                    getUpgradeStats(selectedItem.id, selectedItem.bonuses),
                    getUpgradeCost(selectedItem.id),
                    getBreakReward(selectedItem.id),
                ]);
                if (mounted) {
                    setUpgradeStats(stats);
                    setUpgradeCost(cost);
                    setBreakReward(reward);
                }
            } catch (e: any) {
                console.error('[Forge] Failed to fetch stats:', e);
            } finally {
                if (mounted) {
                    setLoadingStats(false);
                }
            }
        };

        fetchStats();
        return () => {
            mounted = false;
        };
    }, [selectedItem?.id]);

    // Animate inventory expansion
    React.useEffect(() => {
        if (isExpanded) {
            setShowFullList(true);
            if (isShortScreen) {
                const MAX_EXPANDED_HEIGHT = windowHeight * 0.65;
                inventoryHeight.value = withSpring(MAX_EXPANDED_HEIGHT, INVENTORY_SPRING_CONFIG);
            } else {
                const EXPANDED_HEIGHT = windowHeight * 0.8;
                const MAX_EXPANDED_HEIGHT = windowHeight - 180;
                const targetHeight = Math.min(EXPANDED_HEIGHT, MAX_EXPANDED_HEIGHT);
                inventoryHeight.value = withSpring(targetHeight, INVENTORY_SPRING_CONFIG);
            }
        } else {
            inventoryHeight.value = withSpring(
                COLLAPSED_HEIGHT,
                INVENTORY_SPRING_CONFIG,
                finished => {
                    'worklet';
                    if (finished) {
                        runOnJS(setShowFullList)(false);
                    }
                },
            );
        }
    }, [isExpanded, windowHeight, isShortScreen]);

    const animatedInventoryStyle = useAnimatedStyle(() => ({
        height: inventoryHeight.value,
    }));

    const animatedSideBorderStyle = useAnimatedStyle(() => {
        const availableHeight = inventoryHeight.value - headerHeight - bottomBorderHeight;
        return {
            top: headerHeight,
            height: Math.max(0, availableHeight),
        };
    });

    // Handle upgrade
    const handleUpgrade = async () => {
        if (!selectedItem?.id || !upgradeCost) return;
        
        setActionLoading(true);
        try {
            await upgradeItem(selectedItem.id);
            Alert.alert('Success', 'Item upgraded successfully!');
            setSelectedItem(null);
            await refreshInventory();
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'Failed to upgrade item');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle break
    const handleBreak = async () => {
        if (!selectedItem?.id) return;
        
        Alert.alert(
            'Break Item',
            `Are you sure you want to break this item? You will receive ${formatCurrency(breakReward || 0)} gold.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Break',
                    style: 'destructive',
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            await breakItem(selectedItem.id);
                            Alert.alert('Success', `Item broken! You received ${formatCurrency(breakReward || 0)} gold.`);
                            setSelectedItem(null);
                            await refreshInventory();
                        } catch (e: any) {
                            Alert.alert('Error', e?.message || 'Failed to break item');
                        } finally {
                            setActionLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const currentStats = selectedItem?.bonuses ? processBonuses(selectedItem.bonuses) : [];
    const nextStats = upgradeStats?.bonuses ? processBonuses(upgradeStats.bonuses) : [];

    const horizontalInset = (width - contentWidth) / 2 + 12;
    const bottomNavHeight = 72;
    const bottomMargin = 16;
    const minBottomOffset = bottomNavHeight + bottomMargin;

    // Main forge area with background - positioned at top
    const ForgeBlock = (
        <View
            style={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'flex-start',
                position: 'relative',
                marginTop: 20,
            }}
        >
            <ImageBackground
                source={require('@/assets/images/equipment/forge_background.png')}
                resizeMode="contain"
                style={{ 
                    width: '100%', 
                    height: Math.max(300 * forgeScale, 250),
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {/* Anvil image - centered, positioned at 10% from top */}
                <View
                    style={{
                        position: 'absolute',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        top: '10%', // Position anvil at 10% from top
                    }}
                >
                    <Image
                        source={require('@/assets/images/equipment/anvil.png')}
                        resizeMode="contain"
                        style={{
                            width: 200 * forgeScale,
                            height: 200 * forgeScale,
                        }}
                    />
                    
                    {/* Item slot on anvil - larger size, positioned more to the right */}
                    {selectedItem && (
                        <View
                            style={{
                                position: 'absolute',
                                top: '33%', // Vertical position on anvil
                                left: '53%', // Move more to the right (was centered at 50%)
                                alignItems: 'center',
                                justifyContent: 'center',
                                transform: [{ translateX: -30 }], // Adjust for centering the slot itself
                            }}
                        >
                            <SlotChip
                                label=""
                                item={selectedItem}
                                slotType={selectedItem?.slot || 'chest'}
                                onPress={() => setSelectedItem(null)}
                                fallback=""
                                scale={forgeScale * 1.0}
                            />
                        </View>
                    )}
                </View>
            </ImageBackground>
            
            {/* Action buttons - inside forge container, positioned to overlap anvil background */}
            {selectedItem && (
                <View
                    style={{
                        position: 'absolute',
                        bottom: -60, // Position to overlap bottom of anvil background
                        left: 0,
                        right: 0,
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        paddingHorizontal: 16,
                    }}
                >
                    {/* Scrap button on left */}
                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <AppButton
                            onPress={handleBreak}
                            disabled={actionLoading || !breakReward}
                            size="sm"
                        >
                            SCRAP
                        </AppButton>
                        {/* Reward amount below button */}
                        {breakReward && (
                            <View
                                style={{
                                    width: 70,
                                    height: 40,
                                    backgroundColor: 'rgba(83, 55, 30, 0.3)',
                                    borderRadius: 8,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginTop: 8,
                                    borderWidth: 1,
                                    borderColor: '#6b4a24',
                                    flexDirection: 'row',
                                    gap: 6,
                                    paddingHorizontal: 6,
                                }}
                            >
                                <Image
                                    source={require('@/assets/images/icons/gold_icon.png')}
                                    resizeMode="contain"
                                    style={{ width: 18, height: 18 }}
                                />
                                <LRText weight="bold" style={{ color: '#f5d9a6', fontSize: 14 }}>
                                    +{formatCurrency(breakReward)}
                                </LRText>
                            </View>
                        )}
                    </View>
                    {/* Upgrade button on right */}
                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <AppButton
                            onPress={handleUpgrade}
                            disabled={actionLoading || !upgradeCost}
                            size="sm"
                        >
                            UPGRADE
                        </AppButton>
                        {/* Cost amount below button */}
                        {upgradeCost && (
                            <View
                                style={{
                                    width: 70,
                                    height: 40,
                                    backgroundColor: 'rgba(83, 55, 30, 0.3)',
                                    borderRadius: 8,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginTop: 8,
                                    borderWidth: 1,
                                    borderColor: '#6b4a24',
                                    flexDirection: 'row',
                                    gap: 6,
                                    paddingHorizontal: 6,
                                }}
                            >
                                <Image
                                    source={require('@/assets/images/icons/gold_icon.png')}
                                    resizeMode="contain"
                                    style={{ width: 18, height: 18 }}
                                />
                                <LRText weight="bold" style={{ color: '#f5d9a6', fontSize: 14 }}>
                                    {formatCurrency(upgradeCost)}
                                </LRText>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </View>
    );



    // Inventory drawer (reused from inventory.tsx)
    const InventoryBlock = (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    left: horizontalInset,
                    right: horizontalInset,
                    bottom: minBottomOffset,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.6,
                    shadowRadius: 8,
                    elevation: 8,
                    zIndex: 2,
                },
                animatedInventoryStyle,
            ]}
        >
            <ImageBackground
                source={require('@/assets/images/dark_leather.png')}
                resizeMode="repeat"
                style={{ flex: 1, paddingBottom: 14 }}
                imageStyle={{ opacity: 1.0 }}
            >
                <Animated.Image
                    source={require('@/assets/images/equipment/inventory_side.png')}
                    resizeMode="repeat"
                    style={[
                        {
                            position: 'absolute',
                            left: 0,
                            width: 10,
                        },
                        animatedSideBorderStyle,
                    ]}
                />
                <Animated.Image
                    source={require('@/assets/images/equipment/inventory_side.png')}
                    resizeMode="repeat"
                    style={[
                        {
                            position: 'absolute',
                            right: 0,
                            width: 10,
                        },
                        animatedSideBorderStyle,
                    ]}
                />
                <Image
                    source={require('@/assets/images/equipment/inventory_bottom.png')}
                    resizeMode="stretch"
                    onLayout={e => {
                        const { height } = e.nativeEvent.layout;
                        setBottomBorderHeight(height);
                    }}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        width: '100%',
                        height: 14,
                    }}
                />
                <View
                    style={{ width: '100%' }}
                    onLayout={e => {
                        const { height } = e.nativeEvent.layout;
                        setHeaderHeight(height);
                    }}
                >
                    <ImageBackground
                        source={require('@/assets/images/equipment/inventory_head.png')}
                        resizeMode="stretch"
                        imageStyle={{ width: '100%', height: '100%' }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: '100%',
                        }}
                    />
                    <Pressable
                        onPress={() => setIsExpanded(prev => !prev)}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            minHeight: HEADER_HEIGHT,
                            position: 'relative',
                        }}
                    >
                        <View
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row',
                            }}
                        >
                            <LRText
                                weight="black"
                                style={{
                                    color: '#d4a574',
                                    fontSize: 18,
                                    textShadowColor: 'rgba(0, 0, 0, 0.8)',
                                    textShadowOffset: { width: 1, height: 1 },
                                    textShadowRadius: 3,
                                    letterSpacing: 0.5,
                                }}
                            >
                                Inventory
                            </LRText>
                            {!!inventory?.length && (
                                <LRText
                                    weight="bold"
                                    style={{
                                        marginLeft: 8,
                                        fontSize: 13,
                                        color: '#b88756',
                                        textShadowColor: 'rgba(0, 0, 0, 0.6)',
                                        textShadowOffset: { width: 1, height: 1 },
                                        textShadowRadius: 2,
                                    }}
                                >
                                    ({inventory.length})
                                </LRText>
                            )}
                        </View>
                        <View
                            style={{
                                width: 20,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: 'auto',
                                paddingRight: 16,
                            }}
                        >
                            <LRText
                                weight="bold"
                                style={{
                                    color: '#d4a574',
                                    fontSize: 14,
                                    textShadowColor: 'rgba(0, 0, 0, 0.6)',
                                    textShadowOffset: { width: 1, height: 1 },
                                    textShadowRadius: 2,
                                }}
                            >
                                {isExpanded ? '▼' : '▲'}
                            </LRText>
                        </View>
                    </Pressable>
                </View>

                <View style={{ flex: 1, paddingHorizontal: 28, paddingVertical: 8 }}>
                    {loading && (
                        <View className="py-6 items-center justify-center">
                            <ActivityIndicator color="#d4a574" />
                        </View>
                    )}
                    {!!error && (
                        <LRText
                            weight="bold"
                            style={{
                                color: '#d87070',
                                fontSize: 14,
                                textAlign: 'center',
                                textShadowColor: 'rgba(0, 0, 0, 0.8)',
                                textShadowOffset: { width: 1, height: 1 },
                                textShadowRadius: 2,
                            }}
                        >
                            {error}
                        </LRText>
                    )}

                    {!loading && !error && (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: showFullList ? 'flex-start' : 'center',
                            }}
                        >
                            {showFullList ? (
                                <FlatList
                                    data={inventory || []}
                                    keyExtractor={it => it.id}
                                    numColumns={5}
                                    scrollEnabled={true}
                                    contentContainerStyle={{
                                        paddingBottom: 20,
                                        flexGrow: 1,
                                        justifyContent:
                                            (inventory?.length || 0) === 0
                                                ? 'center'
                                                : 'flex-start',
                                    }}
                                    columnWrapperStyle={{ gap: 4 }}
                                    ListEmptyComponent={
                                        <View
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <LRText
                                                weight="regular"
                                                style={{
                                                    textAlign: 'center',
                                                    fontSize: 14,
                                                    color: '#8b7355',
                                                    opacity: 0.7,
                                                    paddingVertical: 24,
                                                    textShadowColor: 'rgba(0, 0, 0, 0.6)',
                                                    textShadowOffset: { width: 1, height: 1 },
                                                    textShadowRadius: 2,
                                                }}
                                            >
                                                No items
                                            </LRText>
                                        </View>
                                    }
                                    renderItem={({ item }) => {
                                        const itemCode = item.template?.code;
                                        const itemIcon = getItemIcon(itemCode);
                                        const rarity = item.rarity;

                                        return (
                                            <Pressable
                                                onPress={() => setSelectedItem(item)}
                                                style={{
                                                    flex: 1,
                                                    aspectRatio: 1,
                                                    maxWidth: '19%',
                                                    overflow: 'hidden',
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.3,
                                                    shadowRadius: 3,
                                                    elevation: 3,
                                                }}
                                            >
                                                <ImageBackground
                                                    source={require('@/assets/images/equipment/inventory_slot.png')}
                                                    resizeMode="stretch"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                    }}
                                                >
                                                    <RarityGradientBackground
                                                        rarity={rarity}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            padding: 10,
                                                        }}
                                                    >
                                                        {itemIcon ? (
                                                            <Image
                                                                source={itemIcon}
                                                                style={{ width: '100%', height: '100%' }}
                                                                resizeMode="contain"
                                                            />
                                                        ) : null}
                                                    </RarityGradientBackground>
                                                </ImageBackground>
                                            </Pressable>
                                        );
                                    }}
                                />
                            ) : !inventory || inventory.length === 0 ? (
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        minHeight: ITEM_ROW_HEIGHT,
                                    }}
                                >
                                    <LRText
                                        weight="regular"
                                        style={{
                                            textAlign: 'center',
                                            fontSize: 14,
                                            color: '#8b7355',
                                            opacity: 0.7,
                                            textShadowColor: 'rgba(0, 0, 0, 0.6)',
                                            textShadowOffset: { width: 1, height: 1 },
                                            textShadowRadius: 2,
                                        }}
                                    >
                                        No items
                                    </LRText>
                                </View>
                            ) : (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        gap: 4,
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        marginTop: 12,
                                    }}
                                >
                                    {inventory.slice(0, 5).map(item => {
                                        const itemCode = item.template?.code;
                                        const itemIcon = getItemIcon(itemCode);
                                        const rarity = item.rarity;
                                        const hasMoreItems = (inventory?.length || 0) > 5;
                                        const itemWidth = hasMoreItems ? '17%' : '19%';

                                        return (
                                            <Pressable
                                                key={item.id}
                                                onPress={() => setSelectedItem(item)}
                                                style={{
                                                    width: itemWidth,
                                                    aspectRatio: 1,
                                                    overflow: 'hidden',
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.3,
                                                    shadowRadius: 3,
                                                    elevation: 3,
                                                }}
                                            >
                                                <ImageBackground
                                                    source={require('@/assets/images/equipment/inventory_slot.png')}
                                                    resizeMode="stretch"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                    }}
                                                >
                                                    <RarityGradientBackground
                                                        rarity={rarity}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            padding: 10,
                                                        }}
                                                    >
                                                        {itemIcon ? (
                                                            <Image
                                                                source={itemIcon}
                                                                style={{ width: '100%', height: '100%' }}
                                                                resizeMode="contain"
                                                            />
                                                        ) : null}
                                                    </RarityGradientBackground>
                                                </ImageBackground>
                                            </Pressable>
                                        );
                                    })}
                                    {inventory && inventory.length > 5 && (
                                        <LRText
                                            weight="regular"
                                            style={{
                                                color: '#b88756',
                                                fontSize: 11,
                                                opacity: 0.8,
                                                marginLeft: 4,
                                                textShadowColor: 'rgba(0, 0, 0, 0.6)',
                                                textShadowOffset: { width: 1, height: 1 },
                                                textShadowRadius: 2,
                                            }}
                                        >
                                            +{inventory.length - 5} more
                                        </LRText>
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ImageBackground>
        </Animated.View>
    );

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ flex: 1, width: contentWidth }}>
                    <View className="px-3" style={{ flex: 1 }}>
                        {/* Forge area - scrollable on short screens */}
                        {isShortScreen ? (
                            <ScrollView
                                ref={scrollViewRef}
                                contentContainerStyle={{
                                    flexGrow: 1,
                                    paddingTop: 20,
                                    // Add padding at bottom to account for inventory drawer and action buttons
                                    paddingBottom: COLLAPSED_HEIGHT + bottomNavHeight + bottomMargin + 120,
                                }}
                                showsVerticalScrollIndicator={false}
                            >
                                {ForgeBlock}
                            </ScrollView>
                        ) : (
                            <View
                                style={{
                                    flex: 1,
                                    paddingTop: 20,
                                }}
                            >
                                {ForgeBlock}
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {InventoryBlock}
        </View>
    );
}
