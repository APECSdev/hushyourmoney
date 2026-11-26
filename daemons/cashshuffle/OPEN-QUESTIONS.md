<!-- daemons/cashshuffle/OPEN-QUESTIONS.md -->
# CashShuffle daemon — open questions for the Nito rounds

Each question has a proposed default. The Nito response of 2026-11-26 resolves Q1–Q6, Q9, Q10, Q12, Q13 and Q15; Q7, Q8, Q11, Q14 and Q16 remain open.

## Q1. NIP-44 KDF + padding: official v2 or a versioned private variant?

**Why:** the Nito `nip44.js` differs in BOTH the KDF and the padding: it uses raw sharedX + HKDF with salt `nip44-v2`, a 4-byte length prefix and next-power padding (`../nito.cash/apps/web/src/lib/nostr/nip44.js`). Official NIP-44 v2 uses HKDF-Extract for the conversation key, HKDF-Expand for the message keys, a 2-byte u16 prefix and chunked padding (`https://github.com/nostr-protocol/nips/blob/master/44.md`). A standard peer cannot decrypt the current payload.

**Proposed default:** official v2 in `daemons/shared`; the official mode passes `nip44.vectors.json`. `nito-v0` only as an explicit private mode with both peers set to it.

**Owner:** Joint.

**Resolved 2026-11-26:** Nito chose `official` v2 (`ac61542`); there is no `nito-v0` path in the client. Hush’s `nito-v0` remains a compatibility mode only.

## Q2. NIP-59 timestamps: who randomizes them?

**Why:** the current seal copies the rumor’s `created_at` and the gift wrap uses `now` (`../nito.cash/apps/web/src/lib/nostr/nip59.js:37,42-55,76`); NIP-59 line 111 directs implementations to tweak every timestamp other than the rumor’s.

**Proposed default:** the sender randomizes the seal and gift wrap up to two days in the past; the receiver accepts the two-day window; the subscription uses `since = now - 172800 - 300`.

**Owner:** Joint.

**Resolved 2026-11-26:** Nito adopted `randomizeCreatedAt()` for the seal and gift wrap (`ac61542`); the receiver rejects outside the two-day window.

## Q3. Verify-before-sign: the daemon has it; the Nito client must add it

**Why:** the Nito protocol core has no transaction object and no output check (`../nito.cash/apps/web/src/lib/cashshuffle/protocol.js:17-24,109-115`). A malicious coordinator can present a transaction that omits a peer’s output.

**Proposed default:** the daemon implements `VERIFY` (`cashshuffle/src/round.js`) and the malicious-coordinator test passes. The Nito browser peer must add the same check before it signs; the daemon does not depend on where the Nito client puts it.

**Owner:** Joint.

**Resolved 2026-11-26:** Nito added `VERIFY` to `protocol.js`; it now checks the peer’s own output exactly once at the expected amount/address and rejects duplicate input outpoints/output addresses.

## Q4. Registration fields

**Why:** the handoff §2.2 says the daemon publishes its “equal-amount input”; the classic spec and the Nito `register()` use the verification key + amount only (`web/pages/research/coinjoin.vue:186-190`; `protocol.js:74-90`).

**Proposed default:** registration = verification key + amount + version, unsigned. The input outpoint is revealed only when the transaction is built/signed.

**Owner:** Joint.

**Resolved 2026-11-26:** Nito confirmed key + amount + version, unsigned; the outpoint is revealed only at build/sign.

## Q5. Pool-native round shape

**Why:** one role-2 action consumes two same-tag fuel UTXOs (`../nito.cash/apps/web/src/lib/pool/role2-action.js:56,75`); one output per participant produces five different tags and zero pairs. The handoff’s “5 outputs → 5 actions” does not hold.

**Proposed default:** the pool-native round produces two tagged outputs per action (10 outputs for 5 actions), or each participant contributes two equal inputs and receives two same-tag outputs. The plain 5/5 round remains a separate mode. Our `role2-lock.js`/`role2-action.js` implement the pair; the round shape is still the open decision.

**Owner:** Joint.

**Resolved 2026-11-26:** Nito confirmed 2N outputs (10 for 5 actions), with each participant contributing two equal inputs and receiving two same-tag outputs. The design is final in `docs/CASHSHUFFLE-NOSTR-DESIGN.md`. **Implemented 2026-11-26:** `role2-round.js` (builder/signer/assembler/verifier) and `round-2n.js` (state machine) pass 15 tests; see `2N-ROUND.md`. The network loop, Nito client 2N UI, VM-eval and A1/A2 remain.

## Q6. Fee accounting

**Why:** the 15,000 × 2 fuel is the action fee (`role2-action.js:70`; `docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md:70-71`); the lock/shuffle transaction fee is separate; two blanks cost 1,000 sats each.

**Proposed default:** the cap includes 30,000 sats of action fuel + 2,000 sats of blanks + the lock/shuffle fee at `CASHSHUFFLE_FEE_RATE`, with `CASHSHUFFLE_MAX_LOCK_FEE_SATS` per lock.

**Owner:** Joint.

**Resolved 2026-11-26:** Nito confirmed the split and accepted the 400,000-sat cap for 10 actions. **2N implementation:** the builder keeps the fuel outputs at exactly 15,000 sats and pays the lock fee from the inputs; the fee is rounded to a multiple of N so every participant's change is exact; the per-round cap is `CASHSHUFFLE_MAX_LOCK_FEE_SATS` (5,000). BCH change is allowed and is a privacy leak; exact funding is the privacy-preserving choice.

## Q7. Blame behavior

