/* web/stores/p2pfusion/round.ts
   Six-phase serverless CoinJoin round (P2P-FUSION-DESIGN.md §4).
   Roles are decided by election (lowest ephemeral pubkey = coordinator).
   All messages are NIP-59 gift wraps; output registration is a NIP-44 onion.

   Phase map: inputs → onion → outputs → tx → sign → broadcast → done
   Upstream parity [cited · 00-Wallet landing/views/fusion.ts L466–1050]. */

import { NostrRelayPool } from './relay.ts'
import { createRumor, giftWrap, giftUnwrap } from './giftwrap.ts'
import type { NostrEvent } from './giftwrap.ts'
import { onionWrap, onionPeel } from './onion.ts'
import type { EphemeralIdentity } from './identity.ts'
import { hexToBytes, bytesToHex, bytesToUtf8 } from './identity.ts'
import { secp256k1 } from '@noble/curves/secp256k1.js'
import {
    p2pkhScript, signP2pkhInput, estimateTxSize, hash160, serializeTx, txidOf,
} from './txbuild.ts'
import type { Tx, PrevOut } from './txbuild.ts'

const NOSTR_KIND_JOINER = 22231
const DEFAULT_PHASE_TIMEOUT_MS = 60000
const MAX_FEE_RATE = 5 // sat/B cap for the pre-sign check (upstream parity)

export interface RoundUtxo {
    txid: string
    vout: number
    value: number
    privHex: string
}

export interface RoundOutput {
    addr: string
    script: Uint8Array
    value: number
}

export interface RoundConfig {
    /** All participants including self — x-only hex pubkeys. */
    peers: string[]
    roundId: string
    utxos: RoundUtxo[]
    outputs: RoundOutput[]
    phaseTimeoutMs?: number
    onPhase?: (phase: string, detail?: string) => void
    /** Coordinator-only: broadcast the assembled tx (G2b). Absent = dry-run (G2a). */
    broadcastFn?: (txHex: string) => Promise<string>
}

export interface RoundResult {
    txid: string
    txHex: string
    fee: number
    inputs: number
    outputs: number
}

export type RoundPhase = 'inputs' | 'onion' | 'outputs' | 'tx' | 'sign' | 'broadcast' | 'done'

interface Msg {
    type: string
    roundId: string
    from: string
    [k: string]: unknown
}

interface PlainOutput {
    addr: string
    value: number
    script: string // hex
}

export class FusionRound {
    private pool: NostrRelayPool
    private id: EphemeralIdentity
    private cfg: RoundConfig
    private subId: string | null = null
    private phase: RoundPhase | null = null
    private timer: ReturnType<typeof setTimeout> | null = null
    private resendTimer: ReturnType<typeof setInterval> | null = null
    private peers: string[]
    private myIndex: number

    private peerInputs = new Map<string, { txid: string; vout: number; value: number }[]>()
    private peerOutputCounts = new Map<string, number>()
    private onionsCollected: Uint8Array[] = []
    private expectedOnions = 0
    private plainOutputs: PlainOutput[] | null = null
    private assembled: Tx | null = null
    private peerSigs = new Map<string, { index: number; scriptSig: string }[]>()

    private resolveFn: ((r: RoundResult) => void) | null = null
    private rejectFn: ((e: Error) => void) | null = null
    /** messages that arrived before their phase — flushed on phase entry */
    private pending: Msg[] = []
    private flushing = false

    constructor(pool: NostrRelayPool, id: EphemeralIdentity, cfg: RoundConfig) {
        this.pool = pool
        this.id = id
        this.cfg = cfg
        this.peers = [...cfg.peers].sort()
        const idx = this.peers.indexOf(id.pubHex)
        if (idx < 0) throw new Error('round: self pubkey not in peers')
        this.myIndex = idx
    }

    get isCoordinator(): boolean { return this.myIndex === 0 }
    get currentPhase(): RoundPhase | null { return this.phase }

    start(): Promise<RoundResult> {
        return new Promise<RoundResult>((resolve, reject) => {
            this.resolveFn = resolve
            this.rejectFn = reject
            this.subId = this.pool.subscribe(
                [{ kinds: [1059], '#p': [this.id.pubHex], since: Math.floor(Date.now() / 1000) - 172800 - 300 }],
                (ev: NostrEvent) => this.onGiftWrap(ev),
            )
            this.enterPhase('inputs')
        })
    }

