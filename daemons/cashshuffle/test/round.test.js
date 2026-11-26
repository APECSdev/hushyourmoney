// daemons/cashshuffle/test/round.test.js
//
// Unit tests for the round phase table, verify-before-sign, and the state
// machine. No network.

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  CashShuffleRound,
  PHASES,
  TERMINAL_PHASES,
  nextPhase,
  verifyFinalTransaction,
} from '../src/round.js'

const POOL_SIZE = 5
const AMOUNT = 100000n
const FEE = 5000n
const OUTPUT = 99000n

const PLAYERS = [
  { key: '05', address: 'bitcoincash:q5', input: 'aa:5' },
  { key: '04', address: 'bitcoincash:q4', input: 'aa:4' },
  { key: '03', address: 'bitcoincash:q3', input: 'aa:3' },
  { key: '02', address: 'bitcoincash:q2', input: 'aa:2' },
  { key: '01', address: 'bitcoincash:q1', input: 'aa:1' },
]

function transactionFor(players = PLAYERS, outputSats = OUTPUT, feeSats = FEE) {
  return {
    version: 1,
    locktime: 0,
    feeSats,
    inputs: players.map((player) => ({
      outpoint: player.input,
      sats: AMOUNT,
      sequence: 0xfffffffe,
    })),
    outputs: players.map((player) => ({ address: player.address, sats: outputSats })),
  }
}

function playerOf(index = 0) {
  return { ...PLAYERS[index], amountSats: AMOUNT }
}

function fullRound() {
  const round = new CashShuffleRound({
    config: { poolSize: POOL_SIZE, maxFeeSats: FEE },
    roundId: 'round-test',
    now: () => 1700000000000,
  })
  for (const player of PLAYERS) {
    round.register({
      key: player.key,
      amount: AMOUNT,
      address: player.address,
      input: player.input,
    })
  }
  return round
}

test('VERIFY sits between SHUFFLE and SIGNING', () => {
  const shuffle = PHASES.indexOf('SHUFFLE')
  const verify = PHASES.indexOf('VERIFY')
  const signing = PHASES.indexOf('SIGNING')
  assert.ok(shuffle >= 0)
  assert.equal(verify, shuffle + 1)
  assert.equal(signing, verify + 1)
})

test('nextPhase walks the table and stops at the terminals', () => {
  assert.equal(nextPhase('SHUFFLE'), 'VERIFY')
  assert.equal(nextPhase('VERIFY'), 'SIGNING')
  assert.equal(nextPhase('BROADCAST'), null)
  assert.equal(nextPhase('BLAME'), null)
  assert.throws(() => nextPhase('NOPE'), /unknown phase/)
})

test('BROADCAST and BLAME are terminal', () => {
  assert.deepEqual([...TERMINAL_PHASES], ['BROADCAST', 'BLAME'])
})

test('verifyFinalTransaction accepts a valid equal-output transaction', () => {
  const result = verifyFinalTransaction({
    transaction: transactionFor(),
    player: playerOf(0),
    config: { poolSize: POOL_SIZE, maxFeeSats: FEE },
  })
  assert.equal(result.feeSats, FEE)
  assert.equal(result.outputSats, OUTPUT)
})

test('verifyFinalTransaction rejects a missing player output', () => {
  const transaction = transactionFor()
  transaction.outputs[0] = { address: 'bitcoincash:qother', sats: OUTPUT }
  assert.throws(
    () => verifyFinalTransaction({
      transaction,
      player: playerOf(0),
      config: { poolSize: POOL_SIZE, maxFeeSats: FEE },
    }),
    /player output is missing/,
  )
})

test('verifyFinalTransaction rejects a wrong player output amount', () => {
  const transaction = transactionFor(PLAYERS, 98000n, 10000n)
  assert.throws(
    () => verifyFinalTransaction({
      transaction,
      player: { ...playerOf(0), expectedOutputSats: OUTPUT },
      config: { poolSize: POOL_SIZE, maxFeeSats: 20000n },
    }),
    /player output amount is wrong/,
  )
})

test('verifyFinalTransaction rejects a wrong input count', () => {
  const transaction = transactionFor()
  transaction.inputs.pop()
  assert.throws(
    () => verifyFinalTransaction({
      transaction,
      player: playerOf(0),
      config: { poolSize: POOL_SIZE, maxFeeSats: FEE },
    }),
    /expected 5 inputs/,
  )
})

test('verifyFinalTransaction rejects unequal inputs', () => {
  const transaction = transactionFor()
  transaction.inputs[1].sats = 99999n
  assert.throws(
    () => verifyFinalTransaction({
      transaction,
      player: playerOf(0),
      config: { poolSize: POOL_SIZE, maxFeeSats: FEE },
    }),
    /inputs are not equal-amount/,
  )
})

