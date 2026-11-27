<!-- web/pages/compare.vue — the ELI5 privacy-blockchain comparison (Zcash, Monero, Zano, Firo, Dash, Bitcoin Cash + honorable mentions) -->

<script setup lang="ts">
/* Shared shell + styles come from layouts/research.vue (the modern dark shell,
   the same one /playground and /daemons use). This page is a survey, not a
   research topic, so it sits at the top level under /compare. */
definePageMeta({
    layout: 'research',
})

/* OpenGraph + Twitter + canonical (shared composable). The research-hub poster
   is the closest existing 2400x1260 asset; a dedicated compare poster is a
   follow-up once the page has a stable visual identity (playground precedent —
   the brand typefaces are not installed on the build host). */
useOg({
    title: `Compare — Hush Your Money`,
    description: `Privacy coins explained like you're five: what Zcash, Monero, Zano, Firo, Dash and Bitcoin Cash each hide, and how the magic works.`,
    path: '/compare',
    image: '/posters/research.jpg',
    type: 'website',
    imageAlt: `The ELI5 comparison of the top privacy blockchains`,
})

/* Scroll-reveal (shared composable). */
useReveal()

/* ────────────────────────────────────────────────────────────────────
   Every technical claim on this page carries a citation. Sources were
   all fetched and verified reachable from the build host at publish
   time (official docs, official papers, and the two in-repo research
   pages). Nothing on this page is UNMEASURED-claimed; numbers appear
   only when a source states them.
   ──────────────────────────────────────────────────────────────────── */

/* ── On-page index ── */
const INDEX = [
    { n: '01', label: 'What privacy means', href: '#eli5' },
    { n: '02', label: 'The five magic tricks', href: '#magic' },
    { n: '03', label: 'Meet the coins', href: '#coins' },
    { n: '04', label: 'What the spy sees', href: '#spy' },
    { n: '05', label: 'The big table', href: '#table' },
    { n: '06', label: 'Timeline', href: '#timeline' },
    { n: '07', label: 'Others worth knowing', href: '#others' },
    { n: '08', label: 'The honest corner', href: '#honest' },
    { n: '09', label: 'Why we build on BCH', href: '#why-bch' },
    { n: '10', label: 'Questions', href: '#faq' },
    { n: '11', label: 'Sources', href: '#sources' },
]

/* ── The five magic tricks (mechanism cards) ──
   Each "used by" name is backed by the linked source on the card. */
const TRICKS = [
    {
        id: 'zk',
        kicker: 'magic proof',
        title: 'The sealed envelope',
        eli5: `A zero-knowledge proof is a magic stamp. You seal your payment in an envelope, the stamp proves
               the payment follows every rule — real money, right balances — but nobody can look inside.
               The math does the checking, not a person.`,
        usedBy: ['Zcash', 'Firo', 'Aztec'],
        src: { label: 'Zcash protocol spec (PDF)', href: 'https://zips.z.cash/protocol/protocol.pdf' },
    },
    {
        id: 'ring',
        kicker: 'the crowd',
        title: 'The group photo',
        eli5: `A ring signature hides you in a crowd. Your payment is signed by "someone in this group" — real
               people pulled from the blockchain — and no watcher can tell which one actually signed. The bigger
               and more honest the crowd, the better the hiding.`,
        usedBy: ['Monero', 'Zano'],
        src: { label: 'Moneropedia: ring signatures', href: 'https://www.getmonero.org/resources/moneropedia/ringsignatures.html' },
    },
    {
        id: 'stealth',
        kicker: 'the disposable address',
        title: 'The hotel room',
        eli5: `Your public address is just the hotel front desk. For every single payment, the network quietly
               books a fresh one-time room and delivers the money there. Your published address never appears
               on the chain, and payments can't be linked to each other.`,
        usedBy: ['Monero', 'Zano', 'Firo Spark'],
        src: { label: 'Moneropedia: stealth addresses', href: 'https://www.getmonero.org/resources/moneropedia/stealthaddress.html' },
    },
    {
        id: 'amount',
        kicker: 'the sealed number',
        title: 'The locked cash box',
        eli5: `The amount rides the public conveyor belt inside a locked box. Everyone can see the box move —
               and a math receipt on the lid proves the amount inside is real and that nothing was minted from
               thin air. But the number itself stays sealed.`,
        usedBy: ['Monero', 'Zano', 'Zcash shielded', 'Firo Spark'],
        src: { label: 'Moneropedia: RingCT', href: 'https://www.getmonero.org/resources/moneropedia/ringCT.html' },
    },
    {
        id: 'coinjoin',
        kicker: 'the envelope swap',
        title: 'The trading party',
        eli5: `A CoinJoin is a party. Everyone puts identical envelopes on the table at the same time, everyone
               takes the same number back — and the watcher at the window can't match giver to getter. The
               amounts stay visible, but the who-paid-whom link is drowned in the crowd.`,
        usedBy: ['Dash wallet', 'Bitcoin Cash (CashFusion)'],
        src: { label: 'CashFusion', href: 'https://cashfusion.org/' },
    },
]

/* ── The six coins ── */
const COINS = [
    {
        id: 'monero',
        ticker: 'XMR',
        name: 'Monero',
        color: 'text-orange-300',
        ring: 'border-orange-400/30 bg-orange-400/[0.06]',
        since: '2014',
        family: 'CryptoNote family',
        tagline: 'the private-by-default one',
        eli5: `Every Monero payment is private, always — there is no switch to forget and no transparent mode
               to fall into by accident. The sender hides in a crowd, the amount rides in a sealed box, and the
               receiver gets a fresh one-time address. Of all the coins here, Monero is the one that behaves
               like physical cash: hand it over, and it leaves no paper trail.`,
        magic: 'ring signatures · stealth addresses · RingCT',
        byDefault: 'always',
        watchOut: `Exchanges have delisted it under regulatory pressure (Binance, February 2024), and a 2017
                   study traced many pre-hardfork transactions. The protocol has hardened since.`,
        src: { label: 'getmonero.org', href: 'https://www.getmonero.org/get-started/faq/' },
    },
    {
        id: 'zcash',
        ticker: 'ZEC',
        name: 'Zcash',
        color: 'text-yellow-300',
        ring: 'border-yellow-400/30 bg-yellow-400/[0.06]',
        since: '2016',
        family: 'Bitcoin-derived',
        tagline: 'the choose-your-privacy one',
        eli5: `Zcash has two kinds of addresses: glass ones (transparent, like Bitcoin) and magic envelopes
               (shielded). A shielded payment proves it follows the rules with a zero-knowledge proof — the
               sender, receiver and amount all stay sealed. But privacy is optional: only the coins that opt
               into the shielded pool get it, so the shielded crowd is smaller than it could be.`,
        magic: 'zk-SNARK proofs · shielded pool · view keys',
        byDefault: 'optional',
        watchOut: `Use a transparent address and everything is public, exactly like Bitcoin. A 2018 study found
                   the shielded crowd's effective size can be shrunk by watching usage patterns.`,
        src: { label: 'z.cash', href: 'https://z.cash/learn/' },
    },
    {
        id: 'zano',
        ticker: 'ZANO',
        name: 'Zano',
        color: 'text-amber-300',
        ring: 'border-amber-400/30 bg-amber-400/[0.06]',
        since: '2019',
        family: 'CryptoNote family',
        tagline: 'the private-economy one',
        eli5: `Zano was built by the author of the original CryptoNote reference code — the codebase Monero
               forked from — so private-by-default is in its DNA: every wallet transaction hides sender,
               receiver and amount. On top of that it runs a whole private economy: privacy tokens anyone can
               issue, human-readable aliases, atomic swaps, and Zarcanum — the first proof-of-stake that keeps
               staked balances hidden.`,
        magic: 'ring signatures · stealth addresses · Bulletproofs+ · Zarcanum',
        byDefault: 'always',
        watchOut: `A younger network than Monero, with a smaller crowd — the same tricks, less history behind them.
                   Opt-in "auditable wallets" exist for cases where a third party must verify balances.`,
        src: { label: 'docs.zano.org', href: 'https://docs.zano.org/docs/learn/what-is-zano' },
    },
    {
        id: 'firo',
        ticker: 'FIRO',
        name: 'Firo',
        color: 'text-sky-300',
        ring: 'border-sky-400/30 bg-sky-400/[0.06]',
        since: '2016',
        family: 'Bitcoin-derived',
        tagline: 'the burn-and-redeem one',
        eli5: `Firo's signature trick: burn your coins so they stop existing, then redeem brand-new coins that
               have no history at all — the old and new coins can't be linked. Its current protocol, Lelantus
               Spark, hides sender, receiver and amount, and Spark addresses can't even be looked up on the
               blockchain. No trusted setup anywhere.`,
        magic: 'Lelantus Spark · zero-knowledge burn & redeem',
        byDefault: 'always (Spark)',
        watchOut: `The earlier Zerocoin era (2016) used transparent addresses and did not hide amounts — Firo
                   says so itself. Spark is the fix.`,
        src: { label: 'firo.org research', href: 'https://firo.org/about/research/' },
    },
    {
        id: 'dash',
        ticker: 'DASH',
        name: 'Dash',
        color: 'text-blue-300',
        ring: 'border-blue-400/30 bg-blue-400/[0.06]',
        since: '2014',
        family: 'Bitcoin-derived',
        tagline: 'the payments-first one',
        eli5: `Dash is mainly about fast, cheap digital cash — that's its own pitch — and privacy is a built-in
               extra, not the main course. The wallet runs a trustless CoinJoin for you: it mixes your coins
               with other people's in equal-size pieces, four rounds of mixing by default. Easy to use, but
               opt-in, and the amounts stay public.`,
        magic: 'wallet CoinJoin (4 rounds by default)',
        byDefault: 'optional',
        watchOut: `CoinJoin blurs who paid whom, but never hides amounts, and only the coins you send through
                   mixing get the benefit.`,
        src: { label: 'docs.dash.org', href: 'https://docs.dash.org/en/stable/docs/user/wallets/dashcore/coinjoin-instantsend.html' },
    },
    {
        id: 'bch',
        ticker: 'BCH',
        name: 'Bitcoin Cash',
        color: 'text-emerald-300',
        ring: 'border-emerald-400/30 bg-emerald-400/[0.06]',
        since: '2017',
        family: 'Bitcoin fork',
        tagline: 'the glass one (for now)',
        eli5: `Bitcoin Cash is a public-by-default fork of Bitcoin, built for cheap peer-to-peer cash. At the
               base layer nothing is hidden — anyone can read the whole ledger. But privacy is addable:
               CashFusion CoinJoins your coins with strangers today, and this site's own research is building
               a zero-knowledge shielded pool on top of the chain.`,
        magic: 'CashFusion CoinJoin · our ZK shielded pool (research)',
        byDefault: 'opt-in tools',
        watchOut: `Default BCH is fully transparent — if you never run a privacy tool, every payment you make is
                   public forever. The privacy tools are extra steps you have to choose.`,
        src: { label: 'cashfusion.org', href: 'https://cashfusion.org/' },
    },
]

