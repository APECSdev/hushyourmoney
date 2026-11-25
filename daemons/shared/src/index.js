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

export const SHARED_VERSION = '0.1.0'
