import { useSuspenseQuery } from "@tanstack/react-query";
import { useAppContext } from "../hooks/useAppContext";
import { useUserId } from "../hooks/useUserId";
import {
  getV2ProposalsProposalId,
  getV3CustomersCustomerIdBookingsBookingId,
} from "../__generated__";
import { useAuth } from "react-oidc-context";

export const useStay = () => {
  const { id, type } = useAppContext();
  const userId = useUserId();
  const { user } = useAuth();
  const profile = user?.profile.type;

  const getRequest = () =>
    type === "booking"
      ? getV3CustomersCustomerIdBookingsBookingId(userId, id, {
          withAuth: true,
        })
      : getV2ProposalsProposalId(id, { withAuth: !!profile });

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

  return { stay };
};
