<!-- daemons/cashfusion/ACCEPTANCE.md -->
# CashFusion daemon acceptance

Status: 11 unit tests pass (config + phase table + coordinator policy); the end-to-end gates CF-A1–CF-A7 are not started. Each test records the evidence listed in `daemons/CONVENTIONS.md` §8.

## CF-A1 — 5-party chipnet round

**Pass:** five peers produce 10 inputs / 10 outputs, 1,760 B, 5,000 sats, 10/10 signatures, one broadcast txid.

**Evidence:** txid on Selene (`https://explorer.selene.cash/tx/<txid>?network=chipnet`), all ten signatures, metrics snapshot, daemon commit, Nito client commit.

## CF-A2 — 7-party round

**Pass:** seven peers produce 14/14 signatures and one broadcast txid.

**Evidence:** txid, all fourteen signatures, metrics snapshot.

## CF-A3 — relay behavior

**Pass:** a relay drop is detected and reconnected; the outbox stays at 80 ms per connection; no relay ban; the round completes after the reconnect.

**Evidence:** relay health snapshots, journald excerpt, reconnect count.

## CF-A4 — coordinator privacy

**Pass:** with `CASHFUSION_COORDINATOR_POLICY=avoid`, the daemon refuses the coordinator role; if the election picks it, the round aborts and re-pools. With `rotate` or `allow`, the policy is logged and the role is visible in the round record.

**Evidence:** election logs for all three policies, the abort/re-pool record.

## CF-A5 — G4 testnet

**Pass:** the G4 testnet round runs on chipnet with Nito peers; the existing CashFusion pool is not used; the mainnet opt-in beta is not enabled.

**Evidence:** txid, peer list, relay set, config snapshot.

## CF-A6 — Nito final approval

**Pass:** the Nito team runs its client against the daemon and records written approval in this file.

**Evidence:** the approval text, the client commit, the daemon commit, the txids.

## CF-A7 — mainnet gate

**Pass:** `CASHFUSION_NETWORK=mainnet` is rejected by the config until G4 and the operator sign-off are recorded; no mainnet transaction is broadcast by the daemon before that record.

**Evidence:** the config rejection test, the sign-off record, the absence of mainnet txids.

## Acceptance matrix

| Test | M6 | M7 |
|---|---|---|
| CF-A1 | ✓ | |
| CF-A2 | ✓ | |
| CF-A3 | ✓ | |
| CF-A4 | ✓ | |
| CF-A5 | ✓ | |
| CF-A6 | ✓ | |
| CF-A7 | | ✓ |
