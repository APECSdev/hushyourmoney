# Role-2 browser acceptance — Hush review of the nito handoff (2026-11-26)

**From:** hushyourmoney
**To:** nito.cash (APECS)
**Re:** `docs/ROLE2-BROWSER-ACCEPTANCE-HANDOFF-2026-11-26.md` (commit `3f90bbf`)

Verdict: **the three action transactions, the state, the payout, the wallet
balances and the pool history are on chain exactly as reported. The
acceptance is not clean.** The final SHIELD reused the published bootstrap
notes, and five failed-run locks are still unspent at the pool address with
2,200 FT and 150,000 fuel sats under public tags. The 400 FT transfer note is
undelivered. The handoff's failed-deposit figure is understated. The operator
counts are stale. The lock txids are truncated. The mirror hashes are not
pinned.

## 1. Verified on chain

| Claim | Verified |
|---|---|
| SHIELD `1ca58773…032d` | 27,773 B, 32 confirmations; out1 761,000 FT state |
| TRANSFER `50644d00…adac` | 28,157 B, 30 confirmations; out1 761,000 FT state |
| UNSHIELD `f52008f4…2b70` | 28,036 B, 26 confirmations; out1 760,400 FT state; out2 1,000 sats / 600 FT to wallet A |
| State commitment | `6eb283db…3919` (root) ‖ `b6b3c824…1b93` (nullifier set) |
| Wallet A | 19,986,800 FT + 600 FT payout at 1,000 sats each; 128,323 plain; 0 blanks |
| Pool history | 48 entries |
| Registry | `walletProverCompatible: true`, `status: 'live'` at `056a2c7` |
| CI | run `45821771332` completed `success`, head `056a2c79…` |

The three action sizes, the payout and the wallet A balances match the
handoff exactly. The handoff's registry/CI claims check out.

## 2. P0 — the final SHIELD used the public bootstrap, and the failed locks are still spendable

The handoff's own caveat 2 says the bootstrap pair was re-spent across the
fresh-session runs. The final SHIELD is one of those runs: wallet A had no
own notes, `selectInNotes` filled with the published `bootstrapNotes`, and
the 1,000 FT deposit was tagged with the public
`SHA256(nf0_LE ‖ nf1_LE)`.

The failed runs left five unspent lock pairs at the pool address:

| Lock | Fuel0 FT | Fuel1 FT | Fuel sats |
|---|---:|---:|---:|
| `3db76294aba8fa24ad213520159660fe5280ab0c2430d592f56f9bd434a9a779` | 1,000 | 0 | 30,000 |
| `10f26fa38a4f7c506db3cb921fbc31615ab08c5b3dc12a7d645608b322b2fe84` | 0 | 0 | 30,000 |
| `1946084ea07abef655c6f3a55850461726c2252e1ddaf47b2d2528f369450b1c` | 0 | 0 | 30,000 |
| `c3e21c7a99116e0205a1d97bffeff8eef9c314c54826532c72296d81ceaad08a` | 600 | 0 | 30,000 |
| `dff42ddb835c39bf2200a6eef697ec5f256ade4a206d41bd85d904876e3e1c2a` | 600 | 0 | 30,000 |

The fuel0s carry **2,200 FT**; the five pairs carry **150,000 fuel sats**.
The lock commitments (`9b15436a…`, `e20f2710…`, `1ef01ad4…`, `fefbc49f…`,
`1b2d4fa4…`) are the public bootstrap tags. The hook's check 7 only folds
`newNull = SHA256(oldNull ‖ nf0 ‖ nf1)`; there is no set-membership check.
Any holder of a valid proof over the public bootstrap nullifiers can spend
these locks. The notes are gone; the fuel and the 2,200 FT are not.

The handoff says "the failed acceptance runs' shields (≈9,000 FT of demo
deposits) are in the pool's 760,400 FT balance". The state's 760,400 includes
only 10,400 of the failed deposits; the other 2,200 is the standing fuel0
FT. The handoff's own "≈9,000" is understated: the failed deposits are
**12,600** (10,400 state + 2,200 fuel). The 600 payout is the successful
UNSHIELD, not a failed deposit.

The safe immediate action is to sweep the five locks (the bootstrap nullifiers
are public; nito can build the action) and to stop using the seeds as
in-notes. The long-term fix is the nullifier-set service the handoff lists.
Hush will pre-seed wallet A with two private notes from the pool's 750,000
balance; the browser SHIELD then uses private notes and the deposit tag is
author-bound.

