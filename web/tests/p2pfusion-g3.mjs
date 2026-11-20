/* web/tests/p2pfusion-g3.mjs
   GATE G3 (P2P-FUSION-DESIGN.md §5): N-party round (default 5) — multi-hop onion,
   election, all peers must agree on one tx, every signature independently verified.

   Transport: in-process NIP-01 relay fixture (deterministic). Live-relay transport
   for full rounds is a separate gate (G3L) to be added after this one passes.

   Run: node web/tests/p2pfusion-g3.mjs            (5 peers)
        PEER_COUNT=7 node web/tests/p2pfusion-g3.mjs */

import assert from 'node:assert'
import { createEphemeralIdentity, bytesToHex, hexToBytes } from '../stores/p2pfusion/identity.ts'
import { NostrRelayPool } from '../stores/p2pfusion/relay.ts'
import { FusionRound } from '../stores/p2pfusion/round.ts'
import { p2pkhScript, hash160, bip143Sighash, serializeTx, bchSchnorrVerify } from '../stores/p2pfusion/txbuild.ts'
import { secp256k1 } from '@noble/curves/secp256k1.js'
import { startRelayFixture } from './nostr-relay-fixture.mjs'

const PEER_COUNT = Number(process.env.PEER_COUNT || 5)
const PER_PEER_FEE = 1000

function fakeTxid(seed) { return seed.repeat(64).slice(0, 64) }
function scriptSigParts(scriptSig) {
    const sigLen = scriptSig[0]
    const sig = scriptSig.subarray(1, 1 + sigLen - 1)
    const hashType = scriptSig[1 + sigLen - 1]
    const pubLen = scriptSig[1 + sigLen]
    const pub = scriptSig.subarray(2 + sigLen, 2 + sigLen + pubLen)
    return { sig, hashType, pub }
}

function parseTx(b) {
    let off = 0
    const u32 = () => { const v = b[off] | (b[off + 1] << 8) | (b[off + 2] << 16) | (b[off + 3] << 24); off += 4; return v >>> 0 }
    const u64 = () => { let v = 0n; for (let i = 7; i >= 0; i--) v = (v << 8n) | BigInt(b[off + i]); off += 8; return Number(v) }
    const varint = () => { const n = b[off++]; if (n < 0xfd) return n; if (n === 0xfd) { const v = b[off] | (b[off + 1] << 8); off += 2; return v } if (n === 0xfe) return u32(); throw new Error('varint') }
    const version = u32()
    const nIn = varint(); const inputs = []
    for (let i = 0; i < nIn; i++) {
        const txid = bytesToHex(b.subarray(off, off + 32).slice().reverse()); off += 32
        const vout = u32(); const sl = varint(); const scriptSig = b.subarray(off, off + sl); off += sl
        inputs.push({ txid, vout, scriptSig, sequence: u32() })
    }
    const nOut = varint(); const outputs = []
    for (let i = 0; i < nOut; i++) {
        const value = u64(); const sl = varint(); const script = b.subarray(off, off + sl); off += sl
        outputs.push({ value, script })
    }
    const locktime = u32()
    if (off !== b.length) throw new Error('parseTx: trailing bytes')
    return { version, inputs, outputs, locktime }
}

