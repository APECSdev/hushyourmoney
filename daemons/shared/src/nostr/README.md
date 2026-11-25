<!-- daemons/shared/src/nostr/README.md -->
# Nostr transport contract

Status: contract only. The implementation lands in M1 (W1).

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
| `nip44.js` | `encrypt`, `decrypt`, `NIP44_VERSION` | Official v2 padding by default; `nito-v0` is an explicit private mode. |
| `nip59.js` | `createRumor`, `sealRumor`, `giftWrap`, `wrapRumor`, `unwrapGift` | Seal and gift-wrap timestamps randomized up to two days in the past. |
| `relay.js` | `Relay` | One WebSocket; publish/subscribe/unsubscribe/authenticate/close; reconnect/backoff. |
| `relay-pool.js` | `RelayPool` | N relays; per-connection 80 ms outbox; dedupe; resubscribe; NIP-42; health. |

## 3. NIP-44

The official v2 padding is the default:

- `calc_padded_len()` chunked padding (`https://github.com/nostr-protocol/nips/blob/master/44.md`, lines 189-199).
- 2-byte u16 length prefix below 65,536; 6-byte prefix above (lines 201-211).
- `max_plaintext_size` = 2^32−1 (line 167).
- ChaCha20 with counter 0; HMAC-SHA256 over `nonce ‖ ciphertext`; base64 with padding.

The current Nito code uses a 4-byte prefix and next-power padding (`../nito.cash/apps/web/src/lib/nostr/nip44.js:32-45`). `NIP44_MODE=nito-v0` preserves that wire for a mixed deployment; both peers must set it and the payload is labelled as a private variant, not NIP-44 v2.

The official vectors are in `https://github.com/paulmillr/nip44` (the NIP’s reference implementations). The test suite runs them in `official` mode.

## 4. NIP-59

- The rumor’s `created_at` is canonical.
- The seal and gift wrap use independent random timestamps up to two days in the past; all timestamps are in the past (NIP-59 line 111).
- `unwrapGift` verifies the gift-wrap signature, the seal signature, and the optional expected sender; it rejects a non-1059 gift or a non-13 seal.
- The `p` tag carries the recipient’s x-only key; the recipient checks the tag matches its own key.

## 5. Relay pool

- `NOSTR_RELAYS` is a comma-separated list of `ws://`/`wss://` URLs.
- `NOSTR_RELAY_PACING_MS` defaults to 80; the outbox enforces the interval per connection.
- `NOSTR_PUBLISH_QUORUM` is optional; the default publishes to every relay.
- Inbound events are deduped by `event.id`; a duplicate delivery is dropped before routing.
- A reconnect resubscribes with `{ kinds: [1059], '#p': [self], since: now - 172800 - 300 }`.
- The health snapshot is `{ relay, state, lastOkAt, lastEventAt, reconnects }`.

## 6. NIP-42 AUTH

- `NOSTR_AUTH_POLICY=none|optional|required`.
- `required` refuses to publish to a relay that has not completed AUTH.
- The AUTH key is a per-session key, never the wallet key.
- The relay challenge is captured and passed to `authenticate(sign)`; the caller supplies the signer.

## 7. Tests

- Official NIP-44 vectors (official mode).
- Nito round-trip fixture (`nito-v0` mode) and a cross-mode rejection test.
- NIP-59 round-trip, outsider rejection, timestamp-window check.
- Mock relay: publish, OK timeout, dedupe, 80 ms pacing, reconnect/resubscribe, AUTH challenge.
- No live relay in unit tests; live relay tests are opt-in integration tests.
