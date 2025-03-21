import { io } from "socket.io-client";
import { WebSocketServer } from "ws";
import {
    CiderAPIError,
    CiderAPIResponse,
    CiderPlaybackStatus,
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
        console.log("Obtained image");

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
        if (
            data.name === this.trackData?.title &&
            data.artistName === this.trackData.artists[0]
        ) {
            console.log("The song metadata hasn't changed, returning");
            return;
        }

        var image;
        if ("artwork" in data && data.artwork.url) {
            image = await this.getAlbumArtRaw(data.artwork.url);
        }
        var albumData: ParrotAlbum = {
            name: data.albumName,
            year: null,
        };

        if (data.releaseDate) {
            albumData = {
                name: albumData.name,
                year: this.processYear(data.releaseDate),
            };
        }

        this.trackData = {
            id: data.playParams.id,
            title: data.name,
            artists: [data.artistName],
            duration: data.durationInMillis,
            album: albumData,
            art: image,
            isrc: data.isrc ? data.isrc.substring(data.isrc.length - 12) : null,
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

    if (socketData.trackData !== null) {
        console.log(
            `Sending song ${socketData.trackData.title} via overlay connection`,
        );
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

    const songPlayingOnConnection = await fetch(CIDER_API_URL, {
        method: "GET",
        headers: { apptoken: Config.cider_app_token },
    });

    if (songPlayingOnConnection.ok) {
        var txt = await songPlayingOnConnection.text();
        const theSong: CiderAPIResponse = JSON.parse(txt);

        console.log(`Setting song to ${theSong.info.name} via Cider connection`);
        await socketData.updateTrackData(theSong.info);
        socketClients.forEach((socket) => {
            socket.send(socketData.sendTrackData());
        });
    }
});

ciderSocket.on("API:Playback", async (res: CiderPlaybackStatus) => {
    switch (res.type) {
        // new song
        case "playbackStatus.nowPlayingItemDidChange":
            console.log(
                `Playing ${res.data.name} by ${res.data.artistName} on ${res.data.albumName} (${res.data.releaseDate})`,
            );

            await socketData.updateTrackData(res.data);
            socketClients.forEach((socket) => {
                socket.send(socketData.sendTrackData());
            });

            break;

        // playing/paused
        case "playbackStatus.playbackStateDidChange":
            console.log(`Playback state is ${res.data.state}`);

            socketData.updateStateData(res.data);
            socketClients.forEach((socket) => {
                socket.send(socketData.sendStateData());
            });

            break;
        // playback time
        case "playbackStatus.playbackTimeDidChange":
            socketData.updatePlaybackTime(res.data);
            socketClients.forEach((socket) => {
                socket.send(socketData.sendStateData());
            });

            break;
        // literally anything else
        default:
            console.log(`State is ${res.type}, ignoring`);
            break;
    }
});
