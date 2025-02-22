export interface ActivityData {
    state: string;
    details: string;
    startTimestamp?: number;
    endTimestamp?: number;
    largeImageKey?: string;
    largeImageText?: string;
    smallImageKey?: string;
    smallImageText?: string;
}

export interface RichPresence {
    activity: ActivityData;
}