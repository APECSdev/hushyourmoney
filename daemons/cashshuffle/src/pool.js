// daemons/cashshuffle/src/pool.js
//
// Role-2 tagged pool helpers for the CashShuffle daemon.
//
// One action consumes TWO tagged fuel UTXOs with the SAME tag, TWO blanks,
// and 30,000 sats of action fee (15,000 per fuel). The lock tx fee is separate.
// The BCH lock/action builders are the M4 work; this module owns the carrier,
// the tag, the pair check and the cost arithmetic.
//
// See docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md §3-§4 and ../PLAN.md.

import { createHash } from 'node:crypto'

export const ROLE2_CARRIER_BYTES = 169
export const ROLE2_CARRIER_PREFIX = [0x6a, 0x4c, ROLE2_CARRIER_BYTES]
export const ROLE2_FUEL_SATS = 15000n
export const ROLE2_BLANKS_PER_LOCK = 2
export const ROLE2_STATE_FLOAT_SATS = 10000n
export const ROLE2_VENDING_PRICE_SATS = 1000n

const LIMB_BYTES = 32
const LIMB_COUNT = 5
const PV_OFFSET = LIMB_BYTES * LIMB_COUNT
const SIGN_OFFSET = PV_OFFSET + 8

function toBytes(value, name) {
  if (value instanceof Uint8Array) return value
  if (typeof value === 'string') {
    const hex = value.startsWith('0x') ? value.slice(2) : value
    if (!/^[0-9a-f]*$/i.test(hex) || hex.length % 2 !== 0) {
      throw new Error(`role2: ${name} must be bytes or hex`)
    }
    return Uint8Array.from(Buffer.from(hex, 'hex'))
  }
  throw new Error(`role2: ${name} must be bytes or hex`)
}

function hexOf(value, name) {
  if (typeof value === 'string') {
    const hex = value.startsWith('0x') ? value.slice(2) : value
    if (!/^[0-9a-f]*$/i.test(hex) || hex.length % 2 !== 0) {
      throw new Error(`role2: ${name} must be hex`)
    }
    return hex.toLowerCase()
  }
  return Buffer.from(toBytes(value, name)).toString('hex')
}

function toBigInt(value, name) {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number' && Number.isSafeInteger(value)) return BigInt(value)
  if (typeof value === 'string' && /^\d+$/.test(value)) return BigInt(value)
  throw new Error(`role2: ${name} must be a non-negative integer`)
}

function limb(value, name) {
  const bytes = toBytes(value, name)
  if (bytes.length !== LIMB_BYTES) throw new Error(`role2: ${name} must be 32 bytes`)
  return bytes
}

export function tagForCarrier(carrier) {
  const bytes = toBytes(carrier, 'carrier')
  if (bytes.length !== ROLE2_CARRIER_BYTES) {
    throw new Error(`carrier must be ${ROLE2_CARRIER_BYTES} bytes`)
  }
  return createHash('sha256').update(bytes.subarray(0, 64)).digest()
}

export function parseCarrier(carrier) {
  const bytes = toBytes(carrier, 'carrier')
  if (bytes.length !== ROLE2_CARRIER_BYTES) {
    throw new Error(`carrier must be ${ROLE2_CARRIER_BYTES} bytes`)
  }
  const sign = bytes[SIGN_OFFSET]
  if (sign !== 0 && sign !== 1) throw new Error('role2: carrier sign must be 0 or 1')
  let pv = 0n
  for (let index = 7; index >= 0; index -= 1) {
    pv = (pv << 8n) | BigInt(bytes[PV_OFFSET + index])
  }
  return {
    bytes,
    nf0: hexOf(bytes.subarray(0, 32), 'nf0'),
    nf1: hexOf(bytes.subarray(32, 64), 'nf1'),
    cm0: hexOf(bytes.subarray(64, 96), 'cm0'),
    cm1: hexOf(bytes.subarray(96, 128), 'cm1'),
    newRoot: hexOf(bytes.subarray(128, 160), 'newRoot'),
    pv,
    sign,
  }
}

export function buildCarrier({ nf0, nf1, cm0, cm1, newRoot, pv = 0n, sign = 0 } = {}) {
  const out = new Uint8Array(ROLE2_CARRIER_BYTES)
  out.set(limb(nf0, 'nf0'), 0)
  out.set(limb(nf1, 'nf1'), 32)
  out.set(limb(cm0, 'cm0'), 64)
  out.set(limb(cm1, 'cm1'), 96)
  out.set(limb(newRoot, 'newRoot'), 128)
  const value = toBigInt(pv, 'pv')
  if (value < 0n || value > 0xffffffffffffffffn) throw new Error('role2: pv must fit 8 bytes')
  for (let index = 0; index < 8; index += 1) {
    out[PV_OFFSET + index] = Number((value >> BigInt(8 * index)) & 0xffn)
  }
  if (sign !== 0 && sign !== 1) throw new Error('role2: sign must be 0 or 1')
  out[SIGN_OFFSET] = sign
  return out
}

