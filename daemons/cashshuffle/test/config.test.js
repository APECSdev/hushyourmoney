// daemons/cashshuffle/test/config.test.js
//
// Unit tests for the CashShuffle config loader. No network, no dependencies.

import test from 'node:test'
import assert from 'node:assert/strict'

import { POOL, loadCashShuffleConfig } from '../src/config.js'

test('defaults use the deployed role-2 pool facts', () => {
  const config = loadCashShuffleConfig({})
  assert.equal(config.network, 'chipnet')
  assert.equal(config.poolCategory, POOL.category)
  assert.equal(config.programLocking, POOL.programLocking)
  assert.equal(config.guardLocking, POOL.guardLocking)
  assert.equal(config.vendingLocking, POOL.vendingLocking)
  assert.equal(config.vendingPriceSats, 1000n)
  assert.equal(config.fuelSats, 15000n)
  assert.equal(config.blanksPerLock, 2)
  assert.equal(config.poolSize, 5)
  assert.equal(config.amountSats, 100000n)
  assert.equal(config.feeRate, 1)
  assert.equal(config.maxFloatSats, 400000n)
  assert.equal(config.maxRounds, 10)
  assert.equal(config.maxLockFeeSats, 5000n)
})

test('rejects mainnet until Gate 7', () => {
  assert.throws(
    () => loadCashShuffleConfig({ CASHSHUFFLE_NETWORK: 'mainnet' }),
    /chipnet until Gate 7/,
  )
})

test('rejects a pool below the five-participant floor', () => {
  assert.throws(
    () => loadCashShuffleConfig({ CASHSHUFFLE_POOL_SIZE: '2' }),
    /CASHSHUFFLE_POOL_SIZE/,
  )
})

test('rejects a malformed pool category', () => {
  assert.throws(
    () => loadCashShuffleConfig({ CASHSHUFFLE_POOL_CATEGORY: 'abcd' }),
    /CASHSHUFFLE_POOL_CATEGORY/,
  )
})

test('rejects a malformed P2SH32 locking', () => {
  assert.throws(
    () => loadCashShuffleConfig({ CASHSHUFFLE_POOL_LOCKING: 'aa20' }),
    /CASHSHUFFLE_POOL_LOCKING/,
  )
})

test('rejects a blank count other than two', () => {
  assert.throws(
    () => loadCashShuffleConfig({ CASHSHUFFLE_BLANKS_PER_LOCK: '1' }),
    /CASHSHUFFLE_BLANKS_PER_LOCK/,
  )
})
