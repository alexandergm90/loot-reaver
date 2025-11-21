import CharacterFullPreview from '@/components/character/CharacterFullPreview';
import ItemInfoModal from '@/components/ui/ItemInfoModal';
import LRText from '@/components/ui/LRText';
import RarityGradientBackground from '@/components/ui/RarityGradientBackground';
import SlotChip from '@/components/ui/SlotChip';
import { useEquippedFromCharacter } from '@/hooks/useEquippedFromCharacter';
import { getPlayerCharacter, getPlayerInventory, getPlayerItem } from '@/services/playerService';
import { usePlayerStore } from '@/store/playerStore';
import { getItemIcon } from '@/utils/getItemIcon';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, ImageBackground, Pressable, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

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
    };
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 50; // Header height
const ITEM_ROW_HEIGHT = 80; // Height for one row of items (including padding)
const COLLAPSED_HEIGHT = HEADER_HEIGHT + ITEM_ROW_HEIGHT; // Header + one row
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.7;

// Spring configuration for smooth, natural animations with more weight and bounce
const INVENTORY_SPRING_CONFIG = {
    damping: 15, // Lower damping = more bounce/oscillation
    stiffness: 180, // Lower stiffness = slower, more relaxed animation
    mass: 1.5, // Higher mass = more weight, slower response
};

