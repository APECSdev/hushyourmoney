// daemons/cashshuffle/test/pool.test.js
//
// Unit tests for the role-2 helpers that are implemented in the skeleton.
// No network, no dependencies.

import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'

import {
  ROLE2_BLANKS_PER_LOCK,
  ROLE2_CARRIER_BYTES,
  ROLE2_FUEL_SATS,
  ROLE2_STATE_FLOAT_SATS,
  tagForCarrier,
} from '../src/pool.js'

test('tagForCarrier is SHA256 of the first 64 carrier bytes', () => {
  const carrier = Buffer.alloc(ROLE2_CARRIER_BYTES, 7)
  const expected = createHash('sha256').update(carrier.subarray(0, 64)).digest('hex')
  assert.equal(tagForCarrier(carrier).toString('hex'), expected)
})

test('tagForCarrier rejects a carrier shorter than 169 bytes', () => {
  assert.throws(() => tagForCarrier(Buffer.alloc(63)), /169 bytes/)
})

test('the role-2 constants match the deployed pool', () => {
  assert.equal(ROLE2_CARRIER_BYTES, 169)
  assert.equal(ROLE2_FUEL_SATS, 15000n)
  assert.equal(ROLE2_BLANKS_PER_LOCK, 2)
  assert.equal(ROLE2_STATE_FLOAT_SATS, 10000n)
})
