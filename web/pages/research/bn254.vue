<!-- web/pages/research/bn254.vue — topic 05 (the curve we shipped on) -->

<script setup lang="ts">
/* Shared shell + styles come from layouts/research.vue (user refactor 2026-11-13). */
definePageMeta({
    layout: 'research',
})

/* OpenGraph + Twitter + canonical (shared composable; per-page poster).
   NOTE: reuses the hub poster — a dedicated bn254 poster is a follow-up. */
useOg({
    title: `BN254 — Hush Your Money`,
    description: `BN254 (alt_bn128): the 254-bit pairing-friendly curve the shielded pool was built on. Circuit, verifier generations, measured op-costs, the trusted-setup transcript, and the soundness withdrawal that forced a replacement — with every number sourced.`,
    path: '/research/bn254',
    image: '/posters/research.jpg',
    type: 'article',
    imageAlt: `BN254 — the 254-bit pairing-friendly curve behind the shielded pool`,
})

/* Scroll-reveal (shared composable). */
useReveal()

/* ── Curve parameters (verified: groth16_cashscript/singleton/bls12-381/README.md
      curve comparison table, fetched 2026-11-23; circom --help on the apecsdev VM) ── */
const PARAMS = [
    { k: 'family', v: 'BN (Barreto–Naehrig) · pairing-friendly · embedding degree 12' },
    { k: 'base prime', v: '254-bit · 32 B serialized field element' },
    { k: 'G1 b', v: '3' },
    { k: 'G2 twist', v: 'D-twist' },
    { k: 'ξ (sextic)', v: '9 + u' },
    { k: 'ate loop', v: 'NAF of 6x+2, plus Q1/Q2 ψ post-step · x positive' },
    { k: 'line mul', v: 'mul034 (divisive)' },
    { k: 'final exp', v: 'BN scheme' },
    { k: 'compiler', v: 'circom 2.2.3, --prime bn128 (the default) — verified via circom --help' },
    { k: 'toolchain', v: 'snarkjs groth16 · r1cs reports curve bn-128' },
]

/* ── Our measured circuit numbers ── */
const STATS = [
    { value: '183,472', label: 'constraints · single-asset', tag: 'measured', color: 'text-lime-300' },
    { value: '186,007', label: 'constraints · multi-asset', tag: 'measured', color: 'text-lime-300' },
    { value: '2', label: 'public inputs', tag: 'measured', color: 'text-cyan-300' },
    { value: '128 B', label: 'Groth16 proof', tag: 'derived', color: 'text-violet-300' },
    { value: '27,624 B', label: 'reviewed sound verifier', tag: 'cited', color: 'text-white' },
]

/* ── The two verifier generations we have touched ── */
const GENERATIONS = [
    {
        name: 'densless-msm',
        state: 'withdrawn',
        badge: 'badge-error',
        bytes: '35,626 B',
        inputs: '5 inputs',
        op: '24.3M op',
        redeem: '347 B covenant / 574 B exec / 6044 B genesis / 4415 B terminal',
        note: 'The build every pool here deployed (gate3, gate6, gate6b, mainnet). Withdrawn by its author on 2026-10-26 under finding F6: the shared Miller event consumes slopes without the tangent/chord equations, and the terminal compares a value with itself instead of checking the B endpoint. Its vk_x MSM does repair the public-input binding — which is what our red-team numbers actually measured.',
    },
    {
        name: 'bch-groth16-bn254-sound-native',
        state: 'reviewed',
        badge: 'badge-done',
        bytes: '27,624 B',
        inputs: '3 inputs',
        op: '20.72M op',
        redeem: '65 B, identical in all three inputs (locking aa20 d9ba…a11a 87)',
        note: 'Independently reviewed 2026-10-26. Sound by construction: every accept-relevant value is computed on-chain, a baked VK constant, hash-committed before any challenge it meets, or fixed by an exact field or integer equation. Smaller, cheaper and two inputs fewer than the withdrawn build. Verifies the same relation under the same verifying key — so it needs NO new trusted setup. It is NOT a drop-in beside a covenant, though: its graph pins exactly 3 inputs, every one of them spending the same P2SH32, and forbids any funding or fee input with another locking. Our pool needs a covenant sibling and a fee input, so the route is to extend its third role with the pool rules (the README\'s supported integration point: "applications that release funds add output rules in role 2").',
    },
]

