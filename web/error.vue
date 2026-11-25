<!-- web/error.vue — site-wide error page (404 and every other status) -->

<script setup lang="ts">
/* Nuxt renders this file OUTSIDE the layout system, so it carries its own shell
   (SiteNav + AuroraBackdrop + GithubBanner + Footer) exactly the way
   web/components/DocsShell.vue does for the documentation pages.

   Before this file existed, a wrong URL rendered Nuxt's built-in error page:
   <title>404 - Page not found: /x | Nuxt</title> with no navigation and no
   branding. The title leaked the framework name into search results. */

import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const statusCode = Number(props.error?.statusCode ?? 500)
const isNotFound = statusCode === 404
const requestedPath = String(props.error?.url ?? '')
const code = String(statusCode)

/* Two voices: a wrong address, and a genuine fault. Neither promises a fix. */
const copy = isNotFound
    ? {
        eyebrow: 'err · route not found',
        heading: 'This page never made it into the round.',
        body: 'The address you followed is not part of this site. It was retired, renamed, or it never existed. Nothing was lost, signed, or broadcast — every page we publish is listed below.',
    }
    : {
        eyebrow: 'err · unexpected',
        heading: 'Something broke on the way to the chain.',
        body: 'An unexpected error stopped this page from rendering. Nothing was lost, signed, or broadcast. Reload the page, or start again from the homepage.',
    }

useHead({
    title: `${code} — Hush Your Money`,
    meta: [
        { name: 'robots', content: 'noindex, follow' },
        { name: 'description', content: `Error ${code} — Hush Your Money. Nothing was lost, signed, or broadcast.` },
    ],
})

function goHome() {
    clearError({ redirect: '/' })
}

function tryAgain() {
    clearError({ redirect: requestedPath || '/' })
}
</script>

<template>
    <div class="relative min-h-screen w-full overflow-x-clip bg-[#060a10] font-sans text-slate-200 antialiased selection:bg-lime-300 selection:text-slate-900">

        <SiteNav />

        <AuroraBackdrop />

        <!-- GitHub source banner (top-right) -->
        <GithubBanner />

        <main id="main-content" tabindex="-1" class="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 pb-28 pt-16 text-center sm:pt-24">

            <!-- ── The missing seat: a six-peer mixing round that cannot close.
                   The ring is the CashFusion round from /research/cashfusion;
                   one seat is empty, so the round has no closing signature. ── -->
            <svg viewBox="0 0 420 220" class="h-auto w-full max-w-md" role="img" aria-labelledby="err-round-title err-round-desc">
                <title id="err-round-title">A six-peer mixing round with one peer missing</title>
                <desc id="err-round-desc">Five peers are joined in an open ring. The sixth seat is an empty dashed circle with a slash through it, so the round cannot close.</desc>

                <defs>
                    <linearGradient id="err-ring" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#bef264" />
                        <stop offset="100%" stop-color="#67e8f9" />
                    </linearGradient>
                </defs>

                <!-- the five connected peers, drawn as an open arc -->
                <path d="M272.35 74 L272.35 146 L210 182 L147.65 146 L147.65 74"
                      fill="none" stroke="url(#err-ring)" stroke-width="2" stroke-opacity="0.55" stroke-linecap="round" />

                <!-- severed links toward the empty seat -->
                <path d="M147.65 74 L175.7 57.8" fill="none" stroke="#bef264" stroke-width="2" stroke-opacity="0.35" stroke-dasharray="4 6" stroke-linecap="round" />
                <path d="M244.3 57.8 L272.35 74" fill="none" stroke="#bef264" stroke-width="2" stroke-opacity="0.35" stroke-dasharray="4 6" stroke-linecap="round" />

                <!-- peers -->
                <circle cx="272.35" cy="74" r="12" fill="#060a10" stroke="url(#err-ring)" stroke-width="2" />
                <circle cx="272.35" cy="146" r="12" fill="#060a10" stroke="url(#err-ring)" stroke-width="2" />
                <circle cx="210" cy="182" r="12" fill="#060a10" stroke="url(#err-ring)" stroke-width="2" />
                <circle cx="147.65" cy="146" r="12" fill="#060a10" stroke="url(#err-ring)" stroke-width="2" />
                <circle cx="147.65" cy="74" r="12" fill="#060a10" stroke="url(#err-ring)" stroke-width="2" />

                <!-- the empty seat -->
                <circle cx="210" cy="38" r="12" fill="none" stroke="#f87171" stroke-width="2" stroke-dasharray="4 5" stroke-opacity="0.8" />
                <path d="M203 31 L217 45" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-opacity="0.8" />
            </svg>

            <p class="mt-10 font-mono text-[0.78rem] uppercase tracking-[0.45em] text-red-300">{{ copy.eyebrow }}</p>

            <p class="mt-4 font-mono text-[clamp(3.5rem,14vw,7rem)] font-extrabold leading-none text-lime-300">{{ code }}</p>

            <h1 class="mt-5 font-display text-[clamp(1.7rem,5vw,3rem)] font-bold leading-[1.08] text-white">
                {{ copy.heading }}
            </h1>

            <p class="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-200">{{ copy.body }}</p>

            <p v-if="requestedPath" class="mt-4 font-mono text-xs text-slate-400">requested: {{ requestedPath }}</p>

            <div class="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
                <button type="button" class="inline-flex w-full items-center justify-center rounded-xl border border-lime-300/60 bg-lime-300 px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-slate-900 transition hover:bg-lime-200 sm:w-auto" @click="goHome">
                    Back to the homepage
                </button>
                <button v-if="!isNotFound" type="button" class="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-slate-100 transition hover:border-lime-300/50 hover:text-lime-200 sm:w-auto" @click="tryAgain">
                    Reload this page
                </button>
                <NuxtLink to="/playground" class="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-slate-100 transition hover:border-lime-300/50 hover:text-lime-200 sm:w-auto">
                    Enter the Playground
                </NuxtLink>
            </div>

            <!-- ── Everything we publish, so a 404 is never a dead end ── -->
            <nav aria-label="All published pages" class="mt-14 w-full border-t border-white/10 pt-8">
                <p class="font-mono text-xs uppercase tracking-[0.35em] text-slate-400">everything we publish</p>
                <div class="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-sm">
                    <NuxtLink to="/research" class="text-slate-200 transition hover:text-lime-300">research</NuxtLink>
                    <NuxtLink to="/playground" class="text-slate-200 transition hover:text-lime-300">playground</NuxtLink>
                    <NuxtLink to="/ceremony" class="text-slate-200 transition hover:text-lime-300">ceremony</NuxtLink>
                    <NuxtLink to="/roadmap" class="text-slate-200 transition hover:text-lime-300">roadmap</NuxtLink>
                    <NuxtLink to="/security" class="text-slate-200 transition hover:text-lime-300">security</NuxtLink>
                    <NuxtLink to="/readme" class="text-slate-200 transition hover:text-lime-300">readme</NuxtLink>
                    <NuxtLink to="/legal" class="text-slate-200 transition hover:text-lime-300">legal</NuxtLink>
                    <NuxtLink to="/sponsors" class="text-slate-200 transition hover:text-lime-300">sponsors</NuxtLink>
                    <NuxtLink to="/help" class="text-slate-200 transition hover:text-lime-300">help</NuxtLink>
                </div>
            </nav>

        </main>

        <Footer />

    </div>
</template>
