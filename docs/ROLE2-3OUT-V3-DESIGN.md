# Role-2 pool v3 — 3-output circuit and the community design

**Status (2026-11-26, later session):** the 3-output circuit compiles and is
measured; the 1-of-1 demo setup, the 3-out verifier program under that VK, the
201-B role-2 hook, the 3-out witness generator, the acceptance suite, the red
team and the full 69-case liveness sweep are **built and measured**; a 3-out demo pool
is **deployed on chipnet** and its SHIELD, TRANSFER and UNSHIELD are confirmed. The
deposit circuit, the real nullifier set and the note-delivery layer are **not
built**. The new MPC (Gate 7) remains the mainnet gate. Every unmeasured item is
marked UNMEASURED.

## 0. The decision

The 3-output circuit is the chosen note-management layer for the next pool
generation. It is **not** a substitute for the deposit path, the nullifier set
or note delivery. The v3 generation has four core pieces:

1. a **deposit path** for permissionless onboarding;
2. a **real nullifier set** with membership;
3. **encrypted note delivery** and recovery;
4. the **3-output circuit** for change splitting and the two-note pre-seed.

The 3-output circuit is cheap in constraints. The new trusted setup is the
cryptographic gate. The new verifier, hook, carrier, client and migration are
the engineering work.

## 1. Measured 3-output circuit

Source: `pusd-shielded-pool/circuits/pool3.circom` (draft; compiled on the
`apecsdev` VM with circom 2.2.3).

| Metric | 2-out (shipped) | 3-out (draft) | Delta |
|---|---:|---:|---:|
| Constraints | 183,472 | **184,528** | **+1,056 (+0.58%)** |
| Non-linear | 164,115 | 165,166 | +1,051 |
| Linear | 19,357 | 19,362 | +5 |
| Public inputs | 2 | **2** | 0 |
| Private inputs | 107 | **112** | +5 |
| Wires | 181,959 | 183,017 | +1,058 |
| Compile time | 16.6 s | **20.2 s** | +3.6 s |
| R1CS size | 39,203,344 B | **39,449,264 B** | +245,920 B |
| WASM size | 3,376,395 B | **3,380,815 B** | +4,420 B |

The five new private inputs are `cm[2]`, `outValue[2]`, `outOwnerPub[2]`,
`outRho[2]`, `outR[2]`. The public-input contract is unchanged: two scalars
`[merkleRoot, actionHash]`. The actionHash preimage grows from 8 to 9 fields
(2304 bits): `nf0|nf1|cm0|cm1|cm2|pvAbs|pvSign|assetCategory|newRoot`. The
carrier grows from 169 to **201 bytes** (`cm2` adds 32). The action
transaction grows by 32 bytes.

The constraint delta is the reason the 3-out is viable: the extra note costs
one `NoteCommitment` (Poseidon + range), one `RangeCheck`, one
`FieldToBE256`, one extra SHA-256 block and one addition. The proof time and
the verifier cost are measured in §1.1; the constraint delta bounds them.

## 1.1 The 3-out verifier, hook and gates (measured 2026-11-26)

All commands run on the `apecsdev` VM from
`~/zkb/groth16_cashscript/chunked/bn254/bn-native-sound/` with
`BN_VK_FIXTURES=/home/apecs/cov/our-3out.fixtures.json` (the new VK + five
3-out proofs). Source of record: `wip-role2-hook/` in
`pusd-shielded-pool` and the reports named below.

