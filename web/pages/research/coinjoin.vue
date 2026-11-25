<!-- web/pages/research/coinjoin.vue — topic 04 (the technique + the CoinJoin specification) -->

<script setup lang="ts">
/* Shared shell + styles come from layouts/research.vue (user refactor 2026-11-13).
   ../../pages/spec.vue was retired into this page on 2026-11-24: the protocol
   specification is the CoinJoin topic's deep dive, so it lives with the topic. */
definePageMeta({
    layout: 'research',
})

/* OpenGraph + Twitter + canonical (shared composable; per-page poster). */
useOg({
    title: `CoinJoin on Bitcoin Cash — Hush Your Money`,
    description: `CoinJoin: collaborative transactions that break the input-to-output link. The base privacy technique, plus the full CashShuffle wire specification.`,
    path: '/research/coinjoin',
    image: '/posters/research-coinjoin.jpg',
    type: 'article',
    imageAlt: `CoinJoin on Bitcoin Cash — collaborative transactions, live today through CashFusion`,
})

/* Scroll-reveal (shared composable). */
useReveal()
</script>

<template>

    <!-- ── Topic hero ── -->
        <section class="relative z-10 mx-auto flex min-h-[72vh] w-full max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-14 text-center">

            <NuxtLink to="/research" class="crumb animate-rise" style="animation-delay: 0.04s">
                research <span class="sep">/</span> coinjoin
            </NuxtLink>

            <p class="animate-rise mt-6 font-mono text-[0.8rem] uppercase tracking-[0.5em] text-violet-200 sm:text-xs" style="animation-delay: 0.1s">
                topic 04 · the technique
            </p>

            <h1 class="animate-rise mt-6 font-display text-[clamp(2.4rem,8vw,6rem)] font-extrabold leading-[1.04] tracking-tight text-white" style="animation-delay: 0.2s">
                <span class="text-gradient">CoinJoin</span>
            </h1>

            <p class="animate-rise mt-6 font-mono text-[clamp(1rem,2.8vw,1.5rem)] italic text-cyan-100" style="animation-delay: 0.32s">
                Privacy by ambiguity — many parties, one transaction, no map.
            </p>

            <p class="animate-rise mt-8 max-w-2xl text-base leading-relaxed text-slate-100 sm:text-lg" style="animation-delay: 0.42s">
                A CoinJoin is a <strong class="font-semibold text-white">collaborative transaction</strong>:
                several parties combine their inputs and outputs into one transaction so that
                outside observers cannot determine which input funded which output.
            </p>

            <div class="animate-rise mt-8 flex flex-wrap items-center justify-center gap-3" style="animation-delay: 0.5s">
                <span class="status-chip status-violet">the technique</span>
                <span class="status-chip status-lime">on BCH today</span>
                <span class="status-chip status-cyan">wire specification</span>
            </div>
        </section>

        <!-- ── Content ── -->
        <section class="relative z-10 mx-auto w-full max-w-4xl px-6 pb-28 sm:pb-36">
            <div class="reveal space-y-6 text-base leading-relaxed text-slate-100 sm:text-lg">
                <p>
                    The idea is deliberately simple: if many strangers build one transaction
                    together, the set of possible sender→receiver mappings explodes. An observer
                    sees <em>N</em> inputs and <em>N</em> outputs of similar size — and no honest way
                    to pair them. The link between sender and receiver is broken by
                    <strong class="font-semibold text-white">ambiguity, not by cryptography</strong>.
                </p>
                <p>
                    On Bitcoin Cash, this technique is <strong class="font-semibold text-white">live today</strong>
                    through CashFusion — an implementation with a real adoption history and an
                    active red-team discussion. See the dedicated page for the survey.
                </p>
            </div>

            <div class="reveal mt-12 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-sm leading-relaxed text-slate-200 sm:text-base">
                <strong class="text-white">Where it ends:</strong> CoinJoin obscures the input-to-output
                mapping, but amounts remain visible on-chain, and privacy rests on
                heuristic resistance. The shielded pool goes further: amounts,
                owners and history are hidden inside zero-knowledge proofs. The two
                approaches compose — CoinJoin for transparent BCH, the pool for shielded balances.
                <p class="mt-4">
                    <span class="font-mono text-xs text-slate-300">[cited · third-party]</span> — the
                    coordination model is its own design axis: a central coordinator, a blind-signing
                    coordinator, or no coordinator at all. An early-stage experiment announced on
                    the research forum (topic 1773) coordinates rounds peer-to-peer over Nostr with
                    onion-wrapped outputs — pre-mainnet, cited as a data point. We are building and
                    measuring that coordination model in our own P2P fusion research.
                    <a href="https://github.com/00-Protocol/BCH-Stealth-Protocol" target="_blank" rel="noopener" class="src-link ml-2">P2P fusion over Nostr (third-party) ↗</a>
                    <NuxtLink to="/research/cashfusion#coordinator-limit" class="src-link ml-2">our measured P2P fusion research →</NuxtLink>
                </p>
                <div class="mt-3 flex flex-wrap gap-3 font-mono text-[0.8rem]">
                    <NuxtLink to="/research/cashfusion" class="src-link">CashFusion — the BCH implementation →</NuxtLink>
                    <NuxtLink to="/research/shielded-pool" class="src-link">the zero-knowledge layer →</NuxtLink>
                </div>
            </div>
        </section>

        <!-- ── The specification (retired ../../pages/spec.vue, content unchanged) ── -->
        <section class="relative z-10 mx-auto w-full max-w-4xl px-6 pb-28">
            <div class="reveal flex flex-col gap-6">

                <p class="font-mono text-[0.8rem] uppercase tracking-[0.5em] text-violet-200 sm:text-xs">
                    the specification
                </p>

                <h2 class="font-display text-3xl font-bold text-white sm:text-4xl">
                    CoinJoin Specification
                </h2>

                <h4 class="text-xl text-rose-300 font-light italic">
                    TL;DR — the protocol automagically manages the <span class="text-2xl font-medium">"toxic waste"</span> produced by your CoinJoin transaction;
                    using a <span class="text-2xl font-medium">"TOR-free"</span> variation of the <NuxtLink to="https://cashfusion.org" target="_blank" class="text-2xl font-medium text-cyan-300 hover:underline">CashFusion</NuxtLink> protocol running on the <NuxtLink to="https://runonflux.io" target="_blank" class="text-2xl font-medium text-cyan-300 hover:underline">Flux Cloud</NuxtLink> network.
                </h4>

                <div class="flex flex-col gap-4">
                    <h2 class="font-display text-2xl font-bold text-white sm:text-3xl">
                        Communication
                    </h2>

                    <ul class="pl-10 list-disc leading-8 text-slate-300">
                        <li>The server should support TLSv1.2 between the client and server.</li>
                        <li>
                            The server should only accept messages on the wire with the following structure:
                            <ol class="pl-10 list-decimal text-slate-300">
                                <li>Magic prefix `0x42bcc32669467873`.</li>
                                <li>4-bytes specifying the length of the message in bytes in big endian order.</li>
                                <li>The protobuf payload.</li>
                            </ol>
                        </li>
                    </ul>
                </div>

                <div class="flex flex-col gap-4">
                    <h2 class="font-display text-2xl font-bold text-white sm:text-3xl">
                        Shuffle Transaction
                    </h2>

                    <p class="text-slate-300">
                        In order to avoid client identification and ensure compatibility:
                    </p>

                    <ul class="pl-10 list-disc leading-8 text-slate-300">
                        <li>Transactions should use only ECDSA signing.</li>
                        <li>Transactions should use `nLockTime = 0`.</li>
                        <li>Transactions should use `nVersion = 1`.</li>
                        <li>Each input should use `nSequence = 0xfffffffe`.</li>
                    </ul>
                </div>

