import CharacterFullPreview from '@/components/character/CharacterFullPreview';
import { EquipmentStatsDisplay } from '@/components/character/EquipmentStatsDisplay';
import ItemInfoModal from '@/components/ui/ItemInfoModal';
import LRText from '@/components/ui/LRText';
import RarityGradientBackground from '@/components/ui/RarityGradientBackground';
import SlotChip from '@/components/ui/SlotChip';
import { useEquippedFromCharacter } from '@/hooks/useEquippedFromCharacter';
import { getPlayerCharacter, getPlayerInventory, getPlayerItem } from '@/services/playerService';
import { usePlayerStore } from '@/store/playerStore';
import { getItemIcon } from '@/utils/getItemIcon';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ImageBackground,
    Pressable,
    ScrollView,
    useWindowDimensions,
    View,
} from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

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

const HEADER_HEIGHT = 50; // Header height
const ITEM_ROW_HEIGHT = 80; // Height for one row of items (including padding)
const COLLAPSED_HEIGHT = HEADER_HEIGHT + ITEM_ROW_HEIGHT; // Header + one row
// Clamp content width so layout feels like a phone on tablets / large phones
// Allow slightly more width on larger screens to prevent everything being too small
const MAX_GAME_WIDTH = 430; // Base max width
const MAX_GAME_WIDTH_LARGE = 500; // Max width for larger screens (tablets)

// Reference dimensions (ideal screen size)
const REF_WIDTH = 390;
const REF_HEIGHT = 844;

// Spring configuration for smooth, natural animations with more weight and bounce
const INVENTORY_SPRING_CONFIG = {
    damping: 15, // Lower damping = more bounce/oscillation
    stiffness: 180, // Lower stiffness = slower, more relaxed animation
    mass: 1.5, // Higher mass = more weight, slower response
};

