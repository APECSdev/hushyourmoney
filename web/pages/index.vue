<!-- web/pages/index.vue -->

<script setup lang="ts">
/* NOTE: layout 'fullscreen' initializes the Profile/System stores and System.init(). */
definePageMeta({
    layout: 'fullscreen',
})

/* FAQ copy is rendered visibly below AND mirrored into JSON-LD for search engines. */
const FAQS = [
    {
        q: 'Is Hush Your Money free to use?',
        a: 'Yes. Hush Your Money is free and open-source software. You pay only the network’s own transaction fees — on Bitcoin Cash today those are typically well under one US cent per transaction, even for multi-party shuffle rounds.',
    },
    {
        q: 'Do I need an account, email, or ID to get started?',
        a: 'No. There is no sign-up and nothing to verify. A wallet is generated locally in your browser, and the seed phrase it shows you is the only credential you will ever need. Write it down, keep it safe, and never share it with anyone.',
    },
    {
        q: 'What is the difference between CashShuffle and CashFusion?',
        a: 'Both are decentralized CoinJoin protocols built on the UTXO model, running today on Bitcoin Cash. CashShuffle mixes equal-amount inputs from several participants into one joint transaction, so an observer cannot tell which output belongs to whom. CashFusion generalizes the technique to arbitrary amounts, allowing many small coins to be fused into fewer, larger ones — which makes it practical to obfuscate real-world balances rather than fixed denominations.',
    },
    {
        q: 'Can the Hush Your Money servers steal or freeze my coins?',
        a: 'No. The wallet is fully non-custodial: private keys are created, stored, and used exclusively on your own device. The servers only relay public blockchain data. The shuffle and fusion protocols are likewise designed so that no coordinator or participant ever takes custody of your funds.',
    },
    {
        q: 'Is using CoinJoin privacy software legal?',
        a: 'Financial privacy is a normal, everyday expectation, and CoinJoin is non-custodial software — no third party ever holds your money. Regulation does vary by jurisdiction, so review our legal page and your local laws before relying on any privacy tool.',
    },
    {
        q: 'What assets and networks does Hush Your Money support?',
        a: 'Hush Your Money is a UTXO privacy toolkit: non-custodial CoinJoin shuffling and fusing on Bitcoin Cash today, plus open research into zero-knowledge shielded pools — a next-generation privacy layer for UTXO-based tokens, developed and proven on public test networks.',
    },
]

useHead({
    script: [
        {
            type: 'application/ld+json',
            children: JSON.stringify({
                '@context': 'https://schema.org',
                '@graph': [
                    {
                        '@type': 'WebSite',
                        name: 'Hush Your Money',
                        url: 'https://hushyourmoney.com/',
                        description: 'Free, open-source, non-custodial UTXO privacy toolkit. Spend Privately. Fearlessly!',
                    },
                    {
                        '@type': 'FAQPage',
                        mainEntity: FAQS.map((f) => ({
                            '@type': 'Question',
                            name: f.q,
                            acceptedAnswer: { '@type': 'Answer', text: f.a },
                        })),
                    },
                ],
            }),
        },
    ],
})

/* Scroll-reveal: elements tagged .reveal fade/slide in when they enter the viewport. */
onMounted(() => {
    const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible')
                io.unobserve(entry.target)
            }
        }
    }, { threshold: 0.12 })

    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
})
</script>

