import {ImageRequireSource} from "react-native";

export type CharacterPreviewProps = {
    gender: 'male' | 'female';
    skinTone: string;
    hair: string;
    eyes: string;
    mouth: string;
    beard?: string | null;
    markings?: string | null;
};

export type CharacterAsset = {
    source: ImageRequireSource
    width: number;
    height: number;
    top: number;
    left: number;
    previewColor?: string;
};

export type CharacterAssets = {
    male: {
        head: Record<string, CharacterAsset>;
        eyes: Record<string, CharacterAsset>;
        hair: Record<string, CharacterAsset>;
        beards: Record<string, CharacterAsset>;
        mouth: Record<string, CharacterAsset>;
        markings: Record<string, CharacterAsset>;
    };
    female: {
        head: Record<string, CharacterAsset>;
        eyes: Record<string, CharacterAsset>;
        hair: Record<string, CharacterAsset>;
        mouth: Record<string, CharacterAsset>;
        markings: Record<string, CharacterAsset>;
    };
};
