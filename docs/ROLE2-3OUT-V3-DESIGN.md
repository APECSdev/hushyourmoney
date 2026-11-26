# Role-2 pool v3 — 3-output circuit and the community design

**Status:** the 3-output circuit compiles and is measured. The new trusted
setup, verifier program, role-2 hook, client integration, deposit circuit,
nullifier set and note-delivery layer are **not built**. This document is the
community-facing design; every unmeasured item is marked UNMEASURED.

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
the verifier cost are UNMEASURED; the constraint delta bounds them.

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
baseline. The new program bytes, op cost and worst-case margins are
UNMEASURED until the new VK exists.

### 2.3 Role-2 hook and carrier

The hook grows from 169 to **201 bytes**. It must:

- check `cm2` in the carrier and the actionHash preimage (9 fields);
- check the state output commitment `newRoot ‖ newNull` as before;
- check the output count for the new note shape (the carrier is still out0,
  the state out1, the payout out2 for an unshield);
- keep the deposit tag `SHA256(carrier[0..64])` (nf0/nf1) unchanged.

The hook price, the fill sizer and the acceptance suite must be re-measured
for the 201-B carrier. The current 37,198/36,046 op hook price is UNMEASURED
for the 3-out.

### 2.4 Client and action size

The Nito store, the lock builder and the witness generator need a 3-out path:
`cm2`, three out-notes, the 201-B carrier, the 9-field actionHash. The action
size grows by 32 B (27,773 → 27,805 B for a SHIELD); the fuel policy (2 ×
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

1. Finish the demo acceptance on the current pool with the one-note + Hush
   change handoff (demo only).
2. Sweep the one public lock `3db76294…`; record the four stuck locks.
3. Build the v3 circuits: deposit, 3-out transfer/unshield, nullifier set.
4. Run the new MPC ceremony (Gate 7) and the independent review.
5. Deploy the v3 pool; migrate the Hush notes and the wallet A notes by
   re-shielding into the new pool.
6. Cut over the Nito client and the daemons; keep the current pool as a
   read-only historical record.

## 6. Community presentation

Present the current role-2 pool as a **2-in/2-out demo** with a 1-of-1 setup,
an onboarding gap, a nullifier gap and a note-delivery gap. Present the 3-out
as the **note-management layer** of v3, with the measured +0.58% constraint
delta and the new setup as the cryptographic gate. Present the deposit path,
the nullifier set and note delivery as the **core** of v3. The 3-out is not
the whole solution; it is the piece that makes the two-note pre-seed and
change splitting clean.
