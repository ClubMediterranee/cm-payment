import { useSuspenseQuery } from '@tanstack/react-query';

import { actionResolverControllerResolveAction } from '../../__generated__/bff';
import { Action } from '../../__generated__/index.schemas';
import { getPaymentConfig } from '../../providers/PaymentConfigProvider';
import { sdkQueryClient } from '../../providers/QueryClientProvider';
import { useCapsConfigContext } from '../utils/useCapsConfigContext';

export const ACTION_RESOLVER_QUERY_KEY = (id: string, type: string) => ['resolveAction', id, type];

export const getResolvedAction = () => {
  const { id, type } = getPaymentConfig();
  return sdkQueryClient.getQueryData<ReturnType<typeof useActionResolver>>(
    ACTION_RESOLVER_QUERY_KEY(id, type),
  );
};

export const actionResolverQuery = ({
  id,
  action,
  type,
  customerId,
}: {
  id: string;
  type: 'booking' | 'proposal';
  action?: Action;
  customerId?: string;
}) => ({
  queryKey: ACTION_RESOLVER_QUERY_KEY(id, type),
  queryFn: async (): Promise<Action> => {
    const { action: resolved } = await actionResolverControllerResolveAction(type, id, {
      action,
      customer_id: customerId,
    });
    return resolved;
  },
});

export const useActionResolver = (action?: Action) => {
  const { id, type, customerId } = useCapsConfigContext();

  const { data } = useSuspenseQuery(actionResolverQuery({ id, type, action, customerId }));
  return data;
};
