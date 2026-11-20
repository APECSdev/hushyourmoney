/* web/tests/p2pfusion-g1.mjs
   GATE G1 (P2P-FUSION-DESIGN.md §5): relay + NIP-59 + onion roundtrip.
   Run with Node >= 22 (type stripping):  node web/tests/p2pfusion-g1.mjs
   Requires @noble/{curves,hashes,ciphers} resolvable from web/node_modules. */

import assert from 'node:assert'
import { createEphemeralIdentity, bytesToHex, hexToBytes } from '../stores/p2pfusion/identity.ts'
import { nip44Encrypt, nip44Decrypt } from '../stores/p2pfusion/nip44.ts'
import { createRumor, giftWrap, giftUnwrap, verifyEvent } from '../stores/p2pfusion/giftwrap.ts'
import { onionWrap, onionPeel, isFinalLayer } from '../stores/p2pfusion/onion.ts'
import { NostrRelayPool, waitForRelays } from '../stores/p2pfusion/relay.ts'

const results = []
function pass(name, detail = '') { results.push({ name, ok: true, detail }); console.log('PASS', name, detail) }
function fail(name, err) { results.push({ name, ok: false, detail: String(err) }); console.error('FAIL', name, '—', err?.message || err) }

const RELAYS = (process.env.HUSH_RELAYS || 'wss://relay.damus.io,wss://nos.lol').split(',')

async function main() {
    // ── Test 1: NIP-44 roundtrip + tamper rejection ──────────────────────
    try {
        const alice = createEphemeralIdentity()
        const bob = createEphemeralIdentity()
        const msg = 'hush-fusion/1 round payload ✓ ' + 'x'.repeat(300)
        const enc = nip44Encrypt(msg, alice.privHex, bob.pubHex)
        assert.ok(enc.length >= 132, 'payload must be >= 132 base64 chars')
        const dec = nip44Decrypt(enc, bob.privHex, alice.pubHex)
        assert.strictEqual(dec, msg)
        // tamper: flip one base64 char in the ciphertext region
        const raw = atob(enc).split('')
        raw[40] = raw[40] === 'A' ? 'B' : 'A'
        let rejected = false
        try { nip44Decrypt(btoa(raw.join('')), bob.privHex, alice.pubHex) } catch { rejected = true }
        assert.ok(rejected, 'tampered payload must fail MAC')
        pass('nip44 roundtrip + tamper reject', `len=${enc.length}`)
    } catch (e) { fail('nip44 roundtrip + tamper reject', e) }

    // ── Test 2: NIP-59 gift wrap / unwrap ────────────────────────────────
    try {
        const alice = createEphemeralIdentity()
        const bob = createEphemeralIdentity()
        const rumor = createRumor({ pubkey: alice.pubHex, kind: 22231, content: JSON.stringify({ type: 'round_start', round_id: 'r1' }) })
        const wrap = giftWrap(rumor, alice.privHex, bob.pubHex)
        assert.strictEqual(wrap.kind, 1059)
        assert.ok(wrap.tags.some(t => t[0] === 'p' && t[1] === bob.pubHex))
        assert.ok(verifyEvent(wrap), 'wrap signature must verify')
        assert.ok(wrap.pubkey !== alice.pubHex, 'wrap author must be ephemeral')
        const { rumor: got, sealPubkey } = giftUnwrap(wrap, bob.privHex)
        assert.strictEqual(sealPubkey, alice.pubHex, 'seal author = real sender')
        assert.deepStrictEqual(got, rumor)
        // a third party cannot unwrap
        const eve = createEphemeralIdentity()
        let eveFailed = false
        try { giftUnwrap(wrap, eve.privHex) } catch { eveFailed = true }
        assert.ok(eveFailed, 'third party must not unwrap')
        pass('nip59 wrap/unwrap + outsider reject', `created_at offset=${Math.floor(Date.now() / 1000) - wrap.created_at}s`)
    } catch (e) { fail('nip59 wrap/unwrap + outsider reject', e) }

    // ── Test 3: onion through 3 hops ─────────────────────────────────────
    try {
        const peers = [createEphemeralIdentity(), createEphemeralIdentity(), createEphemeralIdentity()]
        const payload = JSON.stringify({ outputs: [{ addr: 'bitcoincash:qtestaddr', value: 12345 }] })
        let layer = onionWrap(payload, peers.map(p => p.pubHex))
        for (let i = 0; i < peers.length; i++) {
            layer = onionPeel(layer, peers[i].privHex)
        }
        const text = new TextDecoder().decode(layer)
        assert.strictEqual(text, payload)
        assert.ok(isFinalLayer(layer), 'innermost layer must parse as JSON')
        // wrong-order peel must fail
        const again = onionWrap(payload, peers.map(p => p.pubHex))
        let orderFailed = false
        try { onionPeel(again, peers[1].privHex) } catch { orderFailed = true }
        assert.ok(orderFailed, 'peeling out of order must fail')
        pass('onion 3-hop wrap/peel + order reject')
    } catch (e) { fail('onion 3-hop wrap/peel + order reject', e) }

    // ── Test 4: live relay roundtrip (alice subscribes, bob publishes) ───
    try {
        const alice = createEphemeralIdentity()
        const bob = createEphemeralIdentity()
        const pool = new NostrRelayPool(RELAYS)
        pool.connect()
        const status = await waitForRelays(pool, 1, 15000)
        if (status.connected === 0) throw new Error('no relay connected: ' + JSON.stringify(status.urls))

        const got = new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('relay delivery timeout (25s)')), 25000)
            pool.subscribe([{ kinds: [1059], '#p': [alice.pubHex], since: Math.floor(Date.now() / 1000) - 172800 - 300 }], (ev) => {
                try {
                    const { rumor } = giftUnwrap(ev, alice.privHex)
                    clearTimeout(timer)
                    resolve(rumor)
                } catch (e) {
                    // not for us or corrupt — keep waiting
                }
            })
        })

        await new Promise(r => setTimeout(r, 800)) // let REQ reach relays
        const rumor = createRumor({ pubkey: bob.pubHex, kind: 22231, content: 'g1-live-relay-ping' })
        const wrap = giftWrap(rumor, bob.privHex, alice.pubHex)
        const sent = pool.publish(wrap)
        const received = await got
        assert.strictEqual(received.content, 'g1-live-relay-ping')
        pool.close()
        pass('live relay gift-wrap roundtrip', `relays=${status.connected}/${status.total} sent=${Object.values(sent).filter(Boolean).length}`)
    } catch (e) { fail('live relay gift-wrap roundtrip', e) }

    // ── Summary ──────────────────────────────────────────────────────────
    const failed = results.filter(r => !r.ok)
    console.log('\nG1 SUMMARY:', results.length - failed.length, '/', results.length, 'passed')
    if (failed.length) {
        console.log('FAILED:', failed.map(f => f.name).join(', '))
        process.exit(1)
    }
    console.log('G1: PASS')
}

main().catch((e) => { console.error('G1 harness crashed:', e); process.exit(2) })
