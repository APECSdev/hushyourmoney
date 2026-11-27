# POOL-UPDATE-NITO-2026-11-27 — R3-FREE-NEWROOT disclosed (a second drain, found while building v3); the v3 stack status; what changes for your client

**To: the Nito Cash team. From: the Hush side. In our repo only, per the standing
rule — nothing is pushed at you, no action is required from you, and your repo and
working assets were not touched.** This is (1) a disclosure we owe you promptly —
a second, independent full-balance drain found during the v3 design pass, one
that affects your deployed pools and your client scan — and (2) a status snapshot
of the v3 build you are waiting on, so your planning can start before the full
integration handoff.

Everything below is measured and sourced; quantities not yet measured are marked
UNMEASURED. The full v3 build record is `docs/V3-BUILD-2026-11-27.md` in this
repo (commit `3da4322`); the decision record behind it is
`docs/NULLIFIER-SET-SPIKE-2026-11-27.md`. The code and probes live in the public
repo `github.com/APECSdev/pusd-shielded-pool` (master; commits `653a692`,
`7f03e55`, `1528993`).

---

## §1 R3-FREE-NEWROOT — the finding (disclosed now; closed in the v3 circuit)

**`newMerkleRoot` is a FREE WITNESS INPUT in every pool circuit generation.** It
is bound into the actionHash (so the on-chain recompute matches the proof), but
NOTHING verifies that it equals the old root with the action's own commitments
appended. Verified at three levels:

1. **Circuit** — `circuits/pool.circom` and `circuits/pool3.circom` wire
   `newMerkleRoot` only into the actionHash (pool3.circom lines 106/214/230);
   there is no append/update template anywhere in the circuit sources.
2. **Hook** — the role-2 hook's check 10 writes the carrier's `newRoot` into the
   new state NFT commitment and anchors the NEXT proof to whatever root was
   stored (check 5); no check recomputes the append
   (`pusd-shielded-pool/ROLE2-POOL-HOOK-DESIGN.md` §5, the 11-check table).
3. **Client scan** — your `apps/web/src/lib/pool/scan.js` enforces root
   *continuity* (the proof's n0 must equal the previous action's newMerkleRoot,
   ~lines 170-173) and tracks the appended leaf indices (`leafIndexBase` /
   `leafCount += outs`, ~line 176) — but never recomputes the append, so a
   planted root passes your scan untouched.

**The drain (two ordinary Groth16 proofs, honest-prover, no forgery):**

- **Action A "plant"** — an honest TRANSFER (real in-notes, real conservation)
  whose `newMerkleRoot` is the root of a FAKE tree: the real leaves, the
  action's own three out-note commitments, PLUS two fabricated notes (one of
  value = the pool's ENTIRE balance, plus a zero-value companion).
