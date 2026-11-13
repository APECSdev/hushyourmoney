<!-- web/pages/research/index.vue — research hub index (topics link to dedicated pages) -->

<script setup lang="ts">
/* Shared shell + styles come from layouts/research.vue (user refactor 2026-11-13). */
definePageMeta({
    layout: 'research',
})

/* OpenGraph + Twitter + canonical (shared composable; per-page poster). */
useOg({
    title: `Research — Hush Your Money`,
    description: `UTXO privacy research hub: the Groth16 shielded pool (built and measured on chipnet), ECDH shielded addresses, CoinJoin and CashFusion. Our numbers are measured; third-party claims are cited.`,
    path: '/research',
    image: '/posters/research.jpg',
    type: 'website',
    imageAlt: `Privacy Research — five layers of the UTXO privacy stack on Hush Your Money`,
})

/* Scroll-reveal (shared composable). */
useReveal()

/* ── Topic index (dedicated pages for SEO — user directive 2026-11-13) ── */
const TOPICS = [
    { n: '01', title: 'The Shielded Pool', blurb: 'Groth16 joinsplit + covenant state machine + full on-chain verifier — built, deployed and measured on chipnet.', chip: 'flagship · deep dive', chipClass: 'topic-lime', badgeClass: 'badge-done', to: '/research/shielded-pool' },
    { n: '02', title: 'Shielded Addresses', blurb: 'ECDH one-time addresses on standard P2PKH — receiver privacy with no new opcodes. External implementation, surveyed here.', chip: 'external · survey', chipClass: 'topic-cyan', badgeClass: 'badge-live', to: '/research/shielded-addresses' },
    { n: '03', title: 'CoinJoin', blurb: 'Collaborative transactions that break the input-to-output link. The base technique — live on BCH through CashFusion.', chip: 'technique', chipClass: 'topic-violet', badgeClass: 'badge-mid', to: '/research/coinjoin' },
    { n: '04', title: 'CashFusion', blurb: 'Bitcoin Cash\'s CoinJoin-style mixing tool, with a real adoption history and an active red-team discussion.', chip: 'live on BCH · survey', chipClass: 'topic-violet', badgeClass: 'badge-mid', to: '/research/cashfusion' },
    { n: '05', title: 'Trusted Setup', blurb: 'The ceremony: a multi-party Powers-of-Tau setup gating any mainnet deployment of the pool.', chip: 'gate 7 · in design', chipClass: 'topic-white', badgeClass: 'badge-wait', to: '/ceremony' },
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
    <!-- ── Hero ── -->
    <section class="relative z-10 mx-auto flex min-h-[88vh] w-full max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-16 text-center">

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
            Five layers of the privacy stack, each with its own dedicated page — from
            zero-knowledge pools to address-level unlinkability and collaborative mixing.
            Our own work — <strong class="font-semibold text-white">the shielded pool</strong> — is
            documented gate-by-gate with every number traceable to an on-chain artifact.
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

            <NuxtLink to="/research/shielded-pool" class="btn-ghost">
                Straight to the Pool
            </NuxtLink>
        </div>

        <div class="animate-rise mt-16 flex items-center gap-3 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-slate-500" style="animation-delay: 0.7s">
            <span class="h-px w-10 bg-slate-600/60"></span>
            our numbers are measured — third-party claims are cited
            <span class="h-px w-10 bg-slate-600/60"></span>
        </div>
    </section>

    <!-- ── 00 · Topic index (dedicated pages) ── -->
    <section id="topics" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
        <div class="reveal text-center">
            <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-lime-300/80">00 · the map</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                Research Topics
            </h2>
        </div>

        <div class="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <template v-for="(t, i) in TOPICS" :key="t.n">
                <NuxtLink :to="t.to" class="topic-card reveal" :style="{ transitionDelay: (i * 0.08) + 's' }">
                    <div class="flex items-center justify-between gap-3">
                        <span class="topic-num" :class="t.chipClass">{{ t.n }}</span>
                        <span class="badge" :class="t.badgeClass">{{ t.chip }}</span>
                    </div>
                    <h3 class="mt-4 font-display text-lg font-bold text-white">{{ t.title }}</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">{{ t.blurb }}</p>
                    <span class="topic-go">explore →</span>
                </NuxtLink>
            </template>
        </div>
    </section>

    <!-- ── Related discussions ── -->
    <section id="threads" class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-28 sm:pb-36">
        <div class="reveal text-center">
            <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-cyan-300/80">05 · conversations</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">Related Discussions</h2>
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
</template>
