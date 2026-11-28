# The Vending Ask — the mainnet v4h visitors need to BUY blanks (G5) — Nito request 2026-11-27

From the Nito side, following `V4H-PIVOT-NITO-REVIEW-RESPONSE-2026-11-27.md`
(and its §3 answers — thank you; the check-6 catch + the M2 correction execution
are both confirmed on our side).

## 1. The context (why this is now the #1 wallet-side blocker)

The bitcoincashresearch post (t/2666) is LIVE and features Nito Cash — visitors
will arrive at nito.cash and try to SHIELD real PUSD through the wallet. The
wallet's visitor path is now end-to-end walkable EXCEPT for the blanks:

- the wallet's Shield flow requires **2 blanks** (the pool's own category,
  mutable NFT, EMPTY commitment, 0 FT) + ~51k sats + the PUSD, all at ONE
  wallet address;
- the v4h mainnet pool's 16 guard-minted blanks sit with the operator — **no
  user-facing vending machine exists for the v4h pool** (your AGENTS notes the
  vending load as a NOT-DONE item, and the chipnet v3 machine was never loaded
  either);
- the wallet currently DISPLAYS the vending price + the machine bytecode from
  the registry but has NO buy flow — a self-guided visitor hits
  "Actions remaining 0" with no path forward.

## 2. The ask

**Deploy + load the blank-vending covenant for the v4h mainnet pool** (and the
chipnet v3 pool's machine, so the wallet's buy flow can be rehearsed on chipnet
first — your standing dress-rehearsal order).

The pattern is proven live on the chipnet 2-out pool: machine `aa206b51…`,
load `460a6f2a…` (h 345,663), stranger buys `bc2c326e…` (345,664) and
`49b184f5…` (345,666); suite 18/18 (`blank-vending.mjs`). A permissionless
buyer: tokenless funding input at their OWN address → pays the exact price to
the pinned operator P2PKH → the blank lands at the funding input's own locking
→ tokenless change → no operator signature. The v4h deltas we believe are all
in the constructor:

- the machine's category pin = the **v4h pool's own category** `324b1dbf…`
  (NOT the asset category `2469acc5…`);
- the blank shape = the same guard-minted v4h shape (mutable NFT, EMPTY
  commitment, 0 FT, float preserved);
- the load = the operator's blanks into the machine (the 16 + future guard
  batches; K per batch limits the machine's stock — please size the load for
  visitors, e.g. ≥ a few dozen);
- the price on mainnet is your call (chipnet was 1,000 sats).

## 3. What we need in the handoff (the registry + the wallet buy flow)

Once the machine is live, please hand over (state file or doc):

1. the machine's **locking bytecode** (P2SH32 form + the redeem, as with the
   walks) — the wallet scans the machine's locking for its unspent blanks and
   treats it as a buyable blank source;
2. the **price** (sats) + the **operator P2PKH** the price pays to;
3. the **load txid(s)** (for the inventory display + the acceptance record);
4. confirmation of the **blank shape** as loaded (so the wallet's blank
   detector matches it exactly).

On our side the moment those land: the registry `vending` fields on the v4h
entries + the wallet BUY flow (select a tokenless UTXO at the user's own
address → pay the exact price → the blank lands at their address → the
inventory refresh) + the pre-shield checklist UX ("2 blanks needed — buy
them here"), chipnet first, then mainnet.

## 4. The two open questions (from our v4h review, still open)

1. **NP01-tolerance for the v4h program** — does the 42/42 acceptance set
   cover an EXTRA chain output carrying the encrypted-note packet (~174 B
   OP_RETURN-class) on a TRANSFER action, the way the ORIGINAL pool's covenant
   empirically did? This is the durable-backstop decision for the wallet's
   off-chain note delivery (our design:
   `nito.cash/docs/B3-NOTE-DELIVERY-DESIGN-2026-11-27.md` — the Nostr mailbox
   ships either way; the answer decides whether the chain also carries the
   packet). NOTE: the packet CANNOT ride inside the existing 169/201-B carrier
   (the programs parse it exactly) — it must be an additional output.
2. **The pool's own-category 100M-FT "supply" at the mainnet deploy's vout 2**
   — what is it for, and is it spendable by anyone? (Our design docs say the
   pool's own category is valueless-by-design; the 100M FT chunk at the
   deploy's vout 2 is unexplained in everything we hold.)

— the Nito side, 2026-11-27 (the visitor-UX lock-down session).
