# Hush Your Money

![Hush Your Money — a UTXO privacy toolkit. Spend Privately. Fearlessly!](poster.jpg)

### https://hushyourmoney.com

**Spend Privately. Fearlessly!**

A free, open-source **UTXO privacy research program** — and the technical
reference site for private payments on UTXO-based blockchains. The research is
built in the open, deployed on public networks, and documented for academics
and third-party reviewers: every claim carries its source, every measured
quantity is marked, and anything unmeasured is marked UNMEASURED.
No accounts. No custodians. No permission.

## Alternative URLs

- https://hushyourmoney.app.runonflux.io
- ipfs://XXX _(planned)_

## What is it?

- **The shielded pool** — our zero-knowledge pool for UTXO-based tokens: a
  BN254 Groth16 verifier with the pool rules inside one on-chain program,
  signature-free actions, a nullifier set enforced at consensus, and
  permissionless blank acquisition through on-chain vending machines.
  The permanent pool is **live on Bitcoin Cash mainnet** and has run its
  complete lifecycle with **real PUSD** (the CashToken USD stablecoin):
  deposit → transfer → public unshield, all confirmed on chain.
  The full record — architecture, measurements, every transaction — is at
  [`/research/shielded-pool`](https://hushyourmoney.com/research/shielded-pool);
  the protocol repo is
  [`pusd-shielded-pool`](https://github.com/APECSdev/pusd-shielded-pool), and
  the proving assets are published as the
  [`role2-proving-assets-v3-v1`](https://github.com/APECSdev/pusd-shielded-pool/releases/tag/role2-proving-assets-v3-v1)
  release.
- **The CoinJoin lineage** — the protocol surveys and our own experiments:
  [CashFusion](https://hushyourmoney.com/research/cashfusion) and
  [CoinJoin](https://hushyourmoney.com/research/coinjoin) references, P2P
  fusion over Nostr, and the [pool-native round
  daemons](https://hushyourmoney.com/daemons) (CashShuffle-style rounds
  composed with the pool's fee flow — implemented and tested, not yet
  running).
- **The comparison reference** — [the big privacy-money
  table](https://hushyourmoney.com/compare): Bitcoin Cash, Zcash, Monero and
  the rest, measured and cited side by side — costs, confirmation times,
  underlying privacy protocols, and stablecoin access.
- **The playground** — [live experiments](https://hushyourmoney.com/playground),
  including the CashFusion-over-Nostr round simulation and the opt-in relay
  probe.

**The announcement**: [Hush Your Money — introducing shielded stablecoin
payments for Bitcoin](https://bitcoincashresearch.org/t/hush-your-money-introducing-shielded-stablecoin-payments-for-bitcoin/2666)
(bitcoincashresearch.org).

## The Stack

- [Nuxt 3](https://nuxt.com) + Pinia + Tailwind CSS
- Electrum client proxy (`/api/electrum`) for chain data
- Hosted on [Flux](https://cloud.runonflux.io), a community-run decentralized cloud

## Origin Story — BCHDevCon3 Hackathon Winner (September 2020)

Hush Your Money was born at **BCHDevCon3**, the Bitcoin Cash developer
hackathon, where the original entry took **1st place**. The original repository
is preserved at [`BCHDEVCON3/hush-your-money`](https://github.com/BCHDEVCON3/hush-your-money)
— a web-based solution for CashShuffle (and a path to CashFusion) integration
into the Bitcoin.com mobile wallet, built on the wallet's 3rd-party app API,
[Bitcoin.com Link](https://developer.bitcoin.com/bitcoincom-link/docs/getting-started/).

**The three event goals:**

1. Establish a Bitcoin.com "working" relationship — direct access toward a CashFusion mobile integration.
2. Add a CashShuffle DApp to the wallet's **Discover** tab — in-app privacy with native-integration confidence.
3. Build a **privacy analyzer** — paste an address or txid, get a Privacy Score with a full breakdown (inspired by Blockchair's Privacy-o-meter).

**Stretch goal:** extend the Link API with `getAccount` (xPub) to enable
automated shuffle verification and wallet-wide privacy analysis.

The full hackathon story — including the [LBRY presentation](https://lbry.tv/@BCHPlease:1/BCHDevCon3-Hush-Your-Money-Presentation:7)
and the [activity journal](https://github.com/BCHDEVCON3/hush-your-money/blob/master/JOURNAL.md) —
is preserved in the original repo. The in-app README page ([/readme](https://hushyourmoney.com/readme))
carries the full project documentation.

## Development

```sh
cd web
yarn install
yarn dev
```

## Deployment

The app ships as a Docker image and runs on Flux:

```sh
cd web
docker build -t nyusternie/hushyourmoney:latest .
docker run -p 3000:3000 nyusternie/hushyourmoney:latest
```

If the build fails with `EAI_AGAIN registry.yarnpkg.com` (container DNS),
re-run with `docker build --network=host`.

Optional runtime override: `NUXT_PUBLIC_PSF_API_URL` (blockchain REST API base).

## License

MIT
