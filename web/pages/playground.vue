<!-- web/pages/playground.vue — live experiments hub (featured: CashFusion over Nostr) -->

<script setup lang="ts">
/* Shared shell + styles come from layouts/research.vue (the modern dark shell).
   This page is not a research topic; it reuses the shell for SiteNav, the aurora
   backdrop, the GitHub banner, the footer and the namespaced .research-page CSS. */
import { resolveComponent } from 'vue'

definePageMeta({
    layout: 'research',
})

/* OpenGraph + Twitter + canonical (shared composable). The CashFusion poster is
   the closest existing 2400x1260 asset; a dedicated playground poster is a
   follow-up once the page has a stable visual identity. */
useOg({
    title: `Playground — Hush Your Money`,
    description: `Live experiments: an interactive CashFusion-over-Nostr round simulator, an opt-in relay probe, and the real chipnet gate evidence behind the protocol.`,
    path: '/playground',
    image: '/posters/research-cashfusion.jpg',
    type: 'website',
    imageAlt: `Playground — interactive CashFusion over Nostr experiments`,
})

/* Scroll-reveal (shared composable). */
useReveal()

const NuxtLinkComp = resolveComponent('NuxtLink')

/* ── Experiment board ────────────────────────────────────────────── */
const EXPERIMENTS = [
    {
        id: '01',
        title: 'CashFusion over Nostr',
        status: 'interactive · simulated',
        badge: 'badge-live',
        numClass: 'topic-lime',
        to: '#fusion-lab',
        body: 'A six-phase round simulator: peer election, NIP-59 registration, onion mix-net, assembly and a simulated broadcast. No keys, no relay messages, no transaction.',
        meta: 'EXP-01 · G1–G3L measured · G4 pending',
    },
    {
        id: '02',
        title: 'Relay reachability',
        status: 'live · opt-in',
        badge: 'badge-done',
        numClass: 'topic-cyan',
        to: '#relay-probe',
        body: 'Open a WebSocket handshake to the relays measured in G1/G3L. No NIP-01 REQ and no event published — the probe closes the socket.',
        meta: 'EXP-02 · browser → public relays',
    },
    {
        id: '03',
        title: 'Real chain evidence',
        status: 'real · chipnet',
        badge: 'badge-live',
        numClass: 'topic-violet',
        to: '#evidence',
        body: 'The G2b funding and round transactions on chipnet, linked on Selene. The only gate in the record with real chain transactions.',
        meta: 'EXP-03 · 2 tx · network=chipnet',
    },
    {
        id: '04',
        title: 'The Shielded Pool',
        status: 'live on chipnet',
        badge: 'badge-done',
        numClass: 'topic-lime',
        to: '/research/shielded-pool',
        body: 'The flagship Groth16 pool — two deployed verifier generations plus the 3-out v3 (184,528 constraints; verifier/hook/witness built; a chipnet demo pool is live); the current pool runs the pool rules inside the reviewed on-chain verifier. The browser acceptance passed; the 3-out demo SHIELD, TRANSFER and UNSHIELD are confirmed.',
        meta: 'EXP-04 · flagship research · 3-out v3 measured',
    },
    {
        id: '05',
        title: 'Trusted Setup',
        status: 'demo · ceremony',
        badge: 'badge-mid',
        numClass: 'topic-cyan',
        to: '/ceremony',
        body: 'The ceremony monitor and contribution-chain visualizer for the Powers-of-Tau setup that gates mainnet.',
        meta: 'EXP-05 · gate 7 · in design',
    },
    {
        id: '06',
        title: 'Mainnet fusion beta',
        status: 'pending · G4',
        badge: 'badge-wait',
        numClass: 'topic-white',
        to: '/research/cashfusion#gate-evidence',
        body: 'The production UI is the remaining step: no production fusion UI exists yet. G4 stays pending until it does.',
        meta: 'EXP-06 · not built',
    },
]

/* ── Six protocol phases (same names as /research/cashfusion#six-phases) ── */
const PHASES = [
    { n: '01', key: 'announce', label: 'Announce', detail: 'ephemeral pubkeys → kind 22230' },
    { n: '02', key: 'election', label: 'Election', detail: 'lowest pubkey coordinates' },
    { n: '03', key: 'registration', label: 'Registration', detail: 'inputs + output count as gift wraps' },
    { n: '04', key: 'mixnet', label: 'Mixnet', detail: 'onion through every peer' },
    { n: '05', key: 'assembly', label: 'Assembly + verify', detail: 'outputs, fee, no inflation' },
    { n: '06', key: 'broadcast', label: 'Broadcast', detail: 'sign own inputs, assemble tx' },
]

/* ── Relays measured in G1 / G3L (source: P2P-FUSION-DESIGN.md §5) ── */
const RELAYS = [
    { name: 'relay.primal.net', url: 'wss://relay.primal.net', note: 'G3L: accepted and delivered kind-1059 wraps.' },
    { name: 'nostr.mom', url: 'wss://nostr.mom', note: 'G3L: accepted and delivered kind-1059 wraps.' },
    { name: 'offchain.pub', url: 'wss://offchain.pub', note: 'G3L: accepted and delivered kind-1059 wraps.' },
    { name: 'relay.damus.io', url: 'wss://relay.damus.io', note: 'G1 relay set (1/2 connected in the recorded run); G3L: rate-limits bursts and advertises NIP-42 AUTH.' },
    { name: 'nos.lol', url: 'wss://nos.lol', note: 'G1 relay set (1/2 connected in the recorded run); G3L: rate-limits bursts.' },
]

/* ── Gate record (source: /research/cashfusion#gate-evidence) ────── */
const GATES = [
    { id: 'G1', status: 'passed', cls: 'gate-done', title: 'Relay + crypto roundtrip', note: '4/4 checks: NIP-44, NIP-59, 3-hop onion, live relay gift-wrap.' },
    { id: 'G2a', status: 'passed', cls: 'gate-done', title: 'Two-party round, dry-run', note: '3/3 deterministic runs; 4/4 signatures verified; fee 3,000 sats.' },
    { id: 'G2b', status: 'on chain', cls: 'gate-live', title: 'Real chipnet broadcast', note: 'Funding 253 B + round 428 B, fee 2,000 sats ≈ 4.7 sat/B.' },
    { id: 'G3', status: 'passed', cls: 'gate-done', title: 'N-party round', note: '5-party 10/10 signatures; 7-party 14/14 signatures.' },
    { id: 'G3L', status: 'passed', cls: 'gate-done', title: 'Live public relays', note: '5-party 10/10 signatures over primal, nostr.mom and offchain.pub.' },
    { id: 'G4', status: 'pending', cls: 'gate-wait', title: 'Mainnet opt-in beta', note: 'No production fusion UI exists yet.' },
]

