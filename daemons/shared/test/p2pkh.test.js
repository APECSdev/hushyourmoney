// daemons/shared/test/p2pkh.test.js
//
// BCH P2PKH transaction signing. Requires @bitauth/libauth; run on a host that
// has the daemon dependencies installed (blackhost / the apecsdev build VM).

import test from 'node:test'
import assert from 'node:assert/strict'

import { secp256k1 } from '@noble/curves/secp256k1.js'
import {
  SigningSerializationTypeBCH,
  generateSigningSerializationBCH,
  hash256,
  instantiateSecp256k1,
  instantiateSha256,
  publicKeyToP2pkhCashAddress,
} from '@bitauth/libauth'

import {
  buildP2pkhTransaction,
  estimateByteCount,
  signP2pkhTransaction,
} from '../src/bch/p2pkh.js'

const privateKey = secp256k1.utils.randomSecretKey()
const publicKey = secp256k1.getPublicKey(privateKey, true)
const { address } = publicKeyToP2pkhCashAddress({ publicKey, prefix: 'bchtest' })

const receiverKey = secp256k1.utils.randomSecretKey()
const receiverPub = secp256k1.getPublicKey(receiverKey, true)
const { address: receiver } = publicKeyToP2pkhCashAddress({ publicKey: receiverPub, prefix: 'bchtest' })

const INPUTS = [{
  txid: 'aa'.repeat(32),
  vout: 0,
  satoshis: 100000,
  address,
  sequenceNumber: 0xfffffffe,
}]
const OUTPUTS = [{ address: receiver, satoshis: 90000 }]

test('buildP2pkhTransaction builds the source outputs and sequence', () => {
  const bundle = buildP2pkhTransaction({ inputs: INPUTS, outputs: OUTPUTS })
  assert.equal(bundle.sourceOutputs[0].valueSatoshis, 100000n)
  assert.equal(bundle.transaction.inputs[0].sequenceNumber, 0xfffffffe)
  assert.equal(bundle.transaction.outputs[0].valueSatoshis, 90000n)
})

test('signP2pkhTransaction produces a verifiable BCH Schnorr signature', async () => {
  const result = await signP2pkhTransaction({
    inputs: INPUTS,
    outputs: OUTPUTS,
    privateKey,
    publicKey,
  })

  assert.match(result.hex, /^01000000/)
  const unlocking = result.bundle.transaction.inputs[0].unlockingBytecode
  assert.equal(unlocking.length, 100)
  assert.equal(unlocking[0], 0x41)
  assert.equal(unlocking[65], 0x41)
  assert.equal(unlocking[66], 0x21)

  const signature = unlocking.slice(1, 65)
  const sha256 = await instantiateSha256()
  const serialization = generateSigningSerializationBCH(
    {
      inputIndex: 0,
      sourceOutputs: result.bundle.sourceOutputs,
      transaction: result.bundle.transaction,
    },
    {
      coveredBytecode: result.bundle.coveredBytecodes[0],
      signingSerializationType: Uint8Array.of(SigningSerializationTypeBCH.allOutputs),
    },
    sha256,
  )
  const digest = hash256(serialization, sha256)
  const secp = await instantiateSecp256k1()
  assert.equal(secp.verifySignatureSchnorr(signature, publicKey, digest), true)
})

test('estimateByteCount is the P2PKH estimate', () => {
  assert.equal(estimateByteCount(1, 1), 192)
  assert.equal(estimateByteCount(2, 3), 10 + 296 + 102)
})

test('a malformed address is rejected', () => {
  assert.throws(
    () => buildP2pkhTransaction({
      inputs: [{ ...INPUTS[0], address: 'not-a-cash-address' }],
      outputs: OUTPUTS,
    }),
    /p2pkh:/,
  )
})