export default function InventoryScreen() {
    const { player, setPlayer } = usePlayerStore();
    const [inventory, setInventory] = useState<InventoryItem[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [itemDetails, setItemDetails] = useState<any | null>(null);
    const [loadingItemDetails, setLoadingItemDetails] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showFullList, setShowFullList] = useState(false);
    const [equipmentBottom, setEquipmentBottom] = useState<number | null>(null);

    const { equippedItems, equipmentCodes } = useEquippedFromCharacter(player?.character);

    // Refresh function to reload character and inventory data
    const refreshData = useCallback(async (skipItemDetails = false) => {
        try {
            const [charData, invData] = await Promise.all([
                getPlayerCharacter(),
                getPlayerInventory(),
            ]);

            // Update player store with new character data
            const currentPlayer = usePlayerStore.getState().player;
            setPlayer({
                ...(currentPlayer || { id: 'unknown' }),
                hasCharacter: true,
                character: charData,
            } as any);
            setInventory(invData);

            // Refresh item details if an item is currently selected and not skipping
            if (!skipItemDetails && selectedItem?.id) {
                try {
                    const details = await getPlayerItem(selectedItem.id);
                    setItemDetails(details);
                } catch (e: any) {
                    console.error('[Inventory] Failed to refresh item details:', e);
                    // Fallback to basic item info
                    setItemDetails(selectedItem);
                }
            }
        } catch (e: any) {
            console.error('[Inventory] Failed to refresh data:', e);
            setError(e?.message || 'Failed to refresh data');
        }
    }, [selectedItem?.id, setPlayer]);

    // Handle equip/unequip changes
    const handleEquipChange = useCallback(async () => {
        // Clear selected item to prevent modal from reopening
        setSelectedItem(null);
        setItemDetails(null);
        // Skip refreshing item details since we're closing the modal
        await refreshData(true);
    }, [refreshData]);

    // Animation values - initialize with collapsed height
    const inventoryHeight = useSharedValue(COLLAPSED_HEIGHT);
    const inventoryTranslateY = useSharedValue(0);
    const overlayOpacity = useSharedValue(0);

    // Animate inventory expansion/collapse
    React.useEffect(() => {
        // Guard against expansion before equipment is measured
        if (isExpanded && equipmentBottom === null) return;

        if (isExpanded) {
            setShowFullList(true);
            // Clamp expanded height so drawer never goes off-screen
            const MAX_EXPANDED_HEIGHT = SCREEN_HEIGHT - equipmentBottom! - 16; // 16px bottom margin
            const targetHeight = Math.min(EXPANDED_HEIGHT, MAX_EXPANDED_HEIGHT);
            const heightDiff = targetHeight - COLLAPSED_HEIGHT;
            
            // Animate with spring for natural feel
            inventoryTranslateY.value = withSpring(-heightDiff, INVENTORY_SPRING_CONFIG);
            inventoryHeight.value = withSpring(targetHeight, INVENTORY_SPRING_CONFIG);
            overlayOpacity.value = withTiming(0.5, {
                duration: 500,
                easing: Easing.out(Easing.ease),
            });
        } else {
            // Collapse with spring animation
            inventoryTranslateY.value = withSpring(0, INVENTORY_SPRING_CONFIG);
            inventoryHeight.value = withSpring(
                COLLAPSED_HEIGHT,
                INVENTORY_SPRING_CONFIG,
                (finished) => {
                    'worklet';
                    if (finished) {
                        runOnJS(setShowFullList)(false);
                    }
                }
            );
            overlayOpacity.value = withTiming(0, {
                duration: 500,
                easing: Easing.in(Easing.ease),
            });
        }
    }, [isExpanded, equipmentBottom]);

    const animatedInventoryStyle = useAnimatedStyle(() => ({
        height: inventoryHeight.value,
        transform: [{ translateY: inventoryTranslateY.value }],
    }));

    const animatedOverlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }));

    // Filter out equipped items from inventory - only show unequipped items
    const unequippedItems = React.useMemo(() => {
        if (!inventory || !equippedItems) return inventory || [];
        const equippedItemIds = new Set(
            Object.values(equippedItems)
                .filter(Boolean)
                .map((item: any) => item?.id)
                .filter(Boolean)
        );
        return inventory.filter((item) => !equippedItemIds.has(item.id));
    }, [inventory, equippedItems]);

    useEffect(() => {
        let mounted = true;
        const run = async () => {
            setLoading(true);
            setError(null);
            try {
                const [charData, invData] = await Promise.all([
                    getPlayerCharacter(),
                    getPlayerInventory(),
                ]);

                if (mounted) {
                    // Merge minimal character payload into player store
                    // Use getState() to avoid closure dependency on player
                    const currentPlayer = usePlayerStore.getState().player;
                    setPlayer({
                        ...(currentPlayer || { id: 'unknown' }),
                        hasCharacter: true,
                        character: charData,
                    } as any);
                    setInventory(invData);
                }
            } catch (e: any) {
                if (mounted) setError(e?.message || 'Unexpected error');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        run();
        return () => {
            mounted = false;
        };
    }, []);

    // Fetch item details when an item is selected
    useEffect(() => {
        if (!selectedItem?.id) {
            setItemDetails(null);
            return;
        }

        let mounted = true;
        const fetchItemDetails = async () => {
            setLoadingItemDetails(true);
            try {
                const details = await getPlayerItem(selectedItem.id);
                if (mounted) {
                    setItemDetails(details);
                }
            } catch (e: any) {
                console.error('[Inventory] Failed to fetch item details:', e);
                if (mounted) {
                    // On error, still show the basic item info
                    setItemDetails(selectedItem);
                }
            } finally {
                if (mounted) {
                    setLoadingItemDetails(false);
                }
            }
        };

        fetchItemDetails();
        return () => {
            mounted = false;
        };
    }, [selectedItem?.id]);

    // Note: This duplicate logic is now handled by useEquippedFromCharacter hook
    // Keeping for backwards compatibility if needed, but should use equippedItems from hook instead

    return (
        <View style={{ flex: 1 }}>
            <View className="px-3" style={{ flex: 1, position: 'relative' }}>
                {/* Equipment + character */}
                <View
                    className="mt-5 items-center justify-center"
                    style={{ position: 'relative' }}
                    onLayout={(e) => {
                        const { y, height } = e.nativeEvent.layout;
                        // Store the bottom position of equipment container relative to parent
                        const bottom = y + height;
                        setEquipmentBottom(bottom);
                    }}
                >
                    <ImageBackground
                        source={require('@/assets/images/equipment/equipment_background.png')}
                        resizeMode="contain"
                        style={{ width: '100%', height: 390, overflow: 'hidden' }}
                    >
                    <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 100, paddingLeft: 0 }} collapsable={false}>
                        <View style={{ transform: [{ scale: 0.6 }] }}>
                            <CharacterFullPreview
                                appearance={player?.character?.appearance || null}
                                containerHeight={300}
                                equipment={equipmentCodes}
                                headScale={0.9}
                                headOffsetX={-10}
                                headOffsetY={-5}
                            />
                        </View>
                    </View>
                    </ImageBackground>
                    {/* Equipped Slots Around Character - outside ImageBackground to avoid clipping */}
                    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
                            {/* Top: Helmet (centered, higher) */}
                            <View className="absolute left-1/2 top-[-10px]" style={{ transform: [{ translateX: -30 }] }}>
                                <SlotChip label="Helmet" item={equippedItems.helmet} slotType="helmet" onPress={setSelectedItem} fallback="Helmet" />
                            </View>
                            {/* Second row: Body / Cape (lower) */}
                            <View className="absolute left-5 right-5 top-12 flex-row justify-between">
                                <SlotChip label="Cape" item={equippedItems.cape} slotType="cape" onPress={setSelectedItem} fallback="Cape" />
                                <SlotChip label="Body" item={equippedItems.body} slotType="chest" onPress={setSelectedItem} fallback="Body" />
                            </View>
                            {/* Left side (below cape): Neck / Gloves / Ring Left */}
                            <View className="absolute left-[5px] top-[120px]">
                                <View className="mb-3">
                                    <SlotChip label="Neck" item={equippedItems.neck} slotType="neck" onPress={setSelectedItem} fallback="Neck" />
                                </View>
                                <View className="mb-3">
                                    <SlotChip label="Hands" item={equippedItems.hands} slotType="glove" onPress={setSelectedItem} fallback="Hands" />
                                </View>
                                <View>
                                    <SlotChip label="Ring L" item={equippedItems.ringLeft} slotType="ring" onPress={setSelectedItem} fallback="Ring L" />
                                </View>
                            </View>
                            {/* Right side (below body): Legs / Boots / Ring Right */}
                            <View className="absolute right-[5px] top-[120px]">
                                <View className="mb-3">
                                    <SlotChip label="Legs" item={equippedItems.legs} slotType="legs" onPress={setSelectedItem} fallback="Legs" />
                                </View>
                                <View className="mb-3">
                                    <SlotChip label="Feet" item={equippedItems.feet} slotType="feet" onPress={setSelectedItem} fallback="Feet" />
                                </View>
                                <View>
                                    <SlotChip label="Ring R" item={equippedItems.ringRight} slotType="ring" onPress={setSelectedItem} fallback="Ring R" />
                                </View>
                            </View>
                            {/* Bottom center: Weapon Left / Weapon Right or Two-Handed / Shield */}
                            <View className="absolute left-1/2 bottom-2 flex-row" style={{ transform: [{ translateX: -60 }], gap: 8 }}>
                                {equippedItems.weaponTwoHanded ? (
                                    <>
                                        <SlotChip label="2H Weapon" item={equippedItems.weaponTwoHanded} slotType="weapon" onPress={setSelectedItem} fallback="2H Weapon" />
                                        <SlotChip label="Off Hand" item={null} slotType="shield" onPress={setSelectedItem} fallback="Off Hand" />
                                    </>
                                ) : (
                                    <>
                                        <SlotChip label="Weapon L" item={equippedItems.weaponLeft} slotType="weapon" onPress={setSelectedItem} fallback="Weapon L" />
                                        <SlotChip label={equippedItems.shield ? "Shield" : "Weapon R"} item={equippedItems.shield || equippedItems.weaponRight} slotType={equippedItems.shield ? "shield" : "weapon"} onPress={setSelectedItem} fallback={equippedItems.shield ? "Shield" : "Weapon R"} />
                                    </>
                                )}
                            </View>
                        </View>
                </View>

                {/* Overlay background when expanded */}
                <Animated.View
                    pointerEvents={isExpanded ? 'auto' : 'none'}
                    style={[
                        {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            zIndex: 1,
                        },
                        animatedOverlayStyle,
                    ]}
                >
                    <Pressable
                        style={{ flex: 1 }}
                        onPress={() => setIsExpanded(false)}
                    />
                </Animated.View>

                {/* Placeholder to maintain layout space when collapsed */}
                <View style={{ height: COLLAPSED_HEIGHT, marginTop: 20 }} />

                {/* Collapsible Inventory Container – positioned right after equipment */}
                {equipmentBottom !== null && (
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                top: equipmentBottom + 20,
                                left: 12, // Match px-3 padding
                                right: 12, // Match px-3 padding
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                                borderWidth: 3,
                                borderColor: '#a67c52',
                                borderBottomWidth: 3,
                                zIndex: isExpanded ? 2 : 1,
                                overflow: 'hidden',
                                // Shadow to sell the "panel over content" feeling
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: -4 },
                                shadowOpacity: 0.6,
                                shadowRadius: 8,
                                elevation: 8,
                            },
                            animatedInventoryStyle,
                        ]}
                    >
                        <ImageBackground
                            source={require('@/assets/images/dark_leather.png')}
                            resizeMode="repeat"
                            style={{ flex: 1 }}
                            imageStyle={{ opacity: 1.0 }}
                        >
                            {/* Header with expand/collapse button */}
                            <Pressable
                                onPress={() => setIsExpanded((prev) => !prev)}
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    borderBottomWidth: 2,
                                    borderBottomColor: '#8b5a3c',
                                    backgroundColor: 'rgba(26, 15, 5, 0.7)',
                                    minHeight: HEADER_HEIGHT,
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
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
                                    {!!unequippedItems?.length && (
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
                                            ({unequippedItems.length})
                                        </LRText>
                                    )}
                                </View>
                                <View style={{ width: 20, alignItems: 'center', justifyContent: 'center' }}>
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

                            {/* Content area */}
                            <View style={{ flex: 1, padding: 8, justifyContent: showFullList ? 'flex-start' : 'center' }}>
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
                            <View>
                                {showFullList ? (
                                    // Show full scrollable list when expanded
                                    <FlatList
                                        data={unequippedItems || []}
                                        keyExtractor={(it) => it.id}
                                        numColumns={5}
                                        scrollEnabled={true}
                                        contentContainerStyle={{ 
                                            paddingBottom: 20,
                                            flexGrow: 1,
                                            justifyContent: (unequippedItems?.length || 0) === 0 ? 'center' : 'flex-start',
                                        }}
                                        columnWrapperStyle={{ gap: 4 }}
                                        ListEmptyComponent={
                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
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
                                            // Try both item.rarity and item.template.rarity
                                            const rarity = item.rarity;
                                            
                                            return (
                                                <Pressable
                                                    onPress={() => setSelectedItem(item)}
                                                    style={{
                                                        flex: 1,
                                                        aspectRatio: 1,
                                                        maxWidth: '19%', // Ensure consistent sizing with 5 columns
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
                                ) : (
                                    // Show only first row when collapsed
                                    (!unequippedItems || unequippedItems.length === 0) ? (
                                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: ITEM_ROW_HEIGHT }}>
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
                                        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'flex-start' }}>
                                        {unequippedItems.slice(0, 5).map((item) => {
                                            const itemCode = item.template?.code;
                                            const itemIcon = getItemIcon(itemCode);
                                            // Try both item.rarity and item.template.rarity
                                            const rarity = item.rarity;
                                            // Calculate width: if more than 5 items, shrink to make room for "+X more" text
                                            // Otherwise use 19% for consistent sizing
                                            const hasMoreItems = (unequippedItems?.length || 0) > 5;
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
                                        {unequippedItems && unequippedItems.length > 5 && (
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
                                                +{unequippedItems.length - 5} more
                                            </LRText>
                                        )}
                                    </View>
                                    )
                                )}
                            </View>
                        )}
                            </View>
                        </ImageBackground>
                    </Animated.View>
                )}
            </View>

            <ItemInfoModal 
                item={itemDetails || selectedItem} 
                loading={loadingItemDetails}
                onClose={() => {
                    setSelectedItem(null);
                    setItemDetails(null);
                }}
                onEquipChange={handleEquipChange}
            />
        </View>
    );
}


