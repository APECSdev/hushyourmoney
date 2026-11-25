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

Hush Your Money is a six-year-old research portal and resource on blockchain privacy,
founded by Shomari and focused on UTXO-based privacy solutions. Its current flagship work
is a shielded pool for CashTokens on Bitcoin Cash: a 2-in/2-out Groth16 joinsplit on
BN254 — 183,472 constraints, 2 public inputs — with the pool state in a mutable
CashToken NFT commitment enforced by a CashScript covenant.

It has run on BCH mainnet. On 2026-11-20 four transactions deployed a pool and shielded
**100 base units (1.00 PUSD)** with a real proof. On chipnet the same circuit has been exercised through the
full SHIELD → TRANSFER → UNSHIELD lifecycle, and a runner-independent pool now runs under
the wallet-committed proving key — with two wallet-originated actions (SHIELD, TRANSFER)
confirmed on chipnet on 2026-11-23.

The remaining step is the trusted setup. Every deployment so far uses a disclosed
single-party (1-of-1) setup; production requires a public multi-party ceremony. This post
describes the system, the evidence, and the ceremony we are raising funds to run.

Support the campaign:

**https://fundme.cash/campaign/180**

## Background

The project started at BCHDEVCON3 in 2020:
**https://github.com/BCHDEVCON3/hush-your-money**

After the event, Bitcoin.com pledged to integrate the technology into their flagship
wallet. Their legal department intervened before launch. (First-hand account; there was
no public news coverage.)

Since then the work has continued on privacy tooling for UTXO chains — CashShuffle and
CashFusion first, then a coordinator-free fusion design over Nostr relays:
**https://hushyourmoney.com/research/cashfusion**