<template>
    <main class="relative min-h-screen w-full overflow-x-clip bg-[#060a10] font-sans text-slate-200 antialiased selection:bg-lime-300 selection:text-slate-900">

        <!-- ── Animated aurora backdrop (3 drifting gradient blobs + grid + grain) ── -->
        <div class="aurora" aria-hidden="true">
            <div class="blob blob-1"></div>
            <div class="blob blob-2"></div>
            <div class="blob blob-3"></div>
            <div class="grid-overlay"></div>
            <div class="grain"></div>
        </div>

        <!-- ── Hero ── -->
        <section class="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-6 pb-24 pt-16 text-center">

            <!-- Floating glyph chips (pure CSS motion, decorative) -->
            <div class="glyph glyph-lock float-a" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-6 w-6">
                    <rect x="5" y="10" width="14" height="10" rx="2.5" />
                    <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
                    <circle cx="12" cy="15" r="1.6" fill="currentColor" stroke="none" />
                </svg>
                <span>sealed</span>
            </div>

            <div class="glyph glyph-shuffle float-b" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-6 w-6">
                    <path d="M3 6h4l10 12h4" />
                    <path d="M18 15.5 21 18l-3 2.5" />
                    <path d="M3 18h4l3-3.6" />
                    <path d="M14 9.4 17 6h4" />
                    <path d="M18 3.5 21 6l-3 2.5" />
                </svg>
                <span>shuffled</span>
            </div>

            <div class="glyph glyph-eye float-c" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-6 w-6">
                    <path d="M3 12s3.5-6 9-6 8.5 6 9 6-3.5 6-9 6-8.5-6-9-6Z" />
                    <circle cx="12" cy="12" r="2.6" />
                    <path d="M4 4l16 16" stroke-width="2.2" />
                </svg>
                <span>unseen</span>
            </div>

            <div class="glyph glyph-key float-d" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-6 w-6">
                    <circle cx="8" cy="12" r="4" />
                    <path d="M12 12h9M17 12v4M20 12v3" />
                </svg>
                <span>yours</span>
            </div>

            <p class="animate-rise font-mono text-[0.65rem] uppercase tracking-[0.5em] text-lime-300/80 sm:text-xs" style="animation-delay: 0.05s">
                utxo privacy toolkit · non-custodial
            </p>

            <h1 class="animate-rise mt-6 font-display text-[clamp(2.6rem,10.5vw,8.25rem)] font-extrabold leading-[1.02] tracking-tight text-white" style="animation-delay: 0.18s">
                Hush Your<br />
                <span class="text-gradient">Money</span>
            </h1>

            <p class="animate-rise mt-6 font-mono text-[clamp(1.05rem,3.2vw,2rem)] italic text-cyan-200/90" style="animation-delay: 0.32s">
                Spend Privately. Fearlessly!
            </p>

            <p class="animate-rise mt-8 max-w-2xl text-base leading-relaxed text-slate-300/90 sm:text-lg" style="animation-delay: 0.44s">
                Hush Your Money is a free, open-source
                <strong class="font-semibold text-white">UTXO privacy toolkit</strong>.
                Break the link between your coins and your identity with the battle-tested
                <strong class="font-semibold text-white">CashShuffle</strong> and
                <strong class="font-semibold text-white">CashFusion</strong> CoinJoin protocols —
                right from your browser. No accounts. No custodians. No permission.
            </p>

            <div class="animate-rise mt-10 flex flex-col items-center gap-4 sm:flex-row" style="animation-delay: 0.56s">
                <NuxtLink to="/welcome" class="btn-primary btn-pulse">
                    Launch the Wallet
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                </NuxtLink>

                <NuxtLink to="/readme" class="btn-ghost">
                    Read the Docs
                </NuxtLink>
            </div>

            <div class="animate-rise mt-16 flex items-center gap-3 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-slate-500" style="animation-delay: 0.7s">
                <span class="h-px w-10 bg-slate-600/60"></span>
                scroll to learn why privacy is money
                <span class="h-px w-10 bg-slate-600/60"></span>
            </div>
        </section>

        <!-- ── Marquee strip ── -->
        <div class="relative z-10 border-y border-white/10 bg-white/[0.02] py-4 backdrop-blur-sm" aria-hidden="true">
            <div class="marquee">
                <div class="marquee-track">
                    <span v-for="n in 2" :key="n" class="marquee-seq">
                        CashShuffle <i>✳</i> CashFusion <i>✳</i> CoinJoin <i>✳</i> Zero-Knowledge <i>✳</i>
                        UTXO Privacy <i>✳</i> Non-Custodial <i>✳</i> Open Source <i>✳</i> UTXO Chains <i>✳</i>
                    </span>
                </div>
            </div>
        </div>

        <!-- ── What ── -->
        <section id="what" class="relative z-10 mx-auto w-full max-w-6xl px-6 py-28 sm:py-36">
            <div class="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr]">
                <div class="reveal">
                    <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-lime-300/80">01 · the wallet</p>
                    <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.9rem)] font-bold leading-[1.08] text-white">
                        What is<br />Hush Your Money?
                    </h2>
                </div>

                <div class="reveal space-y-6 text-base leading-relaxed text-slate-300/90 sm:text-lg" style="transition-delay: 0.12s">
                    <p>
                        Hush Your Money is a <strong class="font-semibold text-white">non-custodial web wallet</strong>
                        built for one purpose: making private payments practical on UTXO-based blockchains.
                        Every key is generated and stored on your device, and every transaction is signed locally.
                        Our servers never see your private keys — they simply relay public blockchain data.
                    </p>
                    <p>
                        Under the hood, the wallet speaks the
                        <strong class="font-semibold text-white">CashShuffle</strong> and
                        <strong class="font-semibold text-white">CashFusion</strong> protocols —
                        decentralized CoinJoin implementations that let groups of strangers merge their
                        transactions into one, shattering the transaction graph that chain-analysis
                        firms rely on.
                    </p>
                </div>
            </div>
        </section>

        <!-- ── Why ── -->
        <section id="why" class="relative z-10 border-y border-white/5 bg-white/[0.02]">
            <div class="mx-auto grid w-full max-w-6xl items-start gap-12 px-6 py-28 sm:py-36 lg:grid-cols-[1fr_1.4fr]">
                <div class="reveal">
                    <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-cyan-300/80">02 · the stakes</p>
                    <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.9rem)] font-bold leading-[1.08] text-white">
                        Why financial privacy matters
                    </h2>
                </div>

                <div class="reveal space-y-6 text-base leading-relaxed text-slate-300/90 sm:text-lg" style="transition-delay: 0.12s">
                    <p>
                        Every transaction on a public blockchain is visible to anyone on Earth — forever.
                        Left unprotected, your balances, income, spending habits, and associations are
                        open to data brokers, advertisers, hackers, and anyone else willing to look.
                    </p>
                    <p>
                        Privacy is not about hiding wrongdoing. It is the default state of cash, and cash
                        is the default state of commerce. A currency whose every coin carries a permanent
                        public history is not fully fungible — coins can be treated as “tainted” by their
                        past. Privacy restores the property that makes money work:
                        <strong class="font-semibold text-white">every unit is interchangeable with every other</strong>.
                    </p>
                </div>
            </div>
        </section>

        <!-- ── How ── -->
        <section id="how" class="relative z-10 mx-auto w-full max-w-6xl px-6 py-28 sm:py-36">
            <div class="reveal max-w-3xl">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-violet-300/80">03 · the ritual</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.9rem)] font-bold leading-[1.08] text-white">
                    How it works
                </h2>
                <p class="mt-6 text-base leading-relaxed text-slate-300/90 sm:text-lg">
                    Three steps stand between you and coins with a clean history.
                    No sign-up, no deposit, no waiting room.
                </p>
            </div>

            <div class="mt-14 grid gap-6 md:grid-cols-3">
                <div class="g-card reveal">
                    <p class="font-display text-5xl font-extrabold text-lime-300/25">01</p>
                    <h3 class="mt-4 font-display text-xl font-bold text-white">Create</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-400">
                        Generate a fresh wallet in seconds. Your seed phrase never leaves this
                        device — back it up once, and you alone control your coins, forever.
                    </p>
                </div>

                <div class="g-card reveal" style="transition-delay: 0.1s">
                    <p class="font-display text-5xl font-extrabold text-cyan-300/25">02</p>
                    <h3 class="mt-4 font-display text-xl font-bold text-white">Shuffle &amp; Fuse</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-400">
                        Enter a CashShuffle or CashFusion round and the protocol weaves your coins
                        together with everyone else’s into a single collaborative transaction.
                        Equal-value outputs come out the other side with their histories severed.
                    </p>
                </div>

                <div class="g-card reveal" style="transition-delay: 0.2s">
                    <p class="font-display text-5xl font-extrabold text-violet-300/25">03</p>
                    <h3 class="mt-4 font-display text-xl font-bold text-white">Spend Fearlessly</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-400">
                        Pay anyone, anywhere. The public trail stops at the crowd
                        you shuffled with — analysts see everyone, and therefore no one.
                    </p>
                </div>
            </div>
        </section>

        <!-- ── Features ── -->
        <section id="features" class="relative z-10 border-y border-white/5 bg-white/[0.02]">
            <div class="mx-auto w-full max-w-6xl px-6 py-28 sm:py-36">
                <div class="reveal max-w-3xl">
                    <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-lime-300/80">04 · the difference</p>
                    <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.9rem)] font-bold leading-[1.08] text-white">
                        Built different.<br />Built for privacy.
                    </h2>
                </div>

                <div class="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div class="g-card reveal">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="h-8 w-8 text-lime-300">
                            <rect x="5" y="10" width="14" height="10" rx="2.5" /><path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
                        </svg>
                        <h3 class="mt-4 font-display text-lg font-bold text-white">Zero Custody</h3>
                        <p class="mt-2 text-sm leading-relaxed text-slate-400">
                            Keys are born on your device, live on your device, and never once touch our
                            servers. If we disappeared tomorrow, your coins would not notice.
                        </p>
                    </div>

                    <div class="g-card reveal" style="transition-delay: 0.08s">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="h-8 w-8 text-cyan-300">
                            <path d="M8 4 3 12l5 8M16 4l5 8-5 8M13 3l-2.5 18" />
                        </svg>
                        <h3 class="mt-4 font-display text-lg font-bold text-white">Open Source</h3>
                        <p class="mt-2 text-sm leading-relaxed text-slate-400">
                            Every line of the wallet is public and auditable.
                            Do not trust — <a href="https://github.com/nyusternie/hushyourmoney" target="_blank" rel="noopener" class="text-cyan-300 underline decoration-cyan-300/40 underline-offset-4 hover:decoration-cyan-300">verify</a>.
                        </p>
                    </div>

                    <div class="g-card reveal" style="transition-delay: 0.16s">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="h-8 w-8 text-violet-300">
                            <path d="M3 7h4l4 5-4 5H3" /><path d="M13 7h8" /><path d="M13 17h8" /><path d="M18 4.5 21 7l-3 2.5" /><path d="M18 14.5 21 17l-3 2.5" />
                        </svg>
                        <h3 class="mt-4 font-display text-lg font-bold text-white">CashShuffle &amp; CashFusion</h3>
                        <p class="mt-2 text-sm leading-relaxed text-slate-400">
                            The two reference CoinJoin implementations — engineered so
                            coordinators can neither steal funds nor break your anonymity.
                        </p>
                    </div>

                    <div class="g-card reveal">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="h-8 w-8 text-lime-300">
                            <rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" />
                        </svg>
                        <h3 class="mt-4 font-display text-lg font-bold text-white">Browser-Native</h3>
                        <p class="mt-2 text-sm leading-relaxed text-slate-400">
                            Nothing to install, nothing to update. Open a tab and the latest build of
                            your wallet is already there — or pin it as an app with one tap.
                        </p>
                    </div>

                    <div class="g-card reveal" style="transition-delay: 0.08s">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="h-8 w-8 text-cyan-300">
                            <path d="M12 3 4 7v6c0 4 3.5 6.5 8 8 4.5-1.5 8-4 8-8V7l-8-4Z" /><path d="M9 11.5l2.2 2.5L15.5 9" />
                        </svg>
                        <h3 class="mt-4 font-display text-lg font-bold text-white">ZK Research Lab</h3>
                        <p class="mt-2 text-sm leading-relaxed text-slate-400">
                            Active research into zero-knowledge shielded pools for UTXO assets —
                            proven on public test networks, heading for mainnet once its
                            multi-party ceremony completes.
                        </p>
                    </div>

                    <div class="g-card reveal" style="transition-delay: 0.16s">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="h-8 w-8 text-violet-300">
                            <path d="M6 17a3.5 3.5 0 0 1-.4-7A5 5 0 0 1 15.6 8 4 4 0 0 1 19 16.7" /><path d="M6 17h12" />
                        </svg>
                        <h3 class="mt-4 font-display text-lg font-bold text-white">Decentralized Infra</h3>
                        <p class="mt-2 text-sm leading-relaxed text-slate-400">
                            Hosted on <a href="https://cloud.runonflux.io" target="_blank" rel="noopener" class="text-violet-300 underline decoration-violet-300/40 underline-offset-4 hover:decoration-violet-300">Flux</a>,
                            a community-run cloud — the wallet stays online without depending on any single company.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── FAQ ── -->
        <section id="faq" class="relative z-10 mx-auto w-full max-w-4xl px-6 py-28 sm:py-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-cyan-300/80">05 · the fine print</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.9rem)] font-bold leading-[1.08] text-white">
                    Frequently asked questions
                </h2>
            </div>

            <div class="mt-14 space-y-4">
                <details v-for="(f, i) in FAQS" :key="i" class="faq reveal group" :style="`transition-delay: ${i * 0.06}s`">
                    <summary class="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5">
                        <span class="text-left font-display text-sm font-bold text-white sm:text-base">{{ f.q }}</span>
                        <span class="faq-chevron">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4"><path d="M6 9l6 6 6-6" /></svg>
                        </span>
                    </summary>
                    <p class="px-6 pb-6 text-sm leading-relaxed text-slate-400 sm:text-base">{{ f.a }}</p>
                </details>
            </div>
        </section>

        <!-- ── Closing CTA ── -->
        <section class="relative z-10 px-6 pb-28">
            <div class="reveal relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-lime-300/20 bg-gradient-to-br from-lime-300/10 via-transparent to-cyan-300/10 px-8 py-20 text-center sm:px-16">
                <h2 class="font-display text-[clamp(1.8rem,6vw,4.5rem)] font-extrabold leading-[1.05] text-white">
                    Your money.<br /><span class="text-gradient">Your business.</span>
                </h2>
                <p class="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-300/90 sm:text-lg">
                    Take five minutes to shuffle — and take back a lifetime of financial privacy.
                </p>
                <div class="mt-10 flex justify-center">
                    <NuxtLink to="/welcome" class="btn-primary btn-pulse">
                        Hush Your Money Now
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </NuxtLink>
                </div>
            </div>
        </section>

        <!-- ── Footer (link parity with legacy homepage + github/flux) ── -->
        <footer class="relative z-10 border-t border-white/5 px-6 py-8">
            <div class="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row">
                <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-xs text-slate-500">
                    <NuxtLink to="/readme" class="footer-link">readme</NuxtLink>
                    <span class="text-slate-700">|</span>
                    <NuxtLink to="/legal" class="footer-link">legal</NuxtLink>
                    <span class="text-slate-700">|</span>
                    <NuxtLink to="/sponsors" class="footer-link">sponsors 💗</NuxtLink>
                    <span class="text-slate-700">|</span>
                    <NuxtLink to="/help" class="footer-link">need help?</NuxtLink>
                    <span class="text-slate-700">|</span>
                    <NuxtLink to="/admin" class="footer-link">admin</NuxtLink>
                </div>

                <div class="flex items-center gap-4 font-mono text-xs text-slate-500">
                    <a href="https://github.com/nyusternie/hushyourmoney" target="_blank" rel="noopener" class="footer-link">github</a>
                    <span class="text-slate-700">|</span>
                    <a href="https://cloud.runonflux.io" target="_blank" rel="noopener" class="footer-link">flux cloud</a>
                    <span class="text-slate-700">|</span>
                    <span class="text-slate-600">© Hush Your Money</span>
                </div>
            </div>
        </footer>

    </main>
