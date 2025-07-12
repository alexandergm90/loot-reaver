import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { characterAssets } from '@/data/characterAssets';

// Define base character shape
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
    setPart: (part: keyof CharacterDraft, value: string | null) => void;
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

export const useCharacterStore = create<CharacterState>()(
    persist(
        (set) => ({
            character: generateRandomCharacter(),
            setPart: (part, value) =>
                set((state) => ({
                    character: {
                        ...state.character,
                        [part]: value,
                    },
                })),
            reset: () => set({ character: generateRandomCharacter() }),
            randomize: () => set({ character: generateRandomCharacter() }),
        }),
        {
            name: 'character-storage', // key in localStorage / AsyncStorage
            partialize: (state) => ({ character: state.character }),
        },
    ),
);
