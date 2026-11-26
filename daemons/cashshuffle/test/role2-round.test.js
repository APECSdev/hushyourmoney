// daemons/cashshuffle/test/role2-round.test.js
//
// Pool-native CashShuffle 2N round: 2N tagged fuel UTXOs, two blanks per
// action, per-participant signing, and the 2N VERIFY checks. Requires
// @bitauth/libauth; run on blackhost or the apecsdev build VM.

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  SigningSerializationTypeBCH,
  decodeTransaction,
  encodeCashAddress,
  generateSigningSerializationBCH,
  hash256,
  hexToBin,
  instantiateSecp256k1,
  instantiateSha256,
} from '@bitauth/libauth'

import {
  applyRole2Signatures,
  assembleRole2Round,
  buildRole2Round,
  signRole2Round,
  verifyRole2Round,
} from '../src/role2-round.js'
import {
  encodeRole2Carrier,
  tagForCarrier,
} from '../src/pool.js'

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

function carrierFor(index, pv = 0n, sign = 0n) {
  return encodeRole2Carrier({
    nf0: BigInt(1000 + index),
    nf1: BigInt(2000 + index),
    cm0: BigInt(3000 + index),
    cm1: BigInt(4000 + index),
    newRoot: BigInt(5000 + index),
    pv,
    sign,
  })
}

function participant(index, { pv = 0n, sign = 0n, supplyAmount = 0n, fundingSats = 20000n } = {}) {
  const carrier = carrierFor(index, pv, sign)
  return {
    key: KEYS[index],
    fundingUtxos: [
      { txid: nextTxid(), vout: 0, sats: fundingSats },
      { txid: nextTxid(), vout: 1, sats: fundingSats },
    ],
    blanks: [
      {
        txid: nextTxid(),
        vout: 0,
        sats: 1000n,
        token: { category: CATEGORY, amount: '0', nft: { capability: 'mutable', commitment: '' } },
      },
      {
        txid: nextTxid(),
        vout: 1,
        sats: 1000n,
        token: { category: CATEGORY, amount: '0', nft: { capability: 'mutable', commitment: '' } },
      },
    ],
    tag: tagForCarrier(carrier),
    carrier,
    supplyUtxo: supplyAmount > 0n
      ? {
        txid: nextTxid(),
        vout: 0,
        sats: 1000n,
        token: { category: CATEGORY, amount: supplyAmount.toString() },
      }
      : null,
    changeAddress: ADDRESSES[index],
  }
}

function playerFor(built, index) {
  const participant = built.participants[index]
  return {
    key: participant.key,
    tag: hexToBin(participant.tag),
    fundingOutpoints: participant.fundingOutpoints,
    blankOutpoints: participant.blankOutpoints,
    supplyOutpoint: participant.supplyOutpoint,
    supplyAmount: participant.supplyAmount,
    pv: participant.pv,
    sign: participant.sign,
    changeAddress: participant.changeAddress,
  }
}

function config(overrides = {}) {
  return {
    poolSize: N,
    programLocking: POOL.programLocking,
    poolCategory: CATEGORY,
    fuelSats: 15000n,
    maxFeeSats: 5000n,
    ...overrides,
  }
}

function participants() {
  return Array.from({ length: N }, (_, index) => participant(index))
}

test('builds 2N fuel outputs: two per action, same tag per pair, 15k each', async () => {
  const built = await buildRole2Round({ pool: POOL, participants: participants() })
  assert.equal(built.transaction.inputs.length, 4 * N)
  assert.equal(built.transaction.outputs.length, 2 * N + N)
  assert.equal(built.fuelVouts.length, N)
  assert.equal(built.fee % BigInt(N), 0n)
  assert.ok(built.fee <= 5000n)
  for (const pair of built.fuelVouts) {
    assert.equal(pair.vouts.length, 2)
    for (const vout of pair.vouts) {
      const output = built.transaction.outputs[vout]
      assert.equal(output.valueSatoshis, 15000n)
      assert.deepEqual(output.token.category, hexToBin(CATEGORY))
      assert.equal(output.token.amount, 0n)
      assert.equal(output.token.nft.capability, 'mutable')
      assert.equal(Buffer.from(output.token.nft.commitment).toString('hex'), pair.tag)
    }
  }
})

test('every player VERIFIES its own pair and change', async () => {
  const built = await buildRole2Round({ pool: POOL, participants: participants() })
  for (let index = 0; index < N; index += 1) {
    const result = await verifyRole2Round({
      transaction: built.transaction,
      sources: built.sources,
      player: playerFor(built, index),
      config: config(),
    })
    assert.equal(result.tag, built.participants[index].tag)
    assert.deepEqual(result.fuelVouts, built.fuelVouts[index].vouts)
    assert.equal(result.feeSats, built.fee)
    assert.equal(result.feeShare, built.feeShare)
  }
})

