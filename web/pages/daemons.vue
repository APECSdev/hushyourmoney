<!-- web/pages/daemons.vue — the two permanent daemons (orchestration record) -->

<script setup lang="ts">
/* Shared shell + styles come from layouts/research.vue. This page is not a
   research topic; it reuses the shell for SiteNav, the aurora backdrop, the
   GitHub banner, the footer and the namespaced .research-page CSS. */
definePageMeta({
    layout: 'research',
})

/* OpenGraph + Twitter + canonical. The CashFusion poster is the closest
   existing 2400x1260 asset; a dedicated daemons poster is a follow-up. */
useOg({
    title: 'Daemons — Hush Your Money',
    description: 'The always-on CashShuffle and CashFusion daemons: architecture, capabilities, acceptance gates, and the orchestration status.',
    path: '/daemons',
    image: '/posters/research-cashfusion.jpg',
    type: 'website',
    imageAlt: 'Daemons — permanent CashShuffle and CashFusion liquidity',
})

useReveal()

/* ── On this page ─────────────────────────────────────────────────── */
const TOC = [
    { n: '01', title: 'Why daemons', href: '#why' },
    { n: '02', title: 'The two daemons', href: '#two' },
    { n: '03', title: 'Capability matrix', href: '#matrix' },
    { n: '04', title: 'Architecture', href: '#architecture' },
    { n: '05', title: 'Real vs planned', href: '#boundary' },
    { n: '06', title: 'Security invariants', href: '#security' },
    { n: '07', title: 'Pool composition', href: '#pool' },
    { n: '08', title: 'Roadmap', href: '#roadmap' },
    { n: '09', title: 'Acceptance gates', href: '#gates' },
    { n: '10', title: 'The first Nito round', href: '#nito' },
    { n: '11', title: 'Questions', href: '#faq' },
    { n: '12', title: 'Sources', href: '#sources' },
]

/* ── The two daemons ──────────────────────────────────────────────── */
const DAEMONS = [
    {
        id: '01',
        name: 'CashShuffle',
        subtitle: 'The equal-output shuffle',
        status: 'M2–M4 partial · M5 next',
        badge: 'badge-mid',
        numClass: 'topic-lime',
        body: 'A permanent peer and possible coordinator for CashShuffle-over-Nostr. Equal inputs, onion-wrapped outputs, a verify-before-sign phase, and BCH Schnorr signatures. The first daemon milestone.',
        points: [
            '5-peer equal-output round; coordinator = lowest ephemeral pubkey',
            'NIP-59 gift wrap + NIP-44 over a relay pool',
            'VERIFY before SIGNING: the peer checks its own output first',
            'BCH Schnorr with SIGHASH_ALL|FORKID (0x41)',
            'Role-2 pool-native batching: 2 tagged fuel UTXOs per action',
            'Capped chipnet float; no wallet key on the relay',
        ],
        facts: [
            { label: 'peers', value: '5' },
            { label: 'transport', value: 'NIP-59' },
            { label: 'signing', value: 'BCH Schnorr' },
            { label: 'deployment', value: 'not deployed' },
        ],
        href: '#cashshuffle',
    },
    {
        id: '02',
        name: 'CashFusion',
        subtitle: 'The six-phase mix',
        status: 'M6 · not started',
        badge: 'badge-wait',
        numClass: 'topic-violet',
        body: 'The later mode: a six-phase CashFusion round over the same relay pool and wallet. Coordinator privacy is explicit — the daemon defaults to avoiding the coordinator role, because the CashFusion coordinator sees the mapping.',
        points: [
            'Six phases: announce → election → registration → mixnet → assembly → signing',
            '5-party 10 in / 10 out; 7-party 14/14 signatures',
            '80 ms per-event pacing; the measured relay set',
            'Coordinator policy: avoid (default), rotate, or allow',
            'Same BCH wallet and shared transport as CashShuffle',
            'G4 testnet only; the mainnet opt-in beta is not built',
        ],
        facts: [
            { label: 'peers', value: '5–7' },
            { label: 'fee', value: '5,000 sats' },
            { label: 'coordinator', value: 'avoid' },
            { label: 'deployment', value: 'not deployed' },
        ],
        href: '#cashfusion',
    },
]

/* ── Capability matrix ────────────────────────────────────────────── */
const MATRIX = [
    {
        dimension: 'protocol',
        shuffle: 'equal-output shuffle',
        fusion: 'six-phase mix',
    },
    {
        dimension: 'peers',
        shuffle: '5 (the design floor)',
        fusion: '5 measured; 7-party 14/14 tested',
    },
    {
        dimension: 'anonymity model',
        shuffle: 'equal outputs; the onion hides the input→output mapping',
        fusion: 'multi-input / multi-output mix; amounts remain public',
    },
    {
        dimension: 'coordinator',
        shuffle: 'lowest ephemeral pubkey; the daemon can coordinate',
        fusion: 'elected; the daemon avoids the role by default',
    },
    {
        dimension: 'transport',
        shuffle: 'NIP-59 gift wrap + NIP-44 over relays',
        fusion: 'same shared transport',
    },
    {
        dimension: 'signing',
        shuffle: 'BCH Schnorr 0x41; never Nostr BIP-340',
        fusion: 'BCH Schnorr 0x41; verify before sign',
    },
    {
        dimension: 'pool composition',
        shuffle: 'role-2 tagged fuel pairs + 2 blanks per lock',
        fusion: 'no pool composition in the G4 testnet scope',
    },
    {
        dimension: 'status',
        shuffle: 'M1 done; M2–M4 partial; M5 not started',
        fusion: 'orchestration; M6 not started',
    },
]