export function depositTag(carrier) {
  return tagForCarrier(carrier)
}

function bigIntToLe32(value) {
  const out = new Uint8Array(32)
  let number = toBigInt(value, 'limb')
  for (let index = 0; index < 32; index += 1) {
    out[index] = Number(number & 0xffn)
    number >>= 8n
  }
  return out
}

export function encodeRole2Carrier({ nf0, nf1, cm0, cm1, newRoot, pv = 0n, sign = 0 } = {}) {
  return buildCarrier({
    nf0: bigIntToLe32(nf0),
    nf1: bigIntToLe32(nf1),
    cm0: bigIntToLe32(cm0),
    cm1: bigIntToLe32(cm1),
    newRoot: bigIntToLe32(newRoot),
    pv,
    sign: Number(sign),
  })
}

export function role2CarrierOutput(carrier) {
  const bytes = toBytes(carrier, 'carrier')
  if (bytes.length !== ROLE2_CARRIER_BYTES) {
    throw new Error(`role2: carrier must be ${ROLE2_CARRIER_BYTES} bytes`)
  }
  const out = new Uint8Array(ROLE2_CARRIER_PREFIX.length + bytes.length)
  out.set(ROLE2_CARRIER_PREFIX, 0)
  out.set(bytes, ROLE2_CARRIER_PREFIX.length)
  return out
}

export function readRole2CarrierOutput(lockingBytecode) {
  const bytes = toBytes(lockingBytecode, 'lockingBytecode')
  if (bytes.length !== ROLE2_CARRIER_PREFIX.length + ROLE2_CARRIER_BYTES) return null
  if (bytes[0] !== 0x6a || bytes[1] !== 0x4c || bytes[2] !== ROLE2_CARRIER_BYTES) return null
  return bytes.subarray(ROLE2_CARRIER_PREFIX.length)
}

function commitmentOf(nft) {
  if (typeof nft.commitment === 'string') return nft.commitment.replace(/^0x/, '').toLowerCase()
  if (nft.commitment instanceof Uint8Array) return Buffer.from(nft.commitment).toString('hex')
  return ''
}

export function assertFuelPair({ fuelUtxos, carrier, poolCategory } = {}) {
  if (!Array.isArray(fuelUtxos) || fuelUtxos.length !== 2) {
    throw new Error('role2: exactly TWO fuel UTXOs are required')
  }
  if (!poolCategory) throw new Error('role2: the pool category is required')
  const tag = tagForCarrier(carrier).toString('hex')
  const category = String(poolCategory).toLowerCase()

  for (const utxo of fuelUtxos) {
    const token = utxo?.token ?? utxo?.token_data
    if (!token) throw new Error('role2: a fuel UTXO has no token')
    if (String(token.category ?? '').toLowerCase() !== category) {
      throw new Error('role2: a fuel UTXO has the wrong category')
    }
    const nft = token.nft
    if (!nft || nft.capability !== 'mutable') {
      throw new Error('role2: a fuel UTXO needs a mutable NFT')
    }
    if (commitmentOf(nft) !== tag) {
      throw new Error('role2: a fuel UTXO has the wrong deposit tag')
    }
  }

  return { tag, fuelUtxos }
}

export function actionCostSats({
  fuelSats = ROLE2_FUEL_SATS,
  blanksPerLock = ROLE2_BLANKS_PER_LOCK,
  vendingPriceSats = ROLE2_VENDING_PRICE_SATS,
  lockFeeSats = 0n,
  actions = 1n,
} = {}) {
  const fuel = toBigInt(fuelSats, 'fuelSats')
  const blanks = toBigInt(blanksPerLock, 'blanksPerLock')
  const price = toBigInt(vendingPriceSats, 'vendingPriceSats')
  const lockFee = toBigInt(lockFeeSats, 'lockFeeSats')
  const count = toBigInt(actions, 'actions')
  const perAction = fuel + blanks * price + lockFee
  return {
    fuelSats: fuel * count,
    blankCostSats: blanks * price * count,
    lockFeeSats: lockFee * count,
    totalSats: perAction * count,
    actions: count,
  }
}

export class Role2PoolAdapter {
  constructor({ config, wallet, metrics } = {}) {
    this.config = config
    this.wallet = wallet
    this.metrics = metrics
  }

  tagForCarrier(carrier) {
    return tagForCarrier(carrier)
  }

  parseCarrier(carrier) {
    return parseCarrier(carrier)
  }

  buildCarrier(fields) {
    return buildCarrier(fields)
  }

  assertFuelPair(fuelUtxos, carrier) {
    return assertFuelPair({
      fuelUtxos,
      carrier,
      poolCategory: this.config?.poolCategory,
    })
  }

  async buildLock() {
    throw new Error('Role2PoolAdapter.buildLock: not implemented — CS-7')
  }

  async buildAction() {
    throw new Error('Role2PoolAdapter.buildAction: not implemented — CS-7')
  }

  async verifyBeforeBroadcast() {
    throw new Error('Role2PoolAdapter.verifyBeforeBroadcast: not implemented — CS-7')
  }
}
