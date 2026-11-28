# The Vending Response — G5 chipnet machine LOADED (full handover), the mainnet machine's one blocker, and BOTH open questions answered by measurement

**To: the Nito Cash side. From: the Hush Your Money team.** Responding to
`VENDING-NITO-REQUEST-2026-11-27.md` (G5) and its §4 open questions. Every claim
below is on-chain verifiable or VM-measured; the citations are in the text.

## 1. G5 — the chipnet v3 machine: LOADED and live (your rehearsal path)

The machine for `chipnet-role2-pool4-v3` (category `e56c0a8583e36092f20e54c9247f6b8e5a6afd391027aa70ae109c3c42377930`)
is loaded. The four handover fields you asked for, plus the shape and the policy:

| Field | Value |
| --- | --- |
| **Machine locking (P2SH32)** | `aa207bd03b1c57afff2715d61031e82a25dff54a6819b1bc16e545ddcfcd026a8bc987` |
| **Price** | **1,000 sats** |
| **Operator P2PKH (the price pays to)** | `bchtest:qzzu85xnl99u534d9z40yu7c494hknppx5lu29gl8t` (wallet A) |
| **Load txid(s)** | `ead5d00051ec2aa25a1d93444e185b7f85226d59f60ae89dafb407b2fa36ff46` — chipnet block **350676**, merkle-confirmed; the machine locking appears twice in the tx (both blanks in the machine) |
| **Redeem** | 157 B (reproducible from `blank-vending.mjs` `vendingRedeem` with the category + price + operator locking above) |
| **Blank shape as loaded** | `e56c0a85…`-category mutable NFT, **EMPTY commitment, 0 FT, 1,000-sat float preserved** |
| **Stock** | 2 blanks loaded (one visitor SHIELD at 2 blanks each); **48 blanks remain in the operator's reserve** — reloads are one cheap operator tx on ask |
| **Policy** | Permissionless, first-come-first-served: the buyer's tokenless funding input pays the exact pinned price to the operator P2PKH and the blank lands at the funding input's own locking; no signature, no per-blank operator action (the pattern proven live by a stranger on the 2-out pool: `bc2c326e…` / `49b184f5…`; suite `blank-vending.mjs` 18/18) |

The machine record also lives in the pool state file (`state.vending` in
`/home/apecs/cov/role2-pool4-state.json` on the operator VM): locking, price,
operator, load txid, stock, and the policy string. Your wallet buy flow can
rehearse against this machine now, chipnet-first per the standing
dress-rehearsal order.

## 2. G5 — the mainnet v4h machine: the plan is staged; the one blocker is operator sats

Straight answer first: **the mainnet machine is not loadable today because zero
v4h blanks remain at the operator.** All 16 guard-minted blanks (guard batch
`4899462528b6d4a43a421520097be1c955ad54545e79245bb65a64279666c9f9`, vouts 1–16,
each 1,000 sats to the operator P2PKH) were consumed by the mainnet lifecycle's
locks and actions and by the probe era (on-chain verified 2026-11-28: the
operator wallet holds 0 `324b1dbf`-category empty-commitment NFTs).

The staged path (tooling validated end-to-end for mainnet this session):

1. **A new guard batch** — the deployed guard is immortal and self-pinning
   (K=16 per batch, operator signature gates timing only): one operator tx
   mints 16 fresh blanks to the operator (tool: `pool-tagbatch-role2.mjs`,
   mainnet-ready).
2. **The load** — `pool-vend-load-role2.mjs`, now `--electrum`-parameterized
   (commit `97b2cbe` in `pusd-shielded-pool`), moves the blanks into the
   machine. The plumbing dry-run against the mainnet state + wallet reaches the
   expected `only 0 blanks` gate — everything upstream (state read, covenant
   build, mainnet electrum) is proven.
3. **The machine, deterministic at the proposed price**: at **1,000 sats** (the
   chipnet precedent — your rehearsed buy flow transfers unchanged) the mainnet
   machine locking is
   `aa2073ad0a1e681fa123d80754164fd34bdcb0f6ea3c26784b36f6d8778a8b0a945087`,
   operator = the mainnet operator P2PKH (`bitcoincash:qrqj0azraqskmsyh8fkaj70p0a8lrw20fcnrhvnvh8`).
   The price is the operator's call — a different price is a one-line change
   before the load (the locking is price-baked).

**The blocker, precisely:** the operator wallet holds 10,146 plain sats
(on-chain, 2026-11-28). The batch + load need ≈24k sats (17,000 locked into
the 16 blank floats + ~3k batch fee + ~4.4k load fee at BARE rates). The
top-up has been requested from the user; **the machine executes immediately on
funding** — no other gate exists.

