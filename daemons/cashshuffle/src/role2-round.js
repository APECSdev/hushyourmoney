// daemons/cashshuffle/src/role2-round.js
//
// Pool-native CashShuffle 2N round: the round transaction IS the role-2 lock.
//
// Classic CashShuffle: N equal inputs -> N equal outputs, one output per
// participant. A role-2 action needs TWO fuel UTXOs with the SAME tag, so a
// classic round produces N outputs with N different tags and funds zero
// actions. The 2N round produces 2N outputs: two 15,000-sat tagged fuel UTXOs
// per action, each pair sharing the action's tag.
//
// This module owns the transaction shape, the unsigned builder, the per-input
// signer, the assembler and the 2N verifier. The network loop is in round-2n.js
// (and the daemon main loop remains pending).
//
// Inputs per participant:
//   funding0, funding1  (plain BCH, the participant's P2PKH)
//   blank0, blank1      (pool category, mutable NFT, empty commitment, 0 FT)
//   supply?             (pool category FT, no NFT; SHIELD only)
//
// Outputs per participant:
//   fuel0, fuel1        (program P2SH32, 15,000 sats each, category + mutable
//                        NFT commitment = tag; fuel0 carries pv on a SHIELD)
//   ftChange?           (pool category FT, no NFT, change address; SHIELD only)
//   bchChange?          (plain BCH, change address; only when the funding
//                        exceeds the fuel + blanks + fee share)
//
// The fee is paid from the inputs, not deducted from the 15,000-sat fuel. The
// classic CashShuffle proportional-output fee model does not fit the role-2
// fuel; this builder computes the fee from the probe size and allocates an
// equal share to every participant. The fee is rounded to a multiple of N so
// every participant's change is exact.

import {
  SigningSerializationTypeBCH,
  cashAddressToLockingBytecode,
  decodeTransaction,
  encodeDataPush,
  encodeTransactionBCH,
  generateSigningSerializationBCH,
  hash256,
  hexToBin,
  instantiateSecp256k1,
  instantiateSha256,
} from '@bitauth/libauth'
import { binToHex } from '@bitauth/libauth'

import {
  ROLE2_CARRIER_BYTES,
  ROLE2_FUEL_SATS,
  parseCarrier,
  tagForCarrier,
} from './pool.js'

export const ROLE2_ROUND_VERSION = 2
export const ROLE2_ROUND_LOCKTIME = 0
export const ROLE2_ROUND_SEQUENCE = 0xffffffff
export const ROLE2_ROUND_PLACEHOLDER_BYTES = 100
export const ROLE2_ROUND_BLANK_SATS = 1000n
export const ROLE2_ROUND_FT_CHANGE_SATS = 1000n
export const ROLE2_ROUND_MAX_FEE_SATS = 5000n

function toBigInt(value, name = 'value') {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number' && Number.isSafeInteger(value)) return BigInt(value)
  if (typeof value === 'string' && /^\d+$/.test(value)) return BigInt(value)
  throw new Error(`role2-round: ${name} must be a non-negative integer`)
}

function bytesOf(value, name, length = null) {
  if (value instanceof Uint8Array) {
    if (length !== null && value.length !== length) throw new Error(`role2-round: ${name} must be ${length} bytes`)
    return value
  }
  if (typeof value === 'string') {
    const hex = value.startsWith('0x') ? value.slice(2) : value
    if (!/^[0-9a-f]*$/i.test(hex) || hex.length % 2 !== 0) throw new Error(`role2-round: ${name} must be bytes or hex`)
    const bytes = hexToBin(hex)
    if (length !== null && bytes.length !== length) throw new Error(`role2-round: ${name} must be ${length} bytes`)
    return bytes
  }
  throw new Error(`role2-round: ${name} must be bytes or hex`)
}

function hexOf(value, name) {
  return binToHex(bytesOf(value, name))
}

function tokenOf(utxo) {
  return utxo?.token || utxo?.token_data || null
}

function satsOf(utxo, name = 'utxo') {
  const value = utxo?.sats ?? utxo?.valueSatoshis ?? utxo?.value
  return toBigInt(value, `${name}.sats`)
}

function txidOf(utxo, name = 'utxo') {
  const txid = utxo?.txid ?? utxo?.tx_hash
  if (typeof txid !== 'string' || !/^[0-9a-f]{64}$/i.test(txid)) throw new Error(`role2-round: ${name} needs a 32-byte txid`)
  return txid.toLowerCase()
}

function voutOf(utxo, name = 'utxo') {
  const vout = utxo?.vout ?? utxo?.tx_pos
  if (!Number.isInteger(Number(vout)) || Number(vout) < 0) throw new Error(`role2-round: ${name} needs a vout`)
  return Number(vout)
}

function outpointOf(utxo, name = 'utxo') {
  return `${txidOf(utxo, name)}:${voutOf(utxo, name)}`
}

