<!-- daemons/cashshuffle/2N-ROUND.md -->
# The pool-native 2N round

Status: **implemented as a daemon primitive** — the unsigned builder, the
per-input signer, the assembler, the 2N verifier and the round state machine
pass 15 unit tests. **Not yet end-to-end**: the network loop, the Nito client
2N UI, the BCH-2026 VM-eval of the round and the action, and the chipnet
5-peer acceptance remain.

## 1. Why 2N

One role-2 action consumes:

```
in0  fuel UTXO 0  15,000 sats, pool category, mutable NFT, commitment = tag
in1  fuel UTXO 1  15,000 sats, same tag
in2  state NFT
```

Both fuel inputs must carry the **same** tag:

```
tag = SHA256(carrier[0..64]) = SHA256(nf0_LE ‖ nf1_LE)
```

A classic CashShuffle round is N equal inputs → N equal outputs, one output
per participant. Five participants produce five outputs with five different
tags. No pair matches, so the round funds **zero** actions.

The 2N round produces **2N outputs**: two 15,000-sat tagged fuel UTXOs per
action, each pair sharing the action's tag. Five actions produce ten outputs
and five valid pairs. The tag identifies the action's pair; the action's
outpoints reveal the pair; the funder is hidden among the round participants.

## 2. Transaction shape

Per participant:

```
in   funding0, funding1  plain BCH at the participant's P2PKH
     blank0, blank1      pool category, mutable NFT, empty commitment, 0 FT
     supply?             pool category FT, no NFT (SHIELD only)

out  fuel0               15,000 sats, program P2SH32, category + mutable NFT
                         commitment = tag; carries pv on a SHIELD
     fuel1               15,000 sats, program P2SH32, same tag; 0 FT
     ftChange?           pool category FT, no NFT, change address (SHIELD only)
     bchChange?          plain BCH, change address (only when funding exceeds
                         the fuel + blanks + fee share)
```

The round transaction **is the lock transaction**. It spends the two blanks
per action and creates the tagged fuel. There is no separate
`buildRole2Lock` per action and no single funding input per action.

The fee is paid from the inputs, not deducted from the 15,000-sat fuel. The
classic CashShuffle proportional-output fee model does not fit the role-2
fuel: the fuel must stay exactly 15,000 sats. The builder measures the probe
size, rounds the fee up to a multiple of N, and allocates an equal share to
every participant. The participant's BCH change is:

```
change = funding + blanks + supply
         − 30,000 (fuel)
         − 1,000 (FT change, SHIELD only)
         − fee / N
```

## 3. Module API

| File | Export | Purpose |
|---|---|---|
| `src/role2-round.js` | `buildRole2Round` | Build the unsigned 2N transaction, sources, fuel vouts, fee, change. |
| | `signRole2Round` | Sign one participant's input indices; returns signature packets. |
| | `applyRole2Signatures` | Coordinator writes the collected signatures. |
| | `assembleRole2Round` | Encode the signed transaction and return the txid. |
| | `verifyRole2Round` | Peer VERIFY: 2N fuel pairs, tags, blanks, supplies, FT conservation, change, fee. |
| `src/round-2n.js` | `CashShuffle2NRound` | REGISTER → POOL → ANNOUNCEMENT → SHUFFLE → VERIFY → SIGNING → BROADCAST (+ BLAME). |
| | `buildFinalRound` | Coordinator builds from the registered players. |
| | `verify` | Per-player 2N VERIFY. |
| | `sign` | Per-player signature packet; checks the player's own input indices. |
| | `assemble` / `broadcast` | Encode and record the txid. |

The classic `src/round.js` remains the 1-in/1-out protocol. The 2N state
machine imports the shared phase table from it.

## 4. Verification checks

`verifyRole2Round` checks:

- version 2, nLockTime 0, sequence `0xffffffff`;
- exactly 2N funding inputs and 2N blank inputs; every input token is the pool
  category; blanks are mutable, empty-commitment, 0 FT; supplies are FT with
  no NFT;
- exactly 2N fuel outputs at the program, 15,000 sats each, pool category,
  mutable NFT, commitment = tag;
- exactly N distinct tags; every tag appears exactly twice; a pair has at most
  one FT-bearing fuel (one `pv`, one 0 for a SHIELD; both 0 otherwise);
- the player's two funding outpoints, two blank outpoints and supply are
  present;
- the player's fuel pair has the expected FT amounts;
- pool FT is conserved (inputs = fuel deposits + FT change);
- the player's FT change and BCH change match its fee share;
- the fee is the declared fee, divisible by N, within `maxFeeSats`.

The tests also cover a tampered tag, a missing blank, an over-cap fee, a wrong
fuel amount, duplicate tags and malformed blanks.

## 5. Current limits

- **No network loop.** `CashShuffle2NRound.run()` throws; the daemon main loop
  still has to drive `handleMessage()`.
- **No Nito client 2N UI.** The Nito `protocol.js`/`round-runner.js` remain the
  classic 1-in/1-out shape; the Desk’s 2N shape is pending.
- **No VM-eval.** The round is not yet evaluated on the BCH-2026 VM in
  consensus and standard modes; the action VM-eval remains CS-7.
- **No chipnet 5-peer run.** A1/A2 remain.
- **Change privacy.** The builder allows BCH change per participant. The
  change address links the participant to the round; exact funding (or a
  fresh change address) is the privacy-preserving choice.
- **Coordinator/tag link.** The coordinator sees the participants' inputs and
  tags. The design goal is that the tag identifies the fuel pair, not the
  funder; the implementation needs a blind or a coordinator that does not see
  the participant→tag mapping. Classic CashShuffle’s onion hides the
  input-output mapping; the 2N round needs an equivalent.
- **Signature verification.** The state machine checks that each player signs
  only its own inputs and signs all of them; it does not yet verify the
  signatures cryptographically before assembling. The classic round’s
  signature verification is also pending.
- **Serialization.** The round object carries `Uint8Array` lockings/tokens;
  the Nostr packet layer needs a hex/JSON form before the coordinator can send
  `FINAL_TX`.

## 6. Test

```bash
# On blackhost, with the Nito apps/web/node_modules for @bitauth:
cd /root/tmp/daemons-test
node --test cashshuffle/test/role2-round.test.js cashshuffle/test/round-2n.test.js

# Full daemon suite
node --test shared/test/*.test.js cashshuffle/test/*.test.js cashfusion/test/*.test.js
```

The 2N tests require `@bitauth/libauth`. The fixtures use the deployed program
P2SH32, the pool category, five unique P2PKH change addresses, 20,000-sat
funding UTXOs, two 1,000-sat blanks per participant, and a unique carrier/tag
per action.

## 7. References

- `docs/CASHSHUFFLE-NOSTR-DESIGN.md` §4 (the 2N composition), §6 item 102 (the
  daemon + Desk shape), §7 (the acceptance).
- `docs/DAEMONS-NITO-RESPONSE-2026-11-25.md` item 5 (2N final).
- `daemons/cashshuffle/README.md` §5 (liquidity math).
- `daemons/cashshuffle/PLAN.md` CS-7/CS-9.
- `docs/POOL-HANDOFF-2026-11-24-NITO-ROLE2-TAGGED.md` §3–§4.
