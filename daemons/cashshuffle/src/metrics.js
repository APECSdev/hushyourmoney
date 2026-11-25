// daemons/cashshuffle/src/metrics.js
//
// CashShuffle metric names. The implementation is shared.

export { Metrics } from '../../shared/src/metrics.js'

export const METRIC_NAMES = Object.freeze({
  roundsTotal: 'cashshuffle_rounds_total',
  roundsFailed: 'cashshuffle_rounds_failed_total',
  relayConnected: 'cashshuffle_relay_connected',
  balanceSats: 'cashshuffle_balance_sats',
  blanksHeld: 'cashshuffle_blanks_held',
  actionsRemaining: 'cashshuffle_actions_remaining',
})