function inputOutpoint(input) {
  if (input?.outpoint) return String(input.outpoint)
  if (typeof input?.txid === 'string' && input?.vout !== undefined) return `${input.txid}:${input.vout}`
  if (input?.outpointTransactionHash instanceof Uint8Array && input?.outpointIndex !== undefined) {
    /* libauth stores outpointTransactionHash in display order and reverses it
       only when encoding, so the display txid is the bytes as they are. */
    return `${binToHex(new Uint8Array(input.outpointTransactionHash))}:${input.outpointIndex}`
  }
  return null
}

function outpointInput(utxo, name = 'utxo') {
  return {
    outpointTransactionHash: hexToBin(txidOf(utxo, name)),
    outpointIndex: voutOf(utxo, name),
    sequenceNumber: ROLE2_ROUND_SEQUENCE,
    unlockingBytecode: new Uint8Array(0),
  }
}

function lockingOfAddress(address) {
  const result = cashAddressToLockingBytecode(address)
  if (typeof result === 'string') throw new Error(`role2-round: bad change address: ${result}`)
  return result.bytecode
}

function lockingOfUtxo(utxo, changeAddress) {
  const locking = utxo?.lockingBytecode ?? utxo?.scriptPubKey ?? utxo?.script
  if (locking instanceof Uint8Array) return locking
  if (typeof locking === 'string') return hexToBin(locking.replace(/^0x/, ''))
  return lockingOfAddress(changeAddress)
}

function tokenOfUtxo(utxo, categoryBytes) {
  const token = tokenOf(utxo)
  if (!token) return null
  const category = bytesOf(token.category, 'token.category', 32)
  if (binToHex(category) !== binToHex(categoryBytes)) throw new Error('role2-round: token category does not match the pool')
  return {
    category,
    amount: toBigInt(token.amount ?? 0, 'token.amount'),
    ...(token.nft ? {
      nft: {
        capability: token.nft.capability,
        commitment: bytesOf(token.nft.commitment ?? new Uint8Array(0), 'token.nft.commitment'),
      },
    } : {}),
  }
}

function sourceOf(utxo, changeAddress, categoryBytes) {
  const token = tokenOfUtxo(utxo, categoryBytes)
  return {
    lockingBytecode: lockingOfUtxo(utxo, changeAddress),
    valueSatoshis: satsOf(utxo),
    ...(token ? { token } : {}),
  }
}

function isBlankToken(token, categoryBytes) {
  if (!token) return false
  if (!token.nft || token.nft.capability !== 'mutable') return false
  if (token.nft.commitment.length !== 0) return false
  if (token.amount !== 0n) return false
  return binToHex(token.category) === binToHex(categoryBytes)
}

function isSupplyToken(token, categoryBytes) {
  if (!token) return false
  if (token.nft) return false
  if (token.amount <= 0n) return false
  return binToHex(token.category) === binToHex(categoryBytes)
}

function fuelToken(categoryBytes, tag, amount) {
  return {
    category: categoryBytes,
    amount,
    nft: { capability: 'mutable', commitment: tag },
  }
}

