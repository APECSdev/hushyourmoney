# POOL HANDOFF — 2026-11-23 — nito.cash → hushyourmoney

**To:** the hushyourmoney research team (source of truth for shielded pools)
**From:** the nito.cash wallet session of 2026-11-23
**Subject:** THE COVENANT-AT-INPUT-0 POOL IS LIVE — confirmed wallet-originated SHIELD + TRANSFER on chipnet. Registry entry + corrections + the full session record below, for the research site and `pool-registry.json`.

---

## 1. The headline

The shielded pool now runs in the **covenant-at-input-0 transaction shape** end-to-end, with
**wallet-originated actions confirmed on chipnet**. This supersedes every earlier chipnet pool
deployment for the research-site source of truth: it is the first pool where the wallet's own
prover, builder, and key lineage produce confirmed actions in the final intended layout.

**Verify on-chain (chipnet explorer):**

- Deploy: https://chipnet.chaingraph.cash/tx/efd3314edb42bddd7f7438be5dfba5ffd3da378ab13082610edd68426f38357c
- SHIELD: https://chipnet.chaingraph.cash/tx/43ca7bca59d35790e104a6c368dd1168a6fceae3eb5efa4d3a5d02ddb9f92e4d
- TRANSFER: https://chipnet.chaingraph.cash/tx/fdd2981d2ceed10099941b9228f53a59020c2a4039581f98614038de1bf97b8b

## 2. The transaction shape (the research-relevant fact)

Every pool action (deploy, shield, transfer, unshield) uses exactly this layout:

```
inputs:   in[0]  the pool covenant (spends the pool continuity UTXO + state NFT)
          in[1]  exec0        ┐
          in[2]  exec1        ├ the five verifier steps (Groth16 split across inputs)
          in[3]  exec2        │
          in[4]  genesis      │
          in[5]  terminal     ┘
          in[6]  funding (exactly one P2PKH Schnorr input)

outputs:  out[0] continuity (covenant + NEW state NFT: rootLE ‖ nullifierHash, 64 B)
          out[1] exec0   out[2] exec1   out[3] exec2   (steps re-created in program order)
          out[4] GENESIS   out[5] TERMINAL              (the requested 4↔5 swap)
          out[6] NP01 carrier (the recipient's encrypted note; transfers only)
          out[7] BCH change
```

The on-chain privacy property is intact: no sender, receiver, or amount is visible beyond the
encrypted carrier. The covenant pins `tx.inputs.length == 7` and
`inputs[INPUTINDEX].outpointIndex == INPUTINDEX` for the terminal.

## 3. Paste-ready `pool-registry.json` entry (your schema)

```json
{
  "name": "chipnet-pusd-v4-covenant0",
  "network": "chipnet",
  "poolCategory": "0d31da753c6855b830ea683ac11552404139008bfbfac97801fe30d31a42d664",
  "poolLocking": "aa209dd6f6ef70c453134afd0f13f3a1aff6b9507576c97fe1649ba5aaa06abaa15587",
  "treeRootLE": "551108f63731bcc628dda2697d70219d103a8c1bf203f2d4aaec6bbea5b4510f",
  "assetCategory": "0d31da753c6855b830ea683ac11552404139008bfbfac97801fe30d31a42d664",
  "setupGrade": "committed-1of1-published-entropy",
  "walletProverCompatible": true,
  "notes": "Covenant-at-input-0 pool deployed 2026-11-23 (anchor 0d31da75… = the category, mint a5d251e4…, deploy efd3314e…). Same wallet-COMMITTED verifying keypair as v2 (proving-assets-v1 lineage) + a fresh category; same two PUBLIC bootstrap seed notes (value 0, nk=1), so treeRootLE is identical to v2. CONFIRMED wallet-originated actions: SHIELD 43ca7bca…, TRANSFER fdd2981d… (encrypted carrier note to a second wallet's delivery point), both VM-validated 7/7 inputs on the BCH-2026 VM before broadcast. The verifier program is the FULLY-GENERALIZED build (covenant at input 0, execs 1-3, genesis 4, terminal 5) — the first pool in the final tx shape."
}
```

## 4. CORRECTION to your existing `chipnet-pusd-v2` entry

Your registry currently records v2 (category `050b5934…`) as `walletProverCompatible: true`.
**That flag must be `false`**: v2 was deployed with the bench's FIVE-INPUT fixture-layout
program (its terminal pins `OP_TXINPUTCOUNT == 5` / `OP_INPUTINDEX == 4`, its execs read
input 3 as the genesis witness), while every real wallet action emits 7–8 inputs in the
covenant-at-0 layout — no action can ever satisfy the v2 scripts, whatever the proof
(VM-verified 2026-11-23: covenant input passes; the five verifier inputs all fail).
The new `chipnet-pusd-v4-covenant0` entry above is the spendable successor under the same
keypair and the same seeded tree.

## 5. The pool's identities (all verified on-chain)

