<!-- web/pages/compare.vue — THE BIG TABLE: the privacy-money comparison, Bitcoin Cash first
     (BCH pinned as the star column; Zcash + Monero swappable for any other roster coin) -->

<script setup lang="ts">
/* Shared shell + styles come from layouts/research.vue (the modern dark shell). */
definePageMeta({
    layout: 'research',
})

/* OpenGraph + Twitter + canonical (shared composable; research-hub poster, playground precedent). */
useOg({
    title: `Compare — Hush Your Money`,
    description: `The Privacy Money Table: Bitcoin Cash vs Zcash, Monero, Zano, Firo, Dash and more — USD costs, confirmations, consensus, stablecoin access.`,
    path: '/compare',
    image: '/posters/research.jpg',
    type: 'website',
    imageAlt: `The Privacy Money Table — Bitcoin Cash first, every number sourced`,
})

/* Scroll-reveal (shared composable). */
useReveal()

/* ────────────────────────────────────────────────────────────────────
   DATA DISCIPLINE (repo verification contract):
   • every cell carries a chip — [measured] our own on-chain data or a
     captured live API reading · [cited] a linked official source ·
     [dynamic] moves with network load · [UNMEASURED] no verified
     figure exists — we refuse to estimate.
   • USD figures were computed from the reference prices captured at
     2026-11-27T12:44Z (Coinbase spot BCH $210.21 / ZEC $758.21 /
     DASH $36.84, Kraken XMR $440.00, CoinGecko ZANO $3.92 / FIRO
     $0.67 / GRIN $0.0115 / BEAM $0.0039 / SCRT $0.0024 / ZEN $3.82).
     Native-unit fees are the stable facts; prices move.
   • live fee medians/averages: Blockchair public API, captured
     2026-11-27T12:45Z.
   ──────────────────────────────────────────────────────────────────── */

/* Cell shape: big (headline), sub (the fine print), chip, src (optional).
   Deliberately untyped object literals — the real gate is the SFC compile + smoke. */
