# FULL HANDOFF — 2026-11-26 — 3-out NOTES MANAGEMENT

**Status:** the 3-out v3 note-management feature is **complete through the
chipnet demo and the Nito client witness path**. The demo pool has run the full
lifecycle **SHIELD → TRANSFER → UNSHIELD**. The Nito 3-out witness generator
reproduces the live UNSHIELD **byte-exactly**. The 3-out proving assets are
published and served from `prover.nito.cash`. The remaining work is the Nito
UI/blanks/browser acceptance, the v3 core (deposit path, nullifier set,
encrypted note delivery), Gate 7, and the migration.

Every fact below is from a file path, a command output, or an on-chain query.
Unmeasured items are marked **UNMEASURED**.

---

## 0. Read order for the next session

1. This file.
2. `AGENTS.md` top section (the short current handoff).
3. `docs/ROLE2-3OUT-V3-DESIGN.md` (the design + the deployed demo record).
4. `pusd-shielded-pool/wip-role2-hook/STATUS.md` (the hook/gates history).
5. `nito.cash/AGENTS.md` (the 3-out client path record).

**Build host:** `apecsdev` only. Node is `/home/apecs/bin/node`
(`export PATH=/home/apecs/bin:$PATH`). Do not build on the dev host.

---

## 1. The 3-out demo pool (chipnet) — complete lifecycle

```
  SHIELD e847ef56…            TRANSFER ef64f3dd…           UNSHIELD ec31a41c…
  1,000 FT                    28,389 B                    28,368 B
  out 400 + 300 + 300         spends notes 2+3            spends notes 4+5
  lock 4f49c1cb…              out 280 + 210 + 210         out 112 + 84 + 84
                              lock f52502b4…              + 300 FT payout at :2
                                                          lock 11b9416c…
        │                           │                            │
        └──────── state root 327110… ┴──── state root 142282… ────┘
```

| Item | Value |
|---|---|
| Category (anchor) | `bc607a96c8a21a1400263d437005d3f434c3c60674018119995dc6200072e635` |
| Mint | `62d91e4cf541f8c7a710cfcecd566fd99f91b0d6615afddaaf074217b739132e` |
| Deploy | `2f65079182cf1ecd736e897afad741b9218c6afd16f711042ba4cacf5dd8aa7e` (block 348,569) |
| Program | code **7,848 B** sha256 `73cb0ccb01791d37bea2289fc809211296685896ed8ca16ea260a666ede67971`; R 65 B; locking `aa204a6ce339fb62b7b2ebb502c9bf642d3221620e6f5ded619ce8a39110e35182ea87`; pieces 4,036 / 3,812 |
| Guard | `aa20e33ce1810617ea549e24b7aa66c9291c9e9b79aa8dc006501d8a2b2b2990dce887`; redeem 5,103 B; K=64; born guarded |
| Tag batch | `8e3eaf7170240f5fa632879df7e6896a365f6ac5f7c89355db791e158df55526` (9,830 B, 64 blanks) |
| SHIELD 1,000 | `e847ef567bd06ec6585e4d7384d0eb28ca77913c7b8813beb52a9194e83017e0` — 28,326 B, 30,000 sats (1.059 sat/B), out **400 + 300 + 300**, lock `4f49c1cb94bf0588a0d064a86884cfcab5790c2d23eaa5092cc25fa260292d54` |
| TRANSFER | `ef64f3dda71ed0110f488ea366e8fab79ff214649586c00ccba14d12da46e325` — 28,389 B, 30,000 sats (1.057 sat/B), spends notes 2+3, out **280 + 210 + 210**, lock `f52502b4a8713e6feb9b76054d4e7a8c13e61ae0dfcdf3b1a0cc4da039d0935a` |
| UNSHIELD 300 | `ec31a41c591c4af4ad95c2fab76c1ad2bb34b483393bce53758982a9d8e9de03` — 28,368 B, 29,000 sats (1.022 sat/B), spends notes 4+5, out **112 + 84 + 84**, 300 FT payout at `:2`, lock `11b9416cc71ac5331060de58f26cdfc47f07519ac693e0d3f5e3d9be7b121088` |
| Final state | root `14228234475601541117315008857991396106432351016727521101710528622096584678627` (LE `e31cd2943f8ac9cc126cde7c2bb422b8c2f4e404c2aa94c0062ca14d34e5741f`); oldNull `b5e5942f34eccd022bbf4fb4b8476f6e95ccca649f0c0c868ad470a5dab490ec`; balance **700 FT**; notes **210 (6) / 210 (7) / 112 (8) / 84 (9) / 84 (10)**; **11 leaves** |
| State outpoint | `ec31a41c…:1` — 10,000 sats, 700 FT, mutable NFT commitment `e31cd294…b5e5942f…` |
| Action inputs | `[]` — the next action needs a **refill lock** first |

Every action input was VM-ACCEPTED consensus + standard before broadcast.
The three actions are the note-management proof: the 3-out SHIELD creates three
notes; the TRANSFER spends two and creates three with change splitting; the
UNSHIELD spends two, pays 300 FT publicly and creates three change notes.

**Demo only:** 1-of-1 setup, public bootstrap in-notes on the first action
(indices 0/1), no real nullifier set, no encrypted note delivery. Gate 7 is
mandatory for mainnet.

### State files (on `apecsdev`)

- `/home/apecs/cov/role2-pool3-state.json` — the live 3-out demo state; contains
  note nks; **NOT committed**.
- `/home/apecs/cov/role2-pool3-state.pre-unshield-20261126-143607.json` — the
  pre-UNSHIELD backup.
- `/home/apecs/cov/role2-op3.json` — SHIELD op.
- `/home/apecs/cov/role2-op3-transfer.json` — TRANSFER op.
- `/home/apecs/cov/role2-op3-unshield.json` — UNSHIELD op (proof + public
  signals + covenant args + out-notes; contains nks; not committed).
