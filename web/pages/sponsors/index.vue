<!-- web/pages/sponsors/index.vue -->

<script setup lang="ts">
/* NOTE: layout 'fullscreen' initializes the Profile/System stores (see layouts/fullscreen.vue). */
definePageMeta({
    layout: 'fullscreen',
})

useHead({
    title: `Sponsors — Hush Your Money`,
    meta: [
        { name: 'description', content: `Support Hush Your Money. Donation addresses for Bitcoin, Bitcoin Cash and Nexa — with Monero, Zcash (shielded) and Dash slots reserved.` }
    ],
})

/* Import modules. */
import QRCode from 'qrcode'

/* Initialize stores. */
import { useSystemStore } from '@/stores/system'
const System = useSystemStore()

/* Scroll-reveal (shared composable). */
useReveal()

// onBeforeUnmount(() => {
//     console.log('Before Unmount!')
//     // Now it's safe to perform setup operations.
// })

/* ── Donation addresses ────────────────────────────────────────────
   NOTE: single donation address per network (former round-1 campaign
   addresses). Monero / Zcash / Dash slots are RESERVED for now. */
const donations = [
    {
        network: 'Bitcoin',
        ticker: 'BTC',
        accent: 'amber',
        address: 'bitcoin:3Gwb2zrg64REcnDFdGHeAUMuibfpk932Kr',
    },
    {
        network: 'Bitcoin Cash',
        ticker: 'BCH',
        accent: 'lime',
        address: 'bitcoincash:qrqdff68n8wm757kvfumylxs47tud3fuvqz3h6depv',
    },
    {
        network: 'Nexa',
        ticker: 'NEXA',
        accent: 'cyan',
        address: 'nexa:nqtsq5g5fxezfwrhc323dm9npzy77lay7p26x903hkk4u8zu',
    },
]

/* Reserved networks — addresses to be added. */
const reserved = [
    { network: 'Monero', ticker: 'XMR', note: 'privacy by default' },
    { network: 'Zcash', ticker: 'ZEC', note: 'shielded pool' },
    { network: 'Dash', ticker: 'DASH', note: 'shielded' },
]

/* QR codes (data urls, generated client-side). */
const qrCodes = ref(null)
const copiedIdx = ref(null)

const init = async () => {
    /* Build QR codes for each live address. */
    const codes = {}

    for (const donation of donations) {
        codes[donation.ticker] = await QRCode.toDataURL(donation.address, {
            margin: 1,
            width: 240,
            color: {
                dark: '#0b1220',
                light: '#e8f0da',
            },
        }).catch(err => console.error(err))
    }

    qrCodes.value = codes
}

const copy = async (_idx) => {
    const donation = donations[_idx]

    /* Copy donation address. */
    await navigator.clipboard.writeText(donation.address)
        .then(() => {
            copiedIdx.value = _idx
        }).catch(err => console.error(err))

    /* Reset "copied" notice. */
    setTimeout(() => {
        copiedIdx.value = null
    }, 2000)
}

onMounted(() => {
    init()
})
</script>

<template>
    <main class="relative min-h-screen w-full overflow-x-clip bg-[#060a10] font-sans text-slate-200 antialiased selection:bg-lime-300 selection:text-slate-900">

        <AuroraBackdrop />

        <!-- GitHub source banner (top-right) -->
        <GithubBanner />

        <div class="relative z-10 mx-auto w-full max-w-4xl px-6 pb-24 pt-24 sm:pt-32">

            <!-- ── Header ── -->
            <section class="reveal text-center">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-lime-300/80">utxo privacy toolkit · support the mission</p>
                <h1 class="mt-6 font-display text-[clamp(2.4rem,7vw,5.5rem)] font-extrabold leading-[1.05] tracking-tight text-white">
                    Sponsors <span>💗</span>
                </h1>
                <p class="mt-6 font-mono text-lg italic text-cyan-200/90 sm:text-xl">
                    Backing the cost of a "fair" FIGHT!
                </p>
                <p class="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300/90 sm:text-lg">
                    Your support is <strong class="font-semibold text-white">SOOOO greatly appreciated!</strong>
                    Donations fund the development of the UTXO privacy toolkit — the CoinJoin
                    wallet, the zero-knowledge shielded-pool research, and decentralized
                    infrastructure. Every contribution helps keep this free and open-source.
                </p>
            </section>

            <!-- ── Live donation addresses ── -->
            <section class="reveal mt-16">
                <h2 class="font-display text-2xl font-bold text-white">
                    Donation addresses
                </h2>

                <div class="mt-8 grid gap-6 sm:grid-cols-3">
                    <div v-for="(d, i) in donations" :key="d.ticker" class="g-card flex flex-col items-center gap-4 !p-6 text-center">
                        <img v-if="qrCodes && qrCodes[d.ticker]" :src="qrCodes[d.ticker]" :alt="`${d.network} donation QR code`" class="h-32 w-32 rounded-xl border border-white/10" />
                        <div v-else class="grid h-32 w-32 place-items-center rounded-xl border border-white/10 bg-white/[0.03] font-mono text-xs text-slate-500">
                            QR...
                        </div>

                        <div>
                            <h3 class="font-display text-lg font-bold text-white">{{ d.network }}</h3>
                            <p class="font-mono text-xs uppercase tracking-[0.3em] text-lime-300/80">{{ d.ticker }}</p>
                        </div>

                        <p class="break-all font-mono text-[0.65rem] leading-4 text-slate-400">
                            {{ d.address }}
                        </p>

                        <button type="button" @click="copy(i)" class="mt-auto w-full rounded-full border border-white/15 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-300 transition-colors hover:border-lime-300/50 hover:text-lime-300">
                            {{ copiedIdx === i ? 'copied ✓' : 'copy address' }}
                        </button>
                    </div>
                </div>
            </section>

            <!-- ── Reserved slots ── -->
            <section class="reveal mt-16">
                <h2 class="font-display text-2xl font-bold text-white">
                    Reserved networks
                </h2>

                <p class="mt-3 text-sm leading-relaxed text-slate-400">
                    Slots reserved for shielded-network donations — addresses coming soon.
                </p>

                <div class="mt-8 grid gap-6 sm:grid-cols-3">
                    <div v-for="r in reserved" :key="r.ticker" class="g-card flex flex-col items-center gap-3 !p-6 text-center opacity-60">
                        <div class="grid h-16 w-16 place-items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] font-display text-lg font-bold text-slate-400">
                            {{ r.ticker }}
                        </div>

                        <h3 class="font-display text-lg font-bold text-white">{{ r.network }}</h3>
                        <p class="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-slate-500">{{ r.note }}</p>
                        <p class="mt-auto font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-600">
                            reserved slot
                        </p>
                    </div>
                </div>
            </section>

            <!-- ── Please note ── -->
            <section class="reveal mt-16">
                <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <h3 class="font-mono text-xs font-bold uppercase tracking-[0.25em] text-rose-400">
                        Please note
                    </h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-300">
                        Send donations from a wallet you control.
                        <strong class="font-semibold text-white">Do NOT send from an exchange</strong> —
                        we cannot reconcile exchange deliveries, and funds sent to a wrong
                        network cannot be recovered.
                    </p>
                </div>
            </section>

        </div>

        <!-- ── Footer (link parity with homepage) ── -->
        <Footer />

    </main>
</template>

<style scoped>
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

@media (prefers-reduced-motion: reduce) {
    .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
}
</style>