const ROSTER = {
    bch: {
        id: 'bch', name: 'Bitcoin Cash', ticker: 'BCH', since: '2017',
        color: 'text-emerald-300', ring: 'border-emerald-400/40 bg-emerald-400/[0.05]',
        hook: 'The glass chain we build privacy on — star of this table',
        site: { label: 'bitcoincash.org', href: 'https://www.bitcoincash.org/' },
        byDefault: { big: 'opt-in tools', sub: 'Base layer transparent; privacy is added by choice (CashFusion today, our ZK pool next).', chip: 'cited', src: [{ label: 'cashfusion.org', href: 'https://cashfusion.org/' }] },
        plain: {
            big: '≈ $0.0008',
            sub: '24h median fee 360 sats ≈ $0.0008; average $0.0039. Measured at the 1 sat/B BARE-fee floor our own runs confirm (1.03–1.07 sat/B).',
            chip: 'measured',
            src: [{ label: 'Blockchair BCH stats', href: 'https://api.blockchair.com/bitcoin-cash/stats' }, { label: 'our fee record', href: 'https://github.com/APECSdev/hushyourmoney/blob/master/docs/POOL-DEPLOYMENT.md' }],
        },
        shield: {
            big: '≈ $0.06',
            sub: '30,000 sats (0.0003 BCH) — our own SHIELD op, measured: ~28.1 KB action at the BARE 1.06 sat/B floor.',
            chip: 'measured',
            src: [{ label: 'our shielded pool', href: 'https://hushyourmoney.com/research/shielded-pool' }],
        },
        transfer: {
            big: '≈ $0.06',
            sub: 'Same shape, same fee: a shielded TRANSFER is one ~28 KB action — 30,000 sats measured.',
            chip: 'measured',
            src: [{ label: 'our shielded pool', href: 'https://hushyourmoney.com/research/shielded-pool' }],
        },
        unshield: {
            big: '≈ $0.06',
            sub: 'UNSHIELD pays out publicly and continues the shielded balance — same one-action fee, measured.',
            chip: 'measured',
            src: [{ label: 'our shielded pool', href: 'https://hushyourmoney.com/research/shielded-pool' }],
        },
        confirm: { big: '~10 min', sub: 'Target block time — the slowest row on this table.', chip: 'cited', src: [{ label: 'Wikipedia: BCH', href: 'https://en.wikipedia.org/wiki/Bitcoin_Cash' }] },
        consensus: { big: 'PoW · SHA-256', sub: 'Proof-of-work, same family as Bitcoin.', chip: 'cited', src: [{ label: 'Wikipedia: BCH', href: 'https://en.wikipedia.org/wiki/Bitcoin_Cash' }] },
        protocol: {
            big: 'CashFusion CoinJoin + our ZK pool',
            sub: 'Transparent base layer; opt-in CoinJoin privacy today (CashFusion); our Groth16 zero-knowledge shielded pool is live on testnet.',
            chip: 'measured',
            src: [{ label: 'CashFusion research', href: 'https://hushyourmoney.com/research/cashfusion' }, { label: 'shielded pool research', href: 'https://hushyourmoney.com/research/shielded-pool' }],
        },
        stablecoin: {
            big: '★ NATIVE — PUSD on-chain',
            sub: 'CashTokens (May 2023) let USD tokens live directly on the chain. Our own shielded pool runs PUSD — a USD CashToken whose mainnet category is live on BCH today (anchor probed 2026-11-27). Private USD payments, one chain.',
            chip: 'measured',
            src: [{ label: 'CashTokens', href: 'https://cashtokens.org/' }, { label: 'PUSD registry entry', href: 'https://github.com/APECSdev/hushyourmoney/blob/master/pool-registry.json' }],
        },
        watchout: { big: 'You must opt in', sub: 'Default BCH is fully transparent — privacy is an extra step you choose. 10-minute blocks are the slowest row here.', chip: 'cited' },
    },

    zcash: {
        id: 'zcash', name: 'Zcash', ticker: 'ZEC', since: '2016',
        color: 'text-yellow-300', ring: 'border-yellow-400/30 bg-yellow-400/[0.05]',
        hook: 'The choose-your-privacy zk chain (2016)',
        site: { label: 'z.cash', href: 'https://z.cash/' },
        byDefault: { big: 'optional', sub: 'Transparent addresses behave like Bitcoin; shielded addresses opt into zk privacy.', chip: 'cited', src: [{ label: 'Wikipedia: Zcash', href: 'https://en.wikipedia.org/wiki/Zcash' }] },
        plain: {
            big: '≈ $0.08',
            sub: 'Conventional minimal fee 10,000 zatoshi = 0.0001 ZEC (ZIP-317) — and the live 24h median matches it exactly. Average $0.035.',
            chip: 'measured',
            src: [{ label: 'ZIP-317', href: 'https://zips.z.cash/zip-0317' }, { label: 'Blockchair ZEC stats', href: 'https://api.blockchair.com/zcash/stats' }],
        },
        shield: { big: '≈ $0.08', sub: 'A shield (t→z) is one ordinary transaction — the conventional fee applies.', chip: 'cited', src: [{ label: 'ZIP-317', href: 'https://zips.z.cash/zip-0317' }] },
        transfer: { big: '≈ $0.08', sub: 'z→z transfer, same fee; each extra input/output adds ~5,000 zatoshi (≈ $0.04).', chip: 'cited', src: [{ label: 'ZIP-317', href: 'https://zips.z.cash/zip-0317' }] },
        unshield: { big: '≈ $0.08', sub: 'z→t unshield, same conventional fee.', chip: 'cited', src: [{ label: 'ZIP-317', href: 'https://zips.z.cash/zip-0317' }] },
        confirm: { big: '75 sec', sub: 'Target block time (post-Blossom) — the fastest pure-PoW row here.', chip: 'cited', src: [{ label: 'Wikipedia: Zcash', href: 'https://en.wikipedia.org/wiki/Zcash' }] },
        consensus: { big: 'PoW · Equihash', sub: 'Proof-of-work, Equihash.', chip: 'cited', src: [{ label: 'Wikipedia: Zcash', href: 'https://en.wikipedia.org/wiki/Zcash' }] },
        protocol: { big: 'zk-SNARKs', sub: 'Shielded pool (zero-knowledge proofs) beside a transparent pool; view keys allow chosen auditors.', chip: 'cited', src: [{ label: 'z.cash learn', href: 'https://z.cash/learn/' }, { label: 'protocol spec (PDF)', href: 'https://zips.z.cash/protocol/protocol.pdf' }] },
        stablecoin: { big: '✗ none native', sub: 'Single-asset protocol — ZEC only; a USD token would have to live on another chain.', chip: 'cited', src: [{ label: 'protocol spec (PDF)', href: 'https://zips.z.cash/protocol/protocol.pdf' }] },
        watchout: { big: 'Opting in is your job', sub: 'Transparent use is public, and a 2018 study found the shielded crowd\'s effective size can shrink through usage patterns.', chip: 'cited', src: [{ label: 'USENIX study', href: 'https://www.usenix.org/conference/usenixsecurity18/presentation/kappos' }] },
    },

    monero: {
        id: 'monero', name: 'Monero', ticker: 'XMR', since: '2014',
        color: 'text-orange-300', ring: 'border-orange-400/30 bg-orange-400/[0.05]',
        hook: 'Private by mandate since 2014',
        site: { label: 'getmonero.org', href: 'https://www.getmonero.org/' },
        byDefault: { big: 'always — mandatory', sub: '"All transactions on the network are private by mandate; there is no way to accidentally send a transparent transaction."', chip: 'cited', src: [{ label: 'getmonero FAQ', href: 'https://www.getmonero.org/get-started/faq/' }] },
        plain: { big: 'dynamic', sub: 'Algorithmic fee moves with load; no official fixed figure is published — UNMEASURED here rather than estimated.', chip: 'unmeasured', src: [{ label: 'getmonero FAQ', href: 'https://www.getmonero.org/get-started/faq/' }] },
        shield: { big: 'no steps', sub: 'There is no shield/unshield — every transfer is already private. One dynamic fee covers all three rows.', chip: 'cited', src: [{ label: 'getmonero FAQ', href: 'https://www.getmonero.org/get-started/faq/' }] },
        transfer: { big: 'no steps', sub: 'Same answer: every transfer is private by default — nothing to switch on.', chip: 'cited', src: [{ label: 'getmonero FAQ', href: 'https://www.getmonero.org/get-started/faq/' }] },
        unshield: { big: 'no steps', sub: 'Nothing to unshield — funds never live in a transparent mode.', chip: 'cited', src: [{ label: 'getmonero FAQ', href: 'https://www.getmonero.org/get-started/faq/' }] },
        confirm: { big: '2 min', sub: 'Target block time.', chip: 'cited', src: [{ label: 'Wikipedia: Monero', href: 'https://en.wikipedia.org/wiki/Monero' }] },
        consensus: { big: 'PoW · RandomX', sub: 'ASIC-resistant proof-of-work.', chip: 'cited', src: [{ label: 'Wikipedia: Monero', href: 'https://en.wikipedia.org/wiki/Monero' }] },
        protocol: { big: 'rings + stealth + RingCT', sub: 'Ring signatures (sender), stealth addresses (receiver), RingCT (amount).', chip: 'cited', src: [{ label: 'moneropedia', href: 'https://www.getmonero.org/resources/moneropedia/ringsignatures.html' }] },
        stablecoin: { big: '✗ none native', sub: 'Single-asset chain — XMR only; no native token layer for stablecoins.', chip: 'cited', src: [{ label: 'getmonero.org', href: 'https://www.getmonero.org/' }] },
        watchout: { big: 'Delisting pressure', sub: 'Binance delisted XMR (Feb 2024); a 2017 study traced many pre-hardfork transactions.', chip: 'cited', src: [{ label: 'Wikipedia: Monero', href: 'https://en.wikipedia.org/wiki/Monero' }, { label: 'arXiv study', href: 'https://arxiv.org/abs/1704.04299' }] },
    },

    zano: {
        id: 'zano', name: 'Zano', ticker: 'ZANO', since: '2019',
        color: 'text-amber-300', ring: 'border-amber-400/30 bg-amber-400/[0.05]',
        hook: 'The private economy — hidden everything + a native stablecoin (2019)',
        site: { label: 'zano.org', href: 'https://zano.org/' },
        byDefault: { big: 'always — mandatory', sub: '"Every transaction is private by default. Amounts, addresses, and even asset types are hidden." Enforced at protocol level.', chip: 'cited', src: [{ label: 'docs.zano.org', href: 'https://docs.zano.org/docs/learn/what-is-zano' }] },
        plain: { big: 'dynamic', sub: '"Low-fee" by the project\'s own pitch; exact fee UNMEASURED — no official figure published.', chip: 'unmeasured', src: [{ label: 'zano.org', href: 'https://zano.org/' }] },
        shield: { big: 'no steps', sub: 'Private by default — one fee, nothing to switch on.', chip: 'cited', src: [{ label: 'docs.zano.org', href: 'https://docs.zano.org/docs/learn/what-is-zano' }] },
        transfer: { big: 'no steps', sub: 'Same — every wallet transfer is confidential.', chip: 'cited', src: [{ label: 'docs.zano.org', href: 'https://docs.zano.org/docs/learn/what-is-zano' }] },
        unshield: { big: 'no steps', sub: 'No transparent mode exists to unshield from (opt-in auditable wallets aside).', chip: 'cited', src: [{ label: 'docs.zano.org', href: 'https://docs.zano.org/docs/learn/what-is-zano' }] },
        confirm: { big: '≈ 1 min', sub: '"Blocks arrive about once a minute."', chip: 'cited', src: [{ label: 'docs.zano.org', href: 'https://docs.zano.org/docs/learn/how-zano-works' }] },
        consensus: { big: 'hybrid PoW + PoS', sub: 'ProgPowZ PoW alternating with Zarcanum — the first PoS with hidden staked amounts.', chip: 'cited', src: [{ label: 'docs.zano.org', href: 'https://docs.zano.org/docs/learn/how-zano-works' }] },
        protocol: { big: 'rings + stealth + Bulletproofs+', sub: 'd/v-CLSAG ring signatures, stealth addresses, Bulletproofs+ commitments, Confidential Assets.', chip: 'cited', src: [{ label: 'docs.zano.org', href: 'https://docs.zano.org/docs/learn/what-is-zano' }] },
        stablecoin: { big: '★ NATIVE — fUSD', sub: 'Freedom Dollar (fUSD) — a private stablecoin issued on Zano\'s Confidential Assets layer.', chip: 'cited', src: [{ label: 'zano.org', href: 'https://zano.org/' }] },
        watchout: { big: 'Younger chain', sub: 'In production since 2019 — the same CryptoNote tricks as Monero with a smaller crowd behind them.', chip: 'cited', src: [{ label: 'docs.zano.org', href: 'https://docs.zano.org/docs/learn/what-is-zano' }] },
    },

    firo: {
        id: 'firo', name: 'Firo', ticker: 'FIRO', since: '2016',
        color: 'text-sky-300', ring: 'border-sky-400/30 bg-sky-400/[0.05]',
        hook: 'Lelantus Spark — burn, redeem, hide (2016)',
        site: { label: 'firo.org', href: 'https://firo.org/' },
        byDefault: { big: 'Spark wallets', sub: 'Official wallets default to Spark addresses since the 2023 switch.', chip: 'cited', src: [{ label: 'firo.org FAQ', href: 'https://firo.org/about/faq/' }] },
        plain: { big: 'dynamic', sub: 'Fee UNMEASURED — no official figure published.', chip: 'unmeasured' },
        shield: { big: 'no steps', sub: 'Spark removed the old "redeem" step — private coins pass directly between users.', chip: 'cited', src: [{ label: 'firo.org FAQ', href: 'https://firo.org/about/faq/' }] },
        transfer: { big: 'no steps', sub: 'Direct Spark-to-Spark transfers; amounts hidden, addresses unsearchable on-chain.', chip: 'cited', src: [{ label: 'firo.org research', href: 'https://firo.org/about/research/' }] },
        unshield: { big: 'no steps', sub: 'No separate transparent mode in the Spark wallet flow.', chip: 'cited', src: [{ label: 'firo.org research', href: 'https://firo.org/about/research/' }] },
        confirm: { big: '2.5 min', sub: 'Target block time.', chip: 'cited', src: [{ label: 'firo.org FAQ', href: 'https://firo.org/about/faq/' }] },
        consensus: { big: 'PoW · FiroPoW', sub: 'GPU-friendly, FPGA/ASIC-resistant proof-of-work.', chip: 'cited', src: [{ label: 'firo.org FAQ', href: 'https://firo.org/about/faq/' }] },
        protocol: { big: 'Lelantus Spark', sub: 'Burn & redeem lineage; no trusted setup; peer-reviewed construction.', chip: 'cited', src: [{ label: 'eprint 2021/1173', href: 'https://eprint.iacr.org/2021/1173' }] },
        stablecoin: { big: '~ asset layer only', sub: 'Spark Assets exist (native asset layer); no USD stablecoin verified.', chip: 'cited', src: [{ label: 'firo.org', href: 'https://firo.org/' }] },
        watchout: { big: 'Zerocoin era', sub: 'The 2016 launch used transparent addresses and did not hide amounts — Spark is the current fix.', chip: 'cited', src: [{ label: 'firo.org FAQ', href: 'https://firo.org/about/faq/' }] },
    },

    dash: {
        id: 'dash', name: 'Dash', ticker: 'DASH', since: '2014',
        color: 'text-blue-300', ring: 'border-blue-400/30 bg-blue-400/[0.05]',
        hook: 'Fast payments + wallet CoinJoin (2014)',
        site: { label: 'dash.org', href: 'https://www.dash.org/' },
        byDefault: { big: 'opt-in mixing', sub: 'The wallet CoinJoin is a feature you enable — plain Dash is transparent.', chip: 'cited', src: [{ label: 'docs.dash.org', href: 'https://docs.dash.org/en/stable/docs/user/wallets/dashcore/coinjoin-instantsend.html' }] },
        plain: {
            big: '≈ $0.001',
            sub: '24h average fee $0.0013 (median ≈ $0.0001). Dash\'s own pitch: money moves "for less than a cent".',
            chip: 'measured',
            src: [{ label: 'Blockchair DASH stats', href: 'https://api.blockchair.com/dash/stats' }, { label: 'dash.org', href: 'https://www.dash.org/' }],
        },
        shield: {
            big: '≈ 4 × a tx fee',
            sub: '"Shield" means mixing: 4 CoinJoin rounds by default, each round is one CoinJoin transaction — fees and time multiply.',
            chip: 'cited',
            src: [{ label: 'docs.dash.org', href: 'https://docs.dash.org/en/stable/docs/user/wallets/dashcore/coinjoin-instantsend.html' }],
        },
        transfer: { big: '≈ $0.001', sub: 'A plain Dash transaction — privacy inherited from earlier mixing.', chip: 'measured', src: [{ label: 'Blockchair DASH stats', href: 'https://api.blockchair.com/dash/stats' }] },
        unshield: { big: '≈ $0.001', sub: 'Same — paying out of mixed coins is an ordinary transaction.', chip: 'measured', src: [{ label: 'Blockchair DASH stats', href: 'https://api.blockchair.com/dash/stats' }] },
        confirm: { big: '2.5 min', sub: 'Target block time; InstantSend is the wallet\'s fast-spend feature.', chip: 'cited', src: [{ label: 'Wikipedia: Dash', href: 'https://en.wikipedia.org/wiki/Dash_(cryptocurrency)' }] },
        consensus: { big: 'PoW · X11', sub: 'Proof-of-work plus a masternode second layer (ChainLocks, InstantSend).', chip: 'cited', src: [{ label: 'Wikipedia: Dash', href: 'https://en.wikipedia.org/wiki/Dash_(cryptocurrency)' }] },
        protocol: { big: 'wallet CoinJoin', sub: 'Trustless (non-custodial) mixing in equal-size denominations; 4 rounds default, 2–16 configurable.', chip: 'cited', src: [{ label: 'docs.dash.org', href: 'https://docs.dash.org/en/stable/docs/user/wallets/dashcore/coinjoin-instantsend.html' }] },
        stablecoin: { big: '✗ none verified', sub: 'No native USD stablecoin verified from official sources.', chip: 'unmeasured', src: [{ label: 'dash.org', href: 'https://www.dash.org/' }] },
        watchout: { big: 'Amounts stay public', sub: 'CoinJoin blurs who paid whom — it never hides amounts, and only covers mixed coins.', chip: 'cited', src: [{ label: 'docs.dash.org', href: 'https://docs.dash.org/en/stable/docs/user/wallets/dashcore/coinjoin-instantsend.html' }] },
    },

    grin: {
        id: 'grin', name: 'Grin', ticker: 'GRIN', since: '2019',
        color: 'text-lime-300', ring: 'border-lime-400/30 bg-lime-400/[0.05]',
        hook: 'Mimblewimble pioneer — history prunes itself (2019)',
        site: { label: 'grin.mw', href: 'https://grin.mw/' },
        byDefault: { big: 'private by construction', sub: 'Mimblewimble hides amounts and parties with no opt-in step.', chip: 'cited', src: [{ label: 'grin.mw', href: 'https://grin.mw/' }] },
        plain: { big: 'dynamic', sub: 'Fee UNMEASURED — no official figure published.', chip: 'unmeasured' },
        shield: { big: 'no steps', sub: 'Every transaction is private — nothing to switch on.', chip: 'cited', src: [{ label: 'grin.mw', href: 'https://grin.mw/' }] },
        transfer: { big: 'no steps', sub: 'Same.', chip: 'cited', src: [{ label: 'grin.mw', href: 'https://grin.mw/' }] },
        unshield: { big: 'no steps', sub: 'Same.', chip: 'cited', src: [{ label: 'grin.mw', href: 'https://grin.mw/' }] },
        confirm: { big: 'UNMEASURED', sub: 'Block time not verified from official sources — no estimate offered.', chip: 'unmeasured' },
        consensus: { big: 'PoW · Cuckoo Cycle', sub: 'Memory-hard proof-of-work.', chip: 'cited', src: [{ label: 'docs.grin.mw', href: 'https://docs.grin.mw/' }] },
        protocol: { big: 'Mimblewimble', sub: 'No amounts or addresses on-chain; past transaction data prunes with no security loss.', chip: 'cited', src: [{ label: 'grin.mw', href: 'https://grin.mw/' }] },
        stablecoin: { big: '✗ single asset', sub: 'One asset (GRIN) — no native token layer.', chip: 'cited', src: [{ label: 'grin.mw', href: 'https://grin.mw/' }] },
        watchout: { big: 'Interactive by design', sub: 'Transactions are built through Grin\'s \'slate\' exchange — both wallets take part live; the docs call it Slatepack.', chip: 'cited', src: [{ label: 'docs.grin.mw', href: 'https://docs.grin.mw/' }] },
    },

    beam: {
        id: 'beam', name: 'Beam', ticker: 'BEAM', since: '2019',
        color: 'text-cyan-300', ring: 'border-cyan-400/30 bg-cyan-400/[0.05]',
        hook: 'Mimblewimble + Lelantus, confidential assets (2019)',
        site: { label: 'beam.mw', href: 'https://beam.mw/' },
        byDefault: { big: 'private by default', sub: '"Lelantus and Mimblewimble… all transactions on the network are fully confidential."', chip: 'cited', src: [{ label: 'beam.mw', href: 'https://beam.mw/' }] },
        plain: { big: 'dynamic', sub: 'Fee UNMEASURED — no official figure published.', chip: 'unmeasured' },
        shield: { big: 'no steps', sub: 'Private by default — nothing to switch on.', chip: 'cited', src: [{ label: 'beam.mw', href: 'https://beam.mw/' }] },
        transfer: { big: 'no steps', sub: 'Same.', chip: 'cited', src: [{ label: 'beam.mw', href: 'https://beam.mw/' }] },
        unshield: { big: 'no steps', sub: 'Same.', chip: 'cited', src: [{ label: 'beam.mw', href: 'https://beam.mw/' }] },
        confirm: { big: 'UNMEASURED', sub: 'Block time not verified from official sources — no estimate offered.', chip: 'unmeasured' },
        consensus: { big: 'PoW · BeamHash III', sub: '"A Proof-of-Work network using the BeamHash III consensus algorithm."', chip: 'cited', src: [{ label: 'beam.mw', href: 'https://beam.mw/' }] },
        protocol: { big: 'Mimblewimble + Lelantus', sub: 'Plus Confidential Assets — asset transfers indistinguishable from BEAM transfers.', chip: 'cited', src: [{ label: 'beam.mw', href: 'https://beam.mw/' }] },
        stablecoin: { big: '★ supported', sub: '"Beam\'s blockchain supports private stablecoins" — native Confidential Assets.', chip: 'cited', src: [{ label: 'beam.mw', href: 'https://beam.mw/' }] },
        watchout: { big: 'Bridges carry the weight', sub: 'Wrapped BTC/LTC/DOGE and WBEAM ride on bridges and custodial wrapping — the private chain ends where the bridge begins.', chip: 'cited', src: [{ label: 'beam.mw', href: 'https://beam.mw/' }] },
    },

    secret: {
        id: 'secret', name: 'Secret Network', ticker: 'SCRT', since: '—',
        color: 'text-violet-300', ring: 'border-violet-400/30 bg-violet-400/[0.05]',
        hook: 'Private smart contracts in secure enclaves',
        site: { label: 'scrt.network', href: 'https://scrt.network/' },
        byDefault: { big: 'private data by default', sub: 'Contract inputs, outputs and state encrypted inside trusted execution environments.', chip: 'cited', src: [{ label: 'scrt.network', href: 'https://scrt.network/' }] },
        plain: { big: 'dynamic', sub: 'Transfers pay SCRT gas; exact cost UNMEASURED.', chip: 'unmeasured' },
        shield: { big: 'bridge in', sub: 'Shielding = bridging an asset onto Secret (bridge fees vary).', chip: 'dynamic', src: [{ label: 'scrt.network', href: 'https://scrt.network/' }] },
        transfer: { big: 'gas', sub: 'Private contract execution pays network gas — dynamic.', chip: 'dynamic', src: [{ label: 'scrt.network', href: 'https://scrt.network/' }] },
        unshield: { big: 'bridge out', sub: 'Unshielding = bridging back — fees vary per bridge.', chip: 'dynamic', src: [{ label: 'scrt.network', href: 'https://scrt.network/' }] },
        confirm: { big: 'UNMEASURED', sub: 'Block time not verified from official sources — no estimate offered.', chip: 'unmeasured' },
        consensus: { big: 'PoS · SCRT staking', sub: 'Staked SCRT secures the network and governance.', chip: 'cited', src: [{ label: 'scrt.network', href: 'https://scrt.network/' }] },
        protocol: { big: 'secure enclaves (TEEs)', sub: 'Confidential virtual machines — computation on private data, from the 2015 Enigma paper.', chip: 'cited', src: [{ label: 'scrt.network', href: 'https://scrt.network/' }] },
        stablecoin: { big: '✓ via bridges', sub: 'SNIP-20 private tokens make bridged assets privacy-preserving.', chip: 'cited', src: [{ label: 'scrt.network', href: 'https://scrt.network/' }] },
        watchout: { big: 'Hardware trust', sub: 'TEE privacy depends on secure-enclave hardware — a different trust model than pure cryptography.', chip: 'cited', src: [{ label: 'scrt.network', href: 'https://scrt.network/' }] },
    },

    aztec: {
        id: 'aztec', name: 'Aztec', ticker: 'AZTEC', since: '—',
        color: 'text-lime-300', ring: 'border-lime-400/30 bg-lime-400/[0.05]',
        hook: 'Private apps on Ethereum — the Noir zk language',
        site: { label: 'aztec.network', href: 'https://aztec.network/' },
        byDefault: { big: 'you choose per function', sub: 'Programmable privacy — contracts pick what stays private and what becomes public.', chip: 'cited', src: [{ label: 'aztec.network', href: 'https://aztec.network/' }] },
        plain: { big: '< $0.05', sub: '"For a fully private transfer" — Aztec\'s own published figure (Aztec Tierra).', chip: 'cited', src: [{ label: 'aztec.network', href: 'https://aztec.network/' }] },
        shield: { big: 'Ethereum gas', sub: 'Shielding = bridging onto the L2 — cost moves with Ethereum gas.', chip: 'dynamic', src: [{ label: 'aztec.network', href: 'https://aztec.network/' }] },
        transfer: { big: '< $0.05', sub: 'Aztec\'s own figure for a fully private transfer.', chip: 'cited', src: [{ label: 'aztec.network', href: 'https://aztec.network/' }] },
        unshield: { big: 'Ethereum gas', sub: 'Exiting to Ethereum — gas moves with the L1.', chip: 'dynamic', src: [{ label: 'aztec.network', href: 'https://aztec.network/' }] },
        confirm: { big: '~1 s proofs', sub: '"To prove it on a laptop" (Aztec\'s figure); settlement happens on Ethereum.', chip: 'cited', src: [{ label: 'aztec.network', href: 'https://aztec.network/' }] },
        consensus: { big: 'zk-rollup on Ethereum', sub: 'A decentralized Ethereum L2 — sequencers and provers are open roles.', chip: 'cited', src: [{ label: 'aztec.network', href: 'https://aztec.network/' }] },
        protocol: { big: 'Noir + rollup privacy', sub: 'Zero-knowledge smart contracts; the network runs validity proofs back to Ethereum.', chip: 'cited', src: [{ label: 'aztec.network', href: 'https://aztec.network/' }] },
        stablecoin: { big: '✓ bridged USDC', sub: 'Pay privately with cUSDC on Aztec; Privacy Pools bring Ethereum assets into private apps.', chip: 'cited', src: [{ label: 'aztec.network', href: 'https://aztec.network/' }] },
        watchout: { big: 'Two ledgers, two fees', sub: 'Rollup fees plus Ethereum gas for anything crossing the bridge.', chip: 'cited', src: [{ label: 'aztec.network', href: 'https://aztec.network/' }] },
    },

    horizen: {
        id: 'horizen', name: 'Horizen', ticker: 'ZEN', since: '—',
        color: 'text-yellow-300', ring: 'border-yellow-400/30 bg-yellow-400/[0.05]',
        hook: 'Compliance-first private execution on Base',
        site: { label: 'horizen.io', href: 'https://horizen.io/' },
        byDefault: { big: 'auditable privacy', sub: '"Regulatory-compliant, auditable private execution" — privacy with the receipts built in.', chip: 'cited', src: [{ label: 'horizen.io', href: 'https://horizen.io/' }] },
        plain: { big: 'dynamic', sub: 'Runs as an EVM chain on Base — costs are Base gas, UNMEASURED here.', chip: 'unmeasured', src: [{ label: 'horizen.io', href: 'https://horizen.io/' }] },
        shield: { big: 'in-chain privacy', sub: 'Private execution happens inside the platform rather than as a separate shielding step.', chip: 'cited', src: [{ label: 'horizen.io', href: 'https://horizen.io/' }] },
        transfer: { big: 'dynamic', sub: 'Base gas — UNMEASURED here.', chip: 'unmeasured' },
        unshield: { big: 'disclosure', sub: 'Selective disclosure replaces a hard unshield — you choose what to reveal.', chip: 'cited', src: [{ label: 'horizen.io', href: 'https://horizen.io/' }] },
        confirm: { big: 'Base-settled', sub: 'Settlement rides Base (Ethereum L2); exact timing UNMEASURED here.', chip: 'unmeasured', src: [{ label: 'horizen.io', href: 'https://horizen.io/' }] },
        consensus: { big: 'EVM on Base', sub: 'A privacy-first ecosystem built on Base after its 2026 migration.', chip: 'cited', src: [{ label: 'horizen.io', href: 'https://horizen.io/' }] },
        protocol: { big: 'auditable private execution', sub: 'EVM-native confidential computation for on-chain business.', chip: 'cited', src: [{ label: 'horizen.io', href: 'https://horizen.io/' }] },
        stablecoin: { big: '~ not verified', sub: 'No native USD stablecoin verified from official sources.', chip: 'unmeasured' },
        watchout: { big: 'A moving target', sub: 'The 2026 Base migration rewrote the architecture — compare against today\'s docs, not old ZEN-era articles.', chip: 'cited', src: [{ label: 'horizen.io', href: 'https://horizen.io/' }] },
    },
}

