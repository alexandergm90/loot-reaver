import { create } from 'zustand';
import { characterAssets } from '@/data/characterAssets';

export type CharacterDraft = {
    gender: 'male' | 'female';
    skinTone: string;
    hair: string;
    hairColor: string;
    eyes: string;
    mouth: string;
    beard?: string | null;
    markings?: string | null;
};

interface CharacterState {
    character: CharacterDraft;
    trait: string | null;
    setPart: (part: keyof CharacterDraft, value: string | null) => void;
    setTrait: (trait: string) => void;
    reset: () => void;
    randomize: () => void;
}

const getRandomKey = (obj: Record<string, any>) =>
    Object.keys(obj)[Math.floor(Math.random() * Object.keys(obj).length)];

const generateRandomCharacter = (): CharacterDraft => {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const skinTone = getRandomKey(characterAssets[gender].head);
    const eyes = getRandomKey(characterAssets[gender].eyes);
    const fullHairKey = getRandomKey(characterAssets[gender].hair);
    const mouth = getRandomKey(characterAssets[gender].mouth);
    const markings = Math.random() > 0.5 ? getRandomKey(characterAssets[gender].markings) : 'none';
    const beard =
        gender === 'male'
            ? Math.random() > 0.4
                ? getRandomKey(characterAssets.male.beards)
                : 'none'
            : null;

    const [hair, hairColor] = fullHairKey.split('_');

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

export const useCharacterStore = create<CharacterState>()((set) => ({
    character: generateRandomCharacter(),
    trait: null,
    setPart: (part, value) =>
        set((state) => ({
            character: {
                ...state.character,
                [part]: value,
            },
        })),
    setTrait: (trait) => set({ trait }),
    reset: () =>
        set({
            character: generateRandomCharacter(),
            trait: null,
        }),
    randomize: () =>
        set({
            character: generateRandomCharacter(),
            trait: null,
        }),
}));