    /* ── messaging ─────────────────────────────────────────────── */

    private send(msg: Msg, targetPub: string): void {
        const rumor = createRumor({ pubkey: this.id.pubHex, kind: NOSTR_KIND_JOINER, content: JSON.stringify(msg) })
        this.pool.publish(giftWrap(rumor, this.id.privHex, targetPub))
    }

    private broadcastMsg(msg: Msg): void {
        for (const p of this.peers) if (p !== this.id.pubHex) this.send(msg, p)
    }

    private onGiftWrap(ev: NostrEvent): void {
        this.dbg('giftwrap in', ev.id.slice(0, 8))
        let rumor
        try { ({ rumor } = giftUnwrap(ev, this.id.privHex)) } catch { return }
        let msg: Msg
        try { msg = JSON.parse(rumor.content) } catch { return }
        if (!msg || msg.roundId !== this.cfg.roundId) return
        if (msg.from !== rumor.pubkey) return
        try { this.handleOrBuffer(msg) } catch (e) { this.fail(e as Error) }
    }

    private phaseAllows(type: string): boolean {
        switch (type) {
            case 'inputs': return this.phase === 'inputs'
            case 'onion': return this.phase === 'onion'
            case 'outputs': return this.phase === 'onion' || this.phase === 'outputs'
            case 'tx': return this.phase === 'tx' || this.phase === 'outputs'
            case 'sign': return this.phase === 'sign'
            case 'done': return this.phase !== null
            default: return false
        }
    }

    private handleOrBuffer(msg: Msg): void {
        this.dbg('msg', msg.type, 'phase', this.phase, this.phaseAllows(msg.type) ? 'ok' : 'BUFFERED')
        if (!this.phaseAllows(msg.type)) { this.pending.push(msg); return }
        this.dispatch(msg)
    }

    private flushPending(): void {
        if (this.flushing) return
        this.flushing = true
        try {
            for (;;) {
                const idx = this.pending.findIndex(m => this.phaseAllows(m.type))
                if (idx < 0) break
                const [m] = this.pending.splice(idx, 1)
                this.dispatch(m)
                if (this.phase === 'done') break
            }
        } finally { this.flushing = false }
    }

    private dispatch(msg: Msg): void {
        switch (msg.type) {
            case 'inputs': return this.onInputs(msg)
            case 'onion': return this.onOnion(msg)
            case 'outputs': return this.onOutputs(msg)
            case 'tx': return this.onTx(msg)
            case 'sign': return this.onSign(msg)
            case 'done': return this.onDone(msg)
            default: return
        }
    }

    /* ── phase machinery ───────────────────────────────────────── */

    private dbg(...a: unknown[]): void {
        if (typeof process !== 'undefined' && process.env?.HUSH_DEBUG) console.error('[round]', this.id.pubHex.slice(0, 8), ...a)
    }

    private enterPhase(p: RoundPhase, detail?: string): void {
        this.dbg('enterPhase', p, detail ?? '')
        this.phase = p
        this.cfg.onPhase?.(p, detail)
        if (this.timer) clearTimeout(this.timer)
        if (this.resendTimer) { clearInterval(this.resendTimer); this.resendTimer = null }
        const timeout = this.cfg.phaseTimeoutMs ?? DEFAULT_PHASE_TIMEOUT_MS
        this.timer = setTimeout(() => this.fail(new Error(`round: phase ${p} timed out after ${timeout}ms`)), timeout)

        this.flushPending()
        if (p === 'inputs') {
            const inputs = this.cfg.utxos.map(u => ({ txid: u.txid, vout: u.vout, value: u.value }))
            this.peerInputs.set(this.id.pubHex, inputs)
            this.peerOutputCounts.set(this.id.pubHex, this.cfg.outputs.length)
            const msg: Msg = { type: 'inputs', roundId: this.cfg.roundId, from: this.id.pubHex, inputs, outputCount: this.cfg.outputs.length }
            this.broadcastMsg(msg)
            // relays may drop events: re-announce until the phase advances (idempotent by sender)
            this.resendTimer = setInterval(() => {
                if (this.phase !== 'inputs') { if (this.resendTimer) clearInterval(this.resendTimer); this.resendTimer = null; return }
                this.broadcastMsg(msg)
            }, 5000)
        }
        if (p === 'onion') this.startOnion()
    }

