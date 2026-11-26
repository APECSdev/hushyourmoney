<!-- daemons/cashfusion/test/README.md -->
# CashFusion tests

Status: 11 tests pass (config 5, phase table/coordinator policy 6). The CashFusion round and wallet are still stubs; the shared transport is tested in `daemons/shared/test/`.

## Layers

| Layer | Command | Network | Purpose |
|---|---|---|---|
| Unit | `node --test test/*.test.js` | none | Config validation, phase table, coordinator policy. |
| Integration | `node --test test/integration/*.test.js` | mock relay | Shared transport, dedupe, pacing, reconnect (M1/M6). |
| Chipnet | `node --test test/chipnet/*.test.js` | chipnet Electrum | 5-party and 7-party rounds (M6). |
| Acceptance | `node --test test/acceptance/*.test.js` | chipnet + Nito peers | CF-A1–CF-A7; evidence captured per `daemons/CONVENTIONS.md` §8. |

## Run

```bash
# On blackhost, with the Nito apps/web/node_modules for @bitauth/@noble:
cd /root/tmp/daemons-test
node --test shared/test/*.test.js cashshuffle/test/*.test.js cashfusion/test/*.test.js

# On the apecsdev build VM, after installing the daemon dependencies:
cd daemons
npm install
npm test
```

## Fixtures

- The measured 5-party and 7-party constants are in `docs/P2P-FUSION-DESIGN.md:181-183`.
- The coordinator policy tests are pure functions; no relay is needed.
- A future chipnet fixture records the txid, the signatures, and the metrics snapshot.
