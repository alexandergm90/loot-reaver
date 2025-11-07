import CharacterFullPreview from '@/components/character/CharacterFullPreview';
import ItemInfoModal from '@/components/ui/ItemInfoModal';
import SlotChip from '@/components/ui/SlotChip';
import { useEquippedFromCharacter } from '@/hooks/useEquippedFromCharacter';
import { getPlayerCharacter, getPlayerInventory } from '@/services/playerService';
import { usePlayerStore } from '@/store/playerStore';
import React, { useEffect, useMemo, useState } from 'react';
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

    // Map equipped character items for quick access (including duplicates like rings)
    const equippedList = (player as any)?.character?.items as any[] | undefined || [];
    const equipped = useMemo(() => {
        const findOne = (slot: string) => equippedList.find((i) => i.slot === slot);
        const findMany = (slot: string) => equippedList.filter((i) => i.slot === slot);
        const rings = findMany('ring');
        return {
            helmet: findOne('helmet') || null,
            body: findOne('chest') || null,
            cape: findOne('cape') || null,
            hands: findOne('glove') || null,
            mainHand: findOne('weapon') || null,
            offHand: findOne('shield') || null,
            feet: findOne('feet') || null,
            neck: findOne('neck') || null,
            ring1: rings[0] || null,
            ring2: rings[1] || null,
        } as Record<string, any | null>;
    }, [equippedList]);

    return (
        <View style={{ flex: 1 }}>
            <View className="px-3" style={{ flex: 1 }}>
                <View className="mt-5 items-center justify-center" style={{ overflow: 'hidden' }}>
                    <ImageBackground
                        source={require('@/assets/images/equipment/equipment_background.png')}
                        resizeMode="contain"
                        style={{ width: '100%', height: 390 }}
                    >
                    <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 20 }} collapsable={false}>
                        <View style={{ transform: [{ scale: 0.65 }], marginBottom: -10 }}>
                            <CharacterFullPreview
                                appearance={player?.character?.appearance || null}
                                containerHeight={300}
                                equipment={equipmentCodes}
                                headScale={0.9}
                                headOffsetX={-10}
                                headOffsetY={-5}
                            />
                        </View>
                        {/* Equipped Slots Around Character */}
                        <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
                            {/* Top row: Helmet / Body / Cape */}
                            <View className="absolute left-3 right-3 top-2 flex-row justify-between">
                                <SlotChip label="Helmet" item={equippedItems.helmet} onPress={setSelectedItem} fallback="Helmet" />
                                <SlotChip label="Body" item={equippedItems.body} onPress={setSelectedItem} fallback="Body" />
                                <SlotChip label="Cape" item={equippedItems.cape} onPress={setSelectedItem} fallback="Cape" />
                            </View>
                            {/* Mid sides: Main Hand / Off Hand */}
                            <View className="absolute left-2 top-[120px]">
                                <SlotChip label="Main Hand" item={equippedItems.mainHand} onPress={setSelectedItem} fallback="Main Hand" />
                            </View>
                            <View className="absolute right-2 top-[120px]">
                                <SlotChip label="Off Hand" item={equippedItems.offHand} onPress={setSelectedItem} fallback="Off Hand" />
                            </View>
                            {/* Hands / Feet */}
                            <View className="absolute left-2 bottom-[100px]">
                                <SlotChip label="Hands" item={equippedItems.hands} onPress={setSelectedItem} fallback="Hands" />
                            </View>
                            <View className="absolute right-2 bottom-[100px]">
                                <SlotChip label="Feet" item={equippedItems.feet} onPress={setSelectedItem} fallback="Feet" />
                            </View>
                            {/* Bottom: Neck / Ring1 / Ring2 */}
                            <View className="absolute left-3 right-3 bottom-2 flex-row justify-between">
                                <SlotChip label="Neck" item={equippedItems.neck} onPress={setSelectedItem} fallback="Neck" />
                                <SlotChip label="Ring 1" item={equippedItems.ring1} onPress={setSelectedItem} fallback="Ring 1" />
                                <SlotChip label="Ring 2" item={equippedItems.ring2} onPress={setSelectedItem} fallback="Ring 2" />
                            </View>
                        </View>
                    </View>
                    </ImageBackground>
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