function normalizeParticipant(participant, index, categoryBytes) {
  if (!participant || typeof participant !== 'object') throw new Error(`role2-round: participant ${index} is required`)
  const key = String(participant.key ?? '').toLowerCase()
  if (!key) throw new Error(`role2-round: participant ${index} needs a key`)
  const changeAddress = participant.changeAddress
  if (!changeAddress) throw new Error(`role2-round: participant ${index} needs a change address`)
  const changeLocking = lockingOfAddress(changeAddress)
  const fundingUtxos = participant.fundingUtxos
  if (!Array.isArray(fundingUtxos) || fundingUtxos.length !== 2) {
    throw new Error(`role2-round: participant ${index} needs exactly TWO funding UTXOs`)
  }
  const blanks = participant.blanks
  if (!Array.isArray(blanks) || blanks.length !== 2) {
    throw new Error(`role2-round: participant ${index} needs exactly TWO blanks`)
  }
  const tag = bytesOf(participant.tag, `participant ${index} tag`, 32)
  const carrier = participant.carrier ? bytesOf(participant.carrier, `participant ${index} carrier`, ROLE2_CARRIER_BYTES) : null
  const parsed = carrier ? parseCarrier(carrier) : { pv: 0n, sign: 0 }
  if (carrier && binToHex(tagForCarrier(carrier)) !== binToHex(tag)) {
    throw new Error(`role2-round: participant ${index} tag does not match the carrier`)
  }
  if (parsed.sign !== 0 && parsed.sign !== 1) throw new Error(`role2-round: participant ${index} carrier sign must be 0 or 1`)
  if (parsed.sign === 1 && participant.supplyUtxo) {
    throw new Error(`role2-round: participant ${index} is an UNSHIELD and must not carry an FT supply`)
  }
  if (parsed.sign === 0 && parsed.pv > 0n && !participant.supplyUtxo) {
    throw new Error(`role2-round: participant ${index} SHIELD needs an FT supply UTXO`)
  }

  const funding = fundingUtxos.map((utxo, n) => {
    const token = tokenOf(utxo)
    if (token) throw new Error(`role2-round: participant ${index} funding ${n} must be tokenless`)
    return { utxo, outpoint: outpointOf(utxo, `participant ${index} funding ${n}`), sats: satsOf(utxo) }
  })
  const blankData = blanks.map((utxo, n) => {
    const token = tokenOfUtxo(utxo, categoryBytes)
    if (!isBlankToken(token, categoryBytes)) throw new Error(`role2-round: participant ${index} blank ${n} has the wrong shape`)
    return { utxo, outpoint: outpointOf(utxo, `participant ${index} blank ${n}`), sats: satsOf(utxo), token }
  })

  let supply = null
  if (participant.supplyUtxo) {
    const token = tokenOfUtxo(participant.supplyUtxo, categoryBytes)
    if (!isSupplyToken(token, categoryBytes)) throw new Error(`role2-round: participant ${index} supply has the wrong shape`)
    if (token.amount < parsed.pv) throw new Error(`role2-round: participant ${index} supply is smaller than the SHIELD deposit`)
    supply = { utxo: participant.supplyUtxo, outpoint: outpointOf(participant.supplyUtxo, `participant ${index} supply`), sats: satsOf(participant.supplyUtxo), token }
  }

  return {
    key,
    index,
    tag,
    carrier,
    pv: parsed.pv,
    sign: parsed.sign,
    changeAddress,
    changeLocking,
    funding,
    blanks: blankData,
    supply,
  }
}

function probeTransaction(transaction) {
  return {
    ...transaction,
    inputs: transaction.inputs.map((input) => ({
      ...input,
      unlockingBytecode: new Uint8Array(ROLE2_ROUND_PLACEHOLDER_BYTES),
    })),
  }
}

/*
 * buildRole2Round — assemble the unsigned 2N round transaction.
 *
 * @param {object}   opts
 * @param {object}   opts.pool          registry pool (program locking + category)
 * @param {object[]} opts.participants  exactly N participants, each:
 *   { key, fundingUtxos:[2], blanks:[2], tag, carrier?, supplyUtxo?, changeAddress }
 * @param {bigint}   [opts.feeRate]     sats/byte for the probe (default 1)
 * @param {bigint}   [opts.maxFeeSats]  total round fee cap (default 5,000)
 * @param {bigint}   [opts.fuelSats]    per fuel output (default 15,000)
 *
 * @returns {object} { transaction, sources, fee, feeRate, fuelSats,
 *   inputsByPlayer, outputsByPlayer, fuelVouts, ftChangeVouts, changeVouts,
 *   tags, participants }
 */
