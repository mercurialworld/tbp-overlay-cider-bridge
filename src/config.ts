export const Config = {
    // Cider websocket/API
    cider_url: "http://127.0.0.1", // MUST have protocol (socket.io)
    cider_port: 10767,
    cider_app_token: "nq1y1291jcnspri8i4d32z4l",

    // Parrot's overlay
    parrot_url: "127.0.0.1", // MUST NOT have protocol (websocket)
    parrot_port: 8989,
};

export const CIDER_SOCKET_URL = `${Config.cider_url}:${Config.cider_port}`;
export const CIDER_API_URL = `${Config.cider_url}:${Config.cider_port}/api/v1/playback/now-playing`;
