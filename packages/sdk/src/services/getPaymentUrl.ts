import {OidcIssuerTypes} from "@clubmed/payment-sdk/types/SDKOptions.js";

type Options = {
  issuerType: OidcIssuerTypes;
  /**
   * The locale for the SDK, such as "en-US" or "fr-FR".
   */
  locale?: string;
  /**
   * The proposalId
   */
  proposalId?: string;
  /**
   * The bookingId
   */
  bookingId?: string;
  /**
   * The customerID associated with the booking or proposal.
   */
  customerId: string;

  extraParams?: Record<string, string>;
}

/**
 * Use this function to generate a payment URL with the specified parameters.
 * @param baseUrl this URL of the payment page
 * @param options {Options}
 */
export function getPaymentUrl(baseUrl: string, options: Options): string {
  const {locale, proposalId, issuerType, bookingId, customerId} = options;

  if (issuerType !== OidcIssuerTypes.GM && !customerId) {
    throw new Error(`CustomerId is required for issuerType ${issuerType}`);
  }

  if (!proposalId && !bookingId) {
    throw new Error("Either proposalId or bookingId must be provided");
  }

  const url = new URL(baseUrl);

  url.pathname = [
    issuerType,
    bookingId ? "booking" : "proposal",
    bookingId || proposalId,
  ].join("/")

  url.searchParams.append("locale", locale || navigator.language || "fr-FR");

  if (customerId) {
    url.searchParams.append("customer_id", customerId);
  }

  if (options.extraParams) {
    Object.entries(options.extraParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  return url.toString();
}