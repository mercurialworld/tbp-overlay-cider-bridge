import { io } from "socket.io-client";
import { WebSocketServer } from "ws";
import {
    CiderAPIError,
    CiderAPIResponse,
    CiderPlaybackStatus,
    CiderPlayerStatus,
    PlaybackPlayingData,
    PlaybackSongsAttributes,
    PlaybackStoppedData,
    PlaybackTimeChangeData,
} from "./types/cider";
import { CIDER_API_URL, CIDER_SOCKET_URL, Config } from "./config";
import {
    ParrotAlbum,
    ParrotAlbumArt,
    ParrotStateData,
    ParrotTrackData,
} from "./types/parrot";

class SocketDataHandler {
    trackData: ParrotTrackData | null;
    stateData: ParrotStateData | null;
    isPlaying: boolean;

    constructor() {
        this.trackData = null;
        this.stateData = null;
        this.isPlaying = false;
    }

    async getAlbumArtRaw(imageUrl: string): Promise<ParrotAlbumArt> {
        console.log("obtained image");

        // requires bun
        const res = await fetch(imageUrl, { method: "GET" })
            .then((res) => res.blob())
            .then((blob) => blob.arrayBuffer())
            .then((blobArrayBuf) => Buffer.from(blobArrayBuf))
            .then((blobBuf) => blobBuf.toString("base64"));

        // i'm just going to assume it's a jpg
        return {
            type: "image/jpeg",
            data: res,
        };
    }

    processYear(date: string): number {
        var theDate = new Date(date);
        return theDate.getFullYear();
    }

    async updateTrackData(data: PlaybackSongsAttributes) {
        var image;
        if ("artwork" in data) {
            image = await this.getAlbumArtRaw(data.artwork.url);
        }
        var albumData: ParrotAlbum = {
            name: data.albumName,
        };

        if (data.releaseDate) {
            albumData = {
                name: albumData.name,
                year: this.processYear(data.releaseDate),
            };
        }

        this.trackData = {
            id: data.url,
            title: data.name,
            artists: [data.artistName],
            duration: data.durationInMillis,
            album: albumData,
            art: image,
        };
    }

    updateStateData(data: PlaybackPlayingData | PlaybackStoppedData) {
        var playbackTime = data.attributes?.currentPlaybackTime | 0;
        this.isPlaying =
            data.state === "paused" || data.state === "stopped" ? false : true;

        this.stateData = {
            playing: this.isPlaying,
            elapsed: playbackTime * 1000,
        };
    }

    updatePlaybackTime(data: PlaybackTimeChangeData) {
        this.stateData = {
            playing: this.isPlaying,
            elapsed: data.currentPlaybackTime * 1000,
        };
    }

    sendStateData(): string {
        return JSON.stringify({ event: "state", data: this.stateData });
    }

    sendTrackData(): string {
        return JSON.stringify({ event: "track", data: this.trackData });
    }
}
const socketData = new SocketDataHandler();

const parrotSocket = new WebSocketServer({
    host: Config.parrot_url,
    port: Config.parrot_port,
});
const socketClients: any[] = [];

parrotSocket.on("connection", async (socket, req) => {
    console.log("Connected to TheBlackParrot's overlay suite!");
    socketClients.push(socket);

    // TODO: send track data on connection
    if (socketData.trackData !== null) {
        socket.send(socketData.sendTrackData());
    }

    socket.on("close", function () {
        console.log("Overlay disconnected");
        socketClients.splice(socketClients.indexOf(socket), 1);
    });
});

const ciderSocket = io(CIDER_SOCKET_URL);

ciderSocket.on("connect", async () => {
    console.log("Connected to Cider!");

    // TODO: set trackdata to result of this
    const songPlayingOnConnection = await fetch(CIDER_API_URL, {
        method: "GET",
        headers: { apptoken: Config.cider_app_token },
    }).then((res) => res.text());

    console.log(songPlayingOnConnection);

    if (typeof songPlayingOnConnection === "string") {
        const theSong: CiderAPIResponse | CiderAPIError = JSON.parse(
            songPlayingOnConnection,
        );

        if ("info" in theSong) {
            socketData.updateTrackData(theSong.info);
            socketClients.forEach((socket) => {
                socket.send(socketData.sendTrackData());
            });
        }
    }
});

ciderSocket.on(
    "API:Playback",
    async (res: CiderPlaybackStatus | CiderPlayerStatus) => {
        switch (res.type) {
            // new song
            case "playbackStatus.nowPlayingItemDidChange":
                console.log(
                    `playing ${res.data.name} by ${res.data.artistName} on ${res.data.albumName} (${res.data.releaseDate})`,
                );

                socketData.updateTrackData(res.data);
                socketClients.forEach((socket) => {
                    socket.send(socketData.sendTrackData());
                });

                break;

            // playing/paused
            case "playbackStatus.playbackStateDidChange":
                console.log(`playback state is ${res.data.state}`);

                socketData.updateStateData(res.data);
                socketClients.forEach((socket) => {
                    socket.send(socketData.sendStateData());
                });

                if (res.data.attributes && res.data.state === "playing") {
                    console.log(`setting data for ${res.data.attributes.name}`);

                    socketData.updateTrackData(res.data.attributes);
                    socketClients.forEach((socket) => {
                        socket.send(socketData.sendStateData());
                    });
                }

                break;
            // playback time
            case "playbackStatus.playbackTimeDidChange":
                // console.log(`${res.data.currentPlaybackTime}`);

                socketData.updatePlaybackTime(res.data);
                socketClients.forEach((socket) => {
                    socket.send(socketData.sendStateData());
                });

                break;
            // literally anything else
            default:
                console.log(`state is ${res.type}, ignoring`);
                break;
        }
    },
);
