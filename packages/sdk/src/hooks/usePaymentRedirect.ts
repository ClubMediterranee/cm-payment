import {noop, useMutation} from "@tanstack/react-query";
import {useOidcContext, useSDKPaymentContext} from "./useSDKPaymentContext.js";
import {type BillingDetailsModel, postV0PaymentsPaymentIdRedirectRequest, postV1Payments,} from "../__generated__";
import {createBookingFromProposal} from "@clubmed/payment-sdk/services/createBookingFromProposal.js";
import {setCallbackUrl} from "@clubmed/payment-sdk/services/cookies.js";
import {getRedirectPaymentCallbackUrl} from "@clubmed/payment-sdk/services/getRedirectPaymentCallbackUrl.js";

export interface GetPaymentRedirectUrlParams {
  amount: number;
  provider_id: string;
  template_id: string;
  billingDetails: BillingDetailsModel;
}

type Props = {
  onError?: (error: Error) => void;
  onSuccess?: (url: string) => void;
  onLoadEnd?: () => void;
}

export const usePaymentRedirect = ({
                                     onError = noop,
                                     onSuccess = noop,
                                     onLoadEnd = noop,
                                   }: Props = {}) => {
  const {proposalId, bookingId, action, customerId, callbackUrl} = useSDKPaymentContext();

  const {withAuth} = useOidcContext();

  // not sure to understand why we set the cookie here
  setCallbackUrl(callbackUrl);

  const getPaymentRedirect = async (
    params: GetPaymentRedirectUrlParams) => {
    let customer_id = customerId;
    let booking_id = bookingId;

    if (!bookingId) {
      if (!proposalId) {
        throw new Error("You must provide a proposalId or a bookingId");
      }

      const {customerId, bookingId} = await createBookingFromProposal(proposalId);
      customer_id = customerId;
      booking_id = bookingId;
    }

    const {id: paymentId} = await postV1Payments(
      {
        booking_id: booking_id!,
        customer_id,
        currency: "EUR",
        action,
        amount: params.amount,
        provider_id: params.provider_id,
      },
      {withAuth}
    );


    const callbackUrl = getRedirectPaymentCallbackUrl(paymentId, params.provider_id);

    const {url, body} = await postV0PaymentsPaymentIdRedirectRequest(
      paymentId,
      {
        callback_url: callbackUrl || "",
        template_id: params.template_id,
        billing_details: params.billingDetails,
      },
      {withAuth}
    );

    if (!url) {
      throw new Error("Payment redirect URL not found");
    }

    return `${url}?${body}`;
  };

  return useMutation({
    mutationKey: ["paymentRedirect"],
    mutationFn: getPaymentRedirect,
    onSuccess,
    onError,
    onSettled: onLoadEnd,
  });
};
