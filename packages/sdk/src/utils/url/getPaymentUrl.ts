import { CapsSettings, OidcIssuerTypes } from '@clubmed/payment-sdk/types/CapsSettings.js';

type Options = Pick<CapsSettings, 'type' | 'id' | 'customerId'> & {
  locale?: string;
  extraParams?: Record<string, string>;
  issuerType: OidcIssuerTypes;
};

/**
 * Use this function to generate a payment URL with the specified parameters.
 * @param baseUrl this URL of the payment page
 * @param options {Options}
 */
export function getPaymentUrl(baseUrl: string, options: Options): string {
  const { locale, type, id, issuerType, customerId } = options;

  if (issuerType !== OidcIssuerTypes.GM && !customerId) {
    throw new Error(`CustomerId is required for issuerType ${issuerType}`);
  }

  const url = new URL(baseUrl);

  url.pathname = [issuerType, type, id].join('/');

  url.searchParams.append('locale', locale || navigator.language || 'fr-FR');

  if (customerId) {
    url.searchParams.append('customer_id', customerId);
  }

  if (options.extraParams) {
    Object.entries(options.extraParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  return url.toString();
}
