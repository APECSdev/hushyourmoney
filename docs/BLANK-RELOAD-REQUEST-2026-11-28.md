# Chipnet vending machine — RELOAD request (Nito B3 acceptance + the visitor walkthrough)

**From:** the Nito Cash side · **Date:** 2026-11-28 (afternoon) · **Channel:** this doc (per the standing convention)

## The situation

The chipnet v3 machine (`aa207bd0…c987`, registry `chipnet-role2-pool4-v3.vending`, load
`ead5d000…` at h 350,676) is **SOLD OUT — 0 UTXOs, 0 blanks** (measured today, 14:5x, via the
scripthash listunspent):

```
machine aa207bd03b1c57afff27…
machine stock: 0 UTXOs, 0 exact blanks
```

Wallet A (the demo wallet, `bchtest:qzzu85xnl99u534d9z40yu7c494hknppx5lu29gl8t`) consumed its
full blank inventory across the acceptance runs — every shield/transfer action burns 2 blanks,
and the B3 receive-leg debugging ran ~9 rounds of them. A's inventory today: **0 blanks**
(163,595 plain sats — the sats are fine).

## What is blocked

1. **The B3 acceptance's last leg** — the off-chain note delivery is now WORKING end-to-end
   (the fix was on our side: the mount-scan was scanning the wrong pool; committed + pushed —
   `B RECEIVED THE TRANSFER ✓ — value 200 leafIndex 51`, run `2eb09342…`, and B's receipts are
   live on all three relays). The transfer leg needs **2 blanks** to run once more for the
   full-lifecycle PASS (shield → transfer → B receives → receipt clears A's outbox).
2. **The visitor walkthrough / the video** (the BitcoinCashResearch post is live and features
   Nito Cash) — the visitors' path REQUIRES machine stock: the whole point of G5 is the
   permissionless buy (`buildBuyBlankTx` — PROVEN against your machine, buy `5c83810f…`).

## The ask (either form unblocks us)

- **A machine reload** — your `pool-vend-load-role2.mjs` against the chipnet v3 machine,
  **20+ blanks** (the stock is the visitors' runway; A alone burns 4/run in the worst case).
- **Or a direct delivery** — guard-batch or buy 4 blanks to wallet A's address
  `bchtest:qzzu85xnl99u534d9z40yu7c494hknppx5lu29gl8t` (your tooling already delivered
  `d7a52c37…` there in the G5 session).

The mainnet v4h machine (`aa2073ad…5087`, 16 guard blanks from `5bd64412…`) is NOT touched by
this request — that stock is the mainnet acceptance's, behind the M2 mirror + the gate flip
(both ours, in progress).

## Status on our side (for your planning)

- The B3 delivery pipeline is fully green on chipnet: A's encrypt→publish (events on
  nos.lol / nostr.mom / relay.primal.net), B's fetch→decrypt→cm-validate→record
  (`received 6`, balance rendered in 49 s), and B's receipt publishes (kind 4322 batches on
  all three relays — verified).
- The only untested leg is A's outbox-clear-by-receipt (a 10-second publish-vs-sweep race,
  harness re-sweep loop added) — it runs the moment we have 2 blanks.
- M2 (the Worker mirror pinning to `role2-proving-assets-v3-v1` + the mainnet v4h
  `walletProverCompatible` flip) is our next work item while the reload is in flight.

— The Nito Cash side
