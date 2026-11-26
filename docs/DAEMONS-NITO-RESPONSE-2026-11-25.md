# RESPONSE — Nito Cash to the M1–M4 daemon handoff (updated 2026-11-26)

**From:** Nito Cash (APECSdev)
**To:** Hush Your Money
**Re:** `docs/DAEMONS-NITO-UNBLOCK-HANDOFF-2026-11-25.md` (updated, `1c4946e`)

## §9 checklist — answered

| # | Item | Nito answer |
|---|---|---|
| 1 | NIP-44 mode | **`official`** — nito.cash `lib/nostr/nip44.js` now uses the official v2 KDF (`hkdf(sha256, sharedX, "nip44-v2", nonce, 76)` = extract+expand), the 2-byte BE length prefix, and the chunked padding 32…65536 (commit `ac61542`). No `nito-v0` path. |
| 2 | NIP-59 timestamps | **Adopted** — `randomizeCreatedAt()` for the seal and gift wrap (independent, up to two days in the past); the receiver rejects outside the two-day window (commit `ac61542`). |
| 3 | Verify-before-sign | **Added** — `lib/cashshuffle/protocol.js` `VERIFY` (between SHUFFLE and SIGNING): `sumOut <= sumIn`, fee ≤ estBytes × 5 sat/B, optional expected output count. **Extended 2026-11-26**: the peer's own output must appear exactly once at the expected amount/address, no duplicate input outpoints, no duplicate output addresses. |
| 4 | Registration fields | **Confirmed** — verification key + amount + protocol version, unsigned; the outpoint is revealed only at build/sign. |
| 5 | Pool-native round shape | **Confirmed: 2N outputs** — each participant contributes two equal inputs and receives two same-tag outputs (10 outputs for 5 actions). The design is FINAL in `docs/CASHSHUFFLE-NOSTR-DESIGN.md`. |
| 6 | Fee split | **Confirmed** — 30,000-sat action fuel (2 × 15,000) + 2,000-sat blanks (2 × 1,000) + the lock fee at the per-lock cap; the 400,000-sat CashShuffle cap for 10 actions is acceptable. |
| 7 | Proving assets | **Pinned + acceptance PASS.** The three hashes are pinned in `verifier-program-role2.js`; `prover.js` and the `prover.nito.cash` Worker mirror point at `role2-proving-assets-v1`; `scripts/pool-accept.mjs --pool role2 --txid 9d9aa97a` reports **all three unlockings BYTE-EXACT** (fuel0 9481 B, fuel1 9483 B, state 8695 B, commit `a304d3c`). The registry flag flips after the web-platform SHIELD→TRANSFER→UNSHIELD. |
| 8 | 3-input builder + note delivery | **Builders done** — `role2-carrier.js`, `role2-lock.js`, `role2-action.js`, `role2-actions.js` (the reference shape). The store/UI wiring is the remaining step. |
| 9 | Relay set + NIP-42 | **Transport wired** — `lib/cashshuffle/transport.js` answers the relay's AUTH challenge with the session key (kind 22242, relay + challenge tags) under `authPolicy: none|optional|required` (commit `d85bade`). The production relay set and the policy remain open. |
| 10 | Blackhost | **Confirmed** — Hush owns the host sign-off; no Nito credentials needed. |
| 11 | Final approval | **Standing** — the nito.cash client is the final approval; the acceptance record goes in A10 / CF-A6. |

## Corrections to the handoff's descriptions

- **Item 1** says the Nito tree "uses raw sharedX + HKDF with salt nip44-v2, a 4-byte prefix and next-power padding". That was the pre-`ac61542` state. The current tree is the official v2 (see the table).
- **Item 2** says "the current Nito seal copies the rumor timestamp and the gift wrap uses now". Also pre-`ac61542`; both are now randomized.
- **Item 3** says "the Nito protocol core has no transaction object and no output check". The `VERIFY` phase exists and now includes the own-output and duplicate checks.

## The two remaining Nito-side items

1. **The store/UI wiring** for `submitRole2Action` (the `prove` chain: `buildPoolWitness` → `generateProof` → `produceRole2Inputs` with `scenarioArgs` → the carrier) and the role-2 scan (the 642-B STMT / the 169-B carrier).
2. **The web-platform chipnet SHIELD → TRANSFER → UNSHIELD**, after which `walletProverCompatible` flips and the daemon-side A5/A6 can run.

— APECS Dev / Nito Cash, 2026-11-26
