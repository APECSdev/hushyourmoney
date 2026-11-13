<!-- web/pages/ceremony.vue -->

<script setup lang="ts">
/* NOTE: layout 'fullscreen' initializes the Profile/System stores (see layouts/fullscreen.vue). */
definePageMeta({
    layout: 'fullscreen',
})

/* OpenGraph + Twitter + canonical (shared composable; per-page poster — user directive 2026-11-13: OG on ALL pages). */
useOg({
    title: `The Hush Ceremony — Hush Your Money`,
    description: `The Hush Ceremony: a perpetual Powers-of-Tau trusted setup for the Hush zero-knowledge shielded pools. Bring your entropy — break the link, keep the privacy.`,
    path: '/ceremony',
    image: '/posters/ceremony.jpg',
    type: 'website',
    imageAlt: `The Hush Ceremony — perpetual Powers-of-Tau trusted setup, open participation`,
})

/* Scroll-reveal (shared composable). */
useReveal()

/* ── DEMO DATA ─────────────────────────────────────────────────────
   All numbers below marked "demo" are MOCK placeholders until the
   ceremony details are finalized. The circuit facts (constraints,
   public inputs) are real, measured values from the Hush pool build. */
const STATS = [
    { value: '183,472', label: 'circuit constraints', note: 'measured', color: 'text-lime-300' },
    { value: '2', label: 'public inputs', note: 'measured', color: 'text-cyan-300' },
    { value: '—', label: 'contributions so far', note: 'demo', color: 'text-violet-300' },
    { value: '1-of-N', label: 'honesty assumption', note: 'by design', color: 'text-white' },
]

/* ── DEMO terminal feed (typed lines) ────────────────────────────── */
const TERMINAL_LINES = [
    '$ hush-ceremony contribute --entropy ~/my-randomness.bin',
    '› fetching latest accumulator .......... ok',
    '› accumulator digest: 9f2a41c7…e0b3  (demo)',
    '› mixing your entropy into τ .......... 100%',
    '› proving you contributed correctly .... ok',
    '› new accumulator digest: 5d8e07aa…4c1f  (demo)',
    '› attestation published ✓',
    '› thank you! your contribution is sealed.',
]

const typedCount = ref(0)
let typedTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
    typedTimer = setInterval(() => {
        if (typedCount.value < TERMINAL_LINES.length) {
            typedCount.value = typedCount.value + 1
        } else {
            typedCount.value = 0
        }
    }, 1600)
})

onBeforeUnmount(() => {
    if (typedTimer) clearInterval(typedTimer)
})
</script>

