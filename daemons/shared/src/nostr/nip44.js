// daemons/shared/src/nostr/nip44.js
//
// NIP-44 v2 encryption for the Hush daemons.
//
// Two modes:
//   official  — the reference NIP-44 v2 KDF and padding
//   nito-v0   — the private variant used by the Nito reference tree
//
// Official references:
//   https://github.com/nostr-protocol/nips/blob/master/44.md
//   https://github.com/paulmillr/nip44 (nip44.vectors.json)
// Nito reference:
//   ../nito.cash/apps/web/src/lib/nostr/nip44.js
//
// The two modes differ in BOTH the KDF and the padding:
//   official: conversation_key = HKDF-Extract(sharedX, "nip44-v2")
//             message_keys     = HKDF-Expand(conversation_key, nonce, 76)
//             padding          = 2-byte u16 length + chunked padding
//   nito-v0:  conversation_key = raw sharedX
//             message_keys     = HKDF(sharedX, "nip44-v2", nonce, 76)
//             padding          = 4-byte u32 length + next-power-of-two padding
//
// The official JavaScript reference caps plaintext at 65,535 bytes; this module
// matches that cap. The 6-byte extended prefix in the NIP text is not exercised
// by the reference implementation or its vectors.

import { chacha20 } from '@noble/ciphers/chacha.js'
import { secp256k1 } from '@noble/curves/secp256k1.js'
import { extract as hkdfExtract, expand as hkdfExpand, hkdf } from '@noble/hashes/hkdf.js'
import { hmac } from '@noble/hashes/hmac.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { randomBytes } from '@noble/hashes/utils.js'

export const NIP44_VERSION = 2
export const NIP44_SALT = new TextEncoder().encode('nip44-v2')
export const NIP44_MODES = Object.freeze(['official', 'nito-v0'])

const MIN_PLAINTEXT = 1
const MAX_PLAINTEXT = 0xffff

const envMode = typeof process !== 'undefined' && process.env ? process.env.NIP44_MODE : undefined
export const NIP44_MODE = NIP44_MODES.includes(envMode) ? envMode : 'official'

function resolveMode(mode) {
  const resolved = mode ?? NIP44_MODE
  if (!NIP44_MODES.includes(resolved)) throw new Error(`nip44: unknown mode ${resolved}`)
  return resolved
}

function toBytes(value, name) {
  if (value instanceof Uint8Array) return value
  if (typeof value === 'string') {
    const hex = value.startsWith('0x') ? value.slice(2) : value
    if (!/^[0-9a-f]*$/i.test(hex) || hex.length % 2 !== 0) {
      throw new Error(`nip44: ${name} must be bytes or hex`)
    }
    return Uint8Array.from(Buffer.from(hex, 'hex'))
  }
  throw new Error(`nip44: ${name} must be bytes or hex`)
}

function concatBytes(...arrays) {
  const total = arrays.reduce((sum, array) => sum + array.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const array of arrays) {
    out.set(array, offset)
    offset += array.length
  }
  return out
}

function equalBytes(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let index = 0; index < a.length; index += 1) diff |= a[index] ^ b[index]
  return diff === 0
}

function u16be(value) {
  const bytes = new Uint8Array(2)
  new DataView(bytes.buffer).setUint16(0, value, false)
  return bytes
}

function u32be(value) {
  const bytes = new Uint8Array(4)
  new DataView(bytes.buffer).setUint32(0, value, false)
  return bytes
}

function readU16be(bytes, offset = 0) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint16(offset, false)
}

function readU32be(bytes, offset = 0) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, false)
}

function base64Encode(bytes) {
  return Buffer.from(bytes).toString('base64')
}

function base64Decode(value) {
  if (typeof value !== 'string') throw new Error('nip44: payload must be base64')
  if (value.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
    throw new Error('nip44: invalid base64')
  }
  const bytes = Uint8Array.from(Buffer.from(value, 'base64'))
  if (base64Encode(bytes) !== value) throw new Error('nip44: invalid base64')
  return bytes
}

function getSharedX(privateKey, publicKey) {
  const priv = toBytes(privateKey, 'privateKey')
  const pub = toBytes(publicKey, 'publicKey')
  if (priv.length !== 32) throw new Error('nip44: private key must be 32 bytes')
  const compressed = pub.length === 32 ? new Uint8Array([0x02, ...pub]) : pub
  if (compressed.length !== 33) throw new Error('nip44: public key must be 32 or 33 bytes')
  const shared = secp256k1.getSharedSecret(priv, compressed)
  return shared.subarray(1, 33)
}

export function getConversationKey(privateKey, publicKey, mode = NIP44_MODE) {
  const resolved = resolveMode(mode)
  const sharedX = getSharedX(privateKey, publicKey)
  return resolved === 'official' ? hkdfExtract(sha256, sharedX, NIP44_SALT) : sharedX
}

