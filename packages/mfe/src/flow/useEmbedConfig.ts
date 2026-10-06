import type { CapsFlowType, CapsIssuerType } from '@clubmed/caps';
import { useEffect, useState } from 'react';

export type EmbedConfig = {
  apiUrl: string;
  apiKey: string;
  allowedOrigins: string[];
  protocolVersion: number;
};

export type EmbedConfigState =
  | { status: 'loading' }
  | { status: 'success'; config: EmbedConfig }
  | { status: 'error'; error: Error };

export async function fetchEmbedConfig(
  capsUrl: string,
  issuerType: CapsIssuerType,
  type: CapsFlowType,
  init?: RequestInit,
): Promise<EmbedConfig> {
  const url = new URL(`${capsUrl}/rest/embed/config`);
  url.searchParams.set('issuer', issuerType);
  url.searchParams.set('type', type);

  const response = await fetch(url, { ...init, headers: { accept: 'application/json' } });

  if (!response.ok) {
    throw new Error(`[CAPS] Unable to load the embed configuration (HTTP ${response.status})`);
  }

  return response.json();
}

/**
 * Runtime configuration of the flow (API key per issuer / flow type), served by the CAPS server.
 */
export function useEmbedConfig(
  capsUrl: string,
  issuerType: CapsIssuerType,
  type: CapsFlowType,
): EmbedConfigState {
  const [state, setState] = useState<EmbedConfigState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    setState({ status: 'loading' });

    fetchEmbedConfig(capsUrl, issuerType, type, { signal: controller.signal })
      .then((config) => setState({ status: 'success', config }))
      .catch((error: Error) => {
        if (!controller.signal.aborted) {
          setState({ status: 'error', error });
        }
      });

    return () => controller.abort();
  }, [capsUrl, issuerType, type]);

  return state;
}