export default function InventoryScreen() {
    const { width, height: windowHeight } = useWindowDimensions();
    const isShortScreen = windowHeight < 750;
    const isLargeScreen = width > 800; // Tablets and large screens
    const isVeryLargeScreen = width > 1000; // Very large tablets/desktop
    
    // Use larger max width on big screens to prevent everything being too small
    const maxWidth = isLargeScreen ? MAX_GAME_WIDTH_LARGE : MAX_GAME_WIDTH;
    const contentWidth = Math.min(width, maxWidth);
    
    // Always use contentWidth for scaling to maintain consistent proportions
    // This ensures the equipment area scales properly relative to the clamped content width
    const scaleX = contentWidth / REF_WIDTH;
    const scaleY = windowHeight / REF_HEIGHT;
    
    // Use uniform scaling for equipment area to maintain aspect ratio
    // Cap the scale to prevent things from becoming too large on very large screens
    const rawEquipmentScale = Math.min(scaleX, scaleY);
    const maxScale = 1.3; // Cap at 130% to prevent excessive scaling on tablets
    const equipmentScale = isShortScreen 
        ? Math.max(scaleX, scaleY) * 0.95 // Use max scale and only reduce 5% on short screens
        : Math.min(rawEquipmentScale, maxScale); // Cap the scale on larger screens

    const { player, setPlayer } = usePlayerStore();
    const [inventory, setInventory] = useState<InventoryItem[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [itemDetails, setItemDetails] = useState<any | null>(null);
    const [loadingItemDetails, setLoadingItemDetails] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showFullList, setShowFullList] = useState(false);
    const [headerHeight, setHeaderHeight] = useState<number>(HEADER_HEIGHT);
    const [bottomBorderHeight, setBottomBorderHeight] = useState<number>(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const { equippedItems, equipmentCodes } = useEquippedFromCharacter(player?.character);

    // Refresh function to reload character and inventory data
    const refreshData = useCallback(
        async (skipItemDetails = false) => {
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
        },
        [selectedItem?.id, setPlayer],
    );

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

    // No need to scroll on short screens anymore since inventory is absolutely positioned

    // Animate inventory expansion/collapse
    React.useEffect(() => {
        if (isExpanded) {
            setShowFullList(true);
            // On short screens, limit expansion to prevent going off-screen
            // On normal screens, grow up most of the screen
            // Always expand upward from bottom position
            // On short screens, use a smaller max height to prevent covering too much
            if (isShortScreen) {
                // On short screens, expand to a reasonable height
                const MAX_EXPANDED_HEIGHT = windowHeight * 0.65; // Use 65% of screen height
                inventoryHeight.value = withSpring(MAX_EXPANDED_HEIGHT, INVENTORY_SPRING_CONFIG);
            } else {
                // Grow the drawer up most of the screen, leaving space for the HUD at the top
                const EXPANDED_HEIGHT = windowHeight * 0.8;
                const MAX_EXPANDED_HEIGHT = windowHeight - 180; // keep ~180px from the top
                const targetHeight = Math.min(EXPANDED_HEIGHT, MAX_EXPANDED_HEIGHT);
                inventoryHeight.value = withSpring(targetHeight, INVENTORY_SPRING_CONFIG);
            }
        } else {
            // Collapse with spring animation
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
        // Side borders should span from after header to before bottom border
        const availableHeight = inventoryHeight.value - headerHeight - bottomBorderHeight;
        return {
            top: headerHeight,
            height: Math.max(0, availableHeight),
        };
    });

    // Filter out equipped items from inventory - only show unequipped items
    const unequippedItems = React.useMemo(() => {
        if (!inventory || !equippedItems) return inventory || [];
        const equippedItemIds = new Set(
            Object.values(equippedItems)
                .filter(Boolean)
                .map((item: any) => item?.id)
                .filter(Boolean),
        );
        return inventory.filter(item => !equippedItemIds.has(item.id));
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

    // ----- RENDER -----

    // Equipment block as a small helper to avoid duplicating JSX in scroll vs non-scroll layouts
    const EquipmentBlock = (
        <View
            className="mt-5 items-center justify-center"
            style={{ position: 'relative' }}
        >
            <ImageBackground
                source={require('@/assets/images/equipment/equipment_background.png')}
                resizeMode="contain"
                style={{ 
                    width: '100%', 
                    height: Math.max(390 * equipmentScale, 300), // Responsive height with min constraint
                    overflow: 'hidden' 
                }}
            >
                <View
                    style={{
                        flex: 1,
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingBottom: 100 * equipmentScale, // Scale padding
                        paddingLeft: 0,
                    }}
                    collapsable={false}
                >
                    {/* Make character scale responsive based on screen size
                        Base scale is 0.6, but increase on smaller screens to keep character visible */}
                    <View style={{ 
                        transform: [{ scale: isShortScreen ? 0.7 * equipmentScale : 0.6 * equipmentScale }],
                        // Maintain character's relative position within the arch by scaling container height
                    }}>
                        <CharacterFullPreview
                            appearance={player?.character?.appearance || null}
                            containerHeight={300 * equipmentScale}
                            equipment={equipmentCodes}
                            headScale={0.9}
                            headOffsetX={-10 * equipmentScale}
                            headOffsetY={-5 * equipmentScale}
                        />
                    </View>
                </View>
                {(() => {
                    const derivedStats = (player?.character as any)
                        ?.derivedStats as Record<string, number> | undefined;
                    const characterLevel = player?.character?.level;
                    return (
                        <EquipmentStatsDisplay
                            stats={derivedStats}
                            level={characterLevel}
                            scaleX={equipmentScale} // Use equipmentScale for consistency with slots
                        />
                    );
                })()}
            </ImageBackground>

            {/* Equipped slots overlay */}
            <View
                pointerEvents="box-none"
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            >
                {/* Top: Helmet */}
                <View
                    style={{ 
                        position: 'absolute',
                        left: '50%',
                        top: -10 * equipmentScale,
                        transform: [{ translateX: -30 * equipmentScale }] // Use equipmentScale for consistency
                    }}
                >
                    <SlotChip
                        label="Helmet"
                        item={equippedItems.helmet}
                        slotType="helmet"
                        onPress={setSelectedItem}
                        fallback="Helmet"
                        scale={equipmentScale}
                    />
                </View>

                {/* Second row: Body / Cape */}
                <View style={{
                    position: 'absolute',
                    left: 20 * equipmentScale, // Use equipmentScale for consistency
                    right: 20 * equipmentScale,
                    top: 48 * equipmentScale, // top-12 = 48px
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}>
                    <SlotChip
                        label="Cape"
                        item={equippedItems.cape}
                        slotType="cape"
                        onPress={setSelectedItem}
                        fallback="Cape"
                        scale={equipmentScale}
                    />
                    <SlotChip
                        label="Body"
                        item={equippedItems.body}
                        slotType="chest"
                        onPress={setSelectedItem}
                        fallback="Body"
                        scale={equipmentScale}
                    />
                </View>

                {/* Left side */}
                <View style={{
                    position: 'absolute',
                    left: 5 * equipmentScale, // Use equipmentScale for consistency
                    top: 120 * equipmentScale
                }}>
                    <View style={{ marginBottom: isShortScreen ? 8 * equipmentScale : 12 * equipmentScale }}>
                        <SlotChip
                            label="Neck"
                            item={equippedItems.neck}
                            slotType="neck"
                            onPress={setSelectedItem}
                            fallback="Neck"
                            scale={equipmentScale}
                        />
                    </View>
                    <View style={{ marginBottom: isShortScreen ? 8 * equipmentScale : 12 * equipmentScale }}>
                        <SlotChip
                            label="Hands"
                            item={equippedItems.hands}
                            slotType="glove"
                            onPress={setSelectedItem}
                            fallback="Hands"
                            scale={equipmentScale}
                        />
                    </View>
                    <View>
                        <SlotChip
                            label="Ring L"
                            item={equippedItems.ringLeft}
                            slotType="ring"
                            onPress={setSelectedItem}
                            fallback="Ring L"
                            scale={equipmentScale}
                        />
                    </View>
                </View>

                {/* Right side */}
                <View style={{
                    position: 'absolute',
                    right: 5 * equipmentScale, // Use equipmentScale for consistency
                    top: 120 * equipmentScale
                }}>
                    <View style={{ marginBottom: isShortScreen ? 8 * equipmentScale : 12 * equipmentScale }}>
                        <SlotChip
                            label="Legs"
                            item={equippedItems.legs}
                            slotType="legs"
                            onPress={setSelectedItem}
                            fallback="Legs"
                            scale={equipmentScale}
                        />
                    </View>
                    <View style={{ marginBottom: isShortScreen ? 8 * equipmentScale : 12 * equipmentScale }}>
                        <SlotChip
                            label="Feet"
                            item={equippedItems.feet}
                            slotType="feet"
                            onPress={setSelectedItem}
                            fallback="Feet"
                            scale={equipmentScale}
                        />
                    </View>
                    <View>
                        <SlotChip
                            label="Ring R"
                            item={equippedItems.ringRight}
                            slotType="ring"
                            onPress={setSelectedItem}
                            fallback="Ring R"
                            scale={equipmentScale}
                        />
                    </View>
                </View>

                {/* Bottom center: weapons */}
                <View
                    style={{
                        position: 'absolute',
                        left: '50%',
                        bottom: 8 * equipmentScale, // bottom-2 = 8px
                        flexDirection: 'row',
                        transform: [{ translateX: -60 * equipmentScale }], // Use equipmentScale for consistency
                        gap: 8 * equipmentScale
                    }}
                >
                    {equippedItems.weaponTwoHanded ? (
                        <>
                            <SlotChip
                                label="2H Weapon"
                                item={equippedItems.weaponTwoHanded}
                                slotType="weapon"
                                onPress={setSelectedItem}
                                fallback="2H Weapon"
                                scale={equipmentScale}
                            />
                            <SlotChip
                                label="Off Hand"
                                item={null}
                                slotType="shield"
                                onPress={setSelectedItem}
                                fallback="Off Hand"
                                scale={equipmentScale}
                            />
                        </>
                    ) : (
                        <>
                            <SlotChip
                                label="Main Hand"
                                item={equippedItems.weaponLeft}
                                slotType="weapon"
                                onPress={setSelectedItem}
                                fallback="Main Hand"
                                scale={equipmentScale}
                            />
                            <SlotChip
                                label={equippedItems.shield ? 'Shield' : 'Off Hand'}
                                item={equippedItems.shield || equippedItems.weaponRight}
                                slotType={equippedItems.shield ? 'shield' : 'weapon'}
                                onPress={setSelectedItem}
                                fallback={equippedItems.shield ? 'Shield' : 'Off Hand'}
                                scale={equipmentScale}
                            />
                        </>
                    )}
                </View>
            </View>
        </View>
    );

    // Calculate horizontal inset to align drawer with centered game canvas
    const horizontalInset = (width - contentWidth) / 2 + 12; // outer margin + px-3 padding
    
    // Calculate equipment area height for positioning
    const equipmentAreaHeight = Math.max(390 * equipmentScale, 300);
    
    // On short screens, position inventory absolutely at bottom (above nav) so it expands upward
    // On normal screens, also position absolutely at bottom
    const bottomNavHeight = 72;
    const bottomMargin = 16;
    const minBottomOffset = bottomNavHeight + bottomMargin;

    const InventoryBlock = (
        <Animated.View
            style={[
                {
                    // Always use absolute positioning so inventory expands upward from bottom
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
                    zIndex: 2, // above the dimming overlay
                },
                // Apply animated height style
                animatedInventoryStyle,
            ]}
        >
            <ImageBackground
                source={require('@/assets/images/dark_leather.png')}
                resizeMode="repeat"
                style={{ flex: 1, paddingBottom: 14 }}
                imageStyle={{ opacity: 1.0 }}
            >
                {/* Left side border */}
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
                {/* Right side border */}
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
                {/* Bottom border */}
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
                {/* Header with expand/collapse button */}
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

                {/* Content area */}
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
                                    data={unequippedItems || []}
                                    keyExtractor={it => it.id}
                                    numColumns={5}
                                    scrollEnabled={true}
                                    contentContainerStyle={{
                                        paddingBottom: 20,
                                        flexGrow: 1,
                                        justifyContent:
                                            (unequippedItems?.length || 0) === 0
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
                            ) : !unequippedItems || unequippedItems.length === 0 ? (
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
                                    {unequippedItems.slice(0, 5).map(item => {
                                        const itemCode = item.template?.code;
                                        const itemIcon = getItemIcon(itemCode);
                                        const rarity = item.rarity;
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
                            )}
                        </View>
                    )}
                </View>
            </ImageBackground>
        </Animated.View>
    );

    return (
        <View style={{ flex: 1 }}>

            {/* clamp width so tablets / large phones look like a phone layout */}
            <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ flex: 1, width: contentWidth }}>
                    <View className="px-3" style={{ flex: 1 }}>
                        {/* MAIN COLUMN: equipment and inventory */}
                        {/* Equipment area - always in a scrollable view on short screens */}
                        {isShortScreen ? (
                            <ScrollView
                                ref={scrollViewRef}
                                contentContainerStyle={{
                                    flexGrow: 1,
                                    paddingTop: 20,
                                    // Add padding at bottom to account for inventory drawer
                                    paddingBottom: COLLAPSED_HEIGHT + bottomNavHeight + bottomMargin + 16,
                                }}
                                showsVerticalScrollIndicator={false}
                            >
                                {EquipmentBlock}
                            </ScrollView>
                        ) : (
                            <View
                                style={{
                                    flex: 1,
                                    paddingTop: 20,
                                }}
                            >
                                {EquipmentBlock}
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Inventory drawer - always absolute positioned, expands upward from bottom */}
            {InventoryBlock}

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
