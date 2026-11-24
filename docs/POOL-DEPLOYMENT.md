<!-- POOL-DEPLOYMENT.md -->

# Path A Pool Deployment Runbook — a shielded pool for ANY CashToken

**Audience:** HushYourMoney team. **Purpose:** keep the project *ready* to deploy a
new per-asset shielded pool (Path A) on demand — no specific second asset is
pre-selected (user directive).

**Verification status (per AGENTS.md documentation standards):**
- ✅ VERIFIED LIVE this session (SSH on `runner`): every path, artifact, size,
  circuit statistic, and key encoding cited below.
- ✅ EXECUTED 2026-10-30 (Gate 1): the per-op pipeline (§6–§8) was run end-to-end
  by this team — witness gen → Groth16 prove (16.967 s) → verifier steps → tx
  build → 7/7 VM-eval pass → broadcast → confirmed in chipnet block 330142
  (tx `3e21097c212a3821fa186623eb38b1e785f9fca544e57f3f4562bdd0c6615e78`, 36,784 B).
- ✅ EXECUTED 2026-11-01 (Gate 3): a fresh DEPLOY from scratch (§4–§5) — new
  CashToken category `98690dba09831a8099613ba2eb4cbe12fffa53739bdfce4978e311032a85b153`
  (genesis tx `097619e8…6166`), pool covenant live at
  `aa207c0c15fbdc14dda43fb0540846e065a1bbd4076e7ab64720e64c3ecd3515208087`
  (deploy tx `090bce9f…14e9`), first on-chain-verified SHIELD of 1,000,000 units
  (tx `f5927a0b…7426`), all confirmed in chipnet block 330438. Pool state NFT
  verified byte-for-byte against the generated meta. First registry entry:
  `/home/ubuntu/zkb/cashscript/pool-registry.chipnet.json` on the runner.

---

## 0. The one-paragraph picture

