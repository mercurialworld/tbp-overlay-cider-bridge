import { SongsAttributes } from "./applemusic";

// TODO: tagged unions
// https://mariusschulz.com/blog/tagged-union-types-in-typescript

export type PlaybackStatus =
    | "playbackStatus.nowPlayingItemDidChange"
    | "playbackStatus.nowPlayingStatusDidChange"
    | "playbackStatus.playbackStateDidChange"
    | "playbackStatus.playbackTimeDidChange";

export type PlayerStatus =
    | "playerStatus.repeatModeDidChange"
    | "playerStatus.shuffleModeDidChange"
    | "playerStatus.volumeDidChange";

export type PlayerPlayingState = "playing" | "seeking" | "paused";
export type PlayerStoppedState = "stopped";

export enum RepeatMode {
    NONE = 0,
    SONG,
    ALL,
}

export interface CiderResponseData {}

export interface PlaybackSongsAttributes extends SongsAttributes {
    currentPlaybackTime: any; // TODO timedelta
    remainingTime: any; // TODO timedelta
}

export interface NowPlayingItemDidChange extends CiderResponseData {
    data: PlaybackSongsAttributes;
}

export interface NowPlayingStatusDidChange extends CiderResponseData {
    data: {
        inLibrary: boolean;
        inFavorites: boolean;
    };
}

export interface PlaybackPlayingData extends CiderResponseData {
    state: PlayerPlayingState;
    attributes: PlaybackSongsAttributes;
}

export interface PlaybackStoppedData extends CiderResponseData {
    state: PlayerStoppedState;
    attributes?: PlaybackSongsAttributes;
}

export interface PlaybackStateDidChange extends CiderResponseData {
    data: PlaybackPlayingData | PlaybackStoppedData;
}

export interface PlaybackTimeDidChange extends CiderResponseData {
    data: {
        currentPlaybackDuration: number;
        currentPlaybackTime: number;
        currentPlaybackTimeRemaining: number;
        isPlaying: boolean;
    };
}

export interface RepeatModeDidChange extends CiderResponseData {
    data: RepeatMode;
}

export interface ShuffleModeDidChange extends CiderResponseData {
    data: boolean;
}

export interface VolumeDidChange extends CiderResponseData {
    data: number; // float btwn 0 - 1
}

export function validatePlaybackEvent(type: string, data: CiderResponseData) {}
