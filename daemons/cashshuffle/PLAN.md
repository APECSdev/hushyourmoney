<!-- daemons/cashshuffle/PLAN.md -->
# CashShuffle daemon plan

Status: M0 done; M1 transport done and Nito chose official NIP-44 (`ac61542`); M2 classic round partial (state machine + VERIFY; Nito added the client VERIFY; signature verification, timeouts and persistence pending); M3 selection/caps + BCH signer partial; M4 carrier/lock/action + **2N round primitive** partial (2N shape confirmed; builder/verifier/state machine pass 15 tests; Nito witness acceptance PASSED `a304d3c`; network loop, Nito store/UI, VM-eval and web acceptance pending). CS-1–CS-4 implemented; CS-5–CS-7 partial; CS-8–CS-12 not started.

Owner key: **H** = Hush, **N** = Nito, **J** = joint.

## 1. Tasks

| ID | Task | Owner | Depends on | Exit criteria |
|---|---|---|---|---|
| CS-1 | Pin the Nito reference for comparison; the shared implementation is independent; keep the MIT notice | H | Nito commit | Reference paths and HEAD pin recorded |
| CS-2 | Implement official NIP-44 v2 KDF + 2-byte u16 prefix/chunked padding (reference cap 65,535) and the official vectors; keep `nito-v0` as an explicit private mode | J | CS-1 | Official vectors pass; cross-mode rejection test passes |
| CS-3 | NIP-59 timestamp randomization (seal + gift wrap up to 2 days in the past) and `since = now - 172800 - 300` subscriptions | J | CS-2 | Round-trip and timestamp-window tests pass |
| CS-4 | Relay pool: N relays, 80 ms per-connection outbox, dedupe by event id, reconnect/backoff, resubscribe, NIP-42 AUTH | H | CS-1 | Mock-relay tests pass; no network in unit tests |
| CS-5 | Protocol engine: phases, `VERIFY` before `SIGNING`, signature verification, timeouts, blame, duplicate handling, round persistence | H | CS-4 | **state machine + VERIFY done** (16 tests, A2 unit test passes); signature verification, timeouts, persistence and A1/A2 end-to-end pending |
| CS-6 | Wallet: equal-amount UTXO selection, BCH Schnorr 0x41 signing, broadcast, balance/caps | H | CS-4 | **selection/caps + BCH signer done** (9 tests: 5 wallet + 4 p2pkh); Electrum broadcast pending; A7 pending |
| CS-7 | Role-2 pool adapter: tag pairs, blank acquisition, lock + action, atomic broadcast, VM-eval, off-chain note delivery | J | CS-6; Nito proving assets; Nito 3-input builder | **carrier/tag/pair/cost + lock/action builders + 2N round primitive done** (15 new tests: 8 role2-round + 7 round-2n; 14 earlier lock/action/pool tests); web-platform acceptance, store/UI wiring, VM-eval, note delivery and A5/A6 pending |
| CS-8 | Operations: hardened systemd, metrics endpoint, journald cap, backup/restore, runbook | H | CS-5, CS-6 | A9 hardening check passes |
| CS-9 | 5-peer chipnet 2N round with Nito browser peers | J | CS-5, CS-6, CS-7 | A1 passes; 5 actions / 10 fuel outputs |
| CS-10 | Malicious-coordinator negative test: coordinator presents a 2N tx that omits or retags a peer’s fuel pair | J | CS-5, CS-7 | A2 passes; no signature; no broadcast |
| CS-11 | 24 h soak + 10 consecutive rounds within cap | H | CS-9 | A3 and A4 pass |
| CS-12 | Nito client final approval | N | CS-7, CS-9 | Written approval recorded |

## 2. Task detail

