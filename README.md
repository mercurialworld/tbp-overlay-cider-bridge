# tbp-overlay-cider-bridge

A TypeScript wrapper for [Cider 2.0's](https://cider.sh) Websocket/API, meant for use with [TheBlackParrot's](https://theblackparrot.me) [stream overlays](https://theblackparrot.me/overlays).

TypeScript is chosen because JavaScript scares me.

## Setup

Download the latest release from the releases page, and extract everything into its own folder. Make sure you rename `config.sample.json` to `config.json` and configure your Cider/overlay websocket things there.

Then, run the `tbpciderbridge` executable.

## Development

This project was created using `bun init` in bun v1.0.6. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/main.ts
```
# License

Like the overlay this program is meant for, this program is licensed under Version 3 of the GNU Affero General Public License.

```
Cider Bridge Script for TheBlackParrot's Stream Overlays
Copyright (C) 2025 mercurialworld 

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```

