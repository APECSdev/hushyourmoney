/* web/stores/p2pfusion/nip44.ts
   NIP-44 v2 encryption (secp256k1 ECDH → HKDF → ChaCha20 + HMAC-SHA256).
   Implemented from the published spec (fetched 2026-11-16):
   https://github.com/nostr-protocol/nips/blob/master/44.md  [cited]

   Wire format: base64( version(1) ‖ nonce(32) ‖ ciphertext(n) ‖ mac(32) )
   The "#" prefix (future non-base64 versions) is rejected. */

import { secp256k1 } from '@noble/curves/secp256k1.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { hmac } from '@noble/hashes/hmac.js'
import { chacha20 } from '@noble/ciphers/chacha.js'
import { randomBytes } from '@noble/hashes/utils.js'
import { concatBytes, hexToBytes, bytesToHex, utf8ToBytes, bytesToUtf8, xOnlyToCompressed } from './identity.ts'

const VERSION = 2
const SALT = utf8ToBytes('nip44-v2')
const MIN_PLAINTEXT = 1
const EXT_PREFIX_THRESHOLD = 65536

/** ECDH x-coordinate: ECDH(priv, pub) → 32-byte unhashed x (spec step 1). */
function sharedX(privHex: string, pubHexOrCompressed: string | Uint8Array): Uint8Array {
    const pub = typeof pubHexOrCompressed === 'string'
        ? (pubHexOrCompressed.length === 66 ? hexToBytes(pubHexOrCompressed) : xOnlyToCompressed(pubHexOrCompressed))
        : pubHexOrCompressed
    // getSharedSecret(..., true) returns the 33-byte compressed point; x = bytes 1..33
    return secp256k1.getSharedSecret(hexToBytes(privHex), pub, true).subarray(1, 33)
}

/** conversation_key = HKDF-extract(sha256, salt='nip44-v2', IKM=shared_x). */
export function conversationKey(privHex: string, pubHex: string): Uint8Array {
    return hmac(sha256, SALT, sharedX(privHex, pubHex))
}

/** HKDF-expand(sha256, PRK=conversation_key, info=nonce, L=76). */
function messageKeys(convKey: Uint8Array, nonce: Uint8Array): { chachaKey: Uint8Array; chachaNonce: Uint8Array; hmacKey: Uint8Array } {
    if (convKey.length !== 32) throw new Error('nip44: conversation key must be 32 bytes')
    if (nonce.length !== 32) throw new Error('nip44: nonce must be 32 bytes')
    const out: Uint8Array[] = []
    let t = new Uint8Array(0)
    for (let i = 1; out.length * 32 < 76; i++) {
        t = hmac(sha256, convKey, concatBytes(t, nonce, new Uint8Array([i])))
        out.push(t)
    }
    const okm = concatBytes(...out).subarray(0, 76)
    return { chachaKey: okm.subarray(0, 32), chachaNonce: okm.subarray(32, 44), hmacKey: okm.subarray(44, 76) }
}

/** Spec pseudocode calc_padded_len (powers-of-two buckets, min 32). */
export function calcPaddedLen(unpaddedLen: number): number {
    if (unpaddedLen < MIN_PLAINTEXT) throw new Error('nip44: plaintext too short')
    const nextPower = 1 << (Math.floor(Math.log2(unpaddedLen - 1)) + 1)
    const chunk = nextPower <= 256 ? 32 : nextPower / 8
    if (unpaddedLen <= 32) return 32
    return chunk * (Math.floor((unpaddedLen - 1) / chunk) + 1)
}

function pad(plaintext: Uint8Array): Uint8Array {
    // spec pad(): total = prefix ‖ plaintext ‖ zeros(calc_padded_len(L) - L)
    const prefixLen = plaintext.length < EXT_PREFIX_THRESHOLD ? 2 : 6
    const out = new Uint8Array(prefixLen + calcPaddedLen(plaintext.length))
    if (prefixLen === 2) {
        out[0] = (plaintext.length >> 8) & 0xff
        out[1] = plaintext.length & 0xff
    } else {
        // [0x00, 0x00][u32 BE]
        out[2] = (plaintext.length >>> 24) & 0xff
        out[3] = (plaintext.length >>> 16) & 0xff
        out[4] = (plaintext.length >>> 8) & 0xff
        out[5] = plaintext.length & 0xff
    }
    out.set(plaintext, prefixLen)
    return out
}

function unpad(padded: Uint8Array): Uint8Array {
    if (padded.length < 2) throw new Error('nip44: padded payload too short')
    const first2 = (padded[0] << 8) | padded[1]
    if (first2 === 0) {
        if (padded.length < 6) throw new Error('nip44: extended prefix truncated')
        const len = (padded[2] * 0x1000000) + (padded[3] << 16) + (padded[4] << 8) + padded[5]
        if (len < EXT_PREFIX_THRESHOLD) throw new Error('nip44: bad extended length')
        if (padded.length !== 6 + calcPaddedLen(len)) throw new Error('nip44: invalid padding')
        return padded.subarray(6, 6 + len)
    }
    if (padded.length !== 2 + calcPaddedLen(first2)) throw new Error('nip44: invalid padding')
    return padded.subarray(2, 2 + first2)
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false
    let diff = 0
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
    return diff === 0
}

export function nip44Encrypt(plaintext: string, privHex: string, pubHex: string): string {
    const pt = utf8ToBytes(plaintext)
    if (pt.length < MIN_PLAINTEXT) throw new Error('nip44: empty plaintext')
    const convKey = conversationKey(privHex, pubHex)
    const nonce = randomBytes(32)
    const { chachaKey, chachaNonce, hmacKey } = messageKeys(convKey, nonce)
    const ciphertext = chacha20(chachaKey, chachaNonce, pad(pt))
    const mac = hmac(sha256, hmacKey, concatBytes(nonce, ciphertext))
    return bytesToBase64(concatBytes(new Uint8Array([VERSION]), nonce, ciphertext, mac))
}

export function nip44Decrypt(payload: string, privHex: string, pubHex: string): string {
    if (payload.startsWith('#')) throw new Error('nip44: unsupported non-base64 version flag')
    const raw = base64ToBytes(payload)
    if (raw.length < 99) throw new Error('nip44: payload too short')
    if (raw[0] !== VERSION) throw new Error('nip44: unsupported version ' + raw[0])
    const nonce = raw.subarray(1, 33)
    const ciphertext = raw.subarray(33, raw.length - 32)
    const mac = raw.subarray(raw.length - 32)
    const convKey = conversationKey(privHex, pubHex)
    const { chachaKey, chachaNonce, hmacKey } = messageKeys(convKey, nonce)
    const expected = hmac(sha256, hmacKey, concatBytes(nonce, ciphertext))
    if (!constantTimeEqual(expected, mac)) throw new Error('nip44: MAC mismatch')
    const padded = chacha20(chachaKey, chachaNonce, ciphertext)
    return bytesToUtf8(unpad(padded))
}

/* ── base64 helpers (browser + node safe, RFC 4648 with padding) ── */
export function bytesToBase64(bytes: Uint8Array): string {
    let bin = ''
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
    return btoa(bin)
}

export function base64ToBytes(b64: string): Uint8Array {
    const bin = atob(b64)
    const out = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
    return out
}
