// daemons/cashshuffle/src/config.js
//
// CashShuffle daemon configuration. Pure Node, no dependencies.
// Env prefix: CASHSHUFFLE_*; shared keys: NOSTR_*, DAEMON_*.

import {
  ConfigError,
  loadCommonConfig,
  parseBigInt,
  parseInteger,
} from '../../shared/src/config.js'

const HEX64 = /^[0-9a-f]{64}$/i
const HEX_LOCKING = /^[0-9a-f]{70}$/i

export const POOL = Object.freeze({
  category: '480e30ff1d3f5f0b6fe9dd2dbe363b1776f61566f29a395628d0b50abd01b9d0',
  programLocking: 'aa203e40b64cff154d4b3305e8c8cc4e3174bc595ad74342a8445a9a7798b7be3a2987',
  guardLocking: 'aa2066a238ad4109a3093c34fd4cf9b4167b0058375d4ad1c5cc44cd253d3664f0c187',
  vendingLocking: 'aa206b51396304b3bd4e0e9c254f84d1ee80d83a5c7ccaf3750883d00866480d981287',
})

function envOr(env, key, fallback) {
  const value = env[key]
  return value === undefined || value === null || value === '' ? fallback : String(value)
}

function hex(value, name, pattern) {
  if (!pattern.test(value)) throw new ConfigError(`${name} must be 32-byte hex (category) or 35-byte P2SH32 hex (locking)`)
  return value.toLowerCase()
}

export function loadCashShuffleConfig(env = process.env) {
  const common = loadCommonConfig(env)

  const network = envOr(env, 'CASHSHUFFLE_NETWORK', 'chipnet').toLowerCase()
  if (network !== 'chipnet') {
    throw new ConfigError('CASHSHUFFLE_NETWORK must be chipnet until Gate 7 (the mainnet MPC ceremony)')
  }

  const poolCategory = hex(envOr(env, 'CASHSHUFFLE_POOL_CATEGORY', POOL.category), 'CASHSHUFFLE_POOL_CATEGORY', HEX64)
  const programLocking = hex(envOr(env, 'CASHSHUFFLE_POOL_LOCKING', POOL.programLocking), 'CASHSHUFFLE_POOL_LOCKING', HEX_LOCKING)
  const guardLocking = hex(envOr(env, 'CASHSHUFFLE_GUARD_LOCKING', POOL.guardLocking), 'CASHSHUFFLE_GUARD_LOCKING', HEX_LOCKING)
  const vendingLocking = hex(envOr(env, 'CASHSHUFFLE_VENDING_LOCKING', POOL.vendingLocking), 'CASHSHUFFLE_VENDING_LOCKING', HEX_LOCKING)

  const vendingPriceSats = parseBigInt(
    envOr(env, 'CASHSHUFFLE_VENDING_PRICE_SATS', '1000'),
    'CASHSHUFFLE_VENDING_PRICE_SATS',
    { min: 1n },
  )
  const fuelSats = parseBigInt(
    envOr(env, 'CASHSHUFFLE_FUEL_SATS', '15000'),
    'CASHSHUFFLE_FUEL_SATS',
    { min: 1n },
  )
  const blanksPerLock = parseInteger(
    envOr(env, 'CASHSHUFFLE_BLANKS_PER_LOCK', '2'),
    'CASHSHUFFLE_BLANKS_PER_LOCK',
    { min: 2, max: 2 },
  )
  const poolSize = parseInteger(
    envOr(env, 'CASHSHUFFLE_POOL_SIZE', '5'),
    'CASHSHUFFLE_POOL_SIZE',
    { min: 5, max: 100 },
  )
  const amountSats = parseBigInt(
    envOr(env, 'CASHSHUFFLE_AMOUNT_SATS', '100000'),
    'CASHSHUFFLE_AMOUNT_SATS',
    { min: 1n },
  )
  const feeRate = parseInteger(
    envOr(env, 'CASHSHUFFLE_FEE_RATE', '1'),
    'CASHSHUFFLE_FEE_RATE',
    { min: 1, max: 100 },
  )
  const maxFloatSats = parseBigInt(
    envOr(env, 'CASHSHUFFLE_MAX_FLOAT_SATS', '400000'),
    'CASHSHUFFLE_MAX_FLOAT_SATS',
    { min: 0n },
  )
  const maxRounds = parseInteger(
    envOr(env, 'CASHSHUFFLE_MAX_ROUNDS', '10'),
    'CASHSHUFFLE_MAX_ROUNDS',
    { min: 1, max: 100000 },
  )
  const maxLockFeeSats = parseBigInt(
    envOr(env, 'CASHSHUFFLE_MAX_LOCK_FEE_SATS', '5000'),
    'CASHSHUFFLE_MAX_LOCK_FEE_SATS',
    { min: 0n },
  )

  const seedFile = envOr(env, 'CASHSHUFFLE_SEED_FILE', '/var/lib/cashshuffle-daemon/.seed')
  const dataDir = envOr(env, 'CASHSHUFFLE_DATA_DIR', '/var/lib/cashshuffle-daemon')

  return {
    ...common,
    network,
    poolCategory,
    programLocking,
    guardLocking,
    vendingLocking,
    vendingPriceSats,
    fuelSats,
    blanksPerLock,
    poolSize,
    amountSats,
    feeRate,
    maxFloatSats,
    maxRounds,
    maxLockFeeSats,
    seedFile,
    dataDir,
  }
}
