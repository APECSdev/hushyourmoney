<!-- web/pages/readme.vue -->

<script setup lang="ts">
/* NOTE: layout 'fullscreen' initializes the Profile/System stores (see layouts/fullscreen.vue). */
definePageMeta({
    layout: 'fullscreen',
})

useHead({
    title: `README — Hush Your Money`,
    meta: [
        { name: 'description', content: `The Hush README: a practical, add-on privacy solution for UTXO-based networks — CashShuffle & CashFusion CoinJoins, zero-knowledge research, and the BCHDevCon3 origin story.` }
    ],
})

/* Initialize stores. */
import { useSystemStore } from '@/stores/system'
const System = useSystemStore()

// onMounted(() => {
//     console.log('Mounted!')
//     // Now it's safe to perform setup operations.
// })

// onBeforeUnmount(() => {
//     console.log('Before Unmount!')
//     // Now it's safe to perform setup operations.
// })

/* Scroll-reveal (shared composable). */
useReveal()
</script>

<template>
    <main class="relative min-h-screen w-full overflow-x-clip bg-[#060a10] font-sans text-slate-200 antialiased selection:bg-lime-300 selection:text-slate-900">

        <AuroraBackdrop />

        <!-- GitHub source banner (top-right) -->
        <GithubBanner />

        <div class="relative z-10 mx-auto w-full max-w-4xl px-6 pb-24 pt-24 sm:pt-32">

            <!-- ── Header ── -->
            <section class="reveal text-center">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-lime-300/80">utxo privacy toolkit · documentation</p>
                <h1 class="mt-6 font-display text-[clamp(2.4rem,7vw,5.5rem)] font-extrabold leading-[1.05] tracking-tight text-white">
                    Hush <span class="text-gradient">README</span>
                </h1>

                <h3 class="mt-6 font-display text-xl text-cyan-200/90 sm:text-2xl">
                    tl;dr — a practical, <span class="whitespace-nowrap">add-on</span> privacy solution for UTXO-based networks
                </h3>

                <section class="mt-12 flex justify-center"><pre class="text-base font-bold tracking-widest leading-8 text-lime-300 sm:text-lg">
    FORM : Scalable + Secure + Decentralized
