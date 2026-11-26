<!-- web/pages/research/shielded-pool.vue — topic 01 (flagship deep dive) -->

<script setup lang="ts">
/* Shared shell + styles come from layouts/research.vue (user refactor 2026-11-13). */
definePageMeta({
    layout: 'research',
})

/* OpenGraph + Twitter + canonical (shared composable; per-page poster). */
useOg({
    title: `The Shielded Pool — Hush Your Money`,
    description: `A Groth16 shielded pool for CashTokens, measured on chipnet: 183,472 two-output and 184,528 three-output constraints, 2 public inputs, no consensus changes.`,
    path: '/research/shielded-pool',
    image: '/posters/research-shielded-pool.jpg',
    type: 'article',
    imageAlt: `The Shielded Pool — 183,472 constraints, 2 public inputs, reviewed sound on-chain verifier with the pool rules inside, live on chipnet`,
})

/* Scroll-reveal (shared composable). */
useReveal()

/* ── MEASURED NUMBERS ──────────────────────────────────────────────
   Every value below is a live measurement with a recorded source
   (session log / on-chain decode / snarkjs output). No estimates. */
const STATS = [
    { value: '183,472', label: 'constraints · 2-out circuit', tag: 'measured', color: 'text-lime-300' },
    { value: '184,528', label: 'constraints · 3-out circuit (deployed demo)', tag: 'measured', color: 'text-lime-300' },
    { value: '+0.58%', label: '3-out delta vs 2-out', tag: 'measured', color: 'text-cyan-300' },
    { value: '2', label: 'public inputs', tag: 'measured', color: 'text-cyan-300' },
    { value: '27,624 B', label: 'reviewed sound verifier · deployed', tag: 'cited + measured', color: 'text-white' },
    { value: '7,834 B', label: 'deployed program · pool rules inside the verifier', tag: 'measured', color: 'text-violet-300' },
    { value: '20/20', label: 'acceptance suite · theft replay rejects', tag: 'measured', color: 'text-lime-300' },
    { value: '146/0', label: 'red-team runs rejected · deployed program', tag: 'measured', color: 'text-white' },
]

/* ── Measured results table ──────────────────────────────────────── */
const RESULTS = [
    { q: 'Circuit (single-asset)', v: '183,472 constraints · 107 private inputs · 181,959 wires', src: 'snarkjs r1cs info build256/pool.r1cs', href: 'https://github.com/APECSdev/pusd-shielded-pool' },
    { q: 'Circuit (3-out v3)', v: '184,528 constraints (+1,056, +0.58%) · 112 private inputs · 183,017 wires · 2 public inputs · 20.2 s compile', src: 'circom 2.2.3 --O2 on apecsdev, 2026-11-26 · circuits/pool3.circom', href: 'https://github.com/APECSdev/pusd-shielded-pool/blob/master/circuits/pool3.circom' },
    { q: '3-out carrier + actionHash', v: 'carrier 169 → 201 B · actionHash 8 → 9 fields (cm2) · action +32 B · r1cs 39,449,264 B · wasm 3,380,815 B', src: 'measured 2026-11-26 · v3 design', href: 'https://github.com/APECSdev/hushyourmoney/blob/master/docs/ROLE2-3OUT-V3-DESIGN.md' },
    { q: '3-out verifier + hook + witness', v: 'BUILT: plain sound verifier 7,310 B sha256 6ec7ca8e… (6.01% std margin); hooked program 7,848 B sha256 628207b1…, locking aa200240…; hook 39,082/37,930 op, 537 B; acceptance 21/21; red team 146/0; sweep 69/69 (min 6.00% std). The Nito client 3-out witness path is built and byte-exact against the live UNSHIELD (ec31a41c…); the UI, proving-asset mirror and 3-out blanks remain.', src: 'POOL_3OUT=1 pool-info / pool-cost / pool-test / pool-redteam / pool-sweep, 2026-11-26', href: 'https://github.com/APECSdev/hushyourmoney/blob/master/docs/ROLE2-3OUT-V3-DESIGN.md' },
    { q: '3-out demo pool · chipnet', v: 'DEPLOYED 2f650791… (category bc607a96…, program 7,848 B sha256 73cb0ccb…, locking aa204a6c…); SHIELD e847ef56… (28,326 B, 1.059 sat/B), TRANSFER ef64f3dd… (28,389 B, 1.057 sat/B) and UNSHIELD 300 ec31a41c… (28,368 B, 1.022 sat/B, out 112+84+84) confirmed; final state 700 FT, notes 210/210/112/84/84, 11 leaves', src: 'chipnet 2026-11-26 · docs/ROLE2-3OUT-V3-DESIGN.md §6', href: 'https://explorer.selene.cash/tx/ec31a41c591c4af4ad95c2fab76c1ad2bb34b483393bce53758982a9d8e9de03?network=chipnet' },
    { q: 'Role-2 browser acceptance', v: 'SHIELD 1ca58773… → TRANSFER 50644d00… → UNSHIELD f52008f4… · state 760,400 FT · wallet A 19,986,800 + 600 FT, 128,323 plain, 0 blanks · pool history 48', src: 'nito.cash browser acceptance 2026-11-26 · docs/ROLE2-BROWSER-ACCEPTANCE-HANDOFF-2026-11-26.md', href: 'https://explorer.selene.cash/tx/f52008f44999f05261a905f8120900888a233e07d7cd489574909d51d0232b70?network=chipnet' },
    { q: 'Notes management · v3', v: '3-out change splitting: BUILT + DEPLOYED as a chipnet demo (SHIELD e847ef56…, TRANSFER ef64f3dd…, UNSHIELD 300 ec31a41c…); deposit path (0-in/2-out onboarding), real nullifier set (Merkle membership) and encrypted note delivery remain DESIGN; UNMEASURED', src: 'docs/ROLE2-3OUT-V3-DESIGN.md §6', href: 'https://github.com/APECSdev/hushyourmoney/blob/master/docs/ROLE2-3OUT-V3-DESIGN.md' },
    { q: 'Failed acceptance locks', v: '2,200 FT + 150,000 fuel sats standing: 3db76294… is public-bootstrap-tagged (1,000 FT + 30,000 sats, sweepable); 10f26fa3…, 1946084e…, c3e21c7a…, dff42ddb… carry lost notes (1,200 FT + 120,000 sats, stuck)', src: 'docs/ROLE2-BROWSER-ACCEPTANCE-REVIEW-2026-11-26.md', href: 'https://github.com/APECSdev/hushyourmoney/blob/master/docs/ROLE2-BROWSER-ACCEPTANCE-REVIEW-2026-11-26.md' },
    { q: 'Transfer note delivery', v: 'the TRANSFER 50644d00… 400 FT recipient note is UNDELIVERED; the 169-B carrier has no encrypted note; the 201-B 3-out carrier still cannot carry a full note — the off-chain channel is UNMEASURED', src: 'nito handoff caveat 1 · v3 design', href: 'https://github.com/APECSdev/hushyourmoney/blob/master/docs/ROLE2-BROWSER-ACCEPTANCE-HANDOFF-2026-11-26.md' },
    { q: 'Public inputs', v: '2 — [merkleRoot, actionHash]', src: 'pool.r1cs + verification_key.json (ic.length = 3)', href: 'https://github.com/APECSdev/pusd-shielded-pool' },
    { q: 'Circuit (multi-asset, variant b)', v: '186,007 constraints (+1.38%) · Poseidon(6) commitments bind the full 256-bit category', src: 'circom 2.2.3 --O2 compile, 2026-11-01 build record', href: 'https://github.com/APECSdev/pusd-shielded-pool' },
    { q: 'On-chain verifier · generation 1', v: '35,626 B inside ONE standard transaction (densless-msm — withdrawn, see below)', src: 'chipnet on-chain measurement', href: 'https://explorer.selene.cash/tx/b0a488db5b7e9bac07eebc45977523cd0730ddfe078571f2e17135231e30546b?network=chipnet' },
    { q: 'Verifier soundness · generation 1', v: 'WITHDRAWN by its author 2026-10-26 — densless-msm, finding F6: the Miller slopes are not constrained by the tangent/chord equations and the terminal compares a value with itself instead of checking the B endpoint. Carried by every pool deployed before 2026-11-24 (gate3, gate6, gate6b, mainnet, nito v2/v4)', src: 'groth16_cashscript chunked/bn254/densless-msm README · issue #32', href: 'https://github.com/mr-zwets/groth16_cashscript/tree/main/chunked/bn254/densless-msm' },
    { q: 'Deployed verifier · generation 2', v: 'bch-groth16-bn254-sound-native — 27,624 B, 3 inputs, one standard tx, independently reviewed 2026-10-26 — DEPLOYED 2026-11-24 inside chipnet-role2-pool-v2-tagged (block 345,467) with the pool rules as a role-2 hook', src: 'chipnet deploy 2eaeb97f… · verifiers.md', href: 'https://explorer.selene.cash/tx/2eaeb97fc85b2ff0fdd6c6afd1d807f8a715bd92a40258fae9f0e6ce50fe83b8?network=chipnet' },
    { q: 'Covenant verifier-sibling pin', v: 'MISSING in every pool deployed before 2026-11-24 — spend() read the genesis sibling\'s unlocking at fixed offsets and never checked that input\'s locking bytecode, so a 1-byte OP_1 script at that index was ACCEPTED on the BCH-2026 VM. Resolved two ways: the generation-1 covenant got the sibling pin in source (358 B, covenant op-cost 36,805 → 42,478; gate 6/6) — and the deployed role-2 pool eliminated the sibling entirely, moving the pool rules INSIDE the verifier', src: 'pin-sibling-test.mjs — 6/6 cases · role-2 deployment 2026-11-24', href: 'https://github.com/APECSdev/pusd-shielded-pool' },
    { q: 'Role-2 hook price', v: '37,198 op standard / 36,046 op consensus · 524 B of role-2 code inside the 7,834-B program (code pin d71851a1…)', src: 'pool-cost.mjs statement→slices diff · pool-registry.json', href: 'https://github.com/APECSdev/pusd-shielded-pool/blob/master/wip-role2-hook/STATUS.md' },
    { q: 'Role-2 acceptance suite', v: '20/20 — including the theft replay: a valid proof consuming fuel tagged for ANOTHER action REJECTS at check 4g (deposit tags bind fuel to the funded action\'s own nullifiers)', src: 'wip-role2-hook/STATUS.md · pool-registry.json', href: 'https://github.com/APECSdev/pusd-shielded-pool/blob/master/wip-role2-hook/STATUS.md' },
    { q: 'Red team · deployed program', v: '146 runs, 0 accepted · both positive controls accepted', src: 'pool-redteam-tagged-report.json (verified from the committed report)', href: 'https://github.com/APECSdev/pusd-shielded-pool/blob/master/wip-role2-hook/pool-redteam-tagged-report.json' },
    { q: 'Liveness sweep · deployed program', v: '69 funded-pool scenarios, 0 failed · worst per-input margin 6.00% standard / 6.49% consensus · max proof nq 123', src: 'pool-sweep-tagged-report.json (verified from the committed report)', href: 'https://github.com/APECSdev/pusd-shielded-pool/blob/master/wip-role2-hook/pool-sweep-tagged-report.json' },
    { q: 'Role-2 action size + fee', v: '~28.1–28.2 KB per action · BARE fees 29,000–30,000 sats ≈ 1.03–1.07 sat/B, prepaid by the user\'s lock tx', src: 'POOL-DEPLOYMENT.md §16', href: 'https://github.com/APECSdev/hushyourmoney/blob/master/docs/POOL-DEPLOYMENT.md' },
    { q: 'Witness generation (role-2)', v: '22.8 s for the deployed SHIELD witness under our ceremony zkey', src: 'wip-role2-hook/STATUS.md', href: 'https://github.com/APECSdev/pusd-shielded-pool/blob/master/wip-role2-hook/STATUS.md' },
    { q: 'Covenant redeem bytecode', v: '347 B — identical for every asset (category = constructor param)', src: 'decoded from transfer tx input 0 witness', href: 'https://explorer.selene.cash/tx/b0a488db5b7e9bac07eebc45977523cd0730ddfe078571f2e17135231e30546b?network=chipnet' },
    { q: 'Proof generation', v: '16.967 s (183,472) / 17.6 s (186,007) · build runner (hardware spec UNMEASURED)', src: 'snarkjs fullProve, session records', href: null },
    { q: 'Covenant op-cost (Gate 6, input 0)', v: '84,819 / 556,800 budget (15.2%)', src: 'libauth BCH-2026 VM debug on the broadcast tx', href: 'https://explorer.selene.cash/tx/fc585fc9bf6499024c89c73a2bcb945de2ec212fb36f8ffc5acb617b6636912f?network=chipnet' },
    { q: 'Verifier step op-costs (Gate 6)', v: '82.4% – 92.3% of the per-input budget', src: 'libauth BCH-2026 VM debug on the broadcast tx', href: 'https://explorer.selene.cash/tx/fc585fc9bf6499024c89c73a2bcb945de2ec212fb36f8ffc5acb617b6636912f?network=chipnet' },
    { q: 'Pool-op tx size', v: '~36.8 – 37.8 KB per shielded operation', src: 'on-chain transactions', href: 'https://explorer.selene.cash/tx/60fe613ec853043908b8dc83fac8165da5b6b7f0ef3e26a4299fd87560784273?network=chipnet' },
]

