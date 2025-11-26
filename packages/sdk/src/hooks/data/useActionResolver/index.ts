import { getCapsConfig } from '@clubmed/payment-sdk/providers/CapsConfigProvider';
import { sdkQueryClient } from '@clubmed/payment-sdk/providers/QueryClientProvider';
import { useSuspenseQuery } from '@tanstack/react-query';

import { Action } from '../../../__generated__';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { usePaymentConfig } from '../usePaymentConfig';
import { resolveAction } from './resolveAction';

export const ACTION_RESOLVER_QUERY_KEY = (id: string, type: string) => ['resolveAction', id, type];

export const getResolvedAction = () => {
  const { id, type } = getCapsConfig();
  return sdkQueryClient.getQueryData<ReturnType<typeof useActionResolver>>(
    ACTION_RESOLVER_QUERY_KEY(id, type),
  );
};

export const actionResolverQuery = ({
  id,
  action,
  type,
  isFreeDepositEnabled,
}: {
  id: string;
  type: string;
  action?: Action;
  isFreeDepositEnabled?: boolean;
}) => ({
  queryKey: ACTION_RESOLVER_QUERY_KEY(id, type),
  queryFn: () => resolveAction({ action, isFreeDepositEnabled }),
});

export const useActionResolver = (action?: Action) => {
  const { id, type } = useCapsConfigContext();
  const { data: paymentConfig } = usePaymentConfig();
  const { data } = useSuspenseQuery(
    actionResolverQuery({
      id,
      type,
      action,
      isFreeDepositEnabled: paymentConfig.featureFlip?.isFreeDepositEnabled,
    }),
  );
  return data;
};
