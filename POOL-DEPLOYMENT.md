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
| Broadcast endpoint | `wss://chipnet.imaginary.cash:50004` (chipnet) | handoff §4.3 |
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
4. Broadcast via `blockchain.transaction.broadcast` (chipnet `wss://chipnet.imaginary.cash:50004`).
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

⚠️ PROPOSED — no registry implementation exists yet (roadmap step 3).

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
  explorer: `https://chipnet.imaginary.cash/tx/3e21097c212a3821fa186623eb38b1e785f9fca544e57f3f4562bdd0c6615e78`).
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
