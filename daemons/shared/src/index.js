// daemons/shared/src/index.js
//
// Public surface of @hushyourmoney/daemon-shared.

export {
  ConfigError,
  COMMON_DEFAULTS,
  loadCommonConfig,
  parseBigInt,
  parseBoolean,
  parseInteger,
  parseList,
  redactConfig,
} from './config.js'

export { Metrics, labelKey } from './metrics.js'

export {
  NIP44_MODE,
  NIP44_MODES,
  NIP44_SALT,
  NIP44_VERSION,
  calcPaddedLen,
  decrypt,
  decryptWithConversationKey,
  encrypt,
  encryptWithConversationKey,
  getConversationKey,
  getMessageKeys,
} from './nostr/nip44.js'

export {
  createEvent,
  getEventHash,
  serializeEvent,
  signEvent,
  verifyEvent,
} from './nostr/event.js'

export {
  GIFT_WRAP_KIND,
  NIP59_CLOCK_SKEW_SECONDS,
  NIP59_MAX_BACKDATE_SECONDS,
  SEAL_KIND,
  createRumor,
  giftWrap,
  randomPastTimestamp,
  sealRumor,
  unwrapGift,
  wrapRumor,
} from './nostr/nip59.js'

export { RELAY_STATES, Relay } from './nostr/relay.js'
export { RelayPool } from './nostr/relay-pool.js'

export const SHARED_VERSION = '0.1.0'