<pre class="p-5 rounded-2xl border border-white/10 bg-white/[0.03] font-mono text-sm text-lime-200 overflow-x-auto leading-7">

## Protobuf payload

- The client and server should communicate according to the [protobuf specification](https://github.com/Electron-Cash/Electron-Cash/blob/master/plugins/shuffle_deprecated/protobuf/message.proto) for messages.
- The server should only receive messages of the `Packets` type.

Example payload content for client registering with the server:

```
Packets: [
    Signed{
    packet: Packet{
        registration: Registration{
        amount:  bch_in_sats
        version: latest_version
        type:    shuffle_type
        }
    }
    }
]
```

Example payload serialized bytes:

```
Work in Progress
```

## Flow

[Flowchart (work in progress)](/images/single-player-flowchart.svg)

### Entering a Shuffle

After the SSL connection is established, the client should send the server a message containing only the `verification key` of the player and the desired amount to shuffle in satoshis, the type of shuffle and the protocol version. This message should be unsigned.

```
Packets: [
    Signed{
    packet: Packet{
        from_key: VerificationKey{
        key: verification_key
        }
        registration: Registration{
        amount:  bch_in_sats
        version: latest_version
        type:    shuffle_type
        }
    }
    }
]
```

If all is well with the verification key, the server should send back an simple message with a session value and the player's number in the pool.

```
Packets: [
    Signed{
    packet: Packet{
        session: some_UUID
        number:  number_in_pool
    }
    }
]
```

If something goes wrong with the handshake, the server should send a blame message and close the connection.

```
Packets: [
    Signed{
    packet: Packet{
        message: Message{
        blame: Blame{
            reason: blame_reason_enum
        }
        }
    }
    }
]
```

### Forming the pool

The server forms pools of a fixed size `N`. Every player who successfully registers should be added to the current pool and receive a confirmation as above. As long as the pool is not yet full, the server should also broadcast a simple message with the new player's number to all players in the pool, including the new player.

```
Packets: [
    Signed{
    packet: Packet{
        number: new_player_number_in_pool
    }
    }
]
```

After the pool reaches its limit (`N`), instead of the new player broadcast, the server should broadcast that the pool has entered Phase 1 (Announcement) to all pool participants.

```
Packets: [
    Signed{
    packet: Packet{
        phase: ANNOUNCEMENT
        number: pool_size_N
    }
    }
]
```

### Player messaging

After the client is registered as a player (it has a session UUID and number in the pool)
it switches to game mode and can send/receive messages. There are two types of messages `broadcast` and
`unicast`. `broadcast` messages are for everyone in the pool and `unicast` messages are only from one player to another.

Every time the server accepts a message from the client it should check if it has:

- A valid session UUID.
- A valid verification key.
- A valid player number.
- A valid `from_key` field.
- A valid or null `to_key` field where `to_key` must be in the same pool.

If the message has a null value for `to_key` field, it means that it should be broadcast to every pool member
If the message does not have a null value for `to_key` it should be unicast to the specified player.

### Blame messages

In the blame phase, players can exclude unreliable players from the pool.
If server got `N-1` messages from players to exclude a player with verification key `accused_key` then the player with this verification key should be excluded. The message should be in the following form:

```
packet {
    packet {
    session: "session"
    from_key {
        key: "from_key"
    }
    phase: BLAME
    message {
        blame {
        reason: LIAR
        accused {
            key: "excluded_key"
        }
        }
    }
    }
}
Packets: [
    Signed{
    packet: Packet{
        session: session_id
        from_key: VerificationKey{
        key: verification_key
        }
        phase: BLAME
        message {
        blame Blame{
            reason: LIAR
            accused VerificationKey{
            key: accused_key
            }
        }
        }
    }
    }
]
```

### Losing the connection

If one of the players closes their connection during a round of shuffling then the shuffle is terminated and a new shuffle should be initiated by reconnecting to the server.

### Exiting from the Shuffle

If everything goes well, all the clients will disconnect when shuffling is complete.

## Definitions / Glossary

- CoinJoin: A method by which transactions for a Bitcoin-based blockchain can be built to better protect the privacy of the parties involved. CoinJoin builds a transaction so that it uses identical `input` amounts thus normalizing the uniquely identifiable characteristic which `privacy attackers` rely upon to track the owner's of a particular `coin` over time.
- CoinShuffle: A privacy protocol for Bitcoin based blockchains that attempts to achieve the benefits of the `CoinJoin` protocol in a decentralized way that does not rely on a trusted middle man.
- CashShuffle: A companion to the `CoinShuffle` protocol. CashShuffle adds a low-trust infrastructure layer that allows for the discovery of `CashShuffle` participants as well as facilitating anonymous communication between them as they execute the `CashShuffle` protocol to create trustless `CoinJoin` transactions.


- Blame: This may describe either the `Phase` immediately following a failed `CashShuffle` `Round` or the specific `Protocol Message` that is sent by a `Player` to signal a failed `Round`. The `Blame` `Protocol Message` takes a specific form. See the `Server Message` docs for more info.
- Client: Any device or application that connects to a `CashShuffle` server with the intention and capability of carrying out the steps in the `CashShuffle` protocol. Clients manage most of the shuffling complexity thus minimizing the influence and involvement of the `Server`.
- Coin: Frequently used as shorthand for an `Output` in a Bitcoin transaction.
- Connection: The underlying network socket between `Client` and `Server` used to exchange `Protocol Messages`. Note, `Connections` have a 1:1 relationship with a `Player`.
- Equivocation:
- Packet: A specific data type used in the formation of a `Protocol Message`. See the communication spec for syntax.
- Phase: Describes each of the stages within a `CashShuffle` `Round`. For complete descriptions see the "flow specification"
- Player: The unique representation of a `Client` within a `Pool`. A `Client` may participate simultaneously in multiple `Pools`. It may be helpful to think of a `Player` as being linked to its ephemeral keypair ( `Verification Key` and `Signing Key` ) because all three die at the end of a `Round`, regardless of its outcome.
- Pool: A group of `Players` within the `Server` that participate in a `Round`. `Players` are grouped based on the value of the `Coin` they intend to shuffle and the type of shuffle they intend to perform. While `Clients` may have multiple `Players` in different `Pools`, no client should be allowed in the same `Pool` instance as it would reduce the effectiveness of the `CashShuffle` protocol.
- Protocol Message: A standardized message sent by either the `Server` or a `Player` in a shuffle `Round` containing data relevant to the state of a shuffle `Round`. Protocol messages must adhere to the `Protobuf` communcation spec outlined in this document.
- Round: An abstraction describing the sequence of events that take place in a single attempt by a `Pool` of `Players` to shuffle their coins in adherence to the `CashShuffle` protocol.
- Server: An intentionally minimal server whose primary duties are to put `Clients` into `Pools` and act as a blind ( minimal logs ) and dumb ( minimal complexity ) relay of `Protocol Message` during shuffles.
- Signing Key: The private key portion of the ephemeral keypair created to be used exclusively for signing and verifying protocol messages for a particular `CashShuffle` `Round`. The `Verification Key` and its corresponding `Signing Key` are both intended for one time use.
- Verification Key: The public key portion of the ephemeral keypair created to be used exclusively for signing and verifying protocol messages for a particular `CashShuffle` `Round`. The `Verification Key` and its corresponding `Signing Key` are both intended for one time use.

</pre>

                <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-slate-300">
                    ONLY the Club Manager will receive BOTH:

                    <ol>
                        <li>List of Commitments</li>
                        <li>List of (blinded) Components</li>
                    </ol>
                </div>

                <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-slate-300">
                    EARLY Guest will have an advantage for:

                    <ol>
                        <li>Greater (component) anonymity against the Club Manager</li>
                    </ol>
                </div>
            </div>
        </section>

        <!-- ── Pager ── -->
        <section class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24">
            <div class="pager reveal">
                <NuxtLink to="/research/shielded-addresses" class="pager-link">
                    <span class="pager-dir">← previous</span>
                    <span class="pager-title">Shielded Addresses</span>
                </NuxtLink>
                <NuxtLink to="/ceremony" class="pager-link right">
                    <span class="pager-dir">next topic →</span>
                    <span class="pager-title">BN254</span>
                </NuxtLink>
            </div>
        </section>

</template>