/* ── Real vs planned ──────────────────────────────────────────────── */
const REAL_VS_PLANNED = [
    {
        surface: 'Orchestration tree',
        state: 'real',
        badge: 'badge-done',
        detail: 'Commits 239d66c + M1–M4: plans, transport, round, wallet signer, pool builders, tests, hardened units.',
    },
    {
        surface: 'Daemon process',
        state: 'planned',
        badge: 'badge-wait',
        detail: 'src/main.js loads the config and exits with “not implemented”; the round state machine, wallet selection, BCH P2PKH signer, pool helpers and lock/action builders exist, but signature verification/timeouts/persistence, the network loop and Electrum broadcast are pending.',
    },
    {
        surface: 'Nostr transport',
        state: 'implemented',
        badge: 'badge-done',
        detail: 'Shared transport: official NIP-44 v2 KDF/padding passes the official `nip44.vectors.json`; nito-v0 preserves the Nito wire; NIP-59 timestamps; relay pool with 80 ms pacing, dedupe, reconnect and NIP-42; CashShuffle transport wrapper. 44 shared tests.',
    },
    {
        surface: 'CashShuffle round',
        state: 'core implemented',
        badge: 'badge-mid',
        detail: 'Round state machine + VERIFY before SIGNING; 16 tests including the malicious-coordinator case. Signature verification, timeouts, persistence, the network loop, Electrum broadcast and end-to-end A1/A2 are pending.',
    },
    {
        surface: 'CashFusion round',
        state: 'planned',
        badge: 'badge-wait',
        detail: 'No implementation. G4 (mainnet opt-in beta) is not built.',
    },
    {
        surface: 'Pool-native batching',
        state: 'builders implemented',
        badge: 'badge-mid',
        detail: 'Carrier/tag/fuel-pair/cost helpers and the lock/action builders are implemented and tested (14 tests: 7 pool + 7 lock/action). Proving assets, VM-eval and note delivery are pending.',
    },
    {
        surface: 'blackhost deployment',
        state: 'not deployed',
        badge: 'badge-wait',
        detail: 'The systemd units are templates. No service is installed or running.',
    },
    {
        surface: 'Nito final approval',
        state: 'pending',
        badge: 'badge-wait',
        detail: 'The Nito Cash client remains the final approval for any deployed result.',
    },
]

/* ── Security invariants ──────────────────────────────────────────── */
const INVARIANTS = [
    {
        tag: 'theft defense',
        title: 'Verify before sign',
        body: 'The Nito protocol core has no transaction object and no output check. The daemon adds a VERIFY phase: its own output is present at the expected amount and address, the input set matches, and the fee matches the model before any signature is produced.',
    },
    {
        tag: 'signature separation',
        title: 'BCH Schnorr is not BIP-340',
        body: 'Nostr events use BIP-340. BCH inputs use BCH Schnorr with the 0x41 sighash byte. The wallet module uses the BCH path only; the Nostr signer is never reused for a transaction.',
    },
    {
        tag: 'key hygiene',
        title: 'No wallet key on the relay',
        body: 'The daemon uses per-round Nostr keys. The BCH seed lives in a mode-600 file owned by the service user, outside the repository, and never touches a relay. The daemon never holds another peer’s key.',
    },
    {
        tag: 'bounded risk',
        title: 'Caps and one in-flight round',
        body: 'The proposed CashShuffle cap is 400,000 sats: 10 actions of 30,000-sat fuel, 20,000 sats of blanks, and up to 50,000 sats of lock fees. The daemon serializes rounds and tracks the global cap.',
    },
    {
        tag: 'operations',
        title: 'Non-root systemd',
        body: 'Dedicated users, NoNewPrivileges, ProtectSystem=strict, ProtectHome, PrivateTmp, StateDirectory, MemoryMax=512M, CPUQuota=50%. The metrics endpoint binds to localhost only.',
    },
    {
        tag: 'chain safety',
        title: 'VM-eval before broadcast',
        body: 'Every role-2 action is evaluated in consensus and standard modes before broadcast. Any error rejects the action. The lock and action are broadcast atomically; the action spends the lock’s unconfirmed outputs.',
    },
]

/* ── Pool composition ─────────────────────────────────────────────── */
const POOL_FACTS = [
    { label: 'carrier', value: '169 B', detail: 'OP_RETURN payload: nf0 ‖ nf1 ‖ cm0 ‖ cm1 ‖ newRoot ‖ pv(8) ‖ sign(1)' },
    { label: 'tag', value: 'SHA256', detail: 'SHA256(carrier[0..64]) = SHA256(nf0_LE ‖ nf1_LE)' },
    { label: 'fuel', value: '2 × 15,000', detail: 'Two tagged fuel UTXOs with the same tag per action; 30,000 sats of action fee' },
    { label: 'blanks', value: '2 × 1,000', detail: 'Two blanks per lock at the vending price; the blank is the mutable NFT with an empty commitment' },
    { label: 'state float', value: '10,000', detail: 'The state NFT carries a 10,000-sat float; the action conserves it' },
    { label: 'lock fee', value: 'separate', detail: 'The lock/shuffle transaction fee is separate from the 30,000-sat action fee' },
]

