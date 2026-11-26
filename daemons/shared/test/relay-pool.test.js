// daemons/shared/test/relay-pool.test.js
//
// Mock-relay tests for the relay pool: publish, quorum, dedupe, pacing,
// reconnect/resubscribe and NIP-42 AUTH. No network.

import test from 'node:test'
import assert from 'node:assert/strict'

import { RelayPool } from '../src/nostr/relay-pool.js'

class MockWebSocket {
  static instances = []

  constructor(url) {
    this.url = url
    this.sent = []
    this.times = []
    this.accept = true
    this.onopen = null
    this.onmessage = null
    this.onclose = null
    this.onerror = null
    MockWebSocket.instances.push(this)
  }

  send(data) {
    const message = JSON.parse(data)
    this.sent.push(message)
    if (message[0] === 'EVENT') {
      this.times.push(Date.now())
      const id = message[1].id
      queueMicrotask(() => {
        this.onmessage?.({
          data: JSON.stringify(['OK', id, this.accept, this.accept ? '' : 'rejected']),
        })
      })
    }
  }

  open() {
    this.onopen?.()
  }

  close() {
    this.onclose?.()
  }

  receive(message) {
    this.onmessage?.({ data: JSON.stringify(message) })
  }
}

function reset() {
  MockWebSocket.instances = []
}

function openAll() {
  for (const socket of MockWebSocket.instances) socket.open()
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

test('publish fans out to every relay and resolves at quorum', async () => {
  reset()
  const pool = new RelayPool({
    relays: ['wss://a', 'wss://b'],
    pacingMs: 0,
    quorum: 2,
    WebSocketImpl: MockWebSocket,
  })
  const event = { id: 'e1' }
  const pending = pool.publish(event)
  openAll()
  const result = await pending
  assert.equal(result.ok, 2)
  assert.equal(MockWebSocket.instances.length, 2)
  for (const socket of MockWebSocket.instances) {
    const sent = socket.sent.find((message) => message[0] === 'EVENT')
    assert.deepEqual(sent[1], event)
  }
  pool.stop()
})

test('publish rejects when the quorum is not met', async () => {
  reset()
  const pool = new RelayPool({
    relays: ['wss://a', 'wss://b'],
    pacingMs: 0,
    quorum: 1,
    WebSocketImpl: MockWebSocket,
  })
  const pending = pool.publish({ id: 'first' })
  openAll()
  await pending

  MockWebSocket.instances[0].accept = false
  const strict = pool.publish({ id: 'second' }, { quorum: 2 })
  await assert.rejects(strict, /only 1\/2 relays accepted/)
  pool.stop()
})

test('inbound events are deduped across relays', async () => {
  reset()
  const pool = new RelayPool({
    relays: ['wss://a', 'wss://b'],
    pacingMs: 0,
    WebSocketImpl: MockWebSocket,
  })
  const seen = []
  pool.subscribe([{ kinds: [1059] }], (event) => seen.push(event))
  openAll()

  const event = { id: 'same-event', kind: 1059 }
  MockWebSocket.instances[0].receive(['EVENT', 'daemon-1', event])
  MockWebSocket.instances[1].receive(['EVENT', 'daemon-1', event])
  assert.equal(seen.length, 1)
  pool.stop()
})

test('publishing is paced per connection', async () => {
  reset()
  const pool = new RelayPool({
    relays: ['wss://a'],
    pacingMs: 40,
    WebSocketImpl: MockWebSocket,
  })
  const first = pool.publish({ id: 'p1' })
  const second = pool.publish({ id: 'p2' })
  openAll()
  await Promise.all([first, second])

  const socket = MockWebSocket.instances[0]
  const eventTimes = socket.times
  assert.equal(eventTimes.length, 2)
  assert.ok(eventTimes[1] - eventTimes[0] >= 25, `pacing was ${eventTimes[1] - eventTimes[0]}ms`)
  pool.stop()
})

test('a closed relay reconnects and resubscribes', async () => {
  reset()
  const pool = new RelayPool({
    relays: ['wss://a'],
    WebSocketImpl: MockWebSocket,
    relayOptions: {
      autoReconnect: true,
      reconnectDelayMs: 1,
      maxReconnectDelayMs: 1,
    },
  })
  pool.subscribe([{ kinds: [1059] }], () => {})
  openAll()

  const first = MockWebSocket.instances[0]
  assert.ok(first.sent.some((message) => message[0] === 'REQ'))
  first.close()
  await sleep(30)

  assert.equal(MockWebSocket.instances.length, 2)
  const second = MockWebSocket.instances[1]
  second.open()
  assert.ok(second.sent.some((message) => message[0] === 'REQ'))
  pool.stop()
})

test('NIP-42 AUTH fans out to relays with a challenge', async () => {
  reset()
  const pool = new RelayPool({
    relays: ['wss://a'],
    WebSocketImpl: MockWebSocket,
  })
  pool.start()
  openAll()
  const socket = MockWebSocket.instances[0]
  socket.receive(['AUTH', 'challenge'])

  const authEvent = { id: 'auth-event', kind: 22242 }
  const results = await pool.authenticate(async (challenge, url) => {
    assert.equal(challenge, 'challenge')
    assert.equal(url, 'wss://a')
    return authEvent
  })

  assert.equal(results[0].status, 'fulfilled')
  const sent = socket.sent.find((message) => message[0] === 'AUTH')
  assert.deepEqual(sent[1], authEvent)
  pool.stop()
})

test('health reports every relay', () => {
  reset()
  const pool = new RelayPool({
    relays: ['wss://a', 'wss://b'],
    WebSocketImpl: MockWebSocket,
  })
  pool.start()
  openAll()
  const health = pool.health()
  assert.equal(health.length, 2)
  assert.equal(health[0].url, 'wss://a')
  assert.equal(health[0].state, 'open')
  pool.stop()
})
