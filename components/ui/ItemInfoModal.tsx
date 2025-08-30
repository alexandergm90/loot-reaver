import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

type Props = {
    item: any | null;
    onClose: () => void;
};

const ItemInfoModal: React.FC<Props> = ({ item, onClose }) => {
    return (
        <Modal visible={!!item} transparent animationType="fade" onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                <View className="rounded-2xl border-2 border-stone-900 bg-amber-100 max-w-[90%] w-[340px]">
                    <View className="px-4 py-3 border-b-2 border-stone-900/60 flex-row items-center justify-between rounded-t-2xl bg-white/60">
                        <Text className="font-extrabold">Item</Text>
                        <Pressable onPress={onClose} className="px-3 py-1 rounded-lg border-2 border-stone-900 bg-stone-200">
                            <Text className="font-bold">Close</Text>
                        </Pressable>
                    </View>
                    <ScrollView className="px-4 py-3" contentContainerStyle={{ paddingBottom: 8 }}>
                        {!!item && (
                            <View>
                                <Text className="font-black text-lg">{item?.template?.name || 'Unknown Item'}</Text>
                                <Text className="opacity-70 text-[12px] mt-0.5">{item?.template?.rarity} • {item?.slot}</Text>
                                {!!item?.template?.baseStats && (
                                    <View className="mt-2">
                                        {Object.entries(item.template.baseStats).map(([k,v]) => (
                                            <Text key={k} className="text-[12px]">{k}: <Text className="font-semibold">{String(v)}</Text></Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default ItemInfoModal;


