/* Import modules. */
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    /* Application Settings */
    app: {
        /* Application Header */
        head: {
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
            title: `Hush Your Money — Spend Privately. Fearlessly!`,
            meta: [
                { name: 'description', content: `Free, open-source, non-custodial UTXO privacy toolkit. Shuffle and fuse your coins with CashShuffle and CashFusion CoinJoin — spend privately, fearlessly.` },
                { property: 'og:type', content: 'website' },
                { property: 'og:site_name', content: 'Hush Your Money' },
                { property: 'og:title', content: `Hush Your Money — Spend Privately. Fearlessly!` },
                { property: 'og:description', content: `Free, open-source, non-custodial UTXO privacy toolkit. CashShuffle & CashFusion CoinJoin rounds, zero-knowledge research, browser-native. No accounts. No custodians.` },
                { property: 'og:url', content: 'https://hushyourmoney.com/' },
                { property: 'og:image', content: 'https://hushyourmoney.com/poster.jpg' },
                { property: 'og:image:width', content: '2400' },
                { property: 'og:image:height', content: '1260' },
                { name: 'twitter:card', content: 'summary_large_image' },
                { name: 'twitter:title', content: `Hush Your Money — Spend Privately. Fearlessly!` },
                { name: 'twitter:description', content: `Free, open-source, non-custodial UTXO privacy toolkit. Shuffle & fuse with CoinJoin. No accounts. No custodians.` },
                { name: 'twitter:image', content: 'https://hushyourmoney.com/poster.jpg' },
                { name: 'theme-color', content: '#060a10' },
            ],
            link: [
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Unbounded:wght@200..900&family=Space+Grotesk:wght@300..700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap' },
            ],
        },
    },

    /* Global stylesheet (keyboard focus ring + skip link). */
    css: ['~/assets/css/global.css'],

    /* Application Modules */
    modules: [
        /* Tailwind CSS */
        '@nuxtjs/tailwindcss',

        /* Pinia */
        '@pinia/nuxt',

        /* Internationalization for Nuxt */
        '@nuxtjs/i18n',
    ],

    /* Route Rules */
    routeRules: {
        /* Add CORS headers to root. */
        '/**': { cors: true },

        /* Retired standalone Nostr page — the research now lives on CashFusion. */
        '/research/nostr-fusion': { redirect: { to: '/research/cashfusion', statusCode: 301 } },

        /* Retired privacy token page — the $HUSH token is no longer pursued. */
        '/token': { redirect: { to: '/', statusCode: 301 } },

        /* Retired wallet onboarding page — the homepage now points at /playground. */
        '/welcome': { redirect: { to: '/playground', statusCode: 301 } },

        /* Retired wizard lobby — superseded by the playground experiments bench. */
        '/lobby': { redirect: { to: '/playground', statusCode: 301 } },

        /* Retired /toolbox operator dashboard — superseded by /playground (2026-11-24). */
        '/toolbox': { redirect: { to: '/playground', statusCode: 301 } },
        '/toolbox/**': { redirect: { to: '/playground', statusCode: 301 } },

        /* Retired standalone specification — merged into the CoinJoin topic page. */
        '/spec': { redirect: { to: '/research/coinjoin', statusCode: 301 } },

        /* Retired placeholder / orphaned pages (2026-11-24 cleanup).
           /compare now hosts the ELI5 privacy-coins comparison (2026-11-27). */
        '/_blank': { redirect: { to: '/', statusCode: 301 } },
        '/diary': { redirect: { to: '/', statusCode: 301 } },
        '/treasury': { redirect: { to: '/', statusCode: 301 } },
        '/profile': { redirect: { to: '/', statusCode: 301 } },

        /* Retired one-line /help stubs. */
        '/help/coinjoin': { redirect: { to: '/research/coinjoin', statusCode: 301 } },
        '/help/guests': { redirect: { to: '/help', statusCode: 301 } },
        '/help/tiers': { redirect: { to: '/help', statusCode: 301 } },

        /* Retired /v1 API surface (page + server routes removed). */
        '/v1': { redirect: { to: '/', statusCode: 301 } },
        '/v1/**': { redirect: { to: '/', statusCode: 301 } },
    },

    runtimeConfig: {
        public: {
            /* Base URL for the (psf-bch-api v6) blockchain REST API. */
            // NOTE: Override at runtime with NUXT_PUBLIC_PSF_API_URL.
            psfApiUrl: process.env.NUXT_PUBLIC_PSF_API_URL || 'https://bch.fullstack.cash',
        },
    },

    // FIXME Polyfills to support `@psf/bch-js` node dependencies.
    vite: {
        plugins: [ nodePolyfills() ],
    },

    /* Set compatibility date. */
    compatibilityDate: '2024-07-04',
})
