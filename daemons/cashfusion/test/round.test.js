// daemons/cashfusion/test/round.test.js
//
// Unit tests for the CashFusion phase table and coordinator policy.
// No network, no dependencies.

import test from 'node:test'
import assert from 'node:assert/strict'

import { PHASES, TERMINAL_PHASES, coordinatorAllowed } from '../src/round.js'

test('the six measured phases are present in order', () => {
  assert.deepEqual([...PHASES], [
    'ANNOUNCE',
    'ELECTION',
    'REGISTRATION',
    'MIXNET',
    'ASSEMBLY',
    'SIGNING',
  ])
})

test('broadcast and abort are terminal', () => {
  assert.deepEqual([...TERMINAL_PHASES], ['BROADCAST', 'ABORT'])
})

test('avoid refuses the coordinator role when elected', () => {
  assert.equal(coordinatorAllowed('avoid', false), true)
  assert.equal(coordinatorAllowed('avoid', true), false)
})

test('allow accepts the coordinator role when elected', () => {
  assert.equal(coordinatorAllowed('allow', false), true)
  assert.equal(coordinatorAllowed('allow', true), true)
})

test('rotate accepts the role and leaves the schedule to the caller', () => {
  assert.equal(coordinatorAllowed('rotate', false), true)
  assert.equal(coordinatorAllowed('rotate', true), true)
})

test('an unknown policy throws', () => {
  assert.throws(() => coordinatorAllowed('always', true), /unknown coordinator policy/)
})