export async function buildRole2Round({
  pool,
  participants,
  feeRate = 1n,
  maxFeeSats = ROLE2_ROUND_MAX_FEE_SATS,
  fuelSats = ROLE2_FUEL_SATS,
} = {}) {
  const programLockingHex = pool?.program?.lockingBytecode ?? pool?.programLocking
  if (!programLockingHex) throw new Error('role2-round: pool program locking missing')
  const categoryHex = pool?.assetCategory ?? pool?.poolCategory
  if (!categoryHex) throw new Error('role2-round: pool category missing')
  if (!Array.isArray(participants) || participants.length < 2) {
    throw new Error('role2-round: at least TWO participants are required')
  }

  const sha256 = await instantiateSha256()
  const programLocking = hexToBin(programLockingHex)
  const categoryBytes = hexToBin(categoryHex)
  const normalized = participants.map((participant, index) => normalizeParticipant(participant, index, categoryBytes))

  const tags = new Set()
  const outpoints = new Set()
  const changeAddresses = new Set()
  for (const participant of normalized) {
    const tagHex = binToHex(participant.tag)
    if (tags.has(tagHex)) throw new Error(`role2-round: duplicate tag ${tagHex}`)
    tags.add(tagHex)
    const addressKey = String(participant.changeAddress).toLowerCase()
    if (changeAddresses.has(addressKey)) throw new Error(`role2-round: duplicate change address ${participant.changeAddress}`)
    changeAddresses.add(addressKey)
    for (const item of [...participant.funding, ...participant.blanks, ...(participant.supply ? [participant.supply] : [])]) {
      if (outpoints.has(item.outpoint)) throw new Error(`role2-round: duplicate outpoint ${item.outpoint}`)
      outpoints.add(item.outpoint)
    }
  }

  const inputs = []
  const sources = []
  const inputsByPlayer = []

  for (const participant of normalized) {
    const indices = { funding: [], blanks: [], supply: null }
    for (const item of participant.funding) {
      indices.funding.push(inputs.length)
      inputs.push(outpointInput(item.utxo, `${participant.key} funding`))
      sources.push(sourceOf(item.utxo, participant.changeAddress, categoryBytes))
    }
    for (const item of participant.blanks) {
      indices.blanks.push(inputs.length)
      inputs.push(outpointInput(item.utxo, `${participant.key} blank`))
      sources.push(sourceOf(item.utxo, participant.changeAddress, categoryBytes))
    }
    if (participant.supply) {
      indices.supply = inputs.length
      inputs.push(outpointInput(participant.supply.utxo, `${participant.key} supply`))
      sources.push(sourceOf(participant.supply.utxo, participant.changeAddress, categoryBytes))
    }
    inputsByPlayer.push({ key: participant.key, ...indices })
  }

  const outputs = []
  const outputsByPlayer = []
  const fuelVouts = []
  const ftChangeVouts = []
  const changeVouts = []

  for (const participant of normalized) {
    const fuel0Index = outputs.length
    const fuel0Amount = participant.sign === 0 ? participant.pv : 0n
    outputs.push({
      lockingBytecode: programLocking,
      valueSatoshis: toBigInt(fuelSats),
      token: fuelToken(categoryBytes, participant.tag, fuel0Amount),
      address: null,
    })
    const fuel1Index = outputs.length
    outputs.push({
      lockingBytecode: programLocking,
      valueSatoshis: toBigInt(fuelSats),
      token: fuelToken(categoryBytes, participant.tag, 0n),
      address: null,
    })
    fuelVouts.push({
      key: participant.key,
      tag: binToHex(participant.tag),
      vouts: [fuel0Index, fuel1Index],
      sats: toBigInt(fuelSats),
      ftAmount: fuel0Amount,
    })

    let ftChangeVout = null
    if (participant.supply) {
      const ftChange = participant.supply.token.amount - participant.pv
      if (ftChange > 0n) {
        ftChangeVout = outputs.length
        outputs.push({
          lockingBytecode: participant.changeLocking,
          valueSatoshis: ROLE2_ROUND_FT_CHANGE_SATS,
          token: { category: categoryBytes, amount: ftChange },
          address: participant.changeAddress,
        })
        ftChangeVouts.push({ key: participant.key, vout: ftChangeVout, amount: ftChange })
      }
    }
    outputsByPlayer.push({
      key: participant.key,
      fuel: [fuel0Index, fuel1Index],
      ftChange: ftChangeVout,
      bchChange: null,
    })
  }

  /* Measure the fee with one placeholder BCH change output per participant.
     The real change outputs are appended after the fuel/FT-change outputs so
     the fuel vouts stay stable. */
  const probeOutputs = outputs.concat(normalized.map((participant) => ({
    lockingBytecode: participant.changeLocking,
    valueSatoshis: 0n,
    address: participant.changeAddress,
  })))
  const probe = {
    version: ROLE2_ROUND_VERSION,
    locktime: ROLE2_ROUND_LOCKTIME,
    inputs,
    outputs: probeOutputs,
  }
  const probeSize = BigInt(encodeTransactionBCH(probeTransaction(probe)).length)
  const buffer = BigInt(normalized.length) * 16n
  const rawFee = probeSize * toBigInt(feeRate, 'feeRate') + buffer
  const fee = ((rawFee + BigInt(normalized.length) - 1n) / BigInt(normalized.length)) * BigInt(normalized.length)
  if (fee > toBigInt(maxFeeSats, 'maxFeeSats')) {
    throw new Error(`role2-round: fee ${fee} exceeds the cap ${maxFeeSats}`)
  }

  const feeShare = fee / BigInt(normalized.length)
  const changes = []
  let totalChange = 0n
  for (let i = 0; i < normalized.length; i += 1) {
    const participant = normalized[i]
    const inputSats = [...participant.funding, ...participant.blanks, ...(participant.supply ? [participant.supply] : [])]
      .reduce((sum, item) => sum + item.sats, 0n)
    const ftChangeSats = participant.supply && participant.supply.token.amount - participant.pv > 0n
      ? ROLE2_ROUND_FT_CHANGE_SATS
      : 0n
    const outputSats = 2n * toBigInt(fuelSats) + ftChangeSats
    const change = inputSats - outputSats - feeShare
    if (change < 0n) throw new Error(`role2-round: participant ${participant.key} funding is short by ${-change} sats`)
    changes.push(change)
    totalChange += change
  }

  /* Append only the non-zero BCH change outputs. */
  for (let i = 0; i < normalized.length; i += 1) {
    const participant = normalized[i]
    const change = changes[i]
    if (change === 0n) continue
    const vout = outputs.length
    outputs.push({
      lockingBytecode: participant.changeLocking,
      valueSatoshis: change,
      address: participant.changeAddress,
    })
    outputsByPlayer[i].bchChange = vout
    changeVouts.push({ key: participant.key, vout, amount: change })
  }

  const transaction = {
    version: ROLE2_ROUND_VERSION,
    locktime: ROLE2_ROUND_LOCKTIME,
    inputs,
    outputs,
    feeSats: fee,
  }

  return {
    transaction,
    sources,
    fee,
    feeRate: toBigInt(feeRate, 'feeRate'),
    fuelSats: toBigInt(fuelSats),
    probeSize,
    feeShare,
    totalChange,
    inputsByPlayer,
    outputsByPlayer,
    fuelVouts,
    ftChangeVouts,
    changeVouts,
    tags: Object.fromEntries(normalized.map((participant) => [participant.key, binToHex(participant.tag)])),
    participants: normalized.map((participant) => ({
      key: participant.key,
      tag: binToHex(participant.tag),
      pv: participant.pv,
      sign: participant.sign,
      changeAddress: participant.changeAddress,
      fundingOutpoints: participant.funding.map((item) => item.outpoint),
      blankOutpoints: participant.blanks.map((item) => item.outpoint),
      supplyOutpoint: participant.supply?.outpoint ?? null,
      supplyAmount: participant.supply?.token.amount ?? 0n,
    })),
  }
}

