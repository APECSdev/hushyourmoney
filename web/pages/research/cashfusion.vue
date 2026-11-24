<!-- web/pages/research/cashfusion.vue — topic 02 (CashFusion survey + our P2P-over-Nostr research) -->

<script setup lang="ts">
/* Shared shell + styles come from layouts/research.vue (user refactor 2026-11-13). */
definePageMeta({
    layout: 'research',
})

/* OpenGraph + Twitter + canonical (shared composable; per-page poster). */
useOg({
    title: `CashFusion — Hush Your Money`,
    description: `CashFusion: Bitcoin Cash's CoinJoin-style mixing tool, with a measured adoption history and our coordinator-free P2P fusion research over Nostr — six phases, gate evidence G1–G3L, and the BCH Schnorr findings.`,
    path: '/research/cashfusion',
    image: '/posters/research-cashfusion.jpg',
    type: 'article',
    imageAlt: `CashFusion — Bitcoin Cash's CoinJoin implementation, plus our P2P fusion over Nostr research`,
})

/* Scroll-reveal (shared composable). */
useReveal()

/* ── On-page index (SEO + wayfinding) ── */
const TOC = [
    { n: '01', title: 'What CashFusion is', href: '#what-is-cashfusion' },
    { n: '02', title: 'The adoption record', href: '#adoption-record' },
    { n: '03', title: 'The coordinator limit', href: '#coordinator-limit' },
    { n: '04', title: 'The architecture', href: '#architecture' },
    { n: '05', title: 'The six phases', href: '#six-phases' },
    { n: '06', title: 'Gate evidence', href: '#gate-evidence' },
    { n: '07', title: 'What the gates taught us', href: '#lessons' },
    { n: '08', title: 'What holds, what does not', href: '#boundary' },
    { n: '09', title: 'Open questions', href: '#open-questions' },
    { n: '10', title: 'Research FAQ', href: '#research-faq' },
    { n: '11', title: 'Sources', href: '#sources' },
]

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
            'Not built: no production fusion UI exists. The protocol modules and gate harnesses are in-repo; the production UI is the remaining step.',
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

/* ── Open questions (source: P2P-FUSION-DESIGN.md §6 + the G4 gap) ── */
const OPEN = [
    { tag: 'policy', text: 'Relay set: default public relays vs a user-configured set (privacy-sensitive default = the user\'s own relay first).' },
    { tag: 'design', text: 'Fixed denomination ladder (better set heuristics) vs pure random split — CashFusion uses random split.' },
    { tag: 'crypto', text: 'NIP-44 vs AES-GCM for onion layers: NIP-44 gives standardization; AES-GCM gives parity with the upstream onionWrap.' },
    { tag: 'integration', text: 'Post-fusion “shield into pool” button — the composition story already published on the CoinJoin page.' },
    { tag: 'discovery', text: 'Live pool discovery (kind 22230) is design-only; the harness supplies the peer set explicitly.' },
    { tag: 'gate', text: 'G4 mainnet opt-in beta behind a settings flag — not built.' },
]

/* ── Research FAQ (SEO long-tail; every answer is grounded in the sections above) ── */
const FAQ = [
    {
        q: 'Is CashFusion the same as CoinJoin?',
        a: 'CashFusion is a CoinJoin-style protocol built for Bitcoin Cash. Participants contribute inputs and receive outputs, which breaks the direct input→output link. The classic implementation uses an external coordinator server and Tor covert channels; it is not a shielded pool.',
    },
    {
        q: 'Does the P2P round over Nostr hide amounts?',
        a: 'No. Amounts and the transaction graph remain public on chain. The round hides the mapping between inputs and outputs; amount privacy is the shielded pool\'s job, not this layer\'s.',
    },
    {
        q: 'Is the Nostr round live on mainnet?',
        a: 'No. G2b is a real round on chipnet (funding tx and round tx are linked above). G3 and G3L are dry-runs with fixture UTXOs. G4 — a mainnet opt-in beta behind a settings flag — is pending, and no production fusion UI exists yet.',
    },
    {
        q: 'What is the difference between classic CashFusion and P2P over Nostr?',
        a: 'Classic CashFusion trusts an external coordinator for round integrity and uses Tor covert channels. The P2P design removes the server: peers self-elect a coordinator per round, messages are NIP-59 gift-wrapped over Nostr relays, and outputs travel through an onion mix-net. Both have no backend in the app.',
    },
    {
        q: 'Why five participants?',
        a: 'Five is our design floor. A two-party round has near-zero mapping entropy; five gives a larger per-round anonymity set. The constant is proposed in P2P-FUSION-DESIGN.md §4 and is not enforced in round.ts — the harness tested 5 and 7.',
    },
    {
        q: 'Why did the first real broadcast fail?',
        a: 'BCH\'s 2019 Schnorr is the BIP-340 draft, not final BIP-340. The challenge uses a compressed 33-byte pubkey and no BIP-0340 tag prefixes, and R must be normalized to the quadratic-residue Y root. Noble\'s schnorr produces final BIP-340 signatures, which the BCH VM rejected with NULLFAIL. txbuild.ts now implements the 2019 variant.',
    },
    {
        q: 'Is the code open source?',
        a: 'The Hush Your Money repository is public. The 00-Protocol upstream repositories we studied have no LICENSE file — legally all rights reserved — so this design is a clean-room specification: we read and cite them, we do not copy code.',
    },
]