- **Action B "drain"** — an UNSHIELD whose two in-notes are the fabricated
  notes, with membership proofs against the planted root; pv = the whole
  balance; the hook's balance arithmetic passes (`newBalance = balance + pv −
  2·sign·pv = 0 ≥ 0`); the payout output pays out everything.

Both proofs `snarkjs groth16 verify` OK **against the deployed 3-out VK** —
evidence: `/home/apecs/cov/role2-probe-freeroot-drain-3out.json` (apecsdev VM);
the probe is committed at `pusd-shielded-pool/spike-nullset/probe-freeroot-drain.mjs`
and is NOT broadcast. The mechanism is VK-independent (it is a witness freedom,
not a forgery): the same two-action construction works under ANY proving assets
for these circuits, including your `proving-assets-v1` lineage — adapting the
committed probe to your zkey/VK is a witness-generator swap, nothing else.

**Impact on you:**

- **Your pools**: `chipnet-pusd-v2` and `chipnet-pusd-v4-covenant0` share the
  circuit lineage — the finding applies to both (v2 is not spendable today; v4
  is). Testnet demo value only. The standing rule — **no valued asset may enter
  ANY pool running the current hook** — already covers every pool, ours and
  yours, and R3 reinforces it.
- **Severity vs R2**: this drain is INDEPENDENT of and simpler than
  R2-NULLIFIER-DOUBLING (no nullifier reuse at all), and **the nullifier SMT
  alone does NOT stop it** — a fabricated note's nullifier is fresh. This is why
  the v3 circuit revision grew an append-proof component (§2).
- **A client-side detection you can ship independently**: your scan already
  maintains the leaf list per action (`leafIndexBase`); recomputing the 3-leaf
  append per action and comparing the result against that action's carrier
  `newMerkleRoot` would DETECT a planted root (flag/reject the action, halt the
  scan — the on-chain state is corrupt). That is detection, not prevention:
  consensus still accepts the plant; only the v3 in-circuit append proof
  prevents it. Your call whether to add it as a stopgap.

## §2 The v3 stack — what is already built and measured (this is what you are waiting on)

The spike decision (hook-level SHA256 SMT, D=254; the in-circuit option was
refused by the phase-1 pot18 artifact at 743,608 constraints) is unchanged and
executed. All of the following is DONE, pushed, and green:

| piece | measured result |
|---|---|
| circuit `circuits/pool4.circom` (+ `noteappend.circom`) | **247,120 constraints** (+62,592 / +33.9% vs pool3's 184,528), nPublic **2**, 174 private inputs, r1cs 47,812,408 B — 15,024 under the pot18 wall |
| the three circuit fixes | (a) **append proof**: three sequential `DenseAppend` dual-walk inserts chain `merkleRoot -(cm0)-> r1 -(cm1)-> r2 -(cm2)-> newMerkleRoot`, each pinned to the tree's frontier by a dense-shape rule (no holes — a holey tree would fork every sequential scanner); (b) **deposit path** (`isDeposit`: membership gated, in-values pinned to zero — genesis tree EMPTY, bootstrap seeds GONE); (c) **nf0 ≠ nf1** |
| witness-level gate | honest control + deposit ACCEPT at `wtns check`; the R3 plant REJECTED (the append chain); the R2 doubling REJECTED (nf distinctness) — `spike-nullset/probe-v3-negatives.mjs` |
| ceremony (1-of-1 demo, pot18) | `ZKey Ok!` · circuit hash `69622946620445cf…` · VK sha256 `07638f101038418d7b97ba46871476edaf3f6c63086fa9e984a2aa33e530b704` (groth16/bn128, **nPublic 2, IC 3**) · zkey sha256 `942f8fc5327191da4a98bfbd81b74f87bd6f79267efb2d3067ac6cd0175a723a` (104,040,332 B) · wasm sha256 `a9b4b03d17c614ba920c45df5c34949e26ce8cdbdeb3d6b145476a2857289395` · entropy published per the demo precedent |
| fixtures | 5 proofs under the new zkey (transfer/shield/unshield/transfer2/**DEPOSIT** — the onboarding path's first proof, n0 = the empty genesis root), all snarkjs-verify OK, each with per-fixture SMT walk data |
| walk scripts (`wip-role2-hook/walk-scripts.mjs`) | walkA **278 B** / walkB **291 B** raw lockings, OP_BEGIN/UNTIL loop form (the spike's unrolled walk was 11,656 B > the 10,000-B locking cap); unlockings **8,164 / 8,131 B**; honest accepts on both VMs at ~4.2M op of ~6.5M self-funded budgets; 10/10 tamper battery incl. the replay |
| program | plain 7,385 B sha256 `925a4232…`; **v3 hooked 7,998 B sha256 `d98c1d2ac828a909…`** (+150 B over the 3-out 7,848) |
| acceptance (`wip-role2-hook/pool-test-v3.mjs`) | **29/29** — controls transfer/shield/unshield/DEPOSIT through the FULL program, the walk inputs on their own scripts, and every rejection class incl. the 6 new v3 classes (below) |

Two NEW VM landmines were measured while building the walks (relevant to anyone
writing script-side code; recorded in the walk-scripts header):
`BIN2NUM` of the bare sign byte `[0x80]` decodes as −0 = **zero**; `RSHIFTNUM`
**truncates toward zero** for negatives (bit parity flips). The v3 walk keys are
zero-padded to stay unsigned.

**The 6 new v3 rejection classes (all rejected in the 29/29):** the REPLAY
(nf0 already in the set → walkA's 0-walk fails — the R2 mechanism now stopped
at consensus level); the state commitment's nullSetRoot half tampered (walkA);
the new commitment's finalNullRoot half tampered (walkB — role 2 accepts by
design, the two-script pin); a 4-input tx (the graph's TXINPUTCOUNT pin); and
swapped/junk walk lockings (the hook's 4w hash pins).

## §3 What changes for the Nito client — and what does NOT (integration preview)

**Unchanged (your existing code carries over):**

- The **9-field actionHash** preimage (`nf0|nf1|cm0|cm1|cm2|pvAbs|pvSign|category|newRoot`, 288 B) — byte-identical.
- The **201-B carrier** layout — byte-identical.
- **nPublic 2 / the 2-scalar MSM verifier contract** — your prover integration
  is a zkey/wasm/VK swap (same snarkjs pipeline).
- The deposit-tag fuel scheme (checks 4c/4g), the minting guard, the vending
  covenant — pool-agnostic, untouched.
- The state NFT commitment length stays **64 B** — but the second half changes
  meaning: `noteRoot ‖ nullifierFold` → **`noteRoot ‖ nullSetRoot`** (the SMT
  root). Your scan reads the commitment; the second half is now the SHA256 SMT
  root, maintained by the walk scripts.

**Changed (the v3 client work, previewed here — the full handoff follows the
remaining gates):**

```
 action tx (v3): 5 inputs / 3 outputs
 ┌───────────────────────────────────────────────────────────────────────┐
 │ in0  tagged fuel NFT (tag = SHA256(nf0‖nf1))  — carries the FT deposit │
 │ in1  tagged fuel NFT (same tag)                                       │
 │ in2  state NFT  — role 2 (the hook): commitment = noteRoot‖nullSetRoot│
 │ in3  walkA data — RAW walkA locking; unlocking = midRoot‖sibsA        │
 │ in4  walkB data — RAW walkB locking; unlocking = sibsB               │
 ├───────────────────────────────────────────────────────────────────────┤
 │ out0 OP_RETURN carrier (201 B, UNCHANGED)                            │
 │ out1 new state NFT (commitment = newRoot‖finalNullRoot)               │
 │ out2 payout (unshield only)                                          │
 └───────────────────────────────────────────────────────────────────────┘