/* ── The spy notebook (interactive panel) ──
   slot states: 'hidden' | 'partial' | 'public' — each state backed by the
   cited source behavior of the selected coin/mode. */
type Slot = 'hidden' | 'partial' | 'public'
const SPY_MASKS: Record<string, { sender: Slot, amount: Slot, receiver: Slot, note: string, noteSrc?: { label: string, href: string } }> = {
    monero: {
        sender: 'hidden', amount: 'hidden', receiver: 'hidden',
        note: `All three hidden, always — "all transactions on the network are private by mandate; there is no way to accidentally send a transparent transaction."`,
        noteSrc: { label: 'getmonero.org FAQ', href: 'https://www.getmonero.org/get-started/faq/' },
    },
    zcash_shielded: {
        sender: 'hidden', amount: 'hidden', receiver: 'hidden',
        note: `A shielded payment "can be verified as valid without revealing the sender, recipient, or amount."`,
        noteSrc: { label: 'Wikipedia: Zcash', href: 'https://en.wikipedia.org/wiki/Zcash' },
    },
    zcash_transparent: {
        sender: 'public', amount: 'public', receiver: 'public',
        note: `A transparent address "functions similarly to bitcoin addresses with publicly visible transactions."`,
        noteSrc: { label: 'Wikipedia: Zcash', href: 'https://en.wikipedia.org/wiki/Zcash' },
    },
    zano: {
        sender: 'hidden', amount: 'hidden', receiver: 'hidden',
        note: `"Every transaction is private by default. Amounts, addresses, and even asset types are hidden."`,
        noteSrc: { label: 'docs.zano.org', href: 'https://docs.zano.org/docs/learn/what-is-zano' },
    },
    firo: {
        sender: 'hidden', amount: 'hidden', receiver: 'hidden',
        note: `Lelantus Spark addresses "hide all transaction amounts, are not searchable on the blockchain."`,
        noteSrc: { label: 'firo.org research', href: 'https://firo.org/about/research/' },
    },
    dash: {
        sender: 'partial', amount: 'public', receiver: 'public',
        note: `Wallet CoinJoin mixing blurs the input-to-output link between the coins you mix (4 rounds by
               default) — the amounts and receivers stay visible.`,
        noteSrc: { label: 'docs.dash.org', href: 'https://docs.dash.org/en/stable/docs/user/wallets/dashcore/coinjoin-instantsend.html' },
    },
    bch_plain: {
        sender: 'public', amount: 'public', receiver: 'public',
        note: `Plain BCH is a transparent ledger: sender, amount and receiver are readable by anyone, forever.`,
    },
    bch_fusion: {
        sender: 'partial', amount: 'public', receiver: 'public',
        note: `CashFusion lets wallet users "blend into the crowd" — the history link between your inputs and
               outputs is drowned; amounts stay public.`,
        noteSrc: { label: 'cashfusion.org', href: 'https://cashfusion.org/' },
    },
}

const active = ref('monero')
const zcashMode = ref('shielded')
const bchMode = ref('fusion')

const currentSpy = computed(() => {
    if (active.value === 'zcash') return zcashMode.value === 'shielded' ? SPY_MASKS.zcash_shielded : SPY_MASKS.zcash_transparent
    if (active.value === 'bch') return bchMode.value === 'fusion' ? SPY_MASKS.bch_fusion : SPY_MASKS.bch_plain
    return SPY_MASKS[active.value]
})

const spyRows = computed(() => [
    { k: 'from', label: 'who sent it', state: currentSpy.value.sender },
    { k: 'amount', label: 'how much', state: currentSpy.value.amount },
    { k: 'to', label: 'who got it', state: currentSpy.value.receiver },
])

function pickCoin(id: string) { active.value = id }

/* ── The big comparison table ── */
const TABLE = [
    {
        coin: 'Monero', ticker: 'XMR', since: '2014', byDefault: 'yes — mandatory',
        hidden: 'sender · amount · receiver', how: 'ring signatures + stealth addresses + RingCT',
        tradeoff: 'exchange delistings; old (pre-2017) transactions were partly traceable',
        cls: 'text-orange-300',
    },
    {
        coin: 'Zcash', ticker: 'ZEC', since: '2016', byDefault: 'no — optional (shielded pool)',
        hidden: 'sender · amount · receiver — in the shielded pool only', how: 'zk-SNARK zero-knowledge proofs',
        tradeoff: 'transparent mode is fully public; small opt-in crowd shrinks the anonymity set',
        cls: 'text-yellow-300',
    },
    {
        coin: 'Zano', ticker: 'ZANO', since: '2019', byDefault: 'yes — mandatory',
        hidden: 'sender · amount · receiver (and asset type)', how: 'ring signatures + Bulletproofs+ + Zarcanum PoS',
        tradeoff: 'young network, smaller anonymity crowd; opt-in auditable wallets exist',
        cls: 'text-amber-300',
    },
    {
        coin: 'Firo', ticker: 'FIRO', since: '2016', byDefault: 'yes — Spark wallets',
        hidden: 'sender · amount · receiver', how: 'Lelantus Spark (no trusted setup)',
        tradeoff: 'the 2016 Zerocoin era was transparent — Spark is the current privacy layer',
        cls: 'text-sky-300',
    },
    {
        coin: 'Dash', ticker: 'DASH', since: '2014', byDefault: 'no — opt-in wallet feature',
        hidden: 'the who-paid-whom link (mixed coins only)', how: 'wallet CoinJoin, 4 rounds by default',
        tradeoff: 'amounts stay public; privacy covers only the coins you mix',
        cls: 'text-blue-300',
    },
    {
        coin: 'Bitcoin Cash', ticker: 'BCH', since: '2017', byDefault: 'no — opt-in tools',
        hidden: 'the history link (with CashFusion)', how: 'CashFusion CoinJoin + our ZK pool research',
        tradeoff: 'base layer fully transparent; every privacy gain is an extra step you choose',
        cls: 'text-emerald-300',
    },
]

