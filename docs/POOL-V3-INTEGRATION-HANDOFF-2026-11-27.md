# POOL-V3-INTEGRATION-HANDOFF-2026-11-27 — the full v3 client-swap contract (M4)

**To: the Nito Cash team. From: the Hush side.** The M4 item of
`docs/HANDOFF-NITO-2026-11-27-MORNING.md`, in full: everything your client needs
to swap from the 3-out integration to the v3 pool (deposit path + hook-level
nullifier set), plus the M1 gate records, the M3 chipnet demo deployment
records, and the M5 mainnet recipe. Your repo and working assets are untouched;
this doc and the committed `pusd-shielded-pool` tooling are the references.

## §0 The category answer (your §0.3 / our open question, RESOLVED)

The mainnet PUSD **asset** category is
**`2469acc5afa4b10cb5b5c04afb89c3a3ffd61c5da9c01e26d00951cae2a02544`** (the anchor txid,
probed 200 on Selene `?network=mainnet`).

- The anchor probes **200 on Selene `?network=mainnet`** (re-verified this
  session from our host, twice; your §0.3 chain verification — anchor at height
  948,409 → mint at 948,416, 2^63−1 FT in 10 minting-NFT-guarded chunks + 5
  mutable NFTs — is our record of the asset chain too).
- In the **role-2 architecture the pool category IS the asset category**: the
  pool's state NFT, fuel tags, blanks and the shielded FT all live in ONE
  category, and the issuer mints the state mutable-NFT + blanks from the asset's
  minting NFT (your §0.3 issuer actions). So the mainnet v3 pool runs AT
  `2469acc5…`.
- **Our entire v3 stack already pins that category**: the circuit witness
  (`pusd-shielded-pool/gen-our-proofs-v3.mjs:43` — `assetCategory =
  0x2469acc5…`), the fixtures, the hook ctor, and the 7,998-B program
  (`d98c1d2ac828a909ba71bc94b719e2e21afcccc2d7565b8268ed8221d097b429`). If the
  issuer confirms, tonight's program is the category-correct mainnet candidate;
  program/locking hashes are PER-CATEGORY (a different category = one rebuild).
- Do not confuse it with the OLD gen-1 `mainnet-pusd-pool` registry entry:
  that pool ran poolCategory `dd1e3506…` (its own PREP txid) holding 100 base
  units (1.00 PUSD) of the asset `2469acc5…` — a different generation and a
  different architecture (7-input covenant era). It is not the v3 target.

## §1 The v3 facts (all measured; sources cited)

### §1.1 The circuit (`pusd-shielded-pool/circuits/pool4.circom` + `noteappend.circom`)

| quantity | value | source |
|---|---|---|
| constraints | **247,120** (194,632 non-linear / 52,488 linear) | `build4/pool4.r1cs` |
| public inputs | **2** (n0 = merkleRoot, n1 = actionHash) | VK `nPublic: 2`, `IC: 3` |
| private inputs | 174 | r1cs info |
| actionHash preimage | 9 fields, 288 B — **UNCHANGED** | `pool-hook.mjs actionHashOf(_, 3)` |
| carrier | **201 B** — UNCHANGED | `pool-hook.mjs carrierOf(_, 3)` |
| r1cs / wasm | 47,812,408 B / 3,641,000 B | `build4/` |
| pot18 headroom | 15,024 c under the 262,144 wall | `docs/V3-BUILD-2026-11-27.md` §3.4 |

The three fixes in one R1CS (each is a closed consensus hole):
1. **the append proof (R3-FREE-NEWROOT, closed)** — three sequential
   `DenseAppend` dual-walk inserts chain `merkleRoot -(cm0)-> r1 -(cm1)-> r2
   -(cm2)-> newMerkleRoot`, each pinned to the tree's true frontier by the
   dense-shape rule (`IsEqual(sibling, zh[i]) === 1 − keyBits[i]`). The R3
   plant witness (fake `newMerkleRoot`) now REJECTS at `wtns check`
   (`spike-nullset/probe-v3-negatives.mjs`).
2. **`isDeposit`** — the onboarding path: both in-note membership checks are
   gated `(1 − isDeposit)·(inMerkle[i].root − merkleRoot) === 0` and both
   in-note values are pinned `isDeposit · inValue[i] === 0`. The genesis tree is
   EMPTY; **the bootstrap-seed dependency is GONE**.
3. **`nf0 != nf1`** — `IsZero(nf[0] − nf[1]).out === 0` (the R2 in-action
   doubling dies at `wtns check`); the cross-ACTION replay is stopped by the
   hook-level SMT (§3).

