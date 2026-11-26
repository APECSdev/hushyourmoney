// daemons/shared/src/cashshuffle/transport.js
//
// CashShuffle-over-Nostr transport: one round id, NIP-59 gift wraps, NIP-44
// payloads, and the shared relay pool. The transport only carries packets; the
// round state machine decides what they mean.
//
// Reference: ../nito.cash/apps/web/src/lib/cashshuffle/transport.js (MIT).

import { schnorr } from '@noble/curves/secp256k1.js'
import { bytesToHex, hexToBytes, randomBytes } from '@noble/hashes/utils.js'

import { RelayPool } from '../nostr/relay-pool.js'
import { GIFT_WRAP_KIND, NIP59_MAX_BACKDATE_SECONDS, createRumor, unwrapGift, wrapRumor } from '../nostr/nip59.js'
import { NIP44_MODE } from '../nostr/nip44.js'

export const CASHSHUFFLE_KIND = 22231
export const CASHSHUFFLE_CLOCK_SKEW_SECONDS = 300

function toBytes(value, name) {
  if (value instanceof Uint8Array) return value
  if (typeof value === 'string') return hexToBytes(value.replace(/^0x/, ''))
  throw new Error(`cashshuffle-transport: ${name} must be bytes or hex`)
}

export class CashShuffleTransport {
  constructor({
    relays,
    keys,
    roundId,
    onMessage = () => {},
    onError = () => {},
    WebSocketImpl,
    pacingMs = 80,
    pool,
    metrics,
    now = Date.now,
    random = Math.random,
    mode = NIP44_MODE,
  } = {}) {
    if (!Array.isArray(relays) || relays.length === 0) {
      throw new Error('cashshuffle-transport: at least one relay is required')
    }
    if (!keys?.privateKey || !keys?.publicKey) {
      throw new Error('cashshuffle-transport: session keys are required')
    }
    if (!roundId) throw new Error('cashshuffle-transport: roundId is required')

    this.relays = [...relays]
    const publicKey = toBytes(keys.publicKey, 'publicKey')
    this.keys = {
      privateKey: toBytes(keys.privateKey, 'privateKey'),
      publicKey: publicKey.length === 33 ? publicKey.subarray(1) : publicKey,
    }
    this.roundId = String(roundId)
    this.onMessage = onMessage
    this.onError = onError
    this.now = now
    this.random = random
    this.mode = mode
    this.ownsPool = !pool
    this.pool = pool || new RelayPool({
      relays: this.relays,
      pacingMs,
      WebSocketImpl,
      metrics,
      now: typeof now === 'function' ? now : () => now,
      random,
    })
    this.subscriptionId = null
  }

  connect() {
    this.pool.start()
    const since = Math.floor(this.now() / 1000)
      - NIP59_MAX_BACKDATE_SECONDS
      - CASHSHUFFLE_CLOCK_SKEW_SECONDS
    this.subscriptionId = this.pool.subscribe(
      [{ kinds: [GIFT_WRAP_KIND], '#p': [bytesToHex(this.keys.publicKey)], since }],
      (event) => this.#receive(event),
    )
    return this
  }

  async send(to, type, payload) {
    return this.#publish(to, type, payload)
  }

  async broadcast(members, type, payload) {
    const results = []
    for (const member of members) results.push(await this.#publish(member, type, payload))
    return results
  }

  close() {
    if (this.subscriptionId) this.pool.unsubscribe(this.subscriptionId)
    this.subscriptionId = null
    if (this.ownsPool) this.pool.stop()
  }

  async #publish(to, type, payload) {
    const recipient = typeof to === 'string' ? to : bytesToHex(to)
    const rumor = createRumor({
      kind: CASHSHUFFLE_KIND,
      content: JSON.stringify({
        round: this.roundId,
        type,
        from: bytesToHex(this.keys.publicKey),
        to: recipient,
        payload,
      }),
      publicKey: this.keys.publicKey,
      createdAt: Math.floor(this.now() / 1000),
    })
    const throwawayPrivateKey = randomBytes(32)
    const throwawayPublicKey = schnorr.getPublicKey(throwawayPrivateKey)
    const gift = wrapRumor({
      rumor,
      senderPrivateKey: this.keys.privateKey,
      senderPublicKey: this.keys.publicKey,
      recipientPublicKey: recipient,
      throwawayPrivateKey,
      throwawayPublicKey,
      now: this.now(),
      random: this.random,
      mode: this.mode,
    })
    return this.pool.publish(gift)
  }

  #receive(event) {
    if (event.kind !== GIFT_WRAP_KIND) return
    try {
      const rumor = unwrapGift({
        gift: event,
        recipientPrivateKey: this.keys.privateKey,
        now: this.now(),
        mode: this.mode,
      })
      const packet = JSON.parse(rumor.content)
      if (packet.round !== this.roundId) return
      this.onMessage(packet)
    } catch (error) {
      this.onError(error)
    }
  }
}
