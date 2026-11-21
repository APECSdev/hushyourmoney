<!-- web/pages/research/nostr-fusion.vue — topic 03 (our serverless CoinJoin research) -->

<script setup lang="ts">
/* Shared shell + styles come from layouts/research.vue (user refactor 2026-11-13). */
definePageMeta({
    layout: 'research',
})

/* OpenGraph + Twitter + canonical (shared composable; per-page poster). */
useOg({
    title: `P2P Fusion over Nostr — Hush Your Money`,
    description: `Serverless CoinJoin over Nostr: no coordinator server, NIP-59 gift-wrapped peer messages, onion-routed outputs. Our gates G1–G3L passed; the G2b round is live on chipnet. G4 is pending.`,
    path: '/research/nostr-fusion',
    image: '/posters/research.jpg',
    type: 'article',
    imageAlt: `P2P Fusion over Nostr — serverless CoinJoin research, measured gate by gate`,
})

/* Scroll-reveal (shared composable). */
useReveal()

/* ── Six protocol phases (design) ──────────────────────────────────
   Source: P2P-FUSION-DESIGN.md §4. The harness wires them as
   inputs → onion → outputs → tx → sign → broadcast. */
const PHASES = [
    {
        n: '01',
        title: 'Announce',
        tag: 'design',
        body: 'A peer publishes an ephemeral pubkey to a pool event (kind 22230 in the design). The harness currently starts from an explicit peer list — live pool discovery is not built yet.',
    },
    {
        n: '02',
        title: 'Election',
        tag: 'implemented',
        body: 'Peers sort ephemeral pubkeys; the lowest becomes the round coordinator. There is no server — the coordinator is just the first peer in a deterministic order.',
    },
    {
        n: '03',
        title: 'Registration',
        tag: 'implemented',
        body: 'Each peer sends its inputs {txid, vout, value} and output count as a NIP-59 gift wrap. The coordinator collects them for the round.',
    },
    {
        n: '04',
        title: 'Mixnet',
        tag: 'implemented',
        body: 'Each peer onion-wraps its outputs through every peer in sorted order. Each hop peels one layer and shuffles; the last peer publishes the plaintext output set.',
    },
    {
        n: '05',
        title: 'Assembly + verify',
        tag: 'implemented',
        body: 'The coordinator orders inputs and outputs. Every peer checks its outputs are present, no inflation (sumOut ≤ sumIn), and fee ≤ estBytes × 5 sat/B before signing only its own inputs.',
    },
    {
        n: '06',
        title: 'Broadcast',
        tag: 'implemented',
        body: 'The coordinator assembles the fully signed transaction and broadcasts it. Any peer may also broadcast as a redundant relay — a proposed delta over the upstream design.',
    },
]

