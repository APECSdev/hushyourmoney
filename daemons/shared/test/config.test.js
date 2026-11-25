// daemons/shared/test/config.test.js
//
// Unit tests for the shared config loader. No network, no dependencies.

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  ConfigError,
  loadCommonConfig,
  parseBigInt,
  parseInteger,
  parseList,
  redactConfig,
} from '../src/config.js'

test('loadCommonConfig returns the documented defaults', () => {
  const config = loadCommonConfig({})
  assert.equal(config.logLevel, 'info')
  assert.equal(config.metricsAddr, '127.0.0.1:0')
  assert.equal(config.relayPacingMs, 80)
  assert.equal(config.authPolicy, 'optional')
  assert.deepEqual(config.relays, [
    'wss://relay.primal.net',
    'wss://nostr.mom',
    'wss://offchain.pub',
  ])
})

test('parseList trims, drops empties, and dedupes', () => {
  assert.deepEqual(parseList(' a, b ,, a ', 'X'), ['a', 'b'])
  assert.throws(() => parseList(' , ', 'X'), ConfigError)
})

test('loadCommonConfig rejects a non-WebSocket relay', () => {
  assert.throws(
    () => loadCommonConfig({ NOSTR_RELAYS: 'https://relay.example' }),
    /not a WebSocket URL/,
  )
})

test('parseInteger and parseBigInt enforce bounds', () => {
  assert.equal(parseInteger('5', 'X', { min: 5, max: 5 }), 5)
  assert.throws(() => parseInteger('4', 'X', { min: 5 }), ConfigError)
  assert.equal(parseBigInt('15000', 'X', { min: 1n }), 15000n)
  assert.throws(() => parseBigInt('-1', 'X'), ConfigError)
})

test('redactConfig hides secret-shaped keys and keeps pool facts', () => {
  const redacted = redactConfig({
    seedFile: '/var/lib/cashshuffle-daemon/.seed',
    privateKey: 'abc',
    poolCategory: '480e30ff',
    relays: ['wss://relay.example'],
  })
  assert.equal(redacted.seedFile, '[redacted]')
  assert.equal(redacted.privateKey, '[redacted]')
  assert.equal(redacted.poolCategory, '480e30ff')
  assert.deepEqual(redacted.relays, ['wss://relay.example'])
})
