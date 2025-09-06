import { getDungeons } from '@/services/dungeonService';
import { Dungeon } from '@/types';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, Text, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const getDungeonImage = (code: string) => {
    switch (code) {
        case 'goblin_cave':
            return require('@/assets/images/dungeons/goblin_cave.png');
        case 'orc_stronghold':
            return require('@/assets/images/dungeons/orc_stronghold.png');
        case 'undead_crypt':
            return require('@/assets/images/dungeons/undead_crypt.png');
        default:
            return require('@/assets/images/logo.png');
    }
};

export default function DungeonScreen() {
    const router = useRouter();
    const [dungeons, setDungeons] = useState<Dungeon[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDungeons();
    }, []);

    const loadDungeons = async () => {
        try {
            setLoading(true);
            const data = await getDungeons();
            setDungeons(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load dungeons');
        } finally {
            setLoading(false);
        }
    };

    const nextDungeon = () => {
        setCurrentIndex((prev) => (prev + 1) % dungeons.length);
    };

    const prevDungeon = () => {
        setCurrentIndex((prev) => (prev - 1 + dungeons.length) % dungeons.length);
    };

    const currentDungeon = dungeons[currentIndex];

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-lg font-bold">Loading dungeons...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 items-center justify-center p-4">
                <Text className="text-lg font-bold text-red-600 mb-4">Error: {error}</Text>
                <Pressable 
                    onPress={loadDungeons}
                    className="px-4 py-2 bg-blue-500 rounded-lg"
                >
                    <Text className="text-white font-bold">Retry</Text>
                </Pressable>
            </View>
        );
    }

    if (dungeons.length === 0) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-lg font-bold">No dungeons available</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            <ScrollView className="flex-1 px-4">
                {/* Header */}
                <View className="mt-4 mb-6">
                    <Text className="text-2xl font-bold text-center">Dungeons</Text>
                </View>

                {/* Dungeon Slider */}
                <View className="mb-6">
                    <View className="relative">
                        {/* Dungeon Image */}
                        <View className="h-64 rounded-2xl border-2 border-stone-900 bg-stone-200 overflow-hidden mb-4">
                            <Image
                                source={getDungeonImage(currentDungeon.code)}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        </View>

                        {/* Navigation Arrows */}
                        {dungeons.length > 1 && (
                            <>
                                <Pressable
                                    onPress={prevDungeon}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
                                >
                                    <Text className="text-white font-bold text-lg">‹</Text>
                                </Pressable>
                                <Pressable
                                    onPress={nextDungeon}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
                                >
                                    <Text className="text-white font-bold text-lg">›</Text>
                                </Pressable>
                            </>
                        )}

                        {/* Dots Indicator */}
                        {dungeons.length > 1 && (
                            <View className="flex-row justify-center space-x-2 mt-2">
                                {dungeons.map((_, index) => (
                                    <View
                                        key={index}
                                        className={`w-2 h-2 rounded-full ${
                                            index === currentIndex ? 'bg-stone-900' : 'bg-stone-400'
                                        }`}
                                    />
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Dungeon Info */}
                    <View className="bg-white/80 rounded-2xl border-2 border-stone-900 p-4">
                        <Text className="text-xl font-bold text-center mb-2">{currentDungeon.name}</Text>
                        
                        {/* Level Progress */}
                        <View className="mb-4">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-sm font-semibold">Progress</Text>
                                <Text className="text-sm font-semibold">
                                    {currentDungeon.highestLevelCleared}/{currentDungeon.availableLevels}
                                </Text>
                            </View>
                            
                            {/* Progress Bar */}
                            <View className="h-3 bg-stone-300 rounded-full overflow-hidden">
                                <View 
                                    className="h-full bg-gradient-to-r from-green-400 to-green-600"
                                    style={{ 
                                        width: `${(currentDungeon.highestLevelCleared / currentDungeon.availableLevels) * 100}%` 
                                    }}
                                />
                            </View>
                        </View>

                        {/* Level Status */}
                        <View className="flex-row justify-between">
                            <View className="items-center">
                                <Text className="text-xs text-stone-600">Cleared</Text>
                                <Text className="text-lg font-bold">{currentDungeon.highestLevelCleared}</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-xs text-stone-600">Available</Text>
                                <Text className="text-lg font-bold">{currentDungeon.availableLevels}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-4 mb-6">
                    <Pressable className="flex-1 py-3 bg-red-500 rounded-xl border-2 border-stone-900">
                        <Text className="text-white font-bold text-center">Enter Dungeon</Text>
                    </Pressable>
                    <Pressable className="flex-1 py-3 bg-blue-500 rounded-xl border-2 border-stone-900">
                        <Text className="text-white font-bold text-center">View Rewards</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}
