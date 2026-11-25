<!-- daemons/cashfusion/OPEN-QUESTIONS.md -->
# CashFusion daemon — open questions for the Nito rounds

Each question has a proposed default. A round resolves the question or records a deferral.

## Q1. What is the G4 scope?

**Why:** G4 (mainnet opt-in beta) is not built (`docs/P2P-FUSION-DESIGN.md:181-183`); the handoff says “later the same daemon gains a CashFusion mode” without a scope.

**Proposed default:** M6 is a chipnet-only G4 testnet round with Nito peers; mainnet opt-in beta is a separate milestone after the CashShuffle production review.

**Owner:** Joint.

## Q2. Production relay set

**Why:** the measured sets are damus/nos.lol (1/2) and primal/nostr.mom/offchain.pub (full round) (`docs/P2P-FUSION-DESIGN.md:179-183`).

**Proposed default:** the same three-relay set as CashShuffle, with a project relay as an optional fourth.

**Owner:** Joint.

## Q3. Coordinator policy

**Why:** the coordinator sees the mapping in CashFusion (`AGENTS.md:110`); a permanent daemon in that role centralizes the privacy.

**Proposed default:** `avoid` by default; `rotate` only with an explicit operator decision; `allow` only for a dedicated test round.

**Owner:** Joint.

## Q4. Fee model

**Why:** the measured 5-party fee is 5,000 sats and the cap is 5 sat/B (`docs/P2P-FUSION-DESIGN.md:182`; `web/stores/p2pfusion/round.ts:24`).

**Proposed default:** keep the measured constants; abort a round above the cap before signing.

**Owner:** Hush.

## Q5. Mainnet opt-in beta

**Why:** G4 is not built; the handoff says “eventually”.

**Proposed default:** no mainnet transaction until the G4 build, the operator sign-off, and the Nito approval are recorded.

**Owner:** Joint.

## Q6. Nito client support

**Why:** the Nito client is the final approval; its CashFusion mode is not built in the handoff’s reference tree.

**Proposed default:** the daemon’s CashFusion mode is tested against the Nito browser client only after the client’s CashFusion workstream lands.

**Owner:** Nito.

## Q7. Existing CashFusion pool

**Why:** the handoff §6 says the existing CashFusion pool is not supported.

**Proposed default:** no interop work; the daemon runs the Nostr round only.

**Owner:** Joint.

## Q8. Metrics

**Why:** the acceptance requires visible rounds and balances; the unit has no port.

**Proposed default:** the same localhost-only metrics endpoint as CashShuffle, on a separate port.

**Owner:** Hush.

## Q9. Liquidity cap

**Why:** the handoff leaves the cap open; the 5-party fee is 5,000 sats plus inputs.

**Proposed default:** 300,000 sats for the first G4 testnet soak; raise after the 24 h run.

**Owner:** Hush.

## Q10. Legal and operational ownership

**Why:** a permanent liquidity daemon holds a hot chipnet wallet and runs on a shared host.

**Proposed default:** Hush owns the host, the float, the backups, and the incident response; Nito owns the client-side approval. The arrangement is recorded before M6.

**Owner:** Joint.
