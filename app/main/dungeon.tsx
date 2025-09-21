import CharacterTest from '@/components/combat/CharacterTest';
import CombatScreen from '@/components/combat/CombatScreen';
import CombatTest from '@/components/combat/CombatTest';
import EnemyCard from '@/components/enemy/EnemyCard';
import { getDungeonDetails, getDungeons } from '@/services/dungeonService';
import { CombatResult, Dungeon, DungeonDetails } from '@/types';
import { createEnemyInstance } from '@/utils/enemyUtils';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import ReanimatedAnimated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming,
} from 'react-native-reanimated';


const getDungeonImage = (code: string) => {
    switch (code) {
        case 'goblin_cave':
            return require('@/assets/images/dungeons/selectors/goblin_cave.png');
        case 'undead_crypt':
            return require('@/assets/images/dungeons/selectors/undead_crypt.png');
        case 'dark_sanctuary':
            return require('@/assets/images/dungeons/selectors/dark_sanctuary.png');
        default:
            return require('@/assets/images/logo.png');
    }
};

export default function DungeonScreen() {
    const router = useRouter();
    const [dungeons, setDungeons] = useState<Dungeon[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [dungeonDetails, setDungeonDetails] = useState<DungeonDetails | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);
    const [showCombat, setShowCombat] = useState(false);
    
    // Test mode toggle
    const [testMode, setTestMode] = useState<'normal' | 'combat' | 'character'>('normal' as const);
    
    // Floating animation for dungeon images
    const floatingAnim = useRef(new Animated.Value(0)).current;
    
    // Gesture and animation state for sliding
    const canSwipe = useSharedValue(true);
    const animX = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);
    const zoomScale = useSharedValue(0.7); // Start less dramatic for Android compatibility

    useEffect(() => {
        loadDungeons();
    }, []);

    // Start floating animation
    useEffect(() => {
        const floatingAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(floatingAnim, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatingAnim, {
                    toValue: 0,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        );
        
        floatingAnimation.start();
        
        return () => {
            floatingAnimation.stop();
        };
    }, [floatingAnim]);

    // Zoom-in animation when dungeon changes
    useEffect(() => {
        zoomScale.value = withSequence(
            withTiming(0.7, { duration: 0 }), // Start less dramatic for Android compatibility
            withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }) // Simpler easing for better performance
        );
    }, [currentIndex, zoomScale]);

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

    const animateToDungeon = (newIndex: number) => {
        if (!canSwipe.value) return;
        if (newIndex < 0 || newIndex >= dungeons.length || newIndex === currentIndex) return;

        canSwipe.value = false;
        const direction = newIndex > currentIndex ? 1 : -1;

        // Animate out with sequence - smoother transition
        animX.value = withSequence(
            withTiming(direction * -20, { duration: 100 }),
            withDelay(100, withTiming(0, { duration: 200 })),
        );
        opacity.value = withSequence(
            withTiming(0.3, { duration: 100 }),
            withDelay(100, withTiming(1, { duration: 200 })),
        );
        scale.value = withSequence(
            withTiming(0.95, { duration: 100 }),
            withDelay(100, withTiming(1, { duration: 200 })),
        );

        // Sync state in parallel with animation timing
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setCurrentIndex(newIndex);
                setSelectedLevel(1); // Reset to level 1 when changing dungeons
                canSwipe.value = true;
            });
        });
    };

    const nextDungeon = () => {
        animateToDungeon((currentIndex + 1) % dungeons.length);
    };

    const prevDungeon = () => {
        animateToDungeon((currentIndex - 1 + dungeons.length) % dungeons.length);
    };

    const handleLevelSelect = (level: number) => {
        // Only allow selection of unlocked levels
        if (currentDungeon && level <= currentDungeon.highestLevelCleared + 1) {
            setSelectedLevel(level);
        }
    };

    const loadDungeonDetails = async () => {
        if (!currentDungeon) return;
        
        try {
            setDetailsLoading(true);
            setDetailsError(null);
            const details = await getDungeonDetails(currentDungeon.id, selectedLevel);
            setDungeonDetails(details);
            setShowDetailsModal(true);
        } catch (err) {
            setDetailsError(err instanceof Error ? err.message : 'Failed to load dungeon details');
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setDungeonDetails(null);
        setDetailsError(null);
    };

    const startCombat = () => {
        setShowCombat(true);
    };

    const handleCombatComplete = (result: CombatResult) => {
        setShowCombat(false);
        // Combat results are already shown in the combat screen, no need for duplicate modal
    };

    const closeCombat = () => {
        setShowCombat(false);
    };

    // Gesture handler for drag & drop sliding
    const swipeGesture = Gesture.Pan()
        .minDistance(15)
        .activeOffsetX([-25, 25])
        .failOffsetY([-20, 20])
        .onUpdate((e) => {
            if (canSwipe.value) {
                animX.value = e.translationX;
            }
        })
        .onEnd((e) => {
            if (!canSwipe.value) {
                animX.value = withTiming(0, { duration: 150 });
                return;
            }

            const threshold = 50;

            if (e.translationX > threshold && currentIndex > 0) {
                runOnJS(animateToDungeon)(currentIndex - 1);
            } else if (e.translationX < -threshold && currentIndex < dungeons.length - 1) {
                runOnJS(animateToDungeon)(currentIndex + 1);
            } else {
                animX.value = withTiming(0, { duration: 150 });
            }
        });

    // Animated styles
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: animX.value }, { scale: scale.value }],
        opacity: opacity.value,
    }));

    const zoomAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: zoomScale.value }],
    }));

    const floatingAnimatedStyle = {
        transform: [
            { 
                translateY: floatingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-8, 8],
                })
            },
        ],
    };

    const currentDungeon = dungeons[currentIndex];

    // Ensure selected level is valid for current dungeon
    useEffect(() => {
        if (currentDungeon && selectedLevel > currentDungeon.highestLevelCleared + 1) {
            setSelectedLevel(1);
        }
    }, [currentDungeon, selectedLevel]);

    // Test mode rendering
    if (testMode === 'combat') {
        return <CombatTest onBack={() => setTestMode('normal')} />;
    }
    
    if (testMode === 'character') {
        return <CharacterTest onBack={() => setTestMode('normal')} />;
    }

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
                {/* Test Mode Selector */}
                <View className="mt-4 mb-4">
                    <Text className="text-lg font-bold text-center mb-3">Test Mode</Text>
                    <View className="flex-row justify-center space-x-2">
                        <Pressable 
                            onPress={() => setTestMode('normal')}
                            className={`px-3 py-2 rounded-lg ${testMode === 'normal' ? 'bg-blue-600' : 'bg-gray-600'}`}
                        >
                            <Text className="text-white text-sm">Normal</Text>
                        </Pressable>
                        <Pressable 
                            onPress={() => setTestMode('combat')}
                            className={`px-3 py-2 rounded-lg ${testMode === 'combat' ? 'bg-blue-600' : 'bg-gray-600'}`}
                        >
                            <Text className="text-white text-sm">Combat Test</Text>
                        </Pressable>
                        <Pressable 
                            onPress={() => setTestMode('character')}
                            className={`px-3 py-2 rounded-lg ${testMode === 'character' ? 'bg-blue-600' : 'bg-gray-600'}`}
                        >
                            <Text className="text-white text-sm">Character Test</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Header */}
                <View className="mt-4 mb-6">
                    <Text className="text-2xl font-bold text-center">Dungeons</Text>
                </View>

                {/* Dungeon Slider */}
                <View className="mb-6">
                    <GestureDetector gesture={swipeGesture} key={`dungeon-slider-${currentIndex}`}>
                        <View className="relative">
                        {/* Dungeon Image */}
                        <View className="items-center justify-center mb-4">
                            <Animated.View style={floatingAnimatedStyle}>
                                <ReanimatedAnimated.View
                                    style={[
                                        animatedStyle,
                                        zoomAnimatedStyle,
                                    ]}
                                >
                                    <Image
                                        source={getDungeonImage(currentDungeon.code)}
                                        style={{
                                            width: 300,
                                            height: 450,
                                        }}
                                        resizeMode="contain"
                                    />
                                </ReanimatedAnimated.View>
                            </Animated.View>
                        </View>

                        {/* Navigation Arrows */}
                        {dungeons.length > 1 && (
                            <>
                                <Pressable
                                    onPress={prevDungeon}
                                    disabled={currentIndex === 0}
                                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full items-center justify-center ${
                                        currentIndex === 0 ? 'bg-black/30' : 'bg-black/60'
                                    }`}
                                    style={{ zIndex: 10 }}
                                >
                                    <Text className={`font-bold text-xl ${
                                        currentIndex === 0 ? 'text-gray-400' : 'text-white'
                                    }`}>‹</Text>
                                </Pressable>
                                <Pressable
                                    onPress={nextDungeon}
                                    disabled={currentIndex === dungeons.length - 1}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full items-center justify-center ${
                                        currentIndex === dungeons.length - 1 ? 'bg-black/30' : 'bg-black/60'
                                    }`}
                                    style={{ zIndex: 10 }}
                                >
                                    <Text className={`font-bold text-xl ${
                                        currentIndex === dungeons.length - 1 ? 'text-gray-400' : 'text-white'
                                    }`}>›</Text>
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
                    </GestureDetector>

                    {/* Dungeon Info */}
                    <View className="bg-white/80 rounded-2xl border-2 border-stone-900 p-4">
                        <Text className="text-xl font-bold text-center mb-2">{currentDungeon.name}</Text>
                        
                        {/* Next Level Info */}
                        <View className="mb-4">
                            <Text className="text-sm text-center text-stone-600">
                                Next level to attempt: <Text className="font-bold text-blue-600">Level {currentDungeon.highestLevelCleared + 1}</Text>
                            </Text>
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

                {/* Level Selection */}
                <View className="bg-white/80 rounded-2xl border-2 border-stone-900 p-4 mb-6">
                    <Text className="font-bold text-lg mb-3 text-center">Select Level</Text>
                    
                    {/* Level Input with Controls */}
                    <View className="flex-row items-center justify-center gap-4 mb-3">
                        <Pressable
                            onPress={() => {
                                const newLevel = Math.max(1, selectedLevel - 1);
                                if (newLevel <= currentDungeon.highestLevelCleared + 1) {
                                    setSelectedLevel(newLevel);
                                }
                            }}
                            disabled={selectedLevel <= 1}
                            className={`w-12 h-12 rounded-full border-2 items-center justify-center ${
                                selectedLevel <= 1
                                    ? 'bg-gray-300 border-gray-400 opacity-50'
                                    : 'bg-blue-500 border-blue-700'
                            }`}
                        >
                            <Text className={`text-xl font-bold ${
                                selectedLevel <= 1 ? 'text-gray-500' : 'text-white'
                            }`}>-</Text>
                        </Pressable>
                        
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-stone-900">Level {selectedLevel}</Text>
                            <Text className="text-sm text-stone-600">
                                {selectedLevel <= currentDungeon.highestLevelCleared ? 'Cleared ✓' : 'Next to attempt'}
                            </Text>
                        </View>
                        
                        <Pressable
                            onPress={() => {
                                const newLevel = selectedLevel + 1;
                                if (newLevel <= currentDungeon.highestLevelCleared + 1) {
                                    setSelectedLevel(newLevel);
                                }
                            }}
                            disabled={selectedLevel >= currentDungeon.highestLevelCleared + 1}
                            className={`w-12 h-12 rounded-full border-2 items-center justify-center ${
                                selectedLevel >= currentDungeon.highestLevelCleared + 1
                                    ? 'bg-gray-300 border-gray-400 opacity-50'
                                    : 'bg-blue-500 border-blue-700'
                            }`}
                        >
                            <Text className={`text-xl font-bold ${
                                selectedLevel >= currentDungeon.highestLevelCleared + 1
                                    ? 'text-gray-500' : 'text-white'
                            }`}>+</Text>
                        </Pressable>
                    </View>
                    
                    <Text className="text-xs text-center text-stone-600 mb-3">
                        Available: 1-{currentDungeon.highestLevelCleared + 1} (Infinite levels)
                    </Text>
                    
                    {/* Quick Jump for Higher Levels */}
                    {currentDungeon.highestLevelCleared > 10 && (
                        <View className="flex-row items-center justify-center gap-2">
                            <Text className="text-sm text-stone-600">Jump to:</Text>
                            <TextInput
                                value={selectedLevel.toString()}
                                onChangeText={(text) => {
                                    const level = parseInt(text);
                                    if (!isNaN(level) && level >= 1 && level <= currentDungeon.highestLevelCleared + 1) {
                                        setSelectedLevel(level);
                                    }
                                }}
                                keyboardType="numeric"
                                className="w-16 h-8 text-center border border-stone-400 rounded bg-white"
                                maxLength={3}
                            />
                            <Pressable
                                onPress={() => setSelectedLevel(currentDungeon.highestLevelCleared + 1)}
                                className="px-3 py-1 bg-blue-500 rounded border border-blue-600"
                            >
                                <Text className="text-white text-xs font-bold">Max</Text>
                            </Pressable>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-4 mb-6">
                    <Pressable 
                        onPress={loadDungeonDetails}
                        disabled={detailsLoading}
                        className={`flex-1 py-3 rounded-xl border-2 border-stone-900 ${
                            detailsLoading ? 'bg-gray-400' : 'bg-red-500'
                        }`}
                    >
                        <Text className="text-white font-bold text-center">
                            {detailsLoading ? 'Loading...' : 'View Details'}
                        </Text>
                    </Pressable>
                    <Pressable 
                        onPress={startCombat}
                        className="flex-1 py-3 bg-blue-500 rounded-xl border-2 border-stone-900"
                    >
                        <Text className="text-white font-bold text-center">Enter Dungeon</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Dungeon Details Modal */}
            <Modal
                visible={showDetailsModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={closeDetailsModal}
            >
                <View className="flex-1 bg-stone-100">
                    {/* Modal Header */}
                    <View className="bg-white border-b border-stone-300 px-4 py-3 flex-row items-center justify-between">
                        <Text className="text-lg font-bold">Dungeon Details</Text>
                        <Pressable onPress={closeDetailsModal} className="p-2">
                            <Text className="text-blue-600 font-bold text-lg">✕</Text>
                        </Pressable>
                    </View>

                    {/* Modal Content */}
                    <ScrollView className="flex-1 px-4 py-4">
                        {detailsLoading ? (
                            <View className="flex-1 items-center justify-center py-20">
                                <Text className="text-lg font-bold">Loading details...</Text>
                            </View>
                        ) : detailsError ? (
                            <View className="flex-1 items-center justify-center py-20">
                                <Text className="text-lg font-bold text-red-600 mb-4">Error: {detailsError}</Text>
                                <Pressable 
                                    onPress={loadDungeonDetails}
                                    className="px-4 py-2 bg-blue-500 rounded-lg"
                                >
                                    <Text className="text-white font-bold">Retry</Text>
                                </Pressable>
                            </View>
                        ) : dungeonDetails ? (
                            <View>
                                {/* Dungeon Info */}
                                <View className="bg-white rounded-2xl border-2 border-stone-900 p-4 mb-4">
                                    <Text className="text-xl font-bold text-center mb-2">{dungeonDetails.name}</Text>
                                    <Text className="text-lg text-center text-stone-600 mb-4">Level {dungeonDetails.level}</Text>
                                    
                                    {/* Requirements */}
                                    <View className="bg-yellow-100 rounded-xl border-2 border-yellow-300 p-3 mb-4">
                                        <Text className="font-bold text-lg mb-2">Requirements</Text>
                                        <Text className="text-stone-700">
                                            Required Item Power: <Text className="font-bold">{dungeonDetails.requiredItemPower}</Text>
                                        </Text>
                                    </View>

                                    {/* Waves */}
                                    <View className="mb-4">
                                        <Text className="text-lg font-bold mb-3">Enemy Waves</Text>
                                        {dungeonDetails.waves.map((wave, index) => (
                                            <View key={index} className="bg-stone-100 rounded-xl border-2 border-stone-900 p-3 mb-3">
                                                <Text className="font-bold text-lg mb-2 text-center">Wave {index + 1}</Text>
                                                {wave.enemies.map((enemyInWave, enemyIndex) => {
                                                    const enemyInstance = createEnemyInstance(enemyInWave.enemy);
                                                    if (!enemyInstance) return null;
                                                    
                                                    return (
                                                        <EnemyCard
                                                            key={enemyIndex}
                                                            enemy={enemyInstance}
                                                            count={enemyInWave.count}
                                                            showPreview={true}
                                                        />
                                                    );
                                                })}
                                            </View>
                                        ))}
                                    </View>

                                    {/* Rewards */}
                                    <View className="bg-green-100 rounded-xl border-2 border-green-300 p-3">
                                        <Text className="font-bold text-lg mb-3">Rewards</Text>
                                        
                                        {/* Gold & XP */}
                                        <View className="flex-row justify-between mb-3">
                                            <View className="items-center">
                                                <Text className="text-sm text-stone-600">Gold</Text>
                                                <Text className="font-bold text-yellow-600">
                                                    {dungeonDetails.rewards.goldMin}-{dungeonDetails.rewards.goldMax}
                                                </Text>
                                            </View>
                                            <View className="items-center">
                                                <Text className="text-sm text-stone-600">XP</Text>
                                                <Text className="font-bold text-blue-600">
                                                    {dungeonDetails.rewards.xpMin}-{dungeonDetails.rewards.xpMax}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Drop Items */}
                                        <View>
                                            <Text className="font-semibold mb-2">Possible Drops:</Text>
                                            <View className="flex-row flex-wrap">
                                                {dungeonDetails.rewards.dropsJson.items.map((item, index) => (
                                                    <View key={index} className="bg-amber-100 rounded-lg border-2 border-amber-300 p-2 mr-2 mb-2">
                                                        <Text className="text-sm font-semibold">{item.itemId}</Text>
                                                        <Text className="text-xs text-amber-700">{(item.weight * 100).toFixed(0)}%</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {/* Action Buttons */}
                                <View className="flex-row space-x-4 mb-6">
                                    <Pressable 
                                        onPress={startCombat}
                                        className="flex-1 py-3 bg-red-500 rounded-xl border-2 border-stone-900"
                                    >
                                        <Text className="text-white font-bold text-center">Start Battle</Text>
                                    </Pressable>
                                    <Pressable className="flex-1 py-3 bg-blue-500 rounded-xl border-2 border-stone-900">
                                        <Text className="text-white font-bold text-center">Auto Battle</Text>
                                    </Pressable>
                                </View>
                            </View>
                        ) : null}
                    </ScrollView>
                </View>
            </Modal>

            {/* Combat Screen Modal */}
            <Modal
                visible={showCombat}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={closeCombat}
            >
                {currentDungeon && (
                    <CombatScreen
                        dungeonId={currentDungeon.id}
                        dungeonCode={currentDungeon.code}
                        level={selectedLevel}
                        onCombatComplete={handleCombatComplete}
                        onClose={closeCombat}
                    />
                )}
            </Modal>

        </View>
    );
}
