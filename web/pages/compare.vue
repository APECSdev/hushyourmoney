<!-- web/pages/compare.vue -->

<script setup lang="ts">
/* NOTE: layout 'fullscreen' initializes the Profile/System stores and System.init(). */
definePageMeta({
    layout: 'fullscreen',
})

useHead({
    title: `Compare Privacy Solutions — Hush Your Money`,
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
//     // Now is the time to perform all cleanup operations.
// })
</script>

<template>
    <DocsShell>
    <main class="">
        <div class="mx-auto max-w-7xl">
            <div class="mx-auto max-w-4xl text-center">
                <p class="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    Compare Privacy Solutions
                </p>
            </div>

            <p class="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-slate-300">
                We take a detailed look, below the surface of 5 alternative Privacy Solutions, to learn how <span class="font-bold">Hush Network</span> measures up.
            </p>

            <section>
                <ol>
                    <li>Monero</li>

                    <NuxtLink to="https://piratechain.com/" target="_blank" class="text-cyan-300 hover:underline">
                        Pirate Chain
                    </NuxtLink>

                    <li>Firo</li>

                    <li>Zano</li>

                    <li>Zcash</li>
                </ol>
            </section>

            <!-- xs to lg -->
            <div class="mx-auto mt-12 max-w-md space-y-8 sm:mt-16 lg:hidden">

                <section class="rounded-xl bg-white/[0.03] p-8 ring-1 ring-inset ring-white/10">
                    <h3 id="tier-essential" class="text-sm font-semibold leading-6 text-slate-100">
                        Hush Network
                    </h3>

                    <p class="mt-2 flex items-baseline gap-x-1 text-slate-100">
                        <span class="text-4xl font-bold">$29</span>
                        <span class="text-sm font-semibold">/month</span>
                    </p>

                    <a
                        href="#"
                        aria-describedby="tier-essential"
                        class="mt-8 block rounded-md bg-lime-300 px-3 py-2 text-center text-sm font-semibold leading-6 text-slate-900 hover:bg-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300"
                    >
                        Buy plan
                    </a>

                    <ul role="list" class="mt-10 space-y-4 text-sm leading-6 text-slate-100">
                        <li>
                            <ul role="list" class="space-y-4">
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Integrations </span>
                                </li>
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Shared links </span>
                                </li>
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Importing and exporting </span>
                                </li>
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span>
                                        Team members
                                        <span class="text-sm leading-6 text-slate-400">(Up to 20 users)</span>
                                    </span>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <ul role="list" class="space-y-4">
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Advanced analytics </span>
                                </li>
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Basic reports </span>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <ul role="list" class="space-y-4">
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> 24/7 online support </span>
                                </li>
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Quarterly product workshops </span>
                                </li>
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Priority phone support </span>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </section>

                <section class="p-8">
                    <h3 id="tier-basic" class="text-sm font-semibold leading-6 text-slate-100">Zcash</h3>

                    <p class="mt-2 flex items-baseline gap-x-1 text-slate-100">
                        <span class="text-4xl font-bold">$9</span>
                        <span class="text-sm font-semibold">/month</span>
                    </p>

                    <a
                        href="#"
                        aria-describedby="tier-basic"
                        class="mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 text-lime-300 ring-1 ring-inset ring-white/10 hover:ring-lime-300/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300"
                    >
                        Buy plan
                    </a>

                    <ul role="list" class="mt-10 space-y-4 text-sm leading-6 text-slate-100">
                        <li>
                            <ul role="list" class="space-y-4">
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Integrations </span>
                                </li>
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Shared links </span>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <ul role="list" class="space-y-4">
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Advanced analytics </span>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <ul role="list" class="space-y-4">
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> 24/7 online support </span>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </section>

                <section class="p-8">
                    <h3 id="tier-premium" class="text-sm font-semibold leading-6 text-slate-100">Zano</h3>
                    <p class="mt-2 flex items-baseline gap-x-1 text-slate-100">
                        <span class="text-4xl font-bold">$59</span>
                        <span class="text-sm font-semibold">/month</span>
                    </p>
                    <a
                        href="#"
                        aria-describedby="tier-premium"
                        class="mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 text-lime-300 ring-1 ring-inset ring-white/10 hover:ring-lime-300/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300"
                    >
                        Buy plan
                    </a>
                    <ul role="list" class="mt-10 space-y-4 text-sm leading-6 text-slate-100">
                        <li>
                            <ul role="list" class="space-y-4">
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Integrations </span>
                                </li>
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Shared links </span>
                                </li>
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Importing and exporting </span>
                                </li>
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span>
                                        Team members
                                        <span class="text-sm leading-6 text-slate-400">(Up to 50 users)</span>
                                    </span>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <ul role="list" class="space-y-4">
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Advanced analytics </span>
                                </li>
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Basic reports </span>
                                </li>
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Professional reports </span>
                                </li>
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Custom report builder </span>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <ul role="list" class="space-y-4">
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> 24/7 online support </span>
                                </li>
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Quarterly product workshops </span>
                                </li>
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> Priority phone support </span>
                                </li>
                                <li class="flex gap-x-3">
                                    <svg class="h-6 w-5 flex-none text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span> 1:1 onboarding tour </span>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </section>
            </div>

            <!-- lg+ -->
            <div class="isolate mt-20 hidden lg:block">
                <div class="relative -mx-8">
                    <div class="absolute inset-x-4 inset-y-0 -z-10 flex">
                        <div class="flex w-1/3 px-4" style="margin-left: 50%;" aria-hidden="true">
                            <div class="w-full rounded-t-xl border-x border-t border-white/10 bg-white/[0.03]"></div>
                        </div>
                    </div>

                    <table class="w-full table-fixed border-separate border-spacing-x-8 text-left">
                        <caption class="sr-only">
                            Pricing plan comparison
                        </caption>
                        <colgroup>
                            <col class="w-1/3" />
                            <col class="w-1/3" />
                            <col class="w-1/3" />
                        </colgroup>
                        <thead>
                            <tr>
                                <td></td>
                                <th scope="col" class="px-6 pt-6 xl:px-8 xl:pt-8">
                                    <div class="text-sm font-semibold leading-7 text-slate-100">Hush Network</div>
                                </th>
                                <th scope="col" class="px-6 pt-6 xl:px-8 xl:pt-8">
                                    <div class="text-sm font-semibold leading-7 text-slate-100">Zcash</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row"><span class="sr-only">Price</span></th>
                                <td class="px-6 pt-2 xl:px-8">
                                    <div class="flex items-baseline gap-x-1 text-slate-100">
                                        <span class="text-4xl font-bold">$9</span>
                                        <span class="text-sm font-semibold leading-6">/month</span>
                                    </div>
                                    <a
                                        href="#"
                                        class="mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 text-lime-300 ring-1 ring-inset ring-white/10 hover:ring-lime-300/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300"
                                    >
                                        Buy plan
                                    </a>
                                </td>
                                <td class="px-6 pt-2 xl:px-8">
                                    <div class="flex items-baseline gap-x-1 text-slate-100">
                                        <span class="text-4xl font-bold">$29</span>
                                        <span class="text-sm font-semibold leading-6">/month</span>
                                    </div>
                                    <a
                                        href="#"
                                        class="mt-8 block rounded-md bg-lime-300 px-3 py-2 text-center text-sm font-semibold leading-6 text-slate-900 hover:bg-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300"
                                    >
                                        Buy plan
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <th scope="colgroup" colspan="3" class="pb-4 pt-8 text-sm font-semibold leading-6 text-slate-100">
                                    Features
                                    <div class="absolute inset-x-8 mt-4 h-px bg-white/10"></div>
                                </th>
                            </tr>
                            <tr>
                                <th scope="row" class="py-4 text-sm font-normal leading-6 text-slate-100">
                                    Integrations
                                    <div class="absolute inset-x-8 mt-4 h-px bg-white/5"></div>
                                </th>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Included in Basic</span>
                                </td>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Included in Essential</span>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" class="py-4 text-sm font-normal leading-6 text-slate-100">
                                    Shared links
                                    <div class="absolute inset-x-8 mt-4 h-px bg-white/5"></div>
                                </th>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Included in Basic</span>
                                </td>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Included in Essential</span>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" class="py-4 text-sm font-normal leading-6 text-slate-100">
                                    Importing and exporting
                                    <div class="absolute inset-x-8 mt-4 h-px bg-white/5"></div>
                                </th>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Not included in Basic</span>
                                </td>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Included in Essential</span>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" class="py-4 text-sm font-normal leading-6 text-slate-100">
                                    Team members
                                    <div class="absolute inset-x-8 mt-4 h-px bg-white/5"></div>
                                </th>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Not included in Basic</span>
                                </td>
                                <td class="px-6 py-4 xl:px-8">
                                    <div class="text-center text-sm leading-6 text-slate-400">Up to 20 users</div>
                                </td>
                            </tr>

                            <tr>
                                <th scope="colgroup" colspan="3" class="pb-4 pt-16 text-sm font-semibold leading-6 text-slate-100">
                                    Reporting
                                    <div class="absolute inset-x-8 mt-4 h-px bg-white/10"></div>
                                </th>
                            </tr>
                            <tr>
                                <th scope="row" class="py-4 text-sm font-normal leading-6 text-slate-100">
                                    Advanced analytics
                                    <div class="absolute inset-x-8 mt-4 h-px bg-white/5"></div>
                                </th>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Included in Basic</span>
                                </td>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Included in Essential</span>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" class="py-4 text-sm font-normal leading-6 text-slate-100">
                                    Basic reports
                                    <div class="absolute inset-x-8 mt-4 h-px bg-white/5"></div>
                                </th>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Not included in Basic</span>
                                </td>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Included in Essential</span>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" class="py-4 text-sm font-normal leading-6 text-slate-100">
                                    Professional reports
                                    <div class="absolute inset-x-8 mt-4 h-px bg-white/5"></div>
                                </th>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Not included in Basic</span>
                                </td>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Not included in Essential</span>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" class="py-4 text-sm font-normal leading-6 text-slate-100">
                                    Custom report builder
                                    <div class="absolute inset-x-8 mt-4 h-px bg-white/5"></div>
                                </th>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Not included in Basic</span>
                                </td>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Not included in Essential</span>
                                </td>
                            </tr>

                            <tr>
                                <th scope="colgroup" colspan="3" class="pb-4 pt-16 text-sm font-semibold leading-6 text-slate-100">
                                    Support
                                    <div class="absolute inset-x-8 mt-4 h-px bg-white/10"></div>
                                </th>
                            </tr>
                            <tr>
                                <th scope="row" class="py-4 text-sm font-normal leading-6 text-slate-100">
                                    24/7 online support
                                    <div class="absolute inset-x-8 mt-4 h-px bg-white/5"></div>
                                </th>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Included in Basic</span>
                                </td>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Included in Essential</span>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" class="py-4 text-sm font-normal leading-6 text-slate-100">
                                    Quarterly product workshops
                                    <div class="absolute inset-x-8 mt-4 h-px bg-white/5"></div>
                                </th>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Not included in Basic</span>
                                </td>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Included in Essential</span>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" class="py-4 text-sm font-normal leading-6 text-slate-100">
                                    Priority phone support
                                    <div class="absolute inset-x-8 mt-4 h-px bg-white/5"></div>
                                </th>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Not included in Basic</span>
                                </td>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-lime-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Included in Essential</span>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row" class="py-4 text-sm font-normal leading-6 text-slate-100">
                                    1:1 onboarding tour
                                    <div class="absolute inset-x-8 mt-4 h-px bg-white/5"></div>
                                </th>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Not included in Basic</span>
                                </td>
                                <td class="px-6 py-4 xl:px-8">
                                    <svg class="mx-auto h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Not included in Essential</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
    </DocsShell>
</template>
