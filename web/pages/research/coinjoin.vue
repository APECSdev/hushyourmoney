<!-- web/pages/research/coinjoin.vue — topic 03 (the technique) -->

<script setup lang="ts">
/* Shared shell + styles come from layouts/research.vue (user refactor 2026-11-13). */
definePageMeta({
    layout: 'research',
})

/* OpenGraph + Twitter + canonical (shared composable; per-page poster). */
useOg({
    title: `CoinJoin on Bitcoin Cash — Hush Your Money`,
    description: `CoinJoin: collaborative transactions that break the input-to-output link. The base privacy technique — live on Bitcoin Cash today through CashFusion, and one layer below the zero-knowledge shielded pool.`,
    path: '/research/coinjoin',
    image: '/posters/research-coinjoin.jpg',
    type: 'article',
    imageAlt: `CoinJoin on Bitcoin Cash — collaborative transactions, live today through CashFusion`,
})

/* Scroll-reveal (shared composable). */
useReveal()
</script>

<template>

    <!-- ── Topic hero ── -->
        <section class="relative z-10 mx-auto flex min-h-[72vh] w-full max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-14 text-center">

            <NuxtLink to="/research" class="crumb animate-rise" style="animation-delay: 0.04s">
                research <span class="sep">/</span> coinjoin
            </NuxtLink>

            <p class="animate-rise mt-6 font-mono text-[0.65rem] uppercase tracking-[0.5em] text-violet-300/80 sm:text-xs" style="animation-delay: 0.1s">
                topic 03 · the technique
            </p>

            <h1 class="animate-rise mt-6 font-display text-[clamp(2.4rem,8vw,6rem)] font-extrabold leading-[1.04] tracking-tight text-white" style="animation-delay: 0.2s">
                <span class="text-gradient">CoinJoin</span>
            </h1>

            <p class="animate-rise mt-6 font-mono text-[clamp(1rem,2.8vw,1.5rem)] italic text-cyan-200/90" style="animation-delay: 0.32s">
                Privacy by ambiguity — many parties, one transaction, no map.
            </p>

            <p class="animate-rise mt-8 max-w-2xl text-base leading-relaxed text-slate-300/90 sm:text-lg" style="animation-delay: 0.42s">
                A CoinJoin is a <strong class="font-semibold text-white">collaborative transaction</strong>:
                several parties combine their inputs and outputs into one transaction so that
                outside observers cannot determine which input funded which output.
            </p>

            <div class="animate-rise mt-8 flex flex-wrap items-center justify-center gap-3" style="animation-delay: 0.5s">
                <span class="status-chip status-violet">the technique</span>
                <span class="status-chip status-lime">on BCH today</span>
            </div>
        </section>

        <!-- ── Content ── -->
        <section class="relative z-10 mx-auto w-full max-w-4xl px-6 pb-28 sm:pb-36">
            <div class="reveal space-y-6 text-base leading-relaxed text-slate-300/90 sm:text-lg">
                <p>
                    The idea is deliberately simple: if many strangers build one transaction
                    together, the set of possible sender→receiver mappings explodes. An observer
                    sees <em>N</em> inputs and <em>N</em> outputs of similar size — and no honest way
                    to pair them. The link between sender and receiver is broken by
                    <strong class="font-semibold text-white">ambiguity, not by cryptography</strong>.
                </p>
                <p>
                    On Bitcoin Cash, this technique is <strong class="font-semibold text-white">live today</strong>
                    through CashFusion — an implementation with a real adoption history and an
                    active red-team discussion. See the dedicated page for the survey.
                </p>
            </div>

            <div class="reveal mt-12 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-sm leading-relaxed text-slate-400 sm:text-base">
                <strong class="text-white">Where it ends:</strong> CoinJoin obscures the input-to-output
                mapping, but amounts remain visible on-chain, and privacy rests on
                heuristic resistance. The shielded pool goes further: amounts,
                owners and history are hidden inside zero-knowledge proofs. The two
                approaches compose — CoinJoin for transparent BCH, the pool for shielded balances.
                <div class="mt-3 flex flex-wrap gap-3 font-mono text-[0.68rem]">
                    <NuxtLink to="/research/cashfusion" class="src-link">CashFusion — the BCH implementation →</NuxtLink>
                    <NuxtLink to="/research/shielded-pool" class="src-link">the zero-knowledge layer →</NuxtLink>
                </div>
            </div>
        </section>

        <!-- ── Pager ── -->
        <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24">
            <div class="pager reveal">
                <NuxtLink to="/research/shielded-addresses" class="pager-link">
                    <span class="pager-dir">← previous</span>
                    <span class="pager-title">Shielded Addresses</span>
                </NuxtLink>
                <NuxtLink to="/research/cashfusion" class="pager-link right">
                    <span class="pager-dir">next topic →</span>
                    <span class="pager-title">CashFusion</span>
                </NuxtLink>
            </div>
        </section>

</template>
