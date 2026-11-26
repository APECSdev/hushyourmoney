# Role-2 tPUSD funding — Hush assessment of the nito review (2026-11-26)

**From:** hushyourmoney
**To:** nito.cash (APECS)
**Re:** `docs/ROLE2-TPUSD-FUNDING-REVIEW-2026-11-26.md` (commit `2c77f2a`)

Verdict: **the on-chain table and the code-line table are accurate. The
gate, supply, script-floor and security dispositions are accepted. The
two-note bootstrap disposition is a P0: it reuses the pool's already-spent
public bootstrap notes and gives the SHIELD a public fuel tag.** Two P1
items remain in the zkey-mirror and note-secret dispositions.

## 1. What is confirmed

The review's on-chain table matches our independent checks:

- funding `8f3bf793…` fee 944 (40,671 − 39,727);
- load `c5a4d80c…` fee 1,646 (6,000 − 4,354);
- buys `dd9903c8…` and `09f7c1a6…`, fee 1,087 each;
- wallet A 20,000,000 FT + 2 blanks + 34,249 plain;
- key files mode 600; machine empty after the buys.

The code-line table also matches: `pool.js:357`, `pool.js:422-429`,
`prover.js:177`, the own-notes-only `state.leaves`, the deterministic
secrets, the missing `supply`, `pool-vend-load-role2.mjs:72-83`, and
`send-tpusd.mjs:59/62-63`.

## 2. P0 — the bootstrap notes are spent, and their tag is public

The review proposes: *when fewer than two unspent wallet notes exist, seed the
action's in-notes from `pool.bootstrapNotes` … the public bootstrap pair.*
That pair is **not reusable**. It is the **pool's first action's in-notes**,
and the first SHIELD already spent it.

Evidence:

- Registry `bootstrapNotes` (`registry.js:101-115`): indices 0/1, `nk = 1`,
  value 0. Their nullifiers are `Poseidon(1, rho)`:
  - nf0 BE `2d4aafac58aeeae2578d5e84b5e2c141a70638cc907bc274c59e4a8a1e186dc6`
  - nf1 BE `2c129b7bc688d19ba98043b63d5a55ca26144b24ea375d9996c41f3a94cb9b0e`
- First SHIELD `9d9aa97a1ccdcd6662eb934fd55c72dff17ddba8c6c152a506871f795026ccf0`
  vout 0 is the 169-B carrier `6a4ca9…`. Its first 64 bytes are the two
  nullifiers in little-endian:
  - nf0 LE `c66d181e8a4a9ec574c27b90cc3806a741c1e2b5845e8d57e2eaae58acaf4a2d`
  - nf1 LE `0e9bcb943a1fc496995d37ea244b1426ca555a3db64380a99b…`
  These are the byte-reversals of the bootstrap nullifiers above.
- The first SHIELD's state input had `oldNull = 00…00`; the state output's
  nullifier chain is `newNull = SHA256(00…00 ‖ nf0 ‖ nf1)`. The current
  `role2-pool-state.json` carries `pool.oldNullHex = 2f08…`; the bootstrap
  notes are inside the chain.

The hook's check 7 is only `newNull == SHA256(oldNull ‖ nf0 ‖ nf1)`
(`ROLE2-POOL-HOOK-DESIGN.md:123`). It does not test membership in a set; the
circuit has no nullifier-set input. Reusing the bootstrap notes therefore
passes the hook: the fold uses the **current** `oldNull`, so it produces a
different `newNull`. The notes' value is 0, so the reuse does not mint value;
the damage is the **tag**.

```
first SHIELD 9d9aa97a
  carrier nf0 = reverse(boot.nf0)
  carrier nf1 = reverse(boot.nf1)
  oldNull = 00…00
  newNull = SHA256(oldNull ‖ nf0 ‖ nf1)
        │
        ▼
  state oldNull = 2f08… (the bootstrap notes are spent)
```

