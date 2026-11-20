/* web/stores/p2pfusion/giftwrap.ts
   NIP-59 gift wrap (rumor → seal → wrap) with NIP-44 v2 payloads.
   Implemented from the published spec (fetched 2026-11-16):
   https://github.com/nostr-protocol/nips/blob/master/59.md  [cited]

   Kind numbers: 13 = seal, 1059 = persistent gift wrap (used for rounds),
   21059 = ephemeral gift wrap (reserved for future live modes). */

import { secp256k1, schnorr } from '@noble/curves/secp256k1.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { randomBytes } from '@noble/hashes/utils.js'
import { nip44Encrypt, nip44Decrypt } from './nip44.ts'
import { bytesToHex, hexToBytes, concatBytes } from './identity.ts'

export interface NostrEvent {
    id: string
    pubkey: string
    created_at: number
    kind: number
    tags: string[][]
    content: string
    sig: string
}

export interface RumorEvent {
    pubkey: string
    created_at: number
    kind: number
    tags: string[][]
    content: string
}

const KIND_SEAL = 13
const KIND_WRAP = 1059

/** Event id per NIP-01: sha256 of the canonical serialization. */
export function eventId(ev: Omit<NostrEvent, 'id' | 'sig'>): Uint8Array {
    const serialized = JSON.stringify([0, ev.pubkey, ev.created_at, ev.kind, ev.tags, ev.content])
    return sha256(new TextEncoder().encode(serialized))
}

/** Sign an event with a 32-byte private key (BIP-340 schnorr over the event id). */
export function signEvent(ev: Omit<NostrEvent, 'id' | 'sig'>, privHex: string): NostrEvent {
    const idBytes = eventId(ev)
    const sig = schnorr.sign(idBytes, hexToBytes(privHex))
    return {
        ...ev,
        id: bytesToHex(idBytes),
        sig: bytesToHex(sig),
    }
}

/** Verify a signed event (id integrity + schnorr signature). */
export function verifyEvent(ev: NostrEvent): boolean {
    try {
        const expectedId = bytesToHex(eventId(ev))
        if (expectedId !== ev.id) return false
        return schnorr.verify(hexToBytes(ev.sig), hexToBytes(ev.id), hexToBytes(ev.pubkey))
    } catch {
        return false
    }
}

/** Build an unsigned rumor (no id/sig — NIP-59 §1). */
export function createRumor(opts: { pubkey: string; kind: number; content: string; tags?: string[][]; createdAt?: number }): RumorEvent {
    return {
        pubkey: opts.pubkey,
        created_at: opts.createdAt ?? Math.floor(Date.now() / 1000),
        kind: opts.kind,
        tags: opts.tags ?? [],
        content: opts.content,
    }
}

/**
 * Wrap a rumor for a recipient (NIP-59 §2–3):
 *   seal = kind 13, NIP-44(rumor JSON) sender→recipient, signed by sender
 *   wrap = kind 1059, NIP-44(seal JSON) ephemeral→recipient, random past created_at
 */
export function giftWrap(rumor: RumorEvent, senderPrivHex: string, recipientPubHex: string): NostrEvent {
    const seal = signEvent({
        pubkey: rumor.pubkey,
        created_at: Math.floor(Date.now() / 1000),
        kind: KIND_SEAL,
        tags: [],
        content: nip44Encrypt(JSON.stringify(rumor), senderPrivHex, recipientPubHex),
    }, senderPrivHex)

    const eph = randomBytes(32)
    const ephPub = bytesToHex(secp256k1.getPublicKey(eph, true).subarray(1))
    const jitter = Math.floor(Math.random() * 172800) // up to 2 days in the past
    return signEvent({
        pubkey: ephPub,
        created_at: Math.floor(Date.now() / 1000) - jitter,
        kind: KIND_WRAP,
        tags: [['p', recipientPubHex]],
        content: nip44Encrypt(JSON.stringify(seal), bytesToHex(eph), recipientPubHex),
    }, bytesToHex(eph))
}

/**
 * Unwrap a gift wrap addressed to us (NIP-59):
 *   decrypt wrap → verify seal signature → decrypt seal → rumor (unsigned, by design)
 */
export function giftUnwrap(wrap: NostrEvent, recipientPrivHex: string): { rumor: RumorEvent; sealPubkey: string } {
    if (wrap.kind !== KIND_WRAP) throw new Error('giftwrap: not a kind-1059 wrap')
    const sealJson = nip44Decrypt(wrap.content, recipientPrivHex, wrap.pubkey)
    const seal = JSON.parse(sealJson) as NostrEvent
    if (seal.kind !== KIND_SEAL) throw new Error('giftwrap: inner event is not a kind-13 seal')
    if (!verifyEvent(seal)) throw new Error('giftwrap: seal signature invalid')
    const rumorJson = nip44Decrypt(seal.content, recipientPrivHex, seal.pubkey)
    const rumor = JSON.parse(rumorJson) as RumorEvent
    return { rumor, sealPubkey: seal.pubkey }
}

/** Convenience: bytes → base64 for onion layers (kept here to avoid a cycle). */
export function concat2(a: Uint8Array, b: Uint8Array): Uint8Array {
    return concatBytes(a, b)
}
