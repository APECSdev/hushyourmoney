<!-- daemons/shared/src/nostr/README.md -->
# Nostr transport contract

Status: implemented in `src/nostr/`; 40 shared tests pass (M1).

Reference: `../nito.cash/apps/web/src/lib/nostr/` and `../nito.cash/apps/web/src/lib/cashshuffle/transport.js`.

## 1. Wire format

- Rumor: unsigned event, kind `22231` for CashShuffle (CashFusion kind is an open question), content is the protocol packet JSON.
- Seal: kind `13`, NIP-44 encrypted rumor, signed by the sender’s per-round key, tags empty.
- Gift wrap: kind `1059`, NIP-44 encrypted seal, signed by a fresh throwaway key, one `p` tag with the recipient’s x-only pubkey.
- Relays see only the gift wrap: ciphertext, `p` tag, and timing.

## 2. Modules

| Module | Exports | Notes |
|---|---|---|
| `event.js` | `serializeEvent`, `getEventHash`, `signEvent`, `verifyEvent` | BIP-340 Schnorr; Nostr only. |
| `nip44.js` | `encrypt`, `decrypt`, `NIP44_VERSION`, `getConversationKey`, `getMessageKeys`, `calcPaddedLen` | Official v2 KDF + padding by default; `nito-v0` is an explicit private mode. |
| `nip59.js` | `createRumor`, `sealRumor`, `giftWrap`, `wrapRumor`, `unwrapGift` | Seal and gift-wrap timestamps randomized up to two days in the past. |
| `relay.js` | `Relay` | One WebSocket; publish/subscribe/unsubscribe/authenticate/close; reconnect/backoff. |
| `relay-pool.js` | `RelayPool` | N relays; per-connection 80 ms outbox; dedupe; resubscribe; NIP-42; health. |

## 3. NIP-44

The official v2 KDF and padding are the default:

- `conversation_key = HKDF-Extract(sharedX, "nip44-v2")`.
- `message_keys = HKDF-Expand(conversation_key, nonce, 76)` (32-byte ChaCha key, 12-byte nonce, 32-byte HMAC key).
- `calc_padded_len()` chunked padding (`https://github.com/nostr-protocol/nips/blob/master/44.md`, lines 189-199).
- 2-byte u16 length prefix; the official JavaScript reference caps plaintext at 65,535 bytes, so the 6-byte extended prefix is not exercised by the reference or its vectors.
- ChaCha20 with counter 0; HMAC-SHA256 over `nonce ‖ ciphertext`; base64 with padding.

The current Nito code uses the raw ECDH x-coordinate as the conversation key, HKDF with salt `nip44-v2` for the message keys, a 4-byte prefix and next-power padding (`../nito.cash/apps/web/src/lib/nostr/nip44.js`). `NIP44_MODE=nito-v0` preserves that wire for a mixed deployment; both peers must set it and the payload is labelled as a private variant, not NIP-44 v2.

The official vectors are in `https://github.com/paulmillr/nip44` (`nip44.vectors.json`). The test suite runs them in `official` mode: 35 conversation-key cases, 10 encrypt/decrypt cases, 24 padding cases, long messages and invalid payloads.

## 4. NIP-59

- Implemented in `nip59.js`.
- The rumor’s `created_at` is canonical and the rumor is unsigned.
- The seal and gift wrap use independent random timestamps up to two days in the past; all timestamps are in the past (NIP-59 line 111).
- `unwrapGift` verifies the gift-wrap signature, the seal signature, and the optional expected sender; it rejects a non-1059 gift, a non-13 seal, a wrong `p` tag, a future timestamp, or a timestamp outside the two-day window.
- The `p` tag carries the recipient’s x-only key; the recipient checks the tag matches its own key.

## 5. Relay pool

- Implemented in `relay.js` and `relay-pool.js`.
- `NOSTR_RELAYS` is a comma-separated list of `ws://`/`wss://` URLs.
- `NOSTR_RELAY_PACING_MS` defaults to 80; the outbox enforces the interval per connection.
- `NOSTR_PUBLISH_QUORUM` is optional; the default publishes to every relay.
- Inbound events are deduped by `event.id`; a duplicate delivery is dropped before routing.
- A reconnect resubscribes with `{ kinds: [1059], '#p': [self], since: now - 172800 - 300 }`.
- The health snapshot is `{ relay, state, lastOkAt, lastEventAt, reconnects }`.
- The mock-relay suite covers publish, quorum, dedupe, 80 ms pacing, reconnect/resubscribe and NIP-42.

## 6. NIP-42 AUTH

- `NOSTR_AUTH_POLICY=none|optional|required`.
- `required` refuses to publish to a relay that has not completed AUTH.
- The AUTH key is a per-session key, never the wallet key.
- The relay challenge is captured and passed to `authenticate(sign)`; the caller supplies the signer.

## 7. Tests

- Official NIP-44 vectors (official mode), plus `nito-v0` round-trip and cross-mode rejection.
- NIP-59 round-trip, unsigned rumor, independent timestamps, sender/recipient checks, two-day window.
- Mock relay: publish, quorum, dedupe, 80 ms pacing, reconnect/resubscribe, AUTH challenge.
- No live relay in unit tests; live relay tests are opt-in integration tests.
- Current shared suite: 40/40.