FUNCTION : Tokenized Assets + Smart Contracts
 FREEDOM : (Always-on) Private Transactions
        </pre></section>
            </section>

            <!-- ── BCHDevCon3 banner (winner) ── -->
            <NuxtLink to="https://github.com/BCHDEVCON3/hush-your-money#hush-your-money" target="_blank" class="reveal group mt-16 flex flex-col gap-5">
                <div class="relative overflow-hidden rounded-[2rem] border border-lime-300/20 bg-gradient-to-br from-lime-300/10 via-transparent to-violet-300/10 p-7 shadow-[0_24px_80px_-40px_rgba(190,242,100,0.35)] transition-colors group-hover:border-lime-300/40">
                    <div class="flex flex-row items-center justify-around gap-4">
                        <h3 class="font-display text-2xl font-bold text-white sm:text-3xl">
                            BCHDEVCON3 Hackathon
                            <span class="text-gradient block text-4xl font-extrabold uppercase sm:text-6xl">Winner!</span>
                        </h3>

                        <img src="~/assets/winner.gif" class="-my-2 h-36 w-auto sm:-mt-8 sm:-mb-8 sm:h-48" />
                    </div>
                </div>

                <small class="text-center text-sm font-bold italic text-slate-500 transition-colors group-hover:text-lime-300">
                    Click to learn about Where, When &amp; How <span class="text-base font-bold">Hush Your Money</span> was born!
                </small>
            </NuxtLink>

            <!-- ── Origin story ── -->
            <section class="reveal mt-16 flex flex-col gap-5">
                <h2 class="font-display text-3xl font-bold text-white">
                    Origin Story
                </h2>

                <p>
                    Hush Your Money was born at <strong class="font-semibold text-white">BCHDevCon3</strong>, the September 2020
                    Bitcoin Cash developer hackathon. The original entry —
                    <a href="https://github.com/BCHDEVCON3/hush-your-money" target="_blank" rel="noopener" class="link-cyan">github.com/BCHDEVCON3/hush-your-money</a> —
                    was a web-based solution for <strong class="font-semibold text-white">CashShuffle</strong>
                    (and a path to CashFusion) integration into the Bitcoin.com mobile wallet,
                    built on the wallet's 3rd-party app API, <strong class="font-semibold text-white">Bitcoin.com Link</strong>.
                </p>

                <p>
                    After years of frustration with broken promises of fungible crypto payments — and earlier privacy
                    work on <a href="https://gitlab.com/bchplease/nito.cash" target="_blank" rel="noopener" class="link-cyan">Nito Cash</a>
                    and the <a href="https://app.nitojs.org" target="_blank" rel="noopener" class="link-cyan">NitoJS App</a> —
                    the hackathon provided the direct connection with the Bitcoin.com wallet team needed to push mobile privacy forward.
                    The project took <strong class="font-semibold text-white">1st place</strong>.
                </p>

                <h3 class="mt-2 font-display text-lg font-bold text-cyan-200">
                    The three event goals
                </h3>

                <ol class="list-decimal space-y-2 pl-10 leading-relaxed">
                    <li><strong class="font-semibold text-white">Establish a Bitcoin.com "working" relationship</strong> — direct access and resources toward a CashFusion integration into their mobile wallet.</li>
                    <li><strong class="font-semibold text-white">Add a CashShuffle DApp to Discover</strong> — in-app access to Hush with the confidence of a native integration.</li>
                    <li><strong class="font-semibold text-white">Build a privacy analyzer</strong> — paste an address or transaction id, receive a Privacy Score with a detailed breakdown (inspired by Blockchair's Privacy-o-meter).</li>
                </ol>

                <h3 class="mt-2 font-display text-lg font-bold text-cyan-200">
                    Stretch goal
                </h3>

                <p>
                    Extend the Bitcoin.com Link API (then 5 methods: <code class="code-chip">getAddress</code>,
                    <code class="code-chip">sendAssets</code>, <code class="code-chip">payInvoice</code>,
                    <code class="code-chip">createToken</code>, <code class="code-chip">getWalletProviderStatus</code>)
                    with a new <code class="code-chip">getAccount</code> method — calling for the wallet's
                    Extended Public Key (xPub) so applications could query ALL addresses owned by the wallet,
                    enabling automated shuffle verification, privacy analysis and alerts.
                </p>

                <h3 class="mt-2 font-display text-lg font-bold text-cyan-200">
                    Q&amp;A (from the original README)
                </h3>

                <p>
                    <strong class="font-semibold text-white">Q:</strong> Will this project allow me to use CashFusion
                    from within the Bitcoin.com wallet?<br />
                    <strong class="font-semibold text-white">A:</strong> There's a 100% chance of that NOT happening by the end
                    of the hackathon. However, the project advances the groundwork necessary to see that happen.
                </p>

                <h3 class="mt-2 font-display text-lg font-bold text-cyan-200">
                    Artifacts
                </h3>

                <ul class="space-y-1 pl-10 leading-relaxed">
                    <li>Original repo: <a href="https://github.com/BCHDEVCON3/hush-your-money" target="_blank" rel="noopener" class="link-cyan">BCHDEVCON3/hush-your-money</a> (includes the full <em>Activity Journal</em>)</li>
                    <li>Hackathon presentation: <a href="https://lbry.tv/@BCHPlease:1/BCHDevCon3-Hush-Your-Money-Presentation:7" target="_blank" rel="noopener" class="link-cyan">LBRY — BCHDevCon3 Hush Your Money Presentation</a></li>
                    <li>Fundraiser: <a href="https://causes.cash/@bchplease/hush-your-money-7a1589216c59" target="_blank" rel="noopener" class="link-cyan">causes.cash — Help bring CashFusion to your mobile wallet</a></li>
                </ul>
            </section>

            <!-- ── Why ── -->
            <section class="reveal mt-16 flex flex-col gap-5">
                <h2 class="font-display text-3xl font-bold text-white">
                    Why Hush Your Money?
                </h2>

                <NuxtLink to="https://z.cash/zcashs-privacy-is-normal-goes-viral/" target="_blank" class="link-cyan flex flex-row items-baseline gap-2 pl-5 text-xl font-bold">
                    Because <span class="text-2xl">Privacy is normal</span>

                    <svg class="h-5 w-auto" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path>
                    </svg>
                </NuxtLink>

                <p class="text-justify">
                    Today, MOST privacy networks aim to offer their users a PERFECT privacy solution.
                    Hush Your Money (HYM) aims to offer the MOST "practical balance" between <span class="font-bold">Form</span>, <span class="font-bold">Function</span> and <span class="font-bold">Freedom</span> —
                    to deliver a family of the MOST widely accessible privacy networks the world has ever seen...
                </p>

                <p class="text-center text-2xl font-bold italic leading-[50px] text-cyan-200">
                    Incognito Network <span class="text-3xl text-cyan-300">(Nito)</span> is a cross-chain <NuxtLink to="https://nexa.wiki/supernet" target="_blank" class="text-3xl font-bold text-cyan-300 hover:underline">Supernet</NuxtLink> designed explicitly to meet the <span class="text-3xl text-lime-300">&ldquo;everyday&rdquo;</span> privacy needs for <span class="text-3xl text-lime-300">99%</span> of users.
                </p>

                <p class="text-justify">
                    Nito uniquely offers Content Creators and Application Developers the MOST functionally capable Crypto network, <span class="font-bold italic">with FULL support for BOTH Tokenized Assets and Smart Contracts on Layer 1+ (Plus)</span>, while offering uncompromising, trustless and permissionless financial privacy for their communities <span class="font-bold">AT ALL TIMES.</span>
                </p>
            </section>

            <div class="doc-card reveal mt-16"><ReadmeToc /></div>

            <div class="doc-card reveal mt-8"><ReadmeIntro /></div>

            <div class="doc-card reveal mt-8"><ReadmeFullPrivacy /></div>

            <!-- ── Guardians ── -->
            <section class="doc-card reveal mt-8 flex flex-col gap-5">
                <h2 class="font-display text-3xl font-bold text-white">
                    (Transaction) Guardians
                </h2>

                <div>
                    Guardians are a managed set of approx. 1,024 "Community UTXOs".
                    Guardians are
                    <NuxtLink to="https://awesomenexa.org/contracts" target="_blank" class="link-cyan font-bold">
                        Wise Contracts

                        <svg class="inline h-5 w-auto" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path>
                        </svg>
                    </NuxtLink> that protect your privacy during the transaction process by masking:

                    <ul class="list-disc py-3 pl-10">
                        <li>the Sender</li>
                        <li>the Receiver</li>
                        <li>the Asset Identifier</li>
                        <li>the Transfer Amount</li>
                        <li class="line-through">the Sender's Location</li>
                    </ul>
                </div>

                <div class="flex flex-col gap-5">
                    <h3 class="text-sm font-bold text-rose-400">
                        <span class="block font-bold uppercase">PLease Note:</span>
                        Location (ie IP address) obfuscation is delegated to 3rd-parties (eg. VPN and/or TOR) providers.
                        <span class="block text-lg italic">This is a FEATURE!</span>
                        Hush has been specifically designed to support the greatest number of Wallet integrations &amp; compatibilities across the Crypto ecosystem.
                        Hush aims to meet the primary needs for 99% of users, without sacrificing privacy!
                    </h3>
                </div>
            </section>

            <!-- ── Incognito address format ── -->
            <section class="doc-card reveal mt-8 flex flex-col gap-5">
                <h2 class="font-display text-3xl font-bold text-white">
                    Incognito Address Format
                </h2>

                <h3 class="font-mono text-xl font-bold tracking-widest text-lime-300">
                    nito:nqtsq5g5sp33aj07d808w8xvv7kuarwcrv3z2fvskw2ej7dj
                </h3>

                <p>
                    An address format that's very easy on the eyes.
                </p>
            </section>

            <!-- ── Inscriptions ── -->
            <section class="doc-card reveal mt-8 flex flex-col gap-5">
                <h2 class="font-display text-3xl font-bold text-white">
                    Inscriptions: <code class="italic text-amber-300">OP_DATA</code> or <code class="italic text-amber-300">OP_RETURN</code>
                </h2>

                <p>
                    A compact data format is immutable stored on the Host network for EVERY Hush transaction.
                </p>

<pre class="code-block text-sm">04 NITO (protocol id)
20 921aa05b86a1bc9dc1d99583e2932657696e82cf9051219e3dccaeecfd463ee9 (nito tx idem)
14 875a1f6d7a6e33e27d61c43c26b70d4b8886f726 (aes read-ONLY key)</pre>

                <p>
                    A compact data format is immutable stored on the Host network for EVERY Hush transaction.
                </p>
            </section>

            <!-- ── Commitment centers ── -->
            <section class="doc-card reveal mt-8 flex flex-col gap-5">
                <h2 class="font-display text-3xl font-bold text-white">
                    Commitment Centers: A Universal Truth
                </h2>

                <p>
                    Every transaction will update the <span class="text-lg font-bold">Global (Merkle) Root</span> using an "accumulator";
                    which offers an efficient variation on the standard Bitcoin-style Merkle trees.
                </p>

                <p>
                    Commitment Centers (CCs) manage the Unspent Transaction Output (UTXO) history.
                </p>
            </section>

            <div class="doc-card reveal mt-8"><ReadmeSharding /></div>

            <div class="doc-card reveal mt-8"><ReadmeSupernets /></div>

            <div class="doc-card reveal mt-8"><ReadmeCoinJoins /></div>

            <!-- ── Flux Cloud ── -->
            <section class="doc-card reveal mt-8 flex flex-col gap-5">
                <h2 class="font-display text-3xl font-bold text-white">
                    Flux Cloud
                </h2>

                <p>
                    Flux Cloud <span class="font-bold">(ticker:
                        <NuxtLink to="https://coinmarketcap.com/currencies/zel/" target="_blank" class="link-cyan hover:underline">
                            FLUX

                            <svg class="inline h-5 w-auto" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path>
                            </svg>
                        </NuxtLink>)</span> is the most decentralized and fastest growing network in the world.
                    Its peer-powered cloud computing network offers enterprise-level infrastructure for Incognito Network's MOST demanding decentralized applications.
                </p>

                <p class="text-sm italic">
                    FluxCloud is connected worldwide, across all continents.
                    Its strongest Availability Zones are the EU and United States.
                </p>

                <p>
                    Although Flux Cloud will continue to offer users the MOST convenient gateway into Incognito Network (Nito);
                    the long-term solution is to encourage ALL clients to utilize <span class="text-base font-bold">Nexa's (PoW-secured) CAPD</span> communications network (at least as a fallback).
                </p>
            </section>

            <!-- ── CAPD ── -->
            <section class="doc-card reveal mt-8 flex flex-col gap-5">
                <h2 class="font-display text-3xl font-bold text-white">
                    Counterparty and Protocol Discovery (CAPD)
                </h2>

                <NuxtLink to="https://spec.nexa.org/network/capd/" target="_blank" class="link-cyan text-lg font-bold hover:underline">
                    https://spec.nexa.org/network/capd/

                    <svg class="inline h-5 w-auto" data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path>
                    </svg>
                </NuxtLink>

                <p>
                    A transient decentralized anonymous content-addressable messaging service that allows participants to to discover transaction partners and execute protocols with them.
                </p>

                <p>
                    Proof of work is used to discourage spam.
                </p>
            </section>

            <div class="doc-card reveal mt-8"><ReadmeEphemeralDb /></div>

            <div class="doc-card reveal mt-8"><ReadmeMineable /></div>

        </div>

        <!-- ── Footer (link parity with homepage) ── -->
        <Footer />

    </main>
</template>

<style scoped>
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

.code-chip {
    font-family: "Space Mono", ui-monospace, monospace;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.4rem;
    padding: 0.1rem 0.45rem;
    color: #bef264;
    font-size: 0.85em;
}

.code-block {
    font-family: "Space Mono", ui-monospace, monospace;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.8rem;
    padding: 1rem 1.25rem;
    color: #bef264;
    overflow-x: auto;
    white-space: pre;
}

/* ── Scroll reveal ───────────────────────────────────────────────── */
.reveal {
    opacity: 0;
    transform: translateY(26px);
    transition: opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1), transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal.is-visible { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
    .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
}
</style>