/* ── Gate-by-gate evidence ───────────────────────────────────────── */
type Gate = {
    gate: string
    title: string
    result: string
    href?: string
    hrefLabel?: string
    to?: string
    status: 'confirmed' | 'in-flight' | 'pending'
}
const GATES: Gate[] = [
    {
        gate: 'G1', title: 'Full pipeline reproduction',
        result: '4th chained TRANSFER built, proved (16.967 s) and broadcast; VM-eval passed on all 7 inputs; confirmed in block 330142.',
        href: 'https://explorer.selene.cash/tx/3e21097c212a3821fa186623eb38b1e785f9fca544e57f3f4562bdd0c6615e78?network=chipnet', hrefLabel: '3e21097c…5e78',
        status: 'confirmed',
    },
    {
        gate: 'G2', title: 'Compile-from-source parity',
        result: 'pool.r1cs + pool.wasm + pool.sym byte-identical (sha256-verified) against the canonical build256 artifacts.',
        status: 'confirmed',
    },
    {
        gate: 'G3', title: 'Path A lifecycle — fresh deploy',
        result: 'PREP → GENESIS → DEPLOY → SHIELD 1,000,000 units, all in block 330438; first pool-registry entry.',
        href: 'https://explorer.selene.cash/tx/f5927a0bb67d4688976f98483828259057bd399522a587e66e3b1099a2ab7426?network=chipnet', hrefLabel: 'f5927a0b…7426',
        status: 'confirmed',
    },
    {
        gate: 'G4', title: 'Multi-asset circuit',
        result: 'Variant (b) Poseidon(6): 186,007 constraints (+1.38%). Anti-converter negative test (1 unit moved across categories) REJECTED in-circuit.',
        status: 'confirmed',
    },
    {
        gate: 'G5', title: 'Multi-category covenant',
        result: 'All 6 tx shapes ACCEPTED on the BCH-2026 VM; worst op-cost 49,549 / 195,200 (~25%).',
        status: 'confirmed',
    },
    {
        gate: 'G6', title: 'Multi-asset E2E on chipnet',
        result: 'Fresh 1-of-1 setup + deploy + SHIELD 500,000 units of a DIFFERENT category than the pool — block 330459.',
        href: 'https://explorer.selene.cash/tx/fc585fc9bf6499024c89c73a2bcb945de2ec212fb36f8ffc5acb617b6636912f?network=chipnet', hrefLabel: 'fc585fc9…912f',
        status: 'confirmed',
    },
    {
        gate: 'G6b', title: 'Two-asset lifecycle, one pool',
        result: 'SHIELD A → SHIELD B → TRANSFER → UNSHIELD B on one multi-asset pool; all four ops VM-verified and broadcast 2026-11-10/11 — never confirmed: the op set was RBF-replaced with a fresh set and the replacements also remain unconfirmed on chain, so there is no explorer link.',
        status: 'in-flight',
    },
    {
        gate: 'G7', title: 'MPC trusted setup → mainnet',
        result: 'Perpetual Powers-of-Tau ceremony — in design. Public landing page live; monitor UI marked [demo].',
        to: '/ceremony',
        status: 'pending',
    },
]

/* ── Mainnet matrix (2026-11-20) ──────────────────────────────────
   The SAME circuit, covenant and verifier that ran on chipnet, executed on
   MAINNET with real PUSD (category 2469acc5…2544). Every tx below is a
   broadcast mainnet transaction [measured]; the shielded op was evaluated on
   all seven inputs with the libauth BCH-2026 VM before broadcast.
   Setup grade: DEMO — solo 1-of-1 ceremony, entropy published
   (c490ce06a2f364ee1ec87c75b0a8d9138e18df4e0f17b931). NOT the Gate-7 public
   ceremony; production deployment remains gated on it. */
const MAINNET_LIFECYCLE = [
    {
        stage: 'Prep',
        cls: 'stage-lime',
        dot: '#bef264',
        network: 'mainnet',
        kicker: 'pool category created',
        bullets: [
            'genesis input = any input spending a vout-0 outpoint',
            'its txid becomes the pool state-NFT category',
            'zero-value carrier — no tokens minted yet',
        ],
        meta: ['mainnet', '219 B [measured]'],
        tx: 'dd1e3506…0e7d',
        txFull: 'dd1e3506f4fb7e81dd4f9146612df1f0aff1f812378332297556653356020e7d',
    },
    {
        stage: 'Genesis',
        cls: 'stage-cyan',
        dot: '#67e8f9',
        network: 'mainnet',
        kicker: 'state NFT minted',
        bullets: [
            'mutable NFT commitment = merkle root ‖ nullifier-set hash',
            'root = 49bda9bd…830f (the proof vector\u2019s anchored root)',
            'the pool\u2019s whole state lives in 64 bytes',
        ],
        meta: ['mainnet', '459 B [measured]'],
        tx: '0a8cb008…c5c4',
        txFull: '0a8cb008cbacc618a27726e4422a61748fe5d5aa1e75c3ed379eff918441c5c4',
    },
    {
        stage: 'Deploy',
        cls: 'stage-violet',
        dot: '#c48dff',
        network: 'mainnet',
        kicker: 'covenant + verifier funded',
        bullets: [
            'P2SH32 covenant aa20a8d375c44dfa… pins poolCategory',
            '5 Groth16 verifier step UTXOs pre-funded (36,649 B)',
            '100 base units (1.00 PUSD) holdings locked under the same covenant',
        ],
        meta: ['mainnet', '909 B [measured]'],
        tx: '63ddfdd4…af7c',
        txFull: '63ddfdd4718b5186dfb0ed36ceebb66a8c5dde06ad28b291b53bd040b1f5af7c',
    },
    {
        stage: 'Transfer',
        cls: 'stage-lime',
        dot: '#bef264',
        network: 'mainnet',
        kicker: '100 base units (1.00 PUSD) shielded',
        bullets: [
            'real Groth16 proof · 2 public inputs · 183,472 constraints',
            '7 inputs VM-validated before broadcast, all OK',
            'state root advanced to d5ec91ad…d508; 100 base units (1.00 PUSD) conserved',
        ],
        meta: ['mainnet', '38,475 B · 1 sat/B [measured]'],
        tx: '4fda8a8b…544f',
        txFull: '4fda8a8b63ff2ef82cc1f5a9ad89bdcbbc86fec254e9c08bb1b874312f6b544f',
    },
]

/* ── The CURRENT pool: role-2, deposit-tagged (deployed 2026-11-24) ──
   Sources: pool-registry.json (chipnet-role2-pool-v2-tagged) + docs/POOL-DEPLOYMENT.md
   §16–§18 + docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md. Every txid below is a
   CONFIRMED chipnet transaction (Selene-verified 200 this session). The minting-guard
   adoption is a custody upgrade — program, state NFT, category and notes untouched. */
const ROLE2_LIFECYCLE = [
    {
        stage: 'Deploy',
        cls: 'stage-lime',
        dot: '#bef264',
        network: 'chipnet',
        kicker: 'the pool is born',
        bullets: [
            'anchor 480e30ff… = the category → mint 5ea499ff… → deploy',
            'state NFT at :0 — the PUBLIC bootstrap root 551108f6…510f ‖ zeros',
            'minting NFT passed forward at :1 — the tag supply\'s source',
        ],
        meta: ['chipnet', 'block 345,467', 'program 7,834 B'],
        tx: '2eaeb97f…83b8',
        txFull: '2eaeb97fc85b2ff0fdd6c6afd1d807f8a715bd92a40258fae9f0e6ce50fe83b8',
    },
    {
        stage: 'Shield',
        cls: 'stage-cyan',
        dot: '#67e8f9',
        network: 'chipnet',
        kicker: '1,000,000 units enter, tagged',
        bullets: [
            'lock 97d135f9… tags the fuel: SHA256(nf0‖nf1) as NFT commitments',
            'action broadcast ATOMICALLY with its unconfirmed lock — 28,127 B',
            'balance 0 → 1,000,000 FT in the state NFT; 2 tag NFTs burned',
        ],
        meta: ['chipnet', 'fee 30,000 sats · 1.067 sat/B'],
        tx: '9d9aa97a…ccf0',
        txFull: '9d9aa97a1ccdcd6662eb934fd55c72dff17ddba8c6c152a506871f795026ccf0',
    },
    {
        stage: 'Transfer',
        cls: 'stage-violet',
        dot: '#c48dff',
        network: 'chipnet',
        kicker: 'private notes change hands',
        bullets: [
            'lock 5db06be7… (tag 620e2824…) + action, atomic',
            '28,211 B · 30,000 sats (1.063 sat/B) · public value moved: zero',
            'sender, receiver, amount: invisible on chain',
        ],
        meta: ['chipnet', 'fee 30,000 sats · 1.063 sat/B'],
        tx: '5262417b…9987',
        txFull: '5262417b7fff1b0e9f9cd60ab80625e573ac565a916ff1d451369d433bd09987',
    },
    {
        stage: 'Unshield',
        cls: 'stage-lime',
        dot: '#bef264',
        network: 'chipnet',
        kicker: '250,000 units exit, proven honest',
        bullets: [
            'lock 70ab2a1f… (tag cec1170e…) + action, atomic',
            'the public payout output EXECUTED: 250,000 FT to the wallet',
            '28,175 B · 29,000 sats (1.029 sat/B) · Hush lifecycle final root 1829766…, balance 750,000; the browser acceptance then advanced the state to f52008f4… (760,400 FT, 44 leaves)',
        ],
        meta: ['chipnet', 'payout executed'],
        tx: 'e54d19fb…8eab',
        txFull: 'e54d19fb751f60a0955ba92a0af75ad87083b2e1cb1648b4fa08312b901d8eab',
    },
]

/* Minting guard + blank vending — the custody and distribution layers (all live). */
const ROLE2_INFRA = [
    {
        kicker: 'custody, settled',
        title: 'The minting guard',
        body: 'The category\'s minting NFT is locked at the guard P2SH32 aa2066a2…, and the ONLY spendable shape recreates it at the guard\'s own locking while minting exactly K=64 NFT-only empty-commitment blanks. Burning the minting NFT and minting any fungible amount are consensus-impossible — the 100M supply is frozen; a fully compromised operator key can only choose WHEN a batch runs. Adopted live with no redeploy (block 345,503); the first guarded batch executed on chain at block 345,504 — consensus 157,733 op / standard 178,853 op, both ACCEPT.',
        buttons: [
            { label: 'adopt a5d73b4e…', href: 'https://explorer.selene.cash/tx/a5d73b4e4d4645eb8d014c59fb5ce40d58f8a661b45ccb00e40530e58bc034e4?network=chipnet' },
            { label: 'batch ad1d7845…', href: 'https://explorer.selene.cash/tx/ad1d7845cc53013ac0d0f2001b87fd78ecf2e8dcd344c3853ee242c62d3fa165?network=chipnet' },
        ],
    },
    {
        kicker: 'permissionless acquisition',
        title: 'The blank vending machine',
        body: 'A P2SH32 machine per blank with NO signature anywhere: the buyer\'s tokenless funding input pays the exact pinned price (1,000 sats) to the operator\'s P2PKH and the blank is delivered to the funding input\'s OWN locking — the blank follows the money. Proven live by a total stranger: the load put 2 blanks in the machine (block 345,663) and a key never seen by the operator bought BOTH (blocks 345,664 and 345,666) using only its own signature — the covenant executed on chain, 7,545 op consensus / 8,057 op standard, both ACCEPT.',
        buttons: [
            { label: 'load 460a6f2a…', href: 'https://explorer.selene.cash/tx/460a6f2a1418e6312df2cb6bec12ef771cc913b507173c18cf74f3b9be535d18?network=chipnet' },
            { label: 'buy bc2c326e…', href: 'https://explorer.selene.cash/tx/bc2c326e9c86301cf20275a6a1e2374a04988a9c6cb1e9fb88159aaae718dec6?network=chipnet' },
        ],
    },
]