/* ── Roadmap ──────────────────────────────────────────────────────── */
const ROADMAP = [
    { id: 'M0', title: 'Orchestration', status: 'done', badge: 'badge-done', body: 'Tree, plans, acceptance, open questions, config/metrics, stubs, units. This commit.' },
    { id: 'M1', title: 'Shared transport', status: 'in progress', badge: 'badge-mid', body: 'Official NIP-44 v2 KDF/padding + nito-v0; NIP-59 timestamps; relay pool with 80 ms pacing, dedupe, reconnect, NIP-42; CashShuffle transport wrapper. 44 shared tests; Nito client mode pending.' },
    { id: 'M2', title: 'CashShuffle round', status: 'in progress', badge: 'badge-mid', body: 'Round state machine + VERIFY before SIGNING; 16 tests including the malicious-coordinator case. Signature verification, timeouts, persistence, network loop, Electrum broadcast and A1/A2 end-to-end pending.' },
    { id: 'M3', title: 'Wallet and liquidity', status: 'in progress', badge: 'badge-mid', body: 'Equal-amount selection, funding selection and caps implemented (5 tests); BCH P2PKH signer implemented (4 tests); Electrum broadcast pending.' },
    { id: 'M4', title: 'Pool-native batching', status: 'in progress', badge: 'badge-mid', body: 'Carrier/tag/fuel-pair/cost helpers and lock/action builders implemented (14 tests: 7 pool + 7 lock/action); proving-asset acceptance, VM-eval and note delivery pending.' },
    { id: 'M5', title: 'Operations', status: 'not started', badge: 'badge-wait', body: 'Hardened systemd, metrics endpoint, journald caps, backup/restore, 24 h soak.' },
    { id: 'M6', title: 'CashFusion', status: 'not started', badge: 'badge-wait', body: 'Six-phase round, measured constants, coordinator avoidance, G4 testnet.' },
    { id: 'M7', title: 'Production', status: 'not started', badge: 'badge-wait', body: 'Security review, mainnet opt-in beta, Gate 7 ceremony for the pool, Nito final approval.' },
]

/* ── Acceptance gates ─────────────────────────────────────────────── */
const SHUFFLE_GATES = [
    { id: 'A1', title: '5-peer chipnet round', body: '5 equal inputs → 5 equal outputs, all BCH Schnorr signatures, one txid, no wallet key on the relay.' },
    { id: 'A2', title: 'Malicious coordinator', body: 'A coordinator presents a transaction that omits a peer’s output; the peer refuses to sign and the round aborts. Unit test passes; end-to-end pending.' },
    { id: 'A3', title: '24 h uptime', body: 'Relay drop and reconnect; 80 ms pacing; no bans; a round completes after the reconnect.' },
    { id: 'A4', title: '10 rounds within cap', body: '10 consecutive rounds within the float cap; balance and caps visible in the metrics.' },
    { id: 'A5', title: 'Tag pairs', body: 'Two tagged fuel UTXOs per action; five actions require 10 tagged outputs, not 5.' },
    { id: 'A6', title: 'Blank cost', body: 'Two blanks per lock at 1,000 sats each; the cap includes fuel, blanks and the lock fee.' },
    { id: 'A7', title: 'Signature separation', body: 'BCH Schnorr on inputs, BIP-340 on Nostr events; cross-use rejects.' },
    { id: 'A8', title: 'NIP-44 / NIP-59', body: 'Official vectors, standard-peer decrypt, two-day timestamp window, subscription since.' },
    { id: 'A9', title: 'Hardening', body: 'Non-root, NoNewPrivileges, ProtectSystem, localhost metrics, seed mode 600, journald cap.' },
    { id: 'A10', title: 'Nito approval', body: 'The Nito client runs against the daemon and records written approval.' },
]

const FUSION_GATES = [
    { id: 'CF-A1', title: '5-party round', body: '10 inputs / 10 outputs, 1,760 B, 5,000 sats, 10/10 signatures.' },
    { id: 'CF-A2', title: '7-party round', body: '14/14 signatures and one broadcast txid.' },
    { id: 'CF-A3', title: 'Relay behavior', body: 'Drop and reconnect, 80 ms pacing, no bans, round completes.' },
    { id: 'CF-A4', title: 'Coordinator privacy', body: 'avoid refuses the role; rotate and allow are explicit and logged.' },
    { id: 'CF-A5', title: 'G4 testnet', body: 'Chipnet round with Nito peers; the existing CashFusion pool is not used.' },
    { id: 'CF-A6', title: 'Nito approval', body: 'The Nito client runs against the daemon and records written approval.' },
    { id: 'CF-A7', title: 'Mainnet gate', body: 'Mainnet is rejected until G4 and the operator sign-off are recorded.' },
]

/* ── The first Nito round ─────────────────────────────────────────── */
const ROUNDS = [
    {
        n: '01',
        title: 'Wire and verification',
        body: 'The transport and round cores are implemented; settle the Nito client mode and the client-side VERIFY.',
        asks: 'NIP-44 mode (official vs nito-v0), NIP-59 timestamps, VERIFY placement, registration fields',
        href: 'https://github.com/APECSdev/hushyourmoney/blob/master/daemons/cashshuffle/OPEN-QUESTIONS.md',
    },
    {
        n: '02',
        title: 'Round shape and fees',
        body: 'Settle the pool-native composition and the cap arithmetic.',
        asks: 'Tag pairs, 2N outputs, lock fee vs action fee, blank cost, blame behavior',
        href: 'https://github.com/APECSdev/hushyourmoney/blob/master/daemons/cashshuffle/ACCEPTANCE.md',
    },
    {
        n: '03',
        title: 'Proving assets and client builder',
        body: 'Hand over the Hush keypair and swap the client to the 3-input shape.',
        asks: 'VK 05250429…, zkey 4a4e2543…, wasm 8595b434…, distribution URL, 3-input builder, off-chain notes',
        href: 'https://github.com/APECSdev/hushyourmoney/blob/master/docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md',
    },
    {
        n: '04',
        title: 'Operations and acceptance',
        body: 'Settle the deployment and run the gates.',
        asks: 'Relay set, NIP-42 policy, metrics exposure, blackhost capacity, A1/A2, Nito final approval',
        href: 'https://github.com/APECSdev/hushyourmoney/blob/master/daemons/ROADMAP.md',
    },
]

