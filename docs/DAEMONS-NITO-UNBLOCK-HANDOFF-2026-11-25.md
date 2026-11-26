<!-- docs/DAEMONS-NITO-UNBLOCK-HANDOFF-2026-11-25.md -->
# HANDOFF — Nito Cash: daemon implementation status and the decisions that unblock it

**From:** Hush Your Money (APECS Dev)
**To:** Nito Cash
**Date:** 2026-11-25, updated 2026-11-26
**Status:** Hush has implemented the M1–M4 daemon cores; no daemon is running or deployed.
**Public page:** `/daemons` (source in `web/pages/daemons.vue`; Flux rollout pending).
**Tree:** `https://github.com/APECSdev/hushyourmoney/tree/master/daemons`.

---

## 0. The one-paragraph ask

Hush has built the shared transport, the CashShuffle round with verify-before-sign, the wallet selection and BCH P2PKH signer, and the role-2 carrier/lock/action builders. The remaining blockers are decisions and handovers from Nito: the NIP-44 mode, NIP-59 timestamps, client-side verify-before-sign, the pool-native round shape, the proving-asset acceptance, the 3-input builder and note delivery, and the relay/AUTH policy. The Nito Cash client remains the final approval for any deployed result.

---

## 1. What Hush has built

All of this is committed and pushed on `master`.

| Area | Source | Tests |
|---|---|---|
| Shared transport: official NIP-44 v2 KDF/padding + `nito-v0`, NIP-59 timestamps, BIP-340 events, relay pool (N relays, 80 ms, dedupe, reconnect, NIP-42) | `daemons/shared/src/nostr/{nip44,nip59,event,relay,relay-pool}.js` | 44 shared suite (incl. p2pkh) |
| CashShuffle transport wrapper: gift-wrapped packets over the relay pool | `daemons/shared/src/cashshuffle/transport.js` | included above |
| CashShuffle round: `REGISTER → POOL → ANNOUNCEMENT → SHUFFLE → VERIFY → SIGNING → BROADCAST`; verify-before-sign; blame. Signature verification, timeouts, persistence and the network loop are pending. | `daemons/cashshuffle/src/round.js` | 16 round |
| Wallet: equal-amount selection, funding selection, caps, BCH P2PKH signer (`SIGHASH_ALL|FORKID`) | `daemons/cashshuffle/src/wallet.js`, `daemons/shared/src/bch/p2pkh.js` | 5 wallet (p2pkh in the shared suite) |
| Role-2 pool: carrier parse/build, tag, fuel-pair check, cost, signed lock, 3-input action with injected unlockings | `daemons/cashshuffle/src/{pool,role2-lock,role2-action}.js` | 14 role-2 (7 pool + 7 lock/action) |
| CashFusion: phase table and coordinator policy | `daemons/cashfusion/src/round.js` | 11 CashFusion |

**97/97 daemon tests pass on `blackhost`** (44 shared + 42 CashShuffle + 11 CashFusion). The p2pkh/role-2 tests need `@bitauth/libauth`; they run on `blackhost` with the Nito `apps/web/node_modules`, or on the `apecsdev` build VM with the daemon dependencies installed.

Commits:

```
5c21545 docs: record daemons M1–M4 implementation
7f6711d daemons: add BCH P2PKH signer and role-2 lock/action builders
7d1024c daemons: add wallet selection and role-2 pool helpers
bd801e2 daemons: add the CashShuffle transport wrapper
822fa28 daemons: implement CashShuffle round and verify-before-sign
8cd7a83 daemons: implement shared Nostr transport (NIP-44/NIP-59/relay pool)
```

**No daemon is running.** `cashshuffle-daemon.service` and `cashfusion-daemon.service` are templates; there are no service users, `/opt` trees, `/var/lib` state, or processes on `blackhost`. The daemon `main.js` loads the config and exits with `not implemented` until the network loop is wired.

---

## 2. What Nito needs to decide or provide

