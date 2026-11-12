<script setup lang="ts">
definePageMeta({
    layout: 'admin',
})

useHead({
    title: `Club Settings — Hush Your Money`,
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
    <main class="max-w-5xl mx-auto py-5 flex flex-col gap-8">
        <h1 class="font-display text-3xl font-bold text-white sm:text-4xl">
            Club Settings
        </h1>

        <!-- Profile details -->
        <section class="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p class="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-lime-300/70">
                identity
            </p>
            <h2 class="mt-2 font-display text-xl font-bold text-white">
                Profile details
            </h2>
            <p class="mt-1 text-sm leading-6 text-slate-400">This information will be displayed publicly so be careful what you share.</p>

            <dl class="mt-6 divide-y divide-white/5 border-t border-white/10 text-sm leading-6">
                <div class="flex flex-col gap-1 pt-5 sm:flex-row sm:items-center sm:gap-x-6">
                    <dt class="w-64 flex-none font-medium text-slate-200">Full name</dt>
                    <dd class="flex flex-auto items-center justify-between gap-x-6">
                        <div class="text-slate-300">Tom Cook</div>
                        <button type="button" class="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-lime-300 transition-colors hover:text-lime-400">Update</button>
                    </dd>
                </div>
                <div class="flex flex-col gap-1 pt-5 sm:flex-row sm:items-center sm:gap-x-6">
                    <dt class="w-64 flex-none font-medium text-slate-200">Email address</dt>
                    <dd class="flex flex-auto items-center justify-between gap-x-6">
                        <div class="font-mono text-slate-300">tom.cook@example.com</div>
                        <button type="button" class="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-lime-300 transition-colors hover:text-lime-400">Update</button>
                    </dd>
                </div>
                <div class="flex flex-col gap-1 pt-5 sm:flex-row sm:items-center sm:gap-x-6">
                    <dt class="w-64 flex-none font-medium text-slate-200">Title</dt>
                    <dd class="flex flex-auto items-center justify-between gap-x-6">
                        <div class="text-slate-300">Human Resources Manager</div>
                        <button type="button" class="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-lime-300 transition-colors hover:text-lime-400">Update</button>
                    </dd>
                </div>
            </dl>
        </section>

        <!-- Bank accounts -->
        <section class="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p class="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-cyan-300/70">
                connections
            </p>
            <h2 class="mt-2 font-display text-xl font-bold text-white">Bank accounts</h2>
            <p class="mt-1 text-sm leading-6 text-slate-400">Connect bank accounts to your account.</p>

            <ul role="list" class="mt-6 divide-y divide-white/5 border-t border-white/10 text-sm leading-6">
                <li class="flex items-center justify-between gap-x-6 py-5">
                    <div class="font-medium text-slate-200">TD Canada Trust</div>
                    <button type="button" class="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-lime-300 transition-colors hover:text-lime-400">Update</button>
                </li>
                <li class="flex items-center justify-between gap-x-6 py-5">
                    <div class="font-medium text-slate-200">Royal Bank of Canada</div>
                    <button type="button" class="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-lime-300 transition-colors hover:text-lime-400">Update</button>
                </li>
            </ul>

            <div class="flex border-t border-white/5 pt-5">
                <button type="button" class="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-cyan-300 transition-colors hover:text-cyan-200"><span aria-hidden="true">+</span> Add another bank</button>
            </div>
        </section>

        <!-- Integrations -->
        <section class="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p class="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-violet-300/70">
                applications
            </p>
            <h2 class="mt-2 font-display text-xl font-bold text-white">Integrations</h2>
            <p class="mt-1 text-sm leading-6 text-slate-400">Connect applications to your account.</p>

            <ul role="list" class="mt-6 divide-y divide-white/5 border-t border-white/10 text-sm leading-6">
                <li class="flex items-center justify-between gap-x-6 py-5">
                    <div class="font-medium text-slate-200">QuickBooks</div>
                    <button type="button" class="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-lime-300 transition-colors hover:text-lime-400">Update</button>
                </li>
            </ul>

            <div class="flex border-t border-white/5 pt-5">
                <button type="button" class="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-cyan-300 transition-colors hover:text-cyan-200"><span aria-hidden="true">+</span> Add another application</button>
            </div>
        </section>

        <!-- Language and dates -->
        <section class="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p class="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-slate-500">
                localization
            </p>
            <h2 class="mt-2 font-display text-xl font-bold text-white">Language and dates</h2>
            <p class="mt-1 text-sm leading-6 text-slate-400">Choose what language and date format to use throughout your account.</p>

            <dl class="mt-6 divide-y divide-white/5 border-t border-white/10 text-sm leading-6">
                <div class="flex flex-col gap-1 pt-5 sm:flex-row sm:items-center sm:gap-x-6">
                    <dt class="w-64 flex-none font-medium text-slate-200">Language</dt>
                    <dd class="flex flex-auto items-center justify-between gap-x-6">
                        <div class="text-slate-300">English</div>
                        <button type="button" class="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-lime-300 transition-colors hover:text-lime-400">Update</button>
                    </dd>
                </div>
                <div class="flex flex-col gap-1 pt-5 sm:flex-row sm:items-center sm:gap-x-6">
                    <dt class="w-64 flex-none font-medium text-slate-200">Date format</dt>
                    <dd class="flex flex-auto items-center justify-between gap-x-6">
                        <div class="font-mono text-slate-300">DD-MM-YYYY</div>
                        <button type="button" class="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-lime-300 transition-colors hover:text-lime-400">Update</button>
                    </dd>
                </div>
                <div class="flex flex-col gap-1 pt-5 sm:flex-row sm:items-center sm:gap-x-6">
                    <dt class="w-64 flex-none font-medium text-slate-200" id="timezone-option-label">Automatic timezone</dt>
                    <dd class="flex flex-auto items-center justify-end">
                        <!-- Enabled: "bg-lime-300", Not Enabled: "bg-white/10" -->
                        <button
                            type="button"
                            class="flex w-8 cursor-pointer rounded-full bg-lime-300 p-px ring-1 ring-inset ring-white/10 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300"
                            role="switch"
                            aria-checked="true"
                            aria-labelledby="timezone-option-label"
                        >
                            <!-- Enabled: "translate-x-3.5", Not Enabled: "translate-x-0" -->
                            <span aria-hidden="true" class="h-4 w-4 translate-x-3.5 transform rounded-full bg-[#0a0f17] shadow-sm ring-1 ring-white/10 transition duration-200 ease-in-out"></span>
                        </button>
                    </dd>
                </div>
            </dl>
        </section>
    </main>
</template>