### §1.2 The ceremony artifacts (CHIPNET-ONLY until the mini-MPC settles)

1-of-1 demo setup over `ppot_0080_18.ptau` (sha256 `9693220206af…`):

| artifact | sha256 |
|---|---|
| `pool4_final.zkey` (120,818,048 B) | `942f8fc5327191da4a98bfbd81b74f87bd6f79267efb2d3067ac6cd0175a723a` |
| `verification_key.json` (3,108 B) | `07638f101038418d7b97ba46871476edaf3f6c63086fa9e984a2aa33e530b704` |
| `pool4_js/pool4.wasm` (3,641,000 B) | `a9b4b03d17c614ba920c45df5c34949e26ce8cdbdeb3d6b145476a2857289395` |
| circuit hash | `69622946620445cf…` |

Entropy `888d7f92…` is PUBLISHED per the chipnet demo precedent — the toxic
waste is derivable, so **this VK is chipnet-valid ONLY**. **The mainnet VK is
the post-MPC trio — the mini-MPC is COMPLETE (§8)**: Nito's contribution
(ba66883d…, unpublished entropy) then ours (2cb3aa50…, unpublished), chain
verified ZKey Ok!, final zkey `pool4_0002_hush.zkey` sha256 `52ee860d…`,
final VK sha256 `b4d88dd5…` (nPublic 2, IC 3), wasm unchanged. **M2 (the
proving-assets release) = THIS post-MPC trio + the bench fixtures file**
(`4a46238b…`); the program bakes the new `vk.ic[0]` (§1.3).

### §1.3 The program (per-category; the `2469acc5…` build) — **v3.1 supersedes v3.0**

**The v3.0 program (`d98c1d2a…`, RAW walk pins) is SUPERSEDED** — it pinned
relay-nonstandard lockings (§2). The v3.1 build (P2SH32 walk pins) for the
mainnet candidate category `2469acc5…`:

| quantity | value |
|---|---|
| code | **7,998 B**, sha256 **`40a9599141686539edd5590ba03fe012701ea0cc2ec4aae6a9fb7749416db012`** |
| P2SH32 walk lockings | walkA `aa2035fb34211578f35ec23120b5f9156956790c560a9d66d5d2243d78c62cc67c4087` · walkB `aa20bf54fbb7fa7d378c4a492588c52e3fe6ab5799914701788a70aaa6c198dc98cb87` |
| 4w/graph pins | walkA `781c6ff7…` · walkB `ee03a03e…` (SHA256 of the P2SH32 lockings) |
| code pieces | 4,111 / 3,887 B · role2 code 2,986 B |

The program is rebuilt per-category (and again at the post-MPC cascade — new
`vk.ic[0]` ⇒ new program hash ⇒ new lockings; the walk scripts are UNCHANGED
by the VK swap). The deployed CHIPNET build (category `e56c0a85…`) is recorded
in §9. Reproducible via `wip-role2-hook/pool-build-v3.mjs` (the walkV3 wrap).
The plain v3-era program: 7,385 B, sha256
`925a42327fd66f6d8131c52d10762057ecfdc0051bb18aa7ac5f764042e279e0`.

**THE POST-MPC MAINNET CANDIDATE (the cascade, 2026-11-27 early hours):**
under the final mini-MPC VK — code **7,997 B**, sha256
**`0023d1ea433cf633502ad507d37cc0cce991b4742027ed86d9cebd3c44155ab6`**,
locking `aa202374973e…`, plain 7,384 B `dabf5d23…`; the walk scripts +
wrap lockings UNCHANGED. Built from the post-MPC fixtures
(`our-v3-mpc.fixtures.json` sha256 `4a46238b…`); walk-test 10/10 + acceptance
29/29 re-passed under it; the red team + sweep re-runs gate the M2 release.

## §2 The action shape (FIVE inputs — the client-swap delta) — **v3.1: the walk UTXOs are P2SH32-WRAPPED**

**MEASURED OVERNIGHT (2026-11-27, on chain): the RAW walk-script locking is a
NON-STANDARD scriptPubKey — relay refuses the creating transaction
("scriptpubkey (code 64)").** A minimal one-output A/B confirmed it. The v3.0
"raw form" correction is therefore SUPERSEDED: the walk scripts ride the
unlocking as the REDEEM PUSH exactly like the program's own inputs, the walk
UTXOs are locked to `P2SH32(walkScript)`, and the hook 4w/graph pins hash the
P2SH32 lockings. The walk unlockings grow to 8,445 / 8,425 B — still ~1.5 KB
under the 10,000-B cap (which only the spike's 11.6-KB unrolled form ever
threatened); their self-funded budgets grow with them (~(41+8,445)×800 ≈
6.79M) and the margins IMPROVE to ~63–66%. The walk SCRIPTS themselves are
byte-identical; `role2-op-witness-v3.mjs` is unchanged.

