import { createInstance } from '@module-federation/runtime';
import * as React from 'react';

import { isCompatibleProtocolVersion } from '../shared/protocol';
import type {
  CapsEmbedError,
  CapsEmbedErrorCode,
  CapsFormProps,
  CapsFormSlots,
} from '../shared/types';

export const CAPS_REMOTE_NAME = 'caps';
export const CAPS_REMOTE_MODULE = `${CAPS_REMOTE_NAME}/CapsForm`;
export const CAPS_REMOTE_MANIFEST_PATH = '/mfe/mf-manifest.json';

/**
 * Minimal React version supported for the hosts. React is not shared: the CAPS form renders with its own
 * React root through `@module-federation/bridge-react`.
 */
export const MIN_REACT_MAJOR = 18;

/**
 * Props of the federated `CapsForm` root component (`packages/mfe`).
 */
export type CapsRemoteFormProps = Omit<CapsFormProps, 'env' | 'url' | 'fallback'> & {
  capsUrl: string;
  /**
   * Host elements registered with `CapsFormSlot`: the matching regions of the form are rendered there.
   */
  slots?: CapsFormSlots;
};

/**
 * Module exposed by the remote: a bridge provider (default export) and the protocol version.
 */
export type CapsRemoteModule = {
  default: (...args: never[]) => unknown;
  protocolVersion?: number;
};

export class CapsEmbedLoadError extends Error {
  readonly code: CapsEmbedErrorCode;

  constructor(code: CapsEmbedErrorCode, message: string) {
    super(message);
    this.name = 'CapsEmbedLoadError';
    this.code = code;
  }
}

export const toCapsEmbedError = (error: unknown): CapsEmbedError => ({
  code: error instanceof CapsEmbedLoadError ? error.code : 'REMOTE_LOAD_FAILED',
  message: error instanceof Error ? error.message : String(error),
});

export const isSupportedReactVersion = (version: string = React.version) =>
  Number(version.split('.')[0]) >= MIN_REACT_MAJOR;

const loaders = new Map<string, Promise<CapsRemoteModule>>();

async function load(capsUrl: string, index: number): Promise<CapsRemoteModule> {
  if (!isSupportedReactVersion()) {
    throw new CapsEmbedLoadError(
      'REACT_VERSION_UNSUPPORTED',
      `[CAPS] React ${React.version} is not supported (requires React ${MIN_REACT_MAJOR} or later).`,
    );
  }

  // A private instance: never touches the remotes or the shared scope of a host that already uses federation.
  const instance = createInstance({
    name: `caps_host_${index}`,
    remotes: [{ name: CAPS_REMOTE_NAME, entry: `${capsUrl}${CAPS_REMOTE_MANIFEST_PATH}` }],
  });

  let module: CapsRemoteModule | null | undefined;

  try {
    module = await instance.loadRemote<CapsRemoteModule>(CAPS_REMOTE_MODULE);
  } catch (error) {
    throw new CapsEmbedLoadError(
      'REMOTE_LOAD_FAILED',
      `[CAPS] Unable to load the CAPS form from ${capsUrl}: ${(error as Error)?.message ?? error}`,
    );
  }

  if (typeof module?.default !== 'function') {
    throw new CapsEmbedLoadError(
      'REMOTE_LOAD_FAILED',
      `[CAPS] ${CAPS_REMOTE_MODULE} does not expose a bridge component`,
    );
  }

  if (!isCompatibleProtocolVersion(module.protocolVersion)) {
    throw new CapsEmbedLoadError(
      'PROTOCOL_MISMATCH',
      `[CAPS] The CAPS form protocol version (${module.protocolVersion}) is not supported by this version of @clubmed/caps`,
    );
  }

  return module;
}

/**
 * Load the federated CAPS form module, once per CAPS URL. A failed load can be retried.
 */
export function loadCapsRemoteForm(capsUrl: string): Promise<CapsRemoteModule> {
  let promise = loaders.get(capsUrl);

  if (!promise) {
    promise = load(capsUrl, loaders.size);
    loaders.set(capsUrl, promise);
    promise.catch(() => loaders.delete(capsUrl));
  }

  return promise;
}

/**
 * @internal tests only
 */
export const resetCapsRemoteLoaders = () => loaders.clear();
