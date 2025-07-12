import { useCharacterHeadAnimation } from '@/hooks/useCharacterHeadAnimation';
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { characterAssets } from '@/data/characterAssets';
import { getAssetStyle } from '@/utils/getAssetStyle';
import { CharacterPreviewProps } from '@/types';

const LAYER_ORDER: (keyof CharacterPreviewProps | 'head')[] = [
    'head',
    'eyes',
    'mouth',
    'markings',
    'beard',
    'hair',
];

const CharacterHeadPreview: React.FC<CharacterPreviewProps> = (props) => {
    const { gender, skinTone, hair, eyes, mouth, beard, markings } = props;

    const animatedStyle = useCharacterHeadAnimation(props);

    const assetsByKey: Record<string, any> = {
        head: characterAssets[gender].head[skinTone],
        eyes: characterAssets[gender].eyes[eyes],
        mouth:
            gender === 'male' && beard?.includes('full')
                ? null
                : characterAssets[gender].mouth[mouth],
        hair: characterAssets[gender].hair[hair],
        beard: gender === 'male' && beard ? characterAssets[gender].beards[beard] : null,
        markings: markings ? characterAssets[gender].markings[markings] : null,
    };

    const layers = LAYER_ORDER.map((key) => {
        const asset = assetsByKey[key];
        if (!asset) return null;

        return (
            <Image
                key={key}
                source={asset.source}
                style={getAssetStyle(asset.width, asset.height, asset.top, asset.left)}
                resizeMode="contain"
            />
        );
    }).filter(Boolean);

    return <Animated.View style={[styles.container, animatedStyle]}>{layers}</Animated.View>;
};

export default React.memo(CharacterHeadPreview);

const styles = StyleSheet.create({
    container: {
        width: 128,
        height: 128,
        position: 'relative',
        alignSelf: 'center',
    },
});
