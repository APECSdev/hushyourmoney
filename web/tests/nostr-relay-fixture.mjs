/* web/tests/nostr-relay-fixture.mjs
   Minimal in-process Nostr relay (NIP-01) for deterministic gate tests.
   NOT for production — in-memory, no auth, no limits, single process.

   Usage:  import { startRelayFixture } from './nostr-relay-fixture.mjs'
           const relay = await startRelayFixture()   // → { url, close() }
   Supports: EVENT / REQ / CLOSE, filters on kinds, #p, ids, authors, since, until. */

import { WebSocketServer } from 'ws'

export async function startRelayFixture(port = 0) {
    const wss = new WebSocketServer({ port })
    await new Promise((resolve) => wss.once('listening', resolve))
    const actualPort = wss.address().port

    const events = []
    /** @type {Map<any, Map<string, any[]>>} ws → (subId → filters) — NIP-01 allows many subs per connection */
    const subs = new Map()

    function matches(ev, filter) {
        if (filter.kinds && !filter.kinds.includes(ev.kind)) return false
        if (filter.ids && !filter.ids.includes(ev.id)) return false
        if (filter.authors && !filter.authors.includes(ev.pubkey)) return false
        if (typeof filter.since === 'number' && ev.created_at < filter.since) return false
        if (typeof filter.until === 'number' && ev.created_at > filter.until) return false
        if (filter['#p']) {
            const tagged = (ev.tags || []).filter(t => t[0] === 'p').map(t => t[1])
            if (!filter['#p'].some(p => tagged.includes(p))) return false
        }
        return true
    }

    wss.on('connection', (ws) => {
        ws.on('message', (raw) => {
            let msg
            try { msg = JSON.parse(String(raw)) } catch { return }
            if (!Array.isArray(msg) || typeof msg[0] !== 'string') return

            if (msg[0] === 'EVENT' && msg[1]?.id) {
                const ev = msg[1]
                if (!events.some(e => e.id === ev.id)) events.push(ev)
                ws.send(JSON.stringify(['OK', ev.id, true, '']))
                for (const [client, clientSubs] of subs) {
                    if (client.readyState !== 1) { subs.delete(client); continue }
                    for (const [subId, filters] of clientSubs) {
                        if (filters.some(f => matches(ev, f))) {
                            client.send(JSON.stringify(['EVENT', subId, ev]))
                        }
                    }
                }
                return
            }

            if (msg[0] === 'REQ' && typeof msg[1] === 'string') {
                const subId = msg[1]
                const filters = msg.slice(2)
                if (!subs.has(ws)) subs.set(ws, new Map())
                subs.get(ws).set(subId, filters)
                for (const ev of events) {
                    if (filters.some(f => matches(ev, f))) {
                        ws.send(JSON.stringify(['EVENT', subId, ev]))
                    }
                }
                ws.send(JSON.stringify(['EOSE', subId]))
                return
            }

            if (msg[0] === 'CLOSE' && typeof msg[1] === 'string') {
                subs.get(ws)?.delete(msg[1])
            }
        })
        ws.on('close', () => subs.delete(ws))
    })

    return {
        url: `ws://127.0.0.1:${actualPort}`,
        close: () => new Promise((resolve) => wss.close(resolve)),
    }
}
