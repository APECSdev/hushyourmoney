<script setup lang="ts">
definePageMeta({
    layout: 'fullscreen',
})

useHead({
    title: `Dances — Hush Your Money`,
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
                CoinJoin
            </h1>

            <p class="text-lg leading-relaxed text-slate-300">
                CoinJoins great!
            </p>
        </main>
    </DocsShell>
</template>
