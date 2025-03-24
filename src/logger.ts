import dayjs from "dayjs";

export enum TerminalColor {
    Reset = "\x1b[0m",
    Bright = "\x1b[1m",
    Dim = "\x1b[2m",
    Underscore = "\x1b[4m",
    Blink = "\x1b[5m",
    Reverse = "\x1b[7m",
    Hidden = "\x1b[8m",

    Black = "\x1b[30m",
    Red = "\x1b[31m",
    Green = "\x1b[32m",
    Yellow = "\x1b[33m",
    Blue = "\x1b[34m",
    Magenta = "\x1b[35m",
    Cyan = "\x1b[36m",
    White = "\x1b[37m",
    Gray = "\x1b[90m",
}

const currentDate = () => dayjs().format("YYYY-MM-DD HH:mm:ss");

String.prototype.colorFormat = function (color: TerminalColor): string {
    return `${color}${this}${TerminalColor.Reset}`;
};

export function logPlayerSocket(message: string) {
    console.log(
        `${`[${currentDate()} PLAYER]`.colorFormat(TerminalColor.Yellow)}\t${message}`,
    );
}

export function logSongData(message: string) {
    console.log(
        `${`[${currentDate()} SONG]`.colorFormat(TerminalColor.Blue)}\t${message}`,
    );
}

export function logOverlay(message: string) {
    console.log(
        `${`[${currentDate()} OVERLAY]`.colorFormat(TerminalColor.Magenta)}\t${message}`,
    );
}

export function logProgram(message: string) {
    console.log(`[${currentDate()} PROGRAM]\t${message}`);
}

export function logDebug(message: string) {
    console.log(
        `${`[${currentDate()} DEBUG]`.colorFormat(TerminalColor.Green)}\t${message}`,
    );
}
