import { BOTTOM_NAV_ITEMS } from '@/constants/routes';
import { router, usePathname } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <View className="absolute bottom-0 left-0 right-0 px-3 pb-4">
            <View className="rounded-2xl border-2 border-stone-900 bg-transparent px-4 py-2 flex flex-row items-center justify-between">
                {BOTTOM_NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.route;
                    const onPress = () => {
                        if (item.route) {
                            router.push(item.route);
                        }
                    };

                    return (
                        <Pressable
                            key={item.label}
                            onPress={onPress}
                            className="flex flex-col items-center"
                            disabled={!item.route}
                        >
                            <View className={`h-7 w-7 rounded-lg border-2 border-stone-900 bg-stone-200 mb-1 ${!item.route ? 'opacity-50' : ''}`} />
                            <Text className={`text-[11px] font-semibold ${!item.route ? 'opacity-50' : ''}`}>
                                {item.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

