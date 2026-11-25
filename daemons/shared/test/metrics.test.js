// daemons/shared/test/metrics.test.js
//
// Unit tests for the shared metrics registry. No network, no dependencies.

import test from 'node:test'
import assert from 'node:assert/strict'

import { Metrics, labelKey } from '../src/metrics.js'

test('counters and gauges produce a deterministic snapshot', () => {
  const metrics = new Metrics({ now: () => 1000 })
  metrics.inc('rounds_total')
  metrics.inc('rounds_total', { phase: 'signing' }, 2)
  metrics.set('balance_sats', {}, 150000)

  assert.equal(metrics.get('rounds_total'), 1)
  assert.equal(metrics.get('rounds_total', { phase: 'signing' }), 2)
  assert.equal(metrics.get('missing'), 0)

  const snapshot = metrics.snapshot()
  assert.equal(snapshot.startedAt, 1000)
  assert.deepEqual(Object.keys(snapshot.counters), [
    'rounds_total{}',
    'rounds_total{phase=signing}',
  ])
  assert.equal(snapshot.gauges['balance_sats{}'], 150000)
})

test('labelKey sorts labels', () => {
  assert.equal(labelKey({ b: 2, a: 1 }), 'a=1,b=2')
  assert.equal(labelKey({}), '')
})
