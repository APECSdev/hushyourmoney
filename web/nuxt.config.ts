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
                { name: 'description', content: `Hush Your Money is a free, open-source, non-custodial UTXO privacy toolkit. Shuffle and fuse your coins with the CashShuffle and CashFusion CoinJoin protocols — spend privately, fearlessly.` },
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
            script: [
                { src: '/js/polyfills.js' },
            ],
        },
    },

    /* Progressive Web Application Settings */
    pwa: {
        manifest: {
            name: 'Hush Your Money — Spend Privately. Fearlessly!',
            short_name: 'Hush Your Money',
            description: `Spend Privately. Fearlessly!`,
            lang: 'en',
            theme_color: '#518c96',
            background_color: '#518c96',
            // useWebmanifestExtension: false,
        },
        meta: {
            name: 'Hush Your Money — Spend Privately. Fearlessly!',
            description: `Spend Privately. Fearlessly!`,
            author: `Nexa contributors`,
        },
        // icon: false, // disables the icon module
        workbox: {
            // workboxURL: 'TBD',
            // enabled: true, // FOR DEV PURPOSES ONLY
        },
    },

    /* Application Modules */
    modules: [
        /* Tailwind CSS */
        '@nuxtjs/tailwindcss',

        /* Pinia */
        '@pinia/nuxt',

        /* Plausible */
        '@nuxtjs/plausible',

        /* Internationalization for Nuxt */
        '@nuxtjs/i18n',

        /* Progressive Web Application */
        '@kevinmarrec/nuxt-pwa',
    ],

    /* Plausible */
    plausible: {
        apiHost: 'https://plausible.hos.im',
    },

    /* Route Rules */
    routeRules: {
        /* Add CORS headers to root. */
        // NOTE: We need this to make <token>.json available to web apps.
        '/**': { cors: true },
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
