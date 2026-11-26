<!-- docs/DAEMONS-NITO-UNBLOCK-HANDOFF-2026-11-25.md -->
# HANDOFF — Nito Cash: daemon status after the 2026-11-26 response

**From:** Hush Your Money (APECS Dev)
**To:** Nito Cash
**Date:** 2026-11-25, updated 2026-11-26
**Status:** Nito answered the 11-item checklist; Hush has the M1–M4 daemon cores; no daemon is running or deployed.
**Nito response:** `docs/DAEMONS-NITO-RESPONSE-2026-11-25.md`.
**Public page:** `/daemons` (source in `web/pages/daemons.vue`; Flux rollout pending).
**Tree:** `https://github.com/APECSdev/hushyourmoney/tree/master/daemons`.

---

## 0. The short version

The wire, verification, round-shape, fee, proving-asset and 3-input questions are answered. Two Nito-side items remain: the store/UI wiring for `submitRole2Action` and the web-platform chipnet SHIELD→TRANSFER→UNSHIELD. Hush still needs the daemon runtime: signature verification, timeouts, persistence, the network loop, Electrum broadcast, role-2 VM-eval, off-chain note delivery and deployment. The Nito client remains the final approval.

---

## 1. Nito answers (2026-11-26)

| # | Item | Nito answer | Commit / evidence |
|---|---|---|---|
| 1 | NIP-44 mode | **`official`** — official v2 KDF, 2-byte BE prefix, chunked padding; no `nito-v0` path. | `ac61542` |
| 2 | NIP-59 timestamps | **Adopted** — `randomizeCreatedAt()` for the seal and gift wrap; the receiver rejects outside the two-day window. | `ac61542` |
| 3 | Verify-before-sign | **Added** — `VERIFY` between `SHUFFLE` and `SIGNING`; own output exactly once at the expected amount/address, no duplicate input outpoints, no duplicate output addresses. | `protocol.js`; extended 2026-11-26 |
| 4 | Registration fields | **Confirmed** — verification key + amount + protocol version, unsigned; the outpoint is revealed only at build/sign. | — |
| 5 | Pool-native round shape | **Confirmed: 2N outputs** — each participant contributes two equal inputs and receives two same-tag outputs (10 outputs for 5 actions). Design final in `docs/CASHSHUFFLE-NOSTR-DESIGN.md`. | — |
| 6 | Fee split | **Confirmed** — 30,000-sat action fuel + 2,000-sat blanks + the lock fee; the 400,000-sat cap for 10 actions is acceptable. | — |
| 7 | Proving assets | **Pinned + acceptance PASS** — the three hashes are pinned in `verifier-program-role2.js`; `prover.js` and the `prover.nito.cash` Worker mirror point at `role2-proving-assets-v1`; `scripts/pool-accept.mjs --pool role2 --txid 9d9aa97a` reports all three unlockings BYTE-EXACT (fuel0 9481 B, fuel1 9483 B, state 8695 B). The registry flag flips after the web-platform acceptance. | `a304d3c` |
| 8 | 3-input builder + note delivery | **Builders done** — `role2-carrier.js`, `role2-lock.js`, `role2-action.js`, `role2-actions.js`; the store/UI wiring is the remaining step. | — |
| 9 | Relay set + NIP-42 | **Transport wired** — the relay AUTH challenge is answered with the session key (kind 22242, relay + challenge tags) under `authPolicy: none|optional|required`; the production relay set and policy remain open. | `d85bade` |
| 10 | `blackhost` | **Confirmed** — Hush owns the host sign-off; no Nito credentials needed. | — |
| 11 | Final approval | **Standing** — the nito.cash client is the final approval; the record goes in A10 / CF-A6. | — |

Nito’s response also corrects our pre-`ac61542` descriptions of the Nito NIP-44, NIP-59 and `VERIFY` state. This handoff adopts the answers.

---

## 2. What remains

### Nito side

1. **Store/UI wiring** for `submitRole2Action`: `buildPoolWitness` → `generateProof` → `produceRole2Inputs` with `scenarioArgs` → the carrier, plus the role-2 scan (642-B STMT / 169-B carrier).
2. **Web-platform chipnet SHIELD → TRANSFER → UNSHIELD**: after this, `walletProverCompatible` flips and the daemon-side A5/A6 can run.