**Why:** the Nito code sets `aborted = true` and `phase = 'BLAME'` (`protocol.js:150-153`); the classic spec excludes the accused (`web/pages/research/coinjoin.vue:280-282`); the handoff says “exclude the accused and abort”.

**Proposed default:** abort + re-pool. Exclusion + continue needs a new pool size and a new round; it is a larger protocol change.

**Owner:** Joint.

## Q8. Production relay set

**Why:** the reference publishes on one relay; the measured set is damus/nos.lol (1/2) and primal/nostr.mom/offchain.pub (full round) (`docs/P2P-FUSION-DESIGN.md:179-183`).

**Proposed default:** a fixed set of three relays from the measured set, with a project relay as an optional fourth. The set is config, not code.

**Owner:** Joint.

## Q9. NIP-42 AUTH policy

**Why:** damus advertises AUTH; the Nito relay client captures the challenge but the transport does not wire it (`../nito.cash/apps/web/src/lib/nostr/relay.js:35-58`; `transport.js:49-53`).

**Proposed default:** `optional` for public relays; `required` for a project relay. The auth key is a session key.

**Owner:** Joint.

**Resolved 2026-11-26:** Nito wired the AUTH response (kind 22242, relay + challenge tags) under `authPolicy: none|optional|required` (`d85bade`); the production relay set and policy remain open (Q8).

## Q10. Liquidity cap

**Why:** the handoff leaves the cap open; one action costs 30,000 sats of fuel + 2,000 sats of blanks + the lock fee.

**Proposed default:** 400,000 sats for the first soak (10 actions: 300,000 fuel + 20,000 blanks + up to 50,000 lock fees); raise after the 24 h run.

**Owner:** Hush.

**Resolved 2026-11-26:** Nito accepted the 400,000-sat cap for 10 actions.

## Q11. Blank acquisition role

**Why:** the handoff §5 says the daemon can “hold/sell blanks”; selling makes the daemon an operator and re-centralizes distribution. The permissionless layer is the vending machine at 1,000 sats per blank.

**Proposed default:** the daemon buys blanks from the vending machine or receives them from the operator; it does not sell blanks unless it is explicitly the operator.

**Owner:** Joint.

## Q12. Proving-asset handover

**Why:** the Hush keypair is `VK 05250429…`, `zkey 4a4e2543…`, `wasm 8595b434…` (`AGENTS.md:699`); the Nito repo carries its own PPOT keypair and its role-2 registry was `walletProverCompatible: false`, `status: 'awaiting-proving-assets'` at the last Hush check (`../nito.cash/apps/web/src/lib/pool/registry.js:88-93`). The zkey is 97 MB (`prover.js:41`).

**Proposed default:** use the public `role2-proving-assets-v1` release (the three files + SHA256SUMS), add a CORS-enabled prover host and a browser caching plan, run the web-platform SHIELD→TRANSFER→UNSHIELD acceptance, then flip the flag.

**Owner:** Nito.

**Resolved 2026-11-26:** Nito pinned the three hashes, mirrored the assets on `prover.nito.cash`, and `scripts/pool-accept.mjs --pool role2 --txid 9d9aa97a` reports all three unlockings BYTE-EXACT (`a304d3c`). The registry flag flips after the web-platform acceptance.

## Q13. Nito 3-input builder and note delivery

**Why:** the Nito client is built for the 7-input covenant-at-input-0 shape; the role-2 pool is 3 inputs and the carrier leaves no room for the old out[6] note (`docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md` §3, §7).

**Proposed default:** the Nito client adopts the 3-input builder and off-chain note delivery before the daemon’s pool-native acceptance (A5). Our `role2-action.js` is the reference shape.

**Owner:** Nito.

**Resolved 2026-11-26:** the 3-input builders (`role2-carrier.js`, `role2-lock.js`, `role2-action.js`, `role2-actions.js`) are done; the store/UI wiring and role-2 scan remain. **2N client:** the Nito `protocol.js`/`round-runner.js` are still classic 1-in/1-out; the Desk 2N shape is pending.

## Q14. Metrics exposure

**Why:** acceptance A4 requires visible balance and caps; the unit has no port.

**Proposed default:** a localhost-only HTTP endpoint on `DAEMON_METRICS_ADDR` plus a JSON snapshot in journald once per minute.

**Owner:** Hush.

## Q15. `blackhost` ownership and capacity

**Why:** the host has 2 CPU cores, 3.8 GiB RAM, and 2.8 GiB free on a 93%-full disk (verified 2026-11-25); it also hosts the rpsls build.

**Proposed default:** Hush owns the host sign-off; the daemon runs with `MemoryMax=512M` and `CPUQuota=50%`; the journald cap is set before the first run; a proving daemon does not run on this host.

**Owner:** Hush.

**Resolved 2026-11-26:** Nito confirmed Hush owns the host sign-off; no Nito credentials are needed.

## Q16. 2N coordinator/tag link

**Why:** the 2N round's tag is public in the fuel output; the coordinator sees the participants' inputs and tags. If it learns which participant supplied which tag or blank, it can link the action pair to the funder. The design goal is that the tag identifies the fuel pair, not the funder (`docs/CASHSHUFFLE-NOSTR-DESIGN.md:77-78`); the classic CashShuffle onion hides the input-output mapping.

**Proposed default:** the participants send their tag/blank assignment through the onion (or a blind), so the coordinator builds the outputs without learning the participant→tag mapping. The verifier checks its own pair; the coordinator never sees the mapping in clear. A test coordinator that knows the mapping must not be able to reduce the peer's anonymity set.

**Owner:** Joint.

**Status:** open. The 2N builder/verifier are implemented; the blind is not.
