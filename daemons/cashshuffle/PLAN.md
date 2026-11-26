<!-- daemons/cashshuffle/PLAN.md -->
# CashShuffle daemon plan

Status: M0 orchestration + M1 transport core + M2 round core. CS-1–CS-4 are implemented in `daemons/shared/src/nostr/` and covered by 35 shared tests; CS-5 is implemented as a state machine with 16 tests (the network loop is pending); CS-6–CS-12 are not started.

Owner key: **H** = Hush, **N** = Nito, **J** = joint.

## 1. Tasks

| ID | Task | Owner | Depends on | Exit criteria |
|---|---|---|---|---|
| CS-1 | Pin the Nito reference for comparison; the shared implementation is independent; keep the MIT notice | H | Nito commit | Reference paths and hashes recorded |
| CS-2 | Implement official NIP-44 v2 KDF + 2-byte u16 prefix/chunked padding (reference cap 65,535) and the official vectors; keep `nito-v0` as an explicit private mode | J | CS-1 | Official vectors pass; cross-mode rejection test passes |
| CS-3 | NIP-59 timestamp randomization (seal + gift wrap up to 2 days in the past) and `since = now - 172800 - 300` subscriptions | J | CS-2 | Round-trip and timestamp-window tests pass |
| CS-4 | Relay pool: N relays, 80 ms per-connection outbox, dedupe by event id, reconnect/backoff, resubscribe, NIP-42 AUTH | H | CS-1 | Mock-relay tests pass; no network in unit tests |
| CS-5 | Protocol engine: phases, `VERIFY` before `SIGNING`, signature verification, timeouts, blame, duplicate handling, round persistence | H | CS-4 | Unit tests; A2 malicious-coordinator test passes |
| CS-6 | Wallet: equal-amount UTXO selection, BCH Schnorr 0x41 signing, broadcast, balance/caps | H | CS-4 | Chipnet P2PKH round-trip; A7 signature separation |
| CS-7 | Role-2 pool adapter: tag pairs, blank acquisition, lock + action, atomic broadcast, VM-eval, off-chain note delivery | J | CS-6; Nito proving assets; Nito 3-input builder | A5 and A6 pass |
| CS-8 | Operations: hardened systemd, metrics endpoint, journald cap, backup/restore, runbook | H | CS-5, CS-6 | A9 hardening check passes |
| CS-9 | 5-peer chipnet round with Nito browser peers | J | CS-5, CS-6 | A1 passes |
| CS-10 | Malicious-coordinator negative test: coordinator presents a tx that omits a peer’s output | J | CS-5 | A2 passes; no signature; no broadcast |
| CS-11 | 24 h soak + 10 consecutive rounds within cap | H | CS-9 | A3 and A4 pass |
| CS-12 | Nito client final approval | N | CS-7, CS-9 | Written approval recorded |

## 2. Task detail

**Status 2026-11-25:** CS-1–CS-4 are implemented in `daemons/shared/src/nostr/` (35/35 shared tests). CS-5 is implemented in `cashshuffle/src/round.js` (16 round tests, including the malicious-coordinator case); the transport loop that drives `handleMessage()` is pending. CS-6–CS-12 remain.

### CS-1 — vendor pin

- `git -C ../nito.cash log --oneline -1` is `984ca4c` on 2026-11-25; `transport.js` and `cashshuffle-transport.spec.js` are untracked at that HEAD.
- The pin is the first commit that contains both files.
- Copy `protocol.js`, `transport.js`, `event.js`, `nip44.js`, `nip59.js`, `relay.js` into `daemons/shared/src/nostr/` with the MIT notice.
- Record the source paths and file hashes in `daemons/shared/VENDOR.md`.

### CS-2 — NIP-44

- Official v2: `calc_padded_len` chunked padding; 2-byte u16 prefix below 65,536; 6-byte prefix above; `max_plaintext_size` 2^32−1.
- The current Nito code uses a 4-byte prefix and next-power padding (`../nito.cash/apps/web/src/lib/nostr/nip44.js:32-45`).
- `NIP44_MODE=official|nito-v0`; the default is `official`.
- The test suite runs the official vectors in `official` mode and a round-trip fixture in `nito-v0` mode.

### CS-3 — NIP-59

- Rumor `created_at` is canonical.
- Seal and gift wrap get independent random timestamps up to two days in the past; all timestamps are in the past.
- The subscription filter uses `since = now - 172800 - 300` (the pattern in `web/stores/p2pfusion/round.ts:122`).

### CS-4 — relay pool

- Publish to every relay by default; `NOSTR_PUBLISH_QUORUM` is an optional override.
- Per-connection outbox at `NOSTR_RELAY_PACING_MS` (default 80).
- Dedupe by `event.id`.
- Reconnect with exponential backoff and jitter; resubscribe on open.
- NIP-42 AUTH per `NOSTR_AUTH_POLICY`.

### CS-5 — protocol engine

- Phases: `REGISTER → POOL → ANNOUNCEMENT → SHUFFLE → VERIFY → SIGNING → BROADCAST`; `BLAME` is a side state.
- `VERIFY` checks the final transaction pays the peer’s own output, the input set, and the fee.
- Signatures are verified before they are counted.
- Every phase has a timeout; a timeout aborts the round before broadcast.
- Duplicate packets are ignored by packet id.
- The round state is persisted to `CASHSHUFFLE_DATA_DIR` before broadcast.

### CS-6 — wallet

- One equal-amount input per round; the fee is proportional.
- BCH Schnorr 0x41; never the Nostr BIP-340 signer.
- Token-aware UTXO listing.
- Per-round and global caps; one in-flight round.
- Balance and cap gauges in the metrics snapshot.

### CS-7 — role-2 adapter

- `tag = SHA256(carrier[0..64])`.
- Lock: 2 tagged fuel UTXOs at 15,000 sats each, 2 blanks, optional FT deposit, signed P2PKH funding input.
- Action: 3 inputs (fuel 0, fuel 1, state 2), 169-B carrier, new state, optional payout.
- Broadcast the lock and action atomically; the action spends the lock’s unconfirmed outputs.
- VM-eval every action in consensus and standard modes before broadcast.
- Deliver the two out-notes off-chain; the carrier has no room.

### CS-8 — operations

- Dedicated user, hardened unit, `/usr/local/bin/node`.
- `MemoryMax=512M`, `CPUQuota=50%`.
- Journald `SystemMaxUse` set before the first run.
- Backup/restore of the seed and the round state.
- Metrics on `127.0.0.1` only.

### CS-9 — 5-peer round

- Daemon + four Nito browser peers on chipnet.
- 5 equal inputs → 5 equal outputs; all BCH Schnorr signatures; one txid.
- No relay sees a wallet key.

### CS-10 — malicious coordinator

- A test coordinator builds a transaction that omits one peer’s output.
- The peer’s `VERIFY` fails; no signature is produced; the round aborts.
- The test is part of the acceptance suite, not a manual check.

### CS-11 — soak

- 24 h uptime; relay drop and reconnect; 80 ms pacing; no bans.
- 10 consecutive rounds within the cap.
- Metrics snapshot every round.

### CS-12 — approval

- Nito runs the client against the daemon and records the approval in `ACCEPTANCE.md`.

## 3. Definition of done

A task is done when:

- the code is committed on `master` with the `daemons: ` prefix;
- the unit tests pass on the apecsdev VM;
- the acceptance evidence is recorded;
- the relevant `OPEN-QUESTIONS.md` entry is resolved or explicitly deferred;
- no secrets, no build artifacts, and no generated files are committed.
