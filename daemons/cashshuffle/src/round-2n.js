// daemons/cashshuffle/src/round-2n.js
//
// Pool-native CashShuffle 2N round state machine.
//
// The classic CashShuffleRound in round.js is the 1-in/1-out protocol. This
// class uses the same phases and transport, but the final transaction is the
// role-2 2N lock built by role2-round.js: 2N tagged fuel UTXOs, two blanks per
// action, and a per-participant fee share.
//
// The network loop is still not implemented. The transport delivers packets to
// handleMessage(); the daemon main loop remains pending.

import {
  PHASES,
  TERMINAL_PHASES,
  nextPhase,
} from './round.js'
import {
  applyRole2Signatures,
  assembleRole2Round,
  buildRole2Round,
  verifyRole2Round,
} from './role2-round.js'
import {
  ROLE2_FUEL_SATS,
  parseCarrier,
  tagForCarrier,
} from './pool.js'

function toBigInt(value, name = 'value') {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number' && Number.isSafeInteger(value)) return BigInt(value)
  if (typeof value === 'string' && /^\d+$/.test(value)) return BigInt(value)
  throw new Error(`cashshuffle-2n: ${name} must be a non-negative integer`)
}

function bytesOf(value, name, length = null) {
  if (value instanceof Uint8Array) {
    if (length !== null && value.length !== length) throw new Error(`cashshuffle-2n: ${name} must be ${length} bytes`)
    return value
  }
  if (typeof value === 'string') {
    const hex = value.startsWith('0x') ? value.slice(2) : value
    if (!/^[0-9a-f]*$/i.test(hex) || hex.length % 2 !== 0) throw new Error(`cashshuffle-2n: ${name} must be bytes or hex`)
    const bytes = Uint8Array.from(Buffer.from(hex, 'hex'))
    if (length !== null && bytes.length !== length) throw new Error(`cashshuffle-2n: ${name} must be ${length} bytes`)
    return bytes
  }
  throw new Error(`cashshuffle-2n: ${name} must be bytes or hex`)
}

function hexOf(value, name) {
  return Buffer.from(bytesOf(value, name)).toString('hex')
}

function txidOf(utxo, name = 'utxo') {
  const txid = utxo?.txid ?? utxo?.tx_hash
  if (typeof txid !== 'string' || !/^[0-9a-f]{64}$/i.test(txid)) throw new Error(`cashshuffle-2n: ${name} needs a 32-byte txid`)
  return txid.toLowerCase()
}

function voutOf(utxo, name = 'utxo') {
  const vout = utxo?.vout ?? utxo?.tx_pos
  if (!Number.isInteger(Number(vout)) || Number(vout) < 0) throw new Error(`cashshuffle-2n: ${name} needs a vout`)
  return Number(vout)
}

function outpointOf(utxo, name = 'utxo') {
  return `${txidOf(utxo, name)}:${voutOf(utxo, name)}`
}

function tokenOf(utxo) {
  return utxo?.token || utxo?.token_data || null
}

export class CashShuffle2NRound {
  constructor({ config, transport, now = () => Date.now(), roundId } = {}) {
    if (!config) throw new Error('cashshuffle-2n: config is required')
    this.config = config
    this.transport = transport
    this.now = now
    this.roundId = roundId || `round-2n-${now()}`
    this.phase = 'REGISTER'
    this.players = new Map()
    this.blames = new Map()
    this.verified = new Set()
    this.signatures = new Map()
    this.onions = new Map()
    this.finalRound = null
    this.assembled = null
    this.coordinator = null
    this.aborted = false
    this.txid = null
    this.log = []
  }

  get poolSize() {
    return this.config.poolSize ?? 5
  }