/* ── Timeline (each entry cited in the sources section) ── */
const TIMELINE = [
    { year: '2013', text: 'The CryptoNote v2 whitepaper — ring signatures and one-time addresses on paper.', tag: 'paper' },
    { year: '2014', text: 'Monero launches (April) — CryptoNote privacy goes live. Xcoin launches (January), soon renamed Darkcoin, then Dash.', tag: 'launch' },
    { year: '2016', text: 'Zcash launches zk-SNARK payments (October). Zcoin launches on the Zerocoin protocol — today Firo.', tag: 'launch' },
    { year: '2017', text: 'Bitcoin Cash splits from bitcoin (August 1) — big-block cash, transparent ledger.', tag: 'fork' },
    { year: '2019', text: 'Zano runs in production; the Mimblewimble twins Grin and Beam go live.', tag: 'launch' },
    { year: '2020', text: 'CashFusion spreads through Bitcoin Cash wallets; by 2022 a third-party analysis reports 94% of transacted BCH descends from a CashFusion transaction.', tag: 'tooling' },
    { year: '2023', text: 'Firo documents switching official wallets to Lelantus Spark — amounts hidden, addresses unsearchable.', tag: 'upgrade' },
    { year: '2024', text: 'Regulatory squeeze: Binance delists Monero (February); exchanges in several countries follow.', tag: 'pressure' },
    { year: '2026', text: 'This site\'s zero-knowledge shielded pool runs its full SHIELD → TRANSFER → UNSHIELD lifecycle on Bitcoin Cash testnet.', tag: 'our research' },
]

/* ── Honorable mentions (one verified fact + official site each) ── */
const OTHERS = [
    {
        name: 'Grin',
        line: `Mimblewimble chain: "a privacy-preserving digital currency built openly" that prunes past transaction
               data without compromising security. Launched January 15, 2019.`,
        href: 'https://grin.mw/',
        cls: 'text-lime-300',
    },
    {
        name: 'Beam',
        line: `The other Mimblewimble chain: "Lelantus and Mimblewimble… privacy by default — all transactions
               are fully confidential," plus confidential assets. Mainnet January 3, 2019.`,
        href: 'https://beam.mw/',
        cls: 'text-cyan-300',
    },
    {
        name: 'Secret Network',
        line: `Private smart contracts: inputs, outputs and state encrypted inside trusted execution
               environments — "computation on private data, from the 2015 Enigma paper."`,
        href: 'https://scrt.network/',
        cls: 'text-violet-300',
    },
    {
        name: 'Aztec',
        line: `A "decentralized Ethereum L2" for unstoppable private apps — contracts choose what stays
               private and what becomes public, with the Noir zero-knowledge language underneath.`,
        href: 'https://aztec.network/',
        cls: 'text-lime-300',
    },
    {
        name: 'Horizen',
        line: `An "EVM-native, privacy-first blockchain ecosystem on Base, enabling regulatory-compliant,
               auditable private execution" — the compliance-first corner of the privacy world.`,
        href: 'https://horizen.io/',
        cls: 'text-yellow-300',
    },
]

/* ── Honest corner (caveats — every card cited) ── */
const HONEST = [
    {
        title: 'Opt-in privacy can be a spotlight',
        body: `On chains where privacy is a toggle, the few who switch it on stand out. A 2018 study of Zcash
               found the shielded pool's effective anonymity could be shrunk by watching usage patterns —
               smaller crowd, weaker hiding.`,
        src: { label: 'Kappos et al., USENIX Security 2018', href: 'https://www.usenix.org/conference/usenixsecurity18/presentation/kappos' },
    },
    {
        title: 'Older Monero was less private',
        body: `A 2017 study ("An Empirical Analysis of Traceability in the Monero Blockchain") traced many
               pre-hardfork transactions by exploiting weak decoy rules. Monero's defenses have hardened
               since — but chain history can't be retroactively private.`,
        src: { label: 'arXiv:1704.04299', href: 'https://arxiv.org/abs/1704.04299' },
    },
    {
        title: 'Exchanges can pull the exit',
        body: `Privacy coins face regulatory pressure. Binance delisted Monero in February 2024, and exchanges
               in South Korea and Australia have delisted privacy coins too — using the most private coin can
               make the on- and off-ramps harder.`,
        src: { label: 'Wikipedia: Monero', href: 'https://en.wikipedia.org/wiki/Monero' },
    },
    {
        title: 'Mixing never hides amounts',
        body: `CoinJoin-style privacy (Dash's wallet CoinJoin, CashFusion on BCH) blurs who paid whom, but the
               amounts stay public. It's a big step, not full privacy — for hidden amounts you need commitments
               or zero-knowledge proofs.`,
        src: { label: 'Dash docs · CoinJoin', href: 'https://docs.dash.org/en/stable/docs/user/wallets/dashcore/coinjoin-instantsend.html' },
    },
    {
        title: 'The human is the weak link',
        body: `No coin protects you from yourself: reusing addresses, buying from exchanges that know you,
               posting your payment publicly, or timing leaks (paying the second an invoice appears) can undo
               any protocol magic. Privacy is a habit plus a protocol.`,
        src: { label: 'Monero community: "Breaking Monero" series', href: 'https://www.getmonero.org/get-started/faq/' },
    },
    {
        title: 'Auditors can be let in — on purpose',
        body: `Private chains aren't anti-audit. Monero and Zcash support view keys so a third party you choose
               can verify your payments, and Zano ships opt-in auditable wallets. Privacy from the world,
               transparency for the accountant you pick.`,
        src: { label: 'docs.zano.org · auditable wallets', href: 'https://docs.zano.org/docs/learn/what-is-zano' },
    },
]

/* ── FAQ ── */
const FAQ = [
    {
        q: 'So which coin is the most private?',
        a: `There is no single winner — it depends on defaults and crowds. Monero, Zano and Firo hide everything
            out of the box, which removes the "did you remember to turn it on" failure mode. Zcash's shielded pool
            is equally sealed when you use it, but opting in is your job. Dash and Bitcoin Cash give you add-on
            privacy that hides who paid whom, not amounts. The strongest privacy is the one you can't forget to use.`,
    },
    {
        q: 'Is any of this illegal?',
        a: `We can't give legal advice and laws differ by country. What is verifiable: privacy tech itself is
            published openly (the Zcash and CryptoNote lineages began as academic papers), and the pressure shows up
            at exchanges — Binance delisted Monero in February 2024 citing regulatory compliance. Check your own
            jurisdiction.`,
    },
    {
        q: 'Aren\'t privacy coins mostly used for crime?',
        a: `Firo puts it well: "while privacy cryptocurrencies often make the headlines for use on the darknet or
            perceived illicit behaviour, these form a very small proportion of overall transactions." Cash is also
            used for crime — that argument attacks privacy itself, not any one coin.`,
    },
    {
        q: 'Bitcoin Cash is transparent — why does a BCH site care?',
        a: `Because privacy can be added. CashFusion already runs in BCH wallets today, and this site exists to
            build and measure the next layers: P2P fusion rounds, shielded addresses, and a zero-knowledge shielded
            pool whose full lifecycle already runs on testnet. Transparent base layer, privacy on top — you choose
            how much.`,
    },
    {
        q: 'Can I try any of this today?',
        a: `On Bitcoin Cash, yes — grab a wallet with CashFusion and turn it on. On this site, the playground runs
            an interactive CoinJoin round simulator and a relay probe, and the research pages carry the real
            on-chain evidence behind every claim.`,
    },
]

