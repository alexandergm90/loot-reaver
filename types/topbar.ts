export type RuneStatus = {
    current: number;
    capacity: number;
    regenIntervalSeconds: number;
    nextRuneInSeconds: number;
};

export type TopbarData = {
    level: number;
    totalExperience: number;
    expInCurrentLevel: number;
    expRequiredForNextLevel: number;
    gold: number;
    scrap: number;
    runes: RuneStatus;
};