/* Column state: BCH is pinned as the star; columns B and C are swappable. */
const colB = ref('zcash')
const colC = ref('monero')

/* Swap popup — Escape closes it from anywhere (window-level, a11y convention). */
const swapTarget = ref(null)
function openSwap(t) { swapTarget.value = t }
function onKey(e) { if (e.key === 'Escape') swapTarget.value = null }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
function chooseCoin(id) {
    if (!swapTarget.value) return
    if (id === 'bch') return
    if (swapTarget.value === 'B') colB.value = id
    else colC.value = id
    swapTarget.value = null
}
const SWAPPABLE = Object.values(ROSTER).filter(c => c.id !== 'bch')

/* The rows of the table. */
const ROWS = [
    { key: 'byDefault', label: 'privacy by default?', eli5: 'Do you get privacy automatically, or must you remember to switch it on?' },
    { key: 'plain', label: 'cost · plain transfer', eli5: 'What one ordinary payment costs, in USD.', kind: 'cost' },
    { key: 'shield', label: 'cost · SHIELD', eli5: 'Wrapping money into the privacy layer.', kind: 'cost' },
    { key: 'transfer', label: 'cost · shielded TRANSFER', eli5: 'Moving money inside the privacy layer.', kind: 'cost' },
    { key: 'unshield', label: 'cost · UNSHIELD', eli5: 'Opening the envelope and paying out publicly.', kind: 'cost' },
    { key: 'confirm', label: 'confirmation time', eli5: 'How fast the network writes the payment down for good.' },
    { key: 'consensus', label: 'consensus algo', eli5: 'Who keeps the scorebook honest.' },
    { key: 'protocol', label: 'privacy protocol', eli5: 'The actual magic trick hiding sender, amount and receiver.' },
    { key: 'stablecoin', label: '★ STABLECOIN ACCESS', eli5: 'Can a USD token live on this chain — the row that decides who can actually pay privately in dollars.', kind: 'star' },
    { key: 'watchout', label: 'watch out for', eli5: 'The honest catch each coin carries.' },
]

