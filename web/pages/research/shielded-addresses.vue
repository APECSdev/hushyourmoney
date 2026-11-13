<!-- web/pages/research/shielded-addresses.vue — topic 02 (survey of external ECDH stealth work) -->

<script setup lang="ts">
/* Shared shell + styles come from layouts/research.vue (user refactor 2026-11-13). */
definePageMeta({
    layout: 'research',
})

/* OpenGraph + Twitter + canonical (shared composable; per-page poster). */
useOg({
    title: `Shielded Addresses — Hush Your Money`,
    description: `ECDH stealth addresses on Bitcoin Cash: one-time P2PKH addresses derived per payment — receiver privacy with no new opcodes, no script changes. Survey of the live external implementation and how it composes with the shielded pool.`,
    path: '/research/shielded-addresses',
    image: '/posters/research-shielded-addresses.jpg',
    type: 'article',
    imageAlt: `Shielded Addresses — ECDH one-time addresses on standard P2PKH, survey of external work`,
})

/* Scroll-reveal (shared composable). */
useReveal()

/* ── Scheme facts (cited: topic 1773 + 00-Wallet repo) ───────────── */
const STEALTH_FACTS = [
    { k: 'keys', v: 'm/44\'/145\'/0\'/2\'/0 → scan (a, A) · …/2\'/1 → spend (b, B) — same BIP44 seed' },
    { k: 'tweak', v: 'c = SHA256( SHA256(ECDH_x) ‖ outpoint ) — unique nonce per transaction' },
    { k: 'address', v: 'P_stealth = B + c·G → RIPEMD160(SHA256(P_stealth)) — a standard P2PKH address' },
    { k: 'scan', v: 'receiver computes ECDH(a, sender_pub) per transaction, derives the expected address, matches outputs' },
]
</script>

<template>

    <!-- ── Topic hero ── -->
        <section class="relative z-10 mx-auto flex min-h-[72vh] w-full max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-14 text-center">

            <NuxtLink to="/research" class="crumb animate-rise" style="animation-delay: 0.04s">
                research <span class="sep">/</span> shielded-addresses
            </NuxtLink>

            <p class="animate-rise mt-6 font-mono text-[0.65rem] uppercase tracking-[0.5em] text-cyan-300/80 sm:text-xs" style="animation-delay: 0.1s">
                topic 02 · receiver privacy · survey of external work
            </p>

            <h1 class="animate-rise mt-6 font-display text-[clamp(2.4rem,8vw,6rem)] font-extrabold leading-[1.04] tracking-tight text-white" style="animation-delay: 0.2s">
                Shielded<br />
                <span class="text-gradient">Addresses</span>
            </h1>

            <p class="animate-rise mt-6 font-mono text-[clamp(1rem,2.8vw,1.5rem)] italic text-cyan-200/90" style="animation-delay: 0.32s">
                Hide who you pay — not just what you hold.
            </p>

            <p class="animate-rise mt-8 max-w-2xl text-base leading-relaxed text-slate-300/90 sm:text-lg" style="animation-delay: 0.42s">
                An ECDH stealth address lets a payer derive a fresh one-time P2PKH address per
                payment that only the recipient can find and spend — <strong class="font-semibold text-white">with no
                new opcodes, no script changes, and no way for an observer to tell the output
                is special</strong>.
            </p>

            <div class="animate-rise mt-8 flex flex-wrap items-center justify-center gap-3" style="animation-delay: 0.5s">
                <span class="status-chip status-cyan">external implementation</span>
                <span class="status-chip status-lime">no new opcodes</span>
                <span class="status-chip status-violet">composes with the pool</span>
            </div>
        </section>

        <!-- ── The survey ── -->
        <section class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr]">
                <div class="reveal">
                    <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-cyan-300/80">02 · the survey</p>
                    <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                        What we're<br />looking at
                    </h2>
                    <div class="mt-6 flex flex-wrap gap-2">
                        <span class="badge badge-live">not our implementation</span>
                        <span class="badge badge-mid">published + reviewed</span>
                    </div>
                </div>

                <div class="reveal space-y-6 text-base leading-relaxed text-slate-300/90 sm:text-lg" style="transition-delay: 0.12s">
                    <p>
                        Shielded addresses solve a different layer of the stack: not the amount, but
                        the <strong class="font-semibold text-white">recipient</strong>. A live BCH implementation
                        was published and reviewed on Bitcoin Cash Research: the sender derives a
                        one-time key from the recipient's scan + spend public keys and the transaction's
                        own outpoint as a nonce; the receiver scans the chain with the scan key,
                        computes the same shared secret from each transaction's public key, and matches
                        outputs.
                    </p>
                    <p>
                        We survey it here and link the source — <strong class="font-semibold text-white">it is not our
                        implementation, and we claim no credit for it</strong>. Our contribution is the
                        analysis of how it composes with the shielded pool (below).
                    </p>
                </div>
            </div>

            <div class="mt-12 grid gap-6 lg:grid-cols-2">
                <!-- Scheme facts (cited) -->
                <div class="fact-card reveal">
                    <div class="flex items-center justify-between gap-3">
                        <h3 class="font-mono text-sm text-cyan-300">the scheme, as implemented</h3>
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
                        <h3 class="font-mono text-sm text-lime-300">where it meets the pool</h3>
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
                        <NuxtLink to="/research/shielded-pool" class="src-link">our pool layer →</NuxtLink>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── Pager ── -->
        <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24">
            <div class="pager reveal">
                <NuxtLink to="/research/shielded-pool" class="pager-link">
                    <span class="pager-dir">← previous</span>
                    <span class="pager-title">The Shielded Pool</span>
                </NuxtLink>
                <NuxtLink to="/research/coinjoin" class="pager-link right">
                    <span class="pager-dir">next topic →</span>
                    <span class="pager-title">CoinJoin</span>
                </NuxtLink>
            </div>
        </section>

</template>
