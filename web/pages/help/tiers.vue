<script setup lang="ts">
definePageMeta({
    layout: 'fullscreen',
})

useHead({
    title: `Tiers — Hush Your Money`,
    meta: [
        { name: 'description', content: `Hush Your Money makes spending safu.` }
    ],
})

/* Initialize stores. */
import { useSystemStore } from '@/stores/system'
const System = useSystemStore()

// onMounted(() => {
//     console.log('Mounted!')
//     // Now it's safe to perform setup operations.
// })

// onBeforeUnmount(() => {
//     console.log('Before Unmount!')
//     // Now it's safe to perform setup operations.
// })
</script>

<template>
    <DocsShell>
        <main class="flex flex-col gap-6">
            <h1 class="font-display text-4xl font-bold text-white sm:text-5xl">
                Tiers
            </h1>

            <p class="text-lg leading-relaxed text-slate-300">
                72 tiers are available to offer the greatest anonymity protection to <NuxtLink to="/help/guests" class="text-cyan-300 font-normal underline decoration-cyan-300/40 underline-offset-4 hover:decoration-cyan-300">Club Guests</NuxtLink>.
            </p>
        </main>
    </DocsShell>
</template>
