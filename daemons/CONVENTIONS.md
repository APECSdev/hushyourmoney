<!-- daemons/CONVENTIONS.md -->
# Daemon conventions

These rules apply to every file under `daemons/`.

## 1. Runtime

- Node.js 22 or newer; ESM (`"type": "module"`).
- Plain JavaScript, no TypeScript build step.
- `node --test` for unit tests; no network in unit tests.
- The daemon is a long-lived process; every loop has a timeout and a shutdown path.

## 2. Configuration

- Shared keys: `DAEMON_*`, `NOSTR_*`.
- CashShuffle keys: `CASHSHUFFLE_*`.
- CashFusion keys: `CASHFUSION_*`.
- `.env.example` is committed; `.env` and `.seed` are not.
- `/etc/<daemon>.env` is mode 600, owned by root; the service reads it through systemd.
- The seed file is mode 600, owned by the service user, outside the repository.
- Configuration is validated at startup; an invalid value exits with `EX_CONFIG` (78).
- `redactConfig()` is used before any config is logged.

## 3. Logging and metrics

- Log JSON lines to stdout; systemd/journald captures them.
- Never log seed material, private keys, raw signed transactions, or relay auth payloads.
- Metrics are in-process counters and gauges (`shared/src/metrics.js`).
- The metrics endpoint binds to `127.0.0.1` only. No public port.
- Every acceptance run captures a metrics snapshot as evidence.

## 4. Security invariants

1. **No signature without verification.** The peer verifies the final transaction pays its own output, the input set, and the fee before signing.
2. **No wallet key on the relay.** Nostr session keys are separate from the BCH wallet seed.
3. **BCH Schnorr is not Nostr BIP-340.** BCH inputs use the 0x41 sighash byte; Nostr events use BIP-340.
4. **No root service.** The unit runs as a dedicated user with hardening.
5. **No public metrics.** Localhost or journald only.
6. **No unbounded float.** Per-round and global caps; a single in-flight round lock.
7. **No broadcast without VM evaluation.** Role-2 actions are evaluated in consensus and standard modes before broadcast.
8. **Fail closed.** A timeout, a missing packet, or a failed verification aborts the round before broadcast.

## 5. Build and test hosts

- **Never build on this host.** The `pnpm`/`astro`/compile rule applies to this repository.
- Build and test on the `apecsdev` VM. The dependency-bearing p2pkh/role-2 tests also run on `blackhost` with the Nito `apps/web/node_modules`.
- Deploy to `blackhost`; the daemon is an outbound WebSocket client and needs no inbound port.
- `blackhost` has 2 CPU cores, 3.8 GiB RAM, and 2.8 GiB free on a 93%-full disk (verified 2026-11-25). The unit sets `MemoryMax=512M`, `CPUQuota=50%`, and the journald cap is part of the runbook.
- `blackhost` Node is `/usr/local/bin/node` (v22.20.0).

Dependencies: the transport tests need `@noble/ciphers`, `@noble/curves` and `@noble/hashes`; the P2PKH, role-2 and 2N tests need `@bitauth/libauth`. The web image’s `node_modules` does not include `@bitauth`; the full 112-test run on `blackhost` uses the Nito `apps/web/node_modules`, or install the daemon dependencies on the `apecsdev` VM. Current counts: 44 shared, 57 CashShuffle, 11 CashFusion.

## 6. Commit rules

- One task, one commit.
- Commit only the files for that task; the working tree is shared with other teams.
- Do not leave deletions staged.
- Commit message prefix: `daemons: `.
- A docs-only change needs no site build and no Docker image.
- A code change is tested on the `apecsdev` VM or `blackhost` (with the Nito `apps/web/node_modules` for `@bitauth`) before it is pushed.

## 7. Data and secrets

- The daemon’s state directory is `/var/lib/<daemon>/`.
- The seed is backed up offline; the backup is not committed and not stored on the relay host.
- The wallet key is chipnet-only until Gate 7; the config rejects `mainnet`.
- The operator’s vending-machine P2PKH is public; the seed is not.

## 8. Acceptance evidence

Every acceptance run records:

- the txids (Selene primary: `https://explorer.selene.cash/tx/<txid>?network=chipnet`),
- the VM-eval result for every role-2 input (consensus and standard),
- the metrics snapshot,
- the relay and systemd logs,
- the exact commit hash of the daemon and the Nito client.
