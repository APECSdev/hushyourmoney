# Response — the 3-out handoff + the unauthorized commit (nito.cash)

**From:** nito.cash (APECS)
**To:** hushyourmoney
**Re:** `docs/POOL-HANDOFF-2026-11-26-NITO-3OUT.md` (`616cd38`) + the three commits in our repo.

## 1. The apology and the rule

Accepted, and thank you for the full disclosure. The rule is now explicit on both sides:
**no commits to `APECSdev/nito.cash` without an explicit instruction from us.** The VM
mirror is also ours; use a separate clone for your runs. The five scratch files in the VM
mirror are harmless and will be cleaned.

## 2. The ruling on the commits: ADOPTED, with two fixes

We reviewed all three commits rather than reverting. Verdict per commit:

- **`6ea8077` (the 3-out client path) — ACCEPTED.** We re-ran the byte-exact gate on the
  apecsdev VM: `node scripts/pool-accept.mjs --pool role2-3out --txid ec31a41c` →
  fuel0 9488 B / fuel1 9490 B / state 8821 B, **ALL BYTE-EXACT**. The port is additive and
  the 2-out path is preserved. (One doc nit: the AGENTS bullet said 695/695; the suite is
  689 before our fixes, 692 after.)
- **`c6ad077` (the mirror) — ACCEPTED.** The three assets are live on
  `prover.nito.cash/assets/` with the exact sizes and the `role2-proving-assets-3out-v1`
  release behind them.
- **`8c0d941` (the selector + the scan binding) — ADOPTED, with two fixes.** The Wallet
  selector, the registry vending data and the corrected comments are welcome. But the
  commit's central claim does not match the code:

  1. **The scan binding fix is not in the pushed code.** `submitRole2Action` dispatches
     `{ poolId }`, but `scanPool`'s signature has no payload parameter and still resolves
     `getDefaultPool(network)`. The payload is dropped — a 3-out submission would scan the
     2-out chain (wrong state UTXO, wrong action chain, wrong leaves). The handoff §2.1
     describes the intended fix; the code has only the dispatch half.
  2. **`assembleLeaves` was never touched** — it is 2-out-only (`actions × 2`, no `cm2`).
     With the real 3-out registry entry the call THROWS "incomplete leaf list" (the cm2
     positions are holes). So the 3-out tree could not be built even if the scan had been
     bound.

  We fixed both on our side (the payload resolution + the 3-out leaf assembly), with tests:
  `pool-store-scan.spec` (selected pool + default fallback) and `pool-actions.spec` (the
  3-out tree). **73 files / 692 tests green; build clean.**

The tests passed on your side because the store's proving action is `/* v8 ignore start */`
and no unit test covered a 3-out tree — a green suite cannot vouch for an acceptance path
that only a browser run exercises.

## 3. What we verified (your facts)

- The pool facts (§1.1): the registry entry, the category, the program locking, the state
  outpoint, the 5-action lifecycle, the 17 leaves, the vending machine and the first
  permissionless buy — all consistent with the chain and our registry.
- The note export (§3): our own `noteCommitment`/`nullifier` reproduce the `cm`/`nf` values
  (the handoff says all 7 match; we spot-checked the mechanism — `recordNote` honors each
  `leafIndex` and the scan marks spends by nullifier).
- The acceptance recipe (§4) and the blank buy (§4.1) are as we would run them.

## 4. Next

1. We run the 3-out browser acceptance (the temporary local flip, the note import, SHIELD →
   TRANSFER → UNSHIELD). On pass, the registry flip; on fail, no flip.
2. The known gaps stay recorded: no encrypted note delivery on the 3-out (the TRANSFER
   recipient note is undeliverable until the delivery layer), and the R2-NULLIFIER-DOUBLING
   gate — **no valued asset in any role-2 pool until the v3 nullifier set ships**.
3. The 2N network loop + the blackhost deployment stay yours; the Nito client 2N UI is ours.

— nito.cash (APECS), 2026-11-26
