// daemons/shared/src/nostr/relay-pool.js
//
// N-relay pool for the Hush daemons:
//   - one Relay per URL, reconnect/backoff and resubscribe in relay.js
//   - per-connection 80 ms outbox (NOSTR_RELAY_PACING_MS)
//   - dedupe inbound events by event id
//   - publish quorum (default: every relay)
//   - NIP-42 AUTH fan-out
//
// Reference: ../nito.cash/apps/web/src/lib/cashshuffle/transport.js (MIT).

import { Relay } from './relay.js'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class RelayPool {
  constructor({
    relays,
    pacingMs = 80,
    quorum,
    WebSocketImpl,
    metrics,
    now = () => Date.now(),
    random = Math.random,
    relayOptions = {},
    dedupeTtlMs = 10 * 60 * 1000,
    dedupeMax = 10000,
    onEvent = () => {},
    onAuth = () => {},
  } = {}) {
    if (!Array.isArray(relays) || relays.length === 0) {
      throw new Error('relay-pool: at least one relay is required')
    }
    this.relays = [...relays]
    this.pacingMs = pacingMs
    this.quorum = quorum ?? this.relays.length
    if (!Number.isInteger(this.quorum) || this.quorum < 1 || this.quorum > this.relays.length) {
      throw new Error('relay-pool: quorum must be between 1 and the relay count')
    }
    this.WebSocketImpl = WebSocketImpl || (typeof WebSocket !== 'undefined' ? WebSocket : null)
    this.metrics = metrics
    this.now = now
    this.random = random
    this.relayOptions = relayOptions
    this.dedupeTtlMs = dedupeTtlMs
    this.dedupeMax = dedupeMax
    this.onEvent = onEvent
    this.onAuth = onAuth
    this.clients = []
    this.subscriptions = new Map()
    this.seen = new Map()
    this.nextSubId = 1
    this.started = false
  }

  start() {
    if (this.started) return this
    this.started = true
    for (const url of this.relays) {
      const client = new Relay(url, {
        ...this.relayOptions,
        WebSocketImpl: this.WebSocketImpl,
        onEvent: (event) => this.#receive(event),
        onAuth: (challenge, relayUrl) => this.onAuth(challenge, relayUrl),
        onReconnect: (count) => {
          if (this.metrics) this.metrics.inc('nostr_relay_reconnects_total', { relay: url })
          if (this.relayOptions.onReconnect) this.relayOptions.onReconnect(count, url)
        },
      })
      this.clients.push(client)
      client.connect()
    }
    return this
  }

  async publish(event, { quorum = this.quorum, timeout = 10000 } = {}) {
    this.start()
    const results = await Promise.allSettled(
      this.clients.map((client) => this.#enqueue(client, event, timeout)),
    )
    const ok = results.filter((result) => result.status === 'fulfilled').length
    if (ok < quorum) {
      const failed = results
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason?.message || 'unknown')
      throw new Error(
        `relay-pool: only ${ok}/${this.clients.length} relays accepted (quorum ${quorum}); ${failed.join(' | ')}`,
      )
    }
    return {
      ok,
      total: this.clients.length,
      quorum,
      failed: results
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason?.message || 'unknown'),
    }
  }

  subscribe(filters, onEvent = this.onEvent) {
    this.start()
    const subId = `pool-${this.nextSubId++}`
    const entries = this.clients.map((client) => ({
      client,
      relaySubId: client.subscribe(filters, (event) => this.#receive(event, onEvent)),
    }))
    this.subscriptions.set(subId, { entries, onEvent })
    return subId
  }

  unsubscribe(subId) {
    const subscription = this.subscriptions.get(subId)
    if (!subscription) return
    for (const { client, relaySubId } of subscription.entries) client.unsubscribe(relaySubId)
    this.subscriptions.delete(subId)
  }

  async authenticate(sign) {
    this.start()
    const targets = this.clients.filter((client) => client.challenge)
    if (targets.length === 0) throw new Error('relay-pool: no AUTH challenge')
    return Promise.allSettled(targets.map((client) => client.authenticate(sign)))
  }

  stop() {
    for (const client of this.clients) client.close()
    this.clients = []
    this.subscriptions.clear()
    this.seen.clear()
    this.started = false
  }

  health() {
    return this.clients.map((client) => client.health())
  }

  #receive(event, onEvent = this.onEvent) {
    if (!event || typeof event.id !== 'string') return
    const now = this.now()
    this.#pruneSeen(now)
    if (this.seen.has(event.id)) return
    this.seen.set(event.id, now)
    onEvent(event)
  }

  #pruneSeen(now) {
    for (const [id, timestamp] of this.seen) {
      if (now - timestamp > this.dedupeTtlMs) this.seen.delete(id)
      else break
    }
    while (this.seen.size > this.dedupeMax) {
      const oldest = this.seen.keys().next().value
      this.seen.delete(oldest)
    }
  }

  #nextDelay(client, now) {
    const scheduled = Math.max(client.lastPublishAt || 0, now)
    const delay = Math.max(0, scheduled - now)
    client.lastPublishAt = scheduled + this.pacingMs
    return delay
  }

  #enqueue(client, event, timeout) {
    const previous = client.outbox || Promise.resolve()
    const run = previous
      .catch(() => {})
      .then(async () => {
        const delay = this.#nextDelay(client, this.now())
        if (delay > 0) await sleep(delay)
        return client.publish(event, { timeout })
      })
    client.outbox = run
    return run
  }
}
