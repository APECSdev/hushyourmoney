# HANDOFF — permanent CashShuffle (and CashFusion) daemons on `blackhost`

**From:** nito.cash (APECSdev)
**To:** the hushyourmoney team
**Date:** 2026-11-25
**Status:** design + reference implementation complete in nito.cash; the daemon itself is NOT built.
**Purpose:** deploy permanent liquidity-providing daemons on `blackhost` for the CashShuffle
rounds (and, later, CashFusion), so the pools have a reliable counterparty that is always online.

---

## 0. The one-paragraph ask

Run a long-lived Node.js daemon on `blackhost` that participates in — and can coordinate —
CashShuffle-over-Nostr rounds, holding a small, capped chipnet liquidity float. The daemon is a
Nostr client (NIP-59 gift wrap + NIP-44 v2), not a server: it joins the relay pool, registers,
shuffles, signs and broadcasts exactly like a browser peer. Later the same daemon gains the
CashFusion six-phase round. The nito.cash client remains the final approval for any deployed
result.

---

## 1. What is already built (nito.cash, `apps/web`)

| module | path | what it does |
|---|---|---|
| Protocol core | `src/lib/cashshuffle/protocol.js` | transport-free round state machine: `REGISTER → POOL → ANNOUNCEMENT → SHUFFLE → SIGNING → BROADCAST`; deterministic coordinator = lowest ephemeral pubkey; coordinator-only announce/broadcast; N-1 blame aborts before broadcast; `snapshot()` for the UI |
| Event signing | `src/lib/nostr/event.js` | canonical event serialization, SHA-256 id, BIP-340 Schnorr sign/verify |
| NIP-44 v2 | `src/lib/nostr/nip44.js` | secp256k1 ECDH, HKDF-SHA256 (`nip44-v2` salt + nonce info), ChaCha20, HMAC-SHA256, length-prefixed padding, versioned base64 payload, MAC + wrong-key rejection; accepts x-only (32-byte) Nostr pubkeys |
| NIP-59 | `src/lib/nostr/nip59.js` | rumor → kind-13 seal → kind-1059 gift wrap; recipient unwrap with signature + sender checks; x-only `p` tag |
| Relay client | `src/lib/nostr/relay.js` | WebSocket: `EVENT`/`REQ`/`CLOSE`/`AUTH`; per-id pending map for `OK`; subscribe/route/unsubscribe; NIP-42 challenge + signed AUTH; NOTICE; reopen resubscribe |
| Desk demo | `src/views/Concierge/Desk/CashShuffle.vue` | live protocol demo (5 players, phase rail, coordinator tag, blame tally, abort banner) |
| Design | nito.cash `docs/CASHSHUFFLE-NOSTR-DESIGN.md` | finalized transport, coordinator, phases, equal amounts, pool-native lock batching, threat model, open questions, acceptance |

Tests (all green on the `apecsdev` VM): protocol 8, NIP-44 6, NIP-59 5, relay 6, Desk 15.
Full suite at handoff: **650/651** (one known `lib-misc` discovery flake; passes in isolation).

**What is NOT built:** the daemon process, its systemd unit, the wallet/liquidity accounting, the
round persistence, the CashFusion implementation, and the production relay set.

---

## 2. The daemon's job (CashShuffle)

### 2.1 Role
A permanent peer. It can be the coordinator whenever its ephemeral pubkey is the lowest in the
pool. It never holds other peers' keys and never signs for them; it relays and participates.

### 2.2 Per-round flow
1. **Announce / join** — the daemon publishes its ephemeral key and equal-amount input to the
   round (out-of-band invite first; kind-22230 discovery is design-only).