/*
 * signRole2Round — sign the given input indices for one participant.
 *
 * The transaction is mutated in place (the input unlockings are set) and the
 * signature packets are returned for the coordinator. The coordinator applies
 * them with applyRole2Signatures().
 */
export async function signRole2Round({
  transaction,
  sources,
  inputIndices,
  privateKey,
  publicKey,
} = {}) {
  if (!transaction || !Array.isArray(transaction.inputs)) throw new Error('role2-round: transaction is required')
  if (!Array.isArray(sources) || sources.length !== transaction.inputs.length) {
    throw new Error('role2-round: sources must match the transaction inputs')
  }
  if (!Array.isArray(inputIndices) || inputIndices.length === 0) throw new Error('role2-round: input indices are required')
  const key = bytesOf(privateKey, 'privateKey', 32)
  const sha256 = await instantiateSha256()
  const secp = await instantiateSecp256k1()
  const pub = publicKey ? bytesOf(publicKey, 'publicKey', 33) : secp.derivePublicKeyCompressed(key)
  if (typeof pub === 'string') throw new Error('role2-round: public-key derivation failed: ' + pub)

  const signatures = []
  for (const index of inputIndices) {
    if (!Number.isInteger(index) || index < 0 || index >= transaction.inputs.length) {
      throw new Error(`role2-round: bad input index ${index}`)
    }
    const source = sources[index]
    if (!source?.lockingBytecode) throw new Error(`role2-round: source ${index} has no locking bytecode`)
    const serialization = generateSigningSerializationBCH(
      { inputIndex: index, sourceOutputs: sources, transaction },
      {
        coveredBytecode: source.lockingBytecode,
        signingSerializationType: Uint8Array.of(SigningSerializationTypeBCH.allOutputs),
      },
      sha256,
    )
    const digest = hash256(serialization, sha256)
    const signature = secp.signMessageHashSchnorr(key, digest)
    if (typeof signature === 'string') throw new Error('role2-round: Schnorr signing failed: ' + signature)
    const unlocking = Uint8Array.from([
      ...encodeDataPush(Uint8Array.from([...signature, SigningSerializationTypeBCH.allOutputs])),
      ...encodeDataPush(pub),
    ])
    transaction.inputs[index].unlockingBytecode = unlocking
    signatures.push({ inputIndex: index, signature: binToHex(signature), publicKey: binToHex(pub) })
  }
  return signatures
}

/* applyRole2Signatures — the coordinator writes the collected signatures. */
export function applyRole2Signatures({ transaction, signatures } = {}) {
  if (!transaction || !Array.isArray(transaction.inputs)) throw new Error('role2-round: transaction is required')
  if (!Array.isArray(signatures)) throw new Error('role2-round: signatures are required')
  for (const packet of signatures) {
    const index = packet?.inputIndex
    if (!Number.isInteger(index) || index < 0 || index >= transaction.inputs.length) {
      throw new Error(`role2-round: bad signature input index ${index}`)
    }
    const signature = bytesOf(packet.signature, 'signature', 64)
    const publicKey = bytesOf(packet.publicKey, 'publicKey', 33)
    transaction.inputs[index].unlockingBytecode = Uint8Array.from([
      ...encodeDataPush(Uint8Array.from([...signature, SigningSerializationTypeBCH.allOutputs])),
      ...encodeDataPush(publicKey),
    ])
  }
  return transaction
}

