// daemons/cashshuffle/src/wallet.js
//
// BCH wallet for the CashShuffle daemon: equal-amount input selection, funding
// selection, caps, and injected signing/broadcast. The BCH Schnorr signer and
// the Electrum broadcaster are injected so the selection logic is testable
// without a chain connection.
//
// BCH Schnorr (SIGHASH_ALL|FORKID, 0x41), NOT Nostr BIP-340. The signer is the
// M3 BCH module; the Nostr signer is never used here.

function toBigInt(value, name) {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number' && Number.isSafeInteger(value)) return BigInt(value)
  if (typeof value === 'string' && /^\d+$/.test(value)) return BigInt(value)
  throw new Error(`wallet: ${name} must be a non-negative integer`)
}

function normalizeUtxo(utxo) {
  if (!utxo) throw new Error('wallet: a UTXO is required')
  const sats = toBigInt(utxo.sats ?? utxo.valueSatoshis ?? utxo.value, 'utxo sats')
  const txid = utxo.txid ?? utxo.outpointTransactionHash
  const vout = utxo.vout ?? utxo.outpointIndex
  const outpoint = utxo.outpoint ?? (txid !== undefined && vout !== undefined ? `${txid}:${vout}` : null)
  if (!outpoint) throw new Error('wallet: every UTXO needs an outpoint')
  const token = utxo.token ?? utxo.token_data ?? null
  return { ...utxo, sats, txid, vout, outpoint, token }
}

function isTokenless(utxo) {
  return !utxo.token?.category
}

export class Wallet {
  constructor({ config, electrum, metrics, signer, broadcaster } = {}) {
    this.config = config || {}
    this.electrum = electrum
    this.metrics = metrics
    this.signer = signer
    this.broadcaster = broadcaster
    this.utxos = []
  }

  setUtxos(utxos) {
    if (!Array.isArray(utxos)) throw new Error('wallet: utxos must be an array')
    this.utxos = utxos.map(normalizeUtxo)
    return this
  }

  addUtxo(utxo) {
    this.utxos.push(normalizeUtxo(utxo))
    return this
  }

  getUtxos() {
    return this.utxos.slice()
  }

  balanceSats() {
    return this.utxos
      .filter(isTokenless)
      .reduce((sum, utxo) => sum + utxo.sats, 0n)
  }

  selectEqualInput({ amountSats, exclude = [] } = {}) {
    const amount = toBigInt(amountSats, 'amountSats')
    const excluded = new Set(exclude)
    const matches = this.utxos
      .filter(isTokenless)
      .filter((utxo) => !excluded.has(utxo.outpoint))
      .filter((utxo) => utxo.sats === amount)
      .sort((a, b) => a.outpoint.localeCompare(b.outpoint))
    if (matches.length === 0) {
      throw new Error(`wallet: no tokenless UTXO with exactly ${amount} sats`)
    }
    return { utxo: matches[0], amountSats: amount }
  }

  selectFunding({ sats, exclude = [] } = {}) {
    const target = toBigInt(sats, 'sats')
    const excluded = new Set(exclude)
    const candidates = this.utxos
      .filter(isTokenless)
      .filter((utxo) => !excluded.has(utxo.outpoint))
      .sort((a, b) => (a.sats === b.sats ? a.outpoint.localeCompare(b.outpoint) : a.sats > b.sats ? -1 : 1))

    const selected = []
    let total = 0n
    for (const utxo of candidates) {
      selected.push(utxo)
      total += utxo.sats
      if (total >= target) {
        return { inputs: selected, totalSats: total, changeSats: total - target }
      }
    }
    throw new Error(`wallet: insufficient tokenless sats for ${target} (have ${total})`)
  }

  assertCap(sats) {
    const value = toBigInt(sats, 'sats')
    if (this.config.maxFloatSats !== undefined && value > toBigInt(this.config.maxFloatSats, 'maxFloatSats')) {
      throw new Error(`wallet: ${value} sats exceeds the float cap`)
    }
    return value
  }

  async signP2pkhTransaction({ transaction, sourceOutputs, inputs, outputs, privateKey, publicKey } = {}) {
    if (typeof this.signer === 'function') {
      return this.signer({ transaction, sourceOutputs, inputs, outputs, privateKey, publicKey })
    }
    if (!inputs || !outputs) {
      throw new Error('wallet: no BCH signer configured — M3 signing pending')
    }
    const { signP2pkhTransaction } = await import('../../shared/src/bch/p2pkh.js')
    return signP2pkhTransaction({ inputs, outputs, privateKey, publicKey })
  }

  async broadcast(hex) {
    if (typeof this.broadcaster === 'function') return this.broadcaster(hex)
    if (typeof this.electrum?.broadcast === 'function') return this.electrum.broadcast(hex)
    throw new Error('wallet: no broadcaster configured — M3 broadcast pending')
  }

  snapshot() {
    const tokenUtxos = this.utxos.filter((utxo) => !isTokenless(utxo)).length
    return {
      balanceSats: this.balanceSats().toString(),
      utxoCount: this.utxos.length,
      tokenUtxoCount: tokenUtxos,
      capSats: this.config.maxFloatSats !== undefined ? String(this.config.maxFloatSats) : null,
      maxRounds: this.config.maxRounds ?? null,
    }
  }
}
