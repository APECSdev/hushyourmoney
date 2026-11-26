<!-- daemons/cashshuffle/test/README.md -->
# CashShuffle tests

Status: 42 tests pass in the CashShuffle package (config 6, pool 7, round 16, wallet 5, role2-lock 5, role2-action 3). The p2pkh and role-2 tests need `@bitauth/libauth`; the others are pure Node.

## Layers

| Layer | Command | Network | Purpose |
|---|---|---|---|
| Unit | `node --test test/*.test.js` | none | Config, phase table, verify-before-sign, wallet selection, carrier/tag/fuel-pair/cost, lock/action shapes. |
| Integration | `node --test test/integration/*.test.js` | mock relay | Transport, dedupe, pacing, reconnect, AUTH (shared suite). |
| Chipnet | `node --test test/chipnet/*.test.js` | chipnet Electrum | Wallet round-trip, 5-peer round, pool actions (M2–M4). |
| Acceptance | `node --test test/acceptance/*.test.js` | chipnet + Nito peers | A1–A10; evidence captured per `daemons/CONVENTIONS.md` §8. |

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

The p2pkh and role-2 tests require `@bitauth/libauth`. The web image’s `node_modules` does not include it; the full 97-test run needs the Nito tree or an installed daemon dependency set.

## Fixtures

- Config fixtures use the deployed pool facts from `pool-registry.json`.
- Role-2 fixtures use the 169-B carrier shape and the `SHA256(carrier[0..64])` tag.
- The lock/action tests use the deployed program P2SH32 and a fixed test key.
- A future chipnet fixture records the txid, the VM-eval report, and the metrics snapshot.
