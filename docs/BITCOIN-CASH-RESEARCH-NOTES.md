<!-- docs/BITCOIN-CASH-RESEARCH-NOTES.md -->

# Supporting notes for BITCOIN-CASH-RESEARCH.md (the forum post draft)

NOT FOR PUBLICATION. This file holds the publish gates, the placeholder
inventory, the verification ledger, and the decision record for the draft at
docs/BITCOIN-CASH-RESEARCH.md — kept separate so the post file is CLEANLY the
thing we are agreeing to publish.

## Publish gates

THE BLOCKER (user ruling 2026-11-27): the mainnet Preview v0 lifecycle links —
the three XXX txids in the draft. Everything else is completed in the meantime:

1. `[SWEEP]` — the post-MPC liveness sweep result. 4 shards were still
   running on the VM at 2026-11-27 13:36Z; expect 69 cases / 0 failed
   (`grep -c "failed" /tmp/sweep-v3mpc-s*.log`; merge per the
   `/tmp/pool-sweep-v31-s*.json` precedent → `wip-role2-hook/`). Note: this
   also feeds the M2 release → the M5 mainnet deploy, so it is on the critical
   path to the blocker itself.
2. The v3.1 record LIVE on https://hushyourmoney.com/research/shielded-pool —
   at 2026-11-27 the live page carries the R2 disclosure but NOT the v3.1
   record (R3-FREE-NEWROOT / pool4 / 247,120 all absent) — plus the Flux
   rollout settled.
3. Nito confirms the BCH⇒PUSD swap is live in the wallet (not verifiable from
   this repo).
4. Fill the three mainnet lifecycle txids + Selene `?network=mainnet` links
   after the Preview v0 deploy + confirmations.

## Placeholder inventory (inline in the post)

- Three `XXX` mainnet txids (SHIELDING / TRANSFER / UNSHIELDING) + their
  Selene links — at fill time, link the txid TEXT inline
  (`[txid](https://explorer.selene.cash/tx/<txid>?network=mainnet)`) instead
  of bare URLs in parentheses; bare URLs on their own line render as Discourse
  onebox cards and explorer pages carry no preview metadata.
- `[SWEEP]` — the sweep result line in "What is actually running".
- Publish-time option (recommended): a short "verify it yourself" block with
  the PUSD asset-category txid (Selene mainnet link) + the pool program hash,
  so forum readers can check the pool on-chain without trusting us.

## Verification ledger (2026-11-27, this host)

In-class, NATIVE private stablecoins (the post's list):

- **USDCx on Aleo (Circle)** — https://aleo.org/usdcx/ (fetched 2026-11-27):
  "USDCx on Aleo is one of the first private, programmable, dollar-denominated
  stablecoins on the Aleo network. It is fully backed 1:1 by USDC held in
  Circle xReserve"; "leverages zero-knowledge (ZK) cryptography"; "Available
  on Mainnet now"; P2P payments/remittances listed as a use case.
- **Freedom Dollar (FUSD) on Zano** — zano.org homepage (fetched 2026-11-27):
  "A private stablecoin. Send dollars without anyone knowing how much, to
  whom, or when."; https://freedomdollar.com/ → 200.

In-class by capability, moved to the post's footnote per the user's
native-only cut:

- **RAILGUN (Ethereum & EVM)** — railgun.org via
  web.archive.org/web/20241227133626 (fetched 2026-11-27): "SHIELD 02 Shield
  any ERC-20 token or NFT into a 0zk address of your choice. TRANSACT 03 Once
  shielded, tokens, balances, and transactions are encrypted." (The live site
  is JS-rendered; not curl-greppable.)
- **Namada (Cosmos/IBC)** — namada.net site meta (fetched 2026-11-27): "Namada
  introduces shielded set rewards and shielded cross-chain actions for any
  asset." ("any asset" is their claim; a specific Namada↔Noble USDC flow is
  UNVERIFIED from this host.)

Adjacent systems, deliberately NOT in the post:

- **Liquid USDt** — "Confidential Transactions hide amounts and asset types by
  default" + "Stablecoins ... live natively on Liquid" (blockstream.com/liquid,
  fetched 2026-11-27) — amounts-only privacy; sender/receiver linkability
  remains; federation-trusted.
- **Penumbra** — "a fully shielded zone for the Cosmos ecosystem" (GitHub
  README); no verified USD-denominated asset.
- **Tornado Cash** — shielded USDC/DAI pools are deposit/withdraw only
  (excluded by the post's own contrast).
- **Aztec (new network live) + Light Protocol (Solana)** — shielded-stablecoin
  status UNVERIFIED from this host.

Other links probed 2026-11-27:

- https://fundme.cash/campaign/180 → 200 (LIVE).
- https://dorahacks.io/build/49513 → 200 with a browser UA (AWS WAF
  challenges curl; human readers are fine).
