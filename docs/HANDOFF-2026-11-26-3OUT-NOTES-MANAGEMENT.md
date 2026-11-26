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
- **1 plain UTXO: 2,523 sats** (`11b9416c…:2`).
- **18 blanks** (18,000 sats).
- **99,999,300 FT** of `bc607a96…` (`4f49c1cb…:3` 99,999,000 + `ec31a41c…:2`
  300). The pool holds 700 FT; total 100,000,000.
- **The next lock is NOT fundable as it stands.** `pool-refill-role2.mjs`
  checks `inSats >= fixed + 2,400` where `inSats = plain[0] + blanks[0] +
  blanks[1]`; a transfer has `fixed = 30,000`, so 32,400 sats are needed and
  wallet A has 4,523. Recover sats first:
  `wallet-consolidate.mjs`, `blank-sweep.mjs --count N`, and
  `token-sats-recover.mjs --min-value 60000 --count 1` (wallet A also holds
  seven 20M tPUSD demo UTXOs at 60,000 sats each; burning one is **DEMO ONLY**).

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
- **3-out blanks** — the Nito user needs two blanks of the `bc607a96…`
  category. Wallet A has 18; the 3-out vending machine is not loaded (the
  2-out vending `aa206b51…` is category-specific and not valid for the 3-out
  category). The 3-out guard is `aa20e33c…`.
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

1. **Nito 3-out UI / blanks / browser acceptance** (see §3.6). This is the
   final 3-out client step; `walletProverCompatible` stays false until it
   passes.
2. **v3 core** — deposit path (0-in/2-out onboarding), real nullifier set
   (Merkle membership), encrypted note delivery (NIP-44/Nostr or dedicated).
   All are design/UNMEASURED (see `docs/ROLE2-3OUT-V3-DESIGN.md` §3).
3. **Gate 7 MPC → mainnet**, then migrate the Hush 750,000/762,400 notes and
   the wallet A notes into the 3-out pool. The 3-out demo is 1-of-1 and not
   mainnet-ready.
4. **Wallet A sats recovery** before the next lock (see §1).
5. **Flux owner update** — image `d8495fa…`.

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

- The Nito 3-out UI pool selector and 3-out blank acquisition.
- The Nito 3-out browser acceptance (so `walletProverCompatible` is false).
- The deposit path (onboarding), the real nullifier set and encrypted note
  delivery (the v3 core).
- Gate 7 MPC and the mainnet deployment.
- Migration of the Hush 750,000/762,400 notes and the wallet A notes.
- The Flux owner update for the site image `d8495fa…`.

Do not claim any of the above as complete.
