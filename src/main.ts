import { io } from "socket.io-client";
import { WebSocketServer } from "ws";
import { CiderPlaybackStatus, CiderPlayerStatus } from "./types/cider";
import { CIDER_API_URL, CIDER_SOCKET_URL, Config } from "./config";

// const parrot_socket = new WebSocketServer({ host: PARROT_URL, port: PARROT_PORT});
const cider_socket = io(CIDER_SOCKET_URL);

cider_socket.on("connect", async () => {
    console.log("Connected to Cider!");

    const res = await fetch(CIDER_API_URL, {
        method: "POST",
        headers: { apptoken: Config.cider_app_token },
    });
});

cider_socket.on("API:Playback", (res: CiderPlaybackStatus | CiderPlayerStatus) => {
    switch (res.type) {
        // new song
        case "playbackStatus.nowPlayingItemDidChange":
            console.log(
                `playing ${res.data.name} by ${res.data.artistName} on ${res.data.albumName} (${res.data.releaseDate})`,
            );
            break;
        // playing/paused
        case "playbackStatus.playbackStateDidChange":
            console.log(`playback state is ${res.data.state}`);
            break;
        // playback time
        case "playbackStatus.playbackTimeDidChange":
            console.log(`${res.data.currentPlaybackTime}`);
            break;
        // literally anything else
        default:
            console.log(`state is ${res.type}, ignoring`);
            break;
    }
});
