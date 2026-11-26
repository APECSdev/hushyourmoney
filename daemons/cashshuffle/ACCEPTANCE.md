<!-- daemons/cashshuffle/ACCEPTANCE.md -->
# CashShuffle daemon acceptance

Status: transport tests pass (44/44 shared), the A2 unit test passes (16 round tests), wallet selection/caps pass (5 tests), the BCH P2PKH signer passes (4 tests) and the pool/lock/action helpers pass (14 tests: 7 pool + 7 lock/action); the end-to-end gates A1–A10 are not started. Each test records the evidence listed in `daemons/CONVENTIONS.md` §8.

## A1 — 5-peer chipnet round

**Pass:** five peers (daemon + four Nito browser peers) produce 5 equal inputs → 5 equal outputs, all BCH Schnorr signatures, one broadcast txid, and no relay sees a wallet key.

**Evidence:** txid on Selene (`https://explorer.selene.cash/tx/<txid>?network=chipnet`), all five signatures verified, relay logs, metrics snapshot, daemon commit, Nito client commit.

## A2 — malicious coordinator

**Pass:** a test coordinator builds a transaction that omits one peer’s output. The peer’s `VERIFY` fails, no signature is produced, the round aborts before broadcast, and no funds move.

**Evidence:** the failing transaction hex, the `VERIFY` error, the absence of a signature, the abort log. **Current:** the unit test `a malicious coordinator cannot make a peer sign a transaction without its output` passes in `daemons/cashshuffle/test/round.test.js`; the end-to-end run is pending.

## A3 — 24 h uptime

**Pass:** 24 h continuous uptime; a relay drop is detected and reconnected; the outbox stays at 80 ms per connection; no relay ban; the daemon serves a round after the reconnect.

**Evidence:** `systemctl show`, journald excerpt, relay health snapshots, reconnect count.

## A4 — 10 consecutive rounds within cap

**Pass:** the daemon joins 10 consecutive rounds within `CASHSHUFFLE_MAX_FLOAT_SATS`; the balance and caps are visible in the metrics; no round exceeds the per-round cap.

**Evidence:** metrics snapshots for all 10 rounds, balance ledger, cap configuration.

## A5 — pool-native batching

**Pass:** the round produces **two tagged fuel UTXOs per action** with the same tag. Five actions require **10 tagged fuel outputs**, not 5. The Nito client scans the outputs; every action passes the BCH-2026 VM in consensus and standard modes; the tags match `SHA256(nf0_LE ‖ nf1_LE)`.

**Evidence:** the round tx, the tag values, the 10 outputs, the VM-eval report for every action, the Nito scan output. **Current:** the lock/action builders pass 7 tests; the proving-asset acceptance, VM-eval and Nito scan are pending.

**Correction:** the handoff’s “5 outputs → 5 actions” does not hold. One output per participant produces five distinct tags and zero pairs (`../nito.cash/apps/web/src/lib/pool/role2-action.js:56,75`; `role2-lock.js:6-9,86,106`).

## A6 — blank acquisition and cost

**Pass:** the daemon acquires blanks through the vending covenant at 1,000 sats each, or receives them from the operator; each lock spends exactly two blanks; the cap accounts for 2,000 sats of blank cost per action plus the 30,000 sats of action fuel plus the lock fee.

**Evidence:** vending txids, blank inventory, cost ledger. **Current:** `actionCostSats()`, the fuel-pair check and the lock builder are implemented and tested; the vending/blank end-to-end run is pending.

## A7 — signature separation

**Pass:** every BCH input verifies under BCH Schnorr with 0x41; every Nostr event verifies under BIP-340; a Nostr BIP-340 signature on a BCH input is rejected; a BCH signature on a Nostr event is rejected.

**Evidence:** the verification vectors and the two negative tests. **Current:** the BCH P2PKH signer passes 4 tests (`daemons/shared/test/p2pkh.test.js`); the end-to-end A7 run is pending.

## A8 — NIP-44 and NIP-59

**Pass:** official NIP-44 v2 vectors pass in `official` mode; a standard peer decrypts the payload; `nito-v0` is explicitly versioned and rejected by the official mode; the seal and gift-wrap timestamps are within the two-day past window; the subscription uses `since`.

**Evidence:** vector output, cross-mode rejection, timestamp fixtures. **Current:** `daemons/shared/test/{nip44,nip59}.test.js` pass; the end-to-end A8 run is pending.

## A9 — operations hardening

**Pass:** the service runs as `cashshuffle`, not root; `NoNewPrivileges`, `ProtectSystem=strict`, `ProtectHome`, `PrivateTmp`, `StateDirectory`, `MemoryMax`, and `CPUQuota` are active; the metrics port is bound to `127.0.0.1`; the journald cap is set; the seed file is mode 600.

**Evidence:** `systemctl show`, `ss -ltnp`, `stat` on the seed, journald config.

## A10 — Nito final approval

**Pass:** the Nito team runs its client against the daemon and records written approval in this file.

**Evidence:** the approval text, the client commit, the daemon commit, the txids.

## Acceptance matrix

| Test | M2 | M3 | M4 | M5 | M6 |
|---|---|---|---|---|---|
| A1 | ✓ | | | | |
| A2 | ✓ | | | | |
| A3 | | | | ✓ | |
| A4 | | ✓ | | | |
| A5 | | | ✓ | | |
| A6 | | | ✓ | | |
| A7 | | ✓ | | | |
| A8 | ✓ | | | | |
| A9 | | | | ✓ | |
| A10 | | | | | ✓ |
