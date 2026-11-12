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
    <main class="mt-4 lg:mt-12 -mb-8 w-full h-32 rounded-2xl border-2 border-lime-300/30 bg-gradient-to-r from-lime-300/10 via-transparent to-cyan-300/10">
        <!-- Banner Goes Here -->
    </main>
</template>
