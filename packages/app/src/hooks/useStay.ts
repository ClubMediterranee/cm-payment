import { useSuspenseQuery } from '@tanstack/react-query';

import { useAppContext } from '../providers/AppProvider';
import { getStay } from '../services/getStay';

export type { StayModel } from '../services/getStay';

export const useStay = () => {
  const {
    type,
    id,
    values: { customerId },
  } = useAppContext();

  const {
    isLoading,
    data: stay,
    status,
    error,
  } = useSuspenseQuery({
    queryKey: ['stay', id, type],
    queryFn: () => getStay({ type, id: id!, customerId }),
    retry: false,
  });

  return { isLoading, stay, status, error };
};
