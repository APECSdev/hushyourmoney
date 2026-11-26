// daemons/shared/src/nostr/relay.js
//
// One Nostr relay connection. Reconnects with exponential backoff and
// resubscribes on open. The relay pool owns pacing and dedupe.
//
// Reference: ../nito.cash/apps/web/src/lib/nostr/relay.js (MIT).

export const RELAY_STATES = Object.freeze(['closed', 'connecting', 'open', 'closing'])

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class Relay {
  constructor(url, {
    WebSocketImpl,
    onEvent,
    onNotice,
    onAuth,
    onOk,
    onClose,
    onReconnect,
    autoReconnect = true,
    reconnectDelayMs = 500,
    maxReconnectDelayMs = 30000,
    random = Math.random,
  } = {}) {
    if (!url) throw new Error('relay: url is required')
    this.url = url
    this.WebSocketImpl = WebSocketImpl || (typeof WebSocket !== 'undefined' ? WebSocket : null)
    this.onEvent = onEvent || (() => {})
    this.onNotice = onNotice || (() => {})
    this.onAuth = onAuth || (() => {})
    this.onOk = onOk || (() => {})
    this.onClose = onClose || (() => {})
    this.onReconnect = onReconnect || (() => {})
    this.autoReconnect = autoReconnect
    this.reconnectDelayMs = reconnectDelayMs
    this.maxReconnectDelayMs = maxReconnectDelayMs
    this.random = random
    this.socket = null
    this.state = 'closed'
    this.subscriptions = new Map()
    this.challenge = null
    this.pending = new Map()
    this.openWaiters = []
    this.nextSubId = 1
    this.reconnectTimer = null
    this.reconnects = 0
    this.closedByUser = false
    this.lastOkAt = null
    this.lastEventAt = null
    this.lastPublishAt = 0
    this.outbox = Promise.resolve()
  }

  connect() {
    if (this.socket) return this
    if (!this.WebSocketImpl) throw new Error('relay: no WebSocket implementation')
    this.closedByUser = false
    this.state = 'connecting'
    const socket = new this.WebSocketImpl(this.url)
    this.socket = socket

    socket.onopen = () => {
      this.state = 'open'
      for (const waiter of this.openWaiters.splice(0)) waiter.resolve()
      for (const [subId, entry] of this.subscriptions) {
        this.#send(['REQ', subId, ...entry.filters])
      }
    }

    socket.onmessage = (message) => this.#handle(message.data)

    socket.onclose = () => {
      this.state = 'closed'
      this.socket = null
      this.#rejectPending(new Error('relay: closed'))
      for (const waiter of this.openWaiters.splice(0)) waiter.reject(new Error('relay: closed'))
      this.onClose()
      if (!this.closedByUser && this.autoReconnect) this.#scheduleReconnect()
    }

    socket.onerror = () => {
      this.state = 'closed'
    }

    return this
  }

  async publish(event, { timeout = 10000 } = {}) {
    await this.#waitForOpen(timeout)
    const id = event.id
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`relay: no OK for ${id}`))
      }, timeout)
      this.pending.set(id, { resolve, reject, timer })
      this.#send(['EVENT', event])
    })
  }

  subscribe(filters, onEvent = this.onEvent) {
    this.connect()
    const subId = `daemon-${this.nextSubId++}`
    this.subscriptions.set(subId, { filters, onEvent })
    if (this.state === 'open') this.#send(['REQ', subId, ...filters])
    return subId
  }

  unsubscribe(subId) {
    this.subscriptions.delete(subId)
    if (this.socket && this.state === 'open') this.#send(['CLOSE', subId])
  }

  async authenticate(sign) {
    if (!this.challenge) throw new Error('relay: no AUTH challenge')
    const event = await sign(this.challenge, this.url)
    this.#send(['AUTH', event])
    return event
  }

  close() {
    this.closedByUser = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.socket) {
      this.state = 'closing'
      this.socket.close()
    }
    this.subscriptions.clear()
  }

  health() {
    return {
      url: this.url,
      state: this.state,
      reconnects: this.reconnects,
      lastOkAt: this.lastOkAt,
      lastEventAt: this.lastEventAt,
      subscriptions: this.subscriptions.size,
    }
  }

  async #waitForOpen(timeout) {
    if (this.state === 'open') return
    this.connect()
    return new Promise((resolve, reject) => {
      const waiter = { resolve, reject }
      this.openWaiters.push(waiter)
      setTimeout(() => {
        const index = this.openWaiters.indexOf(waiter)
        if (index >= 0) {
          this.openWaiters.splice(index, 1)
          reject(new Error('relay: open timeout'))
        }
      }, timeout)
    })
  }

  #scheduleReconnect() {
    if (this.reconnectTimer) return
    const base = Math.min(
      this.maxReconnectDelayMs,
      this.reconnectDelayMs * 2 ** this.reconnects,
    )
    const jitter = Math.floor(this.random() * base * 0.2)
    this.reconnects += 1
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (this.closedByUser) return
      this.connect()
      this.onReconnect(this.reconnects)
    }, base + jitter)
  }

  #rejectPending(error) {
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer)
      pending.reject(error)
      this.pending.delete(id)
    }
  }

  #send(message) {
    if (!this.socket || this.state !== 'open') throw new Error('relay: not connected')
    this.socket.send(JSON.stringify(message))
  }

  #handle(data) {
    let message
    try {
      message = JSON.parse(data)
    } catch {
      return
    }
    if (!Array.isArray(message) || message.length === 0) return
    const [type] = message

    if (type === 'EVENT') {
      const [, subId, event] = message
      this.lastEventAt = Date.now()
      const entry = this.subscriptions.get(subId)
      if (entry) entry.onEvent(event)
      else this.onEvent(event)
      return
    }

    if (type === 'EOSE') {
      const [, subId] = message
      const entry = this.subscriptions.get(subId)
      if (entry?.onEose) entry.onEose()
      return
    }

    if (type === 'OK') {
      const [, id, ok, msg] = message
      this.lastOkAt = Date.now()
      const pending = this.pending.get(id)
      if (pending) {
        clearTimeout(pending.timer)
        this.pending.delete(id)
        if (ok) pending.resolve({ id, message: msg })
        else pending.reject(new Error(`relay: rejected ${id}: ${msg}`))
      }
      this.onOk(id, ok, msg)
      return
    }

    if (type === 'NOTICE') {
      this.onNotice(message[1])
      return
    }

    if (type === 'AUTH') {
      this.challenge = message[1]
      this.onAuth(this.challenge, this.url)
    }
  }
}

export { sleep }
