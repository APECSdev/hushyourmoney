<script setup lang="ts">
definePageMeta({
    layout: 'fullscreen',
})

/* Route shape: /help/<network>/<guide>. Only the BCH wallet-integration guide
   exists, so every other shape is a genuine 404. Before this guard the page
   answered HTTP 200 for /help/xyz and /help/xyz/abc and rendered a visible
   "DEBUG: <param>" line — an unbounded soft-404 space plus a debug artifact. */

const route = useRoute()

const networkid = route?.params?.pageid[0]
const guideid = route?.params?.pageid[1]

const GUIDES = {
    bch: 'wallet-integration',
}

const isKnown = typeof networkid === 'string'
    && networkid in GUIDES
    && guideid === GUIDES[networkid]

if (!isKnown) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Guide not found',
        fatal: true,
    })
}

useHead({
    title: `BCH Wallet Integration — Hush Your Money`,
    meta: [
        { name: 'description', content: `How a Bitcoin Cash wallet integrates with Hush Your Money.` }
    ],
})
</script>

<template>
    <DocsShell>
        <main id="main-content" tabindex="-1" class="flex flex-col gap-6">
            <h1 class="font-display text-4xl font-bold text-white sm:text-5xl">
                Guides
            </h1>

            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <HelpBCHWalletIntegration />
            </div>
        </main>
    </DocsShell>
</template>
