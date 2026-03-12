import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { getTransportDetails, TransportDetailsResponse } from './getTransportDetails';
import { selectTransportDetails } from './selectTransportDetails';

export type { FlightSegment, Journey, TransportDetails } from './selectTransportDetails';

export const transportDetailsQueryOptions = (
  type: 'proposal' | 'booking',
  id: string,
  customerId?: string,
) => ({
  queryKey: ['transport_details', type, id, customerId],
  queryFn: () => getTransportDetails({ type, id, customerId }),
  select: selectTransportDetails,
});

export const useTransportDetails = (
  options?: Pick<
    UseQueryOptions<TransportDetailsResponse, Error, ReturnType<typeof selectTransportDetails>>,
    'enabled'
  >,
) => {
  const { type, id, customerId } = useCapsConfigContext();

  return useQuery({
    ...transportDetailsQueryOptions(type, id!, customerId),
    ...options,
  });
};
