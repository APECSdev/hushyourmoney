// daemons/cashshuffle/test/role2-action.test.js
//
// Role-2 action transaction: carrier, new state, optional payout. Requires
// @bitauth/libauth; run on blackhost or the apecsdev build VM.

import test from 'node:test'
import assert from 'node:assert/strict'

import { decodeTransaction, hexToBin } from '@bitauth/libauth'

import { buildRole2Action } from '../src/role2-action.js'
import { encodeRole2Carrier } from '../src/pool.js'

const POOL = {
  programLocking: 'aa203e40b64cff154d4b3305e8c8cc4e3174bc595ad74342a8445a9a7798b7be3a2987',
  poolCategory: '480e30ff1d3f5f0b6fe9dd2dbe363b1776f61566f29a395628d0b50abd01b9d0',
  assetCategory: '480e30ff1d3f5f0b6fe9dd2dbe363b1776f61566f29a395628d0b50abd01b9d0',
}

const NEW_ROOT = new Uint8Array(32).fill(0x03)
const NEW_NULL = new Uint8Array(32).fill(0x04)
const CARRIER = encodeRole2Carrier({
  nf0: 5n,
  nf1: 6n,
  cm0: 7n,
  cm1: 8n,
  newRoot: 9n,
  pv: 1000000n,
  sign: 0n,
})
const UNLOCKINGS = [new Uint8Array([0x51]), new Uint8Array([0x52]), new Uint8Array([0x53])]
const fuel = (n) => ({ txid: String(n).repeat(64).slice(0, 64), vout: 0, sats: 15000n })
const state = { txid: 'aa'.repeat(32), vout: 0, sats: 10000n }

test('builds a SHIELD: carrier at out0, new state at out1, no payout', async () => {
  const action = await buildRole2Action({
    pool: POOL,
    carrier: CARRIER,
    newRoot: NEW_ROOT,
    newNull: NEW_NULL,
    newBalance: 1000000n,
    stateUtxo: state,
    fuelUtxos: [fuel(1), fuel(2)],
    unlockings: UNLOCKINGS,
  })
  const decoded = decodeTransaction(hexToBin(action.hex))
  assert.equal(decoded.inputs.length, 3)
  assert.equal(decoded.outputs.length, 2)
  assert.equal(decoded.outputs[0].lockingBytecode[0], 0x6a)
  assert.deepEqual(decoded.outputs[1].token.nft.commitment, new Uint8Array([...NEW_ROOT, ...NEW_NULL]))
  assert.equal(decoded.outputs[1].token.amount, 1000000n)
  assert.equal(decoded.outputs[1].valueSatoshis, 10000n)
  assert.equal(action.sign, 0n)
  assert.equal(action.fee, 30000n)
})

test('builds an UNSHIELD: payout at out2 with the public value', async () => {
  const carrier = encodeRole2Carrier({
    nf0: 5n,
    nf1: 6n,
    cm0: 7n,
    cm1: 8n,
    newRoot: 9n,
    pv: 250000n,
    sign: 1n,
  })
  const action = await buildRole2Action({
    pool: POOL,
    carrier,
    newRoot: NEW_ROOT,
    newNull: NEW_NULL,
    newBalance: 750000n,
    stateUtxo: state,
    fuelUtxos: [fuel(3), fuel(4)],
    unlockings: UNLOCKINGS,
    payoutAddress: 'bchtest:qzzu85xnl99u534d9z40yu7c494hknppx5lu29gl8t',
  })
  const decoded = decodeTransaction(hexToBin(action.hex))
  assert.equal(decoded.outputs.length, 3)
  assert.equal(decoded.outputs[2].token.amount, 250000n)
  assert.equal(action.sign, 1n)
})

test('rejects bad shapes', async () => {
  await assert.rejects(
    buildRole2Action({
      pool: POOL,
      carrier: new Uint8Array(10),
      newRoot: NEW_ROOT,
      newNull: NEW_NULL,
      newBalance: 0n,
      stateUtxo: state,
      fuelUtxos: [fuel(5), fuel(6)],
      unlockings: UNLOCKINGS,
    }),
    /169/,
  )
  await assert.rejects(
    buildRole2Action({
      pool: POOL,
      carrier: CARRIER,
      newRoot: NEW_ROOT,
      newNull: NEW_NULL,
      newBalance: 0n,
      stateUtxo: state,
      fuelUtxos: [fuel(7)],
      unlockings: UNLOCKINGS,
    }),
    /TWO fuel/,
  )
  await assert.rejects(
    buildRole2Action({
      pool: POOL,
      carrier: CARRIER,
      newRoot: NEW_ROOT,
      newNull: NEW_NULL,
      newBalance: 0n,
      stateUtxo: state,
      fuelUtxos: [fuel(8), fuel(9)],
      unlockings: [new Uint8Array([1])],
    }),
    /THREE/,
  )
})
