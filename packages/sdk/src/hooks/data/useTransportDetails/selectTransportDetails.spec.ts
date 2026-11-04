import {
  BookingTransportDetailsListModelV2,
  ProposalTransportDetailsListModelV5,
} from '../../../__generated__/index.schemas';
import { selectTransportDetails } from './selectTransportDetails';

describe('selectTransportDetails', () => {
  describe('ProposalTransportDetailsListModelV5', () => {
    it('should map roundtrip proposal data', () => {
      const proposalData: ProposalTransportDetailsListModelV5 = {
        journeys: [
          {
            way: 'OUTBOUND',
            total_duration_in_min: 120,
            travel_sections: [
              {
                departure: {
                  location: { id: 'CDG' },
                  date: '2024-01-15',
                  time: '10:00',
                },
                arrival: {
                  location: { id: 'JFK' },
                  date: '2024-01-15',
                  time: '14:00',
                },
                transport: {
                  fare_class: 'Y',
                  company: {
                    operator: {
                      id: 'AF',
                      label: 'Air France',
                    },
                  },
                },
                clubmed_transport: true,
                flight_code: 'AF001',
                cancellation_policy_type: 'AUCUN',
              },
            ],
          },
          {
            way: 'INBOUND',
            total_duration_in_min: 120,
            travel_sections: [
              {
                departure: {
                  location: { id: 'JFK' },
                  date: '2024-01-22',
                  time: '16:00',
                },
                arrival: {
                  location: { id: 'CDG' },
                  date: '2024-01-22',
                  time: '20:00',
                },
                transport: {
                  fare_class: 'Y',
                  company: {
                    operator: {
                      id: 'AF',
                      label: 'Air France',
                    },
                  },
                },
                clubmed_transport: true,
                flight_code: 'AF002',
                cancellation_policy_type: 'THEO',
              },
            ],
          },
        ],
      };

      const result = selectTransportDetails(proposalData);

      expect(result.tripType).toBe('roundtrip');
      expect(result.journeys).toHaveLength(2);

      const outbound = result.journeys.find((j) => j.way === 'OUTBOUND');
      expect(outbound).toMatchObject({
        way: 'OUTBOUND',
        airlineName: 'Air France',
        originAirport: 'CDG',
        destinationAirport: 'JFK',
      });
      expect(outbound?.segments).toHaveLength(1);
      expect(outbound?.segments[0]).toMatchObject({
        departureAirport: 'CDG',
        departureDate: '20240115',
        arrivalAirport: 'JFK',
        arrivalDate: '20240115',
        fareClass: 'Y',
        carrierCode: 'AF',
      });

      const inbound = result.journeys.find((j) => j.way === 'INBOUND');
      expect(inbound).toMatchObject({
        way: 'INBOUND',
        airlineName: 'Air France',
        originAirport: 'JFK',
        destinationAirport: 'CDG',
      });
    });

    it('should map oneway proposal data', () => {
      const proposalData: ProposalTransportDetailsListModelV5 = {
        journeys: [
          {
            way: 'OUTBOUND',
            total_duration_in_min: 120,
            travel_sections: [
              {
                departure: {
                  location: { id: 'CDG' },
                  date: '2024-01-15',
                },
                arrival: {
                  location: { id: 'JFK' },
                  date: '2024-01-15',
                },
                transport: {
                  fare_class: 'Y',
                  company: {
                    operator: {
                      id: 'AF',
                      label: 'Air France',
                    },
                  },
                },
                clubmed_transport: true,
                flight_code: 'AF001',
                cancellation_policy_type: 'NDC',
              },
            ],
          },
        ],
      };

      const result = selectTransportDetails(proposalData);

      expect(result.tripType).toBe('oneway');
      expect(result.journeys).toHaveLength(1);
    });

    it('should handle multiple segments in a journey', () => {
      const proposalData: ProposalTransportDetailsListModelV5 = {
        journeys: [
          {
            way: 'OUTBOUND',
            total_duration_in_min: 300,
            travel_sections: [
              {
                departure: {
                  location: { id: 'CDG' },
                  date: '2024-01-15',
                },
                arrival: {
                  location: { id: 'AMS' },
                  date: '2024-01-15',
                },
                transport: {
                  fare_class: 'Y',
                  company: {
                    operator: {
                      id: 'AF',
                      label: 'Air France',
                    },
                  },
                },
                clubmed_transport: true,
                flight_code: 'AF001',
                cancellation_policy_type: 'WEBTHEO',
              },
              {
                departure: {
                  location: { id: 'AMS' },
                  date: '2024-01-15',
                },
                arrival: {
                  location: { id: 'JFK' },
                  date: '2024-01-15',
                },
                transport: {
                  fare_class: 'Y',
                  company: {
                    operator: {
                      id: 'KL',
                      label: 'KLM',
                    },
                  },
                },
                clubmed_transport: true,
                flight_code: 'KL002',
                cancellation_policy_type: 'AUCUN',
              },
            ],
          },
        ],
      };

      const result = selectTransportDetails(proposalData);

      expect(result.journeys[0].originAirport).toBe('CDG');
      expect(result.journeys[0].destinationAirport).toBe('JFK');
      expect(result.journeys[0].segments).toHaveLength(2);
      expect(result.journeys[0].segments[0].departureAirport).toBe('CDG');
      expect(result.journeys[0].segments[1].arrivalAirport).toBe('JFK');
    });
  });

  describe('BookingTransportDetailsListModelV2', () => {
    it('should map roundtrip booking data', () => {
      const bookingData: BookingTransportDetailsListModelV2 = [
        {
          way: 'OUTBOUND',
          total_duration_in_min: 120,
          travel_sections: [
            {
              departure: {
                location: { id: 'CDG' },
                date: '2024-01-15',
              },
              arrival: {
                location: { id: 'JFK' },
                date: '2024-01-15',
              },
              transport: {
                fare_class: 'Y',
                company: {
                  operator: {
                    id: 'AF',
                    label: 'Air France',
                  },
                },
              },
              clubmed_transport: true,
            },
          ],
        },
        {
          way: 'INBOUND',
          total_duration_in_min: 120,
          travel_sections: [
            {
              departure: {
                location: { id: 'JFK' },
                date: '2024-01-22',
              },
              arrival: {
                location: { id: 'CDG' },
                date: '2024-01-22',
              },
              transport: {
                fare_class: 'Y',
                company: {
                  operator: {
                    id: 'AF',
                    label: 'Air France',
                  },
                },
              },
              clubmed_transport: true,
            },
          ],
        },
      ];

      const result = selectTransportDetails(bookingData);

      expect(result.tripType).toBe('roundtrip');
      expect(result.journeys).toHaveLength(2);
      expect(result.journeys[0].way).toBe('OUTBOUND');
      expect(result.journeys[1].way).toBe('INBOUND');
    });

    it('should map oneway booking data', () => {
      const bookingData: BookingTransportDetailsListModelV2 = [
        {
          way: 'OUTBOUND',
          total_duration_in_min: 120,
          travel_sections: [
            {
              departure: {
                location: { id: 'CDG' },
                date: '2024-01-15',
              },
              arrival: {
                location: { id: 'JFK' },
                date: '2024-01-15',
              },
              transport: {
                fare_class: 'Y',
                company: {
                  operator: {
                    id: 'AF',
                    label: 'Air France',
                  },
                },
              },
              clubmed_transport: true,
            },
          ],
        },
      ];

      const result = selectTransportDetails(bookingData);

      expect(result.tripType).toBe('oneway');
      expect(result.journeys).toHaveLength(1);
    });
  });

  describe('edge cases', () => {
    it('should handle empty journeys array', () => {
      const proposalData: ProposalTransportDetailsListModelV5 = {
        journeys: [],
      };

      const result = selectTransportDetails(proposalData);

      expect(result.tripType).toBe('oneway');
      expect(result.journeys).toHaveLength(0);
    });

    it('should handle missing journeys property', () => {
      const proposalData: ProposalTransportDetailsListModelV5 = {};

      const result = selectTransportDetails(proposalData);

      expect(result.tripType).toBe('oneway');
      expect(result.journeys).toHaveLength(0);
    });

    it('should handle journey with empty travel_sections', () => {
      const proposalData: ProposalTransportDetailsListModelV5 = {
        journeys: [
          {
            way: 'OUTBOUND',
            total_duration_in_min: 0,
            travel_sections: [],
          },
        ],
      };

      const result = selectTransportDetails(proposalData);

      expect(result.journeys).toHaveLength(1);
      expect(result.journeys[0].segments).toHaveLength(0);
    });

    it('should format dates without hyphens', () => {
      const proposalData: ProposalTransportDetailsListModelV5 = {
        journeys: [
          {
            way: 'OUTBOUND',
            total_duration_in_min: 120,
            travel_sections: [
              {
                departure: {
                  location: { id: 'CDG' },
                  date: '2024-01-15',
                },
                arrival: {
                  location: { id: 'JFK' },
                  date: '2024-01-15',
                },
                transport: {
                  company: {
                    operator: {
                      id: 'AF',
                      label: 'Air France',
                    },
                  },
                },
                clubmed_transport: true,
                flight_code: 'AF001',
                cancellation_policy_type: 'NDC',
              },
            ],
          },
        ],
      };

      const result = selectTransportDetails(proposalData);

      expect(result.journeys[0].segments[0].departureDate).toBe('20240115');
      expect(result.journeys[0].segments[0].arrivalDate).toBe('20240115');
    });

    it('should handle WITHIN_TOUR as oneway', () => {
      const bookingData: BookingTransportDetailsListModelV2 = [
        {
          way: 'WITHIN_TOUR',
          total_duration_in_min: 60,
          travel_sections: [
            {
              departure: {
                location: { id: 'CDG' },
                date: '2024-01-15',
              },
              arrival: {
                location: { id: 'ORY' },
                date: '2024-01-15',
              },
              transport: {
                company: {
                  operator: {
                    id: 'AF',
                    label: 'Air France',
                  },
                },
              },
              clubmed_transport: true,
            },
          ],
        },
      ];

      const result = selectTransportDetails(bookingData);

      expect(result.tripType).toBe('oneway');
      expect(result.journeys).toHaveLength(1);
    });
  });
});
