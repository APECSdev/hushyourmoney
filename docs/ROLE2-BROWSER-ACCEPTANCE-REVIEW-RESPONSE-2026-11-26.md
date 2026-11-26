# Role-2 browser acceptance — nito response to the Hush review (2026-11-26)

**From:** nito.cash (APECS)
**To:** hushyourmoney
**Re:** `docs/ROLE2-BROWSER-ACCEPTANCE-REVIEW-2026-11-26.md` (commit `07231d6`)

Verdict: **the review is accepted in substance.** The P0 (the bootstrap reuse + the
standing locks), the P1s (the undelivered transfer note, the unpinned mirror, the note
persistence requirement) and the P2s (the operator counts, the truncated lock txids, the
stale registry comment, the 2N split) are all correct or directionally correct. One
factual correction: only ONE of the five standing locks is bootstrap-tagged; the other
four are stuck, not publicly spendable. Two items were fixed in `master` while reviewing.

## 1. Verified — the review's facts

- The five locks, their FT and fuel sats, and the pool history (48 entries): exact.
  `3db76294…` 1,000/0; `10f26fa3…` 0/0; `1946084e…` 0/0; `c3e21c7a…` 600/0;
  `dff42ddb…` 600/0 — **2,200 FT + 150,000 sats** standing.
- The operator: **42 blanks + 7,123 plain sats** (the handoff's 48/~5,000 stale).
- The registry comment above `walletProverCompatible: true` still said "NOT IN THIS
  REPO YET … the flag flips only after" — stale.
- The local `public/proving/pool_final.zkey` is `b2398d85…` (97,714,842 B) — the old
  default the review warned about. The Worker mirror serves the correct sizes (the wasm
  3,376,395 B, the zkey 97,716,000 B, the VK 3,111 B) and the committed VK is
  `05250429…`; the store's role-2 path uses the mirror URLs, but nothing pins the bytes.
- The Hush daemons carry `role2-round.js` + `round-2n.js` (+ their tests); the network
  loop and the Nito 2N UI are the missing pieces.
- The failed-deposit arithmetic: the pool's 760,400 FT = the 750,000 seed + **10,400**
  net state deposits; the fuel0s hold **2,200** more → **12,600** total. The handoff's
  "≈9,000" was understated; the 600 payout is the successful unshield.

## 2. The correction — one public lock, not five

The review's table lists five "public bootstrap tags". Recomputing the bootstrap
nullifiers from the registry's `bootstrapNotes` (`nk = 1`, the two rho values):

```
nf0 = 20486037321101541575112224955351946688828409164778438834056077449773895413190
nf1 = 19934641692495042335755925860955195491282833119191488446155998937927486511886
tag = 9b15436ae6d6d9bcc4297a786f48267829a9e056515fcce00817077bd11fc204
```

That tag is **only** `3db76294…`'s fuel commitment. The other four carry the intended
actions' private nullifier pairs (the lost shield notes) — their preimages are not public
and the notes were lost with the browser profiles. So:

- `3db76294…` (1,000 FT + 30,000 sats): **anyone with the public seeds can spend it** —
  the real theft risk, and sweepable by nito today.
- `10f26fa3…`, `1946084e…`, `c3e21c7a…`, `dff42ddb…` (1,200 FT + 120,000 sats): the
  nullifier preimages are gone; the program's check 4g cannot be satisfied again. The
  funds are **stuck**, not stealable — a demo loss, not a standing vulnerability.

The "sweep the five locks" step is therefore one lock, not five. The sweep itself needs
a standing-fuel path (`submitRole2Action` always builds a fresh lock today) — it is on
the nito list.

## 3. Fixed while reviewing (committed)

1. **The registry comment** — now states the assets + the acceptance txids + the flip.
2. **The bootstrap reuse is refused after the genesis.** `selectInNotes` now receives
   `bootstrapNotes` only when `scanned.scan.actions.length === 0`. After any action the
   seeds are spent; a wallet without own notes now fails loudly instead of
   double-spending the public seeds. (The Hush "stop seeding in-notes" item.)

The full suite is green (73 files / 684 tests, the coverage gate included); the VM ran
the same suite twice (the first run's Send/Receive timeouts were the known parallel-load
flake — both pass in isolation and on the re-run).

## 4. Accepted, with the plan

- **P1 the 400 FT transfer note** — accepted. The 169-B carrier cannot carry the note;
  off-chain delivery is a missing acceptance criterion and a 2N requirement. Added to
  the nito plan (the note handoff channel + the 2N carrier tolerance).
- **P1 the mirror pinning** — accepted. The plan: pre-fetch the three assets, verify
  `4a4e2543…` / `8595b434…` / `05250429…`, pass the verified buffers to snarkjs, and
  delete the stale local `b2398d85…` default (or pin it to the release).
- **P1 the note persistence** — the code already persists the notes (the sealed store:
  `recordRole2Notes` → `recordNote` → `pool.sealed`); the handoff omitted the
  requirement. The 400 FT is unreachable because of the delivery gap, not the storage.
- **P0 the private-note pre-seed** — accepted (Hush's step 2). The bootstrap gate above
  means the re-run needs the two private notes; the browser acceptance will then use
  author-bound deposits.
- **P2 the 2N split** — accepted: the daemons have `role2-round.js` + `round-2n.js`;
  the network loop + the Nito client 2N UI are the remaining pieces. Recorded.
- **P2 the lock txids** — full txids recorded here:
  `3db76294aba8fa24ad213520159660fe5280ab0c2430d592f56f9bd434a9a779`,
  `10f26fa38a4f7c506db3cb921fbc31615ab08c5b3dc12a7d645608b322b2fe84`,
  `1946084ea07abef655c6f3a55850461726c2252e1ddaf47b2d2528f369450b1c`,
  `c3e21c7a99116e0205a1d97bffeff8eef9c314c54826532c72296d81ceaad08a`,
  `dff42ddb835c39bf2200a6eef697ec5f256ade4a206d41bd85d904876e3e1c2a`.

## 5. Next

1. nito: the standing-fuel sweep of `3db76294…`; the mirror hash pinning; the off-chain
   note delivery; the full lock txids in the handoff.
2. Hush: the private-note pre-seed of wallet A; the 2N network loop; the blackhost
   deployment; the seed-reuse refusal in the daemon path.
3. Then the second browser acceptance with private in-notes + the 20M deposit.
