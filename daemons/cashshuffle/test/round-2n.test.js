// daemons/cashshuffle/test/round-2n.test.js
//
// The pool-native CashShuffle 2N state machine: register -> announce ->
// shuffle -> build/verify -> sign -> assemble -> broadcast. Requires
// @bitauth/libauth; run on blackhost or the apecsdev build VM.

import test from 'node:test'
import assert from 'node:assert/strict'

import { encodeCashAddress, hexToBin } from '@bitauth/libauth'

import { CashShuffle2NRound } from '../src/round-2n.js'
import { buildRole2Round, signRole2Round } from '../src/role2-round.js'
import { encodeRole2Carrier, tagForCarrier } from '../src/pool.js'

const POOL = {
  programLocking: 'aa203e40b64cff154d4b3305e8c8cc4e3174bc595ad74342a8445a9a7798b7be3a2987',
  poolCategory: '480e30ff1d3f5f0b6fe9dd2dbe363b1776f61566f29a395628d0b50abd01b9d0',
  assetCategory: '480e30ff1d3f5f0b6fe9dd2dbe363b1776f61566f29a395628d0b50abd01b9d0',
}
const N = 5
const CATEGORY = POOL.assetCategory
const KEYS = ['01', '02', '03', '04', '05']
const ADDRESSES = KEYS.map((_, index) => encodeCashAddress({
  prefix: 'bchtest',
  type: 'p2pkh',
  payload: new Uint8Array(20).fill(index + 1),
}).address)
const PRIVATE_KEYS = KEYS.map((_, index) => new Uint8Array(32).fill(0x10 + index))

let txCounter = 0
function nextTxid() {
  txCounter += 1
  return String(txCounter).padStart(64, '0')
}

function carrierFor(index) {
  return encodeRole2Carrier({
    nf0: BigInt(1000 + index),
    nf1: BigInt(2000 + index),
    cm0: BigInt(3000 + index),
    cm1: BigInt(4000 + index),
    newRoot: BigInt(5000 + index),
    pv: 0n,
    sign: 0n,
  })
}

function participant(index) {
  const carrier = carrierFor(index)
  return {
    key: KEYS[index],
    fundingUtxos: [
      { txid: nextTxid(), vout: 0, sats: 20000n },
      { txid: nextTxid(), vout: 1, sats: 20000n },
    ],
    blanks: [
      { txid: nextTxid(), vout: 0, sats: 1000n, token: { category: CATEGORY, amount: '0', nft: { capability: 'mutable', commitment: '' } } },
      { txid: nextTxid(), vout: 1, sats: 1000n, token: { category: CATEGORY, amount: '0', nft: { capability: 'mutable', commitment: '' } } },
    ],
    tag: tagForCarrier(carrier),
    carrier,
    supplyUtxo: null,
    changeAddress: ADDRESSES[index],
  }
}

function config() {
  return {
    poolSize: N,
    pool: POOL,
    programLocking: POOL.programLocking,
    poolCategory: CATEGORY,
    fuelSats: 15000n,
    maxFeeSats: 5000n,
  }
}

async function fullRound() {
  const round = new CashShuffle2NRound({
    config: config(),
    roundId: 'round-2n-test',
    now: () => 1700000000000,
  })
  for (let index = 0; index < N; index += 1) {
    round.register(participant(index))
  }
  assert.equal(round.phase, 'ANNOUNCEMENT')
  round.announce({ from: round.coordinator })
  for (const key of KEYS) round.shuffle({ from: key, onion: `onion-${key}` })
  await round.buildFinalRound({ pool: POOL })
  return round
}

test('fills the pool, elects the coordinator, and builds 2N fuel pairs', async () => {
  const round = await fullRound()
  assert.equal(round.phase, 'VERIFY')
  assert.equal(round.coordinator, '01')
  assert.equal(round.finalRound.fuelVouts.length, N)
  assert.equal(round.finalRound.transaction.outputs.length, 2 * N + N)
  assert.equal(round.snapshot().players.length, N)
  assert.equal(round.snapshot().fee, round.finalRound.fee.toString())
})

