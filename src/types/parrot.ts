export interface ParrotStateData {
    playing: boolean;
    elapsed: number; // in milliseconds
}

export interface ParrotAlbum {
    name?: string | null;
    year?: number | null;
}

export interface ParrotAlbumArt {
    type?: string | null;
    data?: string | null; // in base64
}

export interface ParrotTrackData {
    id: string;
    title: string;
    artists: string[];
    duration: number; // millis
    album?: ParrotAlbum | null;
    art?: ParrotAlbumArt | null;
    isrc?: string | null;
}