```
 input 0  fuel/deposit   program P2SH32 · mutable NFT tag = SHA256(carrier[0..64])
 input 1  fuel           program P2SH32 · same tag
 input 2  state NFT      program P2SH32 · role 2 (the hook)
 input 3  walkA data     RAW walkA locking (278 B) — NO P2SH, by design
 input 4  walkB data     RAW walkB locking (291 B) — NO P2SH, by design
 out0     carrier        OP_RETURN <201 B> nf0|nf1|cm0|cm1|cm2|newRoot|pv(8)|sign(1)
 out1     new state      program P2SH32 · commitment = newRoot ‖ finalNullRoot
 out2     payout         unshield only: pv FT to the recipient (bare category)
```

- **The walk lockings are P2SH32 forms** (v3.1): `locking = aa20 ‖
  hash256(push(walkScript)) ‖ OP_EQUAL`, the site-standard P2SH32 — the same
  relay-legal shape as every program output. They are pinned by SHA256 hash
  in TWO places: the GRAPH (`POOL_NULLDATA_HASHES` — the generator-source
  edit `wip-role2-hook/v3-graph-pin.patch`: `TXINPUTCOUNT == 5` +
  `SHA256(UTXOBYTECODE(3/4)) == sha256(P2SH32 walk locking)`) and the hook's
  check 4w. Belt and braces, matching how the covenant-sibling fix doubled
  its pins.
- **Blanks stay 2 per action** (correction 2, unchanged in v3.1): the fuel
  pair. The walk-input UTXOs are NOT blanks — plain dust UTXOs locked to the
  fixed P2SH32 walk forms, permissionless to create (anyone can pre-fund
  them; the walks are self-validating against the state at spend time). Our
  lock tool embeds the deployed lockings per action.
- No signatures anywhere: the P2SH32(R) script satisfaction IS the spend
  authorization; `TXINPUTCOUNT == 5` forbids a fee input, so fees ride the
  locked UTXOs' own sats (BARE fee policy).

### §2.1 What role 2 checks (the v3 hook) vs what the walks check

```
              ┌─ role 2 (input 2) ─────────────┐   ┌─ walkA (input 3) ──────┐   ┌─ walkB (input 4) ─────┐
              │ p1..p6, p8..p11 as deployed   │   │ anchor = state's       │   │ anchor = midRoot      │
              │ 4w NEW: SHA256(UTXOBYTECODE   │   │   nullSetRoot (2nd     │   │   (INPUTBYTECODE(3)   │
              │   (3)) == walkAHash, (4) ==    │   │   half of its commit)  │   │   1st push — same-tx  │
              │   walkBHash                    │   │ key = carrier nf0      │   │   atomicity)          │
              │ 7 REMOVED (the fold was the    │   │ 0-walk: zeros fold ==  │   │ key = carrier nf1    │
              │   broken R2 mechanism)          │   │   anchor (slot EMPTY)  │   │ 0-walk: zeros ==     │
              │ 10 SPLIT: length 64 + FIRST     │   │ 1-walk: marker →       │   │   midRoot (EMPTY)    │
              │   half == carrier newRoot; the  │   │   midRoot, pinned to   │   │ 1-walk: marker →     │
              │   SECOND half is walkB's domain │   │   walkA's OWN witness  │   │   finalNullRoot ==   │
              └────────────────────────────────┘   └────────────────────────┘   │  out1 commit 2nd half │
                                                                                  └───────────────────────┘
```

The R2 replay now dies at **walkA's 0-walk** (a spent nullifier's slot is
non-empty); `nf0 == nf1` dies in-circuit AND at walkB; the R3 free-root dies
in-circuit (the append chain). Every rejection class is in the committed
29/29 acceptance suite (`wip-role2-hook/pool-test-v3.mjs`) and the red team
(§4).

## §3 The walk-data contract (per action; `role2-op-witness-v3.mjs` is FINAL)

Per action, the prover emits (op JSON `nullSet` field):

```json
"nullSet": {
  "sibsA":  [254 × 32-B hex],   // walkA: nf0's off-path siblings against the STORED nullSetRoot
  "midRoot": "…64 hex…",        // walkA's declared post-nf0 root (pinned in walkA's OWN unlocking)
  "sibsB":  [254 × 32-B hex],   // walkB: nf1's off-path siblings against midRoot
  "finalNullRoot": "…64 hex…",  // == the new state commitment's SECOND half
  "keysAdded": ["<kA>", "<kB>"],// the two 32-B LE spent keys (the SMT keys = the carrier's nf slices)
  "nullSetRootBefore": "…hex…"  // == the stored state commitment's SECOND half
}
```

