<!-- daemons/cashshuffle/OPEN-QUESTIONS.md -->
# CashShuffle daemon — open questions for the Nito rounds

Each question has a proposed default. A round resolves the question or records a deferral.

## Q1. NIP-44 padding: official v2 or a versioned private variant?

**Why:** the Nito `nip44.js` uses a 4-byte length prefix and next-power padding (`../nito.cash/apps/web/src/lib/nostr/nip44.js:32-45`); official NIP-44 v2 uses a 2-byte u16 prefix below 65,536 and chunked padding (`https://github.com/nostr-protocol/nips/blob/master/44.md`, lines 166-168, 189-211). A standard peer cannot decrypt the current payload.

**Proposed default:** official v2 in `daemons/shared`; `nito-v0` only as an explicit private mode with both peers set to it.

**Owner:** Joint.

## Q2. NIP-59 timestamps: who randomizes them?

**Why:** the current seal copies the rumor’s `created_at` and the gift wrap uses `now` (`../nito.cash/apps/web/src/lib/nostr/nip59.js:37,42-55,76`); NIP-59 line 111 directs implementations to tweak every timestamp other than the rumor’s.

**Proposed default:** the sender randomizes the seal and gift wrap up to two days in the past; the receiver accepts the two-day window; the subscription uses `since = now - 172800 - 300`.

**Owner:** Joint.

## Q3. Verify-before-sign: protocol core or daemon-only?

**Why:** the Nito protocol core has no transaction object and no output check (`../nito.cash/apps/web/src/lib/cashshuffle/protocol.js:17-24,109-115`). A malicious coordinator can present a transaction that omits a peer’s output.

**Proposed default:** add `VERIFY` to the protocol core so the browser peers and the daemon share the check; the daemon adds it regardless.

**Owner:** Joint.

## Q4. Registration fields

**Why:** the handoff §2.2 says the daemon publishes its “equal-amount input”; the classic spec and the Nito `register()` use the verification key + amount only (`web/pages/research/coinjoin.vue:186-190`; `protocol.js:74-90`).

**Proposed default:** registration = verification key + amount + version, unsigned. The input outpoint is revealed only when the transaction is built/signed.

**Owner:** Joint.

## Q5. Pool-native round shape

**Why:** one role-2 action consumes two same-tag fuel UTXOs (`../nito.cash/apps/web/src/lib/pool/role2-action.js:56,75`); one output per participant produces five different tags and zero pairs. The handoff’s “5 outputs → 5 actions” does not hold.

**Proposed default:** the pool-native round produces two tagged outputs per action (10 outputs for 5 actions), or each participant contributes two equal inputs and receives two same-tag outputs. The plain 5/5 round remains a separate mode.

**Owner:** Joint.

## Q6. Fee accounting

**Why:** the 15,000 × 2 fuel is the action fee (`role2-action.js:70`; `docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md:70-71`); the lock/shuffle transaction fee is separate; two blanks cost 1,000 sats each.

**Proposed default:** the cap includes 30,000 sats of action fuel + 2,000 sats of blanks + the lock/shuffle fee at `CASHSHUFFLE_FEE_RATE`, with `CASHSHUFFLE_MAX_LOCK_FEE_SATS` per lock.

**Owner:** Joint.

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

## Q10. Liquidity cap

**Why:** the handoff leaves the cap open; one action costs 30,000 sats of fuel + 2,000 sats of blanks + the lock fee.

**Proposed default:** 400,000 sats for the first soak (10 actions: 300,000 fuel + 20,000 blanks + up to 50,000 lock fees); raise after the 24 h run.

**Owner:** Hush.

## Q11. Blank acquisition role

**Why:** the handoff §5 says the daemon can “hold/sell blanks”; selling makes the daemon an operator and re-centralizes distribution. The permissionless layer is the vending machine at 1,000 sats per blank.

**Proposed default:** the daemon buys blanks from the vending machine or receives them from the operator; it does not sell blanks unless it is explicitly the operator.

**Owner:** Joint.

## Q12. Proving-asset handover

**Why:** the Hush keypair is `VK 05250429…`, `zkey 4a4e2543…`, `wasm 8595b434…` (`AGENTS.md:699`); the Nito repo carries its own PPOT keypair and its role-2 registry is `walletProverCompatible: false`, `status: 'awaiting-proving-assets'` (`../nito.cash/apps/web/src/lib/pool/registry.js:88-93`). The zkey is 97 MB (`prover.js:41`).

**Proposed default:** a new GitHub Release tag (or a prover host with CORS) carrying the three files, with SHA-256 hashes, a browser caching plan, and the web-platform SHIELD→TRANSFER→UNSHIELD acceptance gate before the flag flips.

**Owner:** Nito.

## Q13. Nito 3-input builder and note delivery

**Why:** the Nito client is built for the 7-input covenant-at-input-0 shape; the role-2 pool is 3 inputs and the carrier leaves no room for the old out[6] note (`docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md` §3, §7).

**Proposed default:** the Nito client adopts the 3-input builder and off-chain note delivery before the daemon’s pool-native acceptance (A5).

**Owner:** Nito.

## Q14. Metrics exposure

**Why:** acceptance A4 requires visible balance and caps; the unit has no port.

**Proposed default:** a localhost-only HTTP endpoint on `DAEMON_METRICS_ADDR` plus a JSON snapshot in journald once per minute.

**Owner:** Hush.

## Q15. `blackhost` ownership and capacity

**Why:** the host has 2 CPU cores, 3.8 GiB RAM, and 2.8 GiB free on a 93%-full disk (verified 2026-11-25); it also hosts the rpsls build.

**Proposed default:** Hush owns the host sign-off; the daemon runs with `MemoryMax=512M` and `CPUQuota=50%`; the journald cap is set before the first run; a proving daemon does not run on this host.

**Owner:** Hush.
