import { io, Socket } from "socket.io-client";
import { WebSocketServer } from "ws";
import {
    CiderAPIResponse,
    CiderPlaybackStatus,
    PlaybackPlayingData,
    PlaybackSongsAttributes,
    PlaybackStoppedData,
    PlaybackTimeChangeData,
} from "./types/cider";
import {
    ParrotAlbum,
    ParrotAlbumArt,
    ParrotStateData,
    ParrotTrackData,
} from "./types/parrot";
import { Artwork } from "./types/applemusic";
import { platform } from "os";

class SocketDataHandler {
    trackData: ParrotTrackData | null;
    stateData: ParrotStateData | null;
    isPlaying: boolean;

    constructor() {
        this.trackData = null;
        this.stateData = null;
        this.isPlaying = false;
    }

    async getAlbumArtRaw(imageData: Artwork): Promise<ParrotAlbumArt> {
        console.log(imageData.url);

        var imageUrl = imageData.url.replace(
            "{w}x{h}",
            `${imageData.width}x${imageData.height}`,
        );

        console.log(`Obtained image from URL ${imageUrl}`);

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
            image = await this.getAlbumArtRaw(data.artwork);
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

class OverlayWS {
    parrotServer: WebSocketServer | null;
    socketData: SocketDataHandler;
    socketClients: any[];

    constructor(host: string, port: number, socketData: SocketDataHandler) {
        this.parrotServer = new WebSocketServer({
            host,
            port,
        });
        this.socketData = socketData;
        this.socketClients = [];

        this.parrotServer.on("connection", async (socket, _) => {
            console.log("Connected to TheBlackParrot's overlay suite!");
            this.socketClients.push(socket);

            if (socketData.trackData !== null) {
                console.log(
                    `Sending song ${socketData.trackData.title} via overlay connection`,
                );
                socket.send(socketData.sendTrackData());
            }

            socket.on("close", () => {
                console.log("Overlay disconnected");
                this.socketClients.splice(this.socketClients.indexOf(socket), 1);
            });
        });
    }
}

class CiderSocket {
    ciderSocket: Socket | null;
    overlayWS: OverlayWS;
    socketData: SocketDataHandler;

    constructor(
        socketURL: string,
        apiURL: string,
        appToken: string,
        overlayWS: OverlayWS,
        socketData: SocketDataHandler,
    ) {
        this.ciderSocket = io(socketURL);
        this.overlayWS = overlayWS;
        this.socketData = socketData;

        this.ciderSocket.on("connect", async () => {
            console.log("Connected to Cider!");

            const songPlayingOnConnection = await fetch(apiURL, {
                method: "GET",
                headers: { apptoken: appToken },
            });

            if (songPlayingOnConnection.ok) {
                var txt = await songPlayingOnConnection.text();
                const theSong: CiderAPIResponse = JSON.parse(txt);

                console.log(
                    `Setting song to ${theSong.info.name} via Cider connection`,
                );
                await socketData.updateTrackData(theSong.info);
                this.sendToSockets(this.socketData.sendTrackData());
            }
        });

        this.ciderSocket.on("API:Playback", async (res: CiderPlaybackStatus) => {
            switch (res.type) {
                // new song
                case "playbackStatus.nowPlayingItemDidChange":
                    console.log(
                        `Playing ${res.data.name} by ${res.data.artistName} on ${res.data.albumName} (${res.data.releaseDate})`,
                    );

                    await this.socketData.updateTrackData(res.data);
                    this.sendToSockets(this.socketData.sendTrackData());

                    break;

                // playing/paused
                case "playbackStatus.playbackStateDidChange":
                    console.log(`Playback state is ${res.data.state}`);

                    this.socketData.updateStateData(res.data);
                    this.sendToSockets(this.socketData.sendStateData());

                    break;
                // playback time
                case "playbackStatus.playbackTimeDidChange":
                    socketData.updatePlaybackTime(res.data);
                    this.sendToSockets(this.socketData.sendStateData());

                    break;
                // literally anything else
                default:
                    console.log(`State is ${res.type}, ignoring`);
                    break;
            }
        });
    }

    sendToSockets(data: string) {
        this.overlayWS.socketClients.forEach((socket) => {
            socket.send(data);
        });
    }
}

async function main() {
    const configPath = Bun.file("./config.json");
    const Config = await configPath.json();

    console.log("Config loaded!");
    const CIDER_SOCKET_URL = `${Config.ciderURL}:${Config.ciderPort}`;
    const CIDER_API_URL = `${Config.ciderURL}:${Config.ciderPort}/api/v1/playback/now-playing`;

    const socketData = new SocketDataHandler();
    const parrotSocketServer = new OverlayWS(
        Config.parrotURL,
        Config.parrotPort,
        socketData,
    );
    const ciderSocket = new CiderSocket(
        CIDER_SOCKET_URL,
        CIDER_API_URL,
        Config.ciderAppToken,
        parrotSocketServer,
        socketData,
    );
}

main();
