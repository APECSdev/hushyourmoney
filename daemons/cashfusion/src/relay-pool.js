// daemons/cashfusion/src/relay-pool.js
//
// Relay pool adapter for the CashFusion daemon. ORCHESTRATION SKELETON.
// Use the shared relay pool; do not fork the transport.
// See ../../shared/src/nostr/README.md and ../PLAN.md (CF-5).

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
    throw new Error('RelayPool.start: not implemented — CF-5')
  }

  async publish(event) {
    throw new Error('RelayPool.publish: not implemented — CF-5')
  }

  async subscribe(filters, onEvent) {
    throw new Error('RelayPool.subscribe: not implemented — CF-5')
  }

  async authenticate(sign) {
    throw new Error('RelayPool.authenticate: not implemented — CF-5')
  }

  async stop() {
    throw new Error('RelayPool.stop: not implemented — CF-5')
  }

  health() {
    return { relays: this.relays, pacingMs: this.pacingMs, started: false }
  }
}
