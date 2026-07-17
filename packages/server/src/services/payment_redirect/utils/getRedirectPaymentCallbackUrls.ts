export type CallbackUrls = { callback_url: string; callback_url_seller?: string };

type GetRedirectPaymentCallbackUrlsParams = {
  paymentId: string;
  providerId: string;
  apiUrl: string;
  locale: string;
  callbackUrl: string;
  callbackUrlSeller?: string;
  proposalId?: string;
  params?: Record<string, string | number | undefined>;
};

export function getRedirectPaymentCallbackUrls({
  paymentId,
  providerId,
  apiUrl,
  locale,
  callbackUrl,
  callbackUrlSeller,
  proposalId,
  params = {},
}: GetRedirectPaymentCallbackUrlsParams): CallbackUrls {
  const baseUrl = new URL(apiUrl);
  baseUrl.pathname = `/rest/payment_redirect/${paymentId}`;

  baseUrl.searchParams.set('locale', locale);

  if (providerId) {
    baseUrl.searchParams.set('provider_id', providerId);
  }
  if (proposalId) {
    baseUrl.searchParams.set('proposal_id', proposalId);
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      baseUrl.searchParams.set(key, String(value));
    }
  });

  const clientUrl = new URL(baseUrl);
  clientUrl.searchParams.set('callback_url', callbackUrl || '');

  if (callbackUrlSeller) {
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