<template>
    <main class="relative min-h-screen w-full overflow-x-clip bg-[#060a10] font-sans text-slate-200 antialiased selection:bg-lime-300 selection:text-slate-900">

        <AuroraBackdrop />

        <!-- GitHub source banner (top-right) -->
        <GithubBanner />

        <!-- ── Hero ── -->
        <section class="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-6 pb-24 pt-16 text-center">

            <p class="animate-rise font-mono text-[0.65rem] uppercase tracking-[0.5em] text-lime-300/80 sm:text-xs" style="animation-delay: 0.05s">
                trusted setup · perpetual powers of tau · gate 7
            </p>

            <h1 class="animate-rise mt-6 font-display text-[clamp(2.4rem,8.5vw,6.5rem)] font-extrabold leading-[1.04] tracking-tight text-white" style="animation-delay: 0.18s">
                The Hush<br />
                <span class="text-gradient">Ceremony</span>
            </h1>

            <p class="animate-rise mt-6 font-mono text-[clamp(1rem,2.8vw,1.6rem)] italic text-cyan-200/90" style="animation-delay: 0.32s">
                Bring your entropy. Leave no trace.
            </p>

            <p class="animate-rise mt-8 max-w-2xl text-base leading-relaxed text-slate-300/90 sm:text-lg" style="animation-delay: 0.44s">
                Before our zero-knowledge pools can launch on mainnet, the secret parameters
                behind the proofs must be created — and destroyed. Anyone on Earth can
                contribute randomness. If <strong class="font-semibold text-white">just one person</strong>
                walks away honestly, the whole system is secure. No trust in us required.
            </p>

            <div class="animate-rise mt-10 flex flex-col items-center gap-4 sm:flex-row" style="animation-delay: 0.56s">
                <a href="#join" class="btn-primary btn-pulse">
                    Reserve Your Slot
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                </a>

                <a href="#how" class="btn-ghost">
                    How it Works
                </a>
            </div>

            <div class="animate-rise mt-16 flex items-center gap-3 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-slate-500" style="animation-delay: 0.7s">
                <span class="h-px w-10 bg-slate-600/60"></span>
                scroll to see the machine
                <span class="h-px w-10 bg-slate-600/60"></span>
            </div>
        </section>

        <!-- ── Marquee strip ── -->
        <div class="relative z-10 border-y border-white/10 bg-white/[0.02] py-4 backdrop-blur-sm" aria-hidden="true">
            <div class="marquee">
                <div class="marquee-track">
                    <span v-for="n in 2" :key="n" class="marquee-seq">
                        Perpetual Powers of τ <i>✳</i> Multi-Party Computation <i>✳</i> Groth16 <i>✳</i> BN254 <i>✳</i>
                        Toxic Waste <i>✳</i> One Honest Participant <i>✳</i> Open Participation <i>✳</i>
                    </span>
                </div>
            </div>
        </div>

        <!-- ── What / Why ── -->
        <section id="what" class="relative z-10 mx-auto w-full max-w-6xl px-6 py-28 sm:py-36">
            <div class="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr]">
                <div class="reveal">
                    <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-lime-300/80">01 · why a ceremony</p>
                    <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.9rem)] font-bold leading-[1.08] text-white">
                        Why<br />a Ceremony?
                    </h2>
                </div>

                <div class="reveal space-y-6 text-base leading-relaxed text-slate-300/90 sm:text-lg" style="transition-delay: 0.12s">
                    <p>
                        Our shielded pools use <strong class="font-semibold text-white">Groth16 proofs</strong> on the
                        <strong class="font-semibold text-white">BN254 curve</strong> — proven on public test networks
                        today. Groth16 requires a one-time <em>structured reference string</em> built from secret
                        randomness (colloquially: <strong class="font-semibold text-white">toxic waste</strong>).
                    </p>
                    <p>
                        If <em>anyone</em> ever held onto that waste, they could forge proofs — minting private
                        value out of thin air. So we do the opposite of trusting ourselves:
                        <strong class="font-semibold text-white">a public, perpetual ceremony</strong> where every
                        participant mixes secret randomness into the parameters, then destroys their secret.
                    </p>
                    <p>
                        Each contribution is chained to the previous one and publicly verified. The final
                        parameters are only trustworthy if <strong class="font-semibold text-white">at least one
                        participant</strong> deleted their secret — an assumption so weak it barely deserves
                        the word “trust”.
                    </p>
                </div>
            </div>

            <!-- Stats row -->
            <div class="reveal mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div v-for="(s, i) in STATS" :key="s.label" class="stat-card" :style="{ transitionDelay: (i * 0.08) + 's' }">
                    <div class="font-display text-2xl font-extrabold sm:text-3xl" :class="s.color">{{ s.value }}</div>
                    <div class="mt-2 text-xs uppercase tracking-widest text-slate-500">{{ s.label }}</div>
                    <div class="mt-1 font-mono text-[0.6rem] text-slate-600">[{{ s.note }}]</div>
                </div>
            </div>
        </section>

        <!-- ── How it works ── -->
        <section id="how" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-cyan-300/80">02 · the machine</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    How a Contribution Works
                </h2>
            </div>

            <!-- Contribution chain (animated flow) -->
            <div class="reveal mt-16 overflow-x-auto">
                <div class="chain flex min-w-[680px] items-center justify-between gap-0 px-2">

                    <div class="chain-node">
                        <div class="chain-dot dot-lime"><span class="font-display text-xl">τ⁰</span></div>
                        <p class="chain-label">genesis<br />accumulator</p>
                    </div>

                    <div class="chain-link"><span class="flow"></span></div>

                    <div class="chain-node">
                        <div class="chain-dot dot-cyan"><span class="font-display text-xl">τ¹</span></div>
                        <p class="chain-label">participant #1<br />mixes entropy</p>
                    </div>

                    <div class="chain-link"><span class="flow flow-2"></span></div>

                    <div class="chain-node">
                        <div class="chain-dot dot-violet"><span class="font-display text-xl">τ²</span></div>
                        <p class="chain-label">participant #2<br />mixes entropy</p>
                    </div>

                    <div class="chain-link"><span class="flow flow-3"></span></div>

                    <div class="chain-node">
                        <div class="chain-dot dot-white"><span class="font-display text-xl">τ^</span></div>
                        <p class="chain-label">perpetual…<br />your turn</p>
                    </div>
                </div>
            </div>

            <!-- Steps -->
            <div class="mt-16 grid gap-6 md:grid-cols-3">
                <div class="step-card reveal">
                    <div class="step-num text-lime-300">1</div>
                    <h3 class="mt-4 font-display text-lg font-bold text-white">Download</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-400">
                        Grab the current accumulator and the deterministic participant script.
                        Everything is public and re-runnable — you verify every step yourself.
                    </p>
                </div>

                <div class="step-card reveal" style="transition-delay: 0.12s">
                    <div class="step-num text-cyan-300">2</div>
                    <h3 class="mt-4 font-display text-lg font-bold text-white">Mix</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-400">
                        Feed your secret randomness — dice, hardware RNG, anything unpredictable —
                        into the transformation. A single run on an ordinary laptop.
                    </p>
                </div>

                <div class="step-card reveal" style="transition-delay: 0.24s">
                    <div class="step-num text-violet-300">3</div>
                    <h3 class="mt-4 font-display text-lg font-bold text-white">Destroy &amp; Publish</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-400">
                        Wipe your secret, publish the new accumulator plus a proof that you
                        transformed it correctly. The chain grows; the waste dies with you.
                    </p>
                </div>
            </div>
        </section>

        <!-- ── Live monitor (DEMO) ── -->
        <section class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-violet-300/80">03 · the desk</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    Ceremony Monitor
                </h2>
                <p class="mt-3 font-mono text-xs text-slate-500">[ demo preview — wiring to the real machine comes later ]</p>
            </div>

            <div class="mt-12 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                <!-- Terminal -->
                <div class="term-card reveal">
                    <div class="flex items-center gap-2 border-b border-white/10 px-5 py-3">
                        <span class="h-3 w-3 rounded-full bg-rose-400/80"></span>
                        <span class="h-3 w-3 rounded-full bg-amber-300/80"></span>
                        <span class="h-3 w-3 rounded-full bg-lime-300/80"></span>
                        <span class="ml-3 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-slate-500">hush-ceremony — session</span>
                    </div>

                    <div class="min-h-[220px] px-5 py-4 font-mono text-sm leading-7 text-lime-300/90">
                        <p v-for="(line, i) in TERMINAL_LINES.slice(0, typedCount)" :key="i" class="term-line">{{ line }}</p>
                        <p class="cursor-blink text-lime-300">▌</p>
                    </div>
                </div>

                <!-- Queue -->
                <div class="term-card reveal" style="transition-delay: 0.12s">
                    <div class="border-b border-white/10 px-5 py-3 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-slate-500">
                        contribution queue
                    </div>

                    <ul class="flex flex-col divide-y divide-white/5 px-5">
                        <li class="queue-row">
                            <span class="font-mono text-xs text-slate-400">satoshi-dreamer</span>
                            <span class="badge badge-done">sealed</span>
                        </li>
                        <li class="queue-row">
                            <span class="font-mono text-xs text-slate-400">entropy-goblin</span>
                            <span class="badge badge-done">sealed</span>
                        </li>
                        <li class="queue-row">
                            <span class="font-mono text-xs text-slate-400">dice-roller-99</span>
                            <span class="badge badge-live">mixing…</span>
                        </li>
                        <li class="queue-row">
                            <span class="font-mono text-xs text-slate-400">you (maybe?)</span>
                            <span class="badge badge-wait">waiting</span>
                        </li>
                    </ul>

                    <div class="px-5 pb-5 pt-4">
                        <div class="flex justify-between font-mono text-[0.6rem] uppercase tracking-widest text-slate-500">
                            <span>current phase</span>
                            <span class="text-lime-300">perpetual · open</span>
                        </div>
                        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div class="progress h-full w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── FAQ ── -->
        <section class="relative z-10 mx-auto w-full max-w-4xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-lime-300/80">04 · questions</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    Ceremony FAQ
                </h2>
            </div>

            <div class="mt-12 space-y-4">
                <details class="faq-card reveal">
                    <summary>Do I need to trust anyone to contribute?</summary>
                    <p>
                        No. You verify the previous accumulator yourself, mix in your own secret,
                        and publish the result with a proof of correct transformation. As long as
                        <strong class="font-semibold text-white">one</strong> participant in the entire chain
                        destroyed their secret, the final parameters are safe for everyone.
                    </p>
                </details>

                <details class="faq-card reveal">
                    <summary>What is “toxic waste”?</summary>
                    <p>
                        The secret randomness used to build the proving and verifying keys. If it
                        leaked, the holder could forge valid proofs — creating shielded value from
                        nothing. The ceremony is designed so the waste is destroyed with every
                        contribution.
                    </p>
                </details>

                <details class="faq-card reveal">
                    <summary>Why “perpetual”?</summary>
                    <p>
                        Instead of a one-time event with a deadline, the accumulator keeps accepting
                        contributions — like Zcash's Powers of Tau. Anyone can join at any time, and
                        each new contribution makes the chain stronger.
                    </p>
                </details>

                <details class="faq-card reveal">
                    <summary>Does this touch my coins or keys?</summary>
                    <p>
                        Never. A contribution is pure math over random values — it involves no
                        wallet, no addresses, no funds. You can participate from a machine that has
                        never touched crypto in its life.
                    </p>
                </details>

                <details class="faq-card reveal">
                    <summary>What hardware do I need?</summary>
                    <p>
                        An ordinary laptop is enough. The transformation runs on commodity hardware
                        and takes minutes, not days. Specific tooling and instructions will be
                        published when the ceremony opens.
                    </p>
                </details>
            </div>
        </section>

        <!-- ── CTA / Join ── -->
        <section id="join" class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-28 text-center sm:pb-36">
            <div class="cta-glow reveal relative overflow-hidden rounded-[2rem] border border-lime-300/20 bg-gradient-to-br from-lime-300/10 via-transparent to-violet-300/10 px-8 py-16 shadow-[0_24px_80px_-40px_rgba(190,242,100,0.35)]">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-lime-300/80">the door is open</p>
                <h2 class="mt-6 font-display text-[clamp(1.8rem,5vw,3.6rem)] font-extrabold leading-tight text-white">
                    Add your entropy to<br /><span class="text-gradient">the chain of trust</span>
                </h2>
                <p class="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-300/90">
                    Slot reservations for the first public rounds are opening soon.
                    Leave a signal and we'll ping you when the machine spins up.
                </p>

                <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button type="button" disabled class="btn-primary cursor-not-allowed opacity-50" title="demo — sign-up coming with the real ceremony">
                        Join the Waitlist
                    </button>

                    <NuxtLink to="/readme" class="btn-ghost">
                        Read the Docs
                    </NuxtLink>
                </div>

                <p class="mt-6 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-slate-600">[ demo button — wired to sign-up later ]</p>
            </div>
        </section>

        <!-- ── Footer (link parity with homepage) ── -->
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

