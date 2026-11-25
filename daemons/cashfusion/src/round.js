// daemons/cashfusion/src/round.js
//
// CashFusion six-phase round. ORCHESTRATION SKELETON — not implemented.
// Design: docs/P2P-FUSION-DESIGN.md; reference: web/stores/p2pfusion/round.ts.
//
// Coordinator privacy: AGENTS.md:110 records that the coordinator-sees
// critique applies to CashFusion. The daemon defaults to
// CASHFUSION_COORDINATOR_POLICY=avoid and refuses the role when elected.

export const PHASES = Object.freeze([
  'ANNOUNCE',
  'ELECTION',
  'REGISTRATION',
  'MIXNET',
  'ASSEMBLY',
  'SIGNING',
])

export const TERMINAL_PHASES = Object.freeze(['BROADCAST', 'ABORT'])

export function coordinatorAllowed(policy, elected) {
  if (policy === 'allow') return true
  if (policy === 'avoid') return !elected
  if (policy === 'rotate') return true
  throw new Error(`cashfusion: unknown coordinator policy ${policy}`)
}

export class CashFusionRound {
  constructor({ config, transport, wallet, metrics, now = () => Date.now() } = {}) {
    this.config = config
    this.transport = transport
    this.wallet = wallet
    this.metrics = metrics
    this.now = now
    this.phase = 'ANNOUNCE'
    this.aborted = false
    this.txid = null
  }

  async run() {
    throw new Error('CashFusionRound.run: not implemented — CF-1')
  }
}

export async function verifyFinalTransaction({ transaction, player, config } = {}) {
  throw new Error('verifyFinalTransaction: not implemented — CF-4')
}
