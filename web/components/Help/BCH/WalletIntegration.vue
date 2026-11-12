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
    <main class="flex flex-col gap-4">
        <h1 class="font-display text-3xl font-bold italic text-lime-300 sm:text-5xl">
            Bitcoin Cash Wallet Integration Guide
        </h1>

        <p class="leading-relaxed text-slate-300">
            The HUSH Protocol can be easily implemented using ANY of the available software development kits (SDKs) available:
        </p>

        <ol class="list-decimal pl-10 leading-8 text-slate-300">
            <li>C/C++</li>
            <li>JavaScript</li>
            <li>Python</li>
            <li>Rust</li>
        </ol>

        <p class="leading-relaxed text-slate-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni error a, praesentium reprehenderit provident unde sapiente inventore, voluptas atque quidem qui quae repellat recusandae vel nulla, harum impedit adipisci non!
        </p>
    </main>
</template>