async function main() {
    const live = !!process.env.HUSH_RELAYS
    console.log('G3' + (live ? 'L (LIVE RELAYS)' : '') + ': peers =', PEER_COUNT)
    const fixture = live ? null : await startRelayFixture()
    const relayUrls = live ? process.env.HUSH_RELAYS.split(',') : [fixture.url]
    if (live) console.log('relays:', relayUrls.join(', '))
    const peers = Array.from({ length: PEER_COUNT }, () => createEphemeralIdentity())
    // one connection per peer: public relays do not echo events back to the
    // publishing connection, so a shared socket breaks peer-to-peer delivery
    const pools = peers.map(() => new NostrRelayPool(relayUrls))
    for (const p of pools) p.connect()
    // give live sockets time to open before the first publish
    await new Promise(r => setTimeout(r, live ? 5000 : 400))

    const roundId = 'g3-' + Date.now().toString(36)

    const wallets = peers.map((id, n) => {
        const script = p2pkhScript(hash160(secp256k1.getPublicKey(hexToBytes(id.privHex), true)))
        const utxos = [
            { txid: fakeTxid('a' + n), vout: 0, value: 100000, privHex: id.privHex },
            { txid: fakeTxid('b' + n), vout: 1, value: 50000, privHex: id.privHex },
        ]
        const total = utxos.reduce((s, u) => s + u.value, 0) - PER_PEER_FEE
        const outs = [createEphemeralIdentity(), createEphemeralIdentity()].map((fresh, k) => ({
            addr: 'dryrun:' + fresh.pubHex.slice(0, 12),
            script: p2pkhScript(hash160(secp256k1.getPublicKey(hexToBytes(fresh.privHex), true))),
            value: Math.floor(total / 2) + (k === 0 ? total % 2 : 0),
        }))
        return { id, script, utxos, outs }
    })

    const totalIn = wallets.reduce((s, w) => s + w.utxos.reduce((x, u) => x + u.value, 0), 0)
    const totalOut = wallets.reduce((s, w) => s + w.outs.reduce((x, o) => x + o.value, 0), 0)
    const expectedFee = totalIn - totalOut
    assert.ok(expectedFee > 0, 'fixture fee must be positive')

    const phases = wallets.map(() => [])
    const rounds = wallets.map((w, i) => new FusionRound(pools[i], w.id, {
        peers: peers.map(p => p.pubHex),
        roundId,
        utxos: w.utxos,
        outputs: w.outs,
        phaseTimeoutMs: live ? 120000 : 90000,
        onPhase: (p) => phases[i].push(p),
    }))

    // stagger starts so every subscription is live before the first message
    const promises = []
    for (let i = 0; i < rounds.length; i++) {
        promises.push(rounds[i].start())
        await new Promise(r => setTimeout(r, 400))
    }
    const results = await Promise.all(promises)
    for (const p of pools) p.close()
    if (fixture) await fixture.close()

    // ── agreement ─────────────────────────────────────────────────────────
    const txids = new Set(results.map(r => r.txid))
    const hexes = new Set(results.map(r => r.txHex))
    assert.strictEqual(txids.size, 1, 'all peers must derive the same txid, got: ' + [...txids].join(','))
    assert.strictEqual(hexes.size, 1, 'all peers must derive the same tx')
    const res = results[0]
    assert.strictEqual(res.fee, expectedFee, 'fee mismatch')
    assert.strictEqual(res.inputs, PEER_COUNT * 2, 'input count')
    assert.strictEqual(res.outputs, PEER_COUNT * 2, 'output count')

    // ── independent verification of every input ───────────────────────────
    const parsed = parseTx(hexToBytes(res.txHex))
    const ownerPrivByOutpoint = new Map()
    const valueByOutpoint = new Map()
    for (const w of wallets) for (const u of w.utxos) {
        ownerPrivByOutpoint.set(u.txid + ':' + u.vout, u.privHex)
        valueByOutpoint.set(u.txid + ':' + u.vout, u.value)
    }
    const prevouts = parsed.inputs.map(i => {
        const priv = ownerPrivByOutpoint.get(i.txid + ':' + i.vout)
        assert.ok(priv, 'unknown input outpoint')
        return {
            value: valueByOutpoint.get(i.txid + ':' + i.vout),
            scriptCode: p2pkhScript(hash160(secp256k1.getPublicKey(hexToBytes(priv), true))),
        }
    })
    const txForSighash = { version: parsed.version, inputs: parsed.inputs.map(i => ({ ...i, scriptSig: new Uint8Array(0) })), outputs: parsed.outputs, locktime: parsed.locktime }
    parsed.inputs.forEach((inp, idx) => {
        const { sig, hashType, pub } = scriptSigParts(inp.scriptSig)
        assert.strictEqual(hashType, 0x41, 'sighash type')
        const sighash = bip143Sighash(txForSighash, idx, prevouts)
        assert.ok(bchSchnorrVerify(sig, sighash, pub), 'input ' + idx + ' signature must verify')
    })
    for (const w of wallets) {
        for (const o of w.outs) {
            assert.ok(parsed.outputs.some(x => x.value === o.value && bytesToHex(x.script) === bytesToHex(o.script)), 'peer output missing')
        }
    }
    // re-serialize round-trip
    assert.strictEqual(bytesToHex(serializeTx({ version: parsed.version, inputs: parsed.inputs, outputs: parsed.outputs, locktime: parsed.locktime })), res.txHex)

    const coordinator = wallets.findIndex(w => w.id.pubHex === [...peers.map(p => p.pubHex)].sort()[0])
    console.log('PASS ' + PEER_COUNT + '-party round, txid:', res.txid)
    console.log('PASS independent BIP143+BCH-Schnorr verification:', parsed.inputs.length + '/' + parsed.inputs.length, 'inputs')
    console.log('coordinator peer index (sorted):', coordinator)
    console.log('phases (peer 0):', phases[0].join(' → '))
    console.log('phases (last peer):', phases[PEER_COUNT - 1].join(' → '))
    console.log('fee:', res.fee, 'sats | size:', res.txHex.length / 2, 'B')
    console.log((live ? 'G3L' : 'G3') + ': PASS')
}

main().catch((e) => { console.error('G3 FAIL:', e?.message || e); process.exit(1) })
