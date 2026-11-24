<script setup lang="ts">
/* Define properties. */
// https://vuejs.org/guide/components/props.html#props-declaration
const props = defineProps({
    data: {
        type: [Object],
    },
})

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
    <main class="flex flex-col gap-5">
        <h2 class="font-display text-3xl font-bold text-white">
            Introduction
        </h2>

        <p>
            <span class="text-lg font-bold">Hush Your Money (<span class="text-xl">HYM</span>)</span> is a project of pure passion; forged after years of frustration from ALL the broken promises of "fungible" crypto payments.
        </p>

        <h3 class="font-bold">
            Choose from 1 of 2 convenient methods to Hush Your Money:
        </h3>

        <ol class="-mt-3 pl-10 list-decimal leading-[50px]">
            <li>Privatize <span class="font-bold">YOUR</span> assets <span class="font-bold">AHEAD OF TIME</span> using ANY <span class="font-bold">HYM Club pool</span>.</li>
            <li>Transfer <span class="font-bold">ANY</span> asset (in real-time) <span class="font-bold">THROUGH</span> ANY <span class="font-bold">HYM Club pool</span>.</li>
        </ol>
    </main>
</template>
