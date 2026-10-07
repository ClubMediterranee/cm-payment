/**
 * Version of the contract between `@clubmed/caps/webcomponent` and the CAPS form remote.
 * Bump it on breaking changes only.
 */
export const CAPS_PROTOCOL_VERSION = 1;

/**
 * Only the major version is compared: the wrapper refuses a remote with a different protocol version.
 */
export const isCompatibleProtocolVersion = (version: unknown) =>
  typeof version === 'number' && Math.floor(version) === Math.floor(CAPS_PROTOCOL_VERSION);