function cell(coin, key) {
    return coin[key]
}

/* Sources — all verified reachable at publish time. */
const SOURCES = [
    { title: 'Blockchair public stats (BCH · ZEC · DASH · XMR)', href: 'https://api.blockchair.com/bitcoin-cash/stats', body: 'Live 24h median/average transaction fees + block counts — captured 2026-11-27T12:45Z for the cost rows.', cls: 'text-emerald-300' },
    { title: 'Reference prices — Coinbase spot · Kraken · CoinGecko', href: 'https://api.coinbase.com/v2/prices/BCH-USD/spot', body: 'BCH $210.21 / ZEC $758.21 / DASH $36.84 (Coinbase), XMR $440.00 (Kraken), ZANO $3.92 / FIRO $0.67 / GRIN $0.0115 / BEAM $0.0039 / SCRT $0.0024 / ZEN $3.82 (CoinGecko) — captured 2026-11-27T12:44Z.', cls: 'text-white' },
    { title: 'ZIP-317 — Zcash conventional fees', href: 'https://zips.z.cash/zip-0317', body: '10,000 zatoshi minimal conventional fee, +5,000 per logical action — the Zcash cost rows.', cls: 'text-yellow-300' },
    { title: 'Our own measured pool record', href: 'https://github.com/APECSdev/hushyourmoney/blob/master/docs/POOL-DEPLOYMENT.md', body: 'The BCH SHIELD/TRANSFER/UNSHIELD costs: ~28 KB actions at the measured BARE 1.03–1.07 sat/B floor (30,000 sats).', cls: 'text-lime-300' },
    { title: 'Our shielded pool research', href: 'https://hushyourmoney.com/research/shielded-pool', body: 'The zero-knowledge Groth16 pool on BCH — live lifecycle on testnet, costs measured.', cls: 'text-lime-300' },
    { title: 'CashTokens', href: 'https://cashtokens.org/', body: 'The May 2023 BCH upgrade that lets tokens — including USD tokens — live natively on-chain.', cls: 'text-emerald-300' },
    { title: 'pool-registry.json — the PUSD mainnet entry', href: 'https://github.com/APECSdev/hushyourmoney/blob/master/pool-registry.json', body: 'The USD CashToken our pool runs: mainnet category 2469acc5… (anchor probed 200 on Selene mainnet, 2026-11-27).', cls: 'text-emerald-300' },
    { title: 'CashFusion', href: 'https://cashfusion.org/', body: '"Privacy for Bitcoin Cash… blend into the crowd." The live BCH CoinJoin.', cls: 'text-emerald-300' },
    { title: 'getmonero.org — FAQ + Moneropedia', href: 'https://www.getmonero.org/get-started/faq/', body: 'Private by mandate; the three technologies; tail emission. Ring signatures / stealth addresses / RingCT pages.', cls: 'text-orange-300' },
    { title: 'z.cash — learn + protocol spec (PDF)', href: 'https://z.cash/learn/', body: 'Shielded vs transparent Zcash; the zk-SNARK specification.', cls: 'text-yellow-300' },
    { title: 'docs.zano.org — what is Zano + how it works', href: 'https://docs.zano.org/docs/learn/what-is-zano', body: 'Private by default; CryptoNote lineage; hybrid PoW/PoS (Zarcanum); ~1-minute blocks; fUSD stablecoin.', cls: 'text-amber-300' },
    { title: 'firo.org — FAQ + research + Spark paper', href: 'https://firo.org/about/faq/', body: '2016 Zerocoin launch; 2023 Spark switch; FiroPoW; 2.5-minute target; eprint.iacr.org/2021/1173.', cls: 'text-sky-300' },
    { title: 'docs.dash.org — CoinJoin and InstantSend', href: 'https://docs.dash.org/en/stable/docs/user/wallets/dashcore/coinjoin-instantsend.html', body: 'Trustless wallet CoinJoin, 4 rounds by default, 2–16 configurable.', cls: 'text-blue-300' },
    { title: 'grin.mw · beam.mw · scrt.network · aztec.network · horizen.io', href: 'https://grin.mw/', body: 'The honorable-mentions roster — one official site each, every cell traced to them.', cls: 'text-violet-300' },
    { title: 'Wikipedia — Monero · Zcash · Dash · Bitcoin Cash', href: 'https://en.wikipedia.org/wiki/Monero', body: 'Encyclopedic record: launch dates, block times, consensus algorithms, the Binance delisting (Feb 2024).', cls: 'text-white' },
    { title: 'The two red-team studies', href: 'https://arxiv.org/abs/1704.04299', body: 'Monero traceability (arXiv:1704.04299, 2017) + Zcash anonymity (Kappos et al., USENIX Security 2018).', cls: 'text-rose-300' },
]

