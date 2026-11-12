# Hush Your Money

![Hush Your Money — a UTXO privacy toolkit. Spend Privately. Fearlessly!](poster.jpg)

### https://hushyourmoney.com

**Spend Privately. Fearlessly!**

A free, open-source, non-custodial **UTXO privacy toolkit**.
Break the link between your coins and your identity with the battle-tested
**CashShuffle** and **CashFusion** CoinJoin protocols — right from your browser.
No accounts. No custodians. No permission.

## Alternative URLs

- https://hushyourmoney.app.runonflux.io
- https://shuffle.cash _(redirect)_
- https://blender.cash _(redirect)_
- ipfs://XXX

## What is it?

Hush Your Money is a non-custodial web wallet with one purpose: making private
payments practical on UTXO-based blockchains. Every key is generated and stored
on your device, and every transaction is signed locally. Our servers never see
your private keys — they simply relay public blockchain data.

- **CashShuffle** — equal-amount CoinJoin rounds; an observer cannot tell which output belongs to whom.
- **CashFusion** — arbitrary-amount CoinJoin; many small coins fused into fewer, larger ones.
- **Zero-knowledge research** — open research into shielded pools: a next-generation privacy layer for UTXO-based tokens, developed and proven on public test networks.

## The Stack

- [Nuxt 3](https://nuxt.com) + Pinia + Tailwind CSS, installable as a PWA
- CashShuffle / CashFusion CoinJoin protocols
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

The full hackathon story — including the [LBRY presentation](https://lbry.tv/@BCHPlease:1/BCHDevCon3-Hush-Your-Money-Presentation:7),
the [activity journal](https://github.com/BCHDEVCON3/hush-your-money/blob/master/JOURNAL.md)
and the [causes.cash fundraiser](https://causes.cash/@bchplease/hush-your-money-7a1589216c59) —
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

Optional runtime override: `NUXT_PUBLIC_PSF_API_URL` (blockchain REST API base).

## License

MIT