test('verifyFinalTransaction rejects a fee above the cap', () => {
  assert.throws(
    () => verifyFinalTransaction({
      transaction: transactionFor(),
      player: playerOf(0),
      config: { poolSize: POOL_SIZE, maxFeeSats: 1000n },
    }),
    /fee exceeds the cap/,
  )
})

test('verifyFinalTransaction rejects duplicate output addresses', () => {
  const transaction = transactionFor()
  transaction.outputs[1].address = transaction.outputs[0].address
  assert.throws(
    () => verifyFinalTransaction({
      transaction,
      player: playerOf(0),
      config: { poolSize: POOL_SIZE, maxFeeSats: FEE },
    }),
    /duplicate output address/,
  )
})

test('verifyFinalTransaction rejects a duplicate input outpoint', () => {
  const transaction = transactionFor()
  transaction.inputs[1].outpoint = transaction.inputs[0].outpoint
  assert.throws(
    () => verifyFinalTransaction({
      transaction,
      player: playerOf(0),
      config: { poolSize: POOL_SIZE, maxFeeSats: FEE },
    }),
    /duplicate input outpoint/,
  )
})

test('the happy path moves REGISTER -> BROADCAST', () => {
  const round = fullRound()
  assert.equal(round.phase, 'ANNOUNCEMENT')
  assert.equal(round.coordinator, '01')

  round.announce({ from: '01' })
  assert.equal(round.phase, 'SHUFFLE')

  round.setFinalTransaction({ from: '01', transaction: transactionFor() })
  assert.equal(round.phase, 'VERIFY')

  for (const player of PLAYERS) round.verify({ from: player.key })
  assert.equal(round.phase, 'SIGNING')

  for (const player of PLAYERS) round.sign({ from: player.key, signature: `sig-${player.key}` })
  assert.equal(round.phase, 'BROADCAST')

  round.broadcast({ from: '01', txid: 'txid-1' })
  const snapshot = round.snapshot()
  assert.equal(snapshot.txid, 'txid-1')
  assert.equal(snapshot.players.every((player) => player.verified && player.signed), true)
})

test('a malicious coordinator cannot make a peer sign a transaction without its output', () => {
  const round = fullRound()
  round.announce({ from: '01' })

  const transaction = transactionFor()
  transaction.outputs[0] = { address: 'bitcoincash:qother', sats: OUTPUT }
  round.setFinalTransaction({ from: '01', transaction })

  assert.throws(() => round.verify({ from: '05' }), /player output is missing/)
  const snapshot = round.snapshot()
  assert.equal(snapshot.phase, 'VERIFY')
  assert.equal(snapshot.players.find((player) => player.key === '05').verified, false)
  assert.equal(snapshot.players.find((player) => player.key === '05').signed, false)
  assert.throws(() => round.sign({ from: '05', signature: 'sig' }), /expected SIGNING, got VERIFY/)
})

test('only the coordinator can announce and broadcast', () => {
  const round = fullRound()
  assert.throws(() => round.announce({ from: '02' }), /only the coordinator/)

  round.announce({ from: '01' })
  round.setFinalTransaction({ from: '01', transaction: transactionFor() })
  for (const player of PLAYERS) round.verify({ from: player.key })
  for (const player of PLAYERS) round.sign({ from: player.key, signature: `sig-${player.key}` })
  assert.throws(() => round.broadcast({ from: '02', txid: 'txid' }), /only the coordinator/)
})

test('N-1 matching blames abort the round before broadcast', () => {
  const round = fullRound()
  for (const player of ['01', '02', '03', '04']) {
    round.blame({ from: player, accused: '05', reason: 'missing packet' })
  }
  const snapshot = round.snapshot()
  assert.equal(snapshot.aborted, true)
  assert.equal(snapshot.phase, 'BLAME')
  assert.deepEqual(snapshot.blames['05'], ['01', '02', '03', '04'])
})

test('handleMessage dispatches the round packets', () => {
  const round = fullRound()
  round.handleMessage({ type: 'ANNOUNCEMENT', from: '01' })
  assert.equal(round.phase, 'SHUFFLE')
  round.handleMessage({ type: 'FINAL_TX', from: '01', payload: { transaction: transactionFor() } })
  assert.equal(round.phase, 'VERIFY')
  round.handleMessage({ type: 'VERIFY', from: '01' })
  assert.equal(round.snapshot().players.find((player) => player.key === '01').verified, true)
})
