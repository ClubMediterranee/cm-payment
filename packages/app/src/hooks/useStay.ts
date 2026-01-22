import { useCapsConfigContext } from '@clubmed/caps';
import { useSuspenseQuery } from '@tanstack/react-query';

import { getStay } from '../services/getStay';

export type { StayModel } from '../services/getStay';

export const useStay = () => {
  const { type, id, customerId } = useCapsConfigContext();

  const {
    isLoading,
    data: stay,
    status,
    error,
  } = useSuspenseQuery({
    queryKey: ['stay', id, type],
    queryFn: () => getStay({ type: type as 'booking' | 'proposal', id: id!, customerId }),
    retry: false,
  });

  return { isLoading, stay, status, error };
};
