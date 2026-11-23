Title:
Hush Your Money: Introducing Shielded Stablecoin Payments

Category:
Technology & Software

Owner (display name):
Shomari

Short description:
Hush Your Money is proud to introduce Shielded Stablecoin Payments — built on a ZK pool that has already run on BCH Mainnet. Help us fund the public Trusted Setup Ceremony that takes it to production.

--------------------------------------------------------------------------------

## INTRODUCTION

The shielded pool has already run on BCH mainnet: a **183,472-constraint** Groth16
circuit, a covenant, and a verifier, deployed and exercised with **1.00 PUSD** on
2026-11-20. [Four public mainnet txs](https://hushyourmoney.com/research/shielded-pool)

Hush Your Money ([ceremony](https://hushyourmoney.com/ceremony)) is preparing the
public trusted-setup ceremony that takes it from a 1-of-1 demo setup to production.


## WHY HUSH YOUR MONEY?

This project began back in 2020 at the [BCHDEVCON3](https://github.com/BCHDEVCON3/hush-your-money).

After the event, Bitcoin.com pledged to integrate my technology into their flagship wallet.
Unfortunately, their legal department intervened before we could ever launch.
*(first-hand account — there was no public news coverage)*

Passionate about financial privacy, I've continued working on the project over the last 6 years.
Continuing to experiment with privacy technologies, like CashShuffle and CashFusion.

Based on community interest in CashFusion, I've prioritized:
1. Nostr-based communications, to replace TOR
2. a NON-centralized liquidity provider (no coordinator)
3. remove Pedersen "subtraction" from the specification/protocol

**NOTE:** Pedersen "subtraction" is the SOLE reason why CashFusion has never been implemented into a Web client using JS/TS (author's assessment). The spec signs every amount and checks the homomorphic sum — `pedersen_amount = input_amount - fees` for inputs, `- output_amount - fees` for outputs — see [Phase 3 of the CashFusion spec](https://github.com/cashshuffle/spec/blob/master/CASHFUSION.md).


## THE BUDGET

**12.5 BCH** (≈ $2,500 at ~$200/BCH)

- Agent / Human code and security audits — **6.25 BCH** (~$1,250)
- Trusted Setup Ceremony preparations (hosting, tooling, outreach) — **2.00 BCH** (~$400)
- Social media PAID event promotions — **1.25 BCH** (~$250)
- Media and content generation — **1.25 BCH** (~$250)
- Documentation and contributor onboarding — **1.25 BCH** (~$250)
- Fees and contingency reserve — **0.50 BCH** (~$100)

`bitcoincash:qzdyw35wslfrk6qjrcva2ujzkwv5a6ufl5uhg5xjkg`

Direct donations are re-pledged to the campaign as "Anonymous" during the campaign.
Pledges are held by the CashStarter smart contract, never by me, and refundable
until the goal is claimed.

**All-or-nothing:** if the 12.5 BCH target is not reached, every contribution is returned.

## WHO IS SHOMARI?

If you don't know, then you better ask somebody.
I've been building on Bitcoin Cash since 2020.
And building on Bitcoin Core since 2013.

The team is a solo builder + Technical advisors + AI agents.

- [Original (HushYourMoney) repo](https://github.com/BCHDEVCON3/hush-your-money)
- [2020 BCHDEVCON3 presentation](https://odysee.com/@BCHPlease:1/BCHDevCon3-Hush-Your-Money-Presentation:7)
- [Upstream Groth16 verifier fix](https://github.com/mr-zwets/groth16_cashscript/pull/26) (merged 2026-10-30)

**FULL DISCLOSURE:**
I've had a poor track record with Bitcoin Cash fundraising in the past (25% funded at best),
so I'm hoping after delivering this BIG WIN for the community — the shielded pool:
Gates 1-6b measured on chipnet, plus a real mainnet pool deployment and 1.00 PUSD
shielded on 2026-11-20 ([research](https://hushyourmoney.com/research/shielded-pool)) —
that'll help shift the momentum back in my favor.
*(but only time will tell...)*

I'm very passionate about technology that SOLVES REAL PROBLEMS for regular people.
I've always favored Bitcoin Cash for its Layer 1 capabilities, even during the rise of Layer 2s.

At this time, I aim to make my MOST SIGNIFICANT contribution yet to this beautiful community.


## RISKS & CONCERNS

The protocol, circuit and covenant are complete and measured (Gates 1-6b).
What is NOT complete: the multi-party ceremony (Gate 7), independent audits,
and production hardening.

Small team. BCH's price moves; the budget is kept in BCH and spent as milestones
land. Timelines can slip.

Your support enables CONFIDENCE in the solution I've presented.
Your support sends a POSITIVE message to other ambitious Bitcoin Builders.

Primary contact: [@0xShomari](https://x.com/0xShomari)

--------------------------------------------------------------------------------

## REWARD TIERS

- 0.10 BCH · Silver — name listed on the Sponsors page
- 1.00 BCH · Gold — name and link on the Sponsors page
- 5.00 BCH · Platinum — name, link, and featured placement at the top of the Sponsors page

Recognition only — no tokens, no returns.