/* ── Real chain evidence (G2b) and dry-run harness txids (G3L) ───── */
const G2B_TXS = [
    { label: 'fund', txid: 'f3158b02d0825a84e7f60e81377cde40644f24f85016934fc7e70ec035ac601e' },
    { label: 'round', txid: 'c4fc6fc911408c0ceba1030c0e4d86c4c0f095e9141c9fcd315f2115d0c754d5' },
]

const G3L_TXS = [
    '13bc75cecaf0c6f845f8a6e6074c8b6f43909670c85f304b9f413d5989f70f0d',
    '20d0c9b90571dd2ae11cd3a8d4de3219d02398c18aa42cc8a61f6bd52d8b9b6d',
]

/* ── Honesty layer: what is real and what is mocked ──────────────── */
const REAL_VS_MOCK = [
    { what: 'Interactive fusion round', verdict: 'mock', cls: 'badge-wait', detail: 'Deterministic browser simulation. No keys, no relay messages, no transaction. Peer pubkeys and the txid are generated locally from a seed.' },
    { what: 'Relay reachability probe', verdict: 'live', cls: 'badge-done', detail: 'A WebSocket handshake from your browser to each relay, then close. No NIP-01 REQ and no event published. The relay sees your IP.' },
    { what: 'Relay names and behavior', verdict: 'cited', cls: 'badge-mid', detail: 'G1/G3L measurements recorded in P2P-FUSION-DESIGN.md §5 and /research/cashfusion#lessons.' },
    { what: 'G2b transactions', verdict: 'real', cls: 'badge-live', detail: 'Chipnet funding and round transactions, linked to Selene. The only chain transactions in the gate record.' },
    { what: 'G3 / G3L txids', verdict: 'dry-run', cls: 'badge-wait', detail: 'Harness txids, not broadcast. The rounds used fixture UTXOs.' },
    { what: 'Mainnet fusion beta', verdict: 'not built', cls: 'badge-wait', detail: 'G4 is pending; no production fusion UI exists yet.' },
    { what: 'Shielded pool', verdict: 'live on chipnet', cls: 'badge-done', detail: 'The role-2 pool is live on chipnet with a confirmed browser lifecycle; the 3-out v3 is measured and deployed as a chipnet demo (184,528 constraints; SHIELD e847ef56… → TRANSFER ef64f3dd… → UNSHIELD ec31a41c…); the 400 FT transfer note is undelivered; four failed locks are stuck, one is sweepable. See /research/shielded-pool#notes-management.' },
    { what: '3-out v3', verdict: 'measured · chipnet demo', cls: 'badge-live', detail: '184,528 constraints (+1,056, +0.58%), 201-B carrier, 9-field actionHash. The 1-of-1 demo setup, 3-out verifier (7,310/7,848 B), 201-B hook (39,082/37,930 op), 3-out witness, acceptance 21/21, red team 146/0 and a demo pool (SHIELD e847ef56… → TRANSFER ef64f3dd… → UNSHIELD ec31a41c…) are built; the new MPC (Gate 7) and the Nito client UI/blank path remain; the 3-out witness path is built and byte-exact, and the proving assets are live.' },
]

/* ── Lab notes (source: /research/cashfusion#lessons) ────────────── */
const LAB_NOTES = [
    {
        tag: 'the expensive one',
        title: 'BCH Schnorr is not final BIP-340',
        body: 'BCH\'s 2019 Schnorr uses e = SHA256(r ‖ compressed_pubkey33 ‖ m) with no BIP-0340 tag prefixes, and R must be normalized to the QR Y root. Noble\'s schnorr produces final BIP-340 signatures, which the BCH VM rejects with NULLFAIL.',
        href: '/research/cashfusion#lessons',
    },
    {
        tag: 'relay behavior',
        title: 'Relays do not echo',
        body: 'A relay does not send an event back to the connection that published it. With one shared socket for all peers, peers never receive each other\'s messages on real relays. The fix is one connection per peer.',
        href: '/research/cashfusion#lessons',
    },
    {
        tag: 'rate limits',
        title: 'Free relays throttle bursts',
        body: 'Observed verbatim: damus "banned: too many rate-limit violations, try again later"; nos.lol "rate-limited: slow down matey". A 5-party round emits ~100+ gift wraps, so publishing is paced at one event per 80 ms per connection.',
        href: '/research/cashfusion#lessons',
    },
    {
        tag: 'open gap',
        title: 'NIP-42 AUTH is not implemented',
        body: 'damus now advertises NIP-42 AUTH. The NIP-59 spec recommends supporting it; the current relay pool does not authenticate. This is tracked as an open item, not a solved one.',
        href: '/research/cashfusion#boundary',
    },
]

/* ── Sources ─────────────────────────────────────────────────────── */
const SOURCES = [
    { title: '/research/cashfusion', href: '/research/cashfusion', internal: true, cls: 'text-lime-300', body: 'The full 11-section research record: protocol, adoption, architecture, phases, gate evidence, defect log, FAQ and sources.' },
    { title: 'P2P-FUSION-DESIGN.md', href: 'https://github.com/APECSdev/hushyourmoney/blob/master/P2P-FUSION-DESIGN.md', internal: false, cls: 'text-cyan-300', body: 'The architecture draft, protocol constants, gate record and defect logs.' },
    { title: 'web/tests/', href: 'https://github.com/APECSdev/hushyourmoney/tree/master/web/tests', internal: false, cls: 'text-violet-300', body: 'The G1, G2a, G2b and G3 harnesses, plus the NIP-01 relay fixture and chipnet Electrum client.' },
    { title: 'NIP-59 + NIP-44', href: 'https://github.com/nostr-protocol/nips/blob/master/59.md', internal: false, cls: 'text-lime-300', body: 'Gift wrap (kind 1059) and versioned encrypted payloads — the transport the round is built on.' },
    { title: 'BCH Schnorr spec (2019)', href: 'https://github.com/bitcoincashorg/bitcoincash.org/blob/master/spec/2019-05-15-schnorr.md', internal: false, cls: 'text-cyan-300', body: 'The draft-BIP-340 variant BCH actually enforces: compressed-pubkey challenge, QR-normalized R, no tag prefixes.' },
    { title: 'Selene · G2b round', href: 'https://explorer.selene.cash/tx/c4fc6fc911408c0ceba1030c0e4d86c4c0f095e9141c9fcd315f2115d0c754d5?network=chipnet', internal: false, cls: 'text-violet-300', body: 'The real chipnet round transaction from G2b, in the explorer used across the research suite.' },
]

