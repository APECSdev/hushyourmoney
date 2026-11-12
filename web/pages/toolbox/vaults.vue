<script setup lang="ts">
definePageMeta({
    layout: 'toolbox',
})

useHead({
    title: `Vaults — Hush Your Money`,
    meta: [
        { name: 'description', content: `Hush Your Money makes spending safu.` }
    ],
})

/* Initialize stores. */
import { useSystemStore } from '@/stores/system'
const System = useSystemStore()

const vaults = ref(null)

const init = async () => {
    /* Request all vaults. */
    vaults.value = await $fetch('/_vaults')
        .catch(err => console.error(err))
    console.log('POOLS', vaults.value)
}

onMounted(() => {
    init()
})

// onBeforeUnmount(() => {
//     console.log('Before Unmount!')
//     // Now is the time to perform all cleanup operations.
// })
</script>

<template>
    <main class="max-w-5xl mx-auto py-5 flex flex-col gap-4">
        <h1 class="font-display text-3xl font-bold text-white sm:text-4xl">
            Vaults
        </h1>

        <p class="leading-relaxed text-slate-300">
            Instantly and permissionlessly exchange between $HUSH and $NITO tokens.
        </p>

        <pre v-if="$1" class="w-fit max-w-full overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-mono text-xs text-lime-200/90">{{vaults}}</pre>
    </main>
</template>