test('signs each player’s inputs, assembles, and the signatures verify', async () => {
  const built = await buildRole2Round({ pool: POOL, participants: participants() })
  const packets = []
  for (let index = 0; index < N; index += 1) {
    const indices = [
      ...built.inputsByPlayer[index].funding,
      ...built.inputsByPlayer[index].blanks,
    ]
    const signatures = await signRole2Round({
      transaction: built.transaction,
      sources: built.sources,
      inputIndices: indices,
      privateKey: PRIVATE_KEYS[index],
    })
    packets.push(...signatures)
  }
  applyRole2Signatures({ transaction: built.transaction, signatures: packets })
  const assembled = await assembleRole2Round({ transaction: built.transaction })
  assert.match(assembled.txid, /^[0-9a-f]{64}$/)
  const decoded = decodeTransaction(hexToBin(assembled.hex))
  assert.equal(typeof decoded, 'object')
  assert.equal(decoded.inputs.length, 4 * N)
  assert.equal(decoded.outputs.length, 2 * N + N)

  const sha256 = await instantiateSha256()
  const secp = await instantiateSecp256k1()
  const first = built.inputsByPlayer[0].funding[0]
  const pub = secp.derivePublicKeyCompressed(PRIVATE_KEYS[0])
  const serialization = generateSigningSerializationBCH(
    { inputIndex: first, sourceOutputs: built.sources, transaction: built.transaction },
    {
      coveredBytecode: built.sources[first].lockingBytecode,
      signingSerializationType: Uint8Array.of(SigningSerializationTypeBCH.allOutputs),
    },
    sha256,
  )
  const digest = hash256(serialization, sha256)
  const signature = built.transaction.inputs[first].unlockingBytecode.slice(1, 66)
  assert.equal(secp.verifySignatureSchnorr(signature.slice(0, 64), pub, digest), true)
})

test('SHIELD carries the FT deposit on fuel0 and returns FT change', async () => {
  const list = participants()
  list[0] = participant(0, { pv: 1000000n, supplyAmount: 5000000n })
  const built = await buildRole2Round({ pool: POOL, participants: list })
  const pair = built.fuelVouts[0]
  const fuel0 = built.transaction.outputs[pair.vouts[0]]
  const fuel1 = built.transaction.outputs[pair.vouts[1]]
  assert.equal(fuel0.token.amount, 1000000n)
  assert.equal(fuel1.token.amount, 0n)
  const ftChange = built.ftChangeVouts.find((item) => item.key === '01')
  assert.ok(ftChange)
  assert.equal(built.transaction.outputs[ftChange.vout].token.amount, 4000000n)
  const result = await verifyRole2Round({
    transaction: built.transaction,
    sources: built.sources,
    player: playerFor(built, 0),
    config: config(),
  })
  assert.equal(result.ftChangeSats, 1000n)
})

test('UNSHIELD has no FT on either fuel and no FT change', async () => {
  const list = participants()
  list[0] = participant(0, { pv: 250000n, sign: 1n })
  const built = await buildRole2Round({ pool: POOL, participants: list })
  const pair = built.fuelVouts[0]
  assert.equal(built.transaction.outputs[pair.vouts[0]].token.amount, 0n)
  assert.equal(built.transaction.outputs[pair.vouts[1]].token.amount, 0n)
  assert.equal(built.ftChangeVouts.some((item) => item.key === '01'), false)
  await verifyRole2Round({
    transaction: built.transaction,
    sources: built.sources,
    player: playerFor(built, 0),
    config: config(),
  })
})

test('rejects a tampered fuel tag and a missing blank', async () => {
  const built = await buildRole2Round({ pool: POOL, participants: participants() })
  const player = playerFor(built, 0)
  const tampered = {
    ...built.transaction,
    outputs: built.transaction.outputs.map((output, index) => {
      if (index !== built.fuelVouts[0].vouts[1]) return output
      return {
        ...output,
        token: { ...output.token, nft: { ...output.token.nft, commitment: new Uint8Array(32).fill(0xff) } },
      }
    }),
  }
  await assert.rejects(
    () => verifyRole2Round({ transaction: tampered, sources: built.sources, player, config: config() }),
    /tag|fuel/i,
  )

  const missing = {
    ...built.transaction,
    inputs: built.transaction.inputs.filter((_, index) => index !== built.inputsByPlayer[0].blanks[0]),
  }
  await assert.rejects(
    () => verifyRole2Round({ transaction: missing, sources: built.sources, player, config: config() }),
    /blank|funding|expected/i,
  )
})

test('rejects an over-cap fee and a wrong fuel amount', async () => {
  const built = await buildRole2Round({ pool: POOL, participants: participants() })
  const player = playerFor(built, 0)
  await assert.rejects(
    () => verifyRole2Round({ transaction: built.transaction, sources: built.sources, player, config: config({ maxFeeSats: 1n }) }),
    /fee/i,
  )
  const wrongFuel = {
    ...built.transaction,
    outputs: built.transaction.outputs.map((output, index) => {
      if (index !== built.fuelVouts[0].vouts[0]) return output
      return { ...output, valueSatoshis: 14999n }
    }),
  }
  await assert.rejects(
    () => verifyRole2Round({ transaction: wrongFuel, sources: built.sources, player, config: config() }),
    /15,000|fuel/i,
  )
})

test('rejects duplicate tags and malformed blanks at build time', async () => {
  const list = participants()
  list[1] = { ...list[1], tag: list[0].tag, carrier: list[0].carrier }
  await assert.rejects(
    () => buildRole2Round({ pool: POOL, participants: list }),
    /duplicate tag/i,
  )

  const bad = participants()
  bad[0] = {
    ...bad[0],
    blanks: [
      { ...bad[0].blanks[0], token: { ...bad[0].blanks[0].token, nft: { capability: 'mutable', commitment: '00' } } },
      bad[0].blanks[1],
    ],
  }
  await assert.rejects(
    () => buildRole2Round({ pool: POOL, participants: bad }),
    /blank/i,
  )
})
