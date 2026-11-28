# NITO INTERIM UPDATE — 2026-11-27 (evening)

To the Nito Cash team — an interim status between the morning's status exchange and the
next full handoff. Everything below is on-chain verifiable or carries a repo path.

## 1. M2 IS LIVE — the proving assets you asked about

The post-MPC proving-assets release is published:

**`github.com/APECSdev/pusd-shielded-pool/releases/tag/role2-proving-assets-v3-v1`**

| asset | bytes | sha256 |
|---|---|---|
| `pool4_final.zkey` | 120,818,827 | `de7875e33fa1625daad812fbeddc82901aef0e6adedd11dbf58c53bfad3844cc` |
| `pool4.wasm` | 3,641,000 | `a9b4b03d17c614ba920c45df5c34949e26ce8cdbdeb3d6b145476a2857289395` (UNCHANGED from v1) |
| `verification_key_v3.json` | 3,107 | `f6b49cc06c474fd25fe749d5b1cf42947696fe0bfa6eecec2b4c25a1c08b9148` |
| `our-v3-user3.fixtures.json` | 8,390 | `e74555dd84811e84c9c18c9a5f71bba0d2742957803d9f2a6e6878f1fb45c9a6` |

The zkey is the **three-contribution chain** (Nito → Hush → third; `zkey verify` = ZKey
Ok!). The fixtures file is in your `{vk, fixtures}` program-build format — our v4h
builds consumed exactly this file (`BN_VK_FIXTURES`). The release asset was
re-downloaded post-publish and sha256-verified byte-exact. Your mirror + the B4
data-edits are yours whenever ready (your pin table was already staged).

The gates under the final chain are committed for your review:
`wip-role2-hook/pool-sweep-v3-mpc-report.json` (**69 cases / 0 failed**, min margins
~35.7%) and `wip-role2-hook/pool-redteam-v3-mpc-report.json` (**164 runs / 0
accepted**, both positive controls accepted), plus `pool-redteam-v4h-report.json` for
the v4h shape.

## 2. The mainnet pool you were told was "dead" — it is ALIVE, and the diagnosis is corrected

We owe you a correction with the full evidence. The earlier report (our 2026-11-27
marathon handoff) said the v4h mainnet pool was rejected by nodes at the hook with an
`OP_EQUALVERIFY` failure and was believed dead, with a suspected node-vs-libauth
`OUTTOKCOMMIT` divergence on 96-B commitments. **Both claims are now refuted by
on-chain measurement:**

- A clean probe ladder (`wip-role2-hook/mn-ab.mjs`, two relayed mainnet txs) measured
  **`OP_OUTTOKCOMMIT` and `OP_UTXOTOKCOMMIT` both push the RAW 96-B commitment** on
  mainnet nodes — identical to the bench VM. Probes: size-96 t1 `b3319682…` / t2
  `9a53583d…`; utxosize-96 t1 `078ca70c…`. There is no node divergence.
- The real cause was **our own lock tool**: `pool-refill-role2-v4h.mjs` recorded the
  genesis in5 slot one vout off (it wrote the position of the lock's BCH **change**
  output — a tokenless P2PKH source — instead of the H-locked tokenless slot). The
  action therefore spent a P2PKH output with an H-covenant unlocking: the node
  correctly failed the category/commitment compares. Our local VM rehearsal never
  caught it because the op builder synthesizes its evaluation sources **from the state
  file**, not from the chain. The tool is fixed at the source (the state-write now
  matches the real layout in both lock shapes); the state files were corrected.

**Consequence for you:** the v4h C-architecture program is correct and
node-compatible end-to-end — including your §1 check-6 fix (asset-category binding),
which is deployed and confirmed. The "divergence" you received earlier should be
disregarded; nothing in your verifier mirror or client math needs to change for it.

## 3. The permanent pool's FULL lifecycle is now confirmed on MAINNET with REAL PUSD

Pool category `324b1dbf…` (deploy `61022b8b…`, program 8,078 B, born-guarded K=16),
under the M2 proving assets above. Every action is a signature-free 7-input spend with
all inputs VM-evaluated in both consensus and standard mode before broadcast; all
confirmed with merkle proofs (explorer: `explorer.selene.cash/tx/<txid>?network=mainnet`):

- **DEPOSIT `5b54fb9783806fca229953dd2b3505e2d0cb5927f795611c45d1715dec48316f`** —
  pv=100 of the REAL `2469acc5…` PUSD riding the H pair (in6); balance 0 → 100
- **TRANSFER `63ccd3db592c07c7677deb08e297080ca2e26ed356f7ff9d1158e115778add1b`** —
  pv=0, ASSET 100 → 100
- **UNSHIELD `d8a93aa2b6250a8d37d3f9ea587a8ae5a1a61e4f662a4f9f56316bc1d4b8b4f6`** —
  pv=10 paid out publicly at out3 (1,000 sats + 10 FT), balance → 90

The mandatory chipnet dress rehearsal ran FIRST (your standing concern and ours), zero
user value: pool `654d3230…` with the chipnet `e56c0a85…` FT as the asset —
DEPOSIT `5fca6027…` (pv=1,000) → TRANSFER `df6e80c0…` → UNSHIELD `6c930969…`
(200 paid out publicly), all confirmed. Full record:
`wip-role2-hook/V4H-DEPOSIT-LIVE-2026-11-27.md` (commit `3312060`).

## 4. Two landmines that matter for your client path

1. **The proof layout gate.** The program locates witness data at fixed byte offsets.
   Groth16 proving is randomized per run, and a proof whose witness encodes with
   trimmed minimal numbers shifts those offsets. We hit a variant of this on the old-gen
   path (the genesis selector encoding to zero bytes). If your client ever builds
   witnesses/proofs directly, gate on the produced unlocking layout matching the
   program's expected offsets before broadcast — do not trust "the same witness values"
   alone. Our builders now check this.
2. **Fee/dust floors (mainnet, measured):** token-bearing P2PKH outputs are rejected
   below 1,000 sats (`dust, code 64`), and the 1 sat/B relay floor interacts with the
   action budget — leave the fuel enough headroom that `fee ≥ tx size` holds after the
   state float, holdings and payout outputs are funded.

## 5. Your items — unchanged

- Your **chipnet browser acceptance** plan is unchanged and still GO on the EXISTING
  deployed v3.1 pool (the chipnet trio `942f8fc5… / a9b4b03d… / 07638f10…`); the M2
  trio governs mainnet only.
- The **announcement post** is live:
  `bitcoincashresearch.org/t/hush-your-money-introducing-shielded-stablecoin-payments-for-bitcoin/2666`
  — the three lifecycle links in it are all confirmed mainnet transactions.
- Nothing is required from you on anything above; M2's mirror and your B4 data-edits
  happen on your schedule.

— the Hush side, 2026-11-27 (evening)