/* ══════════════════════════════════════════════════════════════════
   ROUND SIMULATOR
   Deterministic browser-side mock. It mirrors the six phases and the
   constants in P2P-FUSION-DESIGN.md §4; it does NOT generate keys,
   open relay sockets, sign, or broadcast. The only live network
   experiment on this page is the opt-in relay probe below.
   ══════════════════════════════════════════════════════════════════ */

type PhaseState = 'idle' | 'active' | 'done'
type ProbeState = 'idle' | 'connecting' | 'open' | 'closed' | 'error' | 'timeout'

interface SimPeer {
    id: number
    label: string
    pub: string
    coordinator: boolean
    inputs: number
    outputs: number
    inSats: number
    outSats: number
    fee: number
    onionLayers: number
}

interface SimRound {
    seed: number
    peers: SimPeer[]
    totalIn: number
    totalOut: number
    totalFee: number
    estBytes: number
    signatures: number
    txid: string
}

interface LogLine {
    time: string
    msg: string
    tone: string
}

const DEFAULT_SEED = 20261122

function mulberry32(seed: number) {
    let a = seed >>> 0
    return () => {
        a = (a + 0x6D2B79F5) >>> 0
        let t = a
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function hexFrom(rng: () => number, bytes: number) {
    let out = ''
    for (let i = 0; i < bytes; i++) {
        out += Math.floor(rng() * 256).toString(16).padStart(2, '0')
    }
    return out
}

function randInt(rng: () => number, min: number, max: number) {
    return Math.floor(rng() * (max - min + 1)) + min
}

function fmt(n: number) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function buildRound(seed: number, peerTotal: number): SimRound {
    const rng = mulberry32(seed)
    const peers: SimPeer[] = []

    for (let i = 0; i < peerTotal; i++) {
        const inputs = randInt(rng, 1, 5)
        const outputs = randInt(rng, 2, 4)
        let inSats = 0
        for (let j = 0; j < inputs; j++) {
            inSats += randInt(rng, 20_000, 200_000)
        }
        const fee = inputs * 148 + outputs * 34 + Math.ceil(10 / peerTotal)
        peers.push({
            id: i + 1,
            label: `P${i + 1}`,
            pub: hexFrom(rng, 32),
            coordinator: false,
            inputs,
            outputs,
            inSats,
            outSats: inSats - fee,
            fee,
            onionLayers: peerTotal,
        })
    }

    const sorted = [...peers].sort((a, b) => (a.pub < b.pub ? -1 : a.pub > b.pub ? 1 : 0))
    if (sorted[0]) sorted[0].coordinator = true

    const totalIn = peers.reduce((acc, p) => acc + p.inSats, 0)
    const totalOut = peers.reduce((acc, p) => acc + p.outSats, 0)
    const totalFee = peers.reduce((acc, p) => acc + p.fee, 0)
    const estBytes = peers.reduce((acc, p) => acc + p.inputs * 148 + p.outputs * 34, 0) + 10
    const signatures = peers.reduce((acc, p) => acc + p.inputs, 0)

    return {
        seed,
        peers,
        totalIn,
        totalOut,
        totalFee,
        estBytes,
        signatures,
        txid: hexFrom(rng, 32),
    }
}

const peerCount = ref(5)
const speed = ref(1)
const running = ref(false)
const roundToken = ref(0)
const currentPhase = ref(-1)
const phaseState = ref<PhaseState[]>(PHASES.map(() => 'idle'))
const logLines = ref<LogLine[]>([])
const round = ref<SimRound>(buildRound(DEFAULT_SEED, peerCount.value))

const totalInputs = computed(() => round.value.peers.reduce((acc, p) => acc + p.inputs, 0))
const totalOutputs = computed(() => round.value.peers.reduce((acc, p) => acc + p.outputs, 0))
const coordinator = computed(() => round.value.peers.find((p) => p.coordinator))

function delay(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function addLog(tone: string, msg: string) {
    const time = `T+${(logLines.value.length * 0.9).toFixed(1)}s`
    logLines.value.push({ time, msg, tone })
}

function phaseMessage(index: number, r: SimRound) {
    const inputTotal = r.peers.reduce((acc, p) => acc + p.inputs, 0)
    const outputTotal = r.peers.reduce((acc, p) => acc + p.outputs, 0)

    switch (index) {
        case 0:
            return `${r.peers.length} ephemeral pubkeys published to a kind-22230 pool event (simulated).`
        case 1:
            return `${r.peers.find((p) => p.coordinator)?.label ?? 'P1'} elected coordinator — lowest ephemeral pubkey in sorted order.`
        case 2:
            return `${r.peers.length} registrations collected — ${fmt(r.totalIn)} sats committed as NIP-59 gift wraps.`
        case 3:
            return `${r.peers.length} onion layers per output — the last peeler publishes ${fmt(r.totalOut)} sats across ${outputTotal} outputs.`
        case 4:
            return `${inputTotal} inputs / ${outputTotal} outputs ordered — no inflation — fee ${fmt(r.totalFee)} sats.`
        case 5:
            return `simulated txid ${r.txid.slice(0, 12)}… — ${r.signatures}/${r.signatures} signatures verified — not broadcast.`
        default:
            return ''
    }
}

function resetRound() {
    roundToken.value++
    running.value = false
    currentPhase.value = -1
    phaseState.value = PHASES.map(() => 'idle')
    logLines.value = []
    round.value = buildRound(DEFAULT_SEED + peerCount.value, peerCount.value)
}

function setPeers(n: number) {
    if (running.value) return
    peerCount.value = n
    resetRound()
}

async function runRound() {
    if (running.value) return
    const token = ++roundToken.value
    running.value = true
    round.value = buildRound((Date.now() ^ (peerCount.value * 2654435761)) >>> 0, peerCount.value)
    currentPhase.value = -1
    phaseState.value = PHASES.map(() => 'idle')
    logLines.value = []
    addLog('text-cyan-200', `round opened — ${peerCount.value} peers — ${fmt(round.value.totalIn)} sats in`)

    try {
        for (let i = 0; i < PHASES.length; i++) {
            if (token !== roundToken.value) return
            currentPhase.value = i
            phaseState.value[i] = 'active'
            addLog('text-slate-200', phaseMessage(i, round.value))
            await delay(900 / speed.value)
            if (token !== roundToken.value) return
            phaseState.value[i] = 'done'
        }
        currentPhase.value = PHASES.length
        addLog('text-lime-300', `round complete — ${round.value.signatures} signatures verified — simulated txid ${round.value.txid.slice(0, 12)}…`)
    } finally {
        if (token === roundToken.value) running.value = false
    }
}

function phaseClass(index: number) {
    return {
        'lab-phase-active': phaseState.value[index] === 'active',
        'lab-phase-done': phaseState.value[index] === 'done',
    }
}

function phaseBarWidth(index: number) {
    if (phaseState.value[index] === 'done') return '100%'
    if (phaseState.value[index] === 'active') return '55%'
    return '0%'
}

function isPeerActive(peer: SimPeer) {
    const phase = currentPhase.value
    if (phase < 0 || phase >= PHASES.length) return false
    if (phase === 1 || phase === 5) return peer.coordinator
    return true
}

/* ── Opt-in live relay probe ─────────────────────────────────────── */
const probing = ref(false)
const probeStates = reactive<Record<string, ProbeState>>({})
const probeSockets = new Set<WebSocket>()

function probeOne(url: string): Promise<void> {
    return new Promise((resolve) => {
        probeStates[url] = 'connecting'
        let settled = false
        let ws: WebSocket | null = null

        const finish = (state: ProbeState) => {
            if (settled) return
            settled = true
            probeStates[url] = state
            if (ws) {
                probeSockets.delete(ws)
                try { ws.close() } catch { /* already closed */ }
            }
            resolve()
        }

        try {
            ws = new WebSocket(url)
        } catch {
            probeStates[url] = 'error'
            resolve()
            return
        }

        if (!ws) {
            probeStates[url] = 'error'
            resolve()
            return
        }

        probeSockets.add(ws)
        const timer = setTimeout(() => finish('timeout'), 4500)

        ws.onopen = () => {
            clearTimeout(timer)
            finish('open')
        }
        ws.onerror = () => {
            clearTimeout(timer)
            finish('error')
        }
        ws.onclose = () => {
            clearTimeout(timer)
            finish('closed')
        }
    })
}

async function probeRelays() {
    if (probing.value) return
    probing.value = true
    for (const relay of RELAYS) {
        delete probeStates[relay.url]
    }
    await Promise.all(RELAYS.map((relay) => probeOne(relay.url)))
    probing.value = false
}

function probeLabel(url: string) {
    const state = probeStates[url] ?? 'idle'
    const labels: Record<ProbeState, string> = {
        idle: 'not probed',
        connecting: 'connecting…',
        open: 'reachable',
        closed: 'closed',
        error: 'no handshake',
        timeout: 'timed out',
    }
    return labels[state]
}

function probeBadge(url: string) {
    const state = probeStates[url] ?? 'idle'
    if (state === 'open') return 'badge-done'
    if (state === 'connecting') return 'badge-live'
    if (state === 'error' || state === 'timeout') return 'badge-error'
    return 'badge-wait'
}

onBeforeUnmount(() => {
    roundToken.value++
    probeSockets.forEach((ws) => {
        try { ws.close() } catch { /* already closed */ }
    })
    probeSockets.clear()
})
</script>

<template>

    <!-- ── Hero ── -->
    <section class="relative z-10 mx-auto flex min-h-[78vh] w-full max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-16 text-center">

        <NuxtLink to="/" class="crumb animate-rise" style="animation-delay: 0.04s">
            home <span class="sep">/</span> playground
        </NuxtLink>

        <p class="animate-rise mt-6 font-mono text-[0.8rem] uppercase tracking-[0.5em] text-lime-200 sm:text-xs" style="animation-delay: 0.1s">
            live experiments · hush your money
        </p>

        <h1 class="animate-rise mt-6 font-display text-[clamp(2.4rem,8.5vw,6.5rem)] font-extrabold leading-[1.04] tracking-tight text-white" style="animation-delay: 0.2s">
            Play<span class="text-gradient">ground</span>
        </h1>

        <p class="animate-rise mt-6 font-mono text-[clamp(1rem,2.8vw,1.5rem)] italic text-cyan-100" style="animation-delay: 0.32s">
            Run the research. Break the mock. Publish the evidence.
        </p>

        <p class="animate-rise mt-8 max-w-2xl text-base leading-relaxed text-slate-100 sm:text-lg" style="animation-delay: 0.42s">
            This is the lab bench for the Hush Your Money research. Some of it runs live in
            your browser, some of it is a clearly-labelled simulation, and all of it is
            anchored to the research record. The featured bench is our coordinator-free
            <strong class="font-semibold text-white">CashFusion round over Nostr</strong> — six phases,
            peer election, gift-wrapped registration, an onion mix-net, and a simulated broadcast.
        </p>

        <div class="animate-rise mt-8 flex flex-wrap items-center justify-center gap-3" style="animation-delay: 0.5s">
            <span class="status-chip status-lime">interactive simulation</span>
            <span class="status-chip status-cyan">live relay probe</span>
            <span class="status-chip status-violet">real chipnet evidence</span>
        </div>

        <div class="animate-rise mt-10 flex flex-col items-center gap-4 sm:flex-row" style="animation-delay: 0.6s">
            <a href="#fusion-lab" class="btn-primary btn-pulse">
                Run the fusion round
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
            </a>

            <NuxtLink to="/research/cashfusion" class="btn-ghost">
                Read the research
            </NuxtLink>

            <NuxtLink to="/daemons" class="btn-ghost">
                The daemons
            </NuxtLink>
        </div>

        <div class="animate-rise mt-16 flex items-center gap-3 font-mono text-[0.78rem] uppercase tracking-[0.3em] text-slate-300" style="animation-delay: 0.7s">
            <span class="h-px w-10 bg-slate-600/60"></span>
            real, mocked, cited — the boundary is on the page
            <span class="h-px w-10 bg-slate-600/60"></span>
        </div>
    </section>

    <!-- ── 00 · Experiment board ── -->
    <section id="experiments" class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-36">
        <div class="reveal text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">00 · the bench</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                Experiment board
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                Six benches. One featured interactive experiment, one live network probe, one real
                chain record — and the research pages that back them.
            </p>
        </div>

        <div class="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <component
                v-for="(e, i) in EXPERIMENTS"
                :key="e.id"
                :is="e.to.startsWith('/') ? NuxtLinkComp : 'a'"
                :to="e.to.startsWith('/') ? e.to : undefined"
                :href="e.to.startsWith('/') ? undefined : e.to"
                class="topic-card reveal"
                :style="{ transitionDelay: (i * 0.06) + 's' }"
            >
                <div class="flex items-center justify-between gap-3">
                    <span class="topic-num" :class="e.numClass">{{ e.id }}</span>
                    <span class="badge" :class="e.badge">{{ e.status }}</span>
                </div>
                <h3 class="mt-4 font-display text-lg font-bold text-white">{{ e.title }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-slate-200">{{ e.body }}</p>
                <span class="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-slate-300">{{ e.meta }}</span>
                <span class="topic-go">open bench →</span>
            </component>
        </div>
    </section>

    <!-- ── 01 · Featured: CashFusion over Nostr ── -->
    <section id="fusion-lab" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
        <div class="grid items-start gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div class="reveal">
                <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">01 · the featured experiment</p>
                <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                    CashFusion<br />
                    <span class="text-gradient">over Nostr</span>
                </h2>
                <div class="mt-5 flex flex-wrap gap-2">
                    <span class="badge badge-live">interactive simulation</span>
                    <span class="badge badge-done">G1–G3L measured</span>
                    <span class="badge badge-wait">G4 pending</span>
                </div>
                <p class="mt-5 text-base leading-relaxed text-slate-200">
                    Our coordinator-free variant of CashFusion. Peers self-elect a coordinator,
                    register inputs as NIP-59 gift wraps over Nostr relays, onion-wrap outputs
                    through every peer, verify the assembled transaction, and sign only their own
                    inputs. The simulator below follows the six phases and the constants
                    documented in the research.
                </p>
                <NuxtLink to="/research/cashfusion#six-phases" class="btn-ghost mt-6">
                    Read the six-phase protocol
                </NuxtLink>
            </div>

            <div class="reveal">
                <div class="doc-card">
                    <p class="font-mono text-xs uppercase tracking-[0.25em] text-cyan-200">what the simulator mirrors</p>
                    <ul class="life-points">
                        <li>Six phases, peer election by lowest ephemeral pubkey, 1–5 inputs / 2–4 outputs per peer, onion layers through every peer.</li>
                        <li>The per-peer fee model from the design constants. The real protocol uses a 60 s + blame phase timeout; the demo shortens it for the browser.</li>
                        <li>The measured relay names and the G2b chain evidence are the reference; the simulated amounts and the mock txid are generated locally and are not research measurements.</li>
                    </ul>
                    <p class="mt-4 font-mono text-xs text-slate-300">
                        [mock · deterministic simulation · no keys, no relay messages, no broadcast]
                    </p>
                </div>
            </div>
        </div>

        <!-- ── Interactive console ── -->
        <div class="reveal mt-10">
            <div class="lab-shell">
                <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p class="lab-label">exp-01 · live console</p>
                        <h3 class="mt-1 font-display text-xl font-bold text-white">P2P fusion round</h3>
                    </div>
                    <span class="badge badge-wait">simulation · no broadcast</span>
                </div>

                <div class="mt-5 flex flex-wrap items-center gap-3">
                    <div class="lab-control">
                        <span class="lab-label">peers</span>
                        <button
                            v-for="n in [5, 6, 7]"
                            :key="n"
                            type="button"
                            @click="setPeers(n)"
                            :disabled="running"
                            class="lab-btn"
                            :class="{ 'lab-btn-on': peerCount === n }"
                        >{{ n }}</button>
                    </div>

                    <div class="lab-control">
                        <span class="lab-label">speed</span>
                        <button
                            v-for="s in [1, 2, 4]"
                            :key="s"
                            type="button"
                            @click="speed = s"
                            class="lab-btn"
                            :class="{ 'lab-btn-on': speed === s }"
                        >{{ s }}×</button>
                    </div>

                    <button type="button" @click="runRound" :disabled="running" class="btn-primary lab-run disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ running ? 'round running…' : 'run round' }}
                    </button>

                    <button type="button" @click="resetRound" class="btn-ghost lab-reset">reset</button>
                </div>

                <!-- Phase rail -->
                <div class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    <div v-for="(p, i) in PHASES" :key="p.key" class="lab-phase" :class="phaseClass(i)">
                        <div class="flex items-center justify-between gap-2">
                            <span class="font-mono text-[0.65rem] tracking-[0.2em] text-slate-400">{{ p.n }}</span>
                            <span class="lab-phase-state">{{ phaseState[i] === 'done' ? 'done' : phaseState[i] === 'active' ? 'live' : 'idle' }}</span>
                        </div>
                        <p class="mt-1 text-xs font-semibold text-white">{{ p.label }}</p>
                        <p class="mt-0.5 text-[0.65rem] leading-snug text-slate-400">{{ p.detail }}</p>
                        <span class="mt-2 block h-1 w-full overflow-hidden rounded-full bg-white/10">
                            <span class="lab-phase-bar" :style="{ width: phaseBarWidth(i) }"></span>
                        </span>
                    </div>
                </div>

                <!-- Peers -->
                <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div
                        v-for="p in round.peers"
                        :key="p.id"
                        class="lab-peer"
                        :class="{ 'lab-peer-coord': p.coordinator, 'lab-peer-active': isPeerActive(p) }"
                    >
                        <div class="flex items-center justify-between gap-2">
                            <span class="font-mono text-xs text-lime-300">{{ p.label }}</span>
                            <span v-if="p.coordinator" class="badge badge-live">coordinator</span>
                            <span v-else class="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-slate-400">peer</span>
                        </div>
                        <p class="mt-2 truncate font-mono text-[0.7rem] text-slate-300">{{ p.pub.slice(0, 20) }}…</p>
                        <div class="mt-3 grid grid-cols-3 gap-1 text-center">
                            <div>
                                <p class="lab-stat">{{ p.inputs }}</p>
                                <p class="lab-stat-label">in</p>
                            </div>
                            <div>
                                <p class="lab-stat">{{ p.outputs }}</p>
                                <p class="lab-stat-label">out</p>
                            </div>
                            <div>
                                <p class="lab-stat">{{ p.onionLayers }}</p>
                                <p class="lab-stat-label">layers</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Relay + chain rail -->
                <div class="mt-6 grid gap-3 sm:grid-cols-2">
                    <div class="lab-node">
                        <p class="lab-label">nostr relays · ciphertext only</p>
                        <div class="mt-2 flex flex-wrap gap-2">
                            <span
                                v-for="r in RELAYS"
                                :key="r.url"
                                class="lab-relay"
                                :class="{ 'lab-relay-hot': currentPhase >= 0 && currentPhase <= 3 }"
                            >{{ r.name }}</span>
                        </div>
                        <p class="mt-2 font-mono text-[0.65rem] text-slate-400">kind 1059 gift wraps · NIP-44 layers</p>
                    </div>

                    <div class="lab-node">
                        <p class="lab-label">chain · simulated broadcast</p>
                        <p class="mt-2 break-all font-mono text-xs text-cyan-200">{{ round.txid }}</p>
                        <p class="mt-2 font-mono text-[0.65rem] text-slate-400">not broadcast · deterministic mock txid</p>
                    </div>
                </div>

                <!-- Inspector + log -->
                <div class="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                    <div class="lab-panel">
                        <p class="lab-label">round inspector</p>
                        <dl class="mt-3 grid grid-cols-2 gap-3">
                            <div>
                                <dt class="lab-stat-label">peers</dt>
                                <dd class="lab-stat">{{ round.peers.length }}</dd>
                            </div>
                            <div>
                                <dt class="lab-stat-label">inputs</dt>
                                <dd class="lab-stat">{{ totalInputs }}</dd>
                            </div>
                            <div>
                                <dt class="lab-stat-label">outputs</dt>
                                <dd class="lab-stat">{{ totalOutputs }}</dd>
                            </div>
                            <div>
                                <dt class="lab-stat-label">signatures</dt>
                                <dd class="lab-stat">{{ round.signatures }}</dd>
                            </div>
                            <div>
                                <dt class="lab-stat-label">fee (model)</dt>
                                <dd class="lab-stat">{{ fmt(round.totalFee) }} <span class="text-xs text-slate-400">sats</span></dd>
                            </div>
                            <div>
                                <dt class="lab-stat-label">est. size</dt>
                                <dd class="lab-stat">{{ fmt(round.estBytes) }} <span class="text-xs text-slate-400">B</span></dd>
                            </div>
                        </dl>

                        <div class="mt-4">
                            <p class="lab-label">signature assembly</p>
                            <div class="mt-2 flex flex-wrap gap-1">
                                <span v-for="s in round.signatures" :key="s" class="lab-sig">✓</span>
                            </div>
                        </div>

                        <p class="mt-4 font-mono text-[0.65rem] leading-relaxed text-slate-400">
                            coordinator: {{ coordinator?.label ?? '—' }} · fee model: nIn·148 + nOut·34 + ceil(10/peers)
                        </p>
                    </div>

                    <div class="lab-panel">
                        <div class="flex items-center justify-between gap-3">
                            <p class="lab-label">round log</p>
                            <span class="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-slate-500">aria-live</span>
                        </div>
                        <div class="lab-log" aria-live="polite">
                            <p v-if="!logLines.length" class="text-slate-500">Press “run round” to simulate the six phases. Nothing leaves your browser.</p>
                            <p v-for="(line, i) in logLines" :key="i" :class="line.tone">
                                <span class="text-slate-500">{{ line.time }}</span> {{ line.msg }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── What the simulation does / does not do ── -->
        <div class="mt-8 grid gap-5 md:grid-cols-2">
            <div class="fact-card reveal">
                <h3 class="font-display text-lg font-bold text-lime-300">What the simulation mirrors</h3>
                <ul class="life-points">
                    <li>Six phases, peer election by lowest ephemeral pubkey, 1–5 inputs / 2–4 outputs per peer, onion layers through every peer.</li>
                    <li>The per-peer fee model from the design constants; the real phase timeout is 60 s + blame, shortened here for the demo.</li>
                    <li>The measured relay names and the G2b chain evidence are the reference; the simulated amounts and the mock txid are generated locally and are not research measurements.</li>
                </ul>
            </div>

            <div class="fact-card reveal">
                <h3 class="font-display text-lg font-bold text-rose-300">What it does not do</h3>
                <ul class="life-points">
                    <li>No real keys or signatures: peer pubkeys and the txid are deterministic mock hex from a local seed.</li>
                    <li>No relay messages and no broadcast: the separate relay probe opens a handshake only.</li>
                    <li>No G4: the mainnet opt-in beta is pending and no production fusion UI exists yet.</li>
                </ul>
            </div>
        </div>
        <p class="reveal mt-3 font-mono text-xs text-slate-300">
            [mock · deterministic simulation; protocol and constants cited from /research/cashfusion#six-phases and P2P-FUSION-DESIGN.md §4]
        </p>
    </section>

    <!-- ── 02 · Live relay probe ── -->
    <section id="relay-probe" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
        <div class="reveal text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">02 · the live probe</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                Probe the relays
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                This is the one experiment on the page that talks to the network. It opens a
                WebSocket handshake to each relay and closes it. No NIP-01 REQ is sent and no
                event is published. Your browser connects directly, so each relay sees your IP —
                opt in only if that is acceptable.
            </p>
        </div>

        <div class="reveal mt-8 flex flex-wrap items-center justify-center gap-3">
            <button type="button" @click="probeRelays" :disabled="probing" class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                {{ probing ? 'probing…' : 'probe relays' }}
            </button>
            <span class="font-mono text-xs uppercase tracking-[0.2em] text-slate-300">handshake only · no event published</span>
        </div>

        <div class="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div v-for="r in RELAYS" :key="r.url" class="doc-card reveal">
                <div class="flex items-start justify-between gap-3">
                    <h3 class="font-mono text-sm text-white">{{ r.name }}</h3>
                    <span class="badge" :class="probeBadge(r.url)">{{ probeLabel(r.url) }}</span>
                </div>
                <p class="mt-2 break-all font-mono text-[0.7rem] text-cyan-200">{{ r.url }}</p>
                <p class="mt-2 text-xs leading-relaxed text-slate-300">{{ r.note }}</p>
            </div>
        </div>

        <p class="reveal mt-4 font-mono text-xs text-slate-300">
            [live · browser WebSocket handshake; relay behavior cited from G1/G3L in /research/cashfusion#lessons]
        </p>
    </section>

    <!-- ── 03 · Real chain evidence ── -->
    <section id="evidence" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
        <div class="reveal text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-lime-200">03 · the record</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                The evidence behind the simulation
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                The simulator is a teaching tool. The record is the point. G2b is the only gate
                with real chain transactions; G3 and G3L are dry-runs with fixture UTXOs.
            </p>
        </div>

        <div class="mt-10 grid gap-5 lg:grid-cols-2">
            <div class="gate-card reveal">
                <div class="flex items-center justify-between gap-3">
                    <span class="gate-chip gate-live">G2b</span>
                    <span class="font-mono text-xs uppercase tracking-[0.25em] text-cyan-300">on chain</span>
                </div>
                <h3 class="mt-4 font-display text-lg font-bold text-white">Real chipnet broadcast</h3>
                <ul class="life-points">
                    <li>Funding tx 253 B accepted; round tx 2 inputs / 4 outputs, 428 B, fee 2,000 sats ≈ 4.7 sat/B.</li>
                    <li>This is the only gate in the set with real chain transactions; G3 and G3L are dry-runs with fixture UTXOs.</li>
                </ul>
                <div class="mt-4 flex flex-wrap gap-2">
                    <a
                        v-for="tx in G2B_TXS"
                        :key="tx.txid"
                        :href="'https://explorer.selene.cash/tx/' + tx.txid + '?network=chipnet'"
                        target="_blank"
                        rel="noopener"
                        class="tx-btn"
                    >
                        <span class="tx-chip">{{ tx.label }}</span>
                        <span class="tx-id">{{ tx.txid.slice(0, 10) }}…{{ tx.txid.slice(-6) }}</span>
                        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path d="M7 17 17 7M8 7h9v9" />
                        </svg>
                    </a>
                </div>
            </div>

            <div class="gate-card reveal">
                <div class="flex items-center justify-between gap-3">
                    <span class="gate-chip gate-done">G3L</span>
                    <span class="font-mono text-xs uppercase tracking-[0.25em] text-lime-300">passed · dry-run</span>
                </div>
                <h3 class="mt-4 font-display text-lg font-bold text-white">Same round over live public relays</h3>
                <ul class="life-points">
                    <li>5-party full round over wss://relay.primal.net, wss://nostr.mom and wss://offchain.pub: 10/10 signatures verified.</li>
                    <li>A repeat run also passed. The round is still a dry-run — live relays, fixture UTXOs, no broadcast.</li>
                </ul>
                <div class="mt-4 space-y-1">
                    <p class="font-mono text-xs uppercase tracking-[0.2em] text-slate-300">harness txid · dry-run (not broadcast)</p>
                    <p v-for="txid in G3L_TXS" :key="txid" class="break-all font-mono text-xs text-slate-200">{{ txid }}</p>
                </div>
            </div>
        </div>

        <div class="reveal mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
            <table class="data-table">
                <thead>
                    <tr>
                        <th scope="col">gate</th>
                        <th scope="col">status</th>
                        <th scope="col">record</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="g in GATES" :key="g.id">
                        <td><span class="gate-chip" :class="g.cls">{{ g.id }}</span></td>
                        <td class="font-mono text-xs uppercase tracking-widest text-slate-300">{{ g.status }}</td>
                        <td class="text-slate-200"><strong class="text-white">{{ g.title }}</strong> — {{ g.note }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="reveal mt-6 flex flex-wrap items-center justify-center gap-3">
            <NuxtLink to="/research/cashfusion#gate-evidence" class="btn-primary">
                Read the full gate record
            </NuxtLink>
            <NuxtLink to="/research/cashfusion#lessons" class="btn-ghost">
                Read the defect log
            </NuxtLink>
        </div>
    </section>

    <!-- ── Composition bench ── -->
    <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-28 sm:pb-36">
        <div class="reveal rounded-2xl border border-lime-300/20 bg-lime-300/[0.04] p-6 sm:p-8">
            <p class="font-mono text-xs uppercase tracking-[0.25em] text-lime-200">composition bench · design</p>
            <h3 class="mt-3 font-display text-xl font-bold text-white">Fusion first, then shield.</h3>
            <p class="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">
                The composition story is already published on the CoinJoin page: a fusion round
                breaks the input→output link, then the shielded pool hides amounts and the graph.
                The button is design-only; the two halves are built separately.
            </p>
            <NuxtLink to="/research/coinjoin" class="btn-ghost mt-5">
                Read the composition story
            </NuxtLink>
        </div>
    </section>

    <!-- ── 04 · Real vs mock ── -->
    <section id="real-vs-mock" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
        <div class="reveal text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-violet-200">04 · the honesty layer</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                Real, mocked, cited
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                A playground is only useful if the boundary is explicit. This is the boundary.
            </p>
        </div>

        <div class="reveal mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
            <table class="data-table">
                <thead>
                    <tr>
                        <th scope="col">surface</th>
                        <th scope="col">status</th>
                        <th scope="col">what it means</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in REAL_VS_MOCK" :key="row.what">
                        <td class="font-mono text-xs uppercase tracking-widest text-slate-300">{{ row.what }}</td>
                        <td><span class="badge" :class="row.cls">{{ row.verdict }}</span></td>
                        <td class="text-slate-200">{{ row.detail }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <p class="reveal mt-3 font-mono text-xs text-slate-300">
            [verification contract · every claim is a file path, a command output, or a cited source; mocked surfaces are labelled]
        </p>
    </section>

    <!-- ── 05 · Lab notes ── -->
    <section id="lab-notes" class="relative z-10 mx-auto w-full max-w-6xl scroll-mt-24 px-6 pb-28 sm:pb-36">
        <div class="reveal text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-cyan-200">05 · lab notes</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                What broke on the way
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                The expensive findings are the point of publishing the research. These are the
                defects the harness found — and the fixes that made the round pass.
            </p>
        </div>

        <div class="mt-10 grid gap-5 md:grid-cols-2">
            <NuxtLink
                v-for="(note, i) in LAB_NOTES"
                :key="note.title"
                :to="note.href"
                class="doc-card reveal"
                :style="{ transitionDelay: (i * 0.06) + 's' }"
            >
                <span class="badge badge-mid">{{ note.tag }}</span>
                <h3 class="mt-3 font-display text-base font-bold text-white">{{ note.title }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-slate-200">{{ note.body }}</p>
                <span class="mt-3 inline-block font-mono text-xs uppercase tracking-[0.22em] text-lime-300">read the finding →</span>
            </NuxtLink>
        </div>
    </section>

    <!-- ── 06 · Sources ── -->
    <section id="sources" class="relative z-10 mx-auto w-full max-w-5xl scroll-mt-24 px-6 pb-24">
        <div class="reveal text-center">
            <p class="font-mono text-[0.8rem] uppercase tracking-[0.45em] text-violet-200">06 · sources</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold leading-[1.08] text-white">
                Read the record
            </h2>
        </div>

        <div class="mt-10 grid gap-5 md:grid-cols-2">
            <component
                v-for="(s, i) in SOURCES"
                :key="s.title"
                :is="s.internal ? NuxtLinkComp : 'a'"
                :to="s.internal ? s.href : undefined"
                :href="s.internal ? undefined : s.href"
                :target="s.internal ? undefined : '_blank'"
                :rel="s.internal ? undefined : 'noopener'"
                class="doc-card reveal"
                :style="{ transitionDelay: (i * 0.06) + 's' }"
            >
                <h3 class="font-mono text-sm" :class="s.cls">{{ s.title }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-slate-200">{{ s.body }}</p>
            </component>
        </div>
    </section>

    <!-- ── Pager ── -->
    <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24">
        <div class="pager reveal">
            <NuxtLink to="/research/cashfusion" class="pager-link">
                <span class="pager-dir">← the research</span>
                <span class="pager-title">CashFusion</span>
            </NuxtLink>
            <a href="#fusion-lab" class="pager-link right">
                <span class="pager-dir">run it again →</span>
                <span class="pager-title">The fusion round</span>
            </a>
        </div>
    </section>

</template>

<style scoped>
/* ── Lab console ─────────────────────────────────────────────────── */
.lab-shell {
    border-radius: 1.6rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: linear-gradient(180deg, rgba(10, 16, 24, 0.96), rgba(6, 10, 16, 0.94));
    padding: 1.5rem;
    box-shadow: 0 30px 80px -40px rgba(0, 0, 0, 0.9);
}
@media (min-width: 640px) {
    .lab-shell { padding: 2rem; }
}

.lab-control {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    padding: 0.25rem 0.35rem 0.25rem 0.75rem;
}
.lab-label {
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(148, 163, 184, 0.9);
}
.lab-btn {
    display: inline-grid;
    place-items: center;
    height: 1.8rem;
    min-width: 1.8rem;
    border-radius: 9999px;
    border: 1px solid transparent;
    padding: 0 0.45rem;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.68rem;
    color: rgba(203, 213, 225, 0.95);
    transition: color 0.25s, background 0.25s, border-color 0.25s;
}
.lab-btn:hover {
    color: #bef264;
    background: rgba(190, 242, 100, 0.08);
}
.lab-btn-on {
    border-color: rgba(190, 242, 100, 0.4);
    background: rgba(190, 242, 100, 0.14);
    color: #bef264;
}
.lab-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.lab-shell .lab-run {
    padding: 0.7rem 1.2rem;
    font-size: 0.7rem;
}
.lab-shell .lab-reset {
    padding: 0.7rem 1.2rem;
    font-size: 0.7rem;
}

.lab-phase {
    border-radius: 0.9rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
    padding: 0.7rem;
    transition: border-color 0.35s, background 0.35s, box-shadow 0.35s, transform 0.35s;
}
.lab-phase-active {
    border-color: rgba(103, 232, 249, 0.5);
    background: rgba(103, 232, 249, 0.06);
    box-shadow: 0 0 30px -12px rgba(103, 232, 249, 0.5);
    transform: translateY(-2px);
}
.lab-phase-done {
    border-color: rgba(190, 242, 100, 0.35);
    background: rgba(190, 242, 100, 0.04);
}
.lab-phase-state {
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.58rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(148, 163, 184, 0.8);
}
.lab-phase-active .lab-phase-state { color: #67e8f9; }
.lab-phase-done .lab-phase-state { color: #bef264; }
.lab-phase-bar {
    display: block;
    height: 100%;
    border-radius: 9999px;
    background: linear-gradient(90deg, #bef264, #67e8f9);
    transition: width 0.6s ease;
}

.lab-peer {
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.025);
    padding: 0.9rem;
    transition: border-color 0.35s, background 0.35s, transform 0.35s;
}
.lab-peer-coord { border-color: rgba(103, 232, 249, 0.3); }
.lab-peer-active {
    border-color: rgba(190, 242, 100, 0.45);
    background: rgba(190, 242, 100, 0.04);
    transform: translateY(-2px);
}

.lab-stat {
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 1.1rem;
    font-weight: 700;
    color: #fff;
    line-height: 1.2;
}
.lab-stat-label {
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(148, 163, 184, 0.9);
}

.lab-node {
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.025);
    padding: 1rem;
}
.lab-relay {
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0.25rem 0.6rem;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.65rem;
    color: rgba(203, 213, 225, 0.95);
    transition: border-color 0.35s, color 0.35s, background 0.35s;
}
.lab-relay-hot {
    border-color: rgba(103, 232, 249, 0.4);
    background: rgba(103, 232, 249, 0.06);
    color: #67e8f9;
    animation: relay-pulse 1.6s ease-in-out infinite;
}
@keyframes relay-pulse {
    0%, 100% { box-shadow: 0 0 0 rgba(103, 232, 249, 0); }
    50%      { box-shadow: 0 0 18px -4px rgba(103, 232, 249, 0.5); }
}

.lab-panel {
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.025);
    padding: 1rem;
}
.lab-log {
    margin-top: 0.6rem;
    max-height: 15rem;
    overflow-y: auto;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.72rem;
    line-height: 1.6;
}
.lab-sig {
    display: inline-grid;
    place-items: center;
    height: 1.4rem;
    width: 1.4rem;
    border-radius: 9999px;
    border: 1px solid rgba(190, 242, 100, 0.35);
    background: rgba(190, 242, 100, 0.08);
    color: #bef264;
    font-size: 0.7rem;
}

@media (prefers-reduced-motion: reduce) {
    .lab-relay-hot { animation: none; }
    .lab-phase, .lab-peer, .lab-phase-bar { transition: none; }
}
</style>