export function getMessageKeys(conversationKey, nonce, mode = NIP44_MODE) {
  const resolved = resolveMode(mode)
  const key = toBytes(conversationKey, 'conversationKey')
  const nonceBytes = toBytes(nonce, 'nonce')
  if (key.length !== 32) throw new Error('nip44: conversation key must be 32 bytes')
  if (nonceBytes.length !== 32) throw new Error('nip44: nonce must be 32 bytes')
  const keys = resolved === 'official'
    ? hkdfExpand(sha256, key, nonceBytes, 76)
    : hkdf(sha256, key, NIP44_SALT, nonceBytes, 76)
  return {
    chachaKey: keys.subarray(0, 32),
    chachaNonce: keys.subarray(32, 44),
    hmacKey: keys.subarray(44, 76),
  }
}

export function calcPaddedLen(len, mode = NIP44_MODE) {
  const resolved = resolveMode(mode)
  if (!Number.isSafeInteger(len) || len < MIN_PLAINTEXT) {
    throw new Error('nip44: invalid plaintext length')
  }
  if (resolved === 'nito-v0') return len <= 32 ? 32 : 2 ** Math.ceil(Math.log2(len))
  if (len <= 32) return 32
  const nextPower = 1 << (Math.floor(Math.log2(len - 1)) + 1)
  const chunk = nextPower <= 256 ? 32 : nextPower / 8
  return chunk * (Math.floor((len - 1) / chunk) + 1)
}

function pad(plaintext, mode) {
  const resolved = resolveMode(mode)
  const bytes = typeof plaintext === 'string'
    ? new TextEncoder().encode(plaintext)
    : Uint8Array.from(plaintext)
  const len = bytes.length
  if (len < MIN_PLAINTEXT || len > MAX_PLAINTEXT) throw new Error('nip44: invalid plaintext length')

  if (resolved === 'nito-v0') {
    const padded = new Uint8Array(4 + calcPaddedLen(len, resolved))
    padded.set(u32be(len), 0)
    padded.set(bytes, 4)
    return padded
  }

  const padded = new Uint8Array(2 + calcPaddedLen(len, resolved))
  padded.set(u16be(len), 0)
  padded.set(bytes, 2)
  return padded
}

function unpad(padded, mode) {
  const resolved = resolveMode(mode)

  if (resolved === 'nito-v0') {
    if (padded.length < 4) throw new Error('nip44: invalid padding')
    const len = readU32be(padded, 0)
    if (len < MIN_PLAINTEXT || len > MAX_PLAINTEXT) throw new Error('nip44: invalid padding')
    if (padded.length !== 4 + calcPaddedLen(len, resolved)) throw new Error('nip44: invalid padding')
    return padded.subarray(4, 4 + len)
  }

  if (padded.length < 2) throw new Error('nip44: invalid padding')
  const len = readU16be(padded, 0)
  if (len < MIN_PLAINTEXT || len > MAX_PLAINTEXT) throw new Error('nip44: invalid padding')
  if (padded.length !== 2 + calcPaddedLen(len, resolved)) throw new Error('nip44: invalid padding')
  return padded.subarray(2, 2 + len)
}

export function encryptWithConversationKey(plaintext, conversationKey, nonce = randomBytes(32), mode = NIP44_MODE) {
  const resolved = resolveMode(mode)
  const nonceBytes = toBytes(nonce, 'nonce')
  if (nonceBytes.length !== 32) throw new Error('nip44: nonce must be 32 bytes')
  const keys = getMessageKeys(conversationKey, nonceBytes, resolved)
  const padded = pad(plaintext, resolved)
  const ciphertext = chacha20(keys.chachaKey, keys.chachaNonce, padded)
  const mac = hmac(sha256, keys.hmacKey, concatBytes(nonceBytes, ciphertext))
  return base64Encode(concatBytes(new Uint8Array([NIP44_VERSION]), nonceBytes, ciphertext, mac))
}

export function decryptWithConversationKey(payload, conversationKey, mode = NIP44_MODE) {
  const resolved = resolveMode(mode)
  const raw = base64Decode(payload)
  if (raw.length < 99) throw new Error('nip44: payload too short')
  if (raw[0] !== NIP44_VERSION) throw new Error(`nip44: unknown encryption version ${raw[0]}`)

  const nonce = raw.subarray(1, 33)
  const ciphertext = raw.subarray(33, raw.length - 32)
  const mac = raw.subarray(raw.length - 32)
  const keys = getMessageKeys(conversationKey, nonce, resolved)
  const expected = hmac(sha256, keys.hmacKey, concatBytes(nonce, ciphertext))
  if (!equalBytes(expected, mac)) throw new Error('nip44: invalid MAC')

  const padded = chacha20(keys.chachaKey, keys.chachaNonce, ciphertext)
  const plaintext = unpad(padded, resolved)
  return new TextDecoder('utf-8', { fatal: true }).decode(plaintext)
}

export function encrypt(plaintext, privateKey, publicKey, nonce = randomBytes(32), mode = NIP44_MODE) {
  const conversationKey = getConversationKey(privateKey, publicKey, mode)
  return encryptWithConversationKey(plaintext, conversationKey, nonce, mode)
}

export function decrypt(payload, privateKey, publicKey, mode = NIP44_MODE) {
  const conversationKey = getConversationKey(privateKey, publicKey, mode)
  return decryptWithConversationKey(payload, conversationKey, mode)
}
