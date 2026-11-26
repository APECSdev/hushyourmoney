# Role-2 tPUSD funding — handoff (2026-11-26)

**From:** nito.cash (APECS)
**To:** hushyourmoney
**Scope:** fund the role-2 pool's tPUSD to the acceptance wallet so the nito.cash browser
SHIELD → TRANSFER → UNSHIELD can run. That run is the last gate before the role-2 registry
flips to `walletProverCompatible: true` (standing rule: **the nito.cash client is the FINAL
approval**, A10 / CF-A6).

All on-chain facts below were verified live on chipnet (Fulcrum `chipnet.bch.ninja:50004`)
on 2026-11-26. Nothing here is inferred from the state files alone.

---

## 1. Where the role-2 supply actually is

The role-2 category is
`480e30ff1d3f5f0b6fe9dd2dbe363b1776f61566f29a395628d0b50abd01b9d0`
(`nito.cash/apps/web/src/lib/pool/registry.js:85`).

The deploy `2eaeb97fc85b2ff0fdd6c6afd1d807f8a715bd92a40258fae9f0e6ce50fe83b8`
(block 345,467) paid its token outputs **not** to the mint key but to the operator/faucet
key `76a914b7c3450697960019d2e08d2f3107642a500bf384` =
`bchtest:qzmux3gxj7tqqxwjuzxj7vg8vs49qzlnsszagj73z3`
(`/home/apecs/.secrets/faucet-hot-wallet.json`).

The 100,000,000 FT at deploy `:2` was then split by
`97d135f96d9b555523e15e0c414a24a7b7964ec59689ef1a81151806f4d70346` (block 345,470):
`:0` = 1,000,000 FT to the pool program (the bootstrap SHIELD's fuel), `:3` = 99,000,000 FT
back to the operator.

**Current unspent supply at the operator key (verified):**

| Outpoint | FT | Note |
|---|---|---|
| `97d135f96d9b555523e15e0c414a24a7b7964ec59689ef1a81151806f4d70346:3` | **99,000,000** | the role-2 supply |
| `e54d19fb751f60a0955ba92a0af75ad87083b2e1cb1648b4fa08312b901d8eab:2` | 250,000 | the UNSHIELD payout |
| 88 × mutable-NFT blanks (`ad1d7845cc53:54…64` and the batch outputs) | 0 | the operator's blank reserve, 1,000 sats each |
| `460a6f2a…:3` (39,671), `bc2c326e…:1` (1,000), `49b184f5…:1` (1,000) | — | plain BCH |

The mint key `bchtest:qpt2lckk5ck5x7rwcnl6ucj6z0h9njm0pvy5nudg50` holds **none** of this
category (it holds 13 older test categories — `0d31da75…`, `2d7cae86…`, `0717e1a1…`, … —
plus plain BCH). That is why `nito.cash/apps/web/scripts/send-tpusd.mjs --category
480e30ff…` fails with `no fungible 480e30ff… UTXO at the mint key`: the script reads the
token UTXO from `secrets.address`, and the faucet file has `addresses: {chipnet, mainnet}`
with **no `address` field**.

---

## 2. The funding transaction (one tx)

`send-tpusd.mjs` requires a key file with `privateKeyHex`, `publicKeyHex`, **and `address`**.
Make a copy of the faucet key with the field added:

```json
{
  "purpose": "faucet-hot-wallet",
  "privateKeyHex": "…",
  "publicKeyHex": "…",
  "address": "bchtest:qzmux3gxj7tqqxwjuzxj7vg8vs49qzlnsszagj73z3",
  "addresses": { "chipnet": "bchtest:qzmux3gx…", "mainnet": "bitcoincash:qzmux3gx…" }
}
```

Then, from `nito.cash/apps/web/`:

```bash
node scripts/send-tpusd.mjs \
  --secrets /home/apecs/.secrets/faucet-hot-wallet-with-address.json \
  --to bchtest:qzzu85xnl99u534d9z40yu7c494hknppx5lu29gl8t \
  --amount 20000000 \
  --bch 200000 \
  --category 480e30ff1d3f5f0b6fe9dd2dbe363b1776f61566f29a395628d0b50abd01b9d0 \
  --dry
```

Drop `--dry` to broadcast. It pays **one** token output (1,000 sats, 20,000,000 FT) and
**one** plain output (200,000 sats) to the wallet, and returns the FT + BCH change to the
operator. `--token-sats`/`--bch` are the two knobs; the default `--bch 200000` already
exceeds the 50,000-sat funding floor.

The destination wallet is the E2E demo wallet A
(`nito.cash/NOTES/pool-e2e-demo-wallets.md`):

- `bchtest:qzzu85xnl99u534d9z40yu7c494hknppx5lu29gl8t`
- mnemonic: `direct blame later place ready bronze logic race soda toss clerk violin dirt area very color security physical rubber veteran circle grace treat strike`
- entropy (`profile.ms`): `3e82e5f552eb2c3960e583ce3cb4a9fa23ea16bcb96dc2d47ef3799292caf9f6`

Its current state (verified): 16 UTXOs, all **old** categories (13 × 20,000,000 + 40,000,000
+ 100,000 of retired pools), **no `480e30ff…`**, and only **3,423 sats** of plain BCH — hence
the funding tx above.

---

## 3. The other two prerequisites (blanks + fee sats)

The nito.cash role-2 lock (`nito.cash/apps/web/src/lib/pool/role2-lock.js`) spends **two
user-held blanks as signed P2PKH inputs** (its `sources` use the change locking). The blanks
must therefore sit at the **wallet's own P2PKH**, not at the pool program.

- The vending machine `aa206b51…` is **empty** (3 history entries, 0 unspent — verified).
- The operator holds 88 blanks.

Permissionless path (one tx to load + fund, then the wallet buys with its own key):

```bash
# on the VM, from the role-2 worktree:
node pool-vend-load-role2.mjs --count 2 \
  --fund-addr bchtest:qzzu85xnl99u534d9z40yu7c494hknppx5lu29gl8t --fund-sats 50000
# then, with the wallet A key file (derive from the mnemonic above):
node blank-buy.mjs --key <wallet-A-key.json>     # buy 1
node blank-buy.mjs --key <wallet-A-key.json>     # buy 2 (spends the change)
```

Direct alternative: send two blank UTXOs (category `480e30ff…`, mutable NFT, **empty**
commitment, 0 FT, 1,000 sats each) to the wallet address in one ordinary token tx. The
wallet counts blanks by exactly that shape (`nito.cash/apps/web/src/lib/pool/blanks.js`,
`isBlankUtxo`).

Fee sats: the lock's fixed cost is 2 × 15,000 fuel sats + the lock fee (~800 sats at the
100-byte placeholder policy), so the plain funding UTXO at the wallet must be **≥ 32,000
sats**; the 200,000-sat output above covers it with margin.