- https://nito.cash → 200; https://hushyourmoney.com/{compare, research,
  ceremony} → 200.
- Live site state: /compare serves the new build (the Flux rollout landed);
  /research/shielded-pool carries the R2-NULLIFIER-DOUBLING disclosure (×2)
  but NOT the v3.1 record — see gate 2.

Tornado Cash ceremony count (1,114 contributions): archived docs.tornado.cash
(web.archive.org/web/20220125175849/) — "Tornado.Cash Trusted Setup Community
was launched in May 2020 & accounted for 1114 contributions."

Technical numbers in the post (247,120 constraints; 2 public inputs; 29/29
acceptance; 164/0 red team; ~45 KB actions; ~1 sat/B; the two-party mini-MPC;
the four-tx mainnet demo): AGENTS.md current handoff (commit `2da7d49`) +
docs/V3-BUILD-2026-11-27.md + docs/POOL-V3-INTEGRATION-HANDOFF-2026-11-27.md.

## Decision record

- **2026-11-27 pass 1** — baseline rewrite: the user's new baseline + retained
  details from the original draft (ceremony logic, disclosures, technical
  summary, links); the "ONLY 2 OTHERS" claim hedged; publish gates defined.
- **2026-11-27 pass 2** — USDCx verified (fills the Circle slot); RAILGUN +
  Namada researched and added; title set to the user's working title ("…for
  Bitcoin" — deliberate; the body's first line anchors "Bitcoin Cash");
  editor's note recorded: on a forum with a long naming-war history, the
  framing may pull the thread off the tech; middle option "…for Bitcoin
  (Cash)"; Discourse titles are editable post-publish.
- **2026-11-27 pass 3 (this)** — file split (post vs notes); the list cut to
  NATIVE private stablecoins only (USDCx + FUSD in the list; RAILGUN +
  Namada in a footnote); the DoraHacks VOTE CTA added (2ND-link line, try-it
  section, Links); the mainnet links confirmed as the single publish BLOCKER
  (user ruling), everything else to complete meanwhile.
- **2026-11-27 pass 4** — the opening reworded per the user (heading edited
  in-file by the user, body line matched by us): "Bitcoin Cash has a NEW
  Unique Value Proposition (UVP) in a NEW Shielded Stablecoin Payments"
  (was "may have its 1st Unique Value Proposition").
- **2026-11-27 pass 5** — the opener merged per the user's in-file revision:
  their ### heading sentence ("Hush Your Money … has delivered a NEW Unique
  Value Proposition (UVP) for Bitcoin with a BRAND NEW Shielded Stablecoin
  Payments protocol, tentatively titled 'The Hush Protocol'" — typo
  "title"→"titled" fixed; the tentative protocol name is NEW this pass) +
  our **ParyonUSD (PUSD)** body line; the now-duplicated "Bitcoin Cash has a
  NEW UVP" body sentence removed.
- **2026-11-27 pass 6** — tags fixed to the forum's real tag set: the draft's
  zero-knowledge / shielded-pool / stablecoin / trusted-setup do NOT exist on
  bitcoincashresearch.org (tags.json lists: applications, apps, audits,
  bch-native, communication, consensus, contracts, draft, final,
  peer-services, proposed, stacks, withdrawn; tag/zero-knowledge and
  tag/stablecoin 404). Replaced with applications / bch-native / contracts /
  audits. Whether non-staff can CREATE new tags on the forum is UNVERIFIED;
  the thematic tags would have to be requested if wanted.
- **2026-11-27 pass 7** — the user's style round approved + applied: the long
  opener demoted to a bold lead paragraph (the user's own ### ParyonUSD and
  ### Mainnet Preview v0. lines, the --- rule, and PAYMENTS caps kept — their
  latest in-file structure); the origin story restored under "The research is
  EXTENSIVE" (BCHDEVCON3 2020 + the Bitcoin.com pledge/legal episode; the
  GitHub link verified 200 this pass); the action-shape ASCII diagram added to
  "What is actually running" — SOURCE-CHECKED against the M4 doc's layout
  table (docs/POOL-V3-INTEGRATION-HANDOFF-2026-11-27.md: input 0 fuel/deposit,
  input 1 fuel, input 2 state NFT, input 3 walkA, input 4 walkB → out0
  carrier OP_RETURN 201 B nf0|nf1|cm0|cm1|cm2|newRoot|pv(8)|sign(1), out1 new
  state commitment = newRoot ‖ finalNullRoot, out2 payout unshield only);
  "Related reading on this forum" added before Links (t/1773, t/752, t/525 —
  all probed 200, titles taken from the fetched <title> tags); the 2027
  vision moved to the close (after Disclosure). Poll: NOT added (user
  declined). Title unchanged.

## Open items for the user

- Title final call (the working title is in; the "(Cash)" middle option is
  recorded above).
- The DoraHacks ask is phrased as "VOTE for it" at all three mentions —
  confirm the wording.
