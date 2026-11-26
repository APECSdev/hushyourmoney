<!-- docs/ROLE2-PROVING-ASSETS-HANDOVER-2026-11-25.md -->

# HANDOVER — role-2 proving assets + witness generator (Hush → nito.cash)

**From:** Hush Your Money (APECS Dev)
**To:** Nito Cash (APECSdev)
**Date:** 2026-11-25
**Re:** `docs/ROLE2-PROVING-ASSETS-HANDOFF-2026-11-25.md`
**Status:** the three assets are ready and hash-verified; the witness generator is packaged with its exact worktree; the acceptance gate is defined below.

---

## 0. Release and mirror

- Release: `https://github.com/APECSdev/pusd-shielded-pool/releases/tag/role2-proving-assets-v1`
- Asset base: `https://github.com/APECSdev/pusd-shielded-pool/releases/download/role2-proving-assets-v1/`
- nito mirror: `https://prover.nito.cash/assets/<name>` (CORS `*`, 24 h cache; the Worker proxies the release server-side, so the GitHub release's missing `Access-Control-Allow-Origin` is not a blocker)

The release asset names are flat. This package keeps the same files under `assets/`, `fixtures/`, `circuit/`, `bench/`, `source/`, `docs/`; the SHA-256 values are identical.

---

## 1. The three assets (exact, verified 2026-11-25)

| file | size (bytes) | SHA-256 |
|---|---:|---|
| `pool_final.zkey` | 97,716,000 | `4a4e2543dbe640de7a59e23cc652b89a50034898757efff22242eafec0f7b7c0` |
| `pool.wasm` | 3,376,395 | `8595b43409370c83f371e16408cde85d88382f6fa66f406404071fb38efa7a48` |
| `verification_key.json` | 3,111 | `05250429214cd82eac6540459a564c223c2b3f985122fbe5369b2eac7546bd19` |

These are the assets used by the live role-2 lifecycle (`9d9aa97a…`, `5262417b…`, `e54d19fb…`). The zkey is the 1-of-1 solo-ceremony contribution with the published entropy in `fixtures/demo-entropy.txt`.

**Source-of-truth paths on the apecsdev VM:**

- `~/zkb/pusd-shielded-pool/build/pool_final.zkey`
- `~/zkb/pusd-shielded-pool/build/verification_key.json`
- `~/zkb/pusd-shielded-pool/build256-vm/pool_js/pool.wasm`

The `pusd-shielded-pool/build/verification_key.json` in the git repo is the OLD PPOT VK (`27f6ea03…`), and `artifacts/pool.wasm` + `artifacts/pool_final.zkey` are the stale pre-PPOT artifacts. Do not use those.

---

## 2. Source revisions

| item | revision | package file |
|---|---|---|
| `pusd-shielded-pool` | `bec4809` (role-2 tooling commits `98c836f`, `070a441`, `bec4809`) | `source/pusd-shielded-pool-bec4809-role2.tar.gz` |
| `groth16_cashscript` | `4571af92bca11fb9c15551c0a439cd4684a8f724` + the worktree | `bench/g16-bn-native-sound-worktree.tar.gz` + `bench/REVISION.txt` |
| `zk-verifier-bench` | `db068eb4be8a096345ddf80494eb0d85b7e18abf` + the worktree | `bench/zk-verifier-bench-db068eb4-pairing-vectors.json` |
| fixtures | converted from the ceremony VK + `our-proofs.json` | `fixtures/our.fixtures.json`, `fixtures/our-proofs.json` |
| ceremony entropy | published | `fixtures/demo-entropy.txt` |

The `groth16_cashscript` worktree is dirty by design. `bench/REVISION.txt` records `git status --short` and the diffs. The modified `chunked/bn254/densless-recovered/terminal.mjs` (5→7 input count) is the **nito v4 generalization**, not part of the role-2 generator. The role-2 generator is `chunked/bn254/bn-native-sound/`.

---

## 3. The witness generator (the part the original handoff's file list missed)

The nito handoff's §2.2 names `wip-role2-hook/transaction.mjs`. That file does not exist in the repo. The actual `unlockingsFor` / `MARGIN` / `UNLOCK_CAP` source is the bench module:

- `chunked/bn254/bn-native-sound/transaction.mjs` (3,247 B; sha256 `4ef458a57f33eca3e66c598fcf81bdd7c026cadfe5127036b64fc7d81edce964` at `4571af92…`)
- `chunked/bn254/bn-native-sound/protocol.mjs` (15,800 B)
- `chunked/bn254/bn-native-sound/vm.mjs` (2,102 B)
- `chunked/bn254/bn-native-sound/script.mjs` (33,118 B)

The repo's `wip-role2-hook/` tooling imports those modules; the suite is designed to be copied into the bench directory. The complete set in this package is:

```
bench/g16-bn-native-sound-worktree.tar.gz
  chunked/bn254/bn-native-sound/
    transaction.mjs  protocol.mjs  vm.mjs  script.mjs  build.mjs
    pool-hook.mjs  pool-tx.mjs  pool-op-role2.mjs  pool-refill-role2.mjs
    pool-deploy-role2.mjs  pool-tagbatch-role2.mjs  pool-build.mjs
    minting-guard.mjs  blank-vending.mjs  blank-buy.mjs  pool-vend-load-role2.mjs
    pool-test.mjs  pool-sweep.mjs  pool-redteam.mjs  pool-cost.mjs
    build.json  (the plain build record; the hooked build is derived at run time)
  package.json  (the working manifest: @bitauth/libauth 3.1.0-next.8,
                 @noble/curves 2.2.0, cashc ^0.14.0)

source/pusd-shielded-pool-bec4809-role2.tar.gz
  circuits/pool.circom  circuits/note.circom
  role2-op-witness.mjs  role2-seeds.mjs
  wip-role2-hook/  (STATUS.md, REVIEW.md, all pool-*.mjs, the reports)
  gen-our-proofs.mjs  gen-sweep-proofs.mjs  export-our.mjs
  package.json  pnpm-lock.yaml
```

`node_modules` is not included. Install from the included `package.json` / `pnpm-lock.yaml`.

---

## 4. Reproducibility self-check (run 2026-11-25, verified)

The deployed program is category-bound. The deployed category is `480e30ff…`; its on-chain (little-endian) form is `d0b901bd0ab5d02856399af26615f676173b36be2ddde96f0b5f3f1dff300e48`.

```sh
cd groth16_cashscript/chunked/bn254/bn-native-sound
BN_VK_FIXTURES=/path/to/our.fixtures.json node --input-type=module -e '
import {createHash} from "node:crypto";
import {buildProgram, setCovenant} from "./script.mjs";
import {covenantHook, covenantParams} from "./pool-hook.mjs";
import {p2sh32} from "./vm.mjs";
const catOn = "d0b901bd0ab5d02856399af26615f676173b36be2ddde96f0b5f3f1dff300e48";
setCovenant(covenantHook(covenantParams({categoryOnChain: catOn})));
const prog = buildProgram();
const sha = (b) => createHash("sha256").update(b).digest("hex");
console.log("code", prog.code.length, sha(prog.code));
console.log("R", Buffer.from(prog.R).toString("hex"));
console.log("locking", Buffer.from(p2sh32(prog.R)).toString("hex"));
'
```

Expected output:

```
code 7834 f12f90947e09a635f98a2938fedac58b7548c36edead44aecc38564967bce116
R 00ca0209157f7702bd0f7f7551ca02eb157f7702dd0e7f757e76a820f12f90947e09a635f98a2938fedac58b7548c36edead44aecc38564967bce116885189518a
locking aa203e40b64cff154d4b3305e8c8cc4e3174bc595ad74342a8445a9a7798b7be3a2987
```

The output matches the on-chain deploy tx `2eaeb97fc85b2ff0fdd6c6afd1d807f8a715bd92a40258fae9f0e6ce50fe83b8`:

| output | sats | locking | token |
|---|---:|---|---|
| 0 | 10,000 | `aa203e40…` | category `480e30ff…`, amount 0, NFT `551108f6…510f` ‖ 32 zeros |
| 1 | 1,000 | P2PKH | category `480e30ff…`, amount 0, empty NFT (minting NFT passed forward) |
| 2 | 1,000 | P2PKH | category `480e30ff…`, amount 100,000,000 |
| 3 | 291,878 | P2PKH | no token (change) |

**Correction to the handoff / `verifier-program-role2.js`:** the `codePin` `d71851a1ce6d795c0aa40ab055faac1000755d474313f16e6cd34855ffbfff41` is the hooked program's code hash for the **canonical sweep category** `2469acc5…` (`pool-sweep.mjs:47-57`). The deployed category `480e30ff…` produces code hash `f12f9094…` (7,834 B), which is what the on-chain R redeem commits to. The `d71851a1…` value is a source-drift pin, not the deployed code identity.

---

## 5. The acceptance gate

1. Port `unlockingsFor` (the 3-input role-2 witness) from `transaction.mjs` into the nito `verifier.js`.
2. Add a role-2 entry to `apps/web/scripts/pool-accept.mjs`. The current `POOLS` map contains only `gate3` and `mainnet`, and its default vkey is `tests/fixtures/pool/deployed-vkey.json` (the gate3/mainnet recovered VK). The role-2 entry needs:
   - locking `aa203e40b64cff154d4b3305e8c8cc4e3174bc595ad74342a8445a9a7798b7be3a2987`
   - chipnet Electrum (`chipnet.bch.ninja:50004`)
   - the ceremony VK `05250429…`
   - the 3-input witness comparison (the fixed offsets 1825/1792 are the 5-input gate3 shape)
3. Reproduce the live witness pushes byte-exactly for `9d9aa97a1ccdcd6662eb934fd55c72dff17ddba8c6c152a506871f795026ccf0`, `5262417b7fff1b0e9f9cd60ab80625e573ac565a916ff1d451369d433bd09987`, `e54d19fb751f60a0955ba92a0af75ad87083b2e1cb1648b4fa08312b901d8eab`.
4. Run the web-platform chipnet **SHIELD → TRANSFER → UNSHIELD** from the browser with the real witness, the complete program VM-accepted before each broadcast.
5. Flip `walletProverCompatible: true` and `status: 'live'` only after 1–4. The nito.cash client is the final approval (standing directive).

The live pool facts: category `480e30ff…`, program `aa203e40…`, minting guard `aa2066a2…`, vending machine `aa206b51…` (1,000 sats, category-pinned), genesis root `551108f6…510f`, 3 inputs (fuel 0, fuel 1, state 2), 169-B OP_RETURN carrier, deposit tags `SHA256(nf0_LE ‖ nf1_LE)` on both fuel UTXOs, 2 blanks per lock, 15,000 sats per fuel UTXO.

---

## 6. Security — read before using the VK

- The ceremony is a **1-of-1 solo ceremony** with **published entropy**: `c490ce06a2f364ee1ec87c75b0a8d9138e18df4e0f17b931` (`fixtures/demo-entropy.txt`).
- The toxic waste is derivable from the published transcript. Proofs can be forged under this VK. This is a **chipnet demo** setup, not a production setup.
- Mainnet value requires **Gate 7** (the public MPC ceremony). Do not reuse this VK for mainnet value.
- The deployed role-2 pool is chipnet-only. The current pool carries the reviewed sound verifier with the pool rules inside role 2; the hook is our own code with no independent review. The nito.cash client is the final approval.

---

## 7. License / redistribution

- The HushYourMoney repository is MIT (`LICENSE` included; Copyright 2020-2024 Shomari).
- The `pusd-shielded-pool` repository has no separate LICENSE file.
- The artifacts are provided under the MIT terms of the HushYourMoney repository; keep the notice with any redistribution.
- The Phase-1 ptau provenance: Perpetual Powers of Tau `ppot_0080_18.ptau` (302,083,218 B, sha256 `9693220206afab749e3d88d4ab5fdf5d36120ea102e7e587ccea0e7a5208e711`), plus the contribution entropy above.

---

## 8. What is NOT included

- `role2-pool-state.json` — contains `nk` (nullifier keys) in every note. **Not included.**
- `.secrets/*` — not included.
- `node_modules` — not included; install from the included `package.json` / `pnpm-lock.yaml`.
- The stale `pusd-shielded-pool/build/` and `artifacts/` VK/zkey/wasm — not included (wrong pair).

---

## 9. Package contents and SHA-256

See `SHA256SUMS` (flat release asset names). The `docs/` directory carries the three reference documents:

- `POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md` — the role-2 delivery package.
- `POOL-DEPLOYMENT.md` — the deployment runbook (§15–§18 are the role-2 record).
- `ROLE2-PROVING-ASSETS-HANDOFF-2026-11-25.md` — the nito request this document answers.

---

## 10. Contact

APECS Dev / Hush Your Money. The nito.cash client is the final approval for any deployed result.
