import { getCapsConfig } from '@clubmed/payment-sdk/providers/CapsConfigProvider';

export function getRedirectPaymentCallbackUrl(paymentId: string, providerId: string): string {
  const {
    paymentGatewayUrl,
    oidc: { issuerType },
    type,
    id,
    callbackUrl,
  } = getCapsConfig();

  const redirectUrl = new URL(paymentGatewayUrl);
  redirectUrl.pathname = `${issuerType.toLocaleLowerCase()}/redirect/${paymentId}`;

  redirectUrl.searchParams.append('callback_url', callbackUrl || '');

  if (providerId) {
    redirectUrl.searchParams.append('provider_id', providerId);
  }
  if (type === 'proposal') {
    redirectUrl.searchParams.append('proposal_id', id);
  }
  return redirectUrl.toString();
}