Zero knowledge entered the picture with the work around **[verifier.cash](https://verifier.cash)**
and the `groth16_cashscript` toolchain. ZK-STARKs remain attractive for their transparency and
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
- **Sibling-hole finding (2026-11-24, ours) — complete-drain vulnerability, fixed in source
  only, NOT deployed.** The deployed covenant (v4's 347-B redeem, disassembled) reads the
  proven public inputs out of the genesis step's unlocking at fixed offsets (n0 @ 1825,
  n1 @ 1792) and never checks that input's locking — its whole introspection set is
  `TXVERSION / INPUTINDEX / INPUTBYTECODE / OUTPUTBYTECODE / UTXOBYTECODE / UTXO+OUTPUT
  TOKEN{category,commitment,amount}`; no `OP_TXINPUTCOUNT`, no `OP_TXOUTPUTCOUNT`.
  Demonstrated on the BCH-2026 VM: a one-byte `OP_1` at the genesis index is **accepted** —
  any spender could drain the pool with no proof and no verifier. Fix in
  `pusd-shielded-pool/asset-pool.cash` (four new ctor args pin the verifier shape;
  the unpinned source still reproduces the mainnet covenant byte-for-byte; regression gate
  `pin-sibling-test.mjs` 6/6). **Every deployed pool still carries the unpinned covenant**
  (the v2/v4/gate3/gate6/mainnet generation; the role-2 pool deployed 2026-11-24 supersedes
  this architecture — it has no sibling covenant at all, so the hole class does not apply
  to it).
- The successor architecture moves the pool rules off the sibling covenant entirely and
  into the reviewed sound verifier itself, as a role-2 hook — see under Verifier.

### Verifier

- `densless-msm`, **35,626 B** in one standard transaction.
- 5/5 valid proofs accepted, 9/9 mutated public inputs rejected, 26/26 red-team runs
  rejected — these measure the **public-input binding**, not the pairing.
- `vk_x` is recomputed in-script and never accepted as a witness.
- The upstream red-team fix was merged into `mr-zwets/groth16_cashscript` (PR #26,
  2026-10-30): **https://github.com/mr-zwets/groth16_cashscript/pull/26**
- **SOUNDNESS WITHDRAWN (2026-10-26, finding F6).** The verifier's author withdrew the
  full-verifier soundness claims: the shared Miller event consumes slopes without the
  tangent/chord equations, and the terminal's carried-R predicate compares a value with
  itself instead of checking the B endpoint. No end-to-end false acceptance has been
  demonstrated, but the argument that a forged witness cannot pass is gone — so the
  pool's on-chain value conservation is **not established**. Every pool deployed here
  (gate3, gate6, gate6b, mainnet) carries this verifier. Record:
  `chunked/bn254/densless-msm/README.md` + `verifiers.md` (F6) in
  **https://github.com/mr-zwets/groth16_cashscript**
- **Reviewed sound replacement (not yet deployed):** `bch-groth16-bn254-sound-native` —
  27,624 B, 3 inputs, one standard transaction, independently reviewed 2026-10-26
  (`chunked/bn254/bn-native-sound/`). It verifies the same relation under the same
  verifying key, so replacing it costs a pool redeploy, **not a new trusted setup**.
- **Built under our own verifying key (2026-11-24, gate passed):** the program regenerates
  from source via `BN_VK_FIXTURES` (code 7,309 B per input, sha256
  `5fd6a4bee213d2f8cd4e251afcfe894d15247421c860538debf0e93d95d9c5df`; P2SH32 locking
  `aa205233f888295170f09abaff3ffca7f8eb659034ed413c5856e214bcde5be09f6f87`; role ids
  22/23/24; margins 6.03% standard / 6.49% consensus) and accepts our real proof on the
  BCH-2026 VM in both modes. Record: `pusd-shielded-pool/SOUND-VERIFIER-BUILD.md`.
- **Red team under our key (2026-11-24): 151 runs, 0 accepted**, both positive controls
  accepted. All 10 graph tests reject, including a foreign P2SH32 input at index j
  carrying the honest pushes — which is why the pool rules moved into role 2 instead of
  sitting beside the verifier as a sibling covenant.
- **Role-2 pool hook — DEPLOYED ON CHIPNET 2026-11-24 (the role-2 pool is LIVE; full
  SHIELD→TRANSFER→UNSHIELD lifecycle confirmed on-chain):** the
  pool rules now run as the verifier's role-2 `COVENANT` hook — 12 checks (state category
  and stored root, carrier parse, `n1 == actionHash` with all eight preimage fields
  reversed to big-endian, the raw-LE nullifier fold, balance arithmetic,
  `TXOUTPUTCOUNT == 2 + sign`, out1 locking/category/commitment/amount, conditional
  unshield payout, dynamic tail restore). Acceptance suite **14/14 under our key**:
  3 controls (transfer pv=0, shield pv=250, unshield pv=400 — the payout branch) + 11
  rejection classes, with the complete program (graph + hook + final pairing) executing
  end-to-end. Design: `pusd-shielded-pool/ROLE2-POOL-HOOK-DESIGN.md`; implementation and
  every measurement: `pusd-shielded-pool/wip-role2-hook/STATUS.md`.
  **Deployed runner-free 2026-11-24 (user directive; funding below):** anchor `b6ee4196…`
  (= the category) → mint `48d458b8…` → deploy `f8f215c3…` (block 345,413; state NFT at :0
  with the PUBLIC bootstrap root 551108f6…510f — byte-identical to the v2/v4 genesis
  commitments); program rebuilt for the real category (code 7,737 B sha256 `0e827602…`,
  locking `aa20cd37…`). NO covenant, NO step fleet: every pool UTXO at the one program
  P2SH32; actions are SIGNATURE-FREE 3-input spends (TXINPUTCOUNT==3; fees ride the locked
  UTXOs' sats; the "refill/lock" txs pre-pay them). Lifecycle: SHIELD 1,000,000 `582cefee…`
  (345,415) → TRANSFER `17f1322b…` (345,423) → UNSHIELD 250,000 with the public payout
  executed `24cd6b42…` (345,427); every action VM-ACCEPTED in both modes on all 3 inputs
  before broadcast. The 169-byte OP_RETURN carrier in out0 replaces the old covenant's
  function arguments (tamper-proof via hook check 6: the carrier must hash to n1, which the
  proof binds). Funding: the APECS FAUCET HOT WALLET `bchtest:qzmux3gx…`
  (`/Workspace/apecsdev/.secrets/faucet-hot-wallet.json` — the operational float for the
  apecs-api Worker's FAUCET_BCH_WIF, NOT a public faucet, and NOT the hushyourmoney
  chipnet-faucet.json key `bchtest:qzk22…`, which held 0 sats): the only funded chipnet
  wallet we hold runner-free (423,000 sats probed); 112,666 sats spent in total (fees +
  locked fuel + the 10,000-sat state float that stays live on the state NFT), 310,334
  sats + the 99M FT supply + the 250,000 FT payout remain. In the demo one key played three
  roles (issuer / operator / demo user) that production must separate. KNOWN LIMIT (user-
  surfaced, recorded in both AGENTS) — RESOLVED IN PRODUCTION THE SAME DAY: hook checks
  4c+4g (deposit tagging) bind every fuel/deposit UTXO to SHA256(carrier[0..64]) =
  H(nf0‖nf1) of the funded action; only the action whose witness spends those nullifiers can
  consume it. All gates re-run (acceptance 20/20 incl. the theft replay, red team 146/0,
  sweep 69/0) and **chipnet-role2-pool-v2-tagged DEPLOYED 2026-11-24 PM** (deploy
  `2eaeb97f…`, block 345,467; category `480e30ff…`): anchor→mint→deploy with the minting
  NFT passed forward + a 32-blank tag batch (`b087507b…`), then the full lifecycle with
  TAGGED locks broadcast atomically with their actions — SHIELD 1,000,000 `9d9aa97a…`,
  TRANSFER `5262417b…`, UNSHIELD 250,000 `e54d19fb…` (payout executed) — each ~28.1 KB at
  1.03–1.07 sat/B (BARE fee policy per user directive), FT conserved, final root
  `1829766…`, balance 750,000. The first pool (b6ee4196…) is superseded: untagged, and
  its minting NFT was burned so it can never tag. Record: POOL-DEPLOYMENT.md §16 +
  pusd-shielded-pool/wip-role2-hook/STATUS.md.
- **Sized, priced, and red-teamed under our key (2026-11-24, same day):** pool-shaped
  fill sizing puts the acceptance controls at exactly 94.0% of the per-input budget
  (the stock sizer builds tokenless source outputs and cannot size the hooked program
  at all); the hook costs **33,156 op standard / 32,260 op consensus, 427 B of role-2
  code** (statement→slices difference method); and the extended red team — the full
  stock scenario list evaluated against the honest pool shape — ran **146 scenarios,
  0 accepted** in both modes, with both positive controls accepted. The guard report
  confirms the layering: public-input claims die at the hook's stored-root compare
  before the graph's binding check; proof-point tampering dies in the graph.
- Open before redeploy: **independent review of the new bytes**, then one combined
  redeploy. (`worstCaseProof` for our key is UNMEASURED — it needs a snarkjs minter.)

### Testing on the BCH-2026 VM — harness landmines (verified 2026-11-24)

For anyone reproducing this work with `@bitauth/libauth` 3.1.0-next.8
(`createVirtualMachineBch2026`):

- **Never pass Node `Buffer`s into the VM.** libauth's opcodes are written for plain
  `Uint8Array` stack items and do `item.slice()` before mutating (`opReverseBytes` =
  `item.slice().reverse()`; `pushTokenExtendedCategory` = `category.slice().reverse()` +
  capability byte). `Uint8Array.prototype.slice()` copies — **`Buffer.prototype.slice()`
  is overridden to return a view sharing memory**, so every "pure" slice becomes an alias
  and the reversals write straight through into the caller's transaction objects: an
  OP_RETURN carrier's 32-byte fields get reversed in place, `token.category` buffers flip
  with strict per-call alternation, and results become call-order-dependent. This bug
  masquerades as byte-order "asymmetries" between opcodes and as in-process vs
  fresh-process disagreements. A `Proxy` over the Buffer does **not** catch the writes —
  they go through views of its ArrayBuffer. Use `new Uint8Array(buf)` (copies) for every
  transaction field. The stock bench harness avoids the whole class by using
  `Uint8Array.from` throughout.
- **`OP_SIZE` is non-popping** on BCH-2026: `[push 0xaa, OP_SIZE]` leaves `[aa, 01]`.
  Model it pop-1/push-2 (operand returns under the size); the stock `FILL` local function
  is the precedent.
- Introspection semantics, probe-verified live: every introspection op pops its index;
  both input-side and output-side token-category ops push `reverse(stored category)` +
  capability byte (shared helper, `bch-2023-tokens.js`); bare (no-NFT) token outputs push
  the reversed category with no capability byte; commitments and amounts are pushed as
  stored. Opcode numbers that matter here: `INPUTINDEX 0xc0, TXVERSION 0xc2,
  TXINPUTCOUNT 0xc3, TXOUTPUTCOUNT 0xc4, UTXOBYTECODE 0xc7, INPUTBYTECODE 0xca,
  OUTBYTECODE 0xcd, UTXOTOKCAT 0xce, UTXOTOKCOMMIT 0xcf, UTXOTOKAMT 0xd0,
  OUTTOKCAT 0xd1, OUTTOKCOMMIT 0xd2, OUTTOKAMT 0xd3, REVERSEBYTES 0xbc`.
- `vm.debug`'s `ip` is a **byte offset** in the currently executing function's code
  (`OP_INVOKE` starts a fresh ip space per invoked function), not an instruction index —
  indexing a disassembly with it silently produces plausible-but-wrong instruction windows.
- Per-input op budget: `(41 + unlockingBytecode length) × 800`, enforced in consensus.

Reproduction set: `pusd-shielded-pool/wip-role2-hook/probe-*.mjs`.

### Mainnet

Four public transactions, 2026-11-20 (explorer links on the research page):

| Stage | Txid | What it does |
| ----- | ---- | ------------ |
| PREP | `dd1e3506f4fb7e81dd4f9146612df1f0aff1f812378332297556653356020e7d` | pool category anchor |
| GENESIS | `0a8cb008cbacc618a27726e4422a61748fe5d5aa1e75c3ed379eff918441c5c4` | state NFT minted |
| DEPLOY | `63ddfdd4718b5186dfb0ed36ceebb66a8c5dde06ad28b291b53bd040b1f5af7c` | covenant + 5 verifier steps + 100 base units (1.00 PUSD) |
| TRANSFER | `4fda8a8b63ff2ef82cc1f5a9ad89bdcbbc86fec254e9c08bb1b874312f6b544f` | real proof, 100 base units conserved (1.00 PUSD), 38,475 B |

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
  seed notes (value 0, nk=1). **Not spendable:** it was deployed with the five-input
  fixture verifier program, while every wallet action emits seven inputs, so no action
  can satisfy its step scripts. Verified 2026-11-23: its pool UTXO is still the deploy
  output and its covenant history holds exactly one entry — the deploy.
- `chipnet-pusd-v4-covenant0` (2026-11-23, spendable successor): anchor
  `0d31da75…d664`, mint `a5d251e4…a906`, deploy `efd3314e…857c`, block **344638**.
  Same verifying key and the same seeded tree root as v2 (`551108f6…510f`), with the
  verifier program generalized to the covenant-at-input-0 shape. Two confirmed
  wallet-originated actions: SHIELD `43ca7bca…2e4d` (block 344641) and TRANSFER
  `fdd2981d…7b8b` (block 344646, encrypted note carrier at out[6]).

The wallet side (nito.cash) is a BLAZE Hackathon entry:

**https://dorahacks.io/build/49513**

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
| — | Wallet-originated actions (nito.cash) | v4 SHIELD `43ca7bca…2e4d` + TRANSFER `fdd2981d…7b8b`, both 7 in / 8 out on chain; 7/7 inputs VM-evaluated pre-broadcast per nito.cash | passed 2026-11-23 |
| 7 | Public ceremony → production | — | pending |

Full records: **https://hushyourmoney.com/research/shielded-pool**

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
**https://hushyourmoney.com/ceremony**

Support the ceremony:

**https://fundme.cash/campaign/180**

## Roadmap

1. **Gate 6b confirmation.** The two-asset lifecycle (SHIELD A → SHIELD B → TRANSFER →
   UNSHIELD B, one pool) was broadcast 2026-11-10/11 but never confirmed: the miner skipped
   the set, and the RBF replacement set also stayed unconfirmed. Once an op set confirms,
   the pool is added to `pool-registry.json`; until then it is a design proof with
   witness-level evidence only.
2. **Gate 7 — public ceremony.** Multi-party contribution over the Perpetual Powers-of-Tau
   transcript, a published transcript, independent verification, then a production
   deployment.
3. **Independent audit.** Scoped to the circuit, covenant, and verifier.
4. **Note detection.** Indexer plus trial-decryption scan for pool outputs, so wallets can
   find notes without a local full scan.
5. **Multi-asset production.** Variant b is measured (186,007 constraints); the per-asset
   seed policy and production registry entries are still open.
6. **Payment gateway and SDK.** Wallet and merchant integration on top of the pool.
7. **Post-quantum research.** A STARK-based variant; proof size and verification cost on
   BCH are the constraints.

## Links

- Campaign: **https://fundme.cash/campaign/180**

- DoraHacks BUIDL (BLAZE Hackathon, nito.cash): **https://dorahacks.io/build/49513**

- Research: **https://hushyourmoney.com/research/shielded-pool**
- Ceremony: **https://hushyourmoney.com/ceremony**
- verifier.cash: **https://verifier.cash**
- Circuit and covenant source: **https://github.com/APECSdev/pusd-shielded-pool**
- Site and registry: **https://github.com/APECSdev/hushyourmoney**
- Upstream verifier fix: **https://github.com/mr-zwets/groth16_cashscript/pull/26**

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
- **No independent audit yet.**
- Gate 6b's two-asset lifecycle was broadcast but never confirmed.
- The ceremony monitor UI is a demo until Gate 7 runs.

## Support this work

Campaign:

**https://fundme.cash/campaign/180**

DoraHacks BUIDL:

**https://dorahacks.io/build/49513**

## Appendix A: Multi-asset pools

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
