<!-- daemons/cashfusion/test/README.md -->
# CashFusion tests

Status: M0 unit tests only. The round and wallet are stubs.

## Layers

| Layer | Command | Network | Purpose |
|---|---|---|---|
| Unit | `node --test test/*.test.js` | none | Config validation, phase table, coordinator policy. |
| Integration | `node --test test/integration/*.test.js` | mock relay | Shared transport, dedupe, pacing, reconnect (M1/M6). |
| Chipnet | `node --test test/chipnet/*.test.js` | chipnet Electrum | 5-party and 7-party rounds (M6). |
| Acceptance | `node --test test/acceptance/*.test.js` | chipnet + Nito peers | CF-A1–CF-A7; evidence captured per `daemons/CONVENTIONS.md` §8. |

## Run

```bash
# On the apecsdev VM, never this host:
cd daemons
npm install
npm test
```

The current tests require no dependencies and run with plain `node --test`:

```bash
node --test daemons/cashfusion/test/*.test.js
```

## Fixtures

- The measured 5-party and 7-party constants are in `docs/P2P-FUSION-DESIGN.md:181-183`.
- The coordinator policy tests are pure functions; no relay is needed.
- A future chipnet fixture records the txid, the signatures, and the metrics snapshot.
