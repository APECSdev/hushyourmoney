<script setup lang="ts">
definePageMeta({
    layout: 'fullscreen',
})

useHead({
    title: `Security — Hush Your Money`,
    meta: [
        { name: 'description', content: `Security is VERY important and MUST NOT be underestimated.` }
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
        <main class="flex flex-col gap-8">
            <h1 class="font-display text-4xl font-bold text-white sm:text-5xl">
                Security
            </h1>

            <p class="text-lg text-slate-300">
                Choose your gateway.
            </p>

            <section class="flex flex-col gap-8">
                <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <h2 class="font-display text-xl font-bold text-lime-300">
                        Self-compiled Source Code
                    </h2>

                    <ol class="list-decimal pl-10 pt-3 leading-8 text-slate-300">
                        <li>Gogs <em>(recommended)</em></li>
                        <li>GitHub</li>
                        <li>GitLab</li>
                    </ol>
                </div>

                <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <h2 class="font-display text-xl font-bold text-cyan-300">
                        IPFS "Self-hosted" Gateways
                    </h2>

                    <ol class="list-decimal pl-10 pt-3 leading-8 text-slate-300">
                        <li>Brave web browser</li>
                        <li>Kubo (w/ HTTP enabled)</li>
                    </ol>
                </div>

                <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <h2 class="font-display text-xl font-bold text-violet-300">
                        IPFS "Trusted" Gateways
                    </h2>

                    <ol class="list-decimal pl-10 pt-3 leading-8 text-slate-300">
                        <li>Dweb</li>
                        <li>Cloudflare</li>
                    </ol>
                </div>

                <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <h2 class="font-display text-xl font-bold text-white">
                        Web Gateways
                    </h2>

                    <ol class="list-decimal pl-10 pt-3 leading-8 text-slate-300">
                        <li>hushyourmoney.com</li>
                        <li>hushyourmoney.app.runonflux.io</li>
                    </ol>
                </div>

            </section>
        </main>
    </DocsShell>
</template>
