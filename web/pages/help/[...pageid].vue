<script setup lang="ts">
definePageMeta({
    layout: 'fullscreen',
})

useHead({
    title: `Help — Hush Your Money`,
    meta: [
        { name: 'description', content: `Hush Your Money makes spending safu.` }
    ],
})

/* Initialize stores. */
import { useSystemStore } from '@/stores/system'
const System = useSystemStore()

const route = useRoute()
console.log('ROUTE', route)

const networkid = route?.params?.pageid[0]
console.log('NETWORK ID', networkid)

const guideid = route?.params?.pageid[1]
console.log('GUIDE ID', guideid)

let guide

const init = () => {
    switch(networkid) {
    case 'bch':
        guide = 'lorem ipsum'
        break
    default:
        // TODO
    }
}

onMounted(() => {
    // init()
})

// onBeforeUnmount(() => {
//     console.log('Before Unmount!')
//     // Now it's safe to perform setup operations.
// })
</script>

<template>
    <DocsShell>
        <main class="flex flex-col gap-6">
            <h1 class="font-display text-4xl font-bold text-white sm:text-5xl">
                Guides
            </h1>

            <pre class="w-fit rounded-xl border border-white/10 bg-white/[0.03] p-4 font-mono text-sm text-lime-300">DEBUG: {{ networkid }} — {{ guideid }}</pre>

            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <HelpBCHWalletIntegration />
            </div>
        </main>
    </DocsShell>
</template>