/* ── Live pools (from pool-registry.json) ────────────────────────── */
/* Explorer: Selene (user directive 2026-11-13 — imaginary.cash is FALLBACK ONLY, never primary). */
const EXPLORER = 'https://explorer.selene.cash/tx/'
const NETQ = '?network=chipnet'
const MAINNET_NETQ = '?network=mainnet'
const POOLS = [
    {
        name: 'chipnet-role2-pool-v2-tagged',
        cat: '480e30ff…b9d0',
        catFull: '480e30ff1d3f5f0b6fe9dd2dbe363b1776f61566f29a395628d0b50abd01b9d0',
        locking: 'aa203e40…2987',
        lockingFull: 'aa203e40b64cff154d4b3305e8c8cc4e3174bc595ad74342a8445a9a7798b7be3a2987',
        root: '551108f6…510f',
        firstOp: 'DEPLOYED 2026-11-24 · role-2 · reviewed sound verifier · block 345,467',
        tx: '2eaeb97f…83b8',
        txFull: '2eaeb97fc85b2ff0fdd6c6afd1d807f8a715bd92a40258fae9f0e6ce50fe83b8',
        badge: 'badge-done',
        badgeLabel: 'deployed · current',
        note: 'The current generation: the pool rules run INSIDE the independently reviewed sound verifier as a role-2 hook (program 7,834 B, locking aa203e40…). Signature-free 3-input actions — every pool UTXO spends the one program P2SH32; there is no separate covenant and no step fleet. Deposit tags (checks 4c+4g) bind the fuel to the funded action\'s own nullifiers — the theft replay REJECTS at 4g. Minting guard + permissionless blank vending live (see above). Full lifecycle confirmed: SHIELD 9d9aa97a… → TRANSFER 5262417b… → UNSHIELD 250,000 e54d19fb… (payout executed), each broadcast atomically with its tagged lock. Under OUR solo-ceremony VK (sha256 05250429…). The nito.cash browser acceptance then ran the full lifecycle through the real UI: SHIELD 1ca58773… → TRANSFER 50644d00… → UNSHIELD f52008f4… (state 760,400 FT, 44 leaves; wallet A 19,986,800 + 600 FT). The 400 FT transfer note is undelivered; four failed locks (1,200 FT + 120,000 sats) are stuck, one (3db76294…, 1,000 FT + 30,000 sats) is sweepable. The 3-out v3 is the next generation — see Notes Management.',
    },
    {
        name: 'chipnet-role2-pool',
        cat: 'b6ee4196…eb72',
        catFull: 'b6ee4196da1b0e3d548a03ea86a63d61445cd38d74300b2f7a8725eea05ceb72',
        locking: 'aa20cd37…cd87',
        lockingFull: 'aa20cd37fe80b308ae414c2d342dae482256548f7280918b4b1946057f1b631d4acd87',
        root: '551108f6…510f',
        firstOp: 'DEPLOYED 2026-11-24 · role-2 · untagged · block 345,413',
        tx: 'f8f215c3…3319',
        txFull: 'f8f215c3826b763805c71f0ee281b406cfa2e0d944f541dfdc3ae56e473b3319',
        badge: 'badge-wait',
        badgeLabel: 'superseded',
        note: 'The first role-2 deployment — full lifecycle confirmed on chain (SHIELD 582cefee… block 345,415 → TRANSFER 17f1322b… 345,423 → UNSHIELD 250,000 24cd6b42… 345,427, payout executed; final root 19318325…, balance 750,000). Superseded the same day by the tagged v2: its hook binds no author (standing fuel was consumable by any valid action between lock- and action-confirmation — user-surfaced), and its minting NFT was burned in the deploy, so it can never mint tag blanks. Its 750,000 shielded FT remain spendable.',
    },
    {
        name: 'chipnet-pusd-v4-covenant0',
        cat: '0d31da75…d664',
        catFull: '0d31da753c6855b830ea683ac11552404139008bfbfac97801fe30d31a42d664',
        locking: 'aa209dd6…5587',
        lockingFull: 'aa209dd6f6ef70c453134afd0f13f3a1aff6b9507576c97fe1649ba5aaa06abaa15587',
        root: '551108f6…510f',
        firstOp: 'DEPLOYED 2026-11-23 · covenant-at-input-0 · block 344638',
        tx: 'efd3314e…857c',
        txFull: 'efd3314edb42bddd7f7438be5dfba5ffd3da378ab13082610edd68426f38357c',
        badge: 'badge-done',
        badgeLabel: 'spendable',
        note: 'Wallet-originated actions confirmed: SHIELD 43ca7bca…2e4d (block 344641) and TRANSFER fdd2981d…7b8b (block 344646, encrypted note carrier at out[6]). Same seeded tree root as v2 — the two deploys\' state-NFT commitments are byte-identical.',
    },
    {
        name: 'chipnet-pusd-v2',
        cat: '050b5934…504a9',
        catFull: '050b5934bea9a7713e842371d8fb233b14f5596b7339fcbf8c1c7dac58c504a9',
        locking: 'aa20e6b3…5587',
        lockingFull: 'aa20e6b3af9822cdaf8d2c0744bdf51e7d61b8edd280820f661b8641d3c9844d585587',
        root: '551108f6…510f',
        firstOp: 'DEPLOYED 2026-11-22 · wallet-committed key · block 343322',
        tx: '53014fd4…66da',
        txFull: '53014fd4749ff205795e288689e12316a1497e09fc6a97bcfaa38360206766da',
        badge: 'badge-error',
        badgeLabel: 'not spendable',
        note: 'Deployed with the five-input fixture verifier program: its terminal pins inputs == 5 and its steps read input 3 as the genesis witness, while every wallet action emits seven inputs. No action can satisfy those scripts. Its pool UTXO is still the deploy output, unspent since block 343322 — zero actions. Successor: v4 above.',
    },
    {
        name: 'gate3-demo-pool',
        cat: '98690dba…b153',
        catFull: '98690dba09831a8099613ba2eb4cbe12fffa53739bdfce4978e311032a85b153',
        locking: 'aa207c0c…2087',
        lockingFull: 'aa207c0c15fbdc14dda43fb0540846e065a1bbd4076e7ab64720e64c3ecd3515208087',
        root: '2c0f5336…4525',
        firstOp: 'SHIELD 1,000,000 units · block 330438',
        tx: 'f5927a0b…7426',
        txFull: 'f5927a0bb67d4688976f98483828259057bd399522a587e66e3b1099a2ab7426',
        badge: 'badge-done',
        badgeLabel: 'deployed',
        note: '',
    },
    {
        name: 'gate6-multi-pool',
        cat: 'd85ba98a…b70a',
        catFull: 'd85ba98a8185106edd087a78bac3c5b6ba75aa0a9bfa72860dd8ed582386b70a',
        locking: 'aa201754…8e87',
        lockingFull: 'aa20175470b9d5f5ade49873c008de362cd352d2ff33c5420c4720a43d90a3f7238e87',
        root: '6fefb09c…7e20',
        firstOp: 'SHIELD 500,000 units (foreign category) · block 330459',
        tx: 'fc585fc9…912f',
        txFull: 'fc585fc9bf6499024c89c73a2bcb945de2ec212fb36f8ffc5acb617b6636912f',
        badge: 'badge-done',
        badgeLabel: 'deployed',
        note: '',
    },
]

/* ── Featured lifecycle (user directive 2026-11-13) ──────────────────
   One full pass through the pool: SHIELD → TRANSFER → UNSHIELD.
   All three txs are CONFIRMED chipnet transactions (our pool has ZERO
   mainnet txs — mainnet is gated on Gate 7, the MPC ceremony). Every
   button is honestly labeled 'chipnet'; swap the three txids when the
   mainnet deployment lands. */
const LIFECYCLE = [
    /* All three txs are CONFIRMED chipnet transactions (our pool has ZERO
       mainnet txs — mainnet is gated on Gate 7, the MPC ceremony). Every
       button carries s.network, so featuring mainnet txs later is a pure
       data swap: set network: 'mainnet' + the three mainnet txids. */
    {
        stage: 'Shield',
        cls: 'stage-lime',
        dot: '#bef264',
        network: 'chipnet',
        kicker: 'public tokens enter',
        bullets: [
            '500,000 units of asset 98690dba… enter publicly',
            'afterwards, on-chain: a note commitment only',
            'shielded asset ≠ pool category — multi-asset on the first op',
        ],
        meta: ['block 330459', '37,212 B [measured]'],
        tx: 'fc585fc9…912f',
        txFull: 'fc585fc9bf6499024c89c73a2bcb945de2ec212fb36f8ffc5acb617b6636912f',
    },
    {
        stage: 'Transfer',
        cls: 'stage-cyan',
        dot: '#67e8f9',
        network: 'chipnet',
        kicker: 'private notes change hands',
        bullets: [
            'shielded → shielded; sender, receiver, amount: invisible',
            '3 chained transfers confirmed in ONE block',
            '~36.8 KB each · no public value moved',
        ],
        meta: ['block 329764', '3 chained txs'],
        tx: '60fe613e…84273',
        txFull: '60fe613ec853043908b8dc83fac8165da5b6b7f0ef3e26a4299fd87560784273',
    },
    {
        stage: 'Unshield',
        cls: 'stage-violet',
        dot: '#c48dff',
        network: 'chipnet',
        kicker: 'value exits, proven honest',
        bullets: [
            'note spent; covenant pays the public leg',
            'Groth16 proof authorizes the spend',
            'nullifier set blocks double-spends; stale roots block replay',
        ],
        meta: ['block 329736', 'confirmed'],
        tx: 'e90b9a56…717d',
        txFull: 'e90b9a568d6908bf507e3239cde8b5ef055f9377aa95240d14453669f784717d',
    },
]
</script>

