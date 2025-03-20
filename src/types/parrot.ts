export interface ParrotStateData {
    playing: boolean;
    elapsed: number; // in milliseconds
}

export interface ParrotAlbum {
    name?: string;
    year?: number;
}

export interface ParrotAlbumArt {
    type?: string;
    data?: string; // in base64
}

export interface ParrotTrackData {
    id: string;
    title: string;
    artists: string[];
    duration: number; // millis
    album?: ParrotAlbum;
    art?: ParrotAlbumArt;
    isrc?: string;
}
