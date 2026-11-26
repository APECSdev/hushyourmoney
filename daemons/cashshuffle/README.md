<!-- daemons/cashshuffle/README.md -->
# CashShuffle daemon

**Status:** shared transport (M1), the round state machine with verify-before-sign (M2), wallet selection/caps (M3 partial) and carrier/tag/fuel-pair/cost helpers (M4 partial) implemented; the network loop, BCH signer, lock/action builder, and deployment are not implemented. No float, no deployment.
**Source handoff:** `docs/CASHSHUFFLE-DAEMON-HANDOFF-2026-11-25.md`.
**Design:** `../nito.cash/docs/CASHSHUFFLE-NOSTR-DESIGN.md`.
**Reference:** `../nito.cash/apps/web/src/lib/cashshuffle/`, `../nito.cash/apps/web/src/lib/nostr/`.
**Pool:** `docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md`; `pool-registry.json`.

---

## 1. Mission

A permanent CashShuffle-over-Nostr peer on `blackhost` that can coordinate a round when its ephemeral key is the lowest in the pool. It holds a capped chipnet liquidity float, joins rounds, verifies the final transaction, signs, and broadcasts exactly like a browser peer. It never holds another peer’s key and never signs for another peer.

Non-goals for M1–M3: mainnet, CashFusion, the existing CashFusion pool, a public metrics port, and any inbound listener.

---

## 2. Architecture

```
main.js
  ├─ config.js        validated env (CASHSHUFFLE_* + shared keys)
  ├─ relay-pool.js    shared N-relay pool, 80 ms outbox, dedupe, reconnect, NIP-42
  ├─ round.js         REGISTER → POOL → ANNOUNCEMENT → SHUFFLE → VERIFY → SIGNING → BROADCAST / BLAME
  ├─ wallet.js        equal-amount UTXO selection, BCH Schnorr 0x41, broadcast, caps
  ├─ pool.js          role-2 tag pairs, blanks, lock + action, VM-eval
  └─ metrics.js       counters/gauges
```

The shared transport is `daemons/shared/src/nostr/`; the shared BCH contract is `daemons/shared/src/bch/`.

---

## 3. Round flow

1. **Register** — the daemon publishes its ephemeral verification key, equal amount, and protocol version. The input outpoint is not in the registration (`web/pages/research/coinjoin.vue:186-190`; `../nito.cash/apps/web/src/lib/cashshuffle/protocol.js:74-90`).
2. **Pool** — wait for `N = 5` peers. The floor is enforced by the daemon config (`CASHSHUFFLE_POOL_SIZE >= 5`).
3. **Announcement** — the coordinator (lowest ephemeral pubkey) opens the shuffle.
4. **Shuffle** — contribute the onion-wrapped output list; relay the other packets.
5. **VERIFY** — every peer checks the final transaction before signing: its own output is present at the expected amount and address; the input set matches the registered equal amounts; the fee matches the declared model; no extra inputs or outputs. This phase is absent from the Nito protocol core and is the daemon’s theft defense.
6. **Signing** — BCH Schnorr with `SIGHASH_ALL|FORKID` (0x41), not Nostr BIP-340.
7. **Broadcast** — the coordinator broadcasts; every peer verifies the txid.
8. **Blame** — `N-1` matching blames abort the round before broadcast; the peers re-pool.

The exact blame behavior (abort + re-pool vs exclude + continue) is open question Q7.

---

## 4. Pool facts

| Item | Value | Source |
|---|---|---|
| Network | chipnet | `pool-registry.json:9` |
| Category | `480e30ff1d3f5f0b6fe9dd2dbe363b1776f61566f29a395628d0b50abd01b9d0` | `pool-registry.json:10` |
| Program P2SH32 | `aa203e40b64cff154d4b3305e8c8cc4e3174bc595ad74342a8445a9a7798b7be3a2987` | `pool-registry.json:11` |
| Guard P2SH32 | `aa2066a238ad4109a3093c34fd4cf9b4167b0058375d4ad1c5cc44cd253d3664f0c187` | `pool-registry.json:59` |
| Vending P2SH32 | `aa206b51396304b3bd4e0e9c254f84d1ee80d83a5c7ccaf3750883d00866480d981287` | `pool-registry.json:73` |
| Vending price | 1,000 sats per blank | `docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md` §4.1 |
| Carrier | 169 bytes | `docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md:52-60` |
| Fuel | 15,000 sats per fuel UTXO; 2 per action | `../nito.cash/apps/web/src/lib/pool/role2-lock.js:38`; `role2-action.js:75` |
| Blanks | 2 per lock | `../nito.cash/apps/web/src/lib/pool/role2-lock.js:86,106` |
| Lifecycle | SHIELD `9d9aa97a…` → TRANSFER `5262417b…` → UNSHIELD `e54d19fb…` | `pool-registry.json` lifecycle |

