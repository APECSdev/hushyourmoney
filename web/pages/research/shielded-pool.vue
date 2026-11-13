<!-- web/pages/research/shielded-pool.vue — topic 01 (flagship deep dive) -->

<script setup lang="ts">
/* Shared shell + styles come from layouts/research.vue (user refactor 2026-11-13). */
definePageMeta({
    layout: 'research',
})

/* OpenGraph + Twitter + canonical (shared composable; per-page poster). */
useOg({
    title: `The Shielded Pool — Hush Your Money`,
    description: `A Groth16 shielded pool for CashTokens — built, deployed and measured on Bitcoin Cash chipnet. 183,472-constraint joinsplit circuit, 2 public inputs, a 35,626-byte on-chain verifier, no consensus changes.`,
    path: '/research/shielded-pool',
    image: '/posters/research-shielded-pool.jpg',
    type: 'article',
    imageAlt: `The Shielded Pool — 183,472 constraints, 2 public inputs, 35,626-byte on-chain verifier, live on chipnet`,
})

/* Scroll-reveal (shared composable). */
useReveal()

/* ── MEASURED NUMBERS ──────────────────────────────────────────────
   Every value below is a live measurement with a recorded source
   (session log / on-chain decode / snarkjs output). No estimates. */
const STATS = [
    { value: '183,472', label: 'constraints · single-asset circuit', tag: 'measured', color: 'text-lime-300' },
    { value: '186,007', label: 'constraints · multi-asset circuit', tag: 'measured', color: 'text-lime-300' },
    { value: '2', label: 'public inputs', tag: 'measured', color: 'text-cyan-300' },
    { value: '35,626 B', label: 'on-chain verifier · one standard tx', tag: 'measured', color: 'text-violet-300' },
    { value: '26/26', label: 'red-team attacks rejected', tag: 'measured', color: 'text-white' },
]

