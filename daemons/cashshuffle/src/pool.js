// daemons/cashshuffle/src/pool.js
//
// Role-2 tagged pool adapter for the CashShuffle daemon. ORCHESTRATION SKELETON.
// One action consumes TWO tagged fuel UTXOs with the SAME tag, TWO blanks,
// and 30,000 sats of action fee (15,000 per fuel). The lock tx fee is separate.
// See docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md §3-§4 and ../PLAN.md (CS-7).

import { createHash } from 'node:crypto'

export const ROLE2_CARRIER_BYTES = 169
export const ROLE2_FUEL_SATS = 15000n
export const ROLE2_BLANKS_PER_LOCK = 2
export const ROLE2_STATE_FLOAT_SATS = 10000n

export function tagForCarrier(carrier) {
  const bytes = carrier instanceof Uint8Array ? carrier : Uint8Array.from(carrier)
  if (bytes.length !== ROLE2_CARRIER_BYTES) {
    throw new Error(`carrier must be ${ROLE2_CARRIER_BYTES} bytes`)
  }
  return createHash('sha256').update(bytes.subarray(0, 64)).digest()
}

export class Role2PoolAdapter {
  constructor({ config, wallet, metrics } = {}) {
    this.config = config
    this.wallet = wallet
    this.metrics = metrics
  }

  async buildLock({ carrier, shieldSats = 0n, blanks, fundingUtxo, changeAddress }) {
    throw new Error('Role2PoolAdapter.buildLock: not implemented — CS-7')
  }

  async buildAction({ carrier, stateUtxo, fuelUtxos, unlockings, payoutAddress }) {
    throw new Error('Role2PoolAdapter.buildAction: not implemented — CS-7')
  }

  async verifyBeforeBroadcast(actionHex) {
    throw new Error('Role2PoolAdapter.verifyBeforeBroadcast: not implemented — CS-7')
  }
}