### Hush side

- Signature verification, per-phase timeouts and round persistence.
- The network loop (`main.js` / daemon class) and the Electrum broadcast path.
- Role-2 VM-eval (`createVirtualMachineBch2026` consensus + standard) before broadcast.
- Off-chain note delivery and the pool-native 2N verifier.
- Deployment of the hardened systemd units on `blackhost` after the Nito approval.

### Still open

- Production relay set and NIP-42 policy.
- Blame behavior (abort + re-pool vs exclude + continue).
- The daemon’s blank-acquisition role (buy vs sell).
- Metrics exposure and the final cap values.

---

## 3. Interop settled

- **NIP-44:** official v2 only. Hush’s `daemons/shared/src/nostr/nip44.js` default is `official`; it passes `nip44.vectors.json`. The `nito-v0` mode remains as a compatibility path but is not used by the Nito client.
- **NIP-59:** the rumor’s `created_at` is canonical; the seal and gift wrap are randomized independently up to two days in the past; the receiver accepts the two-day window plus 300 s.
- **Round shape:** 2N outputs for N actions; each participant contributes two equal inputs and receives two same-tag outputs.
- **Fees:** 30,000-sat action fuel + 2,000-sat blanks + the lock fee; 400,000-sat cap for 10 actions.
- **3-input shape:** fuel 0, fuel 1, state 2; 169-B carrier; two tagged fuel UTXOs per action.
- **NIP-42:** the Nito transport answers the AUTH challenge; the production relay set and policy remain open.

---

## 4. What Hush does next

- Add signature verification, timeouts and persistence to the round.
- Wire the network loop to the transport and round.
- Add the Electrum broadcast path and the token-aware UTXO refresh.
- Add the role-2 VM-eval and off-chain note delivery.
- Implement the pool-native 2N verifier.
- Run A1/A2/A5/A6 against the Nito client after the store/UI and web-platform acceptance.
- Deploy the hardened systemd units on `blackhost`.

No daemon is running now; no float is funded; the `/daemons` page is documentation, and its Flux rollout is pending.

---

## 5. Acceptance gates

| Gate | Status |
|---|---|
| CashShuffle A1 (5-peer chipnet round) | Pending the daemon runtime + Nito store/UI |
| CashShuffle A2 (malicious coordinator) | Daemon unit test passes; Nito client `VERIFY` added; end-to-end pending |
| CashShuffle A5 (tag pairs) | 2N shape confirmed; Nito witness acceptance PASS; daemon VM-eval + web acceptance pending |
| CashShuffle A6 (blank cost) | Fee split confirmed; end-to-end pending |
| CashShuffle A7 (signature separation) | Daemon BCH P2PKH signer passes 4 tests; end-to-end pending |
| CashShuffle A8 (NIP-44/NIP-59) | Official NIP-44/NIP-59 adopted by Nito; Hush tests pass |
| CashShuffle A10 (final approval) | Standing; record after the web-platform acceptance |
| CashFusion CF-A1/CF-A2 | M6; not started |
| CashFusion CF-A4 (coordinator privacy) | Policy implemented; end-to-end pending |
| CashFusion CF-A6 (final approval) | Standing |

---

## 6. Links

- Nito response: `docs/DAEMONS-NITO-RESPONSE-2026-11-25.md`
- Orchestration tree: `https://github.com/APECSdev/hushyourmoney/tree/master/daemons`
- Public page: `https://hushyourmoney.com/daemons` (Flux rollout pending)
- CashShuffle open questions: `daemons/cashshuffle/OPEN-QUESTIONS.md`
- CashFusion open questions: `daemons/cashfusion/OPEN-QUESTIONS.md`
- Roadmap: `daemons/ROADMAP.md`
- Role-2 pool handoff: `docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md`
- Proving assets: `https://github.com/APECSdev/pusd-shielded-pool/releases/tag/role2-proving-assets-v1`
- NIP-44: `https://github.com/nostr-protocol/nips/blob/master/44.md`
- NIP-59: `https://github.com/nostr-protocol/nips/blob/master/59.md`

No secret material is in this document or in the tree. The daemon seed files and `.env` files are created on the host, mode 600, and never committed.

— APECS Dev / Hush Your Money, 2026-11-26
