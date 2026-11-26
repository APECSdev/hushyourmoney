// daemons/shared/src/nostr/nip59.js
//
// NIP-59 gift wrap for the Hush daemons.
//
//   rumor = the unsigned event-like packet (kind 22231 for CashShuffle)
//   seal  = kind 13, NIP-44(rumor), signed by the sender's per-round key
//   gift  = kind 1059, NIP-44(seal), signed by a fresh throwaway key, `p` tag
//
// Timestamps: the rumor's created_at is canonical; the seal and gift wrap get
// independent random timestamps up to two days in the past (NIP-59 line 111).
// The receiver accepts a two-day window plus clock skew.
//
// Reference: ../nito.cash/apps/web/src/lib/nostr/nip59.js (MIT).

import { schnorr } from '@noble/curves/secp256k1.js'
import { bytesToHex, hexToBytes, randomBytes } from '@noble/hashes/utils.js'

import { createEvent, verifyEvent } from './event.js'
import { decrypt, encrypt, NIP44_MODE } from './nip44.js'

export const SEAL_KIND = 13
export const GIFT_WRAP_KIND = 1059
export const NIP59_MAX_BACKDATE_SECONDS = 172800
export const NIP59_CLOCK_SKEW_SECONDS = 300

function toBytes(value) {
  if (value instanceof Uint8Array) return value
  if (typeof value === 'string') return hexToBytes(value.replace(/^0x/, ''))
  throw new Error('nip59: expected bytes or hex')
}

function recipientHex(publicKey) {
  const bytes = toBytes(publicKey)
  return bytesToHex(bytes.length === 33 ? bytes.subarray(1) : bytes)
}

export function randomPastTimestamp({
  now = Date.now(),
  maxBackdateSeconds = NIP59_MAX_BACKDATE_SECONDS,
  random = Math.random,
} = {}) {
  const nowSeconds = Math.floor(now / 1000)
  const backdate = Math.floor(Math.max(0, Math.min(0.999999999, random())) * maxBackdateSeconds) + 1
  return nowSeconds - backdate
}

export function createRumor({
  kind,
  content,
  tags = [],
  publicKey,
  createdAt = Math.floor(Date.now() / 1000),
}) {
  return {
    pubkey: bytesToHex(toBytes(publicKey)),
    created_at: createdAt,
    kind,
    tags,
    content,
  }
}

export function sealRumor(
  rumor,
  senderPrivateKey,
  senderPublicKey,
  recipientPublicKey,
  { now, random, mode = NIP44_MODE } = {},
) {
  const content = encrypt(
    JSON.stringify(rumor),
    senderPrivateKey,
    recipientPublicKey,
    undefined,
    mode,
  )
  return createEvent({
    kind: SEAL_KIND,
    content,
    tags: [],
    privateKey: senderPrivateKey,
    publicKey: senderPublicKey,
    createdAt: randomPastTimestamp({ now, random }),
  })
}

export function giftWrap(
  seal,
  recipientPublicKey,
  throwawayPrivateKey,
  throwawayPublicKey,
  { now, random, mode = NIP44_MODE } = {},
) {
  const content = encrypt(
    JSON.stringify(seal),
    throwawayPrivateKey,
    recipientPublicKey,
    undefined,
    mode,
  )
  return createEvent({
    kind: GIFT_WRAP_KIND,
    content,
    tags: [['p', recipientHex(recipientPublicKey)]],
    privateKey: throwawayPrivateKey,
    publicKey: throwawayPublicKey,
    createdAt: randomPastTimestamp({ now, random }),
  })
}

export function wrapRumor({
  rumor,
  senderPrivateKey,
  senderPublicKey,
  recipientPublicKey,
  throwawayPrivateKey,
  throwawayPublicKey,
  now,
  random,
  mode = NIP44_MODE,
}) {
  const seal = sealRumor(rumor, senderPrivateKey, senderPublicKey, recipientPublicKey, {
    now,
    random,
    mode,
  })
  return giftWrap(seal, recipientPublicKey, throwawayPrivateKey, throwawayPublicKey, {
    now,
    random,
    mode,
  })
}

export function unwrapGift({
  gift,
  recipientPrivateKey,
  senderPublicKey,
  now = Date.now(),
  maxAgeSeconds = NIP59_MAX_BACKDATE_SECONDS + NIP59_CLOCK_SKEW_SECONDS,
  mode = NIP44_MODE,
} = {}) {
  if (gift.kind !== GIFT_WRAP_KIND) throw new Error('nip59: not a gift wrap')
  if (!verifyEvent(gift)) throw new Error('nip59: invalid gift-wrap signature')

  const recipient = bytesToHex(schnorr.getPublicKey(toBytes(recipientPrivateKey)))
  const pTag = Array.isArray(gift.tags) ? gift.tags.find((tag) => tag[0] === 'p') : undefined
  if (pTag && recipient && pTag[1] !== recipient) throw new Error('nip59: wrong recipient tag')

  const seal = JSON.parse(decrypt(gift.content, recipientPrivateKey, gift.pubkey, mode))
  if (seal.kind !== SEAL_KIND) throw new Error('nip59: not a seal')
  if (!verifyEvent(seal)) throw new Error('nip59: invalid seal signature')
  if (senderPublicKey) {
    const expected = bytesToHex(toBytes(senderPublicKey))
    if (seal.pubkey !== expected) throw new Error('nip59: unexpected sender')
  }

  const nowSeconds = Math.floor(now / 1000)
  for (const event of [gift, seal]) {
    if (event.created_at > nowSeconds + NIP59_CLOCK_SKEW_SECONDS) {
      throw new Error('nip59: timestamp in the future')
    }
    if (event.created_at < nowSeconds - maxAgeSeconds) {
      throw new Error('nip59: timestamp outside the two-day window')
    }
  }

  return JSON.parse(decrypt(seal.content, recipientPrivateKey, seal.pubkey, mode))
}
