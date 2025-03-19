import { SongsAttributes } from "./applemusic";

// TODO: tagged unions
// https://mariusschulz.com/blog/tagged-union-types-in-typescript

export type PlayerPlayingState = "playing" | "seeking" | "paused";
export type PlayerStoppedState = "stopped";

export enum RepeatMode {
    NONE = 0,
    SONG,
    ALL,
}

export interface PlaybackSongsAttributes extends SongsAttributes {
    currentPlaybackTime: any; // TODO timedelta
    remainingTime: any; // TODO timedelta
}

export interface PlaybackPlayingData {
    state: PlayerPlayingState;
    attributes: PlaybackSongsAttributes;
}

export interface PlaybackStoppedData {
    state: PlayerStoppedState;
    attributes?: PlaybackSongsAttributes;
}

export type PlaybackData = PlaybackPlayingData | PlaybackStoppedData;

export interface NowPlayingItemDidChange {
    type: "playbackStatus.nowPlayingItemDidChange";
    data: PlaybackSongsAttributes;
}

export interface NowPlayingStatusDidChange {
    type: "playbackStatus.nowPlayingStatusDidChange";
    data: {
        inLibrary: boolean;
        inFavorites: boolean;
    };
}

export interface PlaybackStateDidChange {
    type: "playbackStatus.playbackStateDidChange";
    data: PlaybackData;
}

export interface PlaybackTimeDidChange {
    type: "playbackStatus.playbackTimeDidChange";
    data: {
        currentPlaybackDuration: number;
        currentPlaybackTime: number;
        currentPlaybackTimeRemaining: number;
        isPlaying: boolean;
    };
}

export interface RepeatModeDidChange {
    type: "playerStatus.repeatModeDidChange";
    data: RepeatMode;
}

export interface ShuffleModeDidChange {
    type: "playerStatus.shuffleModeDidChange";
    data: boolean;
}

export interface VolumeDidChange {
    type: "playerStatus.volumeDidChange";
    data: number; // float btwn 0 - 1
}

export type CiderPlaybackStatus =
    | NowPlayingItemDidChange
    | NowPlayingStatusDidChange
    | PlaybackStateDidChange
    | PlaybackTimeDidChange;

export type CiderPlayerStatus =
    | RepeatModeDidChange
    | ShuffleModeDidChange
    | VolumeDidChange;
