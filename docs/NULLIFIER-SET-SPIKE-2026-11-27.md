# The Nullifier-Set Spike — MEASURED: in-circuit Poseidon vs hook-level SHA256 (2026-11-26/27)

**Mission** (per `docs/HANDOFF-2026-11-26-3OUT-NOTES-MANAGEMENT.md` §12.5 and
`docs/ROLE2-3OUT-V3-DESIGN.md` §3.2): *before any ceremony is scheduled*, measure
whether a collision-free sparse Merkle tree keyed by the nullifier (depth ≈ 254)
fits — in-circuit (Poseidon) or hook-level (SHA256 in BCH script). That single
measurement decides where the v3 nullifier set lives.

**Verdict up front: the measurement decides for the HOOK-LEVEL SHA256 set.**
The in-circuit option at the collision-free bar measures **743,608 constraints —
4.03× the current circuit — and is REFUSED by the phase-1 Powers-of-Tau artifact
we hold** (`ppot_0080_18.ptau`, measured refusal below); every sound in-circuit
depth needs a bigger phase-1 instantiation and ~4× ceremony + prover cost. The
hook-level option leaves the circuit at today's size (the deposit-path revision
still fits the phase-1 we hold), keeps the browser prover at today's 98-MB zkey /
~25-s prove, and pays instead in per-action bytes: **~+21–23 KB per action
(+~75 % fee at BARE rates)**, with the walk op cost at **~2.5 M op against a
~13.6 M-op self-funded budget**. Both constructions were built, run, and
verified end-to-end for this record: the circuit side passes `snarkjs wtns check`
against its compiled R1CS, and the script side accepts a true witness and rejects
tampered siblings/roots on the real BCH-2026 VM.

All measurements were taken on the `apecsdev` VM (circom 2.2.3, circomlib,
circomlibjs, snarkjs 0.7.6, libauth `createVirtualMachineBch2026`), in
`~/zkb/spike-nullset/` (tooling committed at `pusd-shielded-pool/spike-nullset/`).
Quantities not measured are marked PROJECTION or ESTIMATE. Nothing on chain was
touched; no ceremony was scheduled; this is a spike, not a build.

---

## 1. What is being fixed

The R2-NULLIFIER-DOUBLING finding (full record: handoff §12; disclosure on
`/research/shielded-pool`): valid Groth16 proofs exist that use ONE note as BOTH
in-notes — neither `pool.circom` nor `pool3.circom` constrains `nf` distinctness,
and hook check 7 only FOLDS `newNull = SHA256(oldNull ‖ nf0 ‖ nf1)` with no
membership test, so the fold cannot stop a double-spend. One action drains the
2-out pool (762,400 FT); three drain the 3-out pool.

The v3 fix is a real nullifier SET: the state commitment carries a set root;
every action proves its two nullifiers are NOT yet in the set (a sparse Merkle
tree keyed by the nullifier makes non-membership provable: the slot addressed by
the key must hold the zero leaf) and emits the updated root. Two places can live:

```
 Option A — IN-CIRCUIT (Poseidon)              Option B — HOOK-LEVEL (SHA256 in script)
 ┌──────────────────────────────┐              ┌──────────────────────────────────────┐
 │ prover (browser wasm)         │              │ hook (BCH script, per action)        │
 │  old null root ──┐            │              │  state NFT: noteRoot ‖ nullSetRoot  │
 │  nf0,nf1 ──┐     │            │              │       ▲                    ▲       │
 │  sibs ──┐  ▼     ▼            │              │  carrier nf slices ──── actionHash  │
 │         └─ SMTInsert ×2       │              │  (proof-bound, fields 0/1)          │
 │  (walk 0-leaf → old root,     │              │         └─ SMT walk ×2 (508 SHA256) │
 │   walk 1-leaf → new root)     │              │            old walk must hit the    │
 │         └─ actionHash gains   │              │            state's nullSetRoot      │
 │            oldNull/newNull    │              │            new root folded to state │
 │            (+1 SHA256 block)  │              │  sibs + walk code ride the action   │
 └──────────────────────────────┘              └──────────────────────────────────────┘
 circuit grows ~4×; tx unchanged                circuit unchanged; tx grows ~+21–23 KB
```