/* ── Sources (all verified reachable at publish time) ── */
const SOURCES = [
    { title: 'getmonero.org — the FAQ', href: 'https://www.getmonero.org/get-started/faq/', body: 'Private by mandate; the three privacy technologies; tail emission; delisting context.', cls: 'text-orange-300' },
    { title: 'Moneropedia — ring signatures · stealth addresses · RingCT', href: 'https://www.getmonero.org/resources/moneropedia/ringsignatures.html', body: 'The official ELI5 explanations of Monero\'s three tricks (three separate pages).', cls: 'text-orange-300' },
    { title: 'Zcash protocol specification (PDF)', href: 'https://zips.z.cash/protocol/protocol.pdf', body: 'The canonical zk-SNARK shielded-transaction specification.', cls: 'text-yellow-300' },
    { title: 'z.cash — learn', href: 'https://z.cash/learn/', body: 'Shielded vs transparent Zcash, zero-knowledge proofs, the official explainer hub.', cls: 'text-yellow-300' },
    { title: 'docs.zano.org — What is Zano?', href: 'https://docs.zano.org/docs/learn/what-is-zano', body: 'Private by default; CryptoNote lineage (Sabelnikov); Zarcanum; production since 2019.', cls: 'text-amber-300' },
    { title: 'zano.org', href: 'https://zano.org/', body: 'The five-layer privacy stack: stealth addresses, ring signatures, Bulletproofs+, confidential assets, Zarcanum.', cls: 'text-amber-300' },
    { title: 'firo.org — FAQ + research pages', href: 'https://firo.org/about/faq/', body: '2016 Zerocoin launch; the 2023 Spark wallet switch; burn & redeem explained.', cls: 'text-sky-300' },
    { title: 'Lelantus Spark paper (eprint 2021/1173)', href: 'https://eprint.iacr.org/2021/1173', body: '"Lelantus Spark: Secure and Flexible Private Transactions" — recipient privacy, one-time addressing.', cls: 'text-sky-300' },
    { title: 'Dash docs — CoinJoin and InstantSend', href: 'https://docs.dash.org/en/stable/docs/user/wallets/dashcore/coinjoin-instantsend.html', body: 'Trustless wallet CoinJoin; denominations; four mixing rounds by default.', cls: 'text-blue-300' },
    { title: 'cashfusion.org', href: 'https://cashfusion.org/', body: '"Privacy for Bitcoin Cash… blend into the crowd." The official CashFusion site.', cls: 'text-emerald-300' },
    { title: 'The 94% CashFusion analysis', href: 'https://bitcoincashresearch.org/t/94-percent-of-all-bch-transacted-since-july-2020-is-now-a-descendant-of-a-cashfusion-transaction/752', body: 'Third-party adoption record, quoted on our CashFusion research page.', cls: 'text-emerald-300' },
    { title: 'Monero traceability study (arXiv:1704.04299)', href: 'https://arxiv.org/abs/1704.04299', body: '"An Empirical Analysis of Traceability in the Monero Blockchain" (2017).', cls: 'text-white' },
    { title: 'Zcash anonymity study (USENIX Security \'18)', href: 'https://www.usenix.org/conference/usenixsecurity18/presentation/kappos', body: '"An Empirical Analysis of Anonymity in Zcash" (Kappos et al., 2018).', cls: 'text-white' },
    { title: 'Wikipedia — Monero · Zcash · Dash · Bitcoin Cash', href: 'https://en.wikipedia.org/wiki/Monero', body: 'Encyclopedic record: launch dates (2014 / 2016 / 2014-Xcoin / 2017), the Binance delisting (Feb 2024), the CryptoNote paper (2013).', cls: 'text-white' },
    { title: 'grin.mw · beam.mw · scrt.network · aztec.network · horizen.io', href: 'https://grin.mw/', body: 'The honorable-mentions primary sources, one official site each.', cls: 'text-violet-300' },
    { title: 'This site — /research/cashfusion + /research/shielded-pool', href: 'https://hushyourmoney.com/research/cashfusion', body: 'Our own BCH privacy record: the CashFusion survey and the zero-knowledge shielded-pool build, live on testnet.', cls: 'text-lime-300' },
]

/* ── Stealth-address ticker (the "hotel room" demo) ──
   Constant initial value keeps SSR and client hydration identical; the
   interval only starts after mount and is skipped for reduced-motion users. */
const STEALTH_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
function chunkOf(len: number) {
    let s = ''
    for (let i = 0; i < len; i++) s += STEALTH_ALPHABET[Math.floor(Math.random() * STEALTH_ALPHABET.length)]
    return s
}
const stealthAddr = ref('kq7mz2…p4t9')
let stealthTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    stealthTimer = setInterval(() => {
        stealthAddr.value = `${chunkOf(6)}…${chunkOf(4)}`
    }, 1600)
})
onBeforeUnmount(() => { if (stealthTimer) clearInterval(stealthTimer) })
</script>