| Gate | Result | Source |
|---|---|---|
| Plain sound verifier under the new VK | code **7,310 B** sha256 `6ec7ca8e…`; R 65 B; fixture-0 margins **6.46% consensus / 6.01% standard**; unlocking 9,313 / 9,243 / 8,763 B | `node build.mjs` → `build.3out-plain.json` |
| Hooked 3-out program (fixture category) | code **7,848 B** sha256 `628207b1…`; R 65 B; locking `aa200240…`; role code 804 / 720 / **2,911** B | `POOL_3OUT=1 node pool-info.mjs` |
| Hook price (3-out, 201-B carrier) | **39,082 op standard / 37,930 op consensus**; **537 B** of role-2 code | `POOL_3OUT=1 node pool-cost.mjs` |
| Acceptance (3-out) | **21/21** — 3 controls (transfer/shield/unshield) + 18 rejection classes (incl. the cm2 carrier tamper) | `POOL_3OUT=1 node pool-test.mjs` |
| Red team (3-out) | **146 runs / 0 accepted**; both positive controls accepted | `pool-redteam-3out-report.json` |
| Liveness sweep | **69 cases / 0 failed** (5 committed fixtures + 64 minted random proofs, seeds `sweep-3out-v1a` / `sweep-3out-v1b`); min margin **6.00% standard** (input 2, `sweep-3out-v1a shield #1`); max at-cap 7,080,373 op (**11.86% cap margin**, standard input 0); cap rule all true | `pool3-sweep-report.json` (the 5-fixture subset is `pool3-sweep-fixtures.json`) |

The 3-out hook is the same 12-check pool hook as the 2-out generation, with
the carrier split extended by `cm2` and the actionHash preimage extended to
288 bytes. The 2-out hooked program is byte-identical after the change
(code sha256 `d71851a1…`), so the live 2-out pool's tooling is unaffected.

## 2. What changes

### 2.1 Circuit

`Pool3(20, 64)` adds a third out-note. The conservation law is
`sumIn + signedPublic == outValue[0] + outValue[1] + outValue[2]`. The
`actionHash` binds `cm2` exactly as it binds `cm0/cm1`. The `newMerkleRoot`
witness is unchanged; the wallet appends three commitments instead of two.

### 2.2 Verifier and trusted setup

The verifying key changes. A new Groth16 setup and a new MPC ceremony are
mandatory; the current 1-of-1 demo setup is not acceptable for mainnet. The
sound verifier program (`bch-groth16-bn254-sound-native`) is VK-parametric;
the new VK produces a new program P2SH32 and new step lockings. The verifier
remains 3-input / 2-public-input; the 27,624-B reviewed program is the
baseline. The new program is built: code 7,310 B (plain) / 7,848 B (hooked),
fixture-0 margins 6.01% standard / 6.46% consensus, op costs in §1.1.

### 2.3 Role-2 hook and carrier

The hook is built and measured (§1.1): **201 bytes**, **39,082 op standard /
37,930 op consensus**, 537 B of role-2 code. It must:

- check `cm2` in the carrier and the actionHash preimage (9 fields);
- check the state output commitment `newRoot ‖ newNull` as before;
- check the output count for the new note shape (the carrier is still out0,
  the state out1, the payout out2 for an unshield);
- keep the deposit tag `SHA256(carrier[0..64])` (nf0/nf1) unchanged.

The hook price, the fill sizer and the acceptance suite are re-measured for
the 201-B carrier: **39,082/37,930 op** (vs 37,198/36,046 for the 169-B hook),
acceptance **21/21**, red team **146/0**, sweep **69/69** (5 fixtures + 64
minted random proofs). The sweep's tightest binding is input 2 at **6.00%**
standard; the at-cap maximum is 7,080,373 op (11.86% cap margin).

### 2.4 Client and action size

The 3-out witness generator is built (`role2-op-witness-3out.mjs`: three
out-notes, `cm2`, the 201-B carrier, the 9-field actionHash). The Nito client
3-out witness path is built and reproduces the live UNSHIELD byte-exactly
(`pool-accept.mjs --pool role2-3out --txid ec31a41c`: fuel0 9,488 B / fuel1
9,490 B / state 8,821 B); the store branch is wired; the UI, the 3-out blanks and the
browser acceptance remain; the proving assets are live at
`prover.nito.cash/assets/`. Measured on chipnet: SHIELD **28,326 B**,
TRANSFER **28,389 B**, fee 30,000 sats (**1.059 / 1.057 sat/B**); the fuel
policy (2 × 15,000 sats) still covers it. The 2-out flows remain representable with a
zero-value dummy third note — **and this is now MEASURED on chain, both ways**
(2026-11-26, see §6.2).

