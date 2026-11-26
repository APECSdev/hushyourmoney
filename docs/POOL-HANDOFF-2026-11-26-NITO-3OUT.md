# POOL HANDOFF — 2026-11-26 — the 3-out v3 WEB ACCEPTANCE (everything is ready)

**For:** the Nito Cash team. **One goal tonight:** run the 3-out
SHIELD → TRANSFER → UNSHIELD through the browser Wallet view and flip
`walletProverCompatible` on `chipnet-pusd-role2-3out`.

Every blocker from the last handoff is closed. The three things you need —
the pool selector, the blanks, and the in-notes — are all ready:

| What | Status |
|---|---|
| UI **pool selector** | ✅ **built this session** (`nito.cash` commit follows) — the Wallet view now selects between the 2-out and 3-out pools; the store scans the SELECTED pool |
| **3-out blanks** | ✅ **permissionless** — the 3-out vending machine is live (`aa2020bd…`, 1,000 sats/blank, 5 in stock); buy with YOUR OWN key via `blank-buy.mjs` |
| **In-notes** | ✅ the 7 live 3-out notes are exported with their `nk`s below — import them into the sealed store (§3); the client refuses the bootstrap seeds after genesis (your own `6669cdd` rule) |
| Proving assets | ✅ live on `prover.nito.cash/assets/` — `pool3.wasm` 3,380,815 B sha256 `c806e561…`; `pool3_final.zkey` 98,190,141 B sha256 `b0177dbe…` (full-download verified this session); `verification_key_3out.json` 3,111 B sha256 `d4ed12ee…` |
| Funding (demo wallet A) | ✅ consolidated: **1 plain UTXO of 60,712 sats** (tx `f9c0001f…`), **8 blanks**, **99,999,300 FT** of `bc607a96…` |
| Byte-exact gate | ✅ `node scripts/pool-accept.mjs --pool role2-3out --txid ec31a41c` → all three unlockings BYTE-EXACT (re-run §6) |

## 0. THE ONE DISCLOSURE THAT MATTERS

**Finding R2-NULLIFIER-DOUBLING** (measured 2026-11-26, full record:
`docs/HANDOFF-2026-11-26-3OUT-NOTES-MANAGEMENT.md` §12): the nullifier fold
permits a demonstrated full-balance drain on BOTH role-2 pools — valid proofs
using one note as both in-notes verify against the deployed VKs.

**This does NOT block tonight's acceptance** — it is a chipnet demo run with
demo funds. It DOES mean: **no valued asset may enter any role-2 pool until
the v3 nullifier set ships**, and the nullifier set is now a mainnet gate
alongside Gate 7. The acceptance you run tonight is explicitly a
testnet-demo validation of the 3-out client path.

## 1. The pool (facts)

| Item | Value |
|---|---|
| Registry id | `chipnet-pusd-role2-3out` (`outputs: 3`, `carrierBytes: 201`) |
| Category | `bc607a96c8a21a1400263d437005d3f434c3c60674018119995dc6200072e635` |
| Program locking | `aa204a6ce339fb62b7b2ebb502c9bf642d3221620e6f5ded619ce8a39110e35882ea87` |
| Deploy | `2f650791…` (block 348,569); born guarded (`aa20e33c…`, K=64) |
| On-chain state | 5 confirmed actions; **700 FT** balance; notes 112 (leaf 8) / 84 (9) / 84 (10) / 20 (12) / 200 (14) / 100 (15) / 100 (16); 17 leaves; state outpoint `cbfb0503…:1` |
| Action shape | 3 inputs (fuel 0, fuel 1, state 2), NO signatures; 201-B carrier with cm2; 9-field actionHash; lock = 2 blanks + ~32,400 sats plain |
| Vending | `aa2020bd0ad169a6343ebe86673df2f84fbb6e65a41e14f8891c96a24d10fefbf2d287` — price **1,000 sats**, operator wallet A; first stranger buy `569a6e6d…` (block 348,775) proved it permissionless |

## 2. What changed in the client this session (the code you pull)

- **`store/modules/pool.js`** — `scanPool` takes `{ poolId }` (falls back to the
  network default), and `submitRole2Action` scans **the selected pool**. This
  was a real wiring gap: the previous code scanned the DEFAULT (2-out) pool
  even for a 3-out submission, so the state UTXO and the action chain would
  have come from the wrong pool.
