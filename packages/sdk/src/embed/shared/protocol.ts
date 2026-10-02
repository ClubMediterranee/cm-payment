import type { CapsEmbedError } from './types';

/**
 * Version of the contract between the wrappers and the CAPS flow (remote or embedded app).
 * Bump it on breaking changes only.
 */
export const CAPS_PROTOCOL_VERSION = 1;

export const CAPS_MESSAGE_SOURCE = 'caps';

export const CapsMessageType = {
  READY: 'CAPS_READY',
  INIT: 'CAPS_INIT',
  RESIZE: 'CAPS_RESIZE',
  LOADING: 'CAPS_LOADING',
  ERROR: 'CAPS_ERROR',
  PAYMENT_REDIRECT: 'CAPS_PAYMENT_REDIRECT',
  PAYMENT_REDIRECT_LOADING: 'CAPS_PAYMENT_REDIRECT_LOADING',
  PAYMENT_REDIRECT_CANCEL: 'CAPS_PAYMENT_REDIRECT_CANCEL',
} as const;

export type CapsMessageType = (typeof CapsMessageType)[keyof typeof CapsMessageType];

export type CapsRedirectPayload = {
  url: string;
  /**
   * `POST` redirects are submitted as a form with `fields`.
   */
  method?: 'GET' | 'POST';
  fields?: Record<string, string>;
};

export type CapsMessagePayloads = {
  [CapsMessageType.READY]: Record<string, never>;
  [CapsMessageType.INIT]: { accessToken?: string; content?: Record<string, unknown> };
  [CapsMessageType.RESIZE]: { height: number };
  [CapsMessageType.LOADING]: { loading: boolean };
  [CapsMessageType.ERROR]: CapsEmbedError;
  [CapsMessageType.PAYMENT_REDIRECT]: CapsRedirectPayload;
  [CapsMessageType.PAYMENT_REDIRECT_LOADING]: Record<string, never>;
  [CapsMessageType.PAYMENT_REDIRECT_CANCEL]: Record<string, never>;
};

export type CapsMessageOf<T extends CapsMessageType> = CapsMessagePayloads[T] & {
  type: T;
  source: typeof CAPS_MESSAGE_SOURCE;
  version: number;
};

export type CapsMessage = { [T in CapsMessageType]: CapsMessageOf<T> }[CapsMessageType];

const MESSAGE_TYPES = new Set<string>(Object.values(CapsMessageType));

export function createCapsMessage<T extends CapsMessageType>(
  type: T,
  ...[payload]: CapsMessagePayloads[T] extends Record<string, never>
    ? [payload?: CapsMessagePayloads[T]]
    : [payload: CapsMessagePayloads[T]]
): CapsMessageOf<T> {
  return {
    ...(payload as CapsMessagePayloads[T]),
    type,
    source: CAPS_MESSAGE_SOURCE,
    version: CAPS_PROTOCOL_VERSION,
  } as CapsMessageOf<T>;
}

/**
 * Type guard for messages emitted by CAPS. Foreign messages (other sources, unknown types) are rejected.
 */
export function isCapsMessage(data: unknown): data is CapsMessage {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const { source, type, version } = data as Record<string, unknown>;

  return (
    source === CAPS_MESSAGE_SOURCE &&
    typeof version === 'number' &&
    MESSAGE_TYPES.has(type as string)
  );
}

/**
 * Only the major version is compared: wrappers refuse a flow with a different protocol version.
 */
export const isCompatibleProtocolVersion = (version: unknown) =>
  typeof version === 'number' && Math.floor(version) === Math.floor(CAPS_PROTOCOL_VERSION);
