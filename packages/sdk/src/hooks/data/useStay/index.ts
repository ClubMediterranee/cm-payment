import { useSuspenseQuery } from '@tanstack/react-query';

import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { getStay } from './getStay';

export { getStay } from './getStay';

export const stayQueryOptions = ({
  type,
  id,
  customerId,
}: {
  type: 'booking' | 'proposal';
  id: string;
  customerId?: string;
}) => ({
  queryKey: ['stay', type, id, customerId],
  queryFn: () => getStay({ type, id, customerId }),
});

export const useStay = () => {
  const { type, id, customerId } = useCapsConfigContext();

  return useSuspenseQuery(
    stayQueryOptions({
      type: type as 'booking' | 'proposal',
      id: id!,
      customerId,
    }),
  );
};