- `/home/apecs/cov/our-3out.fixtures.json` — 3-out VK + 5 proofs.
- `/home/apecs/cov/our-3out-proofs.json` — the 5 proofs.
- `/home/apecs/cov/our-3out-sweep-a.json` / `-b.json` — 64 minted proofs.
- `/home/apecs/cov/pool3-sweep-report.json` — the 69-case sweep report.

### Wallet A (the 3-out demo funder)

- Address: `bchtest:qzzu85xnl99u534d9z40yu7c494hknppx5lu29gl8t`
  (`/home/apecs/.secrets/wallet-a-role2-demo.json`).
- **State at the 2026-11-26 handoff:** 1 plain UTXO, **2,523 sats**
  (`11b9416c…:2`); **18 blanks** (18,000 sats); **99,999,300 FT** of
  `bc607a96…` (`4f49c1cb…:3` 99,999,000 + `ec31a41c…:2` 300). The pool holds
  700 FT; total 100,000,000.
- **The next lock was NOT fundable at the handoff.** `pool-refill-role2.mjs`
  checks `inSats >= fixed + 2,400` where `inSats = plain[0] + blanks[0] +
  blanks[1]`; a transfer has `fixed = 30,000`, so 32,400 sats are needed and
  wallet A had 4,523.
- **RESOLVED later the same day** — see §10. Wallet A now holds **3 plain
  UTXOs / 61,054 sats**, **12 blanks**, 99,999,300 FT; the next lock IS
  fundable.
- Recovery tooling (all on `apecsdev`, from
  `~/zkb/groth16_cashscript/chunked/bn254/bn-native-sound/`):
  `wallet-consolidate.mjs` (needs ≥2 plain UTXOs), `blank-sweep.mjs --count N`
  (burns blanks), and `token-sats-recover.mjs --category … --min-value 60000
  --count 1` (burns one demo token UTXO by omission; **DEMO ONLY**).
  **Correction to this handoff's first revision:** wallet A held **six** 20M
  demo-token UTXOs at 60,000 sats each (categories `0717e1a1d4db…`,
  `07a020e92df6…`, `00081625dae9…`, `135dc9ed975f…`, `1d3414ac0ea6…`,
  `1fafc6070ae8…`) plus seven more 20M UTXOs at 1,000 sats each — not
  "seven … at 60,000 sats each". Verified with
  `blockchain.address.listunspent [addr, include_tokens]` at tip 348,771.

---

## 2. Exact commands that produced the UNSHIELD

All from `apecsdev`; `export PATH=/home/apecs/bin:$PATH`.

```bash
# 1) prove (62.5 s; writes the op JSON)
cd ~/zkb/pusd-shielded-pool
node role2-op-witness-3out.mjs \
  --action unshield --amount 300 --in 4,5 \
  --state /home/apecs/cov/role2-pool3-state.json \
  --out /home/apecs/cov/role2-op3-unshield.json

# 2) tagged lock (broadcast; writes state.outpoints.actionInputs)
cd ~/zkb/groth16_cashscript/chunked/bn254/bn-native-sound
node pool-refill-role2.mjs \
  --op /home/apecs/cov/role2-op3-unshield.json \
  --state /home/apecs/cov/role2-pool3-state.json \
  --secrets /home/apecs/.secrets/wallet-a-role2-demo.json --no-wait

# 3) action (VM-eval both modes, broadcast, confirm, advance state)
BN_VK_FIXTURES=/home/apecs/cov/our-3out.fixtures.json POOL_3OUT=1 \
  node pool-op-role2.mjs --3out \
  --op /home/apecs/cov/role2-op3-unshield.json \
  --state /home/apecs/cov/role2-pool3-state.json
```

The action output was:

```
unshield pv=300 sign=1 · balance 1000 → 700 · newNull b5e5942f34eccd02…
fills 0/0/191 · unlockings 9488/9490/8821 · nq 111
consensus: ACCEPT 7017223/7623200 | ACCEPT 6952423/7624800 | ACCEPT 6627726/7089600
standard:  ACCEPT 7052551/7623200 | ACCEPT 6987751/7624800 | ACCEPT 6662798/7089600
tx ec31a41c… · 28368B · fee 29000 sats (1.022 sat/B) · FT 1000 → 1000
```

The next action (if any) must first refill, and wallet A needs sats recovery.

---

## 3. Nito client 3-out path — built and byte-exact

Repo: `/Workspace/apecsdev/nito.cash`; build host `apecsdev`
(`~/apps/nito.cash`). Commits: `6ea8077` (client path), `c6ad077` (prover
mirror).

### 3.1 The program reproduces the deployed demo exactly

New `apps/web/src/lib/pool/role2-3out/` vendors the 3-out program builder under
the 3-out VK (`d4ed12ee…`). `apps/web/src/lib/pool/verifier-role2-3out.js`
exposes `role2Program3out` + `produceRole2Inputs3out`.

Verified on `apecsdev`:

```
code 7848 73cb0ccb01791d37bea2289fc809211296685896ed8ca16ea260a666ede67971
R 65 00ca0209157f7702c40f7f7551ca02eb157f7702e40e7f757e76a82073cb0ccb…885189518a
locking aa204a6ce339fb62b7b2ebb502c9bf642d3221620e6f5ded619ce8a39110e35182ea87
pieces [4036, 3812]
```

The category used is `bc607a96…` (display); the on-chain order is
`35e6720020c65d991981017406c6c334f4d30570433d2600141aa2c8967a60bc`
(`ROLE2_3OUT_CATEGORY_ONCHAIN`). A typo in this constant produces a different
program hash; the correct value is in
`apps/web/src/lib/pool/verifier-role2-3out.js` and the registry entry
`chipnet-pusd-role2-3out`.