**Status 2026-11-26:** CS-1–CS-4 are implemented in `daemons/shared/src/nostr/` (44/44 shared tests); Nito chose official NIP-44 (`ac61542`) and wired NIP-42 (`d85bade`). CS-5 is implemented as a state machine + VERIFY in `cashshuffle/src/round.js` (16 round tests, including the malicious-coordinator case); Nito added the client VERIFY; signature verification, timeouts, persistence and the transport loop that drives `handleMessage()` are pending. CS-6 selection/funding/caps are implemented in `cashshuffle/src/wallet.js` (5 tests); the BCH P2PKH signer is implemented (4 p2pkh tests); Electrum broadcast is pending. CS-7 carrier/tag/pair/cost helpers are implemented in `cashshuffle/src/pool.js`; the lock/action builders are in `cashshuffle/src/role2-{lock,action}.js`; the **2N round primitive** is in `cashshuffle/src/role2-round.js` (builder, per-input signer, assembler, 2N verifier) and `cashshuffle/src/round-2n.js` (state machine). The 2N tests: 8 role2-round + 7 round-2n = 15. The 2N shape is confirmed, Nito’s role-2 witness acceptance PASSED (`a304d3c`), and the 3-input builders are done; the store/UI wiring, web-platform acceptance, network loop, VM-eval, note delivery, atomic broadcast and A5/A6 remain. CS-8–CS-12 remain.

### CS-1 — reference pin

- Nito committed the transport in `f88ed90` and the official NIP-44/NIP-59 changes in `ac61542`; the earlier `984ca4c` snapshot is superseded.
- The shared implementation is independent and aligned with official v2; `nito-v0` remains only as a compatibility mode.
- The Nito `protocol.js`/`transport.js` remain the reference for the round layer.
- The source paths and the current Nito commits are recorded in `daemons/shared/README.md` §2.

### CS-2 — NIP-44

- Official v2: HKDF-Extract for the conversation key, HKDF-Expand for the message keys, 2-byte u16 prefix and chunked padding. The official JavaScript reference caps plaintext at 65,535 bytes, so the 6-byte extended prefix is not exercised.
- Nito chose official v2 (`ac61542`); the pre-`ac61542` tree used raw sharedX + HKDF with salt and a 4-byte prefix/next-power padding.
- `NIP44_MODE=official|nito-v0`; the default is `official`, and the Nito client has no `nito-v0` path.
- The official mode passes `nip44.vectors.json` (35 conversation-key cases, 10 encrypt/decrypt cases, 24 padding cases); `nito-v0` has a round-trip and cross-mode rejection test for compatibility.

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

- Implemented: phases `REGISTER → POOL → ANNOUNCEMENT → SHUFFLE → VERIFY → SIGNING → BROADCAST`; `BLAME` is a side state; `VERIFY` checks the final transaction pays the peer’s own output, the input set, and the fee; the malicious-coordinator test passes.
- Nito added the client `VERIFY` on 2026-11-26 (own output, duplicate outpoints/addresses).
- Pending: signature verification before counting, per-phase timeouts, duplicate packet handling and round persistence to `CASHSHUFFLE_DATA_DIR`.

### CS-6 — wallet

- Implemented: one equal-amount input per round; tokenless funding selection; per-round/global caps; BCH Schnorr 0x41 P2PKH signing; never the Nostr BIP-340 signer.
- Pending: token-aware UTXO refresh, Electrum broadcast, balance/cap gauges in the metrics snapshot.

### CS-7 — role-2 adapter and 2N round

- Implemented: `tag = SHA256(carrier[0..64])`; carrier parse/build; fuel-pair check; cost arithmetic; single-participant lock with 2 tagged fuel UTXOs, 2 blanks and optional FT deposit; 3-input action with 169-B carrier, new state and optional payout.
- **2N round implemented:** `role2-round.js` builds the unsigned round (2N fuel outputs, 2 blanks per action, optional FT deposit/change, per-participant fee share, BCH change), signs per-input, applies signatures, assembles, and verifies the 2N shape (tags, fuel amounts, blanks, supplies, FT conservation, change, fee). `round-2n.js` runs the shared phase table with 2N registration/verify/sign/broadcast. Tests: `role2-round.test.js` 8, `round-2n.test.js` 7.
- Nito confirmed the 2N shape, pinned the proving assets and PASSED the role-2 witness acceptance (`a304d3c`); the 3-input builders are done.
- Pending: the network loop that drives `handleMessage()`, the Nito client 2N UI, the store/UI wiring, web-platform SHIELD→TRANSFER→UNSHIELD, VM-eval in consensus and standard modes, off-chain note delivery, atomic lock+action broadcast, and the participant→tag blind for the coordinator.

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