    private fail(e: Error): void {
        if (this.timer) clearTimeout(this.timer)
        if (this.resendTimer) { clearInterval(this.resendTimer); this.resendTimer = null }
        if (this.subId) this.pool.unsubscribe(this.subId)
        this.phase = null
        this.rejectFn?.(e)
        this.rejectFn = null
    }

    private succeed(r: RoundResult, src = '?'): void {
        this.dbg('SUCCEED via', src, 'hexLen', r.txHex.length, 'sigLen', r.txHex.slice(84, 86))
        if (this.timer) clearTimeout(this.timer)
        if (this.resendTimer) { clearInterval(this.resendTimer); this.resendTimer = null }
        if (this.subId) this.pool.unsubscribe(this.subId)
        this.phase = 'done'
        this.resolveFn?.(r)
        this.resolveFn = null
    }

    /* ── phase 2: inputs ───────────────────────────────────────── */

    private onInputs(msg: Msg): void {
        if (this.phase !== 'inputs') return
        if (this.peerInputs.has(msg.from)) return
        const inputs = msg.inputs as { txid: string; vout: number; value: number }[]
        const count = Number(msg.outputCount)
        if (!Array.isArray(inputs) || inputs.length < 1 || inputs.length > 5) throw new Error('round: bad input count from ' + msg.from.slice(0, 8))
        if (!Number.isInteger(count) || count < 1 || count > 4) throw new Error('round: bad output count from ' + msg.from.slice(0, 8))
        this.peerInputs.set(msg.from, inputs)
        this.peerOutputCounts.set(msg.from, count)
        if (this.peerInputs.size === this.peers.length) this.enterPhase('onion')
    }

    /* ── phase 3: onion mix-net ────────────────────────────────── */

    private startOnion(): void {
        // peerOutputCounts already includes self
        this.expectedOnions = 0
        for (const c of this.peerOutputCounts.values()) this.expectedOnions += c

        const first = this.peers[0]
        for (const out of this.cfg.outputs) {
            const payload = JSON.stringify({ addr: out.addr, value: out.value, script: bytesToHex(out.script) })
            const layer = onionWrap(payload, this.peers)
            if (first === this.id.pubHex) this.processOnionLayer(layer)
            else this.send({ type: 'onion', roundId: this.cfg.roundId, from: this.id.pubHex, onion: bytesToHex(layer) }, first)
        }
        this.checkOnions()
    }

    private onOnion(msg: Msg): void {
        if (this.phase !== 'onion') return
        this.processOnionLayer(hexToBytes(String(msg.onion)))
    }

    /** Peel one layer: final payload → collect; otherwise forward to the next peeler. */
    private processOnionLayer(layer: Uint8Array): void {
        let inner: Uint8Array
        try { inner = onionPeel(layer, this.id.privHex) } catch { throw new Error('round: onion we cannot peel (wrong hop order?)') }
        try {
            const parsed = JSON.parse(bytesToUtf8(inner))
            if (typeof parsed.addr === 'string' && typeof parsed.value === 'number' && typeof parsed.script === 'string') {
                this.onionsCollected.push(inner)
                this.checkOnions()
                return
            }
        } catch { /* not the final layer */ }
        const next = this.peers[this.myIndex + 1]
        if (!next) throw new Error('round: last peeler received a non-final onion')
        this.send({ type: 'onion', roundId: this.cfg.roundId, from: this.id.pubHex, onion: bytesToHex(inner) }, next)
    }

    private checkOnions(): void {
        this.dbg('onions', this.onionsCollected.length, '/', this.expectedOnions)
        if (this.onionsCollected.length < this.expectedOnions) return
        if (this.onionsCollected.length > this.expectedOnions) throw new Error('round: too many onions')
        const plain = this.onionsCollected.map(o => JSON.parse(bytesToUtf8(o)) as PlainOutput)
        for (let i = plain.length - 1; i > 0; i--) {
            const j = randomInt(i + 1)
            ;[plain[i], plain[j]] = [plain[j], plain[i]]
        }
        this.plainOutputs = plain
        this.broadcastMsg({ type: 'outputs', roundId: this.cfg.roundId, from: this.id.pubHex, outputs: plain })
        this.enterPhase('outputs')
        if (this.isCoordinator) this.startTxAssembly()
    }

