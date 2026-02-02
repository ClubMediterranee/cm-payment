import { getPaymentConfig } from '../../providers/PaymentConfigProvider';
import { OidcIssuerTypes } from '../../types/CapsSettings';

type CallbackUrls = { callback_url: string; callback_url_seller?: string };

export function getRedirectPaymentCallbackUrls(
  paymentId: string,
  providerId: string,
): CallbackUrls {
  const {
    paymentGatewayUrl,
    oidc: { issuerType },
    type,
    id,
    callbackUrl,
    callbackUrlSeller,
  } = getPaymentConfig();

  const baseUrl = new URL(paymentGatewayUrl);
  baseUrl.pathname = `${issuerType.toLocaleLowerCase()}/redirect/${paymentId}`;

  if (providerId) {
    baseUrl.searchParams.set('provider_id', providerId);
  }
  if (type === 'proposal') {
    baseUrl.searchParams.set('proposal_id', id);
  }

  const clientUrl = new URL(baseUrl);
  clientUrl.searchParams.set('callback_url', callbackUrl || '');

  const isSeller = [OidcIssuerTypes.GO, OidcIssuerTypes.PARTNERS].includes(issuerType);

  if (isSeller && callbackUrlSeller) {
    const sellerUrl = new URL(baseUrl);
    sellerUrl.searchParams.set('callback_url', callbackUrlSeller);

    return {
      callback_url: clientUrl.toString(),
      callback_url_seller: sellerUrl.toString(),
    };
  }

  return {
    callback_url: clientUrl.toString(),
  };
}
