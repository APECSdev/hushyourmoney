<script setup lang="ts">
/* Shared dark cypherpunk shell for documentation/info pages.
   Provides: aurora backdrop, content column, footer with homepage link parity. */
</script>

<template>
    <div class="relative min-h-screen w-full overflow-x-clip bg-[#060a10] font-sans text-slate-200 antialiased selection:bg-lime-300 selection:text-slate-900">

        <!-- ── Animated aurora backdrop (3 drifting gradient blobs + grid + grain) ── -->
        <div class="aurora" aria-hidden="true">
            <div class="blob blob-1"></div>
            <div class="blob blob-2"></div>
            <div class="blob blob-3"></div>
            <div class="grid-overlay"></div>
            <div class="grain"></div>
        </div>

        <div class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24 pt-24 sm:pt-32">
            <slot />
        </div>

        <!-- ── Footer (link parity with homepage) ── -->
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

                <div class="flex items-center gap-4 font-mono text-xs text-slate-500">
                    <a href="https://github.com/nyusternie/hushyourmoney" target="_blank" rel="noopener" class="footer-link">github</a>
                    <span class="text-slate-700">|</span>
                    <a href="https://cloud.runonflux.io" target="_blank" rel="noopener" class="footer-link">running on flux cloud</a>
                    <span class="text-slate-700">|</span>
                    <span class="text-slate-600">© Hush Your Money</span>
                </div>
            </div>
        </footer>

    </div>
</template>

<style scoped>
/* ── Aurora backdrop ─────────────────────────────────────────────── */
.aurora {
    position: fixed;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
}
.blob {
    position: absolute;
    border-radius: 9999px;
    filter: blur(90px);
    mix-blend-mode: screen;
}
.blob-1 {
    width: 55vw; height: 55vw;
    top: -22vw; left: -15vw;
    background: radial-gradient(circle at 35% 35%, rgba(190, 242, 100, 0.34), transparent 65%);
    animation: drift-a 24s ease-in-out infinite alternate;
}
.blob-2 {
    width: 48vw; height: 48vw;
    top: 5vh; right: -18vw;
    background: radial-gradient(circle at 60% 40%, rgba(103, 232, 249, 0.26), transparent 65%);
    animation: drift-b 29s ease-in-out infinite alternate;
}
.blob-3 {
    width: 60vw; height: 48vw;
    bottom: -28vw; left: 12vw;
    background: radial-gradient(circle at 50% 60%, rgba(196, 141, 255, 0.22), transparent 65%);
    animation: drift-c 34s ease-in-out infinite alternate;
}
@keyframes drift-a { to { transform: translate(12vw, 14vh) scale(1.18); } }
@keyframes drift-b { to { transform: translate(-14vw, 10vh) scale(0.9) rotate(20deg); } }
@keyframes drift-c { to { transform: translate(8vw, -12vh) scale(1.12); } }

.grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(148, 163, 184, 0.055) 1px, transparent 1px),
        linear-gradient(90deg, rgba(148, 163, 184, 0.055) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(ellipse 90% 70% at 50% 30%, black 25%, transparent 78%);
    -webkit-mask-image: radial-gradient(ellipse 90% 70% at 50% 30%, black 25%, transparent 78%);
}
.grain {
    position: absolute;
    inset: 0;
    opacity: 0.05;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* ── Footer ──────────────────────────────────────────────────────── */
.footer-link { transition: color 0.3s; }
.footer-link:hover { color: #bef264; }

@media (prefers-reduced-motion: reduce) {
    .blob { animation: none !important; }
}
</style>