/* assembleRole2Round — encode the signed transaction and return its txid. */
export async function assembleRole2Round({ transaction } = {}) {
  if (!transaction || !Array.isArray(transaction.inputs)) throw new Error('role2-round: transaction is required')
  const sha256 = await instantiateSha256()
  const hex = binToHex(encodeTransactionBCH(transaction))
  const decoded = decodeTransaction(hexToBin(hex))
  if (typeof decoded === 'string') throw new Error('role2-round: the transaction does not decode: ' + decoded)
  const txid = binToHex(new Uint8Array(hash256(encodeTransactionBCH(transaction), sha256)).reverse())
  return { transaction, hex, txid, decoded }
}

/*
 * verifyRole2Round — the peer's VERIFY check for the 2N shape.
 *
 * The player checks:
 *   - the round has 2N fuel outputs, each tag exactly twice, both at the program,
 *     15,000 sats, pool category, mutable NFT, commitment = tag;
 *   - its own fuel pair has the expected FT amount (pv on one, 0 on the other);
 *   - its two funding and two blank inputs are present; its supply (if any);
 *   - the blanks are the exact blank shape; the supplies are pool-category FT;
 *   - the FT is conserved (inputs = fuel deposits + FT change);
 *   - its FT change and BCH change are correct for its fee share;
 *   - the fee is the declared fee, divisible by N, within the cap;
 *   - version 2, locktime 0, sequence 0xffffffff.
 */
