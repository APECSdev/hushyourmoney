<script setup lang="ts">
/* Import modules. */
import moment from 'moment'

definePageMeta({
    layout: 'toolbox',
})

useHead({
    title: `Club Dashboard — Hush Your Money`,
    meta: [
        { name: 'description', content: `Hush Your Money makes spending safu.` }
    ],
})

/* Initialize stores. */
import { useSystemStore } from '@/stores/system'
const System = useSystemStore()

const profiles = ref(null)
const status = ref(null)
const system = ref(null)

const clubAddress = ref(null)
const clubPubkey = ref(null)

const displayCreatedAt = computed(() => {
    if (!status.value || !status.value.createdAt) {
        return 'loading...'
    }

    return moment.unix(status.value.createdAt).format('llll')
})

const displayTimeAgo = computed(() => {
    if (!status.value || !status.value.createdAt) {
        return 'loading...'
    }

    return moment.unix(status.value.createdAt).fromNow()
})

const numProfiles = computed(() => {
    if (!profiles.value) {
        return 'loading...'
    }

    return Object.keys(profiles.value).length
})

const lastProfileUpdate = computed(() => {
    if (!profiles.value) {
        return 'loading...'
    }

    const times = []
    Object.keys(profiles.value).forEach(_profileid => {
        const profile = profiles.value[_profileid]
        const time = profile.updatedAt
        console.log('UPDATE TIME', time)

        /* Skip profiles without a (valid) updatedAt. */
        if (time) {
            times.push(time)
        }
    })

    const sorted = times.sort((a, b) => {
        return b - a
    })

    /* Handle zero profiles (empty times list). */
    if (times.length === 0) {
        return 'no profiles yet'
    }

    return moment.unix(sorted[0]).format('llll')
})

const displayProfileTimeAgo = computed(() => {
    if (!profiles.value) {
        return 'loading...'
    }

    const times = []
    Object.keys(profiles.value).forEach(_profileid => {
        const profile = profiles.value[_profileid]
        const time = profile.updatedAt
        console.log('UPDATE TIME', time)

        /* Skip profiles without a (valid) updatedAt. */
        if (time) {
            times.push(time)
        }
    })

    const sorted = times.sort((a, b) => {
        return b - a
    })

    /* Handle zero profiles (empty times list). */
    if (times.length === 0) {
        return 'no profiles yet'
    }

    return moment.unix(sorted[0]).fromNow()
})

const init = async () => {
    /* Request system (status). */
    system.value = await $fetch('/api/system')
        .catch(err => console.error(err))
    // console.log('SYSTEM', system.value)

    /* Set (system) status. */
    status.value = system.value.status

    /* Request profiles. */
    profiles.value = await $fetch('/api/profiles')
        .catch(err => console.error(err))
    // console.log('PROFILES', profiles.value)

    /* Request wallet. */
    const response = await $fetch('/api/wallet')
        .catch(err => console.error(err))
    console.log('WALLET', response)

    clubAddress.value = response.address
    clubPubkey.value = response.publicKey
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
    <main class="max-w-5xl mx-auto py-5 flex flex-col gap-6">
        <h1 class="font-display text-3xl font-bold text-white sm:text-4xl">
            Club Dashboard
        </h1>

        <p class="leading-relaxed text-slate-300">
            Welcome to the Hush Your Money Toolbox.
        </p>

        <div class="grid grid-cols-2 gap-6">
            <section class="w-full px-5 py-3 flex flex-col gap-0 rounded-2xl border border-lime-300/20 bg-gradient-to-br from-lime-300/10 to-transparent">
                <h2 class="font-mono text-base font-bold uppercase tracking-[0.2em] text-lime-300">
                    {{numProfiles * 2}} Fusions??
                </h2>

                <h3 class="mt-2 font-display text-xl font-medium tracking-widest text-white">
                    {{lastProfileUpdate}}
                </h3>

                <h3 class="text-right font-mono text-sm font-medium tracking-widest text-slate-400">
                    {{displayProfileTimeAgo}}
                </h3>
            </section>

            <section class="w-full px-5 py-3 flex flex-col gap-0 rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/10 to-transparent">
                <h2 class="font-mono text-base font-bold uppercase tracking-[0.2em] text-cyan-300">
                    {{numProfiles}} Profiles
                </h2>

                <h3 class="mt-2 font-display text-xl font-medium tracking-widest text-white">
                    {{lastProfileUpdate}}
                </h3>

                <h3 class="text-right font-mono text-sm font-medium tracking-widest text-slate-400">
                    {{displayProfileTimeAgo}}
                </h3>
            </section>

            <section class="w-full px-5 py-3 flex flex-col gap-0 rounded-2xl border border-violet-300/20 bg-gradient-to-br from-violet-300/10 to-transparent">
                <h2 class="font-mono text-base font-bold uppercase tracking-[0.2em] text-violet-300">
                    {{Math.ceil(numProfiles * 3.33)}} Sessions??
                </h2>

                <h3 class="mt-2 font-display text-xl font-medium tracking-widest text-white">
                    {{lastProfileUpdate}}
                </h3>

                <h3 class="text-right font-mono text-sm font-medium tracking-widest text-slate-400">
                    {{displayProfileTimeAgo}}
                </h3>
            </section>

            <section class="w-full px-5 py-3 flex flex-col gap-0 rounded-2xl border border-white/10 bg-white/[0.03]">
                <h2 class="font-mono text-base font-bold uppercase tracking-[0.2em] text-slate-400">
                    Last Club Startup
                </h2>

                <h3 class="mt-2 font-display text-xl font-medium tracking-widest text-white">
                    {{displayCreatedAt}}
                </h3>

                <h3 class="text-right font-mono text-sm font-medium tracking-widest text-slate-400">
                    {{displayTimeAgo}}
                </h3>
            </section>

            <section class="w-full px-5 py-3 flex flex-col gap-0 rounded-2xl border border-white/10 bg-white/[0.03]">
                <h2 class="font-mono text-base font-bold uppercase tracking-[0.2em] text-slate-400">
                    Club Wallet
                </h2>

                <NuxtLink :to="'https://explorer.nexa.org/address/' + clubAddress" target="_blank" class="break-all font-mono text-sm font-medium tracking-tight text-cyan-300 hover:text-cyan-200 hover:underline">
                    {{clubAddress}}
                </NuxtLink>

                <h3 class="text-right text-base font-medium italic text-slate-400">
                    Current signer of ALL Club messages
                </h3>
            </section>

            <section class="w-full px-5 py-3 flex flex-col gap-0 rounded-2xl border border-white/10 bg-white/[0.03]">
                <h2 class="font-mono text-base font-bold uppercase tracking-[0.2em] text-slate-400">
                    Club Public Key
                </h2>

                <h3 class="break-all font-mono text-xs font-medium tracking-tight text-slate-300">
                    {{clubPubkey}}
                </h3>

                <h3 class="text-right text-base font-medium italic text-slate-400">
                    Use this key to sign encrypted messages
                </h3>
            </section>

        </div>

        <pre class="w-fit max-w-full overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-mono text-xs text-lime-200/90">{{system}}</pre>
        <pre class="w-fit max-w-full overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-mono text-xs text-lime-200/90">{{profiles}}</pre>
    </main>
</template>
