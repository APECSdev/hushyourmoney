<!-- daemons/cashshuffle/test/README.md -->
# CashShuffle tests

Status: M0 unit tests only. The round, wallet, and pool adapter are stubs.

## Layers

| Layer | Command | Network | Purpose |
|---|---|---|---|
| Unit | `node --test test/*.test.js` | none | Config validation, phase table, implemented helpers. |
| Integration | `node --test test/integration/*.test.js` | mock relay | Transport, dedupe, pacing, reconnect, AUTH (M1). |
| Chipnet | `node --test test/chipnet/*.test.js` | chipnet Electrum | Wallet round-trip, 5-peer round, pool actions (M2–M4). |
| Acceptance | `node --test test/acceptance/*.test.js` | chipnet + Nito peers | A1–A10; evidence captured per `daemons/CONVENTIONS.md` §8. |

## Run

```bash
# On the apecsdev VM, never this host:
cd daemons
npm install
npm test
```

The current tests require no dependencies and run with plain `node --test`:

```bash
node --test daemons/cashshuffle/test/*.test.js
```

## Fixtures

- Config fixtures use the deployed pool facts from `pool-registry.json`.
- Role-2 fixtures use the 169-B carrier shape and the `SHA256(carrier[0..64])` tag.
- A future chipnet fixture records the txid, the VM-eval report, and the metrics snapshot.
