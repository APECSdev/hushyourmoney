// daemons/cashshuffle/src/relay-pool.js
//
// Relay pool for the CashShuffle daemon. ORCHESTRATION SKELETON.
// Contract: N relays, per-connection 80 ms outbox, dedupe, reconnect/backoff,
// NIP-42 AUTH. See ../../shared/src/nostr/README.md and ../PLAN.md (CS-4).

export class RelayPool {
  constructor({
    relays,
    pacingMs = 80,
    WebSocketImpl = globalThis.WebSocket,
    metrics,
    now = () => Date.now(),
  } = {}) {
    if (!Array.isArray(relays) || relays.length === 0) {
      throw new Error('relay-pool: at least one relay is required')
    }
    this.relays = [...relays]
    this.pacingMs = pacingMs
    this.WebSocketImpl = WebSocketImpl
    this.metrics = metrics
    this.now = now
  }

  async start() {
    throw new Error('RelayPool.start: not implemented — CS-4')
  }

  async publish(event) {
    throw new Error('RelayPool.publish: not implemented — CS-4')
  }

  async subscribe(filters, onEvent) {
    throw new Error('RelayPool.subscribe: not implemented — CS-4')
  }

  async authenticate(sign) {
    throw new Error('RelayPool.authenticate: not implemented — CS-4')
  }

  async stop() {
    throw new Error('RelayPool.stop: not implemented — CS-4')
  }

  health() {
    return { relays: this.relays, pacingMs: this.pacingMs, started: false }
  }
}
