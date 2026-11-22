<!-- web/components/SiteNav.vue — site-wide navigation for the modern dark pages -->

<script setup lang="ts">
/* Shared top navigation for the fullscreen + research layouts.
   The legacy default/toolbox layouts keep their own chrome. */

const route = useRoute()
const mobileOpen = ref(false)

/* Topic order is the research hub order (CashFusion is 02 and carries the Nostr research). */
const RESEARCH = [
    { n: '01', label: 'The Shielded Pool', to: '/research/shielded-pool' },
    { n: '02', label: 'CashFusion', to: '/research/cashfusion' },
    { n: '03', label: 'Shielded Addresses', to: '/research/shielded-addresses' },
    { n: '04', label: 'CoinJoin', to: '/research/coinjoin' },
    { n: '05', label: 'Trusted Setup', to: '/ceremony' },
]

const LINKS = [
    { label: 'Research', to: '/research', research: true },
    { label: 'Ceremony', to: '/ceremony' },
    { label: 'Roadmap', to: '/roadmap' },
    { label: 'Security', to: '/security' },
    { label: 'Token', to: '/token' },
    { label: 'Toolbox', to: '/toolbox' },
]

function isActive(to: string) {
    if (to === '/research') return route.path.startsWith('/research')
    return route.path === to || route.path.startsWith(to + '/')
}

watch(() => route.fullPath, () => { mobileOpen.value = false })
</script>

<template>
    <header class="sticky top-0 z-40 border-b border-white/10 bg-[#060a10]/85 backdrop-blur">
        <nav class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 pr-28 sm:px-6 sm:pr-32 lg:px-8" aria-label="Main navigation">
            <NuxtLink to="/" class="group flex items-center gap-2.5" aria-label="Hush Your Money — home">
                <span class="grid h-8 w-8 place-items-center rounded-lg border border-lime-300/40 bg-lime-300/10 font-display text-sm font-extrabold text-lime-300 transition group-hover:border-lime-300/80 group-hover:bg-lime-300/15">H</span>
                <span class="hidden font-display text-sm font-bold tracking-tight text-white sm:block">Hush Your Money</span>
            </NuxtLink>

            <div class="hidden items-center gap-0.5 lg:flex">
                <template v-for="l in LINKS" :key="l.to">
                    <div v-if="l.research" class="group relative">
                        <NuxtLink :to="l.to" class="nav-link" :class="{ 'nav-link-active': isActive(l.to) }">
                            {{ l.label }}
                            <svg class="h-3 w-3 transition-transform group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </NuxtLink>
                        <div class="invisible absolute left-0 top-full w-72 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                            <div class="overflow-hidden rounded-xl border border-white/10 bg-[#0a1018]/95 p-1.5 shadow-2xl backdrop-blur">
                                <NuxtLink v-for="t in RESEARCH" :key="t.to" :to="t.to" class="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-white/5" :class="{ 'bg-white/5': route.path === t.to }">
                                    <span class="font-mono text-xs text-lime-300/80">{{ t.n }}</span>
                                    <span class="text-sm text-slate-200">{{ t.label }}</span>
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
                    <NuxtLink v-else :to="l.to" class="nav-link" :class="{ 'nav-link-active': isActive(l.to) }">{{ l.label }}</NuxtLink>
                </template>
            </div>

            <button @click="mobileOpen = !mobileOpen" type="button" class="relative inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:border-lime-300/40 hover:text-lime-200 lg:hidden" :aria-expanded="mobileOpen" aria-controls="site-nav-mobile" aria-label="Toggle navigation">
                <svg v-if="!mobileOpen" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                    <path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
                <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                    <path stroke-linecap="round" d="m6 6 12 12M18 6 6 18" />
                </svg>
            </button>
        </nav>

        <div v-if="mobileOpen" id="site-nav-mobile" class="border-t border-white/10 bg-[#060a10]/95 lg:hidden">
            <div class="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
                <div class="grid gap-1 sm:grid-cols-2">
                    <NuxtLink v-for="l in LINKS" :key="l.to" :to="l.to" class="mobile-link" :class="{ 'mobile-link-active': isActive(l.to) }">{{ l.label }}</NuxtLink>
                </div>

                <div class="mt-4 border-t border-white/10 pt-3">
                    <p class="px-3 font-mono text-xs uppercase tracking-[0.3em] text-slate-300">research topics</p>
                    <div class="mt-2 grid gap-1 sm:grid-cols-2">
                        <NuxtLink v-for="t in RESEARCH" :key="t.to" :to="t.to" class="mobile-sub" :class="{ 'mobile-link-active': route.path === t.to }">
                            <span class="font-mono text-xs text-lime-300/80">{{ t.n }}</span>
                            <span>{{ t.label }}</span>
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>

<style scoped>
.nav-link {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border-radius: 0.6rem;
    padding: 0.5rem 0.7rem;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgb(226 232 240);
    text-decoration: none;
    transition: color 0.25s, background 0.25s;
}
.nav-link:hover { color: #bef264; background: rgba(255, 255, 255, 0.05); }
.nav-link-active { color: #bef264; }

.mobile-link {
    display: flex;
    align-items: center;
    border-radius: 0.6rem;
    padding: 0.65rem 0.75rem;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgb(226 232 240);
    text-decoration: none;
    transition: color 0.25s, background 0.25s;
}
.mobile-link:hover { color: #bef264; background: rgba(255, 255, 255, 0.05); }
.mobile-link-active { color: #bef264; }

.mobile-sub {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    border-radius: 0.6rem;
    padding: 0.55rem 0.75rem;
    font-size: 0.9rem;
    color: rgb(226 232 240);
    text-decoration: none;
    transition: color 0.25s, background 0.25s;
}
.mobile-sub:hover { color: #bef264; background: rgba(255, 255, 255, 0.05); }
</style>