<template>

    <!-- ── Hero ── -->
    <section class="relative z-10 mx-auto flex min-h-[78vh] w-full max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-14 text-center">

        <p class="animate-rise font-mono text-[0.8rem] uppercase tracking-[0.5em] text-lime-200 sm:text-xs" style="animation-delay: 0.05s">
            compare · six chains · zero jargon
        </p>

        <h1 class="animate-rise mt-6 font-display text-[clamp(2.4rem,8.5vw,6.5rem)] font-extrabold leading-[1.04] tracking-tight text-white" style="animation-delay: 0.18s">
            Privacy coins,
            <span class="text-gradient">ELI5</span>
        </h1>

        <p class="animate-rise mt-6 font-mono text-[clamp(1rem,2.8vw,1.6rem)] italic text-cyan-100" style="animation-delay: 0.32s">
            Zcash · Monero · Zano · Firo · Dash · Bitcoin Cash
        </p>

        <p class="animate-rise mt-8 max-w-2xl text-base leading-relaxed text-slate-100 sm:text-lg" style="animation-delay: 0.44s">
            What does each one hide? <strong class="font-semibold text-white">Who sent it, how much, and who got it.</strong>
            Every claim on this page carries a source. No magic unexplained.
        </p>

        <div class="animate-rise mt-10 flex flex-col items-center gap-4 sm:flex-row" style="animation-delay: 0.56s">
            <NuxtLink to="#coins" class="btn-primary">
                Meet the coins
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
            </NuxtLink>
            <NuxtLink to="#magic" class="btn-ghost">How the magic works</NuxtLink>
        </div>

        <div class="animate-rise mt-16 flex items-center gap-3 font-mono text-[0.78rem] uppercase tracking-[0.3em] text-slate-300" style="animation-delay: 0.7s">
            <span class="status-chip status-lime">eli5</span>
            <span class="status-chip status-cyan">interactive</span>
            <span class="status-chip status-violet">cited</span>
        </div>
    </section>

    <!-- ── On-page index ── -->
    <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-16">
        <div class="reveal grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-3 lg:grid-cols-4">
            <a v-for="i in INDEX" :key="i.n" :href="i.href" class="flex items-center gap-2.5 rounded-lg px-3 py-2 transition hover:bg-white/5">
                <span class="font-mono text-xs text-lime-300/80">{{ i.n }}</span>
                <span class="text-sm text-slate-200">{{ i.label }}</span>
            </a>
        </div>
    </section>

    <!-- ── 01 · What privacy means ── -->
    <section id="eli5" class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-28 scroll-mt-24">
        <p class="reveal font-mono text-xs uppercase tracking-[0.4em] text-lime-300">01 · what privacy means</p>
        <h2 class="reveal mt-4 font-display text-3xl font-extrabold text-white sm:text-5xl">A glass piggy bank</h2>

        <div class="reveal mt-8 space-y-6 text-base leading-relaxed text-slate-100 sm:text-lg">
            <p>
                A normal blockchain is a <strong class="font-semibold text-white">glass piggy bank with a notebook
                next to it</strong>. Every payment gets written down in permanent ink:
                <em>who sent it, how much, and who got it</em>. Anyone — your boss, your neighbor, a data company —
                can read that notebook forever.
            </p>
            <p>
                A <strong class="font-semibold text-white">privacy blockchain</strong> is the same piggy bank, but the
                notebook is written in a way only the sender and receiver can read. The network still checks that
                nobody cheated — that's the clever part — it just doesn't write down <em>who</em> or <em>how much</em>
                for the whole world.
            </p>
        </div>

        <!-- the three questions, animated -->
        <div class="reveal mt-10 grid gap-4 sm:grid-cols-3">
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-lime-300/30 bg-lime-300/10">
                    <svg class="h-7 w-7 text-lime-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path stroke-linecap="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path stroke-linecap="round" d="M22 21v-2a4 4 0 0 0-3-3.87"/><path stroke-linecap="round" d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <p class="font-mono text-xs uppercase tracking-[0.3em] text-lime-300">question 1</p>
                <p class="mt-2 text-lg font-bold text-white">Who sent it?</p>
                <p class="mt-1 text-sm text-slate-300">The sender can be hidden in a crowd, or fully sealed.</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10">
                    <svg class="h-7 w-7 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" d="M12 7v5l3 2"/></svg>
                </div>
                <p class="font-mono text-xs uppercase tracking-[0.3em] text-cyan-300">question 2</p>
                <p class="mt-2 text-lg font-bold text-white">How much?</p>
                <p class="mt-1 text-sm text-slate-300">The amount can ride in a locked box with a math receipt.</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-violet-300/30 bg-violet-300/10">
                    <svg class="h-7 w-7 text-violet-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path stroke-linecap="round" d="m22 7-8.5 8.5-5-5L2 17"/><path stroke-linecap="round" d="M16 7h6v6"/></svg>
                </div>
                <p class="font-mono text-xs uppercase tracking-[0.3em] text-violet-300">question 3</p>
                <p class="mt-2 text-lg font-bold text-white">Who got it?</p>
                <p class="mt-1 text-sm text-slate-300">The receiver can get a one-time address that never repeats.</p>
            </div>
        </div>

        <p class="reveal mt-8 text-sm text-slate-400">
            Each coin below answers these three questions differently. That's really the whole comparison —
            which questions does each coin answer with <em>"none of your business"</em>, and which ones it
            answers in plain ink.
        </p>
    </section>

    <!-- ── 02 · The five magic tricks ── -->
    <section id="magic" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 scroll-mt-24">
        <p class="reveal font-mono text-xs uppercase tracking-[0.4em] text-lime-300">02 · the toolbox</p>
        <h2 class="reveal mt-4 font-display text-3xl font-extrabold text-white sm:text-5xl">The five magic tricks</h2>
        <p class="reveal mt-6 max-w-3xl text-base leading-relaxed text-slate-100 sm:text-lg">
            Every privacy coin is a different recipe made from the same five tricks. Learn the tricks once and you
            can read any privacy chain's menu.
        </p>

        <div class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            <!-- zk — the sealed envelope -->
            <article class="fact-card reveal flex flex-col p-6">
                <p class="font-mono text-xs uppercase tracking-[0.3em] text-lime-300">{{ TRICKS[0].kicker }}</p>
                <div class="zk-stage" aria-hidden="true">
                    <svg class="zk-envelope" viewBox="0 0 120 78" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="10" y="14" width="100" height="54" rx="6" class="zk-line" />
                        <path d="M12 20 60 52 108 20" class="zk-line" />
                    </svg>
                    <span class="zk-seal">✓</span>
                </div>
                <h3 class="mt-4 text-xl font-bold text-white">{{ TRICKS[0].title }}</h3>
                <p class="mt-2 flex-1 text-sm leading-relaxed text-slate-200">{{ TRICKS[0].eli5 }}</p>
                <div class="mt-4 flex flex-wrap gap-1.5">
                    <span v-for="u in TRICKS[0].usedBy" :key="u" class="badge badge-done">{{ u }}</span>
                </div>
                <a :href="TRICKS[0].src.href" target="_blank" rel="noopener noreferrer" class="src-link mt-4 self-start">the spec (PDF) ↗</a>
            </article>

            <!-- ring — the group photo -->
            <article class="fact-card reveal flex flex-col p-6" style="transition-delay: 0.06s">
                <p class="font-mono text-xs uppercase tracking-[0.3em] text-cyan-300">{{ TRICKS[1].kicker }}</p>
                <div class="ring-stage" aria-hidden="true">
                    <svg v-for="i in 8" :key="i" class="ring-person" :style="{ '--i': i - 1 }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <circle cx="12" cy="7.5" r="3.5" />
                        <path stroke-linecap="round" d="M5 20a7 7 0 0 1 14 0" />
                    </svg>
                </div>
                <h3 class="mt-4 text-xl font-bold text-white">{{ TRICKS[1].title }}</h3>
                <p class="mt-2 flex-1 text-sm leading-relaxed text-slate-200">{{ TRICKS[1].eli5 }}</p>
                <div class="mt-4 flex flex-wrap gap-1.5">
                    <span v-for="u in TRICKS[1].usedBy" :key="u" class="badge badge-live">{{ u }}</span>
                </div>
                <a :href="TRICKS[1].src.href" target="_blank" rel="noopener noreferrer" class="src-link mt-4 self-start">moneropedia ↗</a>
            </article>

            <!-- stealth — the hotel room -->
            <article class="fact-card reveal flex flex-col p-6" style="transition-delay: 0.12s">
                <p class="font-mono text-xs uppercase tracking-[0.3em] text-violet-300">{{ TRICKS[2].kicker }}</p>
                <div class="stealth-stage" aria-hidden="true">
                    <svg class="h-9 w-9 text-violet-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" d="M3 11 12 4l9 7"/><path stroke-linecap="round" d="M5 10v9h14v-9"/><path stroke-linecap="round" d="M10 19v-5h4v5"/></svg>
                    <p class="stealth-addr font-mono">{{ stealthAddr }}</p>
                    <p class="stealth-sub">fresh room · every payment</p>
                </div>
                <h3 class="mt-4 text-xl font-bold text-white">{{ TRICKS[2].title }}</h3>
                <p class="mt-2 flex-1 text-sm leading-relaxed text-slate-200">{{ TRICKS[2].eli5 }}</p>
                <div class="mt-4 flex flex-wrap gap-1.5">
                    <span v-for="u in TRICKS[2].usedBy" :key="u" class="badge badge-mid">{{ u }}</span>
                </div>
                <a :href="TRICKS[2].src.href" target="_blank" rel="noopener noreferrer" class="src-link mt-4 self-start">moneropedia ↗</a>
            </article>

            <!-- amounts — the locked cash box -->
            <article class="fact-card reveal flex flex-col p-6">
                <p class="font-mono text-xs uppercase tracking-[0.3em] text-lime-300">{{ TRICKS[3].kicker }}</p>
                <div class="amount-stage" aria-hidden="true">
                    <svg class="h-10 w-10 text-lime-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="10" width="16" height="10" rx="2"/><path stroke-linecap="round" d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1.6" fill="currentColor" stroke="none"/></svg>
                    <p class="amount-value font-mono">7.50 <span class="amount-lock">sealed</span></p>
                    <p class="amount-sub">✓ zero minted · ✓ balances add up</p>
                </div>
                <h3 class="mt-4 text-xl font-bold text-white">{{ TRICKS[3].title }}</h3>
                <p class="mt-2 flex-1 text-sm leading-relaxed text-slate-200">{{ TRICKS[3].eli5 }}</p>
                <div class="mt-4 flex flex-wrap gap-1.5">
                    <span v-for="u in TRICKS[3].usedBy" :key="u" class="badge badge-done">{{ u }}</span>
                </div>
                <a :href="TRICKS[3].src.href" target="_blank" rel="noopener noreferrer" class="src-link mt-4 self-start">moneropedia: RingCT ↗</a>
            </article>

            <!-- coinjoin — the trading party -->
            <article class="fact-card reveal flex flex-col p-6" style="transition-delay: 0.06s">
                <p class="font-mono text-xs uppercase tracking-[0.3em] text-cyan-300">{{ TRICKS[4].kicker }}</p>
                <div class="swap-stage" aria-hidden="true">
                    <span class="swap-row-label swap-in">envelopes in</span>
                    <span class="swap-row-label swap-out">envelopes out</span>
                    <div class="swap-track">
                        <span class="swap-coin c1">◈</span>
                        <span class="swap-coin c2">◈</span>
                        <span class="swap-coin c3 mover-a">◈</span>
                        <span class="swap-coin c4 mover-b">◈</span>
                        <span class="swap-coin c5">◈</span>
                        <span class="swap-coin c6">◈</span>
                    </div>
                </div>
                <h3 class="mt-4 text-xl font-bold text-white">{{ TRICKS[4].title }}</h3>
                <p class="mt-2 flex-1 text-sm leading-relaxed text-slate-200">{{ TRICKS[4].eli5 }}</p>
                <div class="mt-4 flex flex-wrap gap-1.5">
                    <span v-for="u in TRICKS[4].usedBy" :key="u" class="badge badge-live">{{ u }}</span>
                </div>
                <a :href="TRICKS[4].src.href" target="_blank" rel="noopener noreferrer" class="src-link mt-4 self-start">cashfusion.org ↗</a>
            </article>

            <!-- the recipe note -->
            <article class="cta-glow reveal flex flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-6" style="transition-delay: 0.12s">
                <p class="font-mono text-xs uppercase tracking-[0.3em] text-white">the recipe rule</p>
                <p class="mt-3 text-sm leading-relaxed text-slate-200">
                    A coin that hides <strong class="font-semibold text-white">all three questions</strong> is a
                    full-privacy coin. A coin that hides only <em>who paid whom</em> is a mixing coin. Both are
                    honest — as long as the menu tells you which one you're ordering.
                </p>
                <NuxtLink to="#table" class="src-link mt-5 self-start">skip to the big table →</NuxtLink>
            </article>
        </div>
    </section>

    <!-- ── 03 · Meet the coins ── -->
    <section id="coins" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 scroll-mt-24">
        <p class="reveal font-mono text-xs uppercase tracking-[0.4em] text-lime-300">03 · meet the coins</p>
        <h2 class="reveal mt-4 font-display text-3xl font-extrabold text-white sm:text-5xl">Six wallets, six recipes</h2>

        <div class="mt-12 grid gap-6 lg:grid-cols-2">

            <article v-for="(c, idx) in COINS" :key="c.id" class="topic-card reveal flex flex-col p-6 sm:p-7" :class="c.ring" :style="idx % 2 === 1 ? 'transition-delay: 0.07s' : ''">
                <div class="flex flex-wrap items-center gap-3">
                    <span class="grid h-12 w-12 place-items-center rounded-xl border border-white/15 bg-white/5 font-mono text-xs font-bold" :class="c.color">{{ c.ticker }}</span>
                    <div>
                        <h3 class="text-2xl font-extrabold text-white">{{ c.name }}</h3>
                        <p class="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-slate-300">{{ c.tagline }}</p>
                    </div>
                    <span class="ml-auto badge" :class="c.byDefault === 'always' || c.byDefault === 'always (Spark)' ? 'badge-done' : (c.byDefault === 'opt-in tools' ? 'badge-wait' : 'badge-mid')">
                        {{ c.byDefault === 'always' || c.byDefault === 'always (Spark)' ? 'private by default' : 'privacy is optional' }}
                    </span>
                </div>

                <p class="mt-4 flex-1 text-sm leading-relaxed text-slate-100 sm:text-base">{{ c.eli5 }}</p>

                <div class="mt-5 grid gap-2 font-mono text-xs text-slate-300">
                    <p><span class="text-slate-500">magic&nbsp;&nbsp;·</span> {{ c.magic }}</p>
                    <p><span class="text-slate-500">since&nbsp;&nbsp;·</span> {{ c.since }} · {{ c.family }}</p>
                </div>

                <div class="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-relaxed text-slate-300">
                    <strong class="font-mono text-xs uppercase tracking-[0.2em]" :class="c.color">watch out</strong>
                    <p class="mt-1">{{ c.watchOut }}</p>
                </div>

                <a :href="c.src.href" target="_blank" rel="noopener noreferrer" class="src-link mt-5 self-start">{{ c.src.label }} ↗</a>
            </article>
        </div>
    </section>

    <!-- ── 04 · What the spy sees (interactive) ── -->
    <section id="spy" class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-28 scroll-mt-24">
        <p class="reveal font-mono text-xs uppercase tracking-[0.4em] text-lime-300">04 · interactive</p>
        <h2 class="reveal mt-4 font-display text-3xl font-extrabold text-white sm:text-5xl">What does the spy see?</h2>
        <p class="reveal mt-6 max-w-3xl text-base leading-relaxed text-slate-100 sm:text-lg">
            Pick a coin. The spy's notebook shows exactly what a stranger watching the blockchain learns about
            one payment. The two opt-in coins get a toggle — flip them to feel the difference.
        </p>

        <div class="reveal mt-10">
            <!-- coin buttons -->
            <div class="flex flex-wrap justify-center gap-2.5" role="group" aria-label="Pick a coin">
                <button v-for="c in COINS" :key="c.id" type="button"
                    class="spy-btn"
                    :class="[active === c.id ? 'spy-btn-active' : '', c.color]"
                    :aria-pressed="active === c.id"
                    @click="pickCoin(c.id)">
                    {{ c.name }}
                </button>
            </div>

            <!-- mode toggles for the two opt-in coins -->
            <div v-if="active === 'zcash'" class="mt-5 flex justify-center gap-2">
                <button type="button" class="spy-mode" :class="zcashMode === 'shielded' ? 'spy-mode-active' : ''" :aria-pressed="zcashMode === 'shielded'" @click="zcashMode = 'shielded'">shielded z-address</button>
                <button type="button" class="spy-mode" :class="zcashMode === 'transparent' ? 'spy-mode-active' : ''" :aria-pressed="zcashMode === 'transparent'" @click="zcashMode = 'transparent'">transparent t-address</button>
            </div>
            <div v-if="active === 'bch'" class="mt-5 flex justify-center gap-2">
                <button type="button" class="spy-mode" :class="bchMode === 'fusion' ? 'spy-mode-active' : ''" :aria-pressed="bchMode === 'fusion'" @click="bchMode = 'fusion'">BCH + CashFusion</button>
                <button type="button" class="spy-mode" :class="bchMode === 'plain' ? 'spy-mode-active' : ''" :aria-pressed="bchMode === 'plain'" @click="bchMode = 'plain'">plain BCH</button>
            </div>

            <!-- the notebook -->
            <div class="mx-auto mt-8 max-w-2xl">
                <div class="rounded-2xl border border-white/10 bg-[#0a1018] p-6 shadow-2xl sm:p-8">
                    <div class="flex items-center gap-3 border-b border-white/10 pb-4">
                        <svg class="h-5 w-5 text-rose-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10" cy="13" r="5"/><path stroke-linecap="round" d="M14 9 21 2m-4 0h4v4"/></svg>
                        <p class="font-mono text-xs uppercase tracking-[0.3em] text-rose-200">the spy's notebook</p>
                        <span class="ml-auto font-mono text-xs text-slate-500">chain watcher · forever</span>
                    </div>

                    <div class="mt-6 space-y-4">
                        <div v-for="row in spyRows" :key="active + '-' + row.k" class="spy-row">
                            <span class="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-slate-400">{{ row.label }}</span>
                            <span class="spy-value" :class="'st-' + row.state">
                                <template v-if="row.state === 'public'">
                                    <span v-if="row.k === 'from'">alice…qz3</span>
                                    <span v-else-if="row.k === 'amount'">12.50</span>
                                    <span v-else>bob…qz7</span>
                                </template>
                                <template v-else-if="row.state === 'hidden'">
                                    <span class="spy-blur">▚▚▚▚▚▚▚▚</span>
                                    <span class="spy-tag tag-hidden">hidden</span>
                                </template>
                                <template v-else>
                                    <span class="spy-blur">~▚▚ in the mix</span>
                                    <span class="spy-tag tag-partial">partly hidden</span>
                                </template>
                            </span>
                        </div>
                    </div>

                    <p class="mt-6 border-t border-white/10 pt-4 text-sm leading-relaxed text-slate-300">
                        {{ currentSpy.note }}
                        <a v-if="currentSpy.noteSrc" :href="currentSpy.noteSrc.href" target="_blank" rel="noopener noreferrer" class="src-link ml-1">{{ currentSpy.noteSrc.label }} ↗</a>
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- ── 05 · The big table ── -->
    <section id="table" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 scroll-mt-24">
        <p class="reveal font-mono text-xs uppercase tracking-[0.4em] text-lime-300">05 · the cheat sheet</p>
        <h2 class="reveal mt-4 font-display text-3xl font-extrabold text-white sm:text-5xl">The big table</h2>
        <p class="reveal mt-6 max-w-3xl text-base leading-relaxed text-slate-100 sm:text-lg">
            Everything above, compressed to one honest sheet. "Hidden" means hidden <em>when the coin's
            privacy is actually switched on</em> — check the defaults column before you trust it.
        </p>

        <div class="reveal mt-10 overflow-x-auto rounded-2xl border border-white/10">
            <table class="data-table w-full min-w-[54rem]">
                <thead>
                    <tr>
                        <th scope="col">coin</th>
                        <th scope="col">since</th>
                        <th scope="col">private by default?</th>
                        <th scope="col">what's hidden</th>
                        <th scope="col">how</th>
                        <th scope="col">the honest trade-off</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="r in TABLE" :key="r.coin">
                        <td><span class="font-bold" :class="r.cls">{{ r.coin }}</span> <span class="font-mono text-xs text-slate-500">{{ r.ticker }}</span></td>
                        <td class="font-mono text-sm">{{ r.since }}</td>
                        <td class="text-sm">{{ r.byDefault }}</td>
                        <td class="text-sm">{{ r.hidden }}</td>
                        <td class="text-sm">{{ r.how }}</td>
                        <td class="text-sm text-slate-300">{{ r.tradeoff }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>

    <!-- ── 06 · Timeline ── -->
    <section id="timeline" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 scroll-mt-24">
        <p class="reveal font-mono text-xs uppercase tracking-[0.4em] text-lime-300">06 · how we got here</p>
        <h2 class="reveal mt-4 font-display text-3xl font-extrabold text-white sm:text-5xl">A short privacy history</h2>

        <div class="reveal mt-10 overflow-x-auto pb-4">
            <ol class="timeline flex min-w-max items-stretch gap-4 px-1">
                <li v-for="t in TIMELINE" :key="t.year" class="timeline-item">
                    <span class="timeline-dot"></span>
                    <p class="font-mono text-sm font-bold text-lime-300">{{ t.year }}</p>
                    <p class="mt-1 max-w-[15rem] text-sm leading-relaxed text-slate-200">{{ t.text }}</p>
                    <p class="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-slate-500">{{ t.tag }}</p>
                </li>
            </ol>
        </div>
        <p class="reveal mt-4 text-sm text-slate-400">Every date is sourced in the <a href="#sources" class="src-link">sources section</a> — including our own 2026 testnet record.</p>
    </section>

    <!-- ── 07 · Others worth knowing ── -->
    <section id="others" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 scroll-mt-24">
        <p class="reveal font-mono text-xs uppercase tracking-[0.4em] text-lime-300">07 · honorable mentions</p>
        <h2 class="reveal mt-4 font-display text-3xl font-extrabold text-white sm:text-5xl">Others worth knowing</h2>
        <p class="reveal mt-6 max-w-3xl text-base leading-relaxed text-slate-100 sm:text-lg">
            The six above are the headliners. These five do things no one else on the list does.
        </p>

        <div class="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <a v-for="(o, idx) in OTHERS" :key="o.name" :href="o.href" target="_blank" rel="noopener noreferrer" class="doc-card reveal flex flex-col" :style="idx % 3 === 1 ? 'transition-delay: 0.06s' : (idx % 3 === 2 ? 'transition-delay: 0.12s' : '')">
                <h3 class="text-lg font-bold" :class="o.cls">{{ o.name }}</h3>
                <p class="mt-2 flex-1 text-sm leading-relaxed text-slate-200">{{ o.line }}</p>
                <p class="mt-4 font-mono text-xs text-slate-500">official site ↗</p>
            </a>
            <div class="doc-card reveal flex flex-col" style="transition-delay: 0.12s">
                <h3 class="text-lg font-bold text-slate-200">and the rest</h3>
                <p class="mt-2 flex-1 text-sm leading-relaxed text-slate-300">
                    Pirate Chain (ARRR), MobileCoin and Wownero also come up in privacy conversations. Their
                    official sites were not reachable from our build host at publish time, so we did not write
                    cards for them — this page only lists what we could verify.
                </p>
                <p class="mt-4 font-mono text-xs text-slate-500">verified sources only</p>
            </div>
        </div>
    </section>

    <!-- ── 08 · The honest corner ── -->
    <section id="honest" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 scroll-mt-24">
        <p class="reveal font-mono text-xs uppercase tracking-[0.4em] text-lime-300">08 · read this part twice</p>
        <h2 class="reveal mt-4 font-display text-3xl font-extrabold text-white sm:text-5xl">The honest corner</h2>
        <p class="reveal mt-6 max-w-3xl text-base leading-relaxed text-slate-100 sm:text-lg">
            Privacy magic is real, and it has real limits. These six caveats apply to every coin above.
        </p>

        <div class="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <article v-for="(h, idx) in HONEST" :key="h.title" class="fact-card reveal flex flex-col p-6" :style="idx % 3 === 1 ? 'transition-delay: 0.06s' : (idx % 3 === 2 ? 'transition-delay: 0.12s' : '')">
                <h3 class="text-lg font-bold text-white">{{ h.title }}</h3>
                <p class="mt-2 flex-1 text-sm leading-relaxed text-slate-200">{{ h.body }}</p>
                <a :href="h.src.href" target="_blank" rel="noopener noreferrer" class="src-link mt-4 self-start">{{ h.src.label }} ↗</a>
            </article>
        </div>
    </section>

    <!-- ── 09 · Why we build on BCH ── -->
    <section id="why-bch" class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-28 scroll-mt-24">
        <p class="reveal font-mono text-xs uppercase tracking-[0.4em] text-lime-300">09 · our corner of the map</p>
        <h2 class="reveal mt-4 font-display text-3xl font-extrabold text-white sm:text-5xl">Why we build on Bitcoin Cash</h2>

        <div class="reveal mt-8 space-y-6 text-base leading-relaxed text-slate-100 sm:text-lg">
            <p>
                This is a Bitcoin Cash privacy project, so we'll be the first to say it plainly:
                <strong class="font-semibold text-white">BCH is the glass one</strong>. Its ledger is fully
                public, and nothing at the base layer hides anything. That's not a secret — it's the starting
                point of our whole research program.
            </p>
            <p>
                We build here because the chain is <strong class="font-semibold text-white">cheap, roomy and
                upgradeable</strong>: big blocks for a global cash ledger, fees measured in cents, and a culture of
                shipping protocol features. Privacy on BCH is add-on work, and add-on work is exactly what we do:
            </p>
        </div>

        <div class="reveal mt-10 grid gap-4 sm:grid-cols-3">
            <NuxtLink to="/research/cashfusion" class="fact-card p-6 transition hover:border-lime-300/40">
                <p class="font-mono text-xs uppercase tracking-[0.3em] text-lime-300">today</p>
                <p class="mt-2 text-lg font-bold text-white">CashFusion</p>
                <p class="mt-1 text-sm text-slate-300">Live CoinJoin privacy in BCH wallets — the crowd already exists.</p>
            </NuxtLink>
            <NuxtLink to="/research/shielded-pool" class="fact-card p-6 transition hover:border-cyan-300/40">
                <p class="font-mono text-xs uppercase tracking-[0.3em] text-cyan-300">our research</p>
                <p class="mt-2 text-lg font-bold text-white">The shielded pool</p>
                <p class="mt-1 text-sm text-slate-300">A zero-knowledge pool on BCH — proven end-to-end on testnet.</p>
            </NuxtLink>
            <NuxtLink to="/playground" class="fact-card p-6 transition hover:border-violet-300/40">
                <p class="font-mono text-xs uppercase tracking-[0.3em] text-violet-300">hands-on</p>
                <p class="mt-2 text-lg font-bold text-white">The playground</p>
                <p class="mt-1 text-sm text-slate-300">Interactive experiments — try the privacy tech in your browser.</p>
            </NuxtLink>
        </div>

        <p class="reveal mt-8 text-sm text-slate-400">
            The honest comparison: Monero and its cousins hide everything out of the box. Bitcoin Cash asks you to
            choose privacy — and we're working to make that choice as strong as any coin on this page.
        </p>
    </section>

    <!-- ── 10 · Questions ── -->
    <section id="faq" class="relative z-10 mx-auto w-full max-w-4xl px-6 pb-28 scroll-mt-24">
        <p class="reveal font-mono text-xs uppercase tracking-[0.4em] text-lime-300">10 · questions</p>
        <h2 class="reveal mt-4 font-display text-3xl font-extrabold text-white sm:text-5xl">Questions, ELI5 answers</h2>

        <div class="reveal mt-10 space-y-4">
            <details v-for="f in FAQ" :key="f.q" class="faq-card">
                <summary>{{ f.q }}</summary>
                <p>{{ f.a }}</p>
            </details>
        </div>
    </section>

    <!-- ── 11 · Sources ── -->
    <section id="sources" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 scroll-mt-24">
        <p class="reveal font-mono text-xs uppercase tracking-[0.4em] text-lime-300">11 · receipts</p>
        <h2 class="reveal mt-4 font-display text-3xl font-extrabold text-white sm:text-5xl">Sources</h2>
        <p class="reveal mt-6 max-w-3xl text-base leading-relaxed text-slate-100 sm:text-lg">
            Every claim above was checked against these sources at publish time. Official documentation and
            papers first, encyclopedic record for dates, our own pages for our own work.
        </p>

        <div class="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <a v-for="s in SOURCES" :key="s.href" :href="s.href" target="_blank" rel="noopener noreferrer" class="doc-card reveal flex flex-col">
                <h3 class="text-base font-bold" :class="s.cls">{{ s.title }}</h3>
                <p class="mt-1.5 flex-1 text-sm leading-relaxed text-slate-300">{{ s.body }}</p>
                <p class="mt-3 font-mono text-[0.7rem] text-slate-500 break-all">{{ s.href }}</p>
            </a>
        </div>
    </section>

    <!-- ── CTA ── -->
    <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-28">
        <div class="reveal cta-glow rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-14 text-center sm:px-12">
            <h2 class="font-display text-2xl font-extrabold text-white sm:text-4xl">Now watch us build it.</h2>
            <p class="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-300">
                The comparison ends where our work begins: bringing real zero-knowledge privacy to the
                transparent chain — measured, published and open-source.
            </p>
            <div class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <NuxtLink to="/research/shielded-pool" class="btn-primary">
                    The shielded pool
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                </NuxtLink>
                <NuxtLink to="/playground" class="btn-ghost">Enter the playground</NuxtLink>
            </div>
        </div>
    </section>

</template>

<style scoped>
/* ── The magic-trick stages ─────────────────────────────────────── */

/* zk — sealed envelope with a pulsing proof seal */
.zk-stage { display: flex; align-items: center; justify-content: center; position: relative; margin-top: 0.75rem; }
.zk-envelope { width: 7.5rem; color: rgb(148 163 184); }
.zk-line { stroke: rgb(163 177 198); }
.zk-seal {
    position: absolute;
    top: 14px; right: calc(50% - 4.6rem);
    display: grid; place-items: center;
    width: 1.7rem; height: 1.7rem;
    border-radius: 9999px;
    background: #bef264; color: #060a10;
    font-weight: 800; font-size: 0.85rem;
    box-shadow: 0 0 22px rgba(190, 242, 100, 0.55);
    animation: zk-seal-pulse 2.6s ease-in-out infinite;
}
@keyframes zk-seal-pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 16px rgba(190, 242, 100, 0.4); }
    50% { transform: scale(1.16); box-shadow: 0 0 30px rgba(190, 242, 100, 0.75); }
}