    private onOutputs(msg: Msg): void {
        // the coordinator may still be in 'onion' (it only peeled/forwarded its hops)
        if (this.phase !== 'outputs' && this.phase !== 'onion') return
        const outputs = msg.outputs as PlainOutput[]
        if (!Array.isArray(outputs) || outputs.length === 0) throw new Error('round: empty output set')
        this.plainOutputs = outputs
        if (this.isCoordinator) this.startTxAssembly()
    }

    /* ── phase 4: tx assembly (coordinator) ────────────────────── */

    private startTxAssembly(): void {
        if (!this.plainOutputs) throw new Error('round: no plaintext outputs to assemble')
        const orderedInputs: { txid: string; vout: number; value: number }[] = []
        for (const p of this.peers) orderedInputs.push(...(this.peerInputs.get(p) ?? []))
        const totalIn = orderedInputs.reduce((s, i) => s + i.value, 0)
        const totalOut = this.plainOutputs.reduce((s, o) => s + o.value, 0)
        if (totalOut >= totalIn) throw new Error('round: output set would create a non-positive fee')
        const fee = totalIn - totalOut
        if (fee > estimateTxSize(orderedInputs.length, this.plainOutputs.length) * MAX_FEE_RATE) {
            throw new Error('round: fee above cap — aborting')
        }

        const tx: Tx = {
            version: 1,
            inputs: orderedInputs.map(i => ({ txid: i.txid, vout: i.vout, scriptSig: new Uint8Array(0), sequence: 0xffffffff })),
            outputs: this.plainOutputs.map(o => ({ value: o.value, script: hexToBytes(o.script) })),
            locktime: 0,
        }
        this.assembled = tx
        this.broadcastMsg({
            type: 'tx', roundId: this.cfg.roundId, from: this.id.pubHex,
            tx: {
                version: tx.version, locktime: tx.locktime,
                inputs: tx.inputs.map(i => ({ txid: i.txid, vout: i.vout, sequence: i.sequence })),
                outputs: tx.outputs.map(o => ({ value: o.value, script: bytesToHex(o.script) })),
            },
        })
        this.enterPhase('tx')
        this.signMyInputs() // coordinator is also a participant
    }

    private onTx(msg: Msg): void {
        if (this.phase !== 'tx' && this.phase !== 'outputs') return
        this.enterPhase('tx')
        const t = msg.tx as { version: number; locktime: number; inputs: { txid: string; vout: number; sequence: number }[]; outputs: { value: number; script: string }[] }
        if (!t || !Array.isArray(t.inputs) || !Array.isArray(t.outputs)) throw new Error('round: malformed tx message')
        const tx: Tx = {
            version: t.version,
            inputs: t.inputs.map(i => ({ txid: i.txid, vout: i.vout, scriptSig: new Uint8Array(0), sequence: i.sequence })),
            outputs: t.outputs.map(o => ({ value: o.value, script: hexToBytes(o.script) })),
            locktime: t.locktime,
        }
        this.verifyAssembledTx(tx)
        this.assembled = tx
        this.signMyInputs()
    }

    /** Pre-sign checks (upstream parity: outputs present, no inflation, fee cap). */
    private verifyAssembledTx(tx: Tx): void {
        for (const u of this.cfg.utxos) {
            if (!tx.inputs.some(i => i.txid === u.txid && i.vout === u.vout)) throw new Error('round: my input missing from assembled tx')
        }
        for (const o of this.cfg.outputs) {
            if (!tx.outputs.some(x => x.value === o.value && bytesToHex(x.script) === bytesToHex(o.script))) throw new Error('round: my output missing from assembled tx')
        }
        const totalIn = [...this.peerInputs.values()].flat().reduce((s, i) => s + i.value, 0)
        const totalOut = tx.outputs.reduce((s, o) => s + o.value, 0)
        if (totalOut > totalIn) throw new Error('round: inflation detected — aborting')
        if (totalIn - totalOut > estimateTxSize(tx.inputs.length, tx.outputs.length) * MAX_FEE_RATE) throw new Error('round: excessive fee — aborting')
    }

