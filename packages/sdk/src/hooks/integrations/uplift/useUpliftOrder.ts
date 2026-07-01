import { UpliftOrder } from '../../../types/Uplift';
import { useStay } from '../../data/useStay';
import { useTransportDetails } from '../../data/useTransportDetails';
import { useWatch } from '../../utils/useForm';
import { computePriceInCents } from './uplift';

export const useUpliftOrder = (): UpliftOrder | null => {
  const amount = useWatch('amount');
  const { data: stay } = useStay();

  const enableTransportQuery = stay.transportTypes?.includes('PLANE');

  const { data: transport } = useTransportDetails({
    enabled: enableTransportQuery,
  });

  if (enableTransportQuery && !transport?.journeys.length) return null;

  return {
    order_amount: computePriceInCents(Number(amount)),
    travelers: [] as UpliftOrder['travelers'],
    billing_contact: {} as UpliftOrder['billing_contact'],
    air_reservations: (transport?.journeys || []).map((journey) => ({
      airline_name: journey.airlineName,
      origin: journey.originAirport,
      destination: journey.destinationAirport,
      trip_type: transport?.tripType || 'oneway',
      itinerary: journey.segments.map((segment) => ({
        departure_apc: segment.departureAirport,
        departure_time: segment.departureDate,
        arrival_apc: segment.arrivalAirport,
        arrival_time: segment.arrivalDate,
        fare_class: segment.fareClass,
        carrier_code: segment.carrierCode,
      })),
    })),
    hotel_reservations: [
      {
        hotel_name: stay.productId,
        number_of_rooms: stay.roomCount,
        reservation_type: 'standard',
        has_deposit: 'false',
        check_in: stay.resortArrivalDate,
        check_out: stay.resortDepartureDate,
      },
    ],
    add_ons: [],
  };
};