| item | value |
|---|---|
| category (= anchor txid) | `0d31da753c6855b830ea683ac11552404139008bfbfac97801fe30d31a42d664` |
| mint tx (100M FT + minting NFT) | `a5d251e4146dbb887afc185c712007ba578d9766f81b7fd95df406cc1e36a906` |
| deploy tx (pool UTXO + 5 step UTXOs) | `efd3314edb42bddd7f7438be5dfba5ffd3da378ab13082610edd68426f38357c` |
| covenant locking (P2SH32) | `aa209dd6f6ef70c453134afd0f13f3a1aff6b9507576c97fe1649ba5aaa06abaa15587` |
| seeded tree root (LE) | `551108f63731bcc628dda2697d70219d103a8c1bf203f2d4aaec6bbea5b4510f` |
| genesis leaves | 2 public bootstrap notes (value 0, nk = 1) — same as v2 |
| verifying key | wallet-committed (GitHub Release proving-assets-v1; setup grade unchanged) |

## 6. How the program was generalized (research-worthy: the hidden dispatch)

The verifier is split across five inputs; three "executor" inputs each load **an assembled
shared program** (the Miller-loop fragments carried in the witnesses, hashed, defined as
function 100, and invoked at runtime). The fixture-layout build hardcodes the layout in
**three separate layers**, and only the first two are visible in any static disassembly of
the redeems:

1. **The redeems** (loader / defs-read / k-branch / terminal tail) — the obvious layer:
   fragment-read indices, the genesis-input defs read, the executor k-branch
   (`k==1/k==2 → k==2/k==3`, `next 1,2,4 → 2,3,5`), the terminal self-index 4→5, the
   UTXO checks 0-3→1-4, the exec/genesis witness reads +1.
2. **The msmA/contract sources** — the state-push pin index, `genIdx`, the exec0 header read.
3. **THE HIDDEN ONE — the assembled shared program's own main** (in
   `densless-recovered/shared.mjs`): a `k < 3` guard, **fourteen** k-comparison sites
   (including a *first-executor flag* and an *adapter-path gate* at `0x17 OP_PICK`/`OP_ROLL`
   — both gated `k==0`, both required by the k=1 executor in the new shape), and **seven**
   `readBoundedInputSlice` input indices (0,1,2,3,4 → 1,2,3,4,5). Because the fragments are
   *data in the witnesses*, byte-comparing builds shows them "identical" — the dispatch only
   executes at runtime.

The complete generalization is **30 size-preserving source edits across five files** (plus the
`genesis-slice.json` program-hash pin), all reproducible via
`nito.cash/apps/web/scripts/generalize-bench-source.sh` (applies → rebuilds → restores the
bench via trap). Every edit is `OP_n → OP_(n+1)`-class, so the program layout (redeems
574,574,574,6044,4415 B; fragments 867/982/559 B; witness sizes 6717/6480/6409/7904/8965 B)
is byte-length-identical to the fixture build — only semantics shift.

**The program is VK-SPECIFIC** (`vkx-msm.mjs:30` bakes `FINAL = vk.ic[0] − [2^64]G` into the
genesis and terminal redeems): it must be built with the same verifying key the wallet proves
under.

## 7. The acceptance method (no blind deployments)

1. The bench's own `produceTransaction` builds witnesses for the generalized program.
2. A **synthetic 7-input transaction** (covenant at 0, steps at 1-5, funding at 6) is
   assembled and evaluated on the **BCH-2026 VM** — every input must pass. This run failed
   *identically* to the wallet's real transaction, which exonerated the wallet port and
   isolated the program.
3. Trace-bisect (fixture control vs generalized, value-stream diff) located the final two
   missing gates when 4-of-5 inputs already passed.
4. The wallet-built action (fresh proof) is captured pre-broadcast, evaluated **7/7 on the
   VM**, and only then broadcast.

One op-cost note for the record: the **genesis input is proof-marginal** — its op-cost budget
(spare ≈ 125 B ≈ 100k op) is exceeded by the bench's own test proof but not by typical
wallet-fresh proofs; the wallet's genesis-minimality rebuild loop already retries on
failure.

## 8. Where everything lives

- **nito.cash repo, commit `61cef0b`** (`master`): the covenant-at-0 program module
  (`apps/web/src/lib/pool/verifier-program-bench.js`, `fixtureShape: false`), the wallet
  registry entry (`chipnet-pusd-v4` → `0d31da75`, spendable), `networks.js` chipnet PUSD,
  and the reproducible `scripts/generalize-bench-source.sh`.
- **apecsdev VM, `~/zkb/pool-handoff/`**: the built program JSON
  (`bench-program-covenant0.json`), the deploy log, the registry-entry JSON, and the
  captured shield transaction hex.
- History: the earlier fixture-shape pool (`2d7cae86…`, TRANSFER `8dd3ce63…`) remains
  confirmed on-chain; the intermediate broken deployments (`0717e1a1…`, `07a020e9…`,
  `00081625…`, `135dc9ed…`, `1d3414ac…`, `1fafc607…`) are on-chain records of the search,
  each documented in the nito.cash registry with its measured failure mode.

*— end of handoff —*
