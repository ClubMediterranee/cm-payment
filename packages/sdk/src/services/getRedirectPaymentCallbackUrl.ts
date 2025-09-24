import {getSDKPaymentOptions} from "../providers/SDKConfigProvider.js";

export function getRedirectPaymentCallbackUrl(paymentId: string, providerId: string): string {
  const {url, oidc: {issuerType}, proposalId} = getSDKPaymentOptions()

  const redirectUrl = new URL(url)
  redirectUrl.pathname = `${issuerType.toLocaleLowerCase()}/redirect/${paymentId}`

  if (providerId) {
    redirectUrl.searchParams.append("provider_id", providerId)
  }
  if (proposalId) {
    redirectUrl.searchParams.append("proposal_id", proposalId)
  }

  return redirectUrl.toString()
}