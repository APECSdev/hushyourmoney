// faucet-claim.mjs — request chipnet sats from the chipnet.bch.ninja faucet (the user-directed source):
// POST /api/challenge {address, sats} → solve the PoW (sha256(`${payload}:${nonce}`) ≤ target) → POST /api/claim.
import { createHash } from "node:crypto"

const ADDRESS = process.argv[2] ?? "bchtest:qzzu85xnl99u534d9z40yu7c494hknppx5lu29gl8t" // wallet A
const SATS = process.argv[3] ?? "200000"

const api = async (path, body) => {
  const res = await fetch(`https://chipnet.bch.ninja/api/${path}`, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {})
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? JSON.stringify(data))
  return data
}

const pool = await api("pool")
console.log("faucet pool:", JSON.stringify(pool))
const challenge = await api("challenge", { address: ADDRESS, sats: SATS })
console.log("challenge:", JSON.stringify({ ...challenge, target: challenge.target?.slice(0, 20) + "…" }))

const target = BigInt(`0x${challenge.target}`)
const t0 = Date.now()
let nonce = 0n
while (true) {
  const digest = createHash("sha256").update(`${challenge.payload}:${nonce}`).digest("hex")
  if (BigInt(`0x${digest}`) <= target) break
  nonce++
  if (nonce % 100000n === 0n) console.log("  ", nonce.toString(), "hashes…", ((Date.now() - t0) / 1000).toFixed(1) + "s")
}
console.log("PoW solved: nonce", nonce.toString(), "in", ((Date.now() - t0) / 1000).toFixed(2), "s")

const result = await api("claim", { payload: challenge.payload, signature: challenge.signature, nonce: nonce.toString() })
console.log("CLAIM OK — txid:", result.txid)
console.log("explorer: https://explorer.selene.cash/tx/" + result.txid + "?network=chipnet")
