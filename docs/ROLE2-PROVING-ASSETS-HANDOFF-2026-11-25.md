# HANDOFF — unblock the role-2 proving assets (the pool + CashShuffle gate)

**From:** Nito Cash (APECSdev)
**To:** Hush Your Money (the role-2 pool authors) / whoever holds the ceremony artifacts
**Date:** 2026-11-25
**Status:** the nito 3-input builder, carrier, tags, lock and orchestration are DONE;
the only missing pieces are the Hush proving assets and the witness-encoding generator.

---

## 1. What exactly is blocked

The nito wallet can build and broadcast a role-2 action, but it cannot **prove** one.
The proof must be made with the SAME keypair the deployed program verifies against:

- **VK** `05250429…` (the Hush solo-ceremony verifying key; the deployed program's IC points are embedded in it)
- **zkey** `4a4e2543dbe640de7a59e23cc652b89a50034898757efff22242eafec0f7b7c0`
- **wasm** `8595b434…` (the witness calculator; full SHA-256 to be supplied)

The nito repo currently ships the OLD `proving-assets-v1` pair (the wallet-committed
VK `27f6ea03…`, zkey `pool_final.zkey` 97,714,842 B, wasm 3,373,928 B). A proof made
with those assets does **not** verify against the deployed role-2 program.

There is a second missing piece: the **witness-encoding generator**. The role-2
program's three unlockings are produced by the runner's `unlockingsFor` /
`transaction.mjs` (the `wip-role2-hook` revision). The nito `verifier.js` is the old
7-input generator; it cannot emit the role-2 witness. Without the generator the
assets alone are not enough.

The role-2 registry entry is therefore `walletProverCompatible: false`,
`status: 'awaiting-proving-assets'` (`apps/web/src/lib/pool/registry.js:88-93`).

---

## 2. What the Hush team must hand over

### 2.1 The three assets
| file | expected SHA-256 |
|---|---|
| `pool_final.zkey` | `4a4e2543dbe640de7a59e23cc652b89a50034898757efff22242eafec0f7b7c0` |
| `pool.wasm` | `8595b434…` (full hash) |
| `verification_key.json` | `05250429…` (full hash) |

### 2.2 The witness-encoding generator
The exact source that produced the live role-2 witnesses:

- `wip-role2-hook/transaction.mjs` (`unlockingsFor`, `MARGIN`, `UNLOCK_CAP`)
- `wip-role2-hook/pool-tx.mjs` (`poolTransactionFor`, the 3-input scenario)
- `wip-role2-hook/pool-op-role2.mjs` (the action assembly)
- `wip-role2-hook/pool-hook.mjs` (`carrierOf`, `actionHashOf`, the program)
- `wip-role2-hook/pool-refill-role2.mjs` (the tagged lock)
- the exact commit / worktree revision of `groth16_cashscript` + `zk-verifier-bench`

The live witness pushes (fields 4/5) are the acceptance oracle: the nito port must
reproduce them byte-exactly for the recorded actions (`9d9aa97a…`, `5262417b…`, `e54d19fb…`).

### 2.3 Distribution
- A download URL for the three files (GitHub Release, S3, or the reply).
- **CORS**: GitHub release assets send no `Access-Control-Allow-Origin`; if a release
  is used, either attach the files to the reply or allow the nito mirror.
- The nito mirror is `https://prover.nito.cash/assets/<name>` (CORS `*`, 24 h cache);
  the Worker source is `workers/prover/src/index.js` (`handleAsset`).
- A browser caching plan (the zkey is ~97 MB; Cloudflare Pages caps a single file at
  25 MiB, so the app must fetch it from the mirror, not ship it).

---

## 3. What the nito side does once the assets arrive

1. `apps/web/src/lib/pool/prover.js` — swap `PROVING_WASM_URL`, `PROVING_ZKEY_URL`,
   `VERIFYING_KEY_URL` to the Hush pair; pin the SHA-256s; keep the local-dev override.
2. `apps/web/src/lib/pool/verifier.js` — port the role-2 `unlockingsFor` (the 3-input
   witness), reproduce the live witness pushes byte-exactly (`scripts/pool-accept.mjs`
   is the gate).
3. `apps/web/src/lib/pool/registry.js` — flip `walletProverCompatible: true` and
   `status: 'live'` only after the acceptance.
4. `workers/prover/src/index.js` — mirror the three files at
   `prover.nito.cash/assets/` (CORS `*`).
5. Tests: the role-2 witness vectors; the full suite; the coverage ratchet.
6. **The web-platform acceptance**: SHIELD → TRANSFER → UNSHIELD from the browser on
   chipnet, with the real witness and the complete program VM-accepted before each
   broadcast. The nito.cash client is the final approval.

---

## 4. If the Hush assets cannot be handed over

The deployed role-2 program is pinned to the Hush VK; a proof cannot be forged for a
different key. The only alternative is a **new pool deployment under the
nito-committed VK** (`proving-assets-v1`, the pair already in `public/proving/`):
regenerate the program under that VK, redeploy, and re-run the acceptance. That is a
new deployment, not a swap; it does not unblock the existing role-2 category
`480e30ff…`.

---

## 5. Acceptance (the gate)

- `scripts/pool-accept.mjs` reports the three live role-2 witness pushes **byte-exact**.
- The role-2 witness generator reproduces the bench vectors.
- The web-platform chipnet **SHIELD → TRANSFER → UNSHIELD** succeeds end-to-end.
- The registry flag flips only after all three.

---

## 6. Contacts / links

- nito role-2 builder: `apps/web/src/lib/pool/{role2-carrier,role2-lock,role2-action,role2-actions}.js`
- nito prover: `apps/web/src/lib/pool/prover.js`
- nito verifier: `apps/web/src/lib/pool/verifier.js`
- acceptance gate: `apps/web/scripts/pool-accept.mjs`
- role-2 pool handoff: `docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md`
- daemon unblock reply: `docs/DAEMONS-NITO-RESPONSE-2026-11-25.md`

— APECSdev / Nito Cash, 2026-11-25
