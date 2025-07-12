export type Player = {
    id: string;
    username: string;
    title?: string;
    hasCharacter: boolean;
};

export type PlayerStore = {
    player: Player | null;
    setPlayer: (data: Player) => void;
    clearPlayer: () => void;
};