const FAQ = [
    {
        q: 'Why is Bitcoin Cash pinned first?',
        a: `Because this is a Bitcoin Cash privacy project, and the star deserves a fixed seat. The table doesn't rig the
            game, though — BCH loses the block-time row to Zcash outright, and its privacy is opt-in while Monero's is
            automatic. Where BCH genuinely runs away with it is the money rows: sub-cent transfers, measured ~$0.06
            shielded actions, and the only cell on this table with a native on-chain USD token our own pool runs.`,
    },
    {
        q: 'Why do some cells say UNMEASURED?',
        a: `Because no verified number exists for them — the project publishes no fixed fee figure — and our house rule
            is to refuse estimating. A cost row that says "dynamic" moves with network load; a chip that says
            [measured] means we (or a captured API reading) actually observed the number; [cited] means an official
            source states it.`,
    },
    {
        q: 'Which coins can I put in the other columns?',
        a: `Any of the ten researched here: Zcash, Monero, Zano, Firo, Dash, Grin, Beam, Secret Network, Aztec and
            Horizen. Click a column's name and pick from the popup. The BCH column stays put — the star doesn't swap
            seats.`,
    },
]
</script>

<template>

    <!-- ── Hero (compact — the table IS the page) ── -->
    <section class="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-6 pb-10 pt-14 text-center">

        <p class="animate-rise font-mono text-[0.8rem] uppercase tracking-[0.5em] text-lime-200 sm:text-xs" style="animation-delay: 0.05s">
            compare · every number sourced
        </p>

        <h1 class="animate-rise mt-6 font-display text-[clamp(2.2rem,7vw,5rem)] font-extrabold leading-[1.04] tracking-tight text-white" style="animation-delay: 0.18s">
            The Privacy
            <span class="text-gradient">Money Table</span>
        </h1>

        <p class="animate-rise mt-6 max-w-2xl text-base leading-relaxed text-slate-100 sm:text-lg" style="animation-delay: 0.32s">
            <strong class="font-semibold text-white">Bitcoin Cash holds the first column.</strong>
            Zcash and Monero hold the other two — click either name to swap in any coin on the roster.
            Costs in USD, confirmation times, consensus, the privacy protocols, and the row that matters most:
            <strong class="font-semibold text-white">stablecoin access</strong>.
        </p>

        <div class="animate-rise mt-8 flex flex-wrap items-center justify-center gap-3" style="animation-delay: 0.44s">
            <span class="status-chip status-lime">BCH first · pinned</span>
            <span class="status-chip status-cyan">10 more chains to swap in</span>
            <span class="status-chip status-violet">no estimates — measured or UNMEASURED</span>
        </div>
    </section>

    <!-- ── THE BIG TABLE ── -->
    <section id="table" class="relative z-10 mx-auto w-full max-w-[95rem] px-4 pb-8 sm:px-6">
        <div class="reveal overflow-x-auto rounded-2xl border border-white/10 bg-[#0a1018]">

            <table class="w-full min-w-[64rem] border-collapse text-left">
                <colgroup>
                    <col style="width: 13rem">
                    <col style="width: 15rem">
                    <col style="width: 15rem">
                    <col style="width: 15rem">
                </colgroup>

                <thead>
                    <tr>
                        <!-- row-label corner -->
                        <th scope="col" class="t-corner">
                            <span class="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">row ↓ · coin →</span>
                        </th>

                        <!-- THE STAR: Bitcoin Cash, pinned -->
                        <th scope="col" class="t-star-head">
                            <span class="star-badge">
                                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.26L21.5 9.3l-4.75 4.28L18.18 20 12 16.6 5.82 20l1.43-6.42L2.5 9.3l6.6-1.04L12 2z"/></svg>
                                the star · pinned
                            </span>
                            <span class="mt-2 flex items-center gap-3">
                                <span class="grid h-11 w-11 place-items-center rounded-xl border border-emerald-400/40 bg-emerald-400/10 font-mono text-[0.7rem] font-bold text-emerald-300">BCH</span>
                                <span class="text-left">
                                    <span class="block font-display text-lg font-extrabold leading-none text-white">Bitcoin Cash</span>
                                    <span class="block font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">since 2017</span>
                                </span>
                            </span>
                        </th>

                        <!-- swappable column B -->
                        <th scope="col" class="t-swap-head">
                            <button type="button" class="swap-btn" :aria-label="`Swap ${ROSTER[colB].name} for another coin`" @click="openSwap('B')">
                                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" d="M7 16V4m0 0L3 8m4-4 4 4m6 4v12m0 0 4-4m-4 4-4-4"/></svg>
                                swap
                            </button>
                            <span class="mt-2 flex items-center gap-3">
                                <span class="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/5 font-mono text-[0.7rem] font-bold" :class="ROSTER[colB].color">{{ ROSTER[colB].ticker }}</span>
                                <span class="text-left">
                                    <span class="block font-display text-lg font-extrabold leading-none text-white">{{ ROSTER[colB].name }}</span>
                                    <span class="block font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">since {{ ROSTER[colB].since }}</span>
                                </span>
                            </span>
                        </th>

                        <!-- swappable column C -->
                        <th scope="col" class="t-swap-head">
                            <button type="button" class="swap-btn" :aria-label="`Swap ${ROSTER[colC].name} for another coin`" @click="openSwap('C')">
                                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" d="M7 16V4m0 0L3 8m4-4 4 4m6 4v12m0 0 4-4m-4 4-4-4"/></svg>
                                swap
                            </button>
                            <span class="mt-2 flex items-center gap-3">
                                <span class="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/5 font-mono text-[0.7rem] font-bold" :class="ROSTER[colC].color">{{ ROSTER[colC].ticker }}</span>
                                <span class="text-left">
                                    <span class="block font-display text-lg font-extrabold leading-none text-white">{{ ROSTER[colC].name }}</span>
                                    <span class="block font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">since {{ ROSTER[colC].since }}</span>
                                </span>
                            </span>
                        </th>
                    </tr>
                </thead>

                <tbody :key="colB + '-' + colC" class="tb-swap">
                    <tr v-for="row in ROWS" :key="row.key" :class="row.kind === 'star' ? 't-star-row' : ''">

                        <!-- row label -->
                        <th scope="row" class="t-label">
                            <span class="block font-mono text-[0.68rem] uppercase tracking-[0.16em]" :class="row.kind === 'star' ? 'text-yellow-300' : 'text-slate-300'">{{ row.label }}</span>
                            <span class="mt-1 block max-w-[11rem] text-[0.68rem] leading-snug text-slate-500">{{ row.eli5 }}</span>
                        </th>

                        <!-- BCH — the star column -->
                        <td class="t-cell t-star-cell">
                            <div class="flex flex-col gap-1">
                                <span v-if="cell(ROSTER.bch, row.key).big" class="font-display text-base font-extrabold leading-tight text-emerald-300 sm:text-lg" :class="row.kind === 'star' ? 'star-lead' : ''">{{ cell(ROSTER.bch, row.key).big }}</span>
                                <span class="text-[0.72rem] leading-snug text-slate-300">{{ cell(ROSTER.bch, row.key).sub }}</span>
                                <span class="mt-0.5 flex flex-wrap items-center gap-1.5">
                                    <span class="chip" :class="'chip-' + cell(ROSTER.bch, row.key).chip">{{ cell(ROSTER.bch, row.key).chip === 'unmeasured' ? 'UNMEASURED' : cell(ROSTER.bch, row.key).chip }}</span>
                                    <a v-for="s in cell(ROSTER.bch, row.key).src" :key="s.href + row.key" :href="s.href" target="_blank" rel="noopener noreferrer" class="src-link text-[0.68rem]">{{ s.label }} ↗</a>
                                </span>
                            </div>
                        </td>

                        <!-- swappable columns -->
                        <td v-for="cid in [colB, colC]" :key="cid + row.key" class="t-cell">
                            <div class="flex flex-col gap-1">
                                <span v-if="cell(ROSTER[cid], row.key).big" class="font-display text-base font-extrabold leading-tight text-white sm:text-lg" :class="row.kind === 'star' ? 'star-lead' : ''">{{ cell(ROSTER[cid], row.key).big }}</span>
                                <span class="text-[0.72rem] leading-snug text-slate-300">{{ cell(ROSTER[cid], row.key).sub }}</span>
                                <span class="mt-0.5 flex flex-wrap items-center gap-1.5">
                                    <span class="chip" :class="'chip-' + cell(ROSTER[cid], row.key).chip">{{ cell(ROSTER[cid], row.key).chip === 'unmeasured' ? 'UNMEASURED' : cell(ROSTER[cid], row.key).chip }}</span>
                                    <a v-for="s in cell(ROSTER[cid], row.key).src" :key="s.href + cid + row.key" :href="s.href" target="_blank" rel="noopener noreferrer" class="src-link text-[0.68rem]">{{ s.label }} ↗</a>
                                </span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <p class="reveal mt-4 text-xs leading-relaxed text-slate-400">
            USD figures were computed from reference prices captured 2026-11-27T12:44Z (Coinbase spot · Kraken ·
            CoinGecko — see sources). Native-unit fees are the stable facts; prices move. Every [measured] chip is
            our own on-chain record or a captured API reading; every [cited] chip is a linked official source;
            UNMEASURED means no verified figure exists and we refuse to guess.
        </p>
    </section>

    <!-- ── The swap popup ── -->
    <Teleport to="body">
        <div v-if="swapTarget" class="swap-modal" @click.self="swapTarget = null" @keydown.escape="swapTarget = null">
            <div class="swap-panel" role="dialog" aria-modal="true" aria-label="Pick a blockchain">
                <div class="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <p class="font-mono text-xs uppercase tracking-[0.3em] text-lime-300">
                        swap column {{ swapTarget }} — pick a chain
                    </p>
                    <button type="button" class="swap-close" aria-label="Close" @click="swapTarget = null">✕</button>
                </div>
                <div class="mt-5 grid gap-2 sm:grid-cols-2">
                    <button v-for="c in SWAPPABLE" :key="c.id" type="button" class="swap-option" :class="ROSTER[colB].id === c.id || ROSTER[colC].id === c.id ? 'swap-option-in' : ''" @click="chooseCoin(c.id)">
                        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/15 bg-white/5 font-mono text-[0.62rem] font-bold" :class="c.color">{{ c.ticker }}</span>
                        <span class="text-left">
                            <span class="block text-sm font-bold text-white">{{ c.name }} <span class="font-mono text-[0.6rem] text-slate-500">since {{ c.since }}</span></span>
                            <span class="block text-[0.72rem] leading-snug text-slate-400">{{ c.hook }}</span>
                        </span>
                    </button>
                </div>
                <p class="mt-5 border-t border-white/10 pt-4 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
                    bitcoin cash stays pinned — the star doesn't swap seats
                </p>
            </div>
        </div>
    </Teleport>

    <!-- ── The stablecoin callout (the biggest highlight) ── -->
    <section class="relative z-10 mx-auto w-full max-w-6xl px-6 pt-12">
        <div class="reveal usd-band rounded-3xl border border-yellow-300/30 px-6 py-10 sm:px-12">
            <p class="font-mono text-xs uppercase tracking-[0.4em] text-yellow-300">the row that decides the future</p>
            <h2 class="mt-3 font-display text-2xl font-extrabold text-white sm:text-4xl">Private payments need a dollar.</h2>
            <div class="mt-6 grid gap-6 md:grid-cols-3">
                <p class="text-sm leading-relaxed text-slate-100">
                    A privacy chain without a stablecoin is a privacy <em>hobby</em>: everyone still prices life in
                    dollars, so users must hop off the private chain (exchanges, KYC) to get one — leaking at the
                    on-ramp and off-ramp exactly what the cryptography hid in the middle.
                </p>
                <p class="text-sm leading-relaxed text-slate-100">
                    <strong class="text-white">Bitcoin Cash is the only star here with a native answer.</strong>
                    CashTokens let USD tokens live on-chain, and our own shielded pool is built for
                    <strong class="text-white">PUSD</strong> — its mainnet category is live on BCH today. Shield
                    dollars, transfer dollars, unshield dollars — all inside one chain.
                </p>
                <p class="text-sm leading-relaxed text-slate-100">
                    <strong class="text-white">The others:</strong> Zano has a native private stablecoin (fUSD).
                    Beam supports them on its asset layer, Aztec brings bridged USDC, Secret makes bridged tokens
                    private. Zcash, Monero, Grin, Firo and Dash have <strong class="text-white">no native USD
                    token</strong> verified — the dollar lives elsewhere, and so does your privacy.
                </p>
            </div>
            <div class="mt-6 flex flex-wrap gap-2 font-mono text-[0.68rem]">
                <a href="https://cashtokens.org/" target="_blank" rel="noopener noreferrer" class="src-link">CashTokens ↗</a>
                <a href="https://github.com/APECSdev/hushyourmoney/blob/master/pool-registry.json" target="_blank" rel="noopener noreferrer" class="src-link">the PUSD registry entry ↗</a>
                <NuxtLink to="/research/shielded-pool" class="src-link">our shielded pool →</NuxtLink>
            </div>
        </div>
    </section>

    <!-- ── The star's honest scorecard ── -->
    <section class="relative z-10 mx-auto w-full max-w-6xl px-6 pt-12">
        <p class="reveal font-mono text-xs uppercase tracking-[0.4em] text-lime-300">is the star actually the star?</p>
        <h2 class="reveal mt-3 font-display text-2xl font-extrabold text-white sm:text-4xl">The scorecard, honestly</h2>

        <div class="reveal mt-8 grid gap-5 md:grid-cols-3">
            <div class="rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.05] p-6">
                <p class="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">where BCH wins</p>
                <ul class="mt-3 space-y-2.5 text-sm leading-relaxed text-slate-100">
                    <li><strong class="text-white">Stablecoin access</strong> — the only chain here with a native on-chain USD token our own pool runs (PUSD). The dollar never has to leave.</li>
                    <li><strong class="text-white">Plain transfer cost</strong> — 24h median ≈ $0.0008, measured. The cheapest verified row on the table.</li>
                    <li><strong class="text-white">Full lifecycle priced</strong> — shield, transfer and unshield each ≈ $0.06, measured on our own running pool — no other chain publishes all three.</li>
                </ul>
            </div>
            <div class="rounded-2xl border border-rose-400/25 bg-rose-400/[0.04] p-6">
                <p class="font-mono text-xs uppercase tracking-[0.3em] text-rose-300">where BCH loses</p>
                <ul class="mt-3 space-y-2.5 text-sm leading-relaxed text-slate-100">
                    <li><strong class="text-white">Confirmation time</strong> — ~10-minute blocks vs Zcash's 75 seconds. Slowest row on the table.</li>
                    <li><strong class="text-white">Privacy by default</strong> — opt-in. Monero/Zano/Grin/Beam users can't forget their privacy; BCH users must remember.</li>
                    <li><strong class="text-white">Battle history</strong> — the shielded pool is research live on testnet, not a production wallet feature yet.</li>
                </ul>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <p class="font-mono text-xs uppercase tracking-[0.3em] text-slate-300">the read</p>
                <p class="mt-3 text-sm leading-relaxed text-slate-100">
                    If you want privacy you can't forget, Monero-shaped coins win the default row. If you want to
                    <strong class="text-white">privately move dollars, cheaply, on one chain</strong> — the table's
                    money rows all point at Bitcoin Cash. That's the bet this whole project is built on.
                </p>
            </div>
        </div>
    </section>

    <!-- ── How to read the table (ELI5) ── -->
    <section class="relative z-10 mx-auto w-full max-w-6xl px-6 pt-12">
        <p class="reveal font-mono text-xs uppercase tracking-[0.4em] text-lime-300">eli5 · how to read the table</p>
        <div class="reveal mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-slate-200">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-cyan-300">shield / unshield</p>
                <p class="mt-1.5">Putting money <em>into</em> the privacy envelope — and taking it back out. One fee each way, wherever the steps exist.</p>
            </div>
            <div class="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-slate-200">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-cyan-300">confirmation time</p>
                <p class="mt-1.5">How long until the network writes your payment down "for good" — the target block time of each chain.</p>
            </div>
            <div class="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-slate-200">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-cyan-300">consensus algo</p>
                <p class="mt-1.5">Who checks the scorebook: proof-of-work miners, proof-of-stake stakers, hybrids — or another chain entirely.</p>
            </div>
            <div class="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-slate-200">
                <p class="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-cyan-300">stablecoin access</p>
                <p class="mt-1.5">Can a dollar token live <em>on</em> the chain? If not, private users must exit through an exchange to get one.</p>
            </div>
        </div>
    </section>

    <!-- ── FAQ (compact) ── -->
    <section class="relative z-10 mx-auto w-full max-w-4xl px-6 pt-14">
        <div class="reveal space-y-4">
            <details v-for="f in FAQ" :key="f.q" class="faq-card">
                <summary>{{ f.q }}</summary>
                <p>{{ f.a }}</p>
            </details>
        </div>
    </section>

    <!-- ── Sources ── -->
    <section id="sources" class="relative z-10 mx-auto w-full max-w-6xl px-6 pt-14 pb-28 scroll-mt-24">
        <p class="reveal font-mono text-xs uppercase tracking-[0.4em] text-lime-300">receipts</p>
        <h2 class="reveal mt-3 font-display text-2xl font-extrabold text-white sm:text-4xl">Sources</h2>

        <div class="reveal mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <a v-for="s in SOURCES" :key="s.href + s.title" :href="s.href" target="_blank" rel="noopener noreferrer" class="doc-card flex flex-col">
                <h3 class="text-base font-bold" :class="s.cls">{{ s.title }}</h3>
                <p class="mt-1.5 flex-1 text-sm leading-relaxed text-slate-300">{{ s.body }}</p>
                <p class="mt-3 font-mono text-[0.65rem] break-all text-slate-500">{{ s.href }}</p>
            </a>
        </div>

        <div class="reveal mt-10 flex flex-col items-center justify-center gap-4 text-center sm:flex-row">
            <NuxtLink to="/research/shielded-pool" class="btn-primary">
                The shielded pool — where the BCH costs come from
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
            </NuxtLink>
            <NuxtLink to="/research/cashfusion" class="btn-ghost">CashFusion — the BCH privacy in production</NuxtLink>
        </div>
    </section>