- The SMT is SHA256, depth 254, keyed by the carrier's proof-bound nf slices
  (actionHash fields 0/1 — **NO actionHash change**). Leaf values: the spent
  marker `[1, 0×31]`; the empty leaf is 32 zero bytes; the node hash is
  `SHA256(left ‖ right)`; the empty-subtree ladder is the 254-level SHA256
  zero fold (`EMPTY_NULL_ROOT = e579b9be0b8f58daacc4f66c959ed3ec903884d1914e11e7e0c3bbf2a5627b43`).
- The walk unlocking layouts (v3.1, P2SH32): walkA `[midRoot(32 B),
  sibBlob(8,128 B), walkA-script(278 B redeem push)]`, walkB `[sibBlob(8,128
  B), walkB-script(291 B redeem push)]` — measured sizes **8,445 / 8,425 B**
  (the v3.0 sizes were 8,164/8,131 + the redeem push). The sibling blob is
  length-pinned at 254×32 by the script (defense in depth). walkB's read of
  walkA's declared midRoot via `INPUTBYTECODE(3)` is UNCHANGED — the first
  push of walkA's unlocking is still midRoot.
- Key bits are EXTRACTED IN SCRIPT from the carrier slice (byte `i>>3`, mask
  `1<<(i&7)`, LSB-first) — the walked slot is bound to the proof-bound
  nullifier; witness-supplied bits would decouple them and re-open the replay.
- **Build against `role2-op-witness-v3.mjs` as committed** (morning-response
  correction 3): the R1CS is fixed; the VK swap (the MPC) changes only the
  zkey/VK, not the generator. The 4/4 JS-mirror walk cross-checks it emits are
  the reference semantics.

## §4 The M1 gate records

**M1c — the hook cost re-measure: PASSED, measured** (`pool-cost-v3.mjs`, the
upstream difference method, fixture 0, same proof both builds, v3.1 scenario:
state commitment = noteRoot ‖ nullSetRoot, newCommit = newRoot ‖ finalNullRoot,
NO fold, 5-input shape both builds, the walk UTXOs in P2SH32 form):

| measurement | standard | consensus |
|---|---|---|
| **v3.1 hook price (r2:statement → r2:slices)** | **39,033 op** | **37,881 op** |
| role-2 code delta | 612 B | (same) |
| total input 2 (hook + GT-GLS) | 6,667,737 / 7,094,400 (94.0%) | 6,632,025 (93.5%) |
| walkA own cost | 4,326,631 / 6,788,800 (63.7%) | 4,195,815 (61.8%) |
| walkB own cost | 4,353,194 / 6,772,800 (64.3%) | 4,222,378 (62.3%) |

vs the 3-out hook (39,082 std / 37,930 cons, 537 B): **−49 op std / −49 op
cons, +75 B** — the v3.1 hook lands at essentially the 3-out hook's price:
the 4w pins + the split check 10 cost more, but hashing the 38-B P2SH32
lockings is cheaper than hashing the 278/291-B raw forms of the v3.0
measurement (41,567/39,391). Fills [0,0,197] (input 2 sized to the 6%
margin; inputs 0/1 have empty fillers as in every hooked build); walk
unlockings 8,445 / 8,425 B with ~35% self-funded margins.

**M1a — the red team: PASSED under BOTH the v3.0 pins and the v3.1 (P2SH32)
pins. 164 runs, 0 accepted (consensus and standard), both positive controls
accepted, each run twice** — `pool-redteam-v3.mjs` →
`pool-redteam-v3-report.json` (committed in `pusd-shielded-pool/wip-role2-hook/`;
the v3.1 re-run is the operative record). The stock 151-scenario list
re-pointed at the 5-input pool shape (146 expressible — inputs 0/1 have
empty fillers in every hooked build, the 5 filler-tamper scenarios are
no-ops) + **18 NEW walk-input scenarios**: witness tampering (sibling flips,
the declared midRoot, truncated blobs, swapped witnesses, junk,
cross-action staples), locking tampering (swap, junk — the 4w/graph hash
pins), shape tampering (walk inputs dropped/duplicated — the TXINPUTCOUNT
pin), **the REPLAY (nf0 already in the set — walkA's 0-walk rejects: the R2
mechanism now actually stopped at consensus level)**, the state nullSetRoot
half tampered (walkA rejects), the new commitment's finalNullRoot half
tampered (walkB rejects; role 2 accepts by design — the two-script pin).