/* ── FAQ ──────────────────────────────────────────────────────────── */
const FAQ = [
    {
        q: 'Are the daemons live?',
        a: 'No. The daemon cores are implemented (M1–M4), but no daemon process is running, deployed, or funded. The page marks every surface as real, implemented, partial, or planned.',
    },
    {
        q: 'Why run a daemon at all?',
        a: 'The rounds are peer-to-peer, but they need a peer that is always online. A browser tab is not a reliable counterparty. The daemon holds a capped chipnet float, joins the relay pool, and coordinates when elected.',
    },
    {
        q: 'Does the daemon hold my keys?',
        a: 'No. Each round uses an ephemeral Nostr key. The BCH wallet seed is separate, lives in a mode-600 file owned by the service user outside the repository, and never touches a relay. The daemon never signs for another peer.',
    },
    {
        q: 'What is verify-before-sign?',
        a: 'The daemon checks the final transaction before producing a signature: its own output is present at the expected amount and address, the input set matches, and the fee matches the model. A malicious coordinator cannot make it sign a transaction that omits its output.',
    },
    {
        q: 'Why not just use the browser client?',
        a: 'The browser client is the user-facing peer. The daemon is the always-on liquidity peer. The Nito Cash client remains the final approval; the daemon does not replace it.',
    },
    {
        q: 'Is CashFusion live?',
        a: 'No. CashFusion is M6. Only the shared transport and coordinator policy are implemented; the six-phase round is planned, the measured constants are recorded, and G4 (mainnet opt-in beta) is not built.',
    },
]

/* ── Sources ──────────────────────────────────────────────────────── */
const SOURCES = [
    {
        title: 'daemons/ orchestration tree',
        href: 'https://github.com/APECSdev/hushyourmoney/tree/master/daemons',
        body: 'The README, roadmap, conventions, plans, acceptance gates, open questions, config, stubs and systemd units.',
        cls: 'text-lime-300',
    },
    {
        title: 'CashShuffle daemon handoff',
        href: 'https://github.com/APECSdev/hushyourmoney/blob/master/docs/CASHSHUFFLE-DAEMON-HANDOFF-2026-11-25.md',
        body: 'The Nito handoff: what is built, the daemon job, the blackhost facts, the pool side, CashFusion, acceptance and open questions.',
        cls: 'text-cyan-300',
    },
    {
        title: 'Nito unblock handoff',
        href: 'https://github.com/APECSdev/hushyourmoney/blob/master/docs/DAEMONS-NITO-UNBLOCK-HANDOFF-2026-11-25.md',
        body: 'The twelve decisions and handovers that unblock the daemon implementation, plus the four-round agenda.',
        cls: 'text-violet-300',
    },
    {
        title: 'P2P-FUSION-DESIGN.md',
        href: 'https://github.com/APECSdev/hushyourmoney/blob/master/docs/P2P-FUSION-DESIGN.md',
        body: 'The measured CashFusion constants, the relay findings, the 80 ms pacing and the six-phase design.',
        cls: 'text-violet-300',
    },
    {
        title: 'Role-2 pool handoff',
        href: 'https://github.com/APECSdev/hushyourmoney/blob/master/docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md',
        body: 'The 3-input action shape, the deposit tags, the minting guard, the blank vending and the six client work items.',
        cls: 'text-lime-300',
    },
    {
        title: '/research/cashfusion',
        href: '/research/cashfusion',
        body: 'The full research record: protocol, adoption, architecture, six phases, gate evidence, defect log and FAQ.',
        cls: 'text-cyan-300',
    },
    {
        title: '/research/coinjoin',
        href: '/research/coinjoin',
        body: 'The CashShuffle wire specification: registration, pool, phases, blame and the classic message flow.',
        cls: 'text-violet-300',
    },
    {
        title: 'NIP-44 v2',
        href: 'https://github.com/nostr-protocol/nips/blob/master/44.md',
        body: 'The official padding, the 2-byte prefix below 65,536, the chunked padding and the ChaCha20/HMAC layout.',
        cls: 'text-lime-300',
    },
    {
        title: 'NIP-59 gift wrap',
        href: 'https://github.com/nostr-protocol/nips/blob/master/59.md',
        body: 'The rumor → seal → gift-wrap envelope, the timestamp tweak and the two-day window.',
        cls: 'text-cyan-300',
    },
]
</script>