- **`views/Wallet.vue`** — the pool selector (2-out / 3-out v3 buttons); the
  blank inventory re-counts against the selected pool's category; the action
  dispatch passes `poolId`; the "awaiting" note now states the assets are live.
- **`lib/pool/registry.js`** — the 3-out entry's `vending` is filled (the
  machine above); the stale "store/UI not wired" comments are corrected; the
  notes carry the 5-action lifecycle + the disclosure pointer.
- Suite **689/689 passed**, coverage **89.1% statements / 90.04% lines**
  (thresholds 88.9 / 89), `pnpm build` OK — all on `apecsdev`.

## 3. The note import (your in-notes for the run)

The 7 live notes with their `nk`s — DEMO keys, covered by the standing
rotation directive. The client's own `noteCommitment`/`nullifier` reproduce
every `cm`/`nf` below byte-for-byte (verified against BOTH the bench Poseidon
and the client lib, and every `cm` matches the on-chain leaf at its
`leafIndex`).
```json
[
  {
    "value": "112",
    "ownerPub": "13780938169976510061433954507617030640544267147354291633928071507300008143432",
    "rho": "2537464061940928641620662817475410699753611588226125506322469252527036385410",
    "r": "3277694718057002820674195556470338153367667830057688649055530450394039013070",
    "nk": "21749248836232324304724398822325811457398586126626636352705642040537393277813",
    "cm": "15064694279486983615343473994177269641901311210096936612537012755528182008426",
    "nf": "10914757047953595756227436137507866988992454268997281289020980707393650985111",
    "leafIndex": 8,
    "spent": false
  },
  {
    "value": "84",
    "ownerPub": "7183702106998429709504047399103520787071498587450812793660448838706527889390",
    "rho": "9629474369399586888166215250476016652788161886514832010505929169260685643709",
    "r": "2488587175779606672285432790850630501265319939348998181871513013671051693825",
    "nk": "21336358177639910266887851776736595765650270417301234906780179792851075983657",
    "cm": "12121792633249605029204070089006774368097777610023785179218032892529228246269",
    "nf": "2433950054651308373245828563027132759935393063362916847930115206347129594537",
    "leafIndex": 9,
    "spent": false
  },
  {
    "value": "84",
    "ownerPub": "4564381109153730435650464755590226814712740676236218822373467911415440136204",
    "rho": "2896643506681946345116456444954053667237102208475220285748766987639481365056",
    "r": "20644295290661486765578179502131893663916249023511669901489057826670824641912",
    "nk": "18492574738670606721986304748292823815027132384729041133632554616492717193690",
    "cm": "462713068569480960519669783856007856807587898430222873248129437935931360473",
    "nf": "19347442675098477061789929881908301694980631084394765196663413500884072313053",
    "leafIndex": 10,
    "spent": false
  },
  {
    "value": "20",
    "ownerPub": "11554297598789438243820058141892335189612049211802665457968003256550356754641",
    "rho": "12220786699865006129960673512894819753295067182222407641537949437399192754173",
    "r": "19760755574994570219714249096395459258054443736138234066046673780071692955317",
    "nk": "4417146147881556010224386216786001608736074166521351767395268299342839995603",
    "cm": "3098514036485563981656925174235979713278799660775871120474828420958872146783",
    "nf": "13608589134530057026150545240828617343783947386158265363806186721256611389464",
    "leafIndex": 12,
    "spent": false
  },
  {
    "value": "200",
    "ownerPub": "949557109336799257630861108717734391827097419836444534552718947277466540361",
    "rho": "9994512109431355272868289341415434953694888012282935665298920252278814496259",
    "r": "5032925659838830998916254742991679298834434974119992432083010422233790803295",
    "nk": "20440545230005852959037052043307243349848346011634875856402336405281786065925",
    "cm": "8721663782915947665094193601164222250709588181743224156507698796070504688465",
    "nf": "19467233080046884698996495016208597243836474536613449214734410920251082016567",
    "leafIndex": 14,
    "spent": false
  },
  {
    "value": "100",
    "ownerPub": "12438376217583844821498837665842793459665907950232959572527808741110207721817",
    "rho": "19890438394982747499386625658610762698167196790805455894455177198282498305938",
    "r": "4997917254827109414855692729523812586171362811238059811287396249920046199780",
    "nk": "12355668527572222051542369964973882957491528015978360999098062631138938847595",
    "cm": "20898325633549116180145100062748459032701711759408032293474609628496110983774",
    "nf": "11076440987489673377463872062539373370953858384224584182564708017317198746057",
    "leafIndex": 15,
    "spent": false
  },
  {
    "value": "100",
    "ownerPub": "456661835093928514292499024249290217124281167120263285224674114482511479357",
    "rho": "4497539486112285399934951517300814020385510608248828451023060762191661237321",
    "r": "9446084469642009749797592492729252935085725199939211172176825955960857227987",
    "nk": "15839438008915228280964206097950783088836853751373510771599678205930152432242",
    "cm": "13325386923160749729381183178853398891739797076303632214227878613855206451047",
    "nf": "20950528192647396838936177294581815626258107189154121701660944611947258774164",
    "leafIndex": 16,
    "spent": false
  }
]
```
Import (browser console, wallet unlocked — the app root exposes the store in
dev builds; or dispatch from any component):