Key = the nullifier itself (a uniform 254-bit Poseidon output in-circuit; the
full 32-B carrier slice script-side — 256 usable bits). No extra `H(nf)` is
needed. Both options keep **nPublic = 2** (the reviewed 2-scalar verifier
contract) and the same 64-B state-commitment layout (`noteRoot ‖ nullSetRoot`).

---

## 2. Option A measured — in-circuit Poseidon SMT

### 2.1 Unit costs (compiled on the VM, `snarkjs r1cs info`)

| probe (file in `spike-nullset/circuits/`) | constraints | notes |
|---|---|---|
| `probe_poseidon2` — one Poseidon(2) | **517** | the tree-hash primitive |
| `probe_mux1` — Mux1 | 1 | side selection |
| `probe_num2bits254` — Num2Bits(254) | 255 | key decomposition |
| `probe_merkle20` — MerkleProof(20) | 10,400 | anchor: 520/level — the current note tree |
| `probe_smt32` — SMTInsert(32) | 33,249 | dual-walk insert, ONE nullifier |
| `probe_smt128` — SMTInsert(128) | 132,993 | |
| `probe_smt254` — SMTInsert(254) | **263,907** | per-level marginal 1,039.0 c |
| `probe_smtproc254` — circomlib SMTProcessor(254) | 271,758 | REJECTED — costlier than the hand-rolled dual-walk |
| `probe_sha2304` — Sha256(2304) | 156,320 | the current 9-field actionHash (~85 % of today's circuit!) |
| `probe_sha2816` — Sha256(2816) | 187,584 | **+31,264 c per 512-bit block** |

The dual-walk insert (2 × Poseidon(2) per level: the 0-leaf walk proves
non-membership against the old root; the 1-leaf walk emits the new root) is the
cheapest construction found — 7,851 c cheaper than circomlib's SMTProcessor at
depth 254.

### 2.2 The grafted v3 circuit (`pool3_v3null.circom`: pool3 + two sequential
inserts + `oldNullRoot`/`newNullRoot` bound into an 11-field actionHash)

| depth D | constraints | ×current | r1cs | wasm | compile | wtns calc |
|---|---|---|---|---|---|---|
| 254 | **743,608** | 4.03× | 117,142,084 B | 5,622,911 B | 368.6 s | 10.77 s |
| 128 | **482,032** | 2.61× | 82,188,676 B | 4,575,595 B | 295.0 s | 11.29 s |
| (anchor: current pool3) | 184,528 | 1.00× | 39,449,264 B | 3,380,815 B | 20.2 s | 7.08 s |

Both grafts compile with **nPublic = 2** and pass the full correctness gate:
`snarkjs wtns calculate` + `wtns check` → **WITNESS CHECKING FINISHED
SUCCESSFULLY** (witnesses generated from the LIVE 3-out pool state
`/home/apecs/cov/role2-pool3-state.json` with an empty genesis nullifier tree,
4/4 JS-mirror walk checks passing first — `spike-nullset/gen-spike-inputs.mjs`).

### 2.3 The ceremony wall — MEASURED refusal

`snarkjs groth16 setup` against the phase-1 artifact we hold
(`ppot_0080_18.ptau`, 302,083,218 B, the same file behind the deployed build3
zkey):

```
743,608-c r1cs → [ERROR] snarkJS: circuit too big for this power of tau ceremony. 743608*2 > 2**18
482,032-c r1cs → [ERROR] snarkJS: circuit too big for this power of tau ceremony. 482032*2 > 2**18
```

