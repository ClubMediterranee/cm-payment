import type { ComponentType } from 'react';

import type { PspProviders } from '../../types/PspProviders.js';

export type PspProviderKind = 'form' | 'button';

export type DefinePspProviderOpts = {
  /**
   * Id of the payment provider, as returned by the payment providers API.
   */
  id: PspProviders;
  /**
   * `form`: rendered by the payment widget (default). `button`: replaces the submit button.
   */
  kind?: PspProviderKind;
  component: ComponentType;
};

const container = new Map<string, DefinePspProviderOpts>();

const getKey = (id: string, kind: PspProviderKind) => `${kind}:${id}`;

/**
 * Declare the UI of a payment provider and register it.
 */
export function definePspProvider(opts: DefinePspProviderOpts): DefinePspProviderOpts {
  container.set(getKey(opts.id, opts.kind ?? 'form'), opts);
  return opts;
}

export function getPspComponent(
  id: PspProviders | string | undefined,
  kind: PspProviderKind = 'form',
): ComponentType | undefined {
  return id ? container.get(getKey(id, kind))?.component : undefined;
}
