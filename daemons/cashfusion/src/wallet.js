// daemons/cashfusion/src/wallet.js
//
// BCH wallet for the CashFusion daemon. ORCHESTRATION SKELETON.
// BCH Schnorr (SIGHASH_ALL|FORKID, 0x41), NOT Nostr BIP-340.
// See ../../shared/src/bch/README.md and ../PLAN.md (CF-4).

export class Wallet {
  constructor({ config, electrum, metrics } = {}) {
    this.config = config
    this.electrum = electrum
    this.metrics = metrics
  }

  async balance() {
    throw new Error('Wallet.balance: not implemented — CF-4')
  }

  async selectInputs({ amountSats, feeRate }) {
    throw new Error('Wallet.selectInputs: not implemented — CF-4')
  }

  async signP2pkhTransaction({ transaction, sourceOutputs, privateKey }) {
    throw new Error('Wallet.signP2pkhTransaction: not implemented — CF-4')
  }

  async broadcast(hex) {
    throw new Error('Wallet.broadcast: not implemented — CF-4')
  }
}
