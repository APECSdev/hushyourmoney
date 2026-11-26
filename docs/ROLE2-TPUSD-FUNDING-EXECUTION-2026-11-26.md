# Role-2 tPUSD funding — Hush execution record (2026-11-26)

**From:** hushyourmoney
**To:** nito.cash (APECS)
**Re:** `docs/ROLE2-TPUSD-FUNDING-HANDOFF-2026-11-26.md`

Status: **Hush-side funding and blanks are DONE on chipnet. The browser
SHIELD → TRANSFER → UNSHIELD acceptance has NOT run; the Nito store blockers
in the handoff §4 and the two additional blockers in §4 below still stop it.**

## 1. Funding transaction

`8f3bf793dbb8e90006137a19aaff51615a74933f9014a7ad6d960003030e5538`
(2 confirmations at capture).

- input `97d135f9…:3` — 99,000,000 tPUSD, 1,000 sats (operator)
- input `460a6f2a…:3` — 39,671 sats (operator)
- output `:0` — **20,000,000 tPUSD**, 1,000 sats → wallet A
- output `:1` — **35,000 sats** → wallet A
- output `:2` — 79,000,000 tPUSD, 3,727 sats → operator
- fee 944 sats; change 3,727 sats (the token change carries the 79M FT)

The handoff’s `--bch 200000` was **not** used: the operator held 43,671 plain
sats, so 200,000 was impossible. The role-2 lock floor is 32,000 sats; wallet A
already held 3,423. A 35,000-sat send gives wallet A 38,423 before the blank
purchases.

The faucet key copy added **both** `address` and `publicKeyHex`; the actual
`faucet-hot-wallet.json` has `addresses` but neither field. `privateKeyHex` was
stripped of its `0x` prefix for `send-tpusd.mjs`; that script does not strip it.

The local `send-tpusd-role2.mjs` used for this run lowered the old 50,000-sat
guard to 32,000. The Nito `scripts/send-tpusd.mjs` still enforces 50,000; it
needs the role-2 floor if it is used again.

## 2. Vending load

`c5a4d80c461fa58d8f000d58300a00f3f175d872a7438e10f33ddcd67e6f146e`
(2 confirmations at capture).

- 2 blanks loaded into `aa206b51…`
- inputs: the two operator blanks + the operator’s four 1,000-sat plain UTXOs
- the vending machine now held two blanks (`c5a4d80c:0`, `c5a4d80c:1`)
- the handoff’s `--fund-sats 50000` was **not** used; the operator did not have it

The stock `pool-vend-load-role2.mjs` uses only `plain[0]`; the operator’s plain
BCH was four 1,000-sat UTXOs, so a multi-plain local copy was used. The tool
needs to accumulate plain UTXOs (or the operator needs one larger plain UTXO).

The updated state file is `/home/apecs/cov/role2-pool-state.json`; the
pre-load backup is `/home/apecs/cov/role2-pool-state.pre-vend-20261125.json`.

## 3. Blank purchases

Both purchases used wallet A’s own key and the vending covenant; both VM-eval
consensus and standard **ACCEPT**:

- `dd9903c8ac7f4a1628ef44c4b397bca143bb9d76c4fb2cf8c4151a2dc43e7874`
  — machine `c5a4d80c:0` → wallet A `dd9903c8:0`; price 1,000 sats; 487 B.
- `09f7c1a6d0acc33b05adce288489d441759e3518e690bd2f68382b85cfd28651`
  — machine `c5a4d80c:1` → wallet A `09f7c1a6:0`; price 1,000 sats; 487 B.

The machine is empty after the two buys. The state’s `vending` records the
load; the blank-buy script does not update the state.

## 4. Wallet A state at capture

- `8f3bf793…:0` — 20,000,000 tPUSD, 1,000 sats
- `dd9903c8…:0` — blank (mutable NFT, empty commitment, 0 FT), 1,000 sats
- `09f7c1a6…:0` — blank, 1,000 sats
- `1014f843…:1` — 3,423 plain sats (old)
- `09f7c1a6…:2` — 30,826 plain sats (change)
- total plain: **34,249 sats**

The lock needs 2 × 15,000 fuel + the lock fee; the two blanks are separate
inputs. 34,249 plain + 2,000 blank sats covers the 30,000 fuel and the fee with
change.

The wallet A key file is `/Workspace/apecsdev/.secrets/wallet-a-role2-demo.json`
(derived at `m/44'/145'/0'/0/0` from the handoff entropy; address verified). The
faucet copy is `/Workspace/apecsdev/.secrets/faucet-hot-wallet-with-address.json`.
Both are outside the repo; mode 600.

## 5. Nito-side blockers that still stop the acceptance

The handoff §4 lists the raw-UTXO, blank-selection, state-token and outpoint
bugs. Two more are not in that list:

1. **The `walletProverCompatible` gate.** `nito.cash/apps/web/src/store/modules/pool.js:357`
   rejects unless `pool.walletProverCompatible === true`; `registry.js:92` is
   `false`. The handoff’s step 3/4 calls the store action; step 5 flips the flag.
   The run cannot pass the gate before the flip; the flip is supposed to follow
   the run. An acceptance override or flip-before-run/revert-on-failure
   procedure is required.
2. **Two unspent pool notes.** `pool.js:422-429` requires two unspent notes for
   every action, including SHIELD. Wallet A has no `480e30ff…` notes. The SHIELD
   throws before the proof. The role-2 SHIELD needs two **unspent, private**
   notes. The registry's `bootstrapNotes` are the pool's once-only genesis pair
   (leaves 0/1, `nk = 1`, value 0); the first SHIELD `9d9aa97a…` carrier carries
   their nullifiers, so they are **spent**. Reusing them is a value-0
   double-spend and gives the SHIELD a **public fuel tag**
   (`SHA256(nf0_LE ‖ nf1_LE)`), which defeats the deposit-tag author binding.
   Hush will pre-seed wallet A with two private notes from the pool's 750,000
   balance via a Hush-side SHIELD; the browser SHIELD then uses those notes.

Also still open from the prior review: the old local zkey default
(`prover.js:177` / store `generateProof(witness)`), the incomplete
`state.leaves` tree, the deterministic note secrets, and the missing supply
UTXO in the store’s SHIELD path.

## 6. Security note

The handoff contains wallet A/B mnemonics and wallet A entropy; it is committed.
The user’s direction is to rotate all keys after the objectives. Until then,
the demo wallets are public and the 20M tPUSD + 34,249 sats are sweepable; the
acceptance must run in a controlled window. No mainnet funds are involved.

## 7. Next action

The Nito team must fix the flag gate and the two-note bootstrap (and the §4
store bugs) before the browser acceptance. Hush has completed the funding and
the two blanks.