```

- **The deposit path is the onboarding flow**: a user with no pool notes makes
  their first notes from a public FT deposit (`isDeposit=1`; the genesis tree is
  EMPTY — no bootstrap seeds to import, the exact dependency that made your
  browser acceptance reuse the public seeds). Your SHIELD-first-time flow
  becomes DEPOSIT-first-time.
- **Per-action SMT walk data**: your action builder must produce, per action,
  `sibsA` (254×32 B) + `midRoot` (walk nf0 from the stored nullSetRoot), then
  `sibsB` + `finalNullRoot` (walk nf1 from midRoot) — the reference JS mirror +
  the exact witness shapes are in `pusd-shielded-pool/role2-op-witness-v3.mjs`
  (committed; 4/4 walk cross-checks built in).
- **Your scan gains the nullifier SMT**: reconstruct it from the observed
  actions (you already reconstruct the note tree the same way); the walk data
  per action is self-validating (it folds to the state roots).
- **The lock/refill tooling** grows two dust UTXOs per action locked to the
  fixed, deployed walkA/walkB lockings (permissionless to create — the sibling
  data is witness-supplied at spend time; the walk is self-validating against
  the state).
- **Action size/fees** (computed from measured components): 28,326 B (the 3-out
  anchor) + 8,164 + 8,131 B walk unlockings ≈ **~45 KB → ~47-48k sats** at the
  same ~1.06 sat/B BARE rate. Browser prove time at 247,120 c: **UNMEASURED**
  (the 24.6-s anchor is the 184,528-c pool3; expect a similar class).

## §4 Remaining gates and what we need from you (nothing)

In order, on our side: the red team (the 151-scenario list extended to the
5-input shape), the liveness sweep + the hook cost re-measure, the chipnet demo
deploy (a NEW pool, born-guarded, genesis EMPTY, lifecycle **DEPOSIT → TRANSFER
→ UNSHIELD**, every input VM-ACCEPTED), then the proving-assets release
(the `role2-proving-assets` pattern — the new zkey/wasm/VK package, published
only after the red-team/sweep gates pass) and the full integration handoff
document. Estimated at one further working session of the scale of the sessions
that closed the 3-out build and this one — a projection, not a measurement; the
known variables are chipnet mining cadence and whatever the red team surfaces.

**What we need from you: nothing.** Your 3-out browser acceptance remains your
event and your call. Two facts to weigh it against, stated plainly: the 3-out
pool runs the current hook (R2 and R3 are open on it — testnet demo funds only,
and the standing rule already forbids valued assets), and the v3 is the
integration target your client will ship against. None of your 3-out client
work is wasted — the carrier decode, the actionHash recompute, the witness
paths, and the scan skeleton all carry into v3; only the items in §3's changed
list are new.

## §5 Sources

- This repo: `docs/V3-BUILD-2026-11-27.md` (the full build record, commit
  `3da4322`); `docs/NULLIFIER-SET-SPIKE-2026-11-27.md` (the Option-B decision);
  `docs/HANDOFF-2026-11-26-3OUT-NOTES-MANAGEMENT.md` §12 (R2); your
  `docs/POOL-3OUT-HANDOFF-RESPONSE-2026-11-26.md` (your response record).
- `pusd-shielded-pool` (public, master): `spike-nullset/probe-freeroot-drain.mjs`
  (the R3 evidence probe — adapt to your VK by swapping the proving assets),
  `spike-nullset/probe-v3-negatives.mjs` (the revision gate),
  `circuits/pool4.circom`, `circuits/noteappend.circom`,
  `role2-op-witness-v3.mjs` (the witness + SMT mirror reference),
  `wip-role2-hook/walk-scripts.mjs`, `wip-role2-hook/walk-test.mjs`,
  `wip-role2-hook/pool-hook.mjs` (the v3 hook path),
  `wip-role2-hook/pool-test-v3.mjs` (the 29/29 suite),
  `wip-role2-hook/v3-graph-pin.patch` (the bench generator edit, inert for
  stock builds).
- Your scan, read-only: `apps/web/src/lib/pool/scan.js` (~lines 170-176 — the
  continuity-only root check and the leaf-index tracking).
- VM evidence: `/home/apecs/cov/role2-probe-freeroot-drain-3out.json` (the two
  drain proofs), `/home/apecs/cov/our-v3-proofs.json` (the 5 v3 fixtures incl.
  the deposit proof), `~/zkb/pusd-shielded-pool/build4/` (the ceremony
  artifacts).

— the Hush side, 2026-11-27. The full integration handoff follows the
remaining gates; nothing here requires action from you.
