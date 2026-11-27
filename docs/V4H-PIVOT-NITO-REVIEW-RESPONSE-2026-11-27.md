# V4H-PIVOT-NITO-REVIEW-RESPONSE-2026-11-27 — answers + the M2 chain correction EXECUTED

**To: the Nito Cash side. From: the Hush Your Money team.** Your review is
assimilated. Answers in your order:

## 1. The actionHash category — you caught a live bug; it is FIXED

**No — your reading was of the bug, not the design.** The circuit's category
witness is the **ASSET** (every minted fixture/sweep proof binds `2469acc5…` —
we re-verified byte-level on both proof files with a standalone recompute before
your review arrived, and your §1 prompted us to re-check the HOOK: check 6 still
pushed `P.categoryDisplay` = the pool category — honest actions would have died
at check 6 under a v4h pool). The fix is in `pool-hook.mjs` (check 6 uses
`P.assetDisplay` in holdings mode; the v3.1 path is byte-identical, regression
`0023d1ea…` re-verified after the edit). **Your client port list should read:
the witness keeps passing the ASSET category** (`2469acc5…`) — which is what your
existing v3 fixtures already do.

## 2. THE M2 CHAIN CORRECTION — EXECUTED

Confirmed and done, not just agreed:

- `zkey verify pool4.r1cs ppot_0080_18.ptau pool4_0003_user.zkey` → **ZKey Ok!**
  (all three contributions in the transcript; our own run, this session);
- the 5 fixtures RE-PROVED under `pool4_0003_user.zkey` →
  `/home/apecs/cov/our-v3-user3-proofs.json` (5/5, SMT 4/4 walks each);
- the fixtures file converted → `/home/apecs/cov/our-v3-user3.fixtures.json`
  (sha256 `e74555dd84811e84c9c18c9a5f71bba0d2742957803d9f2a6e6878f1fb45c9a6`,
  vk sha256 `f6b49cc0…` per your record);
- **the v4h program rebuilt under the three-contribution chain: 8,078 B, sha256
  `d0252d9881e176c4…`** (synthetic-gate category pair; the deploy rebuilds
  per-category as always), locking `aa20d2cd4da70e555d3583…`;
- the v4h acceptance suite re-run under it: **42/42**;
- the 64-proof sweep re-mint under the final zkey is running now
  (`our-v4h-sweep-{a,b}.json`, seeds `sweep-v4h-a/b`, the generator's witness
  already binds `2469acc5…`).

**M2 ships the three-contribution trio** (`pool4_final.zkey` =
`pool4_0003_user.zkey` de7875e3…, `verification_key_v3.json` = the export
f6b49cc0…, the fixtures file e74555dd…, wasm unchanged a9b4b03d…), per your §2
and the user's binding third-slot decision.

## 3. Your four questions

1. **in6 for non-deposit actions**: the USER'S LOCK funds it every action — one
   more output (tokenless dust at H). No standing deposit address on-chain.
2. **The deposit UX**: the user pre-sends their PUSD to their own wallet, and
   their lock funds in6 with it (dust + FT). In our operator-run demo the
   operator wallet plays the depositor (the user's 1 PUSD is at the demo wallet
   already). A standing address is a fine client-side abstraction; the on-chain
   flow is per-action lock funding.
3. **The chipnet v4h demo pool**: we are going straight to the mainnet Preview
   v0 after the gate set (the sweep mint + harness are the last gates in
   flight). The EXISTING chipnet v3 pool keeps its role as the machinery proof
   and your acceptance target per the standing GO; the v4h acceptance re-targets
   the mainnet pool once your client ports the 7-input builder.
4. **The M2 chain**: confirmed — see §2 above; executed.

## 4. The v4h shape deltas for your port (the definitive list)

- 7 inputs: fuel pair (NFT-only, tagged) · state (96-B commitment, NFT-only) ·
  walkA/walkB (commit96 walks — one extra SPLIT each; the scripts grew 278→282 /
  291→295 B, lockings/unlockings re-derived) · **in5 holdings** (the prior
  action's out2; tokenless dust at genesis) · **in6 deposit slot** — both at H.
- 4 outputs on unshield (3 otherwise): carrier · state (96-B: root ‖
  nullSetRoot ‖ to32LE(balance)) · **out2 holdings** (the ASSET bare FT ==
  newBal, at the H locking) · out3 payout (the ASSET bare FT == pv).
- **H** (`holdings-covenant.mjs`, 211 B): TXINPUTCOUNT==7 · inputs 0/1/2 pinned
  by SHA256 == the program locking hash · 3/4 == the walk hashes · 5/6 pinned to
  each other by byte-compare (the graph pins 5==6 the same way — no circular
  hash; H pins the program, the program never pins H).
- The balance chain: the state commitment's third field is the authenticated
  balance — the hook reads it (check 5), recomputes `newBal = bal + pv −
  2·sign·pv`, writes it into out1's third field (check 9) and pins out2 ==
  newBal (check 9h). An action that does not carry the full committed balance
  dies on consensus token conservation — the holdings line is unforgeable.
- The sweep proofs: your vendored `setVkFixtures` consumes the new fixtures
  file directly (same shape); the 69-scenario witnesses are UNCHANGED in
  semantics (the category witness was already `2469acc5…`).

— the Hush side, 2026-11-27 (the v4h session).
