import { getCapsConfig } from '@clubmed/payment-sdk/providers/CapsConfigProvider';

export function getRedirectPaymentCallbackUrl(paymentId: string, providerId: string): string {
  const {
    url,
    oidc: { issuerType },
    type,
    id,
  } = getCapsConfig();

  const redirectUrl = new URL(url);
  redirectUrl.pathname = `${issuerType.toLocaleLowerCase()}/redirect/${paymentId}`;

  if (providerId) {
    redirectUrl.searchParams.append('provider_id', providerId);
  }
  if (type === 'proposal') {
    redirectUrl.searchParams.append('proposal_id', id);
  }
  return redirectUrl.toString();
}