### 3.2 Acceptance: byte-exact against the live UNSHIELD

```bash
cd ~/apps/nito.cash/apps/web
node scripts/pool-accept.mjs --pool role2-3out --txid ec31a41c
```

Output (2026-11-26):

```
pool=role2-3out txid=ec31a41c591c4af4ad95c2fab76c1ad2bb34b483393bce53758982a9d8e9de03
live inputs: 0:9488  1:9490  2:8821
publicSignals n0=0x73b61c8549b8eb9f16a99b209b218d41384a7d08e52ac851f8893bdbdabc705
               n1=0x14a3c3cbb16d68f7939b9e3159e4da967568353ecd0e87ba4c90f590e44cd626
state prevout ef64f3dd…:1 balance=1000 oldNull=4a38d300eb835282…
  fuel0 (in[0]): *** BYTE-EXACT ***
  fuel1 (in[1]): *** BYTE-EXACT ***
  state (in[2]): *** BYTE-EXACT ***
ACCEPTANCE: PASS — the wallet 3-out port regenerates the deployed witness byte-exactly
```

### 3.3 What was changed in the Nito client

- `role2-carrier.js`: 169/201 B carrier; 8/9-field actionHash; cm2; dynamic
  OP_RETURN prefix; `decodeRole2Carrier(payload, outs)`; `role2ActionHash(..., outs)`.
- `role2-action.js`: accepts 169/201; pv at `carrier.length - 9`; sign at
  `carrier.length - 1`.
- `role2-actions.js`: accepts 169/201 carriers; 3 unlockings; 3 out-notes.
- `prover.js`: `buildPoolWitness3out` (3 commitments, 3 out-values, cm2);
  `PROVING_WASM_3OUT_URL` / `PROVING_ZKEY_3OUT_URL` /
  `VERIFYING_KEY_3OUT_URL` → `prover.nito.cash/assets/`.
- `notes.js`: `actionHash3out` (9 fields).
- `decode.js`: 201-B carrier, `cm2`, shifted pv/sign offsets,
  `carrierBytes`.
- `scan.js`: 3-leaf append; `actionHash3out`; cm2 in `detectReceived`.
- `verifier-program-role2.js`: `ROLE2_PROGRAM_3OUT` + `ROLE2_GUARD_3OUT`.
- `registry.js`: entry `chipnet-pusd-role2-3out` (`walletProverCompatible:
  false`, `status: 'awaiting-3out-store-acceptance'`; `categoryOnChain`
  included).
- `store/modules/pool.js`: `submitRole2Action` takes `poolId`; branches on
  `pool.outputs === 3` (3-out witness, 3-out assets, 3-out unlockings,
  `leafIndexBase * 3`); 40/30/30 self split for shield/unshield; transfer
  change split 50/50.
- `scripts/pool-accept.mjs`: new `role2-3out` branch.
- Tests: 3-out carrier/action/prover/decode/actions cases; coverage excludes
  `role2-3out/**` and `verifier-role2-3out.js` (vendored/node-only, like the
  2-out `verifier-role2.js`).

### 3.4 Tests / build / CI (verified)

- Full suite on `apecsdev`: **695/695 passed**.
- Coverage: **89.04% statements / 89.99% lines** (thresholds 88.9 / 89).
- `pnpm build` on `apecsdev`: **success** (`✓ built in 11.19s`).
- GitHub Actions: `45888835607` **success** (client path); `45889707043`
  **success** (prover mirror).

### 3.5 Proving assets — live

GitHub release `role2-proving-assets-3out-v1` in
`APECSdev/pusd-shielded-pool`:

| Asset | Size | sha256 |
|---|---:|---|
| `pool3.wasm` | 3,380,815 B | `c806e561d9466ec25f437d6dfe659ce97e73a3f65359449bcc35deb9c81910fb` |
| `pool3_final.zkey` | 98,190,141 B | `b0177dbe5bb1bf7e9122a00953a2facd3d05b0405fee6c1a59d0da55cfb81659` |
| `verification_key_3out.json` | 3,111 B | `d4ed12eefea550d20fb17b34303fa1446af204b182d58c4807f36944f0d04861` |

Served by `nito-prover` at `https://prover.nito.cash/assets/` (all three
return HTTP 200 with the exact sizes). Worker deploy version `34e48677…`;
`workers/prover/src/index.js` maps the three names to the release tag.

### 3.6 What remains on the Nito side

- **UI pool selector** — `Wallet.vue` still computes `role2Pool` as
  `getPools(...).find(p => p.id === 'chipnet-pusd-role2')`; the 3-out entry is
  not selectable. The store action already accepts `poolId`.
- **3-out blanks** — ~~the 3-out vending machine is not loaded~~ **DONE
  2026-11-26 (§10):** the 3-out machine is live at
  `aa2020bd0ad169a6343ebe86673df2f84fbb6e65a41e14f8891c96a24d10fefbf2d287`,
  price **1,000 sats**, operator wallet A. 5 blanks remain; the first
  permissionless stranger buy is `569a6e6d…` (block 348,775). The Nito user
  acquires two blanks with `blank-buy.mjs` (buyer key only — no operator
  involvement). The 2-out vending `aa206b51…` is category-specific and does
  **not** dispense `bc607a96…` blanks. The 3-out guard is `aa20e33c…`.
- **Browser acceptance** — the SHIELD → TRANSFER → UNSHIELD run through the
  Nito UI has not been performed; `walletProverCompatible` stays **false**
  until it is. The live 2-out browser acceptance is `1ca58773… → 50644d00… →
  f52008f4…` (different pool).

---

## 4. Site / release state

