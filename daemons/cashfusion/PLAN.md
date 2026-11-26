<!-- daemons/cashfusion/PLAN.md -->
# CashFusion daemon plan

Status: M0 orchestration + M1 transport core. CF-5 (shared relay pool) is implemented; CF-1–CF-4 and CF-6–CF-8 are not started.

Owner key: **H** = Hush, **N** = Nito, **J** = joint.

## 1. Tasks

| ID | Task | Owner | Depends on | Exit criteria |
|---|---|---|---|---|
| CF-1 | Port the six-phase round from `web/stores/p2pfusion/round.ts` and `docs/P2P-FUSION-DESIGN.md` to the daemon; keep the phase names | H | shared transport (M1) | Unit tests for the phase table and the message router |
| CF-2 | Constants and fee model: 5-party 10/10, 1,760 B, 5,000 sats; 7-party 14/14; 80 ms pacing; `MIN_PARTICIPANTS=5` | H | CF-1 | Fixture test matches the measured constants |
| CF-3 | Coordinator policy: `avoid` by default; `rotate` and `allow` explicit; the election check aborts when the policy forbids the role | H | CF-1 | Unit tests for all three policies |
| CF-4 | Wallet and transaction assembly: BCH Schnorr 0x41, verify-before-sign, fee cap, broadcast | H | shared wallet (M3) | Chipnet round-trip; negative verify-before-sign test |
| CF-5 | Reuse the shared relay pool; no fork of the transport | H | M1 | **done** — `daemons/shared/src/nostr/relay-pool.js`, 40 shared tests |
| CF-6 | G4 testnet: 5-party and 7-party rounds on chipnet with Nito peers | J | CF-2, CF-4 | CF-A1, CF-A2, CF-A5 |
| CF-7 | Mainnet opt-in beta (G4) | H | CF-6; explicit operator sign-off | CF-A7 |
| CF-8 | Nito final approval | N | CF-6 | Written approval in `ACCEPTANCE.md` |

## 2. Task detail

### CF-1 — six-phase round

- Phases: `ANNOUNCE`, `ELECTION`, `REGISTRATION`, `MIXNET`, `ASSEMBLY`, `SIGNING`.
- Terminal states: `BROADCAST`, `ABORT`.
- The round state machine is separate from the transport; the transport only carries gift-wrapped packets.
- The daemon persists the round state before broadcast.

### CF-2 — constants

- 5-party: 10 inputs / 10 outputs, 1,760 B, 5,000 sats, 10/10 signatures.
- 7-party: 14/14 signatures.
- G2b chipnet: 428 B, 2,000 sats.
- Pacing: 80 ms per event per connection.
- `MIN_PARTICIPANTS=5`; the daemon enforces it even though `round.ts` does not.

### CF-3 — coordinator policy

- `avoid`: the daemon refuses the coordinator role; if elected, it aborts and re-pools.
- `rotate`: the daemon accepts the role on a deterministic schedule.
- `allow`: the daemon accepts the role when elected.
- The policy is logged at startup and in every election.

### CF-4 — wallet

- BCH Schnorr 0x41; never the Nostr BIP-340 signer.
- Verify-before-sign: the daemon checks its own output, the input set, and the fee.
- The fee cap is `CASHFUSION_MAX_FEE_RATE`; a round above the cap aborts before signing.
- The coordinator broadcasts; every peer verifies the txid.

### CF-5 — relay pool

- Use `daemons/shared/src/nostr/relay-pool.js`; no fork.
- The CashFusion kind is an open question (Q1); the gift-wrap envelope is the same.

### CF-6 — G4 testnet

- 5-party and 7-party rounds on chipnet with Nito peers.
- The existing CashFusion pool is not supported.
- The mainnet opt-in beta is not part of this task.

### CF-7 — mainnet opt-in beta

- Blocked until G4 is built and the operator signs off.
- The config rejects `CASHFUSION_NETWORK=mainnet` until then.

### CF-8 — approval

- Nito runs the client against the daemon and records the approval in `ACCEPTANCE.md`.

## 3. Definition of done

A task is done when:

- the code is committed on `master` with the `daemons: ` prefix;
- the unit tests pass on the apecsdev VM;
- the acceptance evidence is recorded;
- the relevant `OPEN-QUESTIONS.md` entry is resolved or explicitly deferred;
- no secrets, no build artifacts, and no generated files are committed.
