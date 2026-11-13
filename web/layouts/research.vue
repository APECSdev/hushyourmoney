<!-- web/layouts/research.vue — shared shell for the /research suite
     (index + shielded-pool + shielded-addresses + coinjoin + cashfusion). -->

<script setup lang="ts">
/* Shared research-suite layout: dark shell + aurora backdrop + GitHub banner +
   content slot + footer. Pages opt in via definePageMeta({ layout: 'research' }).

   Style note (why NON-scoped): scoped styles in a layout cannot reach slot
   content — the slot children carry the PAGE component's scope id, not the
   layout's. The shared stylesheet is therefore imported unscoped and fully
   namespaced under `.research-page` (see web/assets/css/research.css) so it
   can never bleed onto other pages (home/ceremony carry no such wrapper).

   Scroll-reveal stays per-page (useReveal in each page's setup): Nuxt keeps a
   layout mounted across same-layout navigations, so layout-level onMounted
   would not re-run for new .reveal elements. */
</script>

<template>
    <main class="research-page relative min-h-screen w-full overflow-x-clip bg-[#060a10] font-sans text-slate-200 antialiased selection:bg-lime-300 selection:text-slate-900">

        <AuroraBackdrop />

        <!-- GitHub source banner (top-right) -->
        <GithubBanner />

        <slot />

        <Footer />

    </main>
</template>

<style src="~/assets/css/research.css" lang="css"></style>
