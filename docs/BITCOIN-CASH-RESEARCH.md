<!-- docs/BITCOIN-CASH-RESEARCH.md -->

Title:
Introducing Shielded Stablecoin Payments on Bitcoin Cash

Category:
Technical

Optional tags:
- zero-knowledge
- shielded-pool
- stablecoin
- trusted-setup

--------------------------------------------------------------------------------

STATUS: DRAFT — do not publish until the FundMe campaign is approved by the site maintainer.

## Summary

Hush Your Money is a shielded pool for CashTokens on Bitcoin Cash. The circuit is a
2-in/2-out Groth16 joinsplit on BN254 — 183,472 constraints, 2 public inputs — and the
pool state lives in a mutable CashToken NFT commitment enforced by a CashScript covenant.

It has run on BCH mainnet. On 2026-11-20 four transactions deployed a pool and shielded
**100 PUSD** with a real proof. On chipnet the same circuit has been exercised through the
full SHIELD → TRANSFER → UNSHIELD lifecycle, and a runner-independent pool
(`chipnet-pusd-v2`) now runs under the wallet-committed proving key.

The remaining step is the trusted setup. Every deployment so far uses a disclosed
single-party (1-of-1) setup; production requires a public multi-party ceremony. This post
describes the system, the evidence, and the ceremony we are raising funds to run.

## Background

The project started at BCHDEVCON3 in 2020:
https://github.com/BCHDEVCON3/hush-your-money

After the event, Bitcoin.com pledged to integrate the technology into their flagship
wallet. Their legal department intervened before launch. (First-hand account; there was
no public news coverage.)

Since then the work has continued on privacy tooling for UTXO chains — CashShuffle and
CashFusion first, then a coordinator-free fusion design over Nostr relays:
https://hushyourmoney.com/research/cashfusion

Zero knowledge entered the picture with the work around `verifier.cash` and the
`groth16_cashscript` toolchain. ZK-STARKs remain attractive for their transparency and
post-quantum security, but proof size does not fit the BCH 2026 per-input op-cost budget
for this use case. Groth16 verification fits in **35,626 bytes of script in one standard
transaction**. The trade-off is explicit: Groth16 needs a circuit-specific trusted setup,
and it is not quantum-resistant.

## What is running

### Circuit

- BN254 Groth16, 2-in/2-out joinsplit with dummy-note padding.
- **183,472 constraints**, 107 private inputs, 181,959 wires, **2 public inputs**
  (`merkleRoot`, `actionHash`).
- `actionHash` = 253-bit truncation of
  `SHA256(nf0 ‖ nf1 ‖ cm0 ‖ cm1 ‖ publicValueAbs ‖ publicValueSign ‖ assetCategory ‖ newMerkleRoot)`.
- Poseidon Merkle tree, depth 20.
- `assetCategory` is a **private witness** (two 128-bit limbs), not a public constant, so
  the same circuit and verifying key serve any CashToken category (Path A). A multi-asset
  variant (Poseidon(6) note commitments, **186,007 constraints**, +1.38%) exists and passed
  its gates.

### Covenant

- P2SH32; the category is a constructor argument, so the redeem script is identical for
  every asset.
- State `{merkleRoot, nullifierSet}` is carried in a mutable NFT commitment.
- A spend requires the Groth16 verifier transaction as sibling inputs.

### Verifier

- `densless-msm`, **35,626 B** in one standard transaction.
- 5/5 valid proofs accepted, 9/9 mutated public inputs rejected, 26/26 red-team runs
  rejected.
- `vk_x` is recomputed in-script and never accepted as a witness.
- The upstream red-team fix was merged into `mr-zwets/groth16_cashscript` (PR #26,
  2026-10-30): https://github.com/mr-zwets/groth16_cashscript/pull/26

### Mainnet

Four public transactions, 2026-11-20 (explorer links on the research page):

| Stage | Txid | What it does |
| ----- | ---- | ------------ |
| PREP | `dd1e3506f4fb7e81dd4f9146612df1f0aff1f812378332297556653356020e7d` | pool category anchor |
| GENESIS | `0a8cb008cbacc618a27726e4422a61748fe5d5aa1e75c3ed379eff918441c5c4` | state NFT minted |
| DEPLOY | `63ddfdd4718b5186dfb0ed36ceebb66a8c5dde06ad28b291b53bd040b1f5af7c` | covenant + 5 verifier steps + 100 PUSD |
| TRANSFER | `4fda8a8b63ff2ef82cc1f5a9ad89bdcbbc86fec254e9c08bb1b874312f6b544f` | real proof, 100 PUSD conserved, 38,475 B |

