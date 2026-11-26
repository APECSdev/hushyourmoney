<!-- daemons/cashfusion/README.md -->
# CashFusion daemon

**Status:** shared transport core implemented (M1); the CashFusion round, wallet, and deployment are not implemented. M6; not deployed. The CashFusion package has 11 tests (config + phase table + coordinator policy).
**Design:** `docs/P2P-FUSION-DESIGN.md`; `web/stores/p2pfusion/round.ts`.
**Handoff:** `docs/CASHSHUFFLE-DAEMON-HANDOFF-2026-11-25.md` §6.
**Shared transport:** `daemons/shared/src/nostr/`.

---

## 1. Mission

Add a CashFusion mode to the same daemon family after the CashShuffle daemon is stable. The daemon runs the six-phase round over the shared Nostr transport and the shared BCH wallet. It is a peer, not a server.

Non-goals: the existing CashFusion pool is not supported; mainnet opt-in beta (G4) is not built; the daemon does not become the default coordinator.

---

## 2. Privacy rule

`AGENTS.md:110` records that the coordinator-sees critique applies to CashFusion, not CashShuffle. A permanent daemon that coordinates CashFusion sees the mapping. The default `CASHFUSION_COORDINATOR_POLICY=avoid` makes the daemon refuse the coordinator role; if the election picks it, the round aborts and re-pools. `rotate` and `allow` are explicit operator choices.

---

## 3. Measured constants

| Constant | Value | Source |
|---|---|---|
| 5-party shape | 10 in / 10 out, 1,760 B, fee 5,000 sats, 10/10 signatures | `docs/P2P-FUSION-DESIGN.md:182` |
| 7-party shape | 14/14 signatures | `docs/P2P-FUSION-DESIGN.md:182` |
| G2b chipnet | 428 B, fee 2,000 sats | `docs/P2P-FUSION-DESIGN.md:181` |
| G3L relays | `relay.primal.net`, `nostr.mom`, `offchain.pub` | `docs/P2P-FUSION-DESIGN.md:183` |
| G1 relays | `relay.damus.io`, `nos.lol` (1/2 connected) | `docs/P2P-FUSION-DESIGN.md:179` |
| Pacing | one event per 80 ms per connection | `docs/P2P-FUSION-DESIGN.md:247-250` |
| Participant floor | `MIN_PARTICIPANTS=5` (design constant, not enforced in `round.ts`) | `docs/P2P-FUSION-DESIGN.md:151`; `web/pages/research/cashfusion.vue:227-228` |
| Discovery | kind 22230 is design-only | `docs/P2P-FUSION-DESIGN.md` |
| NIP-42 | not implemented in the harness; damus advertises it | `docs/P2P-FUSION-DESIGN.md:253` |
| G4 | mainnet opt-in beta not built | `docs/P2P-FUSION-DESIGN.md:181-183` |

---

## 4. Architecture

```
main.js
  ├─ config.js        validated env (CASHFUSION_* + shared keys)
  ├─ relay-pool.js    shared transport; N relays, 80 ms outbox, dedupe, reconnect, NIP-42
  ├─ round.js         ANNOUNCE → ELECTION → REGISTRATION → MIXNET → ASSEMBLY → SIGNING
  ├─ wallet.js        BCH Schnorr 0x41, UTXO selection, broadcast, caps
  └─ metrics.js       counters/gauges
```

The shared transport is the same one the CashShuffle daemon uses; do not fork it.

---

## 5. Six phases

1. **Announce** — peers advertise the round.
2. **Election** — the coordinator election. The daemon checks `CASHFUSION_COORDINATOR_POLICY`.
3. **Registration** — peers register inputs and outputs.
4. **Mixnet** — onion-wrapped output registration.
5. **Assembly** — the coordinator assembles the transaction; every peer verifies before signing.
6. **Signing** — BCH Schnorr 0x41; the coordinator broadcasts after all signatures.

The daemon adds the same verify-before-sign rule as CashShuffle: no signature without checking its own output, the input set, and the fee.

---

## 6. Configuration

| Key | Default | Notes |
|---|---|---|
| `CASHFUSION_NETWORK` | `chipnet` | `mainnet` rejected until G4. |
| `CASHFUSION_POOL_SIZE` | `5` | Minimum 5. |
| `CASHFUSION_MIN_PARTICIPANTS` | `5` | Minimum 5; pool size must be at least this. |
| `CASHFUSION_FEE_SATS` | `5000` | Measured 5-party fee. |
| `CASHFUSION_MAX_FEE_RATE` | `5` | sat/B cap for the pre-sign check. |
| `CASHFUSION_COORDINATOR_POLICY` | `avoid` | `avoid`, `rotate`, `allow`. |
| `CASHFUSION_MAX_FLOAT_SATS` | `300000` | Proposed cap. |
| `CASHFUSION_MAX_ROUNDS` | `10` | Per soak/run. |
| `CASHFUSION_SEED_FILE` | `/var/lib/cashfusion-daemon/.seed` | Mode 600. |
| `CASHFUSION_DATA_DIR` | `/var/lib/cashfusion-daemon` | State and metrics. |

Shared keys (`DAEMON_*`, `NOSTR_*`) are in `daemons/shared/src/config.js`.

---

## 7. Operations

The unit is `systemd/cashfusion-daemon.service`:

- dedicated `cashfusion` user; no root;
- `/usr/local/bin/node` (verified on blackhost 2026-11-25);
- `MemoryMax=512M`, `CPUQuota=50%`;
- `StateDirectory=cashfusion-daemon`, `ProtectSystem=strict`, `ProtectHome`, `PrivateTmp`, `NoNewPrivileges`;
- `Restart=on-failure` with a start limit; the daemon is not deployed.

The same `blackhost` capacity note applies: 2 CPU cores, 3.8 GiB RAM, 2.8 GiB free on a 93%-full disk (verified 2026-11-25).

---

## 8. Workstreams

- `PLAN.md` — CF-1 … CF-8.
- `ACCEPTANCE.md` — CF-A1 … CF-A7.
- `OPEN-QUESTIONS.md` — Q1 … Q10.

---

## 9. References

- `docs/P2P-FUSION-DESIGN.md`
- `web/stores/p2pfusion/round.ts`
- `web/pages/research/cashfusion.vue`
- `docs/CASHSHUFFLE-DAEMON-HANDOFF-2026-11-25.md` §6
