// daemons/cashshuffle/test/role2-lock.test.js
//
// Role-2 lock transaction: 2 tagged fuel UTXOs + change. Requires
// @bitauth/libauth; run on blackhost or the apecsdev build VM.

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  SigningSerializationTypeBCH,
  decodeTransaction,
  generateSigningSerializationBCH,
  hash256,
  hexToBin,
  instantiateSecp256k1,
  instantiateSha256,
} from '@bitauth/libauth'

import { buildRole2Lock, ROLE2_FUEL_SATS } from '../src/role2-lock.js'

const POOL = {
  programLocking: 'aa203e40b64cff154d4b3305e8c8cc4e3174bc595ad74342a8445a9a7798b7be3a2987',
  poolCategory: '480e30ff1d3f5f0b6fe9dd2dbe363b1776f61566f29a395628d0b50abd01b9d0',
  assetCategory: '480e30ff1d3f5f0b6fe9dd2dbe363b1776f61566f29a395628d0b50abd01b9d0',
}

const TAG = new Uint8Array(32).fill(0xab)
const KEY = new Uint8Array(32).fill(0x11)
const ADDRESS = 'bchtest:qzzu85xnl99u534d9z40yu7c494hknppx5lu29gl8t'
const CATEGORY = hexToBin(POOL.assetCategory)

const funding = { txid: '11'.repeat(32), vout: 0, sats: 50000n }
const blank = (n) => ({
  txid: String(n).repeat(64).slice(0, 64),
  vout: n,
  sats: 1000n,
  token: {
    category: POOL.assetCategory,
    amount: '0',
    nft: { capability: 'mutable', commitment: '' },
  },
})
const supply = {
  txid: '22'.repeat(32),
  vout: 0,
  sats: 1000n,
  token: { category: POOL.assetCategory, amount: '5000000' },
}

test('builds 2 tagged fuel UTXOs + change; a transfer has no FT deposit', async () => {
  const lock = await buildRole2Lock({
    pool: POOL,
    tag: TAG,
    fundingUtxo: funding,
    blanks: [blank(1), blank(2)],
    changeAddress: ADDRESS,
    privateKey: KEY,
  })
  const decoded = decodeTransaction(hexToBin(lock.hex))
  assert.equal(typeof decoded, 'object')
  assert.equal(decoded.outputs.length, 3)
  assert.equal(decoded.outputs[0].valueSatoshis, ROLE2_FUEL_SATS)
  assert.equal(decoded.outputs[1].valueSatoshis, ROLE2_FUEL_SATS)
  assert.deepEqual(decoded.outputs[0].token.category, CATEGORY)
  assert.equal(decoded.outputs[0].token.amount, 0n)
  assert.deepEqual(decoded.outputs[0].token.nft.commitment, TAG)
  assert.deepEqual(decoded.outputs[1].token.nft.commitment, TAG)
  assert.equal(lock.fuelOutpoints[0].tag, 'ab'.repeat(32))
})

test('puts the shield FT deposit on out0 and returns the FT change', async () => {
  const lock = await buildRole2Lock({
    pool: POOL,
    tag: TAG,
    shield: 1000000n,
    fundingUtxo: funding,
    blanks: [blank(3), blank(4)],
    supplyUtxo: supply,
    changeAddress: ADDRESS,
    privateKey: KEY,
  })
  const decoded = decodeTransaction(hexToBin(lock.hex))
  assert.equal(decoded.outputs[0].token.amount, 1000000n)
  assert.equal(decoded.outputs[1].token.amount, 0n)
  assert.equal(decoded.outputs[3].token.amount, 4000000n)
  assert.equal(lock.deposit, 1000000n)
})

test('signs every input with a valid Schnorr signature (allOutputs)', async () => {
  const lock = await buildRole2Lock({
    pool: POOL,
    tag: TAG,
    fundingUtxo: funding,
    blanks: [blank(5), blank(6)],
    changeAddress: ADDRESS,
    privateKey: KEY,
  })
  const sha256 = await instantiateSha256()
  const secp = await instantiateSecp256k1()
  const decoded = decodeTransaction(hexToBin(lock.hex))
  const pub = secp.derivePublicKeyCompressed(KEY)
  const sources = [
    { lockingBytecode: decoded.outputs[2].lockingBytecode, valueSatoshis: 50000n },
    ...decoded.inputs.slice(1).map(() => ({
      lockingBytecode: decoded.outputs[2].lockingBytecode,
      valueSatoshis: 1000n,
      token: { category: CATEGORY, amount: 0n, nft: { capability: 'mutable', commitment: new Uint8Array(0) } },
    })),
  ]
  for (let index = 0; index < decoded.inputs.length; index += 1) {
    const serialization = generateSigningSerializationBCH(
      { inputIndex: index, sourceOutputs: sources, transaction: decoded },
      {
        coveredBytecode: decoded.outputs[2].lockingBytecode,
        signingSerializationType: Uint8Array.of(SigningSerializationTypeBCH.allOutputs),
      },
      sha256,
    )
    const digest = hash256(serialization, sha256)
    const signature = decoded.inputs[index].unlockingBytecode.slice(1, 66)
    assert.equal(secp.verifySignatureSchnorr(signature.slice(0, 64), pub, digest), true)
  }
})

test('rejects bad input shapes', async () => {
  await assert.rejects(
    buildRole2Lock({ pool: POOL, tag: TAG, fundingUtxo: funding, blanks: [blank(7)], changeAddress: ADDRESS, privateKey: KEY }),
    /TWO blanks/,
  )
  await assert.rejects(
    buildRole2Lock({ pool: POOL, tag: new Uint8Array(31), fundingUtxo: funding, blanks: [blank(8), blank(9)], changeAddress: ADDRESS, privateKey: KEY }),
    /32-byte/,
  )
  await assert.rejects(
    buildRole2Lock({ pool: POOL, tag: TAG, shield: 1000000n, fundingUtxo: funding, blanks: [blank(10), blank(11)], changeAddress: ADDRESS, privateKey: KEY }),
    /supply FT/,
  )
  await assert.rejects(
    buildRole2Lock({ pool: POOL, tag: TAG, fundingUtxo: { txid: '33'.repeat(32), vout: 0, sats: 100n }, blanks: [blank(12), blank(13)], changeAddress: ADDRESS, privateKey: KEY }),
    /short/,
  )
})
