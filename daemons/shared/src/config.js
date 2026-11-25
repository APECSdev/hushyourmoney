// daemons/shared/src/config.js
//
// Shared configuration for the Hush daemons. Pure Node, no dependencies.
// Each daemon loads the common keys here and extends them in its own config.js.

export class ConfigError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ConfigError'
  }
}

const LOG_LEVELS = new Set(['debug', 'info', 'warn', 'error'])
const AUTH_POLICIES = new Set(['none', 'optional', 'required'])

export const COMMON_DEFAULTS = Object.freeze({
  DAEMON_LOG_LEVEL: 'info',
  DAEMON_METRICS_ADDR: '127.0.0.1:0',
  NOSTR_RELAYS: 'wss://relay.primal.net,wss://nostr.mom,wss://offchain.pub',
  NOSTR_RELAY_PACING_MS: '80',
  NOSTR_AUTH_POLICY: 'optional',
})

function valueOf(env, key) {
  const value = env[key]
  return value === undefined || value === null || value === '' ? COMMON_DEFAULTS[key] : String(value)
}

export function parseList(value, name) {
  const items = String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  if (items.length === 0) throw new ConfigError(`${name} must contain at least one value`)
  return [...new Set(items)]
}

export function parseInteger(value, name, { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (!/^-?\d+$/.test(String(value))) throw new ConfigError(`${name} must be an integer`)
  const number = Number(value)
  if (!Number.isSafeInteger(number)) throw new ConfigError(`${name} is outside the safe integer range`)
  if (number < min || number > max) throw new ConfigError(`${name} must be between ${min} and ${max}`)
  return number
}

export function parseBigInt(value, name, { min = 0n, max = 2n ** 63n - 1n } = {}) {
  if (!/^\d+$/.test(String(value))) throw new ConfigError(`${name} must be a non-negative integer`)
  const number = BigInt(value)
  if (number < min || number > max) throw new ConfigError(`${name} must be between ${min} and ${max}`)
  return number
}

export function parseBoolean(value, name) {
  const text = String(value).toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(text)) return true
  if (['0', 'false', 'no', 'off'].includes(text)) return false
  throw new ConfigError(`${name} must be a boolean`)
}

export function loadCommonConfig(env = process.env) {
  const logLevel = valueOf(env, 'DAEMON_LOG_LEVEL').toLowerCase()
  if (!LOG_LEVELS.has(logLevel)) {
    throw new ConfigError(`DAEMON_LOG_LEVEL must be one of ${[...LOG_LEVELS].join(', ')}`)
  }

  const metricsAddr = valueOf(env, 'DAEMON_METRICS_ADDR')
  if (!/^\[?[0-9a-zA-Z:.]+\]?:\d+$/.test(metricsAddr)) {
    throw new ConfigError('DAEMON_METRICS_ADDR must be host:port')
  }

  const relays = parseList(valueOf(env, 'NOSTR_RELAYS'), 'NOSTR_RELAYS')
  for (const relay of relays) {
    if (!/^wss?:\/\//.test(relay)) {
      throw new ConfigError(`NOSTR_RELAYS entry is not a WebSocket URL: ${relay}`)
    }
  }

  const relayPacingMs = parseInteger(valueOf(env, 'NOSTR_RELAY_PACING_MS'), 'NOSTR_RELAY_PACING_MS', {
    min: 0,
    max: 5000,
  })

  const authPolicy = valueOf(env, 'NOSTR_AUTH_POLICY').toLowerCase()
  if (!AUTH_POLICIES.has(authPolicy)) {
    throw new ConfigError(`NOSTR_AUTH_POLICY must be one of ${[...AUTH_POLICIES].join(', ')}`)
  }

  return { logLevel, metricsAddr, relays, relayPacingMs, authPolicy }
}

export function redactConfig(value) {
  if (Array.isArray(value)) return value.map(redactConfig)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [key, item] of Object.entries(value)) {
      out[key] = /seed|secret|private|key|token|password/i.test(key) ? '[redacted]' : redactConfig(item)
    }
    return out
  }
  return value
}