  register({ key, fundingUtxos, blanks, tag, carrier = null, supplyUtxo = null, changeAddress } = {}) {
    this.#requirePhase('REGISTER', 'POOL')
    if (!key) throw new Error('cashshuffle-2n: player key is required')
    const normalized = String(key).toLowerCase()
    if (this.players.has(normalized)) return this
    if (this.players.size >= this.poolSize) throw new Error('cashshuffle-2n: the pool is full')
    if (!Array.isArray(fundingUtxos) || fundingUtxos.length !== 2) {
      throw new Error('cashshuffle-2n: each player needs exactly TWO funding UTXOs')
    }
    if (!Array.isArray(blanks) || blanks.length !== 2) {
      throw new Error('cashshuffle-2n: each player needs exactly TWO blanks')
    }
    if (!changeAddress) throw new Error('cashshuffle-2n: each player needs a change address')
    const tagBytes = bytesOf(tag, 'tag', 32)
    const carrierBytes = carrier ? bytesOf(carrier, 'carrier', 169) : null
    if (carrierBytes && hexOf(tagForCarrier(carrierBytes), 'tag') !== hexOf(tagBytes, 'tag')) {
      throw new Error('cashshuffle-2n: the tag does not match the carrier')
    }
    const parsed = carrierBytes ? parseCarrier(carrierBytes) : { pv: 0n, sign: 0 }
    const tagHex = hexOf(tagBytes, 'tag')
    if ([...this.players.values()].some((player) => player.tagHex === tagHex)) {
      throw new Error(`cashshuffle-2n: duplicate tag ${tagHex}`)
    }
    if ([...this.players.values()].some((player) => String(player.changeAddress).toLowerCase() === String(changeAddress).toLowerCase())) {
      throw new Error(`cashshuffle-2n: duplicate change address ${changeAddress}`)
    }
    const outpoints = [
      ...fundingUtxos.map((utxo, n) => outpointOf(utxo, `funding ${n}`)),
      ...blanks.map((utxo, n) => outpointOf(utxo, `blank ${n}`)),
      ...(supplyUtxo ? [outpointOf(supplyUtxo, 'supply')] : []),
    ]
    if (new Set(outpoints).size !== outpoints.length) throw new Error('cashshuffle-2n: duplicate player outpoint')
    for (const other of this.players.values()) {
      for (const outpoint of outpoints) {
        if (other.outpoints.includes(outpoint)) throw new Error(`cashshuffle-2n: duplicate outpoint ${outpoint}`)
      }
    }
    const supplyToken = supplyUtxo ? tokenOf(supplyUtxo) : null
    if (parsed.sign === 0 && parsed.pv > 0n && !supplyToken) {
      throw new Error('cashshuffle-2n: a SHIELD needs an FT supply UTXO')
    }
    if (parsed.sign === 1 && supplyUtxo) {
      throw new Error('cashshuffle-2n: an UNSHIELD must not carry an FT supply')
    }
    this.players.set(normalized, {
      key: normalized,
      fundingUtxos,
      blanks,
      tag: tagBytes,
      tagHex,
      carrier: carrierBytes,
      supplyUtxo,
      supplyAmount: supplyToken ? toBigInt(supplyToken.amount ?? 0, 'supply amount') : 0n,
      changeAddress,
      pv: parsed.pv,
      sign: parsed.sign,
      outpoints,
    })
    if (this.phase === 'REGISTER') this.phase = 'POOL'
    if (this.players.size === this.poolSize) {
      this.coordinator = [...this.players.keys()].sort()[0]
      this.phase = 'ANNOUNCEMENT'
      this.#log('pool-full', { coordinator: this.coordinator })
    }
    this.#log('register', { key: normalized, tag: tagHex })
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
    if (!onion) throw new Error('cashshuffle-2n: a shuffle packet needs an onion')
    this.onions.set(String(from).toLowerCase(), onion)
    this.#log('shuffle', { from: String(from).toLowerCase() })
    return this
  }