/* ── Measured results table ──────────────────────────────────────── */
const RESULTS = [
    { q: 'Circuit (single-asset)', v: '183,472 constraints · 107 private inputs · 181,959 wires', src: 'snarkjs r1cs info build256/pool.r1cs', href: 'https://github.com/APECSdev/pusd-shielded-pool' },
    { q: 'Public inputs', v: '2 — [merkleRoot, actionHash]', src: 'pool.r1cs + verification_key.json (ic.length = 3)', href: 'https://github.com/APECSdev/pusd-shielded-pool' },
    { q: 'Circuit (multi-asset, variant b)', v: '186,007 constraints (+1.38%) · Poseidon(6) commitments bind the full 256-bit category', src: 'circom 2.2.3 --O2 compile, 2026-11-01 build record', href: 'https://github.com/APECSdev/pusd-shielded-pool' },
    { q: 'On-chain verifier size', v: '35,626 B inside ONE standard transaction', src: 'chipnet on-chain measurement', href: 'https://explorer.selene.cash/tx/b0a488db5b7e9bac07eebc45977523cd0730ddfe078571f2e17135231e30546b?network=chipnet' },
    { q: 'Covenant redeem bytecode', v: '347 B — identical for every asset (category = constructor param)', src: 'decoded from transfer tx input 0 witness', href: 'https://explorer.selene.cash/tx/b0a488db5b7e9bac07eebc45977523cd0730ddfe078571f2e17135231e30546b?network=chipnet' },
    { q: 'Proof generation', v: '16.967 s (183,472) / 17.6 s (186,007) · build runner (hardware spec UNMEASURED)', src: 'snarkjs fullProve, session records', href: null },
    { q: 'Covenant op-cost (Gate 6, input 0)', v: '84,819 / 556,800 budget (15.2%)', src: 'libauth BCH-2026 VM debug on the broadcast tx', href: 'https://explorer.selene.cash/tx/fc585fc9bf6499024c89c73a2bcb945de2ec212fb36f8ffc5acb617b6636912f?network=chipnet' },
    { q: 'Verifier step op-costs (Gate 6)', v: '82.4% – 92.3% of the per-input budget', src: 'libauth BCH-2026 VM debug on the broadcast tx', href: 'https://explorer.selene.cash/tx/fc585fc9bf6499024c89c73a2bcb945de2ec212fb36f8ffc5acb617b6636912f?network=chipnet' },
    { q: 'Pool-op tx size', v: '~36.8 – 37.8 KB per shielded operation', src: 'on-chain transactions', href: 'https://explorer.selene.cash/tx/60fe613ec853043908b8dc83fac8165da5b6b7f0ef3e26a4299fd87560784273?network=chipnet' },
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
        href: 'https://explorer.selene.cash/tx/3e21097c212a3821fa186623eb38b1e785f9fca544e57f3f4562bdd0c6615e78?network=chipnet', hrefLabel: 'tx 3e21097c…5e78',
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
        href: 'https://explorer.selene.cash/tx/f5927a0bb67d4688976f98483828259057bd399522a587e66e3b1099a2ab7426?network=chipnet', hrefLabel: 'tx f5927a0b…7426',
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
        href: 'https://explorer.selene.cash/tx/fc585fc9bf6499024c89c73a2bcb945de2ec212fb36f8ffc5acb617b6636912f?network=chipnet', hrefLabel: 'tx fc585fc9…912f',
        status: 'confirmed',
    },
    {
        gate: 'G6b', title: 'Two-asset lifecycle, one pool',
        result: 'SHIELD A → SHIELD B → TRANSFER → UNSHIELD B on one multi-asset pool; all four ops VM-verified and broadcast 2026-11-10/11.',
        href: 'https://explorer.selene.cash/tx/b7bc81867707fb4ae80e722e81685b9518b21105638eae9014516ec34ca3d28f?network=chipnet', hrefLabel: 'tx b7bc8186…3d8f',
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
/* Explorer: Selene (user directive 2026-11-13 — imaginary.cash is FALLBACK ONLY, never primary). */
const EXPLORER = 'https://explorer.selene.cash/tx/'
const NETQ = '?network=chipnet'
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
</script>

<template>

    <!-- ── Topic hero ── -->
        <section class="relative z-10 mx-auto flex min-h-[78vh] w-full max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-14 text-center">

            <NuxtLink to="/research" class="crumb animate-rise" style="animation-delay: 0.04s">
                research <span class="sep">/</span> shielded-pool
            </NuxtLink>

            <p class="animate-rise mt-6 font-mono text-[0.65rem] uppercase tracking-[0.5em] text-lime-300/80 sm:text-xs" style="animation-delay: 0.1s">
                topic 01 · flagship · zero-knowledge · CashTokens
            </p>

            <h1 class="animate-rise mt-6 font-display text-[clamp(2.4rem,8vw,6rem)] font-extrabold leading-[1.04] tracking-tight text-white" style="animation-delay: 0.2s">
                The Shielded<br />
                <span class="text-gradient">Pool</span>
            </h1>

            <p class="animate-rise mt-6 font-mono text-[clamp(1rem,2.8vw,1.5rem)] italic text-cyan-200/90" style="animation-delay: 0.32s">
                Zero-knowledge payments on the UTXO model — measured, not promised.
            </p>

            <p class="animate-rise mt-8 max-w-2xl text-base leading-relaxed text-slate-300/90 sm:text-lg" style="animation-delay: 0.42s">
                A complete Groth16 shielded pool for CashTokens — note commitments, nullifiers,
                a Merkle tree, a covenant state machine and a full on-chain Groth16 verifier —
                deployed and measured on Bitcoin Cash chipnet. <strong class="font-semibold text-white">It runs
                today</strong>: one standard transaction, one scripting VM, no fork required.
            </p>

            <div class="animate-rise mt-8 flex flex-wrap items-center justify-center gap-3" style="animation-delay: 0.5s">
                <span class="status-chip status-lime">live on chipnet</span>
                <span class="status-chip status-cyan">no consensus changes</span>
                <span class="status-chip status-violet">asset-generic — category is a private witness</span>
            </div>

            <div class="animate-rise mt-10 flex flex-col items-center gap-4 sm:flex-row" style="animation-delay: 0.58s">
                <a href="#evidence" class="btn-primary btn-pulse">
                    Read the Evidence
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                </a>

                <a href="#architecture" class="btn-ghost">
                    How It Works
                </a>
            </div>
        </section>

        <!-- ── Key numbers ── -->
        <section class="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24">
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                <div v-for="(s, i) in STATS" :key="s.label" class="stat-card reveal" :style="{ transitionDelay: (i * 0.08) + 's' }">
                    <div class="font-display text-2xl font-extrabold sm:text-3xl" :class="s.color">{{ s.value }}</div>
                    <div class="mt-2 text-xs uppercase tracking-widest text-slate-500">{{ s.label }}</div>
                    <div class="mt-1 font-mono text-[0.6rem] text-slate-600">[{{ s.tag }}]</div>
                </div>
            </div>
        </section>

        <!-- ── What this is ── -->
        <section class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr]">
                <div class="reveal">
                    <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-lime-300/80">01 · what this is</p>
                    <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                        Payments that<br />leave no trace
                    </h2>
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
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-cyan-300/80">02 · the machine</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">Architecture</h2>
                <p class="mt-3 font-mono text-xs text-slate-500">rendered from the design docs — GENERALIZED-SHIELDING.md / COVENANT-DESIGN.md</p>
            </div>

            <div class="reveal mt-12">
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
                    <h3 class="mt-4 font-display text-lg font-bold text-white">Prove</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-400">
                        The wallet builds the action locally, generates the Groth16 witness
                        and proof (16.967 s measured for the full joinsplit on our build
                        runner) and assembles one transaction.
                    </p>
                </div>

                <div class="step-card reveal" style="transition-delay: 0.12s">
                    <div class="step-num text-cyan-300">2</div>
                    <h3 class="mt-4 font-display text-lg font-bold text-white">Verify</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-400">
                        Sibling script-inputs run the on-chain verifier (35,626 B total);
                        vk_x is recomputed in-script so public inputs can never be forged.
                    </p>
                </div>

                <div class="step-card reveal" style="transition-delay: 0.24s">
                    <div class="step-num text-violet-300">3</div>
                    <h3 class="mt-4 font-display text-lg font-bold text-white">Settle</h3>
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
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-lime-300/80">03 · the numbers</p>
                <h2 class="mt-3 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">Measured Results</h2>
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
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-violet-300/80">04 · the trail</p>
                <h2 class="mt-3 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">Gate-by-Gate Evidence</h2>
                <p class="mt-2 font-mono text-xs text-slate-500">seven launch gates · six passed · one in design</p>
            </div>

            <div class="mt-10 space-y-4">
                <div v-for="(g, i) in GATES" :key="g.gate" class="gate-card reveal" :style="{ transitionDelay: (i * 0.06) + 's' }">
                    <div class="flex flex-wrap items-center gap-3">
                        <span class="gate-chip" :class="g.status === 'confirmed' ? 'gate-done' : g.status === 'in-flight' ? 'gate-live' : 'gate-wait'">{{ g.gate }}</span>
                        <h3 class="font-display text-base font-bold text-white sm:text-lg">{{ g.title }}</h3>
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
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-lime-300/80">05 · on-chain state</p>
                <h2 class="mt-3 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">Live Pools</h2>
                <p class="mt-2 font-mono text-xs text-slate-500">from pool-registry.json · chipnet</p>
            </div>

            <div class="mt-10 grid gap-6 lg:grid-cols-2">
                <div v-for="p in POOLS" :key="p.name" class="pool-card reveal">
                    <div class="flex items-center justify-between gap-3">
                        <h3 class="font-mono text-sm text-lime-300">{{ p.name }}</h3>
                        <span class="badge badge-done">deployed</span>
                    </div>
                    <dl class="mt-4 space-y-2.5 font-mono text-[0.72rem] leading-relaxed">
                        <div class="flex gap-3">
                            <dt class="w-24 shrink-0 uppercase tracking-widest text-slate-600">category</dt>
                            <dd class="break-all text-slate-300"><a :href="EXPLORER + p.catFull + NETQ" target="_blank" rel="noopener" class="src-link">{{ p.cat }}</a></dd>
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
                                <a :href="EXPLORER + p.txFull + NETQ" target="_blank" rel="noopener" class="src-link">{{ p.tx }} ↗</a>
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
                    <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-rose-300/80">06 · posture</p>
                    <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                        Security<br />&amp; Limits
                    </h2>
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

        <!-- ── Design docs ── -->
        <section id="docs" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-cyan-300/80">07 · go deeper</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">Design Docs</h2>
            </div>

            <div class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <a href="https://github.com/APECSdev/pusd-shielded-pool/blob/master/CIRCUIT-DESIGN.md" target="_blank" rel="noopener" class="doc-card reveal">
                    <h3 class="font-mono text-sm text-lime-300">CIRCUIT-DESIGN.md</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">The Groth16 joinsplit: note commitments, nullifiers, the actionHash binding, and the public-input packing.</p>
                </a>
                <a href="https://github.com/APECSdev/pusd-shielded-pool/blob/master/COVENANT-DESIGN.md" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.08s">
                    <h3 class="font-mono text-sm text-cyan-300">COVENANT-DESIGN.md</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">The CashScript pool covenant: state machine, action-hash recomputation, holdings path, unshield payout.</p>
                </a>
                <a href="https://github.com/APECSdev/pusd-shielded-pool/blob/master/GENERALIZED-SHIELDING.md" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.16s">
                    <h3 class="font-mono text-sm text-violet-300">GENERALIZED-SHIELDING.md</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">Why one category is a deployment choice, not a limit — per-asset pools now, one multi-asset pool next.</p>
                </a>
                <a href="https://github.com/APECSdev/pusd-shielded-pool/blob/master/CHIPNET.md" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.24s">
                    <h3 class="font-mono text-sm text-lime-300">CHIPNET.md</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">The build record and on-chain worked examples: deployment, SHIELD / TRANSFER / UNSHIELD, verifier wiring.</p>
                </a>
                <a href="https://github.com/APECSdev/hushyourmoney/blob/master/POOL-DEPLOYMENT.md" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.32s">
                    <h3 class="font-mono text-sm text-cyan-300">POOL-DEPLOYMENT.md</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">The deployment runbook — the full Path A lifecycle executed end-to-end on chipnet (Gate 3).</p>
                </a>
                <a href="https://github.com/APECSdev/hushyourmoney/blob/master/pool-registry.json" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.4s">
                    <h3 class="font-mono text-sm text-violet-300">pool-registry.json</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">The machine-readable registry: category ↔ covenant address ↔ tree root ↔ first operations.</p>
                </a>
            </div>
        </section>

        <!-- ── FAQ ── -->
        <section id="faq" class="relative z-10 mx-auto w-full max-w-4xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-lime-300/80">08 · questions</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">Reviewer FAQ</h2>
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
        <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-20 text-center sm:pb-28">
            <div class="cta-glow reveal relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-lime-300/10 via-transparent to-violet-300/10 px-8 py-16 shadow-[0_24px_80px_-40px_rgba(190,242,100,0.35)]">
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

        <!-- ── Pager ── -->
        <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24">
            <div class="pager reveal">
                <NuxtLink to="/research" class="pager-link">
                    <span class="pager-dir">← all topics</span>
                    <span class="pager-title">Research hub</span>
                </NuxtLink>
                <NuxtLink to="/research/shielded-addresses" class="pager-link right">
                    <span class="pager-dir">next topic →</span>
                    <span class="pager-title">Shielded Addresses</span>
                </NuxtLink>
            </div>
        </section>

</template>
