import { io } from "socket.io-client";
import { WebSocketServer } from "ws";

const CIDER_URL = "http://127.0.0.1";
const CIDER_PORT = 10767;
const CIDER_SOCKET_URL = `${CIDER_URL}:${CIDER_PORT}`;

const PARROT_URL = "http://127.0.0.1";
const PARROT_PORT = 42069;

const cider_socket = io(CIDER_SOCKET_URL);
const parrot_socket = new WebSocketServer({ host: PARROT_URL, port: PARROT_PORT});

