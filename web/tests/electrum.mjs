/* web/tests/electrum.mjs
   Minimal Electrum/Fulcrum JSON-RPC client over TLS for gate harnesses.
   NOT production code — no reconnects, no failover, single socket.
   Chipnet policy [cited · AGENTS.md 2026-11-11]: primary bch.ninja, fallback imaginary. */

import tls from 'node:tls'
import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex } from '../stores/p2pfusion/identity.ts'

const SERVERS = [
    { host: 'chipnet.bch.ninja', port: 50002 },
    { host: 'chipnet.imaginary.cash', port: 50002 },
]

export function scripthashOf(lockingScriptHex) {
    const script = Uint8Array.from(Buffer.from(lockingScriptHex, 'hex'))
    return bytesToHex(sha256(script).reverse())
}

export class Electrum {
    constructor(socket) {
        this.socket = socket
        this.buf = ''
        this.nextId = 1
        this.pending = new Map()
        socket.on('data', (d) => this.onData(d))
        socket.on('error', () => { /* surfaced via pending rejects on close */ })
        socket.on('close', () => {
            for (const [, p] of this.pending) p.reject(new Error('electrum: socket closed'))
            this.pending.clear()
        })
    }

    onData(d) {
        this.buf += d.toString('utf8')
        for (;;) {
            const idx = this.buf.indexOf('\n')
            if (idx < 0) return
            const line = this.buf.slice(0, idx)
            this.buf = this.buf.slice(idx + 1)
            let msg
            try { msg = JSON.parse(line) } catch { continue }
            const p = this.pending.get(msg.id)
            if (p) {
                this.pending.delete(msg.id)
                if (msg.error) p.reject(new Error('electrum: ' + JSON.stringify(msg.error)))
                else p.resolve(msg.result)
            }
        }
    }

    call(method, params = []) {
        const id = this.nextId++
        return new Promise((resolve, reject) => {
            this.pending.set(id, { resolve, reject })
            this.socket.write(JSON.stringify({ id, method, params }) + '\n')
            setTimeout(() => {
                if (this.pending.has(id)) {
                    this.pending.delete(id)
                    reject(new Error('electrum: timeout on ' + method))
                }
            }, 30000)
        })
    }

    close() { try { this.socket.end() } catch { /* noop */ } }
}

export async function connectChipnet(servers = SERVERS) {
    let lastErr
    for (const s of servers) {
        try {
            const socket = await new Promise((resolve, reject) => {
                const sock = tls.connect({ host: s.host, port: s.port, servername: s.host }, () => resolve(sock))
                sock.once('error', reject)
                setTimeout(() => reject(new Error('connect timeout')), 12000)
            })
            const el = new Electrum(socket)
            const ver = await el.call('server.version', ['hush-g2b', '1.4'])
            return { el, server: s, version: ver }
        } catch (e) { lastErr = e }
    }
    throw new Error('electrum: no chipnet server reachable — ' + (lastErr?.message || 'unknown'))
}
