<!-- web/pages/research/bls12-381.vue — topic 06 (the curve we have not shipped on) -->

<script setup lang="ts">
/* Shared shell + styles come from layouts/research.vue (user refactor 2026-11-13). */
definePageMeta({
    layout: 'research',
})

/* OpenGraph + Twitter + canonical (shared composable; per-page poster).
   NOTE: reuses the hub poster — a dedicated bls12-381 poster is a follow-up. */
useOg({
    title: `BLS12-381 — Hush Your Money`,
    description: `BLS12-381 on Bitcoin Cash: a reviewed on-chain Groth16 verifier at 34,229 B in 4 inputs, its cost against BN254, and why the curve choice waits on Gate 7.`,
    path: '/research/bls12-381',
    image: '/posters/research.jpg',
    type: 'article',
    imageAlt: `BLS12-381 — the 381-bit pairing-friendly curve, and what it would cost on BCH`,
})

/* Scroll-reveal (shared composable). */
useReveal()

/* ── Curve parameters (verified: groth16_cashscript/singleton/bls12-381/README.md
      curve comparison table, fetched 2026-11-23) ── */
const PARAMS = [
    { k: 'family', v: 'BLS (Barreto–Lynn–Scott) · pairing-friendly · embedding degree 12' },
    { k: 'base prime', v: '381-bit · 48 B serialized field element' },
    { k: 'curve x', v: '−0xd201000000010000 (negative → conjugate f at the end of the Miller loop)' },
    { k: 'G1 b', v: '4' },
    { k: 'G2 twist', v: 'M-twist b′ = 4·(1+u) → mulByB(a) = (4a₀−4a₁, 4a₀+4a₁)' },
    { k: 'ξ (sextic)', v: '1 + u → fp2MulXi(a) = (a₀−a₁, a₀+a₁)' },
    { k: 'ate loop', v: 'NAF of |x|, no Q1/Q2 ψ post-step' },
    { k: 'line mul', v: 'mul014 (multiplicative twist)' },
    { k: 'final exp', v: 'BLS / Hayashida–Scott chain' },
    { k: 'compiler', v: 'circom 2.2.3, --prime bls12381 — verified via circom --help' },
    { k: 'unchanged', v: 'Fp2 basis u² = −1, pointDouble/pointAdd, the Fp12 tower, cyclotomic squaring' },
]

/* The comparison table below is written inline in the template because every row
   carries a different emphasis (a delta, a unit, a reference) — a data array would
   flatten it. All values are [cited] from groth16_cashscript/verifiers.md except the
   proof sizes, which are [derived] from the point encodings. */

/* ── What a BLS12-381 pool would cost ── */
const COST = [
    {
        step: 'circuit source',
        verdict: 'small change',
        detail: 'circom is field-generic: `circom --prime bls12381` compiles the same pool.circom. The new constraint count is UNMEASURED — it must be compiled and counted before anything else is claimed.',
        tone: 'lime',
    },
    {
        step: 'R1CS + proving key',
        verdict: 'new, unmeasured',
        detail: 'A different field means a different R1CS and a different proving key, even if the constraint count lands close to 183,472. No number exists until the compile runs.',
        tone: 'lime',
    },
    {
        step: 'trusted setup',
        verdict: 'NEW CEREMONY',
        detail: 'Powers-of-Tau transcripts are curve-specific. The transcript we used — ppot_0080_18.ptau, 302,083,218 B — is BN254: the PSE repository ships phase2-bn254 and every instruction targets it. A BLS12-381 pool cannot reuse a single contribution.',
        tone: 'rose',
    },
    {
        step: 'verifier program',
        verdict: 'exists, reviewed',
        detail: '34,229 B in 4 inputs, one standard transaction, reviewed 2026-10-26. The engineering is done — this is the part that is NOT a research project.',
        tone: 'lime',
    },
    {
        step: 'covenant',
        verdict: 'recompile',
        detail: 'The covenant slices the proven public inputs at fixed witness offsets, so a different verifier means different offsets and a new redeem. Same design, new bytes.',
        tone: 'lime',
    },
    {
        step: 'pool',
        verdict: 'redeploy',
        detail: 'New category, new covenant P2SH32, new step UTXOs. One deploy transaction — the cheap part.',
        tone: 'lime',
    },
]