</template>

<style scoped>
/* ── The table ─────────────────────────────────────────────────── */

/* Sticky columns: row-labels (left:0) + the pinned star (left:13rem). */
.t-corner {
    position: sticky; left: 0; z-index: 30;
    background: #0a1018;
    padding: 1rem 1.1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    vertical-align: top;
}
.t-star-head {
    position: sticky; left: 13rem; z-index: 30;
    background:
        linear-gradient(180deg, rgba(16, 185, 129, 0.10), rgba(16, 185, 129, 0.05)),
        #0a1018;
    border-bottom: 2px solid rgba(16, 185, 129, 0.45);
    border-left: 1px solid rgba(255, 255, 255, 0.07);
    padding: 1rem 1.1rem;
    vertical-align: top;
    box-shadow: 6px 0 24px -12px rgba(16, 185, 129, 0.35);
}
.t-swap-head {
    background: #0a1018;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    border-left: 1px solid rgba(255, 255, 255, 0.07);
    padding: 1rem 1.1rem;
    vertical-align: top;
}
.t-label {
    position: sticky; left: 0; z-index: 20;
    background: #0a1018;
    padding: 0.9rem 1.1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    vertical-align: top;
}
.t-cell {
    padding: 0.9rem 1.1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    border-left: 1px solid rgba(255, 255, 255, 0.07);
    vertical-align: top;
}
.t-star-cell {
    position: sticky; left: 13rem; z-index: 20;
    background:
        linear-gradient(180deg, rgba(16, 185, 129, 0.055), rgba(16, 185, 129, 0.025)),
        #0a1018;
    box-shadow: 6px 0 24px -12px rgba(16, 185, 129, 0.28);
}

