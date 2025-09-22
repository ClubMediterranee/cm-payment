import { useMutation } from "@tanstack/react-query";
import { useAppContext } from "../hooks/useAppContext";
import Cookies from "js-cookie";
import {
  getV2ProposalsProposalId,
  postV0PaymentsPaymentIdRedirectRequest,
  postV1Payments,
  postV3Bookings,
} from "../__generated__";

export const usePaymentRedirect = (
  {
    onError,
    onSuccess,
  }: { onError: (error: Error) => void; onSuccess: (url: string) => void } = {
    onError: () => {},
    onSuccess: () => {},
  }
) => {
  const { id, type, action, issuer, customerId, callbackUrl, onLoadEnd } =
    useAppContext();
  const withAuth = issuer === "go" || issuer === "partners";
  Cookies.set("callback_url", callbackUrl, {
    sameSite: "none",
    secure: true,
    expires: 1 / 48,
  });

  const getPaymentRedirect = async (params) => {
    let customer_id = "";
    let booking_id = "";

    if (type === "proposal") {
      const proposal = await getV2ProposalsProposalId(id);
      customer_id = proposal?.households?.[0]?.attendees?.[0].customer_id || "";
      const booking = await postV3Bookings({
        proposal_id: id,
      });
      booking_id = booking.booking_id;
    } else if (type === "booking") {
      booking_id = id;
      customer_id = customerId;
    }

    const { id: paymentId } = await postV1Payments(
      {
        booking_id,
        customer_id,
        currency: "EUR",
        action,
        amount: params.amount,
        provider_id: params.provider_id,
      },
      { withAuth }
    );

    const callbackUrl = `${import.meta.env.VITE_DOMAIN}/${issuer}/redirect/${paymentId}?provider_id=${params.provider_id}${type === "proposal" ? `&proposal_id=${id}` : ""}`;
    const { url, body } = await postV0PaymentsPaymentIdRedirectRequest(
      paymentId,
      {
        callback_url: callbackUrl || "",
        template_id: params.template_id,
        billing_details: params.billing_details,
      },
      { withAuth }
    );

    if (!url) {
      throw new Error("Something went wrong");
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
