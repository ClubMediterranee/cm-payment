import { useMutation } from "@tanstack/react-query";
import { useBookingMutation } from "./useBookingMutation";
import { useSearch } from "wouter";
import { useAppContext } from "../hooks/useAppContext";
import { usePaymentMutation } from "./usePaymentMutation";
import { useRedirectRequestMutation } from "./useRedirectRequestMutation";
import Cookies from "js-cookie";
import { useUserId } from "../hooks/useUserId";
import { getV2ProposalsProposalId } from "../api";

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
  const search = useSearch();
  const remoteCallbackUrl = new URLSearchParams(search).get("callback_url");
  Cookies.set("callback_url", remoteCallbackUrl || "", {
    sameSite: "none",
    secure: true,
    expires: 1 / 48,
  });

  const { mutateAsync: postBooking } = useBookingMutation();
  const { mutateAsync: postPayment } = usePaymentMutation();
  const { mutateAsync: postRedirectRequest } = useRedirectRequestMutation();

  const getPaymentRedirect = async (params: {
    provider_id: string;
    amount: number;
  }) => {
    let customer_id = "";
    let booking_id = "";

    if (type === "proposal") {
      const proposal = await getV2ProposalsProposalId(id);
      customer_id = proposal?.households?.[0]?.attendees?.[0].customer_id || "";
      const booking = await postBooking({ proposal_id: id });
      booking_id = booking.booking_id;
    } else if (type === "booking") {
      booking_id = id;
      customer_id = userId;
    }

    const { id: paymentId } = await postPayment({
      booking_id,
      customer_id,
      currency: "EUR",
      action,
      ...params,
    });

    const callbackUrl = `${import.meta.env.VITE_DOMAIN}/redirect/${paymentId}?provider_id=${params.provider_id}${type === "proposal" ? `&proposal_id=${id}` : ""}`;
    const { url } = await postRedirectRequest({
      paymentId,
      params: {
        callback_url: callbackUrl || "",
      },
    });

    if (!url) {
      throw new Error("Something went wrong");
    }
    return url;
  };

  return useMutation({
    mutationKey: ["paymentRedirect"],
    mutationFn: getPaymentRedirect,
    onSuccess,
    onError,
  });
};
