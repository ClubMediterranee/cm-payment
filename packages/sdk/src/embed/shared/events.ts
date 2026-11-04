import type { CapsEmbedError } from './types';

export const loadEvent = { action: '', name: 'load' } as const;

export const loadEndEvent = { action: '', name: 'load_end' } as const;

export const submitEvent = (data: { provider_id: string; amount: number; currency: string }) =>
  ({ action: 'click', name: 'submit', data }) as const;

export const redirectEvent = (url: string) =>
  ({ action: '', name: 'redirect', data: { url } }) as const;

export const errorEvent = (error: CapsEmbedError) =>
  ({ action: '', name: 'error', data: error }) as const;

export type CapsEvent =
  | typeof loadEvent
  | typeof loadEndEvent
  | ReturnType<typeof submitEvent>
  | ReturnType<typeof redirectEvent>
  | ReturnType<typeof errorEvent>;
