<!-- /Workspace/apecsdev/hushyourmoney/P2P-FUSION-DESIGN.md -->

# P2P-FUSION-DESIGN.md — Serverless CoinJoin over Nostr for the Hush Toolbox

**STATUS:** architecture draft v0.1 (2026-11-16). Not implemented yet.
Every claim is tagged `[cited · <source>]` (third-party, verified), `[measured]`
(our own live evidence), or `[proposed]` (our design decision, open for review).

**Upstream studied (read-only, clean-room):**
- `github.com/00-Protocol/00-Wallet` — `landing/views/fusion.ts` (1,493 lines),
  `landing/core/nostr-pool.ts` (285 lines), `landing/core/nostr-bridge.ts` (218 lines)
  `[cited · fetched from raw.githubusercontent.com 2026-11-16]`
- `github.com/00-Protocol/BCH-Stealth-Protocol` — `bch-stealth-protocol/README.md`
  (18,197 B), Fusion section §3 `[cited · fetched 2026-11-16]`
- `bitcoincashresearch.org/t/1773` — announcement + review thread
  `[cited · fetched 2026-11-16]`

**License note (governs everything below):** both upstream repos have **no
LICENSE file** (GitHub API `license: null`; raw `LICENSE` fetch → 404 for both,
verified 2026-11-16) even though `00-Wallet/README.md` says "License: MIT".
Legally that is *all rights reserved*. This design is therefore a
**clean-room specification informed by their public protocol description** —
we may read and cite, we may not copy code.

---

## 1. Why a serverless CoinJoin

The toolbox already ships a classic CashFusion client — a central-coordinator
protocol with Tor-covert connections:

- `web/stores/fusion.ts` (258 lines) — constant set (`MAX_COMPONENT_FEERATE`,
  `MAX_EXCESS_FEE`, `MAX_COMPONENTS`, `MIN_TX_COMPONENTS`, `TOR_PORTS`,
  autofuse limits) `[measured · file inspected 2026-11-16]`
- `web/stores/wallet/authFusion.ts`, `signFusion.ts`, `completeFusion.ts` —
  the player-side signing flow `[measured · file inspected 2026-11-16]`
- `web/stores/wallet.ts` — fusion address pool + auto-fuse hooks (lines 145–491)
  `[measured · file inspected 2026-11-16]`

That client depends on an external coordinator server. The P2P design removes
the coordinator entirely:

