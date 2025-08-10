export type CharacterAppearance = {
    id?: string;
    characterId?: string;
    gender: 'male' | 'female';
    skinTone: string;
    hair: string;
    hairColor: string;
    eyes: string;
    mouth: string;
    beard?: string | null;
    markings?: string | null;
};

export type CharacterSummary = {
    id: string;
    name: string;
    title?: string | null;
    level: number;
    trait: string;
    appearance?: CharacterAppearance | null;
    // Optional fields from backend we currently don't consume
    resources?: unknown;
    stats?: unknown;
    items?: unknown[];
};

export type Player = {
    id: string;
    hasCharacter: boolean;
    character?: CharacterSummary | null;
    // Backwards compatibility with older payloads/usages
    username?: string;
    title?: string;
    // Additional backend fields we may receive
    bannedUntil?: string | null;
    isTester?: boolean;
    settings?: unknown;
    region?: string | null;
};

export type PlayerStore = {
    player: Player | null;
    setPlayer: (data: Player) => void;
    clearPlayer: () => void;
    hasHydrated: boolean;
    setHasHydrated: () => void;
};