| # | Item | Why it blocks | Exact ask |
|---|---|---|---|
| 1 | **NIP-44 mode** | The Nito `nip44.js` differs in BOTH the KDF and the padding. Official v2 derives `conversation_key = HKDF-Extract(sharedX, "nip44-v2")` and `message_keys = HKDF-Expand(conversation_key, nonce, 76)`, with a 2-byte u16 prefix and chunked padding. The Nito tree uses raw sharedX + HKDF with salt `nip44-v2`, a 4-byte prefix and next-power padding. | Choose `official` (recommended; our default and the 44-test target) or `nito-v0` (their current wire). If `nito-v0`, both peers must set `NIP44_MODE=nito-v0`. |
| 2 | **NIP-59 timestamps** | Our daemon randomizes the seal and gift-wrap timestamps independently up to two days in the past and rejects a gift outside the two-day window plus 300 s skew. The current Nito seal copies the rumor timestamp and the gift wrap uses `now`. | Adopt `randomPastTimestamp()` in the Nito client; the rumor’s `created_at` stays canonical. |
| 3 | **Verify-before-sign** | The Nito protocol core has no transaction object and no output check. The daemon implements `VERIFY` before `SIGNING`; a malicious coordinator can present a transaction that omits a peer’s output. | Add the same `VERIFY` check to the Nito browser peer before it signs: own output present at the expected amount/address, equal inputs/outputs, fee cap, no duplicate outpoints/addresses. |
| 4 | **Registration fields** | The earlier handoff wording said “equal-amount input”; the classic spec and the Nito `register()` use key + amount + version only. | Confirm registration = verification key + amount + protocol version, unsigned; the input outpoint is revealed only when the transaction is built/signed. |
| 5 | **Pool-native round shape** | One role-2 action consumes TWO same-tag fuel UTXOs. A 5-peer round with one output per participant produces five distinct tags and zero pairs. | Confirm the round shape: two tagged outputs per action (10 outputs for 5 actions), or each participant contributes two equal inputs and receives two same-tag outputs. This is the largest open design item. |
| 6 | **Fee split** | The 15,000 × 2 fuel is the ACTION fee; the lock/shuffle transaction fee is separate; two blanks cost 1,000 sats each. | Confirm the split: 30,000-sat action fuel + 2,000-sat blanks + the lock fee at the per-lock cap. Our proposed CashShuffle cap is 400,000 sats for 10 actions. |
| 7 | **Proving assets** | The Hush keypair is `VK 05250429…`, `zkey 4a4e2543…`, `wasm 8595b434…`. The public handover is `https://github.com/APECSdev/pusd-shielded-pool/releases/tag/role2-proving-assets-v1` (16 assets, SHA-256SUMS). At the last Hush check, the Nito role-2 registry was `walletProverCompatible: false`, `status: 'awaiting-proving-assets'`. | Pin the three files, add the distribution URL/CORS/browser caching plan, run the web-platform SHIELD→TRANSFER→UNSHIELD acceptance, then flip the flag. |
| 8 | **3-input builder + note delivery** | The Nito client is built for the 7-input covenant-at-input-0 shape; the role-2 carrier leaves no room for the old out[6] note. | Adopt the 3-input builder and off-chain note delivery before the pool-native acceptance. Our `role2-action.js` is the reference shape. |
| 9 | **Relay set + NIP-42** | The production relay set and AUTH policy are still open. Our pool supports N relays, 80 ms pacing, dedupe, reconnect and NIP-42. | Confirm the relay set and `NOSTR_AUTH_POLICY=none|optional|required`. |
| 10 | **Blackhost capacity/ownership** | The host has 2 CPU cores, 3.8 GiB RAM, and 2.8 GiB free on a 93%-full 38G disk (verified 2026-11-25); the daemon runs as a non-root user with `MemoryMax=512M`, `CPUQuota=50%`. | Confirm Hush owns the host sign-off. No Nito credentials are needed; the daemon does not prove on this host. |
| 11 | **Final approval** | The standing bar. | Run the Nito client against the daemon and record written approval in `daemons/cashshuffle/ACCEPTANCE.md` A10 and `daemons/cashfusion/ACCEPTANCE.md` CF-A6. |

**Not blocking:** Nito does not need to commit `transport.js` for our official mode; the shared transport is independent. A commit is useful for comparison and for the `nito-v0` path. Nito does not need to run the daemon or provide the float/seed.

---

## 3. Interop details

### 3.1 Packet shape

- Rumor kind `22231`; content is the JSON packet:
  ```json
  { "round": "<roundId>", "type": "<REGISTER|ANNOUNCEMENT|SHUFFLE|FINAL_TX|VERIFY|SIGNING|BROADCAST|BLAME>", "from": "<x-only hex>", "to": "<x-only hex|null>", "payload": { } }
  ```
- Seal kind `13`, NIP-44 encrypted rumor, signed by the sender’s per-round key.
- Gift wrap kind `1059`, NIP-44 encrypted seal, signed by a fresh throwaway key, one `p` tag with the recipient’s x-only key.
- Relays see only the gift wrap: ciphertext, `p` tag, and timing.

### 3.2 NIP-44

Our `NIP44_MODE=official` is the default and passes `nip44.vectors.json` (35 conversation-key cases, 10 encrypt/decrypt cases, 24 padding cases). `NIP44_MODE=nito-v0` preserves the Nito tree’s KDF and padding for a mixed deployment. The Nito client must set the same mode as the daemon.

### 3.3 NIP-59

Our `nip59.js` uses independent random seal/gift timestamps up to two days in the past and rejects a gift outside the two-day window plus 300 s. The Nito client must use the same rule; otherwise our daemon can reject its gifts, and its subscription window can miss ours.

### 3.4 Verify-before-sign

Our `verifyFinalTransaction()` checks:

- one input per participant, all the same amount;
- one output per participant, all the same amount;
- the player’s input is present;
- the player’s output is present exactly once at the expected amount;
- fee = totalIn − totalOut, within the cap;
- no duplicate input outpoints or output addresses;
- nVersion 1, nLockTime 0, nSequence 0xfffffffe when supplied.

