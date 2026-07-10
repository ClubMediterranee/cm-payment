import { getPaymentConfig } from '../../providers/PaymentConfigProvider';
import { OidcIssuerTypes } from '../../types/CapsSettings';

export type CallbackUrls = { callback_url: string; callback_url_seller?: string };

type GetRedirectPaymentCallbackUrlsParams = {
  paymentId: string;
  providerId: string;
  params?: Record<string, string | number | undefined>;
};

export function getRedirectPaymentCallbackUrls({
  paymentId,
  providerId,
  params = {},
}: GetRedirectPaymentCallbackUrlsParams): CallbackUrls {
  const {
    api,
    oidc: { issuerType },
    type,
    id,
    locale,
    callbackUrl,
    callbackUrlSeller,
  } = getPaymentConfig();

  const baseUrl = new URL(api.url);
  baseUrl.pathname = `/rest/payment_redirect/${paymentId}`;

  baseUrl.searchParams.set('locale', locale);

  if (providerId) {
    baseUrl.searchParams.set('provider_id', providerId);
  }
  if (type === 'proposal') {
    baseUrl.searchParams.set('proposal_id', id);
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      baseUrl.searchParams.set(key, String(value));
    }
  });

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