## 3. The other three v3 pieces

### 3.1 Deposit path — the onboarding fix

A 0-in/2-out (or 1-in/2-out) deposit circuit creates two private notes from a
public FT deposit with no prior pool notes. The deposit input is signed by the
depositor, so the deposit is author-bound. This is the permissionless
onboarding path; the current SHIELD cannot serve it because its in-notes must
already exist. Constraint count, proof time, setup and verifier are
UNMEASURED.

### 3.2 Nullifier set — the double-spend fix

The current state commitment is `root ‖ nullifierSetHash`; the hash is a
rolling chain and hook check 7 only folds
`newNull = SHA256(oldNull ‖ nf0 ‖ nf1)`. There is no membership test; the
spent bootstrap notes were reusable. The v3 state needs a Merkle nullifier
tree (or an on-chain set) with membership proofs in the circuit and a hook
check. The circuit, the state commitment and the hook are UNMEASURED.

### 3.3 Encrypted note delivery — the usability fix

The 169-B carrier has no encrypted note; the 400 FT transfer note is
undelivered. The 201-B carrier still cannot carry a full note reliably. The v3
needs an encrypted note channel (NIP-44/Nostr or a dedicated delivery layer)
and seed-based recovery. The 2N round needs the same channel for its out-notes.
UNMEASURED.

## 4. The downside

The cryptographic downside is the **new trusted setup**. The circuit delta is
+1,056 constraints (+0.58%); the public-input contract is unchanged; the
privacy properties are the same; the extra output can be a zero-value dummy
for 2-out flows.

The engineering downside is real: new VK, new verifier program, new step
lockings, new hook, new carrier, new witness generator, new client path, new
tests, new deployment and a migration from the current pool. The current
pool's notes are not automatically spendable in the new pool; the Hush 750,000
notes and the wallet A notes need a migration or a re-shield. The four stuck
locks are unrecoverable; the one public lock is sweepable.

The 3-out does **not** solve onboarding, the nullifier set or note delivery.
Those remain the core of v3; the 3-out is the note-management layer.

## 5. Migration

1. ✅ Finish the demo acceptance on the current pool with the one-note + Hush
   change handoff (demo only).
2. ✅ Sweep the one public lock `3db76294…`; record the four stuck locks.
3. Build the v3 circuits: deposit, 3-out transfer/unshield, nullifier set.
   The 3-out transfer/unshield circuit is built; the deposit and nullifier
   circuits are not.
4. Run the new MPC ceremony (Gate 7) and the independent review.
5. Deploy the v3 pool (✅ 3-out demo pool deployed, §6); migrate the Hush
   notes and the wallet A notes by re-shielding into the new pool.
6. Cut over the Nito client and the daemons; keep the current pool as a
   read-only historical record.

## 6. The deployed 3-out demo pool (chipnet, 2026-11-26)

Deployed runner-free from the `apecsdev` VM with `POOL_3OUT=1` and the
3-out fixtures; the funder is the demo wallet A
(`bchtest:qzzu85xn…`), the pool category is the anchor txid.

