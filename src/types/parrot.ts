export interface ParrotStateData {
    playing: boolean;
    elapsed: number; // in milliseconds
}

export interface ParrotTrackData {
    id: string;
    title: string;
    artists: string[];
    duration: number; // millis
    album: {
        name: string;
        year: number;
    };
    art: {
        type: string;
        data: string; // in base64
    };
    isrc?: string;
}
