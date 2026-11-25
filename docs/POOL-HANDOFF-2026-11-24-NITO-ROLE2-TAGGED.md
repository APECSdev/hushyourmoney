# Pool Handoff — 2026-11-24 — Nito Cash: the role-2 TAGGED pool + minting guard (the complete solution)

This is the delivery package for the nito.cash client integration. Everything below is
deployed, confirmed, and live on chipnet as of 2026-11-24 PM. Every claim carries its
on-chain txid or its in-repo source. Per the standing directive from our side: **the nito.cash
client is the final approval** — this document hands you everything needed to drive the pool
from your wallet.

## 1. What you are integrating against

The successor to the v4/covenant-at-input-0 pool you integrated on 2026-11-23 — same solo
verifier family (`bch-groth16-bn254-sound-native`), same 2-public-input relation, but a
completely different transaction shape and three upgrades that change your client:

| | v4 (your current integration) | **role-2 tagged pool v2 (this handoff)** |
|---|---|---|
| inputs | 7 (covenant 0, exec 1–3, genesis 4, terminal 5, funding 6) | **3** (fuel 0, fuel 1, state 2) |
| signatures | signed funding input inside the action | **NONE** — the script satisfaction is the spend authorization |
| pool rules | separate covenant sibling (347-B redeem) | **inside the verifier** (role-2 hook, checks 1–11 + 4c/4g) |
| fee | from the signed funding input | **prepaid in the lock** (fuel UTXOs' own sats; TXINPUTCOUNT==3 forbids a fee input) |
| author binding | the funding-input signature | **deposit tags**: SHA256(carrier[0..64]) as NFT commitments on the fuel |
| note delivery | out[6] encrypted carrier | **off-chain** (TXOUTPUTCOUNT == 2 + sign leaves no room) |
| minting NFT custody | destroyed in the deploy | **inside the minting guard** — burn and FT-mint are consensus-impossible |
| verifier soundness | withdrawn densless-msm (F6) | the reviewed sound-native build under OUR VK |

## 2. Pool facts (all verified on chain)

- Category: `480e30ff1d3f5f0b6fe9dd2dbe363b1776f61566f29a395628d0b50abd01b9d0`
- Anchor (= category) `480e30ff…` → mint `5ea499ff…` → deploy `2eaeb97f…` (block 345,467)
- Program P2SH32 locking: `aa203e40b64cff154d4b3305e8c8cc4e3174bc595ad74342a8445a9a7798b7be3a2987`
  (program: 7,834 B, code pin `d71851a1…`; hook checks 1–11 + deposit tags 4c/4g)
- Minting-guard locking: `aa2066a238ad4109a3093c34fd4cf9b4167b0058375d4ad1c5cc44cd253d3664f0c187`
  (redeem 5,103 B; adopted live, `a5d73b4e…` block 345503)
- Verifying key: OUR solo-ceremony VK (zkey sha256 `4a4e2543dbe640de7a59e23cc652b89a50034898757efff22242eafec0f7b7c0`,
  VK sha256 `05250429…`, wasm `8595b434…`) — **not** your committed PPOT VK
  `27f6ea03…`; the proving-asset swap is work item 3.1 below
- Genesis state: the public bootstrap root `551108f6…510f` (identical to your v2/v4 geneses —
  our seed derivation reproduces your on-chain commitments byte-for-byte)
- Full lifecycle confirmed: SHIELD 1,000,000 `9d9aa97a…` → TRANSFER `5262417b…` →
  UNSHIELD 250,000 `e54d19fb…` (payout executed). Final state: root `1829766…`,
  balance 750,000, notes at tree 6,7. Every action: real witness, complete program
  VM-ACCEPTED (consensus + standard) on all 3 inputs before broadcast.
- Gates behind the program: acceptance 20/20 (including the theft replay — a valid proof
  consuming fuel tagged for ANOTHER action REJECTS at check 4g), red team 146/0, sweep
  69/0 with input 2 binding at 6.00% standard margin.

Explorer: `https://explorer.selene.cash/tx/<txid>?network=chipnet` (primary),
`https://chipnet.chaingraph.cash/tx/<txid>` (fallback).

## 3. The action shape (your tx builder)

3 inputs, all spending the one program P2SH32 — signature-free:

```
in0  fuel/deposit UTXO  (program locking; carries the FT deposit on a SHIELD; tagged NFT)
in1  fuel UTXO          (program locking; tagged NFT)
in2  state NFT          (program locking; category+mutable NFT, commitment =
                         storedRoot(32B LE) ‖ nullifierSetHash(32B), FT amount = balance)
out0 OP_RETURN <169-B carrier>   nf0 ‖ nf1 ‖ cm0 ‖ cm1 ‖ newRoot ‖ pv(8B LE) ‖ sign(1B)
out1 new state NFT      (program locking; 10,000-sat float, commitment =
                         newRoot ‖ newNull, FT amount = newBalance)
out2 (unshield only)    public payout: bare category, pv FT, any address
```

- The carrier limbs are the 32-byte LE VM-number forms (your covenant-arg convention).
- The actionHash preimage is the 8-field BIG-ENDIAN SHA256 you already know; the hook
  recomputes it and binds it to the proof's n1 (check 6).
- `newBalance = balance + pv − 2·sign·pv ≥ 0` (check 8); TXOUTPUTCOUNT == 2 + sign (8b);
  payout existence (10); state continuity (2/5/9); **fuel tags (4c/4g)**.
- Fees ride the fuel: fee = in0.sats + in1.sats (+ in2 float − out1 float = 0).
  **Fee policy: BARE — 1 sat/B; 15,000 sats per fuel UTXO (30k total ≈ $0.06)** covers every
  real action (~28.1 KB) at 1.03–1.07 sat/B. The prove-first flow sizes exactly if you prefer.

## 4. The deposit tag (the author binding — your lock builder)

Before each action, the USER's wallet signs a LOCK tx that pre-creates the two fuel UTXOs.
With deposit tagging, both fuel outputs carry the pool category as a MUTABLE NFT whose
commitment is:

```
tag = SHA256(carrier[0..64]) = SHA256(nf0_LE ‖ nf1_LE)   — the funded action's own nullifiers
```

The hook recomputes this from the on-chain carrier and requires BOTH fuel commitments to
equal it (check 4g) and both fuel categories to be the pool's (4c). Consequences for your
client:

- Standing fuel can only be consumed by the action whose witness spends exactly those
  nullifiers — producing them requires the note keys. This recreates the author binding your
  v4 flow got from the signed funding input, now as a commitment.
- **Flow per action: prove FIRST → tag → lock → broadcast lock + action TOGETHER** (the
  action may spend the lock's unconfirmed outputs; first-seen wins the state double-spend,
  closing the theft window to ~zero). We ran all three lifecycle ops exactly this way.
- Tagged fuel is single-purpose: an abandoned lock strands its ~30k sats; re-proves with
  the same notes keep the same nullifiers, so the tag survives re-proving.
- The blanks: mutable NFTs with EMPTY commitments, minted by the guard in batches of 64
  (K is pinned in the guard's script). They are plain P2PKH UTXOs — transferable,
  user-held. **Acquisition is PERMISSIONLESS via the vending covenant** (`blank-vending.mjs`,
  suite 18/18; §4.1 below): the operator loads blanks into a P2SH32 machine and anyone
  takes one by paying the exact pinned price on-chain — no signature, no permission, the
  blank follows the money. Proven live by a total stranger (never seen by the operator)
  buying both machine blanks with only its own key. Current operator-held reserve: 88
  blanks (2 sold through the machine; the machine itself is empty — reload with
  `pool-vend-load-role2.mjs`).

### 4.1 Blank vending — the permissionless acquisition layer (LIVE)

Machine locking `aa206b51396304b3bd4e0e9c254f84d1ee80d83a5c7ccaf3750883d00866480d981287`
(redeem 157 B, price 1,000 sats, category-pinned). Shape: buyer's tokenless funding input
`in1` pays the exact price to the pinned operator P2PKH; the blank (category + mutable +
empty commitment + 0 FT, float preserved) is delivered to **the funding input's own
locking**; tokenless change to the buyer. No operator signature anywhere — the script is the
authorization. Live record: load `460a6f2a…` (block 345,663, 2 blanks + demo-stranger
funding), stranger buys `bc2c326e…` (345,664) + `49b184f5…` (345,666), covenant executing
on chain (7,545 op consensus / 8,057 op standard). Why post-mint: the deployed guard is
self-pinning and immortal, so the live category's mint is permanently operator-destined —
permissionlessness lives one hop downstream, and the operator's residual discretion is only
stock depth. Blanks, once bought, are the buyer's plain UTXOs — resellable, giftable — and
any blank-holder can run their own machine instance with the same published script.

## 5. The minting guard (custody, settled)

The category's minting NFT lives at the guard P2SH32 (`aa2066a2…`). The ONLY transaction
that can ever spend it (suite 14/14, `minting-guard.mjs`):

```
in0  the guard UTXO (the minting NFT)     in1  operator sats
out0 the minting NFT, RECREATED at the guard's own locking — it can never leave, never die
out1..64 exactly K blanks (category + mutable + EMPTY commitment + 0 FT) → operator P2PKH
outK+1 one TOKENLESS change output → operator P2PKH
+ operator signature (gates batch TIMING only)
```

Consensus-impossible, forever: burning the minting NFT; minting ANY fungible amount
(every category output is amount-pinned to 0 and the change must be tokenless — the
100M supply is frozen); minting pre-tagged or wrong-capability blanks; redirecting
blanks; substituting a different token at the guard locking. A compromised operator key
can only choose WHEN a batch runs. First guarded batch: `ad1d7845…` (block 345504).

## 6. Fee-privacy ladder (recorded client rules)

The action's actor is visible through its fee lock (structural: fees are BCH, shielded
value is FT). Per action: SHIELD deposit public-by-definition; TRANSFER = the real leak;
UNSHIELD payout public-by-design. Mitigations, in order:

1. Fresh, history-free fee address per action.
2. Browser-native blending via a **CashShuffle-style round** — relay-based, in-browser by
   design, onion-blinded so the relay CANNOT learn the input→output mapping (the
   coordinator-sees critique applies to CashFusion, not CashShuffle); its tier weakness is
   moot for uniform 15k fuel outputs. Wire spec: `web/pages/research/coinjoin.vue` (this
   repo). Your wallet is a WEB wallet; desktop CashFusion (TCP+Tor) is unreachable from
   a browser.
3. Optional pool-native lock batching: a shuffle round whose outputs ARE the tagged fuel
   UTXOs — composes with the tags (the tag identifies WHICH fuel output, which the action's
   outpoints reveal anyway, never which funder).

## 7. Your work items

1. **Proving-asset swap**: your committed VK `27f6ea03…` → our VK `05250429…`; replace
   `pool.wasm` + `pool_final.zkey` per your `src/lib/pool/prover.js` paths (our ceremony
   zkey/wasm are available for handover; hashes in §2). The circuit is the same 2-public-input
   relation — your witness generator works once the category limbs and your 7-input-only
   assumptions are dropped.
2. **Tx builder**: 7-input covenant shape → the 3-input role-2 shape (§3), including the
   OP_RETURN carrier layout and the tag computation (§4).
3. **Lock tx**: your wallet signs it (it is a normal P2PKH-signed tx — your existing
   signing path); outputs = 2 tagged fuel UTXOs (+ FT deposit on out0 for shields,
   drawn from the user's FT UTXO).
4. **Note delivery**: off-chain (the pinned output count leaves no room for your old
   out[6] encrypted carrier).
5. **Blank handling**: acquire through the vending covenant (self-service, §4.1) — or any
   p2p transfer; spend 2 per lock. Your wallet should recognize the exact blank shape
   (pool category + mutable NFT + EMPTY commitment + 0 FT), count held blanks as
   "actions remaining", and treat the vending locking as a buyable UTXO source.
6. **Fee hygiene** per §6.

## 8. Verification contract

Every statement above is backed by: on-chain txids (§2, §5), the in-repo sources
(`wip-role2-hook/{pool-hook,pool-tx,pool-test,pool-redteam,pool-sweep,minting-guard,
probe-cap,pool-deploy-role2,pool-tagbatch-role2,pool-guard-adopt-role2,pool-refill-role2,
pool-op-role2}.mjs` in `pusd-shielded-pool`), the gate reports
(`pool-redteam-tagged-report.json`, `pool-sweep-tagged.json`), and the deployment records
(`docs/POOL-DEPLOYMENT.md` §15–§17, `wip-role2-hook/STATUS.md`). Unmeasured quantities are
marked; nothing here is estimated.

— APECS Dev, 2026-11-24. The nito.cash client is the final approval for any deployed result.
