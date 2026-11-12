<script setup lang="ts">
definePageMeta({
    layout: 'admin',
})

useHead({
    title: `Club Wallet — Hush Your Money`,
    meta: [
        { name: 'description', content: `Hush Your Money makes spending safu.` }
    ],
})

/* Initialize stores. */
import { useSystemStore } from '@/stores/system'
const System = useSystemStore()

const wallet = ref(null)

const init = async () => {
    /* Request all wallet. */
    wallet.value = await $fetch('/_wallet')
        .catch(err => console.error(err))
    console.log('WALLET', wallet.value)
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
            Club Wallet
        </h1>

        <p class="leading-relaxed text-slate-300">
            This is an "ephemeral" wallet used for various purposes in the operation of this Club.
            Please DO NOT add funds to this wallet, as they will be LOST FOREVER at the end of this session.
        </p>

        <pre v-if="$1" class="w-fit max-w-full overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-mono text-xs text-lime-200/90">{{wallet}}</pre>
    </main>
</template>