- `web/pages/research/shielded-pool.vue` `#notes-management` carries the
  measured 3-out program, the three confirmed actions, the final state, the
  Nito witness path and the live proving assets.
- `web/pages/research/bn254.vue`, `web/pages/playground.vue`,
  `web/pages/daemons.vue`, `web/pages/research/index.vue` carry the 3-out
  record.
- All changed SFCs pass the `@vue/compiler-sfc` parse + compile check
  (VM image + `/tmp/check-sfc.cjs`).
- Site image **`d8495faabd6d`**; Hub digest
  `sha256:d8495faabd6d64963d59f793f56d20931a515664ec93dd96c5ebb46a896d562e`
  (`last_updated 2026-11-26T20:18:30Z`). Smoke on `127.0.0.1:3215`: `/`,
  `/research`, `/research/shielded-pool`, `/research/bn254`, `/playground` all
  200; markers `Three confirmed 3-out actions`, `ec31a41c`, `3-out witness
  path is built and byte-exact`, `proving assets are live on
  prover.nito.cash`.
- **Flux owner update pending** — no owner credential on blackhost; the owner
  dashboard update is the only deployment action.
- `pool-registry.json` has the `chipnet-role2-pool3-3out` entry with the
  deployed data and the final state; `walletProverCompatible` is not set there
  (the registry is the public record, not the Nito registry).

---

## 5. Commits this session

`hushyourmoney` (`master`):

- `6879ded` — site: record the 3-out demo UNSHIELD (SHIELD → TRANSFER →
  UNSHIELD).
- `6877747` — docs: record the 3-out UNSHIELD and the rebuilt site image.
- `b7f8bb1` — site: record the Nito 3-out witness path (byte-exact).
- `71d7f7c` — docs: record the 3-out demo UNSHIELD, the Nito 3-out path and
  the rebuilt image.
- `9333734` — site: record the live 3-out proving assets and the remaining
  Nito UI/blanks.
- `fbd137f` — docs: record the live 3-out proving assets and the final site
  image digest.
- `6290af7` — docs: the 3-out store branch is wired; UI/blanks/browser
  acceptance remain.
- `d71802a` — registry: record the 3-out client witness path and the wired
  store branch.

`nito.cash` (`master`):

- `6ea8077` — feat(pool): the 3-out v3 client path — byte-exact witness +
  carrier/prover/store support.
- `c6ad077` — feat(prover): serve the 3-out v3 proving assets from the CORS
  mirror.

`pusd-shielded-pool`:

- `5f645c3` — 3-out tooling + evidence (from the previous session).
- Release `role2-proving-assets-3out-v1` (3-out assets; see §3.5).

---

## 6. Remaining work — prioritized

1. **Nito 3-out UI / browser acceptance** (see §3.6). This is the final 3-out
   client step; `walletProverCompatible` stays false until it passes. The
   blank half of this item is **done** (§10).
2. **v3 core** — deposit path (0-in/2-out onboarding), real nullifier set
   (Merkle membership), encrypted note delivery (NIP-44/Nostr or dedicated).
   All are design/UNMEASURED (see `docs/ROLE2-3OUT-V3-DESIGN.md` §3).
3. **Gate 7 MPC → mainnet**, then migrate the Hush 750,000/762,400 notes and
   the wallet A notes into the 3-out pool. The 3-out demo is 1-of-1 and not
   mainnet-ready.
4. ~~**Wallet A sats recovery** before the next lock (see §1).~~ **DONE**
   2026-11-26 (§10): 61,054 plain sats; the next lock is fundable.
5. **Flux owner update** — image `d8495fa…`.
6. ~~**Zero-value dummy third note**~~ **DONE 2026-11-26 (§11)**: the
   witness generator gained `--outs a,b,c` and `--seed`, and the dummy was
   exercised on chain **both ways** — created (`30f0f9d4…`, out 400+20+0) and
   then **spent as an in-note** (`cbfb0503…`, in-notes 400 and 0). A dummy is a
   real, spendable tree member, not a dead leaf. The cost of a dummy is a
   **leaf**, not a note: the tree grows 3 leaves per action either way.

---

## 7. Landmines / gotchas

1. `pool-refill-role2.mjs` sizes from **`plain[0]` only**; wallet A is now
   underfunded. Recover sats first.
2. A token-spending P2PKH signature must include each source output's **token
   data**; a tokenless `sourceOutputs` entry produces a signature the network
   rejects with code 16 (`Signature must be zero for failed CHECK(MULTI)SIG`).
   Fixed in `blank-sweep.mjs` / `token-sats-recover.mjs`.
3. `pool-tagbatch-role2.mjs` reads **`state.guard` (top-level)**; a
   born-guarded deploy wrote only `outpoints.guard`. Fixed in
   `pool-deploy-role2.mjs` (alias) + the live state file.
4. The deploy script's console line labelled “sha256” prints the first 16 hex
   chars of the **code**, not the hash; the real hash is in the state file /
   `pool-info.mjs` (`73cb0ccb…` for the deployed category).
5. **Node `Buffer` + libauth = in-place corruption** in the VM harness
   (`Buffer.prototype.slice()` returns a view). Pass ONLY plain
   `Uint8Array`s into the VM.
6. `OP_SIZE` on the BCH-2026 VM is **non-popping**; model it pop-1/push-2 in
   the assembler.
7. 3-out carrier offsets: `cm2` at 128, `newRoot` at 160, `pv` at 192,
   `sign` at 200; the actionHash preimage is 9 fields. The 2-out offsets are
   128 / 160 / 168 and 8 fields.
8. Nito `role2-3out` uses the **static** `our-3out.fixtures.json`; the
   `BN_VK_FIXTURES` env override is Node-only. The browser bundle carries the
   static fixtures.
