// REST API servers.
// NOTE: bchn.fullstack.cash/v5 was RETIRED; we now broadcast via the
//       (free, rate-limited) psf-bch-api v6 REST endpoints.
//       Override at runtime with NUXT_PUBLIC_PSF_API_URL.
const PSF_API_FALLBACK = 'https://bch.fullstack.cash'

export default async function (_network = 'NEXA', _rawTx) {
    // FIXME Add Nexa broadcast functions.

    /* Request (runtime) configuration. */
    const runtimeConfig = useRuntimeConfig()

    /* Set API base URL. */
    const psfApiUrl = runtimeConfig.public.psfApiUrl || PSF_API_FALLBACK

    /* Send raw transaction. */
    const response = await $fetch(`${psfApiUrl}/v6/fulcrum/tx/broadcast`, {
        method: 'POST',
        body: {
            txHex: _rawTx,
        },
    })

    /* Set transaction ID. */
    // NOTE: Fulcrum may return the txid as a string OR an object.
    const txid = typeof response === 'string' ? response : response?.txid
    console.log(`Transaction ID: ${txid}`)
}
