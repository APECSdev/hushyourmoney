// daemons/cashshuffle/src/main.js
//
// CashShuffle daemon entry point. ORCHESTRATION SKELETON — not implemented.
// See ../README.md, ../PLAN.md, ../ACCEPTANCE.md.

import { redactConfig } from '../../shared/src/config.js'

import { loadCashShuffleConfig } from './config.js'
import { Metrics } from './metrics.js'

export async function main(env = process.env) {
  const config = loadCashShuffleConfig(env)
  const metrics = new Metrics()
  metrics.inc('cashshuffle_daemon_starts_total')

  console.log(
    JSON.stringify({
      level: 'info',
      msg: 'cashshuffle-daemon skeleton: config loaded; implementation pending',
      network: config.network,
      poolCategory: config.poolCategory,
      poolSize: config.poolSize,
      relays: config.relays,
      config: redactConfig(config),
      metrics: metrics.snapshot(),
    }),
  )

  throw new Error('cashshuffle-daemon: not implemented — see daemons/cashshuffle/PLAN.md')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(JSON.stringify({ level: 'error', msg: error.message }))
    process.exitCode = 78
  })
}
