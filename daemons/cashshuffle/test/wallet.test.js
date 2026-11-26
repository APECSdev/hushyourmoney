// daemons/cashshuffle/test/wallet.test.js
//
// Wallet selection, caps and injected signing/broadcast. No network.

import test from 'node:test'
import assert from 'node:assert/strict'

import { Wallet } from '../src/wallet.js'

const CONFIG = {
  feeRate: 1,
  maxFloatSats: 400000n,
  maxRounds: 10,
  poolCategory: '480e30ff1d3f5f0b6fe9dd2dbe363b1776f61566f29a395628d0b50abd01b9d0',
}

const UTXOS = [
  { outpoint: 'aa:0', sats: 100000n },
  { outpoint: 'aa:1', sats: 50000n },
  { outpoint: 'aa:2', sats: 30000n },
  { outpoint: 'aa:3', sats: 20000n },
  { outpoint: 'aa:4', sats: 10000n },
  { outpoint: 'aa:5', sats: 5000n },
  { outpoint: 'aa:6', sats: 500000n, token: { category: CONFIG.poolCategory, amount: 1000n } },
]

function makeWallet(options = {}) {
  return new Wallet({ config: CONFIG, ...options }).setUtxos(UTXOS)
}

test('balance counts tokenless sats only', () => {
  const wallet = makeWallet()
  assert.equal(wallet.balanceSats(), 215000n)
  assert.equal(wallet.snapshot().balanceSats, '215000')
  assert.equal(wallet.snapshot().tokenUtxoCount, 1)
})

test('selectEqualInput requires an exact tokenless amount', () => {
  const wallet = makeWallet()
  const selected = wallet.selectEqualInput({ amountSats: 100000n })
  assert.equal(selected.utxo.outpoint, 'aa:0')
  assert.equal(selected.amountSats, 100000n)
  assert.throws(() => wallet.selectEqualInput({ amountSats: 123n }), /no tokenless UTXO/)
  assert.throws(
    () => wallet.selectEqualInput({ amountSats: 500000n }),
    /no tokenless UTXO/,
  )
})

test('selectFunding picks largest-first and returns change', () => {
  const wallet = makeWallet()
  const selected = wallet.selectFunding({ sats: 60000n, exclude: ['aa:0'] })
  assert.deepEqual(selected.inputs.map((utxo) => utxo.outpoint), ['aa:1', 'aa:2'])
  assert.equal(selected.totalSats, 80000n)
  assert.equal(selected.changeSats, 20000n)
  assert.throws(() => wallet.selectFunding({ sats: 500000n }), /insufficient tokenless sats/)
})

test('the float cap is enforced', () => {
  const wallet = makeWallet()
  assert.equal(wallet.assertCap(400000n), 400000n)
  assert.throws(() => wallet.assertCap(400001n), /exceeds the float cap/)
})

test('signing and broadcast are injected', async () => {
  const wallet = makeWallet()
  await assert.rejects(
    () => wallet.signP2pkhTransaction({}),
    /no BCH signer configured/,
  )
  await assert.rejects(() => wallet.broadcast('00'), /no broadcaster configured/)

  const signed = makeWallet({ signer: async (args) => ({ ...args, signed: true }) })
  const result = await signed.signP2pkhTransaction({ transaction: 'tx' })
  assert.equal(result.signed, true)

  const broadcast = makeWallet({ broadcaster: async (hex) => `txid:${hex}` })
  assert.equal(await broadcast.broadcast('00'), 'txid:00')

  const electrum = makeWallet({ electrum: { broadcast: async (hex) => `electrum:${hex}` } })
  assert.equal(await electrum.broadcast('00'), 'electrum:00')
})