<template>

    <!-- ── Topic hero ── -->
        <section class="relative z-10 mx-auto flex min-h-[78vh] w-full max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-14 text-center">

            <NuxtLink to="/research" class="crumb animate-rise" style="animation-delay: 0.04s">
                research <span class="sep">/</span> shielded-pool
            </NuxtLink>

            <p class="animate-rise mt-6 font-mono text-[0.8rem] uppercase tracking-[0.5em] text-lime-200 sm:text-xs" style="animation-delay: 0.1s">
                topic 01 · flagship · zero-knowledge · CashTokens
            </p>

            <h1 class="animate-rise mt-6 font-display text-[clamp(2.4rem,8vw,6rem)] font-extrabold leading-[1.04] tracking-tight text-white" style="animation-delay: 0.2s">
                The <span class="text-gradient">Shielded</span><br />
                Pool
            </h1>

            <p class="animate-rise mt-6 font-mono text-[clamp(1rem,2.8vw,1.5rem)] italic text-cyan-100" style="animation-delay: 0.32s">
                Zero-knowledge payments on the UTXO model — measured, not promised.
            </p>

            <p class="animate-rise mt-8 max-w-2xl text-base leading-relaxed text-slate-100/95 sm:text-lg" style="animation-delay: 0.42s">
                A complete Groth16 shielded pool for CashTokens — note commitments, nullifiers,
                a Merkle tree, and the pool rules running <strong class="font-semibold text-white">inside</strong> a full
                on-chain Groth16 verifier — deployed and measured on Bitcoin Cash, chipnet and
                <strong class="font-semibold text-white">mainnet</strong>. <strong class="font-semibold text-white">It runs
                today</strong>: one standard transaction, one scripting VM, no fork required.
            </p>

            <div class="animate-rise mt-8 flex flex-wrap items-center justify-center gap-3" style="animation-delay: 0.5s">
                <span class="status-chip status-lime">live on mainnet</span>
                <span class="status-chip status-cyan">no consensus changes</span>
                <span class="status-chip status-violet">asset-generic — category is a private witness</span>
                <span class="status-chip status-lime">reviewed sound verifier — deployed</span>
            </div>

            <div class="animate-rise mt-10 flex flex-col items-center gap-4 sm:flex-row" style="animation-delay: 0.58s">
                <a href="#evidence" class="btn-primary btn-pulse">
                    Read the Evidence
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                </a>

                <a href="#architecture" class="btn-ghost">
                    How It Works
                </a>
            </div>
        </section>

        <!-- ── Key numbers ── -->
        <section class="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24">
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                <div v-for="(s, i) in STATS" :key="s.label" class="stat-card reveal" :style="{ transitionDelay: (i * 0.08) + 's' }">
                    <div class="font-display text-2xl font-extrabold sm:text-3xl" :class="s.color">{{ s.value }}</div>
                    <div class="mt-2 text-xs uppercase tracking-widest text-slate-100">{{ s.label }}</div>
                    <div class="mt-1 font-mono text-[0.78rem] text-slate-200">[{{ s.tag }}]</div>
                </div>
            </div>
        </section>

        <!-- ── Featured: the CURRENT pool (role-2, deposit-tagged) ── -->
        <section id="role2" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">live · chipnet · the current generation</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    The Current Pool:<br />Rules Inside the Verifier
                </h2>
                <p class="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-slate-100 sm:text-lg">
                    The successor to every pool below: the independently reviewed
                    <span class="font-mono text-xs text-lime-300">bch-groth16-bn254-sound-native</span>
                    verifier with the pool rules running as a <strong class="font-semibold text-white">role-2 hook inside the same
                    program</strong> — no separate covenant, no step-UTXO fleet. Every pool UTXO (state NFT, deposits,
                    fee fuel) is locked to the one program P2SH32, and every action is a
                    <strong class="font-semibold text-white">signature-free 3-input spend</strong>: the script satisfaction
                    is its own authorization. Deployed on chipnet 2026-11-24 under our solo-ceremony
                    VK, with deposit tags binding fuel to the funded action, a minting guard making
                    burn and FT-inflation consensus-impossible, and permissionless blank vending —
                    all confirmed on chain.
                </p>
            </div>

            <div class="reveal mt-12">
                <svg viewBox="0 0 960 584" class="h-auto w-full" role="img" aria-label="Role-2 pool architecture: three signature-free inputs — two tagged fuel UTXOs and the state NFT — all spending one program P2SH32 that contains the reviewed sound verifier plus the role-2 hook with the pool rules; outputs are the 169-byte OP_RETURN carrier, the new state NFT, and the unshield payout.">
                    <defs>
                        <marker id="arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                            <path d="M0 0L10 5L0 10z" fill="#7dd3a8" />
                        </marker>
                    </defs>

                    <!-- Private band -->
                    <rect x="40" y="24" width="880" height="80" rx="16" fill="rgba(190,242,100,0.04)" stroke="rgba(190,242,100,0.35)" stroke-dasharray="7 5" />
                    <text x="60" y="50" font-family="Space Mono, monospace" font-size="13" fill="#bef264" letter-spacing="3">PRIVATE — WITNESSES + PROOF, NEVER ON-CHAIN</text>
                    <text x="60" y="76" font-family="Space Mono, monospace" font-size="12" fill="#e2e8f0">notes cm&#7522; · nullifiers nf&#7522; · Groth16 proof 128 B (22.8 s witness)</text>

                    <!-- Arrow: private -> program -->
                    <line x1="480" y1="104" x2="480" y2="138" stroke="#7dd3a8" stroke-width="2" marker-end="url(#arr2)" />
                    <text x="494" y="126" font-family="Space Mono, monospace" font-size="11" fill="#94a3b8">witness + proof ride the unlocking</text>

                    <!-- The one program -->
                    <rect x="230" y="144" width="500" height="168" rx="16" fill="rgba(103,232,249,0.05)" stroke="rgba(103,232,249,0.45)" />
                    <text x="480" y="176" text-anchor="middle" font-family="Space Mono, monospace" font-size="14" fill="#67e8f9" letter-spacing="2">THE ONE PROGRAM — P2SH32 aa203e40…2987</text>
                    <text x="480" y="202" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#cbd5e1">reviewed sound verifier · 27,624 B · roles 1/2/3</text>
                    <text x="480" y="224" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#bef264">role-2 hook = THE POOL RULES · 524 B · 37,198 op</text>
                    <text x="480" y="246" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#94a3b8">carrier binding · tags 4c/4g · nullifier archive · payout</text>
                    <rect x="330" y="262" width="300" height="16" rx="8" fill="rgba(190,242,100,0.14)" />
                    <text x="480" y="274" text-anchor="middle" font-family="Space Mono, monospace" font-size="11" fill="#bef264">signature-free — the script satisfaction IS the authorization</text>

                    <!-- Inputs (left) -->
                    <rect x="40" y="340" width="200" height="56" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
                    <text x="140" y="362" text-anchor="middle" font-family="Space Mono, monospace" font-size="11" fill="#e2e8f0">in0 · FUEL UTXO</text>
                    <text x="140" y="380" text-anchor="middle" font-family="Space Mono, monospace" font-size="10" fill="#94a3b8">tag = SHA256(nf0‖nf1)</text>
                    <rect x="40" y="416" width="200" height="56" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
                    <text x="140" y="438" text-anchor="middle" font-family="Space Mono, monospace" font-size="11" fill="#e2e8f0">in1 · FUEL UTXO</text>
                    <text x="140" y="456" text-anchor="middle" font-family="Space Mono, monospace" font-size="10" fill="#94a3b8">tag = SHA256(nf0‖nf1)</text>
                    <rect x="40" y="492" width="200" height="56" rx="10" fill="rgba(196,141,255,0.05)" stroke="rgba(196,141,255,0.4)" />
                    <text x="140" y="514" text-anchor="middle" font-family="Space Mono, monospace" font-size="11" fill="#c48dff">in2 · STATE NFT</text>
                    <text x="140" y="532" text-anchor="middle" font-family="Space Mono, monospace" font-size="10" fill="#94a3b8">root ‖ nullifier set · FT = balance</text>

                    <!-- Arrows: inputs -> program -->
                    <line x1="240" y1="368" x2="230" y2="250" stroke="#7dd3a8" stroke-width="2" marker-end="url(#arr2)" />
                    <line x1="240" y1="444" x2="230" y2="270" stroke="#7dd3a8" stroke-width="2" marker-end="url(#arr2)" />
                    <line x1="240" y1="520" x2="230" y2="290" stroke="#7dd3a8" stroke-width="2" marker-end="url(#arr2)" />
                    <text x="252" y="470" font-family="Space Mono, monospace" font-size="11" fill="#94a3b8">3 inputs, one locking</text>

                    <!-- Outputs (right) -->
                    <rect x="720" y="340" width="200" height="56" rx="10" fill="rgba(190,242,100,0.05)" stroke="rgba(190,242,100,0.3)" />
                    <text x="820" y="362" text-anchor="middle" font-family="Space Mono, monospace" font-size="11" fill="#bef264">out0 · OP_RETURN carrier</text>
                    <text x="820" y="380" text-anchor="middle" font-family="Space Mono, monospace" font-size="10" fill="#94a3b8">nf0‖nf1‖cm0‖cm1‖root‖pv‖sign</text>
                    <rect x="720" y="416" width="200" height="56" rx="10" fill="rgba(196,141,255,0.05)" stroke="rgba(196,141,255,0.4)" />
                    <text x="820" y="438" text-anchor="middle" font-family="Space Mono, monospace" font-size="11" fill="#c48dff">out1 · NEW STATE NFT</text>
                    <text x="820" y="456" text-anchor="middle" font-family="Space Mono, monospace" font-size="10" fill="#94a3b8">newRoot ‖ newNull · FT = newBalance</text>
                    <rect x="720" y="492" width="200" height="56" rx="10" fill="rgba(103,232,249,0.05)" stroke="rgba(103,232,249,0.4)" />
                    <text x="820" y="514" text-anchor="middle" font-family="Space Mono, monospace" font-size="11" fill="#67e8f9">out2 · PAYOUT (unshield)</text>
                    <text x="820" y="532" text-anchor="middle" font-family="Space Mono, monospace" font-size="10" fill="#94a3b8">pv FT → any address · public by design</text>

                    <!-- Arrows: program -> outputs -->
                    <line x1="730" y1="250" x2="720" y2="368" stroke="#7dd3a8" stroke-width="2" marker-end="url(#arr2)" />
                    <line x1="730" y1="270" x2="720" y2="444" stroke="#7dd3a8" stroke-width="2" marker-end="url(#arr2)" />
                    <line x1="730" y1="290" x2="720" y2="520" stroke="#7dd3a8" stroke-width="2" marker-end="url(#arr2)" />
                    <text x="700" y="470" font-family="Space Mono, monospace" font-size="11" fill="#94a3b8">2 + sign outputs</text>

                    <!-- Bottom strip: chipnet context -->
                    <rect x="120" y="556" width="720" height="24" rx="12" fill="rgba(190,242,100,0.1)" stroke="rgba(190,242,100,0.4)" />
                    <text x="480" y="572" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#bef264">chipnet · deploy 2eaeb97f… block 345,467 · minting guard aa2066a2… · blank vending aa206b51…</text>
                </svg>
            </div>

            <div class="reveal mt-14">
                <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <template v-for="(s, i) in ROLE2_LIFECYCLE" :key="s.stage">
                        <div class="life-stage">
                            <div class="stage-dot" :class="s.cls" :style="{ animationDelay: (i * 2) + 's' }">
                                <span class="font-display text-lg font-extrabold">{{ String(i + 1).padStart(2, '0') }}</span>
                            </div>
                            <h3 class="mt-5 font-display text-xl font-bold text-white">{{ s.stage }}</h3>
                            <p class="mt-1 font-mono text-[0.78rem] uppercase tracking-[0.22em] text-slate-200">{{ s.kicker }}</p>
                            <ul class="life-points" :style="{ '--dot': s.dot }">
                                <li v-for="b in s.bullets" :key="b">{{ b }}</li>
                            </ul>
                            <div class="mt-4 flex flex-wrap justify-center gap-2">
                                <span v-for="m in s.meta" :key="m" class="life-meta">{{ m }}</span>
                            </div>
                            <div class="mt-6 flex justify-center">
                                <a :href="EXPLORER + s.txFull + NETQ" target="_blank" rel="noopener" class="tx-btn tx-btn-lg">
                                    <span class="tx-chip">{{ s.network }}</span>
                                    <span class="tx-id">{{ s.tx }}</span>
                                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3 w-3">
                                        <path d="M7 17L17 7M9 7h8v8" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <p class="reveal mt-8 text-center font-mono text-[0.8rem] leading-relaxed text-slate-200">
                every tx confirmed on chipnet [measured] · each action was broadcast ATOMICALLY with
                its tagged lock (the action spends the lock's unconfirmed outputs — first-seen wins,
                closing the theft window to ~zero) · fees are BARE per the fee policy: 1 sat/B floor,
                fuel prepaid in the lock · Hush lifecycle final state: root 1829766…, balance 750,000, notes at tree 6,7 · the nito.cash browser acceptance then advanced the state to f52008f4… (760,400 FT, 44 leaves) — see Notes Management
            </p>

            <!-- Guard + vending -->
            <div class="reveal mt-14">
                <div class="grid gap-6 lg:grid-cols-2">
                    <div v-for="infra in ROLE2_INFRA" :key="infra.title" class="fact-card">
                        <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-lime-200">{{ infra.kicker }}</p>
                        <h3 class="mt-3 font-display text-xl font-bold text-white">{{ infra.title }}</h3>
                        <p class="mt-3 text-sm leading-relaxed text-slate-100">{{ infra.body }}</p>
                        <div class="mt-5 flex flex-wrap gap-3">
                            <a v-for="b in infra.buttons" :key="b.href" :href="b.href" target="_blank" rel="noopener" class="tx-btn">
                                <span class="tx-chip">tx</span>
                                <span class="tx-id">{{ b.label }}</span>
                                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3 w-3">
                                    <path d="M7 17L17 7M9 7h8v8" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <p class="reveal mt-8 text-center font-mono text-[0.8rem] leading-relaxed text-slate-200">
                client integration: the nito.cash browser acceptance PASSED — SHIELD 1ca58773… → TRANSFER
                50644d00… → UNSHIELD f52008f4…, registry live, CI green. The next client surface is the
                3-out v3 (201-B carrier, 9-field actionHash, new VK/MPC) — the verifier and hook are
                built and a chipnet demo is live; see Notes Management ·
                <a href="https://github.com/APECSdev/hushyourmoney/blob/master/docs/ROLE2-BROWSER-ACCEPTANCE-HANDOFF-2026-11-26.md" target="_blank" rel="noopener" class="src-link">browser acceptance handoff ↗</a> ·
                <a href="https://github.com/APECSdev/hushyourmoney/blob/master/docs/ROLE2-3OUT-V3-DESIGN.md" target="_blank" rel="noopener" class="src-link">v3 design ↗</a>
            </p>
        </section>

        <!-- ── Featured: MAINNET matrix (PREP → GENESIS → DEPLOY → TRANSFER) ── -->
        <section id="mainnet-matrix" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">live · mainnet</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    Live on Bitcoin Cash mainnet
                </h2>
                <p class="mt-3 font-mono text-xs text-slate-200">real PUSD · real Groth16 proof · every stage linked to its mainnet transaction [measured] · the first generation's architecture, demo grade</p>
            </div>

            <div class="reveal mt-14">
                <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <template v-for="(s, i) in MAINNET_LIFECYCLE" :key="s.stage">
                        <div class="life-stage">
                            <div class="stage-dot" :class="s.cls" :style="{ animationDelay: (i * 2) + 's' }">
                                <span class="font-display text-lg font-extrabold">{{ String(i + 1).padStart(2, '0') }}</span>
                            </div>
                            <h3 class="mt-5 font-display text-xl font-bold text-white">{{ s.stage }}</h3>
                            <p class="mt-1 font-mono text-[0.78rem] uppercase tracking-[0.22em] text-slate-200">{{ s.kicker }}</p>
                            <ul class="life-points" :style="{ '--dot': s.dot }">
                                <li v-for="b in s.bullets" :key="b">{{ b }}</li>
                            </ul>
                            <div class="mt-4 flex flex-wrap justify-center gap-2">
                                <span v-for="m in s.meta" :key="m" class="life-meta">{{ m }}</span>
                            </div>
                            <div class="mt-6 flex justify-center">
                                <a :href="EXPLORER + s.txFull + MAINNET_NETQ" target="_blank" rel="noopener" class="tx-btn tx-btn-lg">
                                    <span class="tx-chip">{{ s.network }}</span>
                                    <span class="tx-id">{{ s.tx }}</span>
                                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3 w-3">
                                        <path d="M7 17L17 7M9 7h8v8" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <p class="reveal mt-8 text-center font-mono text-[0.8rem] leading-relaxed text-slate-200">
                all four txs broadcast on BCH mainnet, 2026-11-20 [measured] · setup grade:
                <strong class="text-slate-200">demo — solo 1-of-1 ceremony, entropy published</strong>
                (c490ce06…17b931) · production remains gated on the
                <NuxtLink to="/ceremony" class="src-link">public ceremony</NuxtLink>
            </p>
        </section>

        <!-- ── Featured: the lifecycle (SHIELD → TRANSFER → UNSHIELD) ── -->
        <section id="lifecycle" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">01 · the first lifecycle · chipnet 2026-10</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    Shield, Transfer, Unshield
                </h2>
                <p class="mt-3 font-mono text-xs text-slate-200">the sibling-split generation's first full pass through the pool — every stage linked to the transaction that performed it [measured]</p>
            </div>

            <div class="reveal mt-14 overflow-x-auto">
                <div class="flex min-w-[680px] items-start px-1">
                    <template v-for="(s, i) in LIFECYCLE" :key="s.stage">
                        <div class="life-stage">
                            <div class="stage-dot" :class="s.cls" :style="{ animationDelay: (i * 2) + 's' }">
                                <span class="font-display text-lg font-extrabold">{{ String(i + 1).padStart(2, '0') }}</span>
                            </div>
                            <h3 class="mt-5 font-display text-xl font-bold text-white">{{ s.stage }}</h3>
                            <p class="mt-1 font-mono text-[0.78rem] uppercase tracking-[0.22em] text-slate-200">{{ s.kicker }}</p>
                            <ul class="life-points" :style="{ '--dot': s.dot }">
                                <li v-for="b in s.bullets" :key="b">{{ b }}</li>
                            </ul>
                            <div class="mt-4 flex flex-wrap justify-center gap-2">
                                <span v-for="m in s.meta" :key="m" class="life-meta">{{ m }}</span>
                            </div>
                            <div class="mt-6 flex justify-center">
                                <a :href="EXPLORER + s.txFull + NETQ" target="_blank" rel="noopener" class="tx-btn tx-btn-lg">
                                    <span class="tx-chip">{{ s.network }}</span>
                                    <span class="tx-id">{{ s.tx }}</span>
                                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3 w-3">
                                        <path d="M7 17L17 7M9 7h8v8" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div v-if="i < LIFECYCLE.length - 1" class="life-flow hidden md:block">
                            <span class="pulse" :class="i === 0 ? '' : i === 1 ? 'p2' : 'p3'"></span>
                        </div>
                    </template>
                </div>
            </div>

            <p class="reveal mt-8 text-center font-mono text-[0.8rem] leading-relaxed text-slate-200">
                all three txs confirmed on chipnet [measured] · the mainnet matrix above ran the same
                circuit and covenant with real PUSD · production deployment remains gated on the
                <NuxtLink to="/ceremony" class="src-link">trusted-setup ceremony</NuxtLink>
            </p>
        </section>

        <!-- ── What this is ── -->
        <section class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr]">
                <div class="reveal">
                    <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">02 · what this is</p>
                    <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                        Payments that<br />leave no trace
                    </h2>
                </div>

                <div class="reveal space-y-6 text-base leading-relaxed text-slate-100 sm:text-lg" style="transition-delay: 0.12s">
                    <p>
                        The pool is a <strong class="font-semibold text-white">join-split state machine</strong>:
                        users deposit CashTokens publicly (<strong class="font-semibold text-white">SHIELD</strong>),
                        move them privately between notes (<strong class="font-semibold text-white">TRANSFER</strong>),
                        and withdraw them publicly (<strong class="font-semibold text-white">UNSHIELD</strong>).
                        Inside the pool, notes are commitments — value, owner and history are never
                        visible on-chain.
                    </p>
                    <p>
                        Every operation is authorized by a <strong class="font-semibold text-white">Groth16 zero-knowledge
                        proof</strong> that the transition is honest: spent notes existed in the pool's Merkle
                        tree, their nullifiers are unique, value is conserved per asset, and only the
                        owner could spend. The chain stores just two public inputs per proof:
                        the tree root and a hash binding the whole action.
                    </p>
                    <ul class="mt-4 space-y-3 text-sm sm:text-base">
                        <li class="flex gap-3">
                            <span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-300"></span>
                            <span><strong class="text-white">Works on today's scripting:</strong> the full verifier runs as one standard transaction on the BCH 2026 VM — no CHIP, no fork, no new opcodes.</span>
                        </li>
                        <li class="flex gap-3">
                            <span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300"></span>
                            <span><strong class="text-white">Asset-generic by construction:</strong> the CashToken category is a private witness — the same circuit and verifying key serve any token.</span>
                        </li>
                        <li class="flex gap-3">
                            <span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300"></span>
                            <span><strong class="text-white">Not a black box:</strong> covenant + verifier + circuit are all reproducible from source; the gate trail below is linked on-chain.</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Architecture -->
            <div id="architecture" class="reveal mt-24 text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">03 · the machine</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">Architecture</h2>
                <p class="mt-3 font-mono text-xs text-slate-200">generation 1 — verifier as sibling inputs · rendered from GENERALIZED-SHIELDING.md / COVENANT-DESIGN.md · the current generation is diagrammed in the role-2 section above</p>
            </div>

            <div class="reveal mt-12">
                <svg viewBox="0 0 960 520" class="h-auto w-full" role="img" aria-label="Shielded pool architecture: private witnesses feed the Groth16 circuit, whose two public inputs bind the covenant state machine and the on-chain verifier on chipnet.">
                    <defs>
                        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                            <path d="M0 0L10 5L0 10z" fill="#7dd3a8" />
                        </marker>
                    </defs>

                    <!-- Private band -->
                    <rect x="40" y="28" width="880" height="104" rx="16" fill="rgba(190,242,100,0.04)" stroke="rgba(190,242,100,0.35)" stroke-dasharray="7 5" />
                    <text x="60" y="56" font-family="Space Mono, monospace" font-size="13" fill="#bef264" letter-spacing="3">PRIVATE — WITNESSES, NEVER ON-CHAIN</text>
                    <rect x="64" y="74" width="272" height="38" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
                    <text x="200" y="98" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#e2e8f0">C&#7522; = Poseidon(value, &#961;, r, pk)</text>
                    <rect x="356" y="74" width="248" height="38" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
                    <text x="480" y="98" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#e2e8f0">nf&#7522; = H(nullifierKey, &#961;)</text>
                    <rect x="624" y="74" width="272" height="38" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
                    <text x="760" y="98" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#e2e8f0">encrypted tag &#8594; receiver scan</text>

                    <!-- Arrow: private -> circuit -->
                    <line x1="480" y1="132" x2="480" y2="176" stroke="#7dd3a8" stroke-width="2" marker-end="url(#arr)" />
                    <text x="494" y="160" font-family="Space Mono, monospace" font-size="11" fill="#94a3b8">witnesses</text>

                    <!-- Circuit band -->
                    <rect x="200" y="182" width="560" height="120" rx="16" fill="rgba(103,232,249,0.05)" stroke="rgba(103,232,249,0.45)" />
                    <text x="480" y="214" text-anchor="middle" font-family="Space Mono, monospace" font-size="14" fill="#67e8f9" letter-spacing="2">GROTH16 JOINSPLIT CIRCUIT — pool.circom</text>
                    <text x="480" y="240" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#cbd5e1">183,472 constraints · 2 public inputs · BN254</text>
                    <text x="480" y="262" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#94a3b8">Merkle membership · value conservation · spend authorization</text>
                    <rect x="330" y="276" width="300" height="16" rx="8" fill="rgba(103,232,249,0.14)" />
                    <text x="480" y="288" text-anchor="middle" font-family="Space Mono, monospace" font-size="11" fill="#67e8f9">public: [merkleRoot, actionHash]</text>

                    <!-- Arrows: circuit -> covenant / verifier -->
                    <line x1="330" y1="302" x2="270" y2="346" stroke="#7dd3a8" stroke-width="2" marker-end="url(#arr)" />
                    <text x="118" y="332" font-family="Space Mono, monospace" font-size="11" fill="#94a3b8">actionHash</text>
                    <line x1="630" y1="302" x2="690" y2="346" stroke="#7dd3a8" stroke-width="2" marker-end="url(#arr)" />
                    <text x="716" y="332" font-family="Space Mono, monospace" font-size="11" fill="#94a3b8">proof</text>

                    <!-- Covenant box -->
                    <rect x="60" y="352" width="420" height="116" rx="16" fill="rgba(196,141,255,0.05)" stroke="rgba(196,141,255,0.45)" />
                    <text x="270" y="382" text-anchor="middle" font-family="Space Mono, monospace" font-size="14" fill="#c48dff" letter-spacing="2">ASSETPOOL COVENANT</text>
                    <text x="270" y="406" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#cbd5e1">P2SH32 · 347 B redeem (category = ctor param)</text>
                    <text x="270" y="428" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#94a3b8">state NFT { merkleRoot, nullifierSet }</text>
                    <text x="270" y="450" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#94a3b8">6-input / 7-output tx shape</text>

                    <!-- Verifier box -->
                    <rect x="540" y="352" width="360" height="116" rx="16" fill="rgba(255,255,255,0.04)" stroke="rgba(226,232,240,0.4)" />
                    <text x="720" y="382" text-anchor="middle" font-family="Space Mono, monospace" font-size="14" fill="#e2e8f0" letter-spacing="2">ON-CHAIN GROTH16 VERIFIER</text>
                    <text x="720" y="406" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#cbd5e1">35,626 B · one standard tx · BCH 2026 VM</text>
                    <text x="720" y="428" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#94a3b8">vk_x recomputed in-script</text>
                    <text x="720" y="450" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#94a3b8">5 sibling step-inputs</text>

                    <!-- Arrows: covenant + verifier -> chipnet -->
                    <line x1="270" y1="468" x2="430" y2="500" stroke="#7dd3a8" stroke-width="2" marker-end="url(#arr)" />
                    <line x1="720" y1="468" x2="560" y2="500" stroke="#7dd3a8" stroke-width="2" marker-end="url(#arr)" />

                    <!-- Chipnet strip -->
                    <rect x="280" y="492" width="400" height="24" rx="12" fill="rgba(190,242,100,0.1)" stroke="rgba(190,242,100,0.4)" />
                    <text x="480" y="508" text-anchor="middle" font-family="Space Mono, monospace" font-size="12" fill="#bef264">Bitcoin Cash chipnet — no fork · CashTokens · P2SH32</text>
                </svg>
            </div>

            <!-- One operation -->
            <div class="mt-14 grid gap-6 md:grid-cols-3">
                <div class="step-card reveal">
                    <div class="step-num text-lime-300">1</div>
                    <h3 class="mt-4 font-display text-lg font-bold text-white">Prove</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-200">
                        The wallet builds the action locally, generates the Groth16 witness
                        and proof — 22.8 s measured for the deployed role-2 witness under our
                        ceremony zkey (16.967 s for the same circuit on the build runner) —
                        and assembles one transaction.
                    </p>
                </div>

                <div class="step-card reveal" style="transition-delay: 0.12s">
                    <div class="step-num text-cyan-300">2</div>
                    <h3 class="mt-4 font-display text-lg font-bold text-white">Verify</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-200">
                        The action has three inputs, all spending the one program P2SH32 — the
                        reviewed sound verifier (27,624 B) runs inside it, and the role-2 hook
                        checks the pool rules in the same script. No signature: the script
                        satisfaction is the authorization.
                    </p>
                </div>

                <div class="step-card reveal" style="transition-delay: 0.24s">
                    <div class="step-num text-violet-300">3</div>
                    <h3 class="mt-4 font-display text-lg font-bold text-white">Settle</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-200">
                        The hook recomputes the actionHash from the on-chain carrier and binds
                        it to the proof, archives the nullifiers, adopts the new tree root in
                        the state NFT and pays the unshield leg — all in the same transaction.
                    </p>
                </div>
            </div>
        </section>

        <!-- ── Measured results ── -->
        <section id="results" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">04 · the numbers</p>
                <h2 class="mt-3 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">Measured Results</h2>
                <p class="mt-2 font-mono text-xs text-slate-200">[ measured ] = live measurement with a recorded source · nothing on this page is estimated</p>
            </div>

            <div class="reveal mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
                <table class="data-table min-w-[720px]">
                    <thead>
                        <tr>
                            <th scope="col">quantity</th>
                            <th scope="col">value</th>
                            <th scope="col">source</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="r in RESULTS" :key="r.q">
                            <td class="whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-wider text-slate-200">{{ r.q }}</td>
                            <td class="text-slate-100">{{ r.v }}</td>
                            <td class="font-mono text-[0.82rem] text-slate-200">
                                <a v-if="r.href" :href="r.href" target="_blank" rel="noopener" class="src-link">{{ r.src }} ↗</a>
                                <span v-else>{{ r.src }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p class="reveal mt-4 font-mono text-[0.8rem] leading-relaxed text-slate-200">
                build records: APECSdev/pusd-shielded-pool (CHIPNET.md · wip-role2-hook/STATUS.md) · hushyourmoney (POOL-DEPLOYMENT.md §15–§18) — measured on chipnet 2026-10/11 and 2026-11-24.
            </p>
        </section>

        <!-- ── Evidence: gates ── -->
        <section id="evidence" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-violet-200">05 · the trail</p>
                <h2 class="mt-3 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">Gate-by-Gate Evidence</h2>
                <p class="mt-2 font-mono text-xs text-slate-200">seven launch gates · six passed · one in design</p>
            </div>

            <div class="mt-10 space-y-4">
                <div v-for="(g, i) in GATES" :key="g.gate" class="gate-card reveal" :style="{ transitionDelay: (i * 0.06) + 's' }">
                    <div class="flex flex-wrap items-center gap-3">
                        <span class="gate-chip" :class="g.status === 'confirmed' ? 'gate-done' : g.status === 'in-flight' ? 'gate-live' : 'gate-wait'">{{ g.gate }}</span>
                        <h3 class="font-display text-base font-bold text-white sm:text-lg">{{ g.title }}</h3>
                        <span class="ml-auto badge" :class="g.status === 'confirmed' ? 'badge-done' : g.status === 'in-flight' ? 'badge-live' : 'badge-wait'">
                            {{ g.status === 'confirmed' ? 'passed' : g.status === 'in-flight' ? 'in flight' : 'in design' }}
                        </span>
                    </div>
                    <p class="mt-3 text-sm leading-relaxed text-slate-200">{{ g.result }}</p>
                    <div class="mt-4 flex flex-wrap gap-3">
                        <a v-if="g.href" :href="g.href" target="_blank" rel="noopener" class="tx-btn">
                            <span class="tx-chip">tx</span>
                            <span class="tx-id">{{ g.hrefLabel }}</span>
                            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3 w-3">
                                <path d="M7 17L17 7M9 7h8v8" />
                            </svg>
                        </a>
                        <NuxtLink v-if="g.to" :to="g.to" class="tx-btn tx-btn-ghost">
                            <span class="tx-chip">gate 7</span>
                            <span class="tx-id">the Hush Ceremony</span>
                            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3 w-3">
                                <path d="M5 12h14M13 6l6 6-6 6" />
                            </svg>
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── Live pools ── -->
        <section id="pools" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">06 · on-chain state</p>
                <h2 class="mt-3 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">Live Pools</h2>
                <p class="mt-2 font-mono text-xs text-slate-200">from pool-registry.json · chipnet</p>
            </div>

            <div class="mt-10 grid gap-6 lg:grid-cols-2">
                <div v-for="p in POOLS" :key="p.name" class="pool-card reveal">
                    <div class="flex items-center justify-between gap-3">
                        <h3 class="font-mono text-sm text-lime-300">{{ p.name }}</h3>
                        <span class="badge" :class="p.badge">{{ p.badgeLabel }}</span>
                    </div>
                    <dl class="mt-4 space-y-2.5 font-mono text-[0.82rem] leading-relaxed">
                        <div class="flex gap-3">
                            <dt class="w-24 shrink-0 uppercase tracking-widest text-slate-200">category</dt>
                            <dd class="break-all text-slate-100"><a :href="EXPLORER + p.catFull + NETQ" target="_blank" rel="noopener" class="src-link">{{ p.cat }}</a></dd>
                        </div>
                        <div class="flex gap-3">
                            <dt class="w-24 shrink-0 uppercase tracking-widest text-slate-200">locking</dt>
                            <dd class="break-all text-slate-100" :title="p.lockingFull">{{ p.locking }}</dd>
                        </div>
                        <div class="flex gap-3">
                            <dt class="w-24 shrink-0 uppercase tracking-widest text-slate-200">tree root</dt>
                            <dd class="break-all text-slate-100">{{ p.root }}</dd>
                        </div>
                        <div class="flex gap-3">
                            <dt class="w-24 shrink-0 uppercase tracking-widest text-slate-200">first tx</dt>
                            <dd class="break-all text-slate-100">
                                {{ p.firstOp }} ·
                                <a :href="EXPLORER + p.txFull + NETQ" target="_blank" rel="noopener" class="src-link">{{ p.tx }} ↗</a>
                            </dd>
                        </div>
                    </dl>
                    <p v-if="p.note" class="mt-4 border-t border-white/10 pt-4 text-[0.82rem] leading-relaxed text-slate-200">
                        {{ p.note }}
                    </p>
                </div>
            </div>

            <p class="reveal mt-6 text-sm leading-relaxed text-slate-200">
                A fifth pool (Gate 6b) demonstrates the full two-asset lifecycle — SHIELD A, SHIELD B,
                TRANSFER, UNSHIELD — on a single multi-asset instance; its operations were VM-verified and
                broadcast 2026-11-10/11 but never confirmed: the op set was RBF-replaced with a fresh set
                and the replacements also remain unconfirmed on chain, so there is no explorer link.
                Full registry: <a href="https://github.com/APECSdev/hushyourmoney/blob/master/pool-registry.json" target="_blank" rel="noopener" class="src-link">pool-registry.json ↗</a>
            </p>
        </section>

        <!-- ── Notes Management: the 3-out v3 ── -->
        <section id="notes-management" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">07 · notes management</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    Notes Management<br />The 3-Output Generation
                </h2>
                <p class="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-slate-100 sm:text-lg">
                    The current pool is <strong class="font-semibold text-white">2-in / 2-out</strong>. The v3
                    <strong class="font-semibold text-white">3-out</strong> circuit adds one output note:
                    a SHIELD can create two wallet-owned notes plus the Hush change in one action, and a
                    TRANSFER can split change cleanly. It is the <strong class="font-semibold text-white">note-management
                    layer</strong>, not the whole solution — the deposit path, a real nullifier set and
                    encrypted note delivery are the v3 core. The 3-out is measured <strong class="font-semibold text-white">and
                    deployed as a chipnet demo</strong>: the SHIELD, TRANSFER and UNSHIELD are confirmed.
                </p>
            </div>

            <div class="mt-12 grid gap-6 md:grid-cols-3">
                <div class="fact-card reveal">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-lime-200">measured · 2026-11-26</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">184,528 constraints</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        The 3-out circuit adds one note: <strong class="text-white">+1,056 constraints
                        (+0.58%)</strong> over the 183,472 2-out circuit. 2 public inputs, 112 private
                        inputs, 20.2 s compile, r1cs 39,449,264 B, wasm 3,380,815 B.
                    </p>
                    <p class="mt-3 font-mono text-xs leading-relaxed text-slate-200">circuits/pool3.circom · circom 2.2.3 · apecsdev</p>
                </div>
                <div class="fact-card reveal" style="transition-delay: 0.1s">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-cyan-200">the carrier grows</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">201 B · 9 fields</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        The carrier grows 169 → <strong class="text-white">201 B</strong>; the actionHash
                        grows 8 → <strong class="text-white">9 fields</strong> (cm2); the action grows
                        +32 B. The 2-public-input verifier contract is unchanged.
                    </p>
                    <p class="mt-3 font-mono text-xs leading-relaxed text-slate-200">cm2 is bound exactly as cm0/cm1</p>
                </div>
                <div class="fact-card reveal" style="transition-delay: 0.2s">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-rose-200">the gate</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">A new setup</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        The 1-of-1 demo setup is built (new VK d4ed12ee…, zkey b0177dbe…, wasm c806e561…);
                        the 3-out verifier program, the 201-B hook, the 9-field actionHash and the 3-out
                        witness are built and measured. The new MPC (Gate 7) and the Nito client UI/assets/blank
                        path remain pending; the 3-out witness path is built and byte-exact. A demo pool is deployed on chipnet.
                    </p>
                    <p class="mt-3 font-mono text-xs leading-relaxed text-slate-200">demo ≠ mainnet · Gate 7 is the gate</p>
                </div>
            </div>

            <div class="mt-10 grid gap-6 md:grid-cols-2">
                <div class="fact-card reveal">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-lime-200">measured · the 3-out program</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">Built under the new VK</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        Plain sound verifier <strong class="text-white">7,310 B</strong> sha256
                        <span class="font-mono text-xs">6ec7ca8e…</span> (6.01% standard margin); hooked
                        program <strong class="text-white">7,848 B</strong> sha256
                        <span class="font-mono text-xs">628207b1…</span>, locking
                        <span class="font-mono text-xs">aa200240…</span>; hook
                        <strong class="text-white">39,082 / 37,930 op</strong> (537 B of role-2 code);
                        acceptance <strong class="text-white">21/21</strong>; red team
                        <strong class="text-white">146 / 0</strong>; sweep <strong class="text-white">69 / 69</strong>
                        (min 6.00% standard, input 2). The 2-out hooked program is byte-identical after
                        the carrier change (sha256 <span class="font-mono text-xs">d71851a1…</span>).
                    </p>
                    <p class="mt-3 font-mono text-xs leading-relaxed text-slate-200">POOL_3OUT=1 · apecsdev · 2026-11-26</p>
                </div>
                <div class="fact-card reveal" style="transition-delay: 0.1s">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-cyan-200">deployed · chipnet demo</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">Three confirmed 3-out actions</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        Category <span class="font-mono text-xs">bc607a96…</span>; deploy
                        <span class="font-mono text-xs">2f650791…</span>; program 7,848 B sha256
                        <span class="font-mono text-xs">73cb0ccb…</span>, locking
                        <span class="font-mono text-xs">aa204a6c…</span>. SHIELD
                        <span class="font-mono text-xs">e847ef56…</span> (28,326 B, 1.059 sat/B, out
                        400+300+300) → TRANSFER <span class="font-mono text-xs">ef64f3dd…</span> (28,389 B,
                        1.057 sat/B, spends notes 2+3, out 280+210+210) → UNSHIELD 300
                        <span class="font-mono text-xs">ec31a41c…</span> (28,368 B, 1.022 sat/B, spends
                        notes 4+5, out 112+84+84, 300 FT payout at :2). Final state 700 FT; notes
                        210 / 210 / 112 / 84 / 84; 11 leaves. Every input VM-ACCEPTED consensus + standard.
                    </p>
                    <div class="mt-5 flex flex-wrap gap-3">
                        <a href="https://explorer.selene.cash/tx/2f65079182cf1ecd736e897afad741b9218c6afd16f711042ba4cacf5dd8aa7e?network=chipnet" target="_blank" rel="noopener" class="tx-btn">
                            <span class="tx-chip">chipnet</span><span class="tx-id">deploy 2f650791…</span>
                        </a>
                        <a href="https://explorer.selene.cash/tx/e847ef567bd06ec6585e4d7384d0eb28ca77913c7b8813beb52a9194e83017e0?network=chipnet" target="_blank" rel="noopener" class="tx-btn">
                            <span class="tx-chip">chipnet</span><span class="tx-id">3-out shield e847ef56…</span>
                        </a>
                        <a href="https://explorer.selene.cash/tx/ef64f3dda71ed0110f488ea366e8fab79ff214649586c00ccba14d12da46e325?network=chipnet" target="_blank" rel="noopener" class="tx-btn">
                            <span class="tx-chip">chipnet</span><span class="tx-id">3-out transfer ef64f3dd…</span>
                        </a>
                        <a href="https://explorer.selene.cash/tx/ec31a41c591c4af4ad95c2fab76c1ad2bb34b483393bce53758982a9d8e9de03?network=chipnet" target="_blank" rel="noopener" class="tx-btn">
                            <span class="tx-chip">chipnet</span><span class="tx-id">3-out unshield ec31a41c…</span>
                        </a>
                    </div>
                </div>
            </div>

            <div class="reveal mt-10 fact-card">
                <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-lime-200">the note shapes</p>
                <pre class="mt-4 overflow-x-auto font-mono text-[0.75rem] leading-relaxed text-slate-100">2-out (current)                     3-out (v3 demo, chipnet)
in0 ─┐                              in0 ─┐
in1 ─┴─▶ out0, out1                  in1 ─┴─▶ out0, out1, out2
        wallet note + change                  wallet note + wallet note + change</pre>
                <p class="mt-4 text-sm leading-relaxed text-slate-100">
                    The 3-out is the note-management layer: it lets a SHIELD create two wallet-owned
                    notes plus the Hush change in one action, and lets a TRANSFER split change cleanly.
                    It is <strong class="text-white">not</strong> the onboarding fix — the deposit path is.
                </p>
            </div>

            <div class="mt-10 grid gap-6 md:grid-cols-2">
                <div class="fact-card reveal">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-lime-200">01 · shield</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">A public deposit becomes notes</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        The current 2-out SHIELD needs two in-notes; the 3-out lets one action create two
                        wallet-owned notes plus the Hush change. The onboarding fix is the deposit path,
                        not the 3-out.
                    </p>
                </div>
                <div class="fact-card reveal" style="transition-delay: 0.1s">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-cyan-200">02 · transfer</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">Notes change hands privately</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        The browser acceptance's 400 FT recipient note is <strong class="text-rose-200">undelivered</strong>;
                        the 169-B carrier has no encrypted note. The 201-B 3-out carrier still cannot carry
                        a full note; the off-chain channel is the missing piece.
                    </p>
                </div>
                <div class="fact-card reveal">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-violet-200">03 · unshield</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">A note becomes a public payout</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        The 600 FT payout at <span class="font-mono text-xs">f52008f4…:2</span> is the
                        successful unshield; the public leg is public by design.
                    </p>
                </div>
                <div class="fact-card reveal" style="transition-delay: 0.1s">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-lime-200">04 · change</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">Change without spending the first note</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        Two wallet-A notes + the Hush change in one SHIELD; the 2-out circuit forces the
                        one-note workaround. This is the note-management win.
                    </p>
                </div>
            </div>

            <div class="mt-10 grid gap-6 md:grid-cols-2">
                <div class="fact-card reveal">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-lime-200">v3 core · onboarding</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">The deposit path</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        0-in/2-out; public FT deposit; signed deposit input; two private notes; no prior
                        pool notes. <strong class="text-white">DESIGN — UNMEASURED.</strong>
                    </p>
                </div>
                <div class="fact-card reveal" style="transition-delay: 0.1s">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-rose-200">v3 core · double-spend</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">A real nullifier set</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        The current state is <span class="font-mono text-xs">root ‖ rolling nullifier hash</span>;
                        hook check 7 only folds; the spent bootstrap notes were reusable. The v3 needs a
                        Merkle nullifier tree with membership. <strong class="text-white">DESIGN — UNMEASURED.</strong>
                    </p>
                </div>
                <div class="fact-card reveal">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-cyan-200">v3 core · usability</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">Encrypted note delivery</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        The 400 FT transfer note is undelivered; the carrier cannot carry it. NIP-44/Nostr
                        or a dedicated channel; recovery from the seed. <strong class="text-white">DESIGN — UNMEASURED.</strong>
                    </p>
                </div>
                <div class="fact-card reveal" style="transition-delay: 0.1s">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-lime-200">v3 core · note management</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">The 3-out circuit</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        Measured and deployed as a chipnet demo: SHIELD <span class="font-mono text-xs">e847ef56…</span>,
                        TRANSFER <span class="font-mono text-xs">ef64f3dd…</span> and UNSHIELD
                        <span class="font-mono text-xs">ec31a41c…</span> confirmed. It is not a
                        substitute for onboarding, the nullifier set or note delivery.
                    </p>
                </div>
            </div>

            <div class="mt-10 grid gap-6 lg:grid-cols-2">
                <div class="fact-card reveal">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-lime-200">measured · the browser acceptance</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">The second lifecycle</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        SHIELD <span class="font-mono text-xs">1ca58773…</span> (27,773 B) → TRANSFER
                        <span class="font-mono text-xs">50644d00…</span> (28,157 B) → UNSHIELD
                        <span class="font-mono text-xs">f52008f4…</span> (28,036 B). State
                        <span class="font-mono text-xs">f52008f4…:1</span> = 760,400 FT; payout
                        <span class="font-mono text-xs">:2</span> = 600 FT; wallet A = 19,986,800 + 600 FT,
                        128,323 plain, 0 blanks; pool history 48.
                    </p>
                    <div class="mt-5 flex flex-wrap gap-3">
                        <a href="https://explorer.selene.cash/tx/1ca587730fece8eabfea6eedf077ac7cd9a683610a0c6779ce5328616b09032d?network=chipnet" target="_blank" rel="noopener" class="tx-btn">
                            <span class="tx-chip">chipnet</span><span class="tx-id">shield 1ca58773…</span>
                        </a>
                        <a href="https://explorer.selene.cash/tx/50644d00b5aec5e7bd92bfda87371ab252f0a11c365909ef69dd66512f0fadac?network=chipnet" target="_blank" rel="noopener" class="tx-btn">
                            <span class="tx-chip">chipnet</span><span class="tx-id">transfer 50644d00…</span>
                        </a>
                        <a href="https://explorer.selene.cash/tx/f52008f44999f05261a905f8120900888a233e07d7cd489574909d51d0232b70?network=chipnet" target="_blank" rel="noopener" class="tx-btn">
                            <span class="tx-chip">chipnet</span><span class="tx-id">unshield f52008f4…</span>
                        </a>
                    </div>
                    <p class="mt-4 text-sm leading-relaxed text-slate-100">
                        Two caveats: the 400 FT transfer note is undelivered; four failed locks
                        (1,200 FT + 120,000 sats) are stuck; the one public lock
                        (<span class="font-mono text-xs">3db76294…</span>, 1,000 FT + 30,000 sats) is sweepable.
                    </p>
                </div>
                <div class="fact-card reveal" style="transition-delay: 0.1s">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-cyan-200">the migration</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">Current pool → v3</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        The 3-out demo pool is deployed; the Hush 750,000 notes and the wallet A notes still
                        need to re-shield into it. The four stuck locks remain; the one public lock is swept;
                        the new MPC (Gate 7), the deposit path, the nullifier set and note delivery are the
                        gate. The current 2-out pool stays as a read-only historical record.
                    </p>
                </div>
            </div>

            <div class="reveal mt-10 rounded-2xl border border-lime-300/25 bg-lime-300/5 px-5 py-5 font-mono text-xs leading-relaxed text-lime-100">
                the 3-out is measured and deployed as a chipnet demo · the new MPC (Gate 7) is the mainnet
                gate · the verifier/hook/witness are built; the Nito client witness path is built and byte-exact, the UI/assets/blanks remain · the deposit path,
                the nullifier set and note delivery are the v3 core · the community presentation is
                docs/ROLE2-3OUT-V3-DESIGN.md
            </div>

            <p class="reveal mt-8 text-center font-mono text-[0.8rem] leading-relaxed text-slate-200">
                sources: <a href="https://github.com/APECSdev/hushyourmoney/blob/master/docs/ROLE2-3OUT-V3-DESIGN.md" target="_blank" rel="noopener" class="src-link">ROLE2-3OUT-V3-DESIGN.md ↗</a> ·
                <a href="https://github.com/APECSdev/pusd-shielded-pool/blob/master/circuits/pool3.circom" target="_blank" rel="noopener" class="src-link">pool3.circom ↗</a> ·
                <a href="https://github.com/APECSdev/hushyourmoney/blob/master/docs/ROLE2-BROWSER-ACCEPTANCE-HANDOFF-2026-11-26.md" target="_blank" rel="noopener" class="src-link">browser acceptance handoff ↗</a> ·
                <a href="https://github.com/APECSdev/hushyourmoney/blob/master/docs/ROLE2-BROWSER-ACCEPTANCE-REVIEW-2026-11-26.md" target="_blank" rel="noopener" class="src-link">Hush review ↗</a> ·
                <a href="https://github.com/APECSdev/hushyourmoney/blob/master/docs/ROLE2-BROWSER-ACCEPTANCE-REVIEW-RESPONSE-2026-11-26.md" target="_blank" rel="noopener" class="src-link">nito response ↗</a>
            </p>
        </section>

        <!-- ── Partner integration: the dead pool ── -->
        <section id="integration" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">08 · integration</p>
                <h2 class="mt-3 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    What a Partner<br />Integration Taught Us
                </h2>
                <p class="mt-5 max-w-3xl text-base leading-relaxed text-slate-100 sm:text-lg">
                    The nito.cash wallet was the first client built on this pool. Its first deployment
                    was confirmed on chain and <strong class="font-semibold text-white">unusable</strong>.
                    That failure is more instructive than any green gate row, so it is recorded here in
                    full rather than quietly replaced.
                </p>
            </div>

            <div class="mt-12 grid gap-6 lg:grid-cols-2">
                <div class="fact-card reveal">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-rose-200">the failure</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">A pool nobody could spend</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        <span class="font-mono text-xs text-rose-200">chipnet-pusd-v2</span> deployed fine —
                        correct covenant, correct state NFT, correct verifying key. Its five step scripts,
                        though, were the <em>five-input test fixture</em>: the terminal pinned
                        <span class="font-mono text-xs">inputs == 5</span> and the executor scripts read
                        input 3 as the genesis witness. Every wallet action emits <strong>seven</strong>
                        inputs. No proof, however valid, could ever satisfy those scripts.
                    </p>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        Verified on chain: the pool UTXO is still the deploy output, unspent since block
                        343322, and the covenant's address history holds exactly one entry — the deploy.
                        Zero actions in ~1,340 blocks.
                    </p>
                </div>

                <div class="fact-card reveal" style="transition-delay: 0.1s">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-cyan-200">the cause</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">The verifier is a loader</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        The Groth16 verifier is split across five inputs, and three of them load an
                        <strong>assembled shared program</strong> carried as data inside their witnesses —
                        hashed, defined as function 100, and invoked at runtime. The transaction layout is
                        therefore baked in three times: in the redeems, in the generator sources, and in the
                        assembled program's own dispatch.
                    </p>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        That third layer is <strong>invisible to byte comparison</strong> — the fragments are
                        witness data, so two builds look identical and the divergence only exists at runtime.
                        Four attempts failed on chain while every static diff came back clean. The fix was
                        30 size-preserving source edits across five files, regenerating the program from
                        source rather than patching bytecode.
                    </p>
                </div>
            </div>

            <div class="mt-6 grid gap-6 lg:grid-cols-2">
                <div class="fact-card reveal">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-lime-200">the method that found it</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">Reproduce the failure offline</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        Build a <strong>synthetic</strong> seven-input transaction — covenant, three
                        executors, genesis, terminal, funding — and evaluate every input on the BCH-2026 VM
                        before any broadcast. The synthetic run failed <em>identically</em> to the wallet's
                        real transaction, which exonerated the wallet port and isolated the artifact. A
                        failure that reproduces in the harness is a bug in our own program, not in the
                        counterparty's integration.
                    </p>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        This is the same discipline the pool's own gates use: every input VM-evaluated
                        before broadcast. It is the reason a dead pool cost zero sats to discover.
                    </p>
                </div>

                <div class="fact-card reveal" style="transition-delay: 0.1s">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-lime-200">the fix</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">Same key, same tree, new shape</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        <span class="font-mono text-xs text-lime-300">chipnet-pusd-v4-covenant0</span> is the
                        spendable successor: the same wallet-committed verifying key, the same two public
                        bootstrap seed notes — its genesis state-NFT commitment is byte-identical to v2's —
                        with the program generalized to the final shape. Two wallet-originated actions are
                        confirmed: a SHIELD at block 344641 and a TRANSFER at block 344646 carrying an
                        encrypted note to a second wallet.
                    </p>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        The covenant script itself did not change. Its 347-byte redeem contains no
                        input-count check at all — the seven-input pin lives in the terminal step. The
                        covenant is shape-agnostic; the program around it is not.
                    </p>
                </div>

                <div class="fact-card reveal">
                    <p class="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-lime-200">the successor</p>
                    <h3 class="mt-3 font-display text-xl font-bold text-white">The role-2 pool is the next integration</h3>
                    <p class="mt-3 text-sm leading-relaxed text-slate-100">
                        The browser acceptance closed the client question: the nito.cash wallet ran
                        the full lifecycle through the real UI — SHIELD <span class="font-mono text-xs">1ca58773…</span>
                        → TRANSFER <span class="font-mono text-xs">50644d00…</span> → UNSHIELD
                        <span class="font-mono text-xs">f52008f4…</span> — against the role-2 pool under our
                        VK (<span class="font-mono text-xs">05250429…</span>), and the registry is live. The
                        next integration surface is the 3-out v3: 201-B carrier, 9-field actionHash, new
                        VK/MPC — built and deployed as a chipnet demo (SHIELD
                        <span class="font-mono text-xs">e847ef56…</span> → TRANSFER
                        <span class="font-mono text-xs">ef64f3dd…</span>) — and the off-chain note delivery
                        the 400 FT transfer still lacks; see
                        <a href="#notes-management" class="src-link">07 · notes management</a>.
                    </p>
                </div>
            </div>

            <div class="reveal mt-10 rounded-2xl border border-cyan-300/25 bg-cyan-300/5 px-5 py-5 font-mono text-xs leading-relaxed text-cyan-100">
                research conclusion · a deployed pool's locking bytecode is a loader, not the constraint
                system · static review of chain data cannot tell you which transaction shape a pool accepts
                · reproducible generator source is a review requirement, not a convenience
            </div>
        </section>

        <!-- ── Security posture & limits ── -->
        <section id="limits" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr]">
                <div class="reveal">
                    <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-rose-200">09 · posture</p>
                    <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                        Security<br />&amp; Limits
                    </h2>
                </div>

                <div class="reveal space-y-6 text-base leading-relaxed text-slate-100 sm:text-lg" style="transition-delay: 0.12s">
                    <p>
                        <strong class="font-semibold text-white">What was attacked:</strong> the first
                        generation's on-chain verifier survived a red-team pass on its <em>public-input
                        binding</em> — 5/5 valid proofs accepted, 9/9 mutated public inputs rejected, 26/26
                        red-team runs rejected. vk_x is recomputed in-script, so the public-input vector
                        cannot be forged by a malicious spender. The deployed role-2 program carries its
                        own gates under our verifying key: acceptance <strong class="text-white">20/20</strong>
                        (the theft replay REJECTS at check 4g), red team <strong class="text-white">146/0</strong>,
                        and a 69-scenario liveness sweep with <strong class="text-white">0 failures</strong>
                        — worst per-input margin 6.00% standard / 6.49% consensus, re-verified from the
                        committed reports.
                    </p>
                    <p>
                        <strong class="font-semibold text-white">What was withdrawn — and what replaced it:</strong>
                        the first generation's verifier is the
                        <span class="font-mono text-xs">densless-msm</span> construction, and its author
                        <strong class="text-rose-200">withdrew the soundness claims on 2026-10-26</strong>:
                        the shared Miller event consumes slopes without the tangent/chord equations, and the
                        terminal's carried-R predicate compares a value with itself instead of checking the
                        B endpoint (finding F6). Every pool deployed before 2026-11-24 — gate3, gate6,
                        gate6b, mainnet, nito v2/v4 — still runs it, and that record stands. The
                        <strong class="text-white">current pool does not</strong>: it runs the independently
                        reviewed <span class="font-mono text-xs">bch-groth16-bn254-sound-native</span>
                        (27,624 B, reviewed 2026-10-26), which verifies the same relation under the same
                        verifying key — no new trusted setup — with the pool rules as a role-2 hook.
                    </p>
                    <p>
                        <strong class="font-semibold text-white">A second, independent gap — ours.</strong>
                        The covenant reads the proven public inputs out of the <em>genesis sibling's</em>
                        unlocking bytecode at fixed offsets (n0 at 1825, n1 at 1792). That read
                        authenticates nothing on its own: the stored root is public (it is the pool's own
                        NFT commitment) and the actionHash is recomputed from values the spender supplies.
                        <strong class="text-rose-200">The covenant never checked which script it was
                        reading from</strong>, and never checked the input count — verified by disassembling
                        the deployed 347-byte redeem, whose whole introspection set contains no
                        <code class="text-rose-200">TXINPUTCOUNT</code> and no sibling
                        <code class="text-rose-200">UTXOBYTECODE</code> read. A one-byte
                        <code class="text-rose-200">OP_1</code> script at that index was
                        <strong class="text-rose-200">ACCEPTED</strong> on the BCH-2026 VM: no proof, no
                        verifier, full drain. Resolved on both routes: the generation-1 covenant got the
                        sibling pin in source (all five step lockings and the genesis index as constructor
                        arguments; regression gate 6/6), and the deployed role-2 pool went further — the
                        sibling is <strong class="text-white">gone entirely</strong>, because the pool rules
                        moved inside the verifier and every input of an action spends the one program
                        locking. There is no script position left to substitute.
                    </p>
                    <div class="rounded-2xl border border-rose-300/40 bg-rose-300/10 px-5 py-4 font-mono text-xs leading-relaxed text-rose-100">
                        DISCLOSURE · (1) the first generation's verifier (densless-msm) is WITHDRAWN by
                        its author under finding F6 — every pool deployed before 2026-11-24 still carries
                        it · (2) that generation's covenant did not pin its verifier sibling, so a
                        substituted script was accepted — pinned in source, and eliminated structurally
                        by the role-2 redesign · the current pool (chipnet-role2-pool-v2-tagged, deployed
                        2026-11-24) carries the reviewed sound verifier with the rules inside role 2 —
                        the nito.cash browser acceptance then passed (SHIELD 1ca58773… → TRANSFER
                        50644d00… → UNSHIELD f52008f4…; state 760,400 FT) — but the hook is our own code,
                        with no independent review · the 3-out v3 is measured AND deployed as a chipnet
                        demo (SHIELD e847ef56… → TRANSFER ef64f3dd… → UNSHIELD ec31a41c…; 184,528 constraints, +0.58%): the
                        3-out verifier, the 201-B hook, the 9-field actionHash and the witness are built;
                        the new MPC (Gate 7) and the Nito client UI/assets/blanks are not; the 3-out witness path is built and byte-exact · the 400 FT transfer note is
                        UNDELIVERED · four failed locks (1,200 FT + 120,000 sats) are STUCK; one
                        (3db76294…, 1,000 FT + 30,000 sats) is public-bootstrap-tagged and sweepable ·
                        the deposit path, nullifier set and note delivery are DESIGN and UNMEASURED ·
                        every setup remains 1-of-1
                    </div>
                    <p class="font-mono text-[0.8rem] leading-relaxed text-slate-200">
                        withdrawal record:
                        <a href="https://github.com/mr-zwets/groth16_cashscript/blob/main/chunked/bn254/densless-msm/README.md" target="_blank" rel="noopener" class="src-link">densless-msm README ↗</a>
                        ·
                        <a href="https://github.com/mr-zwets/groth16_cashscript/blob/main/verifiers.md" target="_blank" rel="noopener" class="src-link">verifiers.md (F6) ↗</a>
                        ·
                        <a href="https://github.com/mr-zwets/groth16_cashscript/blob/main/chunked/bn254/bn-native-sound/README.md" target="_blank" rel="noopener" class="src-link">sound replacement ↗</a>
                    </p>
                    <p>
                        <strong class="font-semibold text-white">What cannot happen:</strong> the pool cannot
                        convert value across asset categories — per-category conservation is enforced
                        inside the circuit, and the anti-converter negative test is rejected at
                        witness time (Gate 4).
                    </p>
                    <p>
                        <strong class="font-semibold text-white">What is NOT done:</strong> every trusted setup
                        so far was a disclosed single-party (1-of-1) contribution on chipnet —
                        appropriate for a testnet only. Mainnet requires a genuine multi-party
                        ceremony (Gate 7). A proof is bound to its verifying key and public inputs,
                        never to a txid. The current nullifier state is a rolling hash, not a set:
                        hook check 7 only folds <code class="text-xs">SHA256(oldNull ‖ nf0 ‖ nf1)</code>,
                        so the spent bootstrap notes were reusable. The v3 needs a real Merkle
                        nullifier set with membership. The 3-out circuit is measured at 184,528
                        constraints (+1,056, +0.58%); its 1-of-1 demo setup is built (new VK
                        d4ed12ee…, zkey b0177dbe…, wasm c806e561…), and the 3-out verifier, the
                        201-B hook, the 9-field actionHash and the witness are BUILT; a demo pool is
                        deployed on chipnet (SHIELD e847ef56… → TRANSFER ef64f3dd… → UNSHIELD ec31a41c…). The new MPC
                        (Gate 7) and the Nito client UI/assets/blank path are NOT built; the 3-out witness path is built and byte-exact. The deposit
                        path (onboarding) and encrypted note delivery are DESIGN and UNMEASURED.
                        The browser acceptance's 400 FT transfer note is undelivered; four failed
                        locks (1,200 FT + 120,000 sats) are stuck, one public lock
                        (3db76294…, 1,000 FT + 30,000 sats) is sweepable. The 3-out is the
                        note-management layer; it is not the whole solution.
                    </p>
                    <div class="rounded-2xl border border-rose-300/25 bg-rose-300/5 px-5 py-4 font-mono text-xs leading-relaxed text-rose-200">
                        testnet only · 1-of-1 trusted setup · no audits yet · the 3-out v3 needs a NEW MPC (Gate 7) · the deposit/nullifier/note-delivery are UNMEASURED · /ceremony is the path to mainnet
                    </div>
                    <p>
                        <span class="font-mono text-xs text-slate-200">[cited · third-party]</span> — the pool
                        sits inside an active research conversation, and we place it there deliberately.
                        Confidential-transaction designs pursue amount-hiding at the protocol level
                        (topic 1724, continued as topic 2028); this pool is the complementary opt-in
                        covenant route — no consensus change required. The community's Verifier.cash
                        initiative (topic 1896) explores the same on-chain Groth16-verifier design
                        space; our measured verifier sizes and op-costs are inputs for exactly those
                        discussions. What the pool does not touch: network-layer metadata — IP-linked
                        transaction propagation is a separate research axis (topic 1524).
                    </p>
                    <div class="flex flex-wrap gap-3 font-mono text-[0.8rem]">
                        <a href="https://bitcoincashresearch.org/t/optimized-groth16-verifier-contract-for-bch-verifier-cash-initiative/1896" target="_blank" rel="noopener" class="src-link">Verifier.cash — Groth16 verifier initiative ↗</a>
                        <a href="https://bitcoincashresearch.org/t/confidential-transactions/1724" target="_blank" rel="noopener" class="src-link">Confidential Transactions ↗</a>
                        <a href="https://bitcoincashresearch.org/t/proofnote-apnt-phase-3-public-evidence-current-limits-and-the-next-experiment/2028" target="_blank" rel="noopener" class="src-link">Proofnote / APNT (continuation) ↗</a>
                        <a href="https://bitcoincashresearch.org/t/network-layer-privacy-on-bitcoin-cash/1524" target="_blank" rel="noopener" class="src-link">Network-layer privacy ↗</a>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── Design docs ── -->
        <section id="docs" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">10 · go deeper</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">Design Docs</h2>
            </div>

            <div class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <a href="https://github.com/APECSdev/pusd-shielded-pool/blob/master/CIRCUIT-DESIGN.md" target="_blank" rel="noopener" class="doc-card reveal">
                    <h3 class="font-mono text-sm text-lime-300">CIRCUIT-DESIGN.md</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">The Groth16 joinsplit: note commitments, nullifiers, the actionHash binding, and the public-input packing.</p>
                </a>
                <a href="https://github.com/APECSdev/pusd-shielded-pool/blob/master/COVENANT-DESIGN.md" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.08s">
                    <h3 class="font-mono text-sm text-cyan-300">COVENANT-DESIGN.md</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">The CashScript pool covenant: state machine, action-hash recomputation, holdings path, unshield payout.</p>
                </a>
                <a href="https://github.com/APECSdev/pusd-shielded-pool/blob/master/GENERALIZED-SHIELDING.md" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.16s">
                    <h3 class="font-mono text-sm text-violet-300">GENERALIZED-SHIELDING.md</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">Why one category is a deployment choice, not a limit — per-asset pools now, one multi-asset pool next.</p>
                </a>
                <a href="https://github.com/APECSdev/pusd-shielded-pool/blob/master/CHIPNET.md" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.24s">
                    <h3 class="font-mono text-sm text-lime-300">CHIPNET.md</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">The build record and on-chain worked examples: deployment, SHIELD / TRANSFER / UNSHIELD, verifier wiring.</p>
                </a>
                <a href="https://github.com/APECSdev/hushyourmoney/blob/master/POOL-DEPLOYMENT.md" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.32s">
                    <h3 class="font-mono text-sm text-cyan-300">POOL-DEPLOYMENT.md</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">The deployment runbook — the full Path A lifecycle executed end-to-end on chipnet (Gate 3).</p>
                </a>
                <a href="https://github.com/APECSdev/hushyourmoney/blob/master/pool-registry.json" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.4s">
                    <h3 class="font-mono text-sm text-violet-300">pool-registry.json</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">The machine-readable registry: category ↔ covenant address ↔ tree root ↔ first operations.</p>
                </a>
                <a href="https://github.com/APECSdev/hushyourmoney/blob/master/docs/ROLE2-3OUT-V3-DESIGN.md" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.48s">
                    <h3 class="font-mono text-sm text-lime-300">ROLE2-3OUT-V3-DESIGN.md</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">The 3-out v3: 184,528 constraints (+1,056, +0.58%), 201-B carrier, 9-field actionHash; the 1-of-1 demo setup; the deposit path, nullifier set and note delivery; the new MPC and the migration.</p>
                </a>
                <a href="https://github.com/APECSdev/pusd-shielded-pool/blob/master/circuits/pool3.circom" target="_blank" rel="noopener" class="doc-card reveal" style="transition-delay: 0.56s">
                    <h3 class="font-mono text-sm text-cyan-300">pool3.circom</h3>
                    <p class="mt-2 text-sm leading-relaxed text-slate-200">The measured and deployed 3-output circuit: 2-in/3-out, 184,528 constraints, 2 public inputs, 112 private inputs.</p>
                </a>
            </div>
        </section>

        <!-- ── FAQ ── -->
        <section id="faq" class="relative z-10 mx-auto w-full max-w-4xl px-6 pb-28 sm:pb-36">
            <div class="reveal text-center">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">11 · questions</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">Reviewer FAQ</h2>
            </div>

            <div class="mt-10 space-y-4">
                <details class="faq-card reveal">
                    <summary>Does this need a fork or a new opcode?</summary>
                    <p>
                        No. The Groth16 verifier runs as an ordinary script inside one standard
                        transaction on the BCH 2026 VM, using CashTokens and P2SH32 — all shipped
                        features. The withdrawn generation measured 35,626 bytes; the reviewed sound
                        verifier now deployed is 27,624 bytes. That is the point of the exercise:
                        the existence proof came before any proposal. Which programs are
                        <em>sound</em> is a separate question — see
                        <a href="#limits" class="src-link">09 · posture</a>.
                    </p>
                </details>

                <details class="faq-card reveal">
                    <summary>Can the pool convert asset A into asset B?</summary>
                    <p>
                        No. Value conservation is enforced per category inside the circuit. In the
                        Gate 4 negative test, moving a single unit across categories was rejected
                        at witness generation. The covenant additionally enforces per-category
                        holdings continuity on-chain.
                    </p>
                </details>

                <details class="faq-card reveal">
                    <summary>Why did the pool rules move inside the verifier?</summary>
                    <p>
                        Because the reviewed sound build forced the question. Its graph pins exactly
                        three inputs, every one of them spending the same P2SH32, and forbids any
                        funding or fee input with another locking — so a covenant cannot sit beside it.
                        The artifact documents the integration itself: applications that release funds
                        add output rules in role 2. The pool's state machine, carrier binding, deposit
                        tags and payout rules are that hook — 524 B of role-2 code, priced at 37,198 op.
                        A side effect worth stating: the old sibling-substitution hole is structurally
                        gone, because there is no sibling left to substitute.
                    </p>
                </details>

                <details class="faq-card reveal">
                    <summary>Can the operator censor users or inflate the supply?</summary>
                    <p>
                        Both are closed on chain. The minting NFT lives in the minting guard, whose
                        only spendable shape recreates the NFT at the guard and mints exactly K=64
                        NFT-only, empty-commitment blanks — burning it and minting fungible tokens are
                        consensus-impossible, so the 100M supply is frozen. A compromised operator key
                        can only choose when a batch runs. And acquisition is permissionless: the blank
                        vending machine delivers a blank to any buyer's funding input against the exact
                        pinned price, with no signature and no operator involvement — proven live by a
                        total stranger who bought both machine blanks with only its own key. The
                        operator's residual discretion is machine stock depth only.
                    </p>
                </details>

                <details class="faq-card reveal">
                    <summary>What do you trust today?</summary>
                    <p>
                        Every chipnet deployment used a disclosed, single-party (1-of-1) trusted
                        setup — deliberately fine for a testnet and explicitly not for mainnet.
                        Mainnet is gated on a multi-party Powers-of-Tau ceremony. That machine is
                        being designed in public: see <NuxtLink to="/ceremony" class="src-link">/ceremony</NuxtLink>.
                    </p>
                </details>

                <details class="faq-card reveal">
                    <summary>Why not a CHIP first?</summary>
                    <p>
                        Because we could build it first. The pool needs no consensus change, so
                        the right order was: build, measure, publish evidence — then discuss what
                        (if anything) the protocol should standardize. The measured op-costs and
                        verifier sizes are inputs for exactly those discussions.
                    </p>
                </details>

                <details class="faq-card reveal">
                    <summary>Is the on-chain verifier sound?</summary>
                    <p>
                        The current pool's verifier is the reviewed sound build
                        (<span class="font-mono text-xs">bch-groth16-bn254-sound-native</span>, 27,624 B,
                        3 inputs, one standard tx, independently reviewed 2026-10-26): every
                        accept-relevant value is computed on-chain, a baked VK constant, hash-committed
                        before any challenge it meets, or fixed by an exact field or integer equation.
                        The first generation ran <span class="font-mono text-xs">densless-msm</span>, whose
                        author withdrew the full-verifier soundness claims on 2026-10-26 (finding F6) —
                        every pool deployed before 2026-11-24 still runs it, and that record stands. The
                        swap needed <strong>no new trusted setup</strong>: both builds verify the same
                        relation under the same verifying key. Still not established: the role-2 hook is
                        our own code with no independent review, and every setup so far is 1-of-1. See
                        <a href="#limits" class="src-link">09 · posture</a>.
                    </p>
                </details>

                <details class="faq-card reveal">
                    <summary>What is the 3-out / Notes Management?</summary>
                    <p>
                        The current pool is 2-in/2-out. The v3 3-out circuit is measured at
                        184,528 constraints (+1,056, +0.58%) and adds a third out-note: a SHIELD can
                        create two wallet-owned notes plus the Hush change, and a TRANSFER can split
                        change cleanly. It is the note-management layer, not the whole solution: the
                        deposit path (onboarding), a real nullifier set and encrypted note delivery
                        are the other v3 pieces. The 3-out is measured AND deployed as a chipnet demo:
                        SHIELD e847ef56… (out 400+300+300) → TRANSFER ef64f3dd… (out 280+210+210) →
                        UNSHIELD 300 ec31a41c… (out 112+84+84, 300 FT payout), all confirmed; the
                        3-out verifier, 201-B hook, 9-field actionHash and witness are
                        built; the new MPC (Gate 7) and the Nito client UI/assets/blank path are not; the 3-out witness path is built and byte-exact. See
                        <a href="#notes-management" class="src-link">07 · notes management</a>.
                    </p>
                </details>

                <details class="faq-card reveal">
                    <summary>Did the browser acceptance pass?</summary>
                    <p>
                        Yes. The nito.cash wallet ran SHIELD 1ca58773… → TRANSFER 50644d00… →
                        UNSHIELD f52008f4… through the real UI; the state is 760,400 FT and wallet A
                        holds 19,986,800 + 600 FT. Two caveats: the 400 FT transfer note is
                        undelivered (the 169-B carrier has no encrypted note), and four failed locks
                        (1,200 FT + 120,000 sats) are stuck; one public-bootstrap lock
                        (3db76294…, 1,000 FT + 30,000 sats) is sweepable. The 3-out v3 is the next
                        client surface.
                    </p>
                </details>

                <details class="faq-card reveal">
                    <summary>Are the failed locks recoverable?</summary>
                    <p>
                        One is. 3db76294… carries the public bootstrap tag and can be swept by any
                        holder of the public seeds. The other four — 10f26fa3…, 1946084e…,
                        c3e21c7a…, dff42ddb… — carry the lost notes' private tags; their preimages
                        are gone, so they are stuck, not stealable. The total is 2,200 FT + 150,000
                        fuel sats.
                    </p>
                </details>

                <details class="faq-card reveal">
                    <summary>Is there a working wallet?</summary>
                    <p>
                        Yes, on chipnet. The nito.cash browser acceptance ran the full lifecycle
                        through the real UI — SHIELD <span class="font-mono text-xs">1ca58773…</span>
                        → TRANSFER <span class="font-mono text-xs">50644d00…</span> → UNSHIELD
                        <span class="font-mono text-xs">f52008f4…</span> — against the role-2 pool under
                        our VK, and the registry is live. The state is 760,400 FT; wallet A holds
                        19,986,800 + 600 FT. Two caveats: the 400 FT transfer note is undelivered,
                        and four failed locks are stuck (one public lock is sweepable). The 3-out v3
                        is the next client surface: 201-B carrier, 9-field actionHash, new VK/MPC.
                        See <a href="#notes-management" class="src-link">07 · notes management</a>.
                    </p>
                </details>
            </div>
        </section>

        <!-- ── CTA ── -->
        <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-20 text-center sm:pb-28">
            <div class="cta-glow reveal relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-lime-300/10 via-transparent to-violet-300/10 px-8 py-16 shadow-[0_24px_80px_-40px_rgba(190,242,100,0.35)]">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.5em] text-lime-200">gate 7 · the last gate</p>
                <h2 class="mt-6 font-display text-[clamp(1.8rem,5vw,3.6rem)] font-extrabold leading-tight text-white">
                    Before mainnet,<br /><span class="text-gradient">break the waste</span>
                </h2>
                <p class="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-100">
                    The trusted-setup ceremony is the one thing standing between chipnet and mainnet.
                    Bring your entropy — one honest participant is all it takes.
                </p>

                <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <NuxtLink to="/ceremony" class="btn-primary btn-pulse">
                        The Hush Ceremony
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                    </NuxtLink>

                    <!-- TODO: replace href with the live bitcoincashresearch.org topic URL once the flagship post is published -->
                    <a href="#" class="btn-ghost opacity-60" title="discussion thread link goes live with the publication" @click.prevent>
                        Discuss on BCH Research — soon
                    </a>
                </div>

                <p class="mt-6 font-mono text-[0.78rem] uppercase tracking-[0.3em] text-slate-200">[ discussion link pending publication ]</p>
            </div>
        </section>

        <!-- ── Pager ── -->
        <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24">
            <div class="pager reveal">
                <NuxtLink to="/research" class="pager-link">
                    <span class="pager-dir">← all topics</span>
                    <span class="pager-title">Research hub</span>
                </NuxtLink>
                <NuxtLink to="/research/cashfusion" class="pager-link right">
                    <span class="pager-dir">next topic →</span>
                    <span class="pager-title">CashFusion</span>
                </NuxtLink>
            </div>
        </section>

</template>
