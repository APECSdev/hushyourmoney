<!-- daemons/shared/README.md -->
# Shared daemon package

`@hushyourmoney/daemon-shared` holds the code and contracts both daemons use. It is a local npm workspace package; it is not published.

## 1. Modules

| Path | Status | Purpose |
|---|---|---|
| `src/config.js` | implemented | Common env parsing and redaction (`DAEMON_*`, `NOSTR_*`). |
| `src/metrics.js` | implemented | In-process counters and gauges; deterministic snapshots. |
| `src/nostr/` | contract only | Event signing, NIP-44, NIP-59, relay, relay pool. |
| `src/bch/` | contract only | BCH Schnorr signing, UTXO selection, broadcast, role-2 helpers. |

## 2. Vendor pin

The reference implementation is the Nito Cash tree at `../nito.cash/apps/web/src/lib/`.

Current HEAD: `984ca4c` (`git -C ../nito.cash log --oneline -1`).
`transport.js` and `cashshuffle-transport.spec.js` are untracked at that HEAD (`git -C ../nito.cash status --short`). The first implementation round pins the first commit that contains both files, records the commit hash here, and vendors the modules with their MIT notice.

Vendored modules: `cashshuffle/protocol.js`, `cashshuffle/transport.js`, `nostr/event.js`, `nostr/nip44.js`, `nostr/nip59.js`, `nostr/relay.js`.

## 3. NIP-44 decision

The Nito implementation is not the official NIP-44 v2 wire format:

- `nip44.js:32-45` uses a 4-byte BE length prefix and next-power-of-two padding.
- Official NIP-44 v2 uses a 2-byte u16 prefix below 65,536 (6-byte above) and chunked padding (`https://github.com/nostr-protocol/nips/blob/master/44.md`, lines 166-168, 189-211).

The shared package exposes one of two modes:

1. `NIP44_MODE=official` — the official v2 padding. This is the default for interoperability.
2. `NIP44_MODE=nito-v0` — the current Nito padding, explicitly versioned as a private variant. Both peers must set it.

The daemon refuses to start if the two peers disagree. The official mode ships the NIP-44 test vectors from the NIP repository; the private mode ships a round-trip fixture and a compatibility warning.

## 4. NIP-59 timestamp rule

The rumor’s `created_at` is canonical. The seal and gift-wrap timestamps are randomized up to two days in the past; all timestamps are in the past. The subscription uses `since = now - 172800 - 300` (the pattern in `web/stores/p2pfusion/round.ts:122`).

Reference: `../nito.cash/apps/web/src/lib/nostr/nip59.js:37,42-55,76`; NIP-59 line 111.

## 5. Relay pool contract

`src/nostr/relay-pool.js` exports `RelayPool`:

- N relays from `NOSTR_RELAYS`.
- One WebSocket per relay; reconnect with exponential backoff and jitter.
- Per-connection outbox with `NOSTR_RELAY_PACING_MS` (default 80 ms) between events.
- Publish to every relay, or to a quorum when `NOSTR_PUBLISH_QUORUM` is set; the default is every relay.
- Dedupe inbound events by event id; route by subscription id.
- Resubscribe on reconnect with `{ kinds: [1059], '#p': [self], since }`.
- NIP-42 AUTH: `NOSTR_AUTH_POLICY=none|optional|required`; the auth key is a session key, never the wallet key.
- Health snapshot: `{ relay, state, lastOkAt, lastEventAt, reconnects }`.

The current Nito `transport.js` publishes only on `this.clients[0]` (`transport.js:85`), has no 80 ms pacing, no dedupe, and no reconnect (`relay.js:46-51`). The relay pool is new work (CS-4 / W1).

## 6. BCH contract

`src/bch/` exports the wallet and transaction helpers:

- BCH Schnorr with `SIGHASH_ALL|FORKID` (0x41), 64-byte signature + sighash byte. Do not reuse the Nostr BIP-340 signer.
- P2PKH signing through `@bitauth/libauth` (`generateSigningSerializationBCH`, `signMessageHashSchnorr`), matching `../nito.cash/apps/web/src/lib/bch/crypto.js:221-257`.
- Token-aware UTXO listing: `blockchain.scripthash.listunspent` with `include_tokens`/`tokens_only`.
- Broadcast through the chipnet Electrum primary `wss://chipnet.bch.ninja:50004`, fallback `wss://chipnet.imaginary.cash:50004` (`AGENTS.md:511`).
- Role-2 helpers: 169-B carrier, `tag = SHA256(carrier[0..64])`, two fuel UTXOs per action, two blanks per lock, 15,000 sats per fuel.
- Every role-2 action is evaluated in `createVirtualMachineBch2026(false)` (consensus) and `(true)` (standard) before broadcast; any error rejects.

## 7. Config schema

Common:

| Key | Default | Validation |
|---|---|---|
| `DAEMON_LOG_LEVEL` | `info` | `debug`, `info`, `warn`, `error` |
| `DAEMON_METRICS_ADDR` | `127.0.0.1:0` | `host:port` |
| `NOSTR_RELAYS` | `wss://relay.primal.net,wss://nostr.mom,wss://offchain.pub` | non-empty, `ws://` or `wss://` |
| `NOSTR_RELAY_PACING_MS` | `80` | integer 0–5000 |
| `NOSTR_AUTH_POLICY` | `optional` | `none`, `optional`, `required` |

The daemon-specific keys are in `cashshuffle/src/config.js` and `cashfusion/src/config.js`.

## 8. Metrics schema

`Metrics.snapshot()` returns:

```json
{
  "startedAt": 1760000000000,
  "counters": { "cashshuffle_rounds_total{}": 10 },
  "gauges": { "cashshuffle_balance_sats{}": 150000 }
}
```

Keys are sorted; labels are sorted inside the key. The snapshot is safe to log.

## 9. Test plan

- `node --test shared/test/*.test.js` — config and metrics; no network.
- Official NIP-44 vectors (M1).
- NIP-59 round-trip and timestamp-window tests (M1).
- Mock-relay tests for publish, dedupe, pacing, reconnect, AUTH (M1).
- BCH signing vectors and a chipnet round-trip (M3).
- Role-2 VM-eval fixtures (M4).
