<script setup lang="ts">
/* Define properties. */
// https://vuejs.org/guide/components/props.html#props-declaration
const props = defineProps({
    data: {
        type: [Object],
    },
})

/* Initialize stores. */
import { useWalletStore } from '@/stores/wallet'
const Wallet = useWalletStore()

const mnemonic = ref(null)

const createWallet = () => {
    /* Create a new wallet. */
    Wallet.createWallet()
}

const importWallet = () => {
    // NOTE: This confirmation is NOT REQUIRED for single-application
    //       wallet integration(s), and can be SAFELY removed.
    if (confirm('Before you continue, please close ALL other Hush Your Money browser windows. Failure to do so may result in LOSS OF ASSETS!\n\nWould you like to continue importing an existing wallet?')) {
        /* Set/save mnemonic. */
        // NOTE: Will save `entropy` to the local storage.
        Wallet.setMnemonic(mnemonic.value)
    }
}

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
    <section class="flex flex-col gap-5">
        <p class="px-3 py-2 border border-lime-300/30 bg-lime-300/10 text-base font-medium text-lime-200 rounded-lg shadow-md">
            Welcome to your Hush Your Money wallet.
            Click the button below to create a new wallet and begin trading.
        </p>

        <div @click="createWallet" class="cursor-pointer px-3 py-2 w-full cursor-pointer rounded-full bg-lime-300 px-4 py-3 text-center font-mono text-sm font-bold uppercase tracking-[0.15em] text-[#131a05] transition-colors hover:bg-lime-200">
            Create New Wallet
        </div>

        <hr />

        <p class="px-3 py-2 border border-lime-300/30 bg-lime-300/10 text-base font-medium text-lime-200 rounded-lg shadow-md">
            Import your existing wallet into Hush Your Money.
        </p>

        <textarea
            placeholder="Seed #1 Seed #2 Seed #3 ..."
            v-model="mnemonic"
            class="px-3 py-2 border border-white/15 rounded-lg bg-white/[0.04] font-mono text-slate-200 placeholder:text-slate-600 focus:border-lime-300/50"
        />

        <div @click="importWallet" class="cursor-pointer px-3 py-2 w-full cursor-pointer rounded-full bg-lime-300 px-4 py-3 text-center font-mono text-sm font-bold uppercase tracking-[0.15em] text-[#131a05] transition-colors hover:bg-lime-200">
            Import Existing Wallet
        </div>
    </section>
</template>
