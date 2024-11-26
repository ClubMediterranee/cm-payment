import { useSuspenseQuery } from "@tanstack/react-query";
import { useAppContext } from "../hooks/useAppContext";
import { useEffect } from "react";
import { useUserId } from "../hooks/useUserId";
import {
  Action,
  getV2ProposalsProposalId,
  getV3CustomersCustomerIdBookingsBookingId,
  StayStatuses,
} from "../api";

const getAction = (status: string) => {
  switch (status) {
    case StayStatuses.OPTION:
      return Action.PAYMENT_OPTION;
    case StayStatuses.VALIDATED:
      return Action.PAYMENT_SOLDE;
    default:
      return Action.PAYMENT_RESA;
  }
};

export const useStay = () => {
  const { id, type, setAction } = useAppContext();
  const userId = useUserId();

  const getRequest = () =>
    type === "booking"
      ? getV3CustomersCustomerIdBookingsBookingId(userId, id)
      : getV2ProposalsProposalId(id);

  const { data: stay } = useSuspenseQuery({
    queryKey: ["stay", id],
    queryFn: getRequest,
    retry: false,
    select: (data) => {
      if (type == "booking") {
        const stay = data.stays?.[0];
        return {
          ...stay,
          resort_departure_date: stay.resort_leaving_date,
          status: data.booking_status,
        };
      }
      return data;
    },
  });

  useEffect(() => {
    setAction(getAction(stay.status));
  }, [setAction, stay.status]);

  return { stay };
};
