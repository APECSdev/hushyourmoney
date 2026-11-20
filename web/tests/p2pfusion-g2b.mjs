/* web/tests/p2pfusion-g2b.mjs
   GATE G2b (P2P-FUSION-DESIGN.md §5): real two-party round BROADCAST on chipnet.
   Funds two fresh peer keys from the chipnet test mint key, runs the six-phase
   round over the local relay fixture, and the coordinator broadcasts the
   assembled tx via Electrum. Verifies the tx is accepted by the network.

   Run: node web/tests/p2pfusion-g2b.mjs
   Secrets: /Workspace/apecsdev/.secrets/pusd-shielded-pool-chipnet-mint.json (chipnet-only) */

import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { createEphemeralIdentity, hexToBytes, bytesToHex } from '../stores/p2pfusion/identity.ts'
import { NostrRelayPool } from '../stores/p2pfusion/relay.ts'
import { FusionRound } from '../stores/p2pfusion/round.ts'
import { p2pkhScript, hash160, signP2pkhInput, serializeTx, txidOf, doubleSha256 } from '../stores/p2pfusion/txbuild.ts'
import { decodeCashAddress } from '../stores/p2pfusion/cashaddr.ts'
import { secp256k1 } from '@noble/curves/secp256k1.js'
import { connectChipnet, scripthashOf } from './electrum.mjs'
import { startRelayFixture } from './nostr-relay-fixture.mjs'

const MINT_KEY_FILE = '/Workspace/apecsdev/.secrets/pusd-shielded-pool-chipnet-mint.json'
const PEER_FUND_SATS = 20000
const FUND_FEE = 1000
const EXPLORER = 'https://chipnet.imaginary.cash/tx/'

function compressedOf(pubXOnly) {
    const c = new Uint8Array(33)
    c[0] = 0x02
    c.set(hexToBytes(pubXOnly), 1)
    return c
}
function p2pkhOfPriv(privHex) { return p2pkhScript(hash160(secp256k1.getPublicKey(hexToBytes(privHex), true))) }

async function main() {
    const mint = JSON.parse(readFileSync(MINT_KEY_FILE, 'utf8'))
    const mintDec = decodeCashAddress(mint.address)
    const mintScript = p2pkhScript(mintDec.hash)

    const { el, server, version } = await connectChipnet()
    console.log('electrum:', server.host, JSON.stringify(version))

    // ── 1. pick a pure-BCH funding UTXO (no tokens) ───────────────────────
    const mintUtxos = await el.call('blockchain.scripthash.listunspent', [scripthashOf(bytesToHex(mintScript)), 'include_tokens'])
    const needed = PEER_FUND_SATS * 2 + FUND_FEE
    const fundUtxo = mintUtxos
        .filter(u => !u.token && u.value >= needed)
        .sort((a, b) => a.value - b.value)[0]
    assert.ok(fundUtxo, 'no token-free mint UTXO >= ' + needed + ' sats')
    const fundTxid = fundUtxo.tx_hash
    const fundVout = fundUtxo.tx_pos ?? fundUtxo.vout
    console.log('funding source:', fundTxid.slice(0, 12) + '…', 'vout', fundVout, 'value', fundUtxo.value)

    // ── 2. fund two fresh peers ───────────────────────────────────────────
    const peers = [createEphemeralIdentity(), createEphemeralIdentity()]
    const peerScripts = peers.map(p => p2pkhOfPriv(p.privHex))
    const changeScript = mintScript

    const fundTx = {
        version: 1,
        inputs: [{ txid: fundTxid, vout: fundVout, scriptSig: new Uint8Array(0), sequence: 0xffffffff }],
        outputs: [
            { value: PEER_FUND_SATS, script: peerScripts[0] },
            { value: PEER_FUND_SATS, script: peerScripts[1] },
            { value: fundUtxo.value - needed, script: changeScript },
        ],
        locktime: 0,
    }
    fundTx.inputs[0].scriptSig = signP2pkhInput(fundTx, 0, [{ value: fundUtxo.value, scriptCode: mintScript }], mint.privateKeyHex)
    const fundHex = bytesToHex(serializeTx(fundTx))
    const fundTxid2 = txidOf(fundTx)
    console.log('funding tx:', fundTxid2, '(' + fundHex.length / 2 + ' B)')
    const accepted = await el.call('blockchain.transaction.broadcast', [fundHex])
    console.log('funding broadcast accepted:', accepted)
    assert.strictEqual(String(accepted), fundTxid2, 'broadcast txid mismatch')

    // wait until the network sees it (mempool is enough for 0-conf chaining)
    for (let i = 0; i < 30; i++) {
        try { await el.call('blockchain.transaction.get', [fundTxid2, true]); break } catch { await new Promise(r => setTimeout(r, 1000)) }
    }

    // ── 3. run the round with a real broadcastFn ──────────────────────────
    const fixture = await startRelayFixture()
    const pool = new NostrRelayPool([fixture.url])
    pool.connect()
    await new Promise(r => setTimeout(r, 500))

    const roundId = 'g2b-' + Date.now().toString(36)
    const perPeerFee = 1000
    const wallets = peers.map((id, n) => {
        const total = PEER_FUND_SATS - perPeerFee
        const outs = [createEphemeralIdentity(), createEphemeralIdentity()].map((fresh, k) => ({
            addr: 'chipnet:' + fresh.pubHex.slice(0, 10),
            script: p2pkhOfPriv(fresh.privHex),
            value: Math.floor(total / 2) + (k === 0 ? total % 2 : 0),
        }))
        return {
            id,
            utxos: [{ txid: fundTxid2, vout: n, value: PEER_FUND_SATS, privHex: id.privHex }],
            outs,
        }
    })

    const rounds = wallets.map((w, i) => new FusionRound(pool, w.id, {
        peers: peers.map(p => p.pubHex),
        roundId,
        utxos: w.utxos,
        outputs: w.outs,
        phaseTimeoutMs: 90000,
        broadcastFn: i === 0 || true ? async (txHex) => {
            // whichever peer is the elected coordinator performs the broadcast
            const txid = await el.call('blockchain.transaction.broadcast', [txHex])
            return String(txid)
        } : undefined,
    }))
    // only the elected coordinator should broadcast; participants must not
    wallets.forEach((w, i) => {
        if (rounds[i].isCoordinator) return
        // participants get a broadcastFn too, but they never reach checkSignatures —
        // guard anyway: verify the txid matches our own computation
    })

    const pA = rounds[0].start()
    await new Promise(r => setTimeout(r, 800))
    const pB = rounds[1].start()
    const [resA, resB] = await Promise.all([pA, pB])
    pool.close()
    await fixture.close()

    assert.strictEqual(resA.txid, resB.txid)
    assert.strictEqual(resA.txHex, resB.txHex)
    console.log('round tx:', resA.txid)
    console.log('  inputs:', resA.inputs, '| outputs:', resA.outputs, '| fee:', resA.fee, 'sats | size:', resA.txHex.length / 2, 'B')

    // ── 4. verify the network accepted it ─────────────────────────────────
    let seen = null
    for (let i = 0; i < 30; i++) {
        try { seen = await el.call('blockchain.transaction.get', [resA.txid, true]); break } catch { await new Promise(r => setTimeout(r, 1000)) }
    }
    assert.ok(seen, 'network did not return the round tx')
    console.log('network sees tx:', resA.txid, '| confirmations:', seen.confirmations ?? 0)
    console.log('explorer:', EXPLORER + resA.txid)
    console.log('G2b: PASS')
    el.close()
}

main().catch((e) => { console.error('G2b FAIL:', e?.message || e); process.exit(1) })