9. Nito `role2-3out/pool-hook.mjs` uses `node:assert` (not `/strict`) for the
   browser polyfill; the bench root uses `/strict`.
10. The Nito coverage excludes `role2-3out/**` and `verifier-role2-3out.js`
    (vendored/node-only, like the 2-out `verifier-role2.js`); the full suite
    must stay at/above 88.9% statements and 89% lines.
11. The Nito `scripts/deploy-prover.sh` rsyncs the whole repo to
    `apecsdev:~/apps/nito.cash` with `--delete`; it uses
    `~/.cloudflare/token.env` on the VM. The Worker deploy succeeded
    (`34e48677…`); the committed `src/orchard.wasm` is unchanged.
12. The 3-out demo's public bootstrap notes are **spent**; do not reuse them.
    The Nito store already refuses bootstrap notes after genesis.
13. The 3-out demo's `state.outpoints.actionInputs` is `[]`; any next action
    needs a fresh refill.
14. The 2-out vending machine `aa206b51…` is category-specific; it is not a
    3-out blank source. The 3-out guard is `aa20e33c…`.
15. The 3-out demo is **1-of-1** (demo setup); Gate 7 is mandatory before
    mainnet. Do not describe it as production-ready.
16. Do not run a non-frozen `pnpm install` on `hushyourmoney` (it drops the
    cheerio 1.0.0-rc.12 pin). For Nito, use the frozen lockfile.

---

## 8. Verification commands for the next session

```bash
# On-chain 3-out state (apecsdev)
ssh apecsdev
export PATH=/home/apecs/bin:$PATH
cd /home/apecs/cov
jq '{root:.pool.root, balance:.pool.balance, leaves:(.pool.leaves|length),
     notes:[.pool.notes[]|{index,value:.note.value}],
     state:.outpoints.state, actionInputs:.outpoints.actionInputs}' \
   role2-pool3-state.json

# Pool UTXO / wallet A UTXOs: use the electrum query from the session
# (chipnet.bch.ninja:50002, blockchain.address.listunspent include_tokens).
# Expected: pool ec31a41c:1 700 FT; wallet A 2,523 plain, 18 blanks,
# 99,999,300 FT.

# Nito 3-out acceptance (apecsdev)
cd ~/apps/nito.cash/apps/web
node scripts/pool-accept.mjs --pool role2-3out --txid ec31a41c

# Nito tests + build (apecsdev)
pnpm exec vitest run --coverage     # 695/695, thresholds 88.9/89
pnpm build                          # Vite build

# Proving assets (any host)
curl -s -o /dev/null -w '%{http_code} %{size_download}\n' \
  https://prover.nito.cash/assets/pool3.wasm
curl -s -o /dev/null -w '%{http_code} %{size_download}\n' \
  https://prover.nito.cash/assets/pool3_final.zkey
curl -s -o /dev/null -w '%{http_code} %{size_download}\n' \
  https://prover.nito.cash/assets/verification_key_3out.json

# Site image digest
curl -s https://hub.docker.com/v2/repositories/nyusternie/hushyourmoney/tags/latest \
  | jq '{digest,last_updated}'
```

---

## 9. What is explicitly NOT done

- The Nito 3-out UI pool selector.
- The Nito 3-out browser acceptance (so `walletProverCompatible` is false).
- The deposit path (onboarding), the real nullifier set and encrypted note
  delivery (the v3 core).
- Gate 7 MPC and the mainnet deployment.
- Migration of the Hush 750,000/762,400 notes and the wallet A notes.
- The Flux owner update for the site image `d8495fa…`.
- Nothing on the 3-out note-management layer itself: the demo lifecycle, the
  zero-value dummy (created and spent), the permissionless 3-out blanks and the
  Nito witness path are all done. What remains is the Nito UI, the v3 core,
  Gate 7 and the migration.

Do not claim any of the above as complete.

---

## 10. Session update — 2026-11-26 (later): sats recovery + 3-out vending live

Two documented blockers were closed on chain. Every number below is a command
output from the `apecsdev` VM at chipnet tip 348,771–348,776.

### 10.1 Wallet A sats recovery (handoff §1, §6 item 4)

```bash
cd ~/zkb/groth16_cashscript/chunked/bn254/bn-native-sound
export PATH=/home/apecs/bin:$PATH
node token-sats-recover.mjs \
  --category 0717e1a1d4db6c1f06d99f4578f5c4ab54085f4169e5ff6c94ea109d27f9d9a4 \
  --min-value 60000 --count 1
```

Output:

```
recovering 1 token UTXO(s), 60000 sats: 87252082a35d:0
burn 1 demo token UTXO(s) (60000 sats) → one 59630-sat plain output · fee 370 · 185 B
tx 3b7838c7d61589411caaebbd9ff9c39b75351eb3987ba830850984f6e2d53567
RESULT: 3b7838c7d61589411caaebbd9ff9c39b75351eb3987ba830850984f6e2d53567
```

Burning a token **by omission** is consensus-legal for a fungible amount; the
20,000,000 units of `0717e1a1d4db…` are demo/test tokens with no value. The
category is referenced nowhere in this repo (verified by `grep` over `*.json`,
`*.md`, `*.vue`). **DEMO ONLY** — never run this against a valued asset.

### 10.2 The 3-out vending machine is LOADED (handoff §3.6)

```bash
node pool-vend-load-role2.mjs --count 6 --price 1000 \
  --state /home/apecs/cov/role2-pool3-state.json \
  --secrets /home/apecs/.secrets/wallet-a-role2-demo.json
```

