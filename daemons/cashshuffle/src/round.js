// daemons/cashshuffle/src/round.js
//
// CashShuffle round state machine + verify-before-sign.
//
// The Nito protocol core has no transaction object and no output check. This
// module adds a VERIFY phase between SHUFFLE and SIGNING: every peer checks the
// final transaction pays its own output before producing a signature.
//
// The network loop is not implemented here. The transport delivers packets to
// handleMessage(); the daemon's main loop owns the relay subscription.

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

function toBigInt(value, name) {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number' && Number.isSafeInteger(value)) return BigInt(value)
  if (typeof value === 'string' && /^\d+$/.test(value)) return BigInt(value)
  throw new Error(`cashshuffle: ${name} must be a non-negative integer`)
}

function outpointOf(input) {
  if (input?.outpoint) return String(input.outpoint)
  if (input?.txid !== undefined && input?.vout !== undefined) return `${input.txid}:${input.vout}`
  return null
}

function satsOf(item) {
  return item?.sats ?? item?.valueSatoshis ?? item?.value
}

function addressOf(output) {
  return String(output?.address ?? output?.cashAddress ?? output?.addressString ?? '').toLowerCase()
}

/*
 * verifyFinalTransaction — the theft defense.
 *
 * The transaction is a normalized object:
 *   { version, locktime, inputs: [{ outpoint|txid/vout, sats, sequence }],
 *     outputs: [{ address, sats }], feeSats? }
 *
 * The player is the local peer:
 *   { key, address, input, amountSats, expectedOutputSats? }
 *
 * Checks:
 *   - one input per participant, all the same amount
 *   - one output per participant, all the same amount
 *   - the player's input is present
 *   - the player's output is present exactly once at the expected amount
 *   - the fee is the input minus output total and within the cap
 *   - no duplicate input outpoints or output addresses
 *   - nVersion 1, nLockTime 0, nSequence 0xfffffffe when supplied
 */
export function verifyFinalTransaction({ transaction, player, config = {} } = {}) {
  if (!transaction || !Array.isArray(transaction.inputs) || !Array.isArray(transaction.outputs)) {
    throw new Error('cashshuffle: verify needs normalized transaction inputs and outputs')
  }
  if (!player || !player.address || !player.input) {
    throw new Error('cashshuffle: verify needs the player address and input outpoint')
  }

  const poolSize = config.poolSize ?? transaction.inputs.length
  if (transaction.inputs.length !== poolSize) {
    throw new Error(`cashshuffle: expected ${poolSize} inputs, got ${transaction.inputs.length}`)
  }
  if (transaction.outputs.length !== poolSize) {
    throw new Error(`cashshuffle: expected ${poolSize} outputs, got ${transaction.outputs.length}`)
  }

  const amount = toBigInt(player.amountSats, 'player.amountSats')
  const inputOutpoints = transaction.inputs.map(outpointOf)
  if (inputOutpoints.some((outpoint) => outpoint === null)) {
    throw new Error('cashshuffle: every input needs an outpoint')
  }
  if (new Set(inputOutpoints).size !== inputOutpoints.length) {
    throw new Error('cashshuffle: duplicate input outpoint')
  }
  if (!inputOutpoints.includes(String(player.input))) {
    throw new Error('cashshuffle: the player input is not in the transaction')
  }

  for (const input of transaction.inputs) {
    const sats = toBigInt(satsOf(input), 'input sats')
    if (sats !== amount) throw new Error('cashshuffle: inputs are not equal-amount')
    if (input.sequence !== undefined && Number(input.sequence) !== 0xfffffffe) {
      throw new Error('cashshuffle: input sequence must be 0xfffffffe')
    }
  }

  const outputSats = transaction.outputs.map((output) => toBigInt(satsOf(output), 'output sats'))
  if (new Set(outputSats.map((value) => value.toString())).size !== 1) {
    throw new Error('cashshuffle: outputs are not equal-amount')
  }

  const addresses = transaction.outputs.map(addressOf)
  if (addresses.some((address) => !address)) throw new Error('cashshuffle: every output needs an address')
  if (new Set(addresses).size !== addresses.length) {
    throw new Error('cashshuffle: duplicate output address')
  }

  const playerAddress = addressOf(player)
  const playerOutputs = addresses.filter((address) => address === playerAddress)
  if (playerOutputs.length !== 1) {
    throw new Error('cashshuffle: the player output is missing or duplicated')
  }

  const totalIn = transaction.inputs.reduce((sum, input) => sum + toBigInt(satsOf(input), 'input sats'), 0n)
  const totalOut = outputSats.reduce((sum, value) => sum + value, 0n)
  const fee = totalIn - totalOut
  if (fee < 0n) throw new Error('cashshuffle: outputs exceed inputs')
  if (transaction.feeSats !== undefined) {
    const declared = toBigInt(transaction.feeSats, 'transaction.feeSats')
    if (declared !== fee) throw new Error('cashshuffle: declared fee does not match the transaction')
  }
  if (config.maxFeeSats !== undefined && fee > toBigInt(config.maxFeeSats, 'config.maxFeeSats')) {
    throw new Error('cashshuffle: fee exceeds the cap')
  }

  const expected = player.expectedOutputSats !== undefined
    ? toBigInt(player.expectedOutputSats, 'player.expectedOutputSats')
    : amount - fee / BigInt(poolSize)
  if (player.expectedOutputSats === undefined && fee % BigInt(poolSize) !== 0n) {
    throw new Error('cashshuffle: fee is not divisible across the pool')
  }
  const playerOutputIndex = addresses.indexOf(playerAddress)
  if (outputSats[playerOutputIndex] !== expected) {
    throw new Error('cashshuffle: the player output amount is wrong')
  }

  if (transaction.version !== undefined && Number(transaction.version) !== 1) {
    throw new Error('cashshuffle: nVersion must be 1')
  }
  if (transaction.locktime !== undefined && Number(transaction.locktime) !== 0) {
    throw new Error('cashshuffle: nLockTime must be 0')
  }

  return { feeSats: fee, outputSats: outputSats[playerOutputIndex] }
}

