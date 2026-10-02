import type { CapsFlowParams } from './types';

const DEFAULT_LOCALE = 'fr-FR';

const LOCALE_FORMAT = /^[a-z]{2}-[A-Z]{2}$/;

/**
 * Browser language when it has the `xx-XX` format expected by CAPS (`fr` alone is rejected), else `fr-FR`.
 */
export const getDefaultLocale = (): string => {
  const language = typeof navigator !== 'undefined' ? navigator.language : undefined;

  return language && LOCALE_FORMAT.test(language) ? language : DEFAULT_LOCALE;
};

/**
 * Build the URL of a CAPS payment flow: `<baseUrl>/<issuer>/<type>/<id>?locale=…`.
 * The access token is never part of the URL.
 */
export function buildCapsFlowUrl(
  baseUrl: string,
  params: CapsFlowParams,
  extraParams: Record<string, string | undefined> = {},
): string {
  const { issuerType, type, id, customerId } = params;

  if (issuerType !== 'GM' && !customerId) {
    throw new Error(`[CAPS] customerId is required for issuerType ${issuerType}`);
  }

  const url = new URL(
    `${baseUrl.replace(/\/+$/, '')}/${issuerType.toLowerCase()}/${type}/${encodeURIComponent(id)}`,
  );

  const query: Record<string, string | undefined> = {
    locale: params.locale || getDefaultLocale(),
    customer_id: customerId,
    callback_url: params.callbackUrl,
    callback_url_seller: params.callbackUrlSeller,
    action: params.action,
    reference: params.reference,
    uuid: params.uuid,
    ...extraParams,
  };

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}
