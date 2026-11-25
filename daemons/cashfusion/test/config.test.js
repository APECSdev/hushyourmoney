// daemons/cashfusion/test/config.test.js
//
// Unit tests for the CashFusion config loader. No network, no dependencies.

import test from 'node:test'
import assert from 'node:assert/strict'

import { CONSTANTS, loadCashFusionConfig } from '../src/config.js'

test('defaults use the measured CashFusion constants', () => {
  const config = loadCashFusionConfig({})
  assert.equal(config.network, 'chipnet')
  assert.equal(config.poolSize, CONSTANTS.poolSize)
  assert.equal(config.minParticipants, CONSTANTS.minParticipants)
  assert.equal(config.feeSats, CONSTANTS.feeSats)
  assert.equal(config.maxFeeRate, CONSTANTS.maxFeeRate)
  assert.equal(config.coordinatorPolicy, 'avoid')
  assert.equal(config.maxFloatSats, 300000n)
  assert.equal(config.maxRounds, 10)
})

test('rejects mainnet until G4', () => {
  assert.throws(
    () => loadCashFusionConfig({ CASHFUSION_NETWORK: 'mainnet' }),
    /chipnet until G4/,
  )
})

test('rejects a pool below the five-participant floor', () => {
  assert.throws(
    () => loadCashFusionConfig({ CASHFUSION_POOL_SIZE: '2' }),
    /CASHFUSION_POOL_SIZE/,
  )
})

test('rejects a pool smaller than the minimum participant count', () => {
  assert.throws(
    () => loadCashFusionConfig({
      CASHFUSION_POOL_SIZE: '5',
      CASHFUSION_MIN_PARTICIPANTS: '6',
    }),
    /at least CASHFUSION_MIN_PARTICIPANTS/,
  )
})

test('rejects an unknown coordinator policy', () => {
  assert.throws(
    () => loadCashFusionConfig({ CASHFUSION_COORDINATOR_POLICY: 'always' }),
    /CASHFUSION_COORDINATOR_POLICY/,
  )
})
