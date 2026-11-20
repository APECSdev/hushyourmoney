/* web/tests/p2pfusion-g2.mjs
   GATE G2a (P2P-FUSION-DESIGN.md §5): full six-phase round between two peers
   over live Nostr relays, DRY-RUN (no chain broadcast), with independent
   verification of the assembled transaction (BIP143 sighash + Schnorr per input).
   G2b (real chipnet broadcast) plugs `broadcastFn` in a later harness.

   Run: node web/tests/p2pfusion-g2.mjs */

import assert from 'node:assert'
import { createEphemeralIdentity, bytesToHex, hexToBytes } from '../stores/p2pfusion/identity.ts'
import { NostrRelayPool, waitForRelays } from '../stores/p2pfusion/relay.ts'
import { FusionRound } from '../stores/p2pfusion/round.ts'
import { p2pkhScript, hash160, bip143Sighash, serializeTx, txidOf, bchSchnorrVerify } from '../stores/p2pfusion/txbuild.ts'
import { secp256k1, schnorr } from '@noble/curves/secp256k1.js'
import { startRelayFixture } from './nostr-relay-fixture.mjs'

/* Deterministic by default (in-process relay fixture); set HUSH_RELAYS to use live relays. */
const useLive = !!process.env.HUSH_RELAYS

function compressedOf(pubXOnly) {
    const c = new Uint8Array(33)
    c[0] = 0x02
    c.set(hexToBytes(pubXOnly), 1)
    return c
}
function fakeTxid(seed) {
    // deterministic distinct 32-byte hex ids (not real outpoints — dry run)
    return seed.repeat(64).slice(0, 64)
}
function scriptSigParts(scriptSig) {
    // parse: push65(sig+hashtype) push33(pubkey)
    const sigLen = scriptSig[0]
    const sig = scriptSig.subarray(1, 1 + sigLen - 1)
    const hashType = scriptSig[1 + sigLen - 1]
    const pubLen = scriptSig[1 + sigLen]
    const pub = scriptSig.subarray(2 + sigLen, 2 + sigLen + pubLen)
    return { sig, hashType, pub }
}