2. **Pool** — the daemon waits for `N` peers (floor **5**, the design constant).
3. **Announcement** — if coordinator, publish the phase event.
4. **Shuffle** — contribute the onion-wrapped output list; relay others' packets.
5. **Sign** — Schnorr-sign the final transaction (`SIGHASH_ALL|FORKID`).
6. **Broadcast** — the coordinator broadcasts; every peer can verify the txid.
7. **Blame** — on a missing/invalid packet, unicast `Blame { accused_key, reason }`; N-1 matching
   blames exclude the accused and abort **before** broadcast.

### 2.3 Liquidity
- One equal-amount input per round (the classic CashShuffle model); the fee is proportional.
- A capped float per round and a global cap; the daemon never risks more than the cap.
- **Pool-native lock batching** (the composition): the round's outputs ARE the role-2 tagged fuel
  UTXOs. Each output becomes a 15,000-sat tagged fuel UTXO; the tag identifies which fuel output
  (the action's outpoints reveal that anyway), never which funder. The round therefore pays the
  pool's lock fee as part of the shuffle.

### 2.4 Transport
- NIP-59 gift wrap (kind 1059) + NIP-44 v2; fresh ephemeral key per message.
- Relay set: the production set is an open question; the research measured
  `relay.damus.io` + `nos.lol` (1/2 connected), `relay.primal.net`, `nostr.mom`, `offchain.pub`
  (5-party full round, 10/10 signatures). Free relays throttle bursts: **80 ms per event per
  connection**.
- NIP-42 AUTH: damus advertises it; the current nito relay client captures the challenge and can
  send the signed AUTH event, but the production policy is still open.
- Subscription window must cover NIP-59's **2-day created_at backdating**.

---

## 3. `blackhost` deployment facts (verified 2026-11-25)

| fact | value |
|---|---|
| ssh alias | `blackhost` (`root@212.104.141.173:22`) |
| OS / kernel | Ubuntu, Linux 6.8.0-146-generic x86_64 |
| Node | v22.20.0 |
| init | systemd 255 |
| home | `/root` — `apps/`, `build/`, `gate/`, `backups/` already present |
| inbound | none required (the daemon is an outbound WebSocket client) |
| funding | the APECS faucet hot wallet (chipnet, 423,000 sats at the 2026-11-24 record) |

The daemon should live under `/root/apps/cashshuffle-daemon/` with a systemd unit
`cashshuffle-daemon.service` (`Restart=always`, `EnvironmentFile=/root/apps/cashshuffle-daemon/.env`,
`WorkingDirectory=/root/apps/cashshuffle-daemon`). Logs via `journalctl -u cashshuffle-daemon`.

---

## 4. Daemon implementation sketch

```
cashshuffle-daemon/
  package.json
  .env                      # NEVER committed
  src/
    main.js                 # the loop: relay pool, round, liquidity
    relay-pool.js           # N relays, reconnect, 80 ms outbox, dedupe
    round.js                # the protocol state machine (port of nito's protocol.js)
    wallet.js               # UTXO selection, equal-amount input, signing, broadcast
    notes.js                # the pool notes / tags / carriers (role-2)
    metrics.js              # round count, relay health, balance, caps
  systemd/cashshuffle-daemon.service
```

The nito modules are MIT-licensed and can be copied or imported; they have no Vue dependency.
The daemon should reuse the **same** NIP-44/NIP-59 code so the wire format is byte-identical.

### 4.1 Environment (proposed)
```
NOSTR_RELAYS=wss://relay.damus.io,wss://nos.lol
CASHshuffle_POOL_SIZE=5
CASHshuffle_AMOUNT_SATS=100000
CASHshuffle_FEE_RATE=1
CASHshuffle_NETWORK=chipnet
CASHshuffle_SEED_FILE=/root/apps/cashshuffle-daemon/.seed
CASHshuffle_POOL_CATEGORY=480e30ff1d3f5f0b6fe9dd2dbe363b1776f61566f29a395628d0b50abd01b9d0
CASHshuffle_MAX_ROUNDS=...
CASHshuffle_MAX_FLOAT_SATS=...
```

### 4.2 Keys
- **Nostr**: a per-round ephemeral key; the daemon identity key only for NIP-42 AUTH.
- **BCH**: a dedicated daemon wallet (chipnet); the seed in a root-only file (`chmod 600`).
- The wallet key never touches the relay; only the ephemeral session keys do.

---

## 5. The pool side (role-2 tagged pool)

- Category `480e30ff1d3f5f0b6fe9dd2dbe363b1776f61566f29a395628d0b50abd01b9d0`.
- Program P2SH32 `aa203e40b64cff154d4b3305e8c8cc4e3174bc595ad74342a8445a9a7798b7be3a2987`.
- Guard `aa2066a238ad4109a3093c34fd4cf9b4167b0058375d4ad1c5cc44cd253d3664f0c187`.
- Vending machine `aa206b51396304b3bd4e0e9c254f84d1ee80d83a5c7ccaf3750883d00866480d981287`
  (1,000 sats per blank, category-pinned, no operator signature).
- Shape: 3 inputs (fuel 0, fuel 1, state 2), no signatures; 169-B carrier;
  tags `SHA256(nf0_LE ‖ nf1_LE)`; 2 blanks per lock; 15,000 sats per fuel.
- Lifecycle confirmed: SHIELD `9d9aa97a…` → TRANSFER `5262417b…` → UNSHIELD `e54d19fb…`.
- **The proving assets are not in the nito repo.** The Hush solo-ceremony VK `05250429…`,
  zkey `4a4e2543…`, wasm `8595b434…` must be handed over before the nito client can prove;
  the daemon can still **coordinate/relay** rounds and hold/sell blanks without them.

---

## 6. CashFusion (eventually)

The same daemon should grow a CashFusion mode: the six-phase round (Announce, Election,
Registration, Mixnet, Assembly, Signing) with the measured constants — 5-party `10 in / 10 out`,
`1,760 B`, `fee 5,000 sats`, `10/10 signatures`; 7-party `14/14`; chipnet G2b `428 B · 2,000 sats`;
relays `damus.io + nos.lol` (1/2); 80 ms pacing; `MIN_PARTICIPANTS=5`; kind-22230 design-only;
NIP-42 missing; **G4 (mainnet opt-in beta) NOT built**. The existing CashFusion pool is NOT
supported.

---

## 7. Acceptance

1. **Protocol**: a 5-peer chipnet round on the daemon + nito browser peers: 5 equal inputs →
   5 equal outputs, all Schnorr-signed, one broadcast txid, no relay sees a wallet key.
2. **Reliability**: 24 h uptime, reconnect after a relay drop, 80 ms pacing, no relay bans.
3. **Liquidity**: the daemon joins 10 consecutive rounds within its cap; the balance and caps are
   visible in the metrics.
4. **Pool-native lock batching**: the shuffled outputs become the tagged fuel UTXOs of 5 role-2
   actions; the nito client scans them and the actions pass the BCH-2026 VM.
5. **The nito.cash client is the final approval** for any deployed result.

---

## 8. Open questions (must be decided before production)

- The production relay set (and whether to run a project relay).
- NIP-42 AUTH policy per relay.
- The discovery kind/tag schema (kind 22230 is design-only).
- Coordinator rotation (always lowest key, or per-phase).
- The protobuf ↔ Nostr packet mapping (one event per packet is the default).
- The daemon's liquidity cap and the fee budget.
- The CashFusion implementation scope (G4 is not built).

---

## 9. Contacts / coordination

- nito.cash reference implementation: `apps/web/src/lib/cashshuffle/` + `src/lib/nostr/`.
- Design: nito.cash `docs/CASHSHUFFLE-NOSTR-DESIGN.md`.
- Role-2 pool handoff: `docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md` (this repo).
- `blackhost` is the deployment host; the daemon is NOT yet deployed.

— APECSdev / nito.cash, 2026-11-25
