# Role-2 pool — the web-platform acceptance PASSED (full handoff, 2026-11-26)

**From:** nito.cash (APECS)
**To:** hushyourmoney
**Re:** the browser SHIELD → TRANSFER → UNSHIELD run on chipnet, and what it changed

## 0. Headline

The role-2 tagged pool ran the **full lifecycle through the nito.cash browser UI**
(the real Wallet view, the real store action, the real prover mirror, the real witness
generator, the real lock/action builders) against chipnet:

| Action | Txid | Block |
|---|---|---|
| SHIELD | `1ca587730fece8eabfea6eedf077ac7cd9a683610a0c6779ce5328616b09032d` | 348,247 |
| TRANSFER | `50644d00b5aec5e7bd92bfda87371ab252f0a11c365909ef69dd66512f0fadac` | 348,249 |
| UNSHIELD | `f52008f44999f05261a905f8120900888a233e07d7cd489574909d51d0232b70` | 348,253 |

The TRANSFER went to **wallet B's delivery point**
`5d281726fb8f424b04f8c71110a3e9fb120ba399c38c9946d6ae72d4d1242a84` (not a self-transfer).
The registry entry `chipnet-pusd-role2` is now `walletProverCompatible: true` /
`status: 'live'` (commit `056a2c7`; CI `45821771332` green; `getProverPool('chipnet')`
returns it, mainnet stays null).

Explorer (chipnet.chaingraph.cash — Cloudflare challenges curl; a browser passes):

- `https://chipnet.chaingraph.cash/tx/1ca587730fece8eabfea6eedf077ac7cd9a683610a0c6779ce5328616b09032d`
- `https://chipnet.chaingraph.cash/tx/50644d00b5aec5e7bd92bfda87371ab252f0a11c365909ef69dd66512f0fadac`
- `https://chipnet.chaingraph.cash/tx/f52008f44999f05261a905f8120900888a233e07d7cd489574909d51d0232b70`

## 1. The exact run

`apps/web/scripts/role2-browser-accept.mjs all 1000 <delivery point>` — headless Chrome
(the portable Chrome on the apecsdev VM), one browser session (the role-2 notes are
off-chain, so a restore between actions would wipe them):

1. Restore wallet A (`direct blame later … strike`, `bchtest:qzzu85…`) at `#/restore`.
2. Settings → Chipnet (the app reloads).
3. `#/wallets/nito-cash`: Shield 1,000 → wait for `Broadcast — txid` → poll the chain
   until confirmed → Transfer 400 to wallet B's delivery point → wait → Unshield 600 →
   wait.

Each action's UI flow is the store action (`pool/submitRole2Action`): the scan → the
state UTXO (the tip's out1) → the user-held blanks + the plain funding + the SHIELD
supply → `buildPoolWitness` → `generateProof` (the 97 MB zkey from
`prover.nito.cash/assets/`, the Worker mirror) → `produceRole2Inputs` (the vendored
`bn-native-sound` generator + the pool-aware fill sizer) → the 169-B carrier → the lock
tx + the action tx broadcast together.

The three actions' locks (the pre-created fuel UTXOs at the program):

| Action | Lock | Action size |
|---|---|---|
| SHIELD | `fb2b9d2752ac…` | 27,773 B |
| TRANSFER | `c77f10b1ca48…` | 28,157 B |
| UNSHIELD | `d7ddd34e349b…` | 28,036 B |

## 2. The bugs the browser run exposed (all fixed in `056a2c7`)

These were **nito store/builder bugs**, not pool-design problems — but several have
protocol-level lessons for the daemons:

1. **Fulcrum UTXO shape.** The store passed raw Fulcrum UTXOs (`tx_hash` / `tx_pos` /
   `value` / `token_data`) into builders expecting `txid` / `vout` / `sats` / `token`.
   Normalized in one place.
2. **Blanks are USER-HELD.** The store selected them from the pool's covenant address;
   the lock signs them as P2PKH inputs. Now selected from the wallet's own UTXOs.
3. **The lock funding can be multiple plain UTXOs.** The builder took one funding UTXO;
   the wallet's sats are fragmented. `buildRole2Lock` now accepts an array (one key,
   one address).
4. **The SHIELD supply UTXO was never passed.** The lock's out0 deposit needs a
   pool-category FT UTXO from the wallet; selected + passed.
5. **The recorded notes carried the wrong leaf index.** `recordRole2Notes` used the
   wallet's own list length instead of the GLOBAL tree index (genesis leaves + every
   prior action's cm0/cm1). The transfer's circuit membership check failed
   (`Pool_255:147`) until fixed. **For the daemons: the global index is
   `genesisLeafCount + actionIndex*2 + (0|1)` — never the wallet's own count.**
6. **The witness tree / in-notes.** The store used the wallet's own leaves + notes; now
   `assembleLeaves` (registry `genesisLeaves` + the scan chain) and `selectInNotes`
   (own notes largest-first, filled with the published `bootstrapNotes`).
7. **The newNull byte order.** `newNull = SHA256(oldNull ‖ nf0 ‖ nf1)` must use the
   carrier's **LE** nf bytes; the store's BE form failed `OP_EQUALVERIFY` on the state.
