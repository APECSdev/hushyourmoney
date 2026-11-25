<!-- daemons/shared/src/bch/README.md -->
# BCH wallet contract

Status: contract only. The implementation lands in M3 (W3).

Reference: `../nito.cash/apps/web/src/lib/bch/crypto.js`, `../nito.cash/apps/web/src/lib/pool/role2-lock.js`, `../nito.cash/apps/web/src/lib/pool/role2-action.js`.

## 1. Signing

- BCH Schnorr with `SIGHASH_ALL|FORKID` (0x41).
- 64-byte signature followed by the 0x41 sighash byte.
- Do not reuse the Nostr BIP-340 signer. `AGENTS.md:238` records “BCH Schnorr ≠ final BIP-340.”
- P2PKH signing uses `@bitauth/libauth` `generateSigningSerializationBCH` + `signMessageHashSchnorr`, matching `../nito.cash/apps/web/src/lib/bch/crypto.js:221-257`.
- The source output value is part of the signing serialization; every source output is cross-checked against chain data before signing.

## 2. UTXO selection

- Electrum primary: `wss://chipnet.bch.ninja:50004`; fallback `wss://chipnet.imaginary.cash:50004` (`AGENTS.md:511`).
- Scripthash: single SHA-256 of the locking script, byte-reversed.
- Token UTXOs need `include_tokens` or `tokens_only`; a plain `listunspent` hides them.
- CashShuffle inputs are equal amounts; the fee is deducted proportionally from every output.
- The wallet selects exactly one equal-amount input per round, plus a separate funding input only when the round shape requires it.
- The wallet never spends a pool state NFT, a tagged fuel UTXO, or a blank outside its intended role.

## 3. Broadcast

- Broadcast through Electrum `blockchain.transaction.broadcast`.
- Confirm with `blockchain.transaction.get [txid, true]`.
- The coordinator broadcasts; every peer verifies the txid.
- A failed broadcast aborts the round before any signature is reused.

## 4. Role-2 pool helpers

- Carrier: 169 bytes; `tag = SHA256(carrier[0..64]) = SHA256(nf0_LE ‖ nf1_LE)`.
- Action: 3 inputs (fuel 0, fuel 1, state 2), signature-free; outputs `OP_RETURN carrier`, new state NFT, optional payout.
- Lock: 2 tagged fuel UTXOs at 15,000 sats each, 2 blanks spent, optional FT deposit, signed P2PKH funding input.
- `TXINPUTCOUNT == 3` and `TXOUTPUTCOUNT == 2 + sign`.
- The lock and action broadcast atomically; the action spends the lock’s unconfirmed outputs.
- Every action is evaluated in `createVirtualMachineBch2026(false)` (consensus) and `(true)` (standard) before broadcast; any error rejects.

## 5. Fees

- Action fee: 15,000 sats per fuel UTXO, 30,000 total; it rides the fuel.
- Lock/shuffle transaction fee: separate; paid by the funding input at `CASHSHUFFLE_FEE_RATE`.
- Blank cost: 1,000 sats per blank at the vending machine; 2 blanks per lock.
- The cap includes the action fuel, the blank cost, and the lock fee.

## 6. Tests

- BCH Schnorr signing vectors (including the 0x41 byte).
- A chipnet P2PKH round-trip.
- Token-aware `listunspent` fixture.
- Role-2 lock/action fixtures and VM-eval reports.
- A negative test: a Nostr BIP-340 signature on a BCH input fails.
