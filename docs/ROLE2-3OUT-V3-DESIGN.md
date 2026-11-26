# Role-2 pool v3 — 3-output circuit and the community design

**Status (2026-11-26, later session):** the 3-output circuit compiles and is
measured; the 1-of-1 demo setup, the 3-out verifier program under that VK, the
201-B role-2 hook, the 3-out witness generator, the acceptance suite, the red
team and the full 69-case liveness sweep are **built and measured**; a 3-out demo pool
is **deployed on chipnet** and its SHIELD and TRANSFER are confirmed. The
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
out-notes, `cm2`, the 201-B carrier, the 9-field actionHash). The Nito store
still needs the 3-out path. Measured on chipnet: SHIELD **28,326 B**, TRANSFER
**28,389 B**, fee 30,000 sats (**1.059 / 1.057 sat/B**); the fuel policy (2 ×
15,000 sats) still covers it. The 2-out flows remain representable with a
zero-value dummy third note.

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
| Locks | `4f49c1cb94bf0588a0d064a86884cfcab5790c2d23eaa5092cc25fa260292d54` (SHIELD), `f52502b4a8713e6feb9b76054d4e7a8c13e61ae0dfcdf3b1a0cc4da039d0935a` (TRANSFER) |
| Final state | root `3271108787199986663014643111346367083348315666322274808145127686880774309637`; balance 1,000 FT; notes 300 (index 4), 280 (5), 210 (6), 210 (7); 8 leaves |

The two actions are the note-management proof: the 3-out SHIELD creates three
notes in one action; the 3-out TRANSFER spends two of them and creates three
new ones, with change splitting. The pool is a **demo**: 1-of-1 setup, public
bootstrap in-notes on the first action, no real nullifier set and no encrypted
note delivery. Gate 7 remains mandatory for mainnet.

## 7. Community presentation

Present the current role-2 pool as a **2-in/2-out demo** with a 1-of-1 setup,
an onboarding gap, a nullifier gap and a note-delivery gap. Present the 3-out
as the **note-management layer** of v3, with the measured +0.58% constraint
delta and the new setup as the cryptographic gate. Present the deposit path,
the nullifier set and note delivery as the **core** of v3. The 3-out is not
the whole solution; it is the piece that makes the two-note pre-seed and
change splitting clean.