/* The highlighted STABLECOIN row. */
.t-star-row .t-label { background: linear-gradient(180deg, rgba(250, 204, 21, 0.10), rgba(250, 204, 21, 0.05)), #0a1018; }
.t-star-row .t-cell { background: linear-gradient(180deg, rgba(250, 204, 21, 0.07), rgba(250, 204, 21, 0.03)), #0a1018; }
.t-star-row .t-star-cell { background: linear-gradient(180deg, rgba(250, 204, 21, 0.13), rgba(16, 185, 129, 0.06)), #0a1018; }
.star-lead { font-size: 1.05rem !important; }

/* Column-swap re-render animation. */
.tb-swap { animation: tb-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes tb-in {
    from { opacity: 0.25; }
    to { opacity: 1; }
}

/* Badges, chips, buttons. */
.star-badge {
    display: inline-flex; align-items: center; gap: 0.4rem;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.25em;
    color: #060a10;
    background: #6ee7b7;
    border-radius: 0.5rem;
    padding: 0.22rem 0.55rem;
    font-weight: 700;
}
.swap-btn {
    display: inline-flex; align-items: center; gap: 0.35rem;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.2em;
    color: #67e8f9;
    border: 1px solid rgba(103, 232, 249, 0.45);
    background: rgba(103, 232, 249, 0.08);
    border-radius: 0.55rem;
    padding: 0.3rem 0.6rem;
    transition: all 0.25s;
}
.swap-btn:hover { background: rgba(103, 232, 249, 0.18); border-color: rgba(103, 232, 249, 0.8); }

.chip {
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.58rem; text-transform: uppercase; letter-spacing: 0.16em;
    border-radius: 0.4rem;
    padding: 0.14rem 0.42rem;
    white-space: nowrap;
}
.chip-measured { color: #bef264; border: 1px solid rgba(190, 242, 100, 0.5); background: rgba(190, 242, 100, 0.08); }
.chip-cited    { color: #67e8f9; border: 1px solid rgba(103, 232, 249, 0.45); background: rgba(103, 232, 249, 0.07); }
.chip-dynamic  { color: #c48dff; border: 1px solid rgba(196, 141, 255, 0.45); background: rgba(196, 141, 255, 0.07); }
.chip-unmeasured { color: #fda4af; border: 1px solid rgba(251, 113, 133, 0.45); background: rgba(251, 113, 133, 0.06); }

/* The stablecoin callout band. */
.usd-band { background: linear-gradient(135deg, rgba(250, 204, 21, 0.08), rgba(16, 185, 129, 0.05)), rgba(10, 16, 24, 0.9); }

/* ── The swap popup ─────────────────────────────────────────────── */
.swap-modal {
    position: fixed; inset: 0; z-index: 90;
    display: flex; align-items: center; justify-content: center;
    background: rgba(3, 6, 10, 0.75);
    backdrop-filter: blur(6px);
    padding: 1.5rem;
}
.swap-panel {
    width: 100%; max-width: 42rem;
    max-height: 86vh;
    overflow-y: auto;
    border: 1px solid rgba(190, 242, 100, 0.25);
    border-radius: 1.4rem;
    background: #0a1018;
    padding: 1.5rem;
    box-shadow: 0 0 80px -20px rgba(190, 242, 100, 0.4);
    animation: panel-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes panel-in {
    from { opacity: 0; transform: translateY(16px) scale(0.98); }
    to { opacity: 1; transform: none; }
}
.swap-close {
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 0.6rem;
    color: #e2e8f0;
    width: 2rem; height: 2rem;
    transition: all 0.2s;
}
.swap-close:hover { border-color: rgba(251, 113, 133, 0.6); color: #fda4af; }
.swap-option {
    display: flex; align-items: center; gap: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.9rem;
    padding: 0.75rem 0.9rem;
    background: rgba(255, 255, 255, 0.02);
    transition: all 0.25s;
    text-align: left;
}
.swap-option:hover { border-color: rgba(190, 242, 100, 0.5); background: rgba(190, 242, 100, 0.06); transform: translateY(-1px); }
.swap-option-in { border-color: rgba(103, 232, 249, 0.5); background: rgba(103, 232, 249, 0.07); cursor: default; }

@media (prefers-reduced-motion: reduce) {
    .tb-swap, .swap-panel { animation: none !important; }
}
</style>