**On your "≥ a few dozen" sizing ask:** one batch = 16 blanks = 8 visitor
SHIELDs (2 blanks each). The deployed guard's K pins 16 per batch, so a larger
stock is additional operator batches (each one tx) — we will size to your
visitor projections once the machine is funded; the first batch loads in full.

## 3. Your §4.1 — NP01-tolerance: MEASURED, the answer is NO

Does the 42/42 acceptance cover an EXTRA chain output carrying the
encrypted-note packet on a TRANSFER? **The program does not tolerate it — the
C output shape is pinned, and the pin is output-type-independent.**

- The v4h program pins `TXOUTPUTCOUNT == 3 + sign` (carrier + state + holdings,
  + the payout when sign=1). The extra-output class was already in the 42/42
  acceptance set; **re-measured fresh 2026-11-28** on the BCH-2026 VM under the
  deployed mainnet category `324b1dbf…` and the three-contribution fixtures
  (`BN_VK_FIXTURES=our-v3-user3.fixtures.json`): **42/42**, and
  *"transfer appends an extra output (TXOUTPUTCOUNT == 3 + sign)"* **REJECTS at
  `r2:p4c` (ip 321)**.
- **The literal packet shape, also measured:** we re-ran the scenario with the
  extra output as a ~176-B OP_RETURN-class 0-value output (your B3 packet
  shape) instead of a value-carrying output — **REJECT, the same check**. An
  OP_RETURN is still a TXOUTPUT; the count pin cannot distinguish output types.
  The probe is committed as
  `pusd-shielded-pool/wip-role2-hook/probe-np01-extra-output.mjs`
  (commit `b479f84`).
- **Consequence for B3:** the packet CANNOT ride the chain on ANY v4h action —
  not on the carrier (the programs parse it exactly, as you noted), and not as
  an additional output (this measurement). **Off-chain delivery — your Nostr
  mailbox — is the only note-delivery path.** Your design ships the mailbox
  either way, so this answer removes the chain-side option and confirms the
  mailbox as the durable backstop.

## 4. Your §4.2 — the pool's own-category 100M-FT "supply" at the deploy's vout 2: VERIFIED, inert

**What it is:** the category's mandatory genesis supply. A CashToken category
cannot be created without minting its FT supply, and the pool's own category
`324b1dbf…` is valueless BY DESIGN (the C architecture: a fresh valueless pool
category; the REAL value is the ASSET `2469acc5…` PUSD riding the H-covenant
pair). The 100M FT exists because the category does.

**Where it sits (decoded from the deploy `61022b8b…`, 793 B):**
- out0 = the state NFT at the pool program (the 96-B genesis commitment),
- out1 = the minting NFT re-locked at the guard (born-guarded),
- **out2 = the 100,000,000 pool-cat FT at the OPERATOR's P2PKH** (1,000 sats)
  — not at any pool locking,
- out3 = plain change.

**Is it spendable by anyone?** No — it is a plain P2PKH UTXO; only the
operator's key spends it. **Can it affect the pool?** No — the hook pins the
asset category (`2469acc5…`); pool-category FT is never accepted as value by
any pool check, and the balance/holdings arithmetic only reads the ASSET.

**Current state (on-chain, 2026-11-28):** 99,999,500 FT at
`8808e63288403e233455ec443c0d2dd3a2e1601b1bf287c049ce637d9fba0eea:1`
(operator P2PKH). The ~500-FT delta between the deploy's 100,000,000 and this
figure arose in the probe era: the 99,999,500 figure FIRST APPEARS in the
size-96 commitment-introspection probe relay `b3319682db8f620d…` (block
979248, decoded: its out2 carries 99,999,500 FT while the deploy's out2
minted 100,000,000 — the 500 were consumed at or before that probe tx, a
burn by omission; the category's FT is valueless, so nothing of value was
affected). The one other
pool-cat NFT at the operator (`8808e632…:0`, a 96-B-commitment mutable NFT) is
the probe-era NFT swept back — equally inert: a state-shaped NFT at a P2PKH
cannot satisfy the program's state-input locking pin.

## 5. Where everything lives

- The chipnet machine record: `state.vending` in the pool state file on the
  operator VM + §1 above (the registry `vending` fields for
  `chipnet-role2-pool4-v3` can be lifted verbatim from the table).
- The mainnet machine: this doc is the pre-load handover; on funding we
  execute batch → load and deliver the same field set + the load txid.
- Tooling: `pool-vend-load-role2.mjs` (`--electrum`, commit `97b2cbe`),
  `pool-tagbatch-role2.mjs` (mainnet default), `minting-guard.mjs` /
  `blank-vending.mjs` (the covenants), all in `pusd-shielded-pool/wip-role2-hook/`.
- The NP01 probe: `wip-role2-hook/probe-np01-extra-output.mjs` (commit `b479f84`).

— the Hush Your Money side, 2026-11-28.
