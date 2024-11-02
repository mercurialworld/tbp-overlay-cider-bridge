"""Models for the `API:Playback` event."""

from __future__ import annotations

from datetime import timedelta
from enum import IntEnum
from typing import Annotated, Any, Literal

from pydantic import Field, TypeAdapter

from .apple_music import SongsAttributes
from .base import CiderModel


class PlaybackSongsAttributes(SongsAttributes):
    current_playback_time: timedelta
    remaining_time: timedelta


# playbackStatus


class NowPlayingItemDidChange(CiderModel):
    type: Literal["playbackStatus.nowPlayingItemDidChange"]
    data: PlaybackSongsAttributes


class NowPlayingStatusDidChange(CiderModel):
    type: Literal["playbackStatus.nowPlayingStatusDidChange"]
    data: Data

    class Data(CiderModel):
        in_library: bool
        in_favorites: bool


class PlaybackStateDidChange(CiderModel):
    type: Literal["playbackStatus.playbackStateDidChange"]
    data: PlayingData | StoppedData = Field(discriminator="state")

    class PlayingData(CiderModel):
        state: Literal["playing", "seeking", "paused"]
        attributes: PlaybackSongsAttributes

    class StoppedData(CiderModel):
        state: Literal["stopped"]
        attributes: PlaybackSongsAttributes | None = None


class PlaybackTimeDidChange(CiderModel):
    type: Literal["playbackStatus.playbackTimeDidChange"]
    data: Data

    class Data(CiderModel):
        current_playback_duration: timedelta
        current_playback_time: timedelta
        current_playback_time_remaining: timedelta
        is_playing: bool


# playerStatus


class RepeatModeDidChange(CiderModel):
    type: Literal["playerStatus.repeatModeDidChange"]
    data: RepeatMode

    class RepeatMode(IntEnum):
        NONE = 0
        ONE = 1
        ALL = 2


class ShuffleModeDidChange(CiderModel):
    type: Literal["playerStatus.shuffleModeDidChange"]
    data: bool


class VolumeDidChange(CiderModel):
    type: Literal["playerStatus.volumeDidChange"]
    data: float
    """Seems to be a float in the range 0 <= data <= 1."""


# validation


type APIPlaybackEvent = Annotated[
    NowPlayingItemDidChange
    | NowPlayingStatusDidChange
    | PlaybackStateDidChange
    | PlaybackTimeDidChange
    | RepeatModeDidChange
    | ShuffleModeDidChange
    | VolumeDidChange,
    Field(discriminator="type"),
]


def validate_api_playback_event(data: Any) -> APIPlaybackEvent:
    ta = TypeAdapter[APIPlaybackEvent](APIPlaybackEvent)
    return ta.validate_python(data)