All seven inputs were evaluated with the libauth BCH-2026 VM before broadcast. The setup
is a disclosed single-party (1-of-1) demo setup, not production.

### Chipnet

- Gate 3 pool (single asset): category `98690dba…b153`, deploy `090bce9f…14e9`,
  first shield `f5927a0b…7426`, block 330438.
- Gate 6 multi-asset pool: category `d85ba98a…b70a`, deploy `e36fd153…4324`,
  first shield `fc585fc9…912f`, block 330459.
- `chipnet-pusd-v2` (2026-11-22, runner-independent): anchor `050b5934…504a9`,
  mint `a3e90020…decc02`, deploy `53014fd4…766da`, block **343322**. It uses the
  wallet-committed proving key (`proving-assets-v1`) and ships two **public** bootstrap
  seed notes (value 0, nk=1) so any wallet can open its first action.

## Multi-asset pools

The single-asset pool (Path A) deploys one covenant and one circuit per CashToken
category. It works today — it is what the mainnet demo used — but it fragments the
anonymity set: one pool per asset.

Path B puts every category in one pool. The note commitment binds the full 256-bit
category, value, owner, rho and r. The 256-bit category is the hard part: BN254's scalar
field is 254 bits, so a 32-byte category cannot be one field element. Truncating to 253
bits (what the single-asset circuit does for its action hash) is unsound for multi-asset:
an attacker could grind a ~2³-aliasing category pair and turn the pool into a converter.
Two drafts were measured:

- **variant c** — note = `Poseidon(5)(Poseidon(2)(catHi, catLo), value, owner, rho, r)`:
  **187,547 constraints** (+2.22%).
- **variant b** — note = `Poseidon(6)(catHi, catLo, value, owner, rho, r)`:
  **186,007 constraints** (+1.38%).

Variant b is the recommendation: cheaper, and exact — it binds both category limbs with
no collapse-hash assumption.

Per-category conservation is enforced in-circuit: a canonical 256-bit sort of both sides
(two `LessThan(128)` + `IsEqual` per sort — circomlib's `LessThan` is capped at n ≤ 252,
so no 254-bit compare), output categories aligned with input categories, and the public
delta applied only to the public category's slot. The anti-converter negative test (1 unit
moved across categories) is rejected at the slot-conservation constraint on both variants.

The covenant (Gate 5) binds the pool's state-NFT category as a constructor argument and
holds one bare-FT UTXO per category on the same bytecode. It branches on
`tx.inputs[i].tokenCategory` — state path vs holdings path — and the holdings leg enforces
spawn (`newHoldings = held + pv − 2·isUnshield·pv ≥ 0`), output continuity and the
unshield payout. Measured redeem **448 B**; harness op-cost **47.5k–49.5k** against
193.6k–195.2k budget, and **84,819 / 556,800 (15.2%)** on the real broadcast op.

Gate 6 deployed the first multi-asset pool on chipnet (category `d85ba98a…`, deploy
`e36fd153…`, block 330459) and shielded 500,000 units of a **different** category
(`98690dba…`) on its first op — the multi-asset property exercised on chain with a real
proof. Gate 6b then ran the full lifecycle with two categories on one pool: SHIELD A,
SHIELD B, TRANSFER A+B, UNSHIELD B. All four ops were VM-verified and broadcast
2026-11-10/11; they were never confirmed (the miner skipped the set, and the RBF
replacement set also stayed unconfirmed), so the pool stays out of `pool-registry.json`
until an op set confirms.

Open item: the multi-asset tree uses a category-agnostic zero leaf
`Poseidon(6)(0,0,0,0,0,0)`; the per-asset seed policy for production is still open.

## Evidence

| Gate | Scope | Evidence | Status |
| ---- | ----- | -------- | ------ |
| 1 | End-to-end reproduction | 4th chained transfer `3e21097c…5e78`, block 330142 | passed 2026-10-30 |
| 2 | Compile parity | r1cs/wasm/sym byte-identical to the canonical build | passed 2026-11-01 |
| 3 | Path-A deploy | category `98690dba…b153`, deploy `090bce9f…14e9`, shield `f5927a0b…7426`, block 330438 | passed 2026-11-01 |
| 4 | Multi-asset circuit | variant b, 186,007 constraints, anti-converter negative test rejected | passed 2026-11-01 |
| 5 | Multi-category covenant | 448 B redeem, 47.5k–49.5k op-cost vs 193.6k–195.2k budget | passed 2026-11-01 |
| 6 | Multi-asset E2E | deploy `e36fd153…4324`, shield `fc585fc9…912f`, block 330459 | passed 2026-11-01 |
| 6b | Two-asset lifecycle | 4 ops broadcast 2026-11-10/11, RBF-replaced, still unconfirmed | pending confirmation |
| 7 | Public ceremony → production | — | pending |