/* ── Gate record (all measured 2026-11-20; source: P2P-FUSION-DESIGN.md §5) ── */
const GATES = [
    {
        id: 'G1',
        cls: 'gate-done',
        status: 'passed',
        title: 'Relay + crypto roundtrip',
        points: [
            '4/4 checks: NIP-44 v2 roundtrip + tamper reject; NIP-59 wrap/unwrap + outsider reject; 3-hop onion wrap/peel + order reject; live relay gift-wrap roundtrip.',
            'Live relays: wss://relay.damus.io and wss://nos.lol (1/2 connected); delivery confirmed. The subscription window must cover NIP-59\'s 2-day created_at backdating.',
        ],
        txs: [],
        harnessTxs: [],
    },
    {
        id: 'G2a',
        cls: 'gate-done',
        status: 'passed',
        title: 'Two-party round, dry-run',
        points: [
            '3/3 deterministic runs; 4 inputs / 4 outputs; 4/4 BIP143 + BCH-Schnorr signatures independently verified; fee 3,000 sats; estimated size 738 B.',
            'Transport: in-process NIP-01 relay fixture — deterministic by design. Live relays are covered by G1 and G3L.',
        ],
        txs: [],
        harnessTxs: [],
    },
    {
        id: 'G2b',
        cls: 'gate-live',
        status: 'on chain',
        title: 'Real chipnet broadcast',
        points: [
            'Funding tx 253 B accepted; round tx 2 inputs / 4 outputs, 428 B, fee 2,000 sats ≈ 4.7 sat/B — accepted by the network and visible via Electrum.',
            'This is the only gate in the set with real chain transactions; G3 and G3L are dry-runs with fixture UTXOs.',
        ],
        txs: [
            { label: 'fund', txid: 'f3158b02d0825a84e7f60e81377cde40644f24f85016934fc7e70ec035ac601e' },
            { label: 'round', txid: 'c4fc6fc911408c0ceba1030c0e4d86c4c0f095e9141c9fcd315f2115d0c754d5' },
        ],
        harnessTxs: [],
    },
    {
        id: 'G3',
        cls: 'gate-done',
        status: 'passed',
        title: 'N-party round (5 default, 7 tested)',
        points: [
            '5-party: 10 inputs / 10 outputs, 1,760 B, fee 5,000 sats, 10/10 signatures independently verified.',
            '7-party: 14/14 signatures verified; the 2-party regression re-passed. Transport: local relay fixture.',
        ],
        txs: [],
        harnessTxs: [
            'c23b441c65f0ff8e15198891944454284d63fd1e339a30326d30390012a0d19f',
            'a91b695a…edd81 (7-party, truncated in the design record)',
        ],
    },
    {
        id: 'G3L',
        cls: 'gate-done',
        status: 'passed',
        title: 'Same round over live public relays',
        points: [
            '5-party full round over wss://relay.primal.net, wss://nostr.mom and wss://offchain.pub: 10/10 signatures verified.',
            'A repeat run also passed. The round is still a dry-run — live relays, fixture UTXOs, no broadcast.',
        ],
        txs: [],
        harnessTxs: [
            '13bc75cecaf0c6f845f8a6e6074c8b6f43909670c85f304b9f413d5989f70f0d',
            '20d0c9b90571dd2ae11cd3a8d4de3219d02398c18aa42cc8a61f6bd52d8b9b6d',
        ],
    },
    {
        id: 'G4',
        cls: 'gate-wait',
        status: 'pending',
        title: 'Mainnet opt-in beta',
        points: [
            'Criterion: mainnet opt-in beta behind a settings flag.',
            'Not built: web/pages/toolbox/fusion.vue does not exist. The protocol modules and gate harnesses are in-repo; the production UI is the remaining step.',
        ],
        txs: [],
        harnessTxs: [],
    },
]

/* ── What the gates taught us (source: P2P-FUSION-DESIGN.md §5b–§5e) ── */
const FINDINGS = [
    {
        tag: 'the expensive one',
        title: 'BCH Schnorr is not final BIP-340',
        body: 'BCH\'s 2019 Schnorr is the BIP-340 draft: the challenge is e = SHA256(r ‖ compressed_pubkey33 ‖ m) with no BIP-0340 tag prefixes, and R must be normalized to the quadratic-residue Y root (Jacobi symbol 1), not the even-Y root. Noble\'s schnorr produces final BIP-340 signatures — the BCH VM rejected them with NULLFAIL.',
    },
    {
        tag: 'scriptCode',
        title: 'y-parity is per input',
        body: 'The P2PKH scriptCode must be derived from each input\'s own private key. Forcing an 02 prefix onto an x-only pubkey produced a second rejection — OP_EQUALVERIFY. The fix is per-input key material, not a shared x-only key.',
    },
    {
        tag: 'relay behavior',
        title: 'Public relays do not echo',
        body: 'A relay does not send an event back to the connection that published it. With one shared socket for all peers, peers never receive each other\'s messages on real relays. The fix is one connection per peer — also the honest wallet model.',
    },
    {
        tag: 'rate limits',
        title: 'Free relays throttle bursts',
        body: 'Observed verbatim: damus “banned: too many rate-limit violations, try again later”; nos.lol “rate-limited: slow down matey”. A 5-party round emits ~100+ gift wraps, so publishing is paced at one event per 80 ms per connection.',
    },
    {
        tag: 'lossy relays',
        title: 'Origin retries + dedupe',
        body: 'Only forwarded onion layers were re-sent at first, so a dropped first hop stalled the round. All outbound layers are now re-sent while the onion phase is active, with hash-based dedupe at the receiver.',
    },
    {
        tag: 'open gap',
        title: 'NIP-42 AUTH is not implemented',
        body: 'damus now advertises NIP-42 AUTH. The NIP-59 spec recommends supporting it; the current relay pool does not authenticate. This is tracked as an open item, not a solved one.',
    },
]

