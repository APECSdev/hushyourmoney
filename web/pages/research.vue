<!-- web/pages/research.vue -->

<script setup lang="ts">
/* NOTE: layout 'fullscreen' initializes the Profile/System stores (see layouts/fullscreen.vue). */
definePageMeta({
    layout: 'fullscreen',
})

useHead({
    title: `Research — Hush Your Money`,
    meta: [
        { name: 'description', content: `UTXO privacy research hub: the Groth16 shielded pool (built and measured on chipnet), ECDH shielded addresses, CoinJoin and CashFusion. Our numbers are measured; third-party claims are cited.` }
    ],
})

/* Scroll-reveal (shared composable). */
useReveal()

/* ── MEASURED NUMBERS (shielded-pool flagship) ─────────────────────
   Every value below is a live measurement with a recorded source
   (session log / on-chain decode / snarkjs output). No estimates.
   Legend: [measured] = live-measured evidence; [cited] = third-party
   claim, linked to its source. */
const STATS = [
    { value: '183,472', label: 'constraints · single-asset circuit', tag: 'measured', color: 'text-lime-300' },
    { value: '186,007', label: 'constraints · multi-asset circuit', tag: 'measured', color: 'text-lime-300' },
    { value: '2', label: 'public inputs', tag: 'measured', color: 'text-cyan-300' },
    { value: '35,626 B', label: 'on-chain verifier · one standard tx', tag: 'measured', color: 'text-violet-300' },
    { value: '26/26', label: 'red-team attacks rejected', tag: 'measured', color: 'text-white' },
]

/* ── Topic index ─────────────────────────────────────────────────── */
const TOPICS = [
    { n: '01', title: 'The Shielded Pool', blurb: 'Groth16 joinsplit + covenant state machine + full on-chain verifier — built, deployed and measured on chipnet.', chip: 'flagship · deep dive below', chipClass: 'topic-lime', href: '#pool' },
    { n: '02', title: 'Shielded Addresses', blurb: 'ECDH one-time addresses on standard P2PKH — receiver privacy with no new opcodes. External implementation, surveyed here.', chip: 'external work · survey', chipClass: 'topic-cyan', href: '#stealth' },
    { n: '03', title: 'CoinJoin', blurb: 'Collaborative transactions that break the input-to-output link. The base technique — live on BCH through CashFusion.', chip: 'technique', chipClass: 'topic-violet', href: '#coinjoin' },
    { n: '04', title: 'CashFusion', blurb: 'Bitcoin Cash\'s CoinJoin-style mixing tool, with a real adoption history and an active red-team discussion.', chip: 'live on BCH · survey', chipClass: 'topic-violet', href: '#fusion' },
    { n: '05', title: 'Trusted Setup', blurb: 'The ceremony: a multi-party Powers-of-Tau setup gating any mainnet deployment of the pool.', chip: 'gate 7 · in design', chipClass: 'topic-white', href: '/ceremony' },
]

/* ── Measured results table (shielded pool) ──────────────────────── */
const RESULTS = [
    { q: 'Circuit (single-asset)', v: '183,472 constraints · 107 private inputs · 181,959 wires', src: 'snarkjs r1cs info build256/pool.r1cs', href: 'https://github.com/APECSdev/pusd-shielded-pool' },
    { q: 'Public inputs', v: '2 — [merkleRoot, actionHash]', src: 'pool.r1cs + verification_key.json (ic.length = 3)', href: 'https://github.com/APECSdev/pusd-shielded-pool' },
    { q: 'Circuit (multi-asset, variant b)', v: '186,007 constraints (+1.38%) · Poseidon(6) commitments bind the full 256-bit category', src: 'circom 2.2.3 --O2 compile, 2026-11-01 build record', href: 'https://github.com/APECSdev/pusd-shielded-pool' },
    { q: 'On-chain verifier size', v: '35,626 B inside ONE standard transaction', src: 'chipnet on-chain measurement', href: 'https://chipnet.imaginary.cash/tx/b0a488db5b7e9bac07eebc45977523cd0730ddfe078571f2e17135231e30546b' },
    { q: 'Covenant redeem bytecode', v: '347 B — identical for every asset (category = constructor param)', src: 'decoded from transfer tx input 0 witness', href: 'https://chipnet.imaginary.cash/tx/b0a488db5b7e9bac07eebc45977523cd0730ddfe078571f2e17135231e30546b' },
    { q: 'Proof generation', v: '16.967 s (183,472) / 17.6 s (186,007) · build runner (hardware spec UNMEASURED)', src: 'snarkjs fullProve, session records', href: null },
    { q: 'Covenant op-cost (Gate 6, input 0)', v: '84,819 / 556,800 budget (15.2%)', src: 'libauth BCH-2026 VM debug on the broadcast tx', href: 'https://chipnet.imaginary.cash/tx/fc585fc9bf6499024c89c73a2bcb945de2ec212fb36f8ffc5acb617b6636912f' },
    { q: 'Verifier step op-costs (Gate 6)', v: '82.4% – 92.3% of the per-input budget', src: 'libauth BCH-2026 VM debug on the broadcast tx', href: 'https://chipnet.imaginary.cash/tx/fc585fc9bf6499024c89c73a2bcb945de2ec212fb36f8ffc5acb617b6636912f' },
    { q: 'Pool-op tx size', v: '~36.8 – 37.8 KB per shielded operation', src: 'on-chain transactions', href: 'https://chipnet.imaginary.cash/tx/60fe613ec853043908b8dc83fac8165da5b6b7f0ef3e26a4299fd87560784273' },
]

/* ── Gate-by-gate evidence ───────────────────────────────────────── */
type Gate = {
    gate: string
    title: string
    result: string
    href?: string
    hrefLabel?: string
    to?: string
    status: 'confirmed' | 'in-flight' | 'pending'
}
const GATES: Gate[] = [
    {
        gate: 'G1', title: 'Full pipeline reproduction',
        result: '4th chained TRANSFER built, proved (16.967 s) and broadcast; VM-eval passed on all 7 inputs; confirmed in block 330142.',
        href: 'https://chipnet.imaginary.cash/tx/3e21097c212a3821fa186623eb38b1e785f9fca544e57f3f4562bdd0c6615e78', hrefLabel: 'tx 3e21097c…5e78',
        status: 'confirmed',
    },
    {
        gate: 'G2', title: 'Compile-from-source parity',
        result: 'pool.r1cs + pool.wasm + pool.sym byte-identical (sha256-verified) against the canonical build256 artifacts.',
        status: 'confirmed',
    },
    {
        gate: 'G3', title: 'Path A lifecycle — fresh deploy',
        result: 'PREP → GENESIS → DEPLOY → SHIELD 1,000,000 units, all in block 330438; first pool-registry entry.',
        href: 'https://chipnet.imaginary.cash/tx/f5927a0bb67d4688976f98483828259057bd399522a587e66e3b1099a2ab7426', hrefLabel: 'tx f5927a0b…7426',
        status: 'confirmed',
    },
    {
        gate: 'G4', title: 'Multi-asset circuit',
        result: 'Variant (b) Poseidon(6): 186,007 constraints (+1.38%). Anti-converter negative test (1 unit moved across categories) REJECTED in-circuit.',
        status: 'confirmed',
    },
    {
        gate: 'G5', title: 'Multi-category covenant',
        result: 'All 6 tx shapes ACCEPTED on the BCH-2026 VM; worst op-cost 49,549 / 195,200 (~25%).',
        status: 'confirmed',
    },
    {
        gate: 'G6', title: 'Multi-asset E2E on chipnet',
        result: 'Fresh 1-of-1 setup + deploy + SHIELD 500,000 units of a DIFFERENT category than the pool — block 330459.',
        href: 'https://chipnet.imaginary.cash/tx/fc585fc9bf6499024c89c73a2bcb945de2ec212fb36f8ffc5acb617b6636912f', hrefLabel: 'tx fc585fc9…912f',
        status: 'confirmed',
    },
    {
        gate: 'G6b', title: 'Two-asset lifecycle, one pool',
        result: 'SHIELD A → SHIELD B → TRANSFER → UNSHIELD B on one multi-asset pool; all four ops VM-verified and broadcast 2026-11-10/11.',
        href: 'https://chipnet.imaginary.cash/tx/b7bc81867707fb4ae80e722e81685b9518b21105638eae9014516ec34ca3d28f', hrefLabel: 'tx b7bc8186…3d8f',
        status: 'in-flight',
    },
    {
        gate: 'G7', title: 'MPC trusted setup → mainnet',
        result: 'Perpetual Powers-of-Tau ceremony — in design. Public landing page live; monitor UI marked [demo].',
        to: '/ceremony',
        status: 'pending',
    },
]

