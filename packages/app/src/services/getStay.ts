import {
  getV2ProposalsProposalId,
  getV3CustomersCustomerIdBookingsBookingId,
} from '../__generated__';

export type StayModel = {
  productId: string;
  resortArrivalDate?: string | null;
  resortDepartureDate?: string | null;
  adultsCount: number;
  childrenCount: number;
};

export type GetStayParams = {
  type: 'booking' | 'proposal';
  id: string;
  customerId?: string;
};

export const getStay = async ({ type, id, customerId }: GetStayParams): Promise<StayModel> => {
  if (type === 'booking') {
    if (!customerId) {
      throw new Error('customerId is required for booking type');
    }

    const data = await getV3CustomersCustomerIdBookingsBookingId(customerId, id);

    const stay = data.stays?.[0];

    return {
      resortDepartureDate: stay?.resort_leaving_date,
      resortArrivalDate: stay?.resort_arrival_date,
      productId: stay?.product_id || '',
      adultsCount: stay?.attendees?.[0]?.adults_count || 0,
      childrenCount: stay?.attendees?.[0]?.children_count || 0,
    };
  }

  const data = await getV2ProposalsProposalId(id);

  return {
    productId: data.product_id,
    resortDepartureDate: data?.resort_departure_date,
    resortArrivalDate: data?.resort_arrival_date,
    adultsCount: data.households?.[0]?.attendees?.length || 0,
    childrenCount: 0,
  };
};
