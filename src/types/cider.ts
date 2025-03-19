import { SongsAttributes } from "./applemusic";

export type PlaybackStatus =
    | "playbackStatus.nowPlayingItemDidChange"
    | "playbackStatus.nowPlayingStatusDidChange"
    | "playbackStatus.playbackStateDidChange"
    | "playbackStatus.playbackTimeDidChange";

export type PlayerStatus =
    | "playerStatus.repeatModeDidChange"
    | "playerStatus.shuffleModeDidChange"
    | "playerStatus.volumeDidChange";

export interface PlaybackSongsAttributes extends SongsAttributes {
    currentPlaybackTime: any; // TODO timedelta
    remainingTime: any; // TODO timedelta
}

// TODO: cider validation