/* ring — the group photo: one member lights up at a time */
.ring-stage {
    display: flex; align-items: flex-end; justify-content: center;
    gap: 0.55rem; height: 4.2rem; margin-top: 0.75rem;
}
.ring-person {
    width: 1.55rem; height: 1.55rem;
    color: rgba(148, 163, 184, 0.55);
    animation: ring-light 6.4s infinite;
    animation-delay: calc(var(--i) * 0.8s);
}
@keyframes ring-light {
    0%, 4.9% { color: rgba(148, 163, 184, 0.55); transform: scale(1); }
    5%, 12.5% { color: #bef264; transform: scale(1.22); filter: drop-shadow(0 0 8px rgba(190, 242, 100, 0.6)); }
    13%, 100% { color: rgba(148, 163, 184, 0.55); transform: scale(1); }
}

/* stealth — the disposable address ticker */
.stealth-stage {
    display: flex; flex-direction: column; align-items: center; gap: 0.35rem;
    padding: 0.9rem 0; margin-top: 0.75rem;
    border-radius: 0.9rem;
    border: 1px solid rgba(196, 141, 255, 0.25);
    background: rgba(196, 141, 255, 0.05);
}
.stealth-addr {
    font-size: 1.05rem; letter-spacing: 0.06em; color: #e9d5ff;
    border-bottom: 1px dashed rgba(196, 141, 255, 0.5);
    animation: stealth-swap 1.6s infinite;
}
@keyframes stealth-swap {
    0% { opacity: 1; }
    55% { opacity: 0.35; }
    62%, 100% { opacity: 1; }
}
.stealth-sub { font-family: "Space Mono", ui-monospace, monospace; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.25em; color: rgba(148, 163, 184, 0.9); }

/* amounts — the locked cash box */
.amount-stage {
    display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
    padding: 0.9rem 0; margin-top: 0.75rem;
    border-radius: 0.9rem;
    border: 1px solid rgba(190, 242, 100, 0.25);
    background: rgba(190, 242, 100, 0.04);
}
.amount-value { font-size: 1.15rem; color: #bef264; letter-spacing: 0.08em; }
.amount-lock {
    font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.25em;
    border: 1px solid rgba(190, 242, 100, 0.5); border-radius: 0.4rem;
    padding: 0.1rem 0.4rem; margin-left: 0.3rem;
    animation: lock-breathe 2.8s ease-in-out infinite;
}
@keyframes lock-breathe {
    0%, 100% { opacity: 0.55; }
    50% { opacity: 1; }
}
.amount-sub { font-family: "Space Mono", ui-monospace, monospace; font-size: 0.62rem; color: rgba(148, 163, 184, 0.9); letter-spacing: 0.08em; }

/* coinjoin — the envelope swap */
.swap-stage {
    position: relative;
    padding: 0.9rem 0; margin-top: 0.75rem;
    border-radius: 0.9rem;
    border: 1px solid rgba(103, 232, 249, 0.25);
    background: rgba(103, 232, 249, 0.04);
}
.swap-row-label {
    position: absolute; left: 0.85rem;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.22em;
}
.swap-in { top: 0.7rem; color: rgba(103, 232, 249, 0.9); }
.swap-out { bottom: 0.7rem; color: rgba(196, 141, 255, 0.9); }
.swap-track {
    display: grid;
    grid-template-columns: repeat(3, 2.4rem);
    gap: 0.55rem;
    justify-content: center;
}
.swap-coin {
    display: grid; place-items: center;
    width: 2.2rem; height: 2.2rem;
    border-radius: 9999px;
    font-size: 1.05rem;
    border: 1.5px solid rgba(103, 232, 249, 0.65);
    color: #67e8f9;
    background: rgba(103, 232, 249, 0.06);
}
.c3 { border-color: rgba(190, 242, 100, 0.8); color: #bef264; animation: swap-a 5.2s ease-in-out infinite; }
.c4 { border-color: rgba(196, 141, 255, 0.8); color: #c48dff; animation: swap-b 5.2s ease-in-out infinite; }
@keyframes swap-a {
    0%, 30% { transform: translateY(0); }
    45%, 80% { transform: translateY(2.75rem); }
    95%, 100% { transform: translateY(0); }
}
@keyframes swap-b {
    0%, 30% { transform: translateY(0); }
    45%, 80% { transform: translateY(-2.75rem); }
    95%, 100% { transform: translateY(0); }
}

/* ── The spy notebook ───────────────────────────────────────────── */
.spy-btn {
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 0.75rem;
    padding: 0.55rem 1.05rem;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    background: rgba(255, 255, 255, 0.03);
    color: rgb(226 232 240);
    transition: border-color 0.25s, background 0.25s, transform 0.25s, box-shadow 0.25s;
}
.spy-btn:hover { background: rgba(255, 255, 255, 0.07); transform: translateY(-1px); }
.spy-btn-active {
    border-color: rgba(190, 242, 100, 0.6);
    background: rgba(190, 242, 100, 0.1);
    box-shadow: 0 0 22px -6px rgba(190, 242, 100, 0.5);
}
.spy-mode {
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 0.6rem;
    padding: 0.4rem 0.85rem;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgb(203 213 225);
    background: transparent;
    transition: all 0.25s;
}
.spy-mode:hover { border-color: rgba(103, 232, 249, 0.5); color: #67e8f9; }
.spy-mode-active { border-color: rgba(103, 232, 249, 0.7); background: rgba(103, 232, 249, 0.1); color: #67e8f9; }

.spy-row {
    display: flex; align-items: center; justify-content: space-between;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.9rem;
    padding: 0.85rem 1.15rem;
    animation: spy-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.spy-value { font-family: "Space Mono", ui-monospace, monospace; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 0.6rem; }
.spy-blur { letter-spacing: 0.12em; }
.st-public .spy-blur { color: rgb(244 114 182); }
.st-hidden { color: #bef264; }
.st-partial { color: #c48dff; }
.spy-tag {
    font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.2em;
    border-radius: 0.45rem; padding: 0.16rem 0.5rem;
}
.tag-hidden { border: 1px solid rgba(190, 242, 100, 0.55); background: rgba(190, 242, 100, 0.1); }
.tag-partial { border: 1px solid rgba(196, 141, 255, 0.55); background: rgba(196, 141, 255, 0.1); }
@keyframes spy-in {
    from { opacity: 0; transform: translateX(14px); }
    to { opacity: 1; transform: none; }
}

/* ── Timeline ────────────────────────────────────────────────────── */
.timeline { position: relative; }
.timeline-item {
    position: relative;
    flex: 1 0 16rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1.1rem;
    padding: 1.35rem 1.35rem 1.1rem;
    background: rgba(255, 255, 255, 0.02);
}
.timeline-item:nth-child(odd) { border-top: 2px solid rgba(190, 242, 100, 0.45); }
.timeline-item:nth-child(even) { border-top: 2px solid rgba(103, 232, 249, 0.45); }
.timeline-dot {
    display: block; width: 0.55rem; height: 0.55rem; border-radius: 9999px;
    background: #67e8f9; margin-bottom: 0.85rem;
    box-shadow: 0 0 14px rgba(103, 232, 249, 0.6);
}
.timeline-item:nth-child(odd) .timeline-dot { background: #bef264; box-shadow: 0 0 14px rgba(190, 242, 100, 0.6); }

/* ── Reduced motion: everything readable, nothing moving ────────── */
@media (prefers-reduced-motion: reduce) {
    .zk-seal, .ring-person, .stealth-addr, .amount-lock, .c3, .c4, .spy-row {
        animation: none !important;
    }
}
</style>