/* ── Verifier engineering constraints on BCH ── */
const LIMITS = [
    { k: 'script cap', v: '10,000 B per input — a full pairing check does not fit' },
    { k: 'op budget', v: '(41 + unlockingLength) × 800 per input — ≈ 8.03M for a max-size input' },
    { k: 'consequence', v: 'the verifier MUST be split across inputs and/or transactions' },
    { k: 'our covenant', v: 'requires the verifier as sibling inputs in the SAME transaction' },
]

/* ── Sources ── */
const SOURCES = [
    { label: 'groth16_cashscript — verifiers.md (the map, incl. F6)', href: 'https://github.com/mr-zwets/groth16_cashscript/blob/main/verifiers.md' },
    { label: 'densless-msm — the withdrawal record', href: 'https://github.com/mr-zwets/groth16_cashscript/blob/main/chunked/bn254/densless-msm/README.md' },
    { label: 'bn-native-sound — the reviewed replacement', href: 'https://github.com/mr-zwets/groth16_cashscript/blob/main/chunked/bn254/bn-native-sound/README.md' },
    { label: 'zk-verifier-bench — the grading harness', href: 'https://github.com/mr-zwets/zk-verifier-bench' },
    { label: 'perpetualpowersoftau — the BN254 ceremony transcript', href: 'https://github.com/privacy-scaling-explorations/perpetualpowersoftau' },
    { label: 'our circuit + design records', href: 'https://github.com/APECSdev/pusd-shielded-pool' },
]
</script>

