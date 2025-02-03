import { useMutation } from "@tanstack/react-query";
import { useParams, useSearch } from "wouter";
import { useAppContext } from "../hooks/useAppContext";
import Cookies from "js-cookie";
import { useUserId } from "../hooks/useUserId";
import {
  getV2ProposalsProposalId,
  postV0PaymentsPaymentIdRedirectRequest,
  postV1Payments,
  postV3Bookings,
} from "../api";
import { useAuth } from "react-oidc-context";
import { sendMessage } from "../hooks/useMessage";

export const usePaymentRedirect = (
  {
    onError,
    onSuccess,
  }: { onError: (error: Error) => void; onSuccess: (url: string) => void } = {
    onError: () => {},
    onSuccess: () => {},
  }
) => {
  const { id, type, action } = useAppContext();
  const userId = useUserId();
  const { user } = useAuth();
  const { issuer, locale } = useParams();
  const withAuth = !!user?.profile.type;
  const search = useSearch();
  const remoteCallbackUrl = new URLSearchParams(search).get("callback_url");

  Cookies.set("callback_url", remoteCallbackUrl || "", {
    sameSite: "none",
    secure: true,
    expires: 1 / 48,
  });

  const getPaymentRedirect = async (params) => {
    sendMessage("loaded");
    let customer_id = "";
    let booking_id = "";

    if (type === "proposal") {
      const proposal = await getV2ProposalsProposalId(id);
      customer_id = proposal?.households?.[0]?.attendees?.[0].customer_id || "";
      const booking = await postV3Bookings({ proposal_id: id });
      booking_id = booking.booking_id;
    } else if (type === "booking") {
      booking_id = id;
      customer_id = userId;
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

    const callbackUrl = `${import.meta.env.VITE_DOMAIN}/${issuer}/redirect/${paymentId}/${locale}?provider_id=${params.provider_id}${type === "proposal" ? `&proposal_id=${id}` : ""}`;
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
    onSettled: () => {
      sendMessage("loaded_end");
    },
  });
};
