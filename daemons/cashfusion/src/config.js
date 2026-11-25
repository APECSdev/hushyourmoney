// daemons/cashfusion/src/config.js
//
// CashFusion daemon configuration. Pure Node, no dependencies.
// Env prefix: CASHFUSION_*; shared keys: NOSTR_*, DAEMON_*.

import {
  ConfigError,
  loadCommonConfig,
  parseBigInt,
  parseInteger,
} from '../../shared/src/config.js'

const COORDINATOR_POLICIES = new Set(['avoid', 'rotate', 'allow'])

export const CONSTANTS = Object.freeze({
  poolSize: 5,
  minParticipants: 5,
  feeSats: 5000n,
  maxFeeRate: 5,
})

function envOr(env, key, fallback) {
  const value = env[key]
  return value === undefined || value === null || value === '' ? fallback : String(value)
}

export function loadCashFusionConfig(env = process.env) {
  const common = loadCommonConfig(env)

  const network = envOr(env, 'CASHFUSION_NETWORK', 'chipnet').toLowerCase()
  if (network !== 'chipnet') {
    throw new ConfigError('CASHFUSION_NETWORK must be chipnet until G4 (mainnet opt-in beta)')
  }

  const minParticipants = parseInteger(
    envOr(env, 'CASHFUSION_MIN_PARTICIPANTS', String(CONSTANTS.minParticipants)),
    'CASHFUSION_MIN_PARTICIPANTS',
    { min: 5, max: 100 },
  )
  const poolSize = parseInteger(
    envOr(env, 'CASHFUSION_POOL_SIZE', String(CONSTANTS.poolSize)),
    'CASHFUSION_POOL_SIZE',
    { min: 5, max: 100 },
  )
  if (poolSize < minParticipants) {
    throw new ConfigError('CASHFUSION_POOL_SIZE must be at least CASHFUSION_MIN_PARTICIPANTS')
  }

  const feeSats = parseBigInt(
    envOr(env, 'CASHFUSION_FEE_SATS', String(CONSTANTS.feeSats)),
    'CASHFUSION_FEE_SATS',
    { min: 1n },
  )
  const maxFeeRate = parseInteger(
    envOr(env, 'CASHFUSION_MAX_FEE_RATE', String(CONSTANTS.maxFeeRate)),
    'CASHFUSION_MAX_FEE_RATE',
    { min: 1, max: 100 },
  )

  const coordinatorPolicy = envOr(env, 'CASHFUSION_COORDINATOR_POLICY', 'avoid').toLowerCase()
  if (!COORDINATOR_POLICIES.has(coordinatorPolicy)) {
    throw new ConfigError(`CASHFUSION_COORDINATOR_POLICY must be one of ${[...COORDINATOR_POLICIES].join(', ')}`)
  }

  const maxFloatSats = parseBigInt(
    envOr(env, 'CASHFUSION_MAX_FLOAT_SATS', '300000'),
    'CASHFUSION_MAX_FLOAT_SATS',
    { min: 0n },
  )
  const maxRounds = parseInteger(
    envOr(env, 'CASHFUSION_MAX_ROUNDS', '10'),
    'CASHFUSION_MAX_ROUNDS',
    { min: 1, max: 100000 },
  )

  const seedFile = envOr(env, 'CASHFUSION_SEED_FILE', '/var/lib/cashfusion-daemon/.seed')
  const dataDir = envOr(env, 'CASHFUSION_DATA_DIR', '/var/lib/cashfusion-daemon')

  return {
    ...common,
    network,
    poolSize,
    minParticipants,
    feeSats,
    maxFeeRate,
    coordinatorPolicy,
    maxFloatSats,
    maxRounds,
    seedFile,
    dataDir,
  }
}
