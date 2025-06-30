import {useEffect} from 'react';
import {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import {CharacterPreviewProps} from '@/types/character';

export const useCharacterHeadAnimation = (character: CharacterPreviewProps) => {
    const scale = useSharedValue(1);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        opacity.value = 0;
        opacity.value = withTiming(1, {duration: 300});

        scale.value = withSequence(
            withTiming(0.6, {duration: 100, easing: Easing.out(Easing.exp)}),
            withTiming(1, {duration: 200, easing: Easing.out(Easing.exp)})
        );

        rotate.value = withSequence(
            withTiming(10, {duration: 100}),
            withTiming(0, {duration: 200})
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        character.gender,
        character.skinTone,
        character.hair,
        character.eyes,
        character.mouth,
        character.beard,
        character.markings,
    ]);

    return useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            {scale: scale.value},
            {rotateZ: `${rotate.value}deg`},
        ],
    }));
};