## 3. P1 — the TRANSFER note is undelivered

The TRANSFER `50644d00…` has the 169-B carrier out0, the state out1 and no
wallet B output. The 400 FT recipient note is off-chain; the carrier has no
encrypted note. The handoff's caveat 1 says the note is "undelivered — the
169-B carrier cannot carry it". The 400 FT is in the pool's 760,400 but wallet
B cannot spend it. The headline "full lifecycle" is true for the three
transactions, not for the transfer's recipient. Off-chain note delivery is a
missing acceptance criterion and a missing 2N requirement. The handoff's
"Next" list does not include it.

## 4. P1 — the proving-asset mirror is not pinned

The handoff says the 97 MB zkey comes from `prover.nito.cash/assets/` (the
Worker mirror) and the store uses `PROVING_WASM_URL` / `PROVING_ZKEY_URL`.
It does not name the hashes. The role-2 assets are:

- `pool_final.zkey` 97,716,000 B sha256 `4a4e2543dbe640de7a59e23cc652b89a50034898757efff22242eafec0f7b7c0`
- `pool.wasm` 3,376,395 B sha256 `8595b43409370c83f371e16408cde85d88382f6fa66f406404071fb38efa7a48`
- `verification_key.json` 3,111 B sha256 `05250429214cd82eac6540459a564c223c2b3f985122fbe5369b2eac7546bd19`

The mirror must serve those three and the store must pin the hashes. A mirror
that serves the old local default (`b2398d85…`) produces proofs the deployed
program rejects.

## 5. P1 — the random note secrets must be persisted

The handoff replaces the tx-derived seed with `crypto.getRandomValues`. The
generated `rho`, `r` and `nk` must be stored with the note; the lost-profile
caveat 1 shows the consequence. The handoff does not state the persistence
requirement, and the 400 FT note is already unreachable.

## 6. P2 — stale or truncated records

- **Operator counts.** The handoff says 48 blanks and ~5,000 plain sats. The
  chain now shows **42 blanks** and **7,123 plain sats**. The six blanks are
  the acceptance's two per action; the plain figure moved.
- **Lock txids.** The handoff gives prefixes (`fb2b9d2752ac…`,
  `c77f10b1ca48…`, `d7ddd34e349b…`). The full txids are needed for the
  record; wallet A's `fb2b9d27…:3` change is verifiable, the other two are
  not from the handoff alone.
- **Registry comment.** `056a2c7` sets `walletProverCompatible: true`, but the
  comment immediately above still says the proving assets are "NOT IN THIS
  REPO YET" and the flag flips "only after" the acceptance. The comment is
  stale.
- **2N status.** The handoff lists the 2N-output round as next. The Hush
  daemons already carry `role2-round.js` and `round-2n.js` (112/112 tests);
  the missing piece is the network loop and the Nito client 2N UI. The
  handoff should record that split.

## 7. Accepted

- The ten store/builder bugs are fixed; the global leaf index, the LE
  `newNull`, the LE state root, the unshield `pv`, the 1,000-sat payout and
  the zero unshield deposit are all correct.
- The tree assembly from `genesisLeaves` + the scan chain is correct; the
  bootstrap leaves stay in the tree. The in-notes are the separate problem.
- The registry flip, the CI and the mainnet-null state are correct.
- The `selectInNotes` own-notes-first policy is correct; the bootstrap fill
  is the P0.
- The gate procedure, the supply selection and the script floors are correct.

## 8. Next

1. nito sweeps the five standing locks (2,200 FT + 150,000 sats) and stops
   seeding in-notes from `bootstrapNotes`.
2. Hush pre-seeds wallet A with two private notes; nito re-runs the browser
   acceptance with private in-notes and the 20M deposit.
3. nito adds off-chain note delivery for the 400 FT transfer and for the 2N
   round; the 169-B carrier cannot carry it.
4. nito pins the three role-2 proving-asset hashes on the Worker mirror;
   Hush verifies them.
5. nito refreshes the operator counts, provides the full lock txids and fixes
   the registry comment.
6. Hush adds the seed-reuse refusal to the 2N/daemon path, the network loop,
   and the blackhost deployment.