/* ── Open questions (source: P2P-FUSION-DESIGN.md §6 + this session's record) ── */
const OPEN = [
    { tag: 'policy', text: 'Relay set: default public relays vs a user-configured set (privacy-sensitive default = the user\'s own relay first).' },
    { tag: 'design', text: 'Fixed denomination ladder (better set heuristics) vs pure random split — CashFusion uses random split.' },
    { tag: 'crypto', text: 'NIP-44 vs AES-GCM for onion layers: NIP-44 gives standardization; AES-GCM gives parity with the upstream onionWrap.' },
    { tag: 'integration', text: 'Post-fusion “shield into pool” button — the composition story already published on the CoinJoin page.' },
    { tag: 'discovery', text: 'Live pool discovery (kind 22230) is design-only; the harness supplies the peer set explicitly.' },
    { tag: 'gate', text: 'G4 mainnet opt-in beta behind a settings flag — not built.' },
]
</script>

<template>

    <!-- ── Topic hero ── -->
        <section class="relative z-10 mx-auto flex min-h-[72vh] w-full max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-14 text-center">

            <NuxtLink to="/research" class="crumb animate-rise" style="animation-delay: 0.04s">
                research <span class="sep">/</span> nostr-fusion
            </NuxtLink>

            <p class="animate-rise mt-6 font-mono text-[0.8rem] uppercase tracking-[0.5em] text-cyan-200 sm:text-xs" style="animation-delay: 0.1s">
                topic 03 · our research · serverless CoinJoin
            </p>

            <h1 class="animate-rise mt-6 font-display text-[clamp(2.4rem,8vw,6rem)] font-extrabold leading-[1.04] tracking-tight text-white" style="animation-delay: 0.2s">
                P2P Fusion<br />
                <span class="text-gradient">over Nostr</span>
            </h1>

            <p class="animate-rise mt-6 font-mono text-[clamp(1rem,2.8vw,1.5rem)] italic text-cyan-100" style="animation-delay: 0.32s">
                No coordinator server. Just peers, relays, and onion-wrapped outputs.
            </p>

            <p class="animate-rise mt-8 max-w-2xl text-base leading-relaxed text-slate-100 sm:text-lg" style="animation-delay: 0.42s">
                A CoinJoin round where <strong class="font-semibold text-white">the coordinator is elected per round</strong>
                from the participants themselves, messages are gift-wrapped, and outputs travel through an
                onion mix-net. We built the protocol modules and measured the round gate by gate —
                <strong class="font-semibold text-white">G1 through G3L passed; G4 is pending</strong>.
            </p>

            <div class="animate-rise mt-8 flex flex-wrap items-center justify-center gap-3" style="animation-delay: 0.5s">
                <span class="status-chip status-lime">our research</span>
                <span class="status-chip status-cyan">G1–G3L passed</span>
                <span class="status-chip status-violet">G4 pending</span>
            </div>
        </section>

        <!-- ── Stat strip ── -->
        <section class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20">
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div class="stat-card reveal">
                    <p class="font-display text-3xl font-bold text-lime-300">6</p>
                    <p class="mt-1 font-mono text-xs uppercase tracking-[0.25em] text-slate-300">round phases</p>
                </div>
                <div class="stat-card reveal" style="transition-delay: 0.08s">
                    <p class="font-display text-3xl font-bold text-cyan-300">10/10</p>
                    <p class="mt-1 font-mono text-xs uppercase tracking-[0.25em] text-slate-300">signatures verified · 5-party</p>
                </div>
                <div class="stat-card reveal" style="transition-delay: 0.16s">
                    <p class="font-display text-3xl font-bold text-violet-300">1,760 B</p>
                    <p class="mt-1 font-mono text-xs uppercase tracking-[0.25em] text-slate-300">5-party tx · 10 in / 10 out</p>
                </div>
                <div class="stat-card reveal" style="transition-delay: 0.24s">
                    <p class="font-display text-3xl font-bold text-white">0</p>
                    <p class="mt-1 font-mono text-xs uppercase tracking-[0.25em] text-slate-300">coordinator servers</p>
                </div>
            </div>
        </section>

        <!-- ── 01 · Why serverless ── -->
        <section class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr]">
                <div class="reveal">
                    <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">01 · the premise</p>
                    <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                        Remove the<br />coordinator
                    </h2>
                    <div class="mt-6 flex flex-wrap gap-2">
                        <span class="badge badge-live">no backend</span>
                        <span class="badge badge-mid">relays untrusted</span>
                    </div>
                </div>

                <div class="reveal space-y-6 text-base leading-relaxed text-slate-100 sm:text-lg">
                    <p>
                        The toolbox already ships a classic CashFusion client, but that client depends on an
                        external coordinator server. This research removes the server: peers self-elect a
                        coordinator per round, and every message is end-to-end gift-wrapped before it reaches
                        a relay.
                    </p>
                    <p>
                        The design is a <strong class="font-semibold text-white">clean-room specification</strong>
                        informed by the public 00-Protocol description. Both upstream repositories have no
                        LICENSE file (all rights reserved), so we read and cite them — we do not copy code.
                    </p>
                </div>
            </div>

            <div class="reveal mt-12 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>dimension</th>
                            <th>classic CashFusion (in app)</th>
                            <th>P2P over Nostr (this research)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="font-mono text-xs uppercase tracking-widest text-slate-300">coordinator</td>
                            <td class="text-slate-200">external server, trusted for round integrity</td>
                            <td class="text-slate-200">none — peers self-elect per round</td>
                        </tr>
                        <tr>
                            <td class="font-mono text-xs uppercase tracking-widest text-slate-300">transport</td>
                            <td class="text-slate-200">Tor covert channels to the server</td>
                            <td class="text-slate-200">Nostr relays, end-to-end gift-wrapped messages</td>
                        </tr>
                        <tr>
                            <td class="font-mono text-xs uppercase tracking-widest text-slate-300">output blinding</td>
                            <td class="text-slate-200">server-side blindness</td>
                            <td class="text-slate-200">onion mix-net through all peers</td>
                        </tr>
                        <tr>
                            <td class="font-mono text-xs uppercase tracking-widest text-slate-300">backend</td>
                            <td class="text-slate-200">none</td>
                            <td class="text-slate-200">none — matches the app's no-backend identity</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p class="reveal mt-3 font-mono text-xs text-slate-300">
                [measured · P2P-FUSION-DESIGN.md §1, file inspected 2026-11-20]
            </p>
        </section>

        <!-- ── 02 · Architecture ── -->
        <section class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">02 · the shape</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    Everything is peer-side
                </h2>
                <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                    The browser runs the round. Relays carry ciphertext and timing metadata; chain access
                    reuses the existing Electrum proxy. No new server code.
                </p>
            </div>

            <pre class="reveal mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-[#0a1018]/80 p-6 font-mono text-xs leading-relaxed text-slate-200 sm:text-sm"><code>┌─────────────────────────── browser (toolbox) ───────────────────────────┐
