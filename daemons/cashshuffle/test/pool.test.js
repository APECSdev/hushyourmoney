// daemons/cashshuffle/test/pool.test.js
//
// Role-2 carrier, tag, fuel-pair and cost helpers. No network.

import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'

import {
  ROLE2_BLANKS_PER_LOCK,
  ROLE2_CARRIER_BYTES,
  ROLE2_FUEL_SATS,
  ROLE2_STATE_FLOAT_SATS,
  actionCostSats,
  assertFuelPair,
  buildCarrier,
  depositTag,
  parseCarrier,
  tagForCarrier,
} from '../src/pool.js'

const POOL_CATEGORY = '480e30ff1d3f5f0b6fe9dd2dbe363b1776f61566f29a395628d0b50abd01b9d0'
const LIMB = (byte) => byte.repeat(32)

function makeCarrier() {
  return buildCarrier({
    nf0: LIMB('11'),
    nf1: LIMB('22'),
    cm0: LIMB('33'),
    cm1: LIMB('44'),
    newRoot: LIMB('55'),
    pv: 123456789n,
    sign: 1,
  })
}

function fuelUtxo(outpoint, tag, category = POOL_CATEGORY, capability = 'mutable') {
  return {
    outpoint,
    sats: ROLE2_FUEL_SATS,
    token: {
      category,
      amount: 0n,
      nft: { capability, commitment: tag },
    },
  }
}

test('tagForCarrier is SHA256 of the first 64 carrier bytes', () => {
  const carrier = Buffer.alloc(ROLE2_CARRIER_BYTES, 7)
  const expected = createHash('sha256').update(carrier.subarray(0, 64)).digest('hex')
  assert.equal(tagForCarrier(carrier).toString('hex'), expected)
  assert.equal(depositTag(carrier).toString('hex'), expected)
})

test('tagForCarrier rejects a carrier shorter than 169 bytes', () => {
  assert.throws(() => tagForCarrier(Buffer.alloc(63)), /169 bytes/)
})

test('buildCarrier and parseCarrier round-trip the fields', () => {
  const carrier = makeCarrier()
  assert.equal(carrier.length, ROLE2_CARRIER_BYTES)
  const parsed = parseCarrier(carrier)
  assert.equal(parsed.nf0, LIMB('11'))
  assert.equal(parsed.nf1, LIMB('22'))
  assert.equal(parsed.cm0, LIMB('33'))
  assert.equal(parsed.cm1, LIMB('44'))
  assert.equal(parsed.newRoot, LIMB('55'))
  assert.equal(parsed.pv, 123456789n)
  assert.equal(parsed.sign, 1)
  assert.equal(parsed.bytes.length, ROLE2_CARRIER_BYTES)
})

test('buildCarrier writes pv little-endian and rejects bad values', () => {
  const carrier = buildCarrier({
    nf0: LIMB('00'),
    nf1: LIMB('00'),
    cm0: LIMB('00'),
    cm1: LIMB('00'),
    newRoot: LIMB('00'),
    pv: 1n,
    sign: 0,
  })
  assert.equal(carrier[160], 1)
  assert.equal(carrier[161], 0)
  assert.throws(() => parseCarrier(Buffer.alloc(168)), /169 bytes/)
  assert.throws(() => buildCarrier({ ...parseCarrier(carrier), sign: 2 }), /sign must be 0 or 1/)
})

test('assertFuelPair requires two same-tag mutable pool-category fuel UTXOs', () => {
  const carrier = makeCarrier()
  const tag = tagForCarrier(carrier).toString('hex')
  const pair = [fuelUtxo('aa:0', tag), fuelUtxo('aa:1', tag)]
  const result = assertFuelPair({ fuelUtxos: pair, carrier, poolCategory: POOL_CATEGORY })
  assert.equal(result.tag, tag)

  assert.throws(
    () => assertFuelPair({ fuelUtxos: [pair[0]], carrier, poolCategory: POOL_CATEGORY }),
    /exactly TWO fuel UTXOs/,
  )
  assert.throws(
    () => assertFuelPair({
      fuelUtxos: [fuelUtxo('aa:0', tag, 'ff'.repeat(32)), pair[1]],
      carrier,
      poolCategory: POOL_CATEGORY,
    }),
    /wrong category/,
  )
  assert.throws(
    () => assertFuelPair({
      fuelUtxos: [fuelUtxo('aa:0', '00'.repeat(32)), pair[1]],
      carrier,
      poolCategory: POOL_CATEGORY,
    }),
    /wrong deposit tag/,
  )
  assert.throws(
    () => assertFuelPair({
      fuelUtxos: [fuelUtxo('aa:0', tag, POOL_CATEGORY, 'none'), pair[1]],
      carrier,
      poolCategory: POOL_CATEGORY,
    }),
    /mutable NFT/,
  )
})

test('actionCostSats includes fuel, blanks and lock fees', () => {
  const cost = actionCostSats({ actions: 10n, lockFeeSats: 5000n })
  assert.equal(cost.fuelSats, 150000n)
  assert.equal(cost.blankCostSats, 20000n)
  assert.equal(cost.lockFeeSats, 50000n)
  assert.equal(cost.totalSats, 220000n)
})

test('the role-2 constants match the deployed pool', () => {
  assert.equal(ROLE2_CARRIER_BYTES, 169)
  assert.equal(ROLE2_FUEL_SATS, 15000n)
  assert.equal(ROLE2_BLANKS_PER_LOCK, 2)
  assert.equal(ROLE2_STATE_FLOAT_SATS, 10000n)
})
