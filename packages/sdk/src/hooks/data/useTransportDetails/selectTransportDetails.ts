import {
  BookingTransportDetailsListModelV2,
  BookingTransportDetailsModelV2,
  ProposalTransportDetailsListModelV5,
  ProposalTransportDetailsModelV3,
} from '../../../__generated__/index.schemas';

type ApiJourney = ProposalTransportDetailsModelV3 | BookingTransportDetailsModelV2;
type ApiTransportDetails = ProposalTransportDetailsListModelV5 | BookingTransportDetailsListModelV2;

export type FlightSegment = {
  departureAirport?: string | null;
  departureDate: string;
  arrivalAirport?: string | null;
  arrivalDate: string;
  fareClass?: string | null;
  carrierCode?: string | null;
};

export type Journey = {
  way?: string | null;
  airlineName?: string | null;
  originAirport?: string | null;
  destinationAirport?: string | null;
  segments: FlightSegment[];
};

export type TransportDetails = {
  tripType: 'oneway' | 'roundtrip';
  journeys: Journey[];
};

const formatDate = (date: string) => date.replace(/-/g, '');

const mapJourney = (journey: ApiJourney): Journey => {
  const sections = journey.travel_sections || [];
  return {
    way: journey.way,
    airlineName: sections[0]?.transport?.company?.operator?.label,
    originAirport: sections[0]?.departure?.location?.id,
    destinationAirport: sections[sections.length - 1]?.arrival?.location?.id,
    segments: sections.map((section) => ({
      departureAirport: section.departure?.location?.id,
      departureDate: formatDate(section.departure?.date ?? ''),
      arrivalAirport: section.arrival?.location?.id,
      arrivalDate: formatDate(section.arrival?.date ?? ''),
      fareClass: section.transport?.fare_class,
      carrierCode: section.transport?.company?.operator?.id,
    })),
  };
};

const getApiJourneys = (data: ApiTransportDetails): ApiJourney[] => {
  if (Array.isArray(data)) return data;
  return data.journeys ?? [];
};

export const selectTransportDetails = (data: ApiTransportDetails): TransportDetails => {
  const journeys = getApiJourneys(data).map(mapJourney);

  const hasInbound = journeys.some(({ way }) => way === 'INBOUND');
  const hasOutbound = journeys.some(({ way }) => way === 'OUTBOUND');

  return {
    tripType: hasInbound && hasOutbound ? 'roundtrip' : 'oneway',
    journeys,
  };
};