│                                                                         │
│  /toolbox/fusion (UI, G4)                                               │
│        │                                                                │
│        ▼                                                                │
│  stores/p2pfusion/round.ts ── six-phase state machine                   │
│        │            │                 │                                 │
│        ▼            ▼                 ▼                                 │
│  relay.ts      txbuild.ts        giftwrap.ts                            │
│  Nostr WS      BCH tx +          NIP-59 seal/rumor                      │
│  pool          BCH Schnorr       + NIP-44 layer crypto                  │
│        │                              │                                 │
│        ▼                              ▼                                 │
│  Nostr relays (untrusted)        web/server/api/electrum.post.ts        │
│  ciphertext + timing             (existing JSON-RPC proxy)              │
└────────┼──────────────────────────────────┼─────────────────────────────┘
         ▼                                  ▼
   public relays                     Electrum / Fulcrum
                                     (chain data + broadcast)</code></pre>

            <div class="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <div class="doc-card reveal">
                    <h3 class="font-mono text-sm text-lime-300">round.ts</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">Six-phase state machine, election, blame/timeout, onion collection and signature assembly. 522 lines.</p>
                </div>
                <div class="doc-card reveal" style="transition-delay: 0.08s">
                    <h3 class="font-mono text-sm text-cyan-300">relay.ts</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">Nostr WebSocket pool: connect, rotate, dedupe, resubscribe, per-connection outbox, 80 ms publish pacing. 200 lines.</p>
                </div>
                <div class="doc-card reveal" style="transition-delay: 0.16s">
                    <h3 class="font-mono text-sm text-violet-300">giftwrap.ts + nip44.ts</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">NIP-59 seal (kind 13) inside a kind-1059 gift wrap, with NIP-44 v2 layer encryption and ephemeral identities. 119 + 136 lines.</p>
                </div>
                <div class="doc-card reveal" style="transition-delay: 0.24s">
                    <h3 class="font-mono text-sm text-lime-300">txbuild.ts</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">Transaction serialization, BIP143 sighash, P2PKH signing and BCH Schnorr sign/verify. 246 lines.</p>
                </div>
                <div class="doc-card reveal" style="transition-delay: 0.32s">
                    <h3 class="font-mono text-sm text-cyan-300">onion.ts</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">Layered output wrapping and peeling for the mix-net, with order rejection at the receiver. 72 lines.</p>
                </div>
                <div class="doc-card reveal" style="transition-delay: 0.4s">
                    <h3 class="font-mono text-sm text-violet-300">cashaddr.ts + identity.ts</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">Token-aware CashAddr decoding and per-round ephemeral secp256k1 identities. 102 + 86 lines.</p>
                </div>
            </div>
            <p class="reveal mt-3 font-mono text-xs text-slate-300">
                [measured · wc -l web/stores/p2pfusion/*.ts, 2026-11-20]
            </p>
        </section>

        <!-- ── 03 · Six phases ── -->
        <section class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-violet-200">03 · the protocol</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    Six phases, one round
                </h2>
                <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                    The design follows the upstream six-phase structure. The harness maps it to the wire as
                    inputs → onion → outputs → tx → sign → broadcast.
                </p>
            </div>

            <div class="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <div v-for="(p, i) in PHASES" :key="p.n" class="step-card reveal" :style="{ transitionDelay: (i * 0.06) + 's' }">
                    <div class="flex items-center justify-between gap-3">
                        <span class="step-num text-lime-300">{{ p.n }}</span>
                        <span class="badge" :class="p.tag === 'design' ? 'badge-wait' : 'badge-done'">{{ p.tag }}</span>
                    </div>
                    <h3 class="mt-4 font-display text-lg font-bold text-white">{{ p.title }}</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">{{ p.body }}</p>
                </div>
            </div>
            <p class="reveal mt-3 font-mono text-xs text-slate-300">
                [measured · P2P-FUSION-DESIGN.md §4 + web/stores/p2pfusion/round.ts]
            </p>
        </section>

        <!-- ── 04 · Gate evidence ── -->
        <section class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">04 · the evidence</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    Measured gate by gate
                </h2>
                <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                    Every number below comes from a reproducible harness in <span class="font-mono text-slate-100">web/tests/</span>.
                    Only G2b touched the chain; the other gate transactions are dry-runs and are labelled as such.
                </p>
            </div>

            <div class="mt-12 grid gap-5 md:grid-cols-2">
                <div v-for="(g, i) in GATES" :key="g.id" class="gate-card reveal" :style="{ transitionDelay: (i * 0.05) + 's' }">
                    <div class="flex items-center justify-between gap-3">
                        <span class="gate-chip" :class="g.cls">{{ g.id }}</span>
                        <span class="font-mono text-xs uppercase tracking-[0.25em]" :class="g.cls === 'gate-wait' ? 'text-slate-300' : 'text-lime-300'">{{ g.status }}</span>
                    </div>
                    <h3 class="mt-4 font-display text-lg font-bold text-white">{{ g.title }}</h3>
                    <ul class="life-points">
                        <li v-for="(pt, j) in g.points" :key="j">{{ pt }}</li>
                    </ul>
                    <div v-if="g.txs.length" class="mt-4 flex flex-wrap gap-2">
                        <a v-for="tx in g.txs" :key="tx.txid" :href="'https://explorer.selene.cash/tx/' + tx.txid + '?network=chipnet'" target="_blank" rel="noopener" class="tx-btn">
                            <span class="tx-chip">{{ tx.label }}</span>
                            <span class="tx-id">{{ tx.txid.slice(0, 10) }}…{{ tx.txid.slice(-6) }}</span>
                            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <path d="M7 17 17 7M8 7h9v9" />
                            </svg>
                        </a>
                    </div>
                    <div v-if="g.harnessTxs.length" class="mt-4 space-y-1">
                        <p class="font-mono text-xs uppercase tracking-[0.2em] text-slate-300">harness txid · dry-run (not broadcast)</p>
                        <p v-for="(tx, j) in g.harnessTxs" :key="j" class="break-all font-mono text-xs text-slate-200">{{ tx }}</p>
                    </div>
                </div>
            </div>
            <p class="reveal mt-3 font-mono text-xs text-slate-300">
                [measured · P2P-FUSION-DESIGN.md §5, runs 2026-11-20; chain links → Selene, network=chipnet]
            </p>
        </section>

        <!-- ── 05 · What we learned ── -->
        <section class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">05 · the lessons</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    What the gates taught us
                </h2>
                <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                    The expensive findings are the point of publishing the research. These are the defects
                    the harness found — and the fixes that made the round pass.
                </p>
            </div>

            <div class="reveal mt-10 rounded-2xl border border-lime-300/20 bg-lime-300/[0.04] p-6 sm:p-8">
                <div class="flex flex-wrap items-center gap-3">
                    <span class="badge badge-done">the expensive one</span>
                    <h3 class="font-display text-xl font-bold text-white">BCH Schnorr is not final BIP-340</h3>
                </div>
                <p class="mt-4 text-sm leading-relaxed text-slate-100 sm:text-base">
                    The first real broadcast was rejected with <span class="font-mono text-rose-200">NULLFAIL</span>.
                    The sighash and serializer matched libauth byte-for-byte; the signature was the problem.
                    BCH's 2019 Schnorr is the BIP-340 draft, not the final BIP-340:
                </p>
                <pre class="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-[#0a1018]/80 p-4 font-mono text-xs text-cyan-100 sm:text-sm"><code>e = SHA256(r ‖ compressed_pubkey33 ‖ m)     // no BIP-0340 tag prefixes
R must be normalized to the QR Y root        // Jacobi symbol 1, not even-Y</code></pre>
                <p class="mt-4 text-sm leading-relaxed text-slate-100 sm:text-base">
                    Noble's <span class="font-mono text-slate-100">schnorr</span> produces final BIP-340 signatures,
                    which the BCH VM rejects. <span class="font-mono text-slate-100">txbuild.ts</span> now implements
                    <span class="font-mono text-slate-100">bchSchnorrSign</span> /
                    <span class="font-mono text-slate-100">bchSchnorrVerify</span> per the 2019 spec; the signed tx
                    passes libauth's BCH VM (<span class="font-mono text-slate-100">error: none, stack: ['01']</span>)
                    and the network accepts it.
                </p>
                <p class="mt-3 font-mono text-xs text-slate-300">
                    [measured · P2P-FUSION-DESIGN.md §5c; spec: bitcoincashorg/bitcoincash.org/2019-05-15-schnorr.md]
                </p>
            </div>

            <div class="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <div v-for="(f, i) in FINDINGS" :key="f.title" class="doc-card reveal" :style="{ transitionDelay: (i * 0.06) + 's' }">
                    <span class="badge badge-mid">{{ f.tag }}</span>
                    <h3 class="mt-3 font-display text-base font-bold text-white">{{ f.title }}</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">{{ f.body }}</p>
                </div>
            </div>
            <p class="reveal mt-3 font-mono text-xs text-slate-300">
                [measured · P2P-FUSION-DESIGN.md §5b–§5e, defect logs from the 2026-11-20 runs]
            </p>
        </section>

        <!-- ── 06 · Security and limits ── -->
        <section class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-violet-200">06 · the boundary</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    What holds, what does not
                </h2>
            </div>

            <div class="mt-10 grid gap-5 md:grid-cols-2">
                <div class="fact-card reveal">
                    <h3 class="font-display text-lg font-bold text-lime-300">What holds</h3>
                    <ul class="life-points">
                        <li>A malicious coordinator cannot steal: it never holds signatures for inputs it does not own, and every peer verifies its outputs and the fee before signing.</li>
                        <li>A malicious last peeler learns the plaintext output set — which is public in the transaction anyway; it cannot map outputs to owners.</li>
                        <li>The round is peer-side: no new server code, and relays see NIP-59 gift wraps rather than plaintext round messages.</li>
                        <li>Chain access reuses the existing Electrum proxy cluster; the wallet keeps its own keys.</li>
                    </ul>
                </div>
                <div class="fact-card reveal" style="transition-delay: 0.08s">
                    <h3 class="font-display text-lg font-bold text-rose-300">What does not (yet)</h3>
                    <ul class="life-points">
                        <li>The 5-participant floor is a design constant, not enforced in <span class="font-mono text-slate-100">round.ts</span>; the harness tested 5 and 7.</li>
                        <li>Token UTXOs are excluded in v1 — plain P2PKH only.</li>
                        <li>Amounts remain public on chain. Amount privacy is the shielded pool's job, not this layer's.</li>
                        <li>Stealth outputs are disabled upstream (<span class="font-mono text-slate-100">if (false &amp;&amp; keys.stealthSpendPub)</span>) — not part of this round.</li>
                        <li>NIP-42 AUTH is not implemented; damus advertises it. Live pool discovery (kind 22230) is design-only.</li>
                    </ul>
                </div>
            </div>
            <p class="reveal mt-3 font-mono text-xs text-slate-300">
                [measured · P2P-FUSION-DESIGN.md §1, §4 security analysis, §6; round.ts inspected 2026-11-20]
            </p>
        </section>

        <!-- ── 07 · Open questions ── -->
        <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">07 · what is next</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    Open questions
                </h2>
            </div>

            <div class="reveal mt-10 divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
                <div v-for="q in OPEN" :key="q.text" class="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:gap-5">
                    <span class="w-28 shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-cyan-200">{{ q.tag }}</span>
                    <span class="text-sm leading-relaxed text-slate-200">{{ q.text }}</span>
                </div>
            </div>
            <p class="reveal mt-3 font-mono text-xs text-slate-300">
                [open · P2P-FUSION-DESIGN.md §6 + the G4 gap recorded in §5]
            </p>
        </section>

        <!-- ── Sources ── -->
        <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">sources</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">Read the record</h2>
            </div>

            <div class="mt-10 grid gap-5 md:grid-cols-2">
                <a href="https://github.com/APECSdev/hushyourmoney/blob/master/P2P-FUSION-DESIGN.md" target="_blank" rel="noopener" class="doc-card reveal">
                    <h3 class="font-mono text-sm text-lime-300">P2P-FUSION-DESIGN.md</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">The architecture draft, protocol, constants, gate record and defect logs — the canonical source for every number on this page.</p>
                </a>
                <a href="https://github.com/APECSdev/hushyourmoney/tree/master/web/tests" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.06s">
                    <h3 class="font-mono text-sm text-cyan-300">web/tests/</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">The G1, G2a, G2b and G3 harnesses, plus the NIP-01 relay fixture and the chipnet Electrum client.</p>
                </a>
                <a href="https://github.com/bitcoincashorg/bitcoincash.org/blob/master/spec/2019-05-15-schnorr.md" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.12s">
                    <h3 class="font-mono text-sm text-violet-300">BCH Schnorr spec (2019)</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">The draft-BIP-340 variant BCH actually enforces: compressed-pubkey challenge, QR-normalized R, no tag prefixes.</p>
                </a>
                <a href="https://github.com/nostr-protocol/nips/blob/master/59.md" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.18s">
                    <h3 class="font-mono text-sm text-lime-300">NIP-59 + NIP-44</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">Gift wrap (kind 1059) and versioned encrypted payloads — the transport this round is built on.</p>
                </a>
                <a href="https://github.com/00-Protocol/00-Wallet" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.24s">
                    <h3 class="font-mono text-sm text-cyan-300">00-Protocol/00-Wallet</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">Upstream studied read-only for protocol parity. No LICENSE file — all rights reserved; cited, not copied.</p>
                </a>
                <a href="https://bitcoincashresearch.org/t/1773" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.3s">
                    <h3 class="font-mono text-sm text-violet-300">research forum · topic 1773</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">The announcement and review thread where the 00-Protocol work was presented — the third-party context for this research.</p>
                </a>
            </div>
        </section>

        <!-- ── Pager ── -->
        <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24">
            <div class="pager reveal">
                <NuxtLink to="/research/cashfusion" class="pager-link">
                    <span class="pager-dir">← previous</span>
                    <span class="pager-title">CashFusion</span>
                </NuxtLink>
                <NuxtLink to="/research/shielded-addresses" class="pager-link right">
                    <span class="pager-dir">next topic →</span>
                    <span class="pager-title">Shielded Addresses</span>
                </NuxtLink>
            </div>
        </section>

</template>