The layering held exactly as designed in both runs: walk-side tampering died
at the walk scripts, the locking swaps at `r2:p4w`, the shape tampering at
the GRAPH, the public-input claims at `r2:p5`/`r2:binding` before the
graph's binding check, proof-point tampering in the graph (`G1C@17`),
B-outside-G2 at `r2:t:endpoint`. **NO FINDING in either run — nothing
surfaces for the morning.**

**M1b — the liveness sweep: PASSED. 69 cases, 0 failed** (5 fixtures + 64
seeded random REAL proofs, seeds `sweep-v3a`/`sweep-v3b`, all four action
classes incl. DEPOSIT; measured proof time ≈ 81–220 s at 247,120 c — ~5–9×
the 184k-c 3-out's 24.6 s) → `pool-sweep-v3.mjs` sharded ×4 → the merged
`pool-sweep-v3-report.json` (committed). All five inputs ACCEPTED in both
modes in every case, cap rule true in every case:

| input | std min margin | cons min margin | max op AT THE CAP (std) |
|---|---|---|---|
| 0 (fuel0) | 8.13% | 8.60% | 7,077,519 (11.89% cap margin) |
| 1 (fuel1) | 8.71% | 9.17% | 7,037,441 (12.39%) |
| 2 (state, role 2) | **6.00% (the design target)** | 6.50% | 6,753,690 (15.92%) |
| 3 (walkA) | 36.26% | 38.19% | 4,327,193 (fixed-size — its own budget) |
| 4 (walkB) | 35.72% | 37.65% | 4,353,668 (fixed-size — its own budget) |

## §5 The DEPOSIT flow (the onboarding spec)

The first-time user needs NO imported notes and NO bootstrap seeds:

1. **Prove**: `role2-op-witness-v3.mjs --action deposit --amount N` — phantom
   in-notes (value 0, fresh secrets; membership gated in-circuit), three fresh
   out-notes summing to N, the append at the current frontier (empty tree at
   genesis: indices 0,1,2), the two fresh nullifiers inserted into the SMT.
   The op JSON carries the walk data + the deposit FT rides the lock.
2. **Lock**: `pool-refill-role2-v3.mjs` — 2 blanks (tag pair) + the N-FT
   deposit on fuel0 + the two walk-data dust UTXOs.
3. **Act**: `pool-op-role2-v3.mjs` — the 5-input action; out1's balance grows
   by N; the nullifier set gains the two keys; the three out-notes are the
   user's first private notes (tree indices recorded in the op JSON).

The hook treats a deposit exactly like a shield (sign=0): fuel0 carries the FT
deposit; conservation + balance arithmetic are enforced by the proof, the hook,
and BCH consensus token rules. The UI contract is your side (M3's
DEPOSIT → TRANSFER → UNSHIELD browser acceptance through the real wallet UI).

## §6 The scan contract (SMT reconstruction from observed actions)

Per observed action, the scan must:
1. read the carrier (out0): `nf0, nf1, cm0, cm1, cm2, newRoot, pv, sign`;
2. verify `n0` (the proof's first public input) against the PREVIOUS state
   commitment's first half and the `actionHash` recompute (the 9-field
   preimage) — as the 3-out scan already does;
3. **NEW (the R3 stopgap is a strict subset of this)**: reconstruct the NOTE
   TREE append — `leaves += cm0, cm1, cm2` at the recorded frontier (the
   dense-shape rule guarantees the frontier is the next three slots) — and
   compare the fold against the carrier's `newRoot`;
4. **NEW (the SMT)**: reconstruct the nullifier set — insert the two keys
   `kA = LE(nf0)`, `kB = LE(nf1)` in that order (walkA's midRoot is the
   intermediate root) — and require the resulting root to equal the NEW state
   commitment's second half; the PREVIOUS root must equal the previous
   commitment's second half;
5. replay check: a key already in the set fails step 4 (the client-side
   mirror of walkA's 0-walk rejection);
6. balance: `newBalance = balance + pv − 2·sign·pv` from out1's FT amount.

The state commitment spec: **64 B = LE32(noteRoot) ‖ nullSetRoot** (was
`seededRoot ‖ fold` — the fold is GONE). The genesis values are in §7.

## §7 The genesis constants (exact values)

| constant | value |
|---|---|
| note tree root (zh[20], the depth-20 Poseidon zero ladder top) | `15019797232609675441998260052101280400536945603062888308240081994073687793470` |
| zh[20] LE hex | (the deployed state file's `pool.rootLE`) |
| EMPTY_NULL_ROOT (254-level SHA256 zero fold) | `e579b9be0b8f58daacc4f66c959ed3ec903884d1914e11e7e0c3bbf2a5627b43` |
| **genesis state commitment (64 B)** | `LE32(zh[20]) ‖ EMPTY_NULL_ROOT` |

All three computed from first principles and asserted at import
(`pusd-shielded-pool/genesis-v3.mjs`). The genesis tree is EMPTY — no leaves,
no notes, no spent keys; the first action MUST be a deposit.

## §8 The MPC (Gate 7 at demo scale — the mainnet VK) — **COMPLETE**

**Done in the agreed order, both entropies UNPUBLISHED (never in any repo,
doc, commit, or message — only the printed contribution hashes are records):**

1. **Nito first** (01:29 UTC): onto `pool4_0000.zkey` →
   `pool4_0001_nito.zkey` (120,818,020 B, sha256
   `ef4b1ec9a447c8335c3a28f8a7e4fa32c298851830bd96140c77eccb57abc966`).
   Contribution hash `ba66883d…3b2d10e8`. Verified by us: `zkey verify`
   → **ZKey Ok!**, the printed hash matches their record.
2. **Hush second** (immediately after): onto `pool4_0001_nito.zkey` →
   `pool4_0002_hush.zkey` (sha256
   `52ee860d6a867ce1c49763a79a3fb980c090b2f6f8948d10ad7a2736a19cde17`).
   Contribution hash `2cb3aa50…1ca3ecad` — entropy 64 B `/dev/urandom`
   piped, never a file. **The final chain verifies: ZKey Ok!** (both
   contributions in the transcript).
3. **The final VK**: `verification_key_mpc.json` sha256
   `b4d88dd51ac915c1987b876f242fd6b6b1d2da84871e5dc20bfd62d304604fbd` —
   groth16/bn128, **nPublic 2, IC 3** (the 2-scalar contract intact).
   **`pool4.wasm` is UNCHANGED** (`a9b4b03d…`) — a phase-2 MPC never touches
   the circuit/wasm.
4. **The user's third slot**: their decision, pending on their side — two
   independent contributions already satisfy the agreed "2–3" minimum; a
   third chains onto `pool4_0002_hush.zkey` and the VK re-exports.

**The cascade (running)**: the 5 fixtures re-proved under the final zkey ✓ →
the bench fixtures `our-v3-mpc.fixtures.json` (sha256 `4a46238b…`, all 5
self-verify) ✓ → the program rebuilt under the new `vk.ic[0]` ✓ (**7,997 B,
sha256 `0023d1ea…`** — §1.3; the walk scripts + lockings UNCHANGED) →
walk-test 10/10 ✓ + acceptance 29/29 ✓ → the red team + sweep re-runs (in
flight; seeds `sweep-v3mpc-a`/`sweep-v3mpc-b`) → **M2 when they pass**.

## §9 The chipnet v3.1 demo (M3) — the deployment record

**DEPLOYED and CONFIRMED (2026-11-27 overnight).** Deployment chain
(born-guarded, runner-free, funded from wallet A after the recorded DEMO-ONLY
recovery burns + consolidation):

| record | value |
|---|---|
| pool id | `chipnet-role2-pool4-v3` |
| category (= the anchor txid) | `e56c0a8583e36092f20e54c9247f6b8e5a6afd391027aa70ae109c3c42377930` |
| anchor tx | `e56c0a85…` (confirmed) |
| mint tx | `85cd4780ea00d28a020e596b31b0832e0d274a893d1f756091f2980569afd473` (minting NFT + 100,000,000 FT) |
| deploy tx | `23909dc28ff10c8753d1c60b8775ad163481baac3b652db00094985e7200703a` — **confirmed at chipnet height 349143** |
| state NFT | `23909dc2…:0` · 10,000-sat float · commitment = `LE32(zh[20]) ‖ EMPTY_NULL_ROOT` = `3e1f1922dfb671d3…` ‖ `e579b9be…` |
| program code | 7,998 B · sha256 `27b904a2ddec9e6b…` (the v3.1 build for THIS category) |
| program locking | `aa206dc915cef6f1343b7d170c…` |
| walkA P2SH32 locking | `aa20f823d16d3cab573069ba56…` (pin `9f0a1a98…`) |
| walkB P2SH32 locking | `aa206ae3e5fb435b33afd6e907…` |
| guard | born-guarded at deploy (minting NFT at the guard, K=64) · first batch `a98ee616a8cbeecd8e92ac5bd3287c0b65ec5f42d1e16e9d4b65bb8307457579` — **confirmed at height 349183** (64 blanks at wallet A) |
| state file | `/home/apecs/cov/role2-pool4-state.json` (the v3.0 aborted attempt is archived at `role2-pool4-state.v3.0-aborted-03af2eda.json`) |

**The aborted v3.0 attempt** (the raw-locking design): category
`03af2eda…`, anchor/mint/deploy confirmed at heights 349131…, aborted at the
first DEPOSIT lock — the raw walk lockings were relay-rejected (`scriptpubkey`,
code 64). It never held value; its minting NFT sits in its guard. The full hex
records for the deployed category are in the state file.

**THE LIFECYCLE IS COMPLETE AND CONFIRMED (2026-11-27 overnight) —
DEPOSIT → TRANSFER → UNSHIELD, every input of every action VM-ACCEPTED
consensus + standard pre-broadcast, every tx confirmed:**

| action | lock tx | action tx | size · fee | state after |
|---|---|---|---|---|
| **DEPOSIT 1,000** (the onboarding: empty genesis, 3 fresh notes 400/300/300) | `1c8be39c…` | `137a79079b35eff7835f84cb19973d644458cbf3751d98d3279ebe9c67ed4646` | 45,366 B · 50,000 sats (1.102 sat/B) | balance 0 → 1,000 · nullSet 2 keys · 3 notes |
| **TRANSFER** (spends notes 0,1 — the first membership spend) | `455e3c5f…` | `8ccc9cd27cf6d4a5e7d194c9fada57fafd4977ed62e292e6cff68eb35d4e34e3` | 45,445 B · 47,500 sats (1.045 sat/B) | balance 1,000 · nullSet 4 keys · 4 notes |
| **UNSHIELD 250** (the payout branch: 250 FT paid publicly, 750 shielded onward) | `a9b9cefa…` | `405166f57af10186ef85b57a7e5e070b0df569e7b4f03e5051373fd14e9fda00` | 45,418 B · 45,500 sats (1.002 sat/B) | balance 750 · nullSet 6 keys · 5 notes |

Per-action VM-acceptance (all 5 inputs, both modes): every line ACCEPT —
consensus op costs ≈ 7.00M / 6.97M / 6.59M / 4.20M / 4.22M of budgets
7.68M / 7.68M / 7.05–7.12M / 6.79M / 6.77M. FT conserved on every action.
Explorer: `https://explorer.selene.cash/tx/<txid>?network=chipnet`.

## §10 The fuel economics (confirmed for the deployed demo)

**CONFIRMED — the lock tool's defaults are the deployed numbers**: fuel
**23,000 × 2**, walk-data **2,000 × 2** (the P2SH32 walk form's relay dust
threshold is ≈ 3 × (8 + 1 + 38 + 148) ≈ 585 sats — 2,000 sits comfortably
above it; the v3.0 raw form's threshold would have been ≈ 1,350 sats).
**MEASURED from the three live broadcasts**: action size 45,366–45,445 B
(the walk unlockings add 8,445 + 8,425 B over the 3-out shape); locked fuel
50,000 (deposit) / 47,500 (transfer) / 46,500 (unshield — includes the
1,000-sat payout); fees 45,500–50,000 sats at 1.00–1.10 sat/B, all ≥ the
BARE 1 sat/B floor with the op builder asserting `fee ≥ size` before
broadcast. **Blanks: 2 per action** (the fuel pair), minted through the guard
(K=64 per batch; the confirmed batch `a98ee616…` cost ≈ 75,400 sats — 64 ×
1,000 + fee). Wallet A's funding record for the demo: the four recorded
DEMO-ONLY 60k demo-token burns (2240bbd6, 97af8bec, db53cecb, b05e66d5 —
the sanctioned fee reserve), the dead-v3.0-pool recovery burns (08e5fb71:
65 wrong-category UTXOs — 64 blanks + the dead supply; 94634f07, e0fc86db,
d1872582: the old demo tokens), and consolidations (67592043, 85298710) —
every burn a zero-value demo asset.

## §11 The pool-accept extension (the 5-input oracle) — v3.1 shapes

Per action, reproduce byte-exactly:
- unlockings: `[role0, role1, role2]` from the verifier program (the bench
  `transaction.mjs unlockingsFor` — sizes ≈ 9.6k / 9.6k / 8.8k under the v3.1
  program's pool-shaped fills) + `walkA 8,445 B` + `walkB 8,425 B`;
- the walk unlockings (P2SH32 form): walkA `OP_PUSH32(midRoot)` +
  `OP_PUSHDATA1(8128 sibBlob)` + `OP_PUSHDATA1(278 walkA-script)`; walkB
  `OP_PUSHDATA1(8128 sibBlob)` + `OP_PUSHDATA1(291 walkB-script)` — the
  redeem push is the walk script itself, exactly like the program inputs' R;
- source outputs 3/4: the P2SH32 walk lockings (from the registry entry /
  state file) at 2,000-sat dust; source outputs 0/1: the tagged fuel NFTs;
  source output 2: the state NFT with the 64-B commitment;
- every input VM-ACCEPTED consensus + standard pre-broadcast (the discipline
  both sides already run).

## §12 The full VM-landmine list (script-adjacent client code)

The two published v3 landmines (measured, in `walk-scripts.mjs`):
1. **`BIN2NUM` of the bare sign byte `[0x80]` decodes as −0 = ZERO** — and
2. **`RSHIFTNUM` truncates toward zero for negatives** (bit parity flips for
   bytes ≥ 0x80). The walk scripts zero-pad the key byte to stay unsigned:
   `kbNum = BIN2NUM(key[0] ‖ 0x00)`, bit `i = (kbNum >> (i&7)) mod 2`.

The prior published set (all still live):
3. `OP_SIZE` is NON-POPPING on the BCH-2026 VM (model pop-1/push-2 — a
   pop-1/push-1 model shifts every later pick by one);
4. `OP_SPLIT` leaves the RIGHT part on top;
5. `OP_AND`/`OP_OR` need equal-length operands (NUM2BIN the mask);
6. 32-byte pushes decode as NEGATIVE VM numbers when the top byte ≥ 0x80 —
   compare roots bytewise (`EQUALVERIFY`), never `NUMEQUAL`;
7. the actionHash preimage limbs are REVERSEBYTES'd to big-endian; the
   nullifier-domain data (the SMT keys) uses the RAW LE forms;
8. **Node `Buffer` + libauth = in-place corruption** — `Buffer.slice()` returns
   a VIEW; the VM's mutating opcodes write through it. Pass ONLY plain
   `Uint8Array`s into the VM (a Proxy does NOT catch the writes);
9. loop-body stack hygiene: every per-level mutable must be CONSUMED and
   re-pushed each iteration (`roll`, never `pick`) — picks leak duplicates and
   shift the layout; read-only items are picked freely;
10. the in-loop consume-not-pick rule and the `ip` conventions: libauth
    `vm.debug()` `ip` is a byte offset in the executing function
    (`OP_INVOKE` starts a fresh ip space), not an instruction index.
11. **(v3.1, measured on chain 2026-11-27) RAW script lockings are
    NON-STANDARD scriptPubKeys** — relay refuses the creating tx
    ("scriptpubkey", code 64; minimal-tx A/B confirmed). Any on-chain script
    that is not P2PKH/P2SH/P2SH32/OP_RETURN-class must ride a P2SH32 wrap.
    This is what forced the walk-UTXO form change (§2).

## §13 The guard + vending recipe — UNCHANGED, pool-agnostic

The minting guard (`minting-guard.mjs`, suite 14/14) and the blank-vending
covenant (`blank-vending.mjs`, suite 18/18) are category-parametric and
UNCHANGED for v3: born-guarded deploy (the minting NFT locked into the guard at
deploy), guard batch = K blanks to the operator, vending at 1,000 sats/blank,
permissionless. Your B4/blank plumbing carries over as-is.

## §14 M5 — the mainnet recipe and the GO/NO-GO — the mainnet pool's public designation is **"Preview v0"**

**NAMING (user directive, 2026-11-27): the mainnet pool is referred to as
"Preview v0" everywhere — registry entries, deploy records, the site, all
comms. Do NOT use "Release Candidate"/"RC": most users do not know what an
RC means; "Preview v0" says what it is. The Preview v0 label also matches the
gate structure: real PUSD, both drains closed at consensus, running under the
post-MPC VK at demo scale (the mini-MPC Gate 7) — a preview, not a
production-bar launch (the full-scale ceremony remains the production bar).**

- The recipe = the chipnet v3.1 deploy with mainnet constants: the asset
  category `2469acc5…` IS the pool category (the mainnet pool's anchor is the
  ASSET's anchor; the issuer performs the mint-side actions) + the program
  rebuild for that category + the state NFT + the guard, under the FINAL
  (post-MPC) VK.
- **Your mainnet-adapter diff gets our review before broadcast** (accepted in
  the morning response); send it when ready.
- The valued-asset clearance is the user's to give once the final VK + the M1
  gates are in place; our written confirmation follows the gates.

— the Hush side, 2026-11-27 (overnight).