| Item | Value |
|---|---|
| Category (anchor) | `bc607a96c8a21a1400263d437005d3f434c3c60674018119995dc6200072e635` |
| Mint | `62d91e4cf541f8c7a710cfcecd566fd99f91b0d6615afddaaf074217b739132e` |
| Deploy | `2f65079182cf1ecd736e897afad741b9218c6afd16f711042ba4cacf5dd8aa7e` |
| Program | code **7,848 B** sha256 `73cb0ccb…`; R 65 B; locking `aa204a6ce3…` |
| Guard | redeem 5,103 B; locking `aa20e33ce1…`; K=64 |
| Tag batch | `8e3eaf7170240f5fa632879df7e6896a365f6ac5f7c89355db791e158df55526` (64 blanks) |
| SHIELD 1,000 | `e847ef567bd06ec6585e4d7384d0eb28ca77913c7b8813beb52a9194e83017e0` — 28,326 B, 30,000 sats (1.059 sat/B), VM-ACCEPTED consensus+standard; out **400 + 300 + 300** |
| TRANSFER | `ef64f3dda71ed0110f488ea366e8fab79ff214649586c00ccba14d12da46e325` — 28,389 B, 30,000 sats (1.057 sat/B), VM-ACCEPTED; spends notes 2+3, out **280 + 210 + 210** |
| UNSHIELD 300 | `ec31a41c591c4af4ad95c2fab76c1ad2bb34b483393bce53758982a9d8e9de03` — 28,368 B, 29,000 sats (1.022 sat/B), VM-ACCEPTED consensus+standard; spends notes 4+5, out **112 + 84 + 84**, 300 FT payout at `:2` |
| Locks | `4f49c1cb94bf0588a0d064a86884cfcab5790c2d23eaa5092cc25fa260292d54` (SHIELD), `f52502b4a8713e6feb9b76054d4e7a8c13e61ae0dfcdf3b1a0cc4da039d0935a` (TRANSFER), `11b9416cc71ac5331060de58f26cdfc47f07519ac693e0d3f5e3d9be7b121088` (UNSHIELD) |
| Final state | root `14228234475601541117315008857991396106432351016727521101710528622096584678627`; balance 700 FT; notes 210 (index 6), 210 (7), 112 (8), 84 (9), 84 (10); 11 leaves |

The three actions are the note-management proof: the 3-out SHIELD creates three
notes in one action; the 3-out TRANSFER spends two of them and creates three
new ones, with change splitting; the 3-out UNSHIELD spends two notes, pays 300
FT publicly and creates three change notes. The pool is a **demo**: 1-of-1 setup, public
bootstrap in-notes on the first action, no real nullifier set and no encrypted
note delivery. Gate 7 remains mandatory for mainnet.

### 6.1 Permissionless 3-out blank acquisition (live 2026-11-26)

The 3-out category's vending machine is deployed and proven by a stranger buy.
This is the standing "there MUST be an efficient and permissionless way to
acquire BLANKS" requirement applied to the v3 category: the minting guard pins
every batch-minted blank to the operator's P2PKH forever, so the permissionless
layer sits one hop after the mint.

| Item | Value |
|---|---|
| Vending locking | `aa2020bd0ad169a6343ebe86673df2f84fbb6e65a41e14f8891c96a24d10fefbf2d287` |
| Redeem | 157 B (`blank-vending.mjs`, 18/18 suite) |
| Price | **1,000 sats**, exact (underpay and overpay both reject) |
| Operator (price destination) | `bchtest:qzzu85xnl99u534d9z40yu7c494hknppx5lu29gl8t` (wallet A) |
| Load | `784ef9c4eac4c6925c455ad2b699b2a86ffffc6445b4b5d8ca4c73600d67bd30` (6 blanks, 1,499 B) |
| First buy | `569a6e6d4e4f3364bba23802e6b0927144e1704f9775f7588cb19c3b0f196884`, block **348,775**, 487 B |
| Buyer | `bchtest:qpes4zff73dzqag897kh4hx5geqmtp0azq3w7sdpjp` — a key the operator never saw |
| VM | input 0 (the covenant, **no signature**) ACCEPT consensus 7,545 / standard 8,057 of 4,170,400 |
| Machine stock after the buy | **5 blanks** (5,000 sats of float) |

Blank conservation across the whole chain: 12 at wallet A + 5 in the machine + 1
at the stranger = **18**, exactly the 18 remaining from the 64-blank tag batch
`8e3eaf71…`. Nothing was minted or burned by the vending layer.

