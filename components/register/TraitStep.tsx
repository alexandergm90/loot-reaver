import { useCharacterStore } from '@/store/characterStore';
import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import AppButton from '@/components/ui/AppButton';
import { TRAITS } from '@/data/traits';
import styles from './TraitStep.styles';

const TraitStep: React.FC = () => {
    const selected = useCharacterStore((s) => s.trait);
    const setTrait = useCharacterStore((s) => s.setTrait);

    const [index, setIndex] = useState(0);

    const canSwipe = useRef(true); // ✅ prevents overlapping animations

    const animX = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const currentTrait = TRAITS[index];

    useEffect(() => {
        if (!selected) {
            setTrait(TRAITS[0].id);
        }
    }, []);

    const animateTo = (newIndex: number) => {
        if (!canSwipe.current) return;
        if (newIndex < 0 || newIndex >= TRAITS.length || newIndex === index) return;

        canSwipe.current = false;
        const direction = newIndex > index ? 1 : -1;

        // Animate out with sequence
        animX.value = withSequence(
            withTiming(direction * -40, { duration: 150 }),
            withDelay(50, withTiming(0, { duration: 150 })),
        );
        opacity.value = withSequence(
            withTiming(0, { duration: 150 }),
            withDelay(50, withTiming(1, { duration: 150 })),
        );
        scale.value = withSequence(
            withTiming(0.9, { duration: 150 }),
            withDelay(50, withTiming(1, { duration: 150 })),
        );

        // Sync state in parallel with animation timing (no nesting!)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setIndex(newIndex);
                setTrait(TRAITS[newIndex].id);
                canSwipe.current = true;
            });
        });
    };

    const swipeGesture = Gesture.Pan()
        .minDistance(8) // ✅ makes it feel responsive
        .onUpdate((e) => {
            animX.value = e.translationX;
        })
        .onEnd((e) => {
            const threshold = 40;

            if (e.translationX > threshold && index > 0) {
                runOnJS(animateTo)(index - 1);
            } else if (e.translationX < -threshold && index < TRAITS.length - 1) {
                runOnJS(animateTo)(index + 1);
            } else {
                animX.value = withTiming(0, { duration: 150 });
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: animX.value }, { scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Choose a Trait</Text>

            <View style={styles.traitSlider}>
                <AppButton
                    onPress={() => animateTo(index - 1)}
                    disabled={index === 0}
                    style={styles.arrowButton}
                >
                    ◀
                </AppButton>

                <GestureDetector gesture={swipeGesture} key={`trait-${index}`}>
                    <Animated.View
                        style={[
                            styles.traitBox,
                            { backgroundColor: currentTrait.previewColor },
                            animatedStyle,
                        ]}
                    >
                        <Text style={styles.traitLabel}>{currentTrait.label}</Text>
                    </Animated.View>
                </GestureDetector>

                <AppButton
                    onPress={() => animateTo(index + 1)}
                    disabled={index === TRAITS.length - 1}
                    style={styles.arrowButton}
                >
                    ▶
                </AppButton>
            </View>

            <Animated.View style={[styles.descriptionBox, animatedStyle]}>
                <Text style={styles.traitTitle}>{currentTrait.label}</Text>
                <Text style={styles.traitDescription}>{currentTrait.description}</Text>
                <Text style={styles.traitBonus}>{currentTrait.bonus}</Text>
            </Animated.View>
        </View>
    );
};

export default TraitStep;
