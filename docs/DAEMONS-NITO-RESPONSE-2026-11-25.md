# RESPONSE — Nito Cash answers the daemon unblock handoff

**From:** Nito Cash (APECSdev)
**To:** Hush Your Money (APECS Dev)
**Date:** 2026-11-25
**Re:** `docs/DAEMONS-NITO-UNBLOCK-HANDOFF-2026-11-25.md`

---

## 1. Transport commit (item 1) — RESOLVED

The transport was committed after your snapshot. Pin:

- **`f88ed90`** — `feat(cashshuffle): Nostr transport bus` (`apps/web/src/lib/cashshuffle/transport.js` + `tests/unit/cashshuffle-transport.spec.js`, and the `Relay.subscribe` queue-while-connecting fix).
- Later commits on the same line: `eb7882d` (round runner), `641d1cd` (Desk wiring), `eacee43` (current HEAD at the time of writing).

Vendor from `f88ed90` or the current HEAD; the transport has not changed shape since.

## 2. NIP-44 padding (item 2) — FIXED to official v2

Decision: **official NIP-44 v2**, no `nito-v0` private mode.

`apps/web/src/lib/nostr/nip44.js` now uses the official padding:

- 2-byte big-endian length prefix;
- the plaintext;
- zero padding to the next chunk boundary;
- chunk sizes `32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536`.

The previous 4-byte/next-power form was a deviation and is gone. The round-trip, long-message, tamper and wrong-key tests still pass.

## 3. NIP-59 timestamps (item 3) — ADOPTED

Decision: the sender randomizes the seal and gift-wrap `created_at` up to **two days** in the past; the receiver accepts the two-day window.

`nip59.js` now exports `randomizeCreatedAt` and uses it for both the seal and the gift wrap; `unwrapGift` rejects a gift wrap outside the two-day window.

## 4. Verify-before-sign (item 4) — ADDED to the protocol core

Decision: add `VERIFY` to the protocol core; the daemon adds it regardless.

`protocol.js` now has the `VERIFY` phase between `SHUFFLE` and `SIGNING`, and `verify()` checks:

- `sumOut <= sumIn`;
- `fee <= estBytes * 5 sat/B`;
- an optional expected output count.

A failure aborts the round before any signature. The round runner routes `VERIFY` and advances to `SIGNING`.

## 5. Registration fields (item 5) — CONFIRMED

Registration = verification key + amount + version, unsigned; the input outpoint is revealed only at signing. Agreed.

## 6. Pool-native round shape (item 6) — 2N OUTPUTS

Decision: the round produces **two tagged outputs per action** (10 outputs for 5 actions). Each participant contributes two equal inputs and receives two same-tag outputs; the tag is `SHA256(nf0_LE ‖ nf1_LE)` of the funded action. A one-output-per-participant round cannot satisfy the role-2 action's two same-tag fuel UTXOs.

## 7. Fee accounting (item 7) — CONFIRMED

- 30,000 sats action fuel (2 × 15,000);
- 2,000 sats blanks (2 × 1,000);
- the lock fee at the per-lock cap.

## 8. Proving assets (item 8) — STILL BLOCKED

The Hush keypair (`VK 05250429…`, zkey `4a4e2543…`, wasm `8595b434…`) is still not in the nito repo; the role-2 registry remains `walletProverCompatible: false`, `status: 'awaiting-proving-assets'`. We need the three files, the SHA-256 hashes, a CORS distribution URL, a browser caching plan, and the web-platform SHIELD→TRANSFER→UNSHIELD result before the flag flips.

## 9. 3-input builder + note delivery (item 9) — DONE

`role2-lock.js`, `role2-action.js` and `role2-actions.js` implement the 3-input shape (fuel 0, fuel 1, state 2), the 169-B carrier, the deposit tags, the off-chain note delivery, and the prove-first → tag → lock → atomic-broadcast orchestration. Ready for A5.

## 10. Relay set + NIP-42 (item 10) — NEXT

The relay client captures the AUTH challenge; the transport does not yet wire it. We will wire NIP-42 into the transport and confirm the production relay set and the `none|optional|required` policy.

## 11. `blackhost` capacity (item 11) — CONFIRMED

`MemoryMax=512M`, `CPUQuota=50%`, journald cap. Hush owns the host sign-off; the daemon should not co-locate with the rpsls build.

## 12. Final approval (item 12) — STANDING

The nito.cash client is the final approval; record it in A10 / CF-A6.

---

## Next

- Nito: wire NIP-42 into the transport; add the official NIP-44 test vectors; the `VERIFY` output check in the daemon.
- Hush: the proving assets (item 8); the `blackhost` sign-off (item 11).
- Joint: the 2N-output round shape (item 6) in both the daemon and the Desk.

— APECSdev / Nito Cash, 2026-11-25
