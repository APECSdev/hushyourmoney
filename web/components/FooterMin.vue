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
    <footer>
        <div class="mx-auto max-w-3xl flex flex-col px-4 sm:px-6 lg:max-w-7xl lg:px-8 gap-4">
            <div class="border-t border-white/10 pt-8 text-center text-sm text-slate-500 sm:text-left">
                <div class="flex flex-col lg:flex-row justify-between">
                    <div>
                        <span class="px-1 block sm:inline">&copy; 2020-2026 The Hush DAO</span>
                        <span class="hidden lg:inline">—</span>
                        <span class="px-1 block sm:inline">All rights reserved.</span>
                    </div>

                    <div>
                        <NuxtLink to="/help" class="hover:text-lime-300">
                            need help?
                        </NuxtLink>

                        |

                        <NuxtLink to="/legal" class="hover:text-lime-300">
                            legal
                        </NuxtLink>

                        |

                        <NuxtLink to="/sponsors" class="hover:text-lime-300">
                            sponsors 💗
                        </NuxtLink>
                    </div>

                </div>
            </div>

            <div class="flex mb-5 justify-end">
                <NuxtLink to="https://runonflux.io" target="_blank">
                    <img src="~/assets/running-on-flux-blue.png" class="h-10 border border-white/10 rounded-lg hover:border-lime-300/50" />
                </NuxtLink>
            </div>
        </div>
    </footer>
</template>
