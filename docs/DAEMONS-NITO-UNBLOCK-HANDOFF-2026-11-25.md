<!-- docs/DAEMONS-NITO-UNBLOCK-HANDOFF-2026-11-25.md -->
# HANDOFF — Nito Cash: unblock the daemon implementation

**From:** Hush Your Money (APECS Dev)
**To:** the Nito Cash team
**Date:** 2026-11-25
**Status:** orchestration tree committed (`239d66c`); no daemon is implemented or deployed.
**Public page:** `/daemons` (`web/pages/daemons.vue`).
**Tree:** `https://github.com/APECSdev/hushyourmoney/tree/master/daemons`.

---

## 0. The one-paragraph ask

The CashShuffle and CashFusion daemons are orchestrated but not implemented. The blocking items are
decisions and handovers, not code. This document lists the twelve items we need from Nito, the first
round agenda, and the acceptance gates that depend on Nito. The Nito Cash client remains the final
approval for any deployed result.

---

## 1. What is already in the tree

| Path | Contents |
|---|---|
| `daemons/README.md` | Orchestration hub, locked decisions, blockers, build/deploy rules |
| `daemons/ROADMAP.md` | M0–M7, W1–W8, four Nito rounds |
| `daemons/CONVENTIONS.md` | Runtime, config, logging, security invariants, build hosts |
| `daemons/shared/` | Shared config/metrics; Nostr and BCH contracts; vendor pin |
| `daemons/cashshuffle/` | PLAN (CS-1…CS-12), ACCEPTANCE (A1…A10), OPEN-QUESTIONS (Q1…Q15), config, stubs, unit, `.env.example`, systemd unit |
| `daemons/cashfusion/` | PLAN (CF-1…CF-8), ACCEPTANCE (CF-A1…CF-A7), OPEN-QUESTIONS (Q1…Q10), config, stubs, unit, `.env.example`, systemd unit |

The daemon entry points load and validate the config, then exit with `not implemented`. The systemd
units are templates and are not installed.

---

## 2. Decisions and handovers needed

| # | Item | Current state | What Nito must provide | Lands in |
|---|---|---|---|---|
| 1 | Transport reference commit | `transport.js` and `cashshuffle-transport.spec.js` are untracked at `../nito.cash` HEAD `984ca4c` | Commit both for comparison; the shared official implementation is independent | `daemons/shared/src/nostr/` |
| 2 | NIP-44 KDF + padding | The Nito `nip44.js` uses the raw ECDH x-coordinate as the conversation key, HKDF with salt `nip44-v2`, a 4-byte BE prefix and next-power padding; official v2 uses HKDF-Extract for the conversation key, HKDF-Expand for the message keys, a 2-byte u16 prefix and chunked padding (`https://github.com/nostr-protocol/nips/blob/master/44.md`) | Choose `official` or an explicit `nito-v0` private mode; the shared transport implements both, and official passes the 35 official vectors. If `nito-v0`, confirm both peers set it | `daemons/shared/src/nostr/README.md` §3, Q1 |
| 3 | NIP-59 timestamps | The seal copies the rumor’s `created_at`; the gift wrap uses `now` (`../nito.cash/apps/web/src/lib/nostr/nip59.js:37,42-55,76`) | Confirm the sender randomizes the seal and gift wrap up to two days in the past; the receiver accepts the two-day window | `daemons/shared/src/nostr/README.md` §4, Q2 |
| 4 | Verify-before-sign | The Nito protocol core has no transaction object and no output check (`../nito.cash/apps/web/src/lib/cashshuffle/protocol.js:17-24,109-115`) | Choose: add `VERIFY` to the protocol core, or keep it daemon-only; the daemon adds it either way | `daemons/cashshuffle/src/round.js`, Q3 |
| 5 | Registration fields | The handoff §2.2 says “equal-amount input”; the classic spec and `register()` use key + amount only (`web/pages/research/coinjoin.vue:186-190`; `protocol.js:74-90`) | Confirm registration = verification key + amount + version, unsigned; the input outpoint is revealed only at signing | `daemons/cashshuffle/README.md` §3, Q4 |
| 6 | Pool-native round shape | One action consumes two same-tag fuel UTXOs (`../nito.cash/apps/web/src/lib/pool/role2-action.js:56,75`); one output per participant produces five distinct tags and zero pairs | Confirm the round produces two tagged outputs per action (10 outputs for 5 actions), or each participant contributes two equal inputs and receives two same-tag outputs | `daemons/cashshuffle/README.md` §5, Q5; A5 |
| 7 | Fee accounting | The 15,000 × 2 fuel is the action fee (`role2-action.js:70`; `docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md:70-71`); the lock fee is separate; two blanks cost 1,000 sats each | Confirm the split: 30,000-sat action fuel + 2,000-sat blanks + lock fee at the per-lock cap | `daemons/cashshuffle/README.md` §5, Q6 |
| 8 | Proving assets | The Hush keypair is `VK 05250429…`, `zkey 4a4e2543…`, `wasm 8595b434…` (`AGENTS.md:699`); the Nito role-2 registry is `walletProverCompatible: false`, `status: 'awaiting-proving-assets'` (`../nito.cash/apps/web/src/lib/pool/registry.js:88-93`) | Provide the three files, SHA-256 hashes, a distribution URL with CORS, a browser caching plan, and the web-platform SHIELD→TRANSFER→UNSHIELD acceptance result before the flag flips | `daemons/cashshuffle/OPEN-QUESTIONS.md` Q12 |
| 9 | 3-input builder + note delivery | The Nito client is built for the 7-input covenant-at-input-0 shape; the role-2 carrier leaves no room for the old out[6] note | Adopt the 3-input builder and off-chain note delivery before A5 | `docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md` §3, §7; Q13 |
| 10 | Relay set + NIP-42 | The reference publishes on one relay; damus advertises AUTH; the Nito relay client captures the challenge but the transport does not wire it (`../nito.cash/apps/web/src/lib/nostr/relay.js:35-58`; `transport.js:49-53`) | Confirm the production relay set and the `none|optional|required` AUTH policy | `daemons/cashshuffle/OPEN-QUESTIONS.md` Q8–Q9 |
| 11 | `blackhost` capacity and ownership | 2 CPU cores, 3.8 GiB RAM, 2.8 GiB free on a 93%-full 38G disk (verified 2026-11-25); the host also runs the rpsls build | Confirm Hush owns the host sign-off; the daemon runs with `MemoryMax=512M`, `CPUQuota=50%`, and a journald cap | `daemons/cashshuffle/OPEN-QUESTIONS.md` Q15 |
| 12 | Final approval | The standing bar | Run the Nito client against the daemon and record written approval in `daemons/cashshuffle/ACCEPTANCE.md` A10 and `daemons/cashfusion/ACCEPTANCE.md` CF-A6 | A10, CF-A6 |

