<script setup lang="ts">
/* Shared dark cypherpunk shell for documentation/info pages.
   Provides: aurora backdrop, content column, footer with homepage link parity. */
</script>

<template>
    <div class="relative min-h-screen w-full overflow-x-clip bg-[#060a10] font-sans text-slate-200 antialiased selection:bg-lime-300 selection:text-slate-900">

        <AuroraBackdrop />

        <!-- GitHub source banner (top-right) -->
        <GithubBanner />

        <div class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24 pt-24 sm:pt-32">
            <slot />
        </div>

        <Footer />

    </div>
</template>


