<script setup lang="ts">
definePageMeta({
    layout: 'admin',
})

useHead({
    title: `Pools — Hush Your Money`,
    meta: [
        { name: 'description', content: `Hush Your Money makes spending safu.` }
    ],
})

/* Initialize stores. */
import { useSystemStore } from '@/stores/system'
const System = useSystemStore()

const pools = ref(null)

const init = async () => {
    /* Request all pools. */
    pools.value = await $fetch('/_pools')
        .catch(err => console.error(err))
    console.log('POOLS', pools.value)
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
            Pools
        </h1>

        <p class="leading-relaxed text-slate-300">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Id eius voluptatem minus natus at eveniet dolorum eos mollitia, maxime animi excepturi harum omnis illum odit recusandae pariatur! Unde, explicabo molestias.
        </p>

        <pre v-if="$1" class="w-fit max-w-full overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-mono text-xs text-lime-200/90">{{pools}}</pre>
    </main>
</template>