export class CashShuffleRound {
  constructor({ config, transport, wallet, metrics, now = () => Date.now(), roundId } = {}) {
    if (!config) throw new Error('cashshuffle: config is required')
    this.config = config
    this.transport = transport
    this.wallet = wallet
    this.metrics = metrics
    this.now = now
    this.roundId = roundId || `round-${now()}`
    this.phase = 'REGISTER'
    this.players = new Map()
    this.blames = new Map()
    this.verified = new Set()
    this.signatures = new Map()
    this.onions = new Map()
    this.finalTransaction = null
    this.coordinator = null
    this.aborted = false
    this.txid = null
    this.log = []
  }

  get poolSize() {
    return this.config.poolSize ?? 5
  }

  register({ key, amount, version = 1, address, input } = {}) {
    this.#requirePhase('REGISTER', 'POOL')
    if (!key) throw new Error('cashshuffle: player key is required')
    const normalized = String(key).toLowerCase()
    if (this.players.has(normalized)) return this
    if (this.players.size >= this.poolSize) throw new Error('cashshuffle: the pool is full')
    this.players.set(normalized, {
      key: normalized,
      amount: toBigInt(amount ?? 0, 'amount'),
      version,
      address,
      input,
    })
    if (this.phase === 'REGISTER') this.phase = 'POOL'
    if (this.players.size === this.poolSize) {
      this.coordinator = [...this.players.keys()].sort()[0]
      this.phase = 'ANNOUNCEMENT'
      this.#log('pool-full', { coordinator: this.coordinator })
    }
    this.#log('register', { key: normalized })
    return this
  }

  announce({ from } = {}) {
    this.#requireCoordinator(from)
    this.#requirePhase('ANNOUNCEMENT')
    this.phase = 'SHUFFLE'
    this.#log('announcement', { from: String(from).toLowerCase() })
    return this
  }

  shuffle({ from, onion } = {}) {
    this.#requirePhase('SHUFFLE')
    this.#requirePlayer(from)
    if (!onion) throw new Error('cashshuffle: a shuffle packet needs an onion')
    this.onions.set(String(from).toLowerCase(), onion)
    this.#log('shuffle', { from: String(from).toLowerCase() })
    return this
  }

  setFinalTransaction({ from, transaction } = {}) {
    this.#requireCoordinator(from)
    this.#requirePhase('SHUFFLE')
    if (!transaction) throw new Error('cashshuffle: the final transaction is required')
    this.finalTransaction = transaction
    this.phase = 'VERIFY'
    this.#log('final-transaction', { from: String(from).toLowerCase() })
    return this
  }

  verify({ from } = {}) {
    this.#requirePhase('VERIFY')
    const player = this.#requirePlayer(from)
    const result = verifyFinalTransaction({
      transaction: this.finalTransaction,
      player: { ...player, amountSats: player.amount },
      config: this.config,
    })
    this.verified.add(player.key)
    this.#log('verified', { key: player.key, feeSats: result.feeSats.toString() })
    if (this.verified.size === this.players.size) {
      this.phase = 'SIGNING'
      this.#log('phase', { phase: this.phase })
    }
    return result
  }

