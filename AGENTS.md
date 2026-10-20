<!-- AGENTS.md -->

# AGENTS.md — Hush Your Money

## Verification contract
- State only facts verified by a file path, command output, or cited source.
- When a fact is not verified, output exactly: `CONFIDENCE: 0 — I need the following verified before I proceed:` followed by the missing items.
- Use the minimum diff that preserves behavior, comments, debug code, fallbacks, and blank-line structure.
- Do not read large binary assets into context; verify them with metadata commands.
- Do not edit `/home/shomari/.pi/agent/AGENTS.md` unless the user explicitly names that path.

## Project identity
- Repo path: `/Workspace/apecsdev/hushyourmoney`.
- Git remote: `git@github.com:nyusternie/hushyourmoney.git`; branch: `master`.
- Code migration commit from this session: `9c6db6f95897b379c3af16ddcfc52fc62efda836` (`Migrate off retired bchn.fullstack.cash/v5 REST API`).
- App: Nuxt 3 in `web/`; production server runs `node .output/server/index.mjs` on port `3000` (source: `web/Dockerfile`; smoke test this session).
- Site title: `Hush Your Money — Spend Privately. Fearlessly!` (source: `web/nuxt.config.ts`; live homepage check this session).
- Live URLs from `README.md`: `https://hushyourmoney.com`, `https://hushyourmoney.app.runonflux.io`, `https://shuffle.cash` redirect, `https://blender.cash` redirect.

## Flux and DNS state verified this session
- Flux app name: `hushyourmoney`; owner: `1JmYudcWEfTPNURBQZ2vDaxMKwNNVnexxR`; image: `nyusternie/hushyourmoney:latest`; ports `31337` to `3000`; 3 instances; spec v8.
- Flux subscription expiry observed this session: blockheight `3071304`; re-check the dashboard before acting because expiry is blockheight-based.
- DNS: registrar stayed at Namecheap; nameservers are Cloudflare `javier.ns.cloudflare.com` and `lina.ns.cloudflare.com`.
- HTTPS was verified through public resolvers and Cloudflare edge. Observed A records: `172.64.80.1`, `104.21.58.154`, `172.67.161.121`. Edge certificate: Let's Encrypt, CN `hushyourmoney.com`, SAN `*.hushyourmoney.com` and `hushyourmoney.com`.
- `http://hushyourmoney.com` redirects to HTTPS with a 301.

## Blockchain API migration state
- `bchn.fullstack.cash/v5` is retired. Do not add `restURL: https://bchn.fullstack.cash/v5/` back.
- `PSF_JWT_AUTH_TOKEN` is retired. Do not add it back. Verification command: `grep -R "PSF_JWT_AUTH_TOKEN" web --include='*.ts' --include='*.vue' --include='*.js'`; source files return no matches. Ignored build artifact `web/.nuxt/types/schema.d.ts` returned one stale generated match this session.
- bch-js remains for local cryptography only: `new BCHJS()` in `web/stores/wallet.ts`, `web/server/api/wallet.get.ts`, `web/server/middleware/03-wallet.ts`, and `web/pages/admin/liquidity.vue`.
- Broadcast path: `web/stores/wallet/broadcast.ts` posts JSON `{ "txHex": "<hex>" }` to `${psfApiUrl}/v6/fulcrum/tx/broadcast`.
- `psfApiUrl` source: `runtimeConfig.public.psfApiUrl` in `web/nuxt.config.ts`; default `https://bch.fullstack.cash`; runtime override `NUXT_PUBLIC_PSF_API_URL`.
- The container requires no environment variables. Optional override: `NUXT_PUBLIC_PSF_API_URL`.
- Broadcast success shape verified from `Permissionless-Software-Foundation/psf-bch-api` tests: HTTP 200 with `{ "txid": "..." }`. The deployed code also accepts a bare string response defensively.
- Live probing of `https://bch.fullstack.cash` hit rate limiting/timeouts during this session; treat repo tests plus prior endpoint probes as the verified source and re-probe with backoff before changes.
- `web/stores/wallet/sendBch.ts` still contains old v5 constants and was left unchanged because it is not imported by the audited wallet flow. Re-audit imports before deleting it.
- `@nexajs/wallet` was not replaced in this session. Container logs showed Nexa `listUnspent`/`updateAssets` errors; the user deferred that library to a later session.

## Electrum proxy state
- Endpoint: `web/server/api/electrum.post.ts`; it proxies JSON-RPC through `electrum-cash`.
- `electrum-cash@3.2.0` default from the deployed image: TCP_TLS port `50002`. Explicit override in code: `electron.jochen-hoenicke.de:51002`.
- Server probes from this sandbox with TLS plus `server.version`:
  - `bch.imaginary.cash:50002` answered `Fulcrum 2.1.4`.
  - `electroncash.dk:50002` answered `Fulcrum 2.1.4` with a self-signed certificate.
  - `electron.jochen-hoenicke.de:51002` answered `Fulcrum 2.1.2`.
  - `electrum.imaginary.cash:50002` answered `Fulcrum 2.1.3`.
  - `electroncash.de:50002` did not connect.
- Live Flux check through `https://hushyourmoney.com/api/electrum`: one transient 500 said available clients `1` were below required confidence `2`; later `blockchain.scripthash.listunspent` returned 3/3 and `blockchain.scripthash.get_history` returned 3/3 with real chain data. Re-probe before editing the server list.

## Build, release, and sync rules
- Build from `web/`: `cd web && docker build -t nyusternie/hushyourmoney:latest .`
- Use `--no-cache` when a new digest is required from unchanged source.
- Smoke test: run the image on local port `3000`; require HTTP 200 from `/` and `/api/wallet`; require the title `Hush Your Money — Spend Privately. Fearlessly!`.
- Push: `docker push nyusternie/hushyourmoney:latest`; then confirm `GET https://hub.docker.com/v2/repositories/nyusternie/hushyourmoney/tags/latest` shows a new `digest` and `last_updated`.
- Source/image sync: commit source changes to `master`, push `origin master`, rebuild the image, push the image, and verify the Hub digest before declaring release complete.
- After a new digest is pushed, check the Flux dashboard for rollout. Do not declare the live site updated until `https://hushyourmoney.com` serves the new behavior.

## Docker Hub metadata and security review facts
- Docker Hub overview was published this session with `PATCH /v2/repositories/nyusternie/hushyourmoney/`; public read-back showed `full_description` length `1172`.
- Docker Hub tag description write with `PATCH /v2/repositories/nyusternie/hushyourmoney/tags/latest` returned HTTP 405; tag metadata is push-generated.
- Public repos under `nyusternie` from `GET /v2/repositories/nyusternie/`: `apecs` last push `2024-11-23T23:12:05Z`, `wally-dice` last push `2024-09-12T12:13:23Z`, `hushyourmoney` last push `2024-08-29T09:42:20Z` before this session and `2026-10-20T08:55:19.64511Z` after this session push, `librescript` last push `2024-06-19T16:31:24Z`, `nitolife` last push `2024-06-13T20:54:29Z`.
- Public Docker Hub APIs did not expose last successful login or pull timestamps. Local evidence this session: one bare `docker login` line in shell history without a timestamp; no local `nyusternie/*` images before the build; an auth entry existed in `~/.docker/config.json` during the push. Never copy Docker credentials into this repo.
