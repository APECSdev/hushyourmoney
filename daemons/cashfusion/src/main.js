// daemons/cashfusion/src/main.js
//
// CashFusion daemon entry point. ORCHESTRATION SKELETON — not implemented.
// See ../README.md, ../PLAN.md, ../ACCEPTANCE.md.

import { redactConfig } from '../../shared/src/config.js'

import { loadCashFusionConfig } from './config.js'
import { Metrics } from './metrics.js'

export async function main(env = process.env) {
  const config = loadCashFusionConfig(env)
  const metrics = new Metrics()
  metrics.inc('cashfusion_daemon_starts_total')

  console.log(
    JSON.stringify({
      level: 'info',
      msg: 'cashfusion-daemon skeleton: config loaded; implementation pending',
      network: config.network,
      poolSize: config.poolSize,
      minParticipants: config.minParticipants,
      coordinatorPolicy: config.coordinatorPolicy,
      relays: config.relays,
      config: redactConfig(config),
      metrics: metrics.snapshot(),
    }),
  )

  throw new Error('cashfusion-daemon: not implemented — see daemons/cashfusion/PLAN.md')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(JSON.stringify({ level: 'error', msg: error.message }))
    process.exitCode = 78
  })
}