```js
const notes = [ /* the JSON above */ ]
for (const note of notes) {
    await app.$store.dispatch('pool/recordNote', note)
}
```

`recordNote` uses each note's real `leafIndex` (set above), seals into the
store, and a subsequent scanPool marks any on-chain-spent note by nullifier
(all 7 are live/unspent as of block 348,890).

## 4. The acceptance procedure (the 30-minute path)

1. Pull the latest `master` (the pool-selector commit).
2. **Temporarily** set `walletProverCompatible: true` on
   `chipnet-pusd-role2-3out` in `lib/pool/registry.js` (local only — same
   procedure as the 2-out run; commit the flip only AFTER it passes).
3. Restore the demo wallet A entropy (the sealed store from the 2-out run —
   its accounts hold the 60,712-sat UTXO, the FT and the blanks; or import
   fresh, then §3).
4. Import the 7 notes (§3).
5. Wallet view → select **3-out v3** → SHIELD → TRANSFER → UNSHIELD
   (any amounts ≤ the in-note sums; e.g. TRANSFER 200 from notes 14+15, then
   UNSHIELD 112 from notes 8+9 — leaves 84/84/20/100/100 for later runs).
   The lock needs 2 blanks + ~32,400 sats at ONE account address — wallet A
   has 8 blanks and the single 60,712-sat UTXO (or buy blanks from the
   machine with your own key, `blank-buy.mjs`, price 1,000 sats).
6. On pass: commit the registry flip (`walletProverCompatible: true`,
   status `live`) — that is the final approval.

Known gap for the run: the 3-out has **no encrypted note delivery** (the
v3 core item) — your own out-notes are recorded client-side by the store
(`recordRole2Notes`), and a TRANSFER's recipient note is undeliverable until
the delivery layer ships. Same as the 2-out run's 400 FT note.

## 5. Blank acquisition (permissionless, your key only)

```bash
# on apecsdev, from ~/zkb/groth16_cashscript/chunked/bn254/bn-native-sound/
node blank-buy.mjs --key <your-key.json> --state /home/apecs/cov/role2-pool3-state.json
```

The covenant pins everything (price, destination, the blank's shape, the
float, delivery to the funding input's own locking); there is no operator
signature anywhere. The machine holds 5 blanks; wallet A holds 8 more.

## 6. Verification recipes

```bash
# byte-exact witness gate (apecsdev)
cd ~/apps/nito.cash/apps/web
node scripts/pool-accept.mjs --pool role2-3out --txid ec31a41c

# suite + build (apecsdev)
pnpm exec vitest run --coverage   # 689/689; 89.1% / 90.04%
pnpm build

# proving assets (any host — full download for the zkey; a HEAD/short read
# truncates: the full 98,190,141 B and sha256 b0177dbe… were verified this session)
curl -s -o z3 https://prover.nito.cash/assets/pool3_final.zkey && sha256sum z3

# live pool state (chipnet): state outpoint cbfb0503…:1 — 700 FT, 17 leaves
```

## 7. After tonight

- `walletProverCompatible: true` on the 3-out entry closes the notes-management
  arc end-to-end (bench lifecycle + client witness + web acceptance).
- The v3 core (deposit path, **nullifier set — the demonstrated drain fix**,
  encrypted note delivery) is the next build; Gate 7 AND the nullifier set
  are the mainnet gates.
- Demo keys rotate after the objectives (standing user directive).
