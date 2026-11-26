// daemons/shared/src/nostr/event.js
//
// Nostr event serialization + BIP-340 signing.
// Reference: ../nito.cash/apps/web/src/lib/nostr/event.js (MIT).
//
//   id  = SHA256(JSON.stringify([0, pubkey, created_at, kind, tags, content]))
//   sig = BIP-340 Schnorr over the id
//
// This module is Nostr-only. BCH transaction inputs use BCH Schnorr with the
// 0x41 sighash byte and are handled by the wallet module, never here.

import { schnorr } from '@noble/curves/secp256k1.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js'

function toBytes(value) {
  if (value instanceof Uint8Array) return value
  if (typeof value === 'string') return hexToBytes(value.replace(/^0x/, ''))
  throw new Error('nostr: expected bytes or hex')
}

function toHex(value) {
  return typeof value === 'string' ? value.replace(/^0x/, '') : bytesToHex(value)
}

export function serializeEvent(event) {
  return JSON.stringify([
    0,
    event.pubkey,
    event.created_at,
    event.kind,
    event.tags || [],
    event.content || '',
  ])
}

export function getEventHash(event) {
  return bytesToHex(sha256(utf8ToBytes(serializeEvent(event))))
}

export function signEvent(event, privateKey) {
  const id = getEventHash(event)
  const sig = bytesToHex(schnorr.sign(hexToBytes(id), toBytes(privateKey)))
  return { ...event, id, sig }
}

export function verifyEvent(event) {
  try {
    if (getEventHash(event) !== event.id) return false
    return schnorr.verify(hexToBytes(event.sig), hexToBytes(event.id), hexToBytes(event.pubkey))
  } catch {
    return false
  }
}

export function createEvent({
  kind,
  content = '',
  tags = [],
  privateKey,
  publicKey,
  createdAt = Math.floor(Date.now() / 1000),
}) {
  return signEvent(
    {
      pubkey: toHex(publicKey),
      created_at: createdAt,
      kind,
      tags,
      content,
    },
    privateKey,
  )
}