The current verifier models the **plain 5/5 equal-output round**. The pool-native 2N-output round needs a separate verifier shape; this is part of item 5.

---

## 4. Pool-native round shape and fees

The role-2 lock creates **two tagged fuel UTXOs** (15,000 sats each) with the same tag, spends two blanks, and returns FT/BCH change. The action consumes exactly those two fuel UTXOs plus the state NFT.

```
one role-2 action
  in0  tagged fuel UTXO  ─┐
  in1  tagged fuel UTXO  ─┴─ same tag = SHA256(nf0_LE ‖ nf1_LE)
  in2  state NFT          ── storedRoot ‖ nullifierSetHash; FT = balance

  out0 169-B OP_RETURN carrier
  out1 new state NFT      ── 10,000-sat float; FT = newBalance
  out2 public payout      ── only when sign = 1

  fee  = in0.sats + in1.sats = 30,000 sats (the action fee)
  lock = a separate signed P2PKH tx with its own fee
```

A 5-peer round with one 15,000-sat output per participant produces five distinct tags and zero pairs. Five actions need **10 tagged fuel outputs**, not 5. The round must produce two tagged outputs per action, or each participant must contribute two equal inputs and receive two same-tag outputs. This is the largest open design item and it changes the round’s output count and fee model.

---

## 5. Proving assets

The public release is `https://github.com/APECSdev/pusd-shielded-pool/releases/tag/role2-proving-assets-v1` (16 assets, including `SHA256SUMS`, `HANDOVER.md`, the zkey, the wasm and the VK). The three key hashes:

- `verification_key.json` 3,111 B sha256 `05250429214cd82eac6540459a564c223c2b3f985122fbe5369b2eac7546bd19`
- `pool_final.zkey` 97,716,000 B sha256 `4a4e2543dbe640de7a59e23cc652b89a50034898757efff22242eafec0f7b7c0`
- `pool.wasm` 3,376,395 B sha256 `8595b43409370c83f371e16408cde85d88382f6fa66f406404071fb38efa7a48`

The Nito client must pin these assets, serve them with CORS, cache them for browser proving, and pass the web-platform SHIELD→TRANSFER→UNSHIELD acceptance before `walletProverCompatible` flips.

---

## 6. Acceptance gates that depend on Nito

| Gate | Depends on |
|---|---|
| CashShuffle A1 (5-peer chipnet round) | Items 1–4, 9 |
| CashShuffle A2 (malicious coordinator) | Item 3 |
| CashShuffle A5 (tag pairs) | Items 5–8 |
| CashShuffle A6 (blank cost) | Item 6 |
| CashShuffle A7 (signature separation) | Item 1/3 wallet path |
| CashShuffle A8 (NIP-44/NIP-59) | Items 1–2 |
| CashShuffle A10 (final approval) | Item 11 |
| CashFusion CF-A1/CF-A2 | Items 1–4, 9 |
| CashFusion CF-A4 (coordinator privacy) | The `avoid|rotate|allow` policy |
| CashFusion CF-A6 (final approval) | Item 11 |

---

## 7. How to run the tests

On `blackhost`, with the Nito `apps/web/node_modules` for `@bitauth`/`@noble`:

```bash
cd /root/tmp/daemons-test   # a synced copy of daemons/
node --test shared/test/*.test.js cashshuffle/test/*.test.js cashfusion/test/*.test.js
```

On the `apecsdev` build VM, after installing the daemon dependencies:

```bash
cd daemons
npm install
npm test
```

The p2pkh and role-2 tests require `@bitauth/libauth`. The web image’s node_modules does not include it; the full 97-test run needs the Nito tree or an installed daemon dependency set.

---

## 8. What Hush does next

- Wire the network loop (`main.js` / daemon class) to the transport and round.
- Add signature verification, per-phase timeouts and round persistence.
- Add the Electrum broadcast path and the token-aware UTXO refresh.
- Add the role-2 VM-eval (`createVirtualMachineBch2026` consensus + standard) before broadcast.
- Add off-chain note delivery and the pool-native 2N verifier.
- Run A1/A2/A5/A6 against the Nito client.
- Deploy the hardened systemd units on `blackhost` after the Nito approval.

The daemon is not running now; no float is funded; the `/daemons` page is documentation, and its Flux rollout is still pending.

---

## 9. Reply checklist

- [ ] NIP-44 mode: `official` or `nito-v0`
- [ ] NIP-59 timestamp rule adopted
- [ ] Client-side verify-before-sign added
- [ ] Registration = key + amount + version
- [ ] Pool-native round shape confirmed (2N outputs or 2 inputs/outputs per participant)
- [ ] Fee split confirmed (30k fuel + 2k blanks + lock fee)
- [ ] Proving assets pinned and acceptance passed
- [ ] 3-input builder + off-chain note delivery
- [ ] Relay set + NIP-42 policy
- [ ] Final approval

---

## 10. Links

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