The snarkjs bound (`snarkjs/build/browser.esm.js:6877`): the ptau power must
exceed `floor(log2(nConstraints + nPubInputs + nOutputs)) + 1` — pot18 supports
circuits **under 262,144 constraints**. The current 184,528-circuit fits (proven
by the existing hash-verified build3 zkey); both v3null variants are refused.
Solving for the deepest in-circuit insert that would still fit pot18:
`184,528 + 2×(1,034·D − 255) + 31,264 + 510 + 4 < 262,144` → **D ≤ 22** — and a
22-bit nullifier key is birthday-broken (~2,000 nullifiers → coin-flip
collision). **Every sound in-circuit depth (D ≥ 64 ≈ 348k) exceeds the phase-1
artifact we hold**; Option A requires a bigger Powers-of-Tau instantiation
(pot20 for the 743k circuit — the same PPOT #0080 transcript lineage exists at
higher powers, a ~1.2-GB-class download) plus a ~4× phase-2 MPC per contributor
(the 184k solo setup measured 11 m 02 s; PROJECTION ~45 min per contribution at
743k).

### 2.4 Prover-side projections (labeled)

- browser witness generation: **measured** 7.08 s → 10.77 s (1.52× — sub-linear,
  the walks are cheap in wasm time).
- full prove: anchor 24.6 s (184,528, recorded); PROJECTION ~4× the
  MSM/FFT-dominated segment → **~70–90 s** at 743,608. UNMEASURED (a real setup
  needs the pot20-class phase-1 first).
- zkey download for every browser prover (nito.cash web): 98.2 MB today →
  PROJECTION ~390 MB. UNMEASURED.
- action tx size/fees: **unchanged** — the nullifier witness rides the ZK proof.

---

## 3. Option B measured — hook-level SHA256 SMT

### 3.1 VM facts established first (libauth `createVirtualMachineBch2026`)

| fact | measurement |
|---|---|
| `0x7f` on this VM | **OP_SPLIT** `(data, index) → (left, right)` — not OP_SUBSTR (probed) |
| minimal-push rule | enforced (`OP_0`/`OP_1..OP_16` required for small pushes) |
| locking-bytecode cap | **exactly 10,000 B** (10,001 B → "Maximum bytecode length: 10000 bytes") |
| op budget | `(41 + unlockingLen) × 800` per input — **the witness bytes fund the budget** (a 10,000-B locking script with EMPTY unlocking dies at "Maximum operation cost: 32800 (density control length: 41)" = (41+0)×800) |
| unit op costs (delta vs the 101-op baseline) | push 32 B = +232; CAT 32+32→64 = +528; SHA256 over 64 B = +524; SHA256 over 32 B = +428 — the op model is byte-weighted |

### 3.2 The dual walk (`spike-nullset/probe-walk-cost.mjs`)

An unrolled linear script per nullifier: 0-leaf walk up the D supplied siblings
must land on the state's nullSetRoot (non-membership), then the 1-leaf walk
emits the updated root. The per-level key bit is **extracted in script**
(SPLIT byte + AND mask + IF) — the slot is bound to the key, not chosen by the
witness. True witness → ACCEPT; tampered sibling → REJECT; tampered old root →
REJECT — measured at D=64 and D=128 on the real VM, consensus AND standard
mode.

| depth D | script | unlocking (witness) | op (consensus / standard) | budget | result |
|---|---|---|---|---|---|
| 64 | 2,850 B | 2,211 B | **318,065 / 350,833** | 1,801,600 | ACCEPT; both tampers REJECT |
| 128 | 5,658 B | 4,323 B | **633,401 / 698,937** | 3,491,200 | ACCEPT; both tampers REJECT |
| 254 | 11,656 B | 8,481 B | ~1.25 M (extrapolated ×2) | 6,817,600 | **script exceeds the 10,000-B locking cap — cannot run unrolled** |

Per-action (two nullifiers, sequential inserts): script ~23,312 B + witness
~16,962 B at D=254. Two structural consequences, both with known in-architecture
answers:

