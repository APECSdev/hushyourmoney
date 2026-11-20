/* web/stores/p2pfusion/onion.ts
   Onion mix-net for output registration (P2P-FUSION-DESIGN.md §4 phase 4).
   Design lineage [cited · 00-Wallet fusion.ts L659–745]: payload wrapped through
   ALL peers in sorted order, each hop peels one layer and shuffles.
   Our delta [proposed]: each layer is NIP-44 (spec'd AEAD) under a fresh
   ephemeral key, and the layer carries that ephemeral pubkey for peeling. */

import { secp256k1 } from '@noble/curves/secp256k1.js'
import { randomBytes } from '@noble/hashes/utils.js'
import { nip44Encrypt, nip44Decrypt } from './nip44.ts'
import { bytesToHex, hexToBytes, concatBytes, xOnlyToCompressed } from './identity.ts'

/**
 * Wrap `payload` through `hopPubHexes` (in delivery order).
 * Layer wire format: ephPub33 ‖ nip44Payload(utf8).
 * The final (innermost) layer is the plaintext payload itself.
 */
export function onionWrap(payload: string, hopPubHexes: string[]): Uint8Array {
    if (hopPubHexes.length === 0) throw new Error('onion: no hops')
    let current: Uint8Array = new TextEncoder().encode(payload)
    for (let i = hopPubHexes.length - 1; i >= 0; i--) {
        const eph = randomBytes(32)
        const ephPrivHex = bytesToHex(eph)
        const ephPub33 = secp256k1.getPublicKey(eph, true)
        const layerText = bytesToBase64Compat(current)
        const encrypted = nip44Encrypt(layerText, ephPrivHex, hopPubHexes[i])
        current = concatBytes(ephPub33, new TextEncoder().encode(encrypted))
    }
    return current
}

/**
 * Peel one layer with our private key. Returns the inner bytes.
 * Throws if the layer is not addressed to us (or is corrupt).
 */
export function onionPeel(layer: Uint8Array, myPrivHex: string): Uint8Array {
    if (layer.length < 34) throw new Error('onion: layer too short')
    const ephPub33 = layer.subarray(0, 33)
    // validate curve point before use
    secp256k1.Point.fromHex(bytesToHex(ephPub33))
    const encrypted = new TextDecoder().decode(layer.subarray(33))
    const innerB64 = nip44Decrypt(encrypted, myPrivHex, bytesToHex(ephPub33))
    return bytesFromBase64Compat(innerB64)
}

/** Whether the peeled bytes are the innermost payload (valid UTF-8 JSON) or another layer. */
export function isFinalLayer(inner: Uint8Array): boolean {
    try {
        const text = new TextDecoder('utf-8', { fatal: true }).decode(inner)
        JSON.parse(text)
        return true
    } catch {
        return false
    }
}

/* layer bytes travel inside a NIP-44 string payload → base64 both ways */
function bytesToBase64Compat(bytes: Uint8Array): string {
    let bin = ''
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
    return btoa(bin)
}

function bytesFromBase64Compat(b64: string): Uint8Array {
    const bin = atob(b64)
    const out = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
    return out
}

/** Re-export for tests that need to lift x-only keys. */
export { xOnlyToCompressed, hexToBytes }
