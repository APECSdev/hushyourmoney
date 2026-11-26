<!-- daemons/ROADMAP.md -->
# Daemon roadmap

Status: M0 is done. M1 transport is done and Nito chose official NIP-44 (`ac61542`); M2 classic round state machine + VERIFY is implemented (signature verification, timeouts and persistence pending) and Nito added the client `VERIFY`; M3 selection/caps + BCH P2PKH signer; M4 carrier/tag/fuel-pair/cost + lock/action builders + the **2N round primitive** (builder/verifier/state machine, 15 tests), the 2N shape is confirmed, and Nito’s role-2 witness acceptance PASSED (`a304d3c`); the store/UI wiring, web-platform acceptance, Electrum broadcast, VM-eval, note delivery, network loop and deployment remain.

## 1. Milestones

| Milestone | Scope | Exit criteria | Depends on | Status |
|---|---|---|---|---|
| **M0 — orchestration** | Tree, plans, acceptance, open questions, config/metrics, stubs, units | `npm test` passes on the apecsdev VM; `git diff --check` clean; no build on this host | — | **done (239d66c)** |
| **M1 — shared transport** | Official NIP-44 v2 KDF/padding + `nito-v0` compatibility; NIP-59 timestamp tweaks; relay pool (N relays, 80 ms outbox, dedupe, reconnect, NIP-42) | Official NIP-44 vectors pass; mock-relay tests pass; no network in unit tests | Nito client mode decision (official vs `nito-v0`) | **core done** — 44 shared tests pass; Nito chose official (`ac61542`) |
| **M2 — CashShuffle round** | Protocol engine with `VERIFY` before `SIGNING`; signature verification; timeouts; blame; persistence | A1 (5-peer chipnet round) and A2 (malicious coordinator) pass | M1 | **partial** — state machine + VERIFY (16 tests); Nito added the client `VERIFY`; signature verification, timeouts, persistence, A1/A2 end-to-end and the network loop pending |
| **M3 — wallet and liquidity** | Equal-amount UTXO selection; BCH Schnorr 0x41; broadcast; caps; metrics | A4 (10 rounds within cap) and A7 (signature separation) pass | M1 | **partial** — selection, funding, caps and BCH P2PKH signer implemented (9 tests); Electrum broadcast pending |
| **M4 — pool-native batching** | Tag-pair lock builder; blank acquisition; 2N round; atomic lock+action; VM-eval; off-chain note delivery | A5 (pairs, correct count) and A6 (blank cost) pass | M3; Nito proving assets; Nito 3-input builder | **partial** — carrier/tag/fuel-pair/cost + lock/action builders (14 tests) + 2N builder/verifier/state machine (15 tests); 2N shape confirmed; Nito witness acceptance PASSED (`a304d3c`); network loop, store/UI wiring, web acceptance, VM-eval and note delivery pending |
| **M5 — operations** | Hardened systemd; metrics endpoint; journald caps; backup/restore; 24 h soak | A3 (24 h uptime) and A9 (hardening) pass | M2, M3 | not started |
| **M6 — CashFusion** | Six-phase round; constants; coordinator avoidance; G4 testnet | CF-A1–CF-A5 pass | M1, M5 | not started |
| **M7 — production** | Security review; mainnet opt-in beta; Gate 7 ceremony for the pool | Nito final approval; Gate 7 record | all | not started |

## 2. Workstreams

| ID | Workstream | Owner | Output |
|---|---|---|---|
| W1 | Nostr transport | Hush + Nito | `shared/src/nostr/*` implemented; 44 tests pass; Nito chose official (`ac61542`) |
| W2 | CashShuffle protocol | Hush | `cashshuffle/src/round.js`, `VERIFY`, blame, persistence |
| W3 | BCH wallet | Hush | `cashshuffle/src/wallet.js`, signing, broadcast, caps |
| W4 | Role-2 pool composition | Hush + Nito | `cashshuffle/src/pool.js`, tag pairs, blanks, VM-eval |
| W5 | Operations | Hush | systemd, metrics, logs, backup, 24 h soak |
| W6 | CashFusion | Hush | `cashfusion/src/round.js`, G4 testnet |
| W7 | Nito integration | Nito | proving assets, 3-input builder, note delivery, final approval |
| W8 | Documentation and security review | Hush + Nito | runbook, threat model, review record |

## 3. Dependency graph

```
M0 orchestration
   │
   ├── W1 transport ── M1
   │       │
   │       ├── W2 round ── M2
   │       │       │
   │       │       └── W5 operations ── M5
   │       │
   │       └── W3 wallet ── M3
   │               │
   │               └── W4 pool composition ── M4
   │                       │
   │                       └── W7 Nito integration
   │
   └── W6 CashFusion ── M6 (after M1 + M5)
```

## 4. Round cadence with Nito

Each round has one decision record and one code/doc change:

1. **Round 1 — wire and verification.** NIP-44 KDF + padding, NIP-59 timestamps, client-side `VERIFY`, registration fields.
2. **Round 2 — round shape and fees.** Pool-native 2N round shape, lock fee vs action fee, blank cost.
3. **Round 3 — proving assets and client builder.** Pin the public release, CORS/caching, 3-input builder, note delivery.
4. **Round 4 — operations and acceptance.** Relay set, NIP-42, blackhost capacity, 24 h soak, Nito final approval.

Each round ends with a committed decision in the relevant `OPEN-QUESTIONS.md` and a status update here.

## 5. Status log

| Date | Change |
|---|---|
| 2026-11-25 | M0 orchestration tree created; no daemon implemented. |
| 2026-11-26 | M1 transport, M2 round, M3 selection/signer and M4 role-2 builders + 2N round primitive implemented; 112/112 tests on blackhost; Nito handoff updated in `1c4946e`; Nito answered in `afd6b27` (official NIP-44 `ac61542`, client VERIFY, 2N shape, proving acceptance `a304d3c`, NIP-42 `d85bade`). |
