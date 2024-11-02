"""https://developer.apple.com/documentation/applemusicapi"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Annotated, Any, Literal

from pydantic import BeforeValidator, Field

from .base import CiderModel


def _millis_to_s(value: Any):
    match value:
        case int() | float():
            return float(value) / 1000
        case _:
            return value


type MillisTimedelta = Annotated[timedelta, BeforeValidator(_millis_to_s)]

type AudioVariant = Literal[
    "dolby-atmos",
    "dolby-audio",
    "hi-res-lossless",
    "lossless",
    "lossy-stereo",
]

type ContentRating = Literal["clean", "explicit"]


class Artwork(CiderModel):
    """https://developer.apple.com/documentation/applemusicapi/artwork"""

    bg_color: str | None = None
    """The average background color of the image."""
    height: int | float
    """(Required) The maximum height available for the image."""
    width: int | float
    """(Required) The maximum width available for the image."""
    text_color_1: str | None = None
    """The primary text color used if the background color gets displayed."""
    text_color_2: str | None = None
    """The secondary text color used if the background color gets displayed."""
    text_color_3: str | None = None
    """The tertiary text color used if the background color gets displayed."""
    text_color_4: str | None = None
    """The final post-tertiary text color used if the background color gets displayed."""
    url: str
    """(Required) The URL to request the image asset. `{w}x{h}` must precede image filename, as placeholders for the width and height values as described above. For example, `{w}x{h}bb.jpeg`."""


class EditorialNotes(CiderModel):
    """https://developer.apple.com/documentation/applemusicapi/editorialnotes"""

    short: str | None = None
    """Abbreviated notes shown inline or when the content appears alongside other content."""
    standard: str | None = None
    """Notes shown when the content is prominently displayed."""
    name: str | None = None
    """Name for the editorial notes."""
    tagline: str | None = None
    """The tag line for the editorial notes."""


class PlayParameters(CiderModel):
    """https://developer.apple.com/documentation/applemusicapi/playparameters"""

    id: str
    """(Required) The ID of the content to use for playback."""
    kind: str
    """(Required) The kind of the content to use for playback."""


class Preview(CiderModel):
    """https://developer.apple.com/documentation/applemusicapi/preview"""

    artwork: Artwork | None = None
    """The preview artwork for the associated preview music video."""
    url: str | None = None
    """(Required) The preview URL for the content.

    Cider sometimes doesn't provide this field.
    """
    hls_url: str | None = None
    """The HLS preview URL for the content."""


class ExtendedAssetUrls(CiderModel):
    plus: str | None = None
    lightweight: str | None = None
    super_lightweight: str | None = None
    lightweight_plus: str | None = None
    enhanced_hls: str | None = None


class SongsAttributes(CiderModel):
    """https://developer.apple.com/documentation/applemusicapi/songs/attributes"""

    album_name: str
    """(Required) The name of the album the song appears on."""
    artist_name: str
    """(Required) The artist's name."""
    artist_url: str | None = None
    """(Extended) The URL of the artist for the content."""
    artwork: Artwork
    """(Required) The album artwork."""
    attribution: str | None = None
    """(Classical music only) The name of the artist or composer to attribute the song with."""
    audio_variants: list[AudioVariant] | None = None
    """(Extended) Indicates the specific audio variant for a song."""
    composer_name: str | None = None
    """The song's composer."""
    content_rating: ContentRating | None = None
    """The Recording Industry Association of America (RIAA) rating of the content. No value means no rating."""
    disc_number: int | None = None
    """The disc number of the album the song appears on."""
    duration: MillisTimedelta = Field(alias="durationInMillis")
    """(Required) The duration of the song in milliseconds."""
    editorial_notes: EditorialNotes | None = None
    """The notes about the song that appear in the Apple Music catalog."""
    genre_names: list[str]
    """(Required) The genre names the song is associated with."""
    has_lyrics: bool
    """(Required) Indicates whether the song has lyrics available in the Apple Music catalog. If true, the song has lyrics available; otherwise, it doesn't."""
    is_apple_digital_master: bool | None = None
    """(Required) Indicates whether the response delivered the song as an [Apple Digital Master](https://www.apple.com/apple-music/apple-digital-masters/).

    Cider sometimes doesn't provide this field.
    """
    isrc: str | None = None
    """The International Standard Recording Code (ISRC) for the song."""
    movement_count: int | None = None
    """(Classical music only) The movement count of the song."""
    movement_name: str | None = None
    """(Classical music only) The movement name of the song."""
    movement_number: int | None = None
    """(Classical music only) The movement number of the song."""
    name: str
    """(Required) The localized name of the song."""
    play_params: PlayParameters | None = None
    """When present, this attribute indicates that the song is available to play with an Apple Music subscription. The value map may be used to initiate playback. Previews of the song audio may be available with or without an Apple Music subscription."""
    previews: list[Preview]
    """(Required) The preview assets for the song."""
    release_date: datetime | str | None = Field(
        default=None,
        union_mode="left_to_right",
    )
    """The release date of the song, when known, in YYYY-MM-DD or YYYY format. Prerelease songs may have an expected release date in the future."""
    track_number: int | None = None
    """The number of the song in the album's track list."""
    url: str | None = None
    """(Required) The URL for sharing the song in Apple Music.

    Cider sometimes doesn't provide this field.
    """
    work_name: str | None = None
    """(Classical music only) The name of the associated work."""

    # undocumented fields (lmao)
    # see also: https://github.com/WorldObservationLog/AppleMusicDecrypt/blob/f357e3ce3cbdac9/src/models/song_data.py

    audio_locale: str | None = None
    """Undocumented."""
    audio_traits: list[str] | None = None
    """Undocumented.

    Seems to be equivalent to `audio_variants`.
    """
    extended_asset_urls: ExtendedAssetUrls | None = None
    """Undocumented."""
    has_time_synced_lyrics: bool | None = None
    """Undocumented."""
    is_mastered_for_itunes: bool | None = None
    """Undocumented.

    Seems to be equivalent to `is_apple_digital_master`.
    """
    is_vocal_attenuation_allowed: bool | None = None
    """Undocumented."""