async function main() {
    const fixture = useLive ? null : await startRelayFixture()
    const RELAYS = useLive ? process.env.HUSH_RELAYS.split(',') : [fixture.url]
    const peers = [createEphemeralIdentity(), createEphemeralIdentity()]
    const pool = new NostrRelayPool(RELAYS)
    pool.connect()
    const status = await waitForRelays(pool, 1, 15000)
    assert.ok(status.connected >= 1, 'need at least one relay: ' + JSON.stringify(status.urls))
    console.log('relays connected:', status.connected, '/', status.total)

    const roundId = 'g2a-' + Date.now().toString(36)

    // ── peer wallet fixtures (dry-run UTXOs) ──────────────────────────────
    const wallets = peers.map((id, n) => {
        const script = p2pkhScript(hash160(secp256k1.getPublicKey(hexToBytes(id.privHex), true)))
        const utxos = [
            { txid: fakeTxid('a' + n), vout: 0, value: 100000, privHex: id.privHex },
            { txid: fakeTxid('b' + n), vout: 1, value: 50000, privHex: id.privHex },
        ]
        const total = utxos.reduce((s, u) => s + u.value, 0)
        // two fresh outputs per peer (fresh keys, scripts only)
        const outs = [createEphemeralIdentity(), createEphemeralIdentity()].map((fresh, k) => ({
            addr: 'dryrun:' + fresh.pubHex.slice(0, 12),
            script: p2pkhScript(hash160(secp256k1.getPublicKey(hexToBytes(fresh.privHex), true))),
            value: Math.floor((total - 1500) / 2) + (k === 0 ? (total - 1500) % 2 : 0),
        }))
        return { id, script, utxos, outs }
    })

    const totalIn = wallets.reduce((s, w) => s + w.utxos.reduce((x, u) => x + u.value, 0), 0)
    const totalOut = wallets.reduce((s, w) => s + w.outs.reduce((x, o) => x + o.value, 0), 0)
    const expectedFee = totalIn - totalOut
    assert.ok(expectedFee > 0 && expectedFee < 5000, 'fixture fee sanity')

    // ── run both sides of the round ───────────────────────────────────────
    const phasesSeen = { A: [], B: [] }
    const rounds = wallets.map((w, i) => new FusionRound(pool, w.id, {
        peers: peers.map(p => p.pubHex),
        roundId,
        utxos: w.utxos,
        outputs: w.outs,
        phaseTimeoutMs: 45000,
        onPhase: (p) => phasesSeen[i === 0 ? 'A' : 'B'].push(p),
    }))
    // stagger start so subscriptions are live before the first message
    const pA = rounds[0].start()
    await new Promise(r => setTimeout(r, 1500))
    const pB = rounds[1].start()

    const [resA, resB] = await Promise.all([pA, pB])
    pool.close()

    // ── assertions ────────────────────────────────────────────────────────
    assert.strictEqual(resA.txid, resB.txid, 'both peers must derive the same txid')
    assert.strictEqual(resA.txHex, resB.txHex, 'both peers must derive the same tx')
    assert.strictEqual(resA.fee, expectedFee, 'fee must match the fixture')
    assert.strictEqual(resA.inputs, 4, '4 inputs (2 per peer)')
    assert.strictEqual(resA.outputs, 4, '4 outputs (2 per peer)')

    // independent verification: parse the final tx hex and check every signature
    const txBytes = hexToBytes(resA.txHex)
    const parsed = parseTx(txBytes)
    assert.strictEqual(parsed.inputs.length, 4)
    assert.strictEqual(parsed.outputs.length, 4)

    // map outpoint → owner pubkey (compressed) via the fixture scripts
    const ownerByOutpoint = new Map()
    for (const w of wallets) for (const u of w.utxos) ownerByOutpoint.set(u.txid + ':' + u.vout, w.id.privHex)
    const valueByOutpoint = new Map()
    for (const w of wallets) for (const u of w.utxos) valueByOutpoint.set(u.txid + ':' + u.vout, u.value)

    const prevouts = parsed.inputs.map(i => {
        const ownerPriv = ownerByOutpoint.get(i.txid + ':' + i.vout)
        assert.ok(ownerPriv, 'unknown input outpoint')
        return { value: valueByOutpoint.get(i.txid + ':' + i.vout), scriptCode: p2pkhScript(hash160(secp256k1.getPublicKey(hexToBytes(ownerPriv), true))) }
    })
    const txForSighash = { version: parsed.version, inputs: parsed.inputs.map(i => ({ ...i, scriptSig: new Uint8Array(0) })), outputs: parsed.outputs, locktime: parsed.locktime }
    parsed.inputs.forEach((inp, idx) => {
        const { sig, hashType, pub } = scriptSigParts(inp.scriptSig)
        assert.strictEqual(hashType, 0x41, 'sighash type must be ALL|FORKID')
        const sighash = bip143Sighash(txForSighash, idx, prevouts)
        const ok = bchSchnorrVerify(sig, sighash, pub)
        assert.ok(ok, 'input ' + idx + ' signature must verify')
    })
    // outputs: each peer's scripts present with exact values
    for (const w of wallets) {
        for (const o of w.outs) {
            assert.ok(parsed.outputs.some(x => x.value === o.value && bytesToHex(x.script) === bytesToHex(o.script)), 'peer output missing')
        }
    }
    // re-serialize check: our parser round-trips the exact final hex
    assert.strictEqual(bytesToHex(serializeTx({ version: parsed.version, inputs: parsed.inputs, outputs: parsed.outputs, locktime: parsed.locktime })), resA.txHex)

    console.log('PASS six-phase round, txid:', resA.txid)
    console.log('PASS independent BIP143+Schnorr verification: 4/4 inputs')
    console.log('phases A:', phasesSeen.A.join(' → '))
    console.log('phases B:', phasesSeen.B.join(' → '))
    console.log('fee:', resA.fee, 'sats | size est:', 10 + 4 * 148 + 4 * 34, 'B')
    console.log('G2a: PASS')
    if (fixture) await fixture.close()
}

/* minimal BCH tx parser (version, inputs, outputs, locktime) */
function parseTx(b) {
    let off = 0
    const u32 = () => { const v = b[off] | (b[off + 1] << 8) | (b[off + 2] << 16) | (b[off + 3] << 24); off += 4; return v >>> 0 }
    const u64 = () => { let v = 0n; for (let i = 7; i >= 0; i--) v = (v << 8n) | BigInt(b[off + i]); off += 8; return Number(v) }
    const varint = () => {
        const n = b[off++]
        if (n < 0xfd) return n
        if (n === 0xfd) { const v = b[off] | (b[off + 1] << 8); off += 2; return v }
        if (n === 0xfe) { const v = u32(); return v }
        throw new Error('varint too large')
    }
    const version = u32()
    const nIn = varint()
    const inputs = []
    for (let i = 0; i < nIn; i++) {
        const txid = bytesToHex(b.subarray(off, off + 32).slice().reverse()); off += 32
        const vout = u32()
        const sl = varint()
        const scriptSig = b.subarray(off, off + sl); off += sl
        const sequence = u32()
        inputs.push({ txid, vout, scriptSig, sequence })
    }
    const nOut = varint()
    const outputs = []
    for (let i = 0; i < nOut; i++) {
        const value = u64()
        const sl = varint()
        const script = b.subarray(off, off + sl); off += sl
        outputs.push({ value, script })
    }
    const locktime = u32()
    if (off !== b.length) throw new Error('parseTx: trailing bytes')
    return { version, inputs, outputs, locktime }
}

main().catch((e) => { console.error('G2a FAIL:', e?.message || e); process.exit(1) })
