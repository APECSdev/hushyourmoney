/* web/stores/p2pfusion/relay.ts
   Minimal Nostr relay pool client (NIP-01) for P2P fusion rounds.
   Browser + Node compatible (global WebSocket). Relays are UNTRUSTED:
   they see ciphertext (NIP-59 wraps) and routing metadata only.
   [cited · 00-Wallet landing/core/nostr-pool.ts — reconnect/rotate/dedup pattern] */

import type { NostrEvent } from './giftwrap.ts'

type SubCallback = (event: NostrEvent) => void
type StatusCallback = (status: RelayPoolStatus) => void

export interface RelayPoolStatus {
    connected: number
    total: number
    urls: Record<string, boolean>
}

interface RelayConn {
    url: string
    ws: WebSocket | null
    connected: boolean
    retry: number
    closed: boolean
}

const SEEN_MAX = 5000

export class NostrRelayPool {
    private conns: RelayConn[] = []
    private subs = new Map<string, { filters: unknown[]; cb: SubCallback }>()
    private seen = new Set<string>()
    private seenOrder: string[] = []
    private subCounter = 0
    private statusListeners = new Set<StatusCallback>()

    constructor(urls: string[]) {
        for (const url of urls) this.conns.push({ url, ws: null, connected: false, retry: 0, closed: false })
    }

    connect(): void {
        for (const c of this.conns) this.open(c)
    }

    private open(c: RelayConn): void {
        if (c.closed) return
        try {
            const ws = new WebSocket(c.url)
            c.ws = ws
            ws.addEventListener('open', () => {
                c.connected = true
                c.retry = 0
                this.emitStatus()
                // (re)send all subscriptions to this relay
                for (const [subId, sub] of this.subs) {
                    try { ws.send(JSON.stringify(['REQ', subId, ...sub.filters])) } catch { /* noop */ }
                }
            })
            ws.addEventListener('message', (ev: MessageEvent) => this.onMessage(ev.data))
            ws.addEventListener('close', () => {
                c.connected = false
                c.ws = null
                this.emitStatus()
                if (c.closed) return
                const delay = Math.min(30000, 1000 * Math.pow(2, c.retry++))
                setTimeout(() => this.open(c), delay)
            })
            ws.addEventListener('error', () => {
                // 'close' follows; nothing else to do
            })
        } catch {
            c.retry++
        }
    }

    private onMessage(raw: unknown): void {
        let msg: unknown
        try { msg = JSON.parse(String(raw)) } catch { return }
        if (!Array.isArray(msg) || typeof msg[0] !== 'string') return

        if (msg[0] === 'EVENT' && msg.length >= 3) {
            const subId = String(msg[1])
            const event = msg[2] as NostrEvent
            if (!event || typeof event.id !== 'string') return
            if (this.seen.has(event.id)) return
            this.seen.add(event.id)
            this.seenOrder.push(event.id)
            if (this.seenOrder.length > SEEN_MAX) {
                for (let i = 0; i < 2500; i++) this.seen.delete(this.seenOrder[i])
                this.seenOrder = this.seenOrder.slice(2500)
            }
            const sub = this.subs.get(subId)
            if (sub) {
                try { sub.cb(event) } catch { /* consumer error must not kill the pool */ }
            }
        }
        // EOSE / OK / CLOSED / NOTICE: no action needed for G1 scope
    }

    subscribe(filters: unknown[], cb: SubCallback): string {
        const subId = 'hush-' + (++this.subCounter)
        this.subs.set(subId, { filters, cb })
        for (const c of this.conns) {
            if (c.ws && c.connected) {
                try { c.ws.send(JSON.stringify(['REQ', subId, ...filters])) } catch { /* noop */ }
            }
        }
        return subId
    }

    unsubscribe(subId: string): void {
        this.subs.delete(subId)
        for (const c of this.conns) {
            if (c.ws && c.connected) {
                try { c.ws.send(JSON.stringify(['CLOSE', subId])) } catch { /* noop */ }
            }
        }
    }

    /** Publish to every connected relay; resolves with per-relay send results. */
    publish(event: NostrEvent): Record<string, boolean> {
        const result: Record<string, boolean> = {}
        const payload = JSON.stringify(['EVENT', event])
        for (const c of this.conns) {
            if (c.ws && c.connected) {
                try {
                    c.ws.send(payload)
                    result[c.url] = true
                } catch {
                    result[c.url] = false
                }
            } else {
                result[c.url] = false
            }
        }
        return result
    }

    status(): RelayPoolStatus {
        const urls: Record<string, boolean> = {}
        let connected = 0
        for (const c of this.conns) {
            urls[c.url] = c.connected
            if (c.connected) connected++
        }
        return { connected, total: this.conns.length, urls }
    }

    onStatus(cb: StatusCallback): () => void {
        this.statusListeners.add(cb)
        return () => this.statusListeners.delete(cb)
    }

    private emitStatus(): void {
        const s = this.status()
        for (const cb of this.statusListeners) {
            try { cb(s) } catch { /* noop */ }
        }
    }

    close(): void {
        for (const c of this.conns) {
            c.closed = true
            try { c.ws?.close() } catch { /* noop */ }
        }
        this.subs.clear()
        this.statusListeners.clear()
    }
}

/** Wait until at least `min` relays are connected or the timeout elapses. */
export async function waitForRelays(pool: NostrRelayPool, min: number, timeoutMs: number): Promise<RelayPoolStatus> {
    const start = Date.now()
    for (;;) {
        const s = pool.status()
        if (s.connected >= min || Date.now() - start >= timeoutMs) return s
        await new Promise(r => setTimeout(r, 250))
    }
}
