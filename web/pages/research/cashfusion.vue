<!-- web/pages/research/cashfusion.vue — topic 04 (survey of BCH's CoinJoin implementation) -->

<script setup lang="ts">
/* Shared shell + styles come from layouts/research.vue (user refactor 2026-11-13). */
definePageMeta({
    layout: 'research',
})

/* OpenGraph + Twitter + canonical (shared composable; per-page poster). */
useOg({
    title: `CashFusion — Hush Your Money`,
    description: `CashFusion: Bitcoin Cash's CoinJoin-style mixing tool, with a measured adoption history (a cited 2022 analysis reports 94% of BCH transacted since July 2020 descends from CashFusion) and an active public red-team discussion.`,
    path: '/research/cashfusion',
    image: '/posters/research-cashfusion.jpg',
    type: 'article',
    imageAlt: `CashFusion — Bitcoin Cash's CoinJoin implementation, live with a measured adoption history`,
})

/* Scroll-reveal (shared composable). */
useReveal()
</script>

<template>

    <!-- ── Topic hero ── -->
        <section class="relative z-10 mx-auto flex min-h-[72vh] w-full max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-14 text-center">

            <NuxtLink to="/research" class="crumb animate-rise" style="animation-delay: 0.04s">
                research <span class="sep">/</span> cashfusion
            </NuxtLink>

            <p class="animate-rise mt-6 font-mono text-[0.65rem] uppercase tracking-[0.5em] text-violet-300/80 sm:text-xs" style="animation-delay: 0.1s">
                topic 04 · the BCH implementation · survey of third-party work
            </p>

            <h1 class="animate-rise mt-6 font-display text-[clamp(2.4rem,8vw,6rem)] font-extrabold leading-[1.04] tracking-tight text-white" style="animation-delay: 0.2s">
                <span class="text-gradient">CashFusion</span>
            </h1>

            <p class="animate-rise mt-6 font-mono text-[clamp(1rem,2.8vw,1.5rem)] italic text-cyan-200/90" style="animation-delay: 0.32s">
                CoinJoin on Bitcoin Cash — with a measured adoption history.
            </p>

            <p class="animate-rise mt-8 max-w-2xl text-base leading-relaxed text-slate-300/90 sm:text-lg" style="animation-delay: 0.42s">
                CashFusion is Bitcoin Cash's CoinJoin-style mixing tool. Its distinguishing fact is
                <strong class="font-semibold text-white">measured adoption</strong>: a widely-cited 2022 forum
                analysis reports that <strong class="font-semibold text-white">94% of all BCH transacted since
                July 2020 descends from a CashFusion transaction</strong>.
            </p>

            <div class="animate-rise mt-8 flex flex-wrap items-center justify-center gap-3" style="animation-delay: 0.5s">
                <span class="status-chip status-lime">live on BCH</span>
                <span class="status-chip status-violet">survey — third-party work</span>
            </div>
        </section>

        <!-- ── Content ── -->
        <section class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-slate-300/90 sm:text-lg">
                <p>
                    <span class="font-mono text-xs text-slate-500">[cited · third-party analysis]</span> —
                    the 94% adoption figure comes from a 2022 Bitcoin Cash Research analysis, linked
                    below. We cite it, we don't own it.
                </p>
                <p>
                    The work is also <strong class="font-semibold text-white">under active scrutiny</strong>: a
                    standing red-team discussion on the research forum, ongoing UX/tech improvement
                    threads, and a public fusion-statistics dashboard. We survey and link this work —
                    it belongs to its authors; our contribution is the shielded-pool layer above it.
                </p>
            </div>

            <div class="mt-12 grid gap-6 md:grid-cols-3">
                <a href="https://bitcoincashresearch.org/t/94-percent-of-all-bch-transacted-since-july-2020-is-now-a-descendant-of-a-cashfusion-transaction/752" target="_blank" rel="noopener" class="doc-card reveal">
                    <h3 class="font-mono text-sm text-lime-300">the 94% analysis</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">"94 percent of all BCH transacted since July 2020 is now a descendant of a CashFusion transaction" — the adoption record, third-party.</p>
                </a>
                <a href="https://bitcoincashresearch.org/t/is-there-interest-in-a-red-team-analysis-of-cashfusion/525" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.08s">
                    <h3 class="font-mono text-sm text-cyan-300">red-team discussion</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">"Is there interest in a Red Team analysis of CashFusion?" — the thread where the scheme gets attacked instead of praised.</p>
                </a>
                <a href="https://fusionstats.redteam.cash/" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.16s">
                    <h3 class="font-mono text-sm text-violet-300">fusion statistics</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-400">Live fusion-statistics dashboard (fusionstats.redteam.cash) and its open-source app (Rucknium/CashFusionStats on GitHub).</p>
                </a>
            </div>
        </section>

        <!-- ── Pager ── -->
        <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24">
            <div class="pager reveal">
                <NuxtLink to="/research/coinjoin" class="pager-link">
                    <span class="pager-dir">← previous</span>
                    <span class="pager-title">CoinJoin</span>
                </NuxtLink>
                <NuxtLink to="/ceremony" class="pager-link right">
                    <span class="pager-dir">next →</span>
                    <span class="pager-title">Trusted Setup · The Hush Ceremony</span>
                </NuxtLink>
            </div>
        </section>

</template>