/* ── Sources (primary record) ── */
const SOURCES = [
    {
        title: 'P2P-FUSION-DESIGN.md',
        href: 'https://github.com/APECSdev/hushyourmoney/blob/master/P2P-FUSION-DESIGN.md',
        body: 'The architecture draft, protocol, constants, gate record and defect logs — the canonical source for every number on this page.',
        cls: 'text-lime-300',
    },
    {
        title: 'web/tests/',
        href: 'https://github.com/APECSdev/hushyourmoney/tree/master/web/tests',
        body: 'The G1, G2a, G2b and G3 harnesses, plus the NIP-01 relay fixture and the chipnet Electrum client.',
        cls: 'text-cyan-300',
    },
    {
        title: 'BCH Schnorr spec (2019)',
        href: 'https://github.com/bitcoincashorg/bitcoincash.org/blob/master/spec/2019-05-15-schnorr.md',
        body: 'The draft-BIP-340 variant BCH actually enforces: compressed-pubkey challenge, QR-normalized R, no tag prefixes.',
        cls: 'text-violet-300',
    },
    {
        title: 'NIP-59 + NIP-44',
        href: 'https://github.com/nostr-protocol/nips/blob/master/59.md',
        body: 'Gift wrap (kind 1059) and versioned encrypted payloads — the transport this round is built on.',
        cls: 'text-lime-300',
    },
    {
        title: '00-Protocol/00-Wallet',
        href: 'https://github.com/00-Protocol/00-Wallet',
        body: 'Upstream studied read-only for protocol parity. No LICENSE file — all rights reserved; cited, not copied.',
        cls: 'text-cyan-300',
    },
    {
        title: 'research forum · topic 1773',
        href: 'https://bitcoincashresearch.org/t/1773',
        body: 'The announcement and review thread where the 00-Protocol work was presented — the third-party context for this research.',
        cls: 'text-violet-300',
    },
]
</script>