export async function verifyRole2Round({ transaction, sources = [], player, config = {} } = {}) {
  if (!transaction || !Array.isArray(transaction.inputs) || !Array.isArray(transaction.outputs)) {
    throw new Error('role2-round: verify needs transaction inputs and outputs')
  }
  if (!player) throw new Error('role2-round: verify needs the player')
  const poolSize = Number(config.poolSize ?? 0)
  if (!Number.isInteger(poolSize) || poolSize < 2) throw new Error('role2-round: config.poolSize is required')
  const programLocking = bytesOf(config.programLocking ?? config.pool?.program?.lockingBytecode ?? config.pool?.programLocking, 'programLocking')
  const categoryBytes = bytesOf(config.poolCategory ?? config.pool?.assetCategory ?? config.pool?.poolCategory, 'poolCategory', 32)
  const fuelSats = toBigInt(config.fuelSats ?? ROLE2_FUEL_SATS, 'fuelSats')
  const maxFeeSats = toBigInt(config.maxFeeSats ?? ROLE2_ROUND_MAX_FEE_SATS, 'maxFeeSats')
  const tag = bytesOf(player.tag, 'player.tag', 32)
  const tagHex = binToHex(tag)
  const changeAddress = player.changeAddress
  if (!changeAddress) throw new Error('role2-round: player.changeAddress is required')
  const changeLocking = lockingOfAddress(changeAddress)
  const pv = toBigInt(player.pv ?? 0, 'player.pv')
  const sign = Number(player.sign ?? 0)
  if (sign !== 0 && sign !== 1) throw new Error('role2-round: player.sign must be 0 or 1')

  if (Number(transaction.version) !== ROLE2_ROUND_VERSION) throw new Error('role2-round: nVersion must be 2')
  if (Number(transaction.locktime) !== ROLE2_ROUND_LOCKTIME) throw new Error('role2-round: nLockTime must be 0')

  const inputOutpoints = transaction.inputs.map(inputOutpoint)
  if (inputOutpoints.some((outpoint) => outpoint === null)) throw new Error('role2-round: every input needs an outpoint')
  if (new Set(inputOutpoints).size !== inputOutpoints.length) throw new Error('role2-round: duplicate input outpoint')
  for (const input of transaction.inputs) {
    const sequence = input.sequence ?? input.sequenceNumber
    if (sequence !== undefined && Number(sequence) !== ROLE2_ROUND_SEQUENCE) {
      throw new Error('role2-round: input sequence must be 0xffffffff')
    }
  }

  /* The unsigned transaction carries no input values or tokens; those live in
     the previous outputs. The coordinator supplies them as `sources`; the
     player checks its own and the global token shapes. */
  const sourceAt = (index) => sources[index] || null
  const inputSatsAt = (index) => {
    const input = transaction.inputs[index]
    const value = input.sats ?? input.valueSatoshis ?? input.value ?? sourceAt(index)?.valueSatoshis
    return toBigInt(value, `input ${index} sats`)
  }
  const inputTokenAt = (index) => tokenOf(transaction.inputs[index]) || sourceAt(index)?.token || null

  const fundingInputs = []
  const blankInputs = []
  const supplyInputs = []
  for (let i = 0; i < transaction.inputs.length; i += 1) {
    const token = inputTokenAt(i)
    if (!token) {
      fundingInputs.push(i)
      continue
    }
    const category = bytesOf(token.category, 'input.token.category', 32)
    if (binToHex(category) !== binToHex(categoryBytes)) throw new Error('role2-round: input token category does not match the pool')
    const amount = toBigInt(token.amount ?? 0, 'input.token.amount')
    const nft = token.nft
    if (nft && nft.capability === 'mutable') {
      const commitment = bytesOf(nft.commitment ?? new Uint8Array(0), 'input.token.nft.commitment')
      if (commitment.length !== 0 || amount !== 0n) throw new Error('role2-round: a blank input has the wrong shape')
      blankInputs.push(i)
      continue
    }
    if (nft) throw new Error('role2-round: an input NFT is not a blank')
    if (amount <= 0n) throw new Error('role2-round: an FT input needs a positive amount')
    supplyInputs.push(i)
  }
  if (fundingInputs.length !== 2 * poolSize) throw new Error(`role2-round: expected ${2 * poolSize} funding inputs, got ${fundingInputs.length}`)
  if (blankInputs.length !== 2 * poolSize) throw new Error(`role2-round: expected ${2 * poolSize} blank inputs, got ${blankInputs.length}`)

  const playerFunding = Array.isArray(player.fundingOutpoints) ? player.fundingOutpoints.map(String) : []
  const playerBlanks = Array.isArray(player.blankOutpoints) ? player.blankOutpoints.map(String) : []
  if (playerFunding.length !== 2) throw new Error('role2-round: player.fundingOutpoints must contain TWO outpoints')
  if (playerBlanks.length !== 2) throw new Error('role2-round: player.blankOutpoints must contain TWO outpoints')
  for (const outpoint of playerFunding) {
    if (!inputOutpoints.includes(outpoint)) throw new Error(`role2-round: the player funding ${outpoint} is missing`)
  }
  for (const outpoint of playerBlanks) {
    if (!inputOutpoints.includes(outpoint)) throw new Error(`role2-round: the player blank ${outpoint} is missing`)
  }
  if (player.supplyOutpoint && !inputOutpoints.includes(String(player.supplyOutpoint))) {
    throw new Error('role2-round: the player supply is missing')
  }

  const fuelOutputs = []
  for (let i = 0; i < transaction.outputs.length; i += 1) {
    const output = transaction.outputs[i]
    const token = tokenOf(output)
    if (!token) continue
    const category = bytesOf(token.category, 'output.token.category', 32)
    if (binToHex(category) !== binToHex(categoryBytes)) throw new Error('role2-round: output token category does not match the pool')
    const nft = token.nft
    if (!nft) continue
    if (nft.capability !== 'mutable') throw new Error('role2-round: a fuel output must carry a mutable NFT')
    const commitment = bytesOf(nft.commitment ?? new Uint8Array(0), 'output.token.nft.commitment', 32)
    const locking = output.lockingBytecode ?? (output.address ? lockingOfAddress(output.address) : null)
    if (!locking || binToHex(locking) !== binToHex(programLocking)) throw new Error('role2-round: a fuel output is not at the role-2 program')
    if (toBigInt(output.valueSatoshis ?? output.sats ?? output.value, 'output.sats') !== fuelSats) {
      throw new Error('role2-round: a fuel output is not 15,000 sats')
    }
    fuelOutputs.push({ index: i, tag: binToHex(commitment), amount: toBigInt(token.amount ?? 0, 'output.token.amount') })
  }
  if (fuelOutputs.length !== 2 * poolSize) throw new Error(`role2-round: expected ${2 * poolSize} fuel outputs, got ${fuelOutputs.length}`)

  const byTag = new Map()
  for (const output of fuelOutputs) {
    const list = byTag.get(output.tag) || []
    list.push(output)
    byTag.set(output.tag, list)
  }
  if (byTag.size !== poolSize) throw new Error(`role2-round: expected ${poolSize} distinct tags, got ${byTag.size}`)
  for (const [tagKey, list] of byTag.entries()) {
    if (list.length !== 2) throw new Error(`role2-round: tag ${tagKey} must appear exactly twice`)
    const amounts = list.map((output) => output.amount)
    const positive = amounts.filter((amount) => amount > 0n)
    if (positive.length > 1) throw new Error(`role2-round: tag ${tagKey} has more than one FT-bearing fuel`)
    if (positive.length === 1 && amounts.filter((amount) => amount === 0n).length !== 1) {
      throw new Error(`role2-round: tag ${tagKey} must have one FT-bearing fuel and one zero fuel`)
    }
  }
  const playerFuel = byTag.get(tagHex)
  if (!playerFuel || playerFuel.length !== 2) throw new Error('role2-round: the player tag does not appear exactly twice')
  const expectedFuelAmounts = pv > 0n && sign === 0 ? [pv, 0n] : [0n, 0n]
  const actualFuelAmounts = playerFuel.map((output) => output.amount).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  const expectedSorted = expectedFuelAmounts.slice().sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  if (actualFuelAmounts.length !== expectedSorted.length || actualFuelAmounts.some((amount, i) => amount !== expectedSorted[i])) {
    throw new Error('role2-round: the player fuel FT amounts are wrong')
  }

  const tokenIn = transaction.inputs.reduce((sum, input, index) => {
    const token = inputTokenAt(index)
    if (!token) return sum
    return sum + toBigInt(token.amount ?? 0, 'input.token.amount')
  }, 0n)
  const tokenOut = transaction.outputs.reduce((sum, output) => {
    const token = tokenOf(output)
    if (!token) return sum
    return sum + toBigInt(token.amount ?? 0, 'output.token.amount')
  }, 0n)
  if (tokenIn !== tokenOut) throw new Error('role2-round: the pool FT is not conserved')

  const totalIn = transaction.inputs.reduce((sum, input, index) => sum + inputSatsAt(index), 0n)
  const totalOut = transaction.outputs.reduce((sum, output) => sum + toBigInt(output.sats ?? output.valueSatoshis ?? output.value, 'output.sats'), 0n)
  const fee = totalIn - totalOut
  if (fee < 0n) throw new Error('role2-round: outputs exceed inputs')
  if (transaction.feeSats !== undefined && toBigInt(transaction.feeSats, 'transaction.feeSats') !== fee) {
    throw new Error('role2-round: the declared fee does not match the transaction')
  }
  if (fee > maxFeeSats) throw new Error(`role2-round: fee ${fee} exceeds the cap ${maxFeeSats}`)
  if (fee % BigInt(poolSize) !== 0n) throw new Error('role2-round: the fee is not divisible across the pool')
  const feeShare = fee / BigInt(poolSize)

  const playerInputSats = transaction.inputs
    .reduce((sum, input, index) => {
      const own = playerFunding.includes(inputOutpoints[index])
        || playerBlanks.includes(inputOutpoints[index])
        || (player.supplyOutpoint && inputOutpoints[index] === String(player.supplyOutpoint))
      return own ? sum + inputSatsAt(index) : sum
    }, 0n)
  const supplyAmount = toBigInt(player.supplyAmount ?? 0, 'player.supplyAmount')
  const ftChangeAmount = player.supplyOutpoint ? supplyAmount - pv : 0n
  const ftChangeSats = ftChangeAmount > 0n ? ROLE2_ROUND_FT_CHANGE_SATS : 0n
  const expectedChange = playerInputSats - 2n * fuelSats - ftChangeSats - feeShare
  if (expectedChange < 0n) throw new Error('role2-round: the player funding is short for the fee share')

  const changeOutputs = transaction.outputs
    .map((output, index) => ({ output, index }))
    .filter(({ output }) => {
      const token = tokenOf(output)
      if (token) return false
      const locking = output.lockingBytecode ?? (output.address ? lockingOfAddress(output.address) : null)
      return locking && binToHex(locking) === binToHex(changeLocking)
    })
  if (changeOutputs.length > 1) throw new Error('role2-round: the player has more than one BCH change output')
  if (expectedChange > 0n) {
    if (changeOutputs.length !== 1) throw new Error('role2-round: the player BCH change is missing')
    const amount = toBigInt(changeOutputs[0].output.sats ?? changeOutputs[0].output.valueSatoshis ?? changeOutputs[0].output.value, 'change.sats')
    if (amount !== expectedChange) throw new Error('role2-round: the player BCH change is wrong')
  } else if (changeOutputs.length !== 0) {
    throw new Error('role2-round: the player has unexpected BCH change')
  }

  const ftChangeOutputs = transaction.outputs
    .map((output, index) => ({ output, index }))
    .filter(({ output }) => {
      const token = tokenOf(output)
      if (!token || token.nft) return false
      const locking = output.lockingBytecode ?? (output.address ? lockingOfAddress(output.address) : null)
      return locking && binToHex(locking) === binToHex(changeLocking)
    })
  if (ftChangeAmount > 0n) {
    if (ftChangeOutputs.length !== 1) throw new Error('role2-round: the player FT change is missing')
    const token = tokenOf(ftChangeOutputs[0].output)
    if (toBigInt(token.amount ?? 0, 'ftChange.amount') !== ftChangeAmount) throw new Error('role2-round: the player FT change is wrong')
    if (toBigInt(ftChangeOutputs[0].output.sats ?? ftChangeOutputs[0].output.valueSatoshis ?? ftChangeOutputs[0].output.value, 'ftChange.sats') !== ROLE2_ROUND_FT_CHANGE_SATS) {
      throw new Error('role2-round: the player FT change sats are wrong')
    }
  } else if (ftChangeOutputs.length !== 0) {
    throw new Error('role2-round: the player has unexpected FT change')
  }

  return {
    tag: tagHex,
    fuelVouts: playerFuel.map((output) => output.index),
    fuelSats,
    feeSats: fee,
    feeShare,
    changeSats: expectedChange,
    ftChangeSats,
  }
}
