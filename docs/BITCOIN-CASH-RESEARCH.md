<!-- docs/BITCOIN-CASH-RESEARCH.md -->

Title:
Hush Your Money: Introducing Shielded Stablecoin Payments for Bitcoin

Category:
Technical

Optional tags (verified against the forum's tag set — tags.json, 2026-11-27):
- applications
- bch-native
- contracts
- audits

--------------------------------------------------------------------------------

STATUS: READY TO POST (TEMP links) — the three mainnet lifecycle links are
TEMPORARY for the hackathon deadline; the permanent pool will replace them
(no verbiage changes in the meantime, per the user ruling). The permanent-pool
checklist + the verification ledger live in BITCOIN-CASH-RESEARCH-NOTES.md.
Everything below this line is the post.

**Hush Your Money (https://hushyourmoney.com) has delivered a NEW Unique Value Proposition (UVP) for Bitcoin with a BRAND NEW Shielded Stablecoin Payments protocol, tentatively titled "The Hush Protocol"**

### ParyonUSD (PUSD) — a CashToken stablecoin on Bitcoin Cash — running shielded.

### Mainnet Preview v0.

---

**PAYMENTS is the operative word.**

This is NOT a privacy pool like Tornado Cash, where you deposit and withdraw.
This IS a privacy pool like Zcash, where you send shielded payments to other
people — but with a stablecoin.

To our knowledge, as NATIVE private stablecoins, ONLY 2 OTHERS EXIST IN THE
WORLD:

- **USDCx on Aleo (Circle)** — "one of the first private, programmable,
  dollar-denominated stablecoins," backed 1:1 by USDC in Circle xReserve,
  live on mainnet (https://aleo.org/usdcx/)
- **Freedom Dollar (FUSD) on Zano** — *"A private stablecoin. Send dollars
  without anyone knowing how much, to whom, or when."*
  (https://freedomdollar.com)

(General-purpose protocols you can shield a stablecoin through also exist —
RAILGUN on EVM chains, Namada over IBC — but natively private stablecoins are
what this list counts.)

And now **PUSD on Bitcoin Cash**.

## The research is EXTENSIVE

The research behind this protocol is EXTENSIVE — six years of it — and perhaps
inappropriate to try and fit into a post.

It started at BCHDEVCON3 in 2020
(https://github.com/BCHDEVCON3/hush-your-money). Bitcoin.com pledged to
integrate the technology into their flagship wallet after the event — their
legal department intervened before launch (first-hand account; there was no
public news coverage). Since then: CashShuffle, CashFusion, coordinator-free
fusion over Nostr — and now this.

If you're inclined to LEARN how it all works, I would advise you to set your
favorite clanker(s) on stun and point them to:

**https://hushyourmoney.com/research**

If you click on ONE link, let it be:

**https://hushyourmoney.com/compare**

If you click on a 2ND link, please let it be our Nito Cash hackathon BUIDL —
and if you like what you see, VOTE for it:

**https://dorahacks.io/build/49513**

## See it LIVE ON MAINNET

If you want to see it LIVE ON MAINNET, then these are the links for you:

- **SHIELDING**: 627013caa09b2e42ae4229bbd15bc2f53561911d1ccb0e09d260af937c012403
  (https://explorer.selene.cash/tx/627013caa09b2e42ae4229bbd15bc2f53561911d1ccb0e09d260af937c012403?network=mainnet)
- **TRANSFER**: 4fda8a8b63ff2ef82cc1f5a9ad89bdcbbc86fec254e9c08bb1b874312f6b544f
  (https://explorer.selene.cash/tx/4fda8a8b63ff2ef82cc1f5a9ad89bdcbbc86fec254e9c08bb1b874312f6b544f?network=mainnet)
- **UNSHIELDING**: 998a04748b6db7845cd06ef37ab0a51c26b685c0a458a59f7700df873215734d
  (https://explorer.selene.cash/tx/998a04748b6db7845cd06ef37ab0a51c26b685c0a458a59f7700df873215734d?network=mainnet)

Every action is a single transaction, and every input was evaluated on the
BCH-2026 VM in both consensus and standard mode before broadcast. Fees are
BARE, ~1 sat/B; an action is ≈45 KB.

### Nito Cash is the FIRST implementation — TRY IT

**Nito Cash** (https://nito.cash) is the first wallet implementation, and it is
the easiest way to try shielded stablecoin payments on Bitcoin Cash:

1. **swap BCH for PUSD**,
2. **SHIELD your PUSD**,
3. **TRANSFER it to another Nito Cash wallet**.

Vote for the BLAZE Hackathon BUIDL while you're there:

**https://dorahacks.io/build/49513**

## DISCLAIMER

This is a PREVIEW V0 POOL
AND IT IS NOT SAFE!

Mainnet ONLY exists for your convenience, so that you can play with REAL
ParyonUSD, as there is no Chipnet version of this stablecoin.

Do not put value through it that you are not prepared to lose. The audit and
the full public ceremony (below) are still ahead of it.

## What is actually running (the short version)

- **A shielded pool with a payment action.** SHIELD in, TRANSFER onward,
  UNSHIELD out — arbitrary amounts, not fixed denominations.
- **The rules live INSIDE the verifier.** No separate covenant, no step fleet,
  no trusted server: every pool rule is enforced by a hook inside an
  independently reviewed on-chain BN254 Groth16 verifier program. Actions are
  signature-free; the wallet proves locally; the chain checks everything.
- **The circuit (our v3):** 247,120 constraints, 2 public inputs. It proves
  the joinsplit AND the note-tree append, enforces distinct nullifiers, and
  ships a deposit path — new users enter against an EMPTY tree, with no
  bootstrap seed notes.
- **A real nullifier set, on-chain.** Every action carries two "walk" inputs
  that traverse a SHA256 sparse Merkle tree in Bitcoin Cash script; a spent
  nullifier is rejected at consensus.
- **Fees:** BARE, ~1 sat/B.
- **Gates under the current verifying key:** acceptance 29/29, red team 164/0,
  liveness sweep 69/0.
- **It has run on BCH mainnet before:** an earlier generation ran a
  four-transaction mainnet demo with a real proof; the full generational
  record is on the research page.

One action, end to end — a single transaction, five inputs, signature-free:

```
 in0   fuel UTXO    sats ride here (fees) — the FT deposit, if any
 in1   fuel UTXO    sats ride here (fees)
 in2   state NFT    the pool state (noteRoot ‖ nullSetRoot)
 in3   walkA UTXO   inserts nf0 into the on-chain nullifier set
 in4   walkB UTXO   inserts nf1 into the on-chain nullifier set
 ────────────────────────────────────────────────────────────────
 out0  OP_RETURN    201-B carrier (nf0 nf1 cm0 cm1 cm2 newRoot pv sign)
 out1  state NFT    new state (newRoot ‖ finalNullRoot)
 out2  payout       UNSHIELD only — pv FT to the recipient
```

Every measurement, every transcript, and every finding we disclosed on the way
here lives at:

**https://hushyourmoney.com/research/shielded-pool**

## What we disclosed on the way here

Honesty first — three drain-class findings were demonstrated against earlier
generations of this pool, all published:

- **R2-NULLIFIER-DOUBLING** — one note spent as both inputs; the honest prover
  itself produces the draining proof. Closed in the current generation:
  distinct-nullifier constraint + the on-chain nullifier set.
- **R3-FREE-NEWROOT** — the new Merkle root was a free witness input; two
  ordinary proofs could drain any pool. Closed in the current generation: the
  append is proven in-circuit.
- **F6 + the sibling hole** — the upstream verifier our first generation used
  was withdrawn by its author, and the old covenant never pinned its verifier
  input. Closed in the current generation: the rules moved inside an
  independently reviewed verifier, with nothing unpinned beside it.

The pools that ran before v3 were demo-grade. This one is a PREVIEW — see the
disclaimer above.

## The trusted setup — feedback wanted

Groth16 needs a circuit-specific trusted setup. Whoever holds the toxic waste
can forge proofs for that circuit — the setup IS the security boundary, not a
formality. One honest contributor is enough to make the key sound; every
additional contributor strengthens the social guarantee.

Where we are:

- Every pool before the current generation ran a disclosed single-party
  (1-of-1) demo setup.
- The current generation just ran a two-party mini-MPC — one contribution from
  the Nito Cash team, one from ours, both entropies unpublished — and the final
  key verifies against the public transcript. The Mainnet Preview v0 pool runs
  under that final verifying key.
- Phase 1 is the public Perpetual Powers-of-Tau transcript (`ppot_0080_18`),
  which transitively includes my own #0023_shomari_response.
- The production bar remains a full public multi-party ceremony: many
  contributors, a published transcript, and a verification recipe anyone can
  replay.

The Tornado Cash trusted setup drew
[1,114 contributions](https://web.archive.org/web/20220125175849/https://docs.tornado.cash/).
I'm all but certain that Bitcoin Cash can outdo that.

We are raising funds to run the ceremony properly — audits, ceremony prep, and
contributor tooling; the budget breakdown is on the campaign page:

**https://fundme.cash/campaign/180**

And we want your feedback on the design before we run it. Comment below:

1. Contributor UX — browser or CLI?
2. Scheduling and coordination — how do we maximize independent participation?
3. Transcript hosting and third-party verification tooling.
4. Contributor incentives.

## Related reading on this forum

- ECDH Stealth Addresses on Bitcoin Cash — Implementation & Code:
  https://bitcoincashresearch.org/t/1773
- 94 percent of all BCH transacted since July 2020 is now a descendant of a
  CashFusion transaction: https://bitcoincashresearch.org/t/752
- Is there interest in a Red Team analysis of CashFusion?:
  https://bitcoincashresearch.org/t/525

## Links

- The ONE link: **https://hushyourmoney.com/compare**
- Research hub: **https://hushyourmoney.com/research**
- The shielded-pool record: **https://hushyourmoney.com/research/shielded-pool**
- Ceremony: **https://hushyourmoney.com/ceremony**
- Nito Cash (first implementation): **https://nito.cash**
- Vote for the hackathon BUIDL: **https://dorahacks.io/build/49513**
- Campaign: **https://fundme.cash/campaign/180**
- Circuit + hook source: **https://github.com/APECSdev/pusd-shielded-pool**
- Site + registry: **https://github.com/APECSdev/hushyourmoney**

## Disclosure

- This is a PREVIEW V0 POOL and it is NOT SAFE — see the disclaimer above.
- No independent audit yet.
- The ceremony is pending: the current key is a two-party mini-MPC
  (demo-scale); production waits for the full public ceremony.
- Treat any PUSD you route through the Preview as disposable.

## 2027

2027 will be the year that Bitcoin Cash regains its TOP10 status,
not ONLY as the leading Layer 1 network,
but now as the leading private payments solution for EVERYONE!
