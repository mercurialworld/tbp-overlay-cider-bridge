# pyright: reportUnknownMemberType=none
import asyncio
import datetime
import json
import logging
import re
from typing import Any, TypedDict

import httpx
import socketio


# https://alexandra-zaharia.github.io/posts/make-your-own-custom-color-formatter-with-python-logging/
class CustomFormatter(logging.Formatter):
    """Logging colored formatter, adapted from https://stackoverflow.com/a/56944256/3638629"""

    grey = "\x1b[38;21m"
    blue = "\x1b[38;5;39m"
    yellow = "\x1b[38;5;226m"
    red = "\x1b[38;5;196m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"

    def __init__(self, fmt: str):
        super().__init__()
        self.fmt = fmt
        self.FORMATS = {
            logging.DEBUG: self.grey + self.fmt + self.reset,
            logging.INFO: self.blue + self.fmt + self.reset,
            logging.WARNING: self.yellow + self.fmt + self.reset,
            logging.ERROR: self.red + self.fmt + self.reset,
            logging.CRITICAL: self.bold_red + self.fmt + self.reset,
        }

    def format(self, record: logging.LogRecord):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt)
        return formatter.format(record)


logger = logging.getLogger(__name__)
cider_io = socketio.AsyncClient()

# TODO: config.txt
cider_req_headers = {"apptoken": "inserttokenhere"}
cider_req_url = "http://localhost:10767/api/v1/playback/now-playing"

# TODO: types.py
parrot_overlay_message = {"event": "", "data": {}}


# this is typescript bitch! we clown in this muthafucka better take your sensitive ass back to javascript
class CiderResponse(TypedDict):
    type: str
    data: Any


def split_artists(artists: str):
    filt = re.compile(r"\s*(?:(?:\band\b|\s&\s)|,)\s*")
    return list(filt.split(artists))


@cider_io.event
async def connect():
    logger.info("hi, cider")

    # on connect, grab the song because cider's websocket doesn't do that
    async with httpx.AsyncClient() as client:
        req = await client.get(cider_req_url, headers=cider_req_headers)

        res = req.json()

        if res.get("status") == "ok":
            song = res["info"].get("name")
            artist = res["info"].get("artistName")
            apple_music_id = res["info"].get("playParams").get("id")

            logger.info(f"API response: {song} by {artist} ({apple_music_id})")


@cider_io.on("API:Playback")  # type: ignore
async def handle_playback(data: CiderResponse):
    match data.get("type"):
        case "playbackStatus.nowPlayingItemDidChange":
            song = data["data"].get("name")
            artist = data["data"].get("artistName")
            apple_music_id = data["data"].get("playParams").get("id")

            logger.info(f"Song: {song} by {artist} ({apple_music_id})")
        case "playbackStatus.playbackTimeDidChange":
            is_playing = data["data"].get("isPlaying")
            song_length = data["data"].get("currentPlaybackDuration")
            time_elapsed = data["data"].get("currentPlaybackTime")

            if is_playing:
                logger.debug(
                    f"Duration: {datetime.timedelta(seconds=int(time_elapsed))} / {datetime.timedelta(seconds=int(song_length))}"
                )
        case "playbackStatus.playbackStateDidChange":
            playback_state: str = data["data"].get("state")

            if playback_state != "seeking":
                song = data["data"]["attributes"].get("name")
                artist = data["data"]["attributes"].get("artistName")

                logger.info(f"{playback_state.title()}: {song} by {artist}")
            else:
                logger.info("Seeking...")
        case (
            "playbackStatus.nowPlayingStatusDidChange"
            | "playerStatus.volumeDidChange"
            | "playerStatus.shuffleModeDidChange"
            | "playerStatus.repeatModeDidChange"
        ):  # this is a now playing overlay i don't need these
            pass
        case val:
            logger.warning(f"Unhandled event type: {val}")


@cider_io.event
async def disconnect():
    print("ok byebye")


async def main():
    await cider_io.connect("http://127.0.0.1:10767")
    await cider_io.wait()


if __name__ == "__main__":
    # Create custom logger logging all five levels
    logger.setLevel(logging.DEBUG)

    # Define format for logs
    fmt = "%(asctime)s | %(levelname)8s | %(message)s"

    # Create stdout handler for logging to the console (logs all five levels)
    stdout_handler = logging.StreamHandler()
    stdout_handler.setLevel(logging.DEBUG)
    stdout_handler.setFormatter(CustomFormatter(fmt))

    # Add handler to the logger
    logger.addHandler(stdout_handler)

    asyncio.run(main())