    private signMyInputs(): void {
        if (!this.assembled) throw new Error('round: no tx to sign')
        const tx = this.assembled
        const valueByOutpoint = new Map<string, number>()
        for (const list of this.peerInputs.values()) for (const i of list) valueByOutpoint.set(i.txid + ':' + i.vout, i.value)

        const sigs: { index: number; scriptSig: string }[] = []
        tx.inputs.forEach((inp, index) => {
            const mine = this.cfg.utxos.find(u => u.txid === inp.txid && u.vout === inp.vout)
            if (!mine) return
            // scriptCode = the P2PKH script of THIS input's key (correct y-parity)
            const compressed = secp256k1.getPublicKey(hexToBytes(mine.privHex), true)
            const myScript = p2pkhScript(hash160(compressed))
            const prevouts: PrevOut[] = tx.inputs.map(i => ({ value: valueByOutpoint.get(i.txid + ':' + i.vout) ?? 0, scriptCode: myScript }))
            const scriptSig = signP2pkhInput(tx, index, prevouts, mine.privHex)
            sigs.push({ index, scriptSig: bytesToHex(scriptSig) })
        })
        this.dbg('signMyInputs sigs', sigs.length, 'tx inputs', tx.inputs.length)
        const signMsg: Msg = { type: 'sign', roundId: this.cfg.roundId, from: this.id.pubHex, sigs }
        this.broadcastMsg(signMsg)
        this.resendTimer = setInterval(() => {
            if (this.phase !== 'sign') { if (this.resendTimer) clearInterval(this.resendTimer); this.resendTimer = null; return }
            this.broadcastMsg(signMsg)
        }, 5000)
        this.peerSigs.set(this.id.pubHex, sigs)
        if (this.isCoordinator) {
            this.enterPhase('sign')
            this.checkSignatures()
        } else {
            this.enterPhase('sign')
        }
    }

    private onSign(msg: Msg): void {
        if (this.phase !== 'sign') return
        const sigs = msg.sigs as { index: number; scriptSig: string }[]
        if (!Array.isArray(sigs)) throw new Error('round: malformed signature message')
        this.peerSigs.set(msg.from, sigs)
        if (this.isCoordinator) this.checkSignatures()
    }

    private checkSignatures(): void {
        this.dbg('checkSignatures peerSigs', this.peerSigs.size, '/', this.peers.length, 'phase', this.phase)
        if (this.peerSigs.size < this.peers.length) return
        if (!this.assembled) throw new Error('round: signatures before assembly')
        const tx = this.assembled
        for (const [who, sigs] of this.peerSigs) {
            this.dbg('applying sigs from', who.slice(0, 8), 'count', sigs.length)
            for (const s of sigs) {
                if (s.index < 0 || s.index >= tx.inputs.length) throw new Error('round: signature index out of range')
                tx.inputs[s.index].scriptSig = hexToBytes(s.scriptSig)
            }
        }
        for (let i = 0; i < tx.inputs.length; i++) {
            if (tx.inputs[i].scriptSig.length === 0) throw new Error('round: missing signature for input ' + i)
        }
        const txHex = bytesToHex(serializeTx(tx))
        const fee = [...this.peerInputs.values()].flat().reduce((s, i) => s + i.value, 0) - tx.outputs.reduce((s, o) => s + o.value, 0)
        this.enterPhase('broadcast')

        this.dbg('assembled txHex len', bytesToHex(serializeTx(tx)).length, 'input0 scriptSig len', tx.inputs[0].scriptSig.length)
        const finish = (txid: string) => {
            const result: RoundResult = { txid, txHex, fee, inputs: tx.inputs.length, outputs: tx.outputs.length }
            this.broadcastMsg({ type: 'done', roundId: this.cfg.roundId, from: this.id.pubHex, txid, txHex })
            this.succeed(result, 'checkSignatures')
        }
        if (this.cfg.broadcastFn) {
            this.cfg.broadcastFn(txHex).then(finish).catch((e: Error) => this.fail(e))
        } else {
            finish(txidOf(tx))
        }
    }

    private onDone(msg: Msg): void {
        const txHex = String(msg.txHex)
        this.dbg('onDone txHex len', txHex.length)
        const txid = String(msg.txid)
        if (!/^[0-9a-f]+$/.test(txHex)) throw new Error('round: malformed final tx')
        const fee = [...this.peerInputs.values()].flat().reduce((s, i) => s + i.value, 0)
            - (this.plainOutputs?.reduce((s, o) => s + o.value, 0) ?? 0)
        this.succeed({ txid, txHex, fee, inputs: this.assembled?.inputs.length ?? 0, outputs: this.assembled?.outputs.length ?? 0 }, 'onDone')
    }
}

function randomInt(maxExclusive: number): number {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return buf[0] % maxExclusive
}
