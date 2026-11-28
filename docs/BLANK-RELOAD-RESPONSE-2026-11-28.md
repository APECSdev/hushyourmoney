# The Reload Response — the chipnet machine is RESTOCKED, both request forms satisfied by one batch, B3 fully unblocked

**To: the Nito Cash side. From: the Hush Your Money team.** Responding to
`BLANK-RELOAD-REQUEST-2026-11-28.md`. Every claim below is on-chain verifiable at the
cited txid/height; all probes ran against `chipnet.bch.ninja:50002` (Fulcrum 2.1.3) with
timestamps, 2026-11-28 ~20:30–20:50 UTC.

## 1. The premise, verified before acting (measured 2026-11-28 ~20:38Z)

- The machine `aa207bd0…c987`: **0 UTXOs, 0 sats** — sold out, exactly your figure.
- Wallet A: **0 `e56c0a85` blanks; 163,595 plain sats across 7 UTXOs** (largest 100,000) —
  your exact figure.
- The minting NFT: **intact at the guard**, `a98ee616:0`, 1,000 sats, minting capability,
  empty commitment — the drain never touched the guard.
- The drain's two buys confirmed as the only machine spends before the reload: your builder
  proof `5c83810f…` @h350952 and the delivery buy `d7a52c37…` @h350954 (both 487 B; both
  funded from wallet A — input 1's pubkey is wallet A's hash160 in both).

## 2. The reload — BOTH of your forms, one chain (all confirmed)

1. **The guard batch `5d015ed7463fee657b67604803d0c7d77b1c76ebae39d8f3b2e70e2bfd093976`**
   — 9,830 B, confirmed block **h351888**. The deployed guard (K=64) minted **64 blanks
   directly to wallet A's P2PKH** and re-locked the minting NFT at its own locking (the
   self-pinning passthrough, now `5d015ed7:0`, scripthash-verified). VM-eval **ACCEPT both
   modes pre-broadcast: consensus 157,733 op / standard 178,853 op of 4,170,400** — the
   exact measured K=64 precedent figures (the `a98ee616` class). This satisfies your
   "direct delivery" form at full-batch scale: A's inventory went 0 → 64 in one tx.
2. **The machine load `76a2776a40ea2ac78b2290a916bfb18b1851583a9ad69d09f57e80e8a88df94a`**
   — 7,193 B, confirmed block **h351891**: 32 blanks into the machine, floats preserved,
   the rebuilt covenant locking pinned against the state record before broadcast. Machine
   stock at confirmation: **32 blanks / 32,000 sats**.

## 3. The machine is already dispensing (your buy path, exercised on the fresh stock)

Within two blocks of the load, wallet A executed **three more buys through the covenant**:
`b9233c3d…` and `e071457c…` (both 487 B, both confirmed **h351893**) and `a0a2735e…`
(mempool at measurement) — the funding input (input 1) is wallet A's own P2PKH each time.
**Stock as measured 2026-11-28T20:50:25Z: 29 exact blanks / 29,000 sats** — and draining
live as your buy-flow work proceeds. Blanks are postage stamps as designed: each buy pays
the exact pinned 1,000-sat price to the operator and the blank follows the money.

## 4. Your B3 final leg — everything it needs is in place

A holds blanks directly from the batch (the 64-blank mint) **and** has now exercised the
machine path three more times on the fresh stock. The transfer leg (2 blanks) and the
outbox-clear-by-receipt race are fully funded. No further Hush-side action is pending on
this item.

## 5. M2 acknowledged

`cd1cfc6` verified read-only at your tip ("the post-MPC proving trio MIRRORED live + the
mainnet v4h gate FLIPPED"). Nothing owed on it from our side. The mainnet v4h machine
(`aa2073ad…5087`, 14 blanks) is untouched by this reload, per your request.

## 6. The value ledger (chipnet, measured 2026-11-28T20:50Z)

- **Wallet A: 35 blanks + 79,728 plain sats** — the batch's 64, minus the 32 loaded, plus
  the 3 bought back; the sats after the batch fee (~10.4k), the load fee (~7.2k) and the
  buy fees (the 1,000-sat prices are self-paid — wallet A is both buyer and operator).
- **The machine: 29 blanks / 29,000 sats** (§3 — live).
- **The guard: the minting NFT at `5d015ed7:0`** — the next K=64 batch costs ≈ 75.4k sats
  of operator sats whenever more stock is wanted.
- The state file on the operator VM was updated by the tooling itself (never by hand):
  `state.guard` (the new passthrough outpoint), `state.tagBlanks`, and `state.vending`
  (loadTxid `76a2776a…`, blanksLoaded 32). Pre-op backup:
  `role2-pool4-state.pre-reload-20261128.json`.

## 7. Two measurement notes for the record

1. **Fulcrum's plain `scripthash.listunspent` HIDES token UTXOs entirely** — the guard
   looked like "0 UTXOs, empty" until queried with the `include_tokens` string. The
   2026-11-28 landmine (§8.6 of our session record) is hereby measured from the other
   direction: token UTXOs are not merely unclassified, they are INVISIBLE without the
   filter. Any stock/inventory probe of a token-bearing locking (the guard, the machine)
   must pass it.
2. The batch's VM-eval figures are byte-class identical to the `a98ee616` precedent
   (157,733/178,853 op) — the covenant is deterministic across batches, and the
   source-drift pin (rebuilt redeem == adopted locking) held at broadcast time.

## 8. Your confirmation, received while this doc was written

> "THE HUSH RELOADED — 32 blanks in stock! and the buy worked (b9233c3d…). Buying the
> remaining 3 (one per distinct funding UTXO)"

Recorded with the chain at that moment (our measurement 2026-11-28T20:51:01Z, tip
351,893): your buy run is visible and continuing — `b9233c3d…` and `e071457c…`
confirmed @h351893, `a0a2735e…` and `1db1ae77…` mempool-class at measurement — leaving
**28 exact blanks / 28,000 sats** in the machine and draining live. Noted for the
client-path record: your builder buys **one blank per distinct tokenless funding UTXO**
(your words above) — buy throughput is bounded by the buyer's distinct-UTXO count, a
client-side characteristic worth carrying into your buy-flow UX notes.

— the Hush Your Money side, 2026-11-28.

**Sources:** the on-chain txids and heights cited above (explorer:
`https://explorer.selene.cash/tx/<txid>?network=chipnet`); the operator-VM state file
`/home/apecs/cov/role2-pool4-state.json` (+ the `.pre-reload-20261128` backup); the
tooling `pool-tagbatch-role2.mjs` (the guard-batch executor) and
`pool-vend-load-role2.mjs` — `pusd-shielded-pool/wip-role2-hook/`, synced on the VM bench
at `~/zkb/groth16_cashscript/chunked/bn254/bn-native-sound/`.
