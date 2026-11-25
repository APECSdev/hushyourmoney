// daemons/cashshuffle/test/round.test.js
//
// Unit tests for the round phase table. No network, no dependencies.

import test from 'node:test'
import assert from 'node:assert/strict'

import { PHASES, TERMINAL_PHASES, nextPhase } from '../src/round.js'

test('VERIFY sits between SHUFFLE and SIGNING', () => {
  const shuffle = PHASES.indexOf('SHUFFLE')
  const verify = PHASES.indexOf('VERIFY')
  const signing = PHASES.indexOf('SIGNING')
  assert.ok(shuffle >= 0)
  assert.equal(verify, shuffle + 1)
  assert.equal(signing, verify + 1)
})

test('nextPhase walks the table', () => {
  assert.equal(nextPhase('SHUFFLE'), 'VERIFY')
  assert.equal(nextPhase('VERIFY'), 'SIGNING')
  assert.equal(nextPhase('BROADCAST'), null)
  assert.throws(() => nextPhase('NOPE'), /unknown phase/)
})

test('BROADCAST and BLAME are terminal', () => {
  assert.deepEqual([...TERMINAL_PHASES], ['BROADCAST', 'BLAME'])
})