---

## 4. Nito-side status (do not read as "done")

The funding is necessary but not sufficient. While preparing this handoff I verified that the
browser store action (`nito.cash/apps/web/src/store/modules/pool.js`, `submitRole2Action`)
passes **raw Fulcrum UTXOs** (`tx_hash` / `tx_pos` / `value` / `token_data`) into builders that
expect `txid` / `vout` / `sats` / `lockingBytecode` / `token`, and it selects blanks from the
**pool** address instead of the wallet's. Concretely:

- `pool.js:381` — `selectBlanks(poolUtxos, …)` where `poolUtxos` is the covenant address.
- `pool.js:411` — `!u.token` (Fulcrum returns `token_data`) and a 20,000-sat floor (the lock
  needs 2 × 15,000 + fee).
- `pool.js:474+` — `stateUtxo.token.nft.commitment` / `.token.amount` / `.token.category`
  (Fulcrum returns `token_data.*`).
- `role2-lock.js` / `role2-action.js` `outpointOf` — expects `txid` / `vout`; the store must
  normalize before calling.

These are nito-side fixes in progress; the witness generator, prover assets, decoder and the
acceptance harness are already byte-exact against the live lifecycle
(`9d9aa97a…` → `5262417b…` → `e54d19fb…`). The Hush team's scope here is **the funding tx +
the blanks**, not these code paths.

---

## 5. Acceptance checklist (nito runs this)

1. Fund wallet A: 20,000,000 tPUSD (`480e30ff…`) + 200,000 sats — §2.
2. Load + buy 2 blanks to wallet A — §3.
3. Restore wallet A in the browser (`#/restore`, the mnemonic above), chipnet network.
4. SHIELD → TRANSFER (to wallet B's delivery point) → UNSHIELD, capturing the txids.
5. Flip `registry.js` `chipnet-pusd-role2`: `walletProverCompatible: true`, `status: 'live'`.
6. CI green + deploy; then the round shape (2N outputs) work resumes.

Wallet B (the transfer recipient, same file): `bchtest:qza5uut0cg0aan2g8jetn68zrrmssvanluzm364c4d`,
mnemonic `siren sword sadness special ahead job assist sadness piece supreme lyrics tower swap
lunch valve lunch casino miracle ramp street pet chimney rapid private`.

---

## 6. Reference values

- Role-2 program locking: `aa203e40b64cff154d4b3305e8c8cc4e3174bc595ad74342a8445a9a7798b7be3a2987`
- Vending locking: `aa206b51396304b3bd4e0e9c254f84d1ee80d83a5c7ccaf3750883d00866480d981287` (157 B, 1,000 sats/blank)
- Guard: `aa2066a2…` (5,103 B, batch 64)
- State UTXO (current tip): `e54d19fb751f60a0955ba92a0af75ad87083b2e1cb1648b4fa08312b901d8eab:1` (10,000 sats, 750,000 FT)
- Lifecycle: SHIELD `9d9aa97a1ccdcd6662eb934fd55c72dff17ddba8c6c152a506871f795026ccf0`,
  TRANSFER `5262417b…`, UNSHIELD `e54d19fb…`
- Prover assets: GitHub Release `role2-proving-assets-v1` (zkey 97,716,000 B `4a4e2543…`,
  wasm 3,376,395 B `8595b434…`, VK 3,111 B `05250429…`), mirrored at
  `https://prover.nito.cash/assets/*` (CORS `*`, 24 h cache)
