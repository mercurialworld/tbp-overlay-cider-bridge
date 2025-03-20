# tbp-overlay-cider-bridge

A TypeScript wrapper for [Cider 2.0's](https://cider.sh) Websocket/API, meant for use with [TheBlackParrot's](https://theblackparrot.me) [stream overlays](https://theblackparrot.me/overlays).

TypeScript is chosen because JavaScript scares me.

## Setup

Due to sheer laziness, all configuration is done in `src/config.ts`.

This project was created using `bun init` in bun v1.0.6. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/main.ts
```
## Known issues

- Song metadata isn't set/sent on successful Cider/overlay socket connection
- There might be a problem with song metadata being behind by a song
    - I'm running on 3 hours of sleep so this might be my bad
