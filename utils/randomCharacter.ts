import { characterAssets } from '@/data/characterAssets';
import { CharacterPreviewProps } from '@/types/character';

const getRandomKey = (obj: Record<string, any>) =>
    Object.keys(obj)[Math.floor(Math.random() * Object.keys(obj).length)];

export const generateRandomCharacter = (): CharacterPreviewProps & { hairColor: string } => {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const skinTone = getRandomKey(characterAssets[gender].head);
    const eyes = getRandomKey(characterAssets[gender].eyes);
    const fullHairKey = getRandomKey(characterAssets[gender].hair); // e.g. 'spiky_red'
    const mouth = getRandomKey(characterAssets[gender].mouth);
    const markings = Math.random() > 0.5 ? getRandomKey(characterAssets[gender].markings) : 'none';
    const beard =
        gender === 'male'
            ? Math.random() > 0.4
                ? getRandomKey(characterAssets.male.beards)
                : 'none'
            : null;

    const [hair, hairColor] = fullHairKey.split('_'); // safely split hair and color

    return {
        gender,
        skinTone,
        hair,
        hairColor,
        eyes,
        mouth,
        beard,
        markings,
    };
};