```
vending: redeem 157B · locking aa2020bd0ad169a6343ebe86673df2f84fbb6e65a41e14f8891c96a24d10fefbf2d287
         · price 1000 sats · category bc607a96…
load tx 784ef9c4eac4c6925c455ad2b699b2a86ffffc6445b4b5d8ca4c73600d67bd30 · 1499B
RESULT: 784ef9c4eac4c6925c455ad2b699b2a86ffffc6445b4b5d8ca4c73600d67bd30
state updated: 6 blanks in the machine
```

### 10.3 The first permissionless 3-out blank buy (stranger key)

```bash
node blank-buy.mjs --key /home/apecs/cov/stranger-demo-key.json \
  --state /home/apecs/cov/role2-pool3-state.json
```

```
buyer: bchtest:qpes4zff73dzqag897kh4hx5geqmtp0azq3w7sdpjp — an unknown key to the operator
consensus: ACCEPT · op 7545/4170400
standard:  ACCEPT · op 8057/4170400
buy tx 569a6e6d4e4f3364bba23802e6b0927144e1704f9775f7588cb19c3b0f196884 · 487B
RESULT: 569a6e6d4e4f3364bba23802e6b0927144e1704f9775f7588cb19c3b0f196884
CONFIRMED block 348775
```

Input 0 is the covenant with **no signature**; the only key in the transaction
is the buyer's. The op-cost `7,545 / 8,057` is **byte-identical to the 2-out
machine's** (`blank-vending.mjs` 18/18 demo, 2026-11-24), which is the expected
result: the covenant code is unchanged and only the category/price/operator
constructor bytes differ.

### 10.4 Verified end state (tip 348,776)