<template>

    <!-- ── Topic hero ── -->
    <section class="relative z-10 mx-auto flex min-h-[72vh] w-full max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-14 text-center">

        <NuxtLink to="/research" class="crumb animate-rise" style="animation-delay: 0.04s">
            research <span class="sep">/</span> bn254
        </NuxtLink>

        <p class="animate-rise mt-6 font-mono text-[0.8rem] uppercase tracking-[0.5em] text-violet-200 sm:text-xs" style="animation-delay: 0.1s">
            05 · the curve we shipped on
        </p>

        <h1 class="animate-rise mt-5 font-display text-[clamp(2.6rem,9vw,6.2rem)] font-extrabold leading-[0.95] tracking-tight text-white" style="animation-delay: 0.16s">
            BN254
        </h1>

        <p class="animate-rise mt-6 max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg" style="animation-delay: 0.22s">
            The 254-bit pairing-friendly curve the shielded pool was built on — Ethereum's
            <code class="text-violet-200">alt_bn128</code>, circom's default, and the curve with the
            cheapest on-chain verifier anyone has measured on Bitcoin Cash. This page records what it
            costs, what it gives up, and the one verifier generation we had to retract.
        </p>

        <div class="animate-rise mt-9 flex flex-wrap items-center justify-center gap-3" style="animation-delay: 0.28s">
            <a href="#numbers" class="btn-primary btn-pulse">The Numbers</a>
            <a href="#generations" class="btn-ghost">Verifier Generations</a>
        </div>

        <p class="animate-rise mt-10 max-w-2xl font-mono text-[0.78rem] leading-relaxed text-slate-300" style="animation-delay: 0.34s">
            [measured] = first-party measurement with a recorded source ·
            [cited] = third-party bench number ·
            [derived] = arithmetic from the curve parameters · nothing here is estimated
        </p>
    </section>

    <!-- ── Key numbers ── -->
    <section class="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24">
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div v-for="(s, i) in STATS" :key="s.label" class="stat-card reveal" :style="{ transitionDelay: (i * 0.08) + 's' }">
                <div class="font-display text-2xl font-extrabold sm:text-3xl" :class="s.color">{{ s.value }}</div>
                <div class="mt-2 text-xs uppercase tracking-widest text-slate-100">{{ s.label }}</div>
                <div class="mt-1 font-mono text-[0.78rem] text-slate-200">[{{ s.tag }}]</div>
            </div>
        </div>
    </section>

    <!-- ── 01 What it is ── -->
    <section id="what" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
        <div class="grid items-start gap-12 lg:grid-cols-[1fr,1.3fr]">
            <div class="reveal">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">01 · the object</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    What BN254<br />Actually Is
                </h2>
                <p class="mt-5 text-sm leading-relaxed text-slate-200">
                    A Barreto–Naehrig curve over a 254-bit prime with embedding degree 12. Every
                    arithmetic operation inside the circuit happens in a 254-bit field, so a single
                    field element is one 32-byte word — no limb splitting, no carry games. That is why
                    the constraint counts are what they are.
                </p>
            </div>

            <div class="reveal" style="transition-delay: 0.12s">
                <div class="fact-card">
                    <div class="flex items-center justify-between gap-3">
                        <h3 class="font-mono text-sm text-lime-300">parameters, as we build against them</h3>
                        <span class="badge badge-done">verified</span>
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

    <!-- ── 02 Why it was chosen ── -->
    <section id="why" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
        <div class="reveal">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">02 · the choice</p>
            <h2 class="mt-3 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                Why This Curve, and Not Another
            </h2>
            <p class="mt-5 max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg">
                Four reasons, in the order they actually mattered. Only one of them is about the curve
                itself.
            </p>
        </div>

        <div class="mt-10 grid gap-6 lg:grid-cols-2">
            <div class="fact-card reveal">
                <span class="step-num">i</span>
                <h3 class="mt-3 font-display text-xl font-bold text-white">The toolchain default</h3>
                <p class="mt-3 text-sm leading-relaxed text-slate-200">
                    <code class="text-lime-200">circom</code> compiles to BN254 unless you pass
                    <code class="text-lime-200">--prime</code>. <code class="text-lime-200">snarkjs</code> generates and
                    verifies BN254 Groth16 proofs by default. Choosing anything else means opting out of
                    the default path of both tools — a real cost when the goal was to prove the pool
                    could exist at all.
                </p>
            </div>

            <div class="fact-card reveal" style="transition-delay: 0.08s">
                <span class="step-num">ii</span>
                <h3 class="mt-3 font-display text-xl font-bold text-white">The cheapest verifier measured</h3>
                <p class="mt-3 text-sm leading-relaxed text-slate-200">
                    On the BCH VM the verifier is the expensive part, not the prover. Across every
                    construction the public bench has graded, the smallest deployable sound verifier is
                    BN254 at <strong class="text-white">27,624 B in 3 inputs</strong>. The smallest sound
                    BLS12-381 verifier is 34,229 B in 4. On a chain where bytes are fees, that gap is
                    the argument.
                </p>
            </div>

            <div class="fact-card reveal" style="transition-delay: 0.16s">
                <span class="step-num">iii</span>
                <h3 class="mt-3 font-display text-xl font-bold text-white">A ceremony transcript already exists</h3>
                <p class="mt-3 text-sm leading-relaxed text-slate-200">
                    The Perpetual Powers of Tau transcript is BN254. Ours is
                    <code class="text-cyan-200">ppot_0080_18.ptau</code> — 302,083,218 B, sha256
                    <code class="text-cyan-200">9693220206afab749e3d88d4ab5fdf5d36120ea102e7e587ccea0e7a5208e711</code>.
                    A different curve means a different transcript means a different ceremony. That is
                    the single most expensive consequence of a curve change, and it is why the curve
                    decision and the ceremony decision should be made together.
                </p>
            </div>

            <div class="fact-card reveal" style="transition-delay: 0.24s">
                <span class="step-num">iv</span>
                <h3 class="mt-3 font-display text-xl font-bold text-white">The verifier engineering existed</h3>
                <p class="mt-3 text-sm leading-relaxed text-slate-200">
                    A full Groth16 pairing check does not fit in one BCH input. Someone had to work out
                    how to split the Miller loop and the final exponentiation across inputs, hand state
                    over byte-exactly, and stay inside a per-input op budget. That work existed for
                    BN254 first. Building it for another curve would have been a research project of
                    its own — which is exactly what the BLS12-381 pages now document.
                </p>
            </div>
        </div>
    </section>

    <!-- ── 03 The numbers ── -->
    <section id="numbers" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
        <div class="reveal">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">03 · the numbers</p>
            <h2 class="mt-3 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                What It Measured
            </h2>
            <p class="mt-2 font-mono text-xs text-slate-200">first-party measurements on chipnet, 2026-10/11 · hardware spec for proving times UNMEASURED</p>
        </div>

        <div class="reveal mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
            <table class="data-table min-w-[720px]">
                <thead>
                    <tr>
                        <th scope="col">quantity</th>
                        <th scope="col">value</th>
                        <th scope="col">tag</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">single-asset circuit</td>
                        <td class="text-slate-100">183,472 constraints · 107 private inputs · 181,959 wires</td>
                        <td class="font-mono text-[0.82rem] text-slate-200">measured</td>
                    </tr>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">multi-asset circuit</td>
                        <td class="text-slate-100">186,007 constraints (+1.38%) · variant b, Poseidon(6) note</td>
                        <td class="font-mono text-[0.82rem] text-slate-200">measured</td>
                    </tr>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">public inputs</td>
                        <td class="text-slate-100">2 — <code>[merkleRoot, actionHash]</code> · vk <code>IC</code> length 3</td>
                        <td class="font-mono text-[0.82rem] text-slate-200">measured</td>
                    </tr>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">Groth16 proof</td>
                        <td class="text-slate-100">128 B — 2 × G1 (32 B) + 1 × G2 (64 B)</td>
                        <td class="font-mono text-[0.82rem] text-slate-200">derived</td>
                    </tr>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">proving time</td>
                        <td class="text-slate-100">16.967 s (183,472) · 17.6 s (186,007) · snarkjs fullProve</td>
                        <td class="font-mono text-[0.82rem] text-slate-200">measured</td>
                    </tr>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">covenant redeem</td>
                        <td class="text-slate-100">347 B — identical for every asset (category is a constructor arg)</td>
                        <td class="font-mono text-[0.82rem] text-slate-200">measured</td>
                    </tr>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">verifier, as deployed</td>
                        <td class="text-slate-100">35,626 B · 5 inputs · 24.3M op · <strong class="text-rose-200">withdrawn</strong></td>
                        <td class="font-mono text-[0.82rem] text-slate-200">measured + cited</td>
                    </tr>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">verifier, reviewed sound</td>
                        <td class="text-slate-100">27,624 B · 3 inputs · 20.72M op · not yet deployed</td>
                        <td class="font-mono text-[0.82rem] text-slate-200">cited</td>
                    </tr>
                    <tr>
                        <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">pool-op tx size</td>
                        <td class="text-slate-100">~36.8 – 37.8 KB per shielded operation</td>
                        <td class="font-mono text-[0.82rem] text-slate-200">measured</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <p class="reveal mt-4 font-mono text-[0.8rem] leading-relaxed text-slate-200">
            build records: <a href="https://github.com/APECSdev/pusd-shielded-pool" target="_blank" rel="noopener" class="src-link">APECSdev/pusd-shielded-pool ↗</a>
            · deployment: <NuxtLink to="/research/shielded-pool" class="src-link">/research/shielded-pool →</NuxtLink>
        </p>
    </section>

    <!-- ── 04 The two generations ── -->
    <section id="generations" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
        <div class="reveal">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-rose-200">04 · the record</p>
            <h2 class="mt-3 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                Two Verifier Generations
            </h2>
            <p class="mt-5 max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg">
                We have deployed one and reviewed the other. The difference between them is not
                performance — it is whether the argument that a forged proof cannot pass still holds.
            </p>
        </div>

        <div class="mt-10 space-y-6">
            <div v-for="(g, i) in GENERATIONS" :key="g.name" class="fact-card reveal" :style="{ transitionDelay: (i * 0.1) + 's' }">
                <div class="flex flex-wrap items-center gap-3">
                    <h3 class="font-mono text-sm text-white">{{ g.name }}</h3>
                    <span class="ml-auto badge" :class="g.badge">{{ g.state }}</span>
                </div>
                <dl class="mt-4 grid gap-x-8 gap-y-2 font-mono text-[0.82rem] leading-relaxed sm:grid-cols-2">
                    <div class="flex gap-3">
                        <dt class="w-20 shrink-0 uppercase tracking-widest text-slate-300">size</dt>
                        <dd class="text-slate-100">{{ g.bytes }}</dd>
                    </div>
                    <div class="flex gap-3">
                        <dt class="w-20 shrink-0 uppercase tracking-widest text-slate-300">shape</dt>
                        <dd class="text-slate-100">{{ g.inputs }}</dd>
                    </div>
                    <div class="flex gap-3">
                        <dt class="w-20 shrink-0 uppercase tracking-widest text-slate-300">op-cost</dt>
                        <dd class="text-slate-100">{{ g.op }}</dd>
                    </div>
                    <div class="flex gap-3 sm:col-span-2">
                        <dt class="w-20 shrink-0 uppercase tracking-widest text-slate-300">redeems</dt>
                        <dd class="break-all text-slate-100">{{ g.redeem }}</dd>
                    </div>
                </dl>
                <p class="mt-4 border-t border-white/10 pt-4 text-sm leading-relaxed text-slate-200">
                    {{ g.note }}
                </p>
            </div>
        </div>

        <div class="reveal mt-10 rounded-2xl border border-rose-300/40 bg-rose-300/10 px-5 py-4 font-mono text-xs leading-relaxed text-rose-100">
            every pool deployed on this site runs the withdrawn build · the reviewed replacement needs a
            no new trusted setup · it is smaller AND cheaper than what we shipped · but its graph pins 3
            inputs all spending the same P2SH32, so it composes by EXTENDING role 2, not by sitting beside
            a covenant
        </div>
    </section>

    <!-- ── 05 Engineering constraints ── -->
    <section id="limits" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
        <div class="grid items-start gap-12 lg:grid-cols-[1fr,1.3fr]">
            <div class="reveal">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-violet-200">05 · the constraint</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    Why a Pairing<br />Check Has to Be Split
                </h2>
                <p class="mt-5 text-sm leading-relaxed text-slate-200">
                    This is the whole engineering problem, and it is a BCH problem, not a BN254 problem.
                    The same constraint applies to every curve: the verifier is bigger than one input
                    allows, so it must become several inputs that hand state to each other.
                </p>
            </div>

            <div class="reveal space-y-6" style="transition-delay: 0.12s">
                <div class="fact-card">
                    <h3 class="font-mono text-sm text-violet-300">the two hard limits</h3>
                    <dl class="mt-4 space-y-2.5 font-mono text-[0.82rem] leading-relaxed">
                        <div v-for="l in LIMITS" :key="l.k" class="flex gap-3">
                            <dt class="w-28 shrink-0 uppercase tracking-widest text-slate-300">{{ l.k }}</dt>
                            <dd class="break-all text-slate-300">{{ l.v }}</dd>
                        </div>
                    </dl>
                </div>

                <div class="fact-card">
                    <h3 class="font-mono text-sm text-violet-300">how the sound build solves it</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-200">
                        Three roles, one per input, each covering a range of the 65 Miller events — cut at
                        <code class="text-violet-200">[0,24)</code>, <code class="text-violet-200">[24,48)</code>,
                        <code class="text-violet-200">[48,65)</code>. Each role ends by handing over a
                        byte-exact canonical state that the next role pins. The B walk is affine: every
                        doubling and addition reads one 32-byte inverse-norm witness fixed by the exact
                        equation <code class="text-violet-200">t·N(den) ≡ 1</code>, so no prover-supplied
                        evaluation is trusted anywhere.
                    </p>
                    <p class="mt-3 text-sm leading-relaxed text-slate-200">
                        Measured margins per input: <strong class="text-white">5.81% / 5.81% / 5.80%</strong>
                        of the standard-mode budget, <strong class="text-white">6.26% / 6.27% / 6.26%</strong>
                        of consensus. Worst case (every nibble 15) is 11.95% below the 10,000-byte cap
                        budget of 8,032,800.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- ── 06 What it costs you ── -->
    <section id="tradeoffs" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
        <div class="reveal">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-rose-200">06 · the trade</p>
            <h2 class="mt-3 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                What BN254 Gives Up
            </h2>
        </div>

        <div class="mt-10 grid gap-6 lg:grid-cols-3">
            <div class="fact-card reveal">
                <h3 class="font-mono text-sm text-rose-300">security margin</h3>
                <p class="mt-3 text-sm leading-relaxed text-slate-200">
                    BN254's base field is 254 bits, which after the tower and the embedding degree
                    yields a security level materially below the 128-bit target that BLS12-381 was
                    designed for.
                </p>
                <p class="mt-3 font-mono text-[0.78rem] leading-relaxed text-rose-200">
                    [ UNVERIFIED ] — the specific bit figures are commonly cited but we have not
                    obtained a primary citation. We will not publish a number until we can.
                </p>
            </div>

            <div class="fact-card reveal" style="transition-delay: 0.08s">
                <h3 class="font-mono text-sm text-rose-300">the ceremony is curve-bound</h3>
                <p class="mt-3 text-sm leading-relaxed text-slate-200">
                    Powers-of-Tau transcripts are curve-specific. Ours is BN254-only — the PSE
                    repository ships <code class="text-rose-200">phase2-bn254</code> and every
                    instruction targets it. A BLS12-381 pool therefore needs its own multi-party
                    ceremony; the work cannot be reused.
                </p>
            </div>

            <div class="fact-card reveal" style="transition-delay: 0.16s">
                <h3 class="font-mono text-sm text-rose-300">not post-quantum</h3>
                <p class="mt-3 text-sm leading-relaxed text-slate-200">
                    Groth16 is pairing-based. Every construction on this page — on either curve —
                    falls to a sufficiently large quantum computer. The pool's privacy is a
                    present-tense property, not a longevity claim, and we say so on the
                    <NuxtLink to="/research/shielded-pool#limits" class="src-link">pool page</NuxtLink>.
                </p>
            </div>
        </div>
    </section>

    <!-- ── 07 Open questions ── -->
    <section id="open" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
        <div class="reveal">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">07 · open</p>
            <h2 class="mt-3 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                Open Questions
            </h2>
        </div>

        <div class="mt-10 space-y-4">
            <details class="faq-card reveal">
                <summary>Does the sound verifier change the circuit or the setup?</summary>
                <p>
                    No. <code class="text-cyan-200">bch-groth16-bn254-sound-native</code> verifies the
                    same Groth16 relation under the same verifying key — it is a different
                    <em>implementation</em> of the same check. The 183,472-constraint R1CS, the proving
                    key and the ceremony output are all unchanged. What changes is the pool's composition:
                    the sound build pins exactly three inputs, all spending the same P2SH32, and permits no
                    funding input with another locking — so a covenant cannot sit beside it. The pool rules
                    therefore move INTO the verifier's third role, which is the integration the artifact
                    documents ("applications that release funds add output rules in role 2"). That is new
                    code and needs its own review before it carries value.
                </p>
            </details>

            <details class="faq-card reveal">
                <summary>Could a forged proof have drained a pool?</summary>
                <p>
                    Unknown, and we will not pretend otherwise. The withdrawal says no end-to-end false
                    acceptance is claimed — nobody has demonstrated one. What is established is that the
                    on-chain check does not enforce the tangent/chord equations and does not test the B
                    endpoint, so the usual argument is unavailable. Because the pool covenant credits
                    value from the proof's public inputs, an actor able to craft a witness is the threat
                    model. This is why the replacement is the next deployment and not a roadmap item.
                </p>
            </details>

            <details class="faq-card reveal">
                <summary>Is BN254 still the right choice after all this?</summary>
                <p>
                    For the next deployment, yes — and for a reason that is not about the curve: the
                    sound BN254 verifier is the smallest one that exists, it is reviewed, and it needs no
                    new ceremony. The curve decision that actually matters is the one made alongside
                    Gate 7, because that is the step which forces a new transcript either way. See
                    <NuxtLink to="/research/bls12-381" class="src-link">/research/bls12-381</NuxtLink>
                    for the comparison.
                </p>
            </details>

            <details class="faq-card reveal">
                <summary>What would we need to measure to publish a security comparison?</summary>
                <p>
                    Three things: a primary citation for the security level of each curve; a
                    <code class="text-cyan-200">circom --prime bls12381</code> compile of
                    <code class="text-cyan-200">pool.circom</code> to get a real constraint count (we
                    have not run it — <strong class="text-white">UNMEASURED</strong>); and a verifier
                    regeneration under the same VK to confirm the on-chain size delta on our own
                    artifacts rather than the bench's fixtures.
                </p>
            </details>
        </div>
    </section>

    <!-- ── Sources ── -->
    <section id="sources" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
        <div class="reveal">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">08 · sources</p>
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
            <NuxtLink to="/research/coinjoin" class="pager-link">
                <span class="pager-dir">← previous</span>
                <span class="pager-title">CoinJoin</span>
            </NuxtLink>
            <NuxtLink to="/research/bls12-381" class="pager-link right">
                <span class="pager-dir">next topic →</span>
                <span class="pager-title">BLS12-381</span>
            </NuxtLink>
        </div>
    </section>

</template>
