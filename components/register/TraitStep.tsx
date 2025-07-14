import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { useCharacterStore } from '@/store/characterStore';
import { TRAITS } from '@/data/traits';
import AppButton from '@/components/ui/AppButton';
import styles from "./styles/TraitStep.styles"

const TraitStep: React.FC = () => {
    const selected = useCharacterStore((s) => s.trait);
    const setTrait = useCharacterStore((s) => s.setTrait);

    const [index, setIndex] = useState(0);

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
        if (newIndex < 0 || newIndex >= TRAITS.length || newIndex === index) return;

        const direction = newIndex > index ? 1 : -1;

        animX.value = withTiming(direction * -100, { duration: 150 });
        opacity.value = withTiming(0, { duration: 150 });
        scale.value = withTiming(0.9, { duration: 150 }, () => {
            runOnJS(setIndex)(newIndex);
            runOnJS(setTrait)(TRAITS[newIndex].id);

            animX.value = direction * 100;
            animX.value = withTiming(0, { duration: 150 });
            opacity.value = withTiming(1, { duration: 150 });
            scale.value = withTiming(1, { duration: 150 });
        });
    };

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

                <Animated.View
                    style={[
                        styles.traitBox,
                        { backgroundColor: currentTrait.previewColor },
                        animatedStyle,
                    ]}
                >
                    <Text style={styles.traitLabel}>{currentTrait.label}</Text>
                </Animated.View>

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
