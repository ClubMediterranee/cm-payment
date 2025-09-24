import {useQuery} from "@tanstack/react-query";
import {getV2ProposalsProposalId, getV3CustomersCustomerIdBookingsBookingId,} from "../__generated__";
import {useAuth} from "react-oidc-context";
import {useSDKPaymentContext} from "@clubmed/payment-sdk/hooks/useSDKPaymentContext";

export type StayModel = {
  productId: string;
  resortArrivalDate?: string | null;
  resortDepartureDate: string | null;
  nbAccommodations: number;
}

export const useStay = () => {
  const {proposalId, bookingId, customerId} = useSDKPaymentContext();
  const {user} = useAuth();
  // TODO Jerome tu pourras clarifier cette ligne ? est-ce que c'est le issuerType ?
  // ou est-ce que c'est pour savoir si le user est connecté ?
  // Ca me parait bizarre car tu rentres en mode connecté sur le parcours quoi qu'il arrive non ?
  const profile = user?.profile.type;

  // devrait etre déclouplé du hook dans son fichier à part
  // Facilite les TU du hook et du service si tu sépares bien les responsabilités
  // ex: services/getStay.ts
  const getStay = async (): Promise<StayModel> => {
    if (bookingId) {
      const data = await getV3CustomersCustomerIdBookingsBookingId(customerId, bookingId, {
        withAuth: true,
      });

      const stay = data.stays?.[0];
      return {
        resortDepartureDate: stay?.resort_leaving_date as string | null,
        resortArrivalDate: stay?.resort_arrival_date as string | null,
        productId: data.stays?.[0]?.product_id || "",
        nbAccommodations: stay?.accommodations?.length || 1
      };
    }

    const data = await getV2ProposalsProposalId(proposalId!, {withAuth: !!profile});

    return {
      productId: data.product_id,
      resortDepartureDate: data?.resort_departure_date,
      resortArrivalDate: data?.resort_arrival_date,
      nbAccommodations: data?.accommodations?.length || 1
    }
  };

  const {isLoading, data: stay, status, error} = useQuery({
    queryKey: ["stay", bookingId || proposalId],
    queryFn: getStay,
    retry: false,
  });

  return {isLoading, stay, status, error};
};
