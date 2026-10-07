import { createInstance } from '@module-federation/runtime';

import { isCompatibleProtocolVersion } from '../shared/protocol';
import type { CapsEmbedError } from '../shared/types';

export const CAPS_REMOTE_NAME = 'caps';
export const CAPS_REMOTE_MODULE = `${CAPS_REMOTE_NAME}/CapsForm`;
export const CAPS_REMOTE_MANIFEST_PATH = '/mfe/mf-manifest.json';

export type CapsRemoteModule = {
  default: (...args: never[]) => unknown;
  protocolVersion?: number;
};

export const toCapsEmbedError = (error: unknown): CapsEmbedError => {
  if (error && typeof error === 'object' && 'code' in error) {
    return error as CapsEmbedError;
  }

  return {
    code: 'REMOTE_LOAD_FAILED',
    message: error instanceof Error ? error.message : String(error),
  };
};

const loaders = new Map<string, Promise<CapsRemoteModule>>();

async function load(capsUrl: string, index: number): Promise<CapsRemoteModule> {
  const instance = createInstance({
    name: `caps_host_${index}`,
    remotes: [{ name: CAPS_REMOTE_NAME, entry: `${capsUrl}${CAPS_REMOTE_MANIFEST_PATH}` }],
  });

  let module: CapsRemoteModule | null = null;

  try {
    module = await instance.loadRemote<CapsRemoteModule>(CAPS_REMOTE_MODULE);
  } catch (error) {
    throw {
      code: 'REMOTE_LOAD_FAILED',
      message: `[CAPS] Unable to load the CAPS form from ${capsUrl}: ${(error as Error)?.message ?? error}`,
    } satisfies CapsEmbedError;
  }

  if (!module) {
    throw {
      code: 'REMOTE_LOAD_FAILED',
      message: `[CAPS] ${CAPS_REMOTE_MODULE} could not be loaded from ${capsUrl}`,
    } satisfies CapsEmbedError;
  }

  if (!isCompatibleProtocolVersion(module.protocolVersion)) {
    throw {
      code: 'PROTOCOL_MISMATCH',
      message: `[CAPS] The CAPS form protocol version (${module.protocolVersion}) is not supported by this version of @clubmed/caps`,
    } satisfies CapsEmbedError;
  }

  return module;
}

export function loadCapsRemoteForm(capsUrl: string): Promise<CapsRemoteModule> {
  let promise = loaders.get(capsUrl);

  if (!promise) {
    promise = load(capsUrl, loaders.size);
    loaders.set(capsUrl, promise);
    promise.catch(() => loaders.delete(capsUrl));
  }

  return promise;
}

export const resetCapsRemoteLoaders = () => loaders.clear();
