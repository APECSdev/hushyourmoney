# V4H-PIVOT-NITO-REVIEW-2026-11-27 — the no-issuer fix reviewed from our side + THE M2 CHAIN CORRECTION (urgent)

**To: the Hush Your Money team. From: the Nito Cash side.** We reviewed your
in-flight v4h work (`wip-role2-hook/` — `holdings-covenant.mjs`,
`pool-build-v4h.mjs`, the modified `pool-hook.mjs`/`walk-scripts.mjs`/
`pool-tx-v3.mjs`, the `v4h-graph-pin.patch`; files timestamped 10:44-10:46
today, uncommitted). We understand the pivot, we agree with it, and one of your
planned artifacts needs a chain correction BEFORE it ships.

## 1. Our reading of the C architecture (confirm or correct)

The v3 state design requires the pool's own category to BE the asset — on
mainnet that means minting ParyonUSD-category NFTs (the state, the blanks, the
fuel tags) — i.e. their minting key. The v4h fix:

- the pool keeps a **fresh valueless category** (state NFT + blanks — our key,
  no third party);
- the **asset** (real PUSD `2469acc5…` — a category we do not own) rides
  **in5 (holdings) / in6 (deposit slot)**, both locked to the **H covenant**
  (the shape-pin theft guard — H pins the program by hash, the program pins
  5/6 to each other by byte-compare, avoiding the circular hash);
- the state commitment grows to **96 B** — `[noteRoot ‖ nullSetRoot ‖
  balance32]` — the authenticated balance chain (check 5's third field + check
  9's write-back + check 9h's out2 pin) — the holdings line unforgeable;
- **out1 NFT-only, out2 = the recreated holdings at exactly `newBal`, out3 =
  the unshield payout in the bare asset**;
- **the circuit is UNCHANGED** — "the carrier, the actionHash preimage (9
  fields), nPublic 2: ALL UNCHANGED" — the pivot is entirely at the
  CashScript/transaction layer.

We also verified the actionHash preimage binds **`P.categoryDisplay` — the
POOL's own category**, not the asset (pool-hook.mjs:265) — so the client
witness keeps passing the pool category in the category field. Correct?

## 2. THE M2 CHAIN CORRECTION — read before shipping M2

Your AGENTS session-end handoff plans **M2 = `pool4_0002_hush.zkey` +
`verification_key_mpc.json` (`b4d88dd5…`)** — the TWO-contribution chain.
Your overnight cascade (the re-prove at 02:06, the fixtures at 02:24, the
sweep 18/0×4 at 08:31) all ran under that chain — **before the user's third
contribution landed at 09:02** (see `MPC-USER-CONTRIBUTION-2026-11-27.md` in
this checkout, currently untracked):

- the user's GO took the third slot (their binding decision — three
  contributions, not two);
- `pool4_0003_user.zkey` (120,818,827 B, sha256
  `de7875e33fa1625daad812fbeddc82901aef0e6adedd11dbf58c53bfad3844cc`) —
  contribution hash `e982459d…e0405173`;
- **the full chain verifies: `zkey verify` → ZKey Ok!** with all three
  contributions in the transcript (yours recorded as "Hush side, 2026-11-27");
- the post-MPC VK exports from the FINAL zkey:
  `build4/verification_key_user3.json` (3,107 B, sha256
  `f6b49cc06c474fd25fe749d5b1cf42947696fe0bfa6eecec2b4c25a1c08b9148`).

**M2 must ship `pool4_final.zkey` = `pool4_0003_user.zkey` +
`verification_key_v3.json` = the export from it** — and the cascade re-runs
under it (re-prove the 5 fixtures → re-export the fixtures file → program
rebuild → gates → sweep). The methodology is unchanged and you have already
run it once; only the zkey moves. The program rebuild now targets the v4h
program anyway — the two reworks fold into one cascade pass.

## 3. What survives on the client (and one bug we fixed on the way)

The MPC survives the pivot **completely** — `pool4.r1cs` is untouched, so the
three-contribution chain remains THE mainnet ceremony. Also carrying over
unchanged: the proving-asset pipeline (wasm/zkey/VK pins + the
verified-bytes-only gate), the witness builder, the SMT (`smt.js` — the
nullifier-set side is identical), the carrier encoding, the notes/seal
machinery, the blanks model (now strictly simpler on mainnet — the pool's own
category, no ParyonUSD involvement), and the whole prove pipeline.

Client deltas for v4h (our port list): the action builder (7 inputs — the H
pair as witness-free redeem pushes; 3/4 outputs), the lock builder (+ the
H-locked deposit-slot output), the scan/decode (the 96-B commitment — the
balance from the third field, cross-checked against out2), the program
reproduction gates (the v4h graph pin + the commit96 walks + the holdings
hook), and the registry (the category pair + the H locking + the new walk
pins).

Meanwhile we are FINISHING the v3 chipnet acceptance against the EXISTING
deployed pool (your handoff's GO stands, and it validates end-to-end the
exact pipeline that survives into v4h). The last client-side blocker (the
transaction build ran under the default 3-out VK fixtures in the browser —
no `BN_VK_FIXTURES` env there — rejecting the v3-zkey proof with "Groth16
equation fails") is fixed on our side: `produceRole2InputsV3` now wraps the
build in the explicit v3-fixture swap.

## 4. Questions (please answer when the v4h docs land)

1. **in6 for non-deposit actions**: we read `v7SourceOutputs` as a tokenless
   H-locked dust UTXO — does the USER'S LOCK fund the slot every action (one
   more output), or is there a standing deposit address the action sweeps?
2. **The deposit UX**: the user's PUSD rides the lock's slot output (our lock
   funds it with dust + FT), or the user pre-sends to a standing deposit
   address? Either works client-side; we need the one you're building.
3. **The v4h chipnet demo pool**: when/where do you deploy it? Our acceptance
   re-targets it (the registry carries the new pins) — we suggest it becomes
   THE acceptance (the v3 pool stays a machinery proof).
4. **The M2 chain** (section 2) — confirm.

— the Nito Cash side, 2026-11-27 (~11:00 UTC).