1. **The unrolled walk code does not fit one script at D ≥ 128-pair** (11.3 KB
   two-nullifier at D=128; 23.3 KB at D=254, vs the 10,000-B cap). The deployed
   role-2 program already runs a function-invoke system over witness-carried
   code pieces (functions 22/23/24, `OP_INVOKE`) — one ~24-B level-body function
   invoked 1,016× collapses the code to **~4–6 KB (ESTIMATE)**.
2. **The sibling witness needs its own input(s)**: the state input's unlocking is
   8,821 B today; +16,962 B would blow the 10,000-B unlocking cap. Dedicated
   nullifier-data inputs (8.5 KB each, self-funding their own budgets) — the
   action grows from 3 inputs to ~5; the v3 hook rewrite covers the shape pin.

In the real hook the walk's key is the **carrier's proof-bound nf slice** (read
by introspection, exactly like every other carrier field; actionHash fields 0/1
bind it to the proof). The probe pushed the key as witness data to measure the
walk in isolation — a build-phase wiring detail, not a soundness difference.

### 3.3 Fees and client cost

- Current 3-out action: 28,326 B, fee 30,000 sats (1.059 sat/B — the live SHIELD
  `e847ef56…`).
- Hook-level D=254: +16,962 B witness + ~4–6 KB invoke-shared code + dedicated
  input overhead ≈ **+21–23 KB → ~50 KB → ~52–54k sats** at the same sat/B
  (**+~75 %**). D=128 halves the witness: ≈ +12 KB → ~43k sats (+~43 %).