The state float is 10,000 sats (`role2-action.js:25`); the action fee is the two fuel UTXOs (`role2-action.js:70`).

---

## 5. Liquidity math

One role-2 action needs:

- **two tagged fuel UTXOs with the same tag** — 15,000 sats each, 30,000 total; the tag is `SHA256(carrier[0..64]) = SHA256(nf0_LE ‖ nf1_LE)`;
- **two blanks** — 1,000 sats each at the vending machine, 2,000 total;
- **a lock/shuffle transaction fee** — separate from the 30,000-sat action fee, paid by the funding input.

A plain 5-peer round with one 15,000-sat output per participant produces **five outputs with five different tags**. No pair matches, so it funds **zero** actions. A pool-native round needs **two tagged outputs per action**: 10 outputs for 5 actions, or 2 outputs per participant. This is the corrected arithmetic; the handoff’s “5 outputs → 5 actions” does not hold (`role2-action.js:56,75`).

The proposed default cap is 400,000 sats: 10 actions at 30,000 sats of fuel (300,000) + 20,000 sats of blanks + up to 50,000 sats of lock fees at the 5,000-sat per-lock cap. The cap is open question Q10.

---

## 6. Configuration

The full example is `.env.example`. The loader is `src/config.js`.

| Key | Default | Notes |
|---|---|---|
| `CASHSHUFFLE_NETWORK` | `chipnet` | `mainnet` is rejected until Gate 7. |
| `CASHSHUFFLE_POOL_CATEGORY` | deployed category | 32-byte hex. |
| `CASHSHUFFLE_POOL_LOCKING` | deployed program | 35-byte P2SH32 hex. |
| `CASHSHUFFLE_GUARD_LOCKING` | deployed guard | 35-byte P2SH32 hex. |
| `CASHSHUFFLE_VENDING_LOCKING` | deployed vending | 35-byte P2SH32 hex. |
| `CASHSHUFFLE_VENDING_PRICE_SATS` | `1000` | Pinned by the covenant. |
| `CASHSHUFFLE_FUEL_SATS` | `15000` | Per fuel UTXO. |
| `CASHSHUFFLE_BLANKS_PER_LOCK` | `2` | Exact. |
| `CASHSHUFFLE_POOL_SIZE` | `5` | Minimum 5. |
| `CASHSHUFFLE_AMOUNT_SATS` | `100000` | Equal input amount. |
| `CASHSHUFFLE_FEE_RATE` | `1` | sat/B for the lock/shuffle tx. |
| `CASHSHUFFLE_MAX_FLOAT_SATS` | `400000` | Proposed cap. |
| `CASHSHUFFLE_MAX_ROUNDS` | `10` | Per soak/run. |
| `CASHSHUFFLE_MAX_LOCK_FEE_SATS` | `5000` | Per-lock safety cap. |
| `CASHSHUFFLE_SEED_FILE` | `/var/lib/cashshuffle-daemon/.seed` | Mode 600. |
| `CASHSHUFFLE_DATA_DIR` | `/var/lib/cashshuffle-daemon` | State and metrics. |

Shared keys (`DAEMON_*`, `NOSTR_*`) are in `daemons/shared/src/config.js`.

---

## 7. Operations

The unit is `systemd/cashshuffle-daemon.service`:

- dedicated `cashshuffle` user; no root;
- `/usr/local/bin/node` (verified on blackhost 2026-11-25);
- `MemoryMax=512M`, `CPUQuota=50%`;
- `StateDirectory=cashshuffle-daemon`, `ProtectSystem=strict`, `ProtectHome`, `PrivateTmp`, `NoNewPrivileges`;
- `Restart=on-failure` with a start limit; the skeleton is not deployed.

`blackhost` has 2 CPU cores, 3.8 GiB RAM, and 2.8 GiB free on a 93%-full 38G disk (verified 2026-11-25). The runbook sets a journald cap before the daemon runs.

---

## 8. Workstreams

- `PLAN.md` — CS-1 … CS-12, owners, dependencies, exit criteria.
- `ACCEPTANCE.md` — A1 … A10, including the malicious-coordinator test and the corrected pool arithmetic.
- `OPEN-QUESTIONS.md` — Q1 … Q15 for the Nito rounds.

---

## 9. References

- `docs/CASHSHUFFLE-DAEMON-HANDOFF-2026-11-25.md`
- `../nito.cash/docs/CASHSHUFFLE-NOSTR-DESIGN.md`
- `web/pages/research/coinjoin.vue` — the CashShuffle wire spec.
- `docs/P2P-FUSION-DESIGN.md` — the relay and pacing measurements.
- `docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md` — the role-2 pool.
- `pool-registry.json` — the deployed facts.