  sign({ from, signature } = {}) {
    this.#requirePhase('SIGNING')
    const player = this.#requirePlayer(from)
    if (!this.verified.has(player.key)) throw new Error('cashshuffle: verify before signing')
    if (!signature) throw new Error('cashshuffle: a signing packet needs a signature')
    this.signatures.set(player.key, signature)
    this.#log('signing', { key: player.key })
    if (this.signatures.size === this.players.size) {
      this.phase = 'BROADCAST'
      this.#log('phase', { phase: this.phase })
    }
    return this
  }

  broadcast({ from, txid } = {}) {
    this.#requireCoordinator(from)
    this.#requirePhase('BROADCAST')
    if (!txid) throw new Error('cashshuffle: a broadcast needs a txid')
    this.txid = String(txid)
    this.#log('broadcast', { txid: this.txid })
    return this
  }

  blame({ from, accused, reason } = {}) {
    if (this.aborted) throw new Error('cashshuffle: round aborted')
    const fromKey = String(from ?? '').toLowerCase()
    const accusedKey = String(accused ?? '').toLowerCase()
    if (!this.players.has(fromKey)) throw new Error('cashshuffle: the blamer is not in the pool')
    if (!this.players.has(accusedKey)) throw new Error('cashshuffle: the accused is not in the pool')
    if (fromKey === accusedKey) throw new Error('cashshuffle: a player cannot blame itself')
    const tally = this.blames.get(accusedKey) || new Set()
    tally.add(fromKey)
    this.blames.set(accusedKey, tally)
    this.#log('blame', { from: fromKey, accused: accusedKey, reason: reason || null })
    if (tally.size >= Math.max(1, this.poolSize - 1)) {
      this.aborted = true
      this.phase = 'BLAME'
      this.#log('abort', { accused: accusedKey, tally: tally.size })
    }
    return this
  }

  handleMessage(packet = {}) {
    const from = packet.from
    const payload = packet.payload || {}
    switch (packet.type) {
      case 'REGISTER':
        return this.register({ key: from, ...payload })
      case 'ANNOUNCEMENT':
        return this.announce({ from })
      case 'SHUFFLE':
        return this.shuffle({ from, onion: payload.onion })
      case 'FINAL_TX':
        return this.setFinalTransaction({ from, transaction: payload.transaction })
      case 'VERIFY':
        return this.verify({ from })
      case 'SIGNING':
        return this.sign({ from, signature: payload.signature })
      case 'BROADCAST':
        return this.broadcast({ from, txid: payload.txid })
      case 'BLAME':
        return this.blame({ from, accused: payload.accused, reason: payload.reason })
      default:
        throw new Error(`cashshuffle: unknown packet type ${packet.type}`)
    }
  }

  snapshot() {
    return {
      roundId: this.roundId,
      phase: this.phase,
      coordinator: this.coordinator,
      poolSize: this.poolSize,
      players: [...this.players.values()].map((player) => ({
        key: player.key,
        amount: player.amount.toString(),
        address: player.address ?? null,
        input: player.input ?? null,
        verified: this.verified.has(player.key),
        signed: this.signatures.has(player.key),
      })),
      blames: Object.fromEntries([...this.blames.entries()].map(([key, set]) => [key, [...set]])),
      aborted: this.aborted,
      txid: this.txid,
      log: this.log.slice(),
    }
  }

  async run() {
    throw new Error('CashShuffleRound.run: the transport loop is not implemented — drive handleMessage()')
  }

  #requirePhase(...phases) {
    if (this.aborted) throw new Error('cashshuffle: round aborted')
    if (!phases.includes(this.phase)) {
      throw new Error(`cashshuffle: expected ${phases.join(' or ')}, got ${this.phase}`)
    }
  }

  #requireCoordinator(from) {
    const key = String(from ?? '').toLowerCase()
    if (!this.coordinator) throw new Error('cashshuffle: no coordinator yet')
    if (key !== this.coordinator) throw new Error('cashshuffle: only the coordinator can do that')
  }

  #requirePlayer(from) {
    const key = String(from ?? '').toLowerCase()
    const player = this.players.get(key)
    if (!player) throw new Error('cashshuffle: the player is not in the pool')
    return player
  }

  #log(type, detail = {}) {
    this.log.push({ type, at: this.now(), ...detail })
  }
}
