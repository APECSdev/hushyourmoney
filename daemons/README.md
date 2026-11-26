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

## 4. Decisions settled (Hush + Nito, 2026-11-26)

These are settled; the implementation follows them.

1. **Verify-before-sign is mandatory.** Nito added `VERIFY` between `SHUFFLE` and `SIGNING` (`docs/DAEMONS-NITO-RESPONSE-2026-11-25.md` item 3), and the daemon has the same phase (`daemons/cashshuffle/src/round.js`). Every peer checks its own output, the input set, the fee and duplicate outpoints/addresses before producing a signature.
2. **NIP-44 is official v2.** Nito chose `official` (commit `ac61542`); the shared module’s default is official and passes `nip44.vectors.json`. `nito-v0` remains a compatibility mode but is not used by the Nito client.
3. **Registration carries the verification key, amount, and version — not the input outpoint.** Confirmed by Nito; the classic spec is unsigned key + amount (`web/pages/research/coinjoin.vue:186-190`).
4. **A role-2 action consumes a PAIR of same-tag fuel UTXOs.** Nito confirmed the 2N-output round shape (10 outputs for 5 actions) on 2026-11-26. The lock creates two tagged outputs and spends two blanks; the action consumes exactly two fuel UTXOs plus the state.
5. **Fee accounting is split.** The `15,000 × 2` fuel is the ACTION fee; the lock/shuffle fee is separate; two blanks cost 1,000 sats each. Nito confirmed the split and the 400,000-sat cap for 10 actions.
6. **BCH Schnorr is not Nostr BIP-340.** Nostr events use BIP-340; BCH inputs use BCH Schnorr with the 0x41 sighash byte. The wallet module uses the BCH path only.
7. **NIP-59 timestamps are tweaked.** Nito adopted independent seal/gift-wrap randomization up to two days in the past (commit `ac61542`); the receiver accepts the two-day window plus 300 s. The shared transport implements the same rule.
8. **The daemon runs as a dedicated non-root user with hardening.** `User=cashshuffle`, `NoNewPrivileges`, `ProtectSystem=strict`, `ProtectHome`, `PrivateTmp`, `StateDirectory`, `MemoryMax=512M`, `CPUQuota=50%`. The host has 2 CPU cores, 3.8 GiB RAM, and 2.8 GiB free on a 93%-full 38G disk (verified 2026-11-25).
9. **Proving assets are pinned with an acceptance gate.** Nito pinned the three hashes, mirrored them on `prover.nito.cash`, and `scripts/pool-accept.mjs --pool role2 --txid 9d9aa97a` reports all three unlockings BYTE-EXACT (commit `a304d3c`). The registry flag flips after the web-platform SHIELD→TRANSFER→UNSHIELD.
10. **CashFusion coordinator privacy is explicit.** `AGENTS.md:110` records that the coordinator-sees critique applies to CashFusion, not CashShuffle. The CashFusion daemon defaults to `coordinatorPolicy=avoid`.

---

## 5. Remaining blockers

No blocker to the implemented cores. The remaining items block the first working round:

| Blocker | Owner | Why |
|---|---|---|
| Nito store/UI wiring for `submitRole2Action` + role-2 scan | Nito | The builders are done; the store/UI and the 642-B STMT / 169-B carrier scan are the remaining client work. |
| Web-platform chipnet SHIELD→TRANSFER→UNSHIELD | Nito | After this, `walletProverCompatible` flips and the daemon-side A5/A6 can run. |
| Production relay set + NIP-42 policy | Joint | NIP-42 is wired (commit `d85bade`); the production set and policy remain open. |
| Blame behavior, blank-acquisition role, metrics exposure | Joint/Hush | Open design/ops items. |
| Signature verification, timeouts, persistence, network loop, Electrum broadcast, VM-eval, note delivery, deployment | Hush | The cores exist; the runtime wiring, signature checks and chain path are the remaining Hush work. |
| Nito final approval | Nito | Standing; the record goes in A10 / CF-A6. |

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
