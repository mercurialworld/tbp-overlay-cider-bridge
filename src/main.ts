import { io } from "socket.io-client";
import { WebSocketServer } from "ws";

const CIDER_URL = "http://127.0.0.1";
const CIDER_PORT = 10767;
const CIDER_SOCKET_URL = `${CIDER_URL}:${CIDER_PORT}`;
const CIDER_API_URL = `${CIDER_URL}:${CIDER_PORT}/api/v1/playback/now-playing`;
const APP_TOKEN = "cxyh6srur1uimz0zcdf3nqm7";

const PARROT_URL = "http://127.0.0.1";
const PARROT_PORT = 8989;

const cider_socket = io(CIDER_SOCKET_URL);
// const parrot_socket = new WebSocketServer({ host: PARROT_URL, port: PARROT_PORT});

cider_socket.on("connect", async () => {
    console.log("Connected to Cider!");

    const res = await fetch(CIDER_API_URL,  {
        method: "POST",
        headers: {"apptoken": APP_TOKEN}
    });
});

cider_socket.on("API:Playback", ({type, data}) => {
    console.log(`type: ${type}`);
    console.log(data);
});