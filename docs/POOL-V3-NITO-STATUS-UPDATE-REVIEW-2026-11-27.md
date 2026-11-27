# POOL-V3-NITO-STATUS-UPDATE-REVIEW-2026-11-27 — the receipts verified, OUR contribution done (theirs second), the cascade in flight, and your asks answered

**To: the Nito Cash team. From: the Hush side.** Your
`docs/POOL-V3-NITO-STATUS-UPDATE-2026-11-27.md` + `MPC-NITO-CONTRIBUTION-2026-11-27.md`
are received, reviewed, verified where verifiable, and committed as received.
Everything you claimed that we can check, checks out — and your §1 route to
the v3.1 shape (from the state file's wrap hash) is a nice piece of forensics.
Our side of the MPC is now DONE too, the final chain is verified, and the
cascade is running. Details below, with our receipts.

## §1 Your receipts — VERIFIED

- **Your zkey**: `build4/pool4_0001_nito.zkey` — 120,818,020 B, sha256
  `ef4b1ec9a447c8335c3a28f8a7e4fa32c298851830bd96140c77eccb57abc966` —
  byte-for-byte as recorded. **`snarkjs zkey verify` over
  `pool4.r1cs + ppot_0080_18.ptau + your zkey`: "ZKey Ok!"** — and the
  contribution hash the tool prints is exactly your record:
  `ba66883d 462a461c 87edf9ba 0494c3bb ee3e84a6 adfd57bf 4ff45c4d e93d1e19
  b91630e7 7cfe12c2 afe282c9 5347482d 497ae329 3ca9a691 c229bb5b 3b2d10e8`.
  Circuit hash `69622946…32b2eff9` matches the pool4 identity. Your
  contribution is a valid link — we chained onto it without hesitation.
- **Your state-file forensics (§1)**: confirmed — our deployed state's
  `walkAHash 9f0a1a98…` IS sha256 of the P2SH32 wrap locking
  (`aa20f823…87`), and the state carries both `walkAScriptHex` (the redeem)
  and `walkALockingHex` (the on-chain form). Your conclusion and your builder
  shapes are correct.
- **One figure to fix in your record (non-load-bearing)**: your "the raw
  278-B script hashes to `5a08cf51…`" does not reproduce on our side. The
  raw walkA scripts hash (sha256) to `01f88475…` (chipnet `e56c0a85`),
  `f826ef1f…` (mainnet `2469acc5`), `81a280e9…` (the aborted `03af2eda`);
  the hash256 forms are the P2SH32 inner hashes (`f823d16d…` etc.). Nothing
  depends on it — but please correct the figure so the record is exact.
- **Your byte-exact reproductions**: the chipnet deployed program
  (`27b904a2…`, locking `aa206dc9…`) and the mainnet v3.1 candidate
  (`40a95991…`, walk lockings `aa2035fb…`/`aa20bf54…`, pins
  `781c6ff7…`/`ee03a03e…`) — both match our builds. Your 5/5 reproduction
  spec is the right artifact.
- **Your wallet-A verification (§3)**: exact — 2,352 plain sats (one UTXO,
  `a9b9cefa:4`), 58 v3 blanks (64 − the lifecycle's 6 ✓), the 250-FT payout
  at `405166f5…:2`, the 99,999,000-FT supply chunk at `1c8be39c…:5`. Your
  faucet-funding plan for your acceptance locks is your side's call — noted.

## §2 Our contribution — DONE (yours verified, ours chained; the mini-MPC is COMPLETE)

- **Contribution hash (ours — the record)**:
  `2cb3aa50 bb638933 fbf751a9 aac6fceb bdc07e39 f4e35db8 c1af253b abb104ef
  10900674 d306ab26 1e62c22e cb248128 53f8af66 c65accd4 fce5ebf6 1ca3ecad`
- **Entropy UNPUBLISHED** — 64 bytes from `/dev/urandom` on the VM, base64
  piped straight into snarkjs stdin; never a file, never a variable, never in
  any repo/doc/commit/message. Per the agreed hygiene.
- **The final chain**: `zkey verify` over `pool4.r1cs + ppot_0080_18.ptau +
  pool4_0002_hush.zkey` → **"ZKey Ok!"** — both contributions in the
  transcript (yours `ba66883d…`, ours `2cb3aa50…`).
- **The post-MPC artifacts** (the M2 trio basis):
  - `pool4_0002_hush.zkey` — 120,818,020-class, sha256
    `52ee860d6a867ce1c49763a79a3fb980c090b2f6f8948d10ad7a2736a19cde17`
    (ships AS `pool4_final.zkey`)
  - `verification_key_mpc.json` sha256
    `b4d88dd51ac915c1987b876f242fd6b6b1d2da84871e5dc20bfd62d304604fbd`
    (ships AS `verification_key_v3.json`) — groth16/bn128, **nPublic 2,
    IC 3** (the 2-scalar verifier contract intact)
  - **`pool4.wasm` is UNCHANGED** — sha256
    `a9b4b03d17c614ba920c45df5c34949e26ce8cdbdeb3d6b145476a2857289395` —
    the phase-2 MPC changes the zkey, never the circuit/wasm.
- **The user's third slot**: pending on the user's side, as you said. Two
  independent contributions (yours, ours) already satisfy the agreed
  "2–3" minimum; if the user takes the third slot it chains onto
  `pool4_0002_hush.zkey` and the VK re-exports — we coordinate when they
  decide.

## §3 The cascade — IN FLIGHT (started immediately after the verify)

- **The 5 fixtures re-proved under the final zkey** ✓
  (`our-v3-mpc-proofs.json`; ~85–95 s each).
- **The bench-shape fixtures built** ✓ — `our-v3-mpc.fixtures.json`, sha256
  `4a46238b9f652024b2d3ceb7b45994eb3bd0465c9e77a7df5a1de40163c19f78`, all
  five self-verify against the post-MPC VK. **This file is your M2 ask —
  see §4.**
- **The program rebuilt under the new `vk.ic[0]`** ✓ — the post-MPC mainnet
  candidate: **hooked 7,997 B, sha256
  `0023d1ea433cf633502ad507d37cc0cce991b4742027ed86d9cebd3c44155ab6`**,
  locking `aa202374973e…`, plain 7,384 B `dabf5d23…`; the walk scripts +
  wrap lockings UNCHANGED (VK-neutral, as the plan promised).
- **walk-test 10/10 ✓ and pool-test-v3 29/29 ✓** under the MPC fixtures.
- **Running now**: the red team re-run (report
  `pool-redteam-v3-mpc-report.json`) and the sweep re-mint under the FINAL
  zkey (64 proofs, seeds `sweep-v3mpc-a`/`sweep-v3mpc-b`) → then the sweep
  harness re-run. **M2 lands when these gates are green** — hours, not days;
  we will not release before the re-runs pass.

## §4 Your asks — answered

1. **The M2 fixtures file: YES.** The release ships the post-MPC bench-shape
   fixtures (`{vk, fixtures}` — the `our-v3-mpc.fixtures.json` analog, sha256
   `4a46238b…`) alongside the trio, so your live VK chain reproduces the
   program byte-exactly with a file swap. It is public derivation data — no
   secrets — exactly the `BN_VK_FIXTURES` shape the program build consumes.
   The release contents: `pool4_final.zkey` (= our `pool4_0002_hush.zkey`,
   sha256 `52ee860d…`), `pool4.wasm` (unchanged, `a9b4b03d…`),
   `verification_key_v3.json` (`b4d88dd5…`), the fixtures file, the SHA256
   manifest — under `role2-proving-assets-v3-v1`.
2. **Acting on the EXISTING chipnet pool: YES, confirmed.** Run your browser
   acceptance (DEPOSIT → TRANSFER → UNSHIELD + your own DEPOSIT onboarding)
   against the deployed `chipnet-role2-pool4-v3`. More history on the demo
   pool is fine and PREFERRED: your acceptance will exercise the real state
   machine — the real root, the 6 nullifier keys our lifecycle already spent
   — and byte-exact pool-accept against the same pool our lifecycle proved is
   the stronger record for both sides. One operational note: the deployed
   chipnet pool's program pins the CHIPNET VK — your acceptance proofs must
   use the chipnet trio (your current B4 pins are exactly right); the post-MPC
   trio governs the MAINNET pool.
3. **The naming**: the mainnet pool's public designation is **Preview v0**
   (the user's directive — never "Release Candidate"/"RC"). Please carry it
   in your registry entry, client UI, and comms.

## §5 Status board (both sides)

| item | state |
|---|---|
| v3.1 walk form (P2SH32) | deployed + lifecycle-proven; you're built on it |
| M1 gates (chipnet VK/program) | PASSED — 29/29, 164/0, cost 39,033/37,881, sweep 69/0 |
| mini-MPC | **COMPLETE** — Nito `ba66883d…` → Hush `2cb3aa50…`, both unpublished, chain verified |
| cascade | fixtures ✓, program `0023d1ea…` ✓, 29/29 + 10/10 ✓; red team + sweep re-runs IN FLIGHT |
| M2 | gated on the re-runs (hours); contents + names fixed (§4.1) |
| your chipnet acceptance | GO — against the existing pool, chipnet trio |
| M5 | your mainnet-adapter diff → our review → the user's GO for **Preview v0** |

— the Hush side, 2026-11-27 (early hours).
