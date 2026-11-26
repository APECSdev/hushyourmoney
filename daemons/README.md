<!-- daemons/README.md -->
# Daemons — permanent CashShuffle and CashFusion liquidity

**Status:** shared transport (M1), CashShuffle round state machine + VERIFY (M2 partial), wallet selection + BCH P2PKH signer (M3 partial) and role-2 carrier/lock/action builders (M4 partial) implemented and tested (97/97 on blackhost); the network loop, signature verification/timeouts/persistence, Electrum broadcast, VM-eval, note delivery, CashFusion round and deployment are not implemented. No daemon is running or funded.
**Source handoff:** `docs/CASHSHUFFLE-DAEMON-HANDOFF-2026-11-25.md`.
**Reference implementation:** `../nito.cash/apps/web/src/lib/cashshuffle/`, `../nito.cash/apps/web/src/lib/nostr/`, `../nito.cash/apps/web/src/lib/pool/`.
**Design:** `../nito.cash/docs/CASHSHUFFLE-NOSTR-DESIGN.md`.

---

## 1. Purpose

Run long-lived Node.js daemons on `blackhost` that participate in — and can coordinate — CashShuffle-over-Nostr rounds, with a capped chipnet liquidity float. The same daemon family later gains a CashFusion mode. The daemons are Nostr clients (NIP-59 gift wrap + NIP-44 v2), not network servers. They join the relay pool, register, shuffle, verify, sign, and broadcast exactly like a browser peer.

The Nito Cash client remains the final approval for any deployed result.

---

## 2. What this tree contains

| Path | Purpose |
|---|---|
| `daemons/README.md` | This orchestration hub. |
| `daemons/ROADMAP.md` | Milestones M0–M7 and workstreams W1–W8. |
| `daemons/CONVENTIONS.md` | Runtime, config, logging, security, and build-host rules. |
| `daemons/package.json` | npm workspace root for the shared package and both daemons. |
| `daemons/shared/` | Shared config/metrics, the Nostr transport, the CashShuffle transport wrapper, and the BCH P2PKH signer. |
| `daemons/cashshuffle/` | CashShuffle round, wallet selection/signer, role-2 pool/lock/action, plans, acceptance, open questions, config, `.env.example`, systemd unit. |
| `daemons/cashfusion/` | CashFusion plan, acceptance, open questions, config, stubs for the round/wallet, unit, `.env.example`, systemd unit. |

**Not yet implemented:** the network loop, signature verification/timeouts/persistence, Electrum broadcast, role-2 VM-eval, off-chain note delivery, the CashFusion round, and any deployment. The shared Nostr transport is implemented in `shared/src/nostr/`; the CashShuffle round, wallet selection/signer, and role-2 lock/action builders are implemented in `cashshuffle/src/`.

---

## 3. Layout

```
daemons/
  README.md
  ROADMAP.md
  CONVENTIONS.md
  package.json
  shared/
    README.md
    package.json
    src/
      config.js
      metrics.js
      index.js
      nostr/README.md
      bch/README.md
      bch/p2pkh.js
      cashshuffle/transport.js
    test/
      config.test.js
      metrics.test.js
      nip44.test.js
      nip59.test.js
      event.test.js
      relay-pool.test.js
      cashshuffle-transport.test.js
      p2pkh.test.js
  cashshuffle/
    README.md
    PLAN.md
    ACCEPTANCE.md
    OPEN-QUESTIONS.md
    package.json
    .env.example
    systemd/cashshuffle-daemon.service
    src/
      main.js
      config.js
      relay-pool.js
      round.js
      wallet.js
      pool.js
      role2-lock.js
      role2-action.js
      metrics.js
    test/
      README.md
      config.test.js
      round.test.js
      wallet.test.js
      pool.test.js
      role2-lock.test.js
      role2-action.test.js
  cashfusion/
    README.md
    PLAN.md
    ACCEPTANCE.md
    OPEN-QUESTIONS.md
    package.json
    .env.example
    systemd/cashfusion-daemon.service
    src/
      main.js
      config.js
      relay-pool.js
      round.js
      wallet.js
      metrics.js
    test/
      README.md
      config.test.js
      round.test.js
```

---

## 4. Decisions locked from the 2026-11-25 review

These are not open for the first Nito round; they are the baseline the implementation starts from.

