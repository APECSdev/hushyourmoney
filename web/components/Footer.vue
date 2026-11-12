<script setup lang="ts">
/* Unified site footer — single component for ALL layouts.
   Responsive: stacks vertically on mobile, row on sm+. */
</script>

<template>
    <footer class="relative z-10 border-t border-white/5 px-6 py-8">
        <div class="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row">
            <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-xs text-slate-500">
                <NuxtLink to="/" class="footer-link">home</NuxtLink>
                <span class="text-slate-700">|</span>
                <NuxtLink to="/readme" class="footer-link">readme</NuxtLink>
                <span class="text-slate-700">|</span>
                <NuxtLink to="/legal" class="footer-link">legal</NuxtLink>
                <span class="text-slate-700">|</span>
                <NuxtLink to="/sponsors" class="footer-link">sponsors 💗</NuxtLink>
                <span class="text-slate-700">|</span>
                <NuxtLink to="/help" class="footer-link">need help?</NuxtLink>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-xs text-slate-500">
                <a href="https://cloud.runonflux.io" target="_blank" rel="noopener" class="footer-link">running on flux cloud</a>
                <span class="text-slate-700">|</span>
                <span class="text-slate-600">© 2020-2026 The Hush DAO</span>
                <span class="text-slate-700">|</span>
                <CcBadge />
            </div>
        </div>
    </footer>
</template>

<style scoped>
.footer-link { transition: color 0.3s; }
.footer-link:hover { color: #bef264; }
</style>