---

## 3. Proposed first round (wire and verification)

**Round 1 — resolve items 1–5.**

| Question | Proposed default |
|---|---|
| NIP-44 | Official v2 in `daemons/shared`; `nito-v0` only as an explicit private mode. |
| NIP-59 | Sender randomizes seal and gift wrap up to two days in the past; receiver accepts the two-day window. |
| Verify-before-sign | Add `VERIFY` to the protocol core; the daemon adds it regardless. |
| Registration | Verification key + amount + version, unsigned; no input outpoint. |
| Transport pin | First commit that contains `transport.js` and its test. |

**Round 2 — resolve items 6–7.** Tag-pair round shape, 2N outputs, lock fee vs action fee, blank cost, blame behavior.

**Round 3 — resolve items 8–9.** Proving assets, 3-input builder, off-chain note delivery.

**Round 4 — resolve items 10–12.** Relay set, NIP-42, metrics exposure, host capacity, A1/A2, final approval.

Each round ends with the decision recorded in `daemons/cashshuffle/OPEN-QUESTIONS.md` or
`daemons/cashfusion/OPEN-QUESTIONS.md` and a status update in `daemons/ROADMAP.md`.

---

## 4. Acceptance gates that depend on Nito

| Gate | Depends on |
|---|---|
| CashShuffle A1 (5-peer chipnet round) | Items 1–5, 10 |
| CashShuffle A2 (malicious coordinator) | Item 4 |
| CashShuffle A5 (tag pairs) | Items 6–9 |
| CashShuffle A6 (blank cost) | Item 7 |
| CashShuffle A7 (signature separation) | Item 2/4 wallet path |
| CashShuffle A8 (NIP-44/NIP-59) | Items 1–3 |
| CashShuffle A10 (final approval) | Item 12 |
| CashFusion CF-A1/CF-A2 | Items 1–5, 10 |
| CashFusion CF-A4 (coordinator privacy) | The `avoid|rotate|allow` policy |
| CashFusion CF-A6 (final approval) | Item 12 |

---

## 5. Links

- Orchestration tree: `https://github.com/APECSdev/hushyourmoney/tree/master/daemons`
- Public page: `https://hushyourmoney.com/daemons`
- CashShuffle open questions: `daemons/cashshuffle/OPEN-QUESTIONS.md`
- CashFusion open questions: `daemons/cashfusion/OPEN-QUESTIONS.md`
- Roadmap: `daemons/ROADMAP.md`
- Role-2 pool handoff: `docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md`
- NIP-44: `https://github.com/nostr-protocol/nips/blob/master/44.md`
- NIP-59: `https://github.com/nostr-protocol/nips/blob/master/59.md`

No secret material is in this document or in the tree. The daemon seed files and `.env` files are
created on the host, mode 600, and never committed.

— APECS Dev / Hush Your Money, 2026-11-25
