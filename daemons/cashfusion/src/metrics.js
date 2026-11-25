// daemons/cashfusion/src/metrics.js
//
// CashFusion metric names. The implementation is shared.

export { Metrics } from '../../shared/src/metrics.js'

export const METRIC_NAMES = Object.freeze({
  roundsTotal: 'cashfusion_rounds_total',
  roundsFailed: 'cashfusion_rounds_failed_total',
  relayConnected: 'cashfusion_relay_connected',
  balanceSats: 'cashfusion_balance_sats',
  coordinatorElected: 'cashfusion_coordinator_elected_total',
})
