<!-- web/pages/welcome.vue -->

<script setup lang="ts">
/* NOTE: layout 'fullscreen' initializes the Profile/System stores (see layouts/fullscreen.vue). */
definePageMeta({
    layout: 'fullscreen',
})

useHead({
    title: `Welcome — Hush Your Money`,
    meta: [
        { name: 'description', content: `Getting started with Hush Your Money: a wallet is created in your browser, your keys never leave your device. Spend Privately. Fearlessly!` },
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
        <section class="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-16 pt-24 text-center sm:pt-32">

            <p class="animate-rise font-mono text-[0.65rem] uppercase tracking-[0.5em] text-lime-300/80 sm:text-xs" style="animation-delay: 0.05s">
                utxo privacy toolkit · getting started
            </p>

            <h1 class="animate-rise mt-6 font-display text-[clamp(2.4rem,8vw,6rem)] font-extrabold leading-[1.05] tracking-tight text-white" style="animation-delay: 0.18s">
                Welcome to<br /><span class="text-gradient">the hush</span>
            </h1>

            <p class="animate-rise mt-6 font-mono text-lg italic text-cyan-200/90 sm:text-xl" style="animation-delay: 0.32s">
                Spend Privately. Fearlessly!
            </p>

            <p class="animate-rise mt-8 max-w-2xl text-base leading-relaxed text-slate-300/90 sm:text-lg" style="animation-delay: 0.44s">
                In the next few minutes a <strong class="font-semibold text-white">wallet is created right in your browser</strong>.
                The seed phrase it shows you is the only credential you will ever need —
                write it down, keep it safe, and never share it with anyone.
                No accounts. No emails. No custodians.
            </p>

            <div class="animate-rise mt-10 flex flex-col items-center gap-4 sm:flex-row" style="animation-delay: 0.56s">
                <NuxtLink to="/lobby" class="btn-primary btn-pulse">
                    Enter the Lobby
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                </NuxtLink>

                <NuxtLink to="/" class="btn-ghost">
                    Back to home
                </NuxtLink>
            </div>
        </section>

        <!-- ── The ritual ── -->
        <section class="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
            <div class="reveal max-w-3xl">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-lime-300/80">01 · the ritual</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    Three steps to a clean history
                </h2>
            </div>

            <div class="mt-12 grid gap-6 md:grid-cols-3">
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
                    <h3 class="mt-4 font-display text-xl font-bold text-white">Fund</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-400">
                        Top up your address from an exchange or an existing wallet.
                        Freshly received coins carry their public history — that is exactly
                        what we are about to erase.
                    </p>
                </div>

                <div class="g-card reveal" style="transition-delay: 0.2s">
                    <p class="font-display text-5xl font-extrabold text-violet-300/25">03</p>
                    <h3 class="mt-4 font-display text-xl font-bold text-white">Hush</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-400">
                        Enter a shuffle or fusion round and weave your coins together with
                        everyone else's into a single collaborative transaction.
                        The trail stops at the crowd.
                    </p>
                </div>
            </div>
        </section>

        <!-- ── Non-custodial pledge ── -->
        <section class="relative z-10 mx-auto w-full max-w-4xl px-6 pb-24">
            <div class="g-card reveal">
                <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="h-10 w-10 shrink-0 text-lime-300">
                        <path d="M12 3 4 7v6c0 4 3.5 6.5 8 8 4.5-1.5 8-4 8-8V7l-8-4Z" /><path d="M9 11.5l2.2 2.5L15.5 9" />
                    </svg>
                    <div>
                        <h3 class="font-display text-lg font-bold text-white">The non-custodial pledge</h3>
                        <p class="mt-2 text-sm leading-relaxed text-slate-400">
                            Keys are born on your device, live on your device, and never once touch our
                            servers. The servers only relay public blockchain data. If we disappeared
                            tomorrow, your coins would not notice.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── Footer (link parity with homepage) ── -->
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
    .blob, .btn-pulse::after, .animate-rise { animation: none !important; }
    .animate-rise, .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
}
</style>
