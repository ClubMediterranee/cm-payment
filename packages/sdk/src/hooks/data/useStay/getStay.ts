import {
  getV2ProposalsProposalId,
  getV3CustomersCustomerIdBookingsBookingId,
} from '../../../__generated__';
import { CapsSettings } from '../../../types/CapsSettings';

export const getStay = async ({
  type,
  id,
  customerId,
}: Pick<CapsSettings, 'type' | 'id' | 'customerId'>) => {
  if (type === 'booking') {
    if (!customerId) {
      throw new Error('customerId is required for booking type');
    }

    const data = await getV3CustomersCustomerIdBookingsBookingId(customerId, id);
    const stay = data.stays?.[0];

    return {
      resortDepartureDate: stay?.resort_leaving_date ?? undefined,
      resortArrivalDate: stay?.resort_arrival_date ?? undefined,
      productId: stay?.product_id || '',
      adultsCount: stay?.attendees?.[0]?.adults_count || 0,
      childrenCount: stay?.attendees?.[0]?.children_count || 0,
      roomCount: stay?.accommodations?.reduce((acc, { quantity = 0 }) => acc + quantity, 0) || 0,
      transportTypes: stay?.outward_trip?.transportation ?? [],
    };
  }

  const data = await getV2ProposalsProposalId(id);

  const transportTypes =
    data.transportation_summary
      ?.map((t) => t.transportation_type)
      .filter((type, index, self) => self.indexOf(type) === index) || [];

  return {
    productId: data.product_id,
    resortDepartureDate: data?.resort_departure_date,
    resortArrivalDate: data?.resort_arrival_date,
    adultsCount: data.households?.[0]?.attendees?.length || 0,
    childrenCount: 0,
    roomCount: data.accommodations.reduce((acc, { quantity = 0 }) => acc + quantity, 0),
    transportTypes,
  };
};