/* ── Live pools (from pool-registry.json) ────────────────────────── */
const EXPLORER = 'https://chipnet.imaginary.cash/tx/'
const POOLS = [
    {
        name: 'gate3-demo-pool',
        cat: '98690dba…b153',
        catFull: '98690dba09831a8099613ba2eb4cbe12fffa53739bdfce4978e311032a85b153',
        locking: 'aa207c0c…2087',
        lockingFull: 'aa207c0c15fbdc14dda43fb0540846e065a1bbd4076e7ab64720e64c3ecd3515208087',
        root: '2c0f5336…4525',
        firstOp: 'SHIELD 1,000,000 units · block 330438',
        tx: 'f5927a0b…7426',
        txFull: 'f5927a0bb67d4688976f98483828259057bd399522a587e66e3b1099a2ab7426',
    },
    {
        name: 'gate6-multi-pool',
        cat: 'd85ba98a…b70a',
        catFull: 'd85ba98a8185106edd087a78bac3c5b6ba75aa0a9bfa72860dd8ed582386b70a',
        locking: 'aa201754…8e87',
        lockingFull: 'aa20175470b9d5f5ade49873c008de362cd352d2ff33c5420c4720a43d90a3f7238e87',
        root: '6fefb09c…7e20',
        firstOp: 'SHIELD 500,000 units (foreign category) · block 330459',
        tx: 'fc585fc9…912f',
        txFull: 'fc585fc9bf6499024c89c73a2bcb945de2ec212fb36f8ffc5acb617b6636912f',
    },
]

/* ── Stealth-address facts (cited: topic 1773 + 00-Wallet repo) ──── */
const STEALTH_FACTS = [
    { k: 'keys', v: 'm/44\'/145\'/0\'/2\'/0 → scan (a, A) · …/2\'/1 → spend (b, B) — same BIP44 seed' },
    { k: 'tweak', v: 'c = SHA256( SHA256(ECDH_x) ‖ outpoint ) — unique nonce per transaction' },
    { k: 'address', v: 'P_stealth = B + c·G → RIPEMD160(SHA256(P_stealth)) — a standard P2PKH address' },
    { k: 'scan', v: 'receiver computes ECDH(a, sender_pub) per transaction, derives the expected address, matches outputs' },
]

/* ── Related discussions (all topics verified live 2026-11-13) ───── */
const THREADS = [
    { id: 1773, slug: 'ecdh-stealth-addresses-on-bitcoin-cash-implementation-code', title: 'ECDH Stealth Addresses on Bitcoin Cash — Implementation & Code', date: '2026-03' },
    { id: 1637, slug: 'silent-reusable-payment-addresses-srpa', title: 'Silent Reusable Payment Addresses (SRPA)', date: '2025-07' },
    { id: 752, slug: '94-percent-of-all-bch-transacted-since-july-2020-is-now-a-descendant-of-a-cashfusion-transaction', title: '94 percent of all BCH transacted since July 2020 is now a descendant of a CashFusion transaction', date: '2022-03' },
    { id: 525, slug: 'is-there-interest-in-a-red-team-analysis-of-cashfusion', title: 'Is there interest in a Red Team analysis of CashFusion?', date: '2021-08' },
    { id: 1854, slug: 'ways-to-improve-ux-tech-of-cashfusion', title: 'Ways to improve UX / tech of CashFusion', date: '2026-06' },
    { id: 1724, slug: 'confidential-transactions', title: 'Confidential Transactions', date: '2026-01' },
    { id: 1570, slug: 'chip-2025-05-native-elliptic-curve-arithmetic-operations', title: 'CHIP-2025-05 Native Elliptic Curve Arithmetic Operations', date: '2025-05' },
    { id: 1524, slug: 'network-layer-privacy-on-bitcoin-cash', title: 'Network-Layer Privacy on Bitcoin Cash', date: '2025-03' },
    { id: 1472, slug: 'chip-2025-01-dandelion-integration-for-bitcoin-cash', title: 'CHIP-2025-01: Dandelion++ Integration for Bitcoin Cash', date: '2025-01' },
]
</script>