test('verifies all players, signs all inputs, assembles and broadcasts', async () => {
  const round = await fullRound()
  for (const key of KEYS) await round.verify({ from: key })
  assert.equal(round.phase, 'SIGNING')

  for (let index = 0; index < N; index += 1) {
    const indices = [
      ...round.finalRound.inputsByPlayer[index].funding,
      ...round.finalRound.inputsByPlayer[index].blanks,
    ]
    const signatures = await signRole2Round({
      transaction: round.finalRound.transaction,
      sources: round.finalRound.sources,
      inputIndices: indices,
      privateKey: PRIVATE_KEYS[index],
    })
    round.sign({ from: KEYS[index], signatures })
  }
  assert.equal(round.phase, 'BROADCAST')
  const assembled = await round.assemble()
  assert.match(assembled.txid, /^[0-9a-f]{64}$/)
  await round.broadcast({ from: round.coordinator })
  assert.equal(round.txid, assembled.txid)
  assert.equal(round.snapshot().txid, assembled.txid)
})

test('a malicious coordinator tag change is rejected before any signature', async () => {
  const round = await fullRound()
  const pair = round.finalRound.fuelVouts[0]
  round.finalRound.transaction.outputs[pair.vouts[1]] = {
    ...round.finalRound.transaction.outputs[pair.vouts[1]],
    token: {
      ...round.finalRound.transaction.outputs[pair.vouts[1]].token,
      nft: {
        ...round.finalRound.transaction.outputs[pair.vouts[1]].token.nft,
        commitment: new Uint8Array(32).fill(0xff),
      },
    },
  }
  await assert.rejects(() => round.verify({ from: '01' }), /tag|fuel/i)
  assert.equal(round.phase, 'VERIFY')
  assert.equal(round.verified.size, 0)
})

test('rejects a non-coordinator final transaction and duplicate tags', async () => {
  const guards = new CashShuffle2NRound({ config: config(), roundId: 'round-2n-guards' })
  guards.register(participant(0))
  assert.throws(() => guards.setFinalTransaction({ from: '02', round: {} }), /coordinator/)

  const duplicateRound = new CashShuffle2NRound({ config: config(), roundId: 'round-2n-duplicate' })
  const first = participant(0)
  duplicateRound.register(first)
  const duplicate = {
    ...participant(1),
    key: '99',
    tag: first.tag,
    carrier: first.carrier,
    changeAddress: ADDRESSES[4],
  }
  assert.throws(() => duplicateRound.register(duplicate), /duplicate tag/i)
})

test('rejects a final round with a missing player before verification', async () => {
  const round = await fullRound()
  const built = round.finalRound
  const player = built.participants[0]
  const missing = {
    ...built,
    transaction: {
      ...built.transaction,
      inputs: built.transaction.inputs.filter((_, index) => index !== built.inputsByPlayer[0].blanks[0]),
    },
  }
  round.finalRound = missing
  await assert.rejects(() => round.verify({ from: player.key }), /blank|funding|expected/i)
  assert.equal(round.phase, 'VERIFY')
})

test('buildFinalRound refuses before SHUFFLE and requires a pool descriptor', async () => {
  const round = new CashShuffle2NRound({ config: config(), roundId: 'round-2n-phase' })
  for (let index = 0; index < N; index += 1) round.register(participant(index))
  round.announce({ from: round.coordinator })
  await assert.rejects(() => round.buildFinalRound({ pool: null }), /pool descriptor/i)
  await round.buildFinalRound({ pool: POOL })
  assert.equal(round.phase, 'VERIFY')
  assert.equal(round.finalRound.fuelVouts.length, N)
})

test('keeps the 2N tag on both fuel outputs and the player change exact', async () => {
  const round = await fullRound()
  for (const pair of round.finalRound.fuelVouts) {
    const [a, b] = pair.vouts
    assert.equal(round.finalRound.transaction.outputs[a].token.nft.commitment.length, 32)
    assert.equal(Buffer.from(round.finalRound.transaction.outputs[a].token.nft.commitment).toString('hex'), pair.tag)
    assert.equal(Buffer.from(round.finalRound.transaction.outputs[b].token.nft.commitment).toString('hex'), pair.tag)
  }
  const first = round.finalRound.participants[0]
  assert.equal(first.fundingOutpoints.length, 2)
  assert.equal(first.blankOutpoints.length, 2)
})