1. **Verify-before-sign is mandatory.** The Nito protocol core has no transaction object and no output check: `../nito.cash/apps/web/src/lib/cashshuffle/protocol.js:17-24,109-115`. This daemon adds a `VERIFY` phase between `SHUFFLE` and `SIGNING` (`daemons/cashshuffle/src/round.js`). Every peer checks its own output, the input set, and the fee before producing a signature.
2. **NIP-44 KDF and padding are the official v2 or an explicitly versioned private variant.** The Nito implementation uses the raw ECDH x-coordinate as the conversation key and HKDF with salt `nip44-v2`, plus a 4-byte BE length prefix and next-power-of-two padding (`../nito.cash/apps/web/src/lib/nostr/nip44.js`); official NIP-44 v2 uses HKDF-Extract for the conversation key, HKDF-Expand for the message keys, a 2-byte u16 prefix and chunked padding (`https://github.com/nostr-protocol/nips/blob/master/44.md`). `daemons/shared/src/nostr/nip44.js` implements both modes; the official mode passes the 35 official vectors, and `nito-v0` preserves the reference wire.
3. **Registration carries the verification key, amount, and version — not the input outpoint.** The classic spec is unsigned key + amount (`web/pages/research/coinjoin.vue:186-190`); the Nito `register()` takes `{ key, amount, version }` (`protocol.js:74-90`). The handoff’s “equal-amount input” wording is not used.
4. **A role-2 action consumes a PAIR of same-tag fuel UTXOs.** The action builder requires exactly two fuel UTXOs (`../nito.cash/apps/web/src/lib/pool/role2-action.js:56,75`); the lock creates two tagged outputs and spends two blanks (`role2-lock.js:6-9,86,106`). One 15,000-sat output per participant does not form a pair. Pool-native batching needs two tagged outputs per action (2N outputs for N actions), not one output per participant.
5. **Fee accounting is split.** The `15,000 × 2` fuel is the ACTION fee (`role2-action.js:70`; `docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md:70-71`; `role2-lock.js:31-33`). The lock/shuffle transaction fee is separate. Two blanks cost 1,000 sats each at the vending machine (`docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md` §4.1). The daemon cap accounts for all three.
6. **BCH Schnorr is not Nostr BIP-340.** Nostr events use BIP-340 (`../nito.cash/apps/web/src/lib/nostr/event.js:15-35`); BCH inputs use BCH Schnorr with the 0x41 sighash byte (`../nito.cash/apps/web/src/lib/bch/crypto.js:221-257`). `AGENTS.md:238` records “BCH Schnorr ≠ final BIP-340.” The wallet module uses the BCH path only.
7. **NIP-59 timestamps are tweaked.** The current Nito seal copies the rumor’s `created_at` and the gift wrap uses `now` (`../nito.cash/apps/web/src/lib/nostr/nip59.js:37,42-55,76`). NIP-59 line 111 directs implementations to tweak every timestamp other than the rumor’s. The shared transport randomizes the seal and gift-wrap timestamps up to two days in the past and subscribes with `since = now - 172800 - 300` (the pattern in `web/stores/p2pfusion/round.ts:122`).
8. **The daemon runs as a dedicated non-root user with hardening.** The unit uses `User=cashshuffle`, `NoNewPrivileges`, `ProtectSystem=strict`, `ProtectHome`, `PrivateTmp`, `StateDirectory`, `MemoryMax`, and `CPUQuota` (`daemons/cashshuffle/systemd/cashshuffle-daemon.service`). The host has 2 CPU cores, 3.8 GiB RAM, and 2.8 GiB free on a 93%-full 38G disk (verified 2026-11-25 via `ssh blackhost 'nproc; free -h; df -h /'`).
9. **Proving assets are a separate handover with an acceptance gate.** The Hush keypair is `VK 05250429…`, `zkey 4a4e2543…`, `wasm 8595b434…` (`AGENTS.md:699`); the Nito repo carries its own PPOT keypair (`VK 27f6ea03…`) and its role-2 registry entry was `walletProverCompatible: false`, `status: 'awaiting-proving-assets'` at the last Hush check (`../nito.cash/apps/web/src/lib/pool/registry.js:88-93`). The zkey is 97 MB and cannot ship in the app bundle (`prover.js:41`); the distribution channel, CORS, caching, and the web-platform SHIELD→TRANSFER→UNSHIELD acceptance gate are defined in `daemons/cashshuffle/OPEN-QUESTIONS.md`.
10. **CashFusion coordinator privacy is explicit.** `AGENTS.md:110` records that the coordinator-sees critique applies to CashFusion, not CashShuffle. The CashFusion daemon defaults to `coordinatorPolicy=avoid` (`daemons/cashfusion/src/config.js`); it does not become the default coordinator.

