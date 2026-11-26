// daemons/shared/test/nip44.test.js
//
// Official NIP-44 v2 vectors + the private nito-v0 round-trip.
// Source: https://github.com/paulmillr/nip44/blob/main/nip44.vectors.json
// Fixture sha256: 269ed0f69e4c192512cc779e78c555090cebc7c785b609e338a62afc3ce25040

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { secp256k1 } from '@noble/curves/secp256k1.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js'

import {
  NIP44_VERSION,
  calcPaddedLen,
  decrypt,
  decryptWithConversationKey,
  encrypt,
  encryptWithConversationKey,
  getConversationKey,
  getMessageKeys,
} from '../src/nostr/nip44.js'

const vectors = JSON.parse(
  readFileSync(new URL('./fixtures/nip44.vectors.json', import.meta.url), 'utf8'),
).v2

test('NIP44_VERSION is 2', () => {
  assert.equal(NIP44_VERSION, 2)
})

test('calcPaddedLen matches the official vectors', () => {
  for (const [len, expected] of vectors.valid.calc_padded_len) {
    assert.equal(calcPaddedLen(len, 'official'), expected, `len ${len}`)
  }
})

test('getConversationKey matches the official vectors', () => {
  for (const vector of vectors.valid.get_conversation_key) {
    const key = getConversationKey(vector.sec1, vector.pub2, 'official')
    assert.equal(bytesToHex(key), vector.conversation_key)
  }
})

test('getMessageKeys matches the official vectors', () => {
  const vector = vectors.valid.get_message_keys
  for (const expected of vector.keys) {
    const keys = getMessageKeys(vector.conversation_key, expected.nonce, 'official')
    assert.equal(bytesToHex(keys.chachaKey), expected.chacha_key)
    assert.equal(bytesToHex(keys.chachaNonce), expected.chacha_nonce)
    assert.equal(bytesToHex(keys.hmacKey), expected.hmac_key)
  }
})

test('encryptWithConversationKey reproduces the official payloads', () => {
  for (const vector of vectors.valid.encrypt_decrypt) {
    const payload = encryptWithConversationKey(
      vector.plaintext,
      vector.conversation_key,
      vector.nonce,
      'official',
    )
    assert.equal(payload, vector.payload)
    assert.equal(
      decryptWithConversationKey(vector.payload, vector.conversation_key, 'official'),
      vector.plaintext,
    )
  }
})

test('long-message vectors match both plaintext and payload hashes', () => {
  for (const vector of vectors.valid.encrypt_decrypt_long_msg) {
    const plaintext = vector.pattern.repeat(vector.repeat)
    assert.equal(bytesToHex(sha256(utf8ToBytes(plaintext))), vector.plaintext_sha256)
    const payload = encryptWithConversationKey(
      plaintext,
      vector.conversation_key,
      vector.nonce,
      'official',
    )
    assert.equal(bytesToHex(sha256(utf8ToBytes(payload))), vector.payload_sha256)
    assert.equal(
      decryptWithConversationKey(payload, vector.conversation_key, 'official'),
      plaintext,
    )
  }
})

test('invalid plaintext lengths are rejected', () => {
  const key = vectors.valid.encrypt_decrypt[0].conversation_key
  const nonce = vectors.valid.encrypt_decrypt[0].nonce
  assert.throws(() => encryptWithConversationKey('', key, nonce, 'official'), /invalid plaintext length/)
  assert.throws(
    () => encryptWithConversationKey('a'.repeat(65536), key, nonce, 'official'),
    /invalid plaintext length/,
  )
  assert.throws(() => calcPaddedLen(0, 'official'), /invalid plaintext length/)
  assert.equal(calcPaddedLen(65536, 'official'), 65536)
})

test('invalid official payloads are rejected', () => {
  for (const vector of vectors.invalid.decrypt) {
    assert.throws(
      () => decryptWithConversationKey(vector.payload, vector.conversation_key, 'official'),
      /nip44:/,
      vector.note,
    )
  }
})

test('encrypt/decrypt work with a key pair and an x-only public key', () => {
  const alice = secp256k1.utils.randomSecretKey()
  const bob = secp256k1.utils.randomSecretKey()
  const bobXOnly = secp256k1.getPublicKey(bob, true).subarray(1)

  const payload = encrypt('hello cashshuffle', alice, bobXOnly, undefined, 'official')
  assert.equal(decrypt(payload, bob, secp256k1.getPublicKey(alice, true), 'official'), 'hello cashshuffle')
})

test('nito-v0 round-trips and does not share the official KDF', () => {
  const alice = secp256k1.utils.randomSecretKey()
  const bob = secp256k1.utils.randomSecretKey()
  const alicePub = secp256k1.getPublicKey(alice, true)
  const bobPub = secp256k1.getPublicKey(bob, true)

  const official = getConversationKey(alice, bobPub, 'official')
  const nito = getConversationKey(alice, bobPub, 'nito-v0')
  assert.notEqual(bytesToHex(official), bytesToHex(nito))

  const payload = encrypt('hello nito', alice, bobPub, undefined, 'nito-v0')
  assert.equal(decrypt(payload, bob, alicePub, 'nito-v0'), 'hello nito')
  assert.throws(() => decrypt(payload, bob, alicePub, 'official'), /nip44:/)
})

test('a tampered payload is rejected', () => {
  const alice = secp256k1.utils.randomSecretKey()
  const bob = secp256k1.utils.randomSecretKey()
  const bobPub = secp256k1.getPublicKey(bob, true)
  const payload = encrypt('tamper me', alice, bobPub, undefined, 'official')
  const raw = Buffer.from(payload, 'base64')
  raw[raw.length - 1] ^= 0x01
  assert.throws(
    () => decrypt(raw.toString('base64'), bob, secp256k1.getPublicKey(alice, true), 'official'),
    /invalid MAC/,
  )
})
