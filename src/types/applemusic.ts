export type AudioVariant =
    | "dolby-atmos"
    | "dolby-audio"
    | "hi-res-lossless"
    | "lossless"
    | "lossy-stereo";

export type ContentRating = "clean" | "explicit";

/**
 * Apple Music album artwork.
 * See https://developer.apple.com/documentation/applemusicapi/artwork.
 */
export interface Artwork {
    bgColor?: string;
    height: number;
    width: number;
    textColor1?: string;
    textColor2?: string;
    textColor3?: string;
    textColor4?: string;
    url: string;
}

/**
 * Editorial notes for an album on Apple Music.
 * The "description" you see in some albums, basically.
 * See https://developer.apple.com/documentation/applemusicapi/editorialnotes
 */
export interface EditorialNotes {
    short?: string;
    standard?: string;
    name?: string;
    tagline?: string;
}

/**
 * An object that represents play parameters for resources.
 * See https://developer.apple.com/documentation/applemusicapi/playparameters
 */
export interface PlayParameters {
    id: string;
    kind: string;
}

/**
 * An object that represents a preview for resources.
 * See https://developer.apple.com/documentation/applemusicapi/preview
 */
export interface Preview {
    artwork?: Artwork;
    url?: string;
    hlsUrl?: string;
}

export interface ExtendedAssetUrls {
    plus?: string;
    lightweight?: string;
    superLightweight?: string;
    lightweightPlus?: string;
    enhancedHls?: string;
}

/**
 * The attributes for a song resource.
 * See https://developer.apple.com/documentation/applemusicapi/songs/attributes
 */
export interface SongsAttributes {
    albumName: string;
    artistName: string;
    artistUrl: string;
    artwork: Artwork;
    attribution?: string;
    audioVariants: AudioVariant;
    composerName?: string;
    contentRating: ContentRating;
    discNumber?: number;
    durationInMillis: number;
    editorialNotes?: EditorialNotes;
    genreNames: string[];
    hasLyrics: boolean;
    isAppleDigitalMaster: boolean;
    isrc?: string;
    movementCount?: number;
    movementName?: string;
    movementNumber?: number;
    name: string; // localized name
    playParams: PlayParameters;
    previews: Preview[];
    releaseDate?: string; // you can convert to datetime if you want
    trackNumber?: number;
    url: string;
    workName?: string;
    audioLocale?: string;
    audioTraits?: string[];
    extendedAssetUrls?: ExtendedAssetUrls;
    hasTimeSyncedLyrics?: boolean;
    isMasteredForItunes?: boolean;
    isVocalAttenuationAllowed?: boolean; // sing/karaoke mode or whatever
}