The rule is `OUTBYTECODE(0) == UTXOBYTECODE(1)` — whoever pays receives. The
covenant pins the price, the payment destination, the blank's shape (category +
mutable + **empty** commitment + 0 FT), the float and delivery to the funding
input's own locking. There is **no CHECKSIG anywhere**: the script is the
authorization. The buyer chooses only where their change goes and pays the fee.

The op-cost being byte-identical to the 2-out machine (7,545 / 8,057) is the
expected result: the covenant code is unchanged and only the
category/price/operator constructor bytes differ, so one reviewed script serves
every category.

### 6.2 The zero-value dummy third note — MEASURED on chain (2026-11-26)

The design's "the 2-out flows remain representable with a zero-value dummy third
note" is no longer a claim about the circuit; it is exercised on chain, both
creating and spending the dummy.

**Why a zero is legal.** `circuits/pool3.circom` does exactly two things to an
out value: `outRange[j] = RangeCheck(VALUE_BITS); outRange[j].in <==
outValue[j];` and the conservation `sumIn + signedPublic === sumOut`. `0`
passes a range check and contributes 0 to the sum, so a zero out-note is a
legal note with a real commitment, owner key, `rho` and `r`.

**The two actions (both confirmed, every input VM-ACCEPTED consensus +
standard):**

| Step | Tx | Size | Fee | Notes |
|---|---|---:|---:|---|
| create the dummy | `30f0f9d4fc3cff162d5421896326cca676d08b7ea5a40e8451771658731dbd85` | 28,252 B | 30,000 (1.062 sat/B) | in-notes 6+7 (210+210), out **400 + 20 + 0** |
| spend the dummy | `cbfb05033282a3338fdddc6f837113a4b2ec3ad065589bc56d723f0d7ec7dadf` | 28,262 B | 30,000 (1.061 sat/B) | in-notes 11+13 (**400 + 0**), out 200 + 100 + 100 |

**What the chain shows.** The zero-dummy action's carrier (201 B) carries
`cm2 = 804d7ea76ebe272b…` for the value-0 note; the tree grew 11 → 14 leaves.
The spend action then used that leaf as `in-note 1`, so the dummy is a real,
spendable tree member — not a dead leaf. Spending it returned the pool to an
all-positive note set and the tree to 17 leaves.

**State after both actions:** root
`17284930349973909159634241637463778619401830995499966741482456361978173648802`
(LE `a2ef702b…3626`); balance **700 FT**; notes **112 / 84 / 84 / 20 / 200 /
100 / 100**; **17 leaves**; state outpoint `cbfb0503…:1` (10,000 sats, 700 FT,
mutable NFT commitment `a2ef702b…56a32b61…`); `actionInputs: []`.

**The cost of a dummy is a leaf, not a note.** A zero out-note still appends a
commitment to the tree, so a long run of 2-out flows through the 3-out circuit
grows the tree 3 leaves per action instead of 2. Consolidation and the
deposit path are the mitigations; the nullifier set (v3 core) is the real fix
for tree growth because it makes spent leaves irrelevant.

**Tooling.** `role2-op-witness-3out.mjs` gained `--outs a,b,c` (explicit values
that must sum to the conservation `outSum`, non-negative, exactly three) and
`--seed <tag>` (a suffix on the out-note secret derivation), plus a
**duplicate-commitment guard** that refuses to prove a commitment already in
the tree. Parity was re-proven before the new actions: re-running the
historical UNSHIELD against its pre-UNSHIELD state backup reproduced the
recorded `covenant`, `outNotes`, `newRoot`, `newLeaves` and `publicSignals`
**byte-identically** (only the randomized Groth16 proof differs).

## 7. Community presentation

Present the current role-2 pool as a **2-in/2-out demo** with a 1-of-1 setup,
an onboarding gap, a nullifier gap and a note-delivery gap. Present the 3-out
as the **note-management layer** of v3, with the measured +0.58% constraint
delta and the new setup as the cryptographic gate. Present the deposit path,
the nullifier set and note delivery as the **core** of v3. The 3-out is not
the whole solution; it is the piece that makes the two-note pre-seed and
change splitting clean.