---

## 5. Blockers for implementation

No blocker to the implemented cores. The following items block the first working round and need a Nito round:

| Blocker | Owner | Why |
|---|---|---|
| Nito reference commit | Nito | `transport.js` and its test are untracked at `../nito.cash` HEAD `984ca4c`. This is a comparison/porting gap, not a blocker for the official mode. |
| NIP-44 mode for the Nito client | Joint | The daemon supports official v2 and `nito-v0`; the client must pick one. Official v2 is the interoperability target. |
| Nito client verify-before-sign | Joint | The daemon implements `VERIFY` and the malicious-coordinator test; the Nito browser peer needs the same check or the coordinator can steal from it. |
| Pool-native tag-pair round shape | Joint | One output per participant cannot fund a role-2 action. |
| Proving assets + 3-input builder + note delivery | Nito | The client cannot prove or drive the 3-input shape until it pins the public handover and swaps the builder. |
| Production relay set + NIP-42 policy | Joint | The current reference publishes on one relay and does not authenticate. |
| `blackhost` ownership and capacity sign-off | Hush | 2 cores, 3.8 GiB RAM, 2.8 GiB free; the daemon shares the host with the rpsls build. |
| Signature verification, timeouts, persistence, network loop, Electrum broadcast, VM-eval, note delivery | Hush | The cores exist; the runtime wiring, signature checks and chain path are the remaining Hush work. |
| Nito final approval | Nito | The standing bar for any deployed result. |

---

## 6. Build and run

**Never build on this host.** Build and test on the `apecsdev` VM; deploy to `blackhost`.

The p2pkh and role-2 tests need `@bitauth/libauth`. The web image’s `node_modules` does not include it; the full 97-test run on `blackhost` uses the Nito `apps/web/node_modules`, or install the daemon dependencies on the `apecsdev` VM.

```bash
# On the apecsdev VM, from the repository root:
cd daemons
npm install
npm test

# On blackhost, after the build artifact is copied:
sudo useradd --system --home /var/lib/cashshuffle-daemon --shell /usr/sbin/nologin cashshuffle
sudo useradd --system --home /var/lib/cashfusion-daemon --shell /usr/sbin/nologin cashfusion
sudo install -d -o cashshuffle -g cashshuffle /opt/cashshuffle-daemon
sudo install -d -o cashfusion  -g cashfusion  /opt/cashfusion-daemon
# copy the daemon trees, install /etc/cashshuffle-daemon.env (0600), then:
sudo systemctl daemon-reload
sudo systemctl enable --now cashshuffle-daemon
```

The systemd units use `/usr/local/bin/node` (verified on blackhost 2026-11-25). No site build is required for `daemons/`; it is outside `web/`.

---

## 7. Operating rules

- One task, one commit. Do not leave deletions or generated files staged in the shared working tree.
- No secrets in the repository. `.env` and `.seed` live outside the tree, mode 600, owned by the service user.
- No public metrics port. Bind metrics to `127.0.0.1` or emit them to journald.
- No root service. No `Restart=always` on a not-implemented skeleton; the units use `Restart=on-failure` with a start limit.
- No build on this host. No `npm install` here.
- Pool facts come from `pool-registry.json` and `docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md`; do not copy them from chat.
- The Nito client is the final approval for any deployed result.

---

## 8. Reading order

1. `daemons/ROADMAP.md` — what lands when.
2. `daemons/CONVENTIONS.md` — how the code is written and operated.
3. `daemons/shared/src/nostr/README.md` — the wire contract.
4. `daemons/shared/src/bch/README.md` — the signing contract.
5. `daemons/cashshuffle/README.md` → `PLAN.md` → `ACCEPTANCE.md` → `OPEN-QUESTIONS.md`.
6. `daemons/cashfusion/README.md` → `PLAN.md` → `ACCEPTANCE.md` → `OPEN-QUESTIONS.md`.