<template>
    <main class="relative min-h-screen w-full overflow-x-clip bg-[#060a10] font-sans text-slate-200 antialiased selection:bg-lime-300 selection:text-slate-900">

        <AuroraBackdrop />

        <!-- GitHub source banner (top-right) -->
        <GithubBanner />

        <!-- ── Hero ── -->
        <section class="relative z-10 mx-auto flex min-h-[92vh] w-full max-w-7xl flex-col items-center justify-center px-6 pb-24 pt-16 text-center">

            <p class="animate-rise font-mono text-[0.65rem] uppercase tracking-[0.5em] text-lime-300/80 sm:text-xs" style="animation-delay: 0.05s">
                utxo privacy research · hush your money
            </p>

            <h1 class="animate-rise mt-6 font-display text-[clamp(2.4rem,8.5vw,6.5rem)] font-extrabold leading-[1.04] tracking-tight text-white" style="animation-delay: 0.18s">
                Privacy<br />
                <span class="text-gradient">Research</span>
            </h1>

            <p class="animate-rise mt-6 font-mono text-[clamp(1rem,2.8vw,1.6rem)] italic text-cyan-200/90" style="animation-delay: 0.32s">
                A research hub for UTXO privacy — measured where we build, cited where we survey.
            </p>

            <p class="animate-rise mt-8 max-w-2xl text-base leading-relaxed text-slate-300/90 sm:text-lg" style="animation-delay: 0.44s">
                Five layers of the privacy stack, from zero-knowledge pools to address-level
                unlinkability and collaborative mixing. Our own work —
                <strong class="font-semibold text-white">the shielded pool</strong> — is documented
                gate-by-gate with every number traceable to an on-chain artifact.
            </p>

            <div class="animate-rise mt-8 flex flex-wrap items-center justify-center gap-3" style="animation-delay: 0.52s">
                <span class="status-chip status-lime">flagship: the shielded pool</span>
                <span class="status-chip status-cyan">live on chipnet</span>
                <span class="status-chip status-violet">no consensus changes</span>
            </div>

            <div class="animate-rise mt-10 flex flex-col items-center gap-4 sm:flex-row" style="animation-delay: 0.6s">
                <a href="#topics" class="btn-primary btn-pulse">
                    Explore the Topics
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                </a>

                <a href="#pool" class="btn-ghost">
                    Straight to the Pool
                </a>
            </div>

            <div class="animate-rise mt-16 flex items-center gap-3 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-slate-500" style="animation-delay: 0.7s">
                <span class="h-px w-10 bg-slate-600/60"></span>
                our numbers are measured — third-party claims are cited
                <span class="h-px w-10 bg-slate-600/60"></span>
            </div>
        </section>

        <!-- ── 00 · Topic index ── -->
        <section id="topics" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-lime-300/80">00 · the map</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    Research Topics
                </h2>
            </div>

            <div class="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <template v-for="(t, i) in TOPICS" :key="t.n">
                    <NuxtLink v-if="t.href.startsWith('/')" :to="t.href" class="topic-card reveal" :style="{ transitionDelay: (i * 0.08) + 's' }">
                        <div class="flex items-center justify-between gap-3">
                            <span class="topic-num" :class="t.chipClass">{{ t.n }}</span>
                            <span class="badge badge-wait">{{ t.chip }}</span>
                        </div>
                        <h3 class="mt-4 font-display text-lg font-bold text-white">{{ t.title }}</h3>
                        <p class="mt-2 text-sm leading-relaxed text-slate-400">{{ t.blurb }}</p>
                        <span class="topic-go">explore →</span>
                    </NuxtLink>

                    <a v-else :href="t.href" class="topic-card reveal" :style="{ transitionDelay: (i * 0.08) + 's' }">
                        <div class="flex items-center justify-between gap-3">
                            <span class="topic-num" :class="t.chipClass">{{ t.n }}</span>
                            <span class="badge" :class="t.chipClass === 'topic-lime' ? 'badge-done' : t.chipClass === 'topic-cyan' ? 'badge-live' : 'badge-mid'">{{ t.chip }}</span>
                        </div>
                        <h3 class="mt-4 font-display text-lg font-bold text-white">{{ t.title }}</h3>
                        <p class="mt-2 text-sm leading-relaxed text-slate-400">{{ t.blurb }}</p>
                        <span class="topic-go">explore →</span>
                    </a>
                </template>
            </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════ -->
        <!-- 01 · THE SHIELDED POOL (flagship)                          -->
        <!-- ══════════════════════════════════════════════════════════ -->
        <section id="pool" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-10 px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-lime-300/80">01 · flagship</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.9rem)] font-bold leading-[1.08] text-white">
                    The Shielded Pool
                </h2>
                <p class="mt-3 font-mono text-xs text-slate-500">built · deployed · measured — everything below is ours and on-chain</p>
            </div>

            <!-- Key numbers -->
            <div class="reveal mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                <div v-for="(s, i) in STATS" :key="s.label" class="stat-card" :style="{ transitionDelay: (i * 0.08) + 's' }">
                    <div class="font-display text-2xl font-extrabold sm:text-3xl" :class="s.color">{{ s.value }}</div>
                    <div class="mt-2 text-xs uppercase tracking-widest text-slate-500">{{ s.label }}</div>
                    <div class="mt-1 font-mono text-[0.6rem] text-slate-600">[{{ s.tag }}]</div>
                </div>
            </div>

            <!-- What this is -->
            <div class="mt-20 grid items-start gap-12 lg:grid-cols-[1fr_1.4fr]">
                <div class="reveal">
                    <h3 class="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">Payments that<br />leave no trace</h3>
                </div>

                <div class="reveal space-y-6 text-base leading-relaxed text-slate-300/90 sm:text-lg" style="transition-delay: 0.12s">
                    <p>
                        The pool is a <strong class="font-semibold text-white">join-split state machine</strong>:
                        users deposit CashTokens publicly (<strong class="font-semibold text-white">SHIELD</strong>),
                        move them privately between notes (<strong class="font-semibold text-white">TRANSFER</strong>),
                        and withdraw them publicly (<strong class="font-semibold text-white">UNSHIELD</strong>).
                        Inside the pool, notes are commitments — value, owner and history are never
                        visible on-chain.
                    </p>
                    <p>
                        Every operation is authorized by a <strong class="font-semibold text-white">Groth16 zero-knowledge
                        proof</strong> that the transition is honest: spent notes existed in the pool's Merkle
                        tree, their nullifiers are unique, value is conserved per asset, and only the
                        owner could spend. The chain stores just two public inputs per proof:
                        the tree root and a hash binding the whole action.
                    </p>
                    <ul class="mt-4 space-y-3 text-sm sm:text-base">
                        <li class="flex gap-3">
                            <span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-300"></span>
                            <span><strong class="text-white">Works on today's scripting:</strong> the full verifier runs as one standard transaction on the BCH 2026 VM — no CHIP, no fork, no new opcodes.</span>
                        </li>
                        <li class="flex gap-3">
                            <span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300"></span>
                            <span><strong class="text-white">Asset-generic by construction:</strong> the CashToken category is a private witness — the same circuit and verifying key serve any token.</span>
                        </li>
                        <li class="flex gap-3">
                            <span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300"></span>
                            <span><strong class="text-white">Not a black box:</strong> covenant + verifier + circuit are all reproducible from source; the gate trail below is linked on-chain.</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Architecture -->
            <div id="architecture" class="reveal mt-24 text-center">
                <h3 class="font-display text-[clamp(1.5rem,3.5vw,2.4rem)] font-bold leading-[1.08] text-white">Architecture</h3>
                <p class="mt-3 font-mono text-xs text-slate-500">rendered from the design docs — GENERALIZED-SHIELDING.md / COVENANT-DESIGN.md</p>
            </div>

            <div class="reveal mt-10">
                <svg viewBox="0 0 960 520" class="h-auto w-full" role="img" aria-label="Shielded pool architecture: private witnesses feed the Groth16 circuit, whose two public inputs bind the covenant state machine and the on-chain verifier on chipnet.">
                    <defs>
                        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                            <path d="M0 0L10 5L0 10z" fill="#7dd3a8" />
                        </marker>
                    </defs>

                    <!-- Private band -->
                    <rect x="40" y="28" width="880" height="104" rx="16" fill="rgba(190,242,100,0.04)" stroke="rgba(190,242,100,0.35)" stroke-dasharray="7 5" />
                    <text x="60" y="56" font-family="Space Mono, monospace" font-size="13" fill="#bef264" letter-spacing="3">PRIVATE — WITNESSES, NEVER ON-CHAIN</text>
                    <rect x="64" y="74" width="272" height="38" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
                    <text x="200" y="98" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#e2e8f0">C&#7522; = Poseidon(value, &#961;, r, pk)</text>
                    <rect x="356" y="74" width="248" height="38" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
                    <text x="480" y="98" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#e2e8f0">nf&#7522; = H(nullifierKey, &#961;)</text>
                    <rect x="624" y="74" width="272" height="38" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
                    <text x="760" y="98" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#e2e8f0">encrypted tag &#8594; receiver scan</text>

                    <!-- Arrow: private -> circuit -->
                    <line x1="480" y1="132" x2="480" y2="176" stroke="#7dd3a8" stroke-width="2" marker-end="url(#arr)" />
                    <text x="494" y="160" font-family="Space Mono, monospace" font-size="11" fill="#94a3b8">witnesses</text>

                    <!-- Circuit band -->
                    <rect x="200" y="182" width="560" height="120" rx="16" fill="rgba(103,232,249,0.05)" stroke="rgba(103,232,249,0.45)" />
                    <text x="480" y="214" text-anchor="middle" font-family="Space Mono, monospace" font-size="14" fill="#67e8f9" letter-spacing="2">GROTH16 JOINSPLIT CIRCUIT — pool.circom</text>
                    <text x="480" y="240" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#cbd5e1">183,472 constraints · 2 public inputs · BN254</text>
                    <text x="480" y="262" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#94a3b8">Merkle membership · value conservation · spend authorization</text>
                    <rect x="330" y="276" width="300" height="16" rx="8" fill="rgba(103,232,249,0.14)" />
                    <text x="480" y="288" text-anchor="middle" font-family="Space Mono, monospace" font-size="11" fill="#67e8f9">public: [merkleRoot, actionHash]</text>

                    <!-- Arrows: circuit -> covenant / verifier -->
                    <line x1="330" y1="302" x2="270" y2="346" stroke="#7dd3a8" stroke-width="2" marker-end="url(#arr)" />
                    <text x="118" y="332" font-family="Space Mono, monospace" font-size="11" fill="#94a3b8">actionHash</text>
                    <line x1="630" y1="302" x2="690" y2="346" stroke="#7dd3a8" stroke-width="2" marker-end="url(#arr)" />
                    <text x="716" y="332" font-family="Space Mono, monospace" font-size="11" fill="#94a3b8">proof</text>

                    <!-- Covenant box -->
                    <rect x="60" y="352" width="420" height="116" rx="16" fill="rgba(196,141,255,0.05)" stroke="rgba(196,141,255,0.45)" />
                    <text x="270" y="382" text-anchor="middle" font-family="Space Mono, monospace" font-size="14" fill="#c48dff" letter-spacing="2">ASSETPOOL COVENANT</text>
                    <text x="270" y="406" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#cbd5e1">P2SH32 · 347 B redeem (category = ctor param)</text>
                    <text x="270" y="428" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#94a3b8">state NFT { merkleRoot, nullifierSet }</text>
                    <text x="270" y="450" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#94a3b8">6-input / 7-output tx shape</text>

                    <!-- Verifier box -->
                    <rect x="540" y="352" width="360" height="116" rx="16" fill="rgba(255,255,255,0.04)" stroke="rgba(226,232,240,0.4)" />
                    <text x="720" y="382" text-anchor="middle" font-family="Space Mono, monospace" font-size="14" fill="#e2e8f0" letter-spacing="2">ON-CHAIN GROTH16 VERIFIER</text>
                    <text x="720" y="406" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#cbd5e1">35,626 B · one standard tx · BCH 2026 VM</text>
                    <text x="720" y="428" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#94a3b8">vk_x recomputed in-script</text>
                    <text x="720" y="450" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#94a3b8">5 sibling step-inputs</text>

                    <!-- Arrows: covenant + verifier -> chipnet -->
                    <line x1="270" y1="468" x2="430" y2="500" stroke="#7dd3a8" stroke-width="2" marker-end="url(#arr)" />
                    <line x1="720" y1="468" x2="560" y2="500" stroke="#7dd3a8" stroke-width="2" marker-end="url(#arr)" />

                    <!-- Chipnet strip -->
                    <rect x="280" y="492" width="400" height="24" rx="12" fill="rgba(190,242,100,0.1)" stroke="rgba(190,242,100,0.4)" />
                    <text x="480" y="508" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#bef264">Bitcoin Cash chipnet — no fork · CashTokens · P2SH32</text>
                </svg>
            </div>

            <!-- One operation -->
            <div class="mt-14 grid gap-6 md:grid-cols-3">
                <div class="step-card reveal">
                    <div class="step-num text-lime-300">1</div>
                    <h4 class="mt-4 font-display text-lg font-bold text-white">Prove</h4>
                    <p class="mt-3 text-sm leading-relaxed text-slate-400">
                        The wallet builds the action locally, generates the Groth16 witness
                        and proof (16.967 s measured for the full joinsplit on our build
                        runner) and assembles one transaction.
                    </p>
                </div>

                <div class="step-card reveal" style="transition-delay: 0.12s">
                    <div class="step-num text-cyan-300">2</div>
                    <h4 class="mt-4 font-display text-lg font-bold text-white">Verify</h4>
                    <p class="mt-3 text-sm leading-relaxed text-slate-400">
                        Sibling script-inputs run the on-chain verifier (35,626 B total);
                        vk_x is recomputed in-script so public inputs can never be forged.
                    </p>
                </div>

                <div class="step-card reveal" style="transition-delay: 0.24s">
                    <div class="step-num text-violet-300">3</div>
                    <h4 class="mt-4 font-display text-lg font-bold text-white">Settle</h4>
                    <p class="mt-3 text-sm leading-relaxed text-slate-400">
                        The covenant checks the actionHash, archives the nullifiers, adopts
                        the new tree root in its state NFT and pays the unshield leg —
                        all in the same transaction.
                    </p>
                </div>
            </div>
        </section>

        <!-- ── Measured results ── -->
        <section id="results" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-lime-300/80">01 · numbers</p>
                <h3 class="mt-3 font-display text-[clamp(1.5rem,3.5vw,2.4rem)] font-bold leading-[1.08] text-white">Measured Results</h3>
                <p class="mt-2 font-mono text-xs text-slate-500">[ measured ] = live measurement with a recorded source · nothing on this page is estimated</p>
            </div>

            <div class="reveal mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
                <table class="data-table min-w-[720px]">
                    <thead>
                        <tr>
                            <th>quantity</th>
                            <th>value</th>
                            <th>source</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="r in RESULTS" :key="r.q">
                            <td class="whitespace-nowrap font-mono text-[0.72rem] uppercase tracking-wider text-slate-400">{{ r.q }}</td>
                            <td class="text-slate-100">{{ r.v }}</td>
                            <td class="font-mono text-[0.7rem] text-slate-500">
                                <a v-if="r.href" :href="r.href" target="_blank" rel="noopener" class="src-link">{{ r.src }} ↗</a>
                                <span v-else>{{ r.src }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p class="reveal mt-4 font-mono text-[0.65rem] leading-relaxed text-slate-600">
                build records: APECSdev/pusd-shielded-pool (CHIPNET.md) · hushyourmoney (POOL-DEPLOYMENT.md) — all measured on chipnet, 2026-10/11.
            </p>
        </section>

        <!-- ── Evidence: gates ── -->
        <section id="evidence" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-violet-300/80">01 · the trail</p>
                <h3 class="mt-3 font-display text-[clamp(1.5rem,3.5vw,2.4rem)] font-bold leading-[1.08] text-white">Gate-by-Gate Evidence</h3>
                <p class="mt-2 font-mono text-xs text-slate-500">seven launch gates · six passed · one in design</p>
            </div>

            <div class="mt-10 space-y-4">
                <div v-for="(g, i) in GATES" :key="g.gate" class="gate-card reveal" :style="{ transitionDelay: (i * 0.06) + 's' }">
                    <div class="flex flex-wrap items-center gap-3">
                        <span class="gate-chip" :class="g.status === 'confirmed' ? 'gate-done' : g.status === 'in-flight' ? 'gate-live' : 'gate-wait'">{{ g.gate }}</span>
                        <h4 class="font-display text-base font-bold text-white sm:text-lg">{{ g.title }}</h4>
                        <span class="ml-auto badge" :class="g.status === 'confirmed' ? 'badge-done' : g.status === 'in-flight' ? 'badge-live' : 'badge-wait'">
                            {{ g.status === 'confirmed' ? 'passed' : g.status === 'in-flight' ? 'in flight' : 'in design' }}
                        </span>
                    </div>
                    <p class="mt-3 text-sm leading-relaxed text-slate-400">{{ g.result }}</p>
                    <div class="mt-3 flex flex-wrap gap-3 font-mono text-[0.68rem]">
                        <a v-if="g.href" :href="g.href" target="_blank" rel="noopener" class="src-link">{{ g.hrefLabel }} ↗</a>
                        <NuxtLink v-if="g.to" :to="g.to" class="src-link">{{ g.to === '/ceremony' ? '/ceremony — the Hush Ceremony' : g.to }} →</NuxtLink>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── Live pools ── -->
        <section id="pools" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-lime-300/80">01 · on-chain state</p>
                <h3 class="mt-3 font-display text-[clamp(1.5rem,3.5vw,2.4rem)] font-bold leading-[1.08] text-white">Live Pools</h3>
                <p class="mt-2 font-mono text-xs text-slate-500">from pool-registry.json · chipnet</p>
            </div>

            <div class="mt-10 grid gap-6 lg:grid-cols-2">
                <div v-for="p in POOLS" :key="p.name" class="pool-card reveal">
                    <div class="flex items-center justify-between gap-3">
                        <h4 class="font-mono text-sm text-lime-300">{{ p.name }}</h4>
                        <span class="badge badge-done">deployed</span>
                    </div>
                    <dl class="mt-4 space-y-2.5 font-mono text-[0.72rem] leading-relaxed">
                        <div class="flex gap-3">
                            <dt class="w-24 shrink-0 uppercase tracking-widest text-slate-600">category</dt>
                            <dd class="break-all text-slate-300"><a :href="EXPLORER + p.catFull" target="_blank" rel="noopener" class="src-link">{{ p.cat }}</a></dd>
                        </div>
                        <div class="flex gap-3">
                            <dt class="w-24 shrink-0 uppercase tracking-widest text-slate-600">locking</dt>
                            <dd class="break-all text-slate-300" :title="p.lockingFull">{{ p.locking }}</dd>
                        </div>
                        <div class="flex gap-3">
                            <dt class="w-24 shrink-0 uppercase tracking-widest text-slate-600">tree root</dt>
                            <dd class="break-all text-slate-300">{{ p.root }}</dd>
                        </div>
                        <div class="flex gap-3">
                            <dt class="w-24 shrink-0 uppercase tracking-widest text-slate-600">first op</dt>
                            <dd class="break-all text-slate-300">
                                {{ p.firstOp }} ·
                                <a :href="EXPLORER + p.txFull" target="_blank" rel="noopener" class="src-link">{{ p.tx }} ↗</a>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <p class="reveal mt-6 text-sm leading-relaxed text-slate-500">
                A third pool (Gate 6b) demonstrates the full two-asset lifecycle — SHIELD A, SHIELD B,
                TRANSFER, UNSHIELD — on a single multi-asset instance; its operations were VM-verified and
                broadcast 2026-11-10/11 and are pending confirmation at last check. Registry entry to follow.
                Full registry: <a href="https://github.com/APECSdev/hushyourmoney/blob/master/pool-registry.json" target="_blank" rel="noopener" class="src-link">pool-registry.json ↗</a>
            </p>
        </section>

        <!-- ── Security posture & limits ── -->
        <section id="limits" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr]">
                <div class="reveal">
                    <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-rose-300/80">01 · posture</p>
                    <h3 class="mt-3 font-display text-[clamp(1.5rem,3.5vw,2.4rem)] font-bold leading-[1.08] text-white">Security<br />&amp; Limits</h3>
                </div>

                <div class="reveal space-y-6 text-base leading-relaxed text-slate-300/90 sm:text-lg" style="transition-delay: 0.12s">
                    <p>
                        <strong class="font-semibold text-white">What was attacked:</strong> the on-chain
                        verifier survived a red-team pass — 5/5 valid proofs accepted, 9/9 mutated
                        public inputs rejected, 26/26 red-team runs rejected. vk_x is recomputed
                        in-script, so public inputs cannot be forged by a malicious spender.
                    </p>
                    <p>
                        <strong class="font-semibold text-white">What cannot happen:</strong> the pool cannot
                        convert value across asset categories — per-category conservation is enforced
                        inside the circuit, and the anti-converter negative test is rejected at
                        witness time (Gate 4).
                    </p>
                    <p>
                        <strong class="font-semibold text-white">What is NOT done:</strong> every trusted setup
                        so far was a disclosed single-party (1-of-1) contribution on chipnet —
                        appropriate for a testnet only. Mainnet requires a genuine multi-party
                        ceremony (Gate 7). A proof is bound to its verifying key and public inputs,
                        never to a txid — double-spend protection lives in the on-chain nullifier
                        set, stale roots block replay.
                    </p>
                    <div class="rounded-2xl border border-rose-300/25 bg-rose-300/5 px-5 py-4 font-mono text-xs leading-relaxed text-rose-200/90">
                        testnet only · 1-of-1 trusted setup · no audits yet · /ceremony is the path to mainnet
                    </div>
                </div>
            </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════ -->
        <!-- 02 · SHIELDED ADDRESSES (survey)                           -->
        <!-- ══════════════════════════════════════════════════════════ -->
        <section id="stealth" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-10 px-6 pb-28 sm:pb-36">
            <div class="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr]">
                <div class="reveal">
                    <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-cyan-300/80">02 · shielded addresses</p>
                    <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                        ECDH Stealth<br />Addresses
                    </h2>
                    <div class="mt-6 flex flex-wrap gap-2">
                        <span class="badge badge-live">external implementation</span>
                        <span class="badge badge-mid">no new opcodes</span>
                    </div>
                </div>

                <div class="reveal space-y-6 text-base leading-relaxed text-slate-300/90 sm:text-lg" style="transition-delay: 0.12s">
                    <p>
                        Shielded addresses solve a different layer of the stack: not the amount, but
                        the <strong class="font-semibold text-white">recipient</strong>. An ECDH stealth
                        address lets a payer derive a fresh one-time P2PKH address per payment that only
                        the recipient can find and spend — <strong class="font-semibold text-white">with no
                        new opcodes, no script changes, and no way for an observer to tell the output
                        is special</strong>.
                    </p>
                    <p>
                        A live BCH implementation was published and reviewed on Bitcoin Cash Research:
                        the sender derives a one-time key from the recipient's scan + spend public keys
                        and the transaction's own outpoint as a nonce; the receiver scans the chain with
                        the scan key, computes the same shared secret from each transaction's public key,
                        and matches outputs. We survey it here and link the source — <strong class="font-semibold text-white">it is not our
                        implementation, and we claim no credit for it</strong>.
                    </p>
                </div>
            </div>

            <div class="mt-12 grid gap-6 lg:grid-cols-2">
                <!-- Scheme facts (cited) -->
                <div class="fact-card reveal">
                    <div class="flex items-center justify-between gap-3">
                        <h4 class="font-mono text-sm text-cyan-300">the scheme, as implemented</h4>
                        <span class="badge badge-mid">cited · topic 1773</span>
                    </div>
                    <dl class="mt-4 space-y-2.5 font-mono text-[0.72rem] leading-relaxed">
                        <div v-for="f in STEALTH_FACTS" :key="f.k" class="flex gap-3">
                            <dt class="w-20 shrink-0 uppercase tracking-widest text-slate-600">{{ f.k }}</dt>
                            <dd class="break-all text-slate-300">{{ f.v }}</dd>
                        </div>
                    </dl>
                    <div class="mt-4 flex flex-wrap gap-3 font-mono text-[0.68rem]">
                        <a href="https://bitcoincashresearch.org/t/ecdh-stealth-addresses-on-bitcoin-cash-implementation-code/1773" target="_blank" rel="noopener" class="src-link">implementation report ↗</a>
                        <a href="https://github.com/00-Protocol/00-Wallet" target="_blank" rel="noopener" class="src-link">00-Wallet source ↗</a>
                    </div>
                </div>

                <!-- Relation to our pool -->
                <div class="fact-card reveal" style="transition-delay: 0.12s">
                    <div class="flex items-center justify-between gap-3">
                        <h4 class="font-mono text-sm text-lime-300">where it meets the pool</h4>
                        <span class="badge badge-done">design direction</span>
                    </div>
                    <p class="mt-4 text-sm leading-relaxed text-slate-400">
                        Pool notes already commit to an owner public key — the commitment is
                        <code class="text-cyan-200">Poseidon(value, ownerPub, rho, r)</code>. A stealth-derived
                        one-time key is a natural fit for <code class="text-cyan-200">ownerPub</code>: a payer could
                        route value to a recipient's note without ever learning a reusable address,
                        and the pool's receiver-detection design (encrypted tags + trial decryption)
                        composes with stealth scanning rather than competing with it.
                    </p>
                    <p class="mt-3 text-sm leading-relaxed text-slate-400">
                        Status: this integration is a <strong class="text-white">design direction, not built yet</strong>.
                        Open questions: derivation inside the note protocol vs. at the wallet layer,
                        and the scan UX for note detection. Tracked as follow-up research on this page.
                    </p>
                    <div class="mt-4 flex flex-wrap gap-3 font-mono text-[0.68rem]">
                        <a href="https://bitcoincashresearch.org/t/silent-reusable-payment-addresses-srpa/1637" target="_blank" rel="noopener" class="src-link">related: SRPA thread ↗</a>
                    </div>
                </div>
            </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════ -->
        <!-- 03 · COINJOIN (technique)                                  -->
        <!-- ══════════════════════════════════════════════════════════ -->
        <section id="coinjoin" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-10 px-6 pb-28 sm:pb-36">
            <div class="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr]">
                <div class="reveal">
                    <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-violet-300/80">03 · coinjoin</p>
                    <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                        CoinJoin
                    </h2>
                    <div class="mt-6 flex flex-wrap gap-2">
                        <span class="badge badge-mid">the technique</span>
                        <span class="badge badge-done">on BCH today</span>
                    </div>
                </div>

                <div class="reveal space-y-6 text-base leading-relaxed text-slate-300/90 sm:text-lg" style="transition-delay: 0.12s">
                    <p>
                        A CoinJoin is a <strong class="font-semibold text-white">collaborative transaction</strong>:
                        several parties combine their inputs and outputs into one transaction so that
                        outside observers cannot determine which input funded which output. The link
                        between sender and receiver is broken by ambiguity, not by cryptography.
                    </p>
                    <p>
                        On Bitcoin Cash, this technique is <strong class="font-semibold text-white">live today</strong>
                        through CashFusion — see the next section for the implementation and its
                        adoption history.
                    </p>
                    <div class="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm leading-relaxed text-slate-400">
                        <strong class="text-white">Where it ends:</strong> CoinJoin obscures the input-to-output
                        mapping, but amounts remain visible on-chain, and privacy rests on
                        heuristic resistance. The shielded pool (topic 01) goes further: amounts,
                        owners and history are hidden inside zero-knowledge proofs. The two
                        approaches compose — CoinJoin for transparent BCH, the pool for shielded balances.
                    </div>
                </div>
            </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════ -->
        <!-- 04 · CASHFUSION (survey)                                   -->
        <!-- ══════════════════════════════════════════════════════════ -->
        <section id="fusion" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-10 px-6 pb-28 sm:pb-36">
            <div class="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr]">
                <div class="reveal">
                    <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-violet-300/80">04 · cashfusion</p>
                    <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                        CashFusion
                    </h2>
                    <div class="mt-6 flex flex-wrap gap-2">
                        <span class="badge badge-done">live on BCH</span>
                        <span class="badge badge-mid">survey — third-party work</span>
                    </div>
                </div>

                <div class="reveal space-y-6 text-base leading-relaxed text-slate-300/90 sm:text-lg" style="transition-delay: 0.12s">
                    <p>
                        CashFusion is Bitcoin Cash's CoinJoin-style mixing tool. Its distinguishing
                        fact is <strong class="font-semibold text-white">measured adoption</strong>: a widely-cited
                        2022 forum analysis reports that <strong class="font-semibold text-white">94% of all BCH
                        transacted since July 2020 descends from a CashFusion transaction</strong>
                        <span class="font-mono text-xs text-slate-500">[cited · third-party analysis]</span>.
                    </p>
                    <p>
                        The work is also <strong class="font-semibold text-white">under active scrutiny</strong>: a
                        standing red-team discussion on the research forum, ongoing UX/tech improvement
                        threads, and a public fusion-statistics dashboard. We survey and link this work
                        — it belongs to its authors; our contribution is the shielded pool layer above it.
                    </p>
                </div>
            </div>

            <div class="mt-12 grid gap-6 md:grid-cols-3">
                <a href="https://bitcoincashresearch.org/t/94-percent-of-all-bch-transacted-since-july-2020-is-now-a-descendant-of-a-cashfusion-transaction/752" target="_blank" rel="noopener" class="doc-card reveal">
                    <h4 class="font-mono text-sm text-lime-300">the 94% analysis</h4>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">"94 percent of all BCH transacted since July 2020 is now a descendant of a CashFusion transaction" — the adoption record, third-party.</p>
                </a>
                <a href="https://bitcoincashresearch.org/t/is-there-interest-in-a-red-team-analysis-of-cashfusion/525" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.08s">
                    <h4 class="font-mono text-sm text-cyan-300">red-team discussion</h4>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">"Is there interest in a Red Team analysis of CashFusion?" — the thread where the scheme gets attacked instead of praised.</p>
                </a>
                <a href="https://fusionstats.redteam.cash/" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.16s">
                    <h4 class="font-mono text-sm text-violet-300">fusion statistics</h4>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">Live fusion-statistics dashboard (fusionstats.redteam.cash) and its open-source app (Rucknium/CashFusionStats on GitHub).</p>
                </a>
            </div>
        </section>

        <!-- ── Related discussions ── -->
        <section id="threads" class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-cyan-300/80">05 · conversations</p>
                <h3 class="mt-3 font-display text-[clamp(1.5rem,3.5vw,2.4rem)] font-bold leading-[1.08] text-white">Related Discussions</h3>
                <p class="mt-2 font-mono text-xs text-slate-500">bitcoincashresearch.org threads this research sits inside</p>
            </div>

            <div class="reveal mt-10 divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
                <a v-for="t in THREADS" :key="t.id" :href="'https://bitcoincashresearch.org/t/' + t.slug + '/' + t.id" target="_blank" rel="noopener" class="thread-row">
                    <span class="font-mono text-[0.62rem] uppercase tracking-widest text-slate-600">{{ t.date }}</span>
                    <span class="flex-1 text-sm text-slate-300 transition-colors">{{ t.title }}</span>
                    <span class="font-mono text-xs text-cyan-300/70">thread ↗</span>
                </a>
            </div>
        </section>

        <!-- ── Design docs ── -->
        <section id="docs" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-lime-300/80">06 · go deeper</p>
                <h3 class="mt-3 font-display text-[clamp(1.5rem,3.5vw,2.4rem)] font-bold leading-[1.08] text-white">Design Docs</h3>
            </div>

            <div class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <a href="https://github.com/APECSdev/pusd-shielded-pool/blob/master/CIRCUIT-DESIGN.md" target="_blank" rel="noopener" class="doc-card reveal">
                    <h4 class="font-mono text-sm text-lime-300">CIRCUIT-DESIGN.md</h4>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">The Groth16 joinsplit: note commitments, nullifiers, the actionHash binding, and the public-input packing.</p>
                </a>
                <a href="https://github.com/APECSdev/pusd-shielded-pool/blob/master/COVENANT-DESIGN.md" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.08s">
                    <h4 class="font-mono text-sm text-cyan-300">COVENANT-DESIGN.md</h4>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">The CashScript pool covenant: state machine, action-hash recomputation, holdings path, unshield payout.</p>
                </a>
                <a href="https://github.com/APECSdev/pusd-shielded-pool/blob/master/GENERALIZED-SHIELDING.md" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.16s">
                    <h4 class="font-mono text-sm text-violet-300">GENERALIZED-SHIELDING.md</h4>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">Why one category is a deployment choice, not a limit — per-asset pools now, one multi-asset pool next.</p>
                </a>
                <a href="https://github.com/APECSdev/pusd-shielded-pool/blob/master/CHIPNET.md" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.24s">
                    <h4 class="font-mono text-sm text-lime-300">CHIPNET.md</h4>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">The build record and on-chain worked examples: deployment, SHIELD / TRANSFER / UNSHIELD, verifier wiring.</p>
                </a>
                <a href="https://github.com/APECSdev/hushyourmoney/blob/master/POOL-DEPLOYMENT.md" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.32s">
                    <h4 class="font-mono text-sm text-cyan-300">POOL-DEPLOYMENT.md</h4>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">The deployment runbook — the full Path A lifecycle executed end-to-end on chipnet (Gate 3).</p>
                </a>
                <a href="https://github.com/APECSdev/hushyourmoney/blob/master/pool-registry.json" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.4s">
                    <h4 class="font-mono text-sm text-violet-300">pool-registry.json</h4>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">The machine-readable registry: category ↔ covenant address ↔ tree root ↔ first operations.</p>
                </a>
            </div>
        </section>

        <!-- ── FAQ ── -->
        <section id="faq" class="relative z-10 mx-auto w-full max-w-4xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-lime-300/80">07 · questions</p>
                <h3 class="mt-3 font-display text-[clamp(1.5rem,3.5vw,2.4rem)] font-bold leading-[1.08] text-white">Reviewer FAQ</h3>
            </div>

            <div class="mt-10 space-y-4">
                <details class="faq-card reveal">
                    <summary>Does this need a fork or a new opcode?</summary>
                    <p>
                        No. The Groth16 verifier runs as an ordinary script inside one standard
                        transaction on the BCH 2026 VM, using CashTokens and P2SH32 — all shipped
                        features. The measured verifier transaction is 35,626 bytes. That is the
                        point of the exercise: the existence proof came before any proposal.
                    </p>
                </details>

                <details class="faq-card reveal">
                    <summary>Can the pool convert asset A into asset B?</summary>
                    <p>
                        No. Value conservation is enforced per category inside the circuit. In the
                        Gate 4 negative test, moving a single unit across categories was rejected
                        at witness generation. The covenant additionally enforces per-category
                        holdings continuity on-chain.
                    </p>
                </details>

                <details class="faq-card reveal">
                    <summary>How do stealth addresses and the pool relate?</summary>
                    <p>
                        They are complementary layers. Stealth addresses give receiver
                        unlinkability at the address level while amounts stay public; the pool
                        hides amounts, owners and history behind zero-knowledge proofs. Pool
                        notes commit to an owner public key, so a stealth-derived one-time key
                        is a natural fit — routing value into someone's note without a reusable
                        address. That integration is a design direction, not built yet.
                    </p>
                </details>

                <details class="faq-card reveal">
                    <summary>What do you trust today?</summary>
                    <p>
                        Every chipnet deployment used a disclosed, single-party (1-of-1) trusted
                        setup — deliberately fine for a testnet and explicitly not for mainnet.
                        Mainnet is gated on a multi-party Powers-of-Tau ceremony. That machine is
                        being designed in public: see <NuxtLink to="/ceremony" class="src-link">/ceremony</NuxtLink>.
                    </p>
                </details>

                <details class="faq-card reveal">
                    <summary>Why not a CHIP first?</summary>
                    <p>
                        Because we could build it first. The pool needs no consensus change, so
                        the right order was: build, measure, publish evidence — then discuss what
                        (if anything) the protocol should standardize. The measured op-costs and
                        verifier sizes are inputs for exactly those discussions.
                    </p>
                </details>
            </div>
        </section>

        <!-- ── CTA ── -->
        <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-28 text-center sm:pb-36">
            <div class="cta-glow reveal relative overflow-hidden rounded-[2rem] border border-lime-300/20 bg-gradient-to-br from-lime-300/10 via-transparent to-violet-300/10 px-8 py-16 shadow-[0_24px_80px_-40px_rgba(190,242,100,0.35)]">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-lime-300/80">gate 7 · the last gate</p>
                <h2 class="mt-6 font-display text-[clamp(1.8rem,5vw,3.6rem)] font-extrabold leading-tight text-white">
                    Before mainnet,<br /><span class="text-gradient">break the waste</span>
                </h2>
                <p class="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-300/90">
                    The trusted-setup ceremony is the one thing standing between chipnet and mainnet.
                    Bring your entropy — one honest participant is all it takes.
                </p>

                <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <NuxtLink to="/ceremony" class="btn-primary btn-pulse">
                        The Hush Ceremony
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                    </NuxtLink>

                    <!-- TODO: replace href with the live bitcoincashresearch.org topic URL once the flagship post is published -->
                    <a href="#" class="btn-ghost opacity-60" title="discussion thread link goes live with the publication" @click.prevent>
                        Discuss on BCH Research — soon
                    </a>
                </div>

                <p class="mt-6 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-slate-600">[ discussion link pending publication ]</p>
            </div>
        </section>

        <!-- ── Footer (link parity with site) ── -->
        <Footer />

    </main>