/* ── Contribution chain ──────────────────────────────────────────── */
.chain-node { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
.chain-dot {
    display: grid;
    place-items: center;
    height: 4.5rem;
    width: 4.5rem;
    border-radius: 9999px;
    border: 1px solid;
    animation: dot-breathe 4.5s ease-in-out infinite;
}
.dot-lime   { border-color: rgba(190, 242, 100, 0.55); color: #bef264; background: rgba(190, 242, 100, 0.08); box-shadow: 0 0 40px -8px rgba(190, 242, 100, 0.4); }
.dot-cyan   { border-color: rgba(103, 232, 249, 0.55); color: #67e8f9; background: rgba(103, 232, 249, 0.08); box-shadow: 0 0 40px -8px rgba(103, 232, 249, 0.4); animation-delay: 0.6s; }
.dot-violet { border-color: rgba(196, 141, 255, 0.55); color: #c48dff; background: rgba(196, 141, 255, 0.08); box-shadow: 0 0 40px -8px rgba(196, 141, 255, 0.4); animation-delay: 1.2s; }
.dot-white  { border-color: rgba(226, 232, 240, 0.5); color: #e2e8f0; background: rgba(226, 232, 240, 0.06); box-shadow: 0 0 40px -8px rgba(226, 232, 240, 0.3); animation-delay: 1.8s; }
@keyframes dot-breathe {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.09); }
}
.chain-label {
    text-align: center;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.62rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(148, 163, 184, 0.85);
    line-height: 1.7;
}
.chain-link {
    position: relative;
    flex: 1;
    height: 2px;
    margin: 0 0.4rem;
    margin-bottom: 2.75rem;
    background: rgba(255, 255, 255, 0.08);
    overflow: hidden;
    border-radius: 9999px;
}
.flow {
    position: absolute;
    top: -1px;
    height: 4px;
    width: 34%;
    border-radius: 9999px;
    background: linear-gradient(90deg, transparent, #bef264, transparent);
    animation: flow-move 2.2s linear infinite;
}
.flow-2 { background: linear-gradient(90deg, transparent, #67e8f9, transparent); animation-delay: 0.5s; }
.flow-3 { background: linear-gradient(90deg, transparent, #c48dff, transparent); animation-delay: 1s; }
@keyframes flow-move {
    0%   { left: -34%; }
    100% { left: 100%; }
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

/* ── Terminal / monitor cards ───────────────────────────────────── */
.term-card {
    border-radius: 1.4rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(6px);
    overflow: hidden;
}
.term-line { animation: term-in 0.5s ease-out; }
@keyframes term-in {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: none; }
}
.cursor-blink { animation: blink 1.1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }

.queue-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 0;
}
.badge {
    border-radius: 9999px;
    border: 1px solid;
    padding: 0.15rem 0.6rem;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.6rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
}
.badge-done { border-color: rgba(190, 242, 100, 0.4); color: #bef264; }
.badge-live { border-color: rgba(103, 232, 249, 0.5); color: #67e8f9; animation: blink 1.6s ease-in-out infinite; }
.badge-wait { border-color: rgba(148, 163, 184, 0.3); color: rgba(148, 163, 184, 0.8); }

.progress {
    border-radius: 9999px;
    background: linear-gradient(90deg, #bef264, #67e8f9, #c48dff, #bef264);
    background-size: 300% 100%;
    animation: progress-slide 6s linear infinite;
}
@keyframes progress-slide {
    0%   { background-position: 0% 0; }
    100% { background-position: 300% 0; }
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

/* ── Scroll reveal ───────────────────────────────────────────────── */
.reveal {
    opacity: 0;
    transform: translateY(26px);
    transition: opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1), transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal.is-visible { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
    .marquee-track, .btn-pulse::after, .animate-rise, .chain-dot, .flow, .cursor-blink, .badge-live, .progress, .term-line { animation: none !important; }
    .animate-rise, .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
}
</style>
