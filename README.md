# VOLYPAD

**Powering the next generation of tokens.**

[![Live site](https://img.shields.io/badge/live-volypad.xyz-82fac5?style=flat-square&labelColor=02150f)](https://volypad.xyz)

## Overview

VOLYPAD is a single-page front end for the Elysium ecosystem: a pinned contract-address slot, a live price board built from open market feeds, and a pinned row for the VOLYPAD asset itself.

- **Chain:** Elysium (chain ID 99901, `0x1863d`, currency HYPE)
- **RPC:** https://rpc.elysium.kinetiq.xyz
- **Explorer:** https://explorer.elysium.kinetiq.xyz
- **Contract address:** `TBA` (not announced yet)

## Features

- Copy-to-clipboard contract address slot, inert until an address is stated
- Live board of the ten busiest Elysium pools: logo, price, 24h change, turnover, depth, per-row address copy
- Scrolling ticker fed by the same data
- Pinned own-asset row that wakes up when the contract address is set
- Polls every 60 seconds, pauses while the tab is hidden, backs off on errors and keeps the last good data
- Respects `prefers-reduced-motion`

## Links

- Site: https://volypad.xyz
- X: https://x.com/volypad
- Whitepaper: [docs/whitepaper.md](docs/whitepaper.md)

## Development

```bash
npm run build   # writes the deployable site to dist/
```

Facts that can change live in one place: `src/js/register.js`. To announce the contract address, set `ca.state` to `'stated'` and `ca.value` to the `0x` address, then rebuild.

## License

MIT, see [LICENSE](LICENSE).
