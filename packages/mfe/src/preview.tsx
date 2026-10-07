/**
 * Standalone preview of the remote (not part of the federated bundle).
 * Example: /?issuer=GM&type=booking&id=123&callback_url=https://localhost/cb&caps_url=https://localhost:8083
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import RemoteCapsForm, { type CapsRemoteFormProps } from './RemoteCapsForm';

const params = new URLSearchParams(window.location.search);

const props = {
  capsUrl: params.get('caps_url') || window.location.origin,
  issuerType: (params.get('issuer') || 'GM').toUpperCase(),
  type: params.get('type') || 'booking',
  id: params.get('id') || '',
  customerId: params.get('customer_id') || undefined,
  locale: params.get('locale') || undefined,
  accessToken: params.get('access_token') || undefined,
  callbackUrl: params.get('callback_url') || window.location.href,
  onError: (error) => console.error('[CAPS preview]', error),
  onRedirect: (url) => console.info('[CAPS preview] redirect', url),
} as CapsRemoteFormProps;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RemoteCapsForm {...props} />
  </StrictMode>,
);