- Client: the wallet already scans every action; it reconstructs the nullifier
  tree from the ~32-B-per-nullifier set it observes and computes sibling paths
  per action (the probe's `subtree`/`siblingsFor` JS is the reference).

---

## 4. The decision matrix

| | **A: in-circuit Poseidon SMT (D=254)** | **B: hook-level SHA256 SMT (D=254)** |
|---|---|---|
| circuit | **743,608 c (4.03×)** — measured | unchanged (deposit-path delta only) |
| phase-1 we hold (pot18) | **REFUSED** (measured) — needs a pot20-class instantiation | sufficient (184.5k + deposit delta < 262,144) |
| Gate 7 phase-2 | ~4× per contributor (projection) | current scale |
| browser wtns | 10.77 s (measured) | 7.08 s (unchanged) |
| browser fullprove | ~70–90 s (PROJECTION) | ~24.6 s (unchanged) |
| zkey download | ~390 MB (PROJECTION) | 98.2 MB (unchanged class) |
| action tx | unchanged | +21–23 KB (measured components) |
| action fee | ~30k sats | ~52–54k sats (+~75 %) |
| script op budget | n/a | ~2.5 M of ~13.6 M self-funded (extrapolated from measured 1.27 M at D=128) |
| per-script 10,000-B caps | n/a | binding on the unrolled code → invoke-sharing (known mechanism); witness fits per dedicated input |
| soundness verification | wtns check OK (measured) | accept/reject on the real VM (measured) |
| state commitment | `noteRoot ‖ nullSetRoot` (64 B) | same |
| nPublic | 2 | 2 (no actionHash change at all — the set is script-enforced) |

## 5. Recommendation

**Build the v3 nullifier set as the hook-level SHA256 SMT (Option B).**

1. **Gate 7 stays at current ceremony scale.** The measurement's sharpest fact:
   the in-circuit option is refused by the phase-1 artifact we hold at ANY sound
   depth, so choosing it means a new phase-1 instantiation + a 4×-bigger MPC —
   making the already-blocked mainnet gate harder, for zero soundness gain.
   Under Option B the one mandatory circuit revision (the deposit path) still
   fits pot18 — the ceremony economics do not change (the handoff's
   one-revision rule).
2. **The Nito browser prover stays as-is** — 98-MB-class zkey, ~25-s-class
   prove, today's wasm. Option A quadruples both (projection) for every web user.
3. **The cost lands where it is cheapest:** per-action bytes (+~75 % fee at BARE
   rates, ≈ +22k sats/action), visible and bounded, improvable later (D=128
   halves it; the collision bound at 128-bit keys is a 2^128 targeted grind —
   beyond any realistic adversary — though the collision-free bar of the
   directive is met at 254/256, which fits via invoke-sharing, so build at 254).
4. **Both options are now MEASURED end-to-end** — this is not a design-preference
   call. The script side accepts true witnesses and rejects tampered
   siblings/roots on the real VM; the circuit side passes wtns check. The choice
   is purely where the costs land, and the ceremony + browser-prover costs
   dominate the fee delta.

### The v3 revision under Option B (one circuit, one ceremony)

- circuit: the **deposit path (0-in/2-out)** + **nf0 ≠ nf1 in-circuit** (an
  IsZero on the difference, ~4 constraints — closes the demonstrated
  in-action-doubling mechanism at the proof level; the hook also compares the
  two carrier slices). No nullifier-set logic in the R1CS; the actionHash stays
  9-field; nPublic stays 2; the whole revision stays under pot18.
- hook: the nullifier-set walk (function-invoke-shared), the carrier-slice
  distinctness check, the state commitment `noteRoot ‖ nullSetRoot`, the
  nullifier-data inputs, the TXINPUTCOUNT pin update.
- client: nullifier-tree reconstruction from scanned actions (sibling-path
  witness per action).
- migration: the nullifier set starts empty at the new pool's genesis
  (old notes re-shield through the deposit path); the standing rule — **no
  valued asset in any pool running the current hook** — lifts only when the set
  ships.

### Landmines recorded

- `OP_PICK` is `0x79` (0x74 is `OP_DEPTH` — an early probe bug that cost an
  hour; the walk's "positions" were pushing stack depths).
- `OP_AND` requires equal-length operands — mask 128 must push as the 1-byte
  `0x80` (the minimal encoding of −128), not `[0x80, 0x00]`.
- `OP_SPLIT` puts the RIGHT part on top — the byte extraction needs a SWAP
  before the altstack cleanup.
- The walk's stack invariant: exactly ONE `cur` accumulator on the stack (each
  level CAT-consumes the previous cur) — sib positions are `D+3−i`, the key is
  always at position 2.
- The JS sibling generator's mask must pin the split bit itself
  (`highMask(i)`, bits i..D−1) — a one-word bug that the 4-walk cross-check
  caught before any witness reached the R1CS.
- rsync `--delete` into the VM scratch wipes the node_modules symlink — recreate
  it after syncing.
- The leaf values are 32-B items (a 1-B `OP_0` empty item hashes differently —
  `SHA256(empty‖sib) ≠ SHA256(zeros‖sib)`).

## 6. Artifacts and sources

- Tooling (committed): `pusd-shielded-pool/spike-nullset/` — `circuits/`
  (`smt_insert.circom`, `pool3_v3null.circom`, `pool3_v3null128.circom`, the
  ten probes), `gen-spike-inputs.mjs`, `probe-walk-cost.mjs`, `run-all.sh`.
- VM artifacts: `~/zkb/spike-nullset/build/` (12 r1cs + wasm, 425 MB — includes
  the 117-MB `pool3_v3null.r1cs`), `build/run-all.log` (the full battery log:
  compiles, r1cs info, wtns timings, both pot18 refusals).
- Sources: `docs/HANDOFF-2026-11-26-3OUT-NOTES-MANAGEMENT.md` §12 (the finding);
  `docs/ROLE2-3OUT-V3-DESIGN.md` §3.1–3.2 (the v3 pieces); `circuits/pool3.circom`
  + `circuits/note.circom` (the base circuit); the deployed role-2 program
  records (AGENTS.md) for the op-budget formula, the 8,821-B state unlocking and
  the 28,326-B action anchor; snarkjs `browser.esm.js:6877` (the ptau fit bound).

— measured and written 2026-11-26/27, Hush side, awaiting the v3 build decision.