/* ── Sources ── */
const SOURCES = [
    { label: 'groth16_cashscript — verifiers.md (both curves, the map)', href: 'https://github.com/mr-zwets/groth16_cashscript/blob/main/verifiers.md' },
    { label: 'singleton/bls12-381 — the curve comparison table', href: 'https://github.com/mr-zwets/groth16_cashscript/blob/main/singleton/bls12-381/README.md' },
    { label: 'bls-native-sound — the reviewed 4-input verifier', href: 'https://github.com/mr-zwets/groth16_cashscript/blob/main/chunked/bls12-381/bls-native-sound/README.md' },
    { label: 'zk-verifier-bench — the grading harness', href: 'https://github.com/mr-zwets/zk-verifier-bench' },
    { label: 'perpetualpowersoftau — why the ceremony is curve-bound', href: 'https://github.com/privacy-scaling-explorations/perpetualpowersoftau' },
    { label: 'our circuit + design records', href: 'https://github.com/APECSdev/pusd-shielded-pool' },
]
</script>

<template>

    <!-- ── Topic hero ── -->
    <section class="relative z-10 mx-auto flex min-h-[72vh] w-full max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-14 text-center">

        <NuxtLink to="/research" class="crumb animate-rise" style="animation-delay: 0.04s">
            research <span class="sep">/</span> bls12-381
        </NuxtLink>

        <p class="animate-rise mt-6 font-mono text-[0.8rem] uppercase tracking-[0.5em] text-cyan-200 sm:text-xs" style="animation-delay: 0.1s">
            06 · the other curve
        </p>

        <h1 class="animate-rise mt-5 font-display text-[clamp(2.4rem,8vw,5.6rem)] font-extrabold leading-[0.95] tracking-tight text-white" style="animation-delay: 0.16s">
            BLS12-381
        </h1>

        <p class="animate-rise mt-6 max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg" style="animation-delay: 0.22s">
            The 381-bit curve behind Zcash's Sapling, Ethereum's consensus layer and nChain's
            reference verifier. On Bitcoin Cash it already has a reviewed Groth16 verifier —
            <strong class="text-white">34,229 bytes in four inputs</strong>. This page records what it
            would cost us, and why we have not shipped it.
        </p>

        <div class="animate-rise mt-9 flex flex-wrap items-center justify-center gap-3" style="animation-delay: 0.28s">
            <a href="#compare" class="btn-primary btn-pulse">The Comparison</a>
            <a href="#cost" class="btn-ghost">What It Would Cost</a>
        </div>

        <p class="animate-rise mt-10 max-w-2xl font-mono text-[0.78rem] leading-relaxed text-slate-300" style="animation-delay: 0.34s">
            [measured] = first-party measurement · [cited] = third-party bench number ·
            [derived] = arithmetic from the curve parameters · UNMEASURED = we have not run it
        </p>
    </section>

    <!-- ── 01 What it is ── -->
    <section id="what" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
        <div class="grid items-start gap-12 lg:grid-cols-[1fr,1.3fr]">
            <div class="reveal">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">01 · the object</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    What BLS12-381<br />Actually Is
                </h2>
                <p class="mt-5 text-sm leading-relaxed text-slate-200">
                    A Barreto–Lynn–Scott curve over a 381-bit prime with embedding degree 12. Every
                    field element is 48 bytes instead of 32, and the arithmetic is not a rescaling of
                    BN254 — the twist, the line-multiplication form and the final exponentiation all
                    change shape. What stays identical is the tower and the point formulas.
                </p>
                <p class="mt-3 text-sm leading-relaxed text-slate-200">
                    That last sentence is the whole reason a verifier for it exists on BCH at all:
                    the Fp2 basis, the doubling and addition formulas, the Fp12 tower and cyclotomic
                    squaring are <em>near-mechanical re-parameterizations</em> of the BN254 verifier,
                    so the engineering effort was porting, not invention.
                </p>
            </div>

            <div class="reveal" style="transition-delay: 0.12s">
                <div class="fact-card">
                    <div class="flex items-center justify-between gap-3">
                        <h3 class="font-mono text-sm text-cyan-300">parameters, and what changes</h3>
                        <span class="badge badge-live">verified</span>
                    </div>
                    <dl class="mt-4 space-y-2.5 font-mono text-[0.82rem] leading-relaxed">
                        <div v-for="p in PARAMS" :key="p.k" class="flex gap-3">
                            <dt class="w-24 shrink-0 uppercase tracking-widest text-slate-300">{{ p.k }}</dt>
                            <dd class="break-all text-slate-300">{{ p.v }}</dd>
                        </div>
                    </dl>
                    <p class="mt-4 font-mono text-[0.78rem] leading-relaxed text-slate-300">
                        curve comparison table: <a href="https://github.com/mr-zwets/groth16_cashscript/blob/main/singleton/bls12-381/README.md" target="_blank" rel="noopener" class="src-link">groth16_cashscript/bls12-381 ↗</a>
                        · compiler: <span class="text-slate-200">circom 2.2.3</span> on the apecsdev VM
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- ── 02 The comparison ── -->
    <section id="compare" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
        <div class="reveal">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">02 · the comparison</p>
            <h2 class="mt-3 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                Two Reviewed Verifiers, One Transaction Each
            </h2>
            <p class="mt-5 max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg">
                These are the two artifacts the public bench currently ranks as its best deployable
                sound verifiers on each curve — both independently reviewed on 2026-10-26, both fitting
                one standard BCH transaction. The comparison is therefore like-for-like, which is rare
                in this space.
            </p>
        </div>

        <div class="reveal mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
            <table class="data-table min-w-[720px]">
                <thead>
                    <tr>
                        <th scope="col">quantity</th>
                        <th scope="col">BN254</th>
                        <th scope="col">BLS12-381</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">verifier bytes</td>
                        <td class="text-slate-100">27,624</td>
                        <td class="text-slate-100"><strong class="text-white">34,229</strong> <span class="font-mono text-[0.78rem] text-slate-300">(+24%)</span></td>
                    </tr>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">inputs</td>
                        <td class="text-slate-100">3</td>
                        <td class="text-slate-100"><strong class="text-white">4</strong></td>
                    </tr>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">transactions</td>
                        <td class="text-slate-100">1 standard</td>
                        <td class="text-slate-100">1 standard</td>
                    </tr>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">op-cost</td>
                        <td class="text-slate-100">20.72M</td>
                        <td class="text-slate-100">24.0M</td>
                    </tr>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">redeem</td>
                        <td class="text-slate-100">65 B, identical in all 3 inputs</td>
                        <td class="text-slate-100">81 B, shared by 4 inputs</td>
                    </tr>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">reviewed</td>
                        <td class="text-slate-100">2026-10-26</td>
                        <td class="text-slate-100">2026-10-26</td>
                    </tr>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">liveness margin</td>
                        <td class="text-slate-100">5.81% standard · 6.26% consensus</td>
                        <td class="text-slate-100">6.18% standard · 6.42% consensus</td>
                    </tr>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">soundness error</td>
                        <td class="text-slate-100">see the artifact</td>
                        <td class="text-slate-100">ε ≈ 2<sup>−248</sup></td>
                    </tr>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">Groth16 proof</td>
                        <td class="text-slate-100">128 B <span class="font-mono text-[0.78rem] text-slate-300">(2×32 + 64)</span></td>
                        <td class="text-slate-100">192 B <span class="font-mono text-[0.78rem] text-slate-300">(2×48 + 96)</span></td>
                    </tr>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">nChain reference</td>
                        <td class="text-slate-100">—</td>
                        <td class="text-slate-100">522,564 B <span class="font-mono text-[0.78rem] text-slate-300">(the same curve)</span></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <p class="reveal mt-4 font-mono text-[0.8rem] leading-relaxed text-slate-200">
            bench entries: <a href="https://github.com/mr-zwets/groth16_cashscript/blob/main/verifiers.md" target="_blank" rel="noopener" class="src-link">verifiers.md ↗</a>
            · proof sizes are [derived] from the point encodings (G1 32/48 B, G2 64/96 B)
        </p>

        <div class="mt-10 grid gap-6 lg:grid-cols-2">
            <div class="fact-card reveal">
                <h3 class="font-mono text-sm text-lime-300">what 24% more bytes buys</h3>
                <p class="mt-3 text-sm leading-relaxed text-slate-200">
                    A larger base field. Whether that translates into a materially higher security
                    level is the question that matters and the one we cannot yet answer with a primary
                    source — see <a href="#open" class="src-link">07 · open</a>. We will not print a
                    bits-of-security figure without a citation.
                </p>
            </div>
            <div class="fact-card reveal" style="transition-delay: 0.1s">
                <h3 class="font-mono text-sm text-cyan-300">what the extra input costs</h3>
                <p class="mt-3 text-sm leading-relaxed text-slate-200">
                    One more input in the same transaction. On BCH the per-input op budget is
                    <code class="text-cyan-200">(41 + unlockingLength) × 800</code>, so a fourth role is a
                    re-split of the same work, not extra budget pressure — the margins are actually
                    <em>better</em> than BN254's (6.18% vs 5.81%).
                </p>
            </div>
        </div>
    </section>

    <!-- ── 03 What a pool would cost ── -->
    <section id="cost" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
        <div class="reveal">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-violet-200">03 · the cost</p>
            <h2 class="mt-3 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                What a BLS12-381 Pool Would Cost
            </h2>
            <p class="mt-5 max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg">
                Six steps. Only one of them is expensive, and it is not the verifier.
            </p>
        </div>

        <div class="mt-10 space-y-4">
            <div v-for="(c, i) in COST" :key="c.step" class="fact-card reveal" :style="{ transitionDelay: (i * 0.06) + 's' }">
                <div class="flex flex-wrap items-center gap-3">
                    <span class="font-mono text-xs uppercase tracking-widest text-slate-300">{{ c.step }}</span>
                    <span class="ml-auto badge" :class="c.tone === 'rose' ? 'badge-error' : 'badge-done'">{{ c.verdict }}</span>
                </div>
                <p class="mt-3 text-sm leading-relaxed text-slate-200">{{ c.detail }}</p>
            </div>
        </div>

        <div class="reveal mt-10 rounded-2xl border border-rose-300/40 bg-rose-300/10 px-5 py-4 font-mono text-xs leading-relaxed text-rose-100">
            the ceremony is the wall · Powers-of-Tau transcripts are curve-specific · ours is BN254-only ·
            a BLS12-381 pool needs its own multi-party ceremony · nothing from Gate 7 is reusable
        </div>
    </section>

    <!-- ── 04 Why we have not shipped it ── -->
    <section id="why-not" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
        <div class="reveal">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-rose-200">04 · the decision</p>
            <h2 class="mt-3 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                Why This Is Not<br />a Second Pool Option
            </h2>
        </div>

        <div class="mt-10 grid gap-6 lg:grid-cols-3">
            <div class="fact-card reveal">
                <h3 class="font-mono text-sm text-rose-300">two pools, two anonymity sets</h3>
                <p class="mt-3 text-sm leading-relaxed text-slate-200">
                    A shielded pool is only as private as the set it hides you in. Offering the same
                    community two pools on two curves splits that set in half — permanently — in
                    exchange for a security delta nobody has yet quantified for us.
                </p>
            </div>
            <div class="fact-card reveal" style="transition-delay: 0.08s">
                <h3 class="font-mono text-sm text-rose-300">two ceremonies</h3>
                <p class="mt-3 text-sm leading-relaxed text-slate-200">
                    A curve change forces a new transcript. Shipping BN254 now and BLS12-381 later means
                    paying for two independent multi-party ceremonies — the single most expensive thing
                    in the entire project, and the reason the Path-B decision was made before mainnet
                    in the first place.
                </p>
            </div>
            <div class="fact-card reveal" style="transition-delay: 0.16s">
                <h3 class="font-mono text-sm text-lime-300">so the decision belongs to Gate 7</h3>
                <p class="mt-3 text-sm leading-relaxed text-slate-200">
                    A production ceremony is required either way. That makes the ceremony the
                    <em>only</em> step where the curve choice is free — decide the curve, then run one
                    ceremony for it. Deciding earlier costs a ceremony; deciding later costs a pool.
                </p>
            </div>
        </div>
    </section>

    <!-- ── 05 Open ── -->
    <section id="open" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
        <div class="reveal">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">05 · open</p>
            <h2 class="mt-3 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                Open Questions
            </h2>
        </div>

        <div class="mt-10 space-y-4">
            <details class="faq-card reveal">
                <summary>How many constraints does the circuit have on BLS12-381?</summary>
                <p>
                    <strong class="text-white">UNMEASURED.</strong> We have confirmed the compiler
                    supports it — <code class="text-cyan-200">circom 2.2.3</code> lists
                    <code class="text-cyan-200">bls12381</code> among its
                    <code class="text-cyan-200">--prime</code> values — but we have not compiled
                    <code class="text-cyan-200">pool.circom</code> against it. R1CS is field-generic, so
                    the count should land close to 183,472, and "should" is not a number we publish.
                </p>
            </details>

            <details class="faq-card reveal">
                <summary>Is BLS12-381 more secure than BN254, and by how much?</summary>
                <p>
                    The field is 1.5× wider (381 vs 254 bits) and the curve was designed for a higher
                    security target, which is why it is the default for production ZK systems. But we
                    have not obtained a primary citation for the specific bit figures, so this page
                    carries <strong class="text-white">no number</strong>. The
                    <NuxtLink to="/research/bn254#tradeoffs" class="src-link">BN254 page</NuxtLink>
                    marks the same gap.
                </p>
            </details>

            <details class="faq-card reveal">
                <summary>Could we run the same circuit on both curves and compare honestly?</summary>
                <p>
                    Yes, and that is the experiment worth running: compile once per curve, count
                    constraints, generate a proof on each, regenerate the verifier under each curve's
                    own key, and measure the pool transaction on the BCH-2026 VM. Four numbers, one
                    afternoon of compute. Until then, every claim on this page is either cited from the
                    bench or marked UNMEASURED.
                </p>
            </details>

            <details class="faq-card reveal">
                <summary>Does a BLS12-381 pool dodge the problems we found on BN254?</summary>
                <p>
                    No. Neither the withdrawn densless verifier nor the covenant's missing sibling pin
                    was curve-specific: the first is a construction, the second was our own script logic.
                    Both are now fixed in the deployed BN254 role-2 pool — the reviewed sound verifier,
                    with the pool rules inside role 2 and the sibling gone entirely. A BLS12-381 pool
                    would need the same role-2 treatment; the curve is a separate axis. The 3-out v3
                    (184,528 constraints, +0.58%) is a note-management layer, not a curve: a BLS12-381
                    pool would need the same 3-out, deposit, nullifier-set and note-delivery work, plus
                    its own new ceremony.
                </p>
            </details>
        </div>
    </section>

    <!-- ── Sources ── -->
    <section id="sources" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
        <div class="reveal">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">06 · sources</p>
            <h2 class="mt-3 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">Sources</h2>
        </div>
        <div class="mt-10 grid gap-4 sm:grid-cols-2">
            <a v-for="s in SOURCES" :key="s.href" :href="s.href" target="_blank" rel="noopener" class="doc-card reveal">
                <h3 class="font-mono text-sm text-lime-300">{{ s.label }}</h3>
                <p class="mt-2 break-all font-mono text-[0.78rem] text-slate-300">{{ s.href }}</p>
            </a>
        </div>
    </section>

    <!-- ── Pager ── -->
    <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24">
        <div class="pager reveal">
            <NuxtLink to="/research/bn254" class="pager-link">
                <span class="pager-dir">← previous</span>
                <span class="pager-title">BN254</span>
            </NuxtLink>
            <NuxtLink to="/ceremony" class="pager-link right">
                <span class="pager-dir">next topic →</span>
                <span class="pager-title">Trusted Setup · The Hush Ceremony</span>
            </NuxtLink>
        </div>
    </section>

</template>
