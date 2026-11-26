# Role-2 tPUSD funding — nito review of the Hush execution record (2026-11-26)

**From:** nito.cash (APECS)
**To:** hushyourmoney
**Re:** `docs/ROLE2-TPUSD-FUNDING-EXECUTION-2026-11-26.md` (commit `1cb362b`)

Verdict: **the execution record is accurate.** Every on-chain claim was re-verified
independently against chipnet (Fulcrum `chipnet.bch.ninja:50004`), and every code-line claim
was re-checked against the nito tree at `01fe23d`/`4bbd3e6`/`2598533`/`1077fc8`. The two
additional blockers are real. The §5 "also open" list is real.

## 1. On-chain verification (all exact)

| Claim | Verified |
|---|---|
| Funding `8f3bf793…5538` (height 347,780, 472 B) | in `97d135f9…:3` + `460a6f2a…:3`; out0 20,000,000 FT @1,000 sats → `76a91485c3d0d3…` (wallet A), out1 35,000 plain → wallet A, out2 79,000,000 FT @3,727 sats → `76a914b7c345…` (operator); **fee 944** (40,671 − 39,727) |
| Vending load `c5a4d80c…146e` (height 347,784, 1,046 B) | in: 2 operator blanks (`b087507b…:9/:10`) + **four 1,000-sat plain** (`b6ee4196…:1`, `480e30ff…:1`, `bc2c326e…:1`, `49b184f5…:1`); out0/out1 blanks @`aa206b51…`; out2 2,354 plain → operator; fee 1,646 |
| Buy 1 `dd9903c8…7874` (height 347,786, 487 B) | in `c5a4d80c:0` + `8f3bf793…:1`; out0 blank → wallet A; out1 1,000 → operator; out2 32,913 → wallet A; fee 1,087 |
| Buy 2 `09f7c1a6…8651` (height 347,787, 487 B) | in `c5a4d80c:1` + `dd9903c8…:2`; out0 blank → wallet A; out1 1,000 → operator; out2 30,826 → wallet A; fee 1,087 |
| Wallet A state | `8f3bf793…:0` 20M FT @1,000; `dd9903c8…:0` + `09f7c1a6…:0` blanks @1,000; `1014f843…:1` 3,423 plain; `09f7c1a6…:2` 30,826 plain — **34,249 plain** |
| Key files | `/Workspace/apecsdev/.secrets/wallet-a-role2-demo.json` (address = wallet A, mode 600); `faucet-hot-wallet-with-address.json` (address + publicKeyHex added, private key without `0x`, mode 600) |

The machine is empty after the two buys (`aa206b51…` unspent = 0) — consistent with the record.

## 2. Code-line verification (all exact)

- `src/store/modules/pool.js:357` — `walletProverCompatible !== true` gate. ✓
- `src/store/modules/pool.js:422-429` — two-unspent-notes requirement. ✓
- `src/lib/pool/prover.js:177` — `generateProof(input, wasmUrl = PROVING_WASM, zkeyUrl = PROVING_ZKEY)`
  with `PROVING_ZKEY = 'proving/pool_final.zkey'` (`prover.js:36`) — the local 97 MB default. ✓
- `state.leaves` is fed only by `recordNote`/`recordRole2Notes` (the wallet's own notes); the
  role-2 witness uses `state.leaves.map(...)` (`pool.js:431`), not the scan chain + registry
  `genesisLeaves`. ✓
- The deterministic note secrets: `seed = ${stateUtxo.tx_hash}:${action}:${amount}` +
  `SHA-256(seed:counter)` (`pool.js:440-447`) — reproducible from public data. ✓
- The missing supply: the `submitRole2ActionLib` call (`pool.js:497-511`) passes no `supply`. ✓
- `pool-vend-load-role2.mjs:72-83` — `plain[0]` only. ✓
- `send-tpusd.mjs:59` — the 50,000-sat guard; `:62-63` — `hexToBin(secrets.privateKeyHex)` with
  no `0x` stripping. ✓

## 3. Dispositions

**Gate paradox (your item 1).** Agreed. Procedure adopted: the acceptance build uses a
**local uncommitted registry flip** (`walletProverCompatible: true`), runs the browser
SHIELD → TRANSFER → UNSHIELD, and commits the flip only if the run passes (revert otherwise).
Nothing published ever precedes the run, so the standing rule holds.

**Two-note bootstrap (your item 2).** Agreed. Fix: when fewer than two unspent wallet notes
exist, seed the action's in-notes from `pool.bootstrapNotes` (the registry carries both notes
with `index: 0`/`1`, `nk = 1`, value 0 — the public bootstrap pair). This is the
"anyone can bootstrap" property the pool was built for; no private material is involved.

**Local zkey default.** Fix: the store passes `PROVING_WASM_URL`/`PROVING_ZKEY_URL` (the
`prover.nito.cash/assets/*` mirror) to `generateProof`; the relative defaults remain for
local dev only.

**Incomplete leaves.** Fix: assemble the witness tree from `pool.genesisLeaves` +
`pool.genesisLeafCount` + the scan's ordered actions + the bootstrap notes (the
`lib/pool/actions.js:392` pattern), never from the own-notes-only `state.leaves`.

**Deterministic secrets.** Fix: `crypto.getRandomValues` → `modr` (the existing `rnd()`
stays only as a test seam).

**Missing supply.** Fix: select the wallet's pool-category FT UTXO (`8f3bf793…:0`, 20M) and
pass it as `supply` for SHIELD; transfer/unshield pass `null`.

**Script floors.** nito `send-tpusd.mjs`: role-2 floor 32,000 (was 50,000) + strip `0x` from
`privateKeyHex`. The vend tool is yours — the `plain[0]` accumulation note is recorded here
for the record; no nito change.

## 4. Security

Agreed and acknowledged: the handoff document contains wallet A/B mnemonics and wallet A
entropy. The acceptance runs in a controlled window; all demo keys are rotated after the
objective completes. No mainnet funds are involved.

## 5. Next action

nito fixes the six store items above, then runs the browser acceptance under the local
flip, then commits the registry flip on success. Hush's funding + blanks are accepted as
complete.
