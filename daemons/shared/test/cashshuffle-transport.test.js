// daemons/shared/test/cashshuffle-transport.test.js
//
// CashShuffle-over-Nostr transport with an injected pool. The relay pool itself
// is covered by relay-pool.test.js; this test verifies the gift-wrap mapping.

import test from 'node:test'
import assert from 'node:assert/strict'

import { secp256k1, schnorr } from '@noble/curves/secp256k1.js'
import { bytesToHex } from '@noble/hashes/utils.js'

import { CASHSHUFFLE_KIND, CashShuffleTransport } from '../src/cashshuffle/transport.js'
import { GIFT_WRAP_KIND, createRumor, unwrapGift, wrapRumor } from '../src/nostr/nip59.js'

const NOW = 1700000000000
const NOW_SECONDS = Math.floor(NOW / 1000)

const alice = secp256k1.utils.randomSecretKey()
const alicePub = schnorr.getPublicKey(alice)
const bob = secp256k1.utils.randomSecretKey()
const bobPub = schnorr.getPublicKey(bob)
const carol = secp256k1.utils.randomSecretKey()
const carolPub = schnorr.getPublicKey(carol)

class FakePool {
  constructor() {
    this.started = false
    this.subscriptions = []
    this.published = []
    this.unsubscribed = null
    this.stopped = false
  }

  start() {
    this.started = true
  }

  subscribe(filters, onEvent) {
    this.subscriptions.push({ filters, onEvent })
    return 'sub-1'
  }

  unsubscribe(subId) {
    this.unsubscribed = subId
  }

  async publish(event) {
    this.published.push(event)
    return { ok: 1, total: 1, quorum: 1, failed: [] }
  }

  stop() {
    this.stopped = true
  }
}

function makeTransport({ pool = new FakePool(), onMessage = () => {} } = {}) {
  const transport = new CashShuffleTransport({
    relays: ['wss://relay.example'],
    keys: { privateKey: alice, publicKey: alicePub },
    roundId: 'round-1',
    onMessage,
    pool,
    now: () => NOW,
    random: () => 0.5,
  })
  return { transport, pool }
}

test('connect subscribes to the gift wrap for this round', () => {
  const { transport, pool } = makeTransport()
  transport.connect()
  assert.equal(pool.started, true)
  assert.equal(pool.subscriptions.length, 1)
  const [filter] = pool.subscriptions[0].filters
  assert.deepEqual(filter.kinds, [GIFT_WRAP_KIND])
  assert.deepEqual(filter['#p'], [bytesToHex(alicePub)])
  assert.equal(filter.since, NOW_SECONDS - 172800 - 300)
  transport.close()
})

test('send wraps a packet for the recipient', async () => {
  const { transport, pool } = makeTransport()
  transport.connect()
  await transport.send(bobPub, 'REGISTER', { amount: '100000' })

  assert.equal(pool.published.length, 1)
  const gift = pool.published[0]
  assert.equal(gift.kind, GIFT_WRAP_KIND)
  assert.equal(gift.tags[0][0], 'p')
  assert.equal(gift.tags[0][1], bytesToHex(bobPub))

  const rumor = unwrapGift({
    gift,
    recipientPrivateKey: bob,
    senderPublicKey: alicePub,
    now: NOW,
    mode: 'official',
  })
  const packet = JSON.parse(rumor.content)
  assert.equal(rumor.kind, CASHSHUFFLE_KIND)
  assert.equal(packet.round, 'round-1')
  assert.equal(packet.type, 'REGISTER')
  assert.equal(packet.from, bytesToHex(alicePub))
  assert.equal(packet.to, bytesToHex(bobPub))
  assert.deepEqual(packet.payload, { amount: '100000' })
  transport.close()
})

test('broadcast fans out to every member', async () => {
  const { transport, pool } = makeTransport()
  transport.connect()
  await transport.broadcast([bobPub, carolPub], 'ANNOUNCEMENT', {})
  assert.equal(pool.published.length, 2)
  const recipients = pool.published.map((gift) => gift.tags[0][1])
  assert.deepEqual(recipients, [bytesToHex(bobPub), bytesToHex(carolPub)])
  transport.close()
})

test('an inbound gift for this round reaches onMessage', () => {
  const messages = []
  const { transport, pool } = makeTransport({ onMessage: (packet) => messages.push(packet) })
  transport.connect()

  const rumor = createRumor({
    kind: CASHSHUFFLE_KIND,
    content: JSON.stringify({
      round: 'round-1',
      type: 'SHUFFLE',
      from: bytesToHex(bobPub),
      to: bytesToHex(alicePub),
      payload: { onion: 'x' },
    }),
    publicKey: bobPub,
    createdAt: NOW_SECONDS,
  })
  const throwaway = secp256k1.utils.randomSecretKey()
  const gift = wrapRumor({
    rumor,
    senderPrivateKey: bob,
    senderPublicKey: bobPub,
    recipientPublicKey: alicePub,
    throwawayPrivateKey: throwaway,
    throwawayPublicKey: schnorr.getPublicKey(throwaway),
    now: NOW,
    random: () => 0.5,
  })
  pool.subscriptions[0].onEvent(gift)
  assert.equal(messages.length, 1)
  assert.equal(messages[0].type, 'SHUFFLE')
  assert.equal(messages[0].payload.onion, 'x')

  const other = wrapRumor({
    rumor: { ...rumor, content: JSON.stringify({ round: 'other', type: 'SHUFFLE' }) },
    senderPrivateKey: bob,
    senderPublicKey: bobPub,
    recipientPublicKey: alicePub,
    throwawayPrivateKey: throwaway,
    throwawayPublicKey: schnorr.getPublicKey(throwaway),
    now: NOW,
    random: () => 0.5,
  })
  pool.subscriptions[0].onEvent(other)
  assert.equal(messages.length, 1)
  transport.close()
})

test('close unsubscribes and leaves an injected pool running', () => {
  const { transport, pool } = makeTransport()
  transport.connect()
  transport.close()
  assert.equal(pool.unsubscribed, 'sub-1')
  assert.equal(pool.stopped, false)
})
