/* web/stores/p2pfusion/txbuild.ts
   Minimal BCH transaction builder for fusion rounds: serialization,
   BIP143 (forkid) sighash, P2PKH scripts, Schnorr (64-byte) signatures.
   No external BCH libs — byte-level implementation with noble hashes.

   Sighash type used: 0x41 (SIGHASH_ALL | SIGHASH_FORKID) — BCH standard. */

import { secp256k1, schnorr } from '@noble/curves/secp256k1.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { ripemd160 } from '@noble/hashes/legacy.js'
import { concatBytes, hexToBytes, bytesToHex } from './identity.ts'

export interface TxInput {
    /** 32-byte txid, big-endian hex (as shown in explorers). */
    txid: string
    vout: number
    scriptSig: Uint8Array
    sequence: number
}

export interface TxOutput {
    value: number
    script: Uint8Array
}

export interface Tx {
    version: number
    inputs: TxInput[]
    outputs: TxOutput[]
    locktime: number
}

const SIGHASH_ALL_FORKID = 0x41

/* ── byte helpers ─────────────────────────────────────────────── */

function u32le(n: number): Uint8Array {
    const b = new Uint8Array(4)
    b[0] = n & 0xff; b[1] = (n >>> 8) & 0xff; b[2] = (n >>> 16) & 0xff; b[3] = (n >>> 24) & 0xff
    return b
}

function u64le(n: number): Uint8Array {
    // JS numbers are safe up to 2^53 satoshis — far beyond any realistic value
    const b = new Uint8Array(8)
    let v = BigInt(n)
    for (let i = 0; i < 8; i++) { b[i] = Number(v & 0xffn); v >>= 8n }
    return b
}

export function varint(n: number): Uint8Array {
    if (n < 0xfd) return new Uint8Array([n])
    if (n <= 0xffff) return new Uint8Array([0xfd, n & 0xff, (n >>> 8) & 0xff])
    if (n <= 0xffffffff) return concatBytes(new Uint8Array([0xfe]), u32le(n))
    throw new Error('varint: value too large')
}

function pushData(data: Uint8Array): Uint8Array {
    if (data.length < 0x4c) return concatBytes(new Uint8Array([data.length]), data)
    if (data.length <= 0xff) return concatBytes(new Uint8Array([0x4c, data.length]), data)
    if (data.length <= 0xffff) return concatBytes(new Uint8Array([0x4d, data.length & 0xff, (data.length >>> 8) & 0xff]), data)
    throw new Error('pushData: item too large')
}

export function doubleSha256(data: Uint8Array): Uint8Array {
    return sha256(sha256(data))
}

export function hash160(data: Uint8Array): Uint8Array {
    return ripemd160(sha256(data))
}

/* ── scripts ──────────────────────────────────────────────────── */

/** P2PKH locking script: OP_DUP OP_HASH160 <20> OP_EQUALVERIFY OP_CHECKSIG */
export function p2pkhScript(pubkeyHash: Uint8Array): Uint8Array {
    if (pubkeyHash.length !== 20) throw new Error('p2pkhScript: need 20-byte hash160')
    return concatBytes(new Uint8Array([0x76, 0xa9, 0x14]), pubkeyHash, new Uint8Array([0x88, 0xac]))
}

/** P2PKH unlocking script for a BCH Schnorr signature (64-byte sig + 0x41). */
export function p2pkhScriptSig(sig64: Uint8Array, pubkey33: Uint8Array): Uint8Array {
    if (sig64.length !== 64) throw new Error('p2pkhScriptSig: schnorr sig must be 64 bytes')
    if (pubkey33.length !== 33) throw new Error('p2pkhScriptSig: pubkey must be 33 bytes')
    const sigWithType = concatBytes(sig64, new Uint8Array([SIGHASH_ALL_FORKID]))
    return concatBytes(pushData(sigWithType), pushData(pubkey33))
}

/* ── serialization ────────────────────────────────────────────── */

export function serializeTx(tx: Tx): Uint8Array {
    const parts: Uint8Array[] = [u32le(tx.version), varint(tx.inputs.length)]
    for (const inp of tx.inputs) {
        parts.push(hexToBytes(inp.txid).reverse()) // wire format is little-endian txid
        parts.push(u32le(inp.vout))
        parts.push(varint(inp.scriptSig.length), inp.scriptSig)
        parts.push(u32le(inp.sequence))
    }
    parts.push(varint(tx.outputs.length))
    for (const out of tx.outputs) {
        parts.push(u64le(out.value), varint(out.script.length), out.script)
    }
    parts.push(u32le(tx.locktime))
    return concatBytes(...parts)
}

export function txidOf(tx: Tx): string {
    return bytesToHex(doubleSha256(serializeTx(tx)).reverse())
}

/* ── BIP143 sighash (BCH, SIGHASH_ALL|FORKID) ─────────────────── */

export interface PrevOut {
    value: number
    /** scriptCode: the output script being spent (P2PKH locking script). */
    scriptCode: Uint8Array
}

export function bip143Sighash(tx: Tx, inputIndex: number, prevouts: PrevOut[]): Uint8Array {
    if (tx.inputs.length !== prevouts.length) throw new Error('bip143: prevouts length mismatch')
    const hashPrevouts = doubleSha256(concatBytes(...tx.inputs.map(i => concatBytes(hexToBytes(i.txid).reverse(), u32le(i.vout)))))
    const hashSequence = doubleSha256(concatBytes(...tx.inputs.map(i => u32le(i.sequence))))
    const hashOutputs = doubleSha256(concatBytes(...tx.outputs.map(o => concatBytes(u64le(o.value), varint(o.script.length), o.script))))
    const inp = tx.inputs[inputIndex]
    const prev = prevouts[inputIndex]
    const preimage = concatBytes(
        u32le(tx.version),
        hashPrevouts,
        hashSequence,
        hexToBytes(inp.txid).reverse(),
        u32le(inp.vout),
        varint(prev.scriptCode.length),
        prev.scriptCode,
        u64le(prev.value),
        u32le(inp.sequence),
        hashOutputs,
        u32le(tx.locktime),
        u32le(SIGHASH_ALL_FORKID),
    )
    return doubleSha256(preimage)
}

/** Sign one of our P2PKH inputs with Schnorr and return the scriptSig. */
export function signP2pkhInput(tx: Tx, inputIndex: number, prevouts: PrevOut[], privHex: string): Uint8Array {
    const pubkey = secp256k1.getPublicKey(hexToBytes(privHex), true) // 33-byte compressed (schnorr.getPublicKey returns x-only)
    const sighash = bip143Sighash(tx, inputIndex, prevouts)
    const sig = schnorr.sign(sighash, hexToBytes(privHex))
    // sanity: our own signature must verify against the sighash
    if (!schnorr.verify(sig, sighash, pubkey.subarray(1))) throw new Error('txbuild: self-signature failed to verify')
    return p2pkhScriptSig(sig, pubkey)
}

/* ── value accounting helpers used by the round ───────────────── */

export function sumValues(items: { value: number }[]): number {
    return items.reduce((s, x) => s + x.value, 0)
}

/** Conservative P2PKH size estimate (bytes) for fee caps. */
export function estimateTxSize(nInputs: number, nOutputs: number): number {
    return 10 + nInputs * 148 + nOutputs * 34
}

/** Per-peer fee share (sat), parity with upstream's formula [cited · fusion.ts L591]. */
export function peerFeeShare(nInputs: number, nOutputs: number, peers: number): number {
    return nInputs * 148 + nOutputs * 34 + Math.ceil(10 / Math.max(1, peers))
}
