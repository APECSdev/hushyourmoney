// daemons/cashshuffle/src/round.js
//
// CashShuffle round state machine. ORCHESTRATION SKELETON — not implemented.
//
// The Nito protocol core (../nito.cash/apps/web/src/lib/cashshuffle/protocol.js)
// has no transaction object and no verify-before-sign step. This daemon adds a
// VERIFY phase between SHUFFLE and SIGNING: every peer checks the final
// transaction pays its own output before producing a signature.
// See ../PLAN.md (CS-5) and ../ACCEPTANCE.md (A2).

export const PHASES = Object.freeze([
  'REGISTER',
  'POOL',
  'ANNOUNCEMENT',
  'SHUFFLE',
  'VERIFY',
  'SIGNING',
  'BROADCAST',
  'BLAME',
])

export const TERMINAL_PHASES = Object.freeze(['BROADCAST', 'BLAME'])

export function nextPhase(phase) {
  if (TERMINAL_PHASES.includes(phase)) return null
  const index = PHASES.indexOf(phase)
  if (index < 0) throw new Error(`cashshuffle: unknown phase ${phase}`)
  return index === PHASES.length - 1 ? null : PHASES[index + 1]
}

export class CashShuffleRound {
  constructor({ config, transport, wallet, pool, metrics, now = () => Date.now() } = {}) {
    this.config = config
    this.transport = transport
    this.wallet = wallet
    this.pool = pool
    this.metrics = metrics
    this.now = now
    this.phase = 'REGISTER'
    this.aborted = false
    this.txid = null
  }

  async run() {
    throw new Error('CashShuffleRound.run: not implemented — CS-5')
  }
}

export async function verifyFinalTransaction({ transaction, player, config } = {}) {
  throw new Error('verifyFinalTransaction: not implemented — CS-5')
}