  /*
   * buildFinalRound — the coordinator builds the 2N transaction from the
   * registered players. The result is the unsigned round; the peers VERIFY it
   * and sign their own inputs.
   */
  async buildFinalRound({ pool = this.config.pool, feeRate, maxFeeSats, fuelSats } = {}) {
    this.#requirePhase('SHUFFLE')
    if (!pool) throw new Error('cashshuffle-2n: a pool descriptor is required')
    const participants = [...this.players.values()].map((player) => ({
      key: player.key,
      fundingUtxos: player.fundingUtxos,
      blanks: player.blanks,
      tag: player.tag,
      carrier: player.carrier,
      supplyUtxo: player.supplyUtxo,
      changeAddress: player.changeAddress,
    }))
    const round = await buildRole2Round({
      pool,
      participants,
      feeRate,
      maxFeeSats: maxFeeSats ?? this.config.maxFeeSats,
      fuelSats: fuelSats ?? this.config.fuelSats ?? ROLE2_FUEL_SATS,
    })
    this.finalRound = round
    this.phase = 'VERIFY'
    this.#log('final-round', { fee: round.fee.toString(), participants: participants.length })
    return round
  }

  setFinalTransaction({ from, round } = {}) {
    this.#requireCoordinator(from)
    this.#requirePhase('SHUFFLE')
    if (!round?.transaction) throw new Error('cashshuffle-2n: the final round is required')
    this.finalRound = round
    this.phase = 'VERIFY'
    this.#log('final-transaction', { from: String(from).toLowerCase() })
    return this
  }

  async verify({ from } = {}) {
    this.#requirePhase('VERIFY')
    const player = this.#requirePlayer(from)
    if (!this.finalRound) throw new Error('cashshuffle-2n: no final round to verify')
    const config = {
      poolSize: this.poolSize,
      programLocking: this.config.programLocking ?? this.config.pool?.programLocking ?? this.config.pool?.program?.lockingBytecode,
      poolCategory: this.config.poolCategory ?? this.config.pool?.poolCategory ?? this.config.pool?.assetCategory,
      fuelSats: this.config.fuelSats ?? ROLE2_FUEL_SATS,
      maxFeeSats: this.config.maxFeeSats,
    }
    const result = await verifyRole2Round({
      transaction: this.finalRound.transaction,
      sources: this.finalRound.sources,
      player: {
        key: player.key,
        tag: player.tag,
        fundingOutpoints: player.fundingUtxos.map((utxo, n) => outpointOf(utxo, `funding ${n}`)),
        blankOutpoints: player.blanks.map((utxo, n) => outpointOf(utxo, `blank ${n}`)),
        supplyOutpoint: player.supplyUtxo ? outpointOf(player.supplyUtxo, 'supply') : null,
        supplyAmount: player.supplyAmount,
        pv: player.pv,
        sign: player.sign,
        changeAddress: player.changeAddress,
      },
      config,
    })
    this.verified.add(player.key)
    this.#log('verified', { key: player.key, feeSats: result.feeSats.toString(), changeSats: result.changeSats.toString() })
    if (this.verified.size === this.players.size) {
      this.phase = 'SIGNING'
      this.#log('phase', { phase: this.phase })
    }
    return result
  }

  sign({ from, signatures } = {}) {
    this.#requirePhase('SIGNING')
    const player = this.#requirePlayer(from)
    if (!this.verified.has(player.key)) throw new Error('cashshuffle-2n: verify before signing')
    if (!Array.isArray(signatures) || signatures.length === 0) throw new Error('cashshuffle-2n: a signing packet needs signatures')
    const own = [
      ...this.finalRound.inputsByPlayer.find((item) => item.key === player.key).funding,
      ...this.finalRound.inputsByPlayer.find((item) => item.key === player.key).blanks,
      ...(this.finalRound.inputsByPlayer.find((item) => item.key === player.key).supply === null ? [] : [this.finalRound.inputsByPlayer.find((item) => item.key === player.key).supply]),
    ]
    const seen = new Set()
    for (const packet of signatures) {
      const index = packet?.inputIndex
      if (!Number.isInteger(index) || !own.includes(index)) {
        throw new Error(`cashshuffle-2n: player ${player.key} signed an input it does not own: ${index}`)
      }
      if (seen.has(index)) throw new Error(`cashshuffle-2n: duplicate signature for input ${index}`)
      seen.add(index)
    }
    for (const index of own) {
      if (!seen.has(index)) throw new Error(`cashshuffle-2n: player ${player.key} did not sign input ${index}`)
    }
    this.signatures.set(player.key, signatures)
    this.#log('signing', { key: player.key, inputs: signatures.length })
    if (this.signatures.size === this.players.size) {
      this.#assemble()
    }
    return this
  }