<template>

    <!-- ── Hero ── -->
    <section class="relative z-10 mx-auto flex min-h-[78vh] w-full max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-16 text-center">

        <NuxtLink to="/" class="crumb animate-rise" style="animation-delay: 0.04s">
            home <span class="sep">/</span> daemons
        </NuxtLink>

        <p class="animate-rise mt-6 font-mono text-[0.8rem] uppercase tracking-[0.5em] text-lime-200 sm:text-xs" style="animation-delay: 0.1s">
            permanent liquidity · hush your money
        </p>

        <h1 class="animate-rise mt-6 font-display text-[clamp(2.4rem,8.5vw,6.5rem)] font-extrabold leading-[1.04] tracking-tight text-white" style="animation-delay: 0.2s">
            Daem<span class="text-gradient">ons</span>
        </h1>

        <p class="animate-rise mt-6 font-mono text-[clamp(1rem,2.8vw,1.5rem)] italic text-cyan-100" style="animation-delay: 0.32s">
            Always-on peers for the rounds that need a counterparty.
        </p>

        <p class="animate-rise mt-8 max-w-2xl text-base leading-relaxed text-slate-100 sm:text-lg" style="animation-delay: 0.42s">
            Two daemons: <strong class="font-semibold text-white">CashShuffle</strong> and
            <strong class="font-semibold text-white">CashFusion</strong>. They are designed to join the Nostr relay pool,
            hold a capped chipnet float, and run the round logic as peers — not as servers. This page is the
            public record of the implementation: what is built, what is partial, what is planned, and what the Nito Cash client
            must approve before anything is deployed.
        </p>

        <div class="animate-rise mt-8 flex flex-wrap items-center justify-center gap-3" style="animation-delay: 0.5s">
            <span class="status-chip status-lime">M1–M4 partial</span>
            <span class="status-chip status-violet">not deployed</span>
            <span class="status-chip status-cyan">Nito final approval</span>
        </div>

        <div class="animate-rise mt-10 flex flex-col items-center gap-4 sm:flex-row" style="animation-delay: 0.6s">
            <a href="https://github.com/APECSdev/hushyourmoney/tree/master/daemons" target="_blank" rel="noopener" class="btn-primary btn-pulse">
                Read the orchestration tree
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
            </a>
            <NuxtLink to="/playground" class="btn-ghost">Open the playground</NuxtLink>
        </div>

        <p class="animate-rise mt-8 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-slate-400" style="animation-delay: 0.7s">
            no daemon is running · the cores and gates are public
        </p>
    </section>

    <!-- ── On this page ── -->
    <section class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20">
        <div class="reveal text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">on this page</p>
            <h2 class="mt-5 font-display text-[clamp(1.7rem,4vw,2.6rem)] font-bold leading-[1.08] text-white">
                Twelve sections, one orchestration.
            </h2>
        </div>
        <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <a v-for="t in TOC" :key="t.href" :href="t.href" class="doc-card reveal">
                <span class="font-mono text-xs text-cyan-300">{{ t.n }}</span>
                <span class="ml-3 font-display text-sm font-bold text-white">{{ t.title }}</span>
            </a>
        </div>
    </section>

    <!-- ── 01 · Why daemons ── -->
    <section id="why" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
        <div class="grid items-start gap-12 lg:grid-cols-[1fr_1.3fr]">
            <div class="reveal">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">01 · the gap</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    A round needs a peer that stays online.
                </h2>
                <div class="mt-6 flex flex-wrap gap-2">
                    <span class="badge badge-mid">M1–M4 partial</span>
                    <span class="badge badge-wait">not deployed</span>
                </div>
            </div>

            <div class="reveal space-y-6 text-base leading-relaxed text-slate-100 sm:text-lg">
                <p>
                    CashShuffle and CashFusion are peer-to-peer protocols. A browser tab is a good
                    user-facing peer, but it is not a reliable counterparty: it closes, it sleeps, and it
                    cannot provide liquidity at 03:00. The daemons are designed to fill that gap with a small,
                    capped float and an always-on relay connection.
                </p>
                <p>
                    They are <strong class="font-semibold text-white">Nostr clients, not servers</strong>.
                    They make outbound WebSocket connections, register, shuffle, verify, sign and broadcast
                    exactly like a browser peer. No inbound port is required. No wallet key is sent to a relay.
                    No other peer’s key is ever held.
                </p>
                <p>
                    This page is deliberately early. The cores are implemented; the daemon process is not.
                    The value of the page is the boundary: every capability is marked real, implemented, partial,
                    or planned, and every acceptance gate is named before deployment.
                </p>
            </div>
        </div>

        <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div class="stat-card reveal">
                <p class="font-display text-3xl font-extrabold text-lime-300">2</p>
                <p class="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-slate-300">daemons in progress</p>
            </div>
            <div class="stat-card reveal" style="transition-delay: 0.06s">
                <p class="font-display text-3xl font-extrabold text-cyan-300">0</p>
                <p class="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-slate-300">deployed</p>
            </div>
            <div class="stat-card reveal" style="transition-delay: 0.12s">
                <p class="font-display text-3xl font-extrabold text-violet-300">4</p>
                <p class="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-slate-300">Nito rounds</p>
            </div>
            <div class="stat-card reveal" style="transition-delay: 0.18s">
                <p class="font-display text-3xl font-extrabold text-white">5 / 7</p>
                <p class="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-slate-300">peer shapes</p>
            </div>
        </div>
    </section>

    <!-- ── 02 · The two daemons ── -->
    <section id="two" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
        <div class="reveal text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">02 · the two</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                One runtime, two modes.
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                The shared transport and wallet are the same. The round logic is different: CashShuffle
                is the equal-output shuffle; CashFusion is the six-phase mix. CashShuffle is the first milestone.
            </p>
        </div>

        <div class="mt-12 grid gap-6 lg:grid-cols-2">
            <div v-for="(d, i) in DAEMONS" :id="d.name.toLowerCase()" :key="d.id" class="topic-card reveal" :style="{ transitionDelay: (i * 0.08) + 's' }">
                <div class="flex items-center justify-between gap-3">
                    <span class="topic-num" :class="d.numClass">{{ d.id }}</span>
                    <span class="badge" :class="d.badge">{{ d.status }}</span>
                </div>
                <h3 class="mt-4 font-display text-2xl font-bold text-white">{{ d.name }}</h3>
                <p class="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-slate-300">{{ d.subtitle }}</p>
                <p class="mt-3 text-sm leading-relaxed text-slate-200">{{ d.body }}</p>
                <ul class="life-points">
                    <li v-for="p in d.points" :key="p">{{ p }}</li>
                </ul>
                <div class="mt-5 grid grid-cols-2 gap-2">
                    <div v-for="f in d.facts" :key="f.label" class="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <p class="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-slate-400">{{ f.label }}</p>
                        <p class="mt-1 font-mono text-xs text-white">{{ f.value }}</p>
                    </div>
                </div>
                <a :href="d.href" class="topic-go">jump to the details →</a>
            </div>
        </div>

        <p class="reveal mt-4 font-mono text-xs text-slate-300">
            [status · M1–M4 cores implemented; no daemon process is running or deployed]
        </p>
    </section>

    <!-- ── 03 · Capability matrix ── -->
    <section id="matrix" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
        <div class="reveal text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-violet-200">03 · the comparison</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                What each daemon can do
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                The matrix is the plan, not a live capability report. The status row is the honest one.
            </p>
        </div>

        <div class="reveal mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
            <table class="data-table">
                <thead>
                    <tr>
                        <th scope="col">dimension</th>
                        <th scope="col">CashShuffle daemon</th>
                        <th scope="col">CashFusion daemon</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="m in MATRIX" :key="m.dimension">
                        <td class="font-mono text-xs uppercase tracking-widest text-slate-300">{{ m.dimension }}</td>
                        <td class="text-slate-200">{{ m.shuffle }}</td>
                        <td class="text-slate-200">{{ m.fusion }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p class="reveal mt-3 font-mono text-xs text-slate-300">
            [source · daemons/cashshuffle/README.md, daemons/cashfusion/README.md, docs/P2P-FUSION-DESIGN.md]
        </p>
    </section>

    <!-- ── 04 · Architecture ── -->
    <section id="architecture" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
        <div class="reveal text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">04 · the shape</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                One host, one relay pool, no server.
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                The daemons are designed to run under systemd on blackhost. The only network direction is outbound:
                WebSocket to the relays and Electrum to chipnet.
            </p>
        </div>

        <pre class="reveal mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-[#0a1018]/80 p-6 font-mono text-xs leading-relaxed text-slate-200 sm:text-sm"><code>┌────────────────────────────── blackhost · systemd ──────────────────────────────┐
│                                                                                 │
│   cashshuffle-daemon.service                 cashfusion-daemon.service          │
│   User=cashshuffle · 512M · 50% CPU          User=cashfusion · 512M · 50% CPU   │
│   M1–M4 partial                               M6                                 │
│                                                                                 │
└───────────────────────────────────┬─────────────────────────────────────────────┘
                                    │ outbound WSS · NIP-59 gift wrap
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  relay pool · 3–5 public relays                                                  │
│  ciphertext + p tag + timing only · 80 ms per event per connection               │
└───────────────────────────────────┬─────────────────────────────────────────────┘
                                    │ gift-wrapped events
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Nito Cash browser peers                                                         │
│  the user-facing peer · the final approval for any deployed result               │
└─────────────────────────────────────────────────────────────────────────────────┘</code></pre>

        <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div class="doc-card reveal">
                <h3 class="font-mono text-sm text-lime-300">relay-pool.js</h3>
                <p class="mt-2 text-sm leading-relaxed text-slate-200">N relays, per-connection 80 ms outbox, dedupe by event id, reconnect/backoff, resubscribe, NIP-42 AUTH.</p>
            </div>
            <div class="doc-card reveal" style="transition-delay: 0.06s">
                <h3 class="font-mono text-sm text-cyan-300">round.js</h3>
                <p class="mt-2 text-sm leading-relaxed text-slate-200">CashShuffle phases with VERIFY before SIGNING; CashFusion six phases with coordinator policy. No signature without a verified transaction.</p>
            </div>
            <div class="doc-card reveal" style="transition-delay: 0.12s">
                <h3 class="font-mono text-sm text-violet-300">wallet.js</h3>
                <p class="mt-2 text-sm leading-relaxed text-slate-200">Equal-amount UTXO selection, BCH Schnorr 0x41, broadcast, balance and caps. The Nostr signer is never reused.</p>
            </div>
            <div class="doc-card reveal" style="transition-delay: 0.18s">
                <h3 class="font-mono text-sm text-lime-300">pool.js</h3>
                <p class="mt-2 text-sm leading-relaxed text-slate-200">Role-2 tag pairs, two blanks per lock, lock + action, VM-eval in consensus and standard modes.</p>
            </div>
        </div>
        <p class="reveal mt-4 font-mono text-xs text-slate-300">
            [source · daemons/README.md, daemons/cashshuffle/README.md, daemons/cashfusion/README.md]
        </p>
    </section>

    <!-- ── 05 · Real vs planned ── -->
    <section id="boundary" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
        <div class="reveal text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">05 · the boundary</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                Real, implemented, partial, or planned.
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                The page is useful only if the boundary is explicit. Nothing here is marked live that is not live.
            </p>
        </div>

        <div class="reveal mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
            <table class="data-table">
                <thead>
                    <tr>
                        <th scope="col">surface</th>
                        <th scope="col">state</th>
                        <th scope="col">detail</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="r in REAL_VS_PLANNED" :key="r.surface">
                        <td class="font-mono text-xs uppercase tracking-widest text-slate-300">{{ r.surface }}</td>
                        <td><span class="badge" :class="r.badge">{{ r.state }}</span></td>
                        <td class="text-slate-200">{{ r.detail }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p class="reveal mt-3 font-mono text-xs text-slate-300">
            [boundary · orchestration commit 239d66c; the daemon process, round, wallet and pool builder are stubs]
        </p>
    </section>

    <!-- ── 06 · Security invariants ── -->
    <section id="security" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
        <div class="reveal text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">06 · the invariants</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                The rules the code must keep.
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                These are not features. They are the conditions under which a daemon is allowed to hold a float.
            </p>
        </div>

        <div class="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div v-for="(inv, i) in INVARIANTS" :key="inv.title" class="fact-card reveal" :style="{ transitionDelay: (i * 0.05) + 's' }">
                <span class="badge badge-mid">{{ inv.tag }}</span>
                <h3 class="mt-3 font-display text-lg font-bold text-white">{{ inv.title }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-slate-200">{{ inv.body }}</p>
            </div>
        </div>
    </section>

    <!-- ── 07 · Pool composition ── -->
    <section id="pool" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
        <div class="reveal text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-violet-200">07 · the composition</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                The shuffle is designed to pay the pool.
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                Pool-native batching is the design that makes the round outputs the role-2 tagged fuel UTXOs. The tag binds
                each fuel pair to the action that will spend it. The arithmetic is exact, and the earlier
                “5 outputs → 5 actions” version was wrong.
            </p>
        </div>

        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="(f, i) in POOL_FACTS" :key="f.label" class="fact-card reveal" :style="{ transitionDelay: (i * 0.05) + 's' }">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-slate-400">{{ f.label }}</p>
                <p class="mt-2 font-display text-xl font-bold text-white">{{ f.value }}</p>
                <p class="mt-2 text-sm leading-relaxed text-slate-200">{{ f.detail }}</p>
            </div>
        </div>

        <pre class="reveal mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-[#0a1018]/80 p-6 font-mono text-xs leading-relaxed text-slate-200 sm:text-sm"><code>one role-2 action
  in0  tagged fuel UTXO  ─┐
  in1  tagged fuel UTXO  ─┴─ same tag = SHA256(nf0_LE ‖ nf1_LE)
  in2  state NFT          ── storedRoot ‖ nullifierSetHash; FT = balance

  out0 169-B OP_RETURN carrier
  out1 new state NFT      ── 10,000-sat float; FT = newBalance
  out2 public payout      ── only when sign = 1

  fee  = in0.sats + in1.sats = 30,000 sats (the action fee)
  lock = a separate signed P2PKH tx with its own fee</code></pre>

        <div class="reveal mt-6 rounded-2xl border border-rose-300/25 bg-rose-300/[0.06] p-5">
            <p class="font-mono text-xs uppercase tracking-[0.25em] text-rose-200">corrected arithmetic</p>
            <p class="mt-2 text-sm leading-relaxed text-slate-100">
                A 5-peer round with one 15,000-sat output per participant produces five distinct tags
                and zero same-tag pairs. Five actions need <strong class="font-semibold text-white">10 tagged
                fuel outputs</strong>, not 5. The pool-native round must produce two tagged outputs per
                action, or each participant must contribute two equal inputs and receive two same-tag outputs.
            </p>
        </div>
        <p class="reveal mt-4 text-sm leading-relaxed text-slate-200">
            The carrier, tag, fuel-pair and cost helpers and the BCH lock/action builders are implemented and
            tested (14 tests: 7 pool + 7 lock/action); the proving-asset acceptance, VM-eval and note delivery are pending.
        </p>
        <p class="reveal mt-3 font-mono text-xs text-slate-300">
            [source · docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md §3–§4; pool-registry.json]
        </p>
    </section>

    <!-- ── 08 · Roadmap ── -->
    <section id="roadmap" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
        <div class="reveal text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">08 · the sequence</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                M0 is done. M1–M4 are in progress.
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                The transport and round cores are implemented; the wallet selection and pool helpers are partial.
                Signature verification, timeouts, persistence, the Electrum broadcast, network loop, proving-asset acceptance,
                VM-eval and deployment remain. The roadmap is ordered by
                dependency: transport, then round, then wallet, then the pool composition, then operations, then
                CashFusion, then production.
            </p>
        </div>

        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="(m, i) in ROADMAP" :key="m.id" class="step-card reveal" :style="{ transitionDelay: (i * 0.04) + 's' }">
                <div class="flex items-center justify-between gap-3">
                    <span class="step-num font-mono text-sm text-lime-300">{{ m.id }}</span>
                    <span class="badge" :class="m.badge">{{ m.status }}</span>
                </div>
                <h3 class="mt-3 font-display text-base font-bold text-white">{{ m.title }}</h3>
                <p class="mt-2 text-xs leading-relaxed text-slate-200">{{ m.body }}</p>
            </div>
        </div>
        <p class="reveal mt-4 font-mono text-xs text-slate-300">
            [source · daemons/ROADMAP.md; M0 = commit 239d66c]
        </p>
    </section>

    <!-- ── 09 · Acceptance gates ── -->
    <section id="gates" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
        <div class="reveal text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">09 · the gates</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                No daemon ships without these.
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                The gates are written before the code. A1 and A2 are the first two: a real 5-peer round
                and a malicious-coordinator negative test.
            </p>
        </div>

        <div class="mt-10 grid gap-6 lg:grid-cols-2">
            <div class="fact-card reveal">
                <div class="flex items-center justify-between gap-3">
                    <h3 class="font-display text-lg font-bold text-lime-300">CashShuffle · A1–A10</h3>
                    <span class="badge badge-mid">A2 unit test passes</span>
                </div>
                <ul class="life-points">
                    <li v-for="g in SHUFFLE_GATES" :key="g.id">
                        <span class="font-mono text-[0.7rem] text-lime-300">{{ g.id }}</span>
                        <span><strong class="text-white">{{ g.title }}.</strong> {{ g.body }}</span>
                    </li>
                </ul>
            </div>

            <div class="fact-card reveal" style="transition-delay: 0.08s">
                <div class="flex items-center justify-between gap-3">
                    <h3 class="font-display text-lg font-bold text-violet-300">CashFusion · CF-A1–CF-A7</h3>
                    <span class="badge badge-wait">not started</span>
                </div>
                <ul class="life-points">
                    <li v-for="g in FUSION_GATES" :key="g.id">
                        <span class="font-mono text-[0.7rem] text-violet-300">{{ g.id }}</span>
                        <span><strong class="text-white">{{ g.title }}.</strong> {{ g.body }}</span>
                    </li>
                </ul>
            </div>
        </div>
        <p class="reveal mt-4 font-mono text-xs text-slate-300">
            [source · daemons/cashshuffle/ACCEPTANCE.md, daemons/cashfusion/ACCEPTANCE.md]
        </p>
    </section>

    <!-- ── 10 · The first Nito round ── -->
    <section id="nito" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
        <div class="reveal text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-violet-200">10 · the unblock</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                Four rounds with Nito.
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                The implementation is blocked on decisions, not on code. Each round resolves one group
                of questions and records the decision in the tree.
            </p>
        </div>

        <div class="mt-10 grid gap-5 md:grid-cols-2">
            <a v-for="(r, i) in ROUNDS" :key="r.n" :href="r.href" target="_blank" rel="noopener" class="doc-card reveal" :style="{ transitionDelay: (i * 0.06) + 's' }">
                <div class="flex items-center justify-between gap-3">
                    <span class="font-mono text-xs text-violet-300">{{ r.n }}</span>
                    <span class="badge badge-wait">decision needed</span>
                </div>
                <h3 class="mt-3 font-display text-lg font-bold text-white">{{ r.title }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-slate-200">{{ r.body }}</p>
                <p class="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-slate-300">{{ r.asks }}</p>
                <span class="mt-3 inline-block font-mono text-xs uppercase tracking-[0.22em] text-violet-300">open the questions →</span>
            </a>
        </div>
        <p class="reveal mt-4 font-mono text-xs text-slate-300">
            [source · daemons/cashshuffle/OPEN-QUESTIONS.md Q1–Q15; daemons/cashfusion/OPEN-QUESTIONS.md Q1–Q10]
        </p>
    </section>

    <!-- ── 11 · FAQ ── -->
    <section id="faq" class="relative z-10 mx-auto w-full max-w-5xl scroll-mt-24 px-6 pb-28 sm:pb-36">
        <div class="reveal text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">11 · the questions</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                What people ask first.
            </h2>
        </div>

        <div class="mt-10 space-y-4">
            <div v-for="(f, i) in FAQ" :key="f.q" class="doc-card reveal" :style="{ transitionDelay: (i * 0.04) + 's' }">
                <h3 class="font-display text-base font-bold text-white">{{ f.q }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-slate-200">{{ f.a }}</p>
            </div>
        </div>
    </section>

    <!-- ── 12 · Sources ── -->
    <section id="sources" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-24">
        <div class="reveal text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">12 · the sources</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                Read the record.
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                Every claim on this page has a file or a measured source behind it. The tree is the primary record.
            </p>
        </div>

        <div class="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <a v-for="(s, i) in SOURCES" :key="s.title" :href="s.href" target="_blank" rel="noopener" class="doc-card reveal" :style="{ transitionDelay: (i * 0.05) + 's' }">
                <h3 class="font-mono text-sm" :class="s.cls">{{ s.title }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-slate-200">{{ s.body }}</p>
                <span class="mt-3 inline-block font-mono text-xs uppercase tracking-[0.22em] text-slate-300">open source →</span>
            </a>
        </div>
    </section>

    <!-- ── CTA ── -->
    <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24">
        <div class="reveal rounded-3xl border border-lime-300/20 bg-lime-300/[0.04] p-10 text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">the next step</p>
            <h2 class="mt-4 font-display text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-[1.08] text-white">
                The tree is public. The daemons are not.
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                Read the orchestration, the plans and the open questions. The first Nito round resolves
                the wire and verification decisions; the code follows.
            </p>
            <div class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a href="https://github.com/APECSdev/hushyourmoney/tree/master/daemons" target="_blank" rel="noopener" class="btn-primary">
                    Read the tree
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                </a>
                <NuxtLink to="/research/cashfusion" class="btn-ghost">Read the CashFusion research</NuxtLink>
            </div>
        </div>
    </section>

</template>