Full records: https://hushyourmoney.com/research/shielded-pool

## The trusted setup

Groth16 needs a circuit-specific setup. Whoever holds the toxic waste can forge proofs
for that circuit, so the setup is the security boundary, not a formality.

Phase 1 is the public Perpetual Powers-of-Tau transcript `ppot_0080_18`
(302,083,218 bytes, sha256 `9693220206afab749e3d88d4ab5fdf5d36120ea102e7e587ccea0e7a5208e711`),
which transitively includes the author's own `#0023_shomari_response`. Phase 2 is
circuit-specific: each contributor adds entropy, and the final key is verified against the
transcript. One honest participant is enough to make the setup sound.

The current deployments use disclosed 1-of-1 setups. Gate 7 is the public ceremony:
multiple independent contributors, a published transcript, and a verification recipe that
anyone can replay.

The ceremony page is live, and the contribution monitor is still a demo:
https://hushyourmoney.com/ceremony

## What the campaign funds

**12.5 BCH** (≈ $2,500 at ~$200/BCH), all-or-nothing:

- 6.25 BCH — agent + human code and security audits
- 2.00 BCH — ceremony preparations (hosting, tooling, outreach)
- 1.25 BCH — paid event promotions
- 1.25 BCH — media and content
- 1.25 BCH — documentation and contributor onboarding
- 0.50 BCH — fees and contingency

Pledges are held by the CashStarter contract. Direct donations to the campaign address are
re-pledged as "Anonymous" during the campaign.

## Roadmap

1. **Gate 6b confirmation.** The two-asset lifecycle (SHIELD A → SHIELD B → TRANSFER →
   UNSHIELD B, one pool) was broadcast 2026-11-10/11 but never confirmed: the miner skipped
   the set, and the RBF replacement set also stayed unconfirmed. Once an op set confirms,
   the pool is added to `pool-registry.json`; until then it is a design proof with
   witness-level evidence only.
2. **Gate 7 — public ceremony.** Multi-party contribution over the Perpetual Powers-of-Tau
   transcript, a published transcript, independent verification, then a production
   deployment.
3. **Independent audit.** One of the budget lines; scoped to the circuit, covenant, and
   verifier.
4. **Note detection.** Indexer plus trial-decryption scan for pool outputs, so wallets can
   find notes without a local full scan.
5. **Multi-asset production.** Variant b is measured (186,007 constraints); the per-asset
   seed policy and production registry entries are still open.
6. **Payment gateway and SDK.** Wallet and merchant integration on top of the pool.
7. **Post-quantum research.** A STARK-based variant; proof size and verification cost on
   BCH are the constraints.

## Links

- Campaign: https://fundme.cash/campaign/180
- DoraHacks BUIDL (BLAZE Hackathon, nito.cash): https://dorahacks.io/build/49513
- Research: https://hushyourmoney.com/research/shielded-pool
- Ceremony: https://hushyourmoney.com/ceremony
- Circuit and covenant source: https://github.com/APECSdev/pusd-shielded-pool
- Site and registry: https://github.com/APECSdev/hushyourmoney
- Upstream verifier fix: https://github.com/mr-zwets/groth16_cashscript/pull/26

## Open questions

1. **Multi-asset tree policy.** A category-agnostic zero leaf is implemented
   (`Poseidon(6)(0,0,0,0,0,0)`); the per-asset seed policy for production is still open.
2. **Note detection.** Scanning for pool outputs and trial-decrypting notes works on
   chipnet; indexer coverage for production is not built.
3. **Ceremony coordination.** Contributor scheduling, transcript hosting, and the
   verification tooling for third parties.
4. **Post-quantum path.** A STARK-based variant is the long-term answer; proof size and
   verification cost on BCH are the constraints.

## Disclosure

- The pool is **testnet-only** in its audited surface; the mainnet demo is a 1-of-1 setup.
- **No independent audit yet.** That is one of the budget lines.
- Gate 6b's two-asset lifecycle was broadcast but never confirmed.
- The ceremony monitor UI is a demo until Gate 7 runs.
