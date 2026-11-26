// daemons/shared/src/bch/p2pkh.js
//
// BCH P2PKH transaction building and signing.
//
// BCH Schnorr with SIGHASH_ALL|SIGHASH_FORKID (0x41), 64-byte signature plus
// the sighash byte. This is NOT Nostr BIP-340. The Nostr signer is never used
// for a transaction input.
//
// Reference: ../nito.cash/apps/web/src/lib/bch/crypto.js (MIT).

import {
  SigningSerializationTypeBCH,
  binToHex,
  cashAddressToLockingBytecode,
  encodeDataPush,
  encodeTransactionBCH,
  generateSigningSerializationBCH,
  hash256,
  hexToBin,
  instantiateSecp256k1,
  instantiateSha256,
} from '@bitauth/libauth'

let secp256k1 = null
let sha256 = null

async function init() {
  if (!secp256k1) secp256k1 = await instantiateSecp256k1()
  if (!sha256) sha256 = await instantiateSha256()
}

function toBytes(value, name) {
  if (value instanceof Uint8Array) return value
  if (typeof value === 'string') return hexToBin(value.replace(/^0x/, ''))
  throw new Error(`p2pkh: ${name} must be bytes or hex`)
}

function toBigInt(value, name) {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number' && Number.isSafeInteger(value)) return BigInt(value)
  if (typeof value === 'string' && /^\d+$/.test(value)) return BigInt(value)
  throw new Error(`p2pkh: ${name} must be a non-negative integer`)
}

export function addressToLockingBytecode(address) {
  const result = cashAddressToLockingBytecode(address)
  if (typeof result === 'string') throw new Error(`p2pkh: ${result}`)
  return result.bytecode
}

export function buildP2pkhTransaction({ inputs, outputs } = {}) {
  if (!Array.isArray(inputs) || inputs.length === 0) throw new Error('p2pkh: inputs are required')
  if (!Array.isArray(outputs) || outputs.length === 0) throw new Error('p2pkh: outputs are required')

  const sourceOutputs = inputs.map((input) => ({
    lockingBytecode: addressToLockingBytecode(input.address),
    valueSatoshis: toBigInt(input.satoshis, 'input.satoshis'),
  }))

  const transaction = {
    version: 1,
    inputs: inputs.map((input) => ({
      outpointIndex: input.vout,
      outpointTransactionHash: hexToBin(input.txid),
      sequenceNumber: input.sequenceNumber ?? 0xfffffffe,
      unlockingBytecode: new Uint8Array(0),
    })),
    outputs: outputs.map((output) => ({
      lockingBytecode: addressToLockingBytecode(output.address),
      valueSatoshis: toBigInt(output.satoshis, 'output.satoshis'),
    })),
    locktime: 0,
  }

  return {
    transaction,
    sourceOutputs,
    coveredBytecodes: sourceOutputs.map((output) => output.lockingBytecode),
  }
}

export async function signP2pkhInput(bundle, inputIndex, privateKey, publicKey) {
  await init()
  const privateBytes = toBytes(privateKey, 'privateKey')
  const publicBytes = toBytes(publicKey, 'publicKey')
  if (privateBytes.length !== 32) throw new Error('p2pkh: private key must be 32 bytes')
  if (publicBytes.length !== 33) throw new Error('p2pkh: public key must be 33 bytes')

  const signingSerializationType = Uint8Array.of(SigningSerializationTypeBCH.allOutputs)
  const context = {
    inputIndex,
    sourceOutputs: bundle.sourceOutputs,
    transaction: bundle.transaction,
  }
  const serialization = generateSigningSerializationBCH(
    context,
    {
      coveredBytecode: bundle.coveredBytecodes[inputIndex],
      signingSerializationType,
    },
    sha256,
  )
  const digest = hash256(serialization, sha256)
  const signature = secp256k1.signMessageHashSchnorr(privateBytes, digest)
  if (typeof signature === 'string') throw new Error(`p2pkh: Schnorr signing failed: ${signature}`)

  const bitcoinEncodedSignature = Uint8Array.from([...signature, ...signingSerializationType])
  bundle.transaction.inputs[inputIndex].unlockingBytecode = Uint8Array.from([
    ...encodeDataPush(bitcoinEncodedSignature),
    ...encodeDataPush(publicBytes),
  ])
  return bitcoinEncodedSignature
}

export async function signP2pkhTransaction({ inputs, outputs, privateKey, publicKey } = {}) {
  const bundle = buildP2pkhTransaction({ inputs, outputs })
  for (let index = 0; index < bundle.transaction.inputs.length; index += 1) {
    await signP2pkhInput(bundle, index, privateKey, publicKey)
  }
  return { bundle, hex: encodeTransactionToHex(bundle.transaction) }
}

export function encodeTransactionToHex(transaction) {
  return binToHex(encodeTransactionBCH(transaction))
}

export function estimateByteCount(inputsCount, outputsCount) {
  return 10 + inputsCount * 148 + outputsCount * 34
}
