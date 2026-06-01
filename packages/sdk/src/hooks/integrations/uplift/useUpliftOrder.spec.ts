import { renderHook } from '@testing-library/react';

import { useStay } from '../../data/useStay';
import { useTransportDetails } from '../../data/useTransportDetails';
import { useWatch } from '../../utils/useForm';
import { useUpliftOrder } from './useUpliftOrder';

vi.mock('../../data/useStay', () => ({
  useStay: vi.fn(),
}));

vi.mock('../../data/useTransportDetails', () => ({
  useTransportDetails: vi.fn(),
}));

vi.mock('../../utils/useForm', () => ({
  useWatch: vi.fn(),
}));

const mockUseStay = vi.mocked(useStay);
const mockUseTransportDetails = vi.mocked(useTransportDetails);
const mockUseWatch = vi.mocked(useWatch);

describe('useUpliftOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTransportDetails.mockReturnValue({
      data: { tripType: 'oneway', journeys: [] },
    } as any);
  });

  it('should return order with zero amount when amount is missing', () => {
    mockUseWatch.mockReturnValue('');
    mockUseStay.mockReturnValue({
      data: {
        productId: 'PCAC',
        resortArrivalDate: '20260615',
        resortDepartureDate: '20260622',
        adultsCount: 2,
        childrenCount: 0,
        transportTypes: [],
        roomCount: 1,
      },
    } as any);

    const { result } = renderHook(() => useUpliftOrder());

    expect(result.current?.order_amount).toBe(0);
  });

  it('should handle missing stay data gracefully', () => {
    mockUseWatch.mockReturnValue('999.99');
    mockUseStay.mockReturnValue({
      data: {
        productId: 'PCAC',
        resortArrivalDate: '20260615',
        resortDepartureDate: '20260622',
        transportTypes: [],
        roomCount: 1,
      },
    } as any);

    const { result } = renderHook(() => useUpliftOrder());

    expect(result.current).toBeDefined();
  });

  it('should build complete order with valid data', () => {
    mockUseWatch.mockReturnValue('999.99');
    mockUseStay.mockReturnValue({
      data: {
        productId: 'PCAC',
        resortArrivalDate: '20260615',
        resortDepartureDate: '20260622',
        adultsCount: 4,
        childrenCount: 1,
        transportTypes: [],
        roomCount: 3,
      },
    } as any);

    const { result } = renderHook(() => useUpliftOrder());

    expect(result.current).toEqual({
      order_amount: 99999,
      travelers: [],
      billing_contact: {},
      air_reservations: [],
      hotel_reservations: [
        {
          hotel_name: 'PCAC',
          number_of_rooms: 3,
          reservation_type: 'standard',
          has_deposit: 'false',
          check_in: '20260615',
          check_out: '20260622',
        },
      ],
      add_ons: [],
    });
  });

  it('should calculate numberOfRooms correctly with adults only', () => {
    mockUseWatch.mockReturnValue('1500');
    mockUseStay.mockReturnValue({
      data: {
        productId: 'PCAC',
        resortArrivalDate: '20260701',
        resortDepartureDate: '20260708',
        adultsCount: 3,
        childrenCount: 0,
        transportTypes: [],
        roomCount: 2,
      },
    } as any);

    const { result } = renderHook(() => useUpliftOrder());

    expect(result.current?.hotel_reservations[0].number_of_rooms).toBe(2);
  });

  it('should calculate numberOfRooms correctly with adults and children', () => {
    mockUseWatch.mockReturnValue('1500');
    mockUseStay.mockReturnValue({
      data: {
        productId: 'PCAC',
        resortArrivalDate: '20260701',
        resortDepartureDate: '20260708',
        adultsCount: 2,
        childrenCount: 2,
        transportTypes: [],
        roomCount: 2,
      },
    } as any);

    const { result } = renderHook(() => useUpliftOrder());

    expect(result.current?.hotel_reservations[0].number_of_rooms).toBe(2);
  });

  it('should default to 1 room when totalGuests is 0', () => {
    mockUseWatch.mockReturnValue('500');
    mockUseStay.mockReturnValue({
      data: {
        productId: 'PCAC',
        resortArrivalDate: '20260801',
        resortDepartureDate: '20260805',
        adultsCount: 0,
        childrenCount: 0,
        transportTypes: [],
        roomCount: 1,
      },
    } as any);

    const { result } = renderHook(() => useUpliftOrder());

    expect(result.current?.hotel_reservations[0].number_of_rooms).toBe(1);
  });

  it('should handle missing dates with empty strings', () => {
    mockUseWatch.mockReturnValue('750');
    mockUseStay.mockReturnValue({
      data: {
        productId: 'PCAC',
        resortArrivalDate: null,
        resortDepartureDate: null,
        adultsCount: 2,
        childrenCount: 0,
        transportTypes: [],
        roomCount: 1,
      },
    } as any);

    const { result } = renderHook(() => useUpliftOrder());

    expect(result.current?.hotel_reservations[0].check_in).toBeNull();
    expect(result.current?.hotel_reservations[0].check_out).toBeNull();
  });

  it('should convert amount to cents correctly', () => {
    mockUseWatch.mockReturnValue('1234.56');
    mockUseStay.mockReturnValue({
      data: {
        productId: 'PCAC',
        resortArrivalDate: '20260601',
        resortDepartureDate: '20260607',
        adultsCount: 2,
        childrenCount: 0,
        transportTypes: [],
        roomCount: 1,
      },
    } as any);

    const { result } = renderHook(() => useUpliftOrder());

    expect(result.current?.order_amount).toBe(123456);
  });

  it('returns null when a plane transport query yields no journeys yet', () => {
    mockUseWatch.mockReturnValue('500');
    mockUseStay.mockReturnValue({
      data: {
        productId: 'PCAC',
        resortArrivalDate: '20260601',
        resortDepartureDate: '20260607',
        transportTypes: ['PLANE'],
        roomCount: 1,
      },
    } as any);
    mockUseTransportDetails.mockReturnValue({
      data: { tripType: 'roundtrip', journeys: [] },
    } as any);

    const { result } = renderHook(() => useUpliftOrder());

    expect(result.current).toBeNull();
  });

  it('maps transport journeys to air_reservations when transport data is present', () => {
    mockUseWatch.mockReturnValue('1500');
    mockUseStay.mockReturnValue({
      data: {
        productId: 'PCAC',
        resortArrivalDate: '20260601',
        resortDepartureDate: '20260607',
        transportTypes: ['PLANE'],
        roomCount: 1,
      },
    } as any);
    mockUseTransportDetails.mockReturnValue({
      data: {
        tripType: 'roundtrip',
        journeys: [
          {
            airlineName: 'Air France',
            originAirport: 'CDG',
            destinationAirport: 'MRU',
            segments: [
              {
                departureAirport: 'CDG',
                departureDate: '20260601T0800',
                arrivalAirport: 'MRU',
                arrivalDate: '20260601T2000',
                fareClass: 'Y',
                carrierCode: 'AF',
              },
            ],
          },
        ],
      },
    } as any);

    const { result } = renderHook(() => useUpliftOrder());

    expect(result.current?.air_reservations).toEqual([
      {
        airline_name: 'Air France',
        origin: 'CDG',
        destination: 'MRU',
        trip_type: 'roundtrip',
        itinerary: [
          {
            departure_apc: 'CDG',
            departure_time: '20260601T0800',
            arrival_apc: 'MRU',
            arrival_time: '20260601T2000',
            fare_class: 'Y',
            carrier_code: 'AF',
          },
        ],
      },
    ]);
  });

  it('falls back to oneway trip_type when transport data is partially missing', () => {
    mockUseWatch.mockReturnValue('900');
    mockUseStay.mockReturnValue({
      data: {
        productId: 'PCAC',
        resortArrivalDate: '20260601',
        resortDepartureDate: '20260607',
        transportTypes: [],
        roomCount: 1,
      },
    } as any);
    mockUseTransportDetails.mockReturnValue({
      data: {
        journeys: [
          {
            airlineName: 'Air France',
            originAirport: 'CDG',
            destinationAirport: 'MRU',
            segments: [],
          },
        ],
      },
    } as any);

    const { result } = renderHook(() => useUpliftOrder());

    expect(result.current?.air_reservations[0].trip_type).toBe('oneway');
  });

  it('should update order when amount changes', () => {
    mockUseWatch.mockReturnValue('500');
    mockUseStay.mockReturnValue({
      data: {
        productId: 'PCAC',
        resortArrivalDate: '20260601',
        resortDepartureDate: '20260607',
        adultsCount: 2,
        childrenCount: 0,
        transportTypes: [],
        roomCount: 1,
      },
    } as any);

    const { result, rerender } = renderHook(() => useUpliftOrder());

    expect(result.current?.order_amount).toBe(50000);

    mockUseWatch.mockReturnValue('750');
    rerender();

    expect(result.current?.order_amount).toBe(75000);
  });
});
