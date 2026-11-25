// daemons/cashshuffle/src/wallet.js
//
// BCH wallet for the CashShuffle daemon. ORCHESTRATION SKELETON.
// BCH Schnorr (SIGHASH_ALL|FORKID, 0x41), NOT Nostr BIP-340.
// See ../../shared/src/bch/README.md and ../PLAN.md (CS-6).

export class Wallet {
  constructor({ config, electrum, metrics } = {}) {
    this.config = config
    this.electrum = electrum
    this.metrics = metrics
  }

  async balance() {
    throw new Error('Wallet.balance: not implemented — CS-6')
  }

  async selectEqualInput({ amountSats, feeRate }) {
    throw new Error('Wallet.selectEqualInput: not implemented — CS-6')
  }

  async signP2pkhTransaction({ transaction, sourceOutputs, privateKey }) {
    throw new Error('Wallet.signP2pkhTransaction: not implemented — CS-6')
  }

  async broadcast(hex) {
    throw new Error('Wallet.broadcast: not implemented — CS-6')
  }
}
