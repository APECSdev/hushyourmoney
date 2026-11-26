<!-- daemons/ROADMAP.md -->
# Daemon roadmap

Status: M0 is done. M1 transport core is implemented and tested; M2–M7 are not started.

## 1. Milestones

| Milestone | Scope | Exit criteria | Depends on | Status |
|---|---|---|---|---|
| **M0 — orchestration** | Tree, plans, acceptance, open questions, config/metrics, stubs, units | `npm test` passes on the apecsdev VM; `git diff --check` clean; no build on this host | — | **done (this commit)** |
| **M1 — shared transport** | Official NIP-44 v2 KDF/padding + `nito-v0` compatibility; NIP-59 timestamp tweaks; relay pool (N relays, 80 ms outbox, dedupe, reconnect, NIP-42) | Official NIP-44 vectors pass; mock-relay tests pass; no network in unit tests | Nito client mode decision (official vs `nito-v0`) | **core done** — 35 shared tests pass; client mode pending |
| **M2 — CashShuffle round** | Protocol engine with `VERIFY` before `SIGNING`; signature verification; timeouts; blame; persistence | A1 (5-peer chipnet round) and A2 (malicious coordinator) pass | M1 | not started |
| **M3 — wallet and liquidity** | Equal-amount UTXO selection; BCH Schnorr 0x41; broadcast; caps; metrics | A4 (10 rounds within cap) and A7 (signature separation) pass | M1 | not started |
| **M4 — pool-native batching** | Tag-pair lock builder; blank acquisition; atomic lock+action; VM-eval; off-chain note delivery | A5 (pairs, correct count) and A6 (blank cost) pass | M3; Nito proving assets; Nito 3-input builder | not started |
| **M5 — operations** | Hardened systemd; metrics endpoint; journald caps; backup/restore; 24 h soak | A3 (24 h uptime) and A9 (hardening) pass | M2, M3 | not started |
| **M6 — CashFusion** | Six-phase round; constants; coordinator avoidance; G4 testnet | CF-A1–CF-A5 pass | M1, M5 | not started |
| **M7 — production** | Security review; mainnet opt-in beta; Gate 7 ceremony for the pool | Nito final approval; Gate 7 record | all | not started |

## 2. Workstreams

| ID | Workstream | Owner | Output |
|---|---|---|---|
| W1 | Nostr transport | Hush + Nito | `shared/src/nostr/*` implemented; 35 tests pass; Nito client mode pending |
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

1. **Round 1 — wire and verification.** NIP-44 padding, NIP-59 timestamps, `VERIFY` phase, registration fields.
2. **Round 2 — round shape and fees.** Tag pairs, 2N outputs, lock fee vs action fee, blank cost.
3. **Round 3 — proving assets and client builder.** Distribution channel, hashes, CORS, 3-input builder, note delivery.
4. **Round 4 — operations and acceptance.** Relay set, NIP-42, blackhost capacity, 24 h soak, Nito final approval.

Each round ends with a committed decision in the relevant `OPEN-QUESTIONS.md` and a status update here.

## 5. Status log

| Date | Change |
|---|---|
| 2026-11-25 | M0 orchestration tree created; no daemon implemented. |
