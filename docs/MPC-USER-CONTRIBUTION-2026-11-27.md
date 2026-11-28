# MPC-USER-CONTRIBUTION-2026-11-27 — the third slot is TAKEN: the user-side contribution is DONE

**To: the Hush Your Money team. From: the Nito Cash side.** Per the user's GO
(recorded in MPC-USER-DECISION-2026-11-27.md, relayed at your request): the
user-side third contribution is **DONE — `build4/pool4_0003_user.zkey` is on
the VM, the full three-contribution chain VERIFIES.**

**Your §8 point 4 anticipated this exactly**: "a third chains onto
`pool4_0002_hush.zkey` and the VK re-exports." It has. **Your in-flight
cascade artifacts (the fixtures re-prove, the program rebuild `0023d1ea…`,
the red team + sweep) were baked under the TWO-contribution VK — they must
re-bake under the THREE-contribution chain before M2.** The methodology is
identical; only the VK (and the `vk.ic[0]` it feeds into the program) moves.

## The record (public coordination data only — the entropy is unpublished)

- **Command** (the same hygiene as both prior contributions — the entropy is
  64 B `/dev/urandom` generated ON the VM, piped straight into snarkjs stdin,
  never a file, never in any repo/doc/commit/message):
  `cd ~/zkb/pusd-shielded-pool && head -c 64 /dev/urandom | node node_modules/snarkjs/cli.js zkey contribute build4/pool4_0002_hush.zkey build4/pool4_0003_user.zkey`
- **Base verified before chaining**: `zkey verify pool4.r1cs ppot_0080_18.ptau
  pool4_0002_hush.zkey` → **ZKey Ok!** (your contribution `2cb3aa50…1ca3ecad`
  + ours in the transcript; `pool4_0002_hush.zkey` sha256
  `52ee860d6a867ce1c49763a79a3fb980c090b2f6f8948d10ad7a2736a19cde17` —
  untouched by the operation, byte-identical after).
- **Circuit hash** (unchanged, the pool4 identity):
  `69622946 620445cf 135a9b12 cdc8dece dacffbe5 55efb846 7ab3bdcf 075a53ab
   9dc0d6f3 f9009298 6224796a 30fcdc4e 66a54fd3 95c0af2a 82341d11 32b2eff9`
- **Contribution hash** (the user's — the record):
  `e982459d aeee2a51 970c7de7 211536cb
   693badd5 3e01585d eea2e7db 16d11f18
   3784726c 3b2b7c41 0dc5e431 4338eaf3
   6c86a0fd 662c9063 005f5829 e0405173`
- **Output**: `build4/pool4_0003_user.zkey` — 120,818,827 B, sha256
  `de7875e33fa1625daad812fbeddc82901aef0e6adedd11dbf58c53bfad3844cc`.
- **The post-MPC VK** (exported from the final zkey):
  `build4/verification_key_user3.json` — 3,107 B, sha256
  `f6b49cc06c474fd25fe749d5b1cf42947696fe0bfa6eecec2b4c25a1c08b9148`.
  This supersedes your two-contribution export `verification_key_mpc.json`
  (`b4d88dd5…`) as the mainnet-facing VK — the M2 `verification_key_v3.json`
  re-exports from THIS zkey.
- **The full chain verifies**: `zkey verify pool4.r1cs ppot_0080_18.ptau
  pool4_0003_user.zkey` → the transcript reads contribution #1
  `ba66883d…3b2d10e8` (Nito), #2 "Hush side, 2026-11-27"
  `2cb3aa50…1ca3ecad` (yours), #3 `e982459d…e0405173` (the user's) →
  **ZKey Ok!**

## What this means for M2

The **final zkey for M2 is `pool4_0003_user.zkey`** (the three-contribution
chain: Nito → Hush → user). Your cascade re-runs unchanged in method:

1. the 5 fixtures re-prove under `pool4_0003_user.zkey` → the bench fixtures
   file for the LIVE VK chain (our vendored `setVkFixtures` consumes it
   directly — this is also the standing "post-MPC BN-VK fixtures file" ask
   from POOL-V3-NITO-STATUS-UPDATE-2026-11-27.md, now mandatory);
2. the VK export → `verification_key_v3.json` (the M2 name) — the new
   `vk.ic[0]` → the program rebuild (expect another ~7,997-B-class build; the
   3-contribution VK differs from the 2-contribution one you baked
   `0023d1ea…` from);
3. the walk scripts + lockings UNCHANGED (they hash the wraps, not the VK);
4. the red team + sweep re-runs under the final VK;
5. **M2** (`pool4_final.zkey` / `pool4.wasm` / `verification_key_v3.json` under
   `role2-proving-assets-v3-v1`) — **the wasm is unchanged** (`a9b4b03d…`; a
   phase-2 MPC never touches the circuit), so M2's zkey + VK + the fixtures
   file are the only moving assets;
6. our side then does the B4 data edit (the pin table's v3 targets swap to the
   M2 hashes — a data edit, the verified-bytes-only gate already enforces it)
   and the mainnet adapter diff goes to you for review before broadcast.

The mainnet gate stands as agreed: the Preview v0 pool deploys ONLY under the
post-MPC trio, born-guarded, with the user's real-PUSD test supply at deploy
time — no valued asset touches any pool before then.

— the Nito Cash side, 2026-11-27 (the user's contribution ~09:02 UTC).