A new asset pool is **not new cryptography**. The compiled circuit
(183,472 constraints), the verifying key (`ic.length = 3` ⇒ 2 public inputs), and
the covenant bytecode (222 B) are **shared by every asset**. A new pool is:
(a) one 32-byte constructor argument (the asset's CashToken category),
(b) one deploy transaction creating the pool UTXO + genesis state NFT,
(c) proofs whose witnesses carry the category as two 128-bit big-endian limbs
(`catHi`/`catLo`). **No new trusted setup.**

### Figure 1 — shared vs. per-asset components

```
        SHARED (identical for every asset)              PER-ASSET (per pool)
 ┌───────────────────────────────────────────┐   ┌──────────────────────────────┐
 │ circuit  build256/pool.r1cs               │   │ ctor arg: assetCategory      │
 │          183,472 constraints (verified)   │   │ pool P2SH32 address          │
 │ vk       build256/verification_key.json   │   │ state NFT {root, nullifiers} │
 │          ic.length = 3 (verified)         │   │ note tree + nullifier set    │
 │ zkey     build256/pool_final.zkey         │   │ anonymity set                │
 │ covenant 222 B bytecode (artifact)        │   │ registry entry               │
 └───────────────────────────────────────────┘   └──────────────────────────────┘
```

---

## 1. Prerequisites (verified live)

| Item | Verified value | Evidence |
| ---- | -------------- | -------- |
| Runner access | `ssh runner` → `ubuntu@runner`, x86_64 | `RUNNER_OK` this session |
| Node runtime | `/home/ubuntu/node24/bin/node` = **v24.22.0** | `node --version` on runner |
| snarkjs PATH gotcha | non-interactive SSH has **no `node` in PATH** — run `export PATH=/home/ubuntu/node24/bin:$PATH` first | observed failure `exec: node: not found`, then success |
| `VERIFIER_DIR` | `export VERIFIER_DIR=/home/ubuntu/zkb/bench-pusd` — MANDATORY before `produceTransaction`/VM-eval (handoff §4.1, #1 silent-failure cause) | dir listing on runner |
| Circuit | `build256/pool.r1cs` = 39,203,344 B; **bn-128, 183,472 constraints, 2 public inputs, 107 private inputs, 181,959 wires** | `snarkjs r1cs info` on runner |
| Proving key | `build256/pool_final.zkey` = 97,716,042 B (Oct 20) | `ls -la` on runner |
| Verifying key | `build256/verification_key.json` = 3,110 B; **protocol groth16, curve bn128, ic.length = 3** | node one-liner on runner |
| Browser proving artifacts | `artifacts/pool.wasm` = 3,608,972 B + `artifacts/pool_final.zkey` = 11,586,903 B (see §12 size-mismatch note) | `ls -la` on runner |
| Covenant artifact | `artifacts/asset-pool.artifact.json` = 16,029 B | `ls -la` on runner |
| Deploy script | `/home/ubuntu/zkb/cashscript/deploy-pool.mjs` (107 lines); usage: `node deploy-pool.mjs <privateKeyHex> [artifact.json] [--dry]` | script source on runner |
| `produceTransaction` | `/home/ubuntu/zkb/groth16_cashscript/chunked/bn254/densless-msm/transaction.mjs` (2,916 B) | `ls -la` on runner |
| Broadcast endpoint | `wss://chipnet.bch.ninja:50004` (chipnet PRIMARY, user directive 2026-11-11); `wss://chipnet.imaginary.cash:50004` (FALLBACK ONLY — user directive 2026-11-13: imaginary.cash is never a primary resource) | handoff §4.3 + directive |
| Chipnet stand-in mint key (test-only) | `/Workspace/apecsdev/.secrets/pusd-pool-chipnet-mint.json` | handoff §3 |

---

## 2. Step 0 — pick the network and the category

- **Chipnet (testing):** mint a fresh stand-in category with a new genesis tx (the
  PoC's FIRST deploy used category
  `479aeebabc682ddb90a3671bffd2a0bd918737de13f19a92231ed36a8580cc11`, genesis tx
  `4257dbfb68540cc9afcf569da8e651790c82d3951bdff88f5232a372760ba977`, block 328616).
  **CORRECTION 2026-10-30:** the CURRENT live Option B pool uses category
  `8c73ff150fbc5d1599d2de187c3382c5926cc5c9c2621cdc2cac1fc14cd93144` (from
  `/home/ubuntu/zkb/cashscript/deploy-meta2.json`; BE-limb split verified against
  `meta-xc.json`). `479aeeba…` survives only in the earlier deploy + test fixtures.
- **Mainnet (later):** any existing CashToken category. Mainnet requires a full MPC
  trusted setup first (AGENTS.md hard rule; PoC used a disclosed 1-of-1).
- **Output:** `CAT_DISPLAY` — the category as 64 hex chars in display (big-endian)
  order.

---

## 3. Step 1 — encode the category (VERIFIED worked example)

The circuit takes the category as **two 128-bit big-endian limbs**; the covenant
takes it as a **byte-reversed** constructor push. Two different encodings, both
verified:

### Figure 2 — category encodings (worked on the chipnet stand-in)

```
CAT_DISPLAY (BE hex, 64 chars)
  479aeebabc682ddb90a3671bffd2a0bd918737de13f19a92231ed36a8580cc11
  ├────────────── hi 128 bits ──────────────┤├───────────── lo 128 bits ─────────────┤

CIRCUIT WITNESSES (decimal, verified == runner meta256.json):
  catHi = int(hex[0:32], 16) = 95179643425176413870095452523059126461
  catLo = int(hex[32:64],16) = 193440152592067578558786274729593457681

COVENANT CONSTRUCTOR ARG (deploy-pool.mjs line 21):
  catOnchain = Buffer.from(CAT_DISPLAY, "hex").reverse()   // 32 bytes, reversed
```

One-liner to compute limbs for a new category (run anywhere):

```bash
python3 -c "
cat = '<CAT_DISPLAY>'
print('catHi =', int(cat[:32], 16))
print('catLo =', int(cat[32:], 16))"
```

---

## 4. Step 2 — instantiate the covenant → P2SH32 address

Verified construction (from `deploy-pool.mjs` lines 18–25):

```js
const artifact = JSON.parse(readFileSync(ARTIFACT, "utf8"));
const CONTRACT_BYTECODE = hexToBin(artifact.debug.bytecode);          // 222 B, asset-identical
const catOnchain = Buffer.from(CAT_DISPLAY, "hex").reverse();         // ctor arg byte order
const redeem = Buffer.concat([Buffer.from(encodeDataPush(catOnchain)), CONTRACT_BYTECODE]);
const poolHash = hash256(redeem);
const poolLocking = Buffer.concat([Buffer.from([0xaa]), Buffer.from(encodeDataPush(poolHash)), Buffer.from([0x87])]);
// => P2SH32: OP_HASH256 <push 32B hash> OP_EQUAL
```

### Figure 3 — pool address construction

```
redeem script  =  <push catOnchain[32]>  ‖  covenant bytecode (222 B)
                      │ per-asset                 │ shared, unchanged
                      ▼                           ▼
pool locking   =  0xaa (OP_HASH256) ‖ <push hash256(redeem)> ‖ 0x87 (OP_EQUAL)
                      └─────────────── P2SH32 ───────────────┘
```

---

## 5. Step 3 — genesis state NFT + the deploy transaction

Verified genesis constants (from `deploy-pool.mjs` lines 28–31):

```js
// depth-20 Poseidon zero tree, 32-byte LE VM-number form
const GENESIS_ROOT_LE = hexToBin("3e1f1922dfb671d3f912f7ea461e0a88ee848fdde12b6c18ab1ad2c56ae73421");
const NULL_HASH = Buffer.alloc(32, 0);
const GENESIS_COMMITMENT = Buffer.concat([GENESIS_ROOT_LE, NULL_HASH]); // 64 bytes
```

### Figure 4 — deploy tx shape (verified from `deploy-pool.mjs` outputs)

```
inputs : [0] token UTXO (category, FT_AMOUNT = 100,000,000, minting NFT)
         [1] plain funding UTXO                    (both P2PKH, Schnorr 0x41)
outputs: [0] POOL UTXO — poolLocking, dust 1000 sats,
             token { category, amount: 100,000,000,
                     nft: { capability: "mutable", commitment: GENESIS_COMMITMENT } }
         [1] change → MINT_LOCKING
         [2] minting NFT returned → MINT_LOCKING   (capability retained for tests)
fee    : 2000 sats
```

**Seeded-root note.** After deployment the PoC recorded a *seeded* tree state in
`seed256.json` (verified contents: `c0`, `c1`, `seededRoot`, `seededRootLE =
2c0f5336…4525`) — the root after two genesis commitments are inserted. The deploy
uses the **zero-tree** root; the seeded root emerges from the first insertions.
`seed-root.mjs` exists on the runner (presence verified; internals not yet read).

---

## 6. Step 4 — generate operation inputs and proofs

1. Generate circuit input + meta (pattern: `gen-input.mjs`, verified present and
   referencing the stand-in category). Meta format verified from `meta256.json`:
   `merkleRoot, actionHash, newMerkleRoot, nf0, nf1, cm0, cm1, catHi, catLo`.
   **Set `catHi`/`catLo` to the NEW category's limbs (Step 3).**
2. Prove (remember the PATH gotcha):

```bash
export PATH=/home/ubuntu/node24/bin:$PATH
cd /home/ubuntu/pusd-shielded-pool
./node_modules/.bin/snarkjs groth16 prove build256/pool_final.zkey witness.wtns proof-<tag>.json public-<tag>.json
```

3. Proof-reuse rule (handoff §5): proofs bind only to (vk, public inputs) —
   reusable across redeployments; double-spend protection is the on-chain
   nullifier set, never proof "freshness."

---

## 7. Step 5 — produce the on-chain verifier steps

```bash
export VERIFIER_DIR=/home/ubuntu/zkb/bench-pusd   # MANDATORY (handoff §4.1)
# produceTransaction(vk, proof, publicSignals) → <tag>-steps.json
#   /home/ubuntu/zkb/groth16_cashscript/chunked/bn254/densless-msm/transaction.mjs
```

⚠️ **Layout-drift gotcha (handoff §4.4):** the emitted locking-bytecode layout
depends on the repo state at generation time, *not* on the proof. Regenerate steps
after any toolchain update — the proofs themselves stay valid.

---

## 8. Step 6 — build, VM-evaluate, broadcast, confirm

Reference builders (verified present): `build-multi-optB.mjs` (3-transfer chain),
`build-t2-real.mjs` (single transfer, Option B), `bc3.mjs`, `sameblk.mjs`.

Per handoff §4.3–§4.4:
1. Assemble the 6-input/7-output tx (Figure 5).
2. **VM-evaluate EVERY input** with `createVirtualMachineBch2026`; throw on any `error`.
3. Schnorr-sign the funding input (`0x41` = SIGHASH_ALL|FORKID).
4. Broadcast via `blockchain.transaction.broadcast` (chipnet PRIMARY `wss://chipnet.bch.ninja:50004`; fallback `wss://chipnet.imaginary.cash:50004`).
5. Confirm via `blockchain.transaction.get [txid, true]` (confirmations / blockhash).

### Figure 5 — one pool op = one BCH tx (~36.8 KB observed per transfer)

```
in 0: pool covenant UTXO — 222 B redeem, ~66k op-cost (~2.5× under budget)
in 1–3: EXEC verifier steps ┐ the Groth16 verifier = 35,626 B total,
in 4: GENESIS step          │ ~5,909 B / ~5.65M op-cost on genesis input
in 5: TERMINAL step         ┘ (per-input budget: (41 + unlockingLen) × 800, max ≈ 8,032,800)
in 6: funding P2PKH (Schnorr)
out 0: pool covenant (NEW state NFT: newMerkleRoot + 2 nullifiers)
out 1–5: verifier steps re-created      out 6: change / public payout
```

---

## 9. Step 7 — register the pool (PROPOSED manifest schema)

⚠️ The proposal below predates the implemented registry: the live manifest is `pool-registry.json` at the repo root (version 1, updated 2026-11-22).

```json
{
  "version": 1,
  "pools": [
    {
      "network": "chipnet",
      "assetCategory": "<CAT_DISPLAY>",
      "poolLockingHex": "<P2SH32 locking bytecode hex>",
      "deployTxid": "<txid>",
      "genesisRootLE": "3e1f1922…73421",
      "verifyingKey": {
        "path": "build256/verification_key.json",
        "protocol": "groth16", "curve": "bn128", "icLength": 3
      },
      "anonymitySet": { "noteCount": 0, "updatedAt": null }
    }
  ]
}
```

---

## 10. Definition of done (per new pool)

- [ ] Deploy tx confirmed; pool UTXO carries the mutable NFT with the genesis commitment
- [ ] SHIELD, TRANSFER, UNSHIELD each confirmed on the target network
- [ ] Every input of every tx VM-evaluated clean **before** broadcast
- [ ] Registry manifest entry written; vk fingerprint matches `build256/verification_key.json`
- [ ] This document updated with the new txids / block heights

## 11. Gotchas (verified — each one has cost real time)

1. **Scripthash** = SINGLE SHA-256 of the locking script, byte-reversed (not double-SHA).
2. `blockchain.address.listunspent` / `get_balance` **hide token UTXOs** unless
   `include_tokens` / `tokens_only` is passed.
3. Spending a token UTXO requires `sourceOutputs[i].token` set in libauth — else
   **NULLFAIL** at broadcast.
4. `VERIFIER_DIR` unset ⇒ wrong verifier layout / missing vk (silent failure).
5. Non-interactive SSH: `node` not in PATH — export `node24/bin` first.
6. Verifier step layout drifts with repo state — regenerate steps, keep proofs.
7. Fee probes on the **unsigned** size undersize ~70 B per input — probe with 100 B
   placeholder unlockings, or the broadcast lands below the relay floor (§13).
8. BCH txid = double-SHA256 of the **full signed** tx; libauth `hash256` is already
   the double-SHA — call it once (§13).

## 12. Known discrepancies and disclosures

- **Handoff §6.2 referenced `deploy-meta*.json` — RESOLVED 2026-10-30.** The files
  exist in `/home/ubuntu/zkb/cashscript/` (`deploy-meta.json`, `deploy-meta2.json`,
  `deploy-meta-s1.json`), not in the pool workdir. `deploy-meta2.json` is the
  current Option B record (txids, category, verifier funding outpoints;
  `seededRootLE = 2c0f5336…4525` matches `seed256.json`). **Stale field:** its
  `poolLocking` (`aa206f45…`) was computed from an older artifact revision — the
  locking recomputed from the CURRENT artifact `/tmp/ap8B.json` + category is
  `aa20a458f7790da8…de987` (matches txC vout0 on-chain). Always recompute the pool
  locking from the artifact you will actually deploy/spend with (Figure 3).
- **zkey size mismatch:** `artifacts/pool_final.zkey` = 11,586,903 B (Oct 17) vs
  `build256/pool_final.zkey` = 97,716,042 B (Oct 20). UNVERIFIED why they differ;
  treat `build256/` as canonical for proving (matches the 183,472-constraint r1cs).
  **Confirmed 2026-10-30:** a proof made against `build256/pool_final.zkey` passed
  on-chain verification (Gate 1, block 330142).
- **CIRCUIT-DESIGN.md describes the older 7-public-input plan** (assetCategory as a
  pinned public input). The shipped Option B design uses **2 public inputs**
  (verified live: r1cs `# of Public Inputs: 2`, vk `ic.length = 3`) with
  assetCategory as a private witness.
- **Per-op pipeline executed 2026-10-30 (Gate 1).** A 4th chained TRANSFER (`xd`)
  was run end-to-end by this team and confirmed in chipnet block 330142
  (tx `3e21097c212a3821fa186623eb38b1e785f9fca544e57f3f4562bdd0c6615e78`;
  explorer: `https://explorer.selene.cash/tx/3e21097c212a3821fa186623eb38b1e785f9fca544e57f3f4562bdd0c6615e78?network=chipnet`).
  Reproduction scripts (1:1 copies of the PoC scripts): `gen-xd.mjs`, `prove-xd.mjs`
  in `/home/ubuntu/pusd-shielded-pool/`; `gen-xd-steps.mjs`, `build-xd.mjs`,
  `preflight-xd.mjs`, `bc-xd.mjs` in `/home/ubuntu/zkb/cashscript/`. New live tip:
  txD out0 (notes = leaves 14,15 = 500k+250k under toy keys in `input-xd.json`;
  change UTXO now holds only 3,000 sats — refuel before any further op).
  **A fresh DEPLOY (§4–§5) remains unexecuted by this team** — that is Gate 3.
- **snarkjs non-termination (added 2026-10-30):** `prove-multi.mjs`-pattern scripts
  print their final line but do not exit (event loop kept alive). Wrap in
  `timeout` or add `process.exit` when scripting. Measured `fullProve` for the
  183,472-constraint circuit on the runner: **16.967 s**.
- **Circuit compile parity VERIFIED 2026-11-01 (Gate 2).** circom 2.2.3 recompile
  of `circuits/pool.circom` (default --O2) reproduces `build256/` byte-for-byte:
  r1cs sha256 `b66d9d61d9ba4dfde298ac84650afe8624cb6082877dbd47dff93c74902fc8d6`,
  wasm `8595b43409370c83f371e16408cde85d88382f6fa66f406404071fb38efa7a48`, sym
  `f2e843f6a9eadb460936833288ab7fd4456cdadc3e34968277a38e812cbef009`. The trusted
  setup therefore binds EXACTLY the reviewed source — no hidden compiler drift.
- **Pool-op input layout (added 2026-11-01, learned from a failed Gate 3 build):**
  the Option B artifact (`/tmp/ap8B.json`) + current `produceTransaction` steps
  expect **pool at input 0, verifier steps at inputs 1–5** (the layout of
  `build-multi-optB.mjs`). `build-s1.mjs` (pool at input 5, steps at 0–4) was
  written against the OLDER artifact `/tmp/ap8.json`; that layout FAILS VM-eval
  (`OP_VERIFY`) on every script input when used with ap8B. Always mirror
  `build-multi-optB.mjs` for ap8B builds, and always VM-eval every input before
  broadcast — the eval caught the mismatch offline, at zero cost.
- **Genesis recipe (added 2026-11-01, Gate 3):** a new category needs a UTXO at
  outpoint index 0 to spend (CHIP-2022-02); if none exists, self-send first
  (Gate 3 used a 219 B prep tx). Genesis tx: vout0 minting NFT (empty commitment),
  vout1 full FT supply, vout2 change; new category = the PREP txid. Deploy then
  spends genesis vout0–2 (NFT + supply + sats) — one tx, 971 B, fee 2000 sats.

---

## 13. chipnet-pusd-v2 — runner-independent Path-A pool (2026-11-22, DEPLOY VERIFIED LIVE · **NOT SPENDABLE**)

Deployed by the nito.cash team from `apps/web/scripts/deploy-pool.mjs`, using the
wallet-committed verifying key (GitHub Release `proving-assets-v1` lineage), **not**
the recovered runner key. Registry entry: `pool-registry.json` → `chipnet-pusd-v2`.

| What | Value |
| ---- | ----- |
| Category anchor tx (= the category) | `050b5934bea9a7713e842371d8fb233b14f5596b7339fcbf8c1c7dac58c504a9` |
| Mint tx (minting NFT + 100,000,000 FT) | `a3e90020be9924f4a6400b922c651d69ce0005941922b7f4f62331c781decc02` |
| Deploy tx (pool UTXO + 5 verifier steps) | `53014fd4749ff205795e288689e12316a1497e09fc6a97bcfaa38360206766da` |
| Pool covenant locking (P2SH32) | `aa20e6b3af9822cdaf8d2c0744bdf51e7d61b8edd280820f661b8641d3c9844d585587` |
| Genesis tree root (LE) | `551108f63731bcc628dda2697d70219d103a8c1bf203f2d4aaec6bbea5b4510f` |
| Pool CashAddress | `bchtest:p0nt8tucytx6lrfvqaztmag704sm3mwjszpq7esmseqa8jvyf4v92g7pntldw` |
| Setup grade | committed 1-of-1, published entropy |
| Wallet compatibility | **`false`** (corrected 2026-11-23 — see “Wallet compatibility” below) |

Verified on chain 2026-11-22 (Fulcrum `chipnet.bch.ninja:50004`, protocol 1.5):
deploy confirmed at block **343322** (88 confirmations at probe); pool UTXO vout 0
carries category `050b5934…`, amount `0`, and a **mutable** NFT whose commitment is
the genesis root LE followed by 32 zero bytes. The 100,000,000 FT supply sits at
deploy vout 6 (P2PKH), not under the covenant. Two **public** bootstrap seed notes
(value 0, nk=1) let any wallet open its first action.

### Deployment rules this run had to discover (each cost a rejected broadcast)

1. **The mint MUST spend the anchor's vout 0.** The category equals the anchor txid,
   and the mint must spend `out[0]` of that tx. Spending `out[1]` (same txid) is
   rejected with `bad-txns-token-invalid-category (16)`. Our known-good mints follow
   this (`097619e8` spends `98690dba:0`), but the runbook did not state it.
2. **Genesis NFTs are MINTING-capable with EMPTY commitments.** A genesis output that
   attempts a mutable NFT with a commitment is rejected with the same error; the
   pool's mutable state NFT is created by SPENDING the minting NFT in the deploy.
3. **Fee probing on the unsigned size undersizes ~70 B per input.** At 1 sat/B the
   result lands below the relay floor. Probe with 100 B placeholder unlockings
   (`build.js` convention).
4. **BCH txid = double-SHA256 of the FULL SIGNED tx.** libauth's `hash256` is already
   the double-SHA — call it once; two calls produce a wrong txid.

### Wallet compatibility — CORRECTED 2026-11-23

**`chipnet-pusd-v2` is NOT spendable. `walletProverCompatible` is `false`.** The
expectation recorded here on 2026-11-22 (“the first pool with
`walletProverCompatible: true` — the shield/transfer/unshield flows work with no
further code change”) was wrong, and the gate was misattributed to the runner's
witness-encoding revision. It was the **verifier program's transaction layout**.

What was deployed: v2's five step UTXOs lock to the **five-input fixture** program
(nito.cash `verifier-program.js` → `WALLET_STEP_LOCKINGS`; the naming in that file is
inverted relative to `STEP_LOCKINGS`). That program's terminal redeem pins
`OP_TXINPUTCOUNT == 5` and `OP_INPUTINDEX == 4` (byte patterns `c35588` and `c05488`),
and its exec/genesis redeems read input 3 as the genesis witness. Every wallet action
emits **7** inputs in the covenant-at-input-0 shape, so **no action can ever satisfy
those scripts, whatever the proof.**

Verified on chain 2026-11-23 (Fulcrum `chipnet.imaginary.cash:50002`, tip 344661):

- the pool UTXO is **still the deploy output `53014fd4…:0`**, unspent since block 343322;
- the covenant scripthash history holds **exactly one entry — the deploy**. Zero actions
  in ~1,340 blocks;
- v2's on-chain step lockings (`aa20a1d2912b…` ×3, `aa200b704cc3…`, `aa206c2e6d3c…`)
  hash-match `WALLET_STEP_LOCKINGS` byte-for-byte.

The gate3 and mainnet pools remain gated on the runner's witness-encoding revision
(`apps/web/scripts/pool-accept.mjs` in nito.cash is the byte-exact acceptance gate) —
that is a **different, still-open** gate, and it is not what stopped v2.

**Spendable successor: §14** (same verifying key, same seeded tree, generalized program).

---

## 14. chipnet-pusd-v4-covenant0 — the covenant-at-input-0 shape (2026-11-23, VERIFIED ON CHAIN, SPENDABLE)

Deployed by the nito.cash team (repo commit `61cef0b`) as the fix for §13: the same
wallet-committed verifying keypair (`proving-assets-v1` lineage) and the same two
public bootstrap seed notes, with the verifier program **generalized to the final
transaction shape**. Registry entry: `pool-registry.json` → `chipnet-pusd-v4-covenant0`.

| What | Value |
| ---- | ----- |
| Category anchor tx (= the category) | `0d31da753c6855b830ea683ac11552404139008bfbfac97801fe30d31a42d664` |
| Mint tx (minting NFT + 100,000,000 FT) | `a5d251e4146dbb887afc185c712007ba578d9766f81b7fd95df406cc1e36a906` |
| Deploy tx (pool UTXO + 5 verifier steps) | `efd3314edb42bddd7f7438be5dfba5ffd3da378ab13082610edd68426f38357c` |
| Deploy block | **344638** (24 confirmations at probe 2026-11-23; tip 344661) |
| Pool covenant locking (P2SH32) | `aa209dd6f6ef70c453134afd0f13f3a1aff6b9507576c97fe1649ba5aaa06abaa15587` |
| Genesis tree root (LE) | `551108f63731bcc628dda2697d70219d103a8c1bf203f2d4aaec6bbea5b4510f` (identical to v2) |
| Step lockings | `aa20f8c0031d…9c87` ×3, `aa205f95d0d7…b287`, `aa20866e4f0a…e487` |
| Setup grade | committed 1-of-1, published entropy |
| Wallet compatibility | **`true`** — two confirmed wallet-originated actions |

### The shape every action now uses

```
inputs:   in[0]  covenant (continuity UTXO + state NFT)
          in[1]  exec0      in[2] exec1      in[3] exec2
          in[4]  genesis    in[5] terminal
          in[6]  funding (exactly one P2PKH Schnorr input)

outputs:  out[0] continuity (NEW state NFT: rootLE ‖ nullifierSetHash, 64 B)
          out[1] exec0   out[2] exec1   out[3] exec2   (re-created in program order)
          out[4] GENESIS   out[5] TERMINAL
          out[6] NP01 carrier (the recipient's encrypted note; transfers only)
          out[7] BCH change
```

### Verified on chain (2026-11-23)

- **Deploy** `efd3314e…` — 3 in / 8 out, 903 B. vout0 = pool UTXO: category
  `0d31da75…`, amount 0, **mutable** NFT commitment = `551108f6…` (root LE) ‖ 32 zero
  bytes — byte-identical to v2's genesis commitment. vout6 = 100,000,000 FT (P2PKH).
  vouts 1-5 = the five step UTXOs, locking to the generalized program above.
- **SHIELD** `43ca7bca59d35790e104a6c368dd1168a6fceae3eb5efa4d3a5d02ddb9f92e4d` —
  block **344641**, 7 in / 8 out, 37,877 B. vout0 commitment advanced to
  `26899c87…d093`; vout6 = 19,999,000 FT public change.
- **TRANSFER** `fdd2981d2ceed10099941b9228f53a59020c2a4039581f98614038de1bf97b8b` —
  block **344646**, 7 in / 8 out, 37,978 B. vout0 commitment advanced to
  `7ee11962…61f8`; vout6 = **0 sats** (the encrypted note carrier); vout7 = 56,022 sats
  change. The pool's current UTXO is `fdd2981d…:0`.
- **Redeem lengths on both actions** — in0 covenant **347 B**, in1-3 exec **574 B**,
  in4 genesis **6044 B**, in5 terminal **4415 B**, in6 P2PKH funding 33 B. These match
  the program's declared layout exactly, so the on-chain actions and the published
  program are the same artifact.

### Constraints this shape imposes (design consequences, not bugs)

1. **Exactly 7 inputs.** The pin lives in the **terminal step** redeem
   (`c35788` = `OP_TXINPUTCOUNT OP_7 OP_EQUALVERIFY`, then `c05588` = `OP_INPUTINDEX
   OP_5 OP_EQUALVERIFY`), *not* in the covenant. The 347-B covenant redeem contains no
   `OP_TXINPUTCOUNT` at all — it is shape-agnostic and reusable.
2. **One funding input, therefore one fee source.** No second input for a CPFP top-up
   and no batching of independent pool actions into one tx. The fee must be sized from
   the single funding UTXO, and change can only go to out[7].
3. **The program is VK-specific.** `vkx-msm.mjs` bakes `FINAL = vk.ic[0] − [2^64]G`
   into the genesis and terminal redeems, so the five step scripts must be regenerated
   for any new verifying key. They are **not** category-bound: v2 and v4 share one VK
   lineage across two different categories.
4. **Genesis input is proof-marginal.** The reported spare budget is ≈125 B ≈100k op;
   the bench's own test proof exceeds it while typical wallet-fresh proofs do not. A
   valid proof can therefore fail to spend. UNMEASURED here — not re-verified by this
   team; if it holds, the genesis pad should be widened before mainnet.

### Why the earlier attempts failed — the hidden dispatch

The verifier is split across five inputs; three executors each load an **assembled
shared program** carried as data in their witnesses, hash it, define it as function
`100`, and invoke it at runtime. The input layout is therefore baked into **three**
layers, and only the first is visible in a disassembly of the redeems:

1. **the redeems** — fragment-read indices, the genesis-input defs read, the executor
   k-branch (`k==1/k==2 → k==2/k==3`, `next 1,2,4 → 2,3,5`), the terminal self-index
   `4→5`, the UTXO checks `0-3→1-4`;
2. **the msmA/contract generator sources** — the state-push pin index, `genIdx`, the
   exec0 header read;
3. **the assembled shared program's own `main`** (in `densless-recovered/shared.mjs`) —
   a `k < 3` guard, **fourteen** k-comparison sites (including a first-executor flag and
   an adapter-path gate at `0x17 OP_PICK`/`OP_ROLL`, both gated `k==0`), and **seven**
   `readBoundedInputSlice` input indices (`0,1,2,3,4 → 1,2,3,4,5`).

Layer 3 is **invisible to byte comparison**, because the fragments are witness data:
two builds look “identical” and the dispatch only exists at runtime. This is why the
first four attempts failed on chain while every static diff came back clean.

**Research-relevant consequence:** a shielded pool's on-chain scripts are a *loader*,
not the constraint system. Static review of a deployed pool's locking bytecode cannot
tell you which transaction shape it accepts. Reproducible generator source
(`nito.cash/apps/web/scripts/generalize-bench-source.sh`, 30 size-preserving edits across
five files) is a **review requirement**, not a convenience.

### Acceptance method used (and worth adopting)

1. Build witnesses with the bench's own `produceTransaction`.
2. Assemble a **synthetic 7-input transaction** (covenant at 0, steps 1-5, funding 6) and
   evaluate it on the **BCH-2026 VM** — every input must pass. The synthetic run failed
   *identically* to the wallet's real transaction, which exonerated the wallet port and
   isolated the program.
3. Trace-bisect (fixture control vs generalized, value-stream diff) located the last two
   missing gates when 4 of 5 inputs already passed.
4. Capture the wallet-built action pre-broadcast, evaluate **7/7 on the VM**, and only
   then broadcast.

Step 2 is the one that mattered: a failure that reproduces in the harness is a bug in
**our** artifact, not in the counterparty's integration.

## 15. chipnet-role2-pool — the pool rules INSIDE the sound verifier (2026-11-24, DEPLOYED, FULL LIFECYCLE CONFIRMED)

The successor to every pool above: the reviewed `bch-groth16-bn254-sound-native` verifier
with the covenant logic running as a role-2 HOOK inside the program — no separate covenant,
no 5-UTXO step fleet. Deployed runner-free (user directive 2026-11-24: the runner is out of
scope; all materials on the apecsdev VM), under OUR solo-ceremony VK (zkey sha256
`4a4e2543…`, VK sha256 `05250429…`, wasm `8595b434…` — hash-verified against the ceremony
records before deployment).

**The 3-tx chain, all confirmed in block 345,413:**
- ANCHOR `b6ee4196da1b0e3d548a03ea86a63d61445cd38d74300b2f7a8725eea05ceb72` — its txid IS
  the new category. (No BN254-range retry needed: our circuit takes the category as two
  128-bit limbs, always field-legal — unlike the wallet's single-field form.)
- MINT `48d458b86bd59e33be59e4c8015820272c69df586920818005b86c04a6dbd538` — minting NFT
  (empty commitment) + 100,000,000 FT, all outputs to the funding wallet.
- DEPLOY `f8f215c3826b763805c71f0ee281b406cfa2e0d944f541dfdc3ae56e473b3319` — spends the
  mint outputs; creates the pool state NFT at :0 (mutable, commitment = the PUBLIC bootstrap
  root LE `551108f6…510f` ‖ 32 zero bytes — our seed derivation reproduces the v2/v4
  on-chain genesis commitments byte-for-byte), the op-1 FT deposit (1,000,000) and one fuel
  UTXO at the program locking, the 99M FT supply back to the wallet.

**The program, rebuilt for the real category:** code 7,737 B sha256 `0e827602…`, redeem R
65 B, pieces 3,981/3,756, P2SH32 locking
`aa20cd37fe80b308ae414c2d342dae482256548f7280918b4b1946057f1b631d4acd87`.

**The action shape (this is the big difference from §14):** 3 inputs, all spending the one
program P2SH32 — in0/in1 fuel or FT-deposit UTXOs, in2 the state NFT (its FT amount IS the
balance). SIGNATURE-FREE: the script satisfaction is the authorization; `TXINPUTCOUNT == 3`
is pinned by the verifier's graph, so there is NO funding input and no fee input — each
action's fee is prepaid by a wallet LOCK tx ("refill" in the tooling) that pre-creates the
fuel UTXOs. The eight transition fields the old covenant took as `spend()` arguments now
ride in a 169-byte OP_RETURN carrier (out0), which hook check 6 binds to the proof by
requiring SHA256(carrier limbs) == n1. `TXOUTPUTCOUNT == 2 + sign` pins the output shape.

**Lifecycle, all confirmed:** SHIELD 1,000,000 `582cefee…` (block 345,415) → lock
`de98e0df…` (345,417) → TRANSFER `17f1322b…` (345,423) → lock `fe9e1aad…` (345,426) →
UNSHIELD 250,000 `24cd6b42…` (345,427; the payout output executed). Every action: real
witness under our zkey, VM-ACCEPTED in consensus AND standard on all 3 inputs before
broadcast, FT conserved exactly. Final state: root `19318325…`, balance 750,000, notes at
tree 6,7. Explorer links: Selene primary
`https://explorer.selene.cash/tx/<txid>?network=chipnet`, fallback
`https://chipnet.chaingraph.cash/tx/<txid>` (NEVER `chipnet.imaginary.cash` — user
directive 2026-11-24).

**Funding ledger (user-clarified 2026-11-24):** funder = the APECS FAUCET HOT WALLET
`bchtest:qzmux3gx…` (`/Workspace/apecsdev/.secrets/faucet-hot-wallet.json` — the
operational float for the apecs-api Worker's `FAUCET_BCH_WIF`; NOT a public faucet service,
and NOT the hushyourmoney `chipnet-faucet.json` key `bchtest:qzk22…`, which held 0 sats and
was not used). It was the only funded chipnet wallet we hold runner-free (423,000 sats,
electrum-verified before deployment). Exact spend: **112,666 sats** (all chain fees + the
locked fuel the actions burned + the 10,000-sat state float that remains live on the state
NFT); the wallet keeps 310,334 sats, the 99M FT supply, and the 250,000 FT unshield payout.
The wallet address therefore shows as the sender of every SIGNED step (anchor, mint, deploy,
locks) because the mint's outputs all returned to it — the ACTIONS contain no wallet at all.

**Two caveats for whoever drives this pool next:**
1. **Author binding (user-surfaced):** actions bind no author — standing fuel/deposit UTXOs
   are consumable by any valid action between lock-confirmation and action-confirmation.
   Client rule: broadcast lock + action together (the action may spend the lock's
   unconfirmed outputs). Durable fix: deposit tagging (lock outputs carry an NFT commitment
   = H(nf0‖nf1); hook checks bind them to the carrier) — a hook revision that must pass the
   full build/red-team/sweep gates first.
2. **Client integration (nito.cash):** their wallet is committed to their own VK
   (`27f6ea03…`, PPOT-derived, committed in `public/proving/verification_key.json`) and
   builds the 7-input §14 shape; driving this pool needs their proving assets swapped to
   ours + the 3-role tx builder + off-chain note delivery (the pinned output count leaves no
   room for the old out[6] note-carrier). Their client is the user's final approval.

Tooling (committed in pusd-shielded-pool): `pool-deploy-role2.mjs`, `pool-op-role2.mjs`,
`pool-refill-role2.mjs` (bench dir), `role2-op-witness.mjs`, `role2-seeds.mjs` (repo root);
pool state file `/home/apecs/cov/role2-pool-state.json`. Registry entry: `chipnet-role2-pool`
in `pool-registry.json`. Full implementation record:
`pusd-shielded-pool/wip-role2-hook/STATUS.md`.