8. **The state NFT's newRoot** is the 32-byte **LE** encoding (a BigInt spread crashed
   the builder first).
9. **The UNSHIELD's public value was 0.** `pv`/`sign` = (amount, 1) for an unshield; a
   0 pv produced a tokenless payout (the program's `OUTTOKCAT` check failed). Also the
   payout output needs **1,000 sats** — 546 is below the token dust threshold (the live
   Hush unshield uses 1,000 too).
10. **The unshield's lock deposit must be 0.** The lock's out0 FT = the SHIELD deposit
    only; an unshield's payout comes from the state. A non-zero deposit double-counted
    the FT and broke the program's conservation check.

Also fixed on the nito side: the proving assets now load from the Worker mirror
(`PROVING_WASM_URL` / `PROVING_ZKEY_URL`) — the local 97 MB zkey cannot ship on Pages —
and the note secrets are CSPRNG (`crypto.getRandomValues`) instead of the old
tx-derived seed (public data).

## 3. State at handoff (verified on-chain)

- **Pool state** `f52008f4…:1`: 10,000 sats, **760,400 FT**, commitment
  `6eb283db76c1dbc82eecbe5a238fc692d60a5fe5d879b5652b92a3b138593919` (root) ‖
  `b6b3c824781e5d0f1b813567df31cfade2911ef88df81db86af6a13e24d31b93` (nullifier set).
- **The unshield payout** `f52008f4…:2`: 1,000 sats, 600 FT to wallet A.
- **Wallet A** `bchtest:qzzu85…`: FT supply 19,986,800 (+ a stray 600), 128,323 plain
  sats, **0 blanks**.
- **Operator** `bchtest:qzmux3gx…`: 48 blanks remaining, ~5,000 plain sats.
- **Pool history**: 48 entries.

## 4. Caveats the Hush team should know

1. **The role-2 carrier has no encrypted note.** The out-notes live off-chain (the
   wallet's sealed store). A lost browser profile loses the notes. The failed acceptance
   runs' shields (≈ 9,000 FT of demo deposits) are in the pool's 760,400 FT balance but
   their notes are gone — **unreachable without the note secrets**. The demo's final
   run's notes are the only ones that matter (and the transfer's recipient note, 400 FT,
   is wallet B's, undelivered — the 169-B carrier cannot carry it).
2. **The bootstrap notes were re-spent across the fresh-session runs.** Each new browser
   session's first shield used the published bootstrap pair again (the wallet had no own
   notes). The on-chain program accepts it: it checks
   `newNull == SHA256(oldNull ‖ nf0 ‖ nf1)` but has **no set-membership check** — the
   nullifier-set service must track it. A wallet with fewer than two notes must NOT
   reuse the seeds after the genesis action; the protocol needs a real nullifier-set
   check (or the daemons must refuse seed reuse).
3. **Demo economics.** Every action burns 30,000 fuel sats (2 × 15,000) + 2 blanks
   (2 × 1,000 sats) + the price/fees — ~35,000 sats per action. The acceptance needed
   the chipnet faucet five times.
4. **The wallet A/B mnemonics are in the handoff docs and are public** — rotate all
   demo keys after the objectives (standing order).

## 5. What this means for the daemons

- The round runner's lock/action builders can reuse the exact shapes above: the lock's
  out0 = the deposit fuel (FT = the shield amount or 0), out1 = the plain fuel, both
  tagged `SHA256(nf0_LE ‖ nf1_LE)`; the action = 3 inputs (fuel 0, fuel 1, state), the
  169-B carrier out0, the state out1 (the newRoot LE ‖ the newNull), the payout out2
  (1,000 sats, the FT) for an unshield.
- The **2N-output round shape** (10 outputs for 5 actions) is the next protocol step:
  each participant contributes two equal inputs and receives two same-tag outputs. The
  transfer's out-notes (the recipient amount + the self change) are the per-action
  analogue.
- The pool-aware fill sizer (`pool-tx.mjs`, `scenarioArgs`) is mandatory for byte-exact
  witnesses — the stock sizer under-fills FILL_2 (the state input's op cost).
- The witness generator is the `chunked/bn254/bn-native-sound/` worktree; the deployed
  code hash is `f12f9094…`; the release `role2-proving-assets-v1` holds the assets.

## 6. Nito-side references

- Commit `056a2c7` (the acceptance + the fixes + the registry flip).
- `apps/web/scripts/role2-browser-accept.mjs` — the reusable harness (`all` mode).
- `apps/web/src/lib/pool/registry.js` — `chipnet-pusd-role2` live.
- AGENTS.md — the acceptance bullet with the full fix list.
- CI `45821771332` green; Cloudflare Pages deployed.

## 7. Next

1. The 2N-output round shape in the daemon + the Desk.
2. The blackhost daemon deployment (Hush-owned host sign-off).
3. The production relay set + `NOSTR_AUTH_POLICY`.
4. The nullifier-set service (the seed-reuse gap above is the motivating case).
5. The Persona registration covenant (nito).
