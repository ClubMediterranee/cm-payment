import { resolveCapsUrl } from './env';
import type { CapsEnv, CapsIssuerType } from './types';

const DEFAULT_LOCALE = 'fr-FR';

const LOCALE_FORMAT = /^[a-z]{2}-[A-Z]{2}$/;

/**
 * Environment accepted by `getPaymentUrl`.
 */
export type CapsPaymentUrlEnv = CapsEnv;

export type CapsPaymentUrlOptions = {
  issuerType: CapsIssuerType;
  /**
   * The locale of the flow, such as "en-US" or "fr-FR". Defaults to the browser language, then `fr-FR`.
   */
  locale?: string;
  /**
   * The proposal id. `bookingId` takes precedence when both are given.
   */
  proposalId?: string;
  /**
   * The booking id.
   */
  bookingId?: string;
  /**
   * The customer id associated with the booking or proposal. Required for GO and PARTNERS.
   */
  customerId?: string;
  /**
   * Page displayed after the payment. Defaults to the CAPS confirmation page.
   */
  callbackUrl?: string;
  callbackUrlSeller?: string;
  /**
   * Page of the "back" link. Defaults to the current page.
   */
  backUrl?: string;
  /**
   * Explicit CAPS server URL. Takes precedence over `env`.
   */
  url?: string;
  extraParams?: Record<string, string | undefined>;
};

/**
 * Browser language when it has the `xx-XX` format expected by CAPS (`fr` alone is rejected), else `fr-FR`.
 */
export const getDefaultLocale = (): string => {
  const language = typeof navigator !== 'undefined' ? navigator.language : undefined;

  return language && LOCALE_FORMAT.test(language) ? language : DEFAULT_LOCALE;
};

/**
 * Use this function to generate a payment URL with the specified parameters:
 * `<caps>/<issuer>/<booking|proposal>/<id>?locale=…`. The access token is never part of the URL.
 */
export function getPaymentUrl(env: CapsPaymentUrlEnv, options: CapsPaymentUrlOptions): string {
  const { issuerType, proposalId, bookingId, customerId } = options;
  const baseUrl = resolveCapsUrl({ env, url: options.url });

  if (issuerType !== 'GM' && !customerId) {
    throw new Error(`[CAPS] customerId is required for issuerType ${issuerType}`);
  }

  const id = bookingId || proposalId;

  if (!id) {
    throw new Error('[CAPS] Either proposalId or bookingId must be provided');
  }

  const issuer = issuerType.toLowerCase();
  const url = new URL(
    `${baseUrl}/${issuer}/${bookingId ? 'booking' : 'proposal'}/${encodeURIComponent(id)}`,
  );

  const query: Record<string, string | undefined> = {
    locale: options.locale || getDefaultLocale(),
    customer_id: customerId,
    callback_url: options.callbackUrl || `${baseUrl}/${issuer}/confirmation`,
    callback_url_seller: options.callbackUrlSeller,
    back_url: options.backUrl ?? (typeof window !== 'undefined' ? window.location.href : undefined),
    ...options.extraParams,
  };

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}