<template>

    <!-- ── Topic hero ── -->
        <section class="relative z-10 mx-auto flex min-h-[72vh] w-full max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-14 text-center">

            <NuxtLink to="/research" class="crumb animate-rise" style="animation-delay: 0.04s">
                research <span class="sep">/</span> cashfusion
            </NuxtLink>

            <p class="animate-rise mt-6 font-mono text-[0.8rem] uppercase tracking-[0.5em] text-violet-200 sm:text-xs" style="animation-delay: 0.1s">
                topic 02 · the BCH implementation · survey + our research
            </p>

            <h1 class="animate-rise mt-6 font-display text-[clamp(2.4rem,8vw,6rem)] font-extrabold leading-[1.04] tracking-tight text-white" style="animation-delay: 0.2s">
                <span class="text-gradient">CashFusion</span>
            </h1>

            <p class="animate-rise mt-6 font-mono text-[clamp(1rem,2.8vw,1.5rem)] italic text-cyan-100" style="animation-delay: 0.32s">
                CoinJoin on Bitcoin Cash — a measured adoption history, and our coordinator-free variant.
            </p>

            <p class="animate-rise mt-8 max-w-2xl text-base leading-relaxed text-slate-100 sm:text-lg" style="animation-delay: 0.42s">
                CashFusion is Bitcoin Cash's CoinJoin-style mixing tool. Its distinguishing fact is
                <strong class="font-semibold text-white">measured adoption</strong>: a widely-cited 2022 forum
                analysis reports that <strong class="font-semibold text-white">94% of all BCH transacted since
                July 2020 descends from a CashFusion transaction</strong>. This page covers the classic protocol
                and the coordinator-free variant we built and measured over Nostr.
            </p>

            <div class="animate-rise mt-8 flex flex-wrap items-center justify-center gap-3" style="animation-delay: 0.5s">
                <span class="status-chip status-lime">live on BCH</span>
                <span class="status-chip status-violet">survey — third-party work</span>
                <span class="status-chip status-cyan">our research · G1–G3L</span>
            </div>
        </section>

        <!-- ── On this page ── -->
        <section class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">on this page</p>
                <h2 class="mt-5 font-display text-[clamp(1.7rem,4vw,2.6rem)] font-bold leading-[1.08] text-white">
                    Eleven sections, one record.
                </h2>
            </div>
            <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <a v-for="t in TOC" :key="t.href" :href="t.href" class="doc-card reveal">
                    <span class="font-mono text-xs text-cyan-300">{{ t.n }}</span>
                    <span class="ml-3 font-display text-sm font-bold text-white">{{ t.title }}</span>
                </a>
            </div>
        </section>

        <!-- ── 01 · What CashFusion is ── -->
        <section id="what-is-cashfusion" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
            <div class="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr]">
                <div class="reveal">
                    <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">01 · the protocol</p>
                    <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                        What CashFusion is
                    </h2>
                    <div class="mt-6 flex flex-wrap gap-2">
                        <span class="badge badge-live">live on BCH</span>
                        <span class="badge badge-mid">CoinJoin-style</span>
                    </div>
                </div>

                <div class="reveal space-y-6 text-base leading-relaxed text-slate-100 sm:text-lg">
                    <p>
                        CashFusion is Bitcoin Cash's CoinJoin-style mixing tool. A round takes inputs from
                        multiple participants and returns outputs to the same participants, breaking the
                        direct input→output link that chain analysis relies on. The classic implementation
                        uses an external coordinator server and Tor covert channels; the coordinator is
                        blinded to the input→output mapping but sees the round
                        <span class="font-mono text-xs text-slate-300">[cited · P2P-FUSION-DESIGN.md §1]</span>.
                    </p>
                    <p>
                        It is <strong class="font-semibold text-white">not a shielded pool</strong>. Amounts
                        and the transaction graph remain public; what changes is the link between your inputs
                        and your outputs. Amount privacy is the shielded pool's job — see
                        <NuxtLink to="/research/shielded-pool" class="text-cyan-200 underline decoration-cyan-300/40 underline-offset-4">/research/shielded-pool</NuxtLink>
                        <span class="font-mono text-xs text-slate-300">[cited · P2P-FUSION-DESIGN.md §1 non-goals]</span>.
                    </p>
                    <p>
                        The implementation is live on BCH, with a measured adoption history and an active
                        red-team discussion. The next section covers that record.
                    </p>
                </div>
            </div>
        </section>

        <!-- ── 02 · The adoption record ── -->
        <section id="adoption-record" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-violet-200">02 · the record</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    The adoption record
                </h2>
                <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                    The 94% figure is the reason this protocol matters: a larger set is what makes a mix
                    meaningful. We cite the analysis; we do not own it.
                </p>
            </div>

            <div class="reveal mx-auto mt-10 max-w-3xl space-y-6 text-base leading-relaxed text-slate-100 sm:text-lg">
                <p>
                    <span class="font-mono text-xs text-slate-300">[cited · third-party analysis]</span> —
                    the 94% adoption figure comes from a 2022 Bitcoin Cash Research analysis, linked
                    below. The work is also <strong class="font-semibold text-white">under active scrutiny</strong>:
                    a standing red-team discussion on the research forum, ongoing UX/tech improvement
                    threads, and a public fusion-statistics dashboard.
                </p>
                <p>
                    We survey and link this work — it belongs to its authors. Our contribution is the
                    coordinator-free fusion research on this page, and the shielded-pool layer above it.
                </p>
            </div>

            <div class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <a href="https://bitcoincashresearch.org/t/94-percent-of-all-bch-transacted-since-july-2020-is-now-a-descendant-of-a-cashfusion-transaction/752" target="_blank" rel="noopener" class="doc-card reveal">
                    <h3 class="font-mono text-sm text-lime-300">the 94% analysis</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">"94 percent of all BCH transacted since July 2020 is now a descendant of a CashFusion transaction" — the adoption record, third-party.</p>
                </a>
                <a href="https://bitcoincashresearch.org/t/is-there-interest-in-a-red-team-analysis-of-cashfusion/525" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.08s">
                    <h3 class="font-mono text-sm text-cyan-300">red-team discussion</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">"Is there interest in a Red Team analysis of CashFusion?" — the thread where the scheme gets attacked instead of praised.</p>
                </a>
                <a href="https://fusionstats.redteam.cash/" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.16s">
                    <h3 class="font-mono text-sm text-violet-300">fusion statistics</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">Live fusion-statistics dashboard (fusionstats.redteam.cash) and its open-source app (Rucknium/CashFusionStats on GitHub).</p>
                </a>
                <a href="https://bitcoincashresearch.org/t/ways-to-improve-ux-tech-of-cashfusion/1854" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.24s">
                    <h3 class="font-mono text-sm text-lime-300">UX / tech improvement thread</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">"Ways to improve UX / tech of CashFusion" — the standing community thread on where the implementation should go next.</p>
                </a>
                <a href="https://github.com/00-Protocol/BCH-Stealth-Protocol" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.32s">
                    <h3 class="font-mono text-sm text-cyan-300">P2P fusion over Nostr</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">Serverless CoinJoin coordinated over Nostr with onion-wrapped outputs (the 00-Protocol experiment, announced in topic 1773) — a different coordination model, cited for completeness. <span class="font-mono text-[0.78rem] text-slate-300">[third-party · pre-mainnet · no LICENSE file]</span></p>
                </a>
                <a href="#gate-evidence" class="doc-card reveal" style="transition-delay: 0.4s">
                    <h3 class="font-mono text-sm text-lime-300">the gate evidence</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">G1 through G4, with chain links and dry-run labels — jump straight to the measured record on this page.</p>
                    <span class="mt-3 inline-block font-mono text-xs uppercase tracking-[0.22em] text-lime-300">jump to the gates →</span>
                </a>
            </div>
        </section>

        <!-- ── 03 · The coordinator limit ── -->
        <section id="coordinator-limit" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">03 · the premise</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    Remove the coordinator
                </h2>
                <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                    A classic CashFusion client already ships with the project, but it depends on an
                    external coordinator server. This research removes the server: peers self-elect a
                    coordinator per round, and every message is end-to-end gift-wrapped before it reaches
                    a relay.
                </p>
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

            <div class="reveal mx-auto mt-10 max-w-3xl space-y-6 text-base leading-relaxed text-slate-100 sm:text-lg">
                <p>
                    The design is a <strong class="font-semibold text-white">clean-room specification</strong>
                    informed by the public 00-Protocol description. Both upstream repositories have no
                    LICENSE file (all rights reserved), so we read and cite them — we do not copy code.
                </p>
                <p>
                    <strong class="font-semibold text-white">Non-goals v1:</strong> replacing the existing
                    CashFusion client; hiding amounts (that is the shielded pool's job); stealth outputs
                    (upstream disabled theirs — <span class="font-mono text-slate-100">if (false &amp;&amp; keys.stealthSpendPub)</span>
                    <span class="font-mono text-xs text-slate-300">[cited · P2P-FUSION-DESIGN.md §1]</span>).
                </p>
            </div>
        </section>

        <!-- ── 04 · The architecture ── -->
        <section id="architecture" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">04 · the shape</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    Everything is peer-side
                </h2>
                <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                    The browser runs the round. Relays carry ciphertext and timing metadata; chain access
                    reuses the existing Electrum proxy. No new server code.
                </p>
            </div>

            <pre class="reveal mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-[#0a1018]/80 p-6 font-mono text-xs leading-relaxed text-slate-200 sm:text-sm"><code>┌─────────────────────────── browser ─────────────────────────────────────┐
│                                                                         │
│  fusion UI (not built)                                                  │
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

        <!-- ── 05 · The six phases ── -->
        <section id="six-phases" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-violet-200">05 · the protocol</p>
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

            <div class="reveal mt-8 flex flex-wrap items-center justify-center gap-3">
                <NuxtLink to="/playground#fusion-lab" class="btn-primary">Run the interactive round</NuxtLink>
                <span class="font-mono text-xs uppercase tracking-[0.2em] text-slate-300">simulation · no broadcast</span>
            </div>

            <div class="reveal mt-12 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>constant</th>
                            <th>value</th>
                            <th>rationale</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="font-mono text-xs uppercase tracking-widest text-slate-300">MIN_PARTICIPANTS</td>
                            <td class="text-slate-200">5</td>
                            <td class="text-slate-200">a 2-party round has near-zero mapping entropy; 5 is our floor</td>
                        </tr>
                        <tr>
                            <td class="font-mono text-xs uppercase tracking-widest text-slate-300">inputs per peer</td>
                            <td class="text-slate-200">1–5, ≥546 sats, random</td>
                            <td class="text-slate-200">parity with upstream</td>
                        </tr>
                        <tr>
                            <td class="font-mono text-xs uppercase tracking-widest text-slate-300">outputs per peer</td>
                            <td class="text-slate-200">2–4, random split, no change output</td>
                            <td class="text-slate-200">no-change kills the biggest re-link</td>
                        </tr>
                        <tr>
                            <td class="font-mono text-xs uppercase tracking-widest text-slate-300">fee model</td>
                            <td class="text-slate-200">per-peer nIn·148 + nOut·34 + ceil(10/peers)</td>
                            <td class="text-slate-200">parity with upstream</td>
                        </tr>
                        <tr>
                            <td class="font-mono text-xs uppercase tracking-widest text-slate-300">phase timeout</td>
                            <td class="text-slate-200">60 s + blame</td>
                            <td class="text-slate-200">parity with upstream</td>
                        </tr>
                        <tr>
                            <td class="font-mono text-xs uppercase tracking-widest text-slate-300">token UTXOs</td>
                            <td class="text-slate-200">excluded from inputs v1</td>
                            <td class="text-slate-200">plain P2PKH only in v1</td>
                        </tr>
                        <tr>
                            <td class="font-mono text-xs uppercase tracking-widest text-slate-300">broadcast path</td>
                            <td class="text-slate-200">/api/electrum proxy + psf broadcast fallback</td>
                            <td class="text-slate-200">both paths already exist and are verified</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p class="reveal mt-3 font-mono text-xs text-slate-300">
                [proposed · P2P-FUSION-DESIGN.md §4 constants; upstream parity marked in the design doc]
            </p>

            <div class="reveal mt-12 overflow-x-auto rounded-2xl border border-white/10 bg-[#0a1018]/80 p-6">
                <pre class="font-mono text-xs leading-relaxed text-slate-200 sm:text-sm"><code>P1        P2        P3(coordinator)   relays/chain
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
│         broadcast assembled tx ─────────►│ chain</code></pre>
            </div>
            <p class="reveal mt-3 font-mono text-xs text-slate-300">
                [design · P2P-FUSION-DESIGN.md §4 sequence diagram]
            </p>
        </section>

        <!-- ── 06 · Gate evidence ── -->
        <section id="gate-evidence" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">06 · the evidence</p>
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

        <!-- ── 07 · What the gates taught us ── -->
        <section id="lessons" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">07 · the lessons</p>
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

            <div class="reveal mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
                <p class="font-mono text-xs uppercase tracking-[0.25em] text-cyan-200">defect log · what broke before it passed</p>
                <div class="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                        <h3 class="font-display text-lg font-bold text-lime-300">G2a — the dry-run</h3>
                        <ul class="life-points mt-3">
                            <li>The first peeler never peeled its own onions; a unified <span class="font-mono text-slate-100">processOnionLayer()</span> fixed it.</li>
                            <li>The coordinator dropped <span class="font-mono text-slate-100">outputs</span> while still in the onion phase; it now accepts the set from the last peeler.</li>
                            <li>A participant dropped <span class="font-mono text-slate-100">tx</span> in the outputs phase; the phase gate now allows it.</li>
                            <li>Self was counted twice in <span class="font-mono text-slate-100">expectedOnions</span>; the round waited forever for onions that do not exist.</li>
                            <li><span class="font-mono text-slate-100">publish()</span> silently dropped events before the socket opened; a per-relay outbox flushes on connect.</li>
                            <li>Messages arriving before their phase were lost; a per-phase pending queue flushes on phase entry.</li>
                            <li>The relay fixture overwrote subscriptions per connection; NIP-01 semantics now allow many subs keyed by subId.</li>
                            <li>Schnorr self-verify passed a 33-byte key; BIP-340 wants x-only (32).</li>
                            <li>NIP-44 padding must allocate <span class="font-mono text-slate-100">prefix + calc_padded_len(L)</span> bytes; powers-of-two plaintexts overflowed by the 2-byte prefix.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="font-display text-lg font-bold text-cyan-300">G2b / G3 / G3L — the chain and the relays</h3>
                        <ul class="life-points mt-3">
                            <li>G2b: BCH Schnorr ≠ final BIP-340 — NULLFAIL on the first broadcast.</li>
                            <li>G2b: P2PKH scriptCode must use each input's own private key — a forced <span class="font-mono text-slate-100">02</span> prefix produced OP_EQUALVERIFY.</li>
                            <li>G3: intermediate peelers never left the onion phase; the <span class="font-mono text-slate-100">outputs</span> message now advances every peer.</li>
                            <li>G3L: relays do not echo to the publishing connection; one connection per peer is the fix.</li>
                            <li>G3L: free relays rate-limit bursts; publishing is paced at one event per 80 ms per connection.</li>
                            <li>G3L: relay selection matters — primal, nostr.mom and offchain.pub delivered; nostr.band and nostr.bg did not connect.</li>
                            <li>G3L: origin-side onion retries were missing; all outbound layers are re-sent while the onion phase is active, with hash dedupe at the receiver.</li>
                        </ul>
                    </div>
                </div>
                <p class="mt-4 font-mono text-xs text-slate-300">[measured · P2P-FUSION-DESIGN.md §5b–§5e]</p>
            </div>
        </section>

        <!-- ── 08 · What holds, what does not ── -->
        <section id="boundary" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-violet-200">08 · the boundary</p>
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
                        <li>Relay rotation and multiple simultaneous rounds are the design response to relay-level DoS and eclipse attempts.</li>
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

        <!-- ── 09 · Open questions ── -->
        <section id="open-questions" class="relative z-10 mx-auto w-full max-w-5xl scroll-mt-24 px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">09 · what is next</p>
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

        <!-- ── 10 · Research FAQ ── -->
        <section id="research-faq" class="relative z-10 mx-auto w-full max-w-5xl scroll-mt-24 px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">10 · questions</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    Research FAQ
                </h2>
                <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                    Short answers to the questions this research raises most often. Every answer is grounded
                    in the sections above.
                </p>
            </div>

            <div class="mt-10 space-y-4">
                <div v-for="(f, i) in FAQ" :key="f.q" class="doc-card reveal" :style="{ transitionDelay: (i * 0.05) + 's' }">
                    <h3 class="font-display text-base font-bold text-white">{{ f.q }}</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">{{ f.a }}</p>
                </div>
            </div>
            <p class="reveal mt-3 font-mono text-xs text-slate-300">
                [answers · grounded in P2P-FUSION-DESIGN.md §1–§6 and the 2026-11-20 gate record]
            </p>
        </section>

        <!-- ── 11 · Sources ── -->
        <section id="sources" class="relative z-10 mx-auto w-full max-w-5xl scroll-mt-24 px-6 pb-24">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-violet-200">11 · sources</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">Read the record</h2>
            </div>

            <div class="mt-10 grid gap-5 md:grid-cols-2">
                <a v-for="(s, i) in SOURCES" :key="s.title" :href="s.href" target="_blank" rel="noopener" class="doc-card reveal" :style="{ transitionDelay: (i * 0.06) + 's' }">
                    <h3 class="font-mono text-sm" :class="s.cls">{{ s.title }}</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">{{ s.body }}</p>
                </a>
            </div>
        </section>

        <!-- ── Pager ── -->
        <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24">
            <div class="pager reveal">
                <NuxtLink to="/research/shielded-pool" class="pager-link">
                    <span class="pager-dir">← previous</span>
                    <span class="pager-title">The Shielded Pool</span>
                </NuxtLink>
                <NuxtLink to="/research/shielded-addresses" class="pager-link right">
                    <span class="pager-dir">next topic →</span>
                    <span class="pager-title">Shielded Addresses</span>
                </NuxtLink>
            </div>
        </section>

</template>
