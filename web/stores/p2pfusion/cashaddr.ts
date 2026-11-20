/* web/stores/p2pfusion/cashaddr.ts
   Minimal CashAddr encode/decode (P2PKH + P2SH, 20-byte hashes).
   Spec: https://github.com/bitcoincashorg/bitcoincash.org/blob/master/spec/cashaddr.md
   Used by the toolbox for address display and by gate harnesses for scripthashes. */

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
const GENERATOR = [0x98f2bc8e61n, 0x79b76d99e2n, 0xf33e5fb3c4n, 0xae2eabe2a8n, 0x1e4f43e470n]

function polymod(values: number[]): bigint {
    let c = 1n
    for (const d of values) {
        const c0 = c >> 35n
        c = ((c & 0x07ffffffffn) << 5n) ^ BigInt(d)
        for (let i = 0; i < 5; i++) {
            if ((c0 >> BigInt(i)) & 1n) c ^= GENERATOR[i]
        }
    }
    return c ^ 1n
}

function prefixToValues(prefix: string): number[] {
    return [...prefix].map(ch => ch.charCodeAt(0) & 0x1f)
}

function convertBits(data: number[], from: number, to: number, pad: boolean): number[] {
    let acc = 0
    let bits = 0
    const out: number[] = []
    const maxv = (1 << to) - 1
    for (const value of data) {
        acc = (acc << from) | value
        bits += from
        while (bits >= to) {
            bits -= to
            out.push((acc >> bits) & maxv)
        }
    }
    if (pad) {
        if (bits > 0) out.push((acc << (to - bits)) & maxv)
    } else if (bits >= from || ((acc << (to - bits)) & maxv)) {
        throw new Error('cashaddr: invalid padding')
    }
    return out
}

export type AddressType = 'p2pkh' | 'p2sh' | 'token-p2pkh' | 'token-p2sh'

export interface DecodedAddress {
    prefix: string
    type: AddressType
    hash: Uint8Array
}

const TYPE_BITS: Record<AddressType, number> = {
    'p2pkh': 0,
    'p2sh': 1,
    'token-p2pkh': 2,
    'token-p2sh': 3,
}

export function decodeCashAddress(address: string): DecodedAddress {
    const idx = address.lastIndexOf(':')
    if (idx < 0) throw new Error('cashaddr: missing prefix')
    const prefix = address.slice(0, idx).toLowerCase()
    const payload = address.slice(idx + 1).toLowerCase()
    const values: number[] = []
    for (const ch of payload) {
        const v = CHARSET.indexOf(ch)
        if (v < 0) throw new Error('cashaddr: invalid character')
        values.push(v)
    }
    if (values.length < 8) throw new Error('cashaddr: payload too short')
    if (polymod([...prefixToValues(prefix), 0, ...values]) !== 0n) throw new Error('cashaddr: bad checksum')
    const data = values.slice(0, -8)
    if (data.length === 0) throw new Error('cashaddr: empty data')
    // spec: convert the 8-bit version byte TOGETHER with the hash into 5-bit groups
    const bytes = convertBits(data, 5, 8, false)
    if (bytes.length < 2) throw new Error('cashaddr: payload too short')
    const version = bytes[0]
    const typeBits = (version & 0x78) >> 3
    const sizeBits = version & 0x07
    const hashBits = [160, 192, 224, 256, 320, 384, 448, 512][sizeBits]
    if (hashBits === undefined) throw new Error('cashaddr: bad size')
    const hash = Uint8Array.from(bytes.slice(1))
    if (hash.length * 8 !== hashBits) throw new Error('cashaddr: hash length mismatch')
    const byBits: AddressType[] = ['p2pkh', 'p2sh', 'token-p2pkh', 'token-p2sh']
    if (typeBits < byBits.length) return { prefix, type: byBits[typeBits], hash }
    throw new Error('cashaddr: unsupported type ' + typeBits)
}

export function encodeCashAddress(prefix: string, type: AddressType, hash: Uint8Array): string {
    const typeBits = TYPE_BITS[type]
    if (typeBits === undefined) throw new Error('cashaddr: unknown type ' + type)
    const sizeBits = [20, 24, 28, 32, 40, 48, 56, 64].indexOf(hash.length)
    if (sizeBits < 0) throw new Error('cashaddr: unsupported hash length')
    const version = (typeBits << 3) | sizeBits
    const data = convertBits([version, ...hash], 8, 5, true)
    const checksum = polymod([...prefixToValues(prefix), 0, ...data, 0, 0, 0, 0, 0, 0, 0, 0])
    const mod = []
    for (let i = 0; i < 8; i++) mod.push(Number((checksum >> BigInt(5 * (7 - i))) & 0x1fn))
    return prefix + ':' + [...data, ...mod].map(v => CHARSET[v]).join('')
}