  #assemble() {
    if (!this.finalRound) throw new Error('cashshuffle-2n: no final round to assemble')
    const packets = [...this.signatures.values()].flat()
    applyRole2Signatures({ transaction: this.finalRound.transaction, signatures: packets })
    this.assembled = null
    this.phase = 'BROADCAST'
    this.#log('assembled', { signatures: packets.length })
    return this
  }

  async assemble() {
    this.#requirePhase('BROADCAST')
    if (!this.assembled) {
      this.assembled = await assembleRole2Round({ transaction: this.finalRound.transaction })
    }
    return this.assembled
  }

  async broadcast({ from, txid } = {}) {
    this.#requireCoordinator(from)
    this.#requirePhase('BROADCAST')
    if (!txid) {
      if (!this.assembled) throw new Error('cashshuffle-2n: assemble before broadcast')
      txid = this.assembled.txid
    }
    this.txid = String(txid)
    this.#log('broadcast', { txid: this.txid })
    return this
  }

  blame({ from, accused, reason } = {}) {
    if (this.aborted) throw new Error('cashshuffle-2n: round aborted')
    const fromKey = String(from ?? '').toLowerCase()
    const accusedKey = String(accused ?? '').toLowerCase()
    if (!this.players.has(fromKey)) throw new Error('cashshuffle-2n: the blamer is not in the pool')
    if (!this.players.has(accusedKey)) throw new Error('cashshuffle-2n: the accused is not in the pool')
    if (fromKey === accusedKey) throw new Error('cashshuffle-2n: a player cannot blame itself')
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
        return this.setFinalTransaction({ from, round: payload.round })
      case 'VERIFY':
        return this.verify({ from })
      case 'SIGNING':
        return this.sign({ from, signatures: payload.signatures })
      case 'BROADCAST':
        return this.broadcast({ from, txid: payload.txid })
      case 'BLAME':
        return this.blame({ from, accused: payload.accused, reason: payload.reason })
      default:
        throw new Error(`cashshuffle-2n: unknown packet type ${packet.type}`)
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
        tag: player.tagHex,
        pv: player.pv.toString(),
        sign: player.sign,
        changeAddress: player.changeAddress,
        verified: this.verified.has(player.key),
        signed: this.signatures.has(player.key),
      })),
      fee: this.finalRound?.fee?.toString() ?? null,
      feeShare: this.finalRound?.feeShare?.toString() ?? null,
      fuelVouts: this.finalRound?.fuelVouts ?? [],
      blames: Object.fromEntries([...this.blames.entries()].map(([key, set]) => [key, [...set]])),
      aborted: this.aborted,
      txid: this.txid,
      log: this.log.slice(),
    }
  }

  async run() {
    throw new Error('CashShuffle2NRound.run: the transport loop is not implemented — drive handleMessage()')
  }

  #requirePhase(...phases) {
    if (this.aborted) throw new Error('cashshuffle-2n: round aborted')
    if (!phases.includes(this.phase)) {
      throw new Error(`cashshuffle-2n: expected ${phases.join(' or ')}, got ${this.phase}`)
    }
  }

  #requireCoordinator(from) {
    const key = String(from ?? '').toLowerCase()
    if (!this.coordinator) throw new Error('cashshuffle-2n: no coordinator yet')
    if (key !== this.coordinator) throw new Error('cashshuffle-2n: only the coordinator can do that')
  }

  #requirePlayer(from) {
    const key = String(from ?? '').toLowerCase()
    const player = this.players.get(key)
    if (!player) throw new Error('cashshuffle-2n: the player is not in the pool')
    return player
  }

  #log(type, detail = {}) {
    this.log.push({ type, at: this.now(), ...detail })
  }
}

export { PHASES, TERMINAL_PHASES, nextPhase }