</template>

<style scoped>
/* ── Hero entrance ───────────────────────────────────────────────── */
.animate-rise {
    opacity: 0;
    transform: translateY(30px);
    animation: rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes rise { to { opacity: 1; transform: none; } }

.text-gradient {
    background: linear-gradient(92deg, #bef264 5%, #67e8f9 55%, #c48dff 95%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

/* ── Buttons ─────────────────────────────────────────────────────── */
.btn-primary {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 1rem 2rem;
    border-radius: 9999px;
    background: linear-gradient(92deg, #bef264, #a3e635);
    color: #131a05;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s;
}
.btn-primary:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 18px 50px -12px rgba(190, 242, 100, 0.45);
}
.btn-primary svg { transition: transform 0.35s; }
.btn-primary:hover svg { transform: translateX(4px); }

.btn-pulse::after {
    content: "";
    position: absolute;
    inset: -4px;
    border-radius: 9999px;
    border: 2px solid rgba(190, 242, 100, 0.45);
    animation: pulse-ring 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite;
    pointer-events: none;
}
@keyframes pulse-ring {
    0%   { transform: scale(0.97); opacity: 0.9; }
    100% { transform: scale(1.14); opacity: 0; }
}

.btn-ghost {
    display: inline-flex;
    align-items: center;
    padding: 1rem 2rem;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: rgba(226, 232, 240, 0.85);
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.78rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.35s, background 0.35s;
}
.btn-ghost:hover {
    transform: translateY(-3px);
    border-color: rgba(103, 232, 249, 0.5);
    background: rgba(103, 232, 249, 0.06);
}

/* ── Status chips (hero) ─────────────────────────────────────────── */
.status-chip {
    display: inline-flex;
    align-items: center;
    border-radius: 9999px;
    border: 1px solid;
    padding: 0.45rem 1rem;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.62rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
}
.status-lime   { border-color: rgba(190, 242, 100, 0.4);  color: #bef264; background: rgba(190, 242, 100, 0.06); }
.status-cyan   { border-color: rgba(103, 232, 249, 0.4);  color: #67e8f9; background: rgba(103, 232, 249, 0.06); }
.status-violet { border-color: rgba(196, 141, 255, 0.4);  color: #c48dff; background: rgba(196, 141, 255, 0.06); }

/* ── Topic cards (index) ─────────────────────────────────────────── */
.topic-card {
    display: flex;
    flex-direction: column;
    border-radius: 1.4rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    padding: 1.6rem;
    backdrop-filter: blur(6px);
    text-decoration: none;
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.4s, box-shadow 0.4s;
}
.topic-card:hover {
    transform: translateY(-6px);
    border-color: rgba(190, 242, 100, 0.35);
    box-shadow: 0 24px 60px -24px rgba(190, 242, 100, 0.22);
}
.topic-num {
    display: inline-grid;
    place-items: center;
    height: 2.4rem;
    width: 2.4rem;
    border-radius: 0.8rem;
    border: 1px solid;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.78rem;
    font-weight: 700;
}
.topic-lime   { border-color: rgba(190, 242, 100, 0.45); color: #bef264; background: rgba(190, 242, 100, 0.07); }
.topic-cyan   { border-color: rgba(103, 232, 249, 0.45); color: #67e8f9; background: rgba(103, 232, 249, 0.07); }
.topic-violet { border-color: rgba(196, 141, 255, 0.45); color: #c48dff; background: rgba(196, 141, 255, 0.07); }
.topic-white  { border-color: rgba(226, 232, 240, 0.4);  color: #e2e8f0; background: rgba(226, 232, 240, 0.06); }
.topic-go {
    margin-top: auto;
    padding-top: 1rem;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.62rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(148, 163, 184, 0.7);
    transition: color 0.3s;
}
.topic-card:hover .topic-go { color: #bef264; }

.badge {
    border-radius: 9999px;
    border: 1px solid;
    padding: 0.15rem 0.65rem;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.6rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    white-space: nowrap;
}
.badge-done { border-color: rgba(190, 242, 100, 0.4); color: #bef264; }
.badge-live { border-color: rgba(103, 232, 249, 0.5); color: #67e8f9; }
.badge-mid  { border-color: rgba(196, 141, 255, 0.4); color: #c48dff; }
.badge-wait { border-color: rgba(148, 163, 184, 0.3); color: rgba(148, 163, 184, 0.8); }

/* ── Stat cards ──────────────────────────────────────────────────── */
.stat-card {
    border-radius: 1.2rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    padding: 1.4rem;
    backdrop-filter: blur(6px);
    text-align: center;
    transition: border-color 0.4s, box-shadow 0.4s;
}
.stat-card:hover {
    border-color: rgba(190, 242, 100, 0.3);
    box-shadow: 0 20px 50px -28px rgba(190, 242, 100, 0.25);
}

/* ── Step cards ──────────────────────────────────────────────────── */
.step-card {
    border-radius: 1.4rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    padding: 1.75rem;
    backdrop-filter: blur(6px);
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.4s, box-shadow 0.4s;
}
.step-card:hover {
    transform: translateY(-6px);
    border-color: rgba(190, 242, 100, 0.35);
    box-shadow: 0 24px 60px -24px rgba(190, 242, 100, 0.22);
}
.step-num {
    display: grid;
    place-items: center;
    height: 2.6rem;
    width: 2.6rem;
    border-radius: 0.9rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    font-family: "Space Mono", ui-monospace, monospace;
    font-weight: 700;
}

/* ── Data table ──────────────────────────────────────────────────── */
.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.82rem;
    text-align: left;
}
.data-table th {
    padding: 0.9rem 1.1rem;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.6rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(148, 163, 184, 0.75);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    white-space: nowrap;
}
.data-table td {
    padding: 0.85rem 1.1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    vertical-align: top;
    line-height: 1.6;
}
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr { transition: background 0.3s; }
.data-table tbody tr:hover { background: rgba(190, 242, 100, 0.035); }

.src-link {
    color: rgba(103, 232, 249, 0.85);
    text-decoration: none;
    border-bottom: 1px dotted rgba(103, 232, 249, 0.35);
    transition: color 0.3s, border-color 0.3s;
}
.src-link:hover { color: #67e8f9; border-color: rgba(103, 232, 249, 0.8); }

/* ── Gate cards ──────────────────────────────────────────────────── */
.gate-card {
    border-radius: 1.2rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    padding: 1.4rem 1.6rem;
    backdrop-filter: blur(6px);
    transition: border-color 0.4s, box-shadow 0.4s;
}
.gate-card:hover {
    border-color: rgba(103, 232, 249, 0.3);
    box-shadow: 0 20px 50px -28px rgba(103, 232, 249, 0.22);
}
.gate-chip {
    display: inline-grid;
    place-items: center;
    height: 2rem;
    min-width: 3.2rem;
    border-radius: 0.7rem;
    border: 1px solid;
    padding: 0 0.5rem;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.14em;
}
.gate-done { border-color: rgba(190, 242, 100, 0.45); color: #bef264; background: rgba(190, 242, 100, 0.07); }
.gate-live { border-color: rgba(103, 232, 249, 0.5);  color: #67e8f9; background: rgba(103, 232, 249, 0.07); }
.gate-wait { border-color: rgba(148, 163, 184, 0.35); color: rgba(148, 163, 184, 0.85); background: rgba(148, 163, 184, 0.06); }

/* ── Pool cards ──────────────────────────────────────────────────── */
.pool-card {
    border-radius: 1.4rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    padding: 1.6rem 1.7rem;
    backdrop-filter: blur(6px);
    transition: border-color 0.4s, box-shadow 0.4s;
}
.pool-card:hover {
    border-color: rgba(190, 242, 100, 0.3);
    box-shadow: 0 20px 50px -28px rgba(190, 242, 100, 0.22);
}

/* ── Fact cards (stealth) ────────────────────────────────────────── */
.fact-card {
    border-radius: 1.4rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    padding: 1.6rem 1.7rem;
    backdrop-filter: blur(6px);
    transition: border-color 0.4s, box-shadow 0.4s;
}
.fact-card:hover {
    border-color: rgba(103, 232, 249, 0.3);
    box-shadow: 0 20px 50px -28px rgba(103, 232, 249, 0.22);
}

/* ── Thread rows ─────────────────────────────────────────────────── */
.thread-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.9rem 1.2rem;
    text-decoration: none;
    transition: background 0.3s;
}
.thread-row:first-child { border-radius: 2rem 2rem 0 0; }
.thread-row:last-child  { border-radius: 0 0 2rem 2rem; }
.thread-row:hover { background: rgba(103, 232, 249, 0.045); }

/* ── Doc cards ───────────────────────────────────────────────────── */
.doc-card {
    display: block;
    border-radius: 1.4rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    padding: 1.6rem;
    backdrop-filter: blur(6px);
    text-decoration: none;
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.4s, box-shadow 0.4s;
}
.doc-card:hover {
    transform: translateY(-6px);
    border-color: rgba(103, 232, 249, 0.35);
    box-shadow: 0 24px 60px -24px rgba(103, 232, 249, 0.2);
}

/* ── FAQ ─────────────────────────────────────────────────────────── */
.faq-card {
    border-radius: 1.1rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    transition: border-color 0.4s, background 0.4s;
}
.faq-card[open] {
    border-color: rgba(103, 232, 249, 0.35);
    background: rgba(103, 232, 249, 0.04);
}
.faq-card summary {
    cursor: pointer;
    list-style: none;
    padding: 1.1rem 1.4rem;
    font-weight: 600;
    color: rgba(241, 245, 249, 0.95);
}
.faq-card summary::-webkit-details-marker { display: none; }
.faq-card summary::after {
    content: "+";
    float: right;
    font-family: "Space Mono", ui-monospace, monospace;
    color: #67e8f9;
    transition: transform 0.3s;
}
.faq-card[open] summary::after { content: "–"; }
.faq-card p { padding: 0 1.4rem 1.2rem; color: rgba(203, 213, 225, 0.85); line-height: 1.75; }
.faq-card p a { text-decoration: none; }

/* ── Scroll reveal ───────────────────────────────────────────────── */
.reveal {
    opacity: 0;
    transform: translateY(26px);
    transition: opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1), transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal.is-visible { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
    .btn-pulse::after, .animate-rise, .reveal { animation: none !important; }
    .animate-rise, .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
}
</style>