| Holder | Plain sats | `bc607a96…` blanks | FT |
|---|---:|---:|---:|
| Wallet A `qzzu85xn…` | 3 UTXOs / **61,054** | **12** | 99,999,300 |
| Vending `aa2020bd…` | 5,000 (the blanks' float) | **5** | — |
| Stranger `qpes4zff…` | 1 UTXO / 43,739 | **1** (`569a6e6d…:0`) | 0 |

Blank conservation: **12 + 5 + 1 = 18** — the same 18 minted into wallet A by
the tag batch `8e3eaf71…`. Nothing was minted or burned.

Wallet A's plain sats (61,054) exceed the transfer refill requirement
(`fixed 30,000 + 2,400`), so **the next 3-out action is fundable** — the
`state.outpoints.actionInputs: []` condition can now be cleared with a refill.

### 10.5 What this changes for the Nito user

Acquisition is now permissionless for the 3-out category: the Nito user runs
`blank-buy.mjs` (or any equivalent client that reproduces the 157-B redeem from
the published parameters) with **only their own key**. There is no operator
signature, no allowlist and no per-blank involvement. The machine holds 5
blanks at 1,000 sats each; the buyer pays the exact price to wallet A and the
blank is delivered to the buyer's own locking
(`OUTBYTECODE(0) == UTXOBYTECODE(1)`).

### 10.6 Explorer links (Selene primary, all HTTP 200)

- recovery `3b7838c7…`: `https://explorer.selene.cash/tx/3b7838c7d61589411caaebbd9ff9c39b75351eb3987ba830850984f6e2d53567?network=chipnet`
- load `784ef9c4…`: `https://explorer.selene.cash/tx/784ef9c4eac4c6925c455ad2b699b2a86ffffc6445b4b5d8ca4c73600d67bd30?network=chipnet`
- buy `569a6e6d…`: `https://explorer.selene.cash/tx/569a6e6d4e4f3364bba23802e6b0927144e1704f9775f7588cb19c3b0f196884?network=chipnet`

### 10.7 State file

`/home/apecs/cov/role2-pool3-state.json` gained `vending` (locking, price,
operator, load tx, `blanksLoaded: 6`, `remaining: 5`, the first buy record with
its VM metrics) and `wallet` (3 plain UTXOs / 61,054 sats, 12 blanks,
99,999,300 FT, the recovery tx). **Not committed** — it contains note nks.

### 10.8 Site release (built + pushed, Flux pending)

The stale published claims were corrected and the vending machine was added to
the research record. Three SFCs changed:

- `web/pages/research/shielded-pool.vue` — a new full-width card **“3-out
  blanks: the machine is loaded”** (locking, 157-B redeem, price, load tx,
  first stranger buy, the byte-identical op-cost argument, the conservation
  count, and the warning that the 2-out machine `aa206b51…` does not dispense
  `bc607a96…` blanks) with two Selene tx buttons; plus four stale-claim
  corrections (the FAQ, the “the gate” card, the disclosure block and the two
  summary paragraphs that said the 3-out blank path was not built).
- `web/pages/research/bn254.vue` — the 3-out note corrected.
- `web/pages/playground.vue` — the 3-out experiment row corrected.

Verification (all on `apecsdev`, per the standing never-build-on-this-host
rule):

```
SFC parse + compileScript + compileTemplate: OK ×3 (VM image + /tmp/check-sfc.cjs)
docker build --network=host: success (yarn layers cached; package.json untouched)
image 34524b4db756 · smoke on 127.0.0.1:3221:
  / 200 · /research 200 · /research/shielded-pool 200 (186,041 B)
  /research/bn254 200 · /playground 200 · /daemons 200
markers on /research/shielded-pool: "3-out blanks: the machine is loaded" 1 ·
  aa2020bd 2 · 569a6e6d 2 · 784ef9c4 1 · 348,775 1 ·
  "blank conservation 12 + 5 + 1 = 18" 1
stale claims (must be 0): "3-out blanks remain pending" 0 ·
  "UI/blank path are NOT built" 0 · "UI/blanks are not" 0 ·
  "3-out blanks and the browser acceptance remain" 0
```

Hub: digest
`sha256:34524b4db756382d2dea15a84c0351ad64e20a9d48a23f350164a0dc908f0c75`,
`last_updated 2026-11-26T21:17:25Z`. **Flux owner update still pending** — no
owner credential on this host; the owner dashboard at
`https://cloud.runonflux.io` is the only deployment action. Do not declare the
live site updated until `/research/shielded-pool` serves the vending card.

### 10.9 What is still open after this session

- Nito **UI pool selector** and **browser acceptance** (external; the store
  branch and the byte-exact witness path are done, the blanks are now
  permissionless).
- ~~The **zero-value dummy third note**~~ **DONE in §11.**
- **v3 core** (deposit path, nullifier set, encrypted note delivery), **Gate 7
  MPC**, the **migration**, and the **Flux owner update**.

---

## 11. Session update — 2026-11-26 (third): the zero-value dummy, measured both ways

`role2-op-witness-3out.mjs` hard-coded the 40/30/30 split, so the design's
"2-out flows remain representable with a zero-value dummy third note" was a
claim about the circuit, not a measured behaviour. It is now measured on chain
in both directions.

### 11.1 The tooling change (`pusd-shielded-pool`)

Two flags and one guard, with **zero change to the default path**:

- `--outs a,b,c` — explicit out-note values. Exactly three, non-negative, and
they must sum to the conservation `outSum` (= `inSum + (sign ? -pv : +pv)`).
Absent, the script computes the original 40/30/30 split.
- `--seed <tag>` — a suffix on the out-note secret derivation. The default seed
is `role2-op3-<deployTxid>-<action>-<amount>`; two actions with the same
action/amount derive the same secrets, and identical out **values** would then
duplicate a leaf. Absent, the seed string is byte-identical to before.
- **Duplicate-commitment guard** — refuses to prove if any new commitment is
already a leaf.

**Parity re-proven before the new actions.** Re-running the historical
UNSHIELD against its pre-UNSHIELD state backup
(`role2-pool3-state.pre-unshield-20261126-143607.json`) reproduced the recorded
op **byte-identically** in every deterministic field:

```
covenant       IDENTICAL
outNotes       IDENTICAL
newRoot        IDENTICAL
newLeaves      IDENTICAL
publicSignals  IDENTICAL
pv / sign      IDENTICAL
proof          differs (expected: Groth16 proving is randomized)
```

(Re-running it against the CURRENT state instead trips the duplicate guard —
which is itself the proof that the default derivation is unchanged.)

### 11.2 The two actions

```bash
cd ~/zkb/pusd-shielded-pool
export PATH=/home/apecs/bin:$PATH

# 1) create the dummy: notes 6+7 (210+210) -> 400+20+0
node role2-op-witness-3out.mjs --action transfer --in 6,7 --outs 400,20,0 \
  --seed zero-dummy-1 --out /home/apecs/cov/role2-op3-zero.json

cd ~/zkb/groth16_cashscript/chunked/bn254/bn-native-sound
node pool-refill-role2.mjs --op /home/apecs/cov/role2-op3-zero.json \
  --state /home/apecs/cov/role2-pool3-state.json \
  --secrets /home/apecs/.secrets/wallet-a-role2-demo.json --no-wait
BN_VK_FIXTURES=/home/apecs/cov/our-3out.fixtures.json POOL_3OUT=1 \
  node pool-op-role2.mjs --3out --op /home/apecs/cov/role2-op3-zero.json \
  --state /home/apecs/cov/role2-pool3-state.json

# 2) spend the dummy: notes 11+13 (400+0) -> 200+100+100
cd ~/zkb/pusd-shielded-pool
node role2-op-witness-3out.mjs --action transfer --in 11,13 --outs 200,100,100 \
  --seed spend-zero-1 --out /home/apecs/cov/role2-op3-zero-spend.json

cd ~/zkb/groth16_cashscript/chunked/bn254/bn-native-sound
node pool-refill-role2.mjs --op /home/apecs/cov/role2-op3-zero-spend.json \
  --state /home/apecs/cov/role2-pool3-state.json \
  --secrets /home/apecs/.secrets/wallet-a-role2-demo.json --no-wait
BN_VK_FIXTURES=/home/apecs/cov/our-3out.fixtures.json POOL_3OUT=1 \
  node pool-op-role2.mjs --3out --op /home/apecs/cov/role2-op3-zero-spend.json \
  --state /home/apecs/cov/role2-pool3-state.json
```

Action 1 (`30f0f9d4…`):

```
transfer pv=0 sign=0 · inSum=420 → out 400+20+0 (zero-value dummy: a 2-out flow)
proved in 19.4s · n0 142282344756015411… · n1 138635631104676470…
lock  0470a5b8… · 689B · 2 tagged fuel UTXOs of 15000 sats
transfer pv=0 sign=0 · balance 700 → 700 · newNull 79314d6ea7f86295…
fills 0/0/242 · unlockings 9488/9490/8776 · nq 108
consensus: ACCEPT 6997745/7623200 | ACCEPT 6956864/7624800 | ACCEPT 6594303/7053600
standard:  ACCEPT 7032945/7623200 | ACCEPT 6992064/7624800 | ACCEPT 6629247/7053600
tx 30f0f9d4… · 28252B · fee 30000 sats (1.062 sat/B) · FT 700 → 700
```

Action 2 (`cbfb0503…`):

```
transfer pv=0 sign=0 · inSum=400 → out 200+100+100
proved in 18.0s · n0 111045121164150532… · n1 227928132051084653…
lock  7b8af94c… · 689B · 2 tagged fuel UTXOs of 15000 sats
transfer pv=0 sign=0 · balance 700 → 700 · newNull 56a32b6156df1b6f…
fills 0/0/252 · unlockings 9488/9490/8786 · nq 108
consensus: ACCEPT 7011699/7623200 | ACCEPT 6971336/7624800 | ACCEPT 6602153/7061600
standard:  ACCEPT 7047027/7623200 | ACCEPT 7006664/7624800 | ACCEPT 6637225/7061600
tx cbfb0503… · 28262B · fee 30000 sats (1.061 sat/B) · FT 700 → 700
```

### 11.3 On-chain verification

Action 1's carrier decoded from `vout[0].scriptPubKey` (`6a 4c c9` + 201 B):

```
carrier payload: 201 bytes
 nf0 22b6d4b767592e21…   nf1 618e84544eb1eace…
 cm0 09a32ab3289becbf…   cm1 5f13387bc14cb90d…   cm2 804d7ea76ebe272b…
 newRoot 2d7bf1b66f20352d…
 pv 0000000000000000  sign 0
```

`cm2` is the commitment of the **value-0** note. The state NFT at `vout[1]`
carries `2d7bf1b6… ‖ 79314d6e…` (root ‖ nullifier fold), 10,000 sats, 700 FT,
mutable — matching the action's `newRoot` and `newNull`. Action 2's state
commitment is `a2ef702b… ‖ 56a32b61…`.

**The dummy is spendable.** Action 2 used leaf 13 (the value-0 commitment) as
in-note 1 and the circuit accepted it; `publicSignals[0]` equalled the root
after action 1. A dummy therefore costs a **leaf**, not a note.

### 11.4 Final state (tip 348,784)

| Item | Value |
|---|---|
| Root | `17284930349973909159634241637463778619401830995499966741482456361978173648802` (LE `a2ef702b…3626`) |
| Balance | **700 FT** |
| Notes | 112 (8) / 84 (9) / 84 (10) / 20 (12) / 200 (14) / 100 (15) / 100 (16) |
| Leaves | **17** (11 → 14 → 17) |
| State outpoint | `cbfb05033282a3338fdddc6f837113a4b2ec3ad065589bc56d723f0d7ec7dadf:1` — 10,000 sats, 700 FT |
| Action inputs | `[]` — the next action needs a refill |

Sum check: 112 + 84 + 84 + 20 + 200 + 100 + 100 = **700** ✓

### 11.5 Wallet A after the two actions

Two more demo-token UTXOs were burned to fund the actions (DEMO ONLY):
`0717e1a1d4db…` was used in §10.1; this session added
`07a020e92df6…` — tx
`21ccad44a248ebb72fb950973694b765fd2de38722933788fec8e64691333085`,
59,630 sats recovered.

**Wallet A after both actions (tip 348,793):** **4 plain UTXOs / 61,928
sats**, **8 blanks** (12 − 2 − 2), 99,999,300 FT. Four 60,000-sat demo-token
UTXOs remain as fee reserve. **The next lock is NOT fundable as it stands** —
a transfer refill needs `plain[0] + 2 blanks ≥ 32,400` and the largest plain
UTXO is 28,153 sats; recover sats first (§1 tooling).

### 11.6 Explorer links (Selene primary, all HTTP 200)

- lock `0470a5b8…`: `https://explorer.selene.cash/tx/0470a5b88a4bea9846e85b7d001a2746d6e1eb76615ec6765f356a4930dd0b7b?network=chipnet`
- zero-dummy `30f0f9d4…`: `https://explorer.selene.cash/tx/30f0f9d4fc3cff162d5421896326cca676d08b7ea5a40e8451771658731dbd85?network=chipnet`
- recovery `21ccad44…`: `https://explorer.selene.cash/tx/21ccad44a248ebb72fb950973694b765fd2de38722933788fec8e64691333085?network=chipnet`
- lock `7b8af94c…`: `https://explorer.selene.cash/tx/7b8af94cf8434850b939265926f46a9e12097c61c85a195305644283748a986f?network=chipnet`
- zero note spent `cbfb0503…`: `https://explorer.selene.cash/tx/cbfb05033282a3338fdddc6f837113a4b2ec3ad065589bc56d723f0d7ec7dadf?network=chipnet`

### 11.7 Site release (built + pushed, Flux pending)

`web/pages/research/shielded-pool.vue` only:

- the "Three confirmed 3-out actions" card became **"Five confirmed 3-out
  actions"** with the zero-dummy action and the zero-spend action inline and two
  new Selene tx buttons;
- the "the note shapes" card gained the zero-value-dummy paragraph (why a 0 is
  legal, both actions, "a dummy is a real tree member, not a dead leaf — it
  costs a leaf and is recoverable");
- the FAQ row "3-out demo pool · chipnet" was updated to five actions and the
  new final state.

Verification (on `apecsdev`): SFC parse + compileScript + compileTemplate
**OK**; `docker build --network=host` success (yarn layers cached); image
**`5b36bc6543b0`**; smoke on `127.0.0.1:3222`: `/research/shielded-pool` **200,
187,846 B**; markers present — "Five confirmed 3-out actions" 1, `30f0f9d4` 2,
`cbfb0503` 2, "zero-value dummy note" 1, "zero note spent cbfb0503" 1,
"400+20+0" 2, "112 / 84 / 84 / 20 / 200 / 100 / 100" 1, "17 leaves" 1; stale
strings 0 — "Three confirmed 3-out actions" 0, "210 / 210 / 112 / 84 / 84" 0.

Hub: digest
`sha256:5b36bc6543b01a8ef375f9078bd1b36bf526fdcfe53a827cf2f7be8e6d0836c7`,
`last_updated 2026-11-26T21:29:44Z`. **Flux owner update still pending** — no
owner credential on this host. Do not declare the live site updated until
`/research/shielded-pool` serves "Five confirmed 3-out actions".

### 11.8 Commits

- `pusd-shielded-pool`: the `--outs` / `--seed` / duplicate-guard change to
  `role2-op-witness-3out.mjs`.
- `hushyourmoney`: site (this section's release) + docs/registry/AGENTS.
