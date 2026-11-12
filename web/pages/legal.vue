<!-- web/pages/legal.vue -->

<script setup lang="ts">
/* NOTE: layout 'fullscreen' initializes the Profile/System stores (see layouts/fullscreen.vue). */
definePageMeta({
    layout: 'fullscreen',
})

useHead({
    title: `Terms of Service — Hush Your Money`,
    meta: [
        { name: 'description', content: `Terms of service and disclaimer for Hush Your Money — free, open-source, non-custodial UTXO privacy software. Provided as-is, with no warranty and no custody of funds.` },
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
    }, { threshold: 0.08 })

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

        <div class="relative z-10 mx-auto w-full max-w-4xl px-6 pb-24 pt-24 sm:pt-32">

            <!-- ── Header ── -->
            <section class="reveal text-center">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-lime-300/80">utxo privacy toolkit · the fine print</p>
                <h1 class="mt-6 font-display text-[clamp(2.2rem,6.5vw,4.75rem)] font-extrabold leading-[1.05] tracking-tight text-white">
                    Terms of Service<br /><span class="text-gradient">&amp; Disclaimer</span>
                </h1>
                <p class="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-slate-500">
                    Last updated: November 12, 2026
                </p>
            </section>

            <div class="mt-16 flex flex-col gap-8">

                <!-- Acceptance -->
                <section class="doc-card reveal">
                    <h2 class="font-display text-2xl font-bold text-white">1. Acceptance of Terms</h2>
                    <p class="mt-4">
                        By accessing or using the Hush Your Money website, wallet, or any related software
                        (collectively, the &ldquo;Software&rdquo;), you agree to these Terms of Service and to our
                        Disclaimer. If you do not agree, do not use the Software. These terms apply to every
                        visitor and user, in every jurisdiction.
                    </p>
                </section>

                <!-- What the software is -->
                <section class="doc-card reveal">
                    <h2 class="font-display text-2xl font-bold text-white">2. What Hush Your Money Is</h2>
                    <p class="mt-4">
                        Hush Your Money is free and open-source, non-custodial privacy software for
                        UTXO-based blockchains, published under the MIT license. It implements
                        decentralized CoinJoin protocols (CashShuffle and CashFusion) and related
                        tooling. The Software runs in your browser; keys are generated, stored, and
                        used exclusively on your own device.
                    </p>
                    <p class="mt-3">
                        The Software is a tool, not a service provider. There is no account, no
                        registration, and no relationship of trust, agency, or custody between you
                        and the project.
                    </p>
                </section>

                <!-- No custody -->
                <section class="doc-card reveal">
                    <h2 class="font-display text-2xl font-bold text-white">3. No Custody. No Recovery.</h2>
                    <p class="mt-4">
                        You — and only you — control your private keys and your seed phrase. The
                        project has no access to them, no copies of them, and no ability to freeze,
                        move, restore, or recover your funds. If you lose your seed phrase, your
                        funds are lost permanently. If you share your seed phrase, your funds can be
                        stolen. Treat your seed phrase with the same care as cash in your hand.
                    </p>
                </section>

                <!-- No warranty -->
                <section class="doc-card reveal">
                    <h2 class="font-display text-2xl font-bold text-white">4. Provided &ldquo;AS IS&rdquo; — No Warranty</h2>
                    <p class="mt-4">
                        The Software is provided &ldquo;AS IS&rdquo;, WITHOUT WARRANTY OF ANY KIND, express or
                        implied, including but not limited to the warranties of merchantability,
                        fitness for a particular purpose, and non-infringement. Bugs, downtime, and
                        errors are possible. Use of the Software is at your own risk.
                    </p>
                </section>

                <!-- Not advice -->
                <section class="doc-card reveal">
                    <h2 class="font-display text-2xl font-bold text-white">5. Not Financial or Legal Advice</h2>
                    <p class="mt-4">
                        Nothing on this website or in the Software constitutes financial, investment,
                        legal, or tax advice. No communication from the project creates an
                        advisory relationship. Consult qualified professionals in your jurisdiction
                        before making decisions that affect your legal or financial position.
                    </p>
                </section>

                <!-- Privacy limits -->
                <section class="doc-card reveal">
                    <h2 class="font-display text-2xl font-bold text-white">6. Privacy Is Not Absolute</h2>
                    <p class="mt-4">
                        The Software aims to break the link between your coins and your identity on
                        the public ledger, but it cannot guarantee anonymity. Blockchain analysis
                        techniques evolve; network-level observation, compromised devices, user
                        error, and future protocol weaknesses can all erode privacy. Location
                        (IP-address) obfuscation is delegated to third parties such as VPN or Tor
                        providers and is not provided by the Software.
                    </p>
                </section>

                <!-- Third-party services -->
                <section class="doc-card reveal">
                    <h2 class="font-display text-2xl font-bold text-white">7. Third-Party Services</h2>
                    <p class="mt-4">
                        The Software relies on third-party infrastructure — including public
                        blockchain data providers, Electrum servers, decentralized hosting (Flux
                        cloud), and content delivery networks. These services are not under the
                        project's control; their availability, accuracy, and practices can change
                        without notice. The project is not responsible for third-party services or
                        for any loss arising from their failure.
                    </p>
                </section>

                <!-- Compliance -->
                <section class="doc-card reveal">
                    <h2 class="font-display text-2xl font-bold text-white">8. Compliance With Your Local Laws</h2>
                    <p class="mt-4">
                        Financial privacy is a normal expectation, and CoinJoin is non-custodial
                        software — no third party ever holds your funds. Laws and regulations vary
                        by jurisdiction and change over time. You are solely responsible for knowing
                        and complying with the laws that apply to you, including tax, anti-money-laundering,
                        and sanctions rules, before and while using the Software. The project does
                        not solicit use in any jurisdiction where use would be unlawful.
                    </p>
                </section>

                <!-- Acceptable use -->
                <section class="doc-card reveal">
                    <h2 class="font-display text-2xl font-bold text-white">9. Acceptable Use</h2>
                    <p class="mt-4">
                        You agree not to use the Software to violate any applicable law, to launder
                        proceeds of crime, to facilitate sanctions evasion, or to harm the
                        Software's users or infrastructure. You are responsible for your own use.
                    </p>
                </section>

                <!-- Liability -->
                <section class="doc-card reveal">
                    <h2 class="font-display text-2xl font-bold text-white">10. Limitation of Liability</h2>
                    <p class="mt-4">
                        To the maximum extent permitted by applicable law, in no event shall the
                        project's authors, contributors, or copyright holders be liable for any
                        claim, damages, or other liability — including loss of funds, loss of keys,
                        loss of privacy, or loss of profits — whether in an action of contract, tort,
                        or otherwise, arising from, out of, or in connection with the Software or
                        your use of it.
                    </p>
                </section>

                <!-- IP -->
                <section class="doc-card reveal">
                    <h2 class="font-display text-2xl font-bold text-white">11. Intellectual Property</h2>
                    <p class="mt-4">
                        The Software is open source under the
                        <a href="https://github.com/nyusternie/hushyourmoney" target="_blank" rel="noopener" class="link-cyan">MIT license</a>.
                        You may use, copy, modify, and distribute it under that license's terms.
                    </p>
                </section>

                <!-- Changes -->
                <section class="doc-card reveal">
                    <h2 class="font-display text-2xl font-bold text-white">12. Changes to These Terms</h2>
                    <p class="mt-4">
                        These terms may be updated from time to time. The date above shows the last
                        revision. Continued use of the Software after a change constitutes
                        acceptance of the updated terms.
                    </p>
                </section>

                <!-- Contact -->
                <section class="doc-card reveal">
                    <h2 class="font-display text-2xl font-bold text-white">13. Contact</h2>
                    <p class="mt-4">
                        Questions about these terms? Open an issue at
                        <a href="https://github.com/nyusternie/hushyourmoney" target="_blank" rel="noopener" class="link-cyan">github.com/nyusternie/hushyourmoney</a>.
                    </p>
                </section>

            </div>

        </div>

        <!-- ── Footer (link parity with homepage) ── -->
        <footer class="relative z-10 border-t border-white/5 px-6 py-8">
            <div class="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row">
                <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-xs text-slate-500">
                    <NuxtLink to="/" class="footer-link">home</NuxtLink>
                    <span class="text-slate-700">|</span>
                    <NuxtLink to="/readme" class="footer-link">readme</NuxtLink>
                    <span class="text-slate-700">|</span>
                    <NuxtLink to="/sponsors" class="footer-link">sponsors 💗</NuxtLink>
                    <span class="text-slate-700">|</span>
                    <NuxtLink to="/help" class="footer-link">need help?</NuxtLink>
                </div>

                <div class="flex items-center gap-4 font-mono text-xs text-slate-500">
                    <a href="https://github.com/nyusternie/hushyourmoney" target="_blank" rel="noopener" class="footer-link">github</a>
                    <span class="text-slate-700">|</span>
                    <a href="https://cloud.runonflux.io" target="_blank" rel="noopener" class="footer-link">running on flux cloud</a>
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

/* ── Document cards ──────────────────────────────────────────────── */
.doc-card {
    border-radius: 1.4rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    padding: 2rem;
    backdrop-filter: blur(6px);
    color: rgba(203, 213, 225, 0.92);
    line-height: 1.75;
    transition: border-color 0.4s, box-shadow 0.4s;
}
.doc-card:hover {
    border-color: rgba(190, 242, 100, 0.25);
    box-shadow: 0 24px 60px -32px rgba(190, 242, 100, 0.18);
}

.link-cyan {
    color: #67e8f9;
    text-decoration-line: underline;
    text-decoration-color: rgba(103, 232, 249, 0.4);
    text-underline-offset: 4px;
    transition: text-decoration-color 0.3s;
}
.link-cyan:hover { text-decoration-color: #67e8f9; }

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
    .blob { animation: none !important; }
    .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
}
</style>