</template>

<style scoped>
/* ── Aurora backdrop ─────────────────────────────────────────────── */
.aurora {
    position: fixed;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
}
.blob {
    position: absolute;
    border-radius: 9999px;
    filter: blur(90px);
    mix-blend-mode: screen;
}
.blob-1 {
    width: 55vw; height: 55vw;
    top: -22vw; left: -15vw;
    background: radial-gradient(circle at 35% 35%, rgba(190, 242, 100, 0.34), transparent 65%);
    animation: drift-a 24s ease-in-out infinite alternate;
}
.blob-2 {
    width: 48vw; height: 48vw;
    top: 5vh; right: -18vw;
    background: radial-gradient(circle at 60% 40%, rgba(103, 232, 249, 0.26), transparent 65%);
    animation: drift-b 29s ease-in-out infinite alternate;
}
.blob-3 {
    width: 60vw; height: 48vw;
    bottom: -28vw; left: 12vw;
    background: radial-gradient(circle at 50% 60%, rgba(196, 141, 255, 0.22), transparent 65%);
    animation: drift-c 34s ease-in-out infinite alternate;
}
@keyframes drift-a { to { transform: translate(12vw, 14vh) scale(1.18); } }
@keyframes drift-b { to { transform: translate(-14vw, 10vh) scale(0.9) rotate(20deg); } }
@keyframes drift-c { to { transform: translate(8vw, -12vh) scale(1.12); } }

.grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(148, 163, 184, 0.055) 1px, transparent 1px),
        linear-gradient(90deg, rgba(148, 163, 184, 0.055) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(ellipse 90% 70% at 50% 30%, black 25%, transparent 78%);
    -webkit-mask-image: radial-gradient(ellipse 90% 70% at 50% 30%, black 25%, transparent 78%);
}
.grain {
    position: absolute;
    inset: 0;
    opacity: 0.05;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* ── Hero entrance + floating glyphs ─────────────────────────────── */
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

.glyph {
    position: absolute;
    display: none;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.9rem;
    border-radius: 0.9rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(8px);
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.62rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(226, 232, 240, 0.75);
    z-index: 5;
}
@media (min-width: 1024px) { .glyph { display: flex; } }
.glyph-lock    { top: 22%; left: 7%;  color: rgba(190, 242, 100, 0.85); }
.glyph-shuffle { top: 18%; right: 8%; color: rgba(103, 232, 249, 0.85); }
.glyph-eye     { bottom: 26%; left: 10%; color: rgba(196, 141, 255, 0.8); }
.glyph-key     { bottom: 22%; right: 9%; color: rgba(226, 232, 240, 0.8); }
.float-a { animation: floaty 7s ease-in-out infinite; }
.float-b { animation: floaty 9s ease-in-out 0.8s infinite; }
.float-c { animation: floaty 8s ease-in-out 1.6s infinite; }
.float-d { animation: floaty 10s ease-in-out 0.4s infinite; }
@keyframes floaty {
    0%, 100% { transform: translateY(0) rotate(-1deg); }
    50%      { transform: translateY(-16px) rotate(1.5deg); }
}

/* ── Marquee ─────────────────────────────────────────────────────── */
.marquee { overflow: hidden; }
.marquee-track {
    display: flex;
    width: max-content;
    animation: marquee 30s linear infinite;
}
.marquee-seq {
    white-space: nowrap;
    padding-right: 1.5rem;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.72rem;
    letter-spacing: 0.34em;
    text-transform: uppercase;
    color: rgba(148, 163, 184, 0.7);
}
.marquee-seq i { color: rgba(190, 242, 100, 0.75); font-style: normal; padding: 0 0.6rem; }
@keyframes marquee { to { transform: translateX(-50%); } }

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

/* ── Cards ───────────────────────────────────────────────────────── */
.g-card {
    border-radius: 1.4rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    padding: 1.75rem;
    backdrop-filter: blur(6px);
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.4s, box-shadow 0.4s;
}
.g-card:hover {
    transform: translateY(-6px);
    border-color: rgba(190, 242, 100, 0.35);
    box-shadow: 0 24px 60px -24px rgba(190, 242, 100, 0.22);
}

/* ── FAQ ─────────────────────────────────────────────────────────── */
.faq {
    border-radius: 1.1rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    transition: border-color 0.4s, background 0.4s;
}
.faq[open] {
    border-color: rgba(103, 232, 249, 0.35);
    background: rgba(103, 232, 249, 0.04);
}
.faq summary::-webkit-details-marker { display: none; }
.faq-chevron {
    display: grid;
    place-items: center;
    height: 2rem;
    width: 2rem;
    flex-shrink: 0;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(226, 232, 240, 0.7);
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.4s, color 0.4s;
}
.faq[open] .faq-chevron {
    transform: rotate(180deg);
    border-color: rgba(103, 232, 249, 0.5);
    color: #67e8f9;
}

/* ── Scroll reveal ───────────────────────────────────────────────── */
.reveal {
    opacity: 0;
    transform: translateY(26px);
    transition: opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1), transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal.is-visible { opacity: 1; transform: none; }

/* ── Footer ──────────────────────────────────────────────────────── */
.footer-link { transition: color 0.3s; }
.footer-link:hover { color: #bef264; }

@media (prefers-reduced-motion: reduce) {
    .blob, .marquee-track, .glyph, .btn-pulse::after, .animate-rise { animation: none !important; }
    .animate-rise, .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
}
</style>
