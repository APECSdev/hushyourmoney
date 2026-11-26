// daemons/shared/test/nip59.test.js
//
// NIP-59 gift wrap + the two-day timestamp rule. No network.

import test from 'node:test'
import assert from 'node:assert/strict'

import { secp256k1, schnorr } from '@noble/curves/secp256k1.js'
import { bytesToHex } from '@noble/hashes/utils.js'

import {
  GIFT_WRAP_KIND,
  NIP59_MAX_BACKDATE_SECONDS,
  SEAL_KIND,
  createRumor,
  randomPastTimestamp,
  unwrapGift,
  wrapRumor,
} from '../src/nostr/nip59.js'
import { decrypt } from '../src/nostr/nip44.js'

const NOW = 1700000000000
const NOW_SECONDS = Math.floor(NOW / 1000)

const alice = secp256k1.utils.randomSecretKey()
const alicePub = schnorr.getPublicKey(alice)
const bob = secp256k1.utils.randomSecretKey()
const bobPub = schnorr.getPublicKey(bob)
const throwaway = secp256k1.utils.randomSecretKey()
const throwawayPub = schnorr.getPublicKey(throwaway)

function sequence(values) {
  let index = 0
  return () => values[Math.min(index++, values.length - 1)]
}

function makeGift({ random = sequence([0.1, 0.9]), mode = 'official' } = {}) {
  const rumor = createRumor({
    kind: 22231,
    content: JSON.stringify({ hello: 'world' }),
    publicKey: alicePub,
    createdAt: NOW_SECONDS,
  })
  const gift = wrapRumor({
    rumor,
    senderPrivateKey: alice,
    senderPublicKey: alicePub,
    recipientPublicKey: bobPub,
    throwawayPrivateKey: throwaway,
    throwawayPublicKey: throwawayPub,
    now: NOW,
    random,
    mode,
  })
  return { rumor, gift }
}

test('randomPastTimestamp stays inside the two-day window and in the past', () => {
  assert.equal(randomPastTimestamp({ now: NOW, random: () => 0 }), NOW_SECONDS - 1)
  assert.equal(
    randomPastTimestamp({ now: NOW, random: () => 0.999999999 }),
    NOW_SECONDS - NIP59_MAX_BACKDATE_SECONDS,
  )
})

test('gift wrap uses independent past timestamps and an unsigned rumor', () => {
  const { rumor, gift } = makeGift()
  assert.equal(gift.kind, GIFT_WRAP_KIND)
  assert.equal(gift.tags[0][0], 'p')
  assert.equal(gift.tags[0][1], bytesToHex(bobPub))
  assert.ok(gift.created_at < NOW_SECONDS)
  assert.ok(gift.created_at >= NOW_SECONDS - NIP59_MAX_BACKDATE_SECONDS)

  const seal = JSON.parse(decrypt(gift.content, bob, gift.pubkey, 'official'))
  assert.equal(seal.kind, SEAL_KIND)
  assert.ok(seal.created_at < NOW_SECONDS)
  assert.ok(seal.created_at >= NOW_SECONDS - NIP59_MAX_BACKDATE_SECONDS)
  assert.notEqual(seal.created_at, gift.created_at)

  assert.equal(rumor.sig, undefined)
  assert.equal(rumor.id, undefined)
})

test('unwrapGift returns the rumor and checks the sender', () => {
  const { rumor, gift } = makeGift()
  const unwrapped = unwrapGift({
    gift,
    recipientPrivateKey: bob,
    senderPublicKey: alicePub,
    now: NOW,
    mode: 'official',
  })
  assert.equal(unwrapped.content, rumor.content)
  assert.equal(unwrapped.pubkey, bytesToHex(alicePub))
  assert.throws(
    () => unwrapGift({
      gift,
      recipientPrivateKey: bob,
      senderPublicKey: throwawayPub,
      now: NOW,
      mode: 'official',
    }),
    /unexpected sender/,
  )
})

test('wrong recipient and tampered payloads are rejected', () => {
  const { gift } = makeGift()
  assert.throws(
    () => unwrapGift({
      gift,
      recipientPrivateKey: alice,
      senderPublicKey: alicePub,
      now: NOW,
      mode: 'official',
    }),
    /wrong recipient tag/,
  )

  const tampered = { ...gift, content: gift.content.slice(0, -2) + 'AA' }
  assert.throws(
    () => unwrapGift({
      gift: tampered,
      recipientPrivateKey: bob,
      senderPublicKey: alicePub,
      now: NOW,
      mode: 'official',
    }),
  )
})

test('a gift outside the two-day window is rejected', () => {
  const { gift } = makeGift()
  assert.throws(
    () => unwrapGift({
      gift,
      recipientPrivateKey: bob,
      senderPublicKey: alicePub,
      now: NOW + 3 * 86400 * 1000,
      mode: 'official',
    }),
    /two-day window/,
  )
})

test('nito-v0 mode round-trips through the gift wrap', () => {
  const { rumor, gift } = makeGift({ mode: 'nito-v0' })
  const unwrapped = unwrapGift({
    gift,
    recipientPrivateKey: bob,
    senderPublicKey: alicePub,
    now: NOW,
    mode: 'nito-v0',
  })
  assert.equal(unwrapped.content, rumor.content)
})
