import CharacterFullPreview from '@/components/character/CharacterFullPreview';
import ItemInfoModal from '@/components/ui/ItemInfoModal';
import SlotChip from '@/components/ui/SlotChip';
import { useEquippedFromCharacter } from '@/hooks/useEquippedFromCharacter';
import { getPlayerCharacter, getPlayerInventory } from '@/services/playerService';
import { usePlayerStore } from '@/store/playerStore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ImageBackground, Text, View } from 'react-native';

type InventoryItem = {
    id: string;
    slot: string;
    durability: number;
    template: {
        id: string;
        code: string;
        name: string;
        rarity: string;
        slot: string;
        baseStats?: Record<string, number>;
        iconUrl?: string;
    };
};

export default function InventoryScreen() {
    const { player, setPlayer } = usePlayerStore();
    const [inventory, setInventory] = useState<InventoryItem[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    const { equippedItems, equipmentCodes } = useEquippedFromCharacter(player?.character);

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
                    setPlayer({
                        ...(player || { id: 'unknown', hasCharacter: true }),
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

    // Note: This duplicate logic is now handled by useEquippedFromCharacter hook
    // Keeping for backwards compatibility if needed, but should use equippedItems from hook instead

    return (
        <View style={{ flex: 1 }}>
            <View className="px-3" style={{ flex: 1 }}>
                <View className="mt-5 items-center justify-center" style={{ position: 'relative' }}>
                    <ImageBackground
                        source={require('@/assets/images/equipment/equipment_background.png')}
                        resizeMode="contain"
                        style={{ width: '100%', height: 390, overflow: 'hidden' }}
                    >
                    <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 100, paddingLeft: 10 }} collapsable={false}>
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
                            {/* Left side (below cape): Neck / Gloves / Ring 1 */}
                            <View className="absolute left-[5px] top-[120px]">
                                <View className="mb-3">
                                    <SlotChip label="Neck" item={equippedItems.neck} slotType="neck" onPress={setSelectedItem} fallback="Neck" />
                                </View>
                                <View className="mb-3">
                                    <SlotChip label="Hands" item={equippedItems.hands} slotType="glove" onPress={setSelectedItem} fallback="Hands" />
                                </View>
                                <View>
                                    <SlotChip label="Ring 1" item={equippedItems.ring1} slotType="ring" onPress={setSelectedItem} fallback="Ring 1" />
                                </View>
                            </View>
                            {/* Right side (below body): Legs / Boots / Ring 2 */}
                            <View className="absolute right-[5px] top-[120px]">
                                <View className="mb-3">
                                    <SlotChip label="Legs" item={equippedItems.legs} slotType="legs" onPress={setSelectedItem} fallback="Legs" />
                                </View>
                                <View className="mb-3">
                                    <SlotChip label="Feet" item={equippedItems.feet} slotType="feet" onPress={setSelectedItem} fallback="Feet" />
                                </View>
                                <View>
                                    <SlotChip label="Ring 2" item={equippedItems.ring2} slotType="ring" onPress={setSelectedItem} fallback="Ring 2" />
                                </View>
                            </View>
                            {/* Bottom center: Main Hand / Off Hand */}
                            <View className="absolute left-1/2 bottom-2 flex-row" style={{ transform: [{ translateX: -60 }], gap: 8 }}>
                                <SlotChip label="Main Hand" item={equippedItems.mainHand} slotType="weapon" onPress={setSelectedItem} fallback="Main Hand" />
                                <SlotChip label="Off Hand" item={equippedItems.offHand} slotType="shield" onPress={setSelectedItem} fallback="Off Hand" />
                            </View>
                        </View>
                </View>

                <View className="rounded-2xl border-2 border-stone-900 overflow-hidden mt-3">
                    <ImageBackground
                        source={require('@/assets/images/dark_leather.png')}
                        resizeMode="cover"
                        style={{ padding: 8 }}
                    >
                        {loading && (
                            <View className="py-6 items-center justify-center"><ActivityIndicator /></View>
                        )}
                        {!!error && (
                            <Text className="text-red-700">{error}</Text>
                        )}

                        {!loading && !error && (
                            <FlatList
                                data={inventory || []}
                                keyExtractor={(it) => it.id}
                                numColumns={5}
                                columnWrapperStyle={{ gap: 8 }}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                ListEmptyComponent={<Text className="text-center text-[12px] opacity-70 py-6">No items</Text>}
                                onEndReachedThreshold={0.5}
                                renderItem={({ item }) => (
                                    <View className="mb-2" style={{ flex: 1 }}>
                                        <View className="aspect-square rounded-xl border-2 border-stone-900 bg-stone-200 items-center justify-center">
                                            {item.template?.iconUrl ? (
                                                <Image source={{ uri: item.template.iconUrl }} style={{ width: 48, height: 48 }} />
                                            ) : (
                                                <Text className="text-[10px]">{item.template?.name || item.slot}</Text>
                                            )}
                                        </View>
                                        <Text className="text-[11px] font-semibold mt-1" numberOfLines={1}>{item.template?.name}</Text>
                                        <Text className="text-[10px] opacity-60">{item.durability}%</Text>
                                    </View>
                                )}
                            />
                        )}
                    </ImageBackground>
                </View>
            </View>

            <ItemInfoModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        </View>
    );
}


