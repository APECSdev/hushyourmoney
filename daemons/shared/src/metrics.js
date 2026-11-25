// daemons/shared/src/metrics.js
//
// Minimal in-process metrics for the Hush daemons. No dependencies.
// The daemon exposes a snapshot through its local metrics endpoint or journald.

export function labelKey(labels = {}) {
  const entries = Object.entries(labels).sort(([a], [b]) => a.localeCompare(b))
  return entries.map(([key, value]) => `${key}=${value}`).join(',')
}

export class Metrics {
  constructor({ now = () => Date.now() } = {}) {
    this.startedAt = now()
    this.counters = new Map()
    this.gauges = new Map()
  }

  #key(name, labels) {
    if (!name) throw new Error('metrics: name is required')
    return `${name}{${labelKey(labels)}}`
  }

  inc(name, labels = {}, value = 1) {
    const key = this.#key(name, labels)
    this.counters.set(key, (this.counters.get(key) || 0) + value)
    return this.counters.get(key)
  }

  set(name, labels = {}, value) {
    const key = this.#key(name, labels)
    this.gauges.set(key, value)
    return value
  }

  get(name, labels = {}) {
    const key = this.#key(name, labels)
    return this.counters.get(key) ?? this.gauges.get(key) ?? 0
  }

  snapshot() {
    return {
      startedAt: this.startedAt,
      counters: Object.fromEntries([...this.counters.entries()].sort(([a], [b]) => a.localeCompare(b))),
      gauges: Object.fromEntries([...this.gauges.entries()].sort(([a], [b]) => a.localeCompare(b))),
    }
  }

  toJSON() {
    return this.snapshot()
  }
}
