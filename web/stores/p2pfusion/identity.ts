/* web/stores/p2pfusion/identity.ts
   Per-round ephemeral Nostr identity (secp256k1 / BIP-340 x-only).
   Zeroized on round end — see P2P-FUSION-DESIGN.md §3.
   [cited · 00-Wallet landing/views/fusion.ts L241–249: ephemeral round keypair] */

import { secp256k1 } from '@noble/curves/secp256k1.js'
import { randomBytes } from '@noble/hashes/utils.js'

export interface EphemeralIdentity {
    /** 32-byte private key (hex, no 0x). */
    privHex: string
    /** 32-byte x-only public key (hex) — the Nostr identity for this round. */
    pubHex: string
}

/** Compressed (33-byte) form of an x-only pubkey: lift to even-y (BIP-340 convention). */
export function xOnlyToCompressed(xOnlyHex: string): Uint8Array {
    const x = xOnlyHex.replace(/^0x/, '').toLowerCase()
    if (!/^[0-9a-f]{64}$/.test(x)) throw new Error('identity: pubkey must be 64 hex chars')
    const compressed = new Uint8Array(33)
    compressed[0] = 0x02
    compressed.set(hexToBytes(x), 1)
    // validate it is a curve point (noble v2 Point.fromHex takes a hex string)
    secp256k1.Point.fromHex(bytesToHex(compressed))
    return compressed
}

/** Compressed form of a private key's public key. */
export function compressedFromPriv(privHex: string): Uint8Array {
    return secp256k1.getPublicKey(hexToBytes(privHex), true)
}

export function createEphemeralIdentity(): EphemeralIdentity {
    for (;;) {
        const priv = randomBytes(32)
        try {
            // rejects 0 and >= curve order
            const pub = secp256k1.getPublicKey(priv, true)
            return {
                privHex: bytesToHex(priv),
                pubHex: bytesToHex(pub.subarray(1)), // x-only
            }
        } catch {
            continue
        }
    }
}

/** Best-effort zeroization of the private key material (JS cannot guarantee memory wipe). */
export function destroyEphemeralIdentity(id: EphemeralIdentity | null): void {
    if (id) id.privHex = '0'.repeat(64)
}

export function bytesToHex(bytes: Uint8Array): string {
    let s = ''
    for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, '0')
    return s
}

export function hexToBytes(hex: string): Uint8Array {
    const h = hex.replace(/^0x/, '')
    if (h.length % 2 !== 0) throw new Error('hexToBytes: odd length')
    const out = new Uint8Array(h.length / 2)
    for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16)
    return out
}

export function utf8ToBytes(s: string): Uint8Array {
    return new TextEncoder().encode(s)
}

export function bytesToUtf8(b: Uint8Array): string {
    return new TextDecoder().decode(b)
}

export function concatBytes(...parts: Uint8Array[]): Uint8Array {
    let len = 0
    for (const p of parts) len += p.length
    const out = new Uint8Array(len)
    let off = 0
    for (const p of parts) {
        out.set(p, off)
        off += p.length
    }
    return out
}
