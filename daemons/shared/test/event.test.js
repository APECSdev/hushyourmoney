// daemons/shared/test/event.test.js
//
// Nostr event serialization + BIP-340 signing. No network.

import test from 'node:test'
import assert from 'node:assert/strict'

import { secp256k1, schnorr } from '@noble/curves/secp256k1.js'
import { bytesToHex } from '@noble/hashes/utils.js'

import {
  createEvent,
  getEventHash,
  serializeEvent,
  signEvent,
  verifyEvent,
} from '../src/nostr/event.js'

const privateKey = secp256k1.utils.randomSecretKey()
const publicKey = schnorr.getPublicKey(privateKey)
const publicKeyHex = bytesToHex(publicKey)

test('createEvent signs a canonical event', () => {
  const event = createEvent({
    kind: 1,
    content: 'hello cashshuffle',
    tags: [['t', 'test']],
    privateKey,
    publicKey,
    createdAt: 1700000000,
  })

  assert.equal(event.pubkey, publicKeyHex)
  assert.equal(event.created_at, 1700000000)
  assert.equal(event.kind, 1)
  assert.equal(event.id, getEventHash(event))
  assert.equal(verifyEvent(event), true)
})

test('serializeEvent is the NIP-01 canonical array', () => {
  const event = {
    pubkey: publicKeyHex,
    created_at: 1700000000,
    kind: 1,
    tags: [['t', 'test']],
    content: 'hello',
  }
  assert.equal(
    serializeEvent(event),
    JSON.stringify([0, publicKeyHex, 1700000000, 1, [['t', 'test']], 'hello']),
  )
})

test('tampering the content or id fails verification', () => {
  const event = createEvent({
    kind: 1,
    content: 'hello',
    privateKey,
    publicKey,
    createdAt: 1700000000,
  })

  assert.equal(verifyEvent({ ...event, content: 'goodbye' }), false)
  assert.equal(verifyEvent({ ...event, id: '00'.repeat(32) }), false)
})

test('signEvent accepts a hex private key and a hex public key', () => {
  const event = signEvent(
    {
      pubkey: publicKeyHex,
      created_at: 1700000001,
      kind: 1,
      tags: [],
      content: 'hex keys',
    },
    bytesToHex(privateKey),
  )
  assert.equal(verifyEvent(event), true)
})