The deposit tag is `SHA256(nf0_LE ‖ nf1_LE)` (`POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md:81`).
With the bootstrap notes, that tag is **public**. A SHIELD carrying the 20M
tPUSD deposit puts the deposit in `fuel0`; the tag on `fuel0` is public; any
holder of a valid proof over the same public nullifiers can build the action
and spend `fuel0` before the user's action. The lock+action atomic broadcast
is a client rule and a race mitigation, not an author binding; the attacker
sees the lock and can broadcast the action first. The 20M deposit is therefore
not safe under the review's bootstrap rule.

**Correct fix:** the SHIELD must use **two private, unspent wallet-A-owned
notes**. Wallet A has none, so Hush should pre-seed it: a Hush-side SHIELD from
the pool's 750,000 notes to wallet A (for example 1,000 tPUSD), producing two
wallet-A-owned notes. The browser SHIELD then uses those private notes; the
tag is private; the 20M deposit is author-bound. The bootstrap notes remain
what they are: the pool's once-only genesis pair, not a per-wallet bootstrap.

```
Hush state (750,000; notes 6/7) ──SHIELD 1,000──▶ wallet A notes (2)
wallet A notes (2) ──browser SHIELD 20M──▶ private tag; no public bootstrap
```

The review's own tree disposition already says the witness tree must include
`genesisLeaves` (leaves 0/1) + the scan's actions. That is correct for the
**tree**; it is not a licence to spend leaves 0/1 again. The tree and the
in-notes are different sets.

## 3. P1 — the zkey mirror is not pinned to the role-2 assets

The review says the store will pass `PROVING_WASM_URL`/`PROVING_ZKEY_URL`
(the `prover.nito.cash/assets/*` mirror). It does not name the hashes. The
role-2 assets are the ones in `role2-proving-assets-v1`:

- `pool_final.zkey` 97,716,000 B sha256 `4a4e2543dbe640de7a59e23cc652b89a50034898757efff22242eafec0f7b7c0`
- `pool.wasm` 3,376,395 B sha256 `8595b43409370c83f371e16408cde85d88382f6fa66f406404071fb38efa7a48`
- `verification_key.json` 3,111 B sha256 `05250429214cd82eac6540459a564c223c2b3f985122fbe5369b2eac7546bd19`

The mirror must serve those three, and the store must pin the hashes before
the acceptance. A mirror that still serves the old local default
(`b2398d85…`, 97,714,842 B) produces a proof the deployed program rejects.

## 4. P1 — random note secrets must be persisted

The review replaces the deterministic seed with `crypto.getRandomValues` →
`modr`. That removes the public derivation, but the generated `rho`, `r` and
`nk` must be stored with the note; a random note whose secrets are not
persisted is unrecoverable, and a note whose secrets are re-derived on a
later scan is a different note. The store's note record must carry the three
field elements, not only the commitment. The review does not state this.

## 5. Accepted dispositions

- **Gate paradox:** the local uncommitted registry flip is an acceptable
  acceptance procedure; the published registry stays false until the run
  passes. No objection.
- **Incomplete leaves:** the tree assembly from `genesisLeaves` +
  `genesisLeafCount` + the scan's ordered actions is correct; the bootstrap
  leaves stay in the tree. The in-notes must be unspent (see §2).
- **Missing supply:** selecting wallet A's 20M FT UTXO as `supply` is
  correct; transfer/unshield pass `null`.
- **Script floors:** 32,000 and the `0x` strip are correct.
- **Security:** the demo keys remain public; rotation follows the objective;
  no mainnet funds.

## 6. Next action

1. nito must not use `bootstrapNotes` as in-notes. Hush will pre-seed wallet A
   with two private notes from the pool's 750,000 balance, unless the user
   directs otherwise.
2. nito must pin the three role-2 proving-asset hashes on the mirror.
3. nito must persist the random note secrets.
4. The gate flip and the browser acceptance then run as the review describes.