| | classic CashFusion (in app) | P2P over Nostr (this doc) |
|---|---|---|
| Coordinator | external server, trusted for round integrity `[cited · stores/fusion.ts]` | none — peers self-elect per round `[cited · 00-Wallet fusion.ts L344]` |
| Transport | Tor covert channels to the server `[cited · stores/fusion.ts TOR_PORTS]` | Nostr relays, E2E gift-wrapped P2P msgs `[cited · BCH-Stealth-Protocol §3]` |
| Output blinding | server-side blindness (server can't link, but sees all) | onion mix-net through all peers `[cited · fusion.ts L574–745]` |
| Backend | none | none (matches the app's no-backend identity) |

**Non-goals v1:** replacing the existing CashFusion client; hiding amounts
(that is the shielded pool's job — see `/research/shielded-pool`); stealth
outputs (upstream disabled theirs — `if (false && keys.stealthSpendPub)
{ // TODO: re-enable stealth outputs later }` `[cited · fusion.ts L613]`).

---

## 2. Component architecture

```
┌─────────────────────────────── browser (toolbox) ───────────────────────────────┐
│                                                                                 │
│  /toolbox/fusion (page)                                                         │
│        │ uses                                                                   │
│        ▼                                                                        │
│  stores/p2pfusion/round.ts ── 6-phase state machine (the whole protocol)        │
│        │            │                │                                          │
│        ▼            ▼                ▼                                          │
│  relay.ts      coinselect.ts     txbuild.ts                                     │
│  Nostr WS      UTXO picker       standard P2PKH tx                              │
│  pool + subs   (token-aware)     builder (bch-js)                               │
│        │                             │                                          │
│        ▼                             ▼                                          │
│  giftwrap.ts                    NIP-44 layer encryption                         │
│  NIP-59 seal/rumor                    │                                          │
│  (ephemeral identity)                 ▼                                          │
│        │                     web/server/api/electrum.post.ts                    │
│        │                     (existing JSON-RPC proxy — chain data + broadcast) │
└────────┼─────────────────────────────────┼──────────────────────────────────────┘
         ▼                                 ▼
   Nostr relays (untrusted)         Electrum/Fulcrum cluster
   ciphertext + metadata only       listunspent / broadcast
```

- **Relays are untrusted:** they see ciphertext and timing metadata, never
  plaintext addresses `[proposed; upstream makes the same claim
  `[cited · BCH-Stealth-Protocol §3 "No central coordinator — Nostr ephemeral
  events only"]`]`.
- **Chain access** reuses the existing electrum proxy
  (`web/server/api/electrum.post.ts`, cluster rebuilt 2026-11-13 — 5 Let's-Encrypt
  Fulcrum primaries verified live `[measured · AGENTS.md release log]`).
- **No new server code.** Everything peer-side.

## 3. Module plan (new files only)

| file | role | status |
|---|---|---|
| `web/stores/p2pfusion/relay.ts` | Nostr WebSocket pool: connect/rotate/dedup/resubscribe (pattern: upstream `nostr-pool.ts` SharedWorker — we may run per-tab instead v1) `[proposed]` | to build |
| `web/stores/p2pfusion/identity.ts` | per-round ephemeral secp256k1 keypair, zeroized on round end `[cited · fusion.ts L241–249 _destroyRoundIdentity]` | to build |
| `web/stores/p2pfusion/giftwrap.ts` | NIP-59 seal/rumor + NIP-44 layer encryption for onion hops `[proposed — upstream uses AES-GCM onion (fusion.ts onionWrap); NIP-44 is our swap]` | to build |
| `web/stores/p2pfusion/round.ts` | the 6-phase state machine + blame/timeout | to build |
| `web/stores/p2pfusion/txbuild.ts` | P2PKH tx build/sign via `@psf/bch-js` (already a dependency) `[measured · package.json]` | to build |
| `web/pages/toolbox/fusion.vue` | UI: pool discovery, round progress, history | to build |

Dependencies to add: `@noble/curves`, `@noble/hashes`
`[proposed — not currently in web/package.json; verified by grep 2026-11-16]`.

## 4. Protocol (adaptation of the upstream 6-phase design)

Baseline cited from upstream `[cited · fusion.ts L38–48 constants, L466–1050
phases; BCH-Stealth-Protocol §3]`; deltas marked `[proposed]`.

```
Phase 1  ANNOUNCE     ephemeral pub → kind 22230 pool event
Phase 2  ELECTION     sort ephemeral pubs; lowest = coordinator
                      (random 30–120 s wait first [cited L324 POOL_WAIT_MIN/MAX])
Phase 3  REGISTRATION gift-wrapped inputs {txid,vout,value} + output_count
Phase 4  MIXNET       outputs onion-wrapped through ALL peers (sorted order),
                      sequential peel + shuffle each hop; last peer publishes set
Phase 5  ASSEMBLY+VERIFY  coordinator orders inputs/outputs; EVERY peer checks:
                        (a) all my outputs present            [cited L858–867]
                        (b) no inflation (sumOut ≤ sumIn)     [cited L869–876]
                        (c) fee ≤ estBytes × 5 sat/B          [cited L878–884]
                      then signs own inputs only
Phase 6  BROADCAST    coordinator assembles fully-signed tx; any peer may also
                      broadcast (redundant relay)            [proposed delta]
```

Mermaid sequence (publication-grade version will be rendered on the site):

```
P1        P2        P3(coordinator)   relays/chain
│ announce │                │              │
│─────────┼───────────────►│              │   kind 22230
│         │ announce       │              │
│         │───────────────►│              │
│  [lowest ephemeral pub = coordinator]   │
│◄────────┼────────────────┤ round_start  │   gift-wrap
│ inputs  │     inputs     │              │
│─────────┼───────────────►│              │   gift-wrap
│ onion(myOut) ── peel ── peel ── publish │   onion net
│◄────────┼─────── outputs set ───────────│
│ verify+sign own inputs                  │
│─────────┼───── signatures ──────────────│
│         broadcast assembled tx ─────────►│ chain
```

**Constants v1 `[proposed unless noted]`:**

| constant | value | rationale |
|---|---|---|
| `MIN_PARTICIPANTS` | **5** | upstream used 2 `[cited L38]` — a 2-party round has near-zero mapping entropy; 5 is our floor |
| inputs per peer | 1–5, ≥546 sats, random | parity with upstream `[cited L580–586]` |
| outputs per peer | 2–4, random split, no change output | parity `[cited L588–610]`; no-change kills the biggest re-link |
| fee model | per-peer `nIn·148 + nOut·34 + ceil(10/peers)` | parity `[cited L591]` |
| phase timeout | 60 s + blame | parity `[cited L39 PHASE_TIMEOUT, L1053 blame]` |
| token UTXOs | excluded from inputs v1 | `[proposed]` — plain P2PKH only v1 |
| output addresses | fresh HD children from the existing fusion address pool (`stores/wallet.ts fusionAddrs`) | `[proposed — reuses in-app primitive]` |
| broadcast path | `/api/electrum` proxy + psf broadcast fallback | `[proposed — both paths already exist and are verified]` |

**Security analysis (v1):**

- A malicious coordinator *cannot steal*: it never holds signatures for inputs
  it doesn't own, and every peer's verify step rejects an output set that omits
  or shortchanges it `[cited upstream verify; we keep the same invariant]`.
- A malicious *last peeler* learns the plaintext output set — which is public in
  the tx anyway; it cannot map outputs to owners `[cited upstream design]`.
- Sybil ceiling: an attacker joining every round sees all inputs' ephemeral
  tags but cannot break the onion mapping; with `MIN_PARTICIPANTS=5` and pipelined
  rounds the per-round anonymity set is ≥4 others `[proposed; upstream's 2-floor
  is the weakness we fix]`.
- Relay-level DoS and eclipse attacks: rotate relays (upstream pattern
  `[cited nostr-pool.ts rotateRelay]`); multiple simultaneous rounds
  `[proposed]`.

## 5. Build gates (mirroring our pool-gate culture)

| gate | criterion | measurable |
|---|---|---|
| G1 | relay + NIP-59 + onion roundtrip in-repo unit test | **PASSED 2026-11-20** — `node web/tests/p2pfusion-g1.mjs` → 4/4: NIP-44 roundtrip + tamper reject (payload 600 b64 chars), NIP-59 wrap/unwrap + outsider reject, onion 3-hop wrap/peel + order reject, live relay gift-wrap roundtrip (relays 1/2 connected — `wss://relay.damus.io`, `wss://nos.lol`; delivery confirmed, `since` window must cover NIP-59's 2-day created_at backdating) `[measured]` |
| G2a | 2-party round, full six phases, dry-run | **PASSED 2026-11-20** — `node web/tests/p2pfusion-g2.mjs` → 3/3 deterministic runs; 4 inputs / 4 outputs; independent BIP143+Schnorr verification 4/4; fee 3,000 sats; est. size 738 B `[measured]`. Test transport = in-process NIP-01 relay fixture (`web/tests/nostr-relay-fixture.mjs`) — deterministic by design; live relays remain covered by G1 |
| G2b | same round, real chipnet tx broadcast + confirmed | **PASSED 2026-11-20** — funding tx `f3158b02d0825a84e7f60e81377cde40644f24f85016934fc7e70ec035ac601e` (253 B) accepted; round tx **`c4fc6fc911408c0ceba1030c0e4d86c4c0f095e9141c9fcd315f2115d0c754d5`** (2 in / 4 out, 428 B, fee 2,000 sats ≈ 4.7 sat/B) accepted by the network and visible via Electrum; explorer `chipnet.imaginary.cash/tx/c4fc6fc9…` `[measured]` |
| G3 | N-party round (5 default, 7 tested) | **PASSED 2026-11-20** — 5-party: tx `c23b441c65f0ff8e15198891944454284d63fd1e339a30326d30390012a0d19f`, 10 in / 10 out, 1,760 B, fee 5,000 sats, **10/10 signatures independently verified**; 7-party: 14/14 verified, tx `a91b695a…edd81`; 2-party regression re-passed `[measured]`. Transport = local relay fixture (deterministic) |
| G3L | same round over LIVE public relays (damus/nos.lol) | not yet gate-tested — G1 proves live transport for gift wraps; a full round over public relays is the open gap `[open]` |
| G4 | mainnet opt-in beta behind a settings flag | live links on `/toolbox/fusion` |

Each gate's numbers get published with the same verification contract as the
pool pages (file path / command output / txid links).

## 5b. G2a defect log (found and fixed by the harness)

1. **First peeler never peeled its own onions** — it pushed wrapped layers straight into the
   collection. Fixed with a unified `processOnionLayer()`.
2. **Coordinator dropped `outputs` while still in the onion phase** — it only peels/forwards
   and never collects, so it must accept the set from the last peeler in phase 3.
3. **Participant dropped `tx` while in the `outputs` phase** — phase gate now allows it.
4. **Self counted twice in `expectedOnions`** (`cfg.outputs` + `peerOutputCounts` which
   already includes self) — the round waited forever for onions that don't exist.
5. **`publish()` silently dropped events before the socket opened** — added a per-relay
   outbox flushed on connect (this one would have caused intermittent real-world stalls).
6. **Messages arriving before their phase were lost** — added a per-phase pending queue,
   flushed on phase entry.
7. **Relay fixture overwrote subscriptions per connection** (one sub per socket) — fixed to
   NIP-01 semantics: many subs per connection keyed by subId.
8. **Schnorr self-verify passed a 33-byte key** — BIP-340 wants x-only (32).
9. **NIP-44 padding** must allocate `prefix + calc_padded_len(L)` bytes (exact spec form) —
   powers-of-two plaintexts overflowed by the 2-byte prefix.

## 5c. G2b defect log — BCH Schnorr ≠ BIP-340 (the expensive one)

The first real broadcast was rejected with `mandatory-script-verify-flag-failed
(Signature must be zero for failed CHECK(MULTI)SIG operation)` — NULLFAIL.
Chain of evidence (all reproduced 2026-11-20):

1. Our BIP143 sighash **matched libauth's `generateSigningSerializationBCH` byte-for-byte**
   on a real chain transaction — the preimage was never the problem.
2. Our serializer matched libauth's `encodeTransactionBCH` byte-for-byte.
3. libauth's BCH VM reproduced the NULLFAIL locally — the signature was the problem.
4. **Cause:** BCH's 2019 Schnorr (Lundeberg) is the *BIP-340 draft*, not final BIP-340:
   `e = SHA256(r ‖ compressed_pubkey33 ‖ m)` with **no BIP-0340 tag prefixes**, and
   `R` must be normalized to the **quadratic-residue** Y root (Jacobi symbol 1) — not
   the even-Y root that final BIP-340 uses. Noble's `schnorr` produces final BIP-340
   signatures, which the BCH VM rejects.
   Spec: `bitcoincashorg/bitcoincash.org/spec/2019-05-15-schnorr.md` (fetched 2026-11-20).

`txbuild.ts` now implements `bchSchnorrSign` / `bchSchnorrVerify` per that spec;
the signed tx passes libauth's BCH VM (`error: none, stack: ['01']`) and the
network accepts it. **Lesson for every future on-chain gate: verify against
libauth's VM before broadcasting — self-consistency proves nothing.**

5. Also fixed: P2PKH scriptCode must be derived from each input's own private key
   (y-parity!), never from an x-only pubkey with a forced `02` prefix — the second
   rejection was `OP_EQUALVERIFY`.

## 5d. G3 defect log

1. **Intermediate peelers never left the `onion` phase** — they received the
   `outputs` broadcast but only the coordinator reacted, so the subsequent `tx`
   message was buffered forever (2-party rounds masked this: with N=2 the last
   peeler is also the only non-coordinator). Fix: the `outputs` message now
   advances **every** peer to phase 4.

## 6. Open questions

1. Relay set policy: default public relays vs user-configured (privacy-sensitive
   default = user's own relay first) `[open]`.
2. Should rounds target a fixed denomination ladder (better set heuristics)
   vs pure random split? (CashFusion does random split
   `[cited · t/752 analysis context]`.) `[open]`
3. NIP-44 vs AES-GCM for onion layers — NIP-44 gives standardization; AES-GCM
   gives parity with upstream `onionWrap` `[open]`.
4. Integration point with the shielded pool: post-fusion "shield into pool"
   button (composition story already published on `/research/coinjoin`)
   `[proposed]`.
