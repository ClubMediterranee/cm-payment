import { useCapsConfigContext } from '@clubmed/caps';
import { useSuspenseQuery } from '@tanstack/react-query';

import {
  getV2ProposalsProposalId,
  getV3CustomersCustomerIdBookingsBookingId,
} from '../__generated__';

export type StayModel = {
  productId: string;
  resortArrivalDate?: string | null;
  resortDepartureDate: string | null;
  adultsCount: number;
  childrenCount: number;
};

export const useStay = () => {
  const { type, id, customerId } = useCapsConfigContext();

  // devrait etre déclouplé du hook dans son fichier à part
  // Facilite les TU du hook et du service si tu sépares bien les responsabilités
  // ex: services/getStay.ts
  const getStay = async (): Promise<StayModel> => {
    if (type === 'booking') {
      const data = await getV3CustomersCustomerIdBookingsBookingId(customerId!, id);

      const stay = data.stays?.[0];
      return {
        resortDepartureDate: stay?.resort_leaving_date as string | null,
        resortArrivalDate: stay?.resort_arrival_date as string | null,
        productId: stay?.product_id || '',
        adultsCount: stay?.attendees?.[0]?.adults_count || 0,
        childrenCount: stay?.attendees?.[0]?.children_count || 0,
      };
    }

    const data = await getV2ProposalsProposalId(id!);

    return {
      productId: data.product_id,
      resortDepartureDate: data?.resort_departure_date,
      resortArrivalDate: data?.resort_arrival_date,
      adultsCount: data.households?.[0].attendees?.length || 0,
      childrenCount: 0,
    };
  };

  const {
    isLoading,
    data: stay,
    status,
    error,
  } = useSuspenseQuery({
    queryKey: ['stay', id, type],
    queryFn: getStay,
    retry: false,
  });

  return { isLoading, stay, status, error };
};
