<script setup lang="ts">
/* Shared animated aurora backdrop (3 drifting gradient blobs + grid + grain). */
</script>

<template>
    <div class="aurora" aria-hidden="true">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="blob blob-3"></div>
        <div class="grid-overlay"></div>
        <div class="grain"></div>
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

@media (prefers-reduced-motion: reduce) {
    .blob { animation: none !important; }
}
</style>
